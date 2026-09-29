import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Tabs, TabItem } from '../components/ui/Tabs';
import { KpiCard } from '../components/ui/KpiCard';
import { FilterToolbar, FilterOption, SortOption } from '../components/ui/FilterToolbar';
import { DataTable, Column } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { InlineStatusSelect } from '../components/ui/InlineStatusSelect';
import { NoteCell } from '../components/ui/NoteCell';
import { Icon } from '../components/ui/Icon';
import { DateRange } from '../components/ui/DateRangePicker';
import { formatCurrency, formatDate } from '../lib/format';
import { SalesInvoice, Customer, Quotation, SalesReturn } from '../types';
import { ExportDialog } from '../components/dialogs/ExportDialog';
import { CustomerDetailModal } from '../components/dialogs/CustomerDetailModal';
import { QuotationDetailModal } from '../components/dialogs/QuotationDetailModal';

interface SalesViewProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenCreateInvoice: () => void;
  onOpenCreateQuotation: () => void;
  onOpenEditQuotation?: (quotation: Quotation) => void;
  onOpenCreateReturn: () => void;
  onOpenEditReturn?: (salesReturn: SalesReturn) => void;
  onOpenCreateCustomer: () => void;
  onOpenEditCustomer?: (customer: Customer) => void;
  onOpenImportCustomerDialog?: () => void;
  onOpenPaymentAllocation: (customerId?: string, invoiceId?: string) => void;
  onPrintDocument: (type: string, code: string, doc: any) => void;
}

