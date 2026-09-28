import React, { useState } from 'react';
import { ACCOUNT_CHART_REFERENCE } from '../settingsData';
import { Icon } from '../../../components/ui/Icon';

export const ReferenceAccountsTab: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedNature, setSelectedNature] = useState<string>('all');

  const filtered = ACCOUNT_CHART_REFERENCE.filter(acc => {
    const matchesNature = selectedNature === 'all' || acc.nature === selectedNature;
    const matchesSearch =
      acc.code.includes(search) ||
      acc.name.toLowerCase().includes(search.toLowerCase()) ||
      acc.category.toLowerCase().includes(search.toLowerCase()) ||
      acc.description.toLowerCase().includes(search.toLowerCase());
    return matchesNature && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#F1F2F5] dark:border-[#334155]">
        <h3 className="text-[20px] font-bold text-[#111827] dark:text-[#F8FAFC]">
          Hệ thống Tài khoản Kế toán Thương mại & Kho hàng (TT 200/TT 133)
        </h3>
        <p className="text-[14.5px] text-[#4B5563] dark:text-[#94A3B8] mt-0.5">
          Bảng tra cứu số hiệu tài khoản hạch toán phục vụ định khoản tự động hóa đơn, phiếu kho và báo cáo tài chính
        </p>
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-transparent p-3.5 rounded-[16px] border border-[#E5E7EB] dark:border-[#334155] shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'Dư Nợ', 'Dư Có', 'Lưỡng tính', 'Không có số dư'].map(nat => (
            <button
              key={nat}
              onClick={() => setSelectedNature(nat)}
              className={`px-3.5 py-1.5 rounded-[10px] text-[13.5px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedNature === nat
                  ? 'bg-[#6D3EEB] text-white'
                  : 'bg-transparent text-[#4B5563] dark:text-[#CBD5E1] hover:bg-[#F3F4F6] dark:hover:bg-slate-800/40 border border-[#E5E7EB] dark:border-[#334155]'
              }`}
            >
              {nat === 'all' ? 'Tất cả tính chất' : nat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Icon name="search" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Tìm theo số hiệu TK (111, 131, 156...), tên tài khoản..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-3.5 bg-transparent border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[14px] text-[#111827] dark:text-[#F8FAFC] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#6D3EEB]"
          />
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-transparent rounded-[16px] border border-[#E5E7EB] dark:border-[#334155] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-transparent text-[#4B5563] dark:text-[#94A3B8] text-[12.5px] uppercase font-semibold border-b border-[#E5E7EB] dark:border-[#334155]">
              <tr>
                <th className="py-3 px-4">Số hiệu TK</th>
                <th className="py-3 px-4">Tên tài khoản</th>
                <th className="py-3 px-4">Phân loại</th>
                <th className="py-3 px-4">Tính chất số dư</th>
                <th className="py-3 px-4">Diễn giải nghiệp vụ áp dụng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F2F5] dark:divide-[#334155]">
              {filtered.map(acc => (
                <tr key={acc.code} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-black text-[14px] text-[#6317D6] dark:text-[#C084FC] bg-transparent px-3 py-1 rounded-md border border-purple-300 dark:border-purple-800/60">
                      {acc.code}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#111827] dark:text-[#F8FAFC]">{acc.name}</td>
                  <td className="py-3.5 px-4 text-[#4B5563] dark:text-[#94A3B8]">{acc.category}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[12px] font-bold bg-transparent ${
                        acc.nature === 'Dư Nợ'
                          ? 'text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800/60'
                          : acc.nature === 'Dư Có'
                          ? 'text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60'
                          : acc.nature === 'Lưỡng tính'
                          ? 'text-[#6317D6] dark:text-[#C084FC] border border-purple-300 dark:border-purple-800/60'
                          : 'text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-[#334155]'
                      }`}
                    >
                      {acc.nature}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#374151] dark:text-[#CBD5E1] text-[13.5px] max-w-sm">{acc.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
