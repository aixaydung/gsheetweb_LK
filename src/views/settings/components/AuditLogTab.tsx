import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { Icon } from '../../../components/ui/Icon';
import { formatDateTime, formatCurrency } from '../../../lib/format';
import { exportToExcelFile, ExportColumn } from '../../../lib/excelExport';
import { ActivityLog } from '../../../types';

const ACTION_MAP: Record<string, { label: string; color: string; border: string; bg: string }> = {
  create: {
    label: 'Tạo mới',
    color: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-300 dark:border-emerald-800/50',
    bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
  },
  update: {
    label: 'Cập nhật',
    color: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-300 dark:border-blue-800/50',
    bg: 'bg-blue-50/50 dark:bg-blue-950/20',
  },
  status_change: {
    label: 'Trạng thái',
    color: 'text-indigo-700 dark:text-indigo-400',
    border: 'border-indigo-300 dark:border-indigo-800/50',
    bg: 'bg-indigo-50/50 dark:bg-indigo-950/20',
  },
  pay: {
    label: 'Thanh toán',
    color: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-300 dark:border-purple-800/50',
    bg: 'bg-purple-50/50 dark:bg-purple-950/20',
  },
  cancel: {
    label: 'Hủy bỏ',
    color: 'text-amber-800 dark:text-amber-400',
    border: 'border-amber-300 dark:border-amber-800/50',
    bg: 'bg-amber-50/50 dark:bg-amber-950/20',
  },
  delete: {
    label: 'Xóa',
    color: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-300 dark:border-rose-800/50',
    bg: 'bg-rose-50/50 dark:bg-rose-950/20',
  },
  import: {
    label: 'Nhập Excel',
    color: 'text-teal-700 dark:text-teal-400',
    border: 'border-teal-300 dark:border-teal-800/50',
    bg: 'bg-teal-50/50 dark:bg-teal-950/20',
  },
};

