import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Icon } from '../ui/Icon';
import { formatCurrency } from '../../lib/format';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { invoices, quotations, customers, suppliers, products, purchaseOrders, stockVouchers, payments } =
    useApp();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const searchResults = {
    invoices: q.length >= 2
      ? invoices
          .filter(i => i.code.toLowerCase().includes(q) || i.customer_name.toLowerCase().includes(q))
          .slice(0, 5)
      : [],
    quotations: q.length >= 2
      ? quotations
          .filter(quo => quo.code.toLowerCase().includes(q) || quo.customer_name.toLowerCase().includes(q))
          .slice(0, 5)
      : [],
    customers: q.length >= 2
      ? customers
          .filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.phone.includes(q))
          .slice(0, 5)
      : [],
    suppliers: q.length >= 2
      ? suppliers
          .filter(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.phone.includes(q))
          .slice(0, 5)
      : [],
    products: q.length >= 2
      ? products
          .filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
          .slice(0, 5)
      : [],
    purchaseOrders: q.length >= 2
      ? purchaseOrders
          .filter(po => po.code.toLowerCase().includes(q) || po.supplier_name.toLowerCase().includes(q))
          .slice(0, 5)
      : [],
    payments: q.length >= 2
      ? payments
          .filter(pay => pay.code.toLowerCase().includes(q) || pay.partner_name.toLowerCase().includes(q))
          .slice(0, 5)
      : [],
  };

  const hasAnyResults =
    searchResults.invoices.length > 0 ||
    searchResults.quotations.length > 0 ||
    searchResults.customers.length > 0 ||
    searchResults.suppliers.length > 0 ||
    searchResults.products.length > 0 ||
    searchResults.purchaseOrders.length > 0 ||
    searchResults.payments.length > 0;

  const handleSelect = (url: string) => {
    onClose();
    onNavigate(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Search Box */}
      <div className="relative w-full max-w-[620px] bg-white rounded-[20px] shadow-[0_12px_32px_rgba(16,24,40,0.18)] border border-[#E5E7EB] z-10 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-100">
        {/* Input Bar */}
        <div className="p-4 border-b border-[#F1F2F5] flex items-center gap-3">
          <Icon name="search" size={22} className="text-[#6D3EEB]" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Tìm theo mã hoá đơn, khách hàng, nhà cung cấp, sản phẩm..."
            autoFocus
            className="flex-1 text-[15px] font-medium text-[#111827] outline-none placeholder-[#9CA3AF]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-[#9CA3AF] hover:text-[#111827]"
            >
              <Icon name="close" size={18} />
            </button>
          )}
          <kbd className="text-[11px] font-semibold text-[#6B7280] bg-[#F9FAFB] border border-[#E5E7EB] px-2 py-0.5 rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="overflow-y-auto p-4 space-y-4">
          {q.length < 2 ? (
            <div className="py-12 text-center text-[#9CA3AF] text-[13.5px]">
              Gõ ít nhất 2 ký tự để tìm kiếm trên toàn hệ thống...
            </div>
          ) : !hasAnyResults ? (
            <div className="py-12 text-center text-[#6B7280] text-[14px]">
              Không tìm thấy kết quả nào cho &ldquo;<span className="font-semibold">{query}</span>&rdquo;
            </div>
          ) : (
            <>
              {/* Invoices */}
              {searchResults.invoices.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-[#9CA3AF] tracking-wider uppercase block mb-1.5 px-2">
                    HÓA ĐƠN BÁN HÀNG
                  </span>
                  <div className="space-y-1">
                    {searchResults.invoices.map(inv => (
                      <div
                        key={inv.id}
                        onClick={() => handleSelect('/ban-hang?tab=tong-quan')}
                        className="px-3 py-2 rounded-[10px] hover:bg-[#F9FAFB] cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon name="sell" size={18} className="text-[#6D3EEB]" />
                          <div>
                            <span className="font-semibold text-[13.5px] text-[#111827]">
                              {inv.code}
                            </span>
                            <span className="text-[13px] text-[#4B5563] ml-2">
                              {inv.customer_name}
                            </span>
                          </div>
                        </div>
                        <span className="font-semibold text-[13.5px] text-[#6D3EEB] tabular-nums">
                          {formatCurrency(inv.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quotations */}
              {searchResults.quotations.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-[#9CA3AF] tracking-wider uppercase block mb-1.5 px-2">
                    BÁO GIÁ
                  </span>
                  <div className="space-y-1">
                    {searchResults.quotations.map(quo => (
                      <div
                        key={quo.id}
                        onClick={() => handleSelect('/ban-hang?tab=bao-gia')}
                        className="px-3 py-2 rounded-[10px] hover:bg-[#F9FAFB] cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon name="request_quote" size={18} className="text-[#6366F1]" />
                          <div>
                            <span className="font-semibold text-[13.5px] text-[#111827]">
                              {quo.code}
                            </span>
                            <span className="text-[13px] text-[#4B5563] ml-2">
                              {quo.customer_name}
                            </span>
                          </div>
                        </div>
                        <span className="font-semibold text-[13.5px] tabular-nums">
                          {formatCurrency(quo.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customers */}
              {searchResults.customers.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-[#9CA3AF] tracking-wider uppercase block mb-1.5 px-2">
                    KHÁCH HÀNG
                  </span>
                  <div className="space-y-1">
                    {searchResults.customers.map(cust => (
                      <div
                        key={cust.id}
                        onClick={() => handleSelect('/ban-hang?tab=khach-hang')}
                        className="px-3 py-2 rounded-[10px] hover:bg-[#F9FAFB] cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon name="person" size={18} className="text-[#D946EF]" />
                          <div>
                            <span className="font-semibold text-[13.5px] text-[#111827]">
                              {cust.name}
                            </span>
                            <span className="text-[12px] text-[#6B7280] ml-2">
                              ({cust.code} · {cust.phone})
                            </span>
                          </div>
                        </div>
                        {cust.debt_amount > 0 && (
                          <span className="font-semibold text-[13px] text-[#E11D48] tabular-nums">
                            Nợ {formatCurrency(cust.debt_amount)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suppliers */}
              {searchResults.suppliers.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-[#9CA3AF] tracking-wider uppercase block mb-1.5 px-2">
                    NHÀ CUNG CẤP
                  </span>
                  <div className="space-y-1">
                    {searchResults.suppliers.map(sup => (
                      <div
                        key={sup.id}
                        onClick={() => handleSelect('/mua-hang?tab=nha-cung-cap')}
                        className="px-3 py-2 rounded-[10px] hover:bg-[#F9FAFB] cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon name="storefront" size={18} className="text-[#0EA5E9]" />
                          <div>
                            <span className="font-semibold text-[13.5px] text-[#111827]">
                              {sup.name}
                            </span>
                            <span className="text-[12px] text-[#6B7280] ml-2">
                              ({sup.code} · {sup.phone})
                            </span>
                          </div>
                        </div>
                        {sup.debt_amount > 0 && (
                          <span className="font-semibold text-[13px] text-[#E11D48] tabular-nums">
                            Nợ {formatCurrency(sup.debt_amount)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Products */}
              {searchResults.products.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-[#9CA3AF] tracking-wider uppercase block mb-1.5 px-2">
                    SẢN PHẨM & TỒN KHO
                  </span>
                  <div className="space-y-1">
                    {searchResults.products.map(prod => (
                      <div
                        key={prod.id}
                        onClick={() => handleSelect('/kho-hang?tab=tong-quan')}
                        className="px-3 py-2 rounded-[10px] hover:bg-[#F9FAFB] cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon name="inventory_2" size={18} className="text-[#F59E0B]" />
                          <div>
                            <span className="font-semibold text-[13.5px] text-[#111827]">
                              {prod.name}
                            </span>
                            <span className="text-[12px] text-[#6B7280] ml-2">
                              ({prod.sku} · Tồn: {prod.stock_quantity} {prod.unit})
                            </span>
                          </div>
                        </div>
                        <span className="font-semibold text-[13px] text-[#D97706] tabular-nums">
                          {formatCurrency(prod.sale_price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Purchase Orders */}
              {searchResults.purchaseOrders.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-[#9CA3AF] tracking-wider uppercase block mb-1.5 px-2">
                    PHIẾU MUA HÀNG
                  </span>
                  <div className="space-y-1">
                    {searchResults.purchaseOrders.map(po => (
                      <div
                        key={po.id}
                        onClick={() => handleSelect('/mua-hang?tab=tong-quan')}
                        className="px-3 py-2 rounded-[10px] hover:bg-[#F9FAFB] cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon name="shopping_cart" size={18} className="text-[#3B82F6]" />
                          <div>
                            <span className="font-semibold text-[13.5px] text-[#111827]">
                              {po.code}
                            </span>
                            <span className="text-[13px] text-[#4B5563] ml-2">
                              {po.supplier_name}
                            </span>
                          </div>
                        </div>
                        <span className="font-semibold text-[13.5px] tabular-nums">
                          {formatCurrency(po.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
