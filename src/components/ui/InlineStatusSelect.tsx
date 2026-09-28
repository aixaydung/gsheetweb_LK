import React, { useState, useRef, useEffect } from 'react';
import { getStatusStyle } from '../../lib/labels';
import { Icon } from './Icon';

interface StatusOption {
  value: string;
  label: string;
}

interface InlineStatusSelectProps {
  currentStatus: string;
  options: StatusOption[];
  onSelect: (newStatus: string) => void;
  disabled?: boolean;
}

export const InlineStatusSelect: React.FC<InlineStatusSelectProps> = ({
  currentStatus,
  options,
  onSelect,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const style = getStatusStyle(currentStatus);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  if (disabled || options.length <= 1) {
    return (
      <span
        className="inline-flex items-center font-semibold text-[11.5px] px-2.5 py-0.5 rounded-[8px] whitespace-nowrap leading-tight"
        style={{
          backgroundColor: style.bg,
          color: style.text,
        }}
      >
        {style.label}
      </span>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between gap-1 font-semibold text-[11.5px] pl-2.5 pr-1.5 py-0.5 rounded-[8px] whitespace-nowrap leading-tight cursor-pointer hover:opacity-90 transition-opacity"
        style={{
          backgroundColor: style.bg,
          color: style.text,
        }}
      >
        <span>{style.label}</span>
        <Icon name="expand_more" size={16} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-44 rounded-[12px] bg-white shadow-[0_12px_32px_rgba(16,24,40,0.12)] border border-[#E5E7EB] py-1 z-50">
          {options.map(opt => {
            const optStyle = getStatusStyle(opt.value);
            const isSelected = opt.value === currentStatus;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onSelect(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-[13px] flex items-center justify-between hover:bg-[#F9FAFB] transition-colors ${
                  isSelected ? 'font-semibold' : 'text-[#374151]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: optStyle.text }}
                  />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Icon name="check" size={16} className="text-[#6D3EEB]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
