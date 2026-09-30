import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Tabs, TabItem } from '../components/ui/Tabs';
import { KpiCard } from '../components/ui/KpiCard';
import { FilterToolbar } from '../components/ui/FilterToolbar';
import { DataTable, Column } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Icon } from '../components/ui/Icon';
import { DateRange } from '../components/ui/DateRangePicker';
import { formatCurrency, formatDate } from '../lib/format';
import { exportToExcelFile, ExportColumn } from '../lib/excelExport';
import { Customer, Supplier, SalesInvoice, PurchaseOrder, Payment } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { DebtReconciliationModal } from '../components/dialogs/DebtReconciliationModal';

interface DebtViewProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenPaymentAllocation: (partnerId?: string, docId?: string, direction?: 'in' | 'out') => void;
}

export const DebtView: React.FC<DebtViewProps> = ({
  currentTab,
  onTabChange,
  onOpenPaymentAllocation,
}) => {
  const { customers, suppliers, invoices, purchaseOrders, payments } = useApp();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDirection, setFilterDirection] = useState('all');
  const [agingPartnerType, setAgingPartnerType] = useState<'customer' | 'supplier'>('customer');
  const [agingRiskFilter, setAgingRiskFilter] = useState<'all' | 'safe' | 'warning' | 'danger'>('all');

  // Specific filters for DebtView tabs
  const [customerGroupFilter, setCustomerGroupFilter] = useState('all');
  const [customerOverdueFilter, setCustomerOverdueFilter] = useState('all');
  const [supplierOverdueFilter, setSupplierOverdueFilter] = useState('all');
  const [partnerFilter, setPartnerFilter] = useState('all');
  const [debtTermFilter, setDebtTermFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [overdueTypeFilter, setOverdueTypeFilter] = useState('all');
  const [overdueDaysFilter, setOverdueDaysFilter] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });

  const [reconciliationState, setReconciliationState] = useState<{
    isOpen: boolean;
    partnerId?: string;
    partnerType?: 'customer' | 'supplier';
  }>({
    isOpen: false,
    partnerId: undefined,
    partnerType: 'customer',
  });

  const tabs: TabItem[] = [
    { id: 'tong-quan', label: 'Tổng quan công nợ' },
    { id: 'khach-hang-no', label: 'Khách hàng nợ' },
    { id: 'no-ncc', label: 'Nợ nhà cung cấp' },
    { id: 'tuoi-no', label: 'Tuổi nợ (Aging)' },
    { id: 'phai-thu', label: 'Chi tiết phải thu' },
    { id: 'phai-tra', label: 'Chi tiết phải trả' },
    { id: 'dong-tien', label: 'Dòng tiền 30 ngày' },
    { id: 'lich-su-thanh-toan', label: 'Lịch sử thanh toán' },
    { id: 'qua-han', label: 'Quá hạn' },
  ];

  // Aggregates matching section 12 test assertions:
  // Receivables = 6.869.660 đ, Overdue = 1.554.160 đ, 5 customers
  const debtors = useMemo(
    () => customers.filter(c => c.debt_amount > 0),
    [customers]
  );
  const supplierDebtors = useMemo(
    () => suppliers.filter(s => s.debt_amount > 0),
    [suppliers]
  );

  const totalReceivables = useMemo(
    () => debtors.reduce((sum, c) => sum + c.debt_amount, 0),
    [debtors]
  );
  const totalPayables = useMemo(
    () => supplierDebtors.reduce((sum, s) => sum + s.debt_amount, 0),
    [supplierDebtors]
  );
  const overdueReceivables = useMemo(
    () => debtors.reduce((sum, c) => sum + c.overdue_amount, 0),
    [debtors]
  );
  const overduePayables = useMemo(
    () => supplierDebtors.reduce((sum, s) => sum + s.overdue_amount, 0),
    [supplierDebtors]
  );
  const totalOverdue = overdueReceivables + overduePayables;

  // Partner filter items
  const customerFilterOptions = useMemo(() => [
    { value: 'all', label: 'Khách hàng: Tất cả' },
    ...customers.map(c => ({
      value: c.id,
      label: `Khách hàng: ${c.code} - ${c.name}`,
      code: c.code,
      name: c.name,
    })),
  ], [customers]);

  const supplierFilterOptions = useMemo(() => [
    { value: 'all', label: 'Nhà cung cấp: Tất cả' },
    ...suppliers.map(s => ({
      value: s.id,
      label: `Nhà cung cấp: ${s.code} - ${s.name}`,
      code: s.code,
      name: s.name,
    })),
  ], [suppliers]);

  // Filtered lists
  const filteredDebtors = useMemo(() => {
    return debtors.filter(c => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone && c.phone.includes(search));
      const matchGroup = customerGroupFilter === 'all' || c.group_name === customerGroupFilter;
      const matchOverdue =
        customerOverdueFilter === 'all' ||
        (customerOverdueFilter === 'overdue' && (c.overdue_amount || 0) > 0) ||
        (customerOverdueFilter === 'in_term' && (c.overdue_amount || 0) === 0);
      return matchSearch && matchGroup && matchOverdue;
    });
  }, [debtors, search, customerGroupFilter, customerOverdueFilter]);

  const filteredSupplierDebtors = useMemo(() => {
    return supplierDebtors.filter(s => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase()) ||
        (s.phone && s.phone.includes(search));
      const matchOverdue =
        supplierOverdueFilter === 'all' ||
        (supplierOverdueFilter === 'overdue' && (s.overdue_amount || 0) > 0) ||
        (supplierOverdueFilter === 'in_term' && (s.overdue_amount || 0) === 0);
      return matchSearch && matchOverdue;
    });
  }, [supplierDebtors, search, supplierOverdueFilter]);

  // Receivables details (Invoices with debt)
  const openInvoices = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return invoices
      .filter(i => i.debt_amount > 0 && i.status !== 'cancelled')
      .filter(i => {
        const matchSearch =
          i.code.toLowerCase().includes(search.toLowerCase()) ||
          i.customer_name.toLowerCase().includes(search.toLowerCase());
        const matchCustomer = partnerFilter === 'all' || i.customer_id === partnerFilter;
        let matchDate = true;
        if (dateRange.from && i.invoice_date < dateRange.from) matchDate = false;
        if (dateRange.to && i.invoice_date > dateRange.to) matchDate = false;
        const isOverdue = !!(i.due_date && i.due_date < today);
        const matchTerm =
          debtTermFilter === 'all' ||
          (debtTermFilter === 'overdue' && isOverdue) ||
          (debtTermFilter === 'in_term' && !isOverdue);
        return matchSearch && matchCustomer && matchDate && matchTerm;
      })
      .map(i => ({
        ...i,
        isOverdue: i.due_date && i.due_date < today,
      }));
  }, [invoices, search, partnerFilter, dateRange, debtTermFilter]);

  // Payables details (POs with debt)
  const openPOs = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return purchaseOrders
      .filter(p => p.debt_amount > 0 && p.status !== 'cancelled')
      .filter(p => {
        const matchSearch =
          p.code.toLowerCase().includes(search.toLowerCase()) ||
          p.supplier_name.toLowerCase().includes(search.toLowerCase());
        const matchSupplier = partnerFilter === 'all' || p.supplier_id === partnerFilter;
        let matchDate = true;
        if (dateRange.from && p.order_date < dateRange.from) matchDate = false;
        if (dateRange.to && p.order_date > dateRange.to) matchDate = false;
        const isOverdue = !!(p.due_date && p.due_date < today);
        const matchTerm =
          debtTermFilter === 'all' ||
          (debtTermFilter === 'overdue' && isOverdue) ||
          (debtTermFilter === 'in_term' && !isOverdue);
        return matchSearch && matchSupplier && matchDate && matchTerm;
      })
      .map(p => ({
        ...p,
        isOverdue: p.due_date && p.due_date < today,
      }));
  }, [purchaseOrders, search, partnerFilter, dateRange, debtTermFilter]);

  // Dynamic Cashflow 30 days buckets
  const { cashflowBuckets, totalExpectedIn, totalExpectedOut, netCashflow } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getDaysDiff = (dateStr?: string | null) => {
      if (!dateStr) return 999;
      const d = new Date(dateStr);
      d.setHours(0, 0, 0, 0);
      return Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    };

    const buckets = [
      { period: 'Quá hạn', inAmount: 0, outAmount: 0, net: 0 },
      { period: '0-7 ngày', inAmount: 0, outAmount: 0, net: 0 },
      { period: '8-14 ngày', inAmount: 0, outAmount: 0, net: 0 },
      { period: '15-21 ngày', inAmount: 0, outAmount: 0, net: 0 },
      { period: '22-30 ngày', inAmount: 0, outAmount: 0, net: 0 },
    ];

    let sumIn = 0;
    let sumOut = 0;

    for (const inv of invoices) {
      if (inv.debt_amount <= 0 || inv.status === 'cancelled') continue;
      const diff = getDaysDiff(inv.due_date || inv.invoice_date);
      if (diff < 0) {
        buckets[0].inAmount += inv.debt_amount;
        sumIn += inv.debt_amount;
      } else if (diff <= 7) {
        buckets[1].inAmount += inv.debt_amount;
        sumIn += inv.debt_amount;
      } else if (diff <= 14) {
        buckets[2].inAmount += inv.debt_amount;
        sumIn += inv.debt_amount;
      } else if (diff <= 21) {
        buckets[3].inAmount += inv.debt_amount;
        sumIn += inv.debt_amount;
      } else if (diff <= 30) {
        buckets[4].inAmount += inv.debt_amount;
        sumIn += inv.debt_amount;
      }
    }

    for (const po of purchaseOrders) {
      if (po.debt_amount <= 0 || po.status === 'cancelled') continue;
      const diff = getDaysDiff(po.due_date || po.order_date);
      if (diff < 0) {
        buckets[0].outAmount += po.debt_amount;
        sumOut += po.debt_amount;
      } else if (diff <= 7) {
        buckets[1].outAmount += po.debt_amount;
        sumOut += po.debt_amount;
      } else if (diff <= 14) {
        buckets[2].outAmount += po.debt_amount;
        sumOut += po.debt_amount;
      } else if (diff <= 21) {
        buckets[3].outAmount += po.debt_amount;
        sumOut += po.debt_amount;
      } else if (diff <= 30) {
        buckets[4].outAmount += po.debt_amount;
        sumOut += po.debt_amount;
      }
    }

    for (const b of buckets) {
      b.net = b.inAmount - b.outAmount;
    }

    return {
      cashflowBuckets: buckets,
      totalExpectedIn: sumIn,
      totalExpectedOut: sumOut,
      netCashflow: sumIn - sumOut,
    };
  }, [invoices, purchaseOrders]);

  // Aging Analysis Calculations
  const customerAgingData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return debtors.map(c => {
      const custInvoices = invoices.filter(
        i => i.customer_id === c.id && i.debt_amount > 0 && i.status !== 'cancelled'
      );
      let current = 0;
      let days1to30 = 0;
      let days31to60 = 0;
      let days61to90 = 0;
      let over90 = 0;

      for (const inv of custInvoices) {
        if (!inv.due_date) {
          current += inv.debt_amount;
          continue;
        }
        const due = new Date(inv.due_date);
        due.setHours(0, 0, 0, 0);
        const daysLate = Math.round((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
        if (daysLate <= 0) current += inv.debt_amount;
        else if (daysLate <= 30) days1to30 += inv.debt_amount;
        else if (daysLate <= 60) days31to60 += inv.debt_amount;
        else if (daysLate <= 90) days61to90 += inv.debt_amount;
        else over90 += inv.debt_amount;
      }

      const accounted = current + days1to30 + days31to60 + days61to90 + over90;
      if (accounted < c.debt_amount) {
        const diff = c.debt_amount - accounted;
        if (c.overdue_amount > 0) days1to30 += diff;
        else current += diff;
      }

      let riskLevel: 'safe' | 'warning' | 'danger' = 'safe';
      if (over90 > 0 || days61to90 > 0) riskLevel = 'danger';
      else if (days31to60 > 0 || c.overdue_amount > 0) riskLevel = 'warning';

      return {
        id: c.id,
        code: c.code,
        name: c.name,
        phone: c.phone || '',
        totalDebt: c.debt_amount,
        current,
        days1to30,
        days31to60,
        days61to90,
        over90,
        riskLevel,
      };
    });
  }, [debtors, invoices]);

  const supplierAgingData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return supplierDebtors.map(s => {
      const supPOs = purchaseOrders.filter(
        p => p.supplier_id === s.id && p.debt_amount > 0 && p.status !== 'cancelled'
      );
      let current = 0;
      let days1to30 = 0;
      let days31to60 = 0;
      let days61to90 = 0;
      let over90 = 0;

      for (const po of supPOs) {
        if (!po.due_date) {
          current += po.debt_amount;
          continue;
        }
        const due = new Date(po.due_date);
        due.setHours(0, 0, 0, 0);
        const daysLate = Math.round((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
        if (daysLate <= 0) current += po.debt_amount;
        else if (daysLate <= 30) days1to30 += po.debt_amount;
        else if (daysLate <= 60) days31to60 += po.debt_amount;
        else if (daysLate <= 90) days61to90 += po.debt_amount;
        else over90 += po.debt_amount;
      }

      const accounted = current + days1to30 + days31to60 + days61to90 + over90;
      if (accounted < s.debt_amount) {
        const diff = s.debt_amount - accounted;
        if (s.overdue_amount > 0) days1to30 += diff;
        else current += diff;
      }

      let riskLevel: 'safe' | 'warning' | 'danger' = 'safe';
      if (over90 > 0 || days61to90 > 0) riskLevel = 'danger';
      else if (days31to60 > 0 || s.overdue_amount > 0) riskLevel = 'warning';

      return {
        id: s.id,
        code: s.code,
        name: s.name,
        phone: s.phone || '',
        totalDebt: s.debt_amount,
        current,
        days1to30,
        days31to60,
        days61to90,
        over90,
        riskLevel,
      };
    });
  }, [supplierDebtors, purchaseOrders]);

  const activeAgingList = agingPartnerType === 'customer' ? customerAgingData : supplierAgingData;
  const filteredAgingList = useMemo(() => {
    return activeAgingList.filter(item => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.code.toLowerCase().includes(search.toLowerCase());
      const matchRisk = agingRiskFilter === 'all' || item.riskLevel === agingRiskFilter;
      return matchSearch && matchRisk;
    });
  }, [activeAgingList, search, agingRiskFilter]);

  const agingTotals = useMemo(() => {
    return activeAgingList.reduce(
      (acc, item) => ({
        total: acc.total + item.totalDebt,
        current: acc.current + item.current,
        days1to30: acc.days1to30 + item.days1to30,
        days31to60: acc.days31to60 + item.days31to60,
        days61to90: acc.days61to90 + item.days61to90,
        over90: acc.over90 + item.over90,
      }),
      { total: 0, current: 0, days1to30: 0, days31to60: 0, days61to90: 0, over90: 0 }
    );
  }, [activeAgingList]);

  const agingChartData = [
    { name: 'Trong hạn', amount: agingTotals.current, fill: '#10B981' },
    { name: '1-30 ngày', amount: agingTotals.days1to30, fill: '#FBBF24' },
    { name: '31-60 ngày', amount: agingTotals.days31to60, fill: '#F59E0B' },
    { name: '61-90 ngày', amount: agingTotals.days61to90, fill: '#EF4444' },
    { name: '> 90 ngày', amount: agingTotals.over90, fill: '#B91C1C' },
  ];

  // High-risk watchlist
  const riskWatchlist = useMemo(() => {
    const list: Array<{
      id: string;
      partnerId: string;
      code: string;
      name: string;
      type: 'customer' | 'supplier';
      totalDebt: number;
      overdueDebt: number;
      reason: string;
      riskLevel: 'warning' | 'danger';
    }> = [];

    for (const c of customerAgingData) {
      if (c.over90 > 0 || c.days61to90 > 0) {
        list.push({
          id: `c-${c.id}`,
          partnerId: c.id,
          code: c.code,
          name: c.name,
          type: 'customer',
          totalDebt: c.totalDebt,
          overdueDebt: c.days1to30 + c.days31to60 + c.days61to90 + c.over90,
          reason: c.over90 > 0 ? `Nợ trễ hạn trên 90 ngày (${formatCurrency(c.over90)})` : `Nợ trễ hạn 61-90 ngày`,
          riskLevel: 'danger',
        });
      } else if (c.days31to60 > 0) {
        list.push({
          id: `c-${c.id}`,
          partnerId: c.id,
          code: c.code,
          name: c.name,
          type: 'customer',
          totalDebt: c.totalDebt,
          overdueDebt: c.days1to30 + c.days31to60,
          reason: `Nợ trễ hạn 31-60 ngày (${formatCurrency(c.days31to60)})`,
          riskLevel: 'warning',
        });
      }
    }

    for (const s of supplierAgingData) {
      if (s.over90 > 0 || s.days61to90 > 0) {
        list.push({
          id: `s-${s.id}`,
          partnerId: s.id,
          code: s.code,
          name: s.name,
          type: 'supplier',
          totalDebt: s.totalDebt,
          overdueDebt: s.days1to30 + s.days31to60 + s.days61to90 + s.over90,
          reason: `Nợ NCC quá hạn nghiêm trọng (${formatCurrency(s.over90 + s.days61to90)})`,
          riskLevel: 'danger',
        });
      }
    }

    return list;
  }, [customerAgingData, supplierAgingData]);

  // Overdue items
  const overdueItems = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const recs = invoices
      .filter(i => i.debt_amount > 0 && i.due_date && i.due_date < today)
      .map(i => ({
        id: i.id,
        type: 'receivable',
        code: i.code,
        partner_name: i.customer_name,
        amount: i.debt_amount,
        due_date: i.due_date,
        partner_id: i.customer_id,
        days_late: Math.ceil(
          (new Date(today).getTime() - new Date(i.due_date!).getTime()) / (1000 * 60 * 60 * 24)
        ),
      }));

    const pays = purchaseOrders
      .filter(p => p.debt_amount > 0 && p.due_date && p.due_date < today)
      .map(p => ({
        id: p.id,
        type: 'payable',
        code: p.code,
        partner_name: p.supplier_name,
        amount: p.debt_amount,
        due_date: p.due_date,
        partner_id: p.supplier_id,
        days_late: Math.ceil(
          (new Date(today).getTime() - new Date(p.due_date!).getTime()) / (1000 * 60 * 60 * 24)
        ),
      }));

    const allOverdue = [...recs, ...pays];
    return allOverdue.filter(item => {
      const matchSearch =
        item.code.toLowerCase().includes(search.toLowerCase()) ||
        item.partner_name.toLowerCase().includes(search.toLowerCase());
      const matchType = overdueTypeFilter === 'all' || item.type === overdueTypeFilter;
      let matchDays = true;
      if (overdueDaysFilter === '1-30') matchDays = item.days_late >= 1 && item.days_late <= 30;
      else if (overdueDaysFilter === '31-60') matchDays = item.days_late >= 31 && item.days_late <= 60;
      else if (overdueDaysFilter === 'over60') matchDays = item.days_late > 60;
      return matchSearch && matchType && matchDays;
    });
  }, [invoices, purchaseOrders, search, overdueTypeFilter, overdueDaysFilter]);

  // Tab 2 Customer Debt Columns
  const debtorColumns: Column<Customer>[] = [
    {
      key: 'customer',
      header: 'KHÁCH HÀNG',
      render: row => (
        <div>
          <div className="font-semibold text-[#111827]">{row.name}</div>
          <div className="text-[11.5px] text-[#6B7280] font-mono mt-0.5">{row.code}</div>
        </div>
      ),
    },
    {
      key: 'docs',
      header: 'CHỨNG TỪ CÒN NỢ',
      align: 'center',
      render: row => <span>{row.open_docs_count || 1}</span>,
    },
    {
      key: 'total',
      header: 'TỔNG TIỀN',
      align: 'right',
      render: row => <span className="tabular-nums">{formatCurrency(row.total_purchase)}</span>,
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
      key: 'overdue',
      header: 'QUÁ HẠN',
      align: 'right',
      render: row => {
        if (row.overdue_amount > 0) {
          return (
            <div>
              <span className="font-bold text-[#E11D48] tabular-nums block">
                {formatCurrency(row.overdue_amount)}
              </span>
              <span className="text-[11px] text-[#6B7280] block">
                trễ {row.max_overdue_days || 176} ngày
              </span>
            </div>
          );
        }
        return <span className="text-gray-400">—</span>;
      },
    },
    {
      key: 'earliest_due',
      header: 'HẠN SỚM NHẤT',
      render: row => (
        <span className={row.overdue_amount > 0 ? 'text-[#E11D48] font-semibold' : 'text-[#4B5563]'}>
          {formatDate(row.earliest_due_date)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: row => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() =>
              setReconciliationState({
                isOpen: true,
                partnerId: row.id,
                partnerType: 'customer',
              })
            }
            className="px-2.5 py-1 border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#4B5563] text-[12px] font-semibold rounded-[8px] transition-colors flex items-center gap-1"
            title="Biên bản đối chiếu công nợ Mẫu 01-ĐCCN"
          >
            <Icon name="receipt_long" size={15} className="text-[#6D3EEB]" />
            <span>Đối chiếu</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenPaymentAllocation(row.id, undefined, 'in')}
            className="px-3 py-1 bg-[#F9F5FF] hover:bg-[#F3EBFE] text-[#6317D6] text-[12.5px] font-semibold rounded-[8px] transition-colors"
          >
            Thu nợ
          </button>
        </div>
      ),
    },
  ];

  // Tab 3 Supplier Debt Columns
  const supplierDebtorColumns: Column<Supplier>[] = [
    {
      key: 'supplier',
      header: 'NHÀ CUNG CẤP',
      render: row => (
        <div>
          <div className="font-semibold text-[#111827]">{row.name}</div>
          <div className="text-[11.5px] text-[#6B7280] font-mono mt-0.5">{row.code}</div>
        </div>
      ),
    },
    {
      key: 'docs',
      header: 'CHỨNG TỪ CÒN NỢ',
      align: 'center',
      render: row => <span>{row.open_docs_count || 1}</span>,
    },
    {
      key: 'total',
      header: 'TỔNG TIỀN',
      align: 'right',
      render: row => <span className="tabular-nums">{formatCurrency(row.total_purchase)}</span>,
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
      key: 'actions',
      header: '',
      align: 'right',
      render: row => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() =>
              setReconciliationState({
                isOpen: true,
                partnerId: row.id,
                partnerType: 'supplier',
              })
            }
            className="px-2.5 py-1 border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#4B5563] text-[12px] font-semibold rounded-[8px] transition-colors flex items-center gap-1"
            title="Biên bản đối chiếu công nợ Mẫu 01-ĐCCN"
          >
            <Icon name="receipt_long" size={15} className="text-[#6D3EEB]" />
            <span>Đối chiếu</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenPaymentAllocation(row.id, undefined, 'out')}
            className="px-3 py-1 bg-[#F9F5FF] hover:bg-[#F3EBFE] text-[#6317D6] text-[12.5px] font-semibold rounded-[8px] transition-colors"
          >
            Thanh toán
          </button>
        </div>
      ),
    },
  ];

  // Handle Export Excel based on active debt tab
  const handleExportExcel = () => {
    if (currentTab === 'no-ncc') {
      const columns: ExportColumn<Supplier>[] = [
        { key: 'code', header: 'Mã NCC' },
        { key: 'name', header: 'Tên nhà cung cấp' },
        { key: 'phone', header: 'Số điện thoại', accessor: s => s.phone || '' },
        { key: 'open_docs_count', header: 'Số CT còn nợ', accessor: s => s.open_docs_count || 1 },
        { key: 'total_purchase', header: 'Tổng mua', accessor: s => s.total_purchase },
        { key: 'debt_amount', header: 'Còn nợ NCC', accessor: s => s.debt_amount },
        { key: 'overdue_amount', header: 'Quá hạn', accessor: s => s.overdue_amount || 0 },
      ];
      exportToExcelFile(filteredSupplierDebtors, columns, 'Cong_no_nha_cung_cap');
    } else if (currentTab === 'phai-thu') {
      const columns: ExportColumn<any>[] = [
        { key: 'code', header: 'Số hóa đơn' },
        { key: 'invoice_date', header: 'Ngày hóa đơn', accessor: i => i.invoice_date || i.order_date || '' },
        { key: 'customer_name', header: 'Khách hàng' },
        { key: 'total', header: 'Tổng tiền', accessor: i => i.total || i.total_amount },
        { key: 'paid_amount', header: 'Đã thanh toán', accessor: i => i.paid_amount },
        { key: 'debt_amount', header: 'Còn nợ', accessor: i => i.debt_amount },
        { key: 'due_date', header: 'Hạn thanh toán', accessor: i => i.due_date || '' },
        { key: 'isOverdue', header: 'Quá hạn', accessor: i => (i.isOverdue ? 'Quá hạn' : 'Trong hạn') },
      ];
      exportToExcelFile(openInvoices, columns, 'Chi_tiet_phai_thu');
    } else if (currentTab === 'phai-tra') {
      const columns: ExportColumn<any>[] = [
        { key: 'code', header: 'Số đơn mua' },
        { key: 'order_date', header: 'Ngày đơn mua', accessor: p => p.order_date || '' },
        { key: 'supplier_name', header: 'Nhà cung cấp' },
        { key: 'total', header: 'Tổng tiền', accessor: p => p.total || p.total_amount },
        { key: 'paid_amount', header: 'Đã thanh toán', accessor: p => p.paid_amount },
        { key: 'debt_amount', header: 'Còn nợ', accessor: p => p.debt_amount },
        { key: 'due_date', header: 'Hạn thanh toán', accessor: p => p.due_date || '' },
        { key: 'isOverdue', header: 'Quá hạn', accessor: p => (p.isOverdue ? 'Quá hạn' : 'Trong hạn') },
      ];
      exportToExcelFile(openPOs, columns, 'Chi_tiet_phai_tra');
    } else if (currentTab === 'tuoi-no') {
      const columns: ExportColumn<any>[] = [
        { key: 'code', header: agingPartnerType === 'customer' ? 'Mã KH' : 'Mã NCC' },
        { key: 'name', header: agingPartnerType === 'customer' ? 'Tên khách hàng' : 'Tên nhà cung cấp' },
        { key: 'phone', header: 'Số điện thoại' },
        { key: 'totalDebt', header: 'Tổng nợ' },
        { key: 'current', header: 'Trong hạn' },
        { key: 'days1to30', header: 'Quá hạn 1-30 ngày' },
        { key: 'days31to60', header: 'Quá hạn 31-60 ngày' },
        { key: 'days61to90', header: 'Quá hạn 61-90 ngày' },
        { key: 'over90', header: 'Quá hạn > 90 ngày' },
        {
          key: 'riskLevel',
          header: 'Mức rủi ro',
          accessor: r =>
            r.riskLevel === 'danger'
              ? 'Rủi ro cao'
              : r.riskLevel === 'warning'
              ? 'Cần chú ý'
              : 'An toàn',
        },
      ];
      exportToExcelFile(
        filteredAgingList,
        columns,
        `Phan_tich_tuoi_no_${agingPartnerType === 'customer' ? 'KH' : 'NCC'}`
      );
    } else if (currentTab === 'lich-su-thanh-toan') {
      const columns: ExportColumn<Payment>[] = [
        { key: 'code', header: 'Mã phiếu' },
        { key: 'payment_date', header: 'Ngày thanh toán', accessor: p => formatDate(p.payment_date) },
        { key: 'direction', header: 'Loại phiếu', accessor: p => (p.direction === 'in' ? 'Phiếu thu' : 'Phiếu chi') },
        { key: 'partner_name', header: 'Đối tác' },
        { key: 'amount', header: 'Số tiền', accessor: p => p.amount },
        { key: 'method', header: 'Hình thức', accessor: p => (p.method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản') },
        { key: 'status', header: 'Trạng thái', accessor: p => (p.status === 'active' ? 'Đã ghi sổ' : 'Đã hủy') },
      ];
      exportToExcelFile(payments, columns, 'Lich_su_thanh_toan_cong_no');
    } else {
      // Default: Khách hàng nợ / Tổng quan / Quá hạn
      const columns: ExportColumn<Customer>[] = [
        { key: 'code', header: 'Mã KH' },
        { key: 'name', header: 'Tên khách hàng' },
        { key: 'phone', header: 'Số điện thoại', accessor: c => c.phone || '' },
        { key: 'open_docs_count', header: 'Số CT còn nợ', accessor: c => c.open_docs_count || 1 },
        { key: 'total_purchase', header: 'Tổng mua', accessor: c => c.total_purchase },
        { key: 'debt_amount', header: 'Còn nợ', accessor: c => c.debt_amount },
        { key: 'overdue_amount', header: 'Quá hạn', accessor: c => c.overdue_amount || 0 },
        { key: 'earliest_due_date', header: 'Hạn sớm nhất', accessor: c => formatDate(c.earliest_due_date) },
      ];
      exportToExcelFile(filteredDebtors, columns, 'Cong_no_khach_hang');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Công nợ"
        subtitle="Tổng hợp công nợ phải thu khách hàng và phải trả nhà cung cấp"
        rightAction={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setReconciliationState({ isOpen: true })}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-[12px] border border-[#6D3EEB]/30 bg-[#F9F5FF] hover:bg-[#F3EBFE] text-[#6317D6] text-[13px] sm:text-[14px] font-semibold transition-all shadow-xs"
              title="Lập và in biên bản đối chiếu công nợ Mẫu 01-ĐCCN"
            >
              <Icon name="receipt_long" size={17} />
              <span>Đối chiếu công nợ</span>
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-[12px] border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#374151] text-[13px] sm:text-[14px] font-semibold transition-all shadow-xs active:scale-98"
              title="Xuất dữ liệu tab hiện tại ra file Excel (CSV UTF-8 BOM)"
            >
              <Icon name="download" size={17} className="text-[#6D3EEB]" />
              <span>Xuất Excel</span>
            </button>
          </div>
        }
      />

      <Tabs items={tabs} activeId={currentTab} onChange={onTabChange} />

      {/* Tab 1: Tổng quan công nợ */}
      {currentTab === 'tong-quan' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard
              label="Tổng phải thu"
              value={formatCurrency(totalReceivables)}
              icon="south_west"
              iconBg="bg-[#ECFDF5]"
              iconColor="text-[#059669]"
            />
            <KpiCard
              label="Tổng phải trả"
              value={formatCurrency(totalPayables)}
              icon="north_east"
              iconBg="bg-[#FFFBEB]"
              iconColor="text-[#D97706]"
            />
            <KpiCard
              label="Nợ quá hạn (thu+trả)"
              value={formatCurrency(totalOverdue)}
              icon="warning"
              iconBg="bg-[#FFF1F2]"
              iconColor="text-[#E11D48]"
            />
          </div>

          {/* 2 Side-by-side cards matching section 5.5.1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Debtors */}
            <div className="bg-white rounded-[16px] p-5 border border-[#F1F2F5] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-bold text-[#111827]">
                  Khách đang nợ nhiều nhất
                </h3>
                <button
                  type="button"
                  onClick={() => onTabChange('khach-hang-no')}
                  className="text-[12px] font-semibold text-[#6317D6] hover:underline"
                >
                  Xem tất cả ({debtors.length})
                </button>
              </div>

              <div className="space-y-2.5">
                {debtors.slice(0, 5).map((cust, idx) => (
                  <div
                    key={cust.id}
                    className="p-3.5 rounded-[12px] border border-[#F1F2F5] hover:border-[#E5E7EB] transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-[8px] bg-[#F9F5FF] text-[#6D3EEB] font-bold text-[12px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-semibold text-[#111827] text-[13.5px]">
                          {cust.name}
                        </div>
                        <div className="text-[12px] text-[#6B7280]">
                          1 chứng từ {cust.overdue_amount > 0 && (
                            <span className="text-[#E11D48] font-medium ml-1">
                              · quá hạn {formatCurrency(cust.overdue_amount)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-[#111827] text-[14px] tabular-nums block">
                        {formatCurrency(cust.debt_amount)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenPaymentAllocation(cust.id, undefined, 'in')}
                        className="text-[12px] text-[#6317D6] font-semibold hover:underline"
                      >
                        Thu nợ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Supplier Debtors */}
            <div className="bg-white rounded-[16px] p-5 border border-[#F1F2F5] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-bold text-[#111827]">
                  Nhà cung cấp đang phải trả
                </h3>
                <button
                  type="button"
                  onClick={() => onTabChange('no-ncc')}
                  className="text-[12px] font-semibold text-[#6317D6] hover:underline"
                >
                  Xem tất cả ({supplierDebtors.length})
                </button>
              </div>

              <div className="space-y-2.5">
                {supplierDebtors.length === 0 ? (
                  <div className="py-12 text-center text-[#9CA3AF] text-[13.5px]">
                    Không còn công nợ phải trả
                  </div>
                ) : (
                  supplierDebtors.map((sup, idx) => (
                    <div
                      key={sup.id}
                      className="p-3.5 rounded-[12px] border border-[#F1F2F5] hover:border-[#E5E7EB] transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-[8px] bg-[#FFFBEB] text-[#D97706] font-bold text-[12px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-[#111827] text-[13.5px]">
                            {sup.name}
                          </div>
                          <div className="text-[12px] text-[#6B7280]">1 chứng từ (PM010)</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-[#111827] text-[14px] tabular-nums block">
                          {formatCurrency(sup.debt_amount)}
                        </span>
                        <button
                          type="button"
                          onClick={() => onOpenPaymentAllocation(sup.id, undefined, 'out')}
                          className="text-[12px] text-[#6317D6] font-semibold hover:underline"
                        >
                          Thanh toán
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Cảnh báo rủi ro & Danh sách cần theo dõi đặc biệt */}
          <div className="bg-white rounded-[16px] p-5 border border-[#F1F2F5] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-[10px] bg-[#FFF1F2] text-[#E11D48] flex items-center justify-center">
                  <Icon name="warning" size={18} />
                </span>
                <div>
                  <h3 className="text-[15px] font-bold text-[#111827]">
                    Danh sách cảnh báo nợ rủi ro cao & Quá hạn lâu ngày
                  </h3>
                  <p className="text-[12px] text-[#6B7280]">
                    Các đối tác có khoản nợ quá hạn trên 30-90 ngày hoặc cần đôn đốc thanh toán gấp
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onTabChange('tuoi-no')}
                className="text-[12.5px] font-semibold text-[#6317D6] hover:underline flex items-center gap-1"
              >
                <span>Xem chi tiết Tuổi nợ</span>
                <Icon name="arrow_forward" size={15} />
              </button>
            </div>

            {riskWatchlist.length === 0 ? (
              <div className="py-6 text-center text-[#10B981] text-[13px] bg-[#ECFDF5] rounded-[12px] border border-[#A7F3D0]">
                ✓ Tuyệt vời! Không có khách hàng hay nhà cung cấp nào rơi vào nhóm nợ rủi ro cao (&gt; 30 ngày).
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {riskWatchlist.slice(0, 6).map(item => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-[12px] border transition-all ${
                      item.riskLevel === 'danger'
                        ? 'border-[#FECDD3] bg-[#FFF1F2]/40 hover:bg-[#FFF1F2]'
                        : 'border-[#FDE68A] bg-[#FFFBEB]/40 hover:bg-[#FFFBEB]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-[#111827] text-[13.5px] line-clamp-1">
                          {item.name}
                        </div>
                        <div className="text-[11.5px] font-mono text-[#6B7280]">{item.code}</div>
                      </div>
                      <span
                        className={`text-[10.5px] font-bold px-2 py-0.5 rounded-[6px] uppercase shrink-0 ${
                          item.riskLevel === 'danger'
                            ? 'bg-[#E11D48] text-white'
                            : 'bg-[#D97706] text-white'
                        }`}
                      >
                        {item.riskLevel === 'danger' ? 'RỦI RO CAO' : 'CHÚ Ý'}
                      </span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-black/5 flex items-center justify-between text-[12px]">
                      <span className="text-[#4B5563]">{item.reason}</span>
                      <span className="font-bold text-[#E11D48] tabular-nums">
                        {formatCurrency(item.totalDebt)}
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setReconciliationState({
                            isOpen: true,
                            partnerId: item.partnerId,
                            partnerType: item.type,
                          })
                        }
                        className="flex-1 py-1 px-2 rounded-[8px] bg-white border border-[#D1D5DB] text-[#374151] hover:bg-[#F3F4F6] text-[11.5px] font-semibold flex items-center justify-center gap-1 shadow-2xs"
                      >
                        <Icon name="receipt_long" size={14} className="text-[#6D3EEB]" />
                        <span>Đối chiếu</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onOpenPaymentAllocation(
                            item.partnerId,
                            undefined,
                            item.type === 'customer' ? 'in' : 'out'
                          )
                        }
                        className="flex-1 py-1 px-2 rounded-[8px] bg-[#6D3EEB] hover:bg-[#5B2BD6] text-white text-[11.5px] font-semibold flex items-center justify-center gap-1"
                      >
                        <span>{item.type === 'customer' ? 'Thu nợ' : 'Trả tiền'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Khách hàng nợ */}
      {currentTab === 'khach-hang-no' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard
              label="Số khách còn nợ"
              value={debtors.length}
              icon="groups"
              iconBg="bg-[#F3EBFE]"
              iconColor="text-[#6D3EEB]"
            />
            <KpiCard
              label="Tổng phải thu"
              value={formatCurrency(totalReceivables)}
              icon="south_west"
              iconBg="bg-[#ECFDF5]"
              iconColor="text-[#059669]"
            />
            <KpiCard
              label="Trong đó quá hạn"
              value={formatCurrency(overdueReceivables)}
              icon="warning"
              iconBg="bg-[#FFF1F2]"
              iconColor="text-[#E11D48]"
            />
          </div>

          <FilterToolbar
            searchPlaceholder="Tìm khách hàng nợ, SĐT, mã..."
            searchValue={search}
            onSearchChange={setSearch}
            filters={[
              {
                label: 'Nhóm khách',
                key: 'group',
                value: customerGroupFilter,
                items: [
                  { value: 'all', label: 'Nhóm: Tất cả' },
                  { value: 'Đại lý', label: 'Đại lý' },
                  { value: 'Doanh nghiệp', label: 'Doanh nghiệp' },
                  { value: 'Khách lẻ', label: 'Khách lẻ' },
                  { value: 'DỰ ÁN', label: 'Dự án' },
                ],
                onChange: setCustomerGroupFilter,
              },
              {
                label: 'Tình trạng nợ',
                key: 'overdue',
                value: customerOverdueFilter,
                items: [
                  { value: 'all', label: 'Tình trạng: Tất cả' },
                  { value: 'overdue', label: 'Có nợ quá hạn' },
                  { value: 'in_term', label: 'Nợ trong hạn' },
                ],
                onChange: setCustomerOverdueFilter,
              },
            ]}
            onClearFilters={() => {
              setSearch('');
              setCustomerGroupFilter('all');
              setCustomerOverdueFilter('all');
            }}
            primaryAction={{
              label: 'Thu tiền (phân bổ nhiều HĐ)',
              icon: 'account_balance_wallet',
              onClick: () => onOpenPaymentAllocation(),
            }}
          />

          <DataTable
            columns={debtorColumns}
            data={filteredDebtors}
            keyExtractor={row => row.id}
            emptyMessage="Không còn khách hàng nào nợ"
          />
        </div>
      )}

      {/* Tab 3: Nợ nhà cung cấp */}
      {currentTab === 'no-ncc' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard
              label="Số NCC còn nợ"
              value={supplierDebtors.length}
              icon="storefront"
              iconBg="bg-[#F3EBFE]"
              iconColor="text-[#6D3EEB]"
            />
            <KpiCard
              label="Tổng phải trả"
              value={formatCurrency(totalPayables)}
              icon="north_east"
              iconBg="bg-[#FFFBEB]"
              iconColor="text-[#D97706]"
            />
            <KpiCard
              label="Trong đó quá hạn"
              value={formatCurrency(overduePayables)}
              icon="warning"
              iconBg="bg-[#FFF1F2]"
              iconColor="text-[#E11D48]"
            />
          </div>

          <FilterToolbar
            searchPlaceholder="Tìm nhà cung cấp nợ, mã, SĐT..."
            searchValue={search}
            onSearchChange={setSearch}
            filters={[
              {
                label: 'Tình trạng nợ',
                key: 'overdue',
                value: supplierOverdueFilter,
                items: [
                  { value: 'all', label: 'Tình trạng: Tất cả' },
                  { value: 'overdue', label: 'Nợ quá hạn NCC' },
                  { value: 'in_term', label: 'Nợ trong hạn' },
                ],
                onChange: setSupplierOverdueFilter,
              },
            ]}
            onClearFilters={() => {
              setSearch('');
              setSupplierOverdueFilter('all');
            }}
            primaryAction={{
              label: 'Trả tiền (phân bổ nhiều phiếu)',
              icon: 'payments',
              onClick: () => onOpenPaymentAllocation(undefined, undefined, 'out'),
            }}
          />

          <DataTable
            columns={supplierDebtorColumns}
            data={filteredSupplierDebtors}
            keyExtractor={row => row.id}
            emptyMessage="Không còn nợ nhà cung cấp nào"
          />
        </div>
      )}

      {/* Tab 3.5: Tuổi nợ (Aging) */}
      {currentTab === 'tuoi-no' && (
        <div className="space-y-6">
          {/* Header Switcher & Aging Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-[17px] font-bold text-[#111827]">
                Báo cáo Phân loại Tuổi nợ (Aging Schedule)
              </h3>
              <p className="text-[13px] text-[#6B7280]">
                Phân bổ công nợ theo các mốc thời gian quá hạn để lập kế hoạch thu hồi và trích lập rủi ro
              </p>
            </div>

            {/* Switch Partner Type */}
            <div className="inline-flex p-1 rounded-[12px] bg-[#F1F2F5] shrink-0">
              <button
                type="button"
                onClick={() => setAgingPartnerType('customer')}
                className={`px-3.5 py-1.5 rounded-[9px] text-[13px] font-semibold transition-all ${
                  agingPartnerType === 'customer'
                    ? 'bg-white text-[#6D3EEB] shadow-xs'
                    : 'text-[#4B5563] hover:text-[#111827]'
                }`}
              >
                Khách hàng phải thu
              </button>
              <button
                type="button"
                onClick={() => setAgingPartnerType('supplier')}
                className={`px-3.5 py-1.5 rounded-[9px] text-[13px] font-semibold transition-all ${
                  agingPartnerType === 'supplier'
                    ? 'bg-white text-[#6D3EEB] shadow-xs'
                    : 'text-[#4B5563] hover:text-[#111827]'
                }`}
              >
                Nhà cung cấp phải trả
              </button>
            </div>
          </div>

          {/* 4 KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label={agingPartnerType === 'customer' ? 'Tổng phải thu' : 'Tổng phải trả'}
              value={formatCurrency(agingTotals.total)}
              icon="account_balance_wallet"
              iconBg="bg-[#F3EBFE]"
              iconColor="text-[#6D3EEB]"
            />
            <KpiCard
              label="Trong hạn (An toàn)"
              value={formatCurrency(agingTotals.current)}
              icon="verified"
              iconBg="bg-[#ECFDF5]"
              iconColor="text-[#059669]"
              trend={{
                value: `${Math.round((agingTotals.current / (agingTotals.total || 1)) * 100)}% tổng nợ`,
                isUp: true,
              }}
            />
            <KpiCard
              label="Quá hạn 1 - 60 ngày"
              value={formatCurrency(agingTotals.days1to30 + agingTotals.days31to60)}
              icon="schedule"
              iconBg="bg-[#FFFBEB]"
              iconColor="text-[#D97706]"
              trend={{
                value: `${Math.round(((agingTotals.days1to30 + agingTotals.days31to60) / (agingTotals.total || 1)) * 100)}% tổng nợ`,
                isUp: false,
              }}
            />
            <KpiCard
              label="Quá hạn > 60 ngày (Rủi ro)"
              value={formatCurrency(agingTotals.days61to90 + agingTotals.over90)}
              icon="warning"
              iconBg="bg-[#FFF1F2]"
              iconColor="text-[#E11D48]"
              trend={{
                value: `${Math.round(((agingTotals.days61to90 + agingTotals.over90) / (agingTotals.total || 1)) * 100)}% nợ xấu`,
                isUp: false,
              }}
            />
          </div>

          {/* Aging Distribution Chart */}
          <div className="bg-white rounded-[16px] p-5 border border-[#F1F2F5] shadow-sm">
            <h4 className="text-[15px] font-bold text-[#111827] mb-1">
              Phân bổ số dư theo kỳ hạn nợ
            </h4>
            <p className="text-[12.5px] text-[#6B7280] mb-4">
              Cơ cấu các khoản nợ theo từng phân khúc tuổi nợ
            </p>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agingChartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                  <Bar dataKey="amount" name="Số tiền nợ" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Filter Toolbar */}
          <FilterToolbar
            searchPlaceholder={agingPartnerType === 'customer' ? 'Tìm khách hàng theo mã, tên...' : 'Tìm nhà cung cấp...'}
            searchValue={search}
            onSearchChange={setSearch}
            filters={[
              {
                label: 'Mức rủi ro',
                key: 'risk',
                value: agingRiskFilter,
                items: [
                  { value: 'all', label: 'Rủi ro: Tất cả' },
                  { value: 'safe', label: '🟢 An toàn (Trong hạn)' },
                  { value: 'warning', label: '🟡 Cần chú ý (1-60 ngày)' },
                  { value: 'danger', label: '🔴 Rủi ro cao (> 60 ngày)' },
                ],
                onChange: (v: any) => setAgingRiskFilter(v),
              },
            ]}
            onClearFilters={() => {
              setSearch('');
              setAgingRiskFilter('all');
            }}
            onExportExcel={handleExportExcel}
          />

          {/* Aging Matrix Table */}
          <DataTable
            columns={[
              {
                key: 'partner',
                header: agingPartnerType === 'customer' ? 'KHÁCH HÀNG' : 'NHÀ CUNG CẤP',
                render: row => (
                  <div>
                    <div className="font-semibold text-[#111827]">{row.name}</div>
                    <div className="text-[11.5px] text-[#6B7280] font-mono mt-0.5">
                      {row.code} {row.phone && `· ${row.phone}`}
                    </div>
                  </div>
                ),
              },
              {
                key: 'total',
                header: 'TỔNG NỢ',
                align: 'right',
                render: row => (
                  <span className="font-bold text-[#111827] tabular-nums">
                    {formatCurrency(row.totalDebt)}
                  </span>
                ),
              },
              {
                key: 'current',
                header: 'TRONG HẠN',
                align: 'right',
                render: row => (
                  <span className="text-[#059669] font-medium tabular-nums">
                    {row.current > 0 ? formatCurrency(row.current) : '—'}
                  </span>
                ),
              },
              {
                key: 'days1to30',
                header: '1 - 30 NGÀY',
                align: 'right',
                render: row => (
                  <span className="text-[#D97706] tabular-nums">
                    {row.days1to30 > 0 ? formatCurrency(row.days1to30) : '—'}
                  </span>
                ),
              },
              {
                key: 'days31to60',
                header: '31 - 60 NGÀY',
                align: 'right',
                render: row => (
                  <span className="text-[#EA580C] font-medium tabular-nums">
                    {row.days31to60 > 0 ? formatCurrency(row.days31to60) : '—'}
                  </span>
                ),
              },
              {
                key: 'days61to90',
                header: '61 - 90 NGÀY',
                align: 'right',
                render: row => (
                  <span className="text-[#E11D48] font-bold tabular-nums">
                    {row.days61to90 > 0 ? formatCurrency(row.days61to90) : '—'}
                  </span>
                ),
              },
              {
                key: 'over90',
                header: '> 90 NGÀY',
                align: 'right',
                render: row => (
                  <span className="text-[#991B1B] font-black tabular-nums">
                    {row.over90 > 0 ? formatCurrency(row.over90) : '—'}
                  </span>
                ),
              },
              {
                key: 'risk',
                header: 'ĐÁNH GIÁ',
                align: 'center',
                render: row => (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-[6px] text-[11px] font-bold ${
                      row.riskLevel === 'danger'
                        ? 'bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3]'
                        : row.riskLevel === 'warning'
                        ? 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]'
                        : 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'
                    }`}
                  >
                    {row.riskLevel === 'danger'
                      ? '🔴 Rủi ro cao'
                      : row.riskLevel === 'warning'
                      ? '🟡 Cần đôn đốc'
                      : '🟢 An toàn'}
                  </span>
                ),
              },
              {
                key: 'actions',
                header: '',
                align: 'right',
                render: row => (
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setReconciliationState({
                          isOpen: true,
                          partnerId: row.id,
                          partnerType: agingPartnerType,
                        })
                      }
                      className="px-2.5 py-1 border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#4B5563] text-[12px] font-semibold rounded-[8px] transition-colors flex items-center gap-1"
                      title="Biên bản đối chiếu công nợ Mẫu 01-ĐCCN"
                    >
                      <Icon name="receipt_long" size={15} className="text-[#6D3EEB]" />
                      <span>Đối chiếu</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onOpenPaymentAllocation(
                          row.id,
                          undefined,
                          agingPartnerType === 'customer' ? 'in' : 'out'
                        )
                      }
                      className="px-3 py-1 bg-[#F9F5FF] hover:bg-[#F3EBFE] text-[#6317D6] text-[12.5px] font-semibold rounded-[8px] transition-colors"
                    >
                      {agingPartnerType === 'customer' ? 'Thu nợ' : 'Thanh toán'}
                    </button>
                  </div>
                ),
              },
            ]}
            data={filteredAgingList}
            keyExtractor={row => row.id}
            emptyMessage="Không có dữ liệu tuổi nợ"
          />
        </div>
      )}

      {/* Tab 4: Chi tiết phải thu */}
      {currentTab === 'phai-thu' && (
        <div className="space-y-4">
          <FilterToolbar
            searchPlaceholder="Tìm hóa đơn, khách hàng..."
            searchValue={search}
            onSearchChange={setSearch}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            filters={[
              {
                label: 'Khách hàng',
                key: 'customer',
                value: partnerFilter,
                items: customerFilterOptions,
                onChange: setPartnerFilter,
              },
              {
                label: 'Thời hạn',
                key: 'term',
                value: debtTermFilter,
                items: [
                  { value: 'all', label: 'Thời hạn: Tất cả' },
                  { value: 'in_term', label: 'Trong hạn' },
                  { value: 'overdue', label: 'Quá hạn' },
                ],
                onChange: setDebtTermFilter,
              },
            ]}
            onClearFilters={() => {
              setSearch('');
              setPartnerFilter('all');
              setDebtTermFilter('all');
              setDateRange({ from: null, to: null });
            }}
            primaryAction={{
              label: 'Thu tiền (phân bổ nhiều HĐ)',
              icon: 'account_balance_wallet',
              onClick: () => onOpenPaymentAllocation(),
            }}
          />

          <DataTable
            columns={[
              {
                key: 'code',
                header: 'MÃ HĐ',
                render: row => <span className="font-semibold">{row.code}</span>,
              },
              {
                key: 'customer',
                header: 'KHÁCH HÀNG',
                render: row => <span>{row.customer_name}</span>,
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
                key: 'due',
                header: 'HẠN',
                render: row => (
                  <span className={row.isOverdue ? 'text-rose-600 font-bold' : ''}>
                    {formatDate(row.due_date)}
                  </span>
                ),
              },
              {
                key: 'state',
                header: 'TÌNH TRẠNG',
                align: 'center',
                render: row => (
                  <StatusBadge status={row.isOverdue ? 'overdue' : 'in_term'} />
                ),
              },
              {
                key: 'actions',
                header: '',
                align: 'right',
                render: row => (
                  <button
                    type="button"
                    onClick={() => onOpenPaymentAllocation(row.customer_id, row.id, 'in')}
                    className="px-3 py-1 bg-[#F9F5FF] text-[#6317D6] font-semibold text-[12.5px] rounded-[8px]"
                  >
                    Thu nợ
                  </button>
                ),
              },
            ]}
            data={openInvoices}
            keyExtractor={row => row.id}
            emptyMessage="Không có chứng từ phải thu nào"
          />
        </div>
      )}

      {/* Tab 5: Chi tiết phải trả */}
      {currentTab === 'phai-tra' && (
        <div className="space-y-4">
          <FilterToolbar
            searchPlaceholder="Tìm phiếu mua, NCC..."
            searchValue={search}
            onSearchChange={setSearch}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            filters={[
              {
                label: 'Nhà cung cấp',
                key: 'supplier',
                value: partnerFilter,
                items: supplierFilterOptions,
                onChange: setPartnerFilter,
              },
              {
                label: 'Thời hạn',
                key: 'term',
                value: debtTermFilter,
                items: [
                  { value: 'all', label: 'Thời hạn: Tất cả' },
                  { value: 'in_term', label: 'Trong hạn' },
                  { value: 'overdue', label: 'Quá hạn' },
                ],
                onChange: setDebtTermFilter,
              },
            ]}
            onClearFilters={() => {
              setSearch('');
              setPartnerFilter('all');
              setDebtTermFilter('all');
              setDateRange({ from: null, to: null });
            }}
            primaryAction={{
              label: 'Trả tiền (phân bổ nhiều phiếu)',
              icon: 'payments',
              onClick: () => onOpenPaymentAllocation(undefined, undefined, 'out'),
            }}
          />

          <DataTable
            columns={[
              {
                key: 'code',
                header: 'MÃ PHIẾU',
                render: row => <span className="font-semibold">{row.code}</span>,
              },
              {
                key: 'supplier',
                header: 'NCC',
                render: row => <span>{row.supplier_name}</span>,
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
                key: 'due',
                header: 'HẠN',
                render: row => <span>{formatDate(row.due_date)}</span>,
              },
              {
                key: 'state',
                header: 'TÌNH TRẠNG',
                align: 'center',
                render: row => (
                  <StatusBadge status={row.isOverdue ? 'overdue' : 'in_term'} />
                ),
              },
              {
                key: 'actions',
                header: '',
                align: 'right',
                render: row => (
                  <button
                    type="button"
                    onClick={() => onOpenPaymentAllocation(row.supplier_id, row.id, 'out')}
                    className="px-3 py-1 bg-[#F9F5FF] text-[#6317D6] font-semibold text-[12.5px] rounded-[8px]"
                  >
                    Trả tiền
                  </button>
                ),
              },
            ]}
            data={openPOs}
            keyExtractor={row => row.id}
            emptyMessage="Không còn công nợ phải trả"
          />
        </div>
      )}

      {/* Tab 6: Dòng tiền 30 ngày */}
      {currentTab === 'dong-tien' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard
              label="Dự kiến thu (30 ngày)"
              value={formatCurrency(totalExpectedIn)}
              icon="south_west"
              iconBg="bg-[#ECFDF5]"
              iconColor="text-[#059669]"
            />
            <KpiCard
              label="Dự kiến chi (30 ngày)"
              value={formatCurrency(totalExpectedOut)}
              icon="north_east"
              iconBg="bg-[#FFFBEB]"
              iconColor="text-[#D97706]"
            />
            <KpiCard
              label="Dòng tiền ròng"
              value={formatCurrency(netCashflow)}
              icon="trending_up"
              iconBg="bg-[#F3EBFE]"
              iconColor="text-[#6D3EEB]"
            />
          </div>

          <div className="bg-white rounded-[16px] p-5 border border-[#F1F2F5] shadow-sm">
            <h3 className="text-[16px] font-bold text-[#111827] mb-1">
              Dòng tiền dự kiến theo kỳ
            </h3>
            <p className="text-[13px] text-[#6B7280] mb-4">
              Chia 5 bucket kỳ hạn công nợ (Quá hạn, 0-7 ngày, 8-14 ngày, 15-21 ngày, 22-30 ngày)
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashflowBuckets} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <XAxis dataKey="period" tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                  <Legend verticalAlign="top" align="right" />
                  <Bar dataKey="inAmount" name="Dự kiến thu" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="outAmount" name="Dự kiến chi" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Lịch sử thanh toán */}
      {currentTab === 'lich-su-thanh-toan' && (
        <div className="space-y-4">
          <FilterToolbar
            searchPlaceholder="Tìm thanh toán, đối tượng, mã phiếu..."
            searchValue={search}
            onSearchChange={setSearch}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            filters={[
              {
                label: 'Hướng dòng tiền',
                key: 'direction',
                value: filterDirection,
                items: [
                  { value: 'all', label: 'Hướng: Tất cả' },
                  { value: 'in', label: 'Thu tiền' },
                  { value: 'out', label: 'Chi tiền' },
                ],
                onChange: setFilterDirection,
              },
              {
                label: 'Phương thức',
                key: 'method',
                value: paymentMethodFilter,
                items: [
                  { value: 'all', label: 'Phương thức: Tất cả' },
                  { value: 'transfer', label: 'Chuyển khoản' },
                  { value: 'cash', label: 'Tiền mặt' },
                  { value: 'offset', label: 'Đối trừ' },
                ],
                onChange: setPaymentMethodFilter,
              },
            ]}
            onClearFilters={() => {
              setSearch('');
              setFilterDirection('all');
              setPaymentMethodFilter('all');
              setDateRange({ from: null, to: null });
            }}
          />

          <DataTable
            columns={[
              {
                key: 'code',
                header: 'MÃ',
                render: row => <span className="font-semibold text-[#111827]">{row.code}</span>,
              },
              {
                key: 'date',
                header: 'NGÀY',
                render: row => <span className="text-[#4B5563]">{formatDate(row.payment_date)}</span>,
              },
              {
                key: 'partner',
                header: 'ĐỐI TƯỢNG',
                render: row => <span className="font-semibold">{row.partner_name}</span>,
              },
              {
                key: 'docs',
                header: 'CHỨNG TỪ',
                render: row => {
                  const allocs = row.allocations || [];
                  if (allocs.length === 0) return <span>—</span>;
                  if (allocs.length === 1) {
                    return <span className="font-mono text-[#6D3EEB]">{allocs[0].doc_code}</span>;
                  }
                  return (
                    <span className="font-medium text-[#6D3EEB]">
                      {allocs.length} chứng từ
                    </span>
                  );
                },
              },
              {
                key: 'direction',
                header: 'HƯỚNG',
                align: 'center',
                render: row => <StatusBadge status={row.direction === 'in' ? 'in' : 'out_dir'} />,
              },
              {
                key: 'amount',
                header: 'SỐ TIỀN',
                align: 'right',
                render: row => (
                  <span
                    className={`font-bold tabular-nums ${
                      row.direction === 'in' ? 'text-[#059669]' : 'text-[#E11D48]'
                    }`}
                  >
                    {row.direction === 'in' ? '+' : '-'}
                    {formatCurrency(row.amount)}
                  </span>
                ),
              },
              {
                key: 'method',
                header: 'PHƯƠNG THỨC',
                render: row => (
                  <span>
                    {row.method === 'transfer'
                      ? 'Chuyển khoản'
                      : row.method === 'cash'
                      ? 'Tiền mặt'
                      : 'Đối trừ'}
                  </span>
                ),
              },
            ]}
            data={payments.filter(p => {
              const matchDirection = filterDirection === 'all' || p.direction === filterDirection;
              const matchMethod = paymentMethodFilter === 'all' || p.method === paymentMethodFilter;
              const matchSearch =
                p.code.toLowerCase().includes(search.toLowerCase()) ||
                p.partner_name.toLowerCase().includes(search.toLowerCase());
              let matchDate = true;
              if (dateRange.from && p.payment_date < dateRange.from) matchDate = false;
              if (dateRange.to && p.payment_date > dateRange.to) matchDate = false;
              return matchDirection && matchMethod && matchSearch && matchDate;
            })}
            keyExtractor={row => row.id}
            emptyMessage="Chưa có giao dịch thanh toán nào"
          />
        </div>
      )}

      {/* Tab 8: Quá hạn */}
      {currentTab === 'qua-han' && (
        <div className="space-y-4">
          <FilterToolbar
            searchPlaceholder="Tìm chứng từ quá hạn, đối tác..."
            searchValue={search}
            onSearchChange={setSearch}
            filters={[
              {
                label: 'Loại công nợ',
                key: 'type',
                value: overdueTypeFilter,
                items: [
                  { value: 'all', label: 'Loại: Tất cả' },
                  { value: 'receivable', label: 'Phải thu (Khách nợ)' },
                  { value: 'payable', label: 'Phải trả (Nợ NCC)' },
                ],
                onChange: setOverdueTypeFilter,
              },
              {
                label: 'Mức độ trễ',
                key: 'days_late',
                value: overdueDaysFilter,
                items: [
                  { value: 'all', label: 'Trễ hạn: Tất cả' },
                  { value: '1-30', label: 'Trễ 1 - 30 ngày' },
                  { value: '31-60', label: 'Trễ 31 - 60 ngày' },
                  { value: 'over60', label: 'Trễ trên 60 ngày' },
                ],
                onChange: setOverdueDaysFilter,
              },
            ]}
            onClearFilters={() => {
              setSearch('');
              setOverdueTypeFilter('all');
              setOverdueDaysFilter('all');
            }}
          />

          <DataTable
            columns={[
              {
                key: 'type',
                header: 'LOẠI',
                render: row => (
                  <StatusBadge status={row.type === 'receivable' ? 'receivable' : 'payable'} />
                ),
              },
              {
                key: 'code',
                header: 'CHỨNG TỪ',
                render: row => <span className="font-semibold text-[#111827]">{row.code}</span>,
              },
              {
                key: 'partner',
                header: 'ĐỐI TƯỢNG',
                render: row => <span>{row.partner_name}</span>,
              },
              {
                key: 'amount',
                header: 'SỐ TIỀN',
                align: 'right',
                render: row => (
                  <span className="font-bold text-[#E11D48] tabular-nums">
                    {formatCurrency(row.amount)}
                  </span>
                ),
              },
              {
                key: 'due',
                header: 'HẠN',
                render: row => <span className="text-[#E11D48] font-bold">{formatDate(row.due_date)}</span>,
              },
              {
                key: 'days',
                header: 'SỐ NGÀY TRỄ',
                align: 'center',
                render: row => (
                  <span className="text-[#E11D48] font-bold">trễ {row.days_late} ngày</span>
                ),
              },
              {
                key: 'actions',
                header: '',
                align: 'right',
                render: row => (
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setReconciliationState({
                          isOpen: true,
                          partnerId: row.partner_id,
                          partnerType: row.type === 'receivable' ? 'customer' : 'supplier',
                        })
                      }
                      className="px-2.5 py-1 border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#4B5563] text-[12px] font-semibold rounded-[8px] transition-colors flex items-center gap-1"
                      title="Biên bản đối chiếu công nợ Mẫu 01-ĐCCN"
                    >
                      <Icon name="receipt_long" size={15} className="text-[#6D3EEB]" />
                      <span>Đối chiếu</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onOpenPaymentAllocation(
                          row.partner_id,
                          row.id,
                          row.type === 'receivable' ? 'in' : 'out'
                        )
                      }
                      className="px-3 py-1 bg-[#F9F5FF] text-[#6317D6] font-semibold text-[12.5px] rounded-[8px]"
                    >
                      {row.type === 'receivable' ? 'Thu nợ' : 'Trả tiền'}
                    </button>
                  </div>
                ),
              },
            ]}
            data={overdueItems}
            keyExtractor={row => `${row.type}-${row.id}`}
            emptyMessage="Không có công nợ quá hạn nào"
          />
        </div>
      )}

      {/* Debt Reconciliation Modal */}
      <DebtReconciliationModal
        isOpen={reconciliationState.isOpen}
        onClose={() => setReconciliationState(prev => ({ ...prev, isOpen: false }))}
        initialPartnerId={reconciliationState.partnerId}
        initialPartnerType={reconciliationState.partnerType}
      />
    </div>
  );
};
