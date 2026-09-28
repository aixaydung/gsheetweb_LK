import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  badge?: number | string;
}

interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ items, activeId, onChange, className = '' }) => {
  return (
    <div
      className={`border-b border-[#F1F2F5] overflow-x-auto no-scrollbar scroll-smooth touch-pan-x mb-5 sm:mb-6 -mx-3.5 px-3.5 sm:mx-0 sm:px-0 ${className}`}
    >
      <nav className="flex space-x-5 sm:space-x-8 min-w-max" aria-label="Tabs">
        {items.map(tab => {
          const isActive = tab.id === activeId;
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-[14px] sm:text-[15px] whitespace-nowrap transition-colors flex items-center gap-2 relative active:opacity-75 touch-manipulation ${
                isActive
                  ? 'border-[#6D3EEB] text-[#6317D6] font-semibold'
                  : 'border-transparent text-[#6B7280] hover:text-[#1F2937] hover:border-gray-300'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-[#F3EBFE] text-[#6317D6]' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
