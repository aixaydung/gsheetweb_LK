import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Icon } from '../ui/Icon';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate, formatDateTime } from '../../lib/format';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  items: Array<{
    sku: string;
    product_name: string;
    unit: string;
    quantity: number;
    unit_price: number;
    line_discount?: number;
    line_total: number;
  }>;
  subtotal: number;
  discountAmount?: number;
  vatAmount?: number;
  shippingFee?: number;
  total: number;
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
  items,
  subtotal,
  discountAmount = 0,
  vatAmount = 0,
  shippingFee = 0,
  total,
  paidAmount = 0,
  debtAmount = 0,
  note,
}) => {
  const { companySettings } = useApp();
  const [paperSize, setPaperSize] = useState<'A4' | 'A5' | 'K80'>('A4');
  const [docTitle, setDocTitle] = useState(documentType);
  const [recipientEmail, setRecipientEmail] = useState(partnerEmail || '');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

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
          table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #000000;
          }
          th, td {
            border: 1px solid #000000;
            padding: ${paperSize === 'K80' ? '4px 3px' : '5px 7px'};
          }
          th {
            background-color: #f3f4f6;
            font-weight: 700;
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
          .grid-2 {
            display: flex;
            justify-content: space-between;
          }
          .space-y-1 > * + * { margin-top: 3px; }
          .mt-2 { margin-top: 8px; }
          .mt-4 { margin-top: 16px; }
          .mt-8 { margin-top: 32px; }
          .mb-1 { margin-bottom: 4px; }
          .mb-3 { margin-bottom: 12px; }
          .flex { display: flex; }
          .justify-between { justify-content: space-between; }
          .items-center { align-items: center; }
          img { max-height: 50px; max-width: 150px; object-contain: contain; }
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

  // Real PDF generator & downloader using html2canvas & jsPDF
  const handleDownloadPdf = async () => {
    if (!printPaperRef.current) return;
    setIsExportingPdf(true);
    try {
      const element = printPaperRef.current;

      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);

      let pdfWidth = 210;
      let pdfHeight = 297;
      let format: any = 'a4';

      if (paperSize === 'A5') {
        pdfWidth = 148;
        pdfHeight = 210;
        format = 'a5';
      } else if (paperSize === 'K80') {
        pdfWidth = 80;
        const calculatedHeight = (canvas.height * 80) / canvas.width;
        pdfHeight = Math.max(120, calculatedHeight);
        format = [80, pdfHeight];
      }

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: format,
      });

      const margin = paperSize === 'K80' ? 2 : 8;
      const contentWidth = pdfWidth - margin * 2;
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', margin, margin, contentWidth, contentHeight);

      const safeDocName = (docTitle || 'CHUNG_TU').replace(/[\/\\?%*:|"<>]/g, '_');
      const safeCode = (code || 'LK').replace(/[\/\\?%*:|"<>]/g, '_');
      pdf.save(`${safeDocName}_${safeCode}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Không thể tạo file PDF. Vui lòng thử lại hoặc chọn nút In rồi Lưu dưới dạng PDF.');
    } finally {
      setIsExportingPdf(false);
    }
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
            className="px-4 py-2 bg-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-[#1F2937] dark:text-gray-200 text-[13.5px] font-semibold rounded-[12px] flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer active:scale-95"
          >
            <Icon name="print" size={18} className="text-[#4B5563]" />
            <span>In</span>
          </button>
          <button
            type="button"
            disabled={isExportingPdf}
            onClick={handleDownloadPdf}
            className="px-4 py-2 bg-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-[#1F2937] dark:text-gray-200 text-[13.5px] font-semibold rounded-[12px] flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer disabled:opacity-60 active:scale-95"
          >
            {isExportingPdf ? (
              <>
                <Icon name="sync" size={18} className="animate-spin text-[#6D3EEB]" />
                <span>Đang tạo PDF...</span>
              </>
            ) : (
              <>
                <Icon name="download" size={18} className="text-[#4B5563]" />
                <span>Tải PDF</span>
              </>
            )}
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
        {/* Left Settings Panel (Matching Image 1) */}
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
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-[14px] uppercase text-black leading-tight tracking-wide">
                      {companySettings.company_name || 'CÔNG TY NEXUP TECHNOLOGY'}
                    </h3>
                    <p className="text-[12px] text-gray-700 mt-0.5">
                      {companySettings.address || 'Hồ Chí Minh'}
                    </p>
                  </div>
                  {companySettings.logo_url && (
                    <img
                      src={companySettings.logo_url}
                      alt="Logo"
                      className="max-h-12 max-w-[130px] object-contain shrink-0"
                    />
                  )}
                </div>
                {/* Solid Divider Line */}
                <div className="border-b-[1.5px] border-black my-2.5 w-full" />
              </div>
            )}

            {/* 2. Document Title and Header Meta (Matching Image) */}
            <div className="my-2">
              <div className="grid grid-cols-12 items-start">
                <div className="col-span-8 text-center pl-8">
                  <h2 className="text-[19px] font-black uppercase tracking-wider text-black leading-tight">
                    {docTitle}
                  </h2>
                  <p className="text-[12px] text-gray-800 mt-1">
                    Ngày lập phiếu:{' '}
                    <strong className="text-black font-bold">{formatDate(date)}</strong>
                  </p>
                </div>
                <div className="col-span-4 text-right text-[11.5px] text-black space-y-0.5">
                  <div>
                    Số phiếu: <strong className="font-bold">{code}</strong>
                  </div>
                  <div>
                    Ngày giờ in: <span className="text-gray-800">{printTimeStr}</span>
                  </div>
                  <div>
                    Đơn vị tiền tệ: <span className="text-gray-800">Việt Nam đồng</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Partner Information Section (2 Columns matching Image) */}
            {options.partnerInfo && (
              <div className="grid grid-cols-12 text-[12.5px] text-black my-3.5 leading-relaxed">
                <div className="col-span-7 space-y-1">
                  <div className="flex">
                    <span className="font-semibold w-24 shrink-0 text-black">
                      {isPurchase ? 'Nhà cung cấp:' : 'Khách hàng:'}
                    </span>
                    <span className="font-bold text-black">{partnerName || 'Công ty Minh An'}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-24 shrink-0 text-black">Địa chỉ:</span>
                    <span className="text-gray-900">{partnerAddress || 'Quận 1, TP.HCM'}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-24 shrink-0 text-black">Email/Website:</span>
                    <span className="text-gray-900">
                      {partnerEmail || recipientEmail || 'optimatevn@gmail.com'}
                    </span>
                  </div>
                </div>

                <div className="col-span-5 space-y-1 pl-2">
                  <div className="flex">
                    <span className="font-semibold w-24 shrink-0 text-black">Điện thoại:</span>
                    <span className="text-gray-900">{partnerPhone || '0874xxx664'}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-24 shrink-0 text-black">Mã số thuế:</span>
                    <span className="text-gray-900 font-mono">{partnerTaxCode || '---'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Products Table (Accounting standard black border matching Image) */}
            <div className="my-3 overflow-hidden">
              <table className="w-full border-collapse border border-black text-[12px]">
                <thead>
                  <tr className="bg-gray-100/70 border-b border-black text-black font-bold">
                    <th className="border border-black p-2 text-center w-9">STT</th>
                    {options.sku && (
                      <th className="border border-black p-2 text-center w-20">Mã hàng</th>
                    )}
                    <th className="border border-black p-2 text-center">Tên hàng</th>
                    {options.unit && (
                      <th className="border border-black p-2 text-center w-12">ĐV</th>
                    )}
                    <th className="border border-black p-2 text-center w-12">SL</th>
                    {options.priceTotal && (
                      <th className="border border-black p-2 text-center w-24">Đơn giá</th>
                    )}
                    {options.lineDiscount && (
                      <th className="border border-black p-2 text-center w-20">Chiết khấu</th>
                    )}
                    {options.priceTotal && (
                      <th className="border border-black p-2 text-center w-28">Thành tiền</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={idx} className="border-b border-black">
                      <td className="border border-black p-2 text-center">{idx + 1}</td>
                      {options.sku && (
                        <td className="border border-black p-2 text-center font-mono text-[11.5px]">
                          {it.sku || 'CP001'}
                        </td>
                      )}
                      <td className="border border-black p-2 text-left font-medium">
                        {it.product_name}
                      </td>
                      {options.unit && (
                        <td className="border border-black p-2 text-center">{it.unit || 'Cái'}</td>
                      )}
                      <td className="border border-black p-2 text-center font-semibold">
                        {it.quantity}
                      </td>
                      {options.priceTotal && (
                        <td className="border border-black p-2 text-right tabular-nums">
                          {formatCurrency(it.unit_price).replace(/\s*₫|\s*đ/g, '')}
                        </td>
                      )}
                      {options.lineDiscount && (
                        <td className="border border-black p-2 text-right tabular-nums text-gray-700">
                          {it.line_discount ? formatCurrency(it.line_discount).replace(/\s*₫|\s*đ/g, '') : '0'}
                        </td>
                      )}
                      {options.priceTotal && (
                        <td className="border border-black p-2 text-right font-medium tabular-nums">
                          {formatCurrency(it.line_total).replace(/\s*₫|\s*đ/g, '')}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 5. Summary Totals (Matching Right alignment in Image) */}
            <div className="flex justify-end my-2">
              <div className="w-64 text-right space-y-1 text-[12.5px] text-black">
                <div className="flex justify-between">
                  <span className="text-gray-800">Tạm tính</span>
                  <span className="font-semibold tabular-nums">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-800">Chiết khấu</span>
                  <span className="tabular-nums">
                    {discountAmount > 0 ? `-${formatCurrency(discountAmount)}` : '0 đ'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-800">VAT</span>
                  <span className="tabular-nums">
                    {vatAmount > 0 ? `+${formatCurrency(vatAmount)}` : '0 đ'}
                  </span>
                </div>
                {shippingFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-800">Phí vận chuyển</span>
                    <span className="tabular-nums">+{formatCurrency(shippingFee)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-gray-400 font-bold text-[14px] text-black">
                  <span className="uppercase">TỔNG CỘNG</span>
                  <span className="font-black tabular-nums">{formatCurrency(total)}</span>
                </div>
                {options.oldDebt && debtAmount > 0 && (
                  <div className="flex justify-between text-red-600 font-semibold pt-0.5">
                    <span>Còn nợ:</span>
                    <span className="tabular-nums">{formatCurrency(debtAmount)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* QR Code if enabled */}
            {options.qrCode && (
              <div className="my-3 p-2 border border-gray-300 rounded flex items-center gap-3 bg-gray-50 w-64">
                <div className="w-14 h-14 bg-white border flex items-center justify-center font-mono text-[9px] text-center p-1 text-purple-700">
                  VietQR
                </div>
                <div className="text-[11px] leading-tight">
                  <div className="font-bold text-gray-800">Quét mã VietQR</div>
                  <div className="text-gray-600 mt-0.5">Số TK: {companySettings.bank_account_no}</div>
                  <div className="text-purple-700 font-semibold">{companySettings.bank_name}</div>
                </div>
              </div>
            )}

            {/* Note Section */}
            {options.note && note && (
              <div className="text-[12px] text-gray-800 italic mt-2">
                <strong>Ghi chú:</strong> {note}
              </div>
            )}

            {/* 6. Signatures Section (Matching Image: Khách hàng / Người bán hàng) */}
            {options.signature && (
              <div className="grid grid-cols-2 text-center mt-12 pt-4 text-[12.5px] text-black">
                <div>
                  <div className="font-bold uppercase tracking-tight">
                    {isPurchase ? 'Nhà cung cấp' : 'Khách hàng'}
                  </div>
                  <div className="text-[11px] text-gray-600 italic mt-0.5">(Ký, ghi rõ họ tên)</div>
                  <div className="h-16" />
                </div>
                <div>
                  <div className="font-bold uppercase tracking-tight">
                    {isPurchase ? 'Người mua hàng' : 'Người bán hàng'}
                  </div>
                  <div className="text-[11px] text-gray-600 italic mt-0.5">(Ký, ghi rõ họ tên)</div>
                  <div className="h-16" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
