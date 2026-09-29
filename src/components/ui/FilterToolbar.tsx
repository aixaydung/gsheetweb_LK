import React, { useState } from 'react';
import { Icon } from './Icon';
import { DateRangePicker, DateRange } from './DateRangePicker';

export interface FilterOption {
  label: string; // e.g. "Thanh toán: Tất cả"
  key: string;
  value: string;
  items: { value: string; label: string }[];
  onChange: (val: string) => void;
}

export interface SortOption {
  key: string;
  label: string;
}

interface FilterToolbarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (val: string) => void;
  filters?: FilterOption[];
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange) => void;
  sortOptions?: SortOption[];
  currentSortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onSortChange?: (key: string, direction: 'asc' | 'desc') => void;
  onClearFilters?: () => void;
  onExportExcel?: () => void;
  secondaryAction?: {
    label: string;
    icon?: string;
    onClick: () => void;
  };
  primaryAction?: {
    label: string;
    icon?: string;
    onClick: () => void;
  };
  className?: string;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  searchPlaceholder = 'Tìm kiếm...',
  searchValue,
  onSearchChange,
  filters = [],
  dateRange,
  onDateRangeChange,
  sortOptions = [],
  currentSortKey,
  sortDirection = 'desc',
  onSortChange,
  onClearFilters,
  onExportExcel,
  secondaryAction,
  primaryAction,
  className = '',
}) => {
  const [bookmarkSaved, setBookmarkSaved] = useState(false);

  return (
    <div className={`mb-4 ${className}`}>
      {/* ========================================================= */}
      {/* MOBILE LAYOUT (< sm): Clean, Compact, Zero-Awkward-Wrap   */}
      {/* ========================================================= */}
      <div className="flex sm:hidden flex-col gap-2.5">
        {/* Row 1: Search Input (Full Width) */}
        <div className="relative w-full">
          <Icon
            name="search"
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
          />
          <input
            type="text"
            value={searchValue}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-[40px] pl-10 pr-9 bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] focus:border-[#6D3EEB] rounded-[12px] text-[13.5px] text-[#1F2937] dark:text-[#F8FAFC] placeholder-[#9CA3AF] shadow-xs outline-none"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563]"
            >
              <Icon name="close" size={16} />
            </button>
          )}
        </div>

        {/* Row 2: Horizontally Scrollable Filter Chips (Date, Status, Payment, Sort) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-3.5 px-3.5 no-scrollbar scroll-smooth">
          {/* DateRangePicker */}
          {dateRange && onDateRangeChange && (
            <div className="shrink-0">
              <DateRangePicker value={dateRange} onChange={onDateRangeChange} />
            </div>
          )}

          {/* Filter Selects */}
          {filters.map(filter => (
            <div key={filter.key} className="relative shrink-0">
              <select
                value={filter.value}
                onChange={e => filter.onChange(e.target.value)}
                className="h-[40px] pl-3 pr-7 bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] hover:border-[#6D3EEB] rounded-[12px] text-[13px] font-medium text-[#1F2937] dark:text-[#F8FAFC] appearance-none cursor-pointer shadow-xs outline-none whitespace-nowrap"
              >
                {filter.items.map(it => (
                  <option key={it.value} value={it.value}>
                    {it.label}
                  </option>
                ))}
              </select>
              <Icon
                name="expand_more"
                size={16}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none"
              />
            </div>
          ))}

          {/* Sort Select */}
          {sortOptions.length > 0 && onSortChange && (
            <div className="flex items-center h-[40px] bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-[12px] shadow-xs shrink-0">
              <div className="relative flex items-center pl-2.5 pr-1.5">
                <Icon name="sort" size={16} className="text-[#6B7280] mr-1" />
                <select
                  value={currentSortKey || sortOptions[0]?.key}
                  onChange={e => onSortChange(e.target.value, sortDirection)}
                  className="bg-transparent text-[13px] font-medium text-[#1F2937] dark:text-[#F8FAFC] appearance-none pr-4 outline-none cursor-pointer"
                >
                  {sortOptions.map(opt => (
                    <option key={opt.key} value={opt.key}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <Icon
                  name="expand_more"
                  size={14}
                  className="absolute right-0.5 text-[#6B7280] pointer-events-none"
                />
              </div>
              <button
                type="button"
                title="Đổi chiều sắp xếp"
                onClick={() =>
                  onSortChange(
                    currentSortKey || sortOptions[0]?.key,
                    sortDirection === 'asc' ? 'desc' : 'asc'
                  )
                }
                className="h-full px-2 border-l border-[#F1F2F5] dark:border-[#334155] text-[#6317D6] dark:text-[#C084FC] hover:bg-[#F9FAFB] flex items-center justify-center rounded-r-[12px]"
              >
                <Icon
                  name={sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                  size={15}
                />
              </button>
            </div>
          )}

          {/* Clear Filters */}
          {onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              title="Xoá bộ lọc"
              className="w-[40px] h-[40px] shrink-0 rounded-[12px] bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] text-[#6B7280] hover:text-[#111827] flex items-center justify-center shadow-xs"
            >
              <Icon name="filter_alt_off" size={17} />
            </button>
          )}

          {/* Bookmark */}
          <button
            type="button"
            onClick={() => {
              setBookmarkSaved(true);
              setTimeout(() => setBookmarkSaved(false), 2000);
            }}
            title="Lưu bộ lọc hiện tại"
            className={`w-[40px] h-[40px] shrink-0 rounded-[12px] bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] flex items-center justify-center shadow-xs ${
              bookmarkSaved ? 'text-[#6D3EEB] bg-[#F9F5FF]' : 'text-[#6B7280]'
            }`}
          >
            <Icon name={bookmarkSaved ? 'bookmark_added' : 'bookmark'} size={17} />
          </button>
        </div>

        {/* Row 3: Action Buttons (Xuất Excel + Thao tác phụ + Tạo mới) */}
        {(primaryAction || secondaryAction || onExportExcel) && (
          <div className="flex items-center gap-2 pt-0.5">
            {onExportExcel && (
              <button
                type="button"
                onClick={onExportExcel}
                className="h-[40px] px-3.5 bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] text-[#6317D6] dark:text-[#C084FC] hover:bg-[#F9F5FF] text-[13px] font-semibold rounded-[12px] flex items-center justify-center gap-1.5 transition-colors shadow-xs shrink-0"
              >
                <Icon name="download" size={17} className="text-[#6D3EEB] dark:text-[#C084FC]" />
                <span>Xuất Excel</span>
              </button>
            )}

            {secondaryAction && (
              <button
                type="button"
                onClick={secondaryAction.onClick}
                className="h-[40px] px-3.5 bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] text-[#1F2937] dark:text-[#F8FAFC] hover:bg-[#F9F5FF] text-[13px] font-semibold rounded-[12px] flex items-center justify-center gap-1.5 transition-colors shadow-xs shrink-0"
              >
                {secondaryAction.icon && <Icon name={secondaryAction.icon} size={17} />}
                <span>{secondaryAction.label}</span>
              </button>
            )}

            {primaryAction && (
              <button
                type="button"
                onClick={primaryAction.onClick}
                className="flex-1 h-[40px] px-4 bg-[#6D3EEB] hover:bg-[#5B2BD6] text-white text-[13.5px] font-semibold rounded-[12px] shadow-[0_8px_20px_-6px_rgba(109,62,235,0.55)] flex items-center justify-center gap-1.5 transition-all whitespace-nowrap"
              >
                {primaryAction.icon && <Icon name={primaryAction.icon} size={18} />}
                <span>{primaryAction.label}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* DESKTOP LAYOUT (sm+): Spacious, Inline Flow, Clean Spacing */}
      {/* ========================================================= */}
      <div className="hidden sm:flex flex-wrap items-center gap-2">
        {/* 1. Search Bar */}
        <div className="relative flex-1 min-w-[220px]">
          <Icon
            name="search"
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
          />
          <input
            type="text"
            value={searchValue}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-[42px] pl-10 pr-3.5 bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] focus:border-[#6D3EEB] focus:ring-1 focus:ring-[#6D3EEB] rounded-[12px] text-[13.5px] text-[#1F2937] dark:text-[#F8FAFC] placeholder-[#9CA3AF] transition-all shadow-sm outline-none"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563]"
            >
              <Icon name="close" size={16} />
            </button>
          )}
        </div>

        {/* 2. Filter Selects */}
        {filters.map(filter => (
          <div key={filter.key} className="relative">
            <select
              value={filter.value}
              onChange={e => filter.onChange(e.target.value)}
              className="h-[42px] pl-3.5 pr-8 bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] hover:border-[#6D3EEB] rounded-[12px] text-[13.5px] font-medium text-[#1F2937] dark:text-[#F8FAFC] appearance-none cursor-pointer transition-colors shadow-sm outline-none"
            >
              {filter.items.map(it => (
                <option key={it.value} value={it.value}>
                  {it.label}
                </option>
              ))}
            </select>
            <Icon
              name="expand_more"
              size={16}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none"
            />
          </div>
        ))}

        {/* 3. DateRangePicker */}
        {dateRange && onDateRangeChange && (
          <DateRangePicker value={dateRange} onChange={onDateRangeChange} />
        )}

        {/* 4. Sort Select with direction toggle */}
        {sortOptions.length > 0 && onSortChange && (
          <div className="flex items-center h-[42px] bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-[12px] shadow-sm">
            <div className="relative flex items-center pl-3 pr-2">
              <Icon name="sort" size={17} className="text-[#6B7280] mr-1.5" />
              <select
                value={currentSortKey || sortOptions[0]?.key}
                onChange={e => onSortChange(e.target.value, sortDirection)}
                className="bg-transparent text-[13.5px] font-medium text-[#1F2937] dark:text-[#F8FAFC] appearance-none pr-5 outline-none cursor-pointer"
              >
                {sortOptions.map(opt => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <Icon
                name="expand_more"
                size={14}
                className="absolute right-1 text-[#6B7280] pointer-events-none"
              />
            </div>
            <button
              type="button"
              title="Đổi chiều sắp xếp"
              onClick={() =>
                onSortChange(
                  currentSortKey || sortOptions[0]?.key,
                  sortDirection === 'asc' ? 'desc' : 'asc'
                )
              }
              className="h-full px-2.5 border-l border-[#F1F2F5] dark:border-[#334155] text-[#6317D6] dark:text-[#C084FC] hover:bg-[#F9FAFB] transition-colors flex items-center justify-center rounded-r-[12px]"
            >
              <Icon
                name={sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                size={16}
              />
            </button>
          </div>
        )}

        {/* 5. Clear Filters Button */}
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            title="Xoá bộ lọc"
            className="w-[42px] h-[42px] rounded-[12px] bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] hover:border-gray-400 text-[#6B7280] hover:text-[#111827] flex items-center justify-center transition-colors shadow-sm"
          >
            <Icon name="filter_alt_off" size={18} />
          </button>
        )}

        {/* 6. Bookmark filter button */}
        <button
          type="button"
          onClick={() => {
            setBookmarkSaved(true);
            setTimeout(() => setBookmarkSaved(false), 2000);
          }}
          title="Lưu bộ lọc hiện tại"
          className={`w-[42px] h-[42px] rounded-[12px] bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] flex items-center justify-center transition-colors shadow-sm ${
            bookmarkSaved ? 'text-[#6D3EEB] bg-[#F9F5FF]' : 'text-[#6B7280] hover:text-[#6D3EEB]'
          }`}
        >
          <Icon name={bookmarkSaved ? 'bookmark_added' : 'bookmark'} size={18} />
        </button>

        {/* 7. Export Excel Button */}
        {onExportExcel && (
          <button
            type="button"
            onClick={onExportExcel}
            className="h-[42px] px-3.5 bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] hover:border-[#6D3EEB] text-[#6317D6] dark:text-[#C084FC] hover:bg-[#F9F5FF] text-[13.5px] font-semibold rounded-[12px] flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Icon name="download" size={18} className="text-[#6D3EEB] dark:text-[#C084FC]" />
            <span>Xuất Excel</span>
          </button>
        )}

        {/* 7.5 Secondary Action (e.g. Nhập Excel) */}
        {secondaryAction && (
          <button
            type="button"
            onClick={secondaryAction.onClick}
            className="h-[42px] px-3.5 bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] hover:border-[#6D3EEB] text-[#1F2937] dark:text-[#F8FAFC] hover:bg-[#F9F5FF] text-[13.5px] font-semibold rounded-[12px] flex items-center gap-1.5 transition-colors shadow-sm whitespace-nowrap"
          >
            {secondaryAction.icon && <Icon name={secondaryAction.icon} size={18} />}
            <span>{secondaryAction.label}</span>
          </button>
        )}

        {/* 8. Primary Action */}
        {primaryAction && (
          <button
            type="button"
            onClick={primaryAction.onClick}
            className="h-[42px] px-4 bg-[#6D3EEB] hover:bg-[#5B2BD6] text-white text-[13.5px] font-semibold rounded-[12px] shadow-[0_8px_20px_-6px_rgba(109,62,235,0.55)] flex items-center gap-1.5 transition-all whitespace-nowrap"
          >
            {primaryAction.icon && <Icon name={primaryAction.icon} size={18} />}
            <span>{primaryAction.label}</span>
          </button>
        )}
      </div>
    </div>
  );
};
