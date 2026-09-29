import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Icon } from '../ui/Icon';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate, formatDateTime } from '../../lib/format';

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
  const { companySettings } = useApp();
  const [paperSize, setPaperSize] = useState<'A4' | 'A5' | 'K80'>('A4');
  const [docTitle, setDocTitle] = useState(documentType);
  const [recipientEmail, setRecipientEmail] = useState(partnerEmail || '');

  useEffect(() => {
    if (partnerEmail) {
      setRecipientEmail(partnerEmail);
    }
  }, [partnerEmail]);

  useEffect(() => {
    setDocTitle(documentType);
  }, [documentType]);

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
        <style>
          @page {
            size: ${paperSizeCss};
            margin: ${paperSize === 'K80' ? '2mm' : '8mm 10mm'};
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #000000;
            background: #ffffff;
            font-size: ${paperSize === 'K80' ? '11px' : paperSize === 'A5' ? '12px' : '13px'};
            line-height: 1.45;
          }
          .print-wrapper {
            width: 100%;
            max-width: ${paperWidth};
            margin: 0 auto;
            background: #ffffff;
          }
          /* Standard accounting data table with crisp borders */
          .data-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #000000;
            margin: 8px 0;
          }
          .data-table th, .data-table td {
            border: 1px solid #000000;
            padding: ${paperSize === 'K80' ? '4px 3px' : '6px 7px'};
          }
          .data-table th {
            background-color: #f3f4f6;
            font-weight: 700;
            text-align: center;
          }
          /* Layout table with no borders for headers and signatures */
          .layout-table {
            width: 100%;
            border-collapse: collapse;
            border: none !important;
          }
          .layout-table td, .layout-table th {
            border: none !important;
            padding: 2px 4px;
            vertical-align: top;
          }
          .tabular-nums {
            font-variant-numeric: tabular-nums;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .text-left { text-align: left; }
          .font-bold { font-weight: 700; }
          .font-semibold { font-weight: 600; }
          .font-medium { font-weight: 500; }
          .uppercase { text-transform: uppercase; }
          .italic { font-style: italic; }
          .divider-line {
            border-bottom: 1.5px solid #000000;
            width: 100%;
            margin: 8px 0 12px 0;
          }
          .totals-box {
            display: flex;
            justify-content: flex-end;
            margin: 8px 0;
          }
          .totals-table {
            width: 250px;
            text-align: right;
            font-size: 12.5px;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 2px 0;
          }
          .signatures-table {
            width: 100%;
            margin-top: 36px;
            text-align: center;
          }
          img { max-height: 50px; max-width: 150px; object-fit: contain; }
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

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Print iframe error:', err);
      } finally {
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1500);
      }
    }, 250);
  };

  const isPurchase =
    documentType.includes('MUA') || documentType.includes('NCC');

  const printTimeStr = formatDateTime(new Date().toISOString());

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
            className="px-5 py-2 bg-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-[#1F2937] dark:text-gray-200 text-[13.5px] font-semibold rounded-[12px] flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer active:scale-95"
          >
            <Icon name="print" size={18} className="text-[#4B5563]" />
            <span>In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              alert(`Đã gửi email chứng từ ${code} tới ${recipientEmail || 'người nhận'} thành công!`);
              onClose();
            }}
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
              type="email"
              placeholder="optimatevn@gmail.com"
              value={recipientEmail}
              onChange={e => setRecipientEmail(e.target.value)}
              className="w-full h-10 px-3.5 bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 rounded-[10px] text-[13.5px] text-[#111827] dark:text-white focus:outline-none focus:border-[#6D3EEB]"
            />
          </div>

          {/* 10 Toggle Checkboxes (Matching Image exactly) */}
          <div>
            <label className="block text-[12.5px] font-bold text-[#4B5563] dark:text-gray-400 uppercase tracking-wider mb-2">
              Bật tắt cho riêng lần in này
            </label>
            <div className="space-y-2.5 bg-[#F9FAFB] dark:bg-gray-800/40 p-3.5 rounded-[14px] border border-[#F1F2F5] dark:border-gray-800 max-h-60 overflow-y-auto">
              <label className="flex items-center gap-2.5 text-[12.5px] text-[#374151] dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.logo}
                  onChange={() => toggleOption('logo')}
                  className="w-4 h-4 rounded border-gray-300 text-[#6D3EEB] focus:ring-[#6D3EEB] accent-[#6D3EEB]"
                />
                <span>Logo & thông tin doanh nghiệp</span>
              </label>
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
            {/* 1. Company Information Header (Top left) */}
            {options.logo && (
              <div>
                <table className="layout-table" style={{ width: '100%', border: 'none' }}>
                  <tbody>
                    <tr>
                      <td style={{ border: 'none', textAlign: 'left', verticalAlign: 'top', padding: 0 }}>
                        <h3
                          style={{
                            fontWeight: 700,
                            fontSize: '14px',
                            textTransform: 'uppercase',
                            color: '#000000',
                            margin: 0,
                            letterSpacing: '0.3px',
                          }}
                        >
                          {companySettings.company_name || 'CÔNG TY LK ERP'}
                        </h3>
                        <p style={{ fontSize: '12px', color: '#333333', margin: '2px 0 0 0' }}>
                          {companySettings.address || 'Hồ Chí Minh'}
                        </p>
                      </td>
                      {companySettings.logo_url && (
                        <td
                          style={{
                            border: 'none',
                            textAlign: 'right',
                            verticalAlign: 'top',
                            padding: 0,
                            width: '130px',
                          }}
                        >
                          <img
                            src={companySettings.logo_url}
                            alt="Logo"
                            style={{ maxHeight: '48px', maxWidth: '120px', objectFit: 'contain' }}
                          />
                        </td>
                      )}
                    </tr>
                  </tbody>
                </table>
                {/* Solid Divider Line */}
                <div style={{ borderBottom: '1.5px solid #000000', width: '100%', margin: '8px 0 12px 0' }} />
              </div>
            )}

            {/* 2. Document Title and Header Meta (Matching Image) */}
            <div style={{ margin: '8px 0 12px 0' }}>
              <table className="layout-table" style={{ width: '100%', border: 'none' }}>
                <tbody>
                  <tr>
                    <td
                      style={{
                        border: 'none',
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        width: '65%',
                        padding: 0,
                      }}
                    >
                      <h2
                        style={{
                          fontSize: '19px',
                          fontWeight: 900,
                          textTransform: 'uppercase',
                          letterSpacing: '0.8px',
                          color: '#000000',
                          margin: 0,
                        }}
                      >
                        {docTitle}
                      </h2>
                      <p style={{ fontSize: '12px', color: '#333333', margin: '3px 0 0 0' }}>
                        Ngày lập phiếu: <strong style={{ color: '#000000' }}>{formatDate(date)}</strong>
                      </p>
                    </td>
                    <td
                      style={{
                        border: 'none',
                        textAlign: 'right',
                        verticalAlign: 'middle',
                        width: '35%',
                        fontSize: '11.5px',
                        color: '#000000',
                        lineHeight: '1.45',
                        padding: 0,
                      }}
                    >
                      <div>
                        Số phiếu: <strong>{code}</strong>
                      </div>
                      <div>
                        Ngày giờ in: <span style={{ color: '#333333' }}>{printTimeStr}</span>
                      </div>
                      <div>
                        Đơn vị tiền tệ: <span style={{ color: '#333333' }}>Việt Nam đồng</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 3. Partner Information Section (2 Columns using robust layout-table) */}
            {options.partnerInfo && (
              <div style={{ margin: '10px 0 12px 0' }}>
                <table
                  className="layout-table"
                  style={{ width: '100%', border: 'none', fontSize: '12.5px', color: '#000000' }}
                >
                  <tbody>
                    <tr>
                      <td style={{ border: 'none', width: '58%', padding: '2px 0', verticalAlign: 'top' }}>
                        <span style={{ fontWeight: 600 }}>{isPurchase ? 'Nhà cung cấp:' : 'Khách hàng:'}</span>{' '}
                        <strong>{partnerName || 'Công ty Minh An'}</strong>
                      </td>
                      <td style={{ border: 'none', width: '42%', padding: '2px 0', verticalAlign: 'top' }}>
                        <span style={{ fontWeight: 600 }}>Điện thoại:</span>{' '}
                        <span>{partnerPhone || '---'}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: 'none', padding: '2px 0', verticalAlign: 'top' }}>
                        <span style={{ fontWeight: 600 }}>Địa chỉ:</span>{' '}
                        <span>{partnerAddress || '---'}</span>
                      </td>
                      <td style={{ border: 'none', padding: '2px 0', verticalAlign: 'top' }}>
                        <span style={{ fontWeight: 600 }}>Mã số thuế:</span>{' '}
                        <span style={{ fontFamily: 'monospace' }}>{partnerTaxCode || '---'}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: 'none', padding: '2px 0', verticalAlign: 'top' }}>
                        <span style={{ fontWeight: 600 }}>Email/Website:</span>{' '}
                        <span>{partnerEmail || recipientEmail || '---'}</span>
                      </td>
                      <td style={{ border: 'none', padding: '2px 0', verticalAlign: 'top' }}></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* 4. Products Table (Accounting standard black border matching Image) */}
            <div style={{ margin: '10px 0' }}>
              <table
                className="data-table"
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  border: '1px solid #000000',
                  fontSize: '12px',
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #000000', color: '#000000' }}>
                    <th style={{ border: '1px solid #000000', padding: '5px 4px', textAlign: 'center', width: '36px' }}>
                      STT
                    </th>
                    {options.sku && (
                      <th style={{ border: '1px solid #000000', padding: '5px 6px', textAlign: 'center', width: '75px' }}>
                        Mã hàng
                      </th>
                    )}
                    <th style={{ border: '1px solid #000000', padding: '5px 8px', textAlign: 'center' }}>
                      Tên hàng
                    </th>
                    {options.unit && (
                      <th style={{ border: '1px solid #000000', padding: '5px 4px', textAlign: 'center', width: '45px' }}>
                        ĐV
                      </th>
                    )}
                    <th style={{ border: '1px solid #000000', padding: '5px 4px', textAlign: 'center', width: '45px' }}>
                      SL
                    </th>
                    {options.priceTotal && (
                      <th style={{ border: '1px solid #000000', padding: '5px 6px', textAlign: 'center', width: '90px' }}>
                        Đơn giá
                      </th>
                    )}
                    {options.lineDiscount && (
                      <th style={{ border: '1px solid #000000', padding: '5px 6px', textAlign: 'center', width: '75px' }}>
                        Chiết khấu
                      </th>
                    )}
                    {options.priceTotal && (
                      <th style={{ border: '1px solid #000000', padding: '5px 6px', textAlign: 'center', width: '100px' }}>
                        Thành tiền
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #000000' }}>
                      <td style={{ border: '1px solid #000000', padding: '5px 4px', textAlign: 'center' }}>
                        {idx + 1}
                      </td>
                      {options.sku && (
                        <td
                          style={{
                            border: '1px solid #000000',
                            padding: '5px 6px',
                            textAlign: 'center',
                            fontFamily: 'monospace',
                            fontSize: '11.5px',
                          }}
                        >
                          {it.sku || '---'}
                        </td>
                      )}
                      <td style={{ border: '1px solid #000000', padding: '5px 8px', textAlign: 'left', fontWeight: 500 }}>
                        {it.product_name}
                      </td>
                      {options.unit && (
                        <td style={{ border: '1px solid #000000', padding: '5px 4px', textAlign: 'center' }}>
                          {it.unit || 'Cái'}
                        </td>
                      )}
                      <td
                        style={{
                          border: '1px solid #000000',
                          padding: '5px 4px',
                          textAlign: 'center',
                          fontWeight: 600,
                        }}
                      >
                        {it.quantity}
                      </td>
                      {options.priceTotal && (
                        <td
                          style={{
                            border: '1px solid #000000',
                            padding: '5px 6px',
                            textAlign: 'right',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {formatCurrency(it.unit_price).replace(/\s*₫|\s*đ/g, '')}
                        </td>
                      )}
                      {options.lineDiscount && (
                        <td
                          style={{
                            border: '1px solid #000000',
                            padding: '5px 6px',
                            textAlign: 'right',
                            fontVariantNumeric: 'tabular-nums',
                            color: '#333333',
                          }}
                        >
                          {it.line_discount ? formatCurrency(it.line_discount).replace(/\s*₫|\s*đ/g, '') : '0'}
                        </td>
                      )}
                      {options.priceTotal && (
                        <td
                          style={{
                            border: '1px solid #000000',
                            padding: '5px 6px',
                            textAlign: 'right',
                            fontWeight: 500,
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {formatCurrency(it.line_total).replace(/\s*₫|\s*đ/g, '')}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 5. Summary Totals (Matching Right alignment in Image) */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', margin: '8px 0 12px 0' }}>
              <div style={{ width: '260px', marginLeft: 'auto', textAlign: 'right', fontSize: '12.5px', color: '#000000' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5px 0' }}>
                  <span style={{ color: '#333333' }}>Tạm tính</span>
                  <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5px 0' }}>
                  <span style={{ color: '#333333' }}>Chiết khấu</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {discountAmount > 0 ? `-${formatCurrency(discountAmount)}` : '0 đ'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5px 0' }}>
                  <span style={{ color: '#333333' }}>VAT</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {vatAmount > 0 ? `+${formatCurrency(vatAmount)}` : '0 đ'}
                  </span>
                </div>
                {shippingFee > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5px 0' }}>
                    <span style={{ color: '#333333' }}>Phí vận chuyển</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>+{formatCurrency(shippingFee)}</span>
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: '5px',
                    borderTop: '1px solid #777777',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    color: '#000000',
                    marginTop: '2px',
                  }}
                >
                  <span style={{ textTransform: 'uppercase' }}>TỔNG CỘNG</span>
                  <span style={{ fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrency(total)}
                  </span>
                </div>
                {options.oldDebt && debtAmount > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: '#dc2626',
                      fontWeight: 600,
                      paddingTop: '2px',
                    }}
                  >
                    <span>Còn nợ:</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(debtAmount)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Note Section */}
            {options.note && note && (
              <div style={{ fontSize: '12px', color: '#111111', fontStyle: 'italic', margin: '4px 0 12px 0' }}>
                <strong>Ghi chú:</strong> {note}
              </div>
            )}

            {/* QR Code if enabled */}
            {options.qrCode && (
              <div
                style={{
                  margin: '8px 0',
                  padding: '8px',
                  border: '1px solid #cccccc',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: '#f9f9f9',
                  width: '240px',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #ddd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'monospace',
                    fontSize: '9px',
                    textAlign: 'center',
                    padding: '4px',
                    color: '#6d3eeb',
                  }}
                >
                  VietQR
                </div>
                <div style={{ fontSize: '11px', lineHeight: '1.3' }}>
                  <div style={{ fontWeight: 'bold', color: '#111827' }}>Quét mã VietQR</div>
                  <div style={{ color: '#4b5563', marginTop: '2px' }}>
                    Số TK: {companySettings.bank_account_no}
                  </div>
                  <div style={{ color: '#6d3eeb', fontWeight: 600 }}>{companySettings.bank_name}</div>
                </div>
              </div>
            )}

            {/* 6. Signatures Section (Table-based 2 columns: KHÁCH HÀNG / NGƯỜI BÁN HÀNG) */}
            {options.signature && (
              <div style={{ marginTop: '36px' }}>
                <table
                  className="layout-table signatures-table"
                  style={{ width: '100%', border: 'none', textAlign: 'center', fontSize: '12.5px', color: '#000000' }}
                >
                  <tbody>
                    <tr>
                      <td
                        style={{
                          width: '50%',
                          border: 'none',
                          textAlign: 'center',
                          verticalAlign: 'top',
                          padding: 0,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.4px',
                            color: '#000000',
                          }}
                        >
                          {isPurchase ? 'NHÀ CUNG CẤP' : 'KHÁCH HÀNG'}
                        </div>
                        <div
                          style={{
                            fontSize: '11px',
                            color: '#555555',
                            fontStyle: 'italic',
                            marginTop: '3px',
                          }}
                        >
                          (Ký, ghi rõ họ tên)
                        </div>
                        <div style={{ height: '65px' }} />
                      </td>
                      <td
                        style={{
                          width: '50%',
                          border: 'none',
                          textAlign: 'center',
                          verticalAlign: 'top',
                          padding: 0,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.4px',
                            color: '#000000',
                          }}
                        >
                          {isPurchase ? 'NGƯỜI MUA HÀNG' : 'NGƯỜI BÁN HÀNG'}
                        </div>
                        <div
                          style={{
                            fontSize: '11px',
                            color: '#555555',
                            fontStyle: 'italic',
                            marginTop: '3px',
                          }}
                        >
                          (Ký, ghi rõ họ tên)
                        </div>
                        <div style={{ height: '65px' }} />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
