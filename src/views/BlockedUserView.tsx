import React from 'react';
import { Icon } from '../components/ui/Icon';
import { User } from '../context/AuthContext';

interface BlockedUserViewProps {
  user: User;
  onLogout: () => void;
}

export const BlockedUserView: React.FC<BlockedUserViewProps> = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#1E293B] rounded-[24px] border border-rose-200 dark:border-rose-900/50 shadow-2xl p-6 sm:p-8 space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/50 text-[#E11D48] flex items-center justify-center mx-auto shadow-inner">
          <Icon name="block" size={32} />
        </div>

        <div className="space-y-2">
          <h2 className="text-[20px] font-bold text-[#111827] dark:text-[#F8FAFC]">
            Tài khoản đã bị tạm khóa
          </h2>
          <p className="text-[13.5px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
            Tài khoản <span className="font-semibold text-gray-800 dark:text-gray-200">{user.email}</span> đã bị tạm dừng quyền truy cập vào LK ERP. Vui lòng liên hệ Quản trị viên để được hỗ trợ mở khóa.
          </p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-semibold rounded-[12px] shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Icon name="logout" size={18} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};
