import React, { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Icon } from '../ui/Icon';
import { useApp } from '../../context/AppContext';
import { Customer, Supplier } from '../../types';
import { formatCurrency, formatDate } from '../../lib/format';
import { exportToExcelFile, ExportColumn } from '../../lib/excelExport';

interface DebtReconciliationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPartnerId?: string;
  initialPartnerType?: 'customer' | 'supplier';
}

interface ReconciliationItem {
  id: string;
  date: string;
  code: string;
  type: 'invoice' | 'purchase' | 'payment_in' | 'payment_out' | 'sales_return' | 'purchase_return';
  description: string;
  increase: number; // Phát sinh tăng (Nợ tăng)
  decrease: number; // Phát sinh giảm (Nợ giảm)
  runningBalance: number; // Dư nợ lũy kế
}

export const DebtReconciliationModal: React.FC<DebtReconciliationModalProps> = ({
  isOpen,
  onClose,
  initialPartnerId,
  initialPartnerType = 'customer',
}) => {
  const { customers, suppliers, invoices, purchaseOrders, payments, salesReturns, purchaseReturns, companySettings } = useApp();

  const [partnerType, setPartnerType] = useState<'customer' | 'supplier'>(initialPartnerType);
  const [partnerId, setPartnerId] = useState<string>(initialPartnerId || '');
  
  // Default date range: from beginning of current year or 90 days ago to today
  const todayStr = new Date().toISOString().split('T')[0];
  const firstDayOfYear = `${new Date().getFullYear()}-01-01`;
  const [fromDate, setFromDate] = useState<string>(firstDayOfYear);
  const [toDate, setToDate] = useState<string>(todayStr);

  // Update partnerId when initialPartnerId changes
  React.useEffect(() => {
    if (initialPartnerId) {
      setPartnerId(initialPartnerId);
    } else if (!partnerId) {
      if (partnerType === 'customer' && customers.length > 0) {
        setPartnerId(customers[0].id);
      } else if (partnerType === 'supplier' && suppliers.length > 0) {
        setPartnerId(suppliers[0].id);
      }
    }
  }, [initialPartnerId, partnerType, customers, suppliers]);

  const selectedCustomer = useMemo(
    () => (partnerType === 'customer' ? customers.find(c => c.id === partnerId) : null),
    [customers, partnerId, partnerType]
  );

  const selectedSupplier = useMemo(
    () => (partnerType === 'supplier' ? suppliers.find(s => s.id === partnerId) : null),
    [suppliers, partnerId, partnerType]
  );

  const partnerInfo = partnerType === 'customer' ? selectedCustomer : selectedSupplier;

  // Calculate reconciliation ledger
  const { openingBalance, items, totalIncrease, totalDecrease, closingBalance } = useMemo(() => {
    if (!partnerId) {
      return { openingBalance: 0, items: [], totalIncrease: 0, totalDecrease: 0, closingBalance: 0 };
    }

    let priorIncrease = 0;
    let priorDecrease = 0;
    const rawItems: Array<{
      id: string;
      date: string;
      code: string;
      type: ReconciliationItem['type'];
      description: string;
      increase: number;
      decrease: number;
    }> = [];

    if (partnerType === 'customer') {
      // Customer: Invoices increase debt; Payments & Sales Returns decrease debt
      const custInvoices = invoices.filter(i => i.customer_id === partnerId && i.status !== 'cancelled');
      for (const inv of custInvoices) {
        const d = inv.invoice_date || '';
        if (d < fromDate) {
          priorIncrease += inv.total;
        } else if (d <= toDate) {
          rawItems.push({
            id: inv.id,
            date: d,
            code: inv.code,
            type: 'invoice',
            description: `Hóa đơn bán hàng ${inv.code}`,
            increase: inv.total,
            decrease: 0,
          });
        }
      }

      const custPayments = payments.filter(
        p => p.partner_id === partnerId && p.direction === 'in' && p.status !== 'cancelled'
      );
      for (const p of custPayments) {
        const d = p.payment_date ? p.payment_date.split('T')[0] : '';
        if (d < fromDate) {
          priorDecrease += p.amount;
        } else if (d <= toDate) {
          rawItems.push({
            id: p.id,
            date: d,
            code: p.code,
            type: 'payment_in',
            description: `Phiếu thu tiền ${p.code}${p.note ? ` (${p.note})` : ''}`,
            increase: 0,
            decrease: p.amount,
          });
        }
      }

      const custReturns = salesReturns.filter(
        r => r.customer_id === partnerId && r.status !== 'cancelled'
      );
      for (const ret of custReturns) {
        const d = ret.return_date || '';
        if (d < fromDate) {
          priorDecrease += ret.total_value;
        } else if (d <= toDate) {
          rawItems.push({
            id: ret.id,
            date: d,
            code: ret.code,
            type: 'sales_return',
            description: `Phiếu trả hàng bán ${ret.code}`,
            increase: 0,
            decrease: ret.total_value,
          });
        }
      }
    } else {
      // Supplier: Purchase Orders increase debt; Payments (out) & Purchase Returns decrease debt
      const supPOs = purchaseOrders.filter(p => p.supplier_id === partnerId && p.status !== 'cancelled');
      for (const po of supPOs) {
        const d = po.order_date || '';
        if (d < fromDate) {
          priorIncrease += po.total;
        } else if (d <= toDate) {
          rawItems.push({
            id: po.id,
            date: d,
            code: po.code,
            type: 'purchase',
            description: `Đơn mua hàng / Nhập hàng ${po.code}`,
            increase: po.total,
            decrease: 0,
          });
        }
      }

      const supPayments = payments.filter(
        p => p.partner_id === partnerId && p.direction === 'out' && p.status !== 'cancelled'
      );
      for (const p of supPayments) {
        const d = p.payment_date ? p.payment_date.split('T')[0] : '';
        if (d < fromDate) {
          priorDecrease += p.amount;
        } else if (d <= toDate) {
          rawItems.push({
            id: p.id,
            date: d,
            code: p.code,
            type: 'payment_out',
            description: `Phiếu chi trả tiền ${p.code}${p.note ? ` (${p.note})` : ''}`,
            increase: 0,
            decrease: p.amount,
          });
        }
      }

      const supReturns = purchaseReturns.filter(
        r => r.supplier_id === partnerId && r.status !== 'cancelled'
      );
      for (const ret of supReturns) {
        const d = ret.return_date || '';
        if (d < fromDate) {
          priorDecrease += ret.total_value;
        } else if (d <= toDate) {
          rawItems.push({
            id: ret.id,
            date: d,
            code: ret.code,
            type: 'purchase_return',
            description: `Phiếu xuất trả hàng NCC ${ret.code}`,
            increase: 0,
            decrease: ret.total_value,
          });
        }
      }
    }

    const startBalance = priorIncrease - priorDecrease;

    // Sort chronologically
    rawItems.sort((a, b) => a.date.localeCompare(b.date));

    let currentBalance = startBalance;
    let sumInc = 0;
    let sumDec = 0;

    const computedItems: ReconciliationItem[] = rawItems.map(item => {
      currentBalance = currentBalance + item.increase - item.decrease;
      sumInc += item.increase;
      sumDec += item.decrease;
      return {
        ...item,
        runningBalance: currentBalance,
      };
    });

    return {
      openingBalance: startBalance,
      items: computedItems,
      totalIncrease: sumInc,
      totalDecrease: sumDec,
      closingBalance: currentBalance,
    };
  }, [partnerId, partnerType, fromDate, toDate, invoices, purchaseOrders, payments, salesReturns, purchaseReturns]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (!partnerInfo) return;
    const partnerName = partnerInfo.name || 'Doi_tac';
    const filename = `Doi_chieu_cong_no_${partnerType === 'customer' ? 'KH' : 'NCC'}_${partnerInfo.code}_${fromDate}_${toDate}`;

    const excelRows = [
      {
        stt: '—',
        date: formatDate(fromDate),
        code: '—',
        description: 'Số dư đầu kỳ',
        increase: 0,
        decrease: 0,
        balance: openingBalance,
      },
      ...items.map((it, idx) => ({
        stt: String(idx + 1),
        date: formatDate(it.date),
        code: it.code,
        description: it.description,
        increase: it.increase,
        decrease: it.decrease,
        balance: it.runningBalance,
      })),
      {
        stt: 'TỔNG',
        date: '—',
        code: '—',
        description: 'Tổng phát sinh trong kỳ',
        increase: totalIncrease,
        decrease: totalDecrease,
        balance: closingBalance,
      },
    ];

    const columns: ExportColumn<any>[] = [
      { key: 'stt', header: 'STT' },
      { key: 'date', header: 'Ngày chứng từ' },
      { key: 'code', header: 'Số chứng từ' },
      { key: 'description', header: 'Diễn giải nội dung' },
      { key: 'increase', header: partnerType === 'customer' ? 'Phát sinh nợ (Mua hàng)' : 'Phát sinh nợ (Nhập hàng)' },
      { key: 'decrease', header: partnerType === 'customer' ? 'Phát sinh có (Thanh toán/Trả hàng)' : 'Phát sinh có (Đã thanh toán/Trả hàng)' },
      { key: 'balance', header: 'Số dư nợ còn lại' },
    ];

    exportToExcelFile(excelRows, columns, filename);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Biên bản đối chiếu công nợ"
      subtitle="Mẫu biểu đối chiếu công nợ chuẩn kế toán (TT 200/2014 & TT 133/2016/TT-BTC)"
      icon="receipt_long"
      width="xl"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
          <div className="text-[12.5px] text-[#6B7280]">
            Dư nợ cuối kỳ:{' '}
            <span className={`font-bold tabular-nums text-[15px] ${closingBalance > 0 ? 'text-[#E11D48]' : 'text-[#059669]'}`}>
              {formatCurrency(closingBalance)}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3.5 py-2 border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#374151] text-[13px] font-semibold rounded-[12px] flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Icon name="download" size={17} className="text-[#6D3EEB]" />
              <span>Xuất Excel</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-[#6D3EEB] hover:bg-[#5B2BD6] text-white text-[13px] font-semibold rounded-[12px] flex items-center gap-1.5 transition-all shadow-[0_8px_20px_-6px_rgba(109,62,235,0.55)]"
            >
              <Icon name="print" size={17} />
              <span>In biên bản</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Controls Toolbar (Screen Only) */}
        <div className="print:hidden p-4 rounded-[14px] bg-[#F9FAFB] border border-[#E5E7EB] space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11.5px] font-semibold text-[#4B5563] uppercase mb-1">
                Loại đối tác
              </label>
              <select
                value={partnerType}
                onChange={e => {
                  const val = e.target.value as 'customer' | 'supplier';
                  setPartnerType(val);
                  if (val === 'customer' && customers.length > 0) setPartnerId(customers[0].id);
                  if (val === 'supplier' && suppliers.length > 0) setPartnerId(suppliers[0].id);
                }}
                className="w-full h-[38px] px-3 bg-white border border-[#D1D5DB] rounded-[10px] text-[13px] font-medium focus:border-[#6D3EEB] outline-none"
              >
                <option value="customer">Khách hàng (Phải thu)</option>
                <option value="supplier">Nhà cung cấp (Phải trả)</option>
              </select>
            </div>

            <div className="sm:col-span-1">
              <label className="block text-[11.5px] font-semibold text-[#4B5563] uppercase mb-1">
                Chọn đối tác
              </label>
              <select
                value={partnerId}
                onChange={e => setPartnerId(e.target.value)}
                className="w-full h-[38px] px-3 bg-white border border-[#D1D5DB] rounded-[10px] text-[13px] font-medium focus:border-[#6D3EEB] outline-none"
              >
                {partnerType === 'customer'
                  ? customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.name}
                      </option>
                    ))
                  : suppliers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
              </select>
            </div>

            <div>
              <label className="block text-[11.5px] font-semibold text-[#4B5563] uppercase mb-1">
                Từ ngày
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="w-full h-[38px] px-3 bg-white border border-[#D1D5DB] rounded-[10px] text-[13px] font-medium focus:border-[#6D3EEB] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11.5px] font-semibold text-[#4B5563] uppercase mb-1">
                Đến ngày
              </label>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="w-full h-[38px] px-3 bg-white border border-[#D1D5DB] rounded-[10px] text-[13px] font-medium focus:border-[#6D3EEB] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Printable Statement Container (Paper Style) */}
        <div id="printable-reconciliation" className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 sm:p-8 space-y-6 text-[#111827] shadow-xs print:border-none print:shadow-none print:p-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-[#F1F2F5] pb-5">
            <div>
              <div className="font-extrabold text-[16px] uppercase tracking-wide text-[#6D3EEB]">
                {companySettings?.company_name || 'CÔNG TY TNHH PHÁT TRIỂN CÔNG NGHỆ LK'}
              </div>
              <div className="text-[12px] text-[#4B5563] mt-1">
                Địa chỉ: {companySettings?.address || 'Tòa nhà Landmark, 720A Điện Biên Phủ, TP.HCM'}
              </div>
              <div className="text-[12px] text-[#4B5563]">
                MST: {companySettings?.tax_code || '0315894123'} · ĐT: {companySettings?.phone || '0908.123.456'}
              </div>
            </div>

            <div className="text-right sm:text-right shrink-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block">
                Mẫu số: 01-ĐCCN
              </span>
              <span className="text-[11px] text-[#9CA3AF] block">
                (Ban hành theo TT 200/2014 & 133/2016/TT-BTC)
              </span>
            </div>
          </div>

          {/* Statement Title */}
          <div className="text-center space-y-1">
            <h2 className="text-[18px] sm:text-[20px] font-black uppercase text-[#111827] tracking-wide">
              BIÊN BẢN ĐỐI CHIẾU CÔNG NỢ
            </h2>
            <p className="text-[12.5px] italic text-[#6B7280]">
              Thời gian đối chiếu: Từ ngày <span className="font-semibold text-[#111827]">{formatDate(fromDate)}</span> đến ngày{' '}
              <span className="font-semibold text-[#111827]">{formatDate(toDate)}</span>
            </p>
          </div>

          {/* Partner Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-[12px] bg-[#F9FAFB] border border-[#F1F2F5] text-[13px]">
            <div>
              <span className="text-[#6B7280] block text-[11.5px] font-medium">ĐƠN VỊ ĐỐI TÁC ({partnerType === 'customer' ? 'BÊN MUA' : 'BÊN BÁN'}):</span>
              <span className="font-bold text-[#111827] text-[14px]">{partnerInfo?.name || '—'}</span>
              <span className="text-[#6B7280] block text-[12px] mt-0.5">Mã: {partnerInfo?.code || '—'}</span>
            </div>
            <div>
              <span className="text-[#6B7280] block text-[11.5px] font-medium">THÔNG TIN LIÊN HỆ:</span>
              <span>Điện thoại: {partnerInfo?.phone || '—'}</span>
              <span className="block text-[#4B5563]">Địa chỉ: {partnerInfo?.address || '—'}</span>
            </div>
          </div>

          {/* Balance Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-[12px] bg-[#F9FAFB] border border-[#E5E7EB]">
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase block">Dư nợ đầu kỳ</span>
              <span className="font-bold text-[14px] text-[#111827] tabular-nums mt-0.5 block">
                {formatCurrency(openingBalance)}
              </span>
            </div>
            <div className="p-3 rounded-[12px] bg-[#EFF6FF] border border-[#BFDBFE]">
              <span className="text-[11px] font-semibold text-[#2563EB] uppercase block">Phát sinh Tăng</span>
              <span className="font-bold text-[14px] text-[#2563EB] tabular-nums mt-0.5 block">
                +{formatCurrency(totalIncrease)}
              </span>
            </div>
            <div className="p-3 rounded-[12px] bg-[#ECFDF5] border border-[#A7F3D0]">
              <span className="text-[11px] font-semibold text-[#059669] uppercase block">Phát sinh Giảm</span>
              <span className="font-bold text-[14px] text-[#059669] tabular-nums mt-0.5 block">
                -{formatCurrency(totalDecrease)}
              </span>
            </div>
            <div className="p-3 rounded-[12px] bg-[#FFF1F2] border border-[#FECDD3]">
              <span className="text-[11px] font-semibold text-[#E11D48] uppercase block">Dư nợ cuối kỳ</span>
              <span className="font-bold text-[15px] text-[#E11D48] tabular-nums mt-0.5 block">
                {formatCurrency(closingBalance)}
              </span>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="overflow-x-auto border border-[#E5E7EB] rounded-[12px]">
            <table className="w-full text-left text-[12.5px] border-collapse">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3 w-[50px] text-center">STT</th>
                  <th className="py-2.5 px-3 w-[100px]">Ngày CT</th>
                  <th className="py-2.5 px-3 w-[130px]">Số CT</th>
                  <th className="py-2.5 px-3">Diễn giải nội dung</th>
                  <th className="py-2.5 px-3 text-right w-[130px]">Ghi Nợ (+)</th>
                  <th className="py-2.5 px-3 text-right w-[130px]">Ghi Có (-)</th>
                  <th className="py-2.5 px-3 text-right w-[140px]">Dư nợ còn lại</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F2F5]">
                {/* Opening Balance Row */}
                <tr className="bg-[#FAF5FF] font-semibold text-[#6D3EEB]">
                  <td className="py-2.5 px-3 text-center">—</td>
                  <td className="py-2.5 px-3">{formatDate(fromDate)}</td>
                  <td className="py-2.5 px-3">—</td>
                  <td className="py-2.5 px-3">Số dư công nợ đầu kỳ</td>
                  <td className="py-2.5 px-3 text-right">—</td>
                  <td className="py-2.5 px-3 text-right">—</td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-bold">
                    {formatCurrency(openingBalance)}
                  </td>
                </tr>

                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#9CA3AF] italic">
                      Không có phát sinh giao dịch nào trong khoảng thời gian này
                    </td>
                  </tr>
                ) : (
                  items.map((it, idx) => (
                    <tr key={it.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="py-2 px-3 text-center text-[#6B7280]">{idx + 1}</td>
                      <td className="py-2 px-3 text-[#4B5563]">{formatDate(it.date)}</td>
                      <td className="py-2 px-3 font-semibold text-[#111827]">{it.code}</td>
                      <td className="py-2 px-3 text-[#1F2937]">{it.description}</td>
                      <td className="py-2 px-3 text-right text-[#2563EB] font-medium tabular-nums">
                        {it.increase > 0 ? formatCurrency(it.increase) : '—'}
                      </td>
                      <td className="py-2 px-3 text-right text-[#059669] font-medium tabular-nums">
                        {it.decrease > 0 ? formatCurrency(it.decrease) : '—'}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-[#111827] tabular-nums">
                        {formatCurrency(it.runningBalance)}
                      </td>
                    </tr>
                  ))
                )}

                {/* Total Summary Row */}
                <tr className="bg-[#F9FAFB] font-bold border-t-2 border-[#E5E7EB]">
                  <td colSpan={4} className="py-3 px-3 text-right uppercase tracking-wider text-[11.5px]">
                    Cộng phát sinh & Dư nợ cuối kỳ:
                  </td>
                  <td className="py-3 px-3 text-right text-[#2563EB] tabular-nums">
                    {formatCurrency(totalIncrease)}
                  </td>
                  <td className="py-3 px-3 text-right text-[#059669] tabular-nums">
                    {formatCurrency(totalDecrease)}
                  </td>
                  <td className="py-3 px-3 text-right text-[#E11D48] text-[14px] tabular-nums">
                    {formatCurrency(closingBalance)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Conclusion Text */}
          <div className="text-[12.5px] leading-relaxed text-[#374151] space-y-1">
            <p>
              <strong>Kết luận:</strong> Tính đến hết ngày <span className="font-semibold">{formatDate(toDate)}</span>, số tiền công nợ giữa hai bên là:{' '}
              <span className="font-bold text-[#E11D48] text-[13.5px]">{formatCurrency(closingBalance)}</span>.
            </p>
            <p className="italic text-[#6B7280]">
              Biên bản này được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản để làm căn cứ hạch toán kế toán và thanh toán công nợ.
            </p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-center text-[12.5px]">
            <div>
              <span className="font-bold uppercase block text-[#111827]">Người lập biểu</span>
              <span className="text-[11px] text-[#6B7280] italic block mt-0.5">(Ký, họ tên)</span>
              <div className="h-16" />
              <span className="font-medium text-[#111827]">Kế toán công nợ</span>
            </div>
            <div>
              <span className="font-bold uppercase block text-[#111827]">Kế toán trưởng</span>
              <span className="text-[11px] text-[#6B7280] italic block mt-0.5">(Ký, họ tên)</span>
              <div className="h-16" />
              <span className="font-medium text-[#111827]">Phụ trách kế toán</span>
            </div>
            <div>
              <span className="font-bold uppercase block text-[#111827]">Đại diện Bên A</span>
              <span className="text-[11px] text-[#6B7280] italic block mt-0.5">(Ký, đóng dấu)</span>
              <div className="h-16" />
              <span className="font-medium text-[#111827]">Giám đốc</span>
            </div>
            <div>
              <span className="font-bold uppercase block text-[#111827]">Đại diện Bên B</span>
              <span className="text-[11px] text-[#6B7280] italic block mt-0.5">(Ký, đóng dấu)</span>
              <div className="h-16" />
              <span className="font-medium text-[#111827]">{partnerInfo?.name || 'Đại diện đối tác'}</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
