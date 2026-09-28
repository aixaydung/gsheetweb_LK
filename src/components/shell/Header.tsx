import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '../ui/Icon';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenQuickCreate: () => void;
  onOpenSearch: () => void;
  onOpenAlerts: () => void;
  onOpenNotifications: () => void;
  unreadCount?: number;
  alertCount?: number;
  onNavigate?: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  onOpenQuickCreate,
  onOpenSearch,
  onOpenAlerts,
  onOpenNotifications,
  unreadCount = 2,
  alertCount = 6111,
  onNavigate,
}) => {
  const { theme, toggleTheme, syncStatus, lastSyncTime, triggerManualSync } = useApp();
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const displayName = user?.name || user?.email?.split('@')[0] || 'LK ERP';
  const displayEmail = user?.email || 'admin@lkerp.vn';
  const userInitials = (user?.name || user?.email || 'LK')
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi LK ERP?')) {
      logout();
    }
  };

  const handleMenuNavigate = (path: string) => {
    setIsUserMenuOpen(false);
    if (onNavigate) {
      onNavigate(path);
    }
  };
  return (
    <header className="h-[62px] sm:h-[66px] bg-white/95 backdrop-blur-md border-b border-[#F1F2F5] px-3.5 sm:px-8 flex items-center justify-between sticky top-0 z-30 transition-all shadow-xs">
      {/* Left: Mobile Logo & Hamburger / Desktop Search */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-1 max-w-[620px]">
        {/* Mobile Hamburger Drawer Button */}
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          aria-label="Mở menu điều hướng"
          className="w-10 h-10 -ml-1 text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB] active:bg-[#F3F4F6] rounded-[10px] flex items-center justify-center transition-colors lg:hidden shrink-0 touch-manipulation"
        >
          <Icon name="menu" size={24} />
        </button>

        {/* Mobile App Brand (Visible only on mobile lg:hidden) */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-7 h-7 rounded-[8px] bg-gradient-to-tr from-[#6D3EEB] to-[#9333EA] flex items-center justify-center text-white shadow-xs ring-1 ring-purple-100">
            <Icon name="layers" size={17} />
          </div>
          <span className="text-[17px] font-black text-[#6D3EEB] tracking-wider">
            LK ERP
          </span>
        </div>

        {/* Desktop Global Search Bar (Hidden on small mobile, visible on sm+) */}
        <div
          onClick={onOpenSearch}
          className="hidden sm:flex w-full max-w-[460px] h-[42px] px-3.5 bg-[#F9FAFB] hover:bg-[#F3F4F6] border border-[#E5E7EB] rounded-[12px] items-center justify-between text-[#9CA3AF] cursor-pointer transition-colors shadow-xs"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Icon name="search" size={18} className="text-[#9CA3AF] shrink-0" />
            <span className="text-[13.5px] truncate">Tìm kiếm toàn hệ thống...</span>
          </div>
          <kbd className="hidden md:inline-block px-2 py-0.5 text-[11px] font-semibold text-[#6B7280] bg-white border border-[#E5E7EB] rounded-md shadow-xs shrink-0">
            Ctrl+K
          </kbd>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Mobile Search Button (Shown only on small screens) */}
        <button
          type="button"
          onClick={onOpenSearch}
          aria-label="Tìm kiếm"
          className="sm:hidden w-9.5 h-9.5 rounded-[10px] hover:bg-[#F9FAFB] active:bg-[#F3F4F6] flex items-center justify-center text-[#4B5563] transition-colors touch-manipulation"
        >
          <Icon name="search" size={22} />
        </button>

        {/* Google Sheets Sync Status Indicator */}
        <div
          onClick={() => syncStatus !== 'syncing' && triggerManualSync()}
          title={
            syncStatus === 'synced'
              ? `Google Sheets: Đã đồng bộ ${lastSyncTime ? `(lúc ${lastSyncTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })})` : ''}. Nhấn để đồng bộ lại.`
              : syncStatus === 'syncing'
              ? 'Đang đồng bộ dữ liệu với Google Sheets...'
              : 'Lỗi kết nối Google Sheets. Nhấn để thử lại.'
          }
          className={`h-[36px] sm:h-[40px] px-2.5 sm:px-3 rounded-[10px] sm:rounded-[12px] flex items-center gap-1.5 sm:gap-2 text-[12px] sm:text-[13px] font-medium border transition-all cursor-pointer select-none ${
            syncStatus === 'synced'
              ? 'bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : syncStatus === 'syncing'
              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 animate-pulse'
              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
          }`}
        >
          {syncStatus === 'synced' && (
            <>
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="hidden md:inline font-semibold">Sheets:</span>
              <span className="hidden sm:inline">Đã đồng bộ</span>
              <Icon name="sync" size={14} className="text-emerald-600 opacity-60 hover:opacity-100 transition-opacity ml-0.5" />
            </>
          )}
          {syncStatus === 'syncing' && (
            <>
              <Icon name="sync" size={15} className="animate-spin text-amber-600" />
              <span className="font-medium text-amber-800 dark:text-amber-300">Đang đồng bộ...</span>
            </>
          )}
          {syncStatus === 'error' && (
            <>
              <Icon name="warning" size={15} className="text-rose-600" />
              <span className="hidden sm:inline font-semibold">Lỗi Sheets</span>
              <span className="text-[11px] underline">Thử lại</span>
            </>
          )}
        </div>

        {/* Desktop "+ Tạo nhanh" Button (Hidden on small mobile because bottom bar has floating action button) */}
        <button
          type="button"
          onClick={onOpenQuickCreate}
          className="hidden sm:flex h-[42px] px-4 bg-[#6D3EEB] hover:bg-[#5B2BD6] text-white text-[14px] font-semibold rounded-[12px] shadow-[0_8px_20px_-6px_rgba(109,62,235,0.55)] items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-95"
        >
          <Icon name="add" size={20} />
          <span>Tạo nhanh</span>
        </button>

        {/* Theme Toggle Button (Light / Dark) */}
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
          aria-label="Đổi chế độ sáng tối"
          className="w-9.5 h-9.5 sm:w-10 sm:h-10 rounded-[10px] sm:rounded-[12px] hover:bg-[#F9FAFB] active:bg-[#F3F4F6] flex items-center justify-center text-[#6B7280] hover:text-[#111827] transition-colors touch-manipulation cursor-pointer"
        >
          <Icon
            name={theme === 'dark' ? 'light_mode' : 'dark_mode'}
            size={22}
            className={theme === 'dark' ? 'text-amber-400' : 'text-[#6B7280]'}
          />
        </button>

        {/* Alerts (Warning icon with count badge) */}
        <button
          type="button"
          onClick={onOpenAlerts}
          title="Cảnh báo cần xử lý"
          className="relative w-9.5 h-9.5 sm:w-10 sm:h-10 rounded-[10px] sm:rounded-[12px] hover:bg-[#F9FAFB] active:bg-[#F3F4F6] flex items-center justify-center text-[#F59E0B] transition-colors touch-manipulation"
        >
          <Icon name="warning" size={22} />
          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-[#E11D48] text-white text-[10px] sm:text-[10.5px] font-bold px-1.5 py-0.2 rounded-full min-w-[18px] sm:min-w-[20px] text-center shadow-xs">
              {alertCount > 999 ? '999+' : alertCount}
            </span>
          )}
        </button>

        {/* Notifications (Bell with red dot) */}
        <button
          type="button"
          onClick={onOpenNotifications}
          title="Thông báo"
          className="relative w-9.5 h-9.5 sm:w-10 sm:h-10 rounded-[10px] sm:rounded-[12px] hover:bg-[#F9FAFB] active:bg-[#F3F4F6] flex items-center justify-center text-[#6B7280] hover:text-[#111827] transition-colors touch-manipulation"
        >
          <Icon name="notifications" size={22} />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#E11D48] ring-2 ring-white" />
          )}
        </button>

        {/* User Account Avatar & Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(prev => !prev)}
            title={`Tài khoản: ${displayName}`}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-[#6D3EEB] to-[#9333EA] text-white font-bold text-[12.5px] sm:text-[13px] flex items-center justify-center shadow-xs ring-2 ring-purple-100 hover:ring-[#6D3EEB] transition-all cursor-pointer select-none"
          >
            {userInitials}
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1E293B] rounded-[16px] border border-[#E5E7EB] dark:border-[#334155] shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* User info banner */}
              <div className="px-4 py-3 border-b border-[#F1F2F5] dark:border-[#334155]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6D3EEB] to-[#9333EA] text-white font-bold text-[14px] flex items-center justify-center shadow-xs shrink-0">
                    {userInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-bold text-[#111827] dark:text-[#F8FAFC] truncate">
                      {displayName}
                    </p>
                    <p className="text-[12px] text-[#6B7280] dark:text-[#94A3B8] truncate">
                      {displayEmail}
                    </p>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center gap-1.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#ECFDF5] text-[#059669] dark:bg-emerald-950/60 dark:text-emerald-400">
                    {user?.role === 'admin' ? 'Quản trị viên (Admin)' : 'Người dùng hệ thống'}
                  </span>
                </div>
              </div>

              {/* Navigation links */}
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => handleMenuNavigate('/ho-so')}
                  className="w-full px-4 py-2 text-left text-[13.5px] text-[#374151] dark:text-[#CBD5E1] hover:bg-[#F9FAFB] dark:hover:bg-slate-700/60 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Icon name="person" size={18} className="text-[#6B7280] dark:text-[#94A3B8]" />
                  <span>Hồ sơ cá nhân</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleMenuNavigate('/cai-dat')}
                  className="w-full px-4 py-2 text-left text-[13.5px] text-[#374151] dark:text-[#CBD5E1] hover:bg-[#F9FAFB] dark:hover:bg-slate-700/60 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Icon name="settings" size={18} className="text-[#6B7280] dark:text-[#94A3B8]" />
                  <span>Cài đặt hệ thống</span>
                </button>
              </div>

              {/* Logout Action */}
              <div className="pt-1 border-t border-[#F1F2F5] dark:border-[#334155]">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-[13.5px] font-medium text-[#E11D48] hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Icon name="logout" size={18} className="text-[#E11D48]" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
