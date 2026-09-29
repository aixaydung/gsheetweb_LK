import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';

export interface DateRange {
  from: string | null; // yyyy-MM-dd
  to: string | null; // yyyy-MM-dd
  preset?: string;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<string>(value.preset || 'all');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2026, 8, 1)); // September 2026
  const [draftFrom, setDraftFrom] = useState<string | null>(value.from);
  const [draftTo, setDraftTo] = useState<string | null>(value.to);
  const [alignRight, setAlignRight] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect edge proximity when opening on desktop to auto-align left or right
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const popoverWidth = 560; // desktop width of popover
      const spaceRight = window.innerWidth - rect.left;
      // If remaining space on the right is less than popover width + padding, align to right edge
      setAlignRight(spaceRight < popoverWidth + 24);
    }
  }, [isOpen]);

  // Sync draft states when value changes or when opened
  useEffect(() => {
    setActivePreset(value.preset || (!value.from && !value.to ? 'all' : 'custom'));
    setDraftFrom(value.from);
    setDraftTo(value.to);
  }, [value, isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const presets = [
    { id: 'all', label: 'Mọi thời gian' },
    { id: 'today', label: 'Hôm nay' },
    { id: 'yesterday', label: 'Hôm qua' },
    { id: '7days', label: '7 ngày qua' },
    { id: '30days', label: '30 ngày qua' },
    { id: 'thisMonth', label: 'Tháng này' },
    { id: 'lastMonth', label: 'Tháng trước' },
    { id: 'thisQuarter', label: 'Quý này' },
    { id: 'thisYear', label: 'Năm nay' },
  ];

  const handleSelectPreset = (presetId: string) => {
    setActivePreset(presetId);
    if (presetId === 'all') {
      setDraftFrom(null);
      setDraftTo(null);
      return;
    }

    const now = new Date(2026, 8, 27); // 27/09/2026
    let fromDate = new Date(now);
    let toDate = new Date(now);

    switch (presetId) {
      case 'today':
        break;
      case 'yesterday':
        fromDate.setDate(now.getDate() - 1);
        toDate.setDate(now.getDate() - 1);
        break;
      case '7days':
        fromDate.setDate(now.getDate() - 6);
        break;
      case '30days':
        fromDate.setDate(now.getDate() - 29);
        break;
      case 'thisMonth':
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
        toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'lastMonth':
        fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        toDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'thisQuarter': {
        const qMonth = Math.floor(now.getMonth() / 3) * 3;
        fromDate = new Date(now.getFullYear(), qMonth, 1);
        toDate = new Date(now.getFullYear(), qMonth + 3, 0);
        break;
      }
      case 'thisYear':
        fromDate = new Date(now.getFullYear(), 0, 1);
        toDate = new Date(now.getFullYear(), 11, 31);
        break;
    }

    const fromStr = fromDate.toISOString().split('T')[0];
    const toStr = toDate.toISOString().split('T')[0];
    setDraftFrom(fromStr);
    setDraftTo(toStr);
  };

  const handleDayClick = (dateStr: string) => {
    setActivePreset('custom');
    if (!draftFrom || (draftFrom && draftTo)) {
      setDraftFrom(dateStr);
      setDraftTo(null);
    } else if (draftFrom && !draftTo) {
      if (dateStr < draftFrom) {
        setDraftTo(draftFrom);
        setDraftFrom(dateStr);
      } else {
        setDraftTo(dateStr);
      }
    }
  };

  const handleApply = () => {
    if (activePreset === 'all') {
      onChange({ from: null, to: null, preset: 'all' });
    } else {
      onChange({ from: draftFrom, to: draftTo, preset: activePreset });
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setActivePreset('all');
    setDraftFrom(null);
    setDraftTo(null);
    onChange({ from: null, to: null, preset: 'all' });
    setIsOpen(false);
  };

  const displayButtonText = () => {
    if (activePreset === 'all' || (!value.from && !value.to && (!value.preset || value.preset === 'all'))) {
      return 'Mọi thời gian';
    }
    if (value.preset && value.preset !== 'all' && value.preset !== 'custom') {
      const match = presets.find(p => p.id === value.preset);
      if (match) return match.label;
    }
    if (value.from && value.to) {
      const fParts = value.from.split('-');
      const tParts = value.to.split('-');
      if (fParts[0] === tParts[0]) {
        return `${fParts[2]}/${fParts[1]} - ${tParts[2]}/${tParts[1]}`;
      }
      return `${fParts[2]}/${fParts[1]} - ${tParts[2]}/${tParts[1]}/${tParts[0].slice(2)}`;
    }
    if (value.from) {
      const fParts = value.from.split('-');
      return `Từ ${fParts[2]}/${fParts[1]}`;
    }
    return 'Mọi thời gian';
  };

  // Build calendar matrix
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Day of week: Mon = 0, Sun = 6
  let startDayOfWeek = firstDay.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  // Previous month trailing
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i;
    const prevDate = new Date(year, month - 1, d);
    days.push({
      dateStr: prevDate.toISOString().split('T')[0],
      dayNum: d,
      isCurrentMonth: false,
    });
  }

  // Current month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const curDate = new Date(year, month, d);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: true,
    });
  }

  // Next month leading to complete 35 or 42 cells
  const remaining = 35 - days.length > 0 ? 35 - days.length : 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    const nextDate = new Date(year, month + 1, d);
    days.push({
      dateStr: nextDate.toISOString().split('T')[0],
      dayNum: d,
      isCurrentMonth: false,
    });
  }

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      {/* Trigger Button - Optimized for Mobile & Desktop */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-[40px] sm:h-[42px] px-3 sm:px-3.5 bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] hover:border-[#6D3EEB] rounded-[12px] text-[13px] sm:text-[13.5px] font-medium text-[#1F2937] dark:text-[#F8FAFC] flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-xs sm:shadow-sm"
      >
        <Icon name="calendar_month" size={17} className="text-[#6D3EEB] dark:text-[#C084FC] shrink-0" />
        <span className="truncate max-w-[130px] sm:max-w-none">{displayButtonText()}</span>
        <Icon name="expand_more" size={16} className="text-[#6B7280] shrink-0 ml-0.5" />
      </button>

      {isOpen && (
        <>
          {/* Mobile Backdrop for clean focus */}
          <div
            className="fixed inset-0 bg-black/50 z-50 sm:hidden backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal / Dropdown Content: Bottom Sheet on Mobile, Popover on Desktop */}
          <div
            className={`fixed inset-x-0 bottom-0 sm:bottom-auto max-h-[92vh] overflow-y-auto sm:overflow-visible sm:max-h-none sm:absolute ${
              alignRight ? 'sm:right-0 sm:left-auto' : 'sm:left-0 sm:right-auto'
            } sm:top-full mt-2 bg-white dark:bg-[#1E293B] rounded-t-[24px] sm:rounded-[20px] shadow-[0_20px_50px_rgba(16,24,40,0.25)] border border-[#E5E7EB] dark:border-[#334155] z-50 p-4 sm:p-5 w-full sm:w-[560px] animate-in sm:zoom-in-95 duration-200`}
          >
            {/* Mobile Sheet Handle */}
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-3 sm:hidden" />
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Presets Column: 3-column grid on mobile, vertical list on desktop */}
              <div className="sm:col-span-4 border-b sm:border-b-0 sm:border-r border-[#F1F2F5] dark:border-[#334155] pb-3 sm:pb-0 sm:pr-3">
                <span className="text-[11px] font-bold text-[#9CA3AF] tracking-wider uppercase block mb-2">
                  CHỌN NHANH
                </span>
                <div className="grid grid-cols-3 sm:flex sm:flex-col gap-1.5 sm:gap-1">
                  {presets.map(p => {
                    const isSelected = activePreset === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPreset(p.id)}
                        className={`text-center sm:text-left px-2.5 py-1.5 rounded-[8px] text-[12.5px] sm:text-[13px] font-medium transition-colors ${
                          isSelected
                            ? 'bg-[#F3EBFE] dark:bg-purple-950/60 text-[#6317D6] dark:text-[#C084FC] font-semibold ring-1 ring-[#6D3EEB]/30'
                            : 'text-[#4B5563] dark:text-[#CBD5E1] bg-gray-50 dark:bg-slate-800 sm:bg-transparent hover:bg-[#F9FAFB] dark:hover:bg-slate-700 hover:text-[#111827]'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right: Calendar View */}
              <div className="sm:col-span-8 pl-0 sm:pl-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[14px] font-semibold text-[#111827] dark:text-[#F8FAFC]">
                    Tháng {month + 1}, {year}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
                      className="p-1 hover:bg-[#F9FAFB] dark:hover:bg-slate-800 rounded-lg text-[#6B7280] dark:text-[#94A3B8]"
                    >
                      <Icon name="chevron_left" size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
                      className="p-1 hover:bg-[#F9FAFB] dark:hover:bg-slate-800 rounded-lg text-[#6B7280] dark:text-[#94A3B8]"
                    >
                      <Icon name="chevron_right" size={20} />
                    </button>
                  </div>
                </div>

                {/* Day headers T2..CN */}
                <div className="grid grid-cols-7 gap-1 text-center text-[12px] font-semibold text-[#9CA3AF] mb-1">
                  <span>T2</span>
                  <span>T3</span>
                  <span>T4</span>
                  <span>T5</span>
                  <span>T6</span>
                  <span>T7</span>
                  <span>CN</span>
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1 text-center text-[13px]">
                  {days.map((d, index) => {
                    const isStart = draftFrom === d.dateStr;
                    const isEnd = draftTo === d.dateStr;
                    const inRange = draftFrom && draftTo && d.dateStr > draftFrom && d.dateStr < draftTo;
                    const isToday = d.dateStr === '2026-09-27';

                    let cellClass = 'h-8.5 w-8.5 mx-auto flex items-center justify-center rounded-lg cursor-pointer text-[13px] transition-colors ';
                    if (isStart || isEnd) {
                      cellClass += 'bg-[#6D3EEB] text-white font-bold shadow-xs ';
                    } else if (inRange) {
                      cellClass += 'bg-[#F3EBFE] dark:bg-purple-950/50 text-[#6317D6] dark:text-[#C084FC] ';
                    } else if (isToday) {
                      cellClass += 'border-2 border-[#6D3EEB] text-[#6D3EEB] dark:text-[#C084FC] font-semibold ';
                    } else if (!d.isCurrentMonth) {
                      cellClass += 'text-[#CBD5E1] dark:text-[#475569] hover:bg-gray-50 dark:hover:bg-slate-800 ';
                    } else {
                      cellClass += 'text-[#1F2937] dark:text-[#F1F5F9] hover:bg-gray-100 dark:hover:bg-slate-800 ';
                    }

                    return (
                      <div
                        key={index}
                        onClick={() => handleDayClick(d.dateStr)}
                        className={cellClass}
                      >
                        {d.dayNum}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-[#F1F2F5] dark:border-[#334155] mt-4 pt-3 flex items-center justify-between">
              <span className="text-[12px] text-[#6B7280] dark:text-[#94A3B8]">
                {draftFrom && draftTo
                  ? `${draftFrom.split('-').reverse().join('/')} – ${draftTo.split('-').reverse().join('/')}`
                  : draftFrom
                  ? `Từ ngày ${draftFrom.split('-').reverse().join('/')}`
                  : 'Mọi thời gian (không lọc theo ngày)'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-1.5 text-[13px] text-[#6B7280] dark:text-[#CBD5E1] hover:text-[#111827] dark:hover:text-white font-medium"
                >
                  Mọi thời gian
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-4 py-1.5 bg-[#6D3EEB] hover:bg-[#5B2BD6] text-white text-[13px] font-semibold rounded-[10px] transition-colors shadow-xs"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
