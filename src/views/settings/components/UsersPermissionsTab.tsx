import React, { useState } from 'react';
import { Icon } from '../../../components/ui/Icon';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'Quản trị viên' | 'Giám đốc' | 'Kế toán trưởng' | 'Thủ kho' | 'Nhân viên Sale';
  phone: string;
  status: 'active' | 'inactive';
  lastActive: string;
}

const INITIAL_USERS: SystemUser[] = [
  { id: 'U001', name: 'Nguyễn Văn Quản Trị', email: 'admin@lkerm.vn', role: 'Quản trị viên', phone: '0988 123 456', status: 'active', lastActive: 'Vừa xong' },
  { id: 'U002', name: 'Trần Thị Thu Thảo', email: 'ketoan@lkerm.vn', role: 'Kế toán trưởng', phone: '0912 345 678', status: 'active', lastActive: '15 phút trước' },
  { id: 'U003', name: 'Phạm Minh Kho', email: 'thukho@lkerm.vn', role: 'Thủ kho', phone: '0977 888 999', status: 'active', lastActive: '1 giờ trước' },
  { id: 'U004', name: 'Lê Hoàng Bán Hàng', email: 'sales@lkerm.vn', role: 'Nhân viên Sale', phone: '0933 222 111', status: 'active', lastActive: 'Hôm nay 08:30' },
];

