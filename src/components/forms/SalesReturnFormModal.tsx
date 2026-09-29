import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { EntityCombobox, ComboboxItem } from '../ui/EntityCombobox';
import { LineItemsEditor } from '../ui/LineItemsEditor';
import { DocumentLineItem, ReturnHandling, MoneyMethod, SalesReturn } from '../../types';
import { formatCurrency } from '../../lib/format';
import { Icon } from '../ui/Icon';

interface SalesReturnFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnToEdit?: SalesReturn | null;
}

export const SalesReturnFormModal: React.FC<SalesReturnFormModalProps> = ({
  isOpen,
  onClose,
  returnToEdit,
}) => {
  const { customers, invoices, products, warehouses, createSalesReturn, updateSalesReturn } = useApp();

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [customerId, setCustomerId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [returnDate, setReturnDate] = useState<string>(new Date().toISOString().slice(0, 16));
  const [warehouseId, setWarehouseId] = useState<string>(warehouses[0]?.id || 'wh-01');
  const [handling, setHandling] = useState<ReturnHandling>('debt_offset');
  const [moneyMethod, setMoneyMethod] = useState<MoneyMethod>('offset');
  const [reason, setReason] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [items, setItems] = useState<DocumentLineItem[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      if (returnToEdit) {
        setSelectedInvoiceId(returnToEdit.invoice_id || '');
        setCustomerId(returnToEdit.customer_id || '');
        setCustomerName(returnToEdit.customer_name || '');
        setReturnDate(
          returnToEdit.return_date
            ? new Date(returnToEdit.return_date).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16)
        );
        setWarehouseId(returnToEdit.warehouse_id || warehouses[0]?.id || 'wh-01');
        setHandling(returnToEdit.handling || 'debt_offset');
        setMoneyMethod(returnToEdit.money_method || 'offset');
        setReason(returnToEdit.reason || '');
        setNote(returnToEdit.note || '');
        setItems(returnToEdit.items || []);
      } else {
        setSelectedInvoiceId('');
        setCustomerId('');
        setCustomerName('');
        setReturnDate(new Date().toISOString().slice(0, 16));
        setWarehouseId(warehouses[0]?.id || 'wh-01');
        setHandling('debt_offset');
        setMoneyMethod('offset');
        setReason('');
        setNote('');
        setItems([]);
      }
    }
  }, [isOpen, returnToEdit]);

  const totalValue = items.reduce((sum, item) => sum + item.line_total, 0);

  // Available invoices to link
  const invoiceOptions: ComboboxItem[] = invoices
    .filter(i => i.status !== 'cancelled')
    .map(inv => ({
      id: inv.id,
      code: inv.code,
      name: `${inv.code} · ${inv.customer_name}`,
      subtext: `Tổng: ${formatCurrency(inv.total)} · Nợ: ${formatCurrency(inv.debt_amount)}`,
    }));

  const customerOptions: ComboboxItem[] = customers.map(c => ({
    id: c.id,
    code: c.code,
    name: c.name,
    debt: c.debt_amount,
  }));

  const productOptions: ComboboxItem[] = products.map(p => ({
    id: p.id,
    code: p.sku,
    name: p.name,
    subtext: `ĐVT: ${p.unit}`,
    price: p.sale_price,
  }));

  const handleSelectInvoice = (item: ComboboxItem | null) => {
    if (item) {
      setSelectedInvoiceId(item.id);
      const inv = invoices.find(i => i.id === item.id);
      if (inv) {
        setCustomerId(inv.customer_id || '');
        setCustomerName(inv.customer_name);
        setWarehouseId(inv.warehouse_id);
        // Pre-fill invoice items
        setItems(
          inv.items.map(it => ({
            ...it,
            id: `temp-${Date.now()}-${it.id}`,
            quantity: 1,
            line_total: it.unit_price,
          }))
        );
      }
    } else {
      setSelectedInvoiceId('');
      setCustomerId('');
      setCustomerName('');
      setItems([]);
    }
  };

  const handleSave = () => {
    if (!customerId && !customerName) {
      alert('Vui lòng chọn khách hàng');
      return;
    }
    if (items.length === 0) {
      alert('Vui lòng thêm sản phẩm cần trả lại');
      return;
    }

    const linkedInv = invoices.find(i => i.id === selectedInvoiceId);

    if (returnToEdit) {
      updateSalesReturn(
        returnToEdit.id,
        {
          customer_id: customerId || undefined,
          customer_name: customerName,
          invoice_id: selectedInvoiceId || undefined,
          invoice_code: linkedInv?.code || returnToEdit.invoice_code,
          warehouse_id: warehouseId,
          return_date: new Date(returnDate).toISOString(),
          handling,
          money_method: moneyMethod,
          reason,
          note,
        },
        items
      );
    } else {
      createSalesReturn(
        {
          customer_id: customerId || undefined,
          customer_name: customerName,
          invoice_id: selectedInvoiceId || undefined,
          invoice_code: linkedInv?.code,
          warehouse_id: warehouseId,
          return_date: new Date(returnDate).toISOString(),
          handling,
          money_method: moneyMethod,
          reason,
          note,
        },
        items
      );
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={returnToEdit ? `Chỉnh sửa phiếu trả hàng ${returnToEdit.code}` : 'Tạo phiếu trả hàng khách hàng'}
      subtitle={
        returnToEdit
          ? 'Cập nhật lại số lượng trả, kho nhận và cách xử lý tiền'
          : 'Nhập lại hàng vào kho, giảm công nợ hoặc hoàn tiền cho khách'
      }
      icon="assignment_return"
      width="lg"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
              TỔNG TRẢ LẠI
            </span>
            <span className="text-[20px] font-bold text-[#E11D48] tabular-nums">
              {formatCurrency(totalValue)}
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
              <span>Tạo phiếu trả</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Link Invoice */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <EntityCombobox
              label="Hóa đơn gốc (tùy chọn)"
              placeholder="Chọn hóa đơn để giới hạn số lượng..."
              items={invoiceOptions}
              selectedId={selectedInvoiceId}
              onSelect={handleSelectInvoice}
            />
            <p className="text-[11.5px] text-[#6B7280] mt-1">
              Chọn hóa đơn để khóa khách hàng và giới hạn số lượng còn được trả.
            </p>
          </div>

          <div>
            <EntityCombobox
              label="Khách hàng *"
              placeholder="Chọn khách hàng..."
              items={customerOptions}
              selectedId={customerId}
              disabled={!!selectedInvoiceId}
              onSelect={item => {
                if (item) {
                  setCustomerId(item.id);
                  setCustomerName(item.name);
                }
              }}
              type="customer"
              required
            />
            {selectedInvoiceId && (
              <p className="text-[11.5px] text-[#6D3EEB] font-medium mt-1">
                🔒 Đã khóa theo hóa đơn đã chọn
              </p>
            )}
          </div>
        </div>

        {/* Date & Warehouse */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13.5px] font-medium text-[#374151] mb-1.5">
              Ngày trả hàng
            </label>
            <input
              type="datetime-local"
              value={returnDate}
              onChange={e => setReturnDate(e.target.value)}
              className="w-full h-11 px-3.5 bg-white border border-[#E5E7EB] rounded-[12px] text-[13.5px] text-[#1F2937] focus:outline-none focus:border-[#6D3EEB]"
            />
          </div>

          <div>
            <label className="block text-[13.5px] font-medium text-[#374151] mb-1.5">
              Kho nhập lại hàng
            </label>
            <select
              value={warehouseId}
              onChange={e => setWarehouseId(e.target.value)}
              className="w-full h-11 px-3.5 bg-white border border-[#E5E7EB] rounded-[12px] text-[13.5px] text-[#1F2937] focus:outline-none focus:border-[#6D3EEB]"
            >
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product selector if manual return */}
        {!selectedInvoiceId && (
          <div className="pt-2 border-t border-[#F1F2F5]">
            <EntityCombobox
              label="Chọn sản phẩm trả lại *"
              placeholder="Tìm theo tên sản phẩm, mã SKU..."
              items={productOptions}
              onSelect={item => {
                if (!item) return;
                const prod = products.find(p => p.id === item.id);
                if (!prod) return;
                const newItem: DocumentLineItem = {
                  id: `temp-${Date.now()}`,
                  product_id: prod.id,
                  sku: prod.sku,
                  product_name: prod.name,
                  unit: prod.unit,
                  quantity: 1,
                  unit_price: prod.sale_price,
                  line_discount: 0,
                  line_total: prod.sale_price,
                };
                setItems([...items, newItem]);
              }}
              type="product"
            />
          </div>
        )}

        {/* Items to return */}
        <div>
          <label className="block text-[13.5px] font-bold text-[#111827] mb-2">
            Hàng khách trả lại *
          </label>
          <LineItemsEditor
            items={items}
            availableProducts={products}
            onChange={setItems}
          />
        </div>

        {/* Handling & Money Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#F1F2F5]">
          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Kiểu xử lý
            </label>
            <select
              value={handling}
              onChange={e => setHandling(e.target.value as any)}
              className="w-full h-10 px-3 bg-white border border-[#E5E7EB] rounded-[12px] text-[13.5px] text-[#1F2937] focus:outline-none focus:border-[#6D3EEB]"
            >
              <option value="debt_offset">Trừ công nợ</option>
              <option value="refund">Hoàn tiền lại cho khách</option>
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Hình thức xử lý tiền
            </label>
            <select
              value={moneyMethod}
              onChange={e => setMoneyMethod(e.target.value as any)}
              className="w-full h-10 px-3 bg-white border border-[#E5E7EB] rounded-[12px] text-[13.5px] text-[#1F2937] focus:outline-none focus:border-[#6D3EEB]"
            >
              <option value="offset">Đối trừ công nợ</option>
              <option value="transfer">Chuyển khoản</option>
              <option value="cash">Tiền mặt</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Lý do trả hàng
            </label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="VD: Hàng lỗi, bao bì móp méo, sai chủng loại..."
              className="w-full h-10 px-3 border border-[#E5E7EB] rounded-[12px] text-[13px] focus:outline-none focus:border-[#6D3EEB]"
            />
          </div>
        </div>

        {/* Summary note */}
        <div className="p-4 rounded-[14px] bg-[#F9F5FF] border border-[#E9D5FF] text-[13px] text-[#6317D6]">
          <span className="font-bold">Tổng giá trị trả: {formatCurrency(totalValue)}</span>
          <p className="mt-0.5">
            {handling === 'debt_offset'
              ? `Sẽ giảm công nợ phải thu của khách hàng ${formatCurrency(totalValue)}.`
              : `Sẽ tạo khoản hoàn tiền ${formatCurrency(totalValue)} cho khách.`}
          </p>
        </div>
      </div>
    </Modal>
  );
};
