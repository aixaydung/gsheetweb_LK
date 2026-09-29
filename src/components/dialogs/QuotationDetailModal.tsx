import React from 'react';
import { Quotation } from '../../types';
import { Icon } from '../ui/Icon';
import { formatCurrency, formatDate } from '../../lib/format';

interface QuotationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: Quotation | null;
  allQuotations?: Quotation[];
  onSelectQuotation?: (quo: Quotation) => void;
  onPrint?: (quo: Quotation) => void;
  onConvertToInvoice?: (quo: Quotation) => void;
  onDelete?: (quo: Quotation) => void;
  onEdit?: (quo: Quotation) => void;
}

export const QuotationDetailModal: React.FC<QuotationDetailModalProps> = ({
  isOpen,
  onClose,
  quotation,
  allQuotations = [],
  onSelectQuotation,
  onPrint,
  onConvertToInvoice,
  onDelete,
  onEdit,
}) => {
  if (!isOpen || !quotation) return null;

  const currentIndex = allQuotations.findIndex(q => q.id === quotation.id);
  const totalCount = allQuotations.length > 0 ? allQuotations.length : 1;

  const handlePrev = () => {
    if (currentIndex > 0 && onSelectQuotation) {
      onSelectQuotation(allQuotations[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < allQuotations.length - 1 && onSelectQuotation) {
      onSelectQuotation(allQuotations[currentIndex + 1]);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[12px] font-semibold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
            Mới
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[12px] font-semibold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
            Đã gửi KH
          </span>
        );
      case 'converted':
        return (
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[12px] font-semibold bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE]">
            Đã chuyển HĐ
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[12px] font-semibold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
            Đã huỷ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[12px] font-semibold bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-[#1E232E] rounded-[22px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-[#E5E7EB] dark:border-gray-800 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header (Matching Image 3) */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800/80">
          <div className="flex items-center gap-3.5">
            {/* Purple Icon Box */}
            <div className="w-12 h-12 rounded-[14px] bg-[#6D3EEB] flex items-center justify-center text-white shadow-md shadow-purple-500/25 shrink-0">
              <Icon name="description" size={24} />
            </div>
            <div>
              <h2 className="text-[19px] font-bold text-[#111827] dark:text-white leading-tight flex items-center gap-2">
                Báo giá {quotation.code}
              </h2>
              <p className="text-[13.5px] text-[#6B7280] dark:text-gray-400 font-medium mt-0.5">
                {quotation.customer_name || 'Khách hàng'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Stepper Navigation: < 1/26 > */}
            {allQuotations.length > 0 && (
              <div className="flex items-center gap-1 text-[13px] text-[#6B7280] dark:text-gray-400 font-medium bg-gray-50 dark:bg-gray-800/60 px-2 py-1 rounded-[10px] border border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIndex <= 0}
                  className="p-1 hover:text-[#111827] dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Báo giá trước"
                >
                  <Icon name="chevron_left" size={16} />
                </button>
                <span className="px-1 tabular-nums font-semibold text-[#374151] dark:text-gray-300">
                  {currentIndex >= 0 ? currentIndex + 1 : 1}/{totalCount}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentIndex >= totalCount - 1}
                  className="p-1 hover:text-[#111827] dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Báo giá kế tiếp"
                >
                  <Icon name="chevron_right" size={16} />
                </button>
              </div>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <Icon name="close" size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Metadata bar: Ngày báo giá & Trạng thái */}
          <div className="flex items-center justify-between text-[13.5px] pb-1">
            <div className="text-[#6B7280] dark:text-gray-400">
              Ngày báo giá:{' '}
              <strong className="text-[#111827] dark:text-white font-bold ml-0.5">
                {formatDate(quotation.quote_date)}
              </strong>
              {quotation.expires_at ? (
                <>
                  {' '}· Hết hạn:{' '}
                  <strong className="text-[#111827] dark:text-white font-semibold ml-0.5">
                    {formatDate(quotation.expires_at)}
                  </strong>
                </>
              ) : null}
            </div>

            <div>{getStatusBadge(quotation.status)}</div>
          </div>

          {/* Line Items Table (Matching Image 3) */}
          <div className="border border-gray-100 dark:border-gray-800 rounded-[14px] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-[#FAFAFA] dark:bg-gray-800/40 text-[11px] font-bold text-[#6B7280] dark:text-gray-400 tracking-wider">
                  <th className="py-3 px-4">SẢN PHẨM</th>
                  <th className="py-3 px-3 text-center w-16">SL</th>
                  <th className="py-3 px-4 text-right">ĐƠN GIÁ</th>
                  <th className="py-3 px-4 text-right">THÀNH TIỀN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-[13.5px]">
                {quotation.items && quotation.items.length > 0 ? (
                  quotation.items.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-[#111827] dark:text-white">
                            {item.product_name}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-[6px] bg-[#EBF5FF] text-[#1D4ED8] font-medium border border-[#BFDBFE]">
                            <Icon name="inventory_2" size={13} className="text-[#2563EB]" />
                            Hàng hóa
                          </span>
                        </div>
                        {(item.sku || (item as any).product_sku) && (
                          <div className="text-[12px] text-[#9CA3AF] mt-0.5">
                            SKU: {item.sku || (item as any).product_sku}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-center text-[#111827] dark:text-gray-200 font-medium tabular-nums">
                        {item.quantity}
                      </td>
                      <td className="py-3.5 px-4 text-right text-[#374151] dark:text-gray-300 tabular-nums">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-[#111827] dark:text-white tabular-nums">
                        {formatCurrency(item.line_total)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-400">
                      Không có sản phẩm nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Financial Summary Box (Matching Image 3) */}
          <div className="p-4 rounded-[14px] bg-[#F9FAFB] dark:bg-[#151922] border border-gray-100 dark:border-gray-800/80 space-y-2 text-[13.5px]">
            <div className="flex items-center justify-between text-[#4B5563] dark:text-gray-300">
              <span>Tạm tính</span>
              <span className="tabular-nums font-medium text-[#111827] dark:text-white">
                {formatCurrency(quotation.subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[#4B5563] dark:text-gray-300">
              <span>Chiết khấu</span>
              <span className="tabular-nums font-medium text-[#E11D48]">
                -{formatCurrency(quotation.discount_amount || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[#4B5563] dark:text-gray-300">
              <span>VAT</span>
              <span className="tabular-nums font-medium text-[#111827] dark:text-white">
                {formatCurrency(quotation.vat_amount || 0)}
              </span>
            </div>
            {quotation.shipping_fee > 0 && (
              <div className="flex items-center justify-between text-[#4B5563] dark:text-gray-300">
                <span>Phí vận chuyển</span>
                <span className="tabular-nums font-medium text-[#111827] dark:text-white">
                  {formatCurrency(quotation.shipping_fee)}
                </span>
              </div>
            )}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700/80 flex items-center justify-between">
              <span className="font-semibold text-[#111827] dark:text-white text-[14.5px]">
                Tổng cộng
              </span>
              <span className="text-[18px] font-extrabold text-[#111827] dark:text-white tabular-nums">
                {formatCurrency(quotation.total)}
              </span>
            </div>
          </div>

          {/* Quotation Note if present */}
          {quotation.note && quotation.note.trim().length > 0 && (
            <div className="p-3.5 rounded-[12px] bg-[#FAF5FF] dark:bg-purple-950/20 border border-[#F3E8FF] dark:border-purple-900/40 text-[13px] flex items-start gap-2.5">
              <Icon name="sticky_note_2" size={17} className="text-[#6D3EEB] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#6D3EEB] mr-1.5">Ghi chú:</span>
                <span className="text-[#374151] dark:text-gray-200 whitespace-pre-wrap">
                  {quotation.note}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions (Matching Image 3) */}
        <div className="p-4 px-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1E232E] flex items-center justify-between">
          {/* Delete Button (Left side) */}
          <button
            type="button"
            onClick={() => {
              if (onDelete) onDelete(quotation);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-[13.5px] font-semibold text-[#E11D48] hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-[10px] transition-colors cursor-pointer"
          >
            <Icon name="delete" size={18} />
            <span>Xóa</span>
          </button>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(quotation)}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-[#374151] dark:text-gray-200 text-[13.5px] font-medium rounded-[10px] transition-colors shadow-2xs cursor-pointer"
              >
                <Icon name="edit" size={17} />
                <span>Sửa</span>
              </button>
            )}

            {onPrint && (
              <button
                type="button"
                onClick={() => onPrint(quotation)}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-[#374151] dark:text-gray-200 text-[13.5px] font-medium rounded-[10px] transition-colors shadow-2xs cursor-pointer"
              >
                <Icon name="print" size={17} />
                <span>In / Gửi chứng từ</span>
              </button>
            )}

            {quotation.status !== 'converted' && quotation.status !== 'cancelled' && onConvertToInvoice && (
              <button
                type="button"
                onClick={() => onConvertToInvoice(quotation)}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#6D3EEB] hover:bg-[#5B2BD6] text-white text-[13.5px] font-semibold rounded-[12px] transition-all shadow-md shadow-purple-500/25 cursor-pointer active:scale-98"
              >
                <Icon name="swap_horiz" size={18} />
                <span>Chuyển thành hóa đơn</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
