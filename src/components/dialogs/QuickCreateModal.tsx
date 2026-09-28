import React from 'react';
import { Modal } from '../ui/Modal';
import { Icon } from '../ui/Icon';

interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (actionKey: string) => void;
}

export const QuickCreateModal: React.FC<QuickCreateModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  const options = [
    {
      key: 'invoice',
      title: 'Hóa đơn bán hàng',
      desc: 'Xuất kho & ghi doanh thu',
      icon: 'sell',
      gradient: 'from-[#8B5CF6] to-[#6D28D9]',
    },
    {
      key: 'purchase_order',
      title: 'Phiếu mua hàng',
      desc: 'Nhập kho từ NCC',
      icon: 'shopping_cart',
      gradient: 'from-[#3B82F6] to-[#1D4ED8]',
    },
    {
      key: 'sales_return',
      title: 'Phiếu trả hàng',
      desc: 'Khách trả, nhập lại kho',
      icon: 'assignment_return',
      gradient: 'from-[#F43F5E] to-[#BE123C]',
    },
    {
      key: 'payment',
      title: 'Thu tiền khách',
      desc: 'Thu nợ nhiều hóa đơn',
      icon: 'account_balance_wallet',
      gradient: 'from-[#10B981] to-[#047857]',
    },
    {
      key: 'product',
      title: 'Sản phẩm',
      desc: 'Thêm mặt hàng mới',
      icon: 'inventory_2',
      gradient: 'from-[#F59E0B] to-[#B45309]',
    },
    {
      key: 'customer',
      title: 'Khách hàng',
      desc: 'Thêm hồ sơ khách',
      icon: 'person',
      gradient: 'from-[#D946EF] to-[#A21CAF]',
    },
    {
      key: 'supplier',
      title: 'Nhà cung cấp',
      desc: 'Thêm nhà cung cấp',
      icon: 'storefront',
      gradient: 'from-[#0EA5E9] to-[#0369A1]',
    },
    {
      key: 'quotation',
      title: 'Báo giá',
      desc: 'Tạo báo giá cho khách',
      icon: 'request_quote',
      gradient: 'from-[#6366F1] to-[#4338CA]',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo nhanh"
      subtitle="Chọn loại chứng từ bạn muốn tạo"
      icon="bolt"
      width="md"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 py-1">
        {options.map(opt => (
          <button
            key={opt.key}
            type="button"
            onClick={() => {
              onClose();
              onSelectAction(opt.key);
            }}
            className="p-4 rounded-[16px] border border-[#F1F2F5] hover:border-[#6D3EEB] hover:shadow-[0_8px_20px_-6px_rgba(109,62,235,0.18)] transition-all flex items-center justify-between text-left group bg-white cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`w-10 h-10 rounded-[12px] bg-gradient-to-br ${opt.gradient} text-white flex items-center justify-center shrink-0 shadow-sm`}
              >
                <Icon name={opt.icon} size={22} />
              </div>
              <div>
                <div className="text-[14.5px] font-semibold text-[#111827] group-hover:text-[#6D3EEB] transition-colors leading-tight">
                  {opt.title}
                </div>
                <div className="text-[12.5px] text-[#6B7280] mt-0.5 font-normal">
                  {opt.desc}
                </div>
              </div>
            </div>
            <Icon
              name="chevron_right"
              size={18}
              className="text-[#9CA3AF] group-hover:text-[#6D3EEB] group-hover:translate-x-0.5 transition-all"
            />
          </button>
        ))}
      </div>
    </Modal>
  );
};
