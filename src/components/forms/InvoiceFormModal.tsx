import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { EntityCombobox, ComboboxItem } from '../ui/EntityCombobox';
import { LineItemsEditor } from '../ui/LineItemsEditor';
import { TotalsPanel } from '../ui/TotalsPanel';
import { DocumentLineItem, DiscountType, InvoiceStatus } from '../../types';
import { formatCurrency } from '../../lib/format';
import { Icon } from '../ui/Icon';

interface InvoiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAndPrint?: (code: string) => void;
  initialQuotationId?: string;
}

export const InvoiceFormModal: React.FC<InvoiceFormModalProps> = ({
  isOpen,
  onClose,
  onSaveAndPrint,
}) => {
  const { customers, products, warehouses, createInvoice, createCustomer } = useApp();

  const [customerId, setCustomerId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('Khách lẻ');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().slice(0, 16));
  const [dueDate, setDueDate] = useState<string>('');
  const [warehouseId, setWarehouseId] = useState<string>(warehouses[0]?.id || 'wh-01');
  const [status, setStatus] = useState<InvoiceStatus>('completed');

  const [items, setItems] = useState<DocumentLineItem[]>([]);
  const [discountType, setDiscountType] = useState<DiscountType>('amount');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [vatRate, setVatRate] = useState<number>(0);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [note, setNote] = useState<string>('');

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
  const discountAmount =
    discountType === 'amount' ? discountValue : Math.round((subtotal * discountValue) / 100);
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const vatAmount = Math.round((afterDiscount * vatRate) / 100);
  const total = afterDiscount + vatAmount + shippingFee;
  const debtAmount = Math.max(0, total - paidAmount);

  const customerComboboxItems: ComboboxItem[] = customers.map(c => ({
    id: c.id,
    code: c.code,
    name: c.name,
    subtext: `${c.phone || 'Chưa có SĐT'} · ${c.group_name || 'Khách lẻ'}`,
    debt: c.debt_amount,
  }));

  const productComboboxItems: ComboboxItem[] = products.map(p => ({
    id: p.id,
    code: p.sku,
    name: p.name,
    subtext: `ĐVT: ${p.unit}`,
    stock: p.stock_quantity,
    price: p.sale_price,
    badge: p.stock_level,
    isService: p.is_service,
  }));

  const handleSelectCustomer = (item: ComboboxItem | null) => {
    if (item) {
      setCustomerId(item.id);
      setCustomerName(item.name);
      const cust = customers.find(c => c.id === item.id);
      if (cust?.phone) setCustomerPhone(cust.phone);
      if (cust?.payment_term_days) {
        const d = new Date();
        d.setDate(d.getDate() + cust.payment_term_days);
        setDueDate(d.toISOString().split('T')[0]);
      }
    } else {
      setCustomerId('');
      setCustomerName('Khách lẻ');
      setCustomerPhone('');
    }
  };

  const handleSelectProduct = (item: ComboboxItem | null) => {
    if (!item) return;
    const prod = products.find(p => p.id === item.id);
    if (!prod) return;

    // If item already exists, increment quantity
    const existingIndex = items.findIndex(it => it.product_id === prod.id);
    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].line_total =
        updated[existingIndex].quantity * updated[existingIndex].unit_price;
      setItems(updated);
    } else {
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
        unit_cost: prod.cost_price,
      };
      setItems([...items, newItem]);
    }
  };

  const handleSave = (shouldPrint: boolean = false) => {
    if (items.length === 0) {
      alert('Vui lòng thêm ít nhất một sản phẩm vào hóa đơn');
      return;
    }

    const created = createInvoice(
      {
        customer_id: customerId || undefined,
        customer_name: customerName,
        customer_phone: customerPhone,
        warehouse_id: warehouseId,
        invoice_date: new Date(invoiceDate).toISOString(),
        due_date: dueDate || undefined,
        status,
        discount_type: discountType,
        discount_value: discountValue,
        vat_rate: vatRate,
        shipping_fee: shippingFee,
        paid_amount: paidAmount,
        note,
      },
      items
    );

    onClose();
    if (shouldPrint && onSaveAndPrint) {
      onSaveAndPrint(created.code);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo phiếu bán hàng"
      subtitle="Xuất kho & ghi nhận doanh thu bán hàng"
      icon="sell"
      width="lg"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
              TỔNG CỘNG
            </span>
            <span className="text-[20px] font-bold text-[#6D3EEB] tabular-nums">
              {formatCurrency(total)}
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
              onClick={() => handleSave(true)}
              className="px-4 py-2 bg-white border border-[#E5E7EB] hover:bg-gray-50 text-[#1F2937] text-[13.5px] font-semibold rounded-[12px] flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Icon name="print" size={18} className="text-[#6D3EEB]" />
              <span>🖨 Lưu và In</span>
            </button>
            <button
              type="button"
              onClick={() => handleSave(false)}
              className="px-5 py-2 bg-[#6D3EEB] hover:bg-[#5B2BD6] text-white text-[13.5px] font-semibold rounded-[12px] shadow-[0_8px_20px_-6px_rgba(109,62,235,0.55)] flex items-center gap-1.5 transition-all"
            >
              <Icon name="save" size={18} />
              <span>Tạo phiếu bán</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Row 1: Customer Selection & Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <EntityCombobox
              label="Khách hàng"
              placeholder="Chọn khách hàng hoặc để Khách lẻ..."
              items={customerComboboxItems}
              selectedId={customerId}
              onSelect={handleSelectCustomer}
              onAddNew={() => {
                const name = prompt('Nhập tên khách hàng mới:');
                if (name) {
                  const phone = prompt('Nhập số điện thoại (tùy chọn):') || '';
                  const newC = createCustomer({ name, phone });
                  setCustomerId(newC.id);
                  setCustomerName(newC.name);
                  setCustomerPhone(phone);
                }
              }}
              addNewText="Thêm khách hàng mới"
              type="customer"
            />
          </div>

          <div>
            <label className="block text-[13.5px] font-medium text-[#374151] mb-1.5">
              Kho xuất hàng
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

          <div>
            <label className="block text-[13.5px] font-medium text-[#374151] mb-1.5">
              Ngày bán
            </label>
            <input
              type="datetime-local"
              value={invoiceDate}
              onChange={e => setInvoiceDate(e.target.value)}
              className="w-full h-11 px-3.5 bg-white border border-[#E5E7EB] rounded-[12px] text-[13.5px] text-[#1F2937] focus:outline-none focus:border-[#6D3EEB]"
            />
          </div>

          <div>
            <label className="block text-[13.5px] font-medium text-[#374151] mb-1.5">
              Hạn thanh toán
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full h-11 px-3.5 bg-white border border-[#E5E7EB] rounded-[12px] text-[13.5px] text-[#1F2937] focus:outline-none focus:border-[#6D3EEB]"
            />
          </div>
        </div>

        {/* Row 2: Add Product Selector */}
        <div className="pt-2 border-t border-[#F1F2F5]">
          <EntityCombobox
            label="Chọn sản phẩm thêm vào đơn *"
            placeholder="Tìm theo tên sản phẩm, mã SKU..."
            items={productComboboxItems}
            onSelect={handleSelectProduct}
            type="product"
            addNewText="Thêm sản phẩm mới"
          />
        </div>

        {/* Row 3: Line Items Editor */}
        <LineItemsEditor
          items={items}
          availableProducts={products}
          onChange={setItems}
        />

        {/* Row 4: Financial Adjustments */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-[#F1F2F5]">
          {/* Discount */}
          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Chiết khấu
            </label>
            <div className="flex rounded-[12px] border border-[#E5E7EB] overflow-hidden">
              <input
                type="number"
                min={0}
                value={discountValue}
                onChange={e => setDiscountValue(Number(e.target.value))}
                className="w-full h-10 px-3 text-[13.5px] focus:outline-none tabular-nums"
              />
              <select
                value={discountType}
                onChange={e => setDiscountType(e.target.value as any)}
                className="bg-gray-50 border-l border-[#E5E7EB] px-2.5 text-[12.5px] font-semibold text-[#4B5563] outline-none"
              >
                <option value="amount">đ</option>
                <option value="percent">%</option>
              </select>
            </div>
          </div>

          {/* VAT */}
          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              VAT (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={vatRate}
              onChange={e => setVatRate(Number(e.target.value))}
              placeholder="0%"
              className="w-full h-10 px-3 border border-[#E5E7EB] rounded-[12px] text-[13.5px] focus:outline-none focus:border-[#6D3EEB] tabular-nums"
            />
          </div>

          {/* Shipping Fee */}
          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Phí vận chuyển (đ)
            </label>
            <input
              type="number"
              min={0}
              step={5000}
              value={shippingFee}
              onChange={e => setShippingFee(Number(e.target.value))}
              className="w-full h-10 px-3 border border-[#E5E7EB] rounded-[12px] text-[13.5px] focus:outline-none focus:border-[#6D3EEB] tabular-nums"
            />
          </div>
        </div>

        {/* Row 5: Payment and Note */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[13px] font-medium text-[#374151]">
                Khách thanh toán trước (đ)
              </label>
              <button
                type="button"
                onClick={() => setPaidAmount(total)}
                className="text-[11.5px] font-semibold text-[#6317D6] hover:underline"
              >
                Thanh toán hết
              </button>
            </div>
            <input
              type="number"
              min={0}
              value={paidAmount}
              onChange={e => setPaidAmount(Number(e.target.value))}
              className="w-full h-10 px-3 border border-[#E5E7EB] rounded-[12px] text-[14px] font-semibold text-[#6D3EEB] focus:outline-none focus:border-[#6D3EEB] tabular-nums"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Ghi chú nội bộ cho phiếu bán
            </label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Ví dụ: Giao sau 17h, khách hẹn thanh toán..."
              className="w-full h-10 px-3 border border-[#E5E7EB] rounded-[12px] text-[13px] focus:outline-none focus:border-[#6D3EEB]"
            />
          </div>
        </div>

        {/* Totals Calculation Summary */}
        <TotalsPanel
          subtotal={subtotal}
          discountAmount={discountAmount}
          vatRate={vatRate}
          vatAmount={vatAmount}
          shippingFee={shippingFee}
          total={total}
          paidAmount={paidAmount}
          debtAmount={debtAmount}
        />
      </div>
    </Modal>
  );
};
