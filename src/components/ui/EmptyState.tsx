import React from 'react';
import { Icon } from './Icon';

interface EmptyStateProps {
  message?: string;
  icon?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'Chưa có dữ liệu',
  icon = 'inbox',
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <div className="w-14 h-14 rounded-full bg-[#F9F5FF] border border-[#F3EBFE] flex items-center justify-center text-[#6D3EEB] mb-3.5 shadow-sm">
        <Icon name={icon} size={28} />
      </div>
      <p className="text-[14px] text-[#6B7280] font-normal max-w-sm mb-4">
        {message}
      </p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-4 py-2 bg-[#6D3EEB] hover:bg-[#5B2BD6] text-white text-[13.5px] font-semibold rounded-[12px] shadow-[0_8px_20px_-6px_rgba(109,62,235,0.55)] transition-all flex items-center gap-1.5"
        >
          <Icon name="add" size={18} />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
