import React, { useState } from 'react';
import { VIETNAM_BANKS_REFERENCE } from '../settingsData';
import { Icon } from '../../../components/ui/Icon';

export const ReferenceBanksTab: React.FC = () => {
  const [search, setSearch] = useState('');
  const [copiedBin, setCopiedBin] = useState<string | null>(null);

  const filtered = VIETNAM_BANKS_REFERENCE.filter(b =>
    b.shortName.toLowerCase().includes(search.toLowerCase()) ||
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.bin.includes(search) ||
    b.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (bin: string) => {
    navigator.clipboard?.writeText(bin);
    setCopiedBin(bin);
    setTimeout(() => setCopiedBin(null), 1800);
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#F1F2F5] dark:border-[#334155]">
        <h3 className="text-[20px] font-bold text-[#111827] dark:text-[#F8FAFC]">
          Bảng mã định danh ngân hàng Việt Nam (BIN Napas 24/7)
        </h3>
        <p className="text-[14.5px] text-[#4B5563] dark:text-[#94A3B8] mt-0.5">
          Danh mục hơn 24 ngân hàng thương mại Việt Nam có hỗ trợ chuẩn VietQR và chuyển khoản nhanh liên ngân hàng
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3 bg-transparent p-3.5 rounded-[16px] border border-[#E5E7EB] dark:border-[#334155] shadow-xs">
        <div className="relative flex-1">
          <Icon name="search" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Tìm theo tên ngân hàng, mã BIN (VD: 970422), mã chứng khoán (MB, VCB)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-3.5 bg-transparent border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[14px] text-[#111827] dark:text-[#F8FAFC] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#6D3EEB]"
          />
        </div>
        <span className="text-[14px] font-medium text-[#4B5563] dark:text-[#94A3B8] shrink-0">
          Tìm thấy <strong className="text-[#111827] dark:text-white">{filtered.length}</strong> ngân hàng
        </span>
      </div>

      {/* Table */}
      <div className="bg-transparent rounded-[16px] border border-[#E5E7EB] dark:border-[#334155] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-transparent text-[#4B5563] dark:text-[#94A3B8] text-[12.5px] uppercase font-semibold border-b border-[#E5E7EB] dark:border-[#334155]">
              <tr>
                <th className="py-3 px-4">Tên viết tắt</th>
                <th className="py-3 px-4">Mã BIN Napas</th>
                <th className="py-3 px-4">Tên đầy đủ ngân hàng</th>
                <th className="py-3 px-4">Mã Swift</th>
                <th className="py-3 px-4 text-center">VietQR 24/7</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F2F5] dark:divide-[#334155]">
              {filtered.map(bank => (
                <tr key={bank.bin} className="hover:bg-[#FAF5FF]/30 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#111827] dark:text-[#F8FAFC]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-transparent border border-purple-300 dark:border-purple-800/60 text-[#6D3EEB] dark:text-[#C084FC] flex items-center justify-center text-[12px] font-black shrink-0">
                        {bank.shortName.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-[14.5px]">{bank.shortName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-[#6317D6] dark:text-[#C084FC] bg-transparent px-2.5 py-1 rounded-md border border-purple-300 dark:border-purple-800/60 text-[13.5px]">
                      {bank.bin}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#374151] dark:text-[#CBD5E1] max-w-xs">{bank.name}</td>
                  <td className="py-3.5 px-4 font-mono text-[#4B5563] dark:text-[#94A3B8]">{bank.swift || '—'}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-bold bg-transparent border border-emerald-300 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400">
                      <Icon name="check" size={14} /> Sẵn sàng
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleCopy(bank.bin)}
                      className="px-3 py-1.5 text-[12.5px] font-semibold text-[#6D3EEB] dark:text-[#C084FC] hover:bg-purple-50 dark:hover:bg-purple-950/30 rounded-lg border border-purple-300 dark:border-purple-800/60 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Icon name={copiedBin === bank.bin ? 'check' : 'content_copy'} size={14} />
                      <span>{copiedBin === bank.bin ? 'Đã sao chép' : 'Copy BIN'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
