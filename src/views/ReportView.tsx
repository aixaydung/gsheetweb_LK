import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Icon } from '../components/ui/Icon';
import { formatCurrency, formatQuantity } from '../lib/format';
import { exportToExcelFile } from '../lib/excelExport';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

interface ReportViewProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ currentTab, onTabChange }) => {
  const { invoices, purchaseOrders, products: contextProducts, customers: contextCustomers, suppliers: contextSuppliers } = useApp();

  // Helper to compute date range dynamically
  const getPresetDates = (p: string) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const toYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    if (p === 'Hôm nay') {
      const todayStr = toYMD(now);
      return { from: todayStr, to: todayStr };
    }
    if (p === 'Hôm qua') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const yStr = toYMD(y);
      return { from: yStr, to: yStr };
    }
    if (p === '7 ngày qua') {
      const past = new Date(now);
      past.setDate(past.getDate() - 6);
      return { from: toYMD(past), to: toYMD(now) };
    }
    if (p === 'Tháng này') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: toYMD(firstDay), to: toYMD(now) };
    }
    if (p === 'Tháng trước') {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: toYMD(firstDay), to: toYMD(lastDay) };
    }
    if (p === 'Quý này') {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const firstDay = new Date(now.getFullYear(), currentQuarter * 3, 1);
      const lastDay = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0);
      return { from: toYMD(firstDay), to: toYMD(lastDay) };
    }
    if (p === 'Năm nay') {
      const firstDay = new Date(now.getFullYear(), 0, 1);
      const lastDay = new Date(now.getFullYear(), 11, 31);
      return { from: toYMD(firstDay), to: toYMD(lastDay) };
    }
    return { from: toYMD(new Date(now.getFullYear(), now.getMonth(), 1)), to: toYMD(now) };
  };

  const initialDates = useMemo(() => getPresetDates('Tháng này'), []);
  // Top Filter Bar State
  const [preset, setPreset] = useState('Tháng này');
  const [fromDate, setFromDate] = useState(initialDates.from);
  const [toDate, setToDate] = useState(initialDates.to);

  // Search & Filter state for individual tabs
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryStatus, setInventoryStatus] = useState('all');
  const [inventorySort, setInventorySort] = useState<'value' | 'stock' | 'name' | 'sku'>('value');
  const [inventorySortAsc, setInventorySortAsc] = useState(false);

  const [debtCustSearch, setDebtCustSearch] = useState('');
  const [debtCustSortAsc, setDebtCustSortAsc] = useState(false);

  const [debtSuppSearch, setDebtSuppSearch] = useState('');
  const [debtSuppSortAsc, setDebtSuppSortAsc] = useState(false);

  const [topProdSearch, setTopProdSearch] = useState('');
  const [topProdSort, setTopProdSort] = useState<'revenue' | 'quantity' | 'profit' | 'name'>('revenue');
  const [topProdSortAsc, setTopProdSortAsc] = useState(false);

  const [topCustSearch, setTopCustSearch] = useState('');
  const [topCustSort, setTopCustSort] = useState<'total' | 'debt' | 'name'>('total');
  const [topCustSortAsc, setTopCustSortAsc] = useState(false);

  const [topSuppSearch, setTopSuppSearch] = useState('');
  const [topSuppSort, setTopSuppSort] = useState<'total' | 'debt' | 'name'>('total');
  const [topSuppSortAsc, setTopSuppSortAsc] = useState(false);

  // Profitability Tab State
  const [profitViewMode, setProfitViewMode] = useState<'product' | 'customer'>('product');
  const [profitSearch, setProfitSearch] = useState('');
  const [profitSort, setProfitSort] = useState<'profit' | 'revenue' | 'margin' | 'name'>('profit');
  const [profitSortAsc, setProfitSortAsc] = useState(false);

  const [isBookmarked, setIsBookmarked] = useState<Record<string, boolean>>({});

  const toggleBookmark = (key: string) => {
    setIsBookmarked(prev => {
      const next = !prev[key];
      alert(next ? 'Đã lưu cấu hình lọc báo cáo vào mục yêu thích!' : 'Đã bỏ lưu cấu hình lọc.');
      return { ...prev, [key]: next };
    });
  };

  const tabs = [
    { id: 'tong-hop', label: 'Tổng hợp' },
    { id: 'loi-nhuan', label: 'Phân tích lợi nhuận' },
    { id: 'ton-kho', label: 'Tồn kho' },
    { id: 'cong-no', label: 'Công nợ' },
    { id: 'top-san-pham', label: 'Top sản phẩm' },
    { id: 'top-khach-hang', label: 'Top khách hàng' },
    { id: 'top-ncc', label: 'Top NCC' },
  ];

  const activeTab = tabs.some(t => t.id === currentTab) ? currentTab : 'tong-hop';

  // Handle preset date change
  const handlePresetChange = (newPreset: string) => {
    setPreset(newPreset);
    const dates = getPresetDates(newPreset);
    setFromDate(dates.from);
    setToDate(dates.to);
  };

  // Filter invoices and purchase orders by date range and active status
  const rangeInvoices = useMemo(() => {
    return invoices.filter(inv => {
      if (inv.status === 'cancelled') return false;
      const d = (inv.date || '').slice(0, 10);
      if (fromDate && d < fromDate) return false;
      if (toDate && d > toDate) return false;
      return true;
    });
  }, [invoices, fromDate, toDate]);

  const rangePurchases = useMemo(() => {
    return purchaseOrders.filter(po => {
      if (po.status === 'cancelled') return false;
      const d = (po.date || '').slice(0, 10);
      if (fromDate && d < fromDate) return false;
      if (toDate && d > toDate) return false;
      return true;
    });
  }, [purchaseOrders, fromDate, toDate]);

  // =========================================================================
  // DATASET 1: TỔNG HỢP & KPI (Dynamic 100% from Google Sheets)
  // =========================================================================
  const { revenue, cogs, profit, purchases, dailyChartData } = useMemo(() => {
    let rev = 0;
    let cost = 0;
    let purch = 0;

    const dailyMap = new Map<string, { day: string; revenue: number; cost: number; profit: number }>();

    rangeInvoices.forEach(inv => {
      const invTotal = inv.total || 0;
      rev += invTotal;

      let invCost = 0;
      (inv.items || []).forEach(item => {
        const prod = contextProducts.find(p => p.id === item.product_id || p.sku === item.product_sku);
        const costPrice = prod?.cost_price || item.unit_cost || 0;
        invCost += costPrice * (item.quantity || 1);
      });
      cost += invCost;

      const dStr = (inv.date || '').slice(0, 10);
      if (dStr) {
        const parts = dStr.split('-');
        const displayDay = parts.length === 3 ? `${parts[2]}/${parts[1]}` : dStr;
        const cur = dailyMap.get(displayDay) || { day: displayDay, revenue: 0, cost: 0, profit: 0 };
        cur.revenue += invTotal;
        cur.cost += invCost;
        cur.profit += (invTotal - invCost);
        dailyMap.set(displayDay, cur);
      }
    });

    rangePurchases.forEach(po => {
      purch += po.total || 0;
    });

    const prof = rev - cost;

    let chartData = Array.from(dailyMap.values());
    if (fromDate && toDate) {
      const start = new Date(fromDate);
      const end = new Date(toDate);
      const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
      if (diffDays >= 0 && diffDays <= 31) {
        const slots = [];
        const pad = (n: number) => String(n).padStart(2, '0');
        for (let i = 0; i <= diffDays; i++) {
          const curD = new Date(start);
          curD.setDate(curD.getDate() + i);
          const key = `${pad(curD.getDate())}/${pad(curD.getMonth() + 1)}`;
          const existing = dailyMap.get(key) || { day: key, revenue: 0, cost: 0, profit: 0 };
          slots.push(existing);
        }
        chartData = slots;
      }
    }

    return {
      revenue: rev,
      cogs: cost,
      profit: prof,
      purchases: purch,
      dailyChartData: chartData,
    };
  }, [rangeInvoices, rangePurchases, contextProducts, fromDate, toDate]);

  // =========================================================================
  // DATASET 2: TỒN KHO (Dynamic 100% from Google Sheets PRODUCTS)
  // =========================================================================
  const rawInventoryProducts = useMemo(() => {
    return (contextProducts || []).map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku || '',
      stock: p.stock_quantity || 0,
      value: p.stock_value || ((p.stock_quantity || 0) * (p.cost_price || 0)),
      status: (p.stock_quantity || 0) <= 0 ? 'out' : (p.stock_quantity || 0) <= (p.min_stock || 5) ? 'low' : 'ok',
      statusText: (p.stock_quantity || 0) <= 0 ? 'Hết hàng' : (p.stock_quantity || 0) <= (p.min_stock || 5) ? 'Sắp hết' : 'Còn hàng',
    }));
  }, [contextProducts]);

  const filteredInventory = useMemo(() => {
    return rawInventoryProducts
      .filter(item => {
        const matchesSearch =
          item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
          item.sku.toLowerCase().includes(inventorySearch.toLowerCase());
        const matchesStatus =
          inventoryStatus === 'all' ||
          (inventoryStatus === 'ok' && item.status === 'ok') ||
          (inventoryStatus === 'low' && item.status === 'low') ||
          (inventoryStatus === 'out' && item.status === 'out');
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let diff = 0;
        if (inventorySort === 'value') diff = b.value - a.value;
        else if (inventorySort === 'stock') diff = b.stock - a.stock;
        else if (inventorySort === 'name') diff = a.name.localeCompare(b.name);
        else if (inventorySort === 'sku') diff = a.sku.localeCompare(b.sku);
        return inventorySortAsc ? -diff : diff;
      });
  }, [rawInventoryProducts, inventorySearch, inventoryStatus, inventorySort, inventorySortAsc]);

  // =========================================================================
  // DATASET 3: CÔNG NỢ (matching Screenshot 3.png)
  // =========================================================================
  const rawDebtCustomers = useMemo(() => {
    return (contextCustomers || [])
      .filter(c => (c.debt_amount || 0) > 0)
      .map(c => ({
        id: c.id,
        name: c.name,
        totalPurchase: c.total_purchase || 0,
        remainingDebt: c.debt_amount || 0,
      }));
  }, [contextCustomers]);

  const filteredDebtCustomers = useMemo(() => {
    return rawDebtCustomers
      .filter(c => c.name.toLowerCase().includes(debtCustSearch.toLowerCase()))
      .sort((a, b) => {
        const diff = b.remainingDebt - a.remainingDebt;
        return debtCustSortAsc ? -diff : diff;
      });
  }, [rawDebtCustomers, debtCustSearch, debtCustSortAsc]);

  // In 3.png, Top NCC còn nợ
  const rawDebtSuppliers = useMemo(() => {
    return (contextSuppliers || [])
      .filter(s => (s.debt_amount || 0) > 0)
      .map(s => ({
        id: s.id,
        name: s.name,
        totalPurchase: s.total_purchase || 0,
        remainingDebt: s.debt_amount || 0,
      }));
  }, [contextSuppliers]);

  const filteredDebtSuppliers = useMemo(() => {
    return rawDebtSuppliers
      .filter(s => s.name.toLowerCase().includes(debtSuppSearch.toLowerCase()))
      .sort((a, b) => {
        const diff = b.remainingDebt - a.remainingDebt;
        return debtSuppSortAsc ? -diff : diff;
      });
  }, [rawDebtSuppliers, debtSuppSearch, debtSuppSortAsc]);

  // =========================================================================
  // DATASET 4: TOP SẢN PHẨM (Dynamic aggregation from rangeInvoices)
  // =========================================================================
  const rawTopProducts = useMemo(() => {
    const map = new Map<string, { id: string; name: string; quantity: number; revenue: number; profit: number }>();

    rangeInvoices.forEach(inv => {
      (inv.items || []).forEach(item => {
        const prod = contextProducts.find(p => p.id === item.product_id || p.sku === item.product_sku);
        const costPrice = prod?.cost_price || item.unit_cost || 0;
        const lineRev = item.line_total || ((item.quantity || 1) * (item.unit_price || 0));
        const lineCost = costPrice * (item.quantity || 1);
        const lineProfit = lineRev - lineCost;
        const key = prod?.id || item.product_id || item.product_name;

        const cur = map.get(key) || {
          id: key,
          name: prod?.name || item.product_name,
          quantity: 0,
          revenue: 0,
          profit: 0,
        };
        cur.quantity += (item.quantity || 1);
        cur.revenue += lineRev;
        cur.profit += lineProfit;
        map.set(key, cur);
      });
    });

    return Array.from(map.values());
  }, [rangeInvoices, contextProducts]);

  const filteredTopProducts = useMemo(() => {
    return rawTopProducts
      .filter(p => p.name.toLowerCase().includes(topProdSearch.toLowerCase()))
      .sort((a, b) => {
        let diff = 0;
        if (topProdSort === 'revenue') diff = b.revenue - a.revenue;
        else if (topProdSort === 'quantity') diff = b.quantity - a.quantity;
        else if (topProdSort === 'profit') diff = b.profit - a.profit;
        else if (topProdSort === 'name') diff = a.name.localeCompare(b.name);
        return topProdSortAsc ? -diff : diff;
      });
  }, [rawTopProducts, topProdSearch, topProdSort, topProdSortAsc]);

  // =========================================================================
  // DATASET 5: TOP KHÁCH HÀNG (Dynamic aggregation from rangeInvoices)
  // =========================================================================
  const rawTopCustomers = useMemo(() => {
    const map = new Map<string, { id: string; name: string; totalPurchase: number; remainingDebt: number }>();

    rangeInvoices.forEach(inv => {
      const custId = inv.customer_id || inv.customer_name || 'unknown-cust';
      const cust = contextCustomers.find(c => c.id === custId || c.name === inv.customer_name);
      const key = cust?.id || custId;

      const cur = map.get(key) || {
        id: key,
        name: cust?.name || inv.customer_name,
        totalPurchase: 0,
        remainingDebt: cust?.debt_amount || 0,
      };
      cur.totalPurchase += inv.total || 0;
      map.set(key, cur);
    });

    return Array.from(map.values());
  }, [rangeInvoices, contextCustomers]);

  const filteredTopCustomers = useMemo(() => {
    return rawTopCustomers
      .filter(c => c.name.toLowerCase().includes(topCustSearch.toLowerCase()))
      .sort((a, b) => {
        let diff = 0;
        if (topCustSort === 'total') diff = b.totalPurchase - a.totalPurchase;
        else if (topCustSort === 'debt') diff = b.remainingDebt - a.remainingDebt;
        else if (topCustSort === 'name') diff = a.name.localeCompare(b.name);
        return topCustSortAsc ? -diff : diff;
      });
  }, [rawTopCustomers, topCustSearch, topCustSort, topCustSortAsc]);

  // =========================================================================
  // DATASET 6: TOP NCC (Dynamic aggregation from rangePurchases)
  // =========================================================================
  const rawTopSuppliers = useMemo(() => {
    const map = new Map<string, { id: string; name: string; totalPurchase: number; remainingDebt: number }>();

    rangePurchases.forEach(po => {
      const suppId = po.supplier_id || po.supplier_name || 'unknown-supp';
      const supp = contextSuppliers.find(s => s.id === suppId || s.name === po.supplier_name);
      const key = supp?.id || suppId;

      const cur = map.get(key) || {
        id: key,
        name: supp?.name || po.supplier_name,
        totalPurchase: 0,
        remainingDebt: supp?.debt_amount || 0,
      };
      cur.totalPurchase += po.total || 0;
      map.set(key, cur);
    });

    return Array.from(map.values());
  }, [rangePurchases, contextSuppliers]);

  const filteredTopSuppliers = useMemo(() => {
    return rawTopSuppliers
      .filter(s => s.name.toLowerCase().includes(topSuppSearch.toLowerCase()))
      .sort((a, b) => {
        let diff = 0;
        if (topSuppSort === 'total') diff = b.totalPurchase - a.totalPurchase;
        else if (topSuppSort === 'debt') diff = b.remainingDebt - a.remainingDebt;
        else if (topSuppSort === 'name') diff = a.name.localeCompare(b.name);
        return topSuppSortAsc ? -diff : diff;
      });
  }, [rawTopSuppliers, topSuppSearch, topSuppSort, topSuppSortAsc]);

  // =========================================================================
  // DATASET 7: PHÂN TÍCH LỢI NHUẬN (THEO MẶT HÀNG & KHÁCH HÀNG)
  // =========================================================================
  const {
    productProfitList,
    customerProfitList,
    totalProfitRevenue,
    totalProfitCOGS,
    totalProfitGross,
    avgProfitMargin,
  } = useMemo(() => {
    const productMap = new Map<string, {
      id: string;
      sku: string;
      name: string;
      unit: string;
      soldQty: number;
      revenue: number;
      cogs: number;
      grossProfit: number;
      margin: number;
    }>();

    const customerMap = new Map<string, {
      id: string;
      code: string;
      name: string;
      orderCount: number;
      revenue: number;
      cogs: number;
      grossProfit: number;
      margin: number;
      remainingDebt: number;
    }>();

    rangeInvoices.forEach(inv => {
      const custId = inv.customer_id || inv.customer_name || 'unknown-cust';
      const custObj = contextCustomers.find(c => c.id === custId || c.name === inv.customer_name);

      let invCogs = 0;
      (inv.items || []).forEach(item => {
        const prod = contextProducts.find(p => p.id === item.product_id || p.sku === item.product_sku);
        const costPrice = prod?.cost_price || item.unit_cost || Math.round((item.unit_price || 0) * 0.6);
        const lineRev = item.line_total || ((item.quantity || 1) * (item.unit_price || 0));
        const lineCogs = costPrice * (item.quantity || 1);
        invCogs += lineCogs;

        const prodKey = prod?.id || item.product_id || item.product_name;
        const existing = productMap.get(prodKey) || {
          id: prodKey,
          sku: prod?.sku || item.product_sku || 'SP-LK',
          name: prod?.name || item.product_name,
          unit: prod?.unit || item.unit || 'Cái',
          soldQty: 0,
          revenue: 0,
          cogs: 0,
          grossProfit: 0,
          margin: 0,
        };

        existing.soldQty += (item.quantity || 1);
        existing.revenue += lineRev;
        existing.cogs += lineCogs;
        existing.grossProfit = existing.revenue - existing.cogs;
        existing.margin = existing.revenue > 0 ? (existing.grossProfit / existing.revenue) * 100 : 0;
        productMap.set(prodKey, existing);
      });

      const custKey = custObj?.id || custId;
      const existingCust = customerMap.get(custKey) || {
        id: custKey,
        code: custObj?.code || 'KH-LK',
        name: custObj?.name || inv.customer_name,
        orderCount: 0,
        revenue: 0,
        cogs: 0,
        grossProfit: 0,
        margin: 0,
        remainingDebt: custObj?.debt_amount || 0,
      };

      existingCust.orderCount += 1;
      existingCust.revenue += inv.total || 0;
      existingCust.cogs += invCogs;
      existingCust.grossProfit = existingCust.revenue - existingCust.cogs;
      existingCust.margin = existingCust.revenue > 0 ? (existingCust.grossProfit / existingCust.revenue) * 100 : 0;
      customerMap.set(custKey, existingCust);
    });

    const pList = Array.from(productMap.values());
    const cList = Array.from(customerMap.values());

    const totalProfitRevenue = pList.reduce((sum, item) => sum + item.revenue, 0);
    const totalProfitCOGS = pList.reduce((sum, item) => sum + item.cogs, 0);
    const totalProfitGross = totalProfitRevenue - totalProfitCOGS;
    const avgProfitMargin = totalProfitRevenue > 0 ? (totalProfitGross / totalProfitRevenue) * 100 : 0;

    return {
      productProfitList: pList,
      customerProfitList: cList,
      totalProfitRevenue,
      totalProfitCOGS,
      totalProfitGross,
      avgProfitMargin,
    };
  }, [rangeInvoices, contextProducts, contextCustomers]);

  const filteredProductProfits = useMemo(() => {
    return productProfitList
      .filter(p => p.name.toLowerCase().includes(profitSearch.toLowerCase()) || p.sku.toLowerCase().includes(profitSearch.toLowerCase()))
      .sort((a, b) => {
        let diff = 0;
        if (profitSort === 'profit') diff = b.grossProfit - a.grossProfit;
        else if (profitSort === 'revenue') diff = b.revenue - a.revenue;
        else if (profitSort === 'margin') diff = b.margin - a.margin;
        else if (profitSort === 'name') diff = a.name.localeCompare(b.name);
        return profitSortAsc ? -diff : diff;
      });
  }, [productProfitList, profitSearch, profitSort, profitSortAsc]);

  const filteredCustomerProfits = useMemo(() => {
    return customerProfitList
      .filter(c => c.name.toLowerCase().includes(profitSearch.toLowerCase()) || c.code.toLowerCase().includes(profitSearch.toLowerCase()))
      .sort((a, b) => {
        let diff = 0;
        if (profitSort === 'profit') diff = b.grossProfit - a.grossProfit;
        else if (profitSort === 'revenue') diff = b.revenue - a.revenue;
        else if (profitSort === 'margin') diff = b.margin - a.margin;
        else if (profitSort === 'name') diff = a.name.localeCompare(b.name);
        return profitSortAsc ? -diff : diff;
      });
  }, [customerProfitList, profitSearch, profitSort, profitSortAsc]);

  const topProfitChartData = useMemo(() => {
    if (profitViewMode === 'product') {
      return [...productProfitList]
        .sort((a, b) => b.grossProfit - a.grossProfit)
        .slice(0, 5)
        .map(p => ({
          name: p.name.length > 16 ? p.name.slice(0, 16) + '...' : p.name,
          profit: p.grossProfit,
          revenue: p.revenue,
        }));
    } else {
      return [...customerProfitList]
        .sort((a, b) => b.grossProfit - a.grossProfit)
        .slice(0, 5)
        .map(c => ({
          name: c.name.length > 16 ? c.name.slice(0, 16) + '...' : c.name,
          profit: c.grossProfit,
          revenue: c.revenue,
        }));
    }
  }, [profitViewMode, productProfitList, customerProfitList]);

  // =========================================================================
  // EXPORT EXCEL HANDLER
  // =========================================================================
  const handleExport = () => {
    if (activeTab === 'ton-kho') {
      exportToExcelFile(
        filteredInventory,
        [
          { key: 'name', header: 'Sản phẩm' },
          { key: 'sku', header: 'Mã SKU' },
          { key: 'stock', header: 'Tồn' },
          { key: 'value', header: 'Giá trị' },
          { key: 'statusText', header: 'Trạng thái' },
        ],
        'Bao_cao_ton_kho'
      );
    } else if (activeTab === 'cong-no') {
      exportToExcelFile(
        filteredDebtCustomers,
        [
          { key: 'name', header: 'Khách hàng' },
          { key: 'totalPurchase', header: 'Tổng mua' },
          { key: 'remainingDebt', header: 'Còn nợ' },
        ],
        'Bao_cao_cong_no_khach_hang'
      );
    } else if (activeTab === 'top-san-pham') {
      exportToExcelFile(
        filteredTopProducts,
        [
          { key: 'name', header: 'Sản phẩm' },
          { key: 'quantity', header: 'SL bán' },
          { key: 'revenue', header: 'Doanh thu' },
          { key: 'profit', header: 'Lợi nhuận' },
        ],
        'Bao_cao_top_san_pham'
      );
    } else if (activeTab === 'top-khach-hang') {
      exportToExcelFile(
        filteredTopCustomers,
        [
          { key: 'name', header: 'Khách hàng' },
          { key: 'totalPurchase', header: 'Tổng mua' },
          { key: 'remainingDebt', header: 'Còn nợ' },
        ],
        'Bao_cao_top_khach_hang'
      );
    } else if (activeTab === 'top-ncc') {
      exportToExcelFile(
        filteredTopSuppliers,
        [
          { key: 'name', header: 'Nhà cung cấp' },
          { key: 'totalPurchase', header: 'Tổng mua' },
          { key: 'remainingDebt', header: 'Còn nợ' },
        ],
        'Bao_cao_top_nha_cung_cap'
      );
    } else if (activeTab === 'loi-nhuan') {
      if (profitViewMode === 'product') {
        exportToExcelFile(
          filteredProductProfits,
          [
            { key: 'sku', header: 'Mã SKU' },
            { key: 'name', header: 'Tên sản phẩm' },
            { key: 'unit', header: 'ĐVT' },
            { key: 'soldQty', header: 'SL đã bán' },
            { key: 'revenue', header: 'Doanh thu (đ)' },
            { key: 'cogs', header: 'Giá vốn (đ)' },
            { key: 'grossProfit', header: 'Lợi nhuận gộp (đ)' },
            { key: 'margin', header: 'Biên LN (%)', format: val => `${Number(val).toFixed(1)}%` },
          ],
          'Phan_tich_loi_nhuan_theo_mat_hang'
        );
      } else {
        exportToExcelFile(
          filteredCustomerProfits,
          [
            { key: 'code', header: 'Mã khách hàng' },
            { key: 'name', header: 'Tên khách hàng' },
            { key: 'orderCount', header: 'Số đơn hàng' },
            { key: 'revenue', header: 'Doanh thu (đ)' },
            { key: 'cogs', header: 'Giá vốn (đ)' },
            { key: 'grossProfit', header: 'Lợi nhuận gộp (đ)' },
            { key: 'margin', header: 'Biên LN (%)', format: val => `${Number(val).toFixed(1)}%` },
            { key: 'remainingDebt', header: 'Công nợ hiện tại (đ)' },
          ],
          'Phan_tich_loi_nhuan_theo_khach_hang'
        );
      }
    } else {
      exportToExcelFile(
        dailyChartData,
        [
          { key: 'day', header: 'Ngày' },
          { key: 'revenue', header: 'Doanh thu' },
          { key: 'cost', header: 'Chi phí' },
          { key: 'profit', header: 'Lợi nhuận' },
        ],
        'Bao_cao_tong_hop'
      );
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-12">
      {/* ========================================================= */}
      {/* PAGE HEADER: "Báo cáo vận hành"                           */}
      {/* ========================================================= */}
      <div>
        <h1 className="text-[22px] sm:text-[24px] font-bold text-[#111827] dark:text-[#F8FAFC] tracking-tight">
          Báo cáo vận hành
        </h1>
        <p className="text-[13px] sm:text-[14px] text-[#6B7280] dark:text-[#94A3B8] mt-1">
          Tổng hợp các chỉ số kinh doanh quan trọng nhất của doanh nghiệp
        </p>
      </div>

      {/* ========================================================= */}
      {/* TABS NAVIGATION BAR (Underline matching screenshots)       */}
      {/* ========================================================= */}
      <div className="flex items-center gap-6 sm:gap-8 border-b border-[#E5E7EB] dark:border-[#334155] overflow-x-auto no-scrollbar">
        {tabs.map(tab => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`pb-3 text-[13.5px] sm:text-[14px] whitespace-nowrap transition-all relative cursor-pointer ${
                isActive
                  ? 'text-[#6D3EEB] dark:text-[#C084FC] font-bold'
                  : 'text-[#4B5563] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-[#F8FAFC] font-medium'
              }`}
            >
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#6D3EEB] dark:bg-[#C084FC] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* UNIFORM TOP FILTER BAR (Exact match to all 6 screenshots) */}
      {/* ========================================================= */}
      <div className="p-3 sm:p-3.5 bg-white dark:bg-[#1E293B] rounded-[16px] border border-[#F1F2F5] dark:border-[#334155] shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Square Tune Icon Button */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[10px] bg-transparent border border-[#E5E7EB] dark:border-[#334155] text-[#6D3EEB] dark:text-[#C084FC] flex items-center justify-center shrink-0">
            <Icon name="tune" size={19} />
          </div>

          {/* Preset Select Dropdown */}
          <div className="relative">
            <select
              value={preset}
              onChange={e => handlePresetChange(e.target.value)}
              className="h-9 sm:h-10 pl-3 pr-7 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[13px] sm:text-[13.5px] font-medium text-[#111827] dark:text-[#F8FAFC] outline-none cursor-pointer appearance-none"
            >
              <option value="Hôm nay">Hôm nay</option>
              <option value="Hôm qua">Hôm qua</option>
              <option value="7 ngày qua">7 ngày qua</option>
              <option value="Tháng này">Tháng này</option>
              <option value="Tháng trước">Tháng trước</option>
              <option value="Quý này">Quý này</option>
              <option value="Năm nay">Năm nay</option>
            </select>
            <Icon
              name="expand_more"
              size={16}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none"
            />
          </div>

          {/* Date Range: [From Date] đến [To Date] */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="relative">
              <input
                type="date"
                value={fromDate}
                onChange={e => {
                  setFromDate(e.target.value);
                  setPreset('Tùy chọn');
                }}
                className="h-9 sm:h-10 px-2.5 sm:px-3 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[12.5px] sm:text-[13px] text-[#111827] dark:text-[#F8FAFC] outline-none"
              />
            </div>
            <span className="text-[12.5px] text-[#6B7280] dark:text-[#94A3B8]">đến</span>
            <div className="relative">
              <input
                type="date"
                value={toDate}
                onChange={e => {
                  setToDate(e.target.value);
                  setPreset('Tùy chọn');
                }}
                className="h-9 sm:h-10 px-2.5 sm:px-3 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[12.5px] sm:text-[13px] text-[#111827] dark:text-[#F8FAFC] outline-none"
              />
            </div>
          </div>

          {/* Purple "Lọc" Button */}
          <button
            type="button"
            onClick={() => alert(`Đã áp dụng bộ lọc: ${preset} (${fromDate} đến ${toDate})`)}
            className="h-9 sm:h-10 px-3.5 sm:px-4 bg-[#6D3EEB] hover:bg-[#5B2BD6] active:bg-[#4E1DC4] text-white text-[13px] sm:text-[13.5px] font-semibold rounded-[10px] flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Icon name="filter_alt" size={17} />
            <span>Lọc</span>
          </button>
        </div>

        {/* Right Action: Xuất Excel Button */}
        <button
          type="button"
          onClick={handleExport}
          className="h-9 sm:h-10 px-3.5 sm:px-4 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] hover:border-[#6D3EEB] text-[#4B5563] dark:text-[#CBD5E1] hover:text-[#6D3EEB] dark:hover:text-[#C084FC] text-[12.5px] sm:text-[13px] font-semibold rounded-[10px] flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
        >
          <Icon name="download" size={17} />
          <span>Xuất Excel</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: TỔNG HỢP (Matching Screenshot 1.png)               */}
      {/* ========================================================= */}
      {activeTab === 'tong-hop' && (
        <div className="space-y-4 sm:space-y-6">
          {/* 4 Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {/* Card 1: Doanh thu */}
            <div className="bg-white dark:bg-[#1E293B] rounded-[16px] p-4 sm:p-5 border border-[#F1F2F5] dark:border-[#334155] shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-[12px] bg-[#F3EBFE] dark:bg-purple-950/60 text-[#6D3EEB] dark:text-[#C084FC] flex items-center justify-center shrink-0">
                <Icon name="sell" size={22} />
              </div>
              <div className="min-w-0">
                <div className="text-[12.5px] font-medium text-[#6B7280] dark:text-[#94A3B8]">
                  Doanh thu
                </div>
                <div className="text-[18px] sm:text-[20px] font-bold text-[#111827] dark:text-[#F8FAFC] tracking-tight truncate mt-0.5">
                  {formatCurrency(revenue)}
                </div>
              </div>
            </div>

            {/* Card 2: Chi phí (giá vốn) */}
            <div className="bg-white dark:bg-[#1E293B] rounded-[16px] p-4 sm:p-5 border border-[#F1F2F5] dark:border-[#334155] shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-[12px] bg-[#FFFBEB] dark:bg-amber-950/60 text-[#D97706] dark:text-[#F59E0B] flex items-center justify-center shrink-0">
                <Icon name="shopping_bag" size={22} />
              </div>
              <div className="min-w-0">
                <div className="text-[12.5px] font-medium text-[#6B7280] dark:text-[#94A3B8]">
                  Chi phí (giá vốn)
                </div>
                <div className="text-[18px] sm:text-[20px] font-bold text-[#111827] dark:text-[#F8FAFC] tracking-tight truncate mt-0.5">
                  {formatCurrency(cogs)}
                </div>
              </div>
            </div>

            {/* Card 3: Lợi nhuận */}
            <div className="bg-white dark:bg-[#1E293B] rounded-[16px] p-4 sm:p-5 border border-[#F1F2F5] dark:border-[#334155] shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-[12px] bg-[#ECFDF5] dark:bg-emerald-950/60 text-[#059669] dark:text-[#34D399] flex items-center justify-center shrink-0">
                <Icon name="savings" size={22} />
              </div>
              <div className="min-w-0">
                <div className="text-[12.5px] font-medium text-[#6B7280] dark:text-[#94A3B8]">
                  Lợi nhuận
                </div>
                <div className="text-[18px] sm:text-[20px] font-bold text-[#111827] dark:text-[#F8FAFC] tracking-tight truncate mt-0.5">
                  {formatCurrency(profit)}
                </div>
              </div>
            </div>

            {/* Card 4: Tổng mua hàng (thuần) */}
            <div className="bg-white dark:bg-[#1E293B] rounded-[16px] p-4 sm:p-5 border border-[#F1F2F5] dark:border-[#334155] shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-[12px] bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center shrink-0">
                <Icon name="shopping_cart" size={22} />
              </div>
              <div className="min-w-0">
                <div className="text-[12.5px] font-medium text-[#6B7280] dark:text-[#94A3B8]">
                  Tổng mua hàng (thuần)
                </div>
                <div className="text-[18px] sm:text-[20px] font-bold text-[#111827] dark:text-[#F8FAFC] tracking-tight truncate mt-0.5">
                  {formatCurrency(purchases)}
                </div>
              </div>
            </div>
          </div>

          {/* Chart Container */}
          <div className="bg-white dark:bg-[#1E293B] rounded-[16px] p-4 sm:p-6 border border-[#F1F2F5] dark:border-[#334155] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-2 border-b border-[#F1F2F5] dark:border-[#334155]/60">
              <div>
                <h3 className="text-[15px] sm:text-[16px] font-bold text-[#111827] dark:text-[#F8FAFC]">
                  Biểu đồ doanh thu, chi phí &amp; lợi nhuận
                </h3>
                <p className="text-[12px] sm:text-[12.5px] text-[#6B7280] dark:text-[#94A3B8] mt-0.5">
                  Xem tương quan 3 chỉ số trong cùng một biểu đồ
                </p>
              </div>
              <span className="text-[11.5px] font-mono text-[#6B7280] dark:text-[#94A3B8] self-start sm:self-auto">
                {fromDate} - {toDate}
              </span>
            </div>

            {/* Recharts Composed Chart with 27-day series */}
            <div className="h-72 sm:h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dailyChartData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                    interval={window.innerWidth < 640 ? 3 : 0}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                    tickFormatter={val => `${val / 1000}k`}
                  />
                  <Tooltip
                    formatter={(val: any) => formatCurrency(Number(val))}
                    labelFormatter={label => `Ngày ${label}`}
                  />
                  <Bar dataKey="revenue" name="Doanh thu" fill="#8B5CF6" barSize={10} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="cost" name="Chi phí" fill="#F5B03E" barSize={10} radius={[3, 3, 0, 0]} />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    name="Lợi nhuận"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: '#10B981' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Bottom Legend matching Screenshot 1.png */}
            <div className="flex items-center justify-center gap-6 pt-4 text-[12.5px] font-medium text-[#4B5563] dark:text-[#CBD5E1]">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#10B981] inline-block" />
                <span>Lợi nhuận</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#8B5CF6] inline-block" />
                <span>Doanh thu</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#F5B03E] inline-block" />
                <span>Chi phí</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB: PHÂN TÍCH LỢI NHUẬN (GÓI 6)                          */}
      {/* ========================================================= */}
      {activeTab === 'loi-nhuan' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-[#1E293B] rounded-[16px] p-4 sm:p-5 border border-[#F1F2F5] dark:border-[#334155] shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-[12px] bg-[#F5F3FF] dark:bg-purple-950/60 text-[#7C3AED] dark:text-[#A78BFA] flex items-center justify-center shrink-0">
                <Icon name="attach_money" size={22} />
              </div>
              <div className="min-w-0">
                <div className="text-[12px] sm:text-[12.5px] font-medium text-[#6B7280] dark:text-[#94A3B8]">
                  Tổng doanh thu
                </div>
                <div className="text-[17px] sm:text-[20px] font-bold text-[#111827] dark:text-[#F8FAFC] tracking-tight truncate mt-0.5">
                  {formatCurrency(totalProfitRevenue)}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1E293B] rounded-[16px] p-4 sm:p-5 border border-[#F1F2F5] dark:border-[#334155] shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-[12px] bg-[#FFFBEB] dark:bg-amber-950/60 text-[#D97706] dark:text-[#F59E0B] flex items-center justify-center shrink-0">
                <Icon name="shopping_bag" size={22} />
              </div>
              <div className="min-w-0">
                <div className="text-[12px] sm:text-[12.5px] font-medium text-[#6B7280] dark:text-[#94A3B8]">
                  Giá vốn hàng bán (COGS)
                </div>
                <div className="text-[17px] sm:text-[20px] font-bold text-[#111827] dark:text-[#F8FAFC] tracking-tight truncate mt-0.5">
                  {formatCurrency(totalProfitCOGS)}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1E293B] rounded-[16px] p-4 sm:p-5 border border-[#F1F2F5] dark:border-[#334155] shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-[12px] bg-[#ECFDF5] dark:bg-emerald-950/60 text-[#059669] dark:text-[#34D399] flex items-center justify-center shrink-0">
                <Icon name="savings" size={22} />
              </div>
              <div className="min-w-0">
                <div className="text-[12px] sm:text-[12.5px] font-medium text-[#6B7280] dark:text-[#94A3B8]">
                  Lợi nhuận gộp
                </div>
                <div className="text-[17px] sm:text-[20px] font-bold text-[#059669] dark:text-[#34D399] tracking-tight truncate mt-0.5">
                  {formatCurrency(totalProfitGross)}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1E293B] rounded-[16px] p-4 sm:p-5 border border-[#F1F2F5] dark:border-[#334155] shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-[12px] bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center shrink-0">
                <Icon name="trending_up" size={22} />
              </div>
              <div className="min-w-0">
                <div className="text-[12px] sm:text-[12.5px] font-medium text-[#6B7280] dark:text-[#94A3B8]">
                  Biên lợi nhuận bình quân
                </div>
                <div className="text-[17px] sm:text-[20px] font-bold text-[#2563EB] dark:text-[#60A5FA] tracking-tight truncate mt-0.5">
                  {avgProfitMargin.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Chart Top 5 Profit */}
          <div className="bg-white dark:bg-[#1E293B] rounded-[16px] p-4 sm:p-6 border border-[#F1F2F5] dark:border-[#334155] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-2 border-b border-[#F1F2F5] dark:border-[#334155]/60">
              <div>
                <h3 className="text-[15px] sm:text-[16px] font-bold text-[#111827] dark:text-[#F8FAFC]">
                  Top 5 {profitViewMode === 'product' ? 'Mặt hàng' : 'Khách hàng'} sinh lời cao nhất
                </h3>
                <p className="text-[12px] sm:text-[12.5px] text-[#6B7280] dark:text-[#94A3B8] mt-0.5">
                  So sánh tương quan giữa Doanh thu và Lợi nhuận gộp thực thu
                </p>
              </div>
              <div className="flex items-center gap-4 text-[12px] font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#6D3EEB] inline-block" />
                  <span className="text-[#4B5563] dark:text-[#CBD5E1]">Doanh thu</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#10B981] inline-block" />
                  <span className="text-[#4B5563] dark:text-[#CBD5E1]">Lợi nhuận gộp</span>
                </span>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={topProfitChartData} margin={{ top: 10, right: 15, left: -10, bottom: 25 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                    tickFormatter={val => `${val / 1000}k`}
                  />
                  <Tooltip
                    formatter={(val: any) => formatCurrency(Number(val))}
                    labelFormatter={label => `${label}`}
                  />
                  <Bar dataKey="revenue" name="Doanh thu" fill="#8B5CF6" barSize={18} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="Lợi nhuận" fill="#10B981" barSize={18} radius={[4, 4, 0, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subheader: View Switcher, Search, Sort & Export */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-[#1E293B] p-3 sm:p-3.5 rounded-[16px] border border-[#F1F2F5] dark:border-[#334155] shadow-xs">
            {/* View Mode Toggle Switch */}
            <div className="flex items-center bg-gray-100 dark:bg-slate-800/80 p-1 rounded-[12px] shrink-0">
              <button
                type="button"
                onClick={() => setProfitViewMode('product')}
                className={`px-3 py-1.5 rounded-[9px] text-[12.5px] sm:text-[13px] font-semibold transition-all cursor-pointer ${
                  profitViewMode === 'product'
                    ? 'bg-white dark:bg-slate-700 text-[#6D3EEB] dark:text-[#C084FC] shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                Theo Mặt Hàng ({productProfitList.length})
              </button>
              <button
                type="button"
                onClick={() => setProfitViewMode('customer')}
                className={`px-3 py-1.5 rounded-[9px] text-[12.5px] sm:text-[13px] font-semibold transition-all cursor-pointer ${
                  profitViewMode === 'customer'
                    ? 'bg-white dark:bg-slate-700 text-[#6D3EEB] dark:text-[#C084FC] shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                Theo Khách Hàng ({customerProfitList.length})
              </button>
            </div>

            {/* Search Input */}
            <div className="flex-1 min-w-[200px] relative">
              <Icon name="search" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder={profitViewMode === 'product' ? 'Tìm theo tên sản phẩm, mã SKU...' : 'Tìm theo tên khách, mã KH...'}
                value={profitSearch}
                onChange={e => setProfitSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-3.5 bg-transparent border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[13px] text-[#111827] dark:text-[#F8FAFC] placeholder:text-[#9CA3AF] outline-none focus:border-[#6D3EEB]"
              />
            </div>

            {/* Sort & Export controls */}
            <div className="flex items-center gap-2">
              <select
                value={profitSort}
                onChange={e => setProfitSort(e.target.value as any)}
                className="h-10 px-3 bg-transparent border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[13px] text-[#4B5563] dark:text-[#CBD5E1] outline-none cursor-pointer"
              >
                <option value="profit">Sắp xếp: Lợi nhuận</option>
                <option value="revenue">Sắp xếp: Doanh thu</option>
                <option value="margin">Sắp xếp: % Biên LN</option>
                <option value="name">Sắp xếp: Tên A-Z</option>
              </select>

              <button
                type="button"
                onClick={() => setProfitSortAsc(!profitSortAsc)}
                title="Đảo chiều sắp xếp"
                className="w-10 h-10 rounded-[10px] bg-transparent border border-[#E5E7EB] dark:border-[#334155] flex items-center justify-center text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] cursor-pointer"
              >
                <Icon name={profitSortAsc ? 'arrow_upward' : 'arrow_downward'} size={18} />
              </button>

              <button
                type="button"
                onClick={handleExport}
                className="h-10 px-3.5 bg-transparent border border-[#6D3EEB] text-[#6D3EEB] dark:text-[#C084FC] hover:bg-[#6D3EEB]/10 rounded-[10px] text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Icon name="download" size={17} />
                <span>Xuất Excel</span>
              </button>
            </div>
          </div>

          {/* Table: Product Profitability View */}
          {profitViewMode === 'product' && (
            <div className="bg-white dark:bg-[#1E293B] rounded-[16px] border border-[#E5E7EB] dark:border-[#334155] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13.5px]">
                  <thead className="bg-transparent text-[#6B7280] dark:text-[#94A3B8] text-[11.5px] uppercase font-bold border-b border-[#E5E7EB] dark:border-[#334155]">
                    <tr>
                      <th className="py-3 px-4">Mã SKU</th>
                      <th className="py-3 px-4">Tên sản phẩm</th>
                      <th className="py-3 px-4 text-center">ĐVT</th>
                      <th className="py-3 px-4 text-right">SL bán</th>
                      <th className="py-3 px-4 text-right">Doanh thu</th>
                      <th className="py-3 px-4 text-right">Giá vốn</th>
                      <th className="py-3 px-4 text-right">Lợi nhuận gộp</th>
                      <th className="py-3 px-4 text-right">% Biên LN</th>
                      <th className="py-3 px-4 text-center">Đánh giá</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F2F5] dark:divide-[#334155]">
                    {filteredProductProfits.map(item => {
                      const tier =
                        item.margin >= 40
                          ? { label: 'Rất cao', color: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-300 dark:border-emerald-800/50' }
                          : item.margin >= 25
                          ? { label: 'Tốt', color: 'text-blue-700 dark:text-blue-400', border: 'border-blue-300 dark:border-blue-800/50' }
                          : item.margin >= 15
                          ? { label: 'Trung bình', color: 'text-amber-800 dark:text-amber-400', border: 'border-amber-300 dark:border-amber-800/50' }
                          : { label: 'Thấp', color: 'text-rose-700 dark:text-rose-400', border: 'border-rose-300 dark:border-rose-800/50' };

                      return (
                        <tr key={item.id} className="hover:bg-gray-50/70 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-semibold text-[#6D3EEB] dark:text-[#C084FC]">
                            {item.sku}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-[#111827] dark:text-[#F8FAFC]">
                            {item.name}
                          </td>
                          <td className="py-3.5 px-4 text-center text-[#6B7280] dark:text-[#94A3B8]">
                            {item.unit}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-medium text-[#111827] dark:text-[#F8FAFC]">
                            {formatQuantity(item.soldQty)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-[#111827] dark:text-[#F8FAFC]">
                            {formatCurrency(item.revenue)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-[#6B7280] dark:text-[#94A3B8]">
                            {formatCurrency(item.cogs)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(item.grossProfit)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold">
                            {item.margin.toFixed(1)}%
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${tier.color} ${tier.border}`}>
                              {tier.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="py-3 px-4 bg-transparent border-t border-[#F1F2F5] dark:border-[#334155] flex items-center justify-between text-[12.5px] text-[#6B7280] dark:text-[#94A3B8]">
                <span>Hiển thị <strong>{filteredProductProfits.length}</strong> mặt hàng</span>
                <span>Tổng LN gộp lọc: <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(filteredProductProfits.reduce((s, p) => s + p.grossProfit, 0))}</strong></span>
              </div>
            </div>
          )}

          {/* Table: Customer Profitability View */}
          {profitViewMode === 'customer' && (
            <div className="bg-white dark:bg-[#1E293B] rounded-[16px] border border-[#E5E7EB] dark:border-[#334155] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13.5px]">
                  <thead className="bg-transparent text-[#6B7280] dark:text-[#94A3B8] text-[11.5px] uppercase font-bold border-b border-[#E5E7EB] dark:border-[#334155]">
                    <tr>
                      <th className="py-3 px-4">Mã KH</th>
                      <th className="py-3 px-4">Khách hàng</th>
                      <th className="py-3 px-4 text-center">Số đơn</th>
                      <th className="py-3 px-4 text-right">Doanh thu</th>
                      <th className="py-3 px-4 text-right">Giá vốn</th>
                      <th className="py-3 px-4 text-right">Lợi nhuận gộp</th>
                      <th className="py-3 px-4 text-right">% Biên LN</th>
                      <th className="py-3 px-4 text-right">Nợ hiện tại</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F2F5] dark:divide-[#334155]">
                    {filteredCustomerProfits.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50/70 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-semibold text-[#6D3EEB] dark:text-[#C084FC]">
                          {item.code}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-[#111827] dark:text-[#F8FAFC]">
                          {item.name}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-[#4B5563] dark:text-[#CBD5E1]">
                          {item.orderCount}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-[#111827] dark:text-[#F8FAFC]">
                          {formatCurrency(item.revenue)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-[#6B7280] dark:text-[#94A3B8]">
                          {formatCurrency(item.cogs)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(item.grossProfit)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold">
                          {item.margin.toFixed(1)}%
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold">
                          <span className={item.remainingDebt > 0 ? 'text-[#E11D48] dark:text-[#FB7185]' : 'text-[#111827] dark:text-[#CBD5E1]'}>
                            {formatCurrency(item.remainingDebt)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="py-3 px-4 bg-transparent border-t border-[#F1F2F5] dark:border-[#334155] flex items-center justify-between text-[12.5px] text-[#6B7280] dark:text-[#94A3B8]">
                <span>Hiển thị <strong>{filteredCustomerProfits.length}</strong> khách hàng</span>
                <span>Tổng LN gộp lọc: <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(filteredCustomerProfits.reduce((s, c) => s + c.grossProfit, 0))}</strong></span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: TỒN KHO (Matching Screenshot 2.png)                */}
      {/* ========================================================= */}
      {activeTab === 'ton-kho' && (
        <div className="space-y-3.5">
          {/* Search & Controls Bar matching 2.png */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex-1 min-w-[220px] relative">
              <Icon
                name="search"
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
              />
              <input
                type="text"
                placeholder="Tìm sản phẩm, mã SKU..."
                value={inventorySearch}
                onChange={e => setInventorySearch(e.target.value)}
                className="w-full h-10 pl-10 pr-3.5 bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[13px] text-[#111827] dark:text-[#F8FAFC] placeholder:text-[#9CA3AF] outline-none focus:border-[#6D3EEB]"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Status filter */}
              <select
                value={inventoryStatus}
                onChange={e => setInventoryStatus(e.target.value)}
                className="h-10 px-3 bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[13px] text-[#4B5563] dark:text-[#CBD5E1] outline-none cursor-pointer"
              >
                <option value="all">Trạng thái: Tất cả</option>
                <option value="ok">Còn hàng</option>
                <option value="low">Sắp hết</option>
                <option value="out">Hết hàng</option>
              </select>

              {/* Sort by */}
              <select
                value={inventorySort}
                onChange={e => setInventorySort(e.target.value as any)}
                className="h-10 px-3 bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[13px] text-[#4B5563] dark:text-[#CBD5E1] outline-none cursor-pointer"
              >
                <option value="value">Sắp xếp theo giá trị</option>
                <option value="stock">Sắp xếp theo tồn kho</option>
                <option value="name">Sắp xếp theo tên SP</option>
                <option value="sku">Sắp xếp theo mã SKU</option>
              </select>

              {/* Sort Direction Toggle */}
              <button
                type="button"
                onClick={() => setInventorySortAsc(!inventorySortAsc)}
                title="Đảo chiều sắp xếp"
                className="w-10 h-10 rounded-[10px] bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] flex items-center justify-center text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] cursor-pointer"
              >
                <Icon name={inventorySortAsc ? 'arrow_upward' : 'arrow_downward'} size={18} />
              </button>

              {/* Filter Icon */}
              <button
                type="button"
                onClick={() => alert('Bộ lọc nâng cao tồn kho đã sẵn sàng')}
                className="w-10 h-10 rounded-[10px] bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] flex items-center justify-center text-[#6B7280] dark:text-[#94A3B8] hover:text-[#6D3EEB] cursor-pointer"
              >
                <Icon name="tune" size={18} />
              </button>

              {/* Bookmark Icon */}
              <button
                type="button"
                onClick={() => toggleBookmark('ton-kho')}
                className={`w-10 h-10 rounded-[10px] bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] flex items-center justify-center cursor-pointer transition-colors ${
                  isBookmarked['ton-kho'] ? 'text-[#6D3EEB]' : 'text-[#6B7280] dark:text-[#94A3B8]'
                }`}
              >
                <Icon name="bookmark" size={18} />
              </button>

              {/* Excel Button */}
              <button
                type="button"
                onClick={handleExport}
                className="h-10 px-3.5 bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] text-[#4B5563] dark:text-[#CBD5E1] text-[13px] font-semibold rounded-[10px] flex items-center gap-1.5 cursor-pointer shadow-2xs hover:border-[#6D3EEB]"
              >
                <Icon name="download" size={16} />
                <span className="hidden sm:inline">Xuất Excel</span>
              </button>
            </div>
          </div>

          {/* Table matching 2.png */}
          <div className="bg-white dark:bg-[#1E293B] rounded-[16px] border border-[#E5E7EB] dark:border-[#334155] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13.5px]">
                <thead className="bg-transparent text-[#6B7280] dark:text-[#94A3B8] text-[11.5px] uppercase font-bold border-b border-[#E5E7EB] dark:border-[#334155]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">
                      <span className="flex items-center gap-1 cursor-pointer" onClick={() => { setInventorySort('name'); setInventorySortAsc(!inventorySortAsc); }}>
                        <span>SẢN PHẨM</span>
                        <Icon name="unfold_more" size={15} />
                      </span>
                    </th>
                    <th className="py-3 px-4 font-semibold">
                      <span className="flex items-center gap-1 cursor-pointer" onClick={() => { setInventorySort('sku'); setInventorySortAsc(!inventorySortAsc); }}>
                        <span>MÃ SKU</span>
                        <Icon name="unfold_more" size={15} />
                      </span>
                    </th>
                    <th className="py-3 px-4 text-right font-semibold">
                      <span className="flex items-center justify-end gap-1 cursor-pointer" onClick={() => { setInventorySort('stock'); setInventorySortAsc(!inventorySortAsc); }}>
                        <span>TỒN</span>
                        <Icon name="unfold_more" size={15} />
                      </span>
                    </th>
                    <th className="py-3 px-4 text-right font-semibold">
                      <span className="flex items-center justify-end gap-1 cursor-pointer" onClick={() => { setInventorySort('value'); setInventorySortAsc(!inventorySortAsc); }}>
                        <span>GIÁ TRỊ</span>
                        <Icon name="unfold_more" size={15} />
                      </span>
                    </th>
                    <th className="py-3 px-4 text-center font-semibold">
                      <span className="flex items-center justify-center gap-1">
                        <span>TRẠNG THÁI</span>
                        <Icon name="unfold_more" size={15} />
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F2F5] dark:divide-[#334155]">
                  {filteredInventory.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/70 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-[#111827] dark:text-[#F8FAFC]">
                        {item.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[13px] text-[#4B5563] dark:text-[#CBD5E1]">
                        {item.sku}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-[#111827] dark:text-[#F8FAFC] tabular-nums">
                        {formatQuantity(item.stock)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-[#111827] dark:text-[#F8FAFC] tabular-nums">
                        {formatCurrency(item.value)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${
                            item.status === 'ok'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : item.status === 'low'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}
                        >
                          {item.statusText}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Table Footer */}
            <div className="py-3 px-4 bg-transparent border-t border-[#F1F2F5] dark:border-[#334155] text-[12.5px] text-[#6B7280] dark:text-[#94A3B8]">
              {filteredInventory.length} kết quả
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: CÔNG NỢ (Matching Screenshot 3.png - 2 Cards)      */}
      {/* ========================================================= */}
      {activeTab === 'cong-no' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-start">
          {/* Card 1: Top khách hàng còn nợ */}
          <div className="bg-white dark:bg-[#1E293B] rounded-[16px] p-4 sm:p-5 border border-[#F1F2F5] dark:border-[#334155] shadow-xs space-y-4">
            <h3 className="text-[15px] font-bold text-[#111827] dark:text-[#F8FAFC]">
              Top khách hàng còn nợ
            </h3>

            {/* Controls Bar inside Card */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex-1 min-w-[140px] relative">
                <Icon name="search" size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={debtCustSearch}
                  onChange={e => setDebtCustSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 bg-transparent border border-[#E5E7EB] dark:border-[#334155] rounded-[9px] text-[12.5px] text-[#111827] dark:text-[#F8FAFC] outline-none"
                />
              </div>

              <select className="h-9 px-2.5 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] rounded-[9px] text-[12px] text-[#4B5563] dark:text-[#CBD5E1] outline-none">
                <option>Sắp xếp theo nợ</option>
                <option>Sắp xếp theo tên</option>
              </select>

              <button
                type="button"
                onClick={() => setDebtCustSortAsc(!debtCustSortAsc)}
                className="w-9 h-9 rounded-[9px] bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] flex items-center justify-center text-[#6B7280] dark:text-[#94A3B8]"
              >
                <Icon name={debtCustSortAsc ? 'arrow_upward' : 'arrow_downward'} size={16} />
              </button>

              <button
                type="button"
                onClick={() => toggleBookmark('debt-cust')}
                className="w-9 h-9 rounded-[9px] bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] flex items-center justify-center text-[#6B7280] dark:text-[#94A3B8]"
              >
                <Icon name="bookmark" size={16} />
              </button>

              <button
                type="button"
                onClick={handleExport}
                className="h-9 px-3 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] text-[#4B5563] dark:text-[#CBD5E1] text-[12px] font-semibold rounded-[9px] flex items-center gap-1"
              >
                <Icon name="download" size={15} />
                <span>Xuất Excel</span>
              </button>
            </div>

            {/* Table: Top khách hàng còn nợ */}
            <div className="border border-[#E5E7EB] dark:border-[#334155] rounded-[12px] overflow-hidden">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-transparent text-[#6B7280] dark:text-[#94A3B8] text-[11px] uppercase font-bold border-b border-[#E5E7EB] dark:border-[#334155]">
                  <tr>
                    <th className="py-2.5 px-3.5 font-semibold">KHÁCH HÀNG</th>
                    <th className="py-2.5 px-3.5 text-right font-semibold">TỔNG MUA</th>
                    <th className="py-2.5 px-3.5 text-right font-semibold">CÒN NỢ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F2F5] dark:divide-[#334155]">
                  {filteredDebtCustomers.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50/70 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3.5 font-medium text-[#111827] dark:text-[#F8FAFC]">
                        {c.name}
                      </td>
                      <td className="py-3 px-3.5 text-right font-medium text-[#111827] dark:text-[#F8FAFC] tabular-nums">
                        {formatCurrency(c.totalPurchase)}
                      </td>
                      <td className="py-3 px-3.5 text-right font-bold text-[#E11D48] dark:text-[#FB7185] tabular-nums">
                        {formatCurrency(c.remainingDebt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="py-2.5 px-3.5 bg-transparent border-t border-[#F1F2F5] dark:border-[#334155] text-[12px] text-[#6B7280] dark:text-[#94A3B8]">
                {filteredDebtCustomers.length} kết quả
              </div>
            </div>
          </div>

          {/* Card 2: Top NCC còn nợ */}
          <div className="bg-white dark:bg-[#1E293B] rounded-[16px] p-4 sm:p-5 border border-[#F1F2F5] dark:border-[#334155] shadow-xs space-y-4">
            <h3 className="text-[15px] font-bold text-[#111827] dark:text-[#F8FAFC]">
              Top NCC còn nợ
            </h3>

            {/* Controls Bar inside Card */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex-1 min-w-[140px] relative">
                <Icon name="search" size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={debtSuppSearch}
                  onChange={e => setDebtSuppSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 bg-transparent border border-[#E5E7EB] dark:border-[#334155] rounded-[9px] text-[12.5px] text-[#111827] dark:text-[#F8FAFC] outline-none"
                />
              </div>

              <select className="h-9 px-2.5 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] rounded-[9px] text-[12px] text-[#4B5563] dark:text-[#CBD5E1] outline-none">
                <option>Sắp xếp theo nợ</option>
                <option>Sắp xếp theo tên</option>
              </select>

              <button
                type="button"
                onClick={() => setDebtSuppSortAsc(!debtSuppSortAsc)}
                className="w-9 h-9 rounded-[9px] bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] flex items-center justify-center text-[#6B7280] dark:text-[#94A3B8]"
              >
                <Icon name={debtSuppSortAsc ? 'arrow_upward' : 'arrow_downward'} size={16} />
              </button>

              <button
                type="button"
                onClick={() => toggleBookmark('debt-supp')}
                className="w-9 h-9 rounded-[9px] bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] flex items-center justify-center text-[#6B7280] dark:text-[#94A3B8]"
              >
                <Icon name="bookmark" size={16} />
              </button>

              <button
                type="button"
                onClick={handleExport}
                className="h-9 px-3 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] text-[#4B5563] dark:text-[#CBD5E1] text-[12px] font-semibold rounded-[9px] flex items-center gap-1"
              >
                <Icon name="download" size={15} />
                <span>Xuất Excel</span>
              </button>
            </div>

            {/* Empty State matching 3.png */}
            {filteredDebtSuppliers.length === 0 ? (
              <div className="border border-[#E5E7EB] dark:border-[#334155] rounded-[12px] flex flex-col justify-between min-h-[220px]">
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-12 h-12 rounded-[14px] bg-[#F3EBFE] dark:bg-purple-950/60 text-[#6D3EEB] dark:text-[#C084FC] flex items-center justify-center mb-3">
                    <Icon name="inventory_2" size={24} />
                  </div>
                  <span className="text-[13.5px] font-medium text-[#6B7280] dark:text-[#94A3B8]">
                    Chưa có dữ liệu
                  </span>
                </div>
                <div className="py-2.5 px-3.5 bg-transparent border-t border-[#F1F2F5] dark:border-[#334155] text-[12px] text-[#6B7280] dark:text-[#94A3B8]">
                  0 kết quả
                </div>
              </div>
            ) : (
              <div className="border border-[#E5E7EB] dark:border-[#334155] rounded-[12px] overflow-hidden">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-transparent text-[#6B7280] dark:text-[#94A3B8] text-[11px] uppercase font-bold border-b border-[#E5E7EB] dark:border-[#334155]">
                    <tr>
                      <th className="py-2.5 px-3.5 font-semibold">NHÀ CUNG CẤP</th>
                      <th className="py-2.5 px-3.5 text-right font-semibold">TỔNG MUA</th>
                      <th className="py-2.5 px-3.5 text-right font-semibold">CÒN NỢ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F2F5] dark:divide-[#334155]">
                    {filteredDebtSuppliers.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50/70 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-3.5 font-medium text-[#111827] dark:text-[#F8FAFC]">
                          {s.name}
                        </td>
                        <td className="py-3 px-3.5 text-right font-medium text-[#111827] dark:text-[#F8FAFC] tabular-nums">
                          {formatCurrency(s.totalPurchase)}
                        </td>
                        <td className="py-3 px-3.5 text-right font-bold text-[#E11D48] dark:text-[#FB7185] tabular-nums">
                          {formatCurrency(s.remainingDebt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="py-2.5 px-3.5 bg-transparent border-t border-[#F1F2F5] dark:border-[#334155] text-[12px] text-[#6B7280] dark:text-[#94A3B8]">
                  {filteredDebtSuppliers.length} kết quả
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: TOP SẢN PHẨM (Matching Screenshot 4.png)           */}
      {/* ========================================================= */}
      {activeTab === 'top-san-pham' && (
        <div className="space-y-3.5">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex-1 min-w-[220px] relative">
              <Icon name="search" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                value={topProdSearch}
                onChange={e => setTopProdSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-3.5 bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[13px] text-[#111827] dark:text-[#F8FAFC] placeholder:text-[#9CA3AF] outline-none focus:border-[#6D3EEB]"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={topProdSort}
                onChange={e => setTopProdSort(e.target.value as any)}
                className="h-10 px-3 bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[13px] text-[#4B5563] dark:text-[#CBD5E1] outline-none cursor-pointer"
              >
                <option value="revenue">Sắp xếp theo doanh thu</option>
                <option value="quantity">Sắp xếp theo SL bán</option>
                <option value="profit">Sắp xếp theo lợi nhuận</option>
                <option value="name">Sắp xếp theo tên SP</option>
              </select>

              <button
                type="button"
                onClick={() => setTopProdSortAsc(!topProdSortAsc)}
                className="w-10 h-10 rounded-[10px] bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] flex items-center justify-center text-[#6B7280] dark:text-[#94A3B8]"
              >
                <Icon name={topProdSortAsc ? 'arrow_upward' : 'arrow_downward'} size={18} />
              </button>

              <button
                type="button"
                onClick={() => alert('Lọc sản phẩm bán chạy')}
                className="w-10 h-10 rounded-[10px] bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] flex items-center justify-center text-[#6B7280] dark:text-[#94A3B8]"
              >
                <Icon name="tune" size={18} />
              </button>

              <button
                type="button"
                onClick={() => toggleBookmark('top-prod')}
                className={`w-10 h-10 rounded-[10px] bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] flex items-center justify-center ${
                  isBookmarked['top-prod'] ? 'text-[#6D3EEB]' : 'text-[#6B7280] dark:text-[#94A3B8]'
                }`}
              >
                <Icon name="bookmark" size={18} />
              </button>

              <button
                type="button"
                onClick={handleExport}
                className="h-10 px-3.5 bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] text-[#4B5563] dark:text-[#CBD5E1] text-[13px] font-semibold rounded-[10px] flex items-center gap-1.5 cursor-pointer shadow-2xs hover:border-[#6D3EEB]"
              >
                <Icon name="download" size={16} />
                <span className="hidden sm:inline">Xuất Excel</span>
              </button>
            </div>
          </div>

          {/* Table matching 4.png */}
          <div className="bg-white dark:bg-[#1E293B] rounded-[16px] border border-[#E5E7EB] dark:border-[#334155] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13.5px]">
                <thead className="bg-transparent text-[#6B7280] dark:text-[#94A3B8] text-[11.5px] uppercase font-bold border-b border-[#E5E7EB] dark:border-[#334155]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">
                      <span className="flex items-center gap-1 cursor-pointer" onClick={() => { setTopProdSort('name'); setTopProdSortAsc(!topProdSortAsc); }}>
                        <span>SẢN PHẨM</span>
                        <Icon name="unfold_more" size={15} />
                      </span>
                    </th>
                    <th className="py-3 px-4 text-center font-semibold">
                      <span className="flex items-center justify-center gap-1 cursor-pointer" onClick={() => { setTopProdSort('quantity'); setTopProdSortAsc(!topProdSortAsc); }}>
                        <span>SL BÁN</span>
                        <Icon name="unfold_more" size={15} />
                      </span>
                    </th>
                    <th className="py-3 px-4 text-right font-semibold">
                      <span className="flex items-center justify-end gap-1 cursor-pointer" onClick={() => { setTopProdSort('revenue'); setTopProdSortAsc(!topProdSortAsc); }}>
                        <span>DOANH THU</span>
                        <Icon name="unfold_more" size={15} />
                      </span>
                    </th>
                    <th className="py-3 px-4 text-right font-semibold">
                      <span className="flex items-center justify-end gap-1 cursor-pointer" onClick={() => { setTopProdSort('profit'); setTopProdSortAsc(!topProdSortAsc); }}>
                        <span>LỢI NHUẬN</span>
                        <Icon name="unfold_more" size={15} />
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F2F5] dark:divide-[#334155]">
                  {filteredTopProducts.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/70 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-[#111827] dark:text-[#F8FAFC]">
                        {item.name}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-[#111827] dark:text-[#F8FAFC] tabular-nums">
                        {item.quantity}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-[#111827] dark:text-[#F8FAFC] tabular-nums">
                        {formatCurrency(item.revenue)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-[#059669] dark:text-[#34D399] tabular-nums">
                        {formatCurrency(item.profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="py-3 px-4 bg-transparent border-t border-[#F1F2F5] dark:border-[#334155] text-[12.5px] text-[#6B7280] dark:text-[#94A3B8]">
              {filteredTopProducts.length} kết quả
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: TOP KHÁCH HÀNG (Matching Screenshot 5.png)         */}
      {/* ========================================================= */}
      {activeTab === 'top-khach-hang' && (
        <div className="space-y-3.5">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex-1 min-w-[220px] relative">
              <Icon name="search" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Tìm khách hàng..."
                value={topCustSearch}
                onChange={e => setTopCustSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-3.5 bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[13px] text-[#111827] dark:text-[#F8FAFC] placeholder:text-[#9CA3AF] outline-none focus:border-[#6D3EEB]"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={topCustSort}
                onChange={e => setTopCustSort(e.target.value as any)}
                className="h-10 px-3 bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[13px] text-[#4B5563] dark:text-[#CBD5E1] outline-none cursor-pointer"
              >
                <option value="total">Sắp xếp theo tổng mua</option>
                <option value="debt">Sắp xếp theo nợ</option>
                <option value="name">Sắp xếp theo tên KH</option>
              </select>

              <button
                type="button"
                onClick={() => setTopCustSortAsc(!topCustSortAsc)}
                className="w-10 h-10 rounded-[10px] bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] flex items-center justify-center text-[#6B7280] dark:text-[#94A3B8]"
              >
                <Icon name={topCustSortAsc ? 'arrow_upward' : 'arrow_downward'} size={18} />
              </button>

              <button
                type="button"
                onClick={() => alert('Lọc khách hàng tiềm năng')}
                className="w-10 h-10 rounded-[10px] bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] flex items-center justify-center text-[#6B7280] dark:text-[#94A3B8]"
              >
                <Icon name="tune" size={18} />
              </button>

              <button
                type="button"
                onClick={() => toggleBookmark('top-cust')}
                className={`w-10 h-10 rounded-[10px] bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] flex items-center justify-center ${
                  isBookmarked['top-cust'] ? 'text-[#6D3EEB]' : 'text-[#6B7280] dark:text-[#94A3B8]'
                }`}
              >
                <Icon name="bookmark" size={18} />
              </button>

              <button
                type="button"
                onClick={handleExport}
                className="h-10 px-3.5 bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] text-[#4B5563] dark:text-[#CBD5E1] text-[13px] font-semibold rounded-[10px] flex items-center gap-1.5 cursor-pointer shadow-2xs hover:border-[#6D3EEB]"
              >
                <Icon name="download" size={16} />
                <span className="hidden sm:inline">Xuất Excel</span>
              </button>
            </div>
          </div>

          {/* Table matching 5.png */}
          <div className="bg-white dark:bg-[#1E293B] rounded-[16px] border border-[#E5E7EB] dark:border-[#334155] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13.5px]">
                <thead className="bg-transparent text-[#6B7280] dark:text-[#94A3B8] text-[11.5px] uppercase font-bold border-b border-[#E5E7EB] dark:border-[#334155]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">
                      <span className="flex items-center gap-1 cursor-pointer" onClick={() => { setTopCustSort('name'); setTopCustSortAsc(!topCustSortAsc); }}>
                        <span>KHÁCH HÀNG</span>
                        <Icon name="unfold_more" size={15} />
                      </span>
                    </th>
                    <th className="py-3 px-4 text-right font-semibold">
                      <span className="flex items-center justify-end gap-1 cursor-pointer" onClick={() => { setTopCustSort('total'); setTopCustSortAsc(!topCustSortAsc); }}>
                        <span>TỔNG MUA</span>
                        <Icon name="unfold_more" size={15} />
                      </span>
                    </th>
                    <th className="py-3 px-4 text-right font-semibold">
                      <span className="flex items-center justify-end gap-1 cursor-pointer" onClick={() => { setTopCustSort('debt'); setTopCustSortAsc(!topCustSortAsc); }}>
                        <span>CÒN NỢ</span>
                        <Icon name="unfold_more" size={15} />
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F2F5] dark:divide-[#334155]">
                  {filteredTopCustomers.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/70 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-[#111827] dark:text-[#F8FAFC]">
                        {item.name}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-[#111827] dark:text-[#F8FAFC] tabular-nums">
                        {formatCurrency(item.totalPurchase)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold tabular-nums">
                        <span className={item.remainingDebt > 0 ? 'text-[#E11D48] dark:text-[#FB7185]' : 'text-[#111827] dark:text-[#CBD5E1]'}>
                          {formatCurrency(item.remainingDebt)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="py-3 px-4 bg-transparent border-t border-[#F1F2F5] dark:border-[#334155] text-[12.5px] text-[#6B7280] dark:text-[#94A3B8]">
              {filteredTopCustomers.length} kết quả
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: TOP NCC (Matching Screenshot 6.png)                */}
      {/* ========================================================= */}
      {activeTab === 'top-ncc' && (
        <div className="space-y-3.5">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex-1 min-w-[220px] relative">
              <Icon name="search" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Tìm nhà cung cấp..."
                value={topSuppSearch}
                onChange={e => setTopSuppSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-3.5 bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[13px] text-[#111827] dark:text-[#F8FAFC] placeholder:text-[#9CA3AF] outline-none focus:border-[#6D3EEB]"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={topSuppSort}
                onChange={e => setTopSuppSort(e.target.value as any)}
                className="h-10 px-3 bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-[10px] text-[13px] text-[#4B5563] dark:text-[#CBD5E1] outline-none cursor-pointer"
              >
                <option value="total">Sắp xếp theo tổng mua</option>
                <option value="debt">Sắp xếp theo nợ</option>
                <option value="name">Sắp xếp theo tên NCC</option>
              </select>

              <button
                type="button"
                onClick={() => setTopSuppSortAsc(!topSuppSortAsc)}
                className="w-10 h-10 rounded-[10px] bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] flex items-center justify-center text-[#6B7280] dark:text-[#94A3B8]"
              >
                <Icon name={topSuppSortAsc ? 'arrow_upward' : 'arrow_downward'} size={18} />
              </button>

              <button
                type="button"
                onClick={() => alert('Lọc nhà cung cấp')}
                className="w-10 h-10 rounded-[10px] bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] flex items-center justify-center text-[#6B7280] dark:text-[#94A3B8]"
              >
                <Icon name="tune" size={18} />
              </button>

              <button
                type="button"
                onClick={() => toggleBookmark('top-supp')}
                className={`w-10 h-10 rounded-[10px] bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] flex items-center justify-center ${
                  isBookmarked['top-supp'] ? 'text-[#6D3EEB]' : 'text-[#6B7280] dark:text-[#94A3B8]'
                }`}
              >
                <Icon name="bookmark" size={18} />
              </button>

              <button
                type="button"
                onClick={handleExport}
                className="h-10 px-3.5 bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] text-[#4B5563] dark:text-[#CBD5E1] text-[13px] font-semibold rounded-[10px] flex items-center gap-1.5 cursor-pointer shadow-2xs hover:border-[#6D3EEB]"
              >
                <Icon name="download" size={16} />
                <span className="hidden sm:inline">Xuất Excel</span>
              </button>
            </div>
          </div>

          {/* Empty State matching 6.png */}
          {filteredTopSuppliers.length === 0 ? (
            <div className="bg-white dark:bg-[#1E293B] rounded-[16px] border border-[#E5E7EB] dark:border-[#334155] shadow-xs overflow-hidden flex flex-col justify-between min-h-[300px]">
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-14 h-14 rounded-[16px] bg-[#F3EBFE] dark:bg-purple-950/60 text-[#6D3EEB] dark:text-[#C084FC] flex items-center justify-center mb-3.5">
                  <Icon name="inventory_2" size={28} />
                </div>
                <span className="text-[14px] font-medium text-[#6B7280] dark:text-[#94A3B8]">
                  Chưa có dữ liệu
                </span>
              </div>
              <div className="py-3 px-4 bg-transparent border-t border-[#F1F2F5] dark:border-[#334155] text-[12.5px] text-[#6B7280] dark:text-[#94A3B8]">
                0 kết quả
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#1E293B] rounded-[16px] border border-[#E5E7EB] dark:border-[#334155] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13.5px]">
                  <thead className="bg-transparent text-[#6B7280] dark:text-[#94A3B8] text-[11.5px] uppercase font-bold border-b border-[#E5E7EB] dark:border-[#334155]">
                    <tr>
                      <th className="py-3 px-4 font-semibold">
                        <span className="flex items-center gap-1 cursor-pointer" onClick={() => { setTopSuppSort('name'); setTopSuppSortAsc(!topSuppSortAsc); }}>
                          <span>NHÀ CUNG CẤP</span>
                          <Icon name="unfold_more" size={15} />
                        </span>
                      </th>
                      <th className="py-3 px-4 text-right font-semibold">
                        <span className="flex items-center justify-end gap-1 cursor-pointer" onClick={() => { setTopSuppSort('total'); setTopSuppSortAsc(!topSuppSortAsc); }}>
                          <span>TỔNG MUA</span>
                          <Icon name="unfold_more" size={15} />
                        </span>
                      </th>
                      <th className="py-3 px-4 text-right font-semibold">
                        <span className="flex items-center justify-end gap-1 cursor-pointer" onClick={() => { setTopSuppSort('debt'); setTopSuppSortAsc(!topSuppSortAsc); }}>
                          <span>CÒN NỢ</span>
                          <Icon name="unfold_more" size={15} />
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F2F5] dark:divide-[#334155]">
                    {filteredTopSuppliers.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50/70 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-[#111827] dark:text-[#F8FAFC]">
                          {item.name}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-[#111827] dark:text-[#F8FAFC] tabular-nums">
                          {formatCurrency(item.totalPurchase)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold tabular-nums">
                          <span className={item.remainingDebt > 0 ? 'text-[#E11D48] dark:text-[#FB7185]' : 'text-[#111827] dark:text-[#CBD5E1]'}>
                            {formatCurrency(item.remainingDebt)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="py-3 px-4 bg-transparent border-t border-[#F1F2F5] dark:border-[#334155] text-[12.5px] text-[#6B7280] dark:text-[#94A3B8]">
                {filteredTopSuppliers.length} kết quả
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
