import React, { useState } from 'react';
import { Icon } from '../../../components/ui/Icon';

interface AuditItem {
  id: string;
  time: string;
  user: string;
  role: string;
  action: string;
  target: string;
  ip: string;
  status: 'success' | 'warning' | 'info';
}

const SAMPLE_LOGS: AuditItem[] = [
  { id: 'LOG-001', time: '27/09/2026 12:40:15', user: 'Nguyễn Văn Quản Trị', role: 'Admin', action: 'Cập nhật cài đặt', target: 'Cấu hình VietQR và thông tin doanh nghiệp', ip: '113.190.23.41', status: 'success' },
  { id: 'LOG-002', time: '27/09/2026 12:15:30', user: 'Trần Thị Thu Thảo', role: 'Kế toán', action: 'Tạo phiếu thu tiền', target: 'PT260927005 thu tiền khách Shop Mộc Nhiên (1.000.000 đ)', ip: '118.70.12.89', status: 'success' },
  { id: 'LOG-003', time: '27/09/2026 11:45:10', user: 'Phạm Minh Kho', role: 'Thủ kho', action: 'Nhập kho hàng', target: 'Phiếu nhập NK260927004 từ NCC Nhựa Đông Á', ip: '118.70.12.90', status: 'success' },
  { id: 'LOG-004', time: '27/09/2026 10:20:00', user: 'Lê Hoàng Bán Hàng', role: 'Sale', action: 'Lập hóa đơn', target: 'Hóa đơn HD260927003 cho khách hàng xe10', ip: '14.162.80.12', status: 'success' },
  { id: 'LOG-005', time: '27/09/2026 09:12:44', user: 'Nguyễn Văn Quản Trị', role: 'Admin', action: 'Xuất dữ liệu Excel', target: 'Xuất file sodebt_20260927_0912.xlsx', ip: '113.190.23.41', status: 'info' },
  { id: 'LOG-006', time: '26/09/2026 17:30:00', user: 'Trần Thị Thu Thảo', role: 'Kế toán', action: 'Khóa sổ kỳ kế toán', target: 'Khóa toàn bộ chứng từ phát sinh trước 31/08/2026', ip: '118.70.12.89', status: 'warning' },
];

