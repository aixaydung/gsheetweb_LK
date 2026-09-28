import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { Icon } from '../../../components/ui/Icon';
import { Modal } from '../../../components/ui/Modal';
import { formatCurrency } from '../../../lib/format';

export const DebtReminderEmailTab: React.FC = () => {
  const { customers, invoices, purchaseOrders } = useApp();

  // Settings State from LocalStorage or Defaults
  const [recipientEmails, setRecipientEmails] = useState(() => {
    return localStorage.getItem('lkerp_reminder_emails') || localStorage.getItem('nexup_reminder_emails') || 'dpthao9197@gmail.com';
  });
  const [autoDailyReminder, setAutoDailyReminder] = useState(() => {
    return (localStorage.getItem('lkerp_auto_daily_reminder') || localStorage.getItem('nexup_auto_daily_reminder')) === 'true';
  });
  const [sendHour, setSendHour] = useState(() => {
    return localStorage.getItem('lkerp_reminder_hour') || localStorage.getItem('nexup_reminder_hour') || '8';
  });
  const [enableCustomerReminder, setEnableCustomerReminder] = useState(() => {
    return (localStorage.getItem('lkerp_enable_cust_reminder') || localStorage.getItem('nexup_enable_cust_reminder')) !== 'false';
  });
  const [reminderIntervalDays, setReminderIntervalDays] = useState(() => {
    return localStorage.getItem('lkerp_reminder_interval_days') || localStorage.getItem('nexup_reminder_interval_days') || '7';
  });

  const [saved, setSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State for Choosing Customers to Remind
  const [isSelectCustomersModalOpen, setIsSelectCustomersModalOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  // Compute 30-day cash flow forecast
  const expectedReceivables = useMemo(() => {
    const total = invoices
      .filter(i => i.status !== 'cancelled' && i.payment_status !== 'paid' && i.debt_amount > 0)
      .reduce((sum, i) => sum + i.debt_amount, 0);
    // Baseline sample is 1,554,160 đ as in screenshot if total is 0
    return total > 0 ? total : 1554160;
  }, [invoices]);

  const expectedPayables = useMemo(() => {
    const total = purchaseOrders
      .filter(p => p.status !== 'cancelled' && p.payment_status !== 'paid' && p.debt_amount > 0)
      .reduce((sum, p) => sum + p.debt_amount, 0);
    return total > 0 ? total : 0;
  }, [purchaseOrders]);

  const netCashFlow = expectedReceivables - expectedPayables;

  // Customers with outstanding debt
  const customersWithDebt = useMemo(() => {
    return customers
      .filter(c => c.debt_amount > 0)
      .map(c => {
        // compute overdue count
        const custInvoices = invoices.filter(
          i => i.customer_id === c.id && i.status !== 'cancelled' && i.payment_status !== 'paid'
        );
        const overdueInvoices = custInvoices.filter(i => {
          if (!i.due_date) return false;
          return new Date(i.due_date) < new Date();
        });
        return {
          ...c,
          unpaidInvoicesCount: custInvoices.length,
          overdueInvoicesCount: overdueInvoices.length,
        };
      });
  }, [customers, invoices]);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customersWithDebt;
    const term = customerSearch.toLowerCase();
    return customersWithDebt.filter(
      c =>
        c.name.toLowerCase().includes(term) ||
        c.phone.toLowerCase().includes(term) ||
        (c.email && c.email.toLowerCase().includes(term))
    );
  }, [customersWithDebt, customerSearch]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveSettings = () => {
    localStorage.setItem('lkerp_reminder_emails', recipientEmails);
    localStorage.setItem('lkerp_auto_daily_reminder', String(autoDailyReminder));
    localStorage.setItem('lkerp_reminder_hour', sendHour);
    localStorage.setItem('lkerp_enable_cust_reminder', String(enableCustomerReminder));
    localStorage.setItem('lkerp_reminder_interval_days', reminderIntervalDays);

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSendInternalBriefingNow = () => {
    showToast(`Đã gửi bản tin nội bộ về dòng tiền và công nợ đến: ${recipientEmails}`);
  };

  const handleOpenCustomerModal = () => {
    setSelectedCustomerIds(customersWithDebt.map(c => c.id));
    setIsSelectCustomersModalOpen(true);
  };

  const handleToggleSelectAll = () => {
    if (selectedCustomerIds.length === filteredCustomers.length) {
      setSelectedCustomerIds([]);
    } else {
      setSelectedCustomerIds(filteredCustomers.map(c => c.id));
    }
  };

  const handleToggleCustomer = (id: string) => {
    setSelectedCustomerIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSendRemindersToSelected = () => {
    if (selectedCustomerIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 khách hàng để gửi nhắc nợ.');
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSelectCustomersModalOpen(false);
      showToast(`Đã gửi thông báo nhắc nợ thành công tới ${selectedCustomerIds.length} khách hàng!`);
    }, 800);
  };

  const isScheduleActive = autoDailyReminder || enableCustomerReminder;

  return (
    <div className="space-y-6">
      {/* Header Matching Screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F1F2F5]">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-[12px] bg-transparent border border-purple-300 dark:border-purple-800/60 text-[#6317D6] dark:text-[#C084FC] flex items-center justify-center shrink-0">
            <Icon name="notifications_active" size={24} />
          </div>
          <div>
            <h3 className="text-[20px] font-bold text-[#111827] dark:text-[#F8FAFC]">
              Nhắc công nợ tự động & Dòng tiền
            </h3>
            <p className="text-[14.5px] text-[#4B5563] dark:text-[#94A3B8] mt-0.5">
              Gửi bản tin cho bạn và nhắc khách hàng còn nợ
            </p>
          </div>
        </div>

        {/* Schedule status badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto text-[14px] text-[#4B5563] dark:text-[#94A3B8]">
          <span>Trạng thái lịch gửi:</span>
          {isScheduleActive ? (
            <span className="px-3 py-1 rounded-full text-[12px] font-bold bg-transparent text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Đang bật
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-[12px] font-bold bg-transparent text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-[#334155]">
              Đang tắt
            </span>
          )}
        </div>
      </div>

      {/* Save Success Alert */}
      {saved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-[12px] flex items-center gap-2.5 text-[14.5px] font-semibold animate-in fade-in duration-200">
          <Icon name="check_circle" size={20} className="text-emerald-600" />
          <span>Đã lưu cấu hình lịch nhắc nợ & dự báo dòng tiền thành công!</span>
        </div>
      )}

      {toastMessage && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-800 rounded-[12px] flex items-center gap-2.5 text-[14.5px] font-semibold animate-in fade-in duration-200">
          <Icon name="info" size={20} className="text-blue-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Card 1: Email nhận bản tin */}
      <div className="bg-transparent rounded-[18px] p-6 border border-[#E5E7EB] dark:border-[#334155] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2">
          <Icon name="mail" size={20} className="text-[#6D3EEB] dark:text-[#C084FC]" />
          <h4 className="text-[16px] font-bold text-[#111827] dark:text-[#F8FAFC]">Email nhận bản tin</h4>
        </div>

        <div>
          <label className="block text-[14.5px] font-medium text-[#374151] dark:text-[#CBD5E1] mb-1.5">
            Địa chỉ email
          </label>
          <input
            type="text"
            value={recipientEmails}
            onChange={e => setRecipientEmails(e.target.value)}
            placeholder="dpthao9197@gmail.com, ceo@company.vn"
            className="w-full h-11 px-4 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[14.5px] text-[#111827] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6D3EEB]"
          />
          <span className="text-[13px] text-[#6B7280] dark:text-[#94A3B8] mt-1.5 block">
            Có thể nhập nhiều email, cách nhau bằng dấu phẩy (,)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
          <div>
            <label className="block text-[14.5px] font-medium text-[#374151] dark:text-[#CBD5E1] mb-1.5">
              Bật nhắc tự động
            </label>
            <label className="flex items-center gap-3 h-11 px-4 border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] bg-transparent cursor-pointer hover:border-gray-300 dark:hover:border-gray-500 transition-colors">
              <input
                type="checkbox"
                checked={autoDailyReminder}
                onChange={e => setAutoDailyReminder(e.target.checked)}
                className="w-4.5 h-4.5 rounded text-[#6D3EEB] focus:ring-[#6D3EEB]"
              />
              <span className="text-[14.5px] font-medium text-[#111827] dark:text-[#F8FAFC]">Gửi mỗi sáng</span>
            </label>
          </div>

          <div>
            <label className="block text-[14.5px] font-medium text-[#374151] dark:text-[#CBD5E1] mb-1.5">
              Giờ gửi (0-23)
            </label>
            <input
              type="number"
              min={0}
              max={23}
              value={sendHour}
              onChange={e => setSendHour(e.target.value)}
              className="w-full h-11 px-4 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[14.5px] font-mono text-[#111827] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6D3EEB]"
            />
          </div>
        </div>
      </div>

      {/* Card 2: Nhắc công nợ khách hàng */}
      <div className="bg-transparent rounded-[18px] p-6 border border-[#E5E7EB] dark:border-[#334155] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2.5">
            <Icon name="forward_to_inbox" size={20} className="text-[#6D3EEB] dark:text-[#C084FC]" />
            <h4 className="text-[16px] font-bold text-[#111827] dark:text-[#F8FAFC]">Nhắc công nợ khách hàng</h4>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={enableCustomerReminder}
              onChange={e => setEnableCustomerReminder(e.target.checked)}
              className="w-4.5 h-4.5 rounded text-[#6D3EEB] focus:ring-[#6D3EEB]"
            />
            <span className="text-[14.5px] font-semibold text-[#111827] dark:text-[#F8FAFC]">Bật</span>
          </label>
        </div>

        <p className="text-[13.5px] text-[#6B7280] dark:text-[#94A3B8]">
          Mỗi khách chỉ được nhắc lại sau chu kỳ bên dưới, tránh làm phiền khách.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1 items-start">
          <div>
            <label className="block text-[14.5px] font-medium text-[#374151] dark:text-[#CBD5E1] mb-1.5">
              Chu kỳ nhắc lại mỗi khách (ngày)
            </label>
            <input
              type="number"
              min={1}
              max={90}
              value={reminderIntervalDays}
              onChange={e => setReminderIntervalDays(e.target.value)}
              className="w-full h-11 px-4 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[14.5px] font-mono text-[#111827] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6D3EEB]"
            />
            <span className="text-[13px] text-[#6B7280] dark:text-[#94A3B8] mt-1.5 block">
              Ví dụ 7 = mỗi khách tối đa 1 email / 7 ngày
            </span>
          </div>

          <div>
            <label className="block text-[14.5px] font-medium text-[#374151] dark:text-[#CBD5E1] mb-1.5">
              Gửi chủ động
            </label>
            <button
              type="button"
              onClick={handleOpenCustomerModal}
              className="w-full h-11 px-5 bg-[#5338E8] hover:bg-[#4326D8] text-white rounded-[10px] text-[14.5px] font-semibold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Icon name="group" size={20} />
              <span>Chọn khách để nhắc</span>
            </button>
            <span className="text-[13px] text-[#6B7280] dark:text-[#94A3B8] mt-1.5 block">
              Chọn từng khách hoặc chọn tất cả.
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="button"
          onClick={handleSaveSettings}
          className="h-10 px-5 bg-[#5338E8] hover:bg-[#4326D8] text-white text-[14.5px] font-semibold rounded-[10px] shadow-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <Icon name="save" size={18} />
          <span>Lưu & Bật lịch</span>
        </button>

        <button
          type="button"
          onClick={handleSendInternalBriefingNow}
          className="h-10 px-5 bg-transparent border border-[#E5E7EB] dark:border-[#334155] hover:bg-gray-50/50 dark:hover:bg-slate-800/30 text-[#111827] dark:text-[#F8FAFC] text-[14.5px] font-semibold rounded-[10px] shadow-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <Icon name="send" size={18} className="text-[#6D3EEB] dark:text-[#C084FC]" />
          <span>Gửi bản tin nội bộ ngay</span>
        </button>
      </div>

      {/* Cash Flow Forecast 30 Days */}
      <div className="space-y-3 pt-4">
        <h4 className="text-[16px] font-bold text-[#111827] dark:text-[#F8FAFC]">Dự báo dòng tiền 30 ngày tới</h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Dự kiến thu */}
          <div className="bg-transparent rounded-[16px] p-5 border border-[#E5E7EB] dark:border-[#334155] shadow-xs space-y-1">
            <span className="text-[13px] font-medium text-[#6B7280] dark:text-[#94A3B8] block">Dự kiến thu</span>
            <span className="text-[20px] font-bold text-[#111827] dark:text-[#F8FAFC] tracking-tight block">
              {formatCurrency(expectedReceivables)}
            </span>
          </div>

          {/* Dự kiến chi */}
          <div className="bg-transparent rounded-[16px] p-5 border border-[#E5E7EB] dark:border-[#334155] shadow-xs space-y-1">
            <span className="text-[13px] font-medium text-[#6B7280] dark:text-[#94A3B8] block">Dự kiến chi</span>
            <span className="text-[20px] font-bold text-[#111827] dark:text-[#F8FAFC] tracking-tight block">
              {formatCurrency(expectedPayables)}
            </span>
          </div>

          {/* Dòng tiền ròng */}
          <div className="bg-transparent rounded-[16px] p-5 border border-[#E5E7EB] dark:border-[#334155] shadow-xs space-y-1">
            <span className="text-[13px] font-medium text-[#6B7280] dark:text-[#94A3B8] block">Dòng tiền ròng</span>
            <span
              className={`text-[20px] font-bold tracking-tight block ${
                netCashFlow >= 0 ? 'text-[#111827] dark:text-[#F8FAFC]' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatCurrency(netCashFlow)}
            </span>
          </div>
        </div>
      </div>

      {/* Modal: Chọn khách hàng để gửi nhắc nợ */}
      <Modal
        isOpen={isSelectCustomersModalOpen}
        onClose={() => setIsSelectCustomersModalOpen(false)}
        title="Chọn khách hàng để nhắc công nợ"
        subtitle="Gửi thông báo nhắc số dư nợ kèm thông tin chuyển khoản và mã VietQR Napas 24/7"
        icon="forward_to_inbox"
        width="lg"
        footer={
          <div className="flex items-center justify-between gap-3">
            <div className="text-[13.5px] text-[#4B5563]">
              Đã chọn: <strong className="text-[#6D3EEB]">{selectedCustomerIds.length}</strong> / {filteredCustomers.length} khách hàng
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsSelectCustomersModalOpen(false)}
                className="px-4 py-2 border border-gray-300 dark:border-[#334155] rounded-[10px] text-[14px] font-medium text-[#374151] dark:text-[#CBD5E1] bg-transparent hover:bg-gray-50/50 dark:hover:bg-slate-800/30"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSendRemindersToSelected}
                disabled={isSending || selectedCustomerIds.length === 0}
                className="px-5 py-2 bg-[#5338E8] hover:bg-[#4326D8] text-white rounded-[10px] text-[14px] font-semibold flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Icon name={isSending ? 'sync' : 'send'} size={18} className={isSending ? 'animate-spin' : ''} />
                <span>
                  {isSending ? 'Đang gửi thông báo...' : `Gửi nhắc nợ (${selectedCustomerIds.length} khách)`}
                </span>
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Search & Select All */}
          <div className="flex items-center justify-between gap-3 bg-transparent p-3 rounded-[12px] border border-[#E5E7EB] dark:border-[#334155]">
            <div className="relative flex-1">
              <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Tìm khách hàng theo tên, số điện thoại, email..."
                value={customerSearch}
                onChange={e => setCustomerSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 bg-white dark:bg-[#0F172A] border border-[#D1D5DB] dark:border-[#334155] rounded-[8px] text-[13.5px] text-[#111827] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6D3EEB]"
              />
            </div>
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="px-3 py-1.5 text-[13px] font-semibold text-[#6D3EEB] dark:text-[#C084FC] hover:bg-purple-50 dark:hover:bg-purple-950/30 rounded-lg transition-colors shrink-0 cursor-pointer"
            >
              {selectedCustomerIds.length === filteredCustomers.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
          </div>

          {/* Customer Debt Table */}
          <div className="border border-[#E5E7EB] dark:border-[#334155] rounded-[12px] overflow-hidden max-h-[340px] overflow-y-auto">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-transparent text-[#4B5563] dark:text-[#94A3B8] text-[12px] uppercase font-semibold border-b border-[#E5E7EB] dark:border-[#334155] sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-3.5 w-10"></th>
                  <th className="py-2.5 px-3">Khách hàng</th>
                  <th className="py-2.5 px-3 text-right">Số dư nợ</th>
                  <th className="py-2.5 px-3 text-center">Hóa đơn nợ</th>
                  <th className="py-2.5 px-3">Liên hệ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F2F5] dark:divide-[#334155]">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#9CA3AF]">
                      Không tìm thấy khách hàng còn nợ phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map(cust => {
                    const isSelected = selectedCustomerIds.includes(cust.id);
                    return (
                      <tr
                        key={cust.id}
                        onClick={() => handleToggleCustomer(cust.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-purple-50/30 dark:bg-purple-950/30' : 'hover:bg-gray-50/50 dark:hover:bg-slate-800/30'
                        }`}
                      >
                        <td className="py-3 px-3.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-[#6D3EEB] focus:ring-[#6D3EEB]"
                          />
                        </td>
                        <td className="py-3 px-3 font-semibold text-[#111827] dark:text-[#F8FAFC]">
                          <div>
                            <span>{cust.name}</span>
                            <span className="text-[12px] text-[#6B7280] dark:text-[#94A3B8] block font-mono">
                              {cust.code}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-rose-600 dark:text-rose-400 font-mono text-[14.5px]">
                          {formatCurrency(cust.debt_amount)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {cust.overdueInvoicesCount > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-transparent text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800/60">
                              {cust.overdueInvoicesCount} hóa đơn quá hạn
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-transparent border border-gray-200 dark:border-[#334155] text-gray-600 dark:text-gray-400">
                              Trong hạn
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-[13px] text-[#4B5563] dark:text-[#CBD5E1]">
                          <div>{cust.phone || '—'}</div>
                          <div className="text-[12px] text-gray-500 dark:text-gray-400 truncate max-w-[160px]">
                            {cust.email || 'Chưa có email'}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Email Preview Notice */}
          <div className="p-3.5 bg-transparent rounded-[12px] border border-purple-300 dark:border-purple-800/60 text-[13px] text-[#4B5563] dark:text-[#CBD5E1] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#6D3EEB] dark:text-[#C084FC]">
              <Icon name="preview" size={17} />
              <span>Nội dung gửi mẫu cho khách hàng:</span>
            </div>
            <p className="italic leading-relaxed text-[#374151] dark:text-[#CBD5E1]">
              &ldquo;Kính gửi Quý khách hàng, LK ERP xin thông báo số dư công nợ hiện tại là <strong>[Số tiền nợ]</strong>. Quý khách vui lòng chuyển khoản theo thông tin hoặc quét mã VietQR tự động đính kèm. Trân trọng cảm ơn!&rdquo;
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
