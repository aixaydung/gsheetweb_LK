import React from 'react';
import { DocumentLineItem, Product } from '../../types';
import { Icon } from './Icon';
import { formatCurrency, formatQuantity } from '../../lib/format';
import { StatusBadge } from './StatusBadge';

interface LineItemsEditorProps {
  items: DocumentLineItem[];
  availableProducts: Product[];
  onChange: (items: DocumentLineItem[]) => void;
  isPurchase?: boolean;
}

export const LineItemsEditor: React.FC<LineItemsEditorProps> = ({
  items,
  availableProducts,
  onChange,
  isPurchase = false,
}) => {
  const handleQuantityChange = (id: string, qty: number) => {
    const updated = items.map(item => {
      if (item.id !== id) return item;
      const validQty = Math.max(1, qty);
      const lineTotal = validQty * item.unit_price - (item.line_discount || 0);
      return { ...item, quantity: validQty, line_total: Math.max(0, lineTotal) };
    });
    onChange(updated);
  };

  const handleStepQuantity = (id: string, delta: number) => {
    const item = items.find(it => it.id === id);
    if (!item) return;
    handleQuantityChange(id, item.quantity + delta);
  };

  const handlePriceChange = (id: string, price: number) => {
    const updated = items.map(item => {
      if (item.id !== id) return item;
      const validPrice = Math.max(0, price);
      const lineTotal = item.quantity * validPrice - (item.line_discount || 0);
      return { ...item, unit_price: validPrice, line_total: Math.max(0, lineTotal) };
    });
    onChange(updated);
  };

  const handleRemove = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  if (items.length === 0) {
    return (
      <div className="p-6 sm:p-8 text-center border-2 border-dashed border-[#E5E7EB] dark:border-[#334155] rounded-[16px] text-[#9CA3AF] text-[13px] sm:text-[13.5px]">
        Chưa có sản phẩm nào trong phiếu. Hãy chọn sản phẩm ở ô bên trên.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const product = availableProducts.find(
          p => (item.product_id && p.id === item.product_id) || (item.sku && p.sku === item.sku)
        );
        const availableStock = product?.stock_quantity ?? 0;
        const isOverStock = !isPurchase && !product?.is_service && item.quantity > availableStock;

        return (
          <div
            key={item.id || index}
            className="p-3 sm:p-3.5 bg-transparent rounded-[16px] border border-[#E5E7EB] dark:border-[#334155] transition-colors"
          >
            {/* ========================================================= */}
            {/* MOBILE LAYOUT (< sm): Ergonomic 1-hand thumb cards        */}
            {/* ========================================================= */}
            <div className="flex sm:hidden flex-col gap-2.5">
              {/* Row 1: Icon, Product Name, Badge & Safe Delete Button */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-[8px] bg-white dark:bg-slate-800 border border-[#E5E7EB] dark:border-[#334155] flex items-center justify-center text-[#6D3EEB] dark:text-[#C084FC] shrink-0 mt-0.5">
                    <Icon name="inventory_2" size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-[13.5px] text-[#111827] dark:text-[#F8FAFC] leading-snug">
                        {item.product_name}
                      </span>
                      {product && <StatusBadge status={product.stock_level} />}
                    </div>
                    <div className="text-[11.5px] text-[#6B7280] dark:text-[#94A3B8] flex items-center gap-1.5 mt-0.5">
                      <span>{item.sku}</span>
                      <span>·</span>
                      <span>ĐVT: {item.unit}</span>
                      {!isPurchase && !product?.is_service && (
                        <>
                          <span>·</span>
                          <span className={isOverStock ? 'text-rose-600 font-semibold' : ''}>
                            Tồn: {formatQuantity(availableStock)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Remove Button - Top right, safe padding, easy thumb hit */}
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  title="Xoá dòng"
                  className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-[#9CA3AF] hover:text-[#E11D48] active:bg-rose-50 dark:active:bg-rose-950/40 flex items-center justify-center transition-colors shrink-0 cursor-pointer shadow-2xs"
                >
                  <Icon name="delete" size={17} />
                </button>
              </div>

              {/* Warning if over stock */}
              {isOverStock && (
                <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-[6px]">
                  ⚠ Vượt tồn khả dụng (còn {availableStock})
                </div>
              )}

              {/* Row 2: Thumb Stepper for Quantity & Editable Unit Price */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#F1F2F5] dark:border-[#334155]/60">
                {/* 1-Hand Thumb Stepper */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11.5px] font-medium text-[#6B7280] dark:text-[#94A3B8]">SL:</span>
                  <div className="flex items-center bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] p-0.5 shadow-xs">
                    <button
                      type="button"
                      onClick={() => handleStepQuantity(item.id, -1)}
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 rounded-[7px] bg-gray-100 dark:bg-slate-800 active:bg-gray-200 dark:active:bg-slate-700 text-[#4B5563] dark:text-[#CBD5E1] disabled:opacity-30 flex items-center justify-center font-bold text-[16px] transition-colors cursor-pointer select-none"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={e => handleQuantityChange(item.id, Number(e.target.value))}
                      className="w-10 h-8 text-center text-[13.5px] font-bold text-[#111827] dark:text-[#F8FAFC] bg-transparent outline-none tabular-nums"
                    />
                    <button
                      type="button"
                      onClick={() => handleStepQuantity(item.id, 1)}
                      className="w-8 h-8 rounded-[7px] bg-purple-100 dark:bg-purple-950/60 active:bg-purple-200 text-[#6D3EEB] dark:text-[#C084FC] flex items-center justify-center font-bold text-[16px] transition-colors cursor-pointer select-none"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[11px] text-[#6B7280] dark:text-[#94A3B8]">{item.unit}</span>
                </div>

                {/* Unit Price Field */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11.5px] font-medium text-[#6B7280] dark:text-[#94A3B8]">Đơn giá:</span>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={item.unit_price}
                    onChange={e => handlePriceChange(item.id, Number(e.target.value))}
                    className="w-24 h-8 px-2 text-right text-[12.5px] font-semibold bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] rounded-[9px] focus:outline-none focus:border-[#6D3EEB] text-[#111827] dark:text-[#F8FAFC] tabular-nums"
                  />
                </div>
              </div>

              {/* Row 3: Line Total Highlight */}
              <div className="flex items-center justify-between text-[12.5px] pt-1">
                <span className="text-[#6B7280] dark:text-[#94A3B8]">Thành tiền:</span>
                <span className="font-extrabold text-[15px] text-[#6D3EEB] dark:text-[#C084FC] tabular-nums">
                  {formatCurrency(item.line_total)}
                </span>
              </div>
            </div>

            {/* ========================================================= */}
            {/* DESKTOP LAYOUT (sm+): Wide Inline Row (Unchanged on PC)   */}
            {/* ========================================================= */}
            <div className="hidden sm:flex sm:items-center justify-between gap-3">
              {/* Product Info */}
              <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                <div className="w-10 h-10 rounded-[10px] bg-white dark:bg-slate-800 border border-[#E5E7EB] dark:border-[#334155] flex items-center justify-center text-[#6D3EEB] dark:text-[#C084FC] shrink-0">
                  <Icon name="inventory_2" size={20} />
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[13.5px] text-[#111827] dark:text-[#F8FAFC] truncate">
                      {item.product_name}
                    </span>
                    {product && <StatusBadge status={product.stock_level} />}
                  </div>
                  <div className="text-[12px] text-[#6B7280] dark:text-[#94A3B8] flex items-center gap-2 mt-0.5">
                    <span>{item.sku}</span>
                    <span>·</span>
                    <span>ĐVT: {item.unit}</span>
                    {!isPurchase && !product?.is_service && (
                      <>
                        <span>·</span>
                        <span className={isOverStock ? 'text-rose-600 font-semibold' : ''}>
                          Tồn khả dụng: {formatQuantity(availableStock)}
                        </span>
                      </>
                    )}
                  </div>
                  {isOverStock && (
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium block mt-0.5">
                      ⚠ Vượt tồn khả dụng (còn {availableStock})
                    </span>
                  )}
                </div>
              </div>

              {/* Controls: Quantity & Price */}
              <div className="flex items-center gap-3 shrink-0">
                {/* Quantity */}
                <div className="flex items-center gap-1.5">
                  <label className="text-[12px] text-[#6B7280] dark:text-[#94A3B8]">SL:</label>
                  <div className="flex items-center bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] p-0.5">
                    <button
                      type="button"
                      onClick={() => handleStepQuantity(item.id, -1)}
                      disabled={item.quantity <= 1}
                      className="w-7 h-7 rounded-[6px] hover:bg-gray-100 dark:hover:bg-slate-800 text-[#4B5563] dark:text-[#CBD5E1] disabled:opacity-30 flex items-center justify-center font-bold text-[15px]"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={e => handleQuantityChange(item.id, Number(e.target.value))}
                      className="w-12 h-7 text-center text-[13.5px] font-semibold text-[#111827] dark:text-[#F8FAFC] bg-transparent outline-none tabular-nums"
                    />
                    <button
                      type="button"
                      onClick={() => handleStepQuantity(item.id, 1)}
                      className="w-7 h-7 rounded-[6px] hover:bg-purple-100 dark:hover:bg-purple-950/60 text-[#6D3EEB] dark:text-[#C084FC] flex items-center justify-center font-bold text-[15px]"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[12px] text-[#6B7280] dark:text-[#94A3B8]">{item.unit}</span>
                </div>

                {/* Unit Price */}
                <div className="flex items-center gap-1.5">
                  <label className="text-[12px] text-[#6B7280] dark:text-[#94A3B8]">Đơn giá:</label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={item.unit_price}
                    onChange={e => handlePriceChange(item.id, Number(e.target.value))}
                    className="w-28 h-9 px-2.5 text-right text-[13.5px] font-semibold bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] focus:outline-none focus:border-[#6D3EEB] text-[#111827] dark:text-[#F8FAFC] tabular-nums"
                  />
                </div>

                {/* Line Total */}
                <div className="w-28 text-right font-bold text-[14px] text-[#111827] dark:text-[#F8FAFC] tabular-nums">
                  {formatCurrency(item.line_total)}
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  title="Xoá dòng"
                  className="p-1.5 text-[#9CA3AF] hover:text-[#E11D48] rounded-full hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Icon name="delete" size={18} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
