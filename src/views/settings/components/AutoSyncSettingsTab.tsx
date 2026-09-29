import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Icon } from '../../../components/ui/Icon';

export const AutoSyncSettingsTab: React.FC = () => {
  const {
    syncStatus,
    lastSyncTime,
    triggerManualSync,
    autoSyncEnabled,
    autoSyncInterval,
    isBackgroundSyncing,
    setAutoSyncEnabled,
    setAutoSyncInterval,
  } = useApp();

  const [copiedId, setCopiedId] = useState(false);
  const [justSynced, setJustSynced] = useState(false);

  const spreadsheetId = '1wniDalcsynG8-H1sWokE47Woi0o9mrViDwW27di7oNY';
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  const handleCopyId = () => {
    navigator.clipboard.writeText(spreadsheetId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleManualSyncClick = async () => {
    await triggerManualSync();
    setJustSynced(true);
    setTimeout(() => setJustSynced(false), 3000);
  };

  const sheetsList = [
    { name: 'PRODUCTS', desc: 'Danh mục sản phẩm, đơn giá, giá vốn, tồn kho hiện tại', type: 'Master', status: 'Live 2 chiều' },
    { name: 'CUSTOMERS', desc: 'Hồ sơ khách hàng, phân nhóm, hạn mức & số dư nợ', type: 'Master', status: 'Live 2 chiều' },
    { name: 'VENDORS', desc: 'Danh sách nhà cung cấp, thông tin liên hệ, công nợ', type: 'Master', status: 'Live 2 chiều' },
    { name: 'ORDERS', desc: 'Hóa đơn bán hàng, trạng thái thanh toán, giao hàng', type: 'Master', status: 'Live 2 chiều' },
    { name: 'ORDER_ITEMS', desc: 'Chi tiết sản phẩm, số lượng, đơn giá từng đơn bán', type: 'Detail', status: 'Live 2 chiều' },
    { name: 'PURCHASES', desc: 'Đơn đặt mua hàng NCC, ngày hẹn giao, công nợ mua', type: 'Master', status: 'Live 2 chiều' },
    { name: 'PURCHASE_ITEMS', desc: 'Chi tiết sản phẩm, giá nhập trong đơn mua hàng', type: 'Detail', status: 'Live 2 chiều' },
    { name: 'PAYMENTS', desc: 'Phiếu thu, phiếu chi sổ quỹ và phân bổ công nợ', type: 'Master', status: 'Live 2 chiều' },
    { name: 'STOCKTAKES', desc: 'Phiếu kiểm kê kho, kiểm đếm thực tế & cân bằng kho', type: 'Master & Detail', status: 'Live 2 chiều' },
    { name: 'STOCK_MOVEMENTS', desc: 'Dòng chảy lịch sử xuất - nhập - tồn cho Thẻ kho', type: 'Log / Audit', status: 'Live 2 chiều' },
    { name: 'QUOTATIONS', desc: 'Báo giá gửi khách hàng, chuyển đổi thành hóa đơn', type: 'Master (Gói 8)', status: 'Live 2 chiều' },
    { name: 'QUOTATION_ITEMS', desc: 'Chi tiết danh mục hàng hóa trong từng báo giá', type: 'Detail (Gói 8)', status: 'Live 2 chiều' },
    { name: 'RETURNS', desc: 'Phiếu trả hàng bán & trả hàng NCC, bù trừ công nợ', type: 'Master (Gói 8)', status: 'Live 2 chiều' },
    { name: 'RETURN_ITEMS', desc: 'Chi tiết các mặt hàng trả lại và nhập lại kho', type: 'Detail (Gói 8)', status: 'Live 2 chiều' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F1F2F5] dark:border-[#334155]">
        <div>
          <h3 className="text-[18px] sm:text-[20px] font-bold text-[#111827] dark:text-[#F8FAFC]">
            Đồng bộ Google Sheets & Tự động quét (Polling)
          </h3>
          <p className="text-[13px] sm:text-[14.5px] text-[#4B5563] dark:text-[#94A3B8] mt-0.5">
            Cấu hình quét ngầm định kỳ, đồng bộ hai chiều thời gian thực giữa Web App và Google Sheets
          </p>
        </div>
        <button
          type="button"
          disabled={syncStatus === 'syncing' || isBackgroundSyncing}
          onClick={handleManualSyncClick}
          className="w-full sm:w-auto h-10 px-5 bg-[#6D3EEB] hover:bg-[#5B2BD6] disabled:opacity-50 text-white text-[14px] sm:text-[14.5px] font-semibold rounded-[12px] shadow-sm flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
        >
          <Icon name="sync" size={18} className={syncStatus === 'syncing' || isBackgroundSyncing ? 'animate-spin' : ''} />
          <span>{syncStatus === 'syncing' ? 'Đang đồng bộ...' : 'Đồng bộ toàn bộ ngay'}</span>
        </button>
      </div>

      {justSynced && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-[12px] flex items-center gap-2.5 text-[14px] font-semibold">
          <Icon name="check_circle" size={20} className="text-emerald-600 dark:text-emerald-400" />
          <span>Đã đồng bộ thành công dữ liệu mới nhất từ Google Sheets!</span>
        </div>
      )}

      {/* Card 1: Cấu hình Polling & Tự động quét */}
      <div className="bg-white dark:bg-transparent rounded-[16px] p-5 sm:p-6 border border-[#F1F2F5] dark:border-[#334155] shadow-xs sm:shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-[#F1F2F5] dark:border-[#334155]">
          <Icon name="schedule" size={22} className="text-[#6D3EEB]" />
          <h4 className="text-[16px] font-bold text-[#111827] dark:text-[#F8FAFC]">
            Cơ chế Tự động Đồng bộ (Background Polling & Auto-Sync)
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Switch Auto-Sync */}
          <div className="p-4 bg-[#F9FAFB] dark:bg-[#0F172A] rounded-[14px] border border-[#F1F2F5] dark:border-[#334155] flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[14.5px] text-[#111827] dark:text-[#F8FAFC]">
                  Bật Tự động Quét Ngầm
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  autoSyncEnabled
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                }`}>
                  {autoSyncEnabled ? 'Đang hoạt động' : 'Đã tắt'}
                </span>
              </div>
              <p className="text-[12.5px] text-[#6B7280] dark:text-[#94A3B8] mt-1">
                Tự động gửi yêu cầu quét các thay đổi mới nhất từ bảng tính Google Sheets và cập nhật ngay vào giao diện mà không cần tải lại trang.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                autoSyncEnabled ? 'bg-[#6D3EEB]' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  autoSyncEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Tần suất Polling */}
          <div className="p-4 bg-[#F9FAFB] dark:bg-[#0F172A] rounded-[14px] border border-[#F1F2F5] dark:border-[#334155] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[14.5px] text-[#111827] dark:text-[#F8FAFC]">
                Chu kỳ Quét định kỳ
              </span>
              <span className="text-[12.5px] font-bold text-[#6D3EEB]">
                {autoSyncInterval} giây
              </span>
            </div>
            <p className="text-[12.5px] text-[#6B7280] dark:text-[#94A3B8]">
              Thời gian giữa các lần quét kiểm tra dữ liệu thay đổi trên Google Sheets.
            </p>
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[
                { sec: 30, label: '30 giây' },
                { sec: 60, label: '60 giây (Chuẩn)' },
                { sec: 120, label: '2 phút' },
                { sec: 300, label: '5 phút' },
              ].map(opt => (
                <button
                  key={opt.sec}
                  type="button"
                  onClick={() => setAutoSyncInterval(opt.sec)}
                  className={`py-1.5 px-2 text-[12px] font-semibold rounded-[8px] border transition-all cursor-pointer ${
                    autoSyncInterval === opt.sec
                      ? 'bg-[#6D3EEB] text-white border-[#6D3EEB] shadow-xs'
                      : 'bg-white dark:bg-[#1E293B] text-[#4B5563] dark:text-[#CBD5E1] border-[#E5E7EB] dark:border-[#334155] hover:bg-gray-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feature List */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-[12px] bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 flex items-start gap-2.5">
            <Icon name="visibility" size={18} className="text-[#6D3EEB] shrink-0 mt-0.5" />
            <div className="text-[12px] text-[#4B5563] dark:text-[#CBD5E1]">
              <span className="font-bold text-[#111827] dark:text-[#F8FAFC] block">Smart Visibility:</span>
              Chỉ quét khi bạn đang xem trang web, không tiêu tốn tài nguyên khi ẩn tab.
            </div>
          </div>

          <div className="p-3 rounded-[12px] bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 flex items-start gap-2.5">
            <Icon name="bolt" size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-[12px] text-[#4B5563] dark:text-[#CBD5E1]">
              <span className="font-bold text-[#111827] dark:text-[#F8FAFC] block">Focus Auto-Sync:</span>
              Tự động kéo dữ liệu mới nhất khi bạn quay lại tab sau hơn 30 giây.
            </div>
          </div>

          <div className="p-3 rounded-[12px] bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 flex items-start gap-2.5">
            <Icon name="lock" size={18} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="text-[12px] text-[#4B5563] dark:text-[#CBD5E1]">
              <span className="font-bold text-[#111827] dark:text-[#F8FAFC] block">Non-blocking UI:</span>
              Cập nhật dữ liệu ngầm không làm gián đoạn form tạo mới hay thao tác của bạn.
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Thông tin Kết nối Google Sheets */}
      <div className="bg-white dark:bg-transparent rounded-[16px] p-5 sm:p-6 border border-[#F1F2F5] dark:border-[#334155] shadow-xs sm:shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F1F2F5] dark:border-[#334155]">
          <div className="flex items-center gap-2">
            <Icon name="table_chart" size={22} className="text-emerald-600" />
            <h4 className="text-[16px] font-bold text-[#111827] dark:text-[#F8FAFC]">
              Thông tin Cơ sở dữ liệu Google Sheets
            </h4>
          </div>
          <a
            href={spreadsheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] font-semibold text-[#6D3EEB] hover:text-[#5B2BD6] flex items-center gap-1 hover:underline"
          >
            <span>Mở Trang tính</span>
            <Icon name="open_in_new" size={15} />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13.5px]">
          <div className="p-3.5 bg-[#F9FAFB] dark:bg-[#0F172A] rounded-[12px] border border-[#F1F2F5] dark:border-[#334155]">
            <span className="text-[12px] font-semibold text-[#6B7280] dark:text-[#94A3B8] block mb-1">
              Google Spreadsheet ID:
            </span>
            <div className="flex items-center justify-between gap-2">
              <code className="text-[12.5px] font-mono text-[#111827] dark:text-[#F8FAFC] break-all select-all">
                {spreadsheetId}
              </code>
              <button
                type="button"
                onClick={handleCopyId}
                title="Sao chép ID"
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors shrink-0"
              >
                <Icon name={copiedId ? 'check' : 'content_copy'} size={16} className={copiedId ? 'text-emerald-600' : 'text-gray-500'} />
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-[#F9FAFB] dark:bg-[#0F172A] rounded-[12px] border border-[#F1F2F5] dark:border-[#334155]">
            <span className="text-[12px] font-semibold text-[#6B7280] dark:text-[#94A3B8] block mb-1">
              Phương thức Kết nối:
            </span>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0"></span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                Google Service Account API (v4)
              </span>
            </div>
            <span className="text-[11.5px] text-[#6B7280] dark:text-[#94A3B8] block mt-1">
              Xác thực qua Private Key & Google Cloud IAM, bảo mật 100%.
            </span>
          </div>
        </div>
      </div>

      {/* Card 3: Danh sách 14 Bảng dữ liệu Sheets */}
      <div className="bg-white dark:bg-transparent rounded-[16px] p-5 sm:p-6 border border-[#F1F2F5] dark:border-[#334155] shadow-xs sm:shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F1F2F5] dark:border-[#334155]">
          <div className="flex items-center gap-2">
            <Icon name="view_list" size={22} className="text-[#6D3EEB]" />
            <h4 className="text-[16px] font-bold text-[#111827] dark:text-[#F8FAFC]">
              Danh mục 14 Bảng Dữ liệu Đang Đồng bộ Live
            </h4>
          </div>
          <span className="text-[12px] font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800">
            14 / 14 Sheets Hoạt động
          </span>
        </div>

        <div className="overflow-x-auto rounded-[12px] border border-[#E5E7EB] dark:border-[#334155]">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#F9FAFB] dark:bg-[#0F172A] border-b border-[#E5E7EB] dark:border-[#334155] text-[#4B5563] dark:text-[#94A3B8] font-semibold">
              <tr>
                <th className="py-2.5 px-3.5">#</th>
                <th className="py-2.5 px-3.5">Tên Bảng (Sheet Tab)</th>
                <th className="py-2.5 px-3.5">Mô tả nghiệp vụ</th>
                <th className="py-2.5 px-3.5">Phân loại</th>
                <th className="py-2.5 px-3.5 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F2F5] dark:divide-[#334155]">
              {sheetsList.map((item, idx) => (
                <tr key={item.name} className="hover:bg-gray-50/70 dark:hover:bg-[#1E293B]/40 transition-colors">
                  <td className="py-2.5 px-3.5 text-[#6B7280] dark:text-[#94A3B8] font-mono text-[12px]">{idx + 1}</td>
                  <td className="py-2.5 px-3.5 font-bold font-mono text-[#111827] dark:text-[#F8FAFC]">
                    {item.name}
                  </td>
                  <td className="py-2.5 px-3.5 text-[#4B5563] dark:text-[#CBD5E1]">
                    {item.desc}
                  </td>
                  <td className="py-2.5 px-3.5">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {item.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5 text-right">
                    <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
