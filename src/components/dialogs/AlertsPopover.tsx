import React, { useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Icon } from '../ui/Icon';

interface AlertsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const AlertsPopover: React.FC<AlertsPopoverProps> = ({ isOpen, onClose, onNavigate }) => {
  const { alerts } = useApp();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleItemClick = (path: string) => {
    onClose();
    onNavigate(path);
  };

  return (
    <div
      ref={popoverRef}
      className="absolute right-4 sm:right-16 top-[66px] mt-2 w-[340px] bg-white rounded-[20px] shadow-[0_12px_32px_rgba(16,24,40,0.18)] border border-[#E5E7EB] z-50 p-4 animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="flex items-center justify-between pb-3 border-b border-[#F1F2F5] mb-3">
        <div className="flex items-center gap-2">
          <Icon name="warning" size={20} className="text-[#F59E0B]" />
          <h3 className="text-[15px] font-bold text-[#111827]">Cảnh báo cần xử lý</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-[#9CA3AF] hover:text-[#111827]"
        >
          <Icon name="close" size={16} />
        </button>
      </div>

      <div className="space-y-2">
        {/* Low/Out of Stock */}
        <div
          onClick={() => handleItemClick('/kho-hang?tab=tong-quan')}
          className="p-3 rounded-[12px] bg-[#FFFBEB] hover:bg-[#FEF3C7] border border-[#FDE68A] cursor-pointer transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <Icon name="inventory_2" size={18} className="text-[#B45309]" />
            <span className="text-[13.5px] font-semibold text-[#92400E]">
              Sản phẩm sắp/hết hàng
            </span>
          </div>
          <span className="bg-[#F59E0B] text-white font-bold text-[11.5px] px-2 py-0.5 rounded-full">
            {alerts.stock}
          </span>
        </div>

        {/* Overdue Debt */}
        <div
          onClick={() => handleItemClick('/cong-no?tab=qua-han')}
          className="p-3 rounded-[12px] bg-[#FFF1F2] hover:bg-[#FFE4E6] border border-[#FECDD3] cursor-pointer transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <Icon name="error" size={18} className="text-[#E11D48]" />
            <span className="text-[13.5px] font-semibold text-[#9F1239]">
              Công nợ quá hạn
            </span>
          </div>
          <span className="bg-[#E11D48] text-white font-bold text-[11.5px] px-2 py-0.5 rounded-full">
            {alerts.overdue}
          </span>
        </div>

        {/* Over Stock */}
        <div
          onClick={() => handleItemClick('/kho-hang?tab=tong-quan')}
          className="p-3 rounded-[12px] bg-[#F9F5FF] hover:bg-[#F3EBFE] border border-[#E9D5FF] cursor-pointer transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <Icon name="layers" size={18} className="text-[#6D3EEB]" />
            <span className="text-[13.5px] font-semibold text-[#5B21B6]">
              Sản phẩm vượt tồn
            </span>
          </div>
          <span className="bg-[#8B5CF6] text-white font-bold text-[11.5px] px-2 py-0.5 rounded-full">
            {alerts.overStock}
          </span>
        </div>

        {/* PO Late */}
        {alerts.poLate > 0 && (
          <div
            onClick={() => handleItemClick('/mua-hang?tab=don-dat-hang')}
            className="p-3 rounded-[12px] bg-[#FFF7ED] hover:bg-[#FFEDD5] border border-[#FED7AA] cursor-pointer transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <Icon name="local_shipping" size={18} className="text-[#EA580C]" />
              <span className="text-[13.5px] font-semibold text-[#C2410C]">
                Đơn đặt hàng quá hạn nhận
              </span>
            </div>
            <span className="bg-[#EA580C] text-white font-bold text-[11.5px] px-2 py-0.5 rounded-full">
              {alerts.poLate}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
