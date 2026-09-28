import React from 'react';
import { getStatusStyle } from '../../lib/labels';

interface StatusBadgeProps {
  status: string;
  customLabel?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, customLabel, className = '' }) => {
  const style = getStatusStyle(status);

  return (
    <span
      className={`inline-flex items-center justify-center font-semibold text-[11.5px] px-2.5 py-0.5 rounded-[8px] whitespace-nowrap leading-tight ${className}`}
      style={{
        backgroundColor: style.bg,
        color: style.text,
      }}
    >
      {customLabel || style.label}
    </span>
  );
};
