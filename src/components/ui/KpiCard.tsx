import React from 'react';
import { Icon } from './Icon';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: string;
  iconBg?: string;
  iconColor?: string;
  trend?: {
    value: string;
    isUp: boolean;
  };
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  icon,
  iconBg = 'bg-[#F9F5FF]',
  iconColor = 'text-[#6D3EEB]',
  trend,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-[16px] p-3.5 sm:p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_2px_8px_rgba(16,24,40,0.04)] border border-[#F1F2F5] flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3.5 min-h-[78px] hover:border-[#E5E7EB] transition-shadow ${className}`}
    >
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        <div
          className={`w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-[10px] sm:rounded-[12px] flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}
        >
          <Icon name={icon} size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-[11.5px] sm:text-[13px] font-medium text-[#6B7280] truncate leading-none mb-1 sm:mb-1.5">
            {label}
          </p>
          <p className="text-[15.5px] sm:text-[22px] font-bold text-[#111827] tabular-nums leading-tight tracking-tight truncate">
            {value}
          </p>
        </div>
      </div>

      {trend && (
        <div
          className={`self-start sm:self-auto flex items-center gap-0.5 text-[10.5px] sm:text-[11.5px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
            trend.isUp ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-[#FFF1F2] text-[#E11D48]'
          }`}
        >
          <Icon name={trend.isUp ? 'trending_up' : 'trending_down'} size={13} />
          <span>{trend.value}</span>
        </div>
      )}
    </div>
  );
};
