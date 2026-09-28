import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Icon } from '../../../components/ui/Icon';

export const DebtAccountingLockTab: React.FC = () => {
  const { companySettings, updateSettings } = useApp();

  const [lockBeforeDate, setLockBeforeDate] = useState(companySettings.lock_before_date || '');
  const [autoReminderDays, setAutoReminderDays] = useState(3);
  const [enableOverdueInterest, setEnableOverdueInterest] = useState(false);
  const [overdueInterestRate, setOverdueInterestRate] = useState(1.5);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings({
      lock_before_date: lockBeforeDate || null,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F1F2F5] dark:border-[#334155]">
        <div>
          <h3 className="text-[20px] font-bold text-[#111827] dark:text-[#F8FAFC]">Chính sách Công nợ & Khóa sổ Kế toán</h3>
          <p className="text-[14.5px] text-[#4B5563] dark:text-[#94A3B8] mt-0.5">
            Bảo vệ tính toàn vẹn của sổ sách kế toán và thiết lập quy chế thu hồi công nợ
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="h-10 px-5 bg-[#6D3EEB] hover:bg-[#5B2BD6] text-white text-[14.5px] font-semibold rounded-[12px] shadow-sm flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
        >
          <Icon name="save" size={18} />
          <span>Lưu thiết lập</span>
        </button>
      </div>

      {saved && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-[12px] flex items-center gap-2.5 text-[14.5px] font-semibold">
          <Icon name="check_circle" size={20} className="text-emerald-600 dark:text-emerald-400" />
          <span>Đã lưu thành công ngày khóa sổ và chính sách công nợ!</span>
        </div>
      )}

      <div className="bg-transparent rounded-[16px] p-6 border border-[#F1F2F5] dark:border-[#334155] shadow-xs space-y-6">
        {/* Accounting Lock Period (No background / Trong suốt) */}
        <div className="p-5 rounded-[14px] bg-transparent border border-purple-300 dark:border-purple-800/60 space-y-3">
          <div className="flex items-center gap-2.5">
            <Icon name="lock" size={22} className="text-[#6D3EEB] dark:text-[#C084FC]" />
            <h4 className="text-[16px] font-bold text-[#111827] dark:text-[#F8FAFC]">
              Khóa sổ dữ liệu kế toán đến ngày
            </h4>
          </div>

          <p className="text-[14px] text-[#4B5563] dark:text-[#CBD5E1] leading-relaxed">
            Tất cả các chứng từ có ngày phát sinh trước hoặc bằng ngày khóa sổ (hóa đơn, phiếu nhập/xuất kho, phiếu thu/chi, phiếu cấn trừ) sẽ được cố định và chuyển sang trạng thái <strong className="text-[#111827] dark:text-white">&ldquo;Đã khóa&rdquo;</strong>. Không nhân viên nào (kể cả quản trị viên) có thể chỉnh sửa hoặc xóa chứng từ trong kỳ đã khóa sổ nhằm đảm bảo số liệu báo cáo tài chính khớp đúng với cơ quan thuế.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
            <div className="relative w-full sm:w-64">
              <input
                type="date"
                value={lockBeforeDate}
                onChange={e => setLockBeforeDate(e.target.value)}
                className="w-full h-10 px-3.5 bg-white dark:bg-[#0F172A] border border-[#D8B4FE] dark:border-[#334155] rounded-[10px] text-[14.5px] font-semibold text-[#111827] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6D3EEB]"
              />
            </div>
            {lockBeforeDate ? (
              <button
                type="button"
                onClick={() => setLockBeforeDate('')}
                className="text-[13.5px] text-red-600 dark:text-red-400 hover:underline font-semibold cursor-pointer"
              >
                Mở khóa tất cả các kỳ
              </button>
            ) : (
              <span className="text-[13.5px] text-gray-500 dark:text-[#94A3B8] italic">
                Chưa kích hoạt khóa sổ (toàn bộ chứng từ đang mở sửa)
              </span>
            )}
          </div>
        </div>

        {/* Debt Reminder & Aging Policy */}
        <div className="space-y-4 pt-1">
          <h4 className="text-[16px] font-bold text-[#111827] dark:text-[#F8FAFC]">Quy chế thu hồi công nợ</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[14.5px] font-medium text-[#374151] dark:text-[#CBD5E1] mb-1.5">
                Nhắc nợ tự động trước ngày đến hạn
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={autoReminderDays}
                  onChange={e => setAutoReminderDays(Number(e.target.value))}
                  className="w-full h-10 px-3.5 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[14.5px] font-mono text-[#111827] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6D3EEB]"
                />
                <span className="text-[14px] text-[#4B5563] dark:text-[#94A3B8] shrink-0 font-medium">ngày</span>
              </div>
              <span className="text-[13px] text-[#6B7280] dark:text-[#94A3B8] mt-1.5 block">
                Cảnh báo sẽ hiện trên thanh chuông thông báo và danh sách công nợ cần thu.
              </span>
            </div>

            <div>
              <label className="block text-[14.5px] font-medium text-[#374151] dark:text-[#CBD5E1] mb-1.5">
                Lãi suất phạt chậm trả tham khảo (% / tháng)
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  type="number"
                  step={0.1}
                  min={0}
                  value={overdueInterestRate}
                  onChange={e => setOverdueInterestRate(Number(e.target.value))}
                  disabled={!enableOverdueInterest}
                  className="w-full h-10 px-3.5 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[14.5px] font-mono text-[#111827] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6D3EEB] disabled:bg-gray-100 dark:disabled:bg-slate-800 disabled:text-gray-400"
                />
                <span className="text-[14px] text-[#4B5563] dark:text-[#94A3B8] shrink-0 font-medium">%/tháng</span>
              </div>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableOverdueInterest}
                  onChange={e => setEnableOverdueInterest(e.target.checked)}
                  className="w-4 h-4 rounded text-[#6D3EEB]"
                />
                <span className="text-[13.5px] text-[#374151] dark:text-[#CBD5E1] font-medium">Kích hoạt tính lãi nợ quá hạn tham khảo</span>
              </label>
            </div>
          </div>
        </div>

        {/* Debt Age Buckets Reference (No background / Trong suốt) */}
        <div className="p-4 bg-transparent rounded-[12px] border border-gray-200 dark:border-[#334155] space-y-2.5">
          <span className="text-[13px] font-bold text-[#374151] dark:text-[#CBD5E1] uppercase tracking-wide block">
            Phân loại tuổi nợ tiêu chuẩn trên báo cáo NexUpOne
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[13.5px]">
            <div className="p-3 bg-transparent rounded-[10px] border border-gray-200 dark:border-[#334155]">
              <span className="font-bold text-emerald-700 dark:text-emerald-400 block">Trong hạn</span>
              <span className="text-[#4B5563] dark:text-[#94A3B8] text-[12.5px]">Chưa đến ngày đáo hạn</span>
            </div>
            <div className="p-3 bg-transparent rounded-[10px] border border-gray-200 dark:border-[#334155]">
              <span className="font-bold text-amber-700 dark:text-amber-400 block">Quá hạn 1 - 30 ngày</span>
              <span className="text-[#4B5563] dark:text-[#94A3B8] text-[12.5px]">Mức độ rủi ro thấp</span>
            </div>
            <div className="p-3 bg-transparent rounded-[10px] border border-gray-200 dark:border-[#334155]">
              <span className="font-bold text-orange-700 dark:text-orange-400 block">Quá hạn 31 - 90 ngày</span>
              <span className="text-[#4B5563] dark:text-[#94A3B8] text-[12.5px]">Cần liên hệ giục nợ</span>
            </div>
            <div className="p-3 bg-transparent rounded-[10px] border border-gray-200 dark:border-[#334155]">
              <span className="font-bold text-red-700 dark:text-red-400 block">Quá hạn &gt; 90 ngày</span>
              <span className="text-[#4B5563] dark:text-[#94A3B8] text-[12.5px]">Nguy cơ nợ khó đòi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
