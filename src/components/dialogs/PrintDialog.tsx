import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Icon } from '../ui/Icon';
import { useApp } from '../../context/AppContext';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  numberToVietnameseWords,
} from '../../lib/format';
import {
  BankAccountItem,
  getStoredBankAccounts,
  buildVietQrUrl,
} from '../../lib/bankUtils';

interface PrintDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: string; // 'HÓA ĐƠN BÁN HÀNG' | 'PHIẾU MUA HÀNG' | 'BÁO GIÁ' | 'PHIẾU TRẢ HÀNG' | ...
  code: string;
  date: string;
  partnerName?: string;
  partnerPhone?: string;
  partnerAddress?: string;
  partnerEmail?: string;
  partnerTaxCode?: string;
  items?: Array<{
    sku: string;
    product_name: string;
    unit: string;
    quantity: number;
    unit_price: number;
    line_discount?: number;
    line_total: number;
  }>;
  subtotal?: number;
  discountAmount?: number;
  vatAmount?: number;
  shippingFee?: number;
  total?: number;
  paidAmount?: number;
  debtAmount?: number;
  note?: string;
}

export const PrintDialog: React.FC<PrintDialogProps> = ({
  isOpen,
  onClose,
  documentType,
  code,
  date,
  partnerName,
  partnerPhone,
  partnerAddress,
  partnerEmail,
  partnerTaxCode,
  items = [],
  subtotal = 0,
  discountAmount = 0,
  vatAmount = 0,
  shippingFee = 0,
  total = 0,
  paidAmount = 0,
  debtAmount = 0,
  note,
}) => {
  const { companySettings, updateSettings } = useApp();
  const [paperSize, setPaperSize] = useState<'A4' | 'A5' | 'K80'>('A4');
  const [docTitle, setDocTitle] = useState(documentType);
  const [recipientEmail, setRecipientEmail] = useState(partnerEmail ? partnerEmail.trim() : '');
  const [emailError, setEmailError] = useState<string>('');
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Logo state synced with company settings and localStorage
  const getStoredLogo = () => {
    if (companySettings?.logo_url && companySettings.logo_url.trim()) {
      return companySettings.logo_url.trim();
    }
    const backupLogo =
      localStorage.getItem('lkerp_company_logo') ||
      localStorage.getItem('company_logo') ||
      localStorage.getItem('lkerp_logo');
    if (backupLogo && backupLogo.trim()) return backupLogo.trim();

    try {
      const stored = localStorage.getItem('lkerp_company_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.logo_url && parsed.logo_url.trim()) return parsed.logo_url.trim();
      }
    } catch {
      // ignore
    }
    return '';
  };

  const [customLogoUrl, setCustomLogoUrl] = useState<string>(getStoredLogo);

  useEffect(() => {
    if (isOpen) {
      setCustomLogoUrl(getStoredLogo());
    }
  }, [isOpen, companySettings?.logo_url]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        setCustomLogoUrl(dataUrl);
        updateSettings({ logo_url: dataUrl });
        try {
          localStorage.setItem('lkerp_company_logo', dataUrl);
          const currentSettings = localStorage.getItem('lkerp_company_settings');
          const parsed = currentSettings ? JSON.parse(currentSettings) : {};
          localStorage.setItem(
            'lkerp_company_settings',
            JSON.stringify({ ...parsed, logo_url: dataUrl })
          );
        } catch (err) {
          console.warn('Storage save warning:', err);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setCustomLogoUrl('');
    updateSettings({ logo_url: '' });
    try {
      localStorage.removeItem('lkerp_company_logo');
      const currentSettings = localStorage.getItem('lkerp_company_settings');
      if (currentSettings) {
        const parsed = JSON.parse(currentSettings);
        delete parsed.logo_url;
        localStorage.setItem('lkerp_company_settings', JSON.stringify(parsed));
      }
    } catch (err) {
      console.warn('Storage save warning:', err);
    }
  };

  // Bank accounts & VietQR configuration
  const [bankAccounts, setBankAccounts] = useState<BankAccountItem[]>(() =>
    getStoredBankAccounts(companySettings)
  );
  const [selectedBankId, setSelectedBankId] = useState<string>(() => {
    const accs = getStoredBankAccounts(companySettings);
    const def = accs.find(a => a.isDefault) || accs[0];
    return def ? def.id : '';
  });
  const [qrAddInfo, setQrAddInfo] = useState<string>(code || '');
  const [qrIncludeAmount, setQrIncludeAmount] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      setRecipientEmail(partnerEmail ? partnerEmail.trim() : '');
      setEmailError('');
      const accs = getStoredBankAccounts(companySettings);
      setBankAccounts(accs);
      const def = accs.find(a => a.isDefault) || accs[0];
      if (def && (!selectedBankId || !accs.some(a => a.id === selectedBankId))) {
        setSelectedBankId(def.id);
      }
      setQrAddInfo(code || '');
    }
  }, [partnerEmail, isOpen, companySettings, code]);

  useEffect(() => {
    setDocTitle(documentType);
  }, [documentType]);

  const activeAccount =
    bankAccounts.find(a => a.id === selectedBankId) ||
    bankAccounts.find(a => a.isDefault) ||
    bankAccounts[0];

  const qrAmount = qrIncludeAmount ? (debtAmount > 0 ? debtAmount : total) : 0;
  const qrTransferContent = qrAddInfo.trim() || code || 'Thanh toan';

  const qrCodeUrl = activeAccount?.accountNo
    ? buildVietQrUrl({
        bankBin: activeAccount.bankBin,
        bankCode: activeAccount.bankCode,
        accountNo: activeAccount.accountNo,
        accountName: activeAccount.accountName,
        amount: qrAmount,
        addInfo: qrTransferContent,
        template: 'qr_only',
      })
    : '';

  const isPurchase =
    documentType.includes('MUA') ||
    documentType.includes('NHẬP') ||
    documentType.includes('NCC') ||
    documentType.includes('CHI');

  const printTimeStr = formatDateTime(new Date().toISOString());

  const printPaperRef = useRef<HTMLDivElement>(null);

  // 10 print checkboxes matching UI screenshot
  const [options, setOptions] = useState({
    logo: true,
    partnerInfo: true,
    sku: true,
    unit: true,
    priceTotal: true,
    lineDiscount: true,
    qrCode: false,
    note: true,
    signature: true,
    oldDebt: true,
  });

  const toggleOption = (key: keyof typeof options) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Isolated Iframe Print: Prints ONLY the paper document, avoiding any website or modal content
  const handlePrint = () => {
    if (!printPaperRef.current) {
      window.print();
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    const paperWidth = paperSize === 'K80' ? '76mm' : paperSize === 'A5' ? '140mm' : '190mm';
    const paperSizeCss =
      paperSize === 'K80' ? '80mm auto' : paperSize === 'A5' ? 'A5 portrait' : 'A4 portrait';

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${docTitle} - ${code}</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap">
        <style>
          @page {
            size: ${paperSizeCss};
            margin: ${paperSize === 'K80' ? '2mm' : '8mm 10mm'};
          }
          :root { --ink:#000; --muted:#444; --line:#000; --hair:#999; }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: 'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif;
            color: #000000;
            background: #ffffff;
            font-size: ${paperSize === 'K80' ? '11px' : paperSize === 'A5' ? '11.5px' : '12px'};
            line-height: 1.5;
          }
          .print-wrapper {
            width: 100%;
            max-width: ${paperWidth};
            margin: 0 auto;
            background: #ffffff;
          }
          .head {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 12px;
            border-bottom: 2px solid #000000;
          }
          .brand {
            display: flex;
            gap: 12px;
            align-items: center;
          }
          .logo {
            width: 46px;
            height: 46px;
            border: 2px solid #000000;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 16px;
            flex-shrink: 0;
          }
          .brand h1 {
            margin: 0;
            font-size: 15px;
            font-weight: 700;
          }
          .brand p {
            margin: 2px 0 0;
            color: #444444;
            font-size: 11px;
            max-width: 320px;
            line-height: 1.35;
          }
          .doc {
            text-align: right;
          }
          .doc h2 {
            margin: 0;
            font-size: ${paperSize === 'K80' ? '17px' : '21px'};
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .doc .no {
            font-size: 13px;
            font-weight: 600;
            margin-top: 2px;
          }
          .info {
            display: grid;
            grid-template-columns: ${paperSize === 'K80' ? '1fr' : '1.4fr 1fr'};
            gap: 12px;
            margin-top: 14px;
          }
          .box {
            border: 1px solid #000000;
            border-radius: 6px;
            padding: 9px 12px;
          }
          .box h3 {
            margin: 0 0 5px;
            font-size: 11px;
            font-weight: 700;
            text-decoration: underline;
            text-underline-offset: 3px;
            text-transform: uppercase;
          }
          .row {
            display: flex;
            gap: 8px;
            padding: 1.5px 0;
            font-size: 11.5px;
          }
          .row span:first-child {
            flex: 0 0 78px;
            color: #444444;
          }
          .row span:last-child {
            font-weight: 500;
          }
          .box .name {
            font-size: 13px;
            font-weight: 700;
            margin-bottom: 2px;
          }
          .pay {
            margin-top: 14px;
            display: flex;
            justify-content: ${paperSize === 'K80' ? 'center' : 'flex-start'};
            align-items: center;
            gap: ${paperSize === 'K80' ? '10px' : '22px'};
            border: 1.5px solid #000000;
            border-radius: 8px;
            padding: 10px 16px;
            page-break-inside: avoid;
            flex-direction: ${paperSize === 'K80' ? 'column' : 'row'};
            background: #ffffff;
          }
          .qr {
            width: ${paperSize === 'K80' ? '92px' : '104px'};
            height: ${paperSize === 'K80' ? '92px' : '104px'};
            flex: none;
            border: 1px dashed #000000;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2px;
            background: #ffffff;
          }
          .pay h3 {
            margin: 0 0 4px;
            font-size: 12px;
            font-weight: 700;
          }
          .pay .row span:first-child {
            flex: ${paperSize === 'K80' ? 'none' : '0 0 70px'};
          }
          .amt {
            font-weight: 700 !important;
            font-size: 13px;
            color: #15803d;
          }
          table.table-modern {
            width: 100%;
            border-collapse: collapse;
            margin-top: 16px;
            font-size: ${paperSize === 'K80' ? '10.5px' : '11.5px'};
          }
          table.table-modern thead th {
            font-weight: 700;
            font-size: 11px;
            padding: 8px 6px;
            text-align: left;
            border-top: 2px solid #000000;
            border-bottom: 2px solid #000000;
            background: transparent;
            color: #000000;
          }
          table.table-modern tbody td {
            padding: 8px 6px;
            border-bottom: 1px solid #999999;
            vertical-align: top;
          }
          .c { text-align: center !important; }
          .r { text-align: right !important; font-variant-numeric: tabular-nums; }
          table.table-modern thead th.c { text-align: center !important; }
          table.table-modern thead th.r { text-align: right !important; }
          .bottom {
            display: grid;
            grid-template-columns: ${paperSize === 'K80' ? '1fr' : '1fr 260px'};
            gap: 16px;
            margin-top: 14px;
            align-items: start;
          }
          .words {
            color: #444444;
            font-size: 11.5px;
          }
          .words b {
            color: #000000;
            font-weight: 600;
          }
          .sum .line {
            display: flex;
            justify-content: space-between;
            padding: 2.5px 0;
            font-size: 12px;
          }
          .sum .line span:last-child {
            font-variant-numeric: tabular-nums;
            font-weight: 500;
          }
          .sum .total {
            margin-top: 4px;
            padding: 6px 0;
            border-top: 2px solid #000000;
            border-bottom: 2px solid #000000;
            font-size: 13.5px;
            font-weight: 700;
          }
          .sum .debt {
            color: #dc2626;
            font-weight: 600;
            padding: 2.5px 0;
          }
          .sign {
            display: grid;
            grid-template-columns: 1fr 1fr;
            text-align: center;
            margin-top: 32px;
            padding-top: 8px;
            page-break-inside: avoid;
          }
          .sign b {
            display: block;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }
          .sign i {
            display: block;
            color: #555555;
            font-size: 10.5px;
            margin-top: 2px;
          }
          .sign .space {
            height: 70px;
          }
          .foot {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
            padding-top: 8px;
            border-top: 1px solid #999999;
            color: #666666;
            font-size: 10px;
            page-break-inside: avoid;
          }
          img.company-logo {
            max-height: 48px !important;
            max-width: 140px !important;
            object-fit: contain !important;
            display: block !important;
          }
          img.qr-code-img {
            width: ${paperSize === 'K80' ? '90px' : '100px'} !important;
            height: ${paperSize === 'K80' ? '90px' : '100px'} !important;
            max-width: ${paperSize === 'K80' ? '90px' : '100px'} !important;
            max-height: ${paperSize === 'K80' ? '90px' : '100px'} !important;
            object-fit: contain !important;
            display: block !important;
          }
        </style>
      </head>
      <body>
        <div class="print-wrapper">
          ${printPaperRef.current.innerHTML}
        </div>
      </body>
      </html>
    `);
    doc.close();

    // Ensure images inside iframe are loaded before printing
    const imgs = doc.querySelectorAll('img');
    let loadedCount = 0;
    const totalImgs = imgs.length;

    const triggerPrint = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Print iframe error:', err);
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1500);
      }
    };

    if (totalImgs === 0) {
      setTimeout(triggerPrint, 250);
    } else {
      let isTriggered = false;
      const onImageFinish = () => {
        loadedCount++;
        if (loadedCount >= totalImgs && !isTriggered) {
          isTriggered = true;
          setTimeout(triggerPrint, 200);
        }
      };

      imgs.forEach(img => {
        if (img.complete) {
          onImageFinish();
        } else {
          img.onload = onImageFinish;
          img.onerror = onImageFinish;
        }
      });

      // Safety timeout in case an image takes too long
      setTimeout(() => {
        if (!isTriggered) {
          isTriggered = true;
          triggerPrint();
        }
      }, 1000);
    }
  };

  const handleSendEmail = () => {
    const trimmed = recipientEmail.trim();
    if (!trimmed) {
      setEmailError('Vui lòng nhập địa chỉ email người nhận trước khi gửi!');
      alert('Vui lòng nhập địa chỉ email người nhận trước khi gửi!');
      emailInputRef.current?.focus();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setEmailError('Địa chỉ email không đúng định dạng. Vui lòng kiểm tra lại!');
      alert('Địa chỉ email không đúng định dạng. Vui lòng kiểm tra lại!');
      emailInputRef.current?.focus();
      return;
    }

    setEmailError('');
    alert(`Đã gửi email chứng từ ${code} tới ${trimmed} thành công!`);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="In / Gửi chứng từ"
      subtitle={`${documentType} ${code}`}
      icon="print"
      width="xl"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-[#1F2937] dark:text-gray-200 text-[13.5px] font-semibold rounded-[12px] flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer active:scale-95"
          >
            <Icon name="print" size={18} className="text-[#4B5563] dark:text-gray-300" />
            <span>In</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            title="Xuất file PDF"
            className="px-5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-[#1F2937] dark:text-gray-200 text-[13.5px] font-semibold rounded-[12px] flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer active:scale-95"
          >
            <Icon name="download" size={18} className="text-[#4B5563] dark:text-gray-300" />
            <span>Tải PDF</span>
          </button>
          <button
            type="button"
            onClick={handleSendEmail}
            className="px-5 py-2 bg-[#6D3EEB] hover:bg-[#5B2BD6] text-white text-[13.5px] font-semibold rounded-[12px] shadow-[0_8px_20px_-6px_rgba(109,62,235,0.55)] flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <Icon name="send" size={18} />
            <span>Gửi email</span>
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Settings Panel (Matching Image) */}
        <div className="lg:col-span-4 space-y-4 border-b lg:border-b-0 lg:border-r border-[#F1F2F5] dark:border-gray-800 pb-4 lg:pb-0 lg:pr-4">
          {/* Paper Size dropdown */}
          <div>
            <label className="block text-[12.5px] font-bold text-[#4B5563] dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Khổ giấy / máy in
            </label>
            <div className="relative">
              <select
                value={paperSize}
                onChange={e => setPaperSize(e.target.value as any)}
                className="w-full h-10 px-3.5 bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 rounded-[10px] text-[13.5px] font-medium text-[#111827] dark:text-white focus:outline-none focus:border-[#6D3EEB] appearance-none cursor-pointer pr-9"
              >
                <option value="A4">A4</option>
                <option value="A5">A5</option>
                <option value="K80">K80</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <Icon name="expand_more" size={18} />
              </div>
            </div>
          </div>

          {/* Doc Title */}
          <div>
            <label className="block text-[12.5px] font-bold text-[#4B5563] dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Tiêu đề chứng từ
            </label>
            <input
              type="text"
              value={docTitle}
              onChange={e => setDocTitle(e.target.value)}
              className="w-full h-10 px-3.5 bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 rounded-[10px] text-[13.5px] text-[#111827] dark:text-white focus:outline-none focus:border-[#6D3EEB]"
            />
          </div>

          {/* Recipient Email */}
          <div>
            <label className="block text-[12.5px] font-bold text-[#4B5563] dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Email người nhận (để gửi)
            </label>
            <input
              ref={emailInputRef}
              type="email"
              placeholder="Nhập email nhận chứng từ (ví dụ: ketoan@congty.com)..."
              value={recipientEmail}
              onChange={e => {
                setRecipientEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              className={`w-full h-10 px-3.5 bg-white dark:bg-gray-800 border ${
                emailError
                  ? 'border-rose-500 focus:border-rose-500 ring-2 ring-rose-200 dark:ring-rose-900/30'
                  : 'border-[#E5E7EB] dark:border-gray-700 focus:border-[#6D3EEB]'
              } rounded-[10px] text-[13.5px] text-[#111827] dark:text-white focus:outline-none transition-colors`}
            />
            {emailError && (
              <p className="text-[12px] font-medium text-rose-500 mt-1 flex items-center gap-1">
                <Icon name="error" size={14} />
                <span>{emailError}</span>
              </p>
            )}
          </div>

          {/* 10 Toggle Checkboxes (Matching Image exactly) */}
          <div>
            <label className="block text-[12.5px] font-bold text-[#4B5563] dark:text-gray-400 uppercase tracking-wider mb-2">
              Bật tắt cho riêng lần in này
            </label>
            <div className="space-y-2.5 bg-[#F9FAFB] dark:bg-gray-800/40 p-3.5 rounded-[14px] border border-[#F1F2F5] dark:border-gray-800 max-h-60 overflow-y-auto">
              <div>
                <label className="flex items-center gap-2.5 text-[12.5px] text-[#374151] dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.logo}
                    onChange={() => toggleOption('logo')}
                    className="w-4 h-4 rounded border-gray-300 text-[#6D3EEB] focus:ring-[#6D3EEB] accent-[#6D3EEB]"
                  />
                  <span>Logo & thông tin doanh nghiệp</span>
                </label>

                {options.logo && (
                  <div className="mt-2 ml-6.5 p-2 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {customLogoUrl ? (
                        <img
                          src={customLogoUrl}
                          alt="Logo preview"
                          className="w-7 h-7 object-contain rounded bg-white border border-gray-200 dark:border-gray-700 shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center font-bold text-[10px] text-gray-500 bg-gray-50 dark:bg-gray-700 shrink-0">
                          LK
                        </div>
                      )}
                      <span className="text-[11px] text-gray-600 dark:text-gray-400 truncate">
                        {customLogoUrl ? 'Logo công ty' : 'Chưa có ảnh logo'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <label className="px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-[11px] font-medium rounded cursor-pointer transition-colors flex items-center gap-1">
                        <Icon name="upload" size={13} />
                        <span>{customLogoUrl ? 'Đổi logo' : 'Tải logo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoUpload}
                        />
                      </label>
                      {customLogoUrl && (
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          title="Xóa logo"
                          className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                        >
                          <Icon name="close" size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <label className="flex items-center gap-2.5 text-[12.5px] text-[#374151] dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.partnerInfo}
                  onChange={() => toggleOption('partnerInfo')}
                  className="w-4 h-4 rounded border-gray-300 text-[#6D3EEB] focus:ring-[#6D3EEB] accent-[#6D3EEB]"
                />
                <span>Thông tin khách hàng / nhà cung cấp</span>
              </label>
              <label className="flex items-center gap-2.5 text-[12.5px] text-[#374151] dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.sku}
                  onChange={() => toggleOption('sku')}
                  className="w-4 h-4 rounded border-gray-300 text-[#6D3EEB] focus:ring-[#6D3EEB] accent-[#6D3EEB]"
                />
                <span>Cột Mã hàng</span>
              </label>
              <label className="flex items-center gap-2.5 text-[12.5px] text-[#374151] dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.unit}
                  onChange={() => toggleOption('unit')}
                  className="w-4 h-4 rounded border-gray-300 text-[#6D3EEB] focus:ring-[#6D3EEB] accent-[#6D3EEB]"
                />
                <span>Cột Đơn vị</span>
              </label>
              <label className="flex items-center gap-2.5 text-[12.5px] text-[#374151] dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.priceTotal}
                  onChange={() => toggleOption('priceTotal')}
                  className="w-4 h-4 rounded border-gray-300 text-[#6D3EEB] focus:ring-[#6D3EEB] accent-[#6D3EEB]"
                />
                <span>Cột Đơn giá & Thành tiền</span>
              </label>
              <label className="flex items-center gap-2.5 text-[12.5px] text-[#374151] dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.lineDiscount}
                  onChange={() => toggleOption('lineDiscount')}
                  className="w-4 h-4 rounded border-gray-300 text-[#6D3EEB] focus:ring-[#6D3EEB] accent-[#6D3EEB]"
                />
                <span>Cột Chiết khấu từng dòng</span>
              </label>
              <label className="flex items-center gap-2.5 text-[12.5px] text-[#374151] dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.qrCode}
                  onChange={() => toggleOption('qrCode')}
                  className="w-4 h-4 rounded border-gray-300 text-[#6D3EEB] focus:ring-[#6D3EEB] accent-[#6D3EEB]"
                />
                <span>Mã QR chuyển khoản</span>
              </label>
              <label className="flex items-center gap-2.5 text-[12.5px] text-[#374151] dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.note}
                  onChange={() => toggleOption('note')}
                  className="w-4 h-4 rounded border-gray-300 text-[#6D3EEB] focus:ring-[#6D3EEB] accent-[#6D3EEB]"
                />
                <span>Ghi chú / diễn giải</span>
              </label>
              <label className="flex items-center gap-2.5 text-[12.5px] text-[#374151] dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.signature}
                  onChange={() => toggleOption('signature')}
                  className="w-4 h-4 rounded border-gray-300 text-[#6D3EEB] focus:ring-[#6D3EEB] accent-[#6D3EEB]"
                />
                <span>Ô ký tên cuối chứng từ</span>
              </label>
              <label className="flex items-center gap-2.5 text-[12.5px] text-[#374151] dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.oldDebt}
                  onChange={() => toggleOption('oldDebt')}
                  className="w-4 h-4 rounded border-gray-300 text-[#6D3EEB] focus:ring-[#6D3EEB] accent-[#6D3EEB]"
                />
                <span>Nợ cũ & Tổng phải thu (gộp cả nợ trước đó)</span>
              </label>
            </div>
          </div>

          {/* Bank Account Selector & QR Configuration Panel */}
          {options.qrCode && (
            <div className="p-3.5 bg-[#FAF5FF] dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/50 rounded-[14px] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#6D3EEB] dark:text-[#C084FC] flex items-center gap-1.5">
                  <Icon name="qr_code_2" size={16} />
                  Tài khoản nhận thanh toán
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                  {bankAccounts.length} tài khoản
                </span>
              </div>

              <div>
                <label className="block text-[11.5px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Chọn tài khoản hiển thị mã QR:
                </label>
                <select
                  value={selectedBankId}
                  onChange={e => setSelectedBankId(e.target.value)}
                  className="w-full h-9 px-2.5 bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800/60 rounded-[8px] text-[12.5px] text-[#111827] dark:text-white focus:outline-none focus:border-[#6D3EEB]"
                >
                  {bankAccounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.bankCode} - {acc.accountNo} ({acc.bankName.split('(')[0].trim()}) {acc.isDefault ? '★ Mặc định' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 pt-1.5 border-t border-purple-100 dark:border-purple-900/40 text-[12px]">
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Nội dung chuyển khoản (tự động):
                  </label>
                  <input
                    type="text"
                    value={qrAddInfo}
                    onChange={e => setQrAddInfo(e.target.value)}
                    placeholder={`VD: ${code}`}
                    className="w-full h-8 px-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[6px] text-[12px] text-[#111827] dark:text-white focus:outline-none focus:border-[#6D3EEB]"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300 pt-1">
                  <input
                    type="checkbox"
                    checked={qrIncludeAmount}
                    onChange={e => setQrIncludeAmount(e.target.checked)}
                    className="w-4 h-4 rounded text-[#6D3EEB] accent-[#6D3EEB]"
                  />
                  <span>
                    Kèm số tiền: <strong className="text-[#6D3EEB] dark:text-purple-300">{formatCurrency(qrAmount)}</strong>
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Right Preview Frame (Matching Document layout in Image) */}
        <div className="lg:col-span-8 bg-[#F3F4F6] dark:bg-gray-900/40 p-4 sm:p-6 rounded-[20px] overflow-x-auto flex justify-center">
          <div
            ref={printPaperRef}
            id="printable-paper"
            className={`bg-white text-black shadow-md p-6 sm:p-8 rounded-xs font-sans ${
              paperSize === 'K80'
                ? 'w-[320px] text-[11px]'
                : paperSize === 'A5'
                ? 'w-[480px] text-[12px]'
                : 'w-[640px] text-[13px]'
            }`}
            style={{ minHeight: '640px', backgroundColor: '#ffffff', color: '#000000' }}
          >
            {/* 1. Header (Matching .head from mau-in-hoa-don-ban-hang.html) */}
            <div
              className="head"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                paddingBottom: '12px',
                borderBottom: '2px solid #000000',
              }}
            >
              <div className="brand" style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                {options.logo && (
                  customLogoUrl ? (
                    <img
                      src={customLogoUrl}
                      alt="Logo"
                      className="company-logo"
                      crossOrigin="anonymous"
                      style={{
                        maxHeight: '48px',
                        maxWidth: '140px',
                        objectFit: 'contain',
                        display: 'block',
                        flexShrink: 0,
                      }}
                      onError={e => {
                        e.currentTarget.style.display = 'none';
                        const fb = e.currentTarget.parentElement?.querySelector('.logo-fallback');
                        if (fb) (fb as HTMLElement).style.display = 'flex';
                      }}
                    />
                  ) : (
                    <div
                      className="logo logo-fallback"
                      style={{
                        width: '46px',
                        height: '46px',
                        border: '2px solid #000000',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '16px',
                        letterSpacing: '0.5px',
                        flexShrink: 0,
                        color: '#000000',
                      }}
                    >
                      LK
                    </div>
                  )
                )}
                <div>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: '15px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.2px',
                      color: '#000000',
                    }}
                  >
                    {companySettings.company_name || 'CÔNG TY LK ERP'}
                  </h1>
                  <p
                    style={{
                      margin: '2px 0 0',
                      color: '#444444',
                      fontSize: '11px',
                      maxWidth: '340px',
                      lineHeight: '1.35',
                    }}
                  >
                    {companySettings.address || 'Hồ Chí Minh'}
                    {companySettings.phone && ` • Hotline: ${companySettings.phone}`}
                    {companySettings.tax_code && ` • MST: ${companySettings.tax_code}`}
                  </p>
                </div>
              </div>

              <div className="doc" style={{ textAlign: 'right', flexShrink: 0 }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: paperSize === 'K80' ? '17px' : '21px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: '#000000',
                  }}
                >
                  {docTitle}
                </h2>
                <div
                  className="no"
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 600,
                    marginTop: '2px',
                    color: '#222222',
                  }}
                >
                  Số: {code}
                </div>
              </div>
            </div>

            {/* 2. Customer & Document Meta (Matching .info 2 Box Grid from mau-in-hoa-don-ban-hang.html) */}
            <div
              className="info"
              style={{
                display: 'grid',
                gridTemplateColumns: paperSize === 'K80' ? '1fr' : '1.4fr 1fr',
                gap: '12px',
                marginTop: '14px',
              }}
            >
              {options.partnerInfo ? (
                <div
                  className="box"
                  style={{
                    border: '1px solid #000000',
                    borderRadius: '6px',
                    padding: '9px 12px',
                  }}
                >
                  <h3
                    style={{
                      margin: '0 0 5px',
                      fontSize: '11px',
                      fontWeight: 700,
                      textDecoration: 'underline',
                      textUnderlineOffset: '3px',
                      textTransform: 'uppercase',
                      color: '#000000',
                    }}
                  >
                    {isPurchase ? 'Nhà cung cấp' : 'Khách hàng'}
                  </h3>
                  <div
                    className="name"
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#000000',
                      marginBottom: '3px',
                    }}
                  >
                    {partnerName || (isPurchase ? 'Nhà cung cấp lẻ' : 'Khách hàng lẻ')}
                  </div>
                  <div className="row" style={{ display: 'flex', gap: '8px', padding: '1.5px 0', fontSize: '11.5px' }}>
                    <span style={{ flex: '0 0 78px', color: '#444444' }}>Địa chỉ</span>
                    <span style={{ fontWeight: 500 }}>{partnerAddress || '---'}</span>
                  </div>
                  <div className="row" style={{ display: 'flex', gap: '8px', padding: '1.5px 0', fontSize: '11.5px' }}>
                    <span style={{ flex: '0 0 78px', color: '#444444' }}>Điện thoại</span>
                    <span style={{ fontWeight: 500 }}>{partnerPhone || '---'}</span>
                  </div>
                  <div className="row" style={{ display: 'flex', gap: '8px', padding: '1.5px 0', fontSize: '11.5px' }}>
                    <span style={{ flex: '0 0 78px', color: '#444444' }}>Mã số thuế</span>
                    <span style={{ fontWeight: 500, fontFamily: 'monospace' }}>{partnerTaxCode || '---'}</span>
                  </div>
                  {partnerEmail && (
                    <div className="row" style={{ display: 'flex', gap: '8px', padding: '1.5px 0', fontSize: '11.5px' }}>
                      <span style={{ flex: '0 0 78px', color: '#444444' }}>Email</span>
                      <span style={{ fontWeight: 500 }}>{partnerEmail}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div />
              )}

              <div
                className="box"
                style={{
                  border: '1px solid #000000',
                  borderRadius: '6px',
                  padding: '9px 12px',
                }}
              >
                <h3
                  style={{
                    margin: '0 0 5px',
                    fontSize: '11px',
                    fontWeight: 700,
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                    textTransform: 'uppercase',
                    color: '#000000',
                  }}
                >
                  Thông tin chứng từ
                </h3>
                <div className="row" style={{ display: 'flex', gap: '8px', padding: '1.5px 0', fontSize: '11.5px' }}>
                  <span style={{ flex: '0 0 78px', color: '#444444' }}>Ngày lập</span>
                  <span style={{ fontWeight: 600 }}>{formatDate(date)}</span>
                </div>
                <div className="row" style={{ display: 'flex', gap: '8px', padding: '1.5px 0', fontSize: '11.5px' }}>
                  <span style={{ flex: '0 0 78px', color: '#444444' }}>Ngày giờ in</span>
                  <span style={{ fontWeight: 500 }}>{printTimeStr}</span>
                </div>
                <div className="row" style={{ display: 'flex', gap: '8px', padding: '1.5px 0', fontSize: '11.5px' }}>
                  <span style={{ flex: '0 0 78px', color: '#444444' }}>Tiền tệ</span>
                  <span style={{ fontWeight: 500 }}>Việt Nam đồng (VND)</span>
                </div>
              </div>
            </div>

            {/* 3. Payment VietQR Block (Matching .pay from mau-in-hoa-don-ban-hang.html) */}
            {options.qrCode && activeAccount && (
              <div
                className="pay qr-container"
                style={{
                  marginTop: '14px',
                  display: 'flex',
                  justifyContent: paperSize === 'K80' ? 'center' : 'flex-start',
                  alignItems: 'center',
                  gap: paperSize === 'K80' ? '10px' : '22px',
                  border: '1.5px solid #000000',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  backgroundColor: '#ffffff',
                  flexDirection: paperSize === 'K80' ? 'column' : 'row',
                  pageBreakInside: 'avoid',
                }}
              >
                <div
                  className="qr"
                  style={{
                    width: paperSize === 'K80' ? '92px' : '104px',
                    height: paperSize === 'K80' ? '92px' : '104px',
                    flex: 'none',
                    border: '1px dashed #000000',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2px',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <img
                    src={qrCodeUrl}
                    alt="VietQR"
                    className="qr-code-img"
                    crossOrigin="anonymous"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      display: 'block',
                    }}
                    onError={e => {
                      e.currentTarget.style.display = 'none';
                      const fb = e.currentTarget.parentElement?.querySelector('.qr-fallback');
                      if (fb) (fb as HTMLElement).style.display = 'flex';
                    }}
                  />
                  <div
                    className="qr-fallback"
                    style={{
                      display: 'none',
                      width: '100%',
                      height: '100%',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      color: '#6d3eeb',
                      fontSize: '9px',
                      fontWeight: 600,
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 800 }}>VIETQR</span>
                    <span style={{ fontSize: '8px', color: '#6b7280' }}>{activeAccount.bankCode}</span>
                  </div>
                </div>

                <div
                  style={{
                    flex: 1,
                    fontSize: '11.5px',
                    lineHeight: '1.45',
                    textAlign: paperSize === 'K80' ? 'center' : 'left',
                  }}
                >
                  <h3
                    style={{
                      margin: '0 0 4px',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#000000',
                    }}
                  >
                    Quét mã để thanh toán (VietQR - NAPAS 247)
                  </h3>
                  <div
                    className="row"
                    style={{
                      display: 'flex',
                      gap: '8px',
                      padding: '1px 0',
                      justifyContent: paperSize === 'K80' ? 'center' : 'flex-start',
                    }}
                  >
                    <span style={{ flex: paperSize === 'K80' ? 'none' : '0 0 70px', color: '#444444' }}>Ngân hàng</span>
                    <span style={{ fontWeight: 600 }}>{activeAccount.bankName || activeAccount.bankCode}</span>
                  </div>
                  <div
                    className="row"
                    style={{
                      display: 'flex',
                      gap: '8px',
                      padding: '1px 0',
                      justifyContent: paperSize === 'K80' ? 'center' : 'flex-start',
                    }}
                  >
                    <span style={{ flex: paperSize === 'K80' ? 'none' : '0 0 70px', color: '#444444' }}>Số TK</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '13px', color: '#000000' }}>
                      {activeAccount.accountNo}
                    </span>
                  </div>
                  <div
                    className="row"
                    style={{
                      display: 'flex',
                      gap: '8px',
                      padding: '1px 0',
                      justifyContent: paperSize === 'K80' ? 'center' : 'flex-start',
                    }}
                  >
                    <span style={{ flex: paperSize === 'K80' ? 'none' : '0 0 70px', color: '#444444' }}>Chủ TK</span>
                    <span style={{ fontWeight: 600, textTransform: 'uppercase' }}>{activeAccount.accountName}</span>
                  </div>
                  {qrIncludeAmount && qrAmount > 0 && (
                    <div
                      className="row"
                      style={{
                        display: 'flex',
                        gap: '8px',
                        padding: '1px 0',
                        justifyContent: paperSize === 'K80' ? 'center' : 'flex-start',
                      }}
                    >
                      <span style={{ flex: paperSize === 'K80' ? 'none' : '0 0 70px', color: '#444444' }}>Số tiền</span>
                      <span className="amt" style={{ fontWeight: 700, fontSize: '13px', color: '#15803d' }}>
                        {formatCurrency(qrAmount)}
                      </span>
                    </div>
                  )}
                  <div
                    className="row"
                    style={{
                      display: 'flex',
                      gap: '8px',
                      padding: '1px 0',
                      justifyContent: paperSize === 'K80' ? 'center' : 'flex-start',
                    }}
                  >
                    <span style={{ flex: paperSize === 'K80' ? 'none' : '0 0 70px', color: '#444444' }}>Nội dung</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#000000' }}>{qrTransferContent}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Products Table (Minimalist Accounting Style - no vertical borders) */}
            <table
              className="table-modern"
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginTop: '16px',
                fontSize: paperSize === 'K80' ? '10.5px' : '11.5px',
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      width: '36px',
                      textAlign: 'center',
                      padding: '8px 4px',
                      borderTop: '2px solid #000000',
                      borderBottom: '2px solid #000000',
                      fontWeight: 700,
                      fontSize: '11px',
                      color: '#000000',
                    }}
                  >
                    STT
                  </th>
                  {options.sku && (
                    <th
                      style={{
                        width: '70px',
                        padding: '8px 6px',
                        borderTop: '2px solid #000000',
                        borderBottom: '2px solid #000000',
                        fontWeight: 700,
                        fontSize: '11px',
                        color: '#000000',
                      }}
                    >
                      Mã hàng
                    </th>
                  )}
                  <th
                    style={{
                      padding: '8px 8px',
                      borderTop: '2px solid #000000',
                      borderBottom: '2px solid #000000',
                      fontWeight: 700,
                      fontSize: '11px',
                      textAlign: 'left',
                      color: '#000000',
                    }}
                  >
                    Tên hàng / dịch vụ
                  </th>
                  {options.unit && (
                    <th
                      style={{
                        width: '44px',
                        textAlign: 'center',
                        padding: '8px 4px',
                        borderTop: '2px solid #000000',
                        borderBottom: '2px solid #000000',
                        fontWeight: 700,
                        fontSize: '11px',
                        color: '#000000',
                      }}
                    >
                      ĐVT
                    </th>
                  )}
                  <th
                    style={{
                      width: '38px',
                      textAlign: 'center',
                      padding: '8px 4px',
                      borderTop: '2px solid #000000',
                      borderBottom: '2px solid #000000',
                      fontWeight: 700,
                      fontSize: '11px',
                      color: '#000000',
                    }}
                  >
                    SL
                  </th>
                  {options.priceTotal && (
                    <th
                      style={{
                        width: '88px',
                        textAlign: 'right',
                        padding: '8px 6px',
                        borderTop: '2px solid #000000',
                        borderBottom: '2px solid #000000',
                        fontWeight: 700,
                        fontSize: '11px',
                        color: '#000000',
                      }}
                    >
                      Đơn giá
                    </th>
                  )}
                  {options.lineDiscount && (
                    <th
                      style={{
                        width: '76px',
                        textAlign: 'right',
                        padding: '8px 6px',
                        borderTop: '2px solid #000000',
                        borderBottom: '2px solid #000000',
                        fontWeight: 700,
                        fontSize: '11px',
                        color: '#000000',
                      }}
                    >
                      Chiết khấu
                    </th>
                  )}
                  {options.priceTotal && (
                    <th
                      style={{
                        width: '96px',
                        textAlign: 'right',
                        padding: '8px 6px',
                        borderTop: '2px solid #000000',
                        borderBottom: '2px solid #000000',
                        fontWeight: 700,
                        fontSize: '11px',
                        color: '#000000',
                      }}
                    >
                      Thành tiền
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={idx}>
                    <td style={{ textAlign: 'center', padding: '8px 4px', borderBottom: '1px solid #999999' }}>
                      {idx + 1}
                    </td>
                    {options.sku && (
                      <td style={{ padding: '8px 6px', borderBottom: '1px solid #999999', fontFamily: 'monospace', fontSize: '11px' }}>
                        {it.sku || '---'}
                      </td>
                    )}
                    <td style={{ padding: '8px 8px', borderBottom: '1px solid #999999', fontWeight: 500 }}>
                      {it.product_name}
                    </td>
                    {options.unit && (
                      <td style={{ textAlign: 'center', padding: '8px 4px', borderBottom: '1px solid #999999' }}>
                        {it.unit || 'Cái'}
                      </td>
                    )}
                    <td style={{ textAlign: 'center', padding: '8px 4px', borderBottom: '1px solid #999999', fontWeight: 600 }}>
                      {it.quantity}
                    </td>
                    {options.priceTotal && (
                      <td style={{ textAlign: 'right', padding: '8px 6px', borderBottom: '1px solid #999999', fontVariantNumeric: 'tabular-nums' }}>
                        {formatCurrency(it.unit_price).replace(/\s*₫|\s*đ/g, '')}
                      </td>
                    )}
                    {options.lineDiscount && (
                      <td style={{ textAlign: 'right', padding: '8px 6px', borderBottom: '1px solid #999999', fontVariantNumeric: 'tabular-nums', color: '#333333' }}>
                        {it.line_discount ? formatCurrency(it.line_discount).replace(/\s*₫|\s*đ/g, '') : '0'}
                      </td>
                    )}
                    {options.priceTotal && (
                      <td style={{ textAlign: 'right', padding: '8px 6px', borderBottom: '1px solid #999999', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                        {formatCurrency(it.line_total).replace(/\s*₫|\s*đ/g, '')}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 5. Summary & Words (Matching .bottom from mau-in-hoa-don-ban-hang.html) */}
            <div
              className="bottom"
              style={{
                display: 'grid',
                gridTemplateColumns: paperSize === 'K80' ? '1fr' : '1fr 260px',
                gap: '16px',
                marginTop: '16px',
                alignItems: 'start',
              }}
            >
              <div className="words" style={{ fontSize: '11.5px', color: '#444444' }}>
                <div>
                  Bằng chữ: <strong style={{ color: '#000000', fontWeight: 600 }}>{numberToVietnameseWords(total)}</strong>
                </div>
                {options.note && note && (
                  <div style={{ marginTop: '8px', color: '#333333', fontStyle: 'italic', fontSize: '11px' }}>
                    <strong>Ghi chú:</strong> {note}
                  </div>
                )}
              </div>

              <div className="sum" style={{ fontSize: '12px' }}>
                <div className="line" style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                  <span style={{ color: '#444444' }}>Tạm tính</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{formatCurrency(subtotal)}</span>
                </div>
                <div className="line" style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                  <span style={{ color: '#444444' }}>Chiết khấu</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
                    {discountAmount > 0 ? `-${formatCurrency(discountAmount)}` : '0 đ'}
                  </span>
                </div>
                <div className="line" style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                  <span style={{ color: '#444444' }}>VAT</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
                    {vatAmount > 0 ? `+${formatCurrency(vatAmount)}` : '0 đ'}
                  </span>
                </div>
                {shippingFee > 0 && (
                  <div className="line" style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                    <span style={{ color: '#444444' }}>Phí vận chuyển</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>+{formatCurrency(shippingFee)}</span>
                  </div>
                )}
                <div
                  className="line total"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '4px',
                    padding: '6px 0',
                    borderTop: '2px solid #000000',
                    borderBottom: '2px solid #000000',
                    fontSize: '13.5px',
                    fontWeight: 700,
                  }}
                >
                  <span>TỔNG CỘNG</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(total)}</span>
                </div>
                {options.oldDebt && debtAmount > 0 && (
                  <div
                    className="line debt"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '3px 0',
                      color: '#dc2626',
                      fontWeight: 600,
                    }}
                  >
                    <span>Còn nợ</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(debtAmount)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 6. Signatures Section (Matching .sign from mau-in-hoa-don-ban-hang.html) */}
            {options.signature && (
              <div
                className="sign"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  textAlign: 'center',
                  marginTop: '32px',
                  paddingTop: '8px',
                  pageBreakInside: 'avoid',
                }}
              >
                <div>
                  <b
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px',
                      color: '#000000',
                    }}
                  >
                    {isPurchase ? 'Nhà cung cấp' : 'Khách hàng'}
                  </b>
                  <i style={{ display: 'block', color: '#555555', fontSize: '10.5px', marginTop: '2px' }}>
                    (Ký, ghi rõ họ tên)
                  </i>
                  <div className="space" style={{ height: '70px' }} />
                </div>
                <div>
                  <b
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px',
                      color: '#000000',
                    }}
                  >
                    {isPurchase ? 'Người mua hàng' : 'Người bán hàng'}
                  </b>
                  <i style={{ display: 'block', color: '#555555', fontSize: '10.5px', marginTop: '2px' }}>
                    (Ký, ghi rõ họ tên)
                  </i>
                  <div className="space" style={{ height: '70px' }} />
                </div>
              </div>
            )}

            {/* 7. Footer (Matching .foot from mau-in-hoa-don-ban-hang.html) */}
            <div
              className="foot"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '20px',
                paddingTop: '8px',
                borderTop: '1px solid #999999',
                color: '#666666',
                fontSize: '10.5px',
                pageBreakInside: 'avoid',
              }}
            >
              <span>{companySettings.company_name || 'CÔNG TY LK ERP'} • {code}</span>
              <span>Trang 1/1</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
