import React from 'react';
import { Icon } from '../ui/Icon';

interface MobileBottomNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenQuickCreate: () => void;
  onOpenMobileMenu?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentPath,
  onNavigate,
  onOpenQuickCreate,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Tổng quan',
      icon: 'dashboard',
      path: '/',
      isActive: currentPath === '/',
    },
    {
      id: 'sales',
      label: 'Bán hàng',
      icon: 'sell',
      path: '/ban-hang',
      isActive: currentPath.startsWith('/ban-hang'),
    },
    // Center Quick Create Button will be rendered here
    {
      id: 'warehouse',
      label: 'Kho hàng',
      icon: 'inventory_2',
      path: '/kho-hang',
      isActive: currentPath.startsWith('/kho-hang'),
    },
    {
      id: 'settings',
      label: 'Cài đặt',
      icon: 'settings',
      path: '/cai-dat',
      isActive: currentPath.startsWith('/cai-dat'),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-[#F1F2F5] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 pt-1 pb-[max(env(safe-area-inset-bottom),8px)]">
      <div className="flex items-center justify-around relative max-w-lg mx-auto">
        {/* Item 1: Tổng quan */}
        <button
          type="button"
          onClick={() => onNavigate(navItems[0].path)}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all touch-manipulation active:scale-95 ${
            navItems[0].isActive
              ? 'text-[#6317D6]'
              : 'text-[#6B7280] hover:text-[#111827]'
          }`}
        >
          <div className="relative">
            <Icon
              name={navItems[0].icon}
              size={22}
              className={navItems[0].isActive ? 'text-[#6D3EEB]' : 'text-[#6B7280]'}
            />
            {navItems[0].isActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#6D3EEB]" />
            )}
          </div>
          <span
            className={`text-[11px] mt-0.5 tracking-tight ${
              navItems[0].isActive ? 'font-bold' : 'font-medium'
            }`}
          >
            {navItems[0].label}
          </span>
        </button>

        {/* Item 2: Bán hàng */}
        <button
          type="button"
          onClick={() => onNavigate(navItems[1].path)}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all touch-manipulation active:scale-95 ${
            navItems[1].isActive
              ? 'text-[#6317D6]'
              : 'text-[#6B7280] hover:text-[#111827]'
          }`}
        >
          <div className="relative">
            <Icon
              name={navItems[1].icon}
              size={22}
              className={navItems[1].isActive ? 'text-[#6D3EEB]' : 'text-[#6B7280]'}
            />
            {navItems[1].isActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#6D3EEB]" />
            )}
          </div>
          <span
            className={`text-[11px] mt-0.5 tracking-tight ${
              navItems[1].isActive ? 'font-bold' : 'font-medium'
            }`}
          >
            {navItems[1].label}
          </span>
        </button>

        {/* Center: Raised Floating Action Button (+ Tạo nhanh) */}
        <div className="flex flex-col items-center justify-center px-1 -mt-5">
          <button
            type="button"
            onClick={onOpenQuickCreate}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#6D3EEB] via-[#7C3AED] to-[#8B5CF6] text-white flex items-center justify-center shadow-[0_6px_20px_rgba(109,62,235,0.45)] ring-4 ring-white active:scale-90 transition-transform touch-manipulation"
            aria-label="Tạo nhanh chứng từ"
          >
            <Icon name="add" size={26} className="text-white font-bold" />
          </button>
          <span className="text-[10px] font-bold text-[#6D3EEB] mt-1">Tạo nhanh</span>
        </div>

        {/* Item 3: Kho hàng */}
        <button
          type="button"
          onClick={() => onNavigate(navItems[2].path)}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all touch-manipulation active:scale-95 ${
            navItems[2].isActive
              ? 'text-[#6317D6]'
              : 'text-[#6B7280] hover:text-[#111827]'
          }`}
        >
          <div className="relative">
            <Icon
              name={navItems[2].icon}
              size={22}
              className={navItems[2].isActive ? 'text-[#6D3EEB]' : 'text-[#6B7280]'}
            />
            {navItems[2].isActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#6D3EEB]" />
            )}
          </div>
          <span
            className={`text-[11px] mt-0.5 tracking-tight ${
              navItems[2].isActive ? 'font-bold' : 'font-medium'
            }`}
          >
            {navItems[2].label}
          </span>
        </button>

        {/* Item 4: Cài đặt */}
        <button
          type="button"
          onClick={() => onNavigate(navItems[3].path)}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all touch-manipulation active:scale-95 ${
            navItems[3].isActive
              ? 'text-[#6317D6]'
              : 'text-[#6B7280] hover:text-[#111827]'
          }`}
        >
          <div className="relative">
            <Icon
              name={navItems[3].icon}
              size={22}
              className={navItems[3].isActive ? 'text-[#6D3EEB]' : 'text-[#6B7280]'}
            />
            {navItems[3].isActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#6D3EEB]" />
            )}
          </div>
          <span
            className={`text-[11px] mt-0.5 tracking-tight ${
              navItems[3].isActive ? 'font-bold' : 'font-medium'
            }`}
          >
            {navItems[3].label}
          </span>
        </button>
      </div>
    </nav>
  );
};