export const AuditLogTab: React.FC = () => {
  const { activityLogs } = useApp();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filteredLogs = useMemo(() => {
    return activityLogs.filter(log => {
      const matchAction = actionFilter === 'all' || log.action === actionFilter;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        (log.user_name && log.user_name.toLowerCase().includes(q)) ||
        (log.user_email && log.user_email.toLowerCase().includes(q)) ||
        (log.title && log.title.toLowerCase().includes(q)) ||
        (log.entity_code && log.entity_code.toLowerCase().includes(q)) ||
        (log.details && log.details.toLowerCase().includes(q)) ||
        (log.ip && log.ip.includes(q)) ||
        (log.action && log.action.toLowerCase().includes(q));

      return matchAction && matchSearch;
    });
  }, [activityLogs, search, actionFilter]);

  const handleExport = () => {
    const columns: ExportColumn<any>[] = [
      { key: 'occurred_at', header: 'Thời gian', format: (val: any) => formatDateTime(val) },
      { key: 'user_name', header: 'Người thực hiện', format: (val: any) => val || 'Admin' },
      { key: 'user_email', header: 'Email', format: (val: any) => val || 'admin@lkerp.vn' },
      { key: 'action', header: 'Loại thao tác', format: (val: any) => ACTION_MAP[val]?.label || val },
      { key: 'entity_code', header: 'Mã đối tượng' },
      { key: 'entity_type', header: 'Phân hệ' },
      { key: 'title', header: 'Nội dung chi tiết' },
      { key: 'details', header: 'Ghi chú bổ sung', format: (val: any) => val || '—' },
      { key: 'amount', header: 'Giá trị (VNĐ)', format: (val: any) => (val ? formatCurrency(val) : '—') },
      { key: 'ip', header: 'Địa chỉ IP', format: (val: any) => val || '192.168.1.100' },
    ];

    exportToExcelFile(filteredLogs, columns, 'Nhat_ky_he_thong_AuditTrail');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-[#F1F2F5] dark:border-[#334155]">
        <div>
          <h3 className="text-[17px] sm:text-[20px] font-bold text-[#111827] dark:text-[#F8FAFC]">
            Nhật ký Hệ thống (Audit Trail)
          </h3>
          <p className="text-[12.5px] sm:text-[14.5px] text-[#4B5563] dark:text-[#94A3B8] mt-0.5">
            Ghi vết tự động tất cả giao dịch, đơn hàng, thanh toán, nhập xuất kho và cập nhật cấu hình theo thời gian thực
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="w-full sm:w-auto h-10 px-4 bg-transparent border border-gray-300 dark:border-[#334155] hover:bg-gray-50/50 dark:hover:bg-slate-800/30 text-[#374151] dark:text-[#CBD5E1] text-[13.5px] sm:text-[14px] font-semibold rounded-[12px] flex items-center justify-center gap-2 transition-colors shrink-0 cursor-pointer"
        >
          <Icon name="download" size={18} />
          <span>Xuất Excel ({filteredLogs.length})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3 bg-transparent p-3 sm:p-3.5 rounded-[16px] border border-[#F1F2F5] dark:border-[#334155] shadow-xs">
        <div className="relative flex-1">
          <Icon name="search" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Tìm theo người thực hiện, mã chứng từ, tiêu đề, IP..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-3.5 bg-transparent border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[13.5px] text-[#111827] dark:text-[#F8FAFC] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#6D3EEB]"
          />
        </div>

        {/* Action Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="h-10 px-3 bg-transparent border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[13px] text-[#111827] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6D3EEB]"
          >
            <option value="all">Tất cả thao tác</option>
            <option value="create">Tạo mới</option>
            <option value="update">Cập nhật</option>
            <option value="status_change">Trạng thái</option>
            <option value="pay">Thanh toán</option>
            <option value="cancel">Hủy bỏ</option>
            <option value="delete">Xóa</option>
            <option value="import">Nhập Excel</option>
          </select>

          <span className="text-[12.5px] sm:text-[13.5px] text-[#4B5563] dark:text-[#94A3B8] shrink-0">
            Hiển thị <strong className="text-[#111827] dark:text-white">{filteredLogs.length}</strong> / {activityLogs.length} bản ghi
          </span>
        </div>
      </div>

      {/* Logs: Empty state */}
      {filteredLogs.length === 0 && (
        <div className="text-center py-12 border border-dashed border-gray-200 dark:border-slate-800 rounded-xl bg-transparent">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-gray-400">
            <Icon name="search" size={24} />
          </div>
          <p className="text-[14px] font-semibold text-gray-700 dark:text-gray-300">Không tìm thấy nhật ký thao tác phù hợp</p>
          <p className="text-[12.5px] text-gray-500 mt-1">Vui lòng thử tìm từ khóa khác hoặc xóa bộ lọc thao tác</p>
        </div>
      )}

      {/* Logs: Mobile Cards (< sm) */}
      <div className="sm:hidden space-y-3">
        {filteredLogs.map(l => {
          const badge = ACTION_MAP[l.action] || {
            label: l.action,
            color: 'text-gray-700 dark:text-gray-300',
            border: 'border-gray-300 dark:border-gray-700',
            bg: 'bg-gray-50/50 dark:bg-slate-800/30',
          };
          return (
            <div
              key={l.id}
              className="bg-transparent rounded-[16px] border border-[#E5E7EB] dark:border-[#334155] p-3.5 shadow-xs space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11.5px] text-[#6B7280] dark:text-[#94A3B8]">
                  {formatDateTime(l.occurred_at)}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.color} ${badge.border} ${badge.bg}`}
                >
                  {badge.label}
                </span>
              </div>

              <div>
                <div className="text-[13.5px] font-bold text-[#111827] dark:text-[#F8FAFC]">
                  {l.title}
                </div>
                {l.details && (
                  <div className="text-[12px] text-[#4B5563] dark:text-[#CBD5E1] mt-0.5">
                    {l.details}
                  </div>
                )}
                {l.amount !== undefined && l.amount > 0 && (
                  <div className="text-[12px] font-mono font-semibold text-[#6D3EEB] dark:text-[#A78BFA] mt-1">
                    Giá trị: {formatCurrency(l.amount)}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[#F1F2F5] dark:border-[#334155] flex items-center justify-between text-[12px] text-[#6B7280] dark:text-[#94A3B8]">
                <div className="flex items-center gap-1.5 truncate">
                  <Icon name="person" size={15} className="text-[#6D3EEB] dark:text-[#C084FC] shrink-0" />
                  <span className="font-medium text-[#111827] dark:text-[#F8FAFC] truncate">
                    {l.user_name || 'Admin Hệ Thống'}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-[#9CA3AF] shrink-0">IP: {l.ip || '192.168.1.100'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Logs: Desktop Table (sm+) */}
      {filteredLogs.length > 0 && (
        <div className="hidden sm:block bg-transparent rounded-[16px] border border-[#E5E7EB] dark:border-[#334155] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13.5px] min-w-[760px]">
              <thead className="bg-transparent text-[#4B5563] dark:text-[#94A3B8] text-[12px] uppercase font-semibold border-b border-[#E5E7EB] dark:border-[#334155]">
                <tr>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Người thực hiện</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                  <th className="py-3 px-4">Mã CT / Phân hệ</th>
                  <th className="py-3 px-4">Chi tiết nghiệp vụ</th>
                  <th className="py-3 px-4 text-right">Số tiền</th>
                  <th className="py-3 px-4 font-mono text-center">Địa chỉ IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F2F5] dark:divide-[#334155]">
                {filteredLogs.map(l => {
                  const badge = ACTION_MAP[l.action] || {
                    label: l.action,
                    color: 'text-gray-700 dark:text-gray-300',
                    border: 'border-gray-300 dark:border-gray-700',
                    bg: 'bg-gray-50/50 dark:bg-slate-800/30',
                  };
                  return (
                    <tr key={l.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-[#4B5563] dark:text-[#CBD5E1] text-[12.5px] whitespace-nowrap">
                        {formatDateTime(l.occurred_at)}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#111827] dark:text-[#F8FAFC]">
                        <div>
                          <span>{l.user_name || 'Admin Hệ Thống'}</span>
                          <span className="text-[11.5px] text-[#6317D6] dark:text-[#C084FC] block font-normal">
                            {l.user_email || 'admin@lkerp.vn'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.color} ${badge.border} ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-semibold text-[#111827] dark:text-[#F8FAFC] text-[12.5px]">
                          {l.entity_code || '—'}
                        </span>
                        <span className="block text-[11px] text-[#6B7280] dark:text-[#94A3B8]">
                          {l.entity_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#374151] dark:text-[#CBD5E1] max-w-md">
                        <div className="font-medium text-[#111827] dark:text-[#F8FAFC] text-[13px]">{l.title}</div>
                        {l.details && (
                          <div className="text-[12px] text-[#6B7280] dark:text-[#94A3B8] mt-0.5 line-clamp-2">
                            {l.details}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-[#111827] dark:text-[#F8FAFC] whitespace-nowrap">
                        {l.amount !== undefined && l.amount > 0 ? (
                          <span className="text-[#6D3EEB] dark:text-[#A78BFA]">{formatCurrency(l.amount)}</span>
                        ) : (
                          <span className="text-gray-400 font-normal">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-center text-[#6B7280] dark:text-[#94A3B8] text-[12px] whitespace-nowrap">
                        {l.ip || '192.168.1.100'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
