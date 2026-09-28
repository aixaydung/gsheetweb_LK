import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, rightAction }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-7">
      <div>
        <h1 className="text-[22px] sm:text-[28px] lg:text-[30px] font-bold text-[#111827] tracking-tight leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[13.5px] sm:text-[14.5px] font-normal text-[#6B7280] mt-0.5 sm:mt-1 leading-snug">
            {subtitle}
          </p>
        )}
      </div>
      {rightAction && <div className="flex items-center gap-2 sm:gap-3 flex-wrap">{rightAction}</div>}
    </div>
  );
};