export const UsersPermissionsTab: React.FC = () => {
  const [users] = useState<SystemUser[]>(INITIAL_USERS);
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'matrix'>('users');

  const matrixData = [
    {
      module: 'Bán hàng (Hóa đơn, Báo giá)',
      icon: 'sell',
      admin: 'Toàn quyền',
      keToan: 'Tạo, Sửa, In',
      kho: 'Chỉ xem',
      sale: 'Tạo đơn của mình',
    },
    {
      module: 'Mua hàng & Quản lý NCC',
      icon: 'shopping_cart',
      admin: 'Toàn quyền',
      keToan: 'Toàn quyền',
      kho: 'Chỉ xem',
      sale: 'Không được xem',
    },
    {
      module: 'Kho hàng (Nhập, Xuất, Kiểm kê)',
      icon: 'warehouse',
      admin: 'Toàn quyền',
      keToan: 'Chỉ xem số liệu',
      kho: 'Toàn quyền kho',
      sale: 'Xem tồn kho',
    },
    {
      module: 'Công nợ & Thu chi tiền',
      icon: 'account_balance_wallet',
      admin: 'Toàn quyền',
      keToan: 'Toàn quyền',
      kho: 'Không được xem',
      sale: 'Xem nợ khách mình',
    },
    {
      module: 'Báo cáo Doanh thu & Lãi lỗ',
      icon: 'bar_chart',
      admin: 'Toàn quyền',
      keToan: 'Toàn quyền',
      kho: 'Không được xem',
      sale: 'Xem KPI cá nhân',
    },
    {
      module: 'Cài đặt hệ thống & Khóa sổ',
      icon: 'settings_suggest',
      admin: 'Toàn quyền',
      keToan: 'Khóa sổ kỳ',
      kho: 'Không được xem',
      sale: 'Không được xem',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-[#F1F2F5] dark:border-[#334155]">
        <div>
          <h3 className="text-[17px] sm:text-[20px] font-bold text-[#111827] dark:text-[#F8FAFC]">
            Tài khoản & Phân quyền (RBAC)
          </h3>
          <p className="text-[12.5px] sm:text-[14.5px] text-[#4B5563] dark:text-[#94A3B8] mt-0.5">
            Phân định quyền hạn truy cập xem, thêm, sửa, xóa chứng từ theo từng vai trò nhân sự
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('Chức năng thêm tài khoản nhân viên mới đã sẵn sàng.')}
          className="w-full sm:w-auto h-10 px-4 sm:px-5 bg-[#6D3EEB] hover:bg-[#5B2BD6] text-white text-[13.5px] sm:text-[14.5px] font-semibold rounded-[12px] shadow-sm flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
        >
          <Icon name="person_add" size={18} />
          <span>Thêm nhân viên</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] dark:border-[#334155]">
        <button
          type="button"
          onClick={() => setActiveSubTab('users')}
          className={`pb-2.5 sm:pb-3 px-2.5 sm:px-3.5 text-[13px] sm:text-[14.5px] font-semibold flex items-center gap-1.5 sm:gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'users'
              ? 'border-[#6D3EEB] text-[#6317D6] dark:text-[#C084FC]'
              : 'border-transparent text-[#4B5563] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-[#F8FAFC]'
          }`}
        >
          <Icon name="group" size={19} />
          <span>Danh sách tài khoản ({users.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('matrix')}
          className={`pb-2.5 sm:pb-3 px-2.5 sm:px-3.5 text-[13px] sm:text-[14.5px] font-semibold flex items-center gap-1.5 sm:gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'matrix'
              ? 'border-[#6D3EEB] text-[#6317D6] dark:text-[#C084FC]'
              : 'border-transparent text-[#4B5563] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-[#F8FAFC]'
          }`}
        >
          <Icon name="grid_view" size={19} />
          <span>Ma trận quyền hạn chi tiết</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* SUB-TAB 1: USERS LIST                                     */}
      {/* ========================================================= */}
      {activeSubTab === 'users' ? (
        <div>
          {/* Mobile View (< sm): Sleek, touch-friendly User Cards */}
          <div className="sm:hidden space-y-3">
            {users.map(u => (
              <div
                key={u.id}
                className="bg-transparent rounded-[16px] border border-[#E5E7EB] dark:border-[#334155] p-4 shadow-xs space-y-3"
              >
                {/* Header: Avatar, Name & Role Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-transparent border border-purple-300 dark:border-purple-800/60 text-[#6D3EEB] dark:text-[#C084FC] flex items-center justify-center font-bold text-[14px] shrink-0">
                      {u.name.slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[14.5px] font-bold text-[#111827] dark:text-[#F8FAFC] leading-snug">
                        {u.name}
                      </div>
                      <div className="text-[11.5px] text-[#6B7280] dark:text-[#94A3B8] flex items-center gap-1.5 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                        <span>Đang hoạt động &bull; {u.lastActive}</span>
                      </div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-transparent text-[#6317D6] dark:text-[#C084FC] border border-purple-300 dark:border-purple-800/50 shrink-0">
                    {u.role}
                  </span>
                </div>

                {/* Info Rows: Email & Phone */}
                <div className="bg-transparent rounded-[12px] p-2.5 space-y-1.5 text-[12.5px] border border-[#F1F2F5] dark:border-[#334155]">
                  <div className="flex items-center gap-2 text-[#4B5563] dark:text-[#CBD5E1]">
                    <Icon name="mail" size={15} className="text-[#9CA3AF] shrink-0" />
                    <span className="font-mono truncate">{u.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#4B5563] dark:text-[#CBD5E1]">
                    <Icon name="phone" size={15} className="text-[#9CA3AF] shrink-0" />
                    <a href={`tel:${u.phone.replace(/\s+/g, '')}`} className="hover:text-[#6D3EEB] font-medium">
                      {u.phone}
                    </a>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="flex items-center justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => alert(`Chỉnh sửa quyền tài khoản: ${u.name}`)}
                    className="h-8.5 px-3 bg-transparent border border-purple-300 dark:border-purple-800/50 hover:bg-[#6D3EEB] text-[#6317D6] dark:text-[#C084FC] hover:text-white rounded-[10px] text-[12.5px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Icon name="tune" size={15} />
                    <span>Sửa phân quyền</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View (sm+): Full Wide Responsive Table */}
          <div className="hidden sm:block bg-transparent rounded-[16px] border border-[#E5E7EB] dark:border-[#334155] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[14px] min-w-[700px]">
                <thead className="bg-transparent text-[#4B5563] dark:text-[#94A3B8] text-[12.5px] uppercase font-semibold border-b border-[#E5E7EB] dark:border-[#334155]">
                  <tr>
                    <th className="py-3 px-4">Họ và tên</th>
                    <th className="py-3 px-4">Email đăng nhập</th>
                    <th className="py-3 px-4">Số điện thoại</th>
                    <th className="py-3 px-4">Vai trò / Chức vụ</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4">Đăng nhập gần nhất</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F2F5] dark:divide-[#334155]">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#111827] dark:text-[#F8FAFC]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-transparent border border-purple-300 dark:border-purple-800/60 text-[#6D3EEB] dark:text-[#C084FC] flex items-center justify-center font-bold text-[13px] shrink-0">
                            {u.name.slice(0, 1)}
                          </div>
                          <span className="whitespace-nowrap">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#4B5563] dark:text-[#CBD5E1] font-mono text-[13.5px] whitespace-nowrap">
                        {u.email}
                      </td>
                      <td className="py-3.5 px-4 text-[#4B5563] dark:text-[#CBD5E1] whitespace-nowrap">
                        {u.phone}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-3 py-1 rounded-full text-[12px] font-bold bg-transparent text-[#6317D6] dark:text-[#C084FC] border border-purple-300 dark:border-purple-800/50">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-[13px] font-semibold">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                          Đang hoạt động
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#6B7280] dark:text-[#94A3B8] text-[13px] whitespace-nowrap">
                        {u.lastActive}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => alert(`Chỉnh sửa quyền tài khoản: ${u.name}`)}
                          className="text-[#6D3EEB] dark:text-[#C084FC] hover:underline font-semibold text-[13px] cursor-pointer"
                        >
                          Sửa quyền
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================= */
        /* SUB-TAB 2: ROLE-BASED ACCESS CONTROL MATRIX (RBAC)        */
        /* ========================================================= */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-[15px] sm:text-[16px] font-bold text-[#111827] dark:text-[#F8FAFC]">
              Ma trận phân quyền theo vai trò chức vụ
            </h4>
            <span className="text-[12px] text-[#6B7280] dark:text-[#94A3B8] hidden sm:inline">
              Chuẩn RBAC Enterprise
            </span>
          </div>

          {/* Mobile View (< sm): Modular Role Cards per Module */}
          <div className="sm:hidden space-y-3">
            {matrixData.map((row, i) => (
              <div
                key={i}
                className="bg-transparent rounded-[16px] border border-[#E5E7EB] dark:border-[#334155] p-3.5 shadow-xs space-y-2.5"
              >
                <div className="flex items-center gap-2 pb-2 border-b border-[#F1F2F5] dark:border-[#334155]">
                  <div className="w-7 h-7 rounded-lg bg-transparent border border-purple-300 dark:border-purple-800/50 text-[#6D3EEB] dark:text-[#C084FC] flex items-center justify-center shrink-0">
                    <Icon name={row.icon} size={16} />
                  </div>
                  <span className="text-[13.5px] font-bold text-[#111827] dark:text-[#F8FAFC] leading-snug">
                    {row.module}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  {/* Admin */}
                  <div className="p-2 rounded-[10px] bg-transparent border border-purple-300 dark:border-purple-900/50">
                    <div className="text-[10.5px] font-bold uppercase text-[#6D3EEB] dark:text-[#C084FC]">
                      Quản trị viên
                    </div>
                    <div className="font-bold text-[#111827] dark:text-white mt-0.5">
                      {row.admin}
                    </div>
                  </div>

                  {/* Kế toán */}
                  <div className="p-2 rounded-[10px] bg-transparent border border-gray-200 dark:border-[#334155]">
                    <div className="text-[10.5px] font-semibold text-[#6B7280] dark:text-[#94A3B8]">
                      Kế toán
                    </div>
                    <div className="font-medium text-[#374151] dark:text-[#CBD5E1] mt-0.5">
                      {row.keToan}
                    </div>
                  </div>

                  {/* Thủ kho */}
                  <div className="p-2 rounded-[10px] bg-transparent border border-gray-200 dark:border-[#334155]">
                    <div className="text-[10.5px] font-semibold text-[#6B7280] dark:text-[#94A3B8]">
                      Thủ kho
                    </div>
                    <div className="font-medium text-[#374151] dark:text-[#CBD5E1] mt-0.5">
                      {row.kho}
                    </div>
                  </div>

                  {/* Sale */}
                  <div className="p-2 rounded-[10px] bg-transparent border border-gray-200 dark:border-[#334155]">
                    <div className="text-[10.5px] font-semibold text-[#6B7280] dark:text-[#94A3B8]">
                      Nhân viên Sale
                    </div>
                    <div className="font-medium text-[#374151] dark:text-[#CBD5E1] mt-0.5">
                      {row.sale}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View (sm+): Matrix Table */}
          <div className="hidden sm:block bg-transparent rounded-[16px] border border-[#E5E7EB] dark:border-[#334155] shadow-xs p-5 space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[14px] min-w-[650px]">
                <thead className="bg-transparent text-[#4B5563] dark:text-[#94A3B8] uppercase font-semibold border-b border-[#E5E7EB] dark:border-[#334155] text-[12.5px]">
                  <tr>
                    <th className="p-3.5">Phân hệ nghiệp vụ</th>
                    <th className="p-3.5 text-center">Quản trị viên</th>
                    <th className="p-3.5 text-center">Kế toán</th>
                    <th className="p-3.5 text-center">Thủ kho</th>
                    <th className="p-3.5 text-center">Nhân viên Sale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F2F5] dark:divide-[#334155]">
                  {matrixData.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-semibold text-[#111827] dark:text-[#F8FAFC] flex items-center gap-2">
                        <Icon name={row.icon} size={18} className="text-[#6D3EEB] dark:text-[#C084FC]" />
                        <span>{row.module}</span>
                      </td>
                      <td className="p-3.5 text-center font-bold text-[#6317D6] dark:text-[#C084FC] bg-transparent">
                        {row.admin}
                      </td>
                      <td className="p-3.5 text-center font-medium text-[#374151] dark:text-[#CBD5E1]">
                        {row.keToan}
                      </td>
                      <td className="p-3.5 text-center font-medium text-[#374151] dark:text-[#CBD5E1]">
                        {row.kho}
                      </td>
                      <td className="p-3.5 text-center font-medium text-[#374151] dark:text-[#CBD5E1]">
                        {row.sale}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
