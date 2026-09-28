import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Icon } from '../components/ui/Icon';
import { SETTING_GROUPS } from './settings/settingsData';

// Tab components
import { CompanyGeneralTab } from './settings/components/CompanyGeneralTab';
import { BranchesWarehousesTab } from './settings/components/BranchesWarehousesTab';
import { VietQrBankTab } from './settings/components/VietQrBankTab';
import { PrintTemplatesTab } from './settings/components/PrintTemplatesTab';
import { BusinessSalesTab } from './settings/components/BusinessSalesTab';
import { BusinessWarehouseTab } from './settings/components/BusinessWarehouseTab';
import { DebtAccountingLockTab } from './settings/components/DebtAccountingLockTab';
import { DebtReminderEmailTab } from './settings/components/DebtReminderEmailTab';
import { ReferenceVatTaxTab } from './settings/components/ReferenceVatTaxTab';
import { ReferenceBanksTab } from './settings/components/ReferenceBanksTab';
import { ReferenceBarcodeStandardsTab } from './settings/components/ReferenceBarcodeStandardsTab';
import { ReferenceWorkflowTab } from './settings/components/ReferenceWorkflowTab';
import { ReferenceAccountsTab } from './settings/components/ReferenceAccountsTab';
import { UsersPermissionsTab } from './settings/components/UsersPermissionsTab';
import { AuditLogTab } from './settings/components/AuditLogTab';
import { UpgradeRoadmapTab } from './settings/components/UpgradeRoadmapTab';

