import React, { useState, useEffect } from 'react';
import { Icon } from '../../../components/ui/Icon';
import { useAuth } from '../../../context/AuthContext';

interface LiveUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'pending' | 'blocked';
  last_login_at?: string;
  created_at?: string;
  auth_provider?: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Quản trị viên (Admin)',
  accountant: 'Kế toán trưởng',
  warehouse: 'Thủ kho',
  sales: 'Nhân viên Sale',
  user: 'Người dùng (Chờ phân quyền)',
};

const ROLE_BADGE_STYLES: Record<string, string> = {
  admin: 'bg-purple-100 text-[#6D3EEB] dark:bg-purple-950/60 dark:text-[#C084FC] border-purple-200 dark:border-purple-800/60',
  accountant: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
  warehouse: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
  sales: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
  user: 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300 border-gray-200 dark:border-slate-700',
};

export const UsersPermissionsTab: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<LiveUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'matrix'>('users');
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    user: LiveUser | null;
    selectedRole: string;
    selectedStatus: 'active' | 'pending' | 'blocked';
  }>({
    isOpen: false,
    user: null,
    selectedRole: 'sales',
    selectedStatus: 'active',
  });
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Optimistic UI Handler: Updates UI instantly, sends background request to Google Sheets
  const handleSaveRole = async () => {
    if (!actionModal.user) return;
    const targetUserId = actionModal.user.id;
    const newRole = actionModal.selectedRole;
    const newStatus = actionModal.selectedStatus;

    // Snapshot for rollback in case of error
    const previousUsers = [...users];

    // 1. Optimistic Update (Immediate UI response)
    setUsers(prev =>
      prev.map(u =>
        u.id === targetUserId
          ? { ...u, role: newRole, status: newStatus }
          : u
      )
    );
    setActionModal({ isOpen: false, user: null, selectedRole: 'sales', selectedStatus: 'active' });
    showToast(`Đã duyệt & cập nhật quyền tài khoản! Đang đồng bộ Google Sheets...`);

    // 2. Background Sync
    try {
      const res = await fetch(`/api/auth/users/${targetUserId}/update-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole, status: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Máy chủ phản hồi lỗi');
      }
      showToast('Đã lưu thành công vào bảng tính Google Sheets!', 'success');
    } catch (error: any) {
      // 3. Rollback on failure
      setUsers(previousUsers);
      showToast(`Không thể lưu vào Google Sheets (${error.message}). Đã hoàn tác!`, 'error');
    }
  };

  const handleOpenApproveModal = (targetUser: LiveUser) => {
    setActionModal({
      isOpen: true,
      user: targetUser,
      selectedRole: targetUser.role === 'user' ? 'sales' : targetUser.role,
      selectedStatus: 'active',
    });
  };

  const handleToggleBlock = async (targetUser: LiveUser) => {
    const nextStatus = targetUser.status === 'blocked' ? 'active' : 'blocked';
    const actionName = nextStatus === 'blocked' ? 'khóa' : 'mở khóa';

    if (!confirm(`Bạn có chắc chắn muốn ${actionName} tài khoản ${targetUser.email}?`)) {
      return;
    }

    const previousUsers = [...users];
    // Optimistic Update
    setUsers(prev =>
      prev.map(u => (u.id === targetUser.id ? { ...u, status: nextStatus } : u))
    );
    showToast(`Đã ${actionName} tài khoản! Đang đồng bộ...`);

    try {
      const res = await fetch(`/api/auth/users/${targetUser.id}/update-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error('Failed to update');
      showToast(`Đã đồng bộ trạng thái ${actionName} vào Google Sheets!`);
    } catch {
      setUsers(previousUsers);
      showToast(`Lỗi khi ${actionName} tài khoản. Đã hoàn tác!`, 'error');
    }
  };

  const pendingCount = users.filter(u => u.status === 'pending').length;

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
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-[12px] shadow-lg flex items-center gap-2.5 text-[13.5px] font-semibold transition-all animate-in slide-in-from-top ${
            toastMessage.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          <Icon name={toastMessage.type === 'success' ? 'check_circle' : 'error'} size={18} />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-[#F1F2F5] dark:border-[#334155]">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-[17px] sm:text-[20px] font-bold text-[#111827] dark:text-[#F8FAFC]">
              Tài khoản & Phân quyền Google Workspace
            </h3>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse">
                {pendingCount} chờ duyệt
              </span>
            )}
          </div>
          <p className="text-[12.5px] sm:text-[14.5px] text-[#4B5563] dark:text-[#94A3B8] mt-0.5">
            Quản lý tài khoản đăng nhập Google, phê duyệt quyền truy cập và phân vai trò ERP (RBAC)
          </p>
        </div>

        <button
          type="button"
          onClick={fetchUsers}
          className="w-full sm:w-auto h-10 px-4 bg-[#F3EBFE] hover:bg-[#E9D5FF] dark:bg-purple-950/40 dark:hover:bg-purple-900/50 text-[#6D3EEB] dark:text-[#C084FC] text-[13px] sm:text-[14px] font-semibold rounded-[12px] flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
        >
          <Icon name="refresh" size={17} className={isLoading ? 'animate-spin' : ''} />
          <span>Làm mới danh sách</span>
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
          {pendingCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
          )}
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
          <span>Ma trận quyền hạn chi tiết (RBAC)</span>
        </button>
      </div>

      {/* SUB-TAB 1: USERS LIST */}
      {activeSubTab === 'users' ? (
        <div>
          {isLoading && users.length === 0 ? (
            <div className="p-8 text-center text-[#64748B] dark:text-[#94A3B8]">
              <Icon name="sync" size={24} className="animate-spin mx-auto mb-2 text-[#6D3EEB]" />
              <p className="text-[14px]">Đang tải dữ liệu tài khoản từ Google Sheets...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-[#64748B] dark:text-[#94A3B8] border border-dashed rounded-[16px]">
              Chưa có tài khoản nào được lưu trên Google Sheets.
            </div>
          ) : (
            <div className="space-y-3">
              {/* Desktop Table */}
              <div className="hidden sm:block rounded-[16px] border border-[#E5E7EB] dark:border-[#334155] shadow-xs overflow-hidden">
                <table className="w-full text-left text-[14px]">
                  <thead className="bg-gray-50/70 dark:bg-slate-800/40 text-[#4B5563] dark:text-[#94A3B8] text-[12.5px] uppercase font-semibold border-b border-[#E5E7EB] dark:border-[#334155]">
                    <tr>
                      <th className="py-3 px-4">Tài khoản & Tên</th>
                      <th className="py-3 px-4">Email Google</th>
                      <th className="py-3 px-4">Vai trò nghiệp vụ</th>
                      <th className="py-3 px-4">Trạng thái phê duyệt</th>
                      <th className="py-3 px-4 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F2F5] dark:divide-[#334155]">
                    {users.map(u => {
                      const isPending = u.status === 'pending';
                      const isBlocked = u.status === 'blocked';
                      const roleLabel = ROLE_LABELS[u.role] || u.role;
                      const badgeStyle = ROLE_BADGE_STYLES[u.role] || ROLE_BADGE_STYLES.user;

                      return (
                        <tr
                          key={u.id}
                          className={`transition-colors ${
                            isPending
                              ? 'bg-amber-50/30 dark:bg-amber-950/10'
                              : 'hover:bg-gray-50/50 dark:hover:bg-slate-800/30'
                          }`}
                        >
                          <td className="py-3.5 px-4 font-bold text-[#111827] dark:text-[#F8FAFC]">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6D3EEB] to-[#A855F7] text-white flex items-center justify-center font-bold text-[12px] shadow-xs shrink-0">
                                {(u.name || u.email || 'U').slice(0, 1).toUpperCase()}
                              </div>
                              <div>
                                <span className="whitespace-nowrap">{u.name || 'Người dùng'}</span>
                                {currentUser?.email === u.email && (
                                  <span className="ml-1.5 text-[11px] px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950/50 text-[#6D3EEB] dark:text-[#C084FC]">
                                    (Bạn)
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-[#4B5563] dark:text-[#CBD5E1] font-mono text-[13px] whitespace-nowrap">
                            {u.email}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-[11.5px] font-bold border ${badgeStyle}`}>
                              {roleLabel}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {isPending ? (
                              <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400 text-[12.5px] font-bold bg-amber-100/70 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/50">
                                <Icon name="hourglass_empty" size={14} />
                                Chờ duyệt
                              </span>
                            ) : isBlocked ? (
                              <span className="inline-flex items-center gap-1.5 text-rose-700 dark:text-rose-400 text-[12.5px] font-semibold bg-rose-100/70 dark:bg-rose-950/40 px-2.5 py-0.5 rounded-full">
                                <Icon name="block" size={14} />
                                Đã tạm khóa
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-[12.5px] font-semibold">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                Đã duyệt (Active)
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              {isPending ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenApproveModal(u)}
                                  className="px-3 py-1 bg-[#6D3EEB] hover:bg-[#5B2BD6] text-white text-[12.5px] font-semibold rounded-[8px] flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                                >
                                  <Icon name="check" size={15} />
                                  <span>Duyệt quyền</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenApproveModal(u)}
                                  className="text-[#6D3EEB] dark:text-[#C084FC] hover:underline font-semibold text-[13px] cursor-pointer"
                                >
                                  Đổi quyền
                                </button>
                              )}

                              {currentUser?.email !== u.email && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleBlock(u)}
                                  title={isBlocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                                  className="p-1 rounded-[6px] text-gray-400 hover:text-[#E11D48] hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                >
                                  <Icon name={isBlocked ? 'lock_open' : 'block'} size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="sm:hidden space-y-3">
                {users.map(u => {
                  const isPending = u.status === 'pending';
                  const isBlocked = u.status === 'blocked';
                  const roleLabel = ROLE_LABELS[u.role] || u.role;

                  return (
                    <div
                      key={u.id}
                      className={`rounded-[16px] border p-4 space-y-3 ${
                        isPending
                          ? 'border-amber-300 dark:border-amber-800 bg-amber-50/20'
                          : 'border-[#E5E7EB] dark:border-[#334155]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-[14.5px] font-bold text-[#111827] dark:text-[#F8FAFC] truncate">
                            {u.name || 'Người dùng'}
                          </div>
                          <div className="text-[12px] text-[#64748B] dark:text-[#94A3B8] font-mono truncate">
                            {u.email}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold border shrink-0">
                          {roleLabel}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-slate-800">
                        <div>
                          {isPending ? (
                            <span className="text-amber-700 dark:text-amber-400 text-[12px] font-bold">
                              Chờ phê duyệt
                            </span>
                          ) : isBlocked ? (
                            <span className="text-rose-600 text-[12px] font-medium">Đã tạm khóa</span>
                          ) : (
                            <span className="text-emerald-600 text-[12px] font-medium">Đang hoạt động</span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenApproveModal(u)}
                          className="px-3 py-1 bg-[#6D3EEB] text-white text-[12px] font-semibold rounded-[8px]"
                        >
                          {isPending ? 'Duyệt quyền' : 'Đổi vai trò'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* SUB-TAB 2: MATRIX */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-[15px] sm:text-[16px] font-bold text-[#111827] dark:text-[#F8FAFC]">
              Ma trận phân quyền theo vai trò chức vụ
            </h4>
            <span className="text-[12px] text-[#6B7280] dark:text-[#94A3B8] hidden sm:inline">
              Chuẩn RBAC Enterprise
            </span>
          </div>

          <div className="hidden sm:block rounded-[16px] border border-[#E5E7EB] dark:border-[#334155] shadow-xs p-5 space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[14px] min-w-[650px]">
                <thead className="text-[#4B5563] dark:text-[#94A3B8] uppercase font-semibold border-b border-[#E5E7EB] dark:border-[#334155] text-[12.5px]">
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
                      <td className="p-3.5 text-center font-bold text-[#6317D6] dark:text-[#C084FC]">
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

      {/* APPROVE & ROLE SELECTION MODAL */}
      {actionModal.isOpen && actionModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setActionModal({ isOpen: false, user: null, selectedRole: 'sales', selectedStatus: 'active' })}
          />

          <div className="relative w-full max-w-md bg-white dark:bg-[#1E293B] rounded-[24px] border border-[#E2E8F0] dark:border-[#334155] shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F2F5] dark:border-[#334155]">
              <div className="flex items-center gap-2">
                <Icon name="verified_user" size={20} className="text-[#6D3EEB]" />
                <h3 className="text-[17px] font-bold text-[#111827] dark:text-[#F8FAFC]">
                  Phê duyệt & Phân vai trò
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActionModal({ isOpen: false, user: null, selectedRole: 'sales', selectedStatus: 'active' })}
                className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center justify-center text-gray-500"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-[12px] space-y-1">
              <div className="text-[14px] font-bold text-[#111827] dark:text-[#F8FAFC]">
                {actionModal.user.name || 'Người dùng'}
              </div>
              <div className="text-[12.5px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                {actionModal.user.email}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[13.5px] font-bold text-[#374151] dark:text-[#CBD5E1]">
                Chọn vai trò truy cập (Role):
              </label>

              <div className="space-y-2">
                {[
                  { id: 'admin', label: 'Quản trị viên (Admin)', desc: 'Toàn quyền cấu hình, duyệt tài khoản, xem tất cả báo cáo' },
                  { id: 'sales', label: 'Nhân viên Sale (Kinh doanh)', desc: 'Tạo báo giá, hóa đơn bán, quản lý khách hàng' },
                  { id: 'warehouse', label: 'Thủ kho', desc: 'Nhập xuất tồn, kiểm kê, theo dõi hàng hóa' },
                  { id: 'accountant', label: 'Kế toán', desc: 'Quản lý công nợ, thu chi, duyệt sổ sách' },
                ].map(item => (
                  <label
                    key={item.id}
                    className={`flex items-start gap-3 p-3 rounded-[12px] border cursor-pointer transition-all ${
                      actionModal.selectedRole === item.id
                        ? 'border-[#6D3EEB] bg-purple-50/50 dark:bg-purple-950/30'
                        : 'border-[#E5E7EB] dark:border-[#334155] hover:bg-gray-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="userRole"
                      value={item.id}
                      checked={actionModal.selectedRole === item.id}
                      onChange={() => setActionModal(prev => ({ ...prev, selectedRole: item.id }))}
                      className="mt-0.5 text-[#6D3EEB] focus:ring-[#6D3EEB]"
                    />
                    <div>
                      <div className="text-[13.5px] font-bold text-[#111827] dark:text-[#F8FAFC]">
                        {item.label}
                      </div>
                      <div className="text-[11.5px] text-[#64748B] dark:text-[#94A3B8] leading-tight mt-0.5">
                        {item.desc}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#F1F2F5] dark:border-[#334155]">
              <button
                type="button"
                onClick={() => setActionModal({ isOpen: false, user: null, selectedRole: 'sales', selectedStatus: 'active' })}
                className="px-4 py-2 text-[13.5px] font-medium text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-[10px]"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveRole}
                className="px-5 py-2 bg-[#6D3EEB] hover:bg-[#5B2BD6] text-white text-[13.5px] font-semibold rounded-[10px] shadow-sm cursor-pointer"
              >
                Xác nhận & Cấp quyền
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
