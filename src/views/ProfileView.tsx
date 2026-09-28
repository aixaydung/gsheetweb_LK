import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Icon } from '../components/ui/Icon';
import { useAuth } from '../context/AuthContext';

export const ProfileView: React.FC = () => {
  const { user, logout } = useAuth();

  const displayName = user?.name || user?.email?.split('@')[0] || 'Quản trị viên LK ERP';
  const displayEmail = user?.email || 'admin@lkerp.vn';
  const userInitials = (user?.name || user?.email || 'LK')
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi LK ERP?')) {
      logout();
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Hồ sơ cá nhân"
        subtitle="Quản lý tài khoản người dùng, phân quyền và phiên làm việc"
      />

      <div className="bg-white dark:bg-[#1E293B] rounded-[20px] p-6 sm:p-7 border border-[#F1F2F5] dark:border-[#334155] shadow-xs sm:shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#6D3EEB] to-[#A855F7] flex items-center justify-center text-white text-2xl font-bold shadow-md shrink-0">
              {userInitials}
            </div>
            <div>
              <h3 className="text-[19px] font-bold text-[#111827] dark:text-[#F8FAFC]">{displayName}</h3>
              <p className="text-[13.5px] text-[#6B7280] dark:text-[#94A3B8]">{displayEmail}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="inline-block text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] dark:bg-emerald-950/50 text-[#059669] dark:text-emerald-400">
                  Vai trò: {user?.role === 'admin' ? 'Quản trị cấp cao (Admin)' : 'Người dùng hệ thống'}
                </span>
                <span className="inline-block text-[11.5px] font-medium px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-[#6D3EEB] dark:text-[#C084FC]">
                  Google SSO
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="self-start sm:self-auto px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-[#E11D48] dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 text-[13.5px] font-semibold rounded-[12px] flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
          >
            <Icon name="logout" size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>

        <div className="space-y-3 pt-4 border-t border-[#F1F2F5] dark:border-[#334155] text-[13.5px]">
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800">
            <span className="text-[#6B7280] dark:text-[#94A3B8]">Hệ thống:</span>
            <span className="font-semibold text-[#111827] dark:text-[#F8FAFC]">LK ERP v2.0 Enterprise</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800">
            <span className="text-[#6B7280] dark:text-[#94A3B8]">ID tài khoản:</span>
            <span className="font-mono text-[12.5px] text-[#4B5563] dark:text-[#CBD5E1]">{user?.id || 'lk-admin-01'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800">
            <span className="text-[#6B7280] dark:text-[#94A3B8]">Phương thức đăng nhập:</span>
            <span className="font-medium text-[#111827] dark:text-[#F8FAFC]">Google Workspace / Gmail</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800">
            <span className="text-[#6B7280] dark:text-[#94A3B8]">Ngôn ngữ:</span>
            <span className="font-medium text-[#111827] dark:text-[#F8FAFC]">Tiếng Việt (100%)</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800">
            <span className="text-[#6B7280] dark:text-[#94A3B8]">Tiền tệ mặc định:</span>
            <span className="font-medium text-[#111827] dark:text-[#F8FAFC]">Việt Nam Đồng (VND - đ)</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800">
            <span className="text-[#6B7280] dark:text-[#94A3B8]">Múi giờ:</span>
            <span className="font-medium text-[#111827] dark:text-[#F8FAFC]">Asia/Ho_Chi_Minh (GMT+7)</span>
          </div>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={handleLogout}
            className="px-5 py-2.5 bg-[#E11D48] hover:bg-[#BE123C] text-white text-[14px] font-semibold rounded-[12px] flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Icon name="logout" size={18} />
            <span>Đăng xuất phiên làm việc</span>
          </button>
        </div>
      </div>
    </div>
  );
};
