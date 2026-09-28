import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Icon } from '../../../components/ui/Icon';

export const BusinessSalesTab: React.FC = () => {
  const { companySettings, updateSettings } = useApp();

  const [paymentTerms, setPaymentTerms] = useState(companySettings.default_payment_term_days);
  const [maxDiscountPercent, setMaxDiscountPercent] = useState(15);
  const [warnCreditLimit, setWarnCreditLimit] = useState(true);
  const [autoCreateStockOut, setAutoCreateStockOut] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings({
      default_payment_term_days: paymentTerms,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F1F2F5] dark:border-[#334155]">
        <div>
          <h3 className="text-[20px] font-bold text-[#111827] dark:text-[#F8FAFC]">Thiết lập Nghiệp vụ Bán hàng</h3>
          <p className="text-[14.5px] text-[#4B5563] dark:text-[#94A3B8] mt-0.5">
            Quy tắc chiết khấu, hạn nợ chuẩn cho khách hàng và luân chuyển phiếu xuất bán
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="h-10 px-5 bg-[#6D3EEB] hover:bg-[#5B2BD6] text-white text-[14.5px] font-semibold rounded-[12px] shadow-sm flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
        >
          <Icon name="save" size={18} />
          <span>Lưu chính sách bán</span>
        </button>
      </div>

      {saved && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-[12px] flex items-center gap-2.5 text-[14.5px] font-semibold">
          <Icon name="check_circle" size={20} className="text-emerald-600 dark:text-emerald-400" />
          <span>Đã cập nhật quy định nghiệp vụ bán hàng!</span>
        </div>
      )}

      {/* Main card with transparent background */}
      <div className="bg-transparent rounded-[16px] p-6 border border-[#F1F2F5] dark:border-[#334155] shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-[14.5px] font-medium text-[#374151] dark:text-[#CBD5E1] mb-1.5">
              Hạn nợ mặc định cho khách hàng mới (ngày)
            </label>
            <div className="flex items-center gap-2.5">
              <input
                type="number"
                min={0}
                max={365}
                value={paymentTerms}
                onChange={e => setPaymentTerms(Number(e.target.value))}
                className="w-full h-10 px-3.5 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[14.5px] font-mono text-[#111827] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6D3EEB]"
              />
              <span className="text-[14px] text-[#4B5563] dark:text-[#94A3B8] shrink-0 font-medium">ngày kể từ ngày xuất</span>
            </div>
            <span className="text-[13px] text-[#6B7280] dark:text-[#94A3B8] mt-1.5 block">
              Hóa đơn sau số ngày này nếu chưa thanh toán đủ sẽ tự động đánh dấu &ldquo;Quá hạn&rdquo;.
            </span>
          </div>

          <div>
            <label className="block text-[14.5px] font-medium text-[#374151] dark:text-[#CBD5E1] mb-1.5">
              Tỷ lệ chiết khấu tối đa nhân viên sale được duyệt (%)
            </label>
            <div className="flex items-center gap-2.5">
              <input
                type="number"
                min={0}
                max={100}
                value={maxDiscountPercent}
                onChange={e => setMaxDiscountPercent(Number(e.target.value))}
                className="w-full h-10 px-3.5 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[14.5px] font-mono text-[#111827] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6D3EEB]"
              />
              <span className="text-[14px] text-[#4B5563] dark:text-[#94A3B8] shrink-0 font-medium">% giá trị đơn</span>
            </div>
            <span className="text-[13px] text-[#6B7280] dark:text-[#94A3B8] mt-1.5 block">
              Vượt quá mức này cần Quản trị viên hoặc Giám đốc xác nhận phê duyệt.
            </span>
          </div>
        </div>

        <div className="space-y-4 pt-3 border-t border-gray-100 dark:border-[#334155]">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={warnCreditLimit}
              onChange={e => setWarnCreditLimit(e.target.checked)}
              className="w-4.5 h-4.5 mt-0.5 rounded text-[#6D3EEB] focus:ring-[#6D3EEB]"
            />
            <div>
              <span className="text-[14.5px] font-semibold text-[#111827] dark:text-[#F8FAFC] block">
                Cảnh báo khi khách hàng vượt hạn mức nợ trần (Credit Limit)
              </span>
              <span className="text-[13.5px] text-[#4B5563] dark:text-[#94A3B8] block mt-0.5">
                Nếu tổng nợ hiện tại cộng giá trị đơn mới vượt quá hạn mức nợ của khách hàng, hệ thống sẽ hiện hộp thoại cảnh báo rủi ro thu hồi vốn.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoCreateStockOut}
              onChange={e => setAutoCreateStockOut(e.target.checked)}
              className="w-4.5 h-4.5 mt-0.5 rounded text-[#6D3EEB] focus:ring-[#6D3EEB]"
            />
            <div>
              <span className="text-[14.5px] font-semibold text-[#111827] dark:text-[#F8FAFC] block">
                Tự động tạo phiếu xuất kho khi lập hóa đơn bán hàng
              </span>
              <span className="text-[13.5px] text-[#4B5563] dark:text-[#94A3B8] block mt-0.5">
                Giúp kế toán bán hàng không cần thao tác thêm 1 bước tạo phiếu xuất kho riêng biệt.
              </span>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};