export const AuditLogTab: React.FC = () => {
  const [logs] = useState<AuditItem[]>(SAMPLE_LOGS);
  const [search, setSearch] = useState('');

  const filtered = logs.filter(l =>
    l.user.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.target.toLowerCase().includes(search.toLowerCase()) ||
    l.ip.includes(search)
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-[#F1F2F5] dark:border-[#334155]">
        <div>
          <h3 className="text-[17px] sm:text-[20px] font-bold text-[#111827] dark:text-[#F8FAFC]">
            Nhật ký Hệ thống (Audit Trail)
          </h3>
          <p className="text-[12.5px] sm:text-[14.5px] text-[#4B5563] dark:text-[#94A3B8] mt-0.5">
            Theo dõi vết lịch sử các thao tác quan trọng để đảm bảo tính minh bạch và an toàn dữ liệu
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('Đang xuất nhật ký hệ thống ra file CSV...')}
          className="w-full sm:w-auto h-10 px-4 bg-transparent border border-gray-300 dark:border-[#334155] hover:bg-gray-50/50 dark:hover:bg-slate-800/30 text-[#374151] dark:text-[#CBD5E1] text-[13.5px] sm:text-[14px] font-semibold rounded-[12px] flex items-center justify-center gap-2 transition-colors shrink-0 cursor-pointer"
        >
          <Icon name="download" size={18} />
          <span>Xuất Log</span>
        </button>
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 bg-transparent p-3 sm:p-3.5 rounded-[16px] border border-[#F1F2F5] dark:border-[#334155] shadow-xs">
        <div className="relative flex-1">
          <Icon name="search" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Tìm theo người thực hiện, hành động, số chứng từ, IP..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-3.5 bg-transparent border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[13.5px] text-[#111827] dark:text-[#F8FAFC] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#6D3EEB]"
          />
        </div>
        <span className="text-[12.5px] sm:text-[14px] text-[#4B5563] dark:text-[#94A3B8] shrink-0 text-right sm:text-left">
          Hiển thị <strong className="text-[#111827] dark:text-white">{filtered.length}</strong> bản ghi
        </span>
      </div>

      {/* Logs: Mobile Cards (< sm) */}
      <div className="sm:hidden space-y-3">
        {filtered.map(l => (
          <div
            key={l.id}
            className="bg-transparent rounded-[16px] border border-[#E5E7EB] dark:border-[#334155] p-3.5 shadow-xs space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[11.5px] text-[#6B7280] dark:text-[#94A3B8]">
                {l.time}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-transparent ${
                  l.status === 'success'
                    ? 'text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/50'
                    : l.status === 'warning'
                    ? 'text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800/50'
                    : 'text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800/50'
                }`}
              >
                {l.status === 'success' ? 'Thành công' : l.status === 'warning' ? 'Cảnh báo' : 'Thông tin'}
              </span>
            </div>

            <div>
              <div className="text-[13.5px] font-bold text-[#111827] dark:text-[#F8FAFC]">
                {l.action}
              </div>
              <div className="text-[12.5px] text-[#4B5563] dark:text-[#CBD5E1] mt-0.5">
                {l.target}
              </div>
            </div>

            <div className="pt-2 border-t border-[#F1F2F5] dark:border-[#334155] flex items-center justify-between text-[12px] text-[#6B7280] dark:text-[#94A3B8]">
              <div className="flex items-center gap-1.5">
                <Icon name="person" size={15} className="text-[#6D3EEB] dark:text-[#C084FC]" />
                <span className="font-medium text-[#111827] dark:text-[#F8FAFC]">{l.user}</span>
                <span className="text-[#9CA3AF]">({l.role})</span>
              </div>
              <span className="font-mono text-[11px] text-[#9CA3AF]">IP: {l.ip}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Logs: Desktop Table (sm+) */}
      <div className="hidden sm:block bg-transparent rounded-[16px] border border-[#E5E7EB] dark:border-[#334155] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px] min-w-[700px]">
            <thead className="bg-transparent text-[#4B5563] dark:text-[#94A3B8] text-[12.5px] uppercase font-semibold border-b border-[#E5E7EB] dark:border-[#334155]">
              <tr>
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4">Người thực hiện</th>
                <th className="py-3 px-4">Hành động</th>
                <th className="py-3 px-4">Đối tượng chi tiết</th>
                <th className="py-3 px-4 font-mono">Địa chỉ IP</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F2F5] dark:divide-[#334155]">
              {filtered.map(l => (
                <tr key={l.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-mono text-[#4B5563] dark:text-[#CBD5E1] text-[13px] whitespace-nowrap">{l.time}</td>
                  <td className="py-3 px-4 font-bold text-[#111827] dark:text-[#F8FAFC]">
                    <div>
                      <span>{l.user}</span>
                      <span className="text-[12px] text-[#6317D6] dark:text-[#C084FC] block font-normal">{l.role}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#111827] dark:text-[#F8FAFC]">{l.action}</td>
                  <td className="py-3 px-4 text-[#374151] dark:text-[#CBD5E1] max-w-sm">{l.target}</td>
                  <td className="py-3 px-4 font-mono text-[#6B7280] dark:text-[#94A3B8] text-[13px]">{l.ip}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[11.5px] font-bold bg-transparent ${
                        l.status === 'success'
                          ? 'text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/50'
                          : l.status === 'warning'
                          ? 'text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800/50'
                          : 'text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800/50'
                      }`}
                    >
                      {l.status === 'success' ? 'Thành công' : l.status === 'warning' ? 'Cảnh báo' : 'Thông tin'}
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
