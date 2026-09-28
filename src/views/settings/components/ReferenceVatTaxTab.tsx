import React, { useState } from 'react';
import { VAT_TAX_REFERENCE } from '../settingsData';
import { Icon } from '../../../components/ui/Icon';

export const ReferenceVatTaxTab: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedRate, setSelectedRate] = useState<string>('all');

  const filteredTaxes = VAT_TAX_REFERENCE.filter(t => {
    const matchesRate = selectedRate === 'all' || t.rate === selectedRate;
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.scope.toLowerCase().includes(search.toLowerCase()) ||
      t.decree.toLowerCase().includes(search.toLowerCase());
    return matchesRate && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#F1F2F5] dark:border-[#334155]">
        <div className="flex items-center gap-2 mb-1">
          {/* Top Pill (No background: Transparent with clear border & text) */}
          <span className="px-3 py-1 rounded-full text-[12px] font-bold bg-transparent text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800/60">
            Cập nhật theo Nghị quyết 142/2024 &amp; NĐ 72/2024
          </span>
        </div>
        <h3 className="text-[20px] font-bold text-[#111827] dark:text-[#F8FAFC] mt-1">
          Biểu thuế suất Giá trị gia tăng (VAT)
        </h3>
        <p className="text-[14.5px] text-[#4B5563] dark:text-[#94A3B8] mt-0.5">
          Bảng tra cứu quy định mức thuế suất GTGT, căn cứ pháp lý và tiểu mục nộp ngân sách nhà nước
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-transparent p-3.5 rounded-[16px] border border-[#E5E7EB] dark:border-[#334155] shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['all', '0%', '5%', '8%', '10%', 'KCT'].map(rate => (
            <button
              key={rate}
              onClick={() => setSelectedRate(rate)}
              className={`px-3.5 py-1.5 rounded-[10px] text-[13.5px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedRate === rate
                  ? 'bg-[#6D3EEB] text-white'
                  : 'bg-transparent text-[#4B5563] dark:text-[#CBD5E1] hover:bg-[#F3F4F6] dark:hover:bg-slate-800/40 border border-[#E5E7EB] dark:border-[#334155]'
              }`}
            >
              {rate === 'all' ? 'Tất cả mức thuế' : `Thuế ${rate}`}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Icon name="search" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Tìm theo tên hàng hóa, nghị định..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-3.5 bg-transparent border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[14px] text-[#111827] dark:text-[#F8FAFC] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#6D3EEB]"
          />
        </div>
      </div>

      {/* Tax Table Cards */}
      <div className="space-y-4">
        {filteredTaxes.map((tax, idx) => (
          <div
            key={idx}
            className="bg-transparent rounded-[16px] p-5 border border-[#E5E7EB] dark:border-[#334155] hover:border-[#6D3EEB]/40 shadow-xs space-y-3.5 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-gray-100 dark:border-[#334155]">
              <div className="flex items-center gap-3">
                <span className="w-13 h-13 rounded-[12px] bg-transparent text-[#6317D6] dark:text-[#C084FC] flex items-center justify-center font-black text-[17px] shrink-0 border border-purple-300 dark:border-purple-800/60">
                  {tax.rate}
                </span>
                <div>
                  <h4 className="text-[16px] font-bold text-[#111827] dark:text-[#F8FAFC]">{tax.name}</h4>
                  <span className="text-[13px] text-[#4B5563] dark:text-[#94A3B8] font-mono">{tax.taxItemCode}</span>
                </div>
              </div>

              <span className="text-[12.5px] font-semibold text-[#4B5563] dark:text-[#CBD5E1] bg-transparent px-3 py-1 rounded-md border border-gray-200 dark:border-[#334155] self-start sm:self-auto">
                {tax.decree}
              </span>
            </div>

            <div>
              <span className="text-[12.5px] font-bold text-[#374151] dark:text-[#94A3B8] uppercase tracking-wide block mb-1">
                Phạm vi đối tượng áp dụng:
              </span>
              <p className="text-[14px] text-[#374151] dark:text-[#CBD5E1] leading-relaxed">{tax.scope}</p>
            </div>

            {/* Note Box (No background / Trong suốt) */}
            <div className="p-3.5 bg-transparent border border-amber-300 dark:border-amber-700/60 rounded-[12px] text-[13.5px] text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <Icon name="tips_and_updates" size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-amber-950 dark:text-amber-300">Lưu ý nghiệp vụ:</strong> {tax.note}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
