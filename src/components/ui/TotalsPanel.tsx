import React from 'react';
import { formatCurrency } from '../../lib/format';

interface TotalsPanelProps {
  subtotal: number;
  discountAmount: number;
  vatRate: number;
  vatAmount: number;
  shippingFee: number;
  total: number;
  paidAmount: number;
  debtAmount: number;
  isPurchase?: boolean;
}

export const TotalsPanel: React.FC<TotalsPanelProps> = ({
  subtotal,
  discountAmount,
  vatRate,
  vatAmount,
  shippingFee,
  total,
  paidAmount,
  debtAmount,
  isPurchase = false,
}) => {
  return (
    <div className="bg-transparent rounded-[16px] p-5 border border-[#E5E7EB] dark:border-[#334155] text-[13.5px]">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-[#4B5563] dark:text-[#CBD5E1]">
          <span>Tạm tính hàng hóa</span>
          <span className="font-semibold text-[#111827] dark:text-[#F8FAFC] tabular-nums">
            {formatCurrency(subtotal)}
          </span>
        </div>

        <div className="flex items-center justify-between text-[#E11D48] dark:text-[#FB7185]">
          <span>Chiết khấu (trừ trước VAT)</span>
          <span className="font-semibold tabular-nums">
            -{formatCurrency(discountAmount)}
          </span>
        </div>

        <div className="flex items-center justify-between text-[#059669] dark:text-[#34D399]">
          <span>VAT ({vatRate}%) (cộng)</span>
          <span className="font-semibold tabular-nums">
            +{formatCurrency(vatAmount)}
          </span>
        </div>

        <div className="flex items-center justify-between text-[#059669] dark:text-[#34D399]">
          <span>Phí vận chuyển (cộng)</span>
          <span className="font-semibold tabular-nums">
            +{formatCurrency(shippingFee)}
          </span>
        </div>

        <div className="h-[1px] bg-[#E5E7EB] dark:bg-[#334155] my-2" />

        <div className="flex items-center justify-between text-[#111827] dark:text-[#F8FAFC]">
          <span className="font-bold text-[15px]">
            {isPurchase ? 'Tổng phải trả' : 'Tổng phải thu'}
          </span>
          <span className="font-bold text-[18px] tabular-nums text-[#6D3EEB] dark:text-[#C084FC]">
            {formatCurrency(total)}
          </span>
        </div>

        <div className="flex items-center justify-between text-[#6317D6] dark:text-[#C084FC]">
          <span>Đã thanh toán</span>
          <span className="font-semibold tabular-nums">
            {formatCurrency(paidAmount)}
          </span>
        </div>

        <div className="flex items-center justify-between text-[#E11D48] dark:text-[#FB7185]">
          <span className="font-medium">
            {isPurchase
              ? 'Còn lại — ghi nợ nhà cung cấp'
              : 'Còn lại — ghi nợ khách hàng'}
          </span>
          <span className="font-bold text-[15px] tabular-nums">
            {formatCurrency(debtAmount)}
          </span>
        </div>
      </div>

      <p className="mt-4 pt-3 border-t border-[#F1F2F5] dark:border-[#334155] text-[11.5px] text-[#6B7280] dark:text-[#94A3B8] leading-relaxed">
        ⓘ Chiết khấu luôn được TRỪ khỏi tạm tính. VAT được tính trên số tiền sau chiết khấu, sau đó cộng phí vận chuyển.
      </p>
    </div>
  );
};
