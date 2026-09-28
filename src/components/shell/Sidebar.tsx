import { Icon } from '../ui/Icon';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  recentTabs: { module: string; tab: string; label: string; url: string }[];
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  recentTabs,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { theme, toggleTheme } = useApp();
  const { user, logout } = useAuth();

  const displayName = user?.name || user?.email?.split('@')[0] || 'LK ERP';
  const displayEmail = user?.email || (user?.role === 'admin' ? 'Quản trị viên' : 'Hồ sơ cá nhân');
  const userInitials = (user?.name || user?.email || 'LK')
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi LK ERP?')) {
      logout();
    }
  };
  const menuItems = [
    { label: 'Tổng quan', path: '/', icon: 'space_dashboard' },
    { label: 'Bán hàng', path: '/ban-hang', icon: 'sell' },
    { label: 'Mua hàng', path: '/mua-hang', icon: 'shopping_cart' },
    { label: 'Kho hàng', path: '/kho-hang', icon: 'inventory_2' },
    { label: 'Công nợ', path: '/cong-no', icon: 'account_balance_wallet' },
    { label: 'Báo cáo', path: '/bao-cao', icon: 'bar_chart' },
  ];

  const handleItemClick = (path: string) => {
    onNavigate(path);
    if (onCloseMobile) onCloseMobile();
  };

  const isActive = (itemPath: string) => {
    if (itemPath === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(itemPath);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[280px] lg:w-[240px] bg-white border-r border-[#F1F2F5] flex flex-col justify-between transition-transform duration-200 shadow-xl lg:shadow-none lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top: Logo & Main Navigation */}
        <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar">
          {/* Logo Header */}
          <div className="h-[62px] sm:h-[66px] px-5 flex items-center justify-between border-b border-[#F1F2F5] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8.5 h-8.5 rounded-[10px] bg-gradient-to-tr from-[#6D3EEB] via-[#7C3AED] to-[#9333EA] flex items-center justify-center text-white shadow-sm ring-2 ring-purple-100">
                <Icon name="layers" size={20} />
              </div>
              <div>
                <div className="text-[19px] font-black text-[#6D3EEB] tracking-wider leading-none">
                  LK ERP
                </div>
                <div className="text-[11px] text-[#6B7280] font-normal mt-0.5">
                  Quản trị doanh nghiệp
                </div>
              </div>
            </div>

            {/* Mobile close button */}
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg active:scale-95 transition-all"
              >
                <Icon name="close" size={20} />
              </button>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="p-3 space-y-1">
            {menuItems.map(item => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleItemClick(item.path)}
                  className={`w-full h-10 px-3 rounded-[12px] flex items-center justify-between text-[14.5px] transition-all relative ${
                    active
                      ? 'bg-[#F3EBFE] text-[#6317D6] font-semibold'
                      : 'text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#111827] font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      name={item.icon}
                      size={20}
                      className={active ? 'text-[#6D3EEB]' : 'text-[#6B7280]'}
                    />
                    <span>{item.label}</span>
                  </div>

                  {/* Active 3px right indicator bar */}
                  {active && (
                    <span className="absolute right-0 top-2 bottom-2 w-[3px] bg-[#6D3EEB] rounded-l" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Recent Tabs (MỞ GẦN ĐÂY) */}
          {recentTabs.length > 0 && (
            <div className="mt-3 px-3 pt-3 border-t border-[#F1F2F5]">
              <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider px-3 block mb-1.5">
                MỞ GẦN ĐÂY
              </span>
              <div className="space-y-1">
                {recentTabs.map((rt, idx) => {
                  const currentFullUrl = window.location.pathname + window.location.search;
                  const isRecentActive = currentFullUrl === rt.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleItemClick(rt.url)}
                      className={`w-full h-10 px-3 rounded-[12px] flex items-center justify-between text-[14.5px] transition-all relative ${
                        isRecentActive
                          ? 'bg-[#F3EBFE] text-[#6317D6] font-semibold'
                          : 'text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#111827] font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <Icon
                          name="history"
                          size={20}
                          className={`shrink-0 ${
                            isRecentActive ? 'text-[#6D3EEB]' : 'text-[#6B7280]'
                          }`}
                        />
                        <span className="truncate">{rt.label}</span>
                      </div>

                      {isRecentActive && (
                        <span className="absolute right-0 top-2 bottom-2 w-[3px] bg-[#6D3EEB] rounded-l" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom: Settings, Theme & User Profile */}
        <div className="p-3 border-t border-[#F1F2F5] shrink-0 space-y-1">
          {/* Theme Mode Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full h-10 px-3 rounded-[12px] flex items-center justify-between text-[14.5px] transition-all text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#111827] font-medium cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Icon
                name={theme === 'dark' ? 'light_mode' : 'dark_mode'}
                size={20}
                className={theme === 'dark' ? 'text-amber-400' : 'text-[#6B7280]'}
              />
              <span>{theme === 'dark' ? 'Giao diện tối' : 'Giao diện sáng'}</span>
            </div>
            <span className="text-[11.5px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {theme === 'dark' ? 'Tối' : 'Sáng'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleItemClick('/cai-dat')}
            className={`w-full h-10 px-3 rounded-[12px] flex items-center justify-between text-[14.5px] transition-all relative ${
              currentPath === '/cai-dat'
                ? 'bg-[#F3EBFE] text-[#6317D6] font-semibold'
                : 'text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#111827] font-medium'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon
                name="settings"
                size={20}
                className={currentPath === '/cai-dat' ? 'text-[#6D3EEB]' : 'text-[#6B7280]'}
              />
              <span>Cài đặt</span>
            </div>
            {currentPath === '/cai-dat' && (
              <span className="absolute right-0 top-2 bottom-2 w-[3px] bg-[#6D3EEB] rounded-l" />
            )}
          </button>

          {/* User Profile Card with quick logout */}
          <div className="w-full p-2 rounded-[12px] bg-gray-50/80 dark:bg-[#1E293B] hover:bg-gray-100/90 dark:hover:bg-slate-700/60 border border-[#E5E7EB] dark:border-[#334155] flex items-center justify-between transition-colors shadow-2xs">
            <button
              type="button"
              onClick={() => handleItemClick('/ho-so')}
              className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer group"
              title="Xem hồ sơ cá nhân"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6D3EEB] to-[#A855F7] flex items-center justify-center text-white font-bold text-[12px] shadow-xs shrink-0">
                {userInitials}
              </div>
              <div className="overflow-hidden min-w-0 pr-1">
                <div className="text-[13px] font-semibold text-[#111827] dark:text-[#F8FAFC] truncate leading-tight group-hover:text-[#6D3EEB] dark:group-hover:text-[#C084FC] transition-colors">
                  {displayName}
                </div>
                <div className="text-[11px] text-[#6B7280] dark:text-[#94A3B8] truncate leading-none mt-0.5">
                  {displayEmail}
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              title="Đăng xuất khỏi hệ thống"
              aria-label="Đăng xuất"
              className="w-8 h-8 rounded-[8px] text-[#9CA3AF] hover:text-[#E11D48] hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            >
              <Icon name="logout" size={17} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
