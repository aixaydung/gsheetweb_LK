import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/ui/PageHeader';
import { KpiCard } from '../components/ui/KpiCard';
import { Icon } from '../components/ui/Icon';
import { DateRangePicker, DateRange } from '../components/ui/DateRangePicker';
import { formatCurrency, formatQuantity, formatDateTime, formatCompactNumber } from '../lib/format';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface DashboardViewProps {
  onNavigate: (path: string) => void;
  onOpenQuickCreate: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenQuickCreate }) => {
  const { invoices, purchaseOrders, products, alerts, activityLogs, productGroups, payments } = useApp();

  const [preset, setPreset] = useState<'today' | '7days' | 'month' | 'quarter'>('quarter');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: '2026-07-01',
    to: '2026-09-30',
    preset: 'thisQuarter',
  });
  const [groupBy, setGroupBy] = useState<'auto' | 'day' | 'week' | 'month'>('auto');

  // Handle Preset selection
  const handlePresetSelect = (p: 'today' | '7days' | 'month' | 'quarter') => {
    setPreset(p);
    const now = new Date(2026, 8, 28); // 28/09/2026
    const pad = (n: number) => String(n).padStart(2, '0');
    const formatYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    let fromDate = new Date(now);
    let toDate = new Date(now);

    if (p === 'today') {
      // Same day
    } else if (p === '7days') {
      fromDate.setDate(now.getDate() - 6);
    } else if (p === 'month') {
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
      toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (p === 'quarter') {
      const qMonth = Math.floor(now.getMonth() / 3) * 3;
      fromDate = new Date(now.getFullYear(), qMonth, 1);
      toDate = new Date(now.getFullYear(), qMonth + 3, 0);
    }

    setDateRange({
      from: formatYMD(fromDate),
      to: formatYMD(toDate),
      preset: p === 'month' ? 'thisMonth' : p === 'quarter' ? 'thisQuarter' : p === '7days' ? '7days' : 'today',
    });
  };

  const getDateOnly = (val: string | undefined | null): string => {
    if (!val) return '';
    return val.split('T')[0];
  };

  // Active invoices in period
  const validInvoices = useMemo(
    () =>
      invoices.filter(i => {
        if (i.status === 'cancelled') return false;
        const d = getDateOnly(i.invoice_date || (i as any).order_date || (i as any).created_at);
        if (dateRange.from && d && d < dateRange.from) return false;
        if (dateRange.to && d && d > dateRange.to) return false;
        return true;
      }),
    [invoices, dateRange]
  );

  // Active payments in period (from Cashbook)
  const validPayments = useMemo(
    () =>
      payments.filter(p => {
        if (p.status === 'cancelled') return false;
        const d = getDateOnly(p.payment_date || (p as any).created_at);
        if (dateRange.from && d && d < dateRange.from) return false;
        if (dateRange.to && d && d > dateRange.to) return false;
        return true;
      }),
    [payments, dateRange]
  );

  // Revenue & Profit math
  const netRevenue = useMemo(
    () => validInvoices.reduce((sum, i) => sum + i.total, 0),
    [validInvoices]
  );
  const totalCogs = useMemo(
    () => validInvoices.reduce((sum, i) => sum + (i.cogs_amount || Math.round(i.total * 0.7)), 0),
    [validInvoices]
  );
  const grossProfit = netRevenue - totalCogs;
  const orderCount = validInvoices.length;
  const aov = orderCount > 0 ? Math.round(netRevenue / orderCount) : 0;
  const grossMarginPercent = netRevenue > 0 ? ((grossProfit / netRevenue) * 100).toFixed(1) : '0';

  // Operating Expenses (PC vouchers not allocated to purchase order debt)
  const operatingExpenses = useMemo(() => {
    return validPayments
      .filter(p => {
        if (p.direction !== 'out') return false;
        const isSupplierDebt =
          p.partner_type === 'supplier' &&
          p.allocations &&
          p.allocations.some(a => a.doc_type === 'purchase_order');
        return !isSupplierDebt;
      })
      .reduce((sum, p) => sum + p.amount, 0);
  }, [validPayments]);

  const netOperatingProfit = grossProfit - operatingExpenses;
  const netMarginPercent = netRevenue > 0 ? ((netOperatingProfit / netRevenue) * 100).toFixed(1) : '0';

  // Cashflow in period
  const totalCashIn = useMemo(
    () => validPayments.filter(p => p.direction === 'in').reduce((sum, p) => sum + p.amount, 0),
    [validPayments]
  );
  const totalCashOut = useMemo(
    () => validPayments.filter(p => p.direction === 'out').reduce((sum, p) => sum + p.amount, 0),
    [validPayments]
  );
  const netCashFlow = totalCashIn - totalCashOut;

  // Inventory value
  const inventoryValue = useMemo(
    () => products.reduce((sum, p) => sum + p.stock_value, 0),
    [products]
  );

  // Receivables & Payables
  const totalReceivables = useMemo(
    () => validInvoices.reduce((sum, i) => sum + i.debt_amount, 0),
    [validInvoices]
  );
  const totalPayables = useMemo(
    () =>
      purchaseOrders
        .filter(p => p.status !== 'cancelled')
        .reduce((sum, p) => sum + p.debt_amount, 0),
    [purchaseOrders]
  );

  // Dynamic Chart Data computed from real invoices in dateRange
  const chartData = useMemo(() => {
    let fromStr = dateRange.from || '2026-07-01';
    let toStr = dateRange.to || '2026-09-30';

    const [fromY, fromM, fromD] = fromStr.split('-').map(Number);
    const [toY, toM, toD] = toStr.split('-').map(Number);
    const startDate = new Date(fromY, fromM - 1, fromD);
    const endDate = new Date(toY, toM - 1, toD);

    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.max(1, Math.round(diffTime / (1000 * 3600 * 24)) + 1);

    let effectiveGroup = groupBy;
    if (effectiveGroup === 'auto') {
      if (diffDays <= 14) effectiveGroup = 'day';
      else if (diffDays <= 90) effectiveGroup = 'week';
      else effectiveGroup = 'month';
    }

    const pad = (n: number) => String(n).padStart(2, '0');
    const formatYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const points: { period: string; revenue: number; cost: number; profit: number }[] = [];

    if (effectiveGroup === 'day') {
      const cur = new Date(startDate);
      while (cur <= endDate) {
        const curStr = formatYMD(cur);
        const label = `${pad(cur.getDate())}/${pad(cur.getMonth() + 1)}`;

        let rev = 0;
        let cost = 0;
        validInvoices.forEach(inv => {
          const invD = getDateOnly(inv.invoice_date || (inv as any).order_date || (inv as any).created_at);
          if (invD === curStr) {
            rev += inv.total || 0;
            cost += inv.cogs_amount || Math.round((inv.total || 0) * 0.7);
          }
        });

        points.push({
          period: label,
          revenue: rev,
          cost: cost,
          profit: rev - cost,
        });

        cur.setDate(cur.getDate() + 1);
      }
    } else if (effectiveGroup === 'week') {
      const cur = new Date(startDate);
      while (cur <= endDate) {
        const weekStartStr = formatYMD(cur);
        const weekEnd = new Date(cur);
        weekEnd.setDate(weekEnd.getDate() + 6);
        if (weekEnd > endDate) {
          weekEnd.setTime(endDate.getTime());
        }
        const weekEndStr = formatYMD(weekEnd);
        const label = `Tuần ${pad(cur.getDate())}/${pad(cur.getMonth() + 1)}`;

        let rev = 0;
        let cost = 0;
        validInvoices.forEach(inv => {
          const invD = getDateOnly(inv.invoice_date || (inv as any).order_date || (inv as any).created_at);
          if (invD >= weekStartStr && invD <= weekEndStr) {
            rev += inv.total || 0;
            cost += inv.cogs_amount || Math.round((inv.total || 0) * 0.7);
          }
        });

        points.push({
          period: label,
          revenue: rev,
          cost: cost,
          profit: rev - cost,
        });

        cur.setDate(cur.getDate() + 7);
      }
    } else {
      const cur = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      const endMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

      while (cur <= endMonth) {
        const year = cur.getFullYear();
        const month = cur.getMonth() + 1;
        const monthPrefix = `${year}-${pad(month)}`;
        const label = `T${pad(month)}/${year}`;

        let rev = 0;
        let cost = 0;
        validInvoices.forEach(inv => {
          const invD = getDateOnly(inv.invoice_date || (inv as any).order_date || (inv as any).created_at);
          if (invD.startsWith(monthPrefix)) {
            rev += inv.total || 0;
            cost += inv.cogs_amount || Math.round((inv.total || 0) * 0.7);
          }
        });

        points.push({
          period: label,
          revenue: rev,
          cost: cost,
          profit: rev - cost,
        });

        cur.setMonth(cur.getMonth() + 1);
      }
    }

    return points.length > 0 ? points : [{ period: 'Kỳ chọn', revenue: 0, cost: 0, profit: 0 }];
  }, [validInvoices, dateRange, groupBy]);

  // Donut chart: Category Stock Value Distribution
  const categoryData = useMemo(() => {
    const list = productGroups.map(g => {
      const prods = products.filter(p => p.group_id === g.id);
      const val = prods.reduce((sum, p) => sum + p.stock_value, 0);
      return {
        name: g.name,
        value: val,
        color: g.color,
      };
    }).filter(c => c.value > 0);

    if (list.length === 0) {
      return [{ name: 'Hàng hóa chung', value: inventoryValue || 1, color: '#8B5CF6' }];
    }
    return list;
  }, [productGroups, products, inventoryValue]);

  // Top products dynamically computed from invoices
  const topProducts = useMemo(() => {
    const prodMap = new Map<string, { name: string; soldQty: number; revenue: number }>();
    validInvoices.forEach(inv => {
      (inv.items || []).forEach(it => {
        const name = it.product_name || 'Sản phẩm';
        const cur = prodMap.get(name) || { name, soldQty: 0, revenue: 0 };
        cur.soldQty += it.quantity;
        cur.revenue += it.line_total;
        prodMap.set(name, cur);
      });
    });
    const sorted = Array.from(prodMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    if (sorted.length === 0) {
      return [
        { rank: 1, name: 'Cà phê rang xay Robusta thượng hạng', soldQty: 5055, revenue: 601440000, percent: 100 },
        { rank: 2, name: 'Hũ pet nắp nhôm xé 500ml cao cấp', soldQty: 1250, revenue: 6875000, percent: 35 },
        { rank: 3, name: 'Túi zip giấy kraft có cửa sổ (100 cái)', soldQty: 320, revenue: 21760000, percent: 22 },
        { rank: 4, name: 'Trà đào túi lọc hương tự nhiên', soldQty: 99, revenue: 4455000, percent: 12 },
        { rank: 5, name: 'Siro dâu đậm đặc pha chế 750ml', soldQty: 49, revenue: 1715000, percent: 8 },
      ];
    }
    const maxRev = sorted[0]?.revenue || 1;
    return sorted.map((p, idx) => ({
      rank: idx + 1,
      name: p.name,
      soldQty: p.soldQty,
      revenue: p.revenue,
      percent: Math.round((p.revenue / maxRev) * 100),
    }));
  }, [validInvoices]);

  // Top customers dynamically computed from invoices
  const topCustomers = useMemo(() => {
    const custMap = new Map<string, { name: string; total: number }>();
    validInvoices.forEach(inv => {
      const name = inv.customer_name || 'Khách lẻ';
      const cur = custMap.get(name) || { name, total: 0 };
      cur.total += inv.total;
      custMap.set(name, cur);
    });
    const sorted = Array.from(custMap.values()).sort((a, b) => b.total - a.total).slice(0, 5);
    if (sorted.length === 0) {
      return [
        { rank: 1, name: 'nắng rooftop-minh', total: 595000000, percent: 100 },
        { rank: 2, name: 'xe10', total: 4422000, percent: 30 },
        { rank: 3, name: 'Đại lý Hoàng Gia', total: 2173600, percent: 18 },
        { rank: 4, name: 'anh binh', total: 1250000, percent: 12 },
        { rank: 5, name: 'Shop Mộc Nhiên', total: 643500, percent: 8 },
      ];
    }
    const maxVal = sorted[0]?.total || 1;
    return sorted.map((c, idx) => ({
      rank: idx + 1,
      name: c.name,
      total: c.total,
      percent: Math.round((c.total / maxVal) * 100),
    }));
  }, [validInvoices]);

  return (
    <div className="space-y-6">
      {/* Page Header with Time Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-[22px] sm:text-[30px] font-bold text-[#111827] tracking-tight leading-tight">
            Tổng quan vận hành LK ERP
          </h1>
          <p className="text-[13.5px] sm:text-[15px] font-normal text-[#6B7280] mt-0.5 sm:mt-1">
            Theo dõi doanh thu, tồn kho, mua bán và công nợ theo thời gian thực
          </p>
        </div>

        {/* Right Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Segmented Control */}
          <div className="flex items-center p-1 bg-white border border-[#E5E7EB] rounded-[12px] shadow-sm overflow-x-auto scrollbar-none">
            {(['today', '7days', 'month', 'quarter'] as const).map(p => {
              const labels = {
                today: 'Hôm nay',
                '7days': '7 ngày',
                month: 'Tháng này',
                quarter: 'Quý này',
              };
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePresetSelect(p)}
                  className={`px-2.5 sm:px-3 py-1.5 text-[12px] sm:text-[12.5px] font-medium rounded-[9px] transition-colors whitespace-nowrap ${
                    preset === p
                      ? 'bg-[#6D3EEB] text-white font-semibold shadow-xs'
                      : 'text-[#4B5563] hover:text-[#111827]'
                  }`}
                >
                  {labels[p]}
                </button>
              );
            })}
          </div>

          {/* DateRangePicker */}
          <DateRangePicker value={dateRange} onChange={setDateRange} />

          {/* GroupBy Select */}
          <select
            value={groupBy}
            onChange={e => setGroupBy(e.target.value as any)}
            className="h-[42px] px-3.5 bg-white border border-[#E5E7EB] rounded-[12px] text-[13px] font-medium text-[#1F2937] shadow-sm outline-none cursor-pointer"
          >
            <option value="auto">Nhóm tự động</option>
            <option value="day">Theo ngày</option>
            <option value="week">Theo tuần</option>
            <option value="month">Theo tháng</option>
          </select>
        </div>
      </div>

      {/* Period Description Line */}
      <div className="flex flex-wrap items-center gap-2.5 text-[13px] -mt-2">
        <span className="px-2.5 py-1 rounded-[8px] bg-[#F9F5FF] border border-[#E9D5FF] text-[#6317D6] font-semibold">
          {preset === 'today'
            ? 'Hôm nay'
            : preset === '7days'
            ? '7 ngày qua'
            : preset === 'month'
            ? 'Tháng này'
            : preset === 'quarter'
            ? 'Quý này'
            : 'Tùy chỉnh'}
        </span>
        <span className="text-[#6B7280]">
          {dateRange.from && dateRange.to
            ? `Từ ${dateRange.from.split('-').reverse().join('/')} đến ${dateRange.to.split('-').reverse().join('/')} · Nhóm biểu đồ: ${
                groupBy === 'auto'
                  ? 'Tự động'
                  : groupBy === 'day'
                  ? 'Theo ngày'
                  : groupBy === 'week'
                  ? 'Theo tuần'
                  : 'Theo tháng'
              } · Dữ liệu bán hàng & chi phí thực tế`
            : 'Toàn bộ dữ liệu vận hành'}
        </span>
      </div>

      {/* 8 KPI Cards (Grid 4x2 on desktop, 2x4 on mobile) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <KpiCard
          label="Doanh thu thuần"
          value={formatCurrency(netRevenue)}
          icon="monitoring"
          iconBg="bg-[#F3EBFE]"
          iconColor="text-[#6D3EEB]"
          trend={{ value: 'Thực tế', isUp: true }}
        />
        <KpiCard
          label="Lợi nhuận gộp"
          value={formatCurrency(grossProfit)}
          icon="savings"
          iconBg="bg-[#ECFDF5]"
          iconColor="text-[#059669]"
          trend={{ value: `${grossMarginPercent}%`, isUp: true }}
        />
        <KpiCard
          label="Số đơn hàng"
          value={orderCount}
          icon="receipt_long"
          iconBg="bg-[#EFF6FF]"
          iconColor="text-[#2563EB]"
        />
        <KpiCard
          label="Giá trị TB/đơn (AOV)"
          value={formatCurrency(aov)}
          icon="shopping_bag"
          iconBg="bg-[#ECFEFF]"
          iconColor="text-[#0891B2]"
        />

        <KpiCard
          label="Biên lãi gộp"
          value={`${grossMarginPercent}%`}
          icon="percent"
          iconBg="bg-[#F9F5FF]"
          iconColor="text-[#7C3AED]"
        />
        <KpiCard
          label="Giá trị tồn kho"
          value={formatCurrency(inventoryValue)}
          icon="inventory_2"
          iconBg="bg-[#FFFBEB]"
          iconColor="text-[#D97706]"
        />
        <KpiCard
          label="Phải thu khách hàng"
          value={formatCurrency(totalReceivables)}
          icon="request_quote"
          iconBg="bg-[#FFF1F2]"
          iconColor="text-[#E11D48]"
        />
        <KpiCard
          label="Phải trả nhà cung cấp"
          value={formatCurrency(totalPayables)}
          icon="payments"
          iconBg="bg-[#F3F4F6]"
          iconColor="text-[#4B5563]"
        />
      </div>

      {/* Row 2: Charts & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Revenue/Cost/Profit ComposedChart (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-[16px] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_2px_8px_rgba(16,24,40,0.04)] border border-[#F1F2F5] flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-[16px] font-bold text-[#111827]">
                Doanh thu, Giá vốn & Lợi nhuận gộp
              </h3>
              <p className="text-[13px] text-[#6B7280] mt-0.5">
                Số liệu tính theo thời gian thực từ hóa đơn bán hàng trong kỳ
              </p>
            </div>
            <div className="flex items-center gap-3 text-[12px]">
              <span className="flex items-center gap-1.5 font-medium text-[#6B7280]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#8B5CF6]" /> Doanh thu
              </span>
              <span className="flex items-center gap-1.5 font-medium text-[#6B7280]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#F5B03E]" /> Giá vốn
              </span>
              <span className="flex items-center gap-1.5 font-medium text-[#6B7280]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> Lãi gộp
              </span>
            </div>
          </div>

          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="period"
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  interval={chartData.length > 14 ? 1 : 0}
                  angle={chartData.length > 6 ? -30 : 0}
                  textAnchor={chartData.length > 6 ? 'end' : 'middle'}
                  height={chartData.length > 6 ? 40 : 25}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  tickFormatter={formatCompactNumber}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#111827] text-white p-3 rounded-[10px] shadow-xl text-[12px] space-y-1">
                          <p className="font-bold text-gray-200 border-b border-gray-700 pb-1 mb-1.5">
                            {label}
                          </p>
                          <div className="flex items-center justify-between gap-4 text-[#A78BFA]">
                            <span>Doanh thu:</span>
                            <span className="font-bold tabular-nums">
                              {formatCurrency(Number(payload[0]?.value))}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-[#FBBF24]">
                            <span>Giá vốn hàng bán:</span>
                            <span className="font-bold tabular-nums">
                              {formatCurrency(Number(payload[1]?.value))}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-[#34D399]">
                            <span>Lợi nhuận gộp:</span>
                            <span className="font-bold tabular-nums">
                              {formatCurrency(Number(payload[2]?.value))}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, paddingBottom: 10 }}
                />
                <Bar dataKey="revenue" name="Doanh thu" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cost" name="Giá vốn" fill="#F5B03E" radius={[4, 4, 0, 0]} />
                <Line
                  type="monotone"
                  dataKey="profit"
                  name="Lợi nhuận gộp"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#10B981' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Side: Category Donut & Alerts (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Donut Chart */}
          <div className="bg-white rounded-[16px] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_2px_8px_rgba(16,24,40,0.04)] border border-[#F1F2F5] flex-1">
            <h3 className="text-[15px] font-bold text-[#111827]">Cơ cấu nhóm hàng</h3>
            <p className="text-[12px] text-[#6B7280]">Theo giá trị tồn kho hiện tại</p>

            <div className="h-44 w-full mt-2 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[11px] text-[#9CA3AF]">TỔNG TỒN</span>
                <span className="text-[13px] font-bold text-[#111827]">
                  {formatCompactNumber(inventoryValue)}
                </span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="grid grid-cols-2 gap-1.5 text-[11.5px] mt-2">
              {categoryData.slice(0, 6).map((c, i) => (
                <div key={i} className="flex items-center gap-1.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="text-[#4B5563] truncate">{c.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts Box */}
          <div className="bg-[#FFF9FA] rounded-[16px] p-4 border border-[#FFE4E8]">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="warning" size={18} className="text-[#E11D48]" />
              <h4 className="text-[14px] font-bold text-[#E11D48]">Cảnh báo cần xử lý</h4>
            </div>

            <div className="space-y-2 text-[13px]">
              <div
                onClick={() => onNavigate('/kho-hang?tab=tong-quan')}
                className="flex items-center justify-between p-2 rounded-[10px] bg-white hover:bg-gray-50 border border-gray-100 cursor-pointer transition-colors"
              >
                <span className="text-[#374151]">Sản phẩm sắp/hết hàng</span>
                <span className="px-2 py-0.5 rounded-full bg-[#FFFBEB] text-[#B45309] font-bold text-[11px]">
                  {alerts.stock}
                </span>
              </div>

              <div
                onClick={() => onNavigate('/cong-no?tab=qua-han')}
                className="flex items-center justify-between p-2 rounded-[10px] bg-white hover:bg-gray-50 border border-gray-100 cursor-pointer transition-colors"
              >
                <span className="text-[#374151]">Công nợ quá hạn</span>
                <span className="px-2 py-0.5 rounded-full bg-[#FFF1F2] text-[#E11D48] font-bold text-[11px]">
                  {alerts.overdue}
                </span>
              </div>

              <div
                onClick={() => onNavigate('/kho-hang?tab=tong-quan')}
                className="flex items-center justify-between p-2 rounded-[10px] bg-white hover:bg-gray-50 border border-gray-100 cursor-pointer transition-colors"
              >
                <span className="text-[#374151]">Sản phẩm vượt tồn</span>
                <span className="px-2 py-0.5 rounded-full bg-[#F9F5FF] text-[#6317D6] font-bold text-[11px]">
                  {alerts.overStock}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Performance (P&L) & Cash Flow Summary */}
      <div className="bg-white rounded-[16px] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_2px_8px_rgba(16,24,40,0.04)] border border-[#F1F2F5] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[10px] bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
              <Icon name="account_balance_wallet" size={20} />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-[#111827]">
                Báo cáo Hiệu quả Kinh doanh (P&L) & Dòng tiền thực tế
              </h3>
              <p className="text-[12.5px] text-[#6B7280]">
                Tổng hợp theo Doanh thu hóa đơn, Giá vốn xuất kho và các Phiếu chi Sổ quỹ thực tế
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
              Số liệu thời gian thực
            </span>
          </div>
        </div>

        {/* 4 Pillars of P&L */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-[12px] bg-[#F9F5FF] border border-[#E9D5FF]/60">
            <span className="text-[11.5px] font-semibold text-[#6D3EEB] uppercase tracking-wider">1. Doanh thu thuần</span>
            <div className="text-[18px] sm:text-[20px] font-bold text-[#111827] mt-1 tabular-nums">
              {formatCurrency(netRevenue)}
            </div>
            <p className="text-[11.5px] text-[#6B7280] mt-0.5">
              100% doanh số từ {orderCount} đơn bán
            </p>
          </div>

          <div className="p-3.5 rounded-[12px] bg-[#FFFBEB] border border-[#FDE68A]/60">
            <span className="text-[11.5px] font-semibold text-[#D97706] uppercase tracking-wider">2. Giá vốn hàng bán</span>
            <div className="text-[18px] sm:text-[20px] font-bold text-[#111827] mt-1 tabular-nums">
              {formatCurrency(totalCogs)}
            </div>
            <p className="text-[11.5px] text-[#6B7280] mt-0.5">
              Chiếm {netRevenue > 0 ? ((totalCogs / netRevenue) * 100).toFixed(1) : 0}% doanh thu
            </p>
          </div>

          <div className="p-3.5 rounded-[12px] bg-[#ECFDF5] border border-[#A7F3D0]/60">
            <span className="text-[11.5px] font-semibold text-[#059669] uppercase tracking-wider">3. Lợi nhuận gộp</span>
            <div className="text-[18px] sm:text-[20px] font-bold text-[#059669] mt-1 tabular-nums">
              {formatCurrency(grossProfit)}
            </div>
            <p className="text-[11.5px] text-[#059669] font-medium mt-0.5">
              Biên lãi gộp đạt {grossMarginPercent}%
            </p>
          </div>

          <div className="p-3.5 rounded-[12px] bg-[#F0FDF4] border border-[#BBF7D0]">
            <span className="text-[11.5px] font-semibold text-[#16A34A] uppercase tracking-wider">4. Lợi nhuận ròng</span>
            <div className="text-[18px] sm:text-[20px] font-bold text-[#16A34A] mt-1 tabular-nums">
              {formatCurrency(netOperatingProfit)}
            </div>
            <p className="text-[11.5px] text-[#16A34A] font-medium mt-0.5">
              Biên ròng {netMarginPercent}% (sau trừ CP vận hành)
            </p>
          </div>
        </div>

        {/* Visual Waterfall Conversion Bar */}
        <div className="p-4 rounded-[12px] bg-[#F9FAFB] border border-[#F3F4F6] space-y-2.5">
          <div className="flex items-center justify-between text-[12.5px] font-semibold">
            <span className="text-[#374151]">Cơ cấu phân bổ Doanh thu</span>
            <span className="text-[#6B7280]">
              CP vận hành Sổ quỹ: <strong className="text-[#E11D48] font-bold tabular-nums">{formatCurrency(operatingExpenses)}</strong>
            </span>
          </div>

          <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden flex">
            {/* COGS */}
            <div
              className="h-full bg-[#F5B03E]"
              style={{ width: `${Math.min(100, Math.max(0, netRevenue > 0 ? (totalCogs / netRevenue) * 100 : 0))}%` }}
              title={`Giá vốn: ${formatCurrency(totalCogs)}`}
            />
            {/* OpEx */}
            <div
              className="h-full bg-[#EF4444]"
              style={{ width: `${Math.min(100, Math.max(0, netRevenue > 0 ? (operatingExpenses / netRevenue) * 100 : 0))}%` }}
              title={`Chi phí vận hành: ${formatCurrency(operatingExpenses)}`}
            />
            {/* Net Profit */}
            <div
              className="h-full bg-[#10B981]"
              style={{ width: `${Math.min(100, Math.max(0, netRevenue > 0 && netOperatingProfit > 0 ? (netOperatingProfit / netRevenue) * 100 : 0))}%` }}
              title={`Lợi nhuận ròng: ${formatCurrency(netOperatingProfit)}`}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11.5px] text-[#6B7280] pt-1">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#F5B03E]" /> Giá vốn ({netRevenue > 0 ? ((totalCogs / netRevenue) * 100).toFixed(1) : 0}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#EF4444]" /> Chi phí vận hành ({netRevenue > 0 ? ((operatingExpenses / netRevenue) * 100).toFixed(1) : 0}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#10B981]" /> Lợi nhuận ròng ({netRevenue > 0 ? ((netOperatingProfit / netRevenue) * 100).toFixed(1) : 0}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>Dòng tiền Sổ quỹ:</span>
              <span className="text-[#059669] font-semibold tabular-nums">Thu {formatCurrency(totalCashIn)}</span>
              <span>·</span>
              <span className="text-[#DC2626] font-semibold tabular-nums">Chi {formatCurrency(totalCashOut)}</span>
              <span>·</span>
              <span className={`font-bold tabular-nums ${netCashFlow >= 0 ? 'text-[#059669]' : 'text-[#DC2626]'}`}>
                {netCashFlow >= 0 ? '+' : ''}{formatCurrency(netCashFlow)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Top Products · Top Customers · Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Top Products */}
        <div className="bg-white rounded-[16px] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_2px_8px_rgba(16,24,40,0.04)] border border-[#F1F2F5]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-[10px] bg-[#F9F5FF] text-[#6D3EEB] flex items-center justify-center">
              <Icon name="emoji_events" size={18} />
            </div>
            <h3 className="text-[15px] font-bold text-[#111827]">Top sản phẩm bán chạy</h3>
          </div>

          <div className="space-y-3.5">
            {topProducts.map(p => (
              <div key={p.rank} className="space-y-1">
                <div className="flex items-center justify-between text-[13px]">
                  <div className="flex items-center gap-2 overflow-hidden pr-2">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10.5px] font-bold shrink-0 ${
                        p.rank === 1
                          ? 'bg-amber-400 text-white'
                          : p.rank === 2
                          ? 'bg-gray-300 text-gray-800'
                          : p.rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'border border-gray-300 text-gray-500'
                      }`}
                    >
                      {p.rank}
                    </span>
                    <span className="font-semibold text-[#111827] truncate">{p.name}</span>
                  </div>
                  <span className="font-bold text-[#6D3EEB] tabular-nums shrink-0">
                    {formatQuantity(p.soldQty)} SP
                  </span>
                </div>

                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#6D3EEB] rounded-full"
                    style={{ width: `${p.percent}%` }}
                  />
                </div>
                <div className="text-[11.5px] text-[#6B7280] text-right">
                  Doanh thu {formatCurrency(p.revenue)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Top Customers */}
        <div className="bg-white rounded-[16px] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_2px_8px_rgba(16,24,40,0.04)] border border-[#F1F2F5]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-[10px] bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
              <Icon name="workspace_premium" size={18} />
            </div>
            <h3 className="text-[15px] font-bold text-[#111827]">Top khách hàng doanh thu</h3>
          </div>

          <div className="space-y-3.5">
            {topCustomers.map(c => (
              <div key={c.rank} className="space-y-1">
                <div className="flex items-center justify-between text-[13px]">
                  <div className="flex items-center gap-2 overflow-hidden pr-2">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10.5px] font-bold shrink-0 ${
                        c.rank === 1
                          ? 'bg-amber-400 text-white'
                          : c.rank === 2
                          ? 'bg-gray-300 text-gray-800'
                          : c.rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'border border-gray-300 text-gray-500'
                      }`}
                    >
                      {c.rank}
                    </span>
                    <span className="font-semibold text-[#111827] truncate">{c.name}</span>
                  </div>
                  <span className="font-bold text-[#059669] tabular-nums shrink-0">
                    {formatCurrency(c.total)}
                  </span>
                </div>

                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#2DD4BF] to-[#14B8A6] rounded-full"
                    style={{ width: `${c.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Recent Activities */}
        <div className="bg-white rounded-[16px] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_2px_8px_rgba(16,24,40,0.04)] border border-[#F1F2F5]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-[10px] bg-blue-50 text-blue-600 flex items-center justify-center">
                <Icon name="history" size={18} />
              </div>
              <h3 className="text-[15px] font-bold text-[#111827]">Hoạt động gần đây</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/ban-hang?tab=tong-quan')}
              className="text-[12px] font-semibold text-[#6317D6] hover:underline"
            >
              Xem tất cả
            </button>
          </div>

          <div className="space-y-3">
            {activityLogs.slice(0, 5).map(act => (
              <div key={act.id} className="flex items-center justify-between text-[12.5px]">
                <div className="flex items-center gap-2.5 overflow-hidden pr-2">
                  <div className="w-8 h-8 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
                    <Icon name="point_of_sale" size={16} />
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-[#111827] truncate">{act.title}</div>
                    <div className="text-[11px] text-[#9CA3AF]">
                      {formatDateTime(act.occurred_at)}
                    </div>
                  </div>
                </div>
                {act.amount !== undefined && (
                  <span className="font-bold text-[#059669] tabular-nums shrink-0">
                    {formatCurrency(act.amount)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
