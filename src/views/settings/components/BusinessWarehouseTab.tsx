import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Icon } from '../../../components/ui/Icon';

export const BusinessWarehouseTab: React.FC = () => {
  const { companySettings, updateSettings } = useApp();

  const [allowNegativeStock, setAllowNegativeStock] = useState(companySettings.allow_negative_stock);
  const [defaultMinStock, setDefaultMinStock] = useState(companySettings.default_min_stock);
  const [allocateShippingToCost, setAllocateShippingToCost] = useState(
    companySettings.allocate_shipping_to_cost ?? true
  );
  const [valuationMethod, setValuationMethod] = useState<'weighted_average' | 'fifo'>('weighted_average');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings({
      allow_negative_stock: allowNegativeStock,
      default_min_stock: defaultMinStock,
      allocate_shipping_to_cost: allocateShippingToCost,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F1F2F5] dark:border-[#334155]">
        <div>
          <h3 className="text-[20px] font-bold text-[#111827] dark:text-[#F8FAFC]">Quản lý Kho & Tồn kho An toàn</h3>
          <p className="text-[14.5px] text-[#4B5563] dark:text-[#94A3B8] mt-0.5">
            Cấu hình xuất âm kho, định mức tồn kho tối thiểu và phương pháp tính giá vốn
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="h-10 px-5 bg-[#6D3EEB] hover:bg-[#5B2BD6] text-white text-[14.5px] font-semibold rounded-[12px] shadow-sm flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
        >
          <Icon name="save" size={18} />
          <span>Lưu cấu hình kho</span>
        </button>
      </div>

      {saved && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-[12px] flex items-center gap-2.5 text-[14.5px] font-semibold">
          <Icon name="check_circle" size={20} className="text-emerald-600 dark:text-emerald-400" />
          <span>Đã cập nhật quy định nghiệp vụ kho thành công!</span>
        </div>
      )}

      <div className="bg-transparent rounded-[16px] p-6 border border-[#F1F2F5] dark:border-[#334155] shadow-xs space-y-6">
        {/* Negative Stock Toggle (No background / Trong suốt) */}
        <div className={`p-5 rounded-[14px] border transition-all ${
          allowNegativeStock
            ? 'bg-transparent border-amber-300 dark:border-amber-700/50'
            : 'bg-transparent border-gray-200 dark:border-[#334155]'
        }`}>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={allowNegativeStock}
              onChange={e => setAllowNegativeStock(e.target.checked)}
              className="w-4.5 h-4.5 mt-0.5 rounded text-[#6D3EEB] focus:ring-[#6D3EEB]"
            />
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-[15px] font-bold text-[#111827] dark:text-[#F8FAFC]">
                  Cho phép bán âm kho (Negative Stock Allowed)
                </span>
                {allowNegativeStock ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-transparent text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60">
                    Đang bật
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-transparent text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-[#334155]">
                    Khóa xuất âm
                  </span>
                )}
              </div>
              <p className="text-[13.5px] text-[#4B5563] dark:text-[#CBD5E1] mt-1.5 leading-relaxed">
                Khi bật tính năng này, hệ thống vẫn cho phép lập hóa đơn và phiếu xuất kho ngay cả khi số lượng tồn kho của sản phẩm không đủ hoặc bằng 0. Khi hàng về nhập bù sau, giá vốn sẽ được tự động tính toán lại.
              </p>
            </div>
          </label>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
          <div>
            <label className="block text-[14.5px] font-medium text-[#374151] dark:text-[#CBD5E1] mb-1.5">
              Định mức tồn tối thiểu mặc định (Báo sắp hết)
            </label>
            <div className="flex items-center gap-2.5">
              <input
                type="number"
                min={0}
                value={defaultMinStock}
                onChange={e => setDefaultMinStock(Number(e.target.value))}
                className="w-full h-10 px-3.5 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[14.5px] font-mono text-[#111827] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6D3EEB]"
              />
              <span className="text-[14px] text-[#4B5563] dark:text-[#94A3B8] shrink-0 font-medium">sản phẩm</span>
            </div>
            <span className="text-[13px] text-[#6B7280] dark:text-[#94A3B8] mt-1.5 block">
              Khi tồn kho thực tế chạm mức này, sản phẩm sẽ được gắn badge cảnh báo màu vàng &ldquo;Sắp hết&rdquo;.
            </span>
          </div>

          <div>
            <label className="block text-[14.5px] font-medium text-[#374151] dark:text-[#CBD5E1] mb-1.5">
              Phương pháp định giá hàng tồn kho
            </label>
            <select
              value={valuationMethod}
              onChange={e => setValuationMethod(e.target.value as any)}
              className="w-full h-10 px-3.5 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[14.5px] text-[#111827] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6D3EEB]"
            >
              <option value="weighted_average">Bình quân gia quyền liên hoàn (Khuyên dùng)</option>
              <option value="fifo">Nhập trước - Xuất trước (FIFO)</option>
            </select>
            <span className="text-[13px] text-[#6B7280] dark:text-[#94A3B8] mt-1.5 block">
              Chuẩn mực kế toán Việt Nam VAS 02 quy định tính giá trị xuất kho.
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-[#334155]">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={allocateShippingToCost}
              onChange={e => setAllocateShippingToCost(e.target.checked)}
              className="w-4.5 h-4.5 mt-0.5 rounded text-[#6D3EEB] focus:ring-[#6D3EEB]"
            />
            <div>
              <span className="text-[14.5px] font-semibold text-[#111827] dark:text-[#F8FAFC] block">
                Tự động phân bổ chi phí vận chuyển mua hàng vào giá vốn sản phẩm
              </span>
              <span className="text-[13.5px] text-[#4B5563] dark:text-[#94A3B8] block mt-0.5">
                Cước vận chuyển thanh toán cho nhà xe/đơn vị ship khi nhập hàng sẽ được cộng trực tiếp vào giá trị nhập kho của từng mặt hàng theo tỷ lệ giá trị hoặc số lượng.
              </span>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};
