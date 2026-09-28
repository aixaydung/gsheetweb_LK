import React, { useState } from 'react';
import { Icon } from '../components/ui/Icon';
import { User } from '../context/AuthContext';

interface PendingApprovalViewProps {
  user: User;
  onRefresh: () => Promise<void>;
  onLogout: () => void;
}

export const PendingApprovalView: React.FC<PendingApprovalViewProps> = ({
  user,
  onRefresh,
  onLogout,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshedMessage, setRefreshedMessage] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshedMessage(null);
    try {
      await onRefresh();
      setRefreshedMessage('Đã kiểm tra lại trạng thái. Tài khoản vẫn đang chờ duyệt.');
    } catch {
      setRefreshedMessage('Không thể kết nối máy chủ. Vui lòng thử lại sau.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const userInitials = (user.name || user.email || 'LK')
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] dark:from-[#0F172A] dark:via-[#1E293B] dark:to-[#0F172A] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#1E293B] rounded-[24px] border border-[#E2E8F0] dark:border-[#334155] shadow-2xl p-6 sm:p-8 space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Logo */}
        <div className="inline-flex items-center gap-2.5 mx-auto">
          <div className="w-10 h-10 rounded-[12px] bg-gradient-to-tr from-[#6D3EEB] to-[#9333EA] flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <Icon name="layers" size={24} />
          </div>
          <span className="text-[22px] font-black text-[#6D3EEB] dark:text-[#C084FC] tracking-wider">
            LK ERP
          </span>
        </div>

        {/* Status Graphic */}
        <div className="relative w-20 h-20 mx-auto">
          <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-500 shadow-inner">
            <Icon name="hourglass_empty" size={38} className="animate-pulse" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#6D3EEB] text-white flex items-center justify-center text-[11px] font-bold ring-2 ring-white dark:ring-[#1E293B]">
            SSO
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h2 className="text-[20px] sm:text-[22px] font-bold text-[#111827] dark:text-[#F8FAFC]">
            Tài khoản đang chờ duyệt
          </h2>
          <p className="text-[13.5px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
            Hệ thống đã xác thực thành công qua Google. Bạn cần được Quản trị viên (Admin) phê duyệt và cấp quyền truy cập các phân hệ nghiệp vụ.
          </p>
        </div>

        {/* User Badge Info Box */}
        <div className="p-3.5 bg-gray-50 dark:bg-slate-800/60 rounded-[14px] border border-gray-150 dark:border-slate-700/60 flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6D3EEB] to-[#A855F7] text-white font-bold text-[13px] flex items-center justify-center shrink-0 shadow-xs">
            {userInitials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-semibold text-[#111827] dark:text-[#F8FAFC] truncate">
              {user.name || 'Người dùng Google'}
            </div>
            <div className="text-[12px] text-[#64748B] dark:text-[#94A3B8] truncate">
              {user.email}
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 shrink-0">
            Chờ duyệt
          </span>
        </div>

        {refreshedMessage && (
          <div className="p-2.5 rounded-[10px] text-[12.5px] font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
            {refreshedMessage}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full h-11 bg-[#6D3EEB] hover:bg-[#5B2BD6] text-white text-[14px] font-semibold rounded-[12px] shadow-md shadow-purple-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 active:scale-98"
          >
            <Icon name="refresh" size={19} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Đang kiểm tra...' : 'Kiểm tra lại trạng thái'}</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="w-full h-10 bg-transparent hover:bg-rose-50 dark:hover:bg-rose-950/30 text-[#E11D48] text-[13.5px] font-medium rounded-[12px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Icon name="logout" size={17} />
            <span>Đăng xuất tài khoản</span>
          </button>
        </div>

        <p className="text-[11.5px] text-[#94A3B8] dark:text-[#64748B]">
          Nếu cần hỗ trợ gấp, vui lòng liên hệ Admin qua email quản trị hệ thống.
        </p>
      </div>
    </div>
  );
};
