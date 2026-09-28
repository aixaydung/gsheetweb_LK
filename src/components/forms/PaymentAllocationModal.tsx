import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { EntityCombobox, ComboboxItem } from '../ui/EntityCombobox';
import { Direction, MoneyMethod, PaymentAllocation } from '../../types';
import { formatCurrency, formatDate } from '../../lib/format';
import { Icon } from '../ui/Icon';

interface PaymentAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  direction?: Direction; // 'in' = Thu tiền khách, 'out' = Trả tiền NCC
  initialPartnerId?: string;
  initialDocId?: string;
}

export const PaymentAllocationModal: React.FC<PaymentAllocationModalProps> = ({
  isOpen,
  onClose,
  direction = 'in',
  initialPartnerId,
  initialDocId,
}) => {
  const { customers, suppliers, invoices, purchaseOrders, createPayment } = useApp();

  const isCustomer = direction === 'in';
  const [partnerId, setPartnerId] = useState<string>(initialPartnerId || '');
  const [partnerName, setPartnerName] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().slice(0, 16));
  const [method, setMethod] = useState<MoneyMethod>('transfer');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [note, setNote] = useState<string>('');
  const [billUrl, setBillUrl] = useState<string>('');

  // Allocations mapping: docId -> allocated amount
  const [allocationsMap, setAllocationsMap] = useState<Record<string, number>>({});

  // Sync initial partner
  useEffect(() => {
    if (initialPartnerId) {
      setPartnerId(initialPartnerId);
      if (isCustomer) {
        const c = customers.find(cust => cust.id === initialPartnerId);
        if (c) setPartnerName(c.name);
      } else {
        const s = suppliers.find(sup => sup.id === initialPartnerId);
        if (s) setPartnerName(s.name);
      }
    }
  }, [initialPartnerId, isCustomer, customers, suppliers]);

  // Find open documents with debt > 0
  const openDocs = isCustomer
    ? invoices.filter(
        i =>
          i.customer_id === partnerId &&
          i.debt_amount > 0 &&
          i.status !== 'cancelled'
      )
    : purchaseOrders.filter(
        p =>
          p.supplier_id === partnerId &&
          p.debt_amount > 0 &&
          p.status !== 'cancelled'
      );

  // Auto pre-allocate if initialDocId is provided
  useEffect(() => {
    if (initialDocId) {
      const doc = openDocs.find(d => d.id === initialDocId);
      if (doc) {
        setTotalAmount(doc.debt_amount);
        setAllocationsMap({ [doc.id]: doc.debt_amount });
      }
    }
  }, [initialDocId]);

  const partnerOptions: ComboboxItem[] = isCustomer
    ? customers.map(c => ({
        id: c.id,
        code: c.code,
        name: c.name,
        debt: c.debt_amount,
      }))
    : suppliers.map(s => ({
        id: s.id,
        code: s.code,
        name: s.name,
        debt: s.debt_amount,
      }));

  const handleSelectPartner = (item: ComboboxItem | null) => {
    if (item) {
      setPartnerId(item.id);
      setPartnerName(item.name);
      setAllocationsMap({});
      setTotalAmount(item.debt || 0);
    } else {
      setPartnerId('');
      setPartnerName('');
      setAllocationsMap({});
      setTotalAmount(0);
    }
  };

  // FIFO auto allocation
  const handleAutoAllocate = () => {
    let remainingToAllocate = totalAmount;
    const newAlloc: Record<string, number> = {};

    // Sort docs: overdue first, then earliest due date or invoice date
    const sortedDocs = [...openDocs].sort((a, b) => {
      const dueA = a.due_date || '9999-12-31';
      const dueB = b.due_date || '9999-12-31';
      return dueA.localeCompare(dueB);
    });

    for (const doc of sortedDocs) {
      if (remainingToAllocate <= 0) break;
      const alloc = Math.min(doc.debt_amount, remainingToAllocate);
      newAlloc[doc.id] = alloc;
      remainingToAllocate -= alloc;
    }

    setAllocationsMap(newAlloc);
  };

  const handleAllocationInput = (docId: string, amount: number) => {
    const doc = openDocs.find(d => d.id === docId);
    if (!doc) return;
    const clamped = Math.max(0, Math.min(amount, doc.debt_amount));
    setAllocationsMap(prev => ({
      ...prev,
      [docId]: clamped,
    }));
  };

  const totalAllocated = Object.values(allocationsMap).reduce((sum, v) => sum + v, 0);
  const unallocatedAmount = Math.max(0, totalAmount - totalAllocated);

  const handleSave = () => {
    if (!partnerId) {
      alert(`Vui lòng chọn ${isCustomer ? 'khách hàng' : 'nhà cung cấp'}`);
      return;
    }
    if (totalAmount <= 0) {
      alert('Vui lòng nhập số tiền thanh toán hợp lệ');
      return;
    }

    const allocationsList: PaymentAllocation[] = Object.entries(allocationsMap)
      .filter(([_, amt]) => amt > 0)
      .map(([docId, amt]) => {
        const doc = openDocs.find(d => d.id === docId);
        return {
          id: '',
          payment_id: '',
          doc_type: isCustomer ? 'sales_invoice' : 'purchase_order',
          doc_id: docId,
          doc_code: doc?.code || '',
          amount: amt,
        };
      });

    createPayment(
      {
        direction,
        partner_type: isCustomer ? 'customer' : 'supplier',
        partner_id: partnerId,
        partner_name: partnerName,
        payment_date: new Date(paymentDate).toISOString(),
        amount: totalAmount,
        method,
        bill_image_url: billUrl || undefined,
        note,
      },
      allocationsList
    );

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isCustomer ? 'Thu tiền khách hàng (phân bổ)' : 'Trả tiền nhà cung cấp (phân bổ)'}
      subtitle={
        isCustomer
          ? 'Ghi nhận phiếu thu và phân bổ tiền vào các hóa đơn còn nợ'
          : 'Ghi nhận phiếu chi và phân bổ tiền vào các phiếu mua còn nợ'
      }
      icon="account_balance_wallet"
      width="lg"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
              {isCustomer ? 'TỔNG TIỀN THU' : 'TỔNG TIỀN TRẢ'}
            </span>
            <span className="text-[20px] font-bold text-[#10B981] tabular-nums">
              {formatCurrency(totalAmount)}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#4B5563] hover:text-[#111827] text-[13.5px] font-medium"
            >
              ✕ Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-[#6D3EEB] hover:bg-[#5B2BD6] text-white text-[13.5px] font-semibold rounded-[12px] shadow-[0_8px_20px_-6px_rgba(109,62,235,0.55)] flex items-center gap-1.5 transition-all"
            >
              <Icon name="save" size={18} />
              <span>{isCustomer ? 'Lưu phiếu thu' : 'Lưu phiếu chi'}</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Partner & Amount & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <EntityCombobox
              label={isCustomer ? 'Khách hàng nộp tiền *' : 'Nhà cung cấp nhận tiền *'}
              placeholder={`Chọn ${isCustomer ? 'khách hàng' : 'nhà cung cấp'}...`}
              items={partnerOptions}
              selectedId={partnerId}
              onSelect={handleSelectPartner}
              type={isCustomer ? 'customer' : 'supplier'}
              required
            />
          </div>

          <div>
            <label className="block text-[13.5px] font-medium text-[#374151] mb-1.5">
              Số tiền thanh toán (đ) *
            </label>
            <input
              type="number"
              min={0}
              step={10000}
              value={totalAmount}
              onChange={e => setTotalAmount(Number(e.target.value))}
              className="w-full h-11 px-3.5 bg-white border border-[#E5E7EB] rounded-[12px] text-[15px] font-bold text-[#10B981] focus:outline-none focus:border-[#6D3EEB] tabular-nums"
            />
          </div>

          <div>
            <label className="block text-[13.5px] font-medium text-[#374151] mb-1.5">
              Ngày thanh toán
            </label>
            <input
              type="datetime-local"
              value={paymentDate}
              onChange={e => setPaymentDate(e.target.value)}
              className="w-full h-11 px-3.5 bg-white border border-[#E5E7EB] rounded-[12px] text-[13.5px] text-[#1F2937] focus:outline-none focus:border-[#6D3EEB]"
            />
          </div>
        </div>

        {/* Method & Note */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13.5px] font-medium text-[#374151] mb-1.5">
              Phương thức thanh toán
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('transfer')}
                className={`py-2 text-[13px] font-semibold rounded-[10px] border transition-colors ${
                  method === 'transfer'
                    ? 'border-[#6D3EEB] bg-[#F9F5FF] text-[#6317D6]'
                    : 'border-[#E5E7EB] text-[#4B5563]'
                }`}
              >
                Chuyển khoản
              </button>
              <button
                type="button"
                onClick={() => setMethod('cash')}
                className={`py-2 text-[13px] font-semibold rounded-[10px] border transition-colors ${
                  method === 'cash'
                    ? 'border-[#6D3EEB] bg-[#F9F5FF] text-[#6317D6]'
                    : 'border-[#E5E7EB] text-[#4B5563]'
                }`}
              >
                Tiền mặt
              </button>
              <button
                type="button"
                onClick={() => setMethod('offset')}
                className={`py-2 text-[13px] font-semibold rounded-[10px] border transition-colors ${
                  method === 'offset'
                    ? 'border-[#6D3EEB] bg-[#F9F5FF] text-[#6317D6]'
                    : 'border-[#E5E7EB] text-[#4B5563]'
                }`}
              >
                Đối trừ
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[13.5px] font-medium text-[#374151] mb-1.5">
              Ghi chú thanh toán
            </label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="VD: Chuyển khoản Techcombank qua bill số #928..."
              className="w-full h-11 px-3.5 bg-white border border-[#E5E7EB] rounded-[12px] text-[13px] focus:outline-none focus:border-[#6D3EEB]"
            />
          </div>
        </div>

        {/* Allocations Table */}
        <div className="pt-2 border-t border-[#F1F2F5]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-[14px] font-bold text-[#111827]">
                Danh sách chứng từ còn nợ ({openDocs.length})
              </h4>
              <p className="text-[12px] text-[#6B7280]">
                Phân bổ số tiền thanh toán vào từng chứng từ
              </p>
            </div>
            <button
              type="button"
              onClick={handleAutoAllocate}
              disabled={openDocs.length === 0}
              className="px-3.5 py-1.5 bg-[#F3EBFE] hover:bg-[#E9D5FF] text-[#6317D6] text-[12.5px] font-semibold rounded-[10px] transition-colors flex items-center gap-1.5"
            >
              <Icon name="auto_mode" size={16} />
              <span>Tự phân bổ (FIFO)</span>
            </button>
          </div>

          {openDocs.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 border border-[#F1F2F5] rounded-[16px] text-[#9CA3AF] text-[13.5px]">
              Đối tác này hiện không có chứng từ nào còn nợ.
            </div>
          ) : (
            <div className="border border-[#F1F2F5] rounded-[14px] overflow-hidden">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#F1F2F5] text-[#6B7280] font-semibold text-[11.5px] uppercase tracking-wider">
                    <th className="p-3">MÃ CHỨNG TỪ</th>
                    <th className="p-3">NGÀY LẬP</th>
                    <th className="p-3">HẠN THANH TOÁN</th>
                    <th className="p-3 text-right">CÒN NỢ</th>
                    <th className="p-3 text-right w-40">PHÂN BỔ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F2F5]">
                  {openDocs.map(doc => {
                    const isOverdue =
                      doc.due_date && doc.due_date < new Date().toISOString().split('T')[0];
                    const allocated = allocationsMap[doc.id] || 0;

                    return (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="p-3 font-semibold text-[#111827]">{doc.code}</td>
                        <td className="p-3 text-[#4B5563]">
                          {formatDate((doc as any).invoice_date || (doc as any).order_date)}
                        </td>
                        <td className="p-3">
                          {doc.due_date ? (
                            <span className={isOverdue ? 'text-rose-600 font-semibold' : 'text-[#4B5563]'}>
                              {formatDate(doc.due_date)} {isOverdue && '(Quá hạn)'}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="p-3 text-right font-bold text-[#E11D48] tabular-nums">
                          {formatCurrency(doc.debt_amount)}
                        </td>
                        <td className="p-3 text-right">
                          <input
                            type="number"
                            min={0}
                            max={doc.debt_amount}
                            value={allocated || ''}
                            placeholder="0"
                            onChange={e => handleAllocationInput(doc.id, Number(e.target.value))}
                            className="w-full h-8 px-2.5 text-right font-semibold text-[#10B981] border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:border-[#6D3EEB] tabular-nums"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Allocation balance bar */}
          <div className="mt-3 p-3 rounded-[12px] bg-[#F9FAFB] border border-[#F1F2F5] flex items-center justify-between text-[13px]">
            <div>
              <span>Đã phân bổ: </span>
              <span className="font-bold text-[#111827] tabular-nums">
                {formatCurrency(totalAllocated)}
              </span>
              <span className="text-[#6B7280]"> / Tổng tiền thu: </span>
              <span className="font-bold text-[#10B981] tabular-nums">
                {formatCurrency(totalAmount)}
              </span>
            </div>

            {unallocatedAmount > 0 && (
              <div className="text-amber-700 font-medium flex items-center gap-1">
                <Icon name="info" size={16} />
                <span>Thừa {formatCurrency(unallocatedAmount)} (ghi nhận tiền trả trước)</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
