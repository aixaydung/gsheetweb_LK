import React, { useEffect } from 'react';
import { Icon } from './Icon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: string;
  width?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon = 'edit_note',
  width = 'md',
  children,
  footer,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-[560px]',
    md: 'max-w-[760px]',
    lg: 'max-w-[980px]',
    xl: 'max-w-[1140px]',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box: Bottom Sheet on Mobile, Centered Modal on Desktop */}
      <div
        className={`relative w-full ${widthClasses[width]} bg-white rounded-t-[24px] sm:rounded-[24px] shadow-[0_12px_32px_rgba(16,24,40,0.18)] border border-[#E5E7EB] z-10 flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden sm:my-auto animate-in fade-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 pb-[env(safe-area-inset-bottom)]`}
      >
        {/* Mobile Pull Handle Indicator */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-white shrink-0">
          <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-5 border-b border-[#F1F2F5] flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 pr-2">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-[12px] bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center text-white shadow-sm shrink-0">
              <Icon name={icon} size={22} />
            </div>
            <div className="min-w-0">
              <h2 className="text-[17px] sm:text-[20px] font-bold text-[#111827] leading-tight truncate">
                {title}
              </h2>
              {subtitle && (
                <p className="text-[12.5px] sm:text-[13px] text-[#6B7280] mt-0.5 font-normal truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-[#F9FAFB] active:bg-[#F3F4F6] flex items-center justify-center text-[#9CA3AF] hover:text-[#111827] transition-colors shrink-0 touch-manipulation"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 overflow-y-auto flex-1">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-[#F1F2F5] bg-[#FFFFFF] shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
