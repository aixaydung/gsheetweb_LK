import React, { useState, useMemo } from 'react';
import { Customer, SalesInvoice } from '../../types';
import { useApp } from '../../context/AppContext';
import { Icon } from '../ui/Icon';
import { formatCurrency, formatDate } from '../../lib/format';
import { exportToExcelFile, ExportColumn } from '../../lib/excelExport';

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onEditCustomer?: (customer: Customer) => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  isOpen,
  onClose,
  customer,
  onEditCustomer,
}) => {
  const { invoices } = useApp();
  const [activeTab, setActiveTab] = useState<'details' | 'invoices' | 'debts'>('details');

  // Filter state for Invoices Tab
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceStatus, setInvoiceStatus] = useState('all');
  const [invoicePayment, setInvoicePayment] = useState('all');
  const [invoiceTimeRange, setInvoiceTimeRange] = useState('all');
  const [invoiceSort, setInvoiceSort] = useState<'date_desc' | 'date_asc' | 'total_desc' | 'total_asc'>('date_desc');

  // Filter state for Debts Tab
  const [debtSearch, setDebtSearch] = useState('');
  const [debtStatus, setDebtStatus] = useState('all');
  const [debtPayment, setDebtPayment] = useState('all');
  const [debtTimeRange, setDebtTimeRange] = useState('all');
  const [debtSort, setDebtSort] = useState<'date_desc' | 'date_asc' | 'debt_desc' | 'debt_asc'>('date_desc');

  // Invoices belonging to this customer
  const customerInvoices = useMemo(() => {
    if (!customer) return [];
    return invoices.filter(
      inv =>
        inv.customer_id === customer.id ||
        (customer.code && inv.customer_id === customer.code) ||
        inv.customer_name === customer.name
    );
  }, [invoices, customer]);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    let result = [...customerInvoices];

    if (invoiceSearch.trim()) {
      const q = invoiceSearch.toLowerCase().trim();
      result = result.filter(inv => inv.code.toLowerCase().includes(q));
    }

    if (invoiceStatus !== 'all') {
      result = result.filter(inv => inv.status === invoiceStatus);
    }

    if (invoicePayment !== 'all') {
      result = result.filter(inv => inv.payment_status === invoicePayment);
    }

    if (invoiceTimeRange !== 'all') {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      if (invoiceTimeRange === 'today') {
        result = result.filter(inv => (inv.invoice_date || '').startsWith(todayStr));
      } else if (invoiceTimeRange === '7days') {
        const d7 = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0];
        result = result.filter(inv => (inv.invoice_date || '') >= d7);
      } else if (invoiceTimeRange === 'month') {
        const m = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        result = result.filter(inv => (inv.invoice_date || '').startsWith(m));
      }
    }

    result.sort((a, b) => {
      if (invoiceSort === 'date_desc') return (b.invoice_date || '').localeCompare(a.invoice_date || '');
      if (invoiceSort === 'date_asc') return (a.invoice_date || '').localeCompare(b.invoice_date || '');
      if (invoiceSort === 'total_desc') return b.total - a.total;
      if (invoiceSort === 'total_asc') return a.total - b.total;
      return 0;
    });

    return result;
  }, [customerInvoices, invoiceSearch, invoiceStatus, invoicePayment, invoiceTimeRange, invoiceSort]);

  // Debt Invoices (only invoices with debt_amount > 0)
  const debtInvoices = useMemo(() => {
    let result = customerInvoices.filter(inv => inv.debt_amount > 0 && inv.status !== 'cancelled');

    if (debtSearch.trim()) {
      const q = debtSearch.toLowerCase().trim();
      result = result.filter(inv => inv.code.toLowerCase().includes(q));
    }

    if (debtStatus !== 'all') {
      result = result.filter(inv => inv.status === debtStatus);
    }

    if (debtPayment !== 'all') {
      result = result.filter(inv => inv.payment_status === debtPayment);
    }

    if (debtTimeRange !== 'all') {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      if (debtTimeRange === 'today') {
        result = result.filter(inv => (inv.invoice_date || '').startsWith(todayStr));
      } else if (debtTimeRange === '7days') {
        const d7 = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0];
        result = result.filter(inv => (inv.invoice_date || '') >= d7);
      } else if (debtTimeRange === 'month') {
        const m = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        result = result.filter(inv => (inv.invoice_date || '').startsWith(m));
      }
    }

    result.sort((a, b) => {
      if (debtSort === 'date_desc') return (b.invoice_date || '').localeCompare(a.invoice_date || '');
      if (debtSort === 'date_asc') return (a.invoice_date || '').localeCompare(b.invoice_date || '');
      if (debtSort === 'debt_desc') return b.debt_amount - a.debt_amount;
      if (debtSort === 'debt_asc') return a.debt_amount - b.debt_amount;
      return 0;
    });

    return result;
  }, [customerInvoices, debtSearch, debtStatus, debtPayment, debtTimeRange, debtSort]);

  // Export Invoices to Excel
  const handleExportInvoices = (dataToExport: SalesInvoice[], prefix: string) => {
    if (!customer) return;
    const columns: ExportColumn<SalesInvoice>[] = [
      { key: 'code', header: 'Mã HĐ' },
      { key: 'invoice_date', header: 'Ngày lập', accessor: r => formatDate(r.invoice_date) },
      { key: 'total', header: 'Tổng tiền (đ)', accessor: r => r.total },
      { key: 'paid_amount', header: 'Đã thu (đ)', accessor: r => r.paid_amount },
      { key: 'debt_amount', header: 'Còn nợ (đ)', accessor: r => r.debt_amount },
      {
        key: 'payment_status',
        header: 'Tình trạng thanh toán',
        accessor: r =>
          r.payment_status === 'paid'
            ? 'Đã thanh toán'
            : r.payment_status === 'partial'
            ? 'Một phần'
            : 'Chưa thanh toán',
      },
      {
        key: 'status',
        header: 'Trạng thái đơn hàng',
        accessor: r =>
          r.status === 'completed'
            ? 'Hoàn tất'
            : (r.status as string) === 'processing' || (r.status as string) === 'pending'
            ? 'Đang xử lý'
            : r.status === 'cancelled'
            ? 'Đã hủy'
            : r.status,
      },
    ];
    exportToExcelFile(dataToExport, columns, `${prefix}_${customer.code || customer.id}`);
  };

  if (!isOpen || !customer) return null;

  // Calculate live total purchase & debt
  const totalPurchased = customerInvoices
    .filter(inv => inv.status !== 'cancelled')
    .reduce((sum, inv) => sum + inv.total, 0);

  const totalDebt = customerInvoices
    .filter(inv => inv.status !== 'cancelled')
    .reduce((sum, inv) => sum + inv.debt_amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-[900px] bg-white dark:bg-[#1E293B] rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-[#E5E7EB] dark:border-[#334155] z-10 flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between border-b border-[#F1F2F5] dark:border-[#334155]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-[14px] bg-[#6D3EEB] text-white flex items-center justify-center shadow-md shrink-0">
              <Icon name="person" size={26} />
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-[#111827] dark:text-[#F8FAFC] leading-snug">
                {customer.name}
              </h2>
              <p className="text-[13px] text-[#6B7280] dark:text-[#94A3B8]">
                Mã: <span className="font-semibold text-[#111827] dark:text-[#E2E8F0]">{customer.code || customer.id}</span> · {customer.group_name || 'Khách hàng'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 flex items-center gap-6 border-b border-[#F1F2F5] dark:border-[#334155] bg-white dark:bg-[#1E293B]">
          {[
            { id: 'details', label: 'Chi tiết KH' },
            { id: 'invoices', label: 'Hóa đơn' },
            { id: 'debts', label: 'Công nợ' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3.5 text-[14.5px] font-semibold transition-all relative cursor-pointer ${
                activeTab === tab.id
                  ? 'text-[#6D3EEB] dark:text-[#A78BFA]'
                  : 'text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-[#F8FAFC]'
              }`}
            >
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#6D3EEB] dark:bg-[#A78BFA] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: CHI TIẾT KHÁCH HÀNG */}
          {activeTab === 'details' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Info Key-Value Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3.5 gap-x-8 text-[14px]">
                <div className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-gray-800/60">
                  <span className="text-[#6B7280] dark:text-[#94A3B8]">Điện thoại</span>
                  <span className="font-semibold text-[#111827] dark:text-[#F8FAFC]">
                    {customer.phone || '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-gray-800/60">
                  <span className="text-[#6B7280] dark:text-[#94A3B8]">Email</span>
                  <span className="font-semibold text-[#111827] dark:text-[#F8FAFC]">
                    {customer.email || '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-gray-800/60">
                  <span className="text-[#6B7280] dark:text-[#94A3B8]">Địa chỉ</span>
                  <span className="font-semibold text-[#111827] dark:text-[#F8FAFC] text-right truncate max-w-[240px]">
                    {customer.address || '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-gray-800/60">
                  <span className="text-[#6B7280] dark:text-[#94A3B8]">Mã số thuế</span>
                  <span className="font-semibold text-[#111827] dark:text-[#F8FAFC]">
                    {customer.tax_code || '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-gray-800/60">
                  <span className="text-[#6B7280] dark:text-[#94A3B8]">Nhóm</span>
                  <span className="font-semibold text-[#111827] dark:text-[#F8FAFC]">
                    {customer.group_name || 'Khách lẻ'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-gray-800/60">
                  <span className="text-[#6B7280] dark:text-[#94A3B8]">Trạng thái</span>
                  <span className="font-semibold text-[#059669]">
                    {customer.status === 'active' ? 'Đang giao dịch' : 'Ngừng giao dịch'}
                  </span>
                </div>
              </div>

              {/* Summary Cards: Tổng mua & Còn phải thu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 sm:p-5 rounded-[16px] border border-[#E5E7EB] dark:border-[#334155] bg-white dark:bg-[#0F172A] shadow-xs">
                  <span className="text-[13px] font-medium text-[#6B7280] dark:text-[#94A3B8] block">
                    Tổng mua
                  </span>
                  <span className="text-[22px] sm:text-[24px] font-bold text-[#111827] dark:text-[#F8FAFC] tracking-tight mt-1 block">
                    {formatCurrency(totalPurchased || customer.total_purchase || 0)}
                  </span>
                </div>

                <div className="p-4 sm:p-5 rounded-[16px] border border-[#E5E7EB] dark:border-[#334155] bg-white dark:bg-[#0F172A] shadow-xs">
                  <span className="text-[13px] font-medium text-[#6B7280] dark:text-[#94A3B8] block">
                    Còn phải thu
                  </span>
                  <span className="text-[22px] sm:text-[24px] font-bold text-[#111827] dark:text-[#F8FAFC] tracking-tight mt-1 block">
                    {formatCurrency(totalDebt !== undefined ? totalDebt : customer.debt_amount || 0)}
                  </span>
                </div>
              </div>

              {/* Nợ cũ đầu kỳ Card */}
              <div className="p-4 rounded-[16px] bg-[#FEFCE8] dark:bg-amber-950/20 border border-[#FEF08A] dark:border-amber-800/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FEF08A] dark:bg-amber-900/60 text-[#A16207] dark:text-amber-300 flex items-center justify-center shrink-0">
                    <Icon name="history" size={20} />
                  </div>
                  <div>
                    <span className="text-[12.5px] font-medium text-[#A16207] dark:text-amber-300 block">
                      Nợ cũ khách đang nợ (đầu kỳ)
                    </span>
                    <span className="text-[18px] font-bold text-[#854D0E] dark:text-amber-200 mt-0.5 block">
                      0 đ
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => alert(`Chức năng điều chỉnh số dư nợ đầu kỳ cho khách hàng ${customer.name}`)}
                  className="px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] text-[#374151] dark:text-[#E2E8F0] text-[13px] font-semibold hover:bg-gray-50 flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Icon name="tune" size={15} />
                  <span>Điều chỉnh</span>
                </button>
              </div>

              {/* Ghi chú Card */}
              <div className="p-4 rounded-[16px] bg-[#F9FAFB] dark:bg-[#0F172A] border border-[#F1F2F5] dark:border-[#334155] space-y-1">
                <span className="text-[12px] font-semibold text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-wide">
                  Ghi chú
                </span>
                <p className="text-[14px] text-[#111827] dark:text-[#E2E8F0] font-medium leading-relaxed">
                  {customer.note || 'Khách hàng chưa có ghi chú đặc biệt.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: HÓA ĐƠN */}
          {activeTab === 'invoices' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Toolbar */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Search */}
                  <div className="relative flex-1 min-w-[200px]">
                    <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm mã hóa đơn..."
                      value={invoiceSearch}
                      onChange={e => setInvoiceSearch(e.target.value)}
                      className="w-full h-10 pl-9 pr-3 rounded-[12px] bg-[#F9FAFB] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6D3EEB]/20 focus:border-[#6D3EEB]"
                    />
                  </div>

                  {/* Filter Status */}
                  <select
                    value={invoiceStatus}
                    onChange={e => setInvoiceStatus(e.target.value)}
                    className="h-10 px-3 rounded-[12px] bg-[#F9FAFB] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] text-[13px] text-[#374151] dark:text-[#CBD5E1] cursor-pointer"
                  >
                    <option value="all">Trạng thái: Tất cả</option>
                    <option value="completed">Hoàn tất</option>
                    <option value="pending">Đang xử lý</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>

                  {/* Filter Payment */}
                  <select
                    value={invoicePayment}
                    onChange={e => setInvoicePayment(e.target.value)}
                    className="h-10 px-3 rounded-[12px] bg-[#F9FAFB] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] text-[13px] text-[#374151] dark:text-[#CBD5E1] cursor-pointer"
                  >
                    <option value="all">Thanh toán: Tất cả</option>
                    <option value="paid">Đã thanh toán</option>
                    <option value="unpaid">Chưa thanh toán</option>
                    <option value="partial">Một phần</option>
                  </select>

                  {/* Time Range */}
                  <select
                    value={invoiceTimeRange}
                    onChange={e => setInvoiceTimeRange(e.target.value)}
                    className="h-10 px-3 rounded-[12px] bg-[#F9FAFB] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] text-[13px] text-[#374151] dark:text-[#CBD5E1] cursor-pointer"
                  >
                    <option value="all">Mọi thời gian</option>
                    <option value="today">Hôm nay</option>
                    <option value="7days">7 ngày qua</option>
                    <option value="month">Tháng này</option>
                  </select>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <select
                      value={invoiceSort}
                      onChange={e => setInvoiceSort(e.target.value as any)}
                      className="h-9 px-3 rounded-[10px] bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] text-[12.5px] text-[#374151] dark:text-[#CBD5E1] cursor-pointer"
                    >
                      <option value="date_desc">Ngày: Mới nhất trước</option>
                      <option value="date_asc">Ngày: Cũ nhất trước</option>
                      <option value="total_desc">Tổng tiền: Cao đến thấp</option>
                      <option value="total_asc">Tổng tiền: Thấp đến cao</option>
                    </select>

                    {(invoiceSearch || invoiceStatus !== 'all' || invoicePayment !== 'all' || invoiceTimeRange !== 'all') && (
                      <button
                        type="button"
                        onClick={() => {
                          setInvoiceSearch('');
                          setInvoiceStatus('all');
                          setInvoicePayment('all');
                          setInvoiceTimeRange('all');
                        }}
                        className="h-9 px-2.5 rounded-[10px] border border-gray-200 text-gray-500 text-[12px] hover:bg-gray-100 flex items-center gap-1 cursor-pointer"
                      >
                        <Icon name="close" size={14} />
                        <span>Xóa lọc</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleExportInvoices(filteredInvoices, 'Hoa_don_KH')}
                    className="h-9 px-3.5 rounded-[10px] border border-[#6D3EEB]/30 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 text-[#6D3EEB] dark:text-purple-300 text-[12.5px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Icon name="download" size={16} />
                    <span>Xuất Excel</span>
                  </button>
                </div>
              </div>

              {/* Invoices Table */}
              <div className="overflow-x-auto rounded-[14px] border border-[#E5E7EB] dark:border-[#334155]">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-[#F9FAFB] dark:bg-[#0F172A] border-b border-[#E5E7EB] dark:border-[#334155] text-[#4B5563] dark:text-[#94A3B8] font-semibold">
                    <tr>
                      <th className="py-2.5 px-3.5">MÃ HĐ</th>
                      <th className="py-2.5 px-3.5">NGÀY</th>
                      <th className="py-2.5 px-3.5 text-right">TỔNG TIỀN</th>
                      <th className="py-2.5 px-3.5 text-right">ĐÃ THU</th>
                      <th className="py-2.5 px-3.5 text-right">CÒN NỢ</th>
                      <th className="py-2.5 px-3.5 text-center">THANH TOÁN</th>
                      <th className="py-2.5 px-3.5 text-center">TRẠNG THÁI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F2F5] dark:divide-[#334155]">
                    {filteredInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-[#6B7280] dark:text-[#94A3B8]">
                          Khách hàng này chưa có hóa đơn nào phù hợp với bộ lọc
                        </td>
                      </tr>
                    ) : (
                      filteredInvoices.map(inv => (
                        <tr key={inv.id} className="hover:bg-gray-50/70 dark:hover:bg-[#1E293B]/40 transition-colors">
                          <td className="py-2.5 px-3.5 font-bold font-mono text-[#111827] dark:text-[#F8FAFC]">
                            {inv.code}
                          </td>
                          <td className="py-2.5 px-3.5 text-[#4B5563] dark:text-[#CBD5E1]">
                            {formatDate(inv.invoice_date)}
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-medium text-[#111827] dark:text-[#F8FAFC] tabular-nums">
                            {formatCurrency(inv.total)}
                          </td>
                          <td className="py-2.5 px-3.5 text-right text-[#4B5563] dark:text-[#94A3B8] tabular-nums">
                            {formatCurrency(inv.paid_amount || 0)}
                          </td>
                          <td className="py-2.5 px-3.5 text-right tabular-nums">
                            {inv.debt_amount > 0 ? (
                              <span className="font-bold text-[#E11D48]">{formatCurrency(inv.debt_amount)}</span>
                            ) : (
                              <span className="text-gray-400">0 đ</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3.5 text-center">
                            {inv.payment_status === 'paid' ? (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                Đã thanh toán
                              </span>
                            ) : inv.payment_status === 'partial' ? (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                                Một phần
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                                Chưa thanh toán
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3.5 text-center">
                            {inv.status === 'completed' ? (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                Hoàn tất
                              </span>
                            ) : inv.status === 'cancelled' ? (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                                Đã hủy
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">
                                Đang xử lý
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CÔNG NỢ */}
          {activeTab === 'debts' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Toolbar */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative flex-1 min-w-[200px]">
                    <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm mã hóa đơn nợ..."
                      value={debtSearch}
                      onChange={e => setDebtSearch(e.target.value)}
                      className="w-full h-10 pl-9 pr-3 rounded-[12px] bg-[#F9FAFB] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6D3EEB]/20 focus:border-[#6D3EEB]"
                    />
                  </div>

                  <select
                    value={debtStatus}
                    onChange={e => setDebtStatus(e.target.value)}
                    className="h-10 px-3 rounded-[12px] bg-[#F9FAFB] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] text-[13px] text-[#374151] dark:text-[#CBD5E1] cursor-pointer"
                  >
                    <option value="all">Trạng thái: Tất cả</option>
                    <option value="pending">Đang xử lý</option>
                    <option value="completed">Hoàn tất</option>
                  </select>

                  <select
                    value={debtPayment}
                    onChange={e => setDebtPayment(e.target.value)}
                    className="h-10 px-3 rounded-[12px] bg-[#F9FAFB] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] text-[13px] text-[#374151] dark:text-[#CBD5E1] cursor-pointer"
                  >
                    <option value="all">Thanh toán: Tất cả</option>
                    <option value="unpaid">Chưa thanh toán</option>
                    <option value="partial">Một phần</option>
                  </select>

                  <select
                    value={debtTimeRange}
                    onChange={e => setDebtTimeRange(e.target.value)}
                    className="h-10 px-3 rounded-[12px] bg-[#F9FAFB] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] text-[13px] text-[#374151] dark:text-[#CBD5E1] cursor-pointer"
                  >
                    <option value="all">Mọi thời gian</option>
                    <option value="today">Hôm nay</option>
                    <option value="7days">7 ngày qua</option>
                    <option value="month">Tháng này</option>
                  </select>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <select
                      value={debtSort}
                      onChange={e => setDebtSort(e.target.value as any)}
                      className="h-9 px-3 rounded-[10px] bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] text-[12.5px] text-[#374151] dark:text-[#CBD5E1] cursor-pointer"
                    >
                      <option value="date_desc">Ngày: Mới nhất</option>
                      <option value="date_asc">Ngày: Cũ nhất</option>
                      <option value="debt_desc">Nợ: Cao đến thấp</option>
                      <option value="debt_asc">Nợ: Thấp đến cao</option>
                    </select>

                    {(debtSearch || debtStatus !== 'all' || debtPayment !== 'all' || debtTimeRange !== 'all') && (
                      <button
                        type="button"
                        onClick={() => {
                          setDebtSearch('');
                          setDebtStatus('all');
                          setDebtPayment('all');
                          setDebtTimeRange('all');
                        }}
                        className="h-9 px-2.5 rounded-[10px] border border-gray-200 text-gray-500 text-[12px] hover:bg-gray-100 flex items-center gap-1 cursor-pointer"
                      >
                        <Icon name="close" size={14} />
                        <span>Xóa lọc</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleExportInvoices(debtInvoices, 'Cong_no_KH')}
                    className="h-9 px-3.5 rounded-[10px] border border-[#6D3EEB]/30 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 text-[#6D3EEB] dark:text-purple-300 text-[12.5px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Icon name="download" size={16} />
                    <span>Xuất Excel</span>
                  </button>
                </div>
              </div>

              {/* Debt Table */}
              <div className="overflow-x-auto rounded-[14px] border border-[#E5E7EB] dark:border-[#334155]">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-[#F9FAFB] dark:bg-[#0F172A] border-b border-[#E5E7EB] dark:border-[#334155] text-[#4B5563] dark:text-[#94A3B8] font-semibold">
                    <tr>
                      <th className="py-2.5 px-3.5">MÃ HĐ</th>
                      <th className="py-2.5 px-3.5">NGÀY</th>
                      <th className="py-2.5 px-3.5 text-right">TỔNG TIỀN</th>
                      <th className="py-2.5 px-3.5 text-right">ĐÃ THU</th>
                      <th className="py-2.5 px-3.5 text-right">CÒN NỢ</th>
                      <th className="py-2.5 px-3.5 text-center">THANH TOÁN</th>
                      <th className="py-2.5 px-3.5 text-center">TRẠNG THÁI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F2F5] dark:divide-[#334155]">
                    {debtInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-emerald-600 dark:text-emerald-400 font-medium">
                          ✓ Khách hàng không có khoản nợ nào cần thu!
                        </td>
                      </tr>
                    ) : (
                      debtInvoices.map(inv => (
                        <tr key={inv.id} className="hover:bg-gray-50/70 dark:hover:bg-[#1E293B]/40 transition-colors">
                          <td className="py-2.5 px-3.5 font-bold font-mono text-[#111827] dark:text-[#F8FAFC]">
                            {inv.code}
                          </td>
                          <td className="py-2.5 px-3.5 text-[#4B5563] dark:text-[#CBD5E1]">
                            {formatDate(inv.invoice_date)}
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-medium text-[#111827] dark:text-[#F8FAFC] tabular-nums">
                            {formatCurrency(inv.total)}
                          </td>
                          <td className="py-2.5 px-3.5 text-right text-[#4B5563] dark:text-[#94A3B8] tabular-nums">
                            {formatCurrency(inv.paid_amount || 0)}
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-bold text-[#E11D48] tabular-nums">
                            {formatCurrency(inv.debt_amount)}
                          </td>
                          <td className="py-2.5 px-3.5 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                              {inv.payment_status === 'partial' ? 'Một phần' : 'Chưa thanh toán'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">
                              {inv.status === 'completed' ? 'Hoàn tất' : 'Đang xử lý'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Counter Text */}
              <div className="text-[12.5px] text-[#6B7280] dark:text-[#94A3B8]">
                {debtInvoices.length} kết quả
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#F1F2F5] dark:border-[#334155] flex items-center justify-end gap-3 bg-white dark:bg-[#1E293B]">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 rounded-[12px] border border-[#E5E7EB] dark:border-[#334155] text-[#374151] dark:text-[#E2E8F0] text-[14px] font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Icon name="close" size={18} />
            <span>Đóng</span>
          </button>

          {onEditCustomer && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEditCustomer(customer);
              }}
              className="h-10 px-5 rounded-[12px] bg-[#6D3EEB] hover:bg-[#5B2BD6] text-white text-[14px] font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Icon name="edit" size={18} />
              <span>Chỉnh sửa</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
