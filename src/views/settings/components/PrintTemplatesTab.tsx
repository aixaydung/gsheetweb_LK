import React, { useState } from 'react';
import { Icon } from '../../../components/ui/Icon';

export const PrintTemplatesTab: React.FC = () => {
  const [paperSize, setPaperSize] = useState<'A4' | 'A5' | 'K80'>('A4');
  const [invoiceTitle, setInvoiceTitle] = useState('HÓA ĐƠN BÁN HÀNG');
  const [stockOutTitle, setStockOutTitle] = useState('PHIẾU XUẤT KHO KIÊM BẢO HÀNH');
  const [showLogo, setShowLogo] = useState(true);
  const [showQr, setShowQr] = useState(true);
  const [showSignatures, setShowSignatures] = useState(true);
  const [thankYouNote, setThankYouNote] = useState('Cảm ơn Quý khách đã tin tưởng và ủng hộ sản phẩm của chúng tôi!');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem(
      'nexupone_print_config',
      JSON.stringify({
        paperSize,
        invoiceTitle,
        stockOutTitle,
        showLogo,
        showQr,
        showSignatures,
        thankYouNote,
      })
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F1F2F5] dark:border-[#334155]">
        <div>
          <h3 className="text-[20px] font-bold text-[#111827] dark:text-[#F8FAFC]">Mẫu in &amp; Thiết lập chứng từ</h3>
          <p className="text-[14.5px] text-[#4B5563] dark:text-[#94A3B8] mt-0.5">
            Tùy biến tiêu đề hóa đơn, kích thước trang in ấn và chữ ký các bên liên quan
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="h-10 px-5 bg-[#6D3EEB] hover:bg-[#5B2BD6] text-white text-[14.5px] font-semibold rounded-[12px] shadow-sm flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
        >
          <Icon name="save" size={18} />
          <span>Lưu cấu hình in</span>
        </button>
      </div>

      {saved && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-[12px] flex items-center gap-2.5 text-[14.5px] font-semibold">
          <Icon name="check_circle" size={20} className="text-emerald-600 dark:text-emerald-400" />
          <span>Đã lưu thành công cấu hình mẫu in!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Form settings (8 cols) */}
        <div className="lg:col-span-8 bg-transparent rounded-[16px] p-6 border border-[#F1F2F5] dark:border-[#334155] shadow-xs space-y-6">
          {/* Paper Size Selector */}
          <div>
            <label className="block text-[14.5px] font-bold text-[#111827] dark:text-[#F8FAFC] mb-2.5">
              Khổ giấy in mặc định
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'A4', name: 'Khổ A4 (210 x 297 mm)', desc: 'Phổ biến cho DN B2B, hóa đơn đầy đủ' },
                { id: 'A5', name: 'Khổ A5 (148 x 210 mm)', desc: 'Tiết kiệm giấy, in nửa tờ A4' },
                { id: 'K80', name: 'Khổ K80 (Nhiệt cuộn 80mm)', desc: 'Máy in bill thu ngân quầy bán lẻ' },
              ].map(opt => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setPaperSize(opt.id as any)}
                  className={`p-3.5 rounded-[12px] border text-left transition-all cursor-pointer ${
                    paperSize === opt.id
                      ? 'bg-transparent border-[#6D3EEB] text-[#6317D6] dark:text-[#C084FC] ring-2 ring-[#6D3EEB]/20'
                      : 'border-gray-200 dark:border-[#334155] hover:border-gray-300 text-[#4B5563] dark:text-[#CBD5E1] bg-transparent'
                  }`}
                >
                  <span className="font-bold text-[14.5px] block text-[#111827] dark:text-[#F8FAFC]">{opt.id}</span>
                  <span className="text-[13.5px] text-[#4B5563] dark:text-[#94A3B8] block mt-1">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Titles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[14.5px] font-medium text-[#374151] dark:text-[#CBD5E1] mb-1.5">
                Tiêu đề phiếu bán hàng
              </label>
              <input
                type="text"
                value={invoiceTitle}
                onChange={e => setInvoiceTitle(e.target.value)}
                className="w-full h-10 px-3.5 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[14.5px] text-[#111827] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6D3EEB]"
              />
            </div>
            <div>
              <label className="block text-[14.5px] font-medium text-[#374151] dark:text-[#CBD5E1] mb-1.5">
                Tiêu đề phiếu xuất kho
              </label>
              <input
                type="text"
                value={stockOutTitle}
                onChange={e => setStockOutTitle(e.target.value)}
                className="w-full h-10 px-3.5 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[14.5px] text-[#111827] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6D3EEB]"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3.5 pt-2 border-t border-gray-100 dark:border-[#334155]">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showLogo}
                onChange={e => setShowLogo(e.target.checked)}
                className="w-4.5 h-4.5 rounded text-[#6D3EEB] focus:ring-[#6D3EEB]"
              />
              <span className="text-[14.5px] font-medium text-[#374151] dark:text-[#CBD5E1]">
                In Logo công ty lên góc trái phía trên chứng từ
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showQr}
                onChange={e => setShowQr(e.target.checked)}
                className="w-4.5 h-4.5 rounded text-[#6D3EEB] focus:ring-[#6D3EEB]"
              />
              <span className="text-[14.5px] font-medium text-[#374151] dark:text-[#CBD5E1]">
                In mã VietQR động thanh toán tự động lên phiếu thu / hóa đơn
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showSignatures}
                onChange={e => setShowSignatures(e.target.checked)}
                className="w-4.5 h-4.5 rounded text-[#6D3EEB] focus:ring-[#6D3EEB]"
              />
              <span className="text-[14.5px] font-medium text-[#374151] dark:text-[#CBD5E1]">
                In các ô ký tên (Người lập phiếu, Thủ kho xuất, Người giao hàng, Khách hàng)
              </span>
            </label>
          </div>

          {/* Note */}
          <div>
            <label className="block text-[14.5px] font-medium text-[#374151] dark:text-[#CBD5E1] mb-1.5">
              Lời cảm ơn in ở chân trang
            </label>
            <input
              type="text"
              value={thankYouNote}
              onChange={e => setThankYouNote(e.target.value)}
              className="w-full h-10 px-3.5 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[14.5px] text-[#111827] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6D3EEB]"
            />
          </div>
        </div>

        {/* Paper Mockup Preview (4 cols) - No background / Trong suốt */}
        <div className="lg:col-span-4 bg-transparent rounded-[16px] p-6 border border-gray-200 dark:border-[#334155] flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-52 bg-transparent border border-gray-300 dark:border-[#334155] shadow-xs rounded-[6px] p-4 text-left text-[9.5px] space-y-2.5 font-mono">
            <div className="flex justify-between border-b border-gray-200 dark:border-[#334155] pb-1.5">
              <div>
                <span className="font-bold text-[10.5px] block text-[#111827] dark:text-[#F8FAFC]">NEXUP VIETNAM</span>
                <span className="text-gray-500 dark:text-[#94A3B8]">MST: 0108927891</span>
              </div>
              {showQr && (
                <div className="w-7 h-7 bg-transparent border border-purple-300 dark:border-purple-800/60 flex items-center justify-center text-purple-700 dark:text-[#C084FC] rounded">
                  <Icon name="qr_code_2" size={18} />
                </div>
              )}
            </div>
            <div className="text-center font-bold text-[11px] pt-1 text-[#111827] dark:text-[#F8FAFC]">{invoiceTitle}</div>
            <div className="text-[9px] text-gray-600 dark:text-[#94A3B8]">Số: HD260927001 &bull; 27/09/2026</div>
            <div className="border-t border-b border-gray-200 dark:border-[#334155] py-1.5 space-y-1">
              <div className="flex justify-between font-bold text-[#111827] dark:text-[#F8FAFC]">
                <span>Sản phẩm</span>
                <span>Thành tiền</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-[#CBD5E1]">
                <span>Hũ pet nắp vặn x 50</span>
                <span>350.000 đ</span>
              </div>
            </div>
            <div className="flex justify-between font-bold text-[10.5px] text-[#6317D6] dark:text-[#C084FC]">
              <span>Tổng thanh toán:</span>
              <span>350.000 đ</span>
            </div>
            {showSignatures && (
              <div className="flex justify-between pt-2.5 text-[8px] text-gray-500 dark:text-[#94A3B8] text-center">
                <div>Người lập</div>
                <div>Thủ kho</div>
                <div>Khách hàng</div>
              </div>
            )}
            <div className="text-[8.5px] text-gray-400 dark:text-[#94A3B8] text-center pt-1 italic">
              {thankYouNote}
            </div>
          </div>
          <span className="text-[14px] text-[#4B5563] dark:text-[#94A3B8] font-medium">Mô phỏng khổ giấy {paperSize}</span>
        </div>
      </div>
    </div>
  );
};
