import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Icon } from '../../../components/ui/Icon';

export const CompanyGeneralTab: React.FC = () => {
  const { companySettings, updateSettings } = useApp();

  const [companyName, setCompanyName] = useState(companySettings.company_name);
  const [address, setAddress] = useState(companySettings.address);
  const [phone, setPhone] = useState(companySettings.phone);
  const [email, setEmail] = useState(companySettings.email);
  const [taxCode, setTaxCode] = useState(companySettings.tax_code);
  const [website, setWebsite] = useState(companySettings.website || 'https://nexupone.vn');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings({
      company_name: companyName,
      address,
      phone,
      email,
      tax_code: taxCode,
      website,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F1F2F5] dark:border-[#334155]">
        <div>
          <h3 className="text-[18px] sm:text-[20px] font-bold text-[#111827] dark:text-[#F8FAFC]">Thông tin doanh nghiệp</h3>
          <p className="text-[13px] sm:text-[14.5px] text-[#4B5563] dark:text-[#94A3B8] mt-0.5">
            Hiển thị trên tiêu đề hóa đơn GTGT, phiếu xuất nhập kho, báo giá và chứng từ in ấn
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="w-full sm:w-auto h-10 px-5 bg-[#6D3EEB] hover:bg-[#5B2BD6] text-white text-[14px] sm:text-[14.5px] font-semibold rounded-[12px] shadow-sm flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
        >
          <Icon name="save" size={18} />
          <span>Lưu thông tin</span>
        </button>
      </div>

      {saved && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-[12px] flex items-center gap-2.5 text-[14px] font-semibold">
          <Icon name="check_circle" size={20} className="text-emerald-600 dark:text-emerald-400" />
          <span>Đã lưu thành công thông tin doanh nghiệp!</span>
        </div>
      )}

      {/* Main Form */}
      <div className="bg-white dark:bg-transparent rounded-[16px] p-4 sm:p-6 border border-[#F1F2F5] dark:border-[#334155] shadow-xs sm:shadow-sm space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-[14.5px] font-medium text-[#374151] dark:text-[#CBD5E1] mb-1.5">
              Tên công ty / Doanh nghiệp / Hộ kinh doanh *
            </label>
            <input
              type="text"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              className="w-full h-10 px-3.5 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[14.5px] text-[#111827] dark:text-[#F8FAFC] font-medium focus:outline-none focus:border-[#6D3EEB]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[14.5px] font-medium text-[#374151] dark:text-[#CBD5E1] mb-1.5">
              Địa chỉ trụ sở đăng ký kinh doanh
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full h-10 px-3.5 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[14.5px] text-[#111827] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6D3EEB]"
            />
          </div>

          <div>
            <label className="block text-[14.5px] font-medium text-[#374151] dark:text-[#CBD5E1] mb-1.5">
              Mã số thuế (MST) / Mã định danh kinh doanh
            </label>
            <input
              type="text"
              value={taxCode}
              onChange={e => setTaxCode(e.target.value)}
              placeholder="0108927891"
              className="w-full h-10 px-3.5 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[14.5px] text-[#111827] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6D3EEB] font-mono"
            />
          </div>

          <div>
            <label className="block text-[14.5px] font-medium text-[#374151] dark:text-[#CBD5E1] mb-1.5">
              Hotline / Số điện thoại liên hệ
            </label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="0988 123 456"
              className="w-full h-10 px-3.5 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[14.5px] text-[#111827] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6D3EEB]"
            />
          </div>

          <div>
            <label className="block text-[14.5px] font-medium text-[#374151] dark:text-[#CBD5E1] mb-1.5">
              Email công ty (nhận hóa đơn)
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="contact@company.vn"
              className="w-full h-10 px-3.5 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[14.5px] text-[#111827] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6D3EEB]"
            />
          </div>

          <div>
            <label className="block text-[14.5px] font-medium text-[#374151] dark:text-[#CBD5E1] mb-1.5">
              Website chính thức
            </label>
            <input
              type="text"
              value={website}
              onChange={e => setWebsite(e.target.value)}
              placeholder="https://nexupone.vn"
              className="w-full h-10 px-3.5 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[14.5px] text-[#111827] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6D3EEB]"
            />
          </div>
        </div>
      </div>

      {/* Identity Card Preview (No background / Trong suốt) */}
      <div className="bg-transparent rounded-[16px] p-5 border border-[#E5E7EB] dark:border-[#334155] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-[12px] bg-transparent border border-[#E5E7EB] dark:border-[#334155] p-2 flex items-center justify-center shadow-xs">
            <Icon name="storefront" size={28} className="text-[#6D3EEB] dark:text-[#C084FC]" />
          </div>
          <div>
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#6D3EEB] dark:text-[#C084FC]">
              Xem trước thương hiệu trên chứng từ
            </span>
            <h4 className="text-[16px] font-bold text-[#111827] dark:text-[#F8FAFC]">{companyName}</h4>
            <p className="text-[14px] text-[#4B5563] dark:text-[#94A3B8]">
              MST: <span className="font-mono font-semibold text-[#111827] dark:text-[#F8FAFC]">{taxCode}</span> &bull; ĐT: {phone}
            </p>
          </div>
        </div>

        <div className="px-4 py-2 rounded-full bg-transparent text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60 text-[13px] font-semibold flex items-center gap-2 shrink-0">
          <Icon name="verified" size={16} />
          <span>Hồ sơ doanh nghiệp hợp lệ</span>
        </div>
      </div>
    </div>
  );
};
