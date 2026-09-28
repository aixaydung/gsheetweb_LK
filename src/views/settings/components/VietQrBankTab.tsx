import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { VIETNAM_BANKS_REFERENCE } from '../settingsData';
import { Icon } from '../../../components/ui/Icon';

export interface BankAccountItem {
  id: string;
  bankCode: string;
  bankBin: string;
  bankName: string;
  accountNo: string;
  accountName: string;
  defaultContent: string;
  printLine: string;
  isDefault: boolean;
}

export const VietQrBankTab: React.FC = () => {
  const { companySettings, updateSettings } = useApp();

  // Load multiple bank accounts from localStorage or initialize with existing company settings
  const [bankAccounts, setBankAccounts] = useState<BankAccountItem[]>(() => {
    try {
      const saved = localStorage.getItem('nexupone_bank_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }

    // Initial default bank account
    return [
      {
        id: 'ba_1',
        bankCode: 'MB',
        bankBin: companySettings.bank_bin || '970422',
        bankName: companySettings.bank_name || 'MB Bank (Quân Đội)',
        accountNo: companySettings.bank_account_no || '0336243202',
        accountName: companySettings.bank_account_name || 'CTY NEXUP',
        defaultContent: 'Thanh toan don hang',
        printLine: `MB - ${companySettings.bank_account_no || '0336243202'} - ${companySettings.bank_account_name || 'CTY NEXUP'}`,
        isDefault: true,
      },
    ];
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Auto-sync the default account to companySettings and localStorage
  const syncToSettings = (accounts: BankAccountItem[]) => {
    localStorage.setItem('nexupone_bank_accounts', JSON.stringify(accounts));
    const defaultAcc = accounts.find(a => a.isDefault) || accounts[0];
    if (defaultAcc) {
      updateSettings({
        bank_name: defaultAcc.bankName || defaultAcc.bankCode,
        bank_bin: defaultAcc.bankBin,
        bank_account_no: defaultAcc.accountNo,
        bank_account_name: defaultAcc.accountName,
      });
    }
  };

  const showToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  const handleUpdateField = (id: string, field: keyof BankAccountItem, value: any) => {
    setBankAccounts(prev => {
      const updated = prev.map(acc => {
        if (acc.id !== id) return acc;
        const newAcc = { ...acc, [field]: value };

        // Auto uppercase accountName
        if (field === 'accountName' && typeof value === 'string') {
          newAcc.accountName = value.toUpperCase();
        }

        // Auto fill bankBin & bankName if bankCode matches known bank
        if (field === 'bankCode' && typeof value === 'string') {
          const trimmed = value.trim().toUpperCase();
          const found = VIETNAM_BANKS_REFERENCE.find(
            b => b.code.toUpperCase() === trimmed || b.shortName.toUpperCase() === trimmed
          );
          if (found) {
            newAcc.bankBin = found.bin;
            newAcc.bankName = `${found.shortName} (${found.name})`;
          }
        }

        // Auto suggest printLine if blank or previously auto-generated
        if (field === 'bankCode' || field === 'accountNo' || field === 'accountName') {
          const code = newAcc.bankCode || 'VCB';
          const no = newAcc.accountNo || '';
          const name = newAcc.accountName || '';
          if (no || name) {
            newAcc.printLine = `${code} - ${no} - ${name}`.trim();
          }
        }

        return newAcc;
      });

      syncToSettings(updated);
      return updated;
    });
  };

  const handleAddAccount = () => {
    const newId = `ba_${Date.now()}`;
    const newAccount: BankAccountItem = {
      id: newId,
      bankCode: 'VCB',
      bankBin: '970436',
      bankName: 'Vietcombank',
      accountNo: '',
      accountName: bankAccounts[0]?.accountName || 'CTY NEXUP',
      defaultContent: 'Thanh toan don hang',
      printLine: '',
      isDefault: false,
    };

    const updated = [...bankAccounts, newAccount];
    setBankAccounts(updated);
    syncToSettings(updated);
    showToast('Đã thêm 1 tài khoản ngân hàng mới! Vui lòng điền thông tin.');
  };

  const handleDeleteAccount = (id: string) => {
    if (bankAccounts.length <= 1) {
      alert('Hệ thống cần duy trì ít nhất 1 tài khoản nhận tiền chính.');
      return;
    }
    if (!confirm('Bạn có chắc chắn muốn xóa tài khoản ngân hàng này?')) {
      return;
    }

    const updated = bankAccounts.filter(a => a.id !== id);
    if (!updated.some(a => a.isDefault)) {
      updated[0].isDefault = true;
    }
    setBankAccounts(updated);
    syncToSettings(updated);
    showToast('Đã xóa tài khoản ngân hàng.');
  };

  const handleSetDefault = (id: string) => {
    const updated = bankAccounts.map(a => ({
      ...a,
      isDefault: a.id === id,
    }));
    setBankAccounts(updated);
    syncToSettings(updated);
    showToast('Đã thiết lập tài khoản mặc định cho in ấn hóa đơn!');
  };

  const handleSaveAll = () => {
    syncToSettings(bankAccounts);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F1F2F5] dark:border-[#334155]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-[12px] bg-transparent border border-purple-300 dark:border-purple-800/60 text-[#6317D6] dark:text-[#C084FC] flex items-center justify-center shrink-0">
            <Icon name="qr_code_2" size={24} />
          </div>
          <div>
            <h3 className="text-[20px] font-bold text-[#111827] dark:text-[#F8FAFC]">Tài khoản nhận tiền & Mã QR</h3>
            <p className="text-[14.5px] text-[#4B5563] dark:text-[#94A3B8] mt-0.5">
              QR chuẩn VietQR — banking tự đọc số tài khoản và nội dung
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleAddAccount}
            className="h-10 px-4 bg-transparent border border-purple-300 dark:border-purple-800/60 hover:bg-[#F3EBFE]/40 dark:hover:bg-purple-950/30 text-[#6317D6] dark:text-[#C084FC] rounded-[10px] text-[14px] font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Icon name="add" size={18} />
            <span>Thêm tài khoản</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="h-10 px-5 bg-[#6D3EEB] hover:bg-[#5B2BD6] text-white rounded-[10px] text-[14px] font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Icon name="save" size={18} />
            <span>Lưu tất cả</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-[12px] flex items-center gap-2.5 text-[14.5px] font-semibold animate-in fade-in duration-200">
          <Icon name="check_circle" size={20} className="text-emerald-600 dark:text-emerald-400" />
          <span>Đã lưu thành công danh sách tài khoản ngân hàng & VietQR!</span>
        </div>
      )}

      {notificationMsg && (
        <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 rounded-[12px] flex items-center gap-2.5 text-[14.5px] font-semibold animate-in fade-in duration-200">
          <Icon name="info" size={20} className="text-blue-600 dark:text-blue-400" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* List of Bank Accounts */}
      <div className="space-y-6">
        {bankAccounts.map((account, index) => {
          // Construct VietQR URL
          const bankIdentifier = account.bankBin || account.bankCode || '970422';
          const qrImageUrl = account.accountNo
            ? `https://img.vietqr.io/image/${bankIdentifier}-${account.accountNo}-compact2.png?amount=0&addInfo=${encodeURIComponent(account.defaultContent || 'Thanh toan don hang')}&accountName=${encodeURIComponent(account.accountName || 'CTY NEXUP')}`
            : '';

          return (
            <div
              key={account.id}
              className={`bg-transparent rounded-[20px] p-6 border transition-all ${
                account.isDefault
                  ? 'border-[#6D3EEB]/40 ring-1 ring-[#6D3EEB]/20'
                  : 'border-[#E5E7EB] dark:border-[#334155] hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              {/* Account Card Header: Tag & Actions */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#F1F2F5] dark:border-[#334155]">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-transparent border border-purple-300 dark:border-purple-800/60 text-[#6317D6] dark:text-[#C084FC] flex items-center justify-center text-[13px] font-bold">
                    {index + 1}
                  </span>
                  <span className="font-bold text-[16px] text-[#111827] dark:text-[#F8FAFC]">
                    Tài khoản {index + 1}: {account.bankCode || 'Ngân hàng'}
                  </span>
                  {account.isDefault ? (
                    <span className="px-3 py-0.5 rounded-full text-[12px] font-bold bg-transparent text-[#6317D6] dark:text-[#C084FC] border border-purple-300 dark:border-purple-800/60 flex items-center gap-1">
                      <Icon name="check" size={14} /> Mặc định trên hóa đơn
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(account.id)}
                      className="text-[13px] font-semibold text-[#6D3EEB] dark:text-[#C084FC] hover:underline cursor-pointer"
                    >
                      Đặt làm mặc định
                    </button>
                  )}
                </div>

                {bankAccounts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteAccount(account.id)}
                    className="text-[13px] font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Icon name="delete" size={16} />
                    <span>Xóa</span>
                  </button>
                )}
              </div>

              {/* Account Card Body */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Left: VietQR Image Container */}
                <div className="md:col-span-4 flex justify-center">
                  <div className="w-[210px] h-[255px] rounded-[20px] border border-dashed border-[#D1D5DB] dark:border-[#334155] p-2.5 bg-transparent flex flex-col items-center justify-center shadow-xs">
                    {account.accountNo ? (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <img
                          src={qrImageUrl}
                          alt="VietQR"
                          className="w-full h-auto max-h-[235px] object-contain rounded-[8px]"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.parentElement?.querySelector('.qr-fallback');
                            if (fallback) fallback.classList.remove('hidden');
                          }}
                        />
                        <div className="qr-fallback hidden w-full h-full flex flex-col items-center justify-center p-2 text-center font-mono">
                          <span className="text-[13px] font-bold text-red-600">VIET<span className="text-blue-600">QR</span></span>
                          <Icon name="qr_code_2" size={90} className="text-[#111827] dark:text-white my-1" />
                          <span className="text-[11px] font-bold text-[#6317D6] dark:text-[#C084FC]">{account.bankCode} - {account.accountNo}</span>
                          <span className="text-[10px] text-gray-600 dark:text-gray-400 uppercase">{account.accountName}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-3 space-y-2 text-[#9CA3AF]">
                        <div className="w-12 h-12 rounded-full bg-transparent border border-gray-200 dark:border-[#334155] flex items-center justify-center mx-auto text-gray-400 dark:text-gray-500">
                          <Icon name="qr_code_2" size={30} />
                        </div>
                        <p className="text-[12.5px] leading-tight text-[#6B7280] dark:text-[#94A3B8]">
                          Nhập số tài khoản để tự động sinh mã VietQR
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Form fields */}
                <div className="md:col-span-8 space-y-3.5">
                  {/* Row 1: Mã ngân hàng & Số tài khoản */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[14.5px] font-medium text-[#374151] dark:text-[#CBD5E1] mb-1.5">
                        Mã ngân hàng
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={account.bankCode}
                          onChange={e => handleUpdateField(account.id, 'bankCode', e.target.value)}
                          placeholder="VD: VCB, BIDV, ACB"
                          list={`bank_list_${account.id}`}
                          className="w-full h-10 px-3.5 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[14.5px] text-[#111827] dark:text-[#F8FAFC] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#6D3EEB]"
                        />
                        <datalist id={`bank_list_${account.id}`}>
                          {VIETNAM_BANKS_REFERENCE.map(b => (
                            <option key={b.bin} value={b.code}>
                              {b.shortName} - {b.name}
                            </option>
                          ))}
                        </datalist>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[14.5px] font-medium text-[#374151] dark:text-[#CBD5E1] mb-1.5">
                        Số tài khoản
                      </label>
                      <input
                        type="text"
                        value={account.accountNo}
                        onChange={e => handleUpdateField(account.id, 'accountNo', e.target.value)}
                        placeholder="VD: 0336243202"
                        className="w-full h-10 px-3.5 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[14.5px] text-[#111827] dark:text-[#F8FAFC] font-mono placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#6D3EEB]"
                      />
                    </div>
                  </div>

                  {/* Row 2: Tên chủ tài khoản */}
                  <div>
                    <label className="block text-[14.5px] font-medium text-[#374151] dark:text-[#CBD5E1] mb-1.5">
                      Tên chủ tài khoản
                    </label>
                    <input
                      type="text"
                      value={account.accountName}
                      onChange={e => handleUpdateField(account.id, 'accountName', e.target.value)}
                      placeholder="CTY NEXUP"
                      className="w-full h-10 px-3.5 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[14.5px] text-[#111827] dark:text-[#F8FAFC] uppercase placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#6D3EEB]"
                    />
                  </div>

                  {/* Row 3: Nội dung chuyển khoản mặc định */}
                  <div>
                    <label className="block text-[14.5px] font-medium text-[#374151] dark:text-[#CBD5E1] mb-1.5">
                      Nội dung chuyển khoản mặc định
                    </label>
                    <input
                      type="text"
                      value={account.defaultContent}
                      onChange={e => handleUpdateField(account.id, 'defaultContent', e.target.value)}
                      placeholder="Thanh toan don hang"
                      className="w-full h-10 px-3.5 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[14.5px] text-[#111827] dark:text-[#F8FAFC] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#6D3EEB]"
                    />
                  </div>

                  {/* Row 4: Dòng thông tin in trên chứng từ */}
                  <div>
                    <label className="block text-[14.5px] font-medium text-[#374151] dark:text-[#CBD5E1] mb-1.5">
                      Dòng thông tin in trên chứng từ
                    </label>
                    <input
                      type="text"
                      value={account.printLine}
                      onChange={e => handleUpdateField(account.id, 'printLine', e.target.value)}
                      placeholder="VD: VCB - 0123456789 - CTY NEXUP"
                      className="w-full h-10 px-3.5 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[14.5px] text-[#111827] dark:text-[#F8FAFC] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#6D3EEB]"
                    />
                  </div>

                  {/* Row 5: Action Button: Tạo QR thanh toán */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        handleSaveAll();
                        showToast(`Đã tạo và cập nhật mã QR thanh toán cho ${account.bankCode || 'tài khoản'}!`);
                      }}
                      className="px-5 py-2.5 bg-[#5338E8] hover:bg-[#4326D8] text-white rounded-[10px] text-[14px] font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                    >
                      <Icon name="qr_code_2" size={18} />
                      <span>Tạo QR thanh toán</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
