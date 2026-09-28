import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Icon } from '../ui/Icon';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDateTime } from '../../lib/format';

interface PrintDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: string; // 'HÓA ĐƠN BÁN HÀNG' | 'PHIẾU MUA HÀNG' | 'BÁO GIÁ' | 'PHIẾU TRẢ HÀNG' | ...
  code: string;
  date: string;
  partnerName?: string;
  partnerPhone?: string;
  partnerAddress?: string;
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
  const [recipientEmail, setRecipientEmail] = useState('');

  // 10 print checkboxes
  const [options, setOptions] = useState({
    logo: true,
    partnerInfo: true,
    sku: true,
    unit: true,
    priceTotal: true,
    lineDiscount: true,
    qrCode: true,
    note: true,
    signature: true,
    oldDebt: true,
  });

  const toggleOption = (key: keyof typeof options) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrint = () => {
    window.print();
  };

  const isPurchase =
    documentType.includes('MUA') || documentType.includes('NCC');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="In / Gửi chứng từ"
      subtitle={`${documentType} ${code}`}
      icon="print"
      width="xl"
      footer={
        <div className="flex items-center justify-between">
          <div className="text-[12.5px] text-[#6B7280]">
            Khổ in: <span className="font-semibold text-[#111827]">{paperSize}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-white border border-[#E5E7EB] hover:bg-gray-50 text-[#1F2937] text-[13.5px] font-semibold rounded-[12px] flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Icon name="print" size={18} className="text-[#6D3EEB]" />
              <span>🖨 In</span>
            </button>
            <button
              type="button"
              onClick={() => alert(`Đã chuẩn bị tải PDF ${code}.pdf`)}
              className="px-4 py-2 bg-white border border-[#E5E7EB] hover:bg-gray-50 text-[#1F2937] text-[13.5px] font-semibold rounded-[12px] flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Icon name="download" size={18} />
              <span>⤓ Tải PDF</span>
            </button>
            <button
              type="button"
              onClick={() => {
                alert(`Đã gửi email chứng từ ${code} thành công!`);
                onClose();
              }}
              className="px-5 py-2 bg-[#6D3EEB] hover:bg-[#5B2BD6] text-white text-[13.5px] font-semibold rounded-[12px] shadow-[0_8px_20px_-6px_rgba(109,62,235,0.55)] flex items-center gap-1.5 transition-all"
            >
              <Icon name="send" size={18} />
              <span>➤ Gửi email</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Settings Panel (320px) */}
        <div className="lg:col-span-4 space-y-4 border-b lg:border-b-0 lg:border-r border-[#F1F2F5] pb-4 lg:pb-0 lg:pr-4">
          {/* Paper Size */}
          <div>
            <label className="block text-[12.5px] font-bold text-[#4B5563] uppercase tracking-wider mb-2">
              Khổ giấy / máy in
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['A4', 'A5', 'K80'] as const).map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setPaperSize(size)}
                  className={`py-2 text-[13px] font-semibold rounded-[10px] border transition-colors ${
                    paperSize === size
                      ? 'border-[#6D3EEB] bg-[#F9F5FF] text-[#6317D6]'
                      : 'border-[#E5E7EB] text-[#4B5563] hover:border-gray-300'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Doc Title */}
          <div>
            <label className="block text-[12.5px] font-bold text-[#4B5563] uppercase tracking-wider mb-1.5">
              Tiêu đề chứng từ
            </label>
            <input
              type="text"
              value={docTitle}
              onChange={e => setDocTitle(e.target.value)}
              className="w-full h-10 px-3 text-[13.5px] border border-[#E5E7EB] rounded-[10px] focus:outline-none focus:border-[#6D3EEB]"
            />
          </div>

          {/* Recipient Email */}
          <div>
            <label className="block text-[12.5px] font-bold text-[#4B5563] uppercase tracking-wider mb-1.5">
              Email người nhận
            </label>
            <input
              type="email"
              placeholder="khachhang@example.com"
              value={recipientEmail}
              onChange={e => setRecipientEmail(e.target.value)}
              className="w-full h-10 px-3 text-[13.5px] border border-[#E5E7EB] rounded-[10px] focus:outline-none focus:border-[#6D3EEB]"
            />
          </div>

          {/* 10 Toggle Checkboxes */}
          <div>
            <label className="block text-[12.5px] font-bold text-[#4B5563] uppercase tracking-wider mb-2">
              Bật tắt cho riêng lần in này
            </label>
            <div className="space-y-2 bg-[#F9FAFB] p-3 rounded-[14px] border border-[#F1F2F5] max-h-56 overflow-y-auto">
              <label className="flex items-center gap-2.5 text-[12.5px] text-[#374151] cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.logo}
                  onChange={() => toggleOption('logo')}
                  className="rounded text-[#6D3EEB] focus:ring-[#6D3EEB]"
                />
                <span>Logo & thông tin doanh nghiệp</span>
              </label>
              <label className="flex items-center gap-2.5 text-[12.5px] text-[#374151] cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.partnerInfo}
                  onChange={() => toggleOption('partnerInfo')}
                  className="rounded text-[#6D3EEB] focus:ring-[#6D3EEB]"
                />
                <span>Thông tin khách hàng / NCC</span>
              </label>
              <label className="flex items-center gap-2.5 text-[12.5px] text-[#374151] cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.sku}
                  onChange={() => toggleOption('sku')}
                  className="rounded text-[#6D3EEB] focus:ring-[#6D3EEB]"
                />
                <span>Cột Mã hàng</span>
              </label>
              <label className="flex items-center gap-2.5 text-[12.5px] text-[#374151] cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.unit}
                  onChange={() => toggleOption('unit')}
                  className="rounded text-[#6D3EEB] focus:ring-[#6D3EEB]"
                />
                <span>Cột Đơn vị</span>
              </label>
              <label className="flex items-center gap-2.5 text-[12.5px] text-[#374151] cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.priceTotal}
                  onChange={() => toggleOption('priceTotal')}
                  className="rounded text-[#6D3EEB] focus:ring-[#6D3EEB]"
                />
                <span>Cột Đơn giá & Thành tiền</span>
              </label>
              <label className="flex items-center gap-2.5 text-[12.5px] text-[#374151] cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.lineDiscount}
                  onChange={() => toggleOption('lineDiscount')}
                  className="rounded text-[#6D3EEB] focus:ring-[#6D3EEB]"
                />
                <span>Cột Chiết khấu từng dòng</span>
              </label>
              <label className="flex items-center gap-2.5 text-[12.5px] text-[#374151] cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.qrCode}
                  onChange={() => toggleOption('qrCode')}
                  className="rounded text-[#6D3EEB] focus:ring-[#6D3EEB]"
                />
                <span>Mã QR chuyển khoản VietQR</span>
              </label>
              <label className="flex items-center gap-2.5 text-[12.5px] text-[#374151] cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.note}
                  onChange={() => toggleOption('note')}
                  className="rounded text-[#6D3EEB] focus:ring-[#6D3EEB]"
                />
                <span>Ghi chú / diễn giải</span>
              </label>
              <label className="flex items-center gap-2.5 text-[12.5px] text-[#374151] cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.signature}
                  onChange={() => toggleOption('signature')}
                  className="rounded text-[#6D3EEB] focus:ring-[#6D3EEB]"
                />
                <span>Ô ký tên cuối chứng từ</span>
              </label>
              <label className="flex items-center gap-2.5 text-[12.5px] text-[#374151] cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.oldDebt}
                  onChange={() => toggleOption('oldDebt')}
                  className="rounded text-[#6D3EEB] focus:ring-[#6D3EEB]"
                />
                <span>Nợ cũ & Tổng phải thu</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Preview Frame (Paper layout based on section 10) */}
        <div className="lg:col-span-8 bg-[#F3F4F6] p-4 sm:p-6 rounded-[20px] overflow-x-auto flex justify-center">
          <div
            className={`bg-white shadow-md p-6 sm:p-8 rounded-sm text-[#111827] font-sans ${
              paperSize === 'K80'
                ? 'w-[320px] text-[11px]'
                : paperSize === 'A5'
                ? 'w-[480px] text-[12px]'
                : 'w-[640px] text-[13px]'
            }`}
            style={{ minHeight: '620px' }}
          >
            {/* Header info */}
            {options.logo && (
              <div className="flex items-start justify-between border-b border-gray-300 pb-3 mb-4">
                <div>
                  <h3 className="font-bold text-[14px] uppercase text-gray-900 leading-tight">
                    {companySettings.company_name}
                  </h3>
                  <p className="text-[12px] text-gray-600 mt-0.5">{companySettings.address}</p>
                  <p className="text-[12px] text-gray-600">
                    SĐT: {companySettings.phone} · MST: {companySettings.tax_code}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-[15px] shrink-0">
                  N1
                </div>
              </div>
            )}

            {/* Document Title & Meta */}
            <div className="text-center my-4">
              <h2 className="text-[18px] font-bold uppercase tracking-wide text-gray-900">
                {docTitle}
              </h2>
              <div className="flex items-center justify-between text-[11.5px] text-gray-500 mt-2 px-2">
                <span>Ngày lập: {formatDateTime(date)}</span>
                <span className="font-bold text-gray-800">Số phiếu: {code}</span>
              </div>
            </div>

            {/* Partner Info */}
            {options.partnerInfo && partnerName && (
              <div className="bg-gray-50 p-2.5 rounded border border-gray-200 text-[12px] mb-4 space-y-1">
                <div className="flex">
                  <span className="font-semibold w-28 text-gray-700">
                    {isPurchase ? 'Nhà cung cấp:' : 'Khách hàng:'}
                  </span>
                  <span className="font-bold text-gray-900">{partnerName}</span>
                </div>
                {partnerPhone && (
                  <div className="flex">
                    <span className="font-semibold w-28 text-gray-700">Điện thoại:</span>
                    <span>{partnerPhone}</span>
                  </div>
                )}
                {partnerAddress && (
                  <div className="flex">
                    <span className="font-semibold w-28 text-gray-700">Địa chỉ:</span>
                    <span>{partnerAddress}</span>
                  </div>
                )}
              </div>
            )}

            {/* Table */}
            <div className="border border-gray-300 rounded overflow-hidden mb-4">
              <table className="w-full text-left border-collapse text-[12px]">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300 text-gray-700 font-bold">
                    <th className="p-2 text-center w-8">STT</th>
                    {options.sku && <th className="p-2">Mã hàng</th>}
                    <th className="p-2">Tên hàng</th>
                    {options.unit && <th className="p-2 text-center">ĐV</th>}
                    <th className="p-2 text-center">SL</th>
                    {options.priceTotal && <th className="p-2 text-right">Đơn giá</th>}
                    {options.lineDiscount && <th className="p-2 text-right">CK</th>}
                    {options.priceTotal && <th className="p-2 text-right">Thành tiền</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-2 text-center text-gray-500">{idx + 1}</td>
                      {options.sku && <td className="p-2 font-mono text-[11px]">{it.sku}</td>}
                      <td className="p-2 font-medium">{it.product_name}</td>
                      {options.unit && <td className="p-2 text-center">{it.unit}</td>}
                      <td className="p-2 text-center font-semibold">{it.quantity}</td>
                      {options.priceTotal && (
                        <td className="p-2 text-right tabular-nums">{formatCurrency(it.unit_price)}</td>
                      )}
                      {options.lineDiscount && (
                        <td className="p-2 text-right tabular-nums text-gray-500">
                          {it.line_discount ? formatCurrency(it.line_discount) : '0'}
                        </td>
                      )}
                      {options.priceTotal && (
                        <td className="p-2 text-right font-semibold tabular-nums">
                          {formatCurrency(it.line_total)}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Totals */}
            <div className="flex justify-between items-start pt-2">
              {/* QR Code / Notes */}
              <div className="w-1/2 pr-4 space-y-2">
                {options.qrCode && debtAmount > 0 && (
                  <div className="p-2 border border-gray-200 rounded flex items-center gap-3 bg-gray-50">
                    <div className="w-16 h-16 bg-white border flex items-center justify-center font-mono text-[10px] text-center p-1 text-purple-700">
                      VietQR {companySettings.bank_bin}
                    </div>
                    <div className="text-[11px] leading-tight">
                      <div className="font-bold text-gray-800">Quét mã VietQR</div>
                      <div className="text-gray-500 mt-0.5">Số TK: {companySettings.bank_account_no}</div>
                      <div className="text-purple-700 font-semibold">{companySettings.bank_name}</div>
                    </div>
                  </div>
                )}
                {options.note && note && (
                  <div className="text-[11.5px] text-gray-600 italic">
                    Ghi chú: {note}
                  </div>
                )}
              </div>

              {/* Totals Table */}
              <div className="w-1/2 pl-4 text-right space-y-1 text-[12px]">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính:</span>
                  <span className="font-semibold tabular-nums">{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Chiết khấu:</span>
                    <span className="font-semibold tabular-nums">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                {vatAmount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>VAT:</span>
                    <span className="tabular-nums">+{formatCurrency(vatAmount)}</span>
                  </div>
                )}
                {shippingFee > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển:</span>
                    <span className="tabular-nums">+{formatCurrency(shippingFee)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-300 pt-1 text-[14px] font-bold text-gray-900">
                  <span>TỔNG CỘNG:</span>
                  <span className="text-purple-700 tabular-nums">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Đã thanh toán:</span>
                  <span className="tabular-nums font-semibold">{formatCurrency(paidAmount)}</span>
                </div>
                <div className="flex justify-between text-red-600 font-bold">
                  <span>Còn nợ:</span>
                  <span className="tabular-nums">{formatCurrency(debtAmount)}</span>
                </div>
              </div>
            </div>

            {/* Signatures */}
            {options.signature && (
              <div className="grid grid-cols-2 text-center mt-12 pt-4 border-t border-gray-200 text-[12px]">
                <div>
                  <div className="font-bold text-gray-800">
                    {isPurchase ? 'Nhà cung cấp' : 'Khách hàng'}
                  </div>
                  <div className="text-[11px] text-gray-500 italic mt-0.5">(Ký, ghi rõ họ tên)</div>
                  <div className="h-16" />
                </div>
                <div>
                  <div className="font-bold text-gray-800">
                    {isPurchase ? 'Người mua hàng' : 'Người bán hàng'}
                  </div>
                  <div className="text-[11px] text-gray-500 italic mt-0.5">(Ký, ghi rõ họ tên)</div>
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