interface SettingsViewProps {
  currentTab?: string;
  onTabChange?: (tab: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ currentTab, onTabChange }) => {
  const { resetAllData } = useApp();

  // Selected tab state: default to 'thong-tin-doanh-nghiep' if not given or if 'tong-quan'
  const [activeTabId, setActiveTabId] = useState<string>(() => {
    if (currentTab && currentTab !== 'tong-quan') {
      return currentTab;
    }
    return 'thong-tin-doanh-nghiep';
  });

  const [navSearch, setNavSearch] = useState('');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Sync with prop if changed from external navigation
  useEffect(() => {
    if (currentTab && currentTab !== 'tong-quan' && currentTab !== activeTabId) {
      setActiveTabId(currentTab);
    }
  }, [currentTab]);

  const handleSelectTab = (tabId: string) => {
    setActiveTabId(tabId);
    setIsMobileDrawerOpen(false);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  // Find active group and tab info
  let activeGroup = SETTING_GROUPS[0];
  let activeTabInfo = SETTING_GROUPS[0].tabs[0];

  for (const grp of SETTING_GROUPS) {
    const t = grp.tabs.find(x => x.id === activeTabId);
    if (t) {
      activeGroup = grp;
      activeTabInfo = t;
      break;
    }
  }

  // Handle switching active group directly from mobile group pills
  const handleSelectGroup = (groupId: string) => {
    const targetGroup = SETTING_GROUPS.find(g => g.id === groupId);
    if (targetGroup && targetGroup.tabs.length > 0) {
      handleSelectTab(targetGroup.tabs[0].id);
    }
  };

  // Filter groups and tabs when searching
  const filteredGroups = SETTING_GROUPS.map(grp => {
    const matchingTabs = grp.tabs.filter(
      t =>
        t.name.toLowerCase().includes(navSearch.toLowerCase()) ||
        t.shortDesc.toLowerCase().includes(navSearch.toLowerCase()) ||
        grp.name.toLowerCase().includes(navSearch.toLowerCase())
    );
    return {
      ...grp,
      tabs: matchingTabs,
    };
  }).filter(grp => grp.tabs.length > 0);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-12">
      {/* ========================================================= */}
      {/* PC TOP HEADER (Unchanged on PC: hidden on mobile, visible on sm+) */}
      {/* ========================================================= */}
      <div className="hidden sm:flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Cài đặt hệ thống"
          subtitle="Cấu hình nghiệp vụ toàn diện, tra cứu thông tin tham khảo chuẩn ERP và danh mục module nâng cấp đợt tiếp theo"
        />

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => {
              if (confirm('Khôi phục toàn bộ dữ liệu mẫu ban đầu theo tài liệu đặc tả LK ERP?')) {
                resetAllData();
                alert('Đã khôi phục dữ liệu mẫu gốc ban đầu!');
              }
            }}
            className="px-3.5 py-2 text-[12.5px] font-semibold text-[#E11D48] hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-[10px] border border-rose-200 dark:border-rose-900/50 transition-colors flex items-center gap-1.5"
          >
            <Icon name="restore" size={16} />
            <span>Khôi phục dữ liệu mẫu</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MOBILE-ONLY OPTIMIZED TOP HEADER & NAVIGATION             */}
      {/* ========================================================= */}
      <div className="sm:hidden space-y-3">
        {/* Mobile Title Row */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-bold text-[#111827] dark:text-[#F8FAFC] tracking-tight">
              Cài đặt hệ thống
            </h1>
            <p className="text-[12px] text-[#6B7280] dark:text-[#94A3B8]">
              15 mục cấu hình & quy chuẩn ERP
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="h-8.5 px-2.5 bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] text-[#6D3EEB] dark:text-[#C084FC] rounded-[10px] text-[12px] font-semibold flex items-center gap-1 shadow-xs"
            >
              <Icon name="manage_search" size={16} />
              <span>Tìm kiếm</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm('Khôi phục toàn bộ dữ liệu mẫu ban đầu theo tài liệu đặc tả LK ERP?')) {
                  resetAllData();
                  alert('Đã khôi phục dữ liệu mẫu gốc ban đầu!');
                }
              }}
              title="Khôi phục dữ liệu mẫu"
              className="w-8.5 h-8.5 rounded-[10px] bg-white dark:bg-[#1E293B] border border-rose-200 dark:border-rose-900/40 text-[#E11D48] flex items-center justify-center shadow-xs"
            >
              <Icon name="restore" size={16} />
            </button>
          </div>
        </div>

        {/* Tier 1: Horizontal Scrollable Group Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 -mx-3.5 px-3.5 scroll-smooth">
          {SETTING_GROUPS.map(grp => {
            const isGroupActive = grp.id === activeGroup.id;
            return (
              <button
                key={grp.id}
                type="button"
                onClick={() => handleSelectGroup(grp.id)}
                className={`h-8.5 px-3 rounded-full text-[12px] font-medium flex items-center gap-1.5 shrink-0 transition-all ${
                  isGroupActive
                    ? 'bg-[#6D3EEB] text-white font-semibold shadow-xs'
                    : 'bg-white dark:bg-[#1E293B] text-[#4B5563] dark:text-[#CBD5E1] border border-[#E5E7EB] dark:border-[#334155]'
                }`}
              >
                <Icon name={grp.icon} size={15} />
                <span>{grp.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tier 2: Horizontal Scrollable Sub-Tab Chips for Active Group */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-3.5 px-3.5 scroll-smooth">
          {activeGroup.tabs.map(tab => {
            const isActive = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectTab(tab.id)}
                className={`h-8 px-2.5 rounded-[10px] text-[12px] flex items-center gap-1.5 shrink-0 transition-all ${
                  isActive
                    ? 'bg-[#F3EBFE] dark:bg-purple-950/60 text-[#6317D6] dark:text-[#C084FC] font-bold border border-[#6D3EEB]/30 shadow-xs'
                    : 'bg-white dark:bg-[#1E293B] text-[#4B5563] dark:text-[#CBD5E1] border border-[#E5E7EB] dark:border-[#334155] font-medium'
                }`}
              >
                <Icon
                  name={tab.icon}
                  size={15}
                  className={isActive ? 'text-[#6D3EEB] dark:text-[#C084FC]' : 'text-[#6B7280]'}
                />
                <span className="whitespace-nowrap">{tab.name}</span>
                {tab.badge && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6D3EEB]" />
                )}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            className="h-8 px-2.5 rounded-[10px] text-[11.5px] font-semibold text-[#6D3EEB] dark:text-[#C084FC] bg-[#F3EBFE] dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 flex items-center gap-1 shrink-0"
          >
            <Icon name="grid_view" size={14} />
            <span>Tất cả (15)</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MOBILE BOTTOM SHEET DRAWER (All 15 tabs with instant search)*/}
      {/* ========================================================= */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Drawer Container */}
          <div className="fixed inset-x-0 bottom-0 max-h-[85vh] bg-white dark:bg-[#1E293B] rounded-t-[24px] z-50 p-4 pb-8 flex flex-col shadow-2xl border-t border-[#E5E7EB] dark:border-[#334155] animate-in slide-in-from-bottom duration-200">
            {/* Grab handle */}
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-3 shrink-0" />

            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F2F5] dark:border-[#334155] shrink-0">
              <div className="flex items-center gap-2">
                <Icon name="settings" size={20} className="text-[#6D3EEB] dark:text-[#C084FC]" />
                <h3 className="text-[16px] font-bold text-[#111827] dark:text-[#F8FAFC]">
                  Danh mục cài đặt hệ thống
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 text-[#6B7280] dark:text-[#94A3B8] flex items-center justify-center"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            {/* Quick Search inside Drawer */}
            <div className="relative my-3 shrink-0">
              <Icon
                name="search"
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
              />
              <input
                type="text"
                placeholder="Tìm nhanh mục cài đặt, biểu thuế..."
                value={navSearch}
                onChange={e => setNavSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-8 bg-transparent border border-[#E5E7EB] dark:border-[#334155] rounded-[12px] text-[13.5px] text-[#111827] dark:text-[#F8FAFC] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#6D3EEB]"
              />
              {navSearch && (
                <button
                  type="button"
                  onClick={() => setNavSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                >
                  <Icon name="close" size={16} />
                </button>
              )}
            </div>

            {/* Grouped Tabs List inside Drawer */}
            <div className="space-y-4 overflow-y-auto pr-1 flex-1">
              {filteredGroups.map(group => (
                <div key={group.id} className="space-y-1">
                  <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider px-2 flex items-center gap-1.5 mb-1 mt-2">
                    <Icon name={group.icon} size={15} className="text-[#6D3EEB] dark:text-[#C084FC]" />
                    <span>{group.name}</span>
                  </div>

                  <div className="space-y-1">
                    {group.tabs.map(tab => {
                      const isActive = tab.id === activeTabId;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => handleSelectTab(tab.id)}
                          className={`w-full p-2.5 rounded-[12px] flex items-start justify-between text-left transition-all ${
                            isActive
                              ? 'bg-[#F3EBFE] dark:bg-purple-950/60 text-[#6317D6] dark:text-[#C084FC] font-semibold border border-[#6D3EEB]/30'
                              : 'text-[#4B5563] dark:text-[#CBD5E1] hover:bg-[#F9FAFB] dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0 pr-2">
                            <Icon
                              name={tab.icon}
                              size={19}
                              className={`shrink-0 mt-0.5 ${
                                isActive ? 'text-[#6D3EEB] dark:text-[#C084FC]' : 'text-[#6B7280]'
                              }`}
                            />
                            <div>
                              <div className="text-[13.5px] leading-tight font-medium">
                                {tab.name}
                              </div>
                              <div className="text-[11.5px] text-[#6B7280] dark:text-[#94A3B8] line-clamp-1 mt-0.5">
                                {tab.shortDesc}
                              </div>
                            </div>
                          </div>

                          {tab.badge && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                                tab.badgeColor === 'purple'
                                  ? 'bg-purple-100 dark:bg-purple-900/50 text-[#6D3EEB] dark:text-[#C084FC]'
                                  : tab.badgeColor === 'emerald'
                                  ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400'
                                  : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400'
                              }`}
                            >
                              {tab.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MAIN CONTAINER: DESKTOP SIDEBAR + CONTENT BODY            */}
      {/* ========================================================= */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Column: Grouped Navigation Menu (EXACTLY UNCHANGED ON PC) */}
        <aside className="hidden lg:block w-full lg:w-[290px] xl:w-[320px] shrink-0 bg-white dark:bg-[#1E293B] rounded-[20px] border border-[#F1F2F5] dark:border-[#334155] shadow-xs p-3 space-y-3 sticky top-4 z-20">
          {/* Quick Search in Settings on Desktop */}
          <div className="relative px-1 pt-1">
            <Icon
              name="search"
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
            />
            <input
              type="text"
              placeholder="Tìm mục cài đặt, biểu thuế..."
              value={navSearch}
              onChange={e => setNavSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 bg-transparent border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[13.5px] text-[#111827] dark:text-[#F8FAFC] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#6D3EEB]"
            />
          </div>

          {/* Grouped Tabs List on Desktop */}
          <div className="space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto pr-1 scrollbar-none">
            {filteredGroups.map(group => {
              const isGroupActive = group.tabs.some(t => t.id === activeTabId);
              return (
                <div key={group.id} className="space-y-1">
                  {/* Group Header matching Sidebar category headers */}
                  <div className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider px-3 flex items-center gap-2 mb-1.5 mt-2">
                    <Icon name={group.icon} size={16} className={isGroupActive ? 'text-[#6D3EEB] dark:text-[#C084FC]' : 'text-[#9CA3AF]'} />
                    <span>{group.name}</span>
                  </div>

                  {/* Tabs in Group */}
                  <div className="space-y-1">
                    {group.tabs.map(tab => {
                      const isActive = tab.id === activeTabId;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => handleSelectTab(tab.id)}
                          className={`w-full h-10 px-3 rounded-[12px] flex items-center justify-between text-[14.5px] transition-all relative ${
                            isActive
                              ? 'bg-[#F3EBFE] dark:bg-purple-950/60 text-[#6317D6] dark:text-[#C084FC] font-semibold'
                              : 'text-[#4B5563] dark:text-[#CBD5E1] hover:bg-[#F9FAFB] dark:hover:bg-slate-800 hover:text-[#111827] font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            <Icon
                              name={tab.icon}
                              size={20}
                              className={`shrink-0 ${
                                isActive ? 'text-[#6D3EEB] dark:text-[#C084FC]' : 'text-[#6B7280]'
                              }`}
                            />
                            <span className="truncate">{tab.name}</span>
                          </div>

                          {tab.badge && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold shrink-0 mr-1.5 ${
                                tab.badgeColor === 'purple'
                                  ? 'bg-purple-100 dark:bg-purple-900/50 text-[#6D3EEB] dark:text-[#C084FC]'
                                  : tab.badgeColor === 'emerald'
                                  ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400'
                                  : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400'
                              }`}
                            >
                              {tab.badge}
                            </span>
                          )}

                          {/* Active 3px right indicator bar */}
                          {isActive && (
                            <span className="absolute right-0 top-2 bottom-2 w-[3px] bg-[#6D3EEB] rounded-l" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right Column: Tab Content Body */}
        <main className="flex-1 min-w-0 w-full bg-white dark:bg-[#1E293B] rounded-[16px] lg:rounded-[20px] border border-[#F1F2F5] dark:border-[#334155] shadow-xs p-3.5 sm:p-5 lg:p-7 min-h-[500px] lg:min-h-[580px]">
          {/* Active Tab Breadcrumb on PC (unchanged on PC, hidden on mobile) */}
          <div className="hidden lg:flex items-center gap-2 text-[14px] text-[#4B5563] dark:text-[#CBD5E1] pb-4 mb-5 border-b border-[#F1F2F5] dark:border-[#334155]">
            <span className="flex items-center gap-1.5 font-medium">
              <Icon name={activeGroup.icon} size={18} className="text-[#6B7280]" />
              <span>{activeGroup.name}</span>
            </span>
            <span className="text-[#9CA3AF]">&rsaquo;</span>
            <span className="font-semibold text-[#6317D6] dark:text-[#C084FC] flex items-center gap-1.5">
              <Icon name={activeTabInfo.icon} size={18} className="text-[#6D3EEB] dark:text-[#C084FC]" />
              <span>{activeTabInfo.name}</span>
            </span>
          </div>

          {/* Dynamic Tab Render */}
          {activeTabId === 'thong-tin-doanh-nghiep' && <CompanyGeneralTab />}
          {activeTabId === 'chi-nhanh-kho' && <BranchesWarehousesTab />}
          {activeTabId === 'vietqr-ngan-hang' && <VietQrBankTab />}
          {activeTabId === 'mau-in-chung-tu' && <PrintTemplatesTab />}

          {activeTabId === 'nghiep-vu-ban-hang' && <BusinessSalesTab />}
          {activeTabId === 'nghiep-vu-mua-kho' && <BusinessWarehouseTab />}
          {activeTabId === 'chinh-sach-cong-no' && <DebtAccountingLockTab />}
          {activeTabId === 'nhac-no-email' && <DebtReminderEmailTab />}

          {activeTabId === 'bieu-thue-vat' && <ReferenceVatTaxTab />}
          {activeTabId === 'ma-ngan-hang-napas' && <ReferenceBanksTab />}
          {activeTabId === 'quy-chuan-ma-barcode' && <ReferenceBarcodeStandardsTab />}
          {activeTabId === 'quy-trinh-chung-tu' && <ReferenceWorkflowTab />}
          {activeTabId === 'he-thong-tai-khoan' && <ReferenceAccountsTab />}

          {activeTabId === 'tai-khoan-nhan-vien' && <UsersPermissionsTab />}
          {activeTabId === 'nhat-ky-audit' && <AuditLogTab />}

          {activeTabId === 'roadmap-modules' && <UpgradeRoadmapTab />}
        </main>
      </div>
    </div>
  );
};