export const SalesView: React.FC<SalesViewProps> = ({
  currentTab,
  onTabChange,
  onOpenCreateInvoice,
  onOpenCreateQuotation,
  onOpenEditQuotation,
  onOpenCreateReturn,
  onOpenEditReturn,
  onOpenCreateCustomer,
  onOpenEditCustomer,
  onOpenImportCustomerDialog,
  onOpenPaymentAllocation,
  onPrintDocument,
}) => {
  const {
    invoices,
    customers,
    quotations,
    salesReturns,
    updateInvoiceStatus,
    updateQuotationStatus,
    convertQuotationToInvoice,
    deleteInvoice,
    deleteCustomer,
    deleteCustomersBatch,
    deleteQuotation,
    deleteQuotationsBatch,
    deleteSalesReturn,
    deleteSalesReturnsBatch,
    updateReturnStatus,
    updateInlineNote,
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterPayment, setFilterPayment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterCustomer, setFilterCustomer] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });
  const [sortKey, setSortKey] = useState<string>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Customer Detail Modal State
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState<Customer | null>(null);
  const [isCustomerDetailOpen, setIsCustomerDetailOpen] = useState(false);

  // Quotation Detail Modal State
  const [selectedQuotationDetail, setSelectedQuotationDetail] = useState<Quotation | null>(null);
  const [isQuotationDetailOpen, setIsQuotationDetailOpen] = useState(false);

  // Customer options for filter dropdowns
  const customerFilterItems = useMemo(() => [
    { value: 'all', label: 'Khách hàng: Tất cả' },
    ...customers.map(c => ({ value: c.id, label: `${c.code} - ${c.name}` })),
  ], [customers]);

  // Tabs
  const tabs: TabItem[] = [
    { id: 'tong-quan', label: 'Tổng quan bán hàng' },
    { id: 'khach-hang', label: 'Khách hàng' },
    { id: 'bao-gia', label: 'Báo giá' },
    { id: 'tra-hang', label: 'Trả hàng' },
    { id: 'cong-no', label: 'Công nợ khách hàng' },
  ];

  // Tab 1: Invoices KPIs
  const invoiceKpis = useMemo(() => {
    const valid = invoices.filter(i => i.status !== 'cancelled');
    const revenue = valid.reduce((sum, i) => sum + i.total, 0);
    const cogs = valid.reduce((sum, i) => sum + i.cogs_amount, 0);
    const profit = revenue - cogs;
    const count = valid.length;
    const debt = valid.reduce((sum, i) => sum + i.debt_amount, 0);

    return { revenue, profit, count, debt };
  }, [invoices]);

  // Tab 1: Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchSearch =
        inv.code.toLowerCase().includes(search.toLowerCase()) ||
        inv.customer_name.toLowerCase().includes(search.toLowerCase());
      const matchPayment = filterPayment === 'all' || inv.payment_status === filterPayment;
      const matchStatus = filterStatus === 'all' || inv.status === filterStatus;
      const matchCustomer = filterCustomer === 'all' || inv.customer_id === filterCustomer;
      let matchDate = true;
      if (dateRange.from && inv.invoice_date < dateRange.from) matchDate = false;
      if (dateRange.to && inv.invoice_date > dateRange.to) matchDate = false;
      return matchSearch && matchPayment && matchStatus && matchCustomer && matchDate;
    });
  }, [invoices, search, filterPayment, filterStatus, filterCustomer, dateRange]);

  // Tab 2: Filtered Customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(cust => {
      const matchSearch =
        cust.name.toLowerCase().includes(search.toLowerCase()) ||
        cust.code.toLowerCase().includes(search.toLowerCase()) ||
        cust.phone.includes(search);
      const matchGroup = filterGroup === 'all' || cust.group_name === filterGroup;
      const matchStatus = filterStatus === 'all' || cust.status === filterStatus;
      let matchDate = true;
      if (dateRange.from && cust.created_at && cust.created_at.slice(0, 10) < dateRange.from) matchDate = false;
      if (dateRange.to && cust.created_at && cust.created_at.slice(0, 10) > dateRange.to) matchDate = false;
      return matchSearch && matchGroup && matchStatus && matchDate;
    });
  }, [customers, search, filterGroup, filterStatus, dateRange]);

  // Tab 3: Filtered Quotations
  const filteredQuotations = useMemo(() => {
    return quotations.filter(quo => {
      const matchSearch =
        quo.code.toLowerCase().includes(search.toLowerCase()) ||
        quo.customer_name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'all' || quo.status === filterStatus;
      const matchCustomer = filterCustomer === 'all' || quo.customer_id === filterCustomer;
      let matchDate = true;
      if (dateRange.from && quo.quote_date < dateRange.from) matchDate = false;
      if (dateRange.to && quo.quote_date > dateRange.to) matchDate = false;
      return matchSearch && matchStatus && matchCustomer && matchDate;
    }).sort((a, b) => {
      if (sortKey === 'total') {
        return sortDir === 'asc' ? a.total - b.total : b.total - a.total;
      }
      if (sortKey === 'expires') {
        const ea = a.expires_at || '';
        const eb = b.expires_at || '';
        return sortDir === 'asc' ? ea.localeCompare(eb) : eb.localeCompare(ea);
      }
      return sortDir === 'asc' ? a.quote_date.localeCompare(b.quote_date) : b.quote_date.localeCompare(a.quote_date);
    });
  }, [quotations, search, filterStatus, filterCustomer, dateRange, sortKey, sortDir]);

  // Tab 4: Filtered Sales Returns
  const filteredReturns = useMemo(() => {
    return salesReturns.filter(ret => {
      const matchSearch =
        ret.code.toLowerCase().includes(search.toLowerCase()) ||
        ret.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        (ret.invoice_code && ret.invoice_code.toLowerCase().includes(search.toLowerCase()));
      const matchType = filterType === 'all' || ret.handling === filterType;
      const matchStatus = filterStatus === 'all' || ret.status === filterStatus;
      const matchCustomer = filterCustomer === 'all' || ret.customer_id === filterCustomer;
      let matchDate = true;
      if (dateRange.from && ret.return_date < dateRange.from) matchDate = false;
      if (dateRange.to && ret.return_date > dateRange.to) matchDate = false;
      return matchSearch && matchType && matchStatus && matchCustomer && matchDate;
    });
  }, [salesReturns, search, filterType, filterStatus, filterCustomer, dateRange]);

  // Tab 5: Filtered Customer Debt
  const filteredCustomerDebts = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return invoices
      .filter(i => i.debt_amount > 0 && i.status !== 'cancelled')
      .filter(inv => {
        const matchSearch =
          inv.code.toLowerCase().includes(search.toLowerCase()) ||
          inv.customer_name.toLowerCase().includes(search.toLowerCase());
        const isOverdue = inv.due_date && inv.due_date < today;
        let matchState = true;
        if (filterStatus === 'overdue') matchState = !!isOverdue;
        else if (filterStatus === 'unpaid') matchState = inv.payment_status === 'unpaid';
        else if (filterStatus === 'partial') matchState = inv.payment_status === 'partial';
        const matchCustomer = filterCustomer === 'all' || inv.customer_id === filterCustomer;
        let matchDate = true;
        if (dateRange.from && inv.invoice_date < dateRange.from) matchDate = false;
        if (dateRange.to && inv.invoice_date > dateRange.to) matchDate = false;
        return matchSearch && matchState && matchCustomer && matchDate;
      });
  }, [invoices, search, filterStatus, filterCustomer, dateRange]);

  // Invoice Columns
  const invoiceColumns: Column<SalesInvoice>[] = [
    {
      key: 'code',
      header: 'MÃ HĐ',
      sortable: true,
      render: row => <span className="font-semibold text-[#111827]">{row.code}</span>,
    },
    {
      key: 'date',
      header: 'NGÀY',
      sortable: true,
      render: row => <span className="text-[#4B5563]">{formatDate(row.invoice_date)}</span>,
    },
    {
      key: 'customer',
      header: 'KHÁCH HÀNG',
      sortable: true,
      render: row => (
        <div>
          <div className="font-semibold text-[#111827]">{row.customer_name}</div>
          {row.customer_phone && (
            <div className="text-[12px] text-[#6B7280]">{row.customer_phone}</div>
          )}
        </div>
      ),
    },
    {
      key: 'total',
      header: 'TỔNG TIỀN',
      align: 'right',
      sortable: true,
      render: row => <span className="font-bold text-[#111827]">{formatCurrency(row.total)}</span>,
    },
    {
      key: 'paid',
      header: 'ĐÃ THANH TOÁN',
      align: 'right',
      sortable: true,
      render: row => (
        <span className="text-[#6317D6] font-medium">{formatCurrency(row.paid_amount)}</span>
      ),
    },
    {
      key: 'debt',
      header: 'CÒN NỢ',
      align: 'right',
      sortable: true,
      render: row => (
        <span
          className={`font-bold tabular-nums ${row.debt_amount > 0 ? 'text-[#E11D48]' : 'text-gray-400'}`}
        >
          {formatCurrency(row.debt_amount)}
        </span>
      ),
    },
    {
      key: 'payment_status',
      header: 'THANH TOÁN',
      align: 'center',
      render: row => <StatusBadge status={row.payment_status} />,
    },
    {
      key: 'note',
      header: 'GHI CHÚ',
      render: row => (
        <NoteCell
          note={row.note}
          onSave={newNote => updateInlineNote('invoice', row.id, newNote)}
        />
      ),
    },
    {
      key: 'status',
      header: 'TRẠNG THÁI',
      align: 'center',
      render: row => (
        <InlineStatusSelect
          currentStatus={row.status}
          options={[
            { value: 'processing', label: 'Đang xử lý' },
            { value: 'completed', label: 'Hoàn tất' },
            { value: 'cancelled', label: 'Đã hủy' },
          ]}
          onSelect={newStatus => updateInvoiceStatus(row.id, newStatus)}
          disabled={row.status === 'locked'}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: row => (
        <div className="flex items-center justify-end gap-2 text-[#6B7280]">
          <button
            type="button"
            title="In hóa đơn"
            onClick={() => onPrintDocument('HÓA ĐƠN BÁN HÀNG', row.code, row)}
            className="p-1.5 hover:text-[#6D3EEB] rounded-full hover:bg-gray-100 transition-colors"
          >
            <Icon name="print" size={18} />
          </button>
          <button
            type="button"
            title="Thu tiền cho hóa đơn này"
            disabled={row.debt_amount === 0}
            onClick={() => onOpenPaymentAllocation(row.customer_id, row.id)}
            className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors ${
              row.debt_amount > 0
                ? 'text-[#059669] hover:text-[#047857]'
                : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            <Icon name="payments" size={18} />
          </button>
          <button
            type="button"
            title="Xoá"
            onClick={() => {
              if (confirm(`Xoá hóa đơn ${row.code}?`)) deleteInvoice(row.id);
            }}
            className="p-1.5 hover:text-[#E11D48] rounded-full hover:bg-gray-100 transition-colors"
          >
            <Icon name="delete" size={18} />
          </button>
        </div>
      ),
    },
  ];

  // Customer Columns
  const customerColumns: Column<Customer>[] = [
    {
      key: 'code',
      header: 'MÃ',
      render: row => (
        <span
          onClick={() => {
            setSelectedCustomerDetail(row);
            setIsCustomerDetailOpen(true);
          }}
          className="font-mono text-[#6B7280] hover:text-[#6D3EEB] cursor-pointer hover:underline"
        >
          {row.code}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'TÊN KHÁCH HÀNG',
      render: row => (
        <span
          onClick={() => {
            setSelectedCustomerDetail(row);
            setIsCustomerDetailOpen(true);
          }}
          className="font-semibold text-[#111827] hover:text-[#6D3EEB] cursor-pointer hover:underline"
        >
          {row.name}
        </span>
      ),
    },
    {
      key: 'phone',
      header: 'SĐT',
      render: row => <span className="text-[#4B5563]">{row.phone}</span>,
    },
    {
      key: 'group',
      header: 'NHÓM',
      render: row => (
        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[#4B5563] text-[11.5px] font-medium">
          {row.group_name || 'Khách lẻ'}
        </span>
      ),
    },
    {
      key: 'total_purchase',
      header: 'TỔNG MUA',
      align: 'right',
      render: row => (
        <span className="font-semibold text-[#111827]">{formatCurrency(row.total_purchase)}</span>
      ),
    },
    {
      key: 'debt',
      header: 'CÒN NỢ',
      align: 'right',
      render: row => (
        <span
          className={`font-bold tabular-nums ${row.debt_amount > 0 ? 'text-[#E11D48]' : 'text-gray-400'}`}
        >
          {formatCurrency(row.debt_amount)}
        </span>
      ),
    },
    {
      key: 'note',
      header: 'GHI CHÚ',
      render: row => (
        <NoteCell
          note={row.note}
          onSave={newNote => updateInlineNote('customer', row.id, newNote)}
        />
      ),
    },
    {
      key: 'status',
      header: 'TRẠNG THÁI',
      align: 'center',
      render: row => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: row => (
        <div className="flex items-center justify-end gap-2 text-[#6B7280]">
          <button
            type="button"
            title="Xem đầy đủ thông tin khách hàng"
            onClick={() => {
              setSelectedCustomerDetail(row);
              setIsCustomerDetailOpen(true);
            }}
            className="p-1.5 hover:text-[#6D3EEB] text-[#6D3EEB] rounded-full hover:bg-purple-50 transition-colors cursor-pointer"
          >
            <Icon name="visibility" size={18} />
          </button>
          {onOpenEditCustomer && (
            <button
              type="button"
              title="Sửa thông tin khách hàng"
              onClick={() => onOpenEditCustomer(row)}
              className="p-1.5 hover:text-[#6D3EEB] text-[#6B7280] rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <Icon name="edit" size={18} />
            </button>
          )}
          <button
            type="button"
            title="Thu nợ khách hàng này"
            disabled={row.debt_amount === 0}
            onClick={() => onOpenPaymentAllocation(row.id)}
            className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors ${
              row.debt_amount > 0 ? 'text-[#059669]' : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            <Icon name="payments" size={18} />
          </button>
          <button
            type="button"
            title="Xoá"
            onClick={() => {
              if (confirm(`Xoá khách hàng ${row.name}?`)) deleteCustomer(row.id);
            }}
            className="p-1.5 hover:text-[#E11D48] rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <Icon name="delete" size={18} />
          </button>
        </div>
      ),
    },
  ];

  // Quotation Columns
  const quotationColumns: Column<Quotation>[] = [
    {
      key: 'code',
      header: 'MÃ BG',
      render: row => (
        <button
          type="button"
          onClick={() => {
            setSelectedQuotationDetail(row);
            setIsQuotationDetailOpen(true);
          }}
          className="font-bold text-[#6D3EEB] hover:underline cursor-pointer text-left"
        >
          {row.code}
        </button>
      ),
    },
    {
      key: 'date',
      header: 'NGÀY',
      render: row => <span className="text-[#4B5563]">{formatDate(row.quote_date)}</span>,
    },
    {
      key: 'customer',
      header: 'KHÁCH HÀNG',
      render: row => (
        <button
          type="button"
          onClick={() => {
            setSelectedQuotationDetail(row);
            setIsQuotationDetailOpen(true);
          }}
          className="font-semibold text-[#111827] hover:text-[#6D3EEB] transition-colors cursor-pointer text-left"
        >
          {row.customer_name}
        </button>
      ),
    },
    {
      key: 'total',
      header: 'TỔNG TIỀN',
      align: 'right',
      render: row => (
        <span className="font-bold text-[#6D3EEB]">{formatCurrency(row.total)}</span>
      ),
    },
    {
      key: 'expires',
      header: 'HẾT HẠN',
      render: row => {
        const isExpired =
          row.expires_at && row.expires_at < new Date().toISOString().split('T')[0];
        return (
          <span className={isExpired ? 'text-[#E11D48] font-semibold' : 'text-[#4B5563]'}>
            {formatDate(row.expires_at)}
          </span>
        );
      },
    },
    {
      key: 'note',
      header: 'GHI CHÚ',
      render: row => (
        <NoteCell
          note={row.note}
          onSave={newNote => updateInlineNote('quotation', row.id, newNote)}
        />
      ),
    },
    {
      key: 'status',
      header: 'TRẠNG THÁI',
      align: 'center',
      render: row => (
        <InlineStatusSelect
          currentStatus={row.status}
          options={[
            { value: 'new', label: 'Mới' },
            { value: 'sent', label: 'Đã gửi KH' },
            { value: 'cancelled', label: 'Đã huỷ' },
          ]}
          onSelect={newStatus => updateQuotationStatus(row.id, newStatus)}
          disabled={row.status === 'converted'}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: row => (
        <div className="flex items-center justify-end gap-2 text-[#6B7280]">
          <button
            type="button"
            title="Xem chi tiết báo giá"
            onClick={() => {
              setSelectedQuotationDetail(row);
              setIsQuotationDetailOpen(true);
            }}
            className="p-1.5 hover:text-[#6D3EEB] text-[#6D3EEB] rounded-full hover:bg-purple-50 transition-colors cursor-pointer"
          >
            <Icon name="visibility" size={18} />
          </button>
          {onOpenEditQuotation && (
            <button
              type="button"
              title="Sửa báo giá"
              onClick={() => onOpenEditQuotation(row)}
              className="p-1.5 hover:text-[#6D3EEB] text-[#6B7280] rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <Icon name="edit" size={18} />
            </button>
          )}
          <button
            type="button"
            title="In báo giá"
            onClick={() => onPrintDocument('BÁO GIÁ', row.code, row)}
            className="p-1.5 hover:text-[#6D3EEB] rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <Icon name="print" size={18} />
          </button>
          {row.status !== 'converted' && row.status !== 'cancelled' && (
            <button
              type="button"
              title="Chuyển thành hóa đơn"
              onClick={() => {
                if (confirm(`Chuyển báo giá ${row.code} thành hóa đơn bán hàng?`)) {
                  convertQuotationToInvoice(row.id);
                  onTabChange('tong-quan');
                }
              }}
              className="px-2.5 py-1 bg-[#F3EBFE] hover:bg-[#E9D5FF] text-[#6317D6] text-[12px] font-semibold rounded-[8px] transition-colors cursor-pointer"
            >
              Chuyển HĐ
            </button>
          )}
          <button
            type="button"
            title="Xoá báo giá"
            onClick={() => {
              if (confirm(`Xoá báo giá ${row.code}?`)) {
                deleteQuotation(row.id);
              }
            }}
            className="p-1.5 hover:text-[#E11D48] rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <Icon name="delete" size={18} />
          </button>
        </div>
      ),
    },
  ];

  // Return Columns
  const returnColumns: Column<SalesReturn>[] = [
    {
      key: 'code',
      header: 'MÃ PHIẾU',
      render: row => <span className="font-semibold text-[#111827]">{row.code}</span>,
    },
    {
      key: 'date',
      header: 'NGÀY',
      render: row => <span className="text-[#4B5563]">{formatDate(row.return_date)}</span>,
    },
    {
      key: 'customer',
      header: 'KHÁCH HÀNG',
      render: row => <span className="font-semibold text-[#111827]">{row.customer_name}</span>,
    },
    {
      key: 'invoice',
      header: 'HĐ GỐC',
      render: row => (
        <span className="font-mono text-[#6D3EEB]">{row.invoice_code || '—'}</span>
      ),
    },
    {
      key: 'total',
      header: 'GIÁ TRỊ TRẢ',
      align: 'right',
      render: row => (
        <span className="font-bold text-[#E11D48]">{formatCurrency(row.total_value)}</span>
      ),
    },
    {
      key: 'refund',
      header: 'CẦN HOÀN',
      align: 'right',
      render: row => (
        <span className="tabular-nums">
          {row.refund_due > 0 ? formatCurrency(row.refund_due) : '—'}
        </span>
      ),
    },
    {
      key: 'handling',
      header: 'KIỂU XỬ LÝ',
      render: row => (
        <span className="text-[12.5px] text-[#4B5563]">
          {row.handling === 'debt_offset' ? 'Trừ công nợ' : 'Hoàn tiền'}
        </span>
      ),
    },
    {
      key: 'note',
      header: 'GHI CHÚ',
      render: row => (
        <NoteCell
          note={row.note}
          onSave={newNote => updateInlineNote('return', row.id, newNote)}
        />
      ),
    },
    {
      key: 'status',
      header: 'TRẠNG THÁI',
      align: 'center',
      render: row => (
        <InlineStatusSelect
          currentStatus={row.status}
          options={[
            { value: 'draft', label: 'Bản nháp' },
            { value: 'received', label: 'Đã nhận hàng' },
            { value: 'completed', label: 'Hoàn tất' },
            { value: 'cancelled', label: 'Đã hủy' },
          ]}
          onSelect={newStatus => updateReturnStatus(row.id, newStatus)}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: row => (
        <div className="flex items-center justify-end gap-2 text-[#6B7280]">
          <button
            type="button"
            title="In phiếu trả hàng"
            onClick={() => onPrintDocument('PHIẾU TRẢ HÀNG', row.code, row)}
            className="p-1.5 hover:text-[#6D3EEB] rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <Icon name="print" size={18} />
          </button>
          {onOpenEditReturn && (
            <button
              type="button"
              title="Sửa phiếu trả hàng"
              onClick={() => onOpenEditReturn(row)}
              className="p-1.5 hover:text-[#6D3EEB] text-[#6B7280] rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <Icon name="edit" size={18} />
            </button>
          )}
          <button
            type="button"
            title="Xóa phiếu trả hàng"
            onClick={() => {
              if (confirm(`Xóa phiếu trả hàng ${row.code}?`)) {
                deleteSalesReturn(row.id);
              }
            }}
            className="p-1.5 hover:text-[#E11D48] rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <Icon name="delete" size={18} />
          </button>
        </div>
      ),
    },
  ];

  // Customer Debt Columns
  const debtColumns: Column<SalesInvoice>[] = [
    {
      key: 'code',
      header: 'MÃ HĐ',
      render: row => <span className="font-semibold text-[#111827]">{row.code}</span>,
    },
    {
      key: 'customer',
      header: 'KHÁCH HÀNG',
      render: row => <span className="font-semibold text-[#111827]">{row.customer_name}</span>,
    },
    {
      key: 'total',
      header: 'TỔNG TIỀN',
      align: 'right',
      render: row => <span className="tabular-nums">{formatCurrency(row.total)}</span>,
    },
    {
      key: 'paid',
      header: 'ĐÃ THU',
      align: 'right',
      render: row => (
        <span className="text-[#059669] tabular-nums">{formatCurrency(row.paid_amount)}</span>
      ),
    },
    {
      key: 'debt',
      header: 'CÒN NỢ',
      align: 'right',
      render: row => (
        <span className="font-bold text-[#E11D48] tabular-nums">
          {formatCurrency(row.debt_amount)}
        </span>
      ),
    },
    {
      key: 'due_date',
      header: 'HẠN',
      render: row => {
        const isOverdue =
          row.due_date && row.due_date < new Date().toISOString().split('T')[0];
        return (
          <span className={isOverdue ? 'text-[#E11D48] font-bold' : 'text-[#4B5563]'}>
            {formatDate(row.due_date)}
          </span>
        );
      },
    },
    {
      key: 'state',
      header: 'TÌNH TRẠNG',
      align: 'center',
      render: row => {
        const isOverdue =
          row.due_date && row.due_date < new Date().toISOString().split('T')[0];
        if (isOverdue) return <StatusBadge status="overdue" />;
        return <StatusBadge status={row.payment_status} />;
      },
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: row => (
        <button
          type="button"
          onClick={() => onOpenPaymentAllocation(row.customer_id, row.id)}
          className="px-3 py-1 bg-[#F9F5FF] hover:bg-[#F3EBFE] text-[#6317D6] text-[12.5px] font-semibold rounded-[8px] transition-colors"
        >
          Thu nợ
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Bán hàng"
        subtitle="Theo dõi báo giá, hóa đơn và doanh thu bán hàng"
      />

      <Tabs items={tabs} activeId={currentTab} onChange={onTabChange} />

      {/* Tab 1: Tổng quan bán hàng */}
      {currentTab === 'tong-quan' && (
        <div className="space-y-5">
          {/* 4 KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Doanh thu"
              value={formatCurrency(invoiceKpis.revenue)}
              icon="sell"
              iconBg="bg-[#F3EBFE]"
              iconColor="text-[#6D3EEB]"
              trend={{ value: '↗ 12%', isUp: true }}
            />
            <KpiCard
              label="Lợi nhuận"
              value={formatCurrency(invoiceKpis.profit)}
              icon="savings"
              iconBg="bg-[#ECFDF5]"
              iconColor="text-[#059669]"
              trend={{ value: '↗ 8%', isUp: true }}
            />
            <KpiCard
              label="Số phiếu bán"
              value={invoiceKpis.count}
              icon="receipt_long"
              iconBg="bg-[#EFF6FF]"
              iconColor="text-[#2563EB]"
            />
            <KpiCard
              label="Phải thu"
              value={formatCurrency(invoiceKpis.debt)}
              icon="request_quote"
              iconBg="bg-[#FFF1F2]"
              iconColor="text-[#E11D48]"
            />
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-[#111827]">
              Danh sách phiếu bán hàng
            </h3>
          </div>

          <FilterToolbar
            searchPlaceholder="Tìm phiếu bán, khách hàng..."
            searchValue={search}
            onSearchChange={setSearch}
            filters={[
              {
                label: 'Khách hàng',
                key: 'customer',
                value: filterCustomer,
                items: customerFilterItems,
                onChange: setFilterCustomer,
              },
              {
                label: 'Thanh toán',
                key: 'payment',
                value: filterPayment,
                items: [
                  { value: 'all', label: 'Thanh toán: Tất cả' },
                  { value: 'unpaid', label: 'Chưa thanh toán' },
                  { value: 'partial', label: 'Thanh toán một phần' },
                  { value: 'paid', label: 'Đã thanh toán' },
                  { value: 'overpaid', label: 'Thanh toán thừa' },
                ],
                onChange: setFilterPayment,
              },
              {
                label: 'Trạng thái',
                key: 'status',
                value: filterStatus,
                items: [
                  { value: 'all', label: 'Trạng thái: Tất cả' },
                  { value: 'processing', label: 'Đang xử lý' },
                  { value: 'completed', label: 'Hoàn tất' },
                  { value: 'partially_returned', label: 'Trả một phần' },
                  { value: 'cancelled', label: 'Đã hủy' },
                ],
                onChange: setFilterStatus,
              },
            ]}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            sortOptions={[
              { key: 'date', label: 'Sắp xếp: Ngày' },
              { key: 'total', label: 'Sắp xếp: Tổng tiền' },
              { key: 'debt', label: 'Sắp xếp: Còn nợ' },
            ]}
            currentSortKey={sortKey}
            sortDirection={sortDir}
            onSortChange={(k, d) => {
              setSortKey(k);
              setSortDir(d);
            }}
            onClearFilters={() => {
              setSearch('');
              setFilterPayment('all');
              setFilterStatus('all');
              setFilterCustomer('all');
              setDateRange({ from: null, to: null });
            }}
            onExportExcel={() => setIsExportOpen(true)}
            primaryAction={{
              label: '+ Tạo phiếu bán',
              onClick: onOpenCreateInvoice,
            }}
          />

          <DataTable
            columns={invoiceColumns}
            data={filteredInvoices}
            keyExtractor={row => row.id}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            emptyMessage="Chưa có dữ liệu"
            emptyActionText="+ Tạo phiếu bán"
            onEmptyAction={onOpenCreateInvoice}
          />

          <ExportDialog
            isOpen={isExportOpen}
            onClose={() => setIsExportOpen(false)}
            filePrefix="tongquan"
            allData={invoices}
            filteredData={filteredInvoices}
            selectedData={invoices.filter(i => selectedIds.includes(i.id))}
            availableColumns={[
              { key: 'code', header: 'Mã HĐ' },
              { key: 'invoice_date', header: 'Ngày', accessor: r => formatDate(r.invoice_date) },
              { key: 'customer_name', header: 'Khách hàng' },
              { key: 'total', header: 'Tổng tiền', accessor: r => r.total },
              { key: 'paid_amount', header: 'Đã thanh toán', accessor: r => r.paid_amount },
              { key: 'debt_amount', header: 'Còn nợ', accessor: r => r.debt_amount },
              { key: 'payment_status', header: 'Thanh toán' },
              { key: 'note', header: 'Ghi chú', accessor: r => r.note || '' },
              { key: 'status', header: 'Trạng thái' },
            ]}
          />
        </div>
      )}

      {/* Tab 2: Khách hàng */}
      {currentTab === 'khach-hang' && (
        <div className="space-y-4">
          <FilterToolbar
            searchPlaceholder="Tìm khách hàng theo tên, SĐT, mã..."
            searchValue={search}
            onSearchChange={setSearch}
            filters={[
              {
                label: 'Nhóm',
                key: 'group',
                value: filterGroup,
                items: [
                  { value: 'all', label: 'Nhóm: Tất cả' },
                  { value: 'Đại lý', label: 'Đại lý' },
                  { value: 'Doanh nghiệp', label: 'Doanh nghiệp' },
                  { value: 'Khách lẻ', label: 'Khách lẻ' },
                  { value: 'DỰ ÁN', label: 'DỰ ÁN' },
                ],
                onChange: setFilterGroup,
              },
            ]}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onClearFilters={() => {
              setSearch('');
              setFilterGroup('all');
              setDateRange({ from: null, to: null });
            }}
            onExportExcel={() => setIsExportOpen(true)}
            secondaryAction={
              onOpenImportCustomerDialog
                ? {
                    label: 'Nhập Excel',
                    icon: 'upload_file',
                    onClick: onOpenImportCustomerDialog,
                  }
                : undefined
            }
            primaryAction={{
              label: '+ Thêm khách hàng',
              onClick: onOpenCreateCustomer,
            }}
          />

          <DataTable
            columns={customerColumns}
            data={filteredCustomers}
            keyExtractor={row => row.id}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onDeleteSelected={ids => {
              if (confirm(`Xóa ${ids.length} khách hàng đã chọn?`)) {
                deleteCustomersBatch(ids);
                setSelectedIds([]);
              }
            }}
            emptyMessage="Không tìm thấy khách hàng nào"
            emptyActionText="+ Thêm khách hàng"
            onEmptyAction={onOpenCreateCustomer}
          />
        </div>
      )}

      {/* Tab 3: Báo giá */}
      {currentTab === 'bao-gia' && (
        <div className="space-y-4">
          <FilterToolbar
            searchPlaceholder="Tìm báo giá, khách hàng..."
            searchValue={search}
            onSearchChange={setSearch}
            filters={[
              {
                label: 'Khách hàng',
                key: 'customer',
                value: filterCustomer,
                items: customerFilterItems,
                onChange: setFilterCustomer,
              },
              {
                label: 'Trạng thái',
                key: 'status',
                value: filterStatus,
                items: [
                  { value: 'all', label: 'Trạng thái: Tất cả' },
                  { value: 'new', label: 'Mới' },
                  { value: 'sent', label: 'Đã gửi KH' },
                  { value: 'converted', label: 'Đã chuyển HĐ' },
                  { value: 'cancelled', label: 'Đã huỷ' },
                ],
                onChange: setFilterStatus,
              },
            ]}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            sortOptions={[
              { key: 'date', label: 'Sắp xếp: Ngày' },
              { key: 'total', label: 'Sắp xếp: Tổng tiền' },
              { key: 'expires', label: 'Sắp xếp: Hạn báo giá' },
            ]}
            currentSortKey={sortKey}
            sortDirection={sortDir}
            onSortChange={(k, d) => {
              setSortKey(k);
              setSortDir(d);
            }}
            onClearFilters={() => {
              setSearch('');
              setFilterStatus('all');
              setFilterCustomer('all');
              setDateRange({ from: null, to: null });
            }}
            onExportExcel={() => setIsExportOpen(true)}
            primaryAction={{
              label: '+ Tạo báo giá',
              onClick: onOpenCreateQuotation,
            }}
          />

          <DataTable
            columns={quotationColumns}
            data={filteredQuotations}
            keyExtractor={row => row.id}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onDeleteSelected={ids => {
              if (confirm(`Xóa ${ids.length} báo giá đã chọn?`)) {
                deleteQuotationsBatch(ids);
                setSelectedIds([]);
              }
            }}
            emptyMessage="Chưa có báo giá nào"
            emptyActionText="+ Tạo báo giá"
            onEmptyAction={onOpenCreateQuotation}
          />
        </div>
      )}

      {/* Tab 4: Trả hàng */}
      {currentTab === 'tra-hang' && (
        <div className="space-y-4">
          <FilterToolbar
            searchPlaceholder="Tìm phiếu trả, khách hàng..."
            searchValue={search}
            onSearchChange={setSearch}
            filters={[
              {
                label: 'Khách hàng',
                key: 'customer',
                value: filterCustomer,
                items: customerFilterItems,
                onChange: setFilterCustomer,
              },
              {
                label: 'Trạng thái',
                key: 'status',
                value: filterStatus,
                items: [
                  { value: 'all', label: 'Trạng thái: Tất cả' },
                  { value: 'draft', label: 'Bản nháp' },
                  { value: 'received', label: 'Đã nhận hàng' },
                  { value: 'completed', label: 'Hoàn tất' },
                  { value: 'cancelled', label: 'Đã hủy' },
                ],
                onChange: setFilterStatus,
              },
              {
                label: 'Kiểu',
                key: 'handling',
                value: filterType,
                items: [
                  { value: 'all', label: 'Kiểu: Tất cả' },
                  { value: 'debt_offset', label: 'Trừ công nợ' },
                  { value: 'refund', label: 'Hoàn tiền' },
                ],
                onChange: setFilterType,
              },
            ]}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onClearFilters={() => {
              setSearch('');
              setFilterType('all');
              setFilterStatus('all');
              setFilterCustomer('all');
              setDateRange({ from: null, to: null });
            }}
            onExportExcel={() => setIsExportOpen(true)}
            primaryAction={{
              label: 'Tạo phiếu trả hàng',
              icon: 'assignment_return',
              onClick: onOpenCreateReturn,
            }}
          />

          <DataTable
            columns={returnColumns}
            data={filteredReturns}
            keyExtractor={row => row.id}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onDeleteSelected={ids => {
              if (confirm(`Xóa ${ids.length} phiếu trả hàng đã chọn?`)) {
                deleteSalesReturnsBatch(ids);
                setSelectedIds([]);
              }
            }}
            emptyMessage="Chưa có phiếu trả hàng khách hàng nào"
            emptyActionText="Tạo phiếu trả hàng"
            onEmptyAction={onOpenCreateReturn}
          />
        </div>
      )}

      {/* Tab 5: Công nợ khách hàng */}
      {currentTab === 'cong-no' && (
        <div className="space-y-4">
          <FilterToolbar
            searchPlaceholder="Tìm hóa đơn, khách hàng..."
            searchValue={search}
            onSearchChange={setSearch}
            filters={[
              {
                label: 'Khách hàng',
                key: 'customer',
                value: filterCustomer,
                items: customerFilterItems,
                onChange: setFilterCustomer,
              },
              {
                label: 'Tình trạng',
                key: 'status',
                value: filterStatus,
                items: [
                  { value: 'all', label: 'Tình trạng: Tất cả' },
                  { value: 'overdue', label: 'Quá hạn' },
                  { value: 'unpaid', label: 'Chưa thanh toán' },
                  { value: 'partial', label: 'Thanh toán một phần' },
                ],
                onChange: setFilterStatus,
              },
            ]}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onClearFilters={() => {
              setSearch('');
              setFilterStatus('all');
              setFilterCustomer('all');
              setDateRange({ from: null, to: null });
            }}
            onExportExcel={() => setIsExportOpen(true)}
            primaryAction={{
              label: 'Thu tiền (phân bổ nhiều HĐ)',
              icon: 'account_balance_wallet',
              onClick: () => onOpenPaymentAllocation(),
            }}
          />

          <DataTable
            columns={debtColumns}
            data={filteredCustomerDebts}
            keyExtractor={row => row.id}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            emptyMessage="Không có công nợ phải thu"
          />
        </div>
      )}

      {/* Customer Full Detail Modal */}
      <CustomerDetailModal
        isOpen={isCustomerDetailOpen}
        customer={selectedCustomerDetail}
        onClose={() => {
          setIsCustomerDetailOpen(false);
          setSelectedCustomerDetail(null);
        }}
        onEditCustomer={cust => {
          setIsCustomerDetailOpen(false);
          setSelectedCustomerDetail(null);
          onOpenEditCustomer?.(cust);
        }}
      />

      {/* Quotation Full Detail Modal */}
      <QuotationDetailModal
        isOpen={isQuotationDetailOpen}
        quotation={selectedQuotationDetail}
        allQuotations={filteredQuotations}
        onSelectQuotation={quo => setSelectedQuotationDetail(quo)}
        onClose={() => {
          setIsQuotationDetailOpen(false);
          setSelectedQuotationDetail(null);
        }}
        onPrint={quo => {
          onPrintDocument('BÁO GIÁ', quo.code, quo);
        }}
        onConvertToInvoice={quo => {
          if (confirm(`Chuyển báo giá ${quo.code} thành hóa đơn bán hàng?`)) {
            convertQuotationToInvoice(quo.id);
            setIsQuotationDetailOpen(false);
            onTabChange('tong-quan');
          }
        }}
        onDelete={quo => {
          if (confirm(`Xoá báo giá ${quo.code}?`)) {
            deleteQuotation(quo.id);
            setIsQuotationDetailOpen(false);
            setSelectedQuotationDetail(null);
          }
        }}
        onEdit={() => {
          setIsQuotationDetailOpen(false);
          if (selectedQuotationDetail && onOpenEditQuotation) {
            onOpenEditQuotation(selectedQuotationDetail);
          } else {
            onOpenCreateQuotation();
          }
        }}
      />
    </div>
  );
};
