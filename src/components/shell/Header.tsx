import React from 'react';
import { Icon } from '../ui/Icon';
import { useApp } from '../../context/AppContext';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenQuickCreate: () => void;
  onOpenSearch: () => void;
  onOpenAlerts: () => void;
  onOpenNotifications: () => void;
  unreadCount?: number;
  alertCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  onOpenQuickCreate,
  onOpenSearch,
  onOpenAlerts,
  onOpenNotifications,
  unreadCount = 2,
  alertCount = 6111,
}) => {
  const { theme, toggleTheme } = useApp();
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
      </div>
    </header>
  );
};
