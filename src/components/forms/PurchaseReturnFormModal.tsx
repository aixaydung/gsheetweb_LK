import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { EntityCombobox, ComboboxItem } from '../ui/EntityCombobox';
import { LineItemsEditor } from '../ui/LineItemsEditor';
import { DocumentLineItem, ReturnHandling, MoneyMethod, PurchaseReturn } from '../../types';
import { formatCurrency } from '../../lib/format';
import { Icon } from '../ui/Icon';

interface PurchaseReturnFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnToEdit?: PurchaseReturn | null;
}

export const PurchaseReturnFormModal: React.FC<PurchaseReturnFormModalProps> = ({
  isOpen,
  onClose,
  returnToEdit,
}) => {
  const { suppliers, purchaseOrders, products, warehouses, createPurchaseReturn, updatePurchaseReturn } = useApp();

  const [selectedPoId, setSelectedPoId] = useState<string>('po-01');
  const [supplierId, setSupplierId] = useState<string>('sup-01');
  const [supplierName, setSupplierName] = useState<string>('a ngữ - khang hưng');
  const [returnDate, setReturnDate] = useState<string>(new Date().toISOString().slice(0, 16));
  const [warehouseId, setWarehouseId] = useState<string>(warehouses[0]?.id || 'wh-01');
  const [handling, setHandling] = useState<ReturnHandling>('debt_offset');
  const [moneyMethod, setMoneyMethod] = useState<MoneyMethod>('offset');
  const [reason, setReason] = useState<string>('Hàng sai quy cách rang theo thoả thuận');
  const [note, setNote] = useState<string>('Trừ trực tiếp vào công nợ PM010');

  // Preload initial item (CP001 x 1, 120.000)
  const [items, setItems] = useState<DocumentLineItem[]>([
    {
      id: 'prli-01',
      product_id: 'prod-01',
      sku: 'CP001',
      product_name: 'Cà phê rang xay Robusta thượng hạng',
      unit: 'kg',
      quantity: 1,
      unit_price: 120000,
      line_discount: 0,
      line_total: 120000,
    },
  ]);

  useEffect(() => {
    if (returnToEdit && isOpen) {
      setSelectedPoId(returnToEdit.po_id || '');
      setSupplierId(returnToEdit.supplier_id);
      setSupplierName(returnToEdit.supplier_name);
      setReturnDate(new Date(returnToEdit.return_date).toISOString().slice(0, 16));
      setWarehouseId(returnToEdit.warehouse_id);
      setHandling(returnToEdit.handling);
      setMoneyMethod(returnToEdit.money_method || 'offset');
      setReason(returnToEdit.reason || '');
      setNote(returnToEdit.note || '');
      if (returnToEdit.items && returnToEdit.items.length > 0) {
        setItems(returnToEdit.items);
      }
    } else if (!returnToEdit && isOpen) {
      setSelectedPoId('');
      setSupplierId('');
      setSupplierName('');
      setReturnDate(new Date().toISOString().slice(0, 16));
      setWarehouseId(warehouses[0]?.id || 'wh-01');
      setHandling('debt_offset');
      setMoneyMethod('offset');
      setReason('');
      setNote('');
      setItems([]);
    }
  }, [returnToEdit, isOpen, warehouses]);

  const totalValue = items.reduce((sum, item) => sum + item.line_total, 0);

  const poOptions: ComboboxItem[] = purchaseOrders
    .filter(p => p.status !== 'cancelled')
    .map(po => ({
      id: po.id,
      code: po.code,
      name: `${po.code} · ${po.supplier_name}`,
      subtext: `Tổng: ${formatCurrency(po.total)} · Nợ: ${formatCurrency(po.debt_amount)}`,
    }));

  const supplierOptions: ComboboxItem[] = suppliers.map(s => ({
    id: s.id,
    code: s.code,
    name: s.name,
    debt: s.debt_amount,
  }));

  const handleSelectPO = (item: ComboboxItem | null) => {
    if (item) {
      setSelectedPoId(item.id);
      const po = purchaseOrders.find(p => p.id === item.id);
      if (po) {
        setSupplierId(po.supplier_id);
        setSupplierName(po.supplier_name);
        setWarehouseId(po.warehouse_id);
      }
    } else {
      setSelectedPoId('');
      setSupplierId('');
      setSupplierName('');
      setItems([]);
    }
  };

  const handleSave = () => {
    if (!supplierId && !supplierName) {
      alert('Vui lòng chọn nhà cung cấp');
      return;
    }
    if (items.length === 0) {
      alert('Vui lòng thêm sản phẩm cần trả lại');
      return;
    }

    const linkedPo = purchaseOrders.find(p => p.id === selectedPoId);

    if (returnToEdit) {
      updatePurchaseReturn(
        returnToEdit.id,
        {
          supplier_id: supplierId,
          supplier_name: supplierName,
          po_id: selectedPoId || undefined,
          po_code: linkedPo?.code || returnToEdit.po_code,
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
      createPurchaseReturn(
        {
          supplier_id: supplierId,
          supplier_name: supplierName,
          po_id: selectedPoId || undefined,
          po_code: linkedPo?.code,
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
      title={returnToEdit ? `Sửa phiếu trả hàng NCC ${returnToEdit.code}` : 'Tạo phiếu trả hàng nhà cung cấp'}
      subtitle="Xuất kho trả lại nhà cung cấp, giảm công nợ hoặc nhận hoàn tiền"
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
              <span>Tạo phiếu trả NCC</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Link PO & Supplier */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <EntityCombobox
              label="Phiếu mua gốc (tùy chọn)"
              placeholder="Chọn phiếu mua..."
              items={poOptions}
              selectedId={selectedPoId}
              onSelect={handleSelectPO}
            />
            <p className="text-[11.5px] text-[#6B7280] mt-1">
              Chọn phiếu mua để khóa nhà cung cấp và giới hạn số lượng còn được trả.
            </p>
          </div>

          <div>
            <EntityCombobox
              label="Nhà cung cấp *"
              placeholder="Chọn NCC..."
              items={supplierOptions}
              selectedId={supplierId}
              disabled={!!selectedPoId}
              onSelect={item => {
                if (item) {
                  setSupplierId(item.id);
                  setSupplierName(item.name);
                }
              }}
              type="supplier"
              required
            />
            {selectedPoId && (
              <p className="text-[11.5px] text-[#6D3EEB] font-medium mt-1">
                🔒 Đã khóa theo phiếu mua đã chọn
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
              Kho xuất trả
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

        {/* Items */}
        <div>
          <label className="block text-[13.5px] font-bold text-[#111827] mb-2">
            Hàng trả lại nhà cung cấp *
          </label>
          <LineItemsEditor
            items={items}
            availableProducts={products}
            onChange={setItems}
            isPurchase={true}
          />
        </div>

        {/* Handling */}
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
              <option value="refund">Hoàn tiền lại từ NCC</option>
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
              placeholder="VD: Hàng lỗi, sai mẫu rang, bao bì rách..."
              className="w-full h-10 px-3 border border-[#E5E7EB] rounded-[12px] text-[13px] focus:outline-none focus:border-[#6D3EEB]"
            />
          </div>
        </div>

        {/* Summary banner */}
        <div className="p-4 rounded-[14px] bg-[#F9F5FF] border border-[#E9D5FF] text-[13px] text-[#6317D6]">
          <span className="font-bold">Tổng giá trị trả: {formatCurrency(totalValue)}</span>
          <p className="mt-0.5">
            {handling === 'debt_offset'
              ? `Sẽ giảm công nợ phải trả cho nhà cung cấp ${formatCurrency(totalValue)}.`
              : `Sẽ ghi nhận khoản hoàn tiền ${formatCurrency(totalValue)} từ nhà cung cấp.`}
          </p>
        </div>
      </div>
    </Modal>
  );
};
