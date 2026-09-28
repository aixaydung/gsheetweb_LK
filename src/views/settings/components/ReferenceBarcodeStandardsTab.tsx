import React, { useState } from 'react';
import { CODE_STANDARDS } from '../settingsData';
import { Icon } from '../../../components/ui/Icon';

export const ReferenceBarcodeStandardsTab: React.FC = () => {
  const [eanInput, setEanInput] = useState('893601234567');
  
  const calculateCheckDigit = (first12: string) => {
    if (!/^\d{12}$/.test(first12)) return null;
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(first12[i], 10);
      sum += i % 2 === 0 ? digit : digit * 3;
    }
    const remainder = sum % 10;
    return remainder === 0 ? 0 : 10 - remainder;
  };

  const checkDigit = calculateCheckDigit(eanInput);
  const fullEan = checkDigit !== null ? `${eanInput}${checkDigit}` : null;

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#F1F2F5] dark:border-[#334155]">
        <h3 className="text-[20px] font-bold text-[#111827] dark:text-[#F8FAFC]">
          Quy chuẩn Mã định danh & Mã vạch EAN-13 chuẩn GS1
        </h3>
        <p className="text-[14.5px] text-[#4B5563] dark:text-[#94A3B8] mt-0.5">
          Quy tắc cấu trúc tiền tố chứng từ hệ thống NexUpOne và hướng dẫn đăng ký/tạo mã vạch thương phẩm quốc gia
        </p>
      </div>

      {/* Interactive EAN-13 Simulator */}
      <div className="bg-transparent rounded-[18px] p-6 border border-purple-300 dark:border-purple-800/60 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Icon name="barcode_scanner" size={24} className="text-[#6D3EEB] dark:text-[#C084FC]" />
            <h4 className="text-[16px] font-bold text-[#111827] dark:text-[#F8FAFC]">Công cụ tính số kiểm tra Check Digit (EAN-13)</h4>
          </div>
          <span className="text-[12px] font-bold bg-transparent border border-purple-300 dark:border-purple-800/60 text-[#6D3EEB] dark:text-[#C084FC] px-3 py-1 rounded-full">
            GS1 Vietnam (893)
          </span>
        </div>

        <p className="text-[14px] text-[#4B5563] dark:text-[#CBD5E1] leading-relaxed">
          Mã vạch EAN-13 gồm 12 số dữ liệu đầu + 1 số kiểm tra cuối cùng tính theo thuật toán Modulo 10. Đầu số <strong>893</strong> là mã quốc gia Việt Nam được tổ chức GS1 quốc tế cấp.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3.5">
          <div className="w-full sm:w-80">
            <label className="block text-[13px] font-semibold text-[#374151] dark:text-[#CBD5E1] mb-1.5">
              Nhập 12 chữ số đầu tiên:
            </label>
            <input
              type="text"
              maxLength={12}
              value={eanInput}
              onChange={e => setEanInput(e.target.value.replace(/\D/g, ''))}
              placeholder="893xxxxxxxx"
              className="w-full h-10 px-3.5 bg-white dark:bg-[#0F172A] border border-[#D8B4FE] dark:border-[#334155] rounded-[10px] font-mono text-[14.5px] font-bold text-[#111827] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6D3EEB]"
            />
          </div>

          <div className="flex-1 w-full p-3.5 bg-transparent rounded-[12px] border border-gray-200 dark:border-[#334155] flex items-center justify-between">
            <div>
              <span className="text-[12px] text-[#6B7280] dark:text-[#94A3B8] block">Mã vạch 13 số hoàn chỉnh:</span>
              {fullEan ? (
                <div className="flex items-center gap-1 font-mono text-[17px] font-black text-[#6317D6] dark:text-[#C084FC]">
                  <span>{eanInput}</span>
                  <span className="text-emerald-700 dark:text-emerald-400 bg-transparent border border-emerald-300 dark:border-emerald-800/60 px-1.5 rounded">{checkDigit}</span>
                </div>
              ) : (
                <span className="text-[13.5px] text-amber-700 dark:text-amber-400 italic">Vui lòng nhập đủ đúng 12 chữ số</span>
              )}
            </div>
            {fullEan && (
              <span className="text-[12.5px] font-semibold text-emerald-800 dark:text-emerald-300 bg-transparent px-3 py-1 rounded-md border border-emerald-300 dark:border-emerald-800/60">
                Check Digit: {checkDigit}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Document Prefix Standards */}
      <div className="bg-transparent rounded-[16px] border border-[#E5E7EB] dark:border-[#334155] shadow-xs overflow-hidden">
        <div className="p-4 bg-transparent border-b border-[#E5E7EB] dark:border-[#334155]">
          <h4 className="text-[15px] font-bold text-[#111827] dark:text-[#F8FAFC]">
            Bảng quy tắc tiền tố chứng từ tự động của NexUpOne
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-transparent text-[#4B5563] dark:text-[#94A3B8] text-[12.5px] uppercase font-semibold border-b border-[#E5E7EB] dark:border-[#334155]">
              <tr>
                <th className="py-3 px-4">Tiền tố</th>
                <th className="py-3 px-4">Loại chứng từ</th>
                <th className="py-3 px-4">Quy tắc sinh số</th>
                <th className="py-3 px-4">Mã mẫu</th>
                <th className="py-3 px-4">Mục đích sử dụng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F2F5] dark:divide-[#334155]">
              {CODE_STANDARDS.map(std => (
                <tr key={std.prefix} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-[13px] bg-transparent text-[#6317D6] dark:text-[#C084FC] px-2.5 py-1 rounded-md border border-purple-300 dark:border-purple-800/60">
                      {std.prefix}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-[#111827] dark:text-[#F8FAFC]">{std.name}</td>
                  <td className="py-3 px-4 font-mono text-[13px] text-[#4B5563] dark:text-[#94A3B8]">{std.rule}</td>
                  <td className="py-3 px-4 font-mono font-bold text-[#111827] dark:text-[#F8FAFC]">{std.example}</td>
                  <td className="py-3 px-4 text-[#4B5563] dark:text-[#CBD5E1] text-[13.5px]">{std.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
