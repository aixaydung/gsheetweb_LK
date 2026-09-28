import React, { useState } from 'react';
import { UPGRADE_MODULES_ROADMAP, UpgradeModule } from '../settingsData';
import { Icon } from '../../../components/ui/Icon';

export const UpgradeRoadmapTab: React.FC = () => {
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<UpgradeModule | null>(null);
  const [hideImplemented, setHideImplemented] = useState<boolean>(true); // Mặc định ẩn các phần đã có
  const [betaRegistered, setBetaRegistered] = useState<Record<string, boolean>>({
    'e-invoice': true,
  });

  const implementedCount = UPGRADE_MODULES_ROADMAP.filter(m => m.isImplemented).length;

  const phases = [
    { id: 'all', label: 'Tất cả đợt nâng cấp' },
    { id: 'Đợt 2 - Q4/2026', label: 'Đợt 2 (Q4/2026)' },
    { id: 'Đợt 3 - Q1/2027', label: 'Đợt 3 (Q1/2027)' },
    { id: 'Đợt 4 - Q2/2027', label: 'Đợt 4 (Q2/2027)' },
    { id: 'Đợt 5 - Q3/2027', label: 'Đợt 5 (Q3/2027)' },
  ];

  const filteredModules = UPGRADE_MODULES_ROADMAP.filter(mod => {
    // 1. Ẩn các phần đã có theo yêu cầu người dùng
    if (hideImplemented && mod.isImplemented) {
      return false;
    }

    // 2. Lọc theo đợt
    const matchesPhase = selectedPhase === 'all' || mod.phase === selectedPhase;

    // 3. Lọc theo từ khóa tìm kiếm
    const matchesSearch =
      mod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      mod.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesPhase && matchesSearch;
  });

  const toggleBeta = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBetaRegistered(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Banner giới thiệu Lộ trình Nâng cấp */}
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#1E1B4B] via-[#311042] to-[#0F172A] p-5 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#6D3EEB]/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[12px] sm:text-[12.5px] font-semibold text-purple-200 border border-white/10">
            <Icon name="rocket_launch" size={16} className="text-[#A78BFA]" />
            <span>Kế hoạch phát triển mở rộng phiên bản Enterprise</span>
          </div>
          <h2 className="text-[20px] sm:text-[26px] font-black tracking-tight leading-tight">
            Lộ trình Module Nâng cấp các đợt tiếp theo
          </h2>
          <p className="text-[13px] sm:text-[14px] text-gray-300 leading-relaxed">
            Các phân hệ mở rộng dưới đây nằm trong kế hoạch phát hành tiếp theo của LK ERM nhằm đáp ứng toàn diện
            nhu cầu từ doanh nghiệp thương mại chuỗi, đồng bộ đa sàn TMĐT, xưởng sản xuất định mức BOM và hóa đơn điện tử CQT.
          </p>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1 text-[12px] sm:text-[12.5px] text-purple-200/90 font-medium">
            <span className="flex items-center gap-1.5">
              <Icon name="check_circle" size={17} className="text-emerald-400" />
              <span>{UPGRADE_MODULES_ROADMAP.filter(m => !m.isImplemented).length} Phân hệ chiến lược kế hoạch</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="event" size={17} className="text-purple-300" />
              <span>4 Đợt phát hành liên tục 2026 - 2027</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="api" size={17} className="text-amber-300" />
              <span>100% Kiến trúc mở Open API & Webhooks</span>
            </span>
          </div>
        </div>
      </div>

      {/* Thông báo trạng thái lọc các phân hệ đã có */}
      {implementedCount > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 sm:p-3.5 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-[14px] text-[13px]">
          <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-medium">
            <Icon name="task_alt" size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              {hideImplemented ? (
                <>
                  Đã tự động ẩn <strong>{implementedCount} phân hệ đã có sẵn</strong> trong hệ thống (Hệ thống Đa Chi nhánh & Kho hàng).
                </>
              ) : (
                <>
                  Đang hiển thị toàn bộ lộ trình bao gồm các phân hệ đã tích hợp xong.
                </>
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setHideImplemented(!hideImplemented)}
            className="self-start sm:self-auto px-3 py-1 bg-white dark:bg-[#1E293B] border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-[8px] font-semibold text-[12px] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Icon name={hideImplemented ? 'visibility' : 'visibility_off'} size={15} />
            <span>{hideImplemented ? 'Xem lại phân hệ đã có' : 'Ẩn phân hệ đã có'}</span>
          </button>
        </div>
      )}

      {/* Toolbar lọc theo đợt & tìm kiếm */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-transparent p-3 sm:p-3.5 rounded-[16px] border border-[#F1F2F5] dark:border-[#334155] shadow-xs">
        {/* Phase Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {phases.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPhase(p.id)}
              className={`px-3 sm:px-3.5 py-1.5 rounded-[10px] text-[12.5px] sm:text-[13.5px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedPhase === p.id
                  ? 'bg-[#6D3EEB] text-white shadow-xs'
                  : 'bg-transparent text-[#4B5563] dark:text-[#CBD5E1] hover:bg-[#F3F4F6] dark:hover:bg-slate-800/40 border border-[#E5E7EB] dark:border-[#334155]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px] sm:min-w-[260px]">
          <Icon
            name="search"
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
          />
          <input
            type="text"
            placeholder="Tìm kiếm module hoặc tính năng..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-3.5 bg-transparent border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[13.5px] text-[#111827] dark:text-[#F8FAFC] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#6D3EEB]"
          />
        </div>
      </div>

      {/* Grid danh sách các Module Nâng cấp */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {filteredModules.map(mod => {
          const isBeta = !!betaRegistered[mod.id];
          return (
            <div
              key={mod.id}
              onClick={() => setSelectedModule(mod)}
              className={`group bg-transparent rounded-[18px] p-4 sm:p-6 border transition-all cursor-pointer flex flex-col justify-between ${
                mod.isImplemented
                  ? 'border-emerald-300 dark:border-emerald-800/80 bg-transparent'
                  : 'border-[#E5E7EB]/90 dark:border-[#334155] hover:border-[#6D3EEB]/60 shadow-xs'
              }`}
            >
              <div className="space-y-3.5 sm:space-y-4">
                {/* Header card: Icon + Phase + Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 sm:w-12 sm:h-12 rounded-[14px] ${mod.iconBg} ${mod.iconColor} dark:bg-slate-800 flex items-center justify-center shrink-0 border border-black/5 dark:border-white/10 group-hover:scale-105 transition-transform`}
                    >
                      <Icon name={mod.icon} size={24} />
                    </div>
                    <div>
                      <span className="text-[11px] sm:text-[11.5px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#94A3B8] block">
                        {mod.phase}
                      </span>
                      <h3 className="text-[15px] sm:text-[16px] font-bold text-[#111827] dark:text-[#F8FAFC] group-hover:text-[#6D3EEB] dark:group-hover:text-[#C084FC] transition-colors leading-snug">
                        {mod.title}
                      </h3>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10.5px] sm:text-[11px] font-bold whitespace-nowrap bg-transparent border border-gray-200 dark:border-[#334155] ${mod.badgeText} shrink-0`}
                  >
                    {mod.badge}
                  </span>
                </div>

                {/* Subtitle */}
                <p className="text-[12.5px] sm:text-[13px] text-[#4B5563] dark:text-[#CBD5E1] leading-relaxed line-clamp-2">
                  {mod.subtitle}
                </p>

                {/* Highlight Points */}
                <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-transparent rounded-[12px] border border-[#F1F2F5] dark:border-[#334155]">
                  {mod.highlightPoints.map((hp, idx) => (
                    <div key={idx} className="text-center">
                      <span className="text-[10px] sm:text-[10.5px] text-[#6B7280] dark:text-[#94A3B8] block leading-tight truncate">
                        {hp.label}
                      </span>
                      <span className="text-[11.5px] sm:text-[12px] font-bold text-[#111827] dark:text-[#F8FAFC] truncate block mt-0.5">
                        {hp.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Features Checklist */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] sm:text-[11.5px] font-bold text-[#374151] dark:text-[#CBD5E1] uppercase tracking-wide block">
                    Tính năng trọng tâm:
                  </span>
                  <ul className="space-y-1">
                    {mod.features.slice(0, 3).map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2 text-[12px] sm:text-[12.5px] text-[#4B5563] dark:text-[#CBD5E1]">
                        <Icon
                          name="check"
                          size={15}
                          className="text-[#6D3EEB] dark:text-[#C084FC] shrink-0 mt-0.5 font-bold"
                        />
                        <span className="line-clamp-1">{feat}</span>
                      </li>
                    ))}
                    {mod.features.length > 3 && (
                      <li className="text-[11px] sm:text-[11.5px] text-[#6D3EEB] dark:text-[#C084FC] font-semibold pl-5 pt-0.5">
                        + {mod.features.length - 3} tính năng chi tiết khác...
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Footer: Progress & Action */}
              <div className="pt-4 sm:pt-5 mt-4 border-t border-[#F1F2F5] dark:border-[#334155] space-y-3">
                {/* Readiness progress bar */}
                <div>
                  <div className="flex items-center justify-between text-[11px] sm:text-[11.5px] font-medium text-[#6B7280] dark:text-[#94A3B8] mb-1">
                    <span>Mức độ hoàn thiện thiết kế</span>
                    <span className="font-bold text-[#111827] dark:text-[#F8FAFC]">{mod.readinessPercentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#F1F2F5] dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#6D3EEB] to-[#A855F7] rounded-full transition-all duration-500"
                      style={{ width: `${mod.readinessPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  {mod.isImplemented ? (
                    <span className="px-3 py-1 rounded-[10px] text-[11.5px] font-bold bg-transparent text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                      <Icon name="check_circle" size={14} />
                      <span>Đang hoạt động trong ERP</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => toggleBeta(mod.id, e)}
                      className={`px-2.5 sm:px-3 py-1.5 rounded-[10px] text-[11.5px] sm:text-[12px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isBeta
                          ? 'bg-transparent text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-transparent border border-gray-200 dark:border-[#334155] hover:bg-gray-50/50 dark:hover:bg-slate-800/40 text-[#374151] dark:text-[#CBD5E1]'
                      }`}
                    >
                      <Icon
                        name={isBeta ? 'check_circle' : 'notifications_active'}
                        size={15}
                        className={isBeta ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#6B7280]'}
                      />
                      <span>{isBeta ? 'Đã đăng ký Beta' : 'Nhận tin khi ra mắt'}</span>
                    </button>
                  )}

                  <span className="text-[12px] sm:text-[12.5px] font-bold text-[#6D3EEB] dark:text-[#C084FC] group-hover:underline flex items-center gap-1">
                    <span>Xem chi tiết</span>
                    <Icon name="arrow_forward" size={14} />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Module Detail Modal */}
      {selectedModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1E293B] rounded-[24px] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-8 shadow-2xl border border-gray-100 dark:border-[#334155] space-y-5 sm:space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#F1F2F5] dark:border-[#334155]">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-[16px] ${selectedModule.iconBg} ${selectedModule.iconColor} dark:bg-slate-800 flex items-center justify-center shrink-0 border border-black/5 dark:border-white/10`}
                >
                  <Icon name={selectedModule.icon} size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#6D3EEB]/10 dark:bg-purple-950/60 text-[#6D3EEB] dark:text-[#C084FC]">
                      {selectedModule.phase}
                    </span>
                    <span className="text-[12px] text-[#6B7280] dark:text-[#94A3B8]">
                      Dự kiến: {selectedModule.targetTimeline}
                    </span>
                  </div>
                  <h3 className="text-[18px] sm:text-[20px] font-black text-[#111827] dark:text-[#F8FAFC] mt-1 leading-snug">
                    {selectedModule.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedModule(null)}
                className="w-8 h-8 rounded-full bg-[#F3F4F6] dark:bg-slate-700 hover:bg-[#E5E7EB] flex items-center justify-center text-[#6B7280] dark:text-[#CBD5E1] transition-colors cursor-pointer"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            {/* Description & Value */}
            <div className="space-y-4">
              <div>
                <h4 className="text-[12.5px] font-bold text-[#374151] dark:text-[#CBD5E1] uppercase tracking-wider mb-1">
                  Mô tả giải pháp nghiệp vụ
                </h4>
                <p className="text-[13.5px] sm:text-[14px] text-[#4B5563] dark:text-[#94A3B8] leading-relaxed">
                  {selectedModule.subtitle}
                </p>
              </div>

              <div className="p-3.5 sm:p-4 bg-transparent border border-purple-300 dark:border-purple-900/50 rounded-[14px]">
                <span className="text-[11.5px] font-bold text-[#6D3EEB] dark:text-[#C084FC] uppercase block mb-1">
                  Giá trị cốt lõi mang lại cho doanh nghiệp
                </span>
                <p className="text-[13px] sm:text-[13.5px] text-[#374151] dark:text-[#CBD5E1] font-medium leading-relaxed">
                  {selectedModule.businessValue}
                </p>
              </div>

              {/* Full Features Checklist */}
              <div>
                <h4 className="text-[12.5px] font-bold text-[#374151] dark:text-[#CBD5E1] uppercase tracking-wider mb-2">
                  Danh mục tính năng thành phần chi tiết ({selectedModule.features.length} tính năng)
                </h4>
                <div className="space-y-2 bg-transparent p-3.5 sm:p-4 rounded-[14px] border border-[#F1F2F5] dark:border-[#334155]">
                  {selectedModule.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-[12.5px] sm:text-[13px] text-[#1F2937] dark:text-[#F8FAFC]">
                      <Icon name="check_circle" size={17} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Highlights */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {selectedModule.highlightPoints.map((h, i) => (
                  <div key={i} className="p-2.5 sm:p-3 bg-transparent border border-[#E5E7EB] dark:border-[#334155] rounded-[12px] text-center">
                    <span className="text-[10.5px] sm:text-[11px] text-[#6B7280] dark:text-[#94A3B8] block">{h.label}</span>
                    <span className="text-[12.5px] sm:text-[13.5px] font-bold text-[#111827] dark:text-[#F8FAFC] block mt-0.5">
                      {h.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[12px] font-semibold text-[#6B7280] dark:text-[#94A3B8]">Từ khóa:</span>
                {selectedModule.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-transparent border border-gray-200 dark:border-[#334155] text-gray-700 dark:text-gray-300 rounded-md text-[11px] sm:text-[11.5px] font-medium"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-[#F1F2F5] dark:border-[#334155] flex items-center justify-between">
              <span className="text-[12px] sm:text-[12.5px] text-[#6B7280] dark:text-[#94A3B8]">
                Tiến độ: <strong className="text-[#111827] dark:text-[#F8FAFC]">{selectedModule.readinessPercentage}%</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedModule(null)}
                  className="px-3.5 sm:px-4 py-2 border border-[#E5E7EB] dark:border-[#334155] hover:bg-gray-50 dark:hover:bg-slate-800 rounded-[10px] text-[12.5px] sm:text-[13px] font-semibold text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  Đóng
                </button>
                {!selectedModule.isImplemented && (
                  <button
                    type="button"
                    onClick={(e) => {
                      toggleBeta(selectedModule.id, e);
                      alert(`Đã cập nhật đăng ký tham gia thử nghiệm sớm phân hệ: ${selectedModule.title}`);
                    }}
                    className="px-4 sm:px-5 py-2 bg-[#6D3EEB] hover:bg-[#5B2BD6] text-white rounded-[10px] text-[12.5px] sm:text-[13px] font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Icon name="verified" size={16} />
                    <span>
                      {betaRegistered[selectedModule.id]
                        ? 'Đã đăng ký'
                        : 'Đăng ký trải nghiệm Beta'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
