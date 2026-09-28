import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { EntityCombobox, ComboboxItem } from '../ui/EntityCombobox';
import { LineItemsEditor } from '../ui/LineItemsEditor';
import { DocumentLineItem, DiscountType } from '../../types';
import { formatCurrency } from '../../lib/format';
import { Icon } from '../ui/Icon';

interface QuotationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAndPrint?: (code: string) => void;
}

export const QuotationFormModal: React.FC<QuotationFormModalProps> = ({
  isOpen,
  onClose,
  onSaveAndPrint,
}) => {
  const { customers, products, createQuotation } = useApp();

  const [customerId, setCustomerId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('Khách hàng');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [quoteDate, setQuoteDate] = useState<string>(new Date().toISOString().slice(0, 16));

  const defaultExpire = new Date();
  defaultExpire.setDate(defaultExpire.getDate() + 7);
  const [expiresAt, setExpiresAt] = useState<string>(defaultExpire.toISOString().split('T')[0]);

  const [items, setItems] = useState<DocumentLineItem[]>([]);
  const [discountType, setDiscountType] = useState<DiscountType>('amount');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [vatRate, setVatRate] = useState<number>(0);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [note, setNote] = useState<string>('');
  const [showAdjustmentsMobile, setShowAdjustmentsMobile] = useState<boolean>(false);

  const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
  const discountAmount =
    discountType === 'amount' ? discountValue : Math.round((subtotal * discountValue) / 100);
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const vatAmount = Math.round((afterDiscount * vatRate) / 100);
  const total = afterDiscount + vatAmount + shippingFee;

  const customerComboboxItems: ComboboxItem[] = customers.map(c => ({
    id: c.id,
    code: c.code,
    name: c.name,
    subtext: `${c.phone || 'Chưa có SĐT'} · ${c.group_name || 'Khách hàng'}`,
    debt: c.debt_amount,
  }));

  const productComboboxItems: ComboboxItem[] = products.map(p => ({
    id: p.id,
    code: p.sku,
    name: p.name,
    subtext: `ĐVT: ${p.unit} · Tồn: ${p.stock_quantity}`,
    price: p.sale_price,
    badge: p.stock_level,
  }));

  const handleSelectCustomer = (item: ComboboxItem | null) => {
    if (item) {
      setCustomerId(item.id);
      setCustomerName(item.name);
      const cust = customers.find(c => c.id === item.id);
      if (cust?.phone) setCustomerPhone(cust.phone);
    } else {
      setCustomerId('');
      setCustomerName('Khách hàng');
      setCustomerPhone('');
    }
  };

  const handleSelectProduct = (item: ComboboxItem | null) => {
    if (!item) return;
    const prod = products.find(p => p.id === item.id);
    if (!prod) return;

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
      };
      setItems([...items, newItem]);
    }
  };

  const handleSave = (shouldPrint: boolean = false) => {
    if (items.length === 0) {
      alert('Vui lòng thêm ít nhất một sản phẩm vào báo giá');
      return;
    }

    const created = createQuotation(
      {
        customer_id: customerId || undefined,
        customer_name: customerName,
        customer_phone: customerPhone,
        quote_date: new Date(quoteDate).toISOString(),
        expires_at: expiresAt || undefined,
        discount_type: discountType,
        discount_value: discountValue,
        vat_rate: vatRate,
        shipping_fee: shippingFee,
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
      title="Tạo báo giá khách hàng"
      subtitle="Báo giá mặt hàng, hạn hiệu lực và điều khoản giá bán"
      icon="request_quote"
      width="lg"
      footer={
        <div>
          {/* ========================================================= */}
          {/* MOBILE 1-HAND FOOTER (< sm): Large Thumb Reach Zone       */}
          {/* ========================================================= */}
          <div className="flex sm:hidden flex-col gap-2">
            {/* Row 1: Summary Total */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-wider block">
                  TỔNG BÁO GIÁ ({items.length} SP)
                </span>
                {(discountAmount > 0 || vatAmount > 0 || shippingFee > 0) && (
                  <span className="text-[10.5px] text-[#9CA3AF]">
                    Tạm tính: {formatCurrency(subtotal)}
                  </span>
                )}
              </div>
              <span className="text-[20px] font-black text-[#6D3EEB] dark:text-[#C084FC] tabular-nums">
                {formatCurrency(total)}
              </span>
            </div>

            {/* Row 2: Large Thumb Action Buttons */}
            <div className="flex items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => handleSave(true)}
                className="h-11 px-3.5 bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] active:bg-gray-100 dark:active:bg-slate-800 text-[#1F2937] dark:text-[#F8FAFC] rounded-[12px] flex items-center justify-center gap-1.5 font-semibold text-[13px] shadow-2xs shrink-0 cursor-pointer"
              >
                <Icon name="print" size={18} className="text-[#6D3EEB] dark:text-[#C084FC]" />
                <span>In</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave(false)}
                className="flex-1 h-11 px-4 bg-[#6D3EEB] hover:bg-[#5B2BD6] active:scale-[0.98] text-white rounded-[12px] flex items-center justify-center gap-2 font-bold text-[14px] shadow-[0_8px_20px_-6px_rgba(109,62,235,0.55)] transition-all cursor-pointer"
              >
                <Icon name="save" size={18} />
                <span>Tạo báo giá</span>
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* DESKTOP FOOTER (sm+): Spacious Inline Actions             */}
          {/* ========================================================= */}
          <div className="hidden sm:flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-wider">
                TỔNG BÁO GIÁ
              </span>
              <span className="text-[20px] font-bold text-[#6D3EEB] dark:text-[#C084FC] tabular-nums">
                {formatCurrency(total)}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-[#4B5563] dark:text-[#CBD5E1] hover:text-[#111827] text-[13.5px] font-medium cursor-pointer"
              >
                ✕ Hủy
              </button>
              <button
                type="button"
                onClick={() => handleSave(true)}
                className="px-4 py-2 bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] hover:bg-gray-50 dark:hover:bg-slate-800 text-[#1F2937] dark:text-[#F8FAFC] text-[13.5px] font-semibold rounded-[12px] flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Icon name="print" size={18} className="text-[#6D3EEB] dark:text-[#C084FC]" />
                <span>Lưu và In</span>
              </button>
              <button
                type="button"
                onClick={() => handleSave(false)}
                className="px-5 py-2 bg-[#6D3EEB] hover:bg-[#5B2BD6] text-white text-[13.5px] font-semibold rounded-[12px] shadow-[0_8px_20px_-6px_rgba(109,62,235,0.55)] flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Icon name="save" size={18} />
                <span>Tạo báo giá</span>
              </button>
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-4 sm:space-y-6">
        {/* ========================================================= */}
        {/* SECTION 1: CUSTOMER & DATES (Responsive Grid)             */}
        {/* ========================================================= */}
        <div className="space-y-3">
          {/* Customer Selection */}
          <EntityCombobox
            label="Khách hàng"
            placeholder="Chọn khách hàng hoặc để Khách lẻ..."
            items={customerComboboxItems}
            selectedId={customerId}
            onSelect={handleSelectCustomer}
            type="customer"
          />

          {/* Quotation Date & Expiry Date (2-col grid on mobile, inline on desktop) */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <div>
              <label className="block text-[12px] sm:text-[13.5px] font-medium text-[#374151] dark:text-[#CBD5E1] mb-1">
                Ngày lập báo giá
              </label>
              <input
                type="datetime-local"
                value={quoteDate}
                onChange={e => setQuoteDate(e.target.value)}
                className="w-full h-10 sm:h-11 px-2.5 sm:px-3.5 bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-[12px] text-[12.5px] sm:text-[13.5px] text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6D3EEB]"
              />
            </div>

            <div>
              <label className="block text-[12px] sm:text-[13.5px] font-medium text-[#374151] dark:text-[#CBD5E1] mb-1">
                Hạn hiệu lực (7 ngày)
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={e => setExpiresAt(e.target.value)}
                className="w-full h-10 sm:h-11 px-2.5 sm:px-3.5 bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-[12px] text-[12.5px] sm:text-[13.5px] text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6D3EEB]"
              />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 2: PRODUCT SEARCH & ADDITION                      */}
        {/* ========================================================= */}
        <div className="pt-2 border-t border-[#F1F2F5] dark:border-[#334155]">
          <EntityCombobox
            label="Chọn sản phẩm thêm vào báo giá *"
            placeholder="Tìm theo tên sản phẩm, mã SKU..."
            items={productComboboxItems}
            onSelect={handleSelectProduct}
            type="product"
          />
        </div>

        {/* ========================================================= */}
        {/* SECTION 3: LINE ITEMS EDITOR (Mobile 1-hand optimized)    */}
        {/* ========================================================= */}
        <LineItemsEditor
          items={items}
          availableProducts={products}
          onChange={setItems}
        />

        {/* ========================================================= */}
        {/* SECTION 4: ADJUSTMENTS (Chiết khấu, VAT, Phí ship)        */}
        {/* ========================================================= */}
        {/* Mobile Accordion Toggle for Ergonomics */}
        <div className="sm:hidden pt-1">
          <button
            type="button"
            onClick={() => setShowAdjustmentsMobile(!showAdjustmentsMobile)}
            className="w-full py-2 px-3 rounded-[12px] bg-transparent border border-[#E5E7EB] dark:border-[#334155] flex items-center justify-between text-[12.5px] font-semibold text-[#4B5563] dark:text-[#CBD5E1] cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <Icon name="tune" size={16} className="text-[#6D3EEB] dark:text-[#C084FC]" />
              <span>Chiết khấu, VAT & Phí vận chuyển</span>
              {(discountValue > 0 || vatRate > 0 || shippingFee > 0) && (
                <span className="w-2 h-2 rounded-full bg-[#6D3EEB]" />
              )}
            </div>
            <Icon
              name={showAdjustmentsMobile ? 'expand_less' : 'expand_more'}
              size={18}
              className="text-[#6B7280]"
            />
          </button>
        </div>

        {/* Adjustments Form Grid */}
        <div
          className={`${
            showAdjustmentsMobile ? 'block' : 'hidden'
          } sm:grid sm:grid-cols-3 gap-3 sm:gap-4 pt-2 sm:pt-3 border-t sm:border-t border-[#F1F2F5] dark:border-[#334155] space-y-3 sm:space-y-0`}
        >
          <div>
            <label className="block text-[12px] sm:text-[13px] font-medium text-[#374151] dark:text-[#CBD5E1] mb-1">
              Chiết khấu
            </label>
            <div className="flex rounded-[12px] border border-[#E5E7EB] dark:border-[#334155] overflow-hidden bg-white dark:bg-[#1E293B]">
              <input
                type="number"
                min={0}
                value={discountValue}
                onChange={e => setDiscountValue(Number(e.target.value))}
                className="w-full h-10 px-3 text-[13.5px] text-[#111827] dark:text-[#F8FAFC] focus:outline-none tabular-nums bg-transparent"
              />
              <select
                value={discountType}
                onChange={e => setDiscountType(e.target.value as any)}
                className="bg-transparent border-l border-[#E5E7EB] dark:border-[#334155] px-2.5 text-[12.5px] font-semibold text-[#4B5563] dark:text-[#CBD5E1] outline-none"
              >
                <option value="amount">đ</option>
                <option value="percent">%</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] sm:text-[13px] font-medium text-[#374151] dark:text-[#CBD5E1] mb-1">
              VAT (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={vatRate}
              onChange={e => setVatRate(Number(e.target.value))}
              placeholder="0%"
              className="w-full h-10 px-3 border border-[#E5E7EB] dark:border-[#334155] rounded-[12px] text-[13.5px] text-[#111827] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6D3EEB] tabular-nums bg-white dark:bg-[#1E293B]"
            />
          </div>

          <div>
            <label className="block text-[12px] sm:text-[13px] font-medium text-[#374151] dark:text-[#CBD5E1] mb-1">
              Phí vận chuyển dự kiến (đ)
            </label>
            <input
              type="number"
              min={0}
              step={5000}
              value={shippingFee}
              onChange={e => setShippingFee(Number(e.target.value))}
              className="w-full h-10 px-3 border border-[#E5E7EB] dark:border-[#334155] rounded-[12px] text-[13.5px] text-[#111827] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6D3EEB] tabular-nums bg-white dark:bg-[#1E293B]"
            />
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="block text-[12px] sm:text-[13px] font-medium text-[#374151] dark:text-[#CBD5E1] mb-1">
            Ghi chú điều khoản báo giá
          </label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Ví dụ: Báo giá có hiệu lực trong 7 ngày, miễn phí giao hàng..."
            className="w-full h-10 px-3 border border-[#E5E7EB] dark:border-[#334155] rounded-[12px] text-[12.5px] sm:text-[13px] text-[#111827] dark:text-[#F8FAFC] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#6D3EEB] bg-white dark:bg-[#1E293B]"
          />
        </div>
      </div>
    </Modal>
  );
};
