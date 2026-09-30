import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Tabs, TabItem } from '../components/ui/Tabs';
import { KpiCard } from '../components/ui/KpiCard';
import { FilterToolbar } from '../components/ui/FilterToolbar';
import { DataTable, Column } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { NoteCell } from '../components/ui/NoteCell';
import { Icon } from '../components/ui/Icon';
import { DateRangePicker, DateRange } from '../components/ui/DateRangePicker';
import { formatCurrency, formatQuantity, formatDate, formatDateTime } from '../lib/format';
import { exportToExcelFile } from '../lib/excelExport';
import { Product, StockVoucher, StockMovement, Stocktake } from '../types';

interface WarehouseViewProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenCreateProduct: () => void;
  onOpenEditProduct: (product: Product) => void;
  onOpenImportDialog: () => void;
  onOpenStocktakeModal: () => void;
  onOpenStockVoucherModal: (direction: 'in' | 'out') => void;
  onPrintDocument?: (type: string, code: string, doc: any) => void;
}

export const WarehouseView: React.FC<WarehouseViewProps> = ({
  currentTab,
  onTabChange,
  onOpenCreateProduct,
  onOpenEditProduct,
  onOpenImportDialog,
  onOpenStocktakeModal,
  onOpenStockVoucherModal,
  onPrintDocument,
}) => {
  const {
    products,
    warehouses,
    stockVouchers,
    stockMovements,
    stocktakes,
    invoices,
    purchaseOrders,
    companySettings,
    deleteProduct,
    updateInlineNote,
    createWarehouse,
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });

  // Tab 2 & 3 Voucher filters
  const [voucherPartnerFilter, setVoucherPartnerFilter] = useState('all');
  const [voucherStatusFilter, setVoucherStatusFilter] = useState('all');

  // Tab 4 Stocktake filters
  const [stocktakeStatusFilter, setStocktakeStatusFilter] = useState('all');

  // Tab 6 Movement filters
  const [movementTypeFilter, setMovementTypeFilter] = useState('all');

  // State for Thẻ kho (Stock Card)
  const [selectedProductSku, setSelectedProductSku] = useState<string>(() => products[0]?.sku || '');
  const [stockCardDateRange, setStockCardDateRange] = useState<DateRange>({
    from: '2026-09-01',
    to: '2026-09-30',
    preset: 'thisMonth',
  });
  const [stockCardSearch, setStockCardSearch] = useState('');
  const [stockCardTypeFilter, setStockCardTypeFilter] = useState('all');

  const tabs: TabItem[] = [
    { id: 'tong-quan', label: 'Tổng quan kho' },
    { id: 'nhap-kho', label: 'Nhập kho' },
    { id: 'xuat-kho', label: 'Xuất kho' },
    { id: 'kiem-ke', label: 'Kiểm kê' },
    { id: 'the-kho', label: 'Thẻ kho (Stock Card)' },
    { id: 'lich-su', label: 'Lịch sử kho' },
  ];

  // Unique product groups
  const productGroupOptions = useMemo(() => {
    const groups = Array.from(new Set(products.map(p => p.group_name).filter(Boolean))) as string[];
    return [
      { value: 'all', label: 'Nhóm: Tất cả' },
      ...groups.map(g => ({ value: g, label: g })),
    ];
  }, [products]);

  // 5 KPIs for Tab 1
  const kpis = useMemo(() => {
    const totalVal = products.reduce((sum, p) => sum + (p.stock_value || ((p.stock_quantity || 0) * (p.cost_price || 0)) || 0), 0);
    const totalQty = products.reduce((sum, p) => sum + (p.is_service ? 0 : (p.stock_quantity || 0)), 0);
    const skuCount = products.length;
    const lowCount = products.filter(p => !p.is_service && p.stock_level === 'low').length;
    const outCount = products.filter(p => !p.is_service && p.stock_level === 'out').length;
    return { totalVal, totalQty, skuCount, lowCount, outCount };
  }, [products]);

  // Tab 1: Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch =
        (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.sku || '').toLowerCase().includes(search.toLowerCase());
      const matchGroup = filterGroup === 'all' || p.group_name === filterGroup;
      const matchStatus = filterStatus === 'all' || p.stock_level === filterStatus;
      const matchType =
        filterType === 'all' ||
        (filterType === 'service' ? p.is_service : !p.is_service);
      return matchSearch && matchGroup && matchStatus && matchType;
    });
  }, [products, search, filterGroup, filterStatus, filterType]);

  // Tab 2 & 3: Stock Vouchers with date, search & status filter
  const inboundVouchers = useMemo(() => {
    return stockVouchers.filter(v => {
      if (v.direction !== 'in') return false;
      const matchSearch =
        (v.code || '').toLowerCase().includes(search.toLowerCase()) ||
        (v.summary || '').toLowerCase().includes(search.toLowerCase()) ||
        (v.partner_name || '').toLowerCase().includes(search.toLowerCase());
      let matchDate = true;
      const vDate = v.voucher_date ? v.voucher_date.split('T')[0] : '';
      if (dateRange.from && vDate < dateRange.from) matchDate = false;
      if (dateRange.to && vDate > dateRange.to) matchDate = false;
      const matchStatus = voucherStatusFilter === 'all' || v.status === voucherStatusFilter;
      return matchSearch && matchDate && matchStatus;
    });
  }, [stockVouchers, search, dateRange, voucherStatusFilter]);

  const outboundVouchers = useMemo(() => {
    return stockVouchers.filter(v => {
      if (v.direction !== 'out') return false;
      const matchSearch =
        (v.code || '').toLowerCase().includes(search.toLowerCase()) ||
        (v.summary || '').toLowerCase().includes(search.toLowerCase()) ||
        (v.partner_name || '').toLowerCase().includes(search.toLowerCase());
      let matchDate = true;
      const vDate = v.voucher_date ? v.voucher_date.split('T')[0] : '';
      if (dateRange.from && vDate < dateRange.from) matchDate = false;
      if (dateRange.to && vDate > dateRange.to) matchDate = false;
      const matchStatus = voucherStatusFilter === 'all' || v.status === voucherStatusFilter;
      return matchSearch && matchDate && matchStatus;
    });
  }, [stockVouchers, search, dateRange, voucherStatusFilter]);

  // Tab 4: Stocktakes with date and diff filter
  const filteredStocktakes = useMemo(() => {
    return stocktakes.filter(st => {
      const matchSearch =
        (st.code || '').toLowerCase().includes(search.toLowerCase()) ||
        (st.counted_by || '').toLowerCase().includes(search.toLowerCase());
      let matchDate = true;
      const stDate = st.stocktake_date ? st.stocktake_date.split('T')[0] : '';
      if (dateRange.from && stDate < dateRange.from) matchDate = false;
      if (dateRange.to && stDate > dateRange.to) matchDate = false;
      const matchStatus =
        stocktakeStatusFilter === 'all' ||
        (stocktakeStatusFilter === 'balanced' && st.status === 'balanced') ||
        (stocktakeStatusFilter === 'has_diff' && (st.difference_qty !== 0 || (st.items && st.items.some(it => it.diff_qty !== 0)))) ||
        (stocktakeStatusFilter === 'draft' && st.status === 'draft');
      return matchSearch && matchDate && matchStatus;
    });
  }, [stocktakes, search, dateRange, stocktakeStatusFilter]);

  // Tab 6: Movements with date and movement type filter
  const filteredMovements = useMemo(() => {
    return stockMovements.filter(m => {
      const matchSearch =
        (m.product_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (m.sku || '').toLowerCase().includes(search.toLowerCase()) ||
        (m.source_code || '').toLowerCase().includes(search.toLowerCase());
      let matchDate = true;
      const mDate = m.created_at ? m.created_at.split('T')[0] : '';
      if (dateRange.from && mDate < dateRange.from) matchDate = false;
      if (dateRange.to && mDate > dateRange.to) matchDate = false;
      const matchType =
        movementTypeFilter === 'all' ||
        (movementTypeFilter === 'in' && (m.movement_type === 'in' || (m.change_qty || 0) > 0)) ||
        (movementTypeFilter === 'out' && (m.movement_type === 'out' || (m.change_qty || 0) < 0));
      return matchSearch && matchDate && matchType;
    });
  }, [stockMovements, search, dateRange, movementTypeFilter]);

  // Tab 1 Columns: Products & Stock
  const productColumns: Column<Product>[] = [
    {
      key: 'image',
      header: 'ẢNH',
      align: 'center',
      render: () => (
        <div className="w-10 h-10 rounded-[8px] bg-[#F9F5FF] text-[#6D3EEB] flex items-center justify-center border border-[#F1F2F5] mx-auto">
          <Icon name="image" size={18} />
        </div>
      ),
    },
    {
      key: 'sku',
      header: 'MÃ SKU',
      sortable: true,
      render: row => <span className="font-mono text-[#111827] font-semibold">{row.sku}</span>,
    },
    {
      key: 'name',
      header: 'TÊN SẢN PHẨM',
      sortable: true,
      render: row => (
        <div>
          <span className="font-semibold text-[#111827]">{row.name}</span>
          <span className="text-[12px] text-[#6B7280] ml-2">({row.unit})</span>
        </div>
      ),
    },
    {
      key: 'group',
      header: 'NHÓM',
      render: row => (
        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[#4B5563] text-[11.5px] font-medium">
          {row.group_name || 'Khác'}
        </span>
      ),
    },
    {
      key: 'stock',
      header: 'TỒN HIỆN TẠI',
      align: 'right',
      sortable: true,
      render: row => (
        <span
          className={`font-bold tabular-nums ${
            row.stock_quantity <= 0 && !row.is_service ? 'text-[#E11D48]' : 'text-[#111827]'
          }`}
        >
          {row.is_service ? '—' : formatQuantity(row.stock_quantity)}
        </span>
      ),
    },
    {
      key: 'min_stock',
      header: 'TỒN MIN',
      align: 'right',
      render: row => (
        <span className="text-[#6B7280] tabular-nums">
          {row.is_service ? '—' : formatQuantity(row.min_stock)}
        </span>
      ),
    },
    {
      key: 'value',
      header: 'GIÁ TRỊ TỒN',
      align: 'right',
      sortable: true,
      render: row => (
        <span className="font-bold tabular-nums text-[#111827]">
          {formatCurrency(row.stock_value)}
        </span>
      ),
    },
    {
      key: 'note',
      header: 'GHI CHÚ',
      render: row => (
        <NoteCell
          note={row.note}
          onSave={newNote => updateInlineNote('product', row.id, newNote)}
        />
      ),
    },
    {
      key: 'status',
      header: 'TRẠNG THÁI',
      align: 'center',
      render: row => <StatusBadge status={row.stock_level} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: row => (
        <div className="flex items-center justify-end gap-1.5 text-[#6B7280]">
          <button
            type="button"
            title="Xem Thẻ kho (Stock Card)"
            onClick={() => {
              setSelectedProductSku(row.sku);
              onTabChange('the-kho');
            }}
            className="p-1.5 hover:text-[#059669] rounded-full hover:bg-[#ECFDF5] transition-colors"
          >
            <Icon name="history_edu" size={18} />
          </button>
          <button
            type="button"
            title="Sửa sản phẩm"
            onClick={() => onOpenEditProduct(row)}
            className="p-1.5 hover:text-[#6D3EEB] rounded-full hover:bg-gray-100 transition-colors"
          >
            <Icon name="edit" size={18} />
          </button>
          <button
            type="button"
            title="Xoá"
            onClick={() => {
              if (confirm(`Xoá sản phẩm ${row.name}?`)) deleteProduct(row.id);
            }}
            className="p-1.5 hover:text-[#E11D48] rounded-full hover:bg-gray-100 transition-colors"
          >
            <Icon name="delete" size={18} />
          </button>
        </div>
      ),
    },
  ];

  // Tab 2 & 3 Voucher Columns
  const voucherColumns: Column<StockVoucher>[] = [
    {
      key: 'code',
      header: 'MÃ PHIẾU',
      render: row => <span className="font-semibold text-[#111827]">{row.code}</span>,
    },
    {
      key: 'date',
      header: 'NGÀY',
      render: row => <span className="text-[#4B5563]">{formatDate(row.voucher_date)}</span>,
    },
    {
      key: 'summary',
      header: 'NỘI DUNG',
      render: row => <span className="font-medium text-[#111827]">{row.summary}</span>,
    },
    {
      key: 'type',
      header: 'LOẠI',
      align: 'center',
      render: row => <StatusBadge status={row.type} />,
    },
    {
      key: 'items',
      header: 'SỐ MẶT HÀNG',
      align: 'center',
      render: row => <span>{row.item_count}</span>,
    },
    {
      key: 'qty',
      header: 'TỔNG SL',
      align: 'right',
      render: row => <span className="font-semibold tabular-nums">{formatQuantity(row.total_quantity)}</span>,
    },
    {
      key: 'val',
      header: 'GIÁ TRỊ',
      align: 'right',
      render: row => <span className="font-bold tabular-nums">{formatCurrency(row.total_value)}</span>,
    },
    {
      key: 'status',
      header: 'TRẠNG THÁI',
      align: 'center',
      render: row => <StatusBadge status={row.status} />,
    },
    {
      key: 'note',
      header: 'GHI CHÚ',
      render: row => <span className="text-[12.5px] text-[#6B7280]">{row.note || '—'}</span>,
    },
    {
      key: 'actions',
      header: 'THAO TÁC',
      align: 'center',
      render: row => (
        <button
          type="button"
          onClick={() => {
            if (onPrintDocument) {
              const docType = row.direction === 'in' ? 'PHIẾU NHẬP KHO' : 'PHIẾU XUẤT KHO';
              onPrintDocument(docType, row.code, {
                ...row,
                payment_date: row.voucher_date,
                items: [
                  {
                    sku: row.code,
                    product_name: row.summary,
                    unit: 'lần',
                    quantity: row.total_quantity,
                    unit_price: row.total_quantity > 0 ? Math.round(row.total_value / row.total_quantity) : 0,
                    line_total: row.total_value,
                  },
                ],
                total: row.total_value,
                subtotal: row.total_value,
              });
            }
          }}
          className="px-2.5 py-1 text-[12px] font-semibold text-[#6D3EEB] hover:bg-[#F3E8FF] rounded-[8px] flex items-center gap-1 transition-colors"
          title="In phiếu kho"
        >
          <Icon name="print" size={15} />
          <span>In</span>
        </button>
      ),
    },
  ];

  // Tab 4 Stocktake Columns
  const stocktakeColumns: Column<Stocktake>[] = [
    {
      key: 'code',
      header: 'MÃ PHIẾU',
      render: row => <span className="font-semibold text-[#111827]">{row.code}</span>,
    },
    {
      key: 'date',
      header: 'NGÀY',
      render: row => <span className="text-[#4B5563]">{formatDate(row.stocktake_date)}</span>,
    },
    {
      key: 'counted_by',
      header: 'NGƯỜI KK',
      render: row => <span className="font-medium">{row.counted_by}</span>,
    },
    {
      key: 'items',
      header: 'SỐ MẶT HÀNG',
      align: 'center',
      render: row => <span>{row.item_count}</span>,
    },
    {
      key: 'increase',
      header: 'TĂNG',
      align: 'center',
      render: row => (
        <span className="font-semibold text-emerald-600">+{row.increase_count}</span>
      ),
    },
    {
      key: 'decrease',
      header: 'GIẢM',
      align: 'center',
      render: row => <span className="font-semibold text-rose-600">-{row.decrease_count}</span>,
    },
    {
      key: 'diff_value',
      header: 'CHÊNH LỆCH GT',
      align: 'right',
      render: row => (
        <span
          className={`font-bold tabular-nums ${
            row.diff_value > 0
              ? 'text-emerald-600'
              : row.diff_value < 0
              ? 'text-rose-600'
              : 'text-gray-700'
          }`}
        >
          {row.diff_value > 0 ? '+' : ''}
          {formatCurrency(row.diff_value)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'TRẠNG THÁI',
      align: 'center',
      render: row => <StatusBadge status={row.status} />,
    },
    {
      key: 'note',
      header: 'GHI CHÚ',
      render: row => <span className="text-[12.5px] text-[#6B7280]">{row.note || '—'}</span>,
    },
    {
      key: 'actions',
      header: 'THAO TÁC',
      align: 'center',
      render: row => (
        <button
          type="button"
          onClick={() => {
            if (onPrintDocument) {
              onPrintDocument('PHIẾU KIỂM KÊ KHO', row.code, {
                ...row,
                payment_date: row.stocktake_date,
                partner_name: `Người kiểm kê: ${row.counted_by}`,
                note: row.note || `Kiểm kê kho hàng định kỳ (${row.item_count} mặt hàng, tăng ${row.increase_count}, giảm ${row.decrease_count})`,
                items: (row.items && row.items.length > 0) ? row.items.map((it: any) => ({
                  sku: it.sku || 'SKU',
                  product_name: it.product_name,
                  unit: it.unit || 'cái',
                  quantity: it.actual_qty,
                  unit_price: it.unit_cost,
                  line_total: it.diff_value,
                })) : [
                  {
                    sku: 'KK',
                    product_name: `Kiểm kê kho (${row.item_count} mặt hàng, lệch ${row.diff_value > 0 ? '+' : ''}${formatCurrency(row.diff_value)})`,
                    unit: 'lần',
                    quantity: 1,
                    unit_price: Math.abs(row.diff_value),
                    line_total: row.diff_value,
                  },
                ],
                total: Math.abs(row.diff_value),
                subtotal: Math.abs(row.diff_value),
              });
            }
          }}
          className="px-2.5 py-1 text-[12px] font-semibold text-[#6D3EEB] hover:bg-[#F3E8FF] rounded-[8px] flex items-center gap-1 transition-colors"
          title="In biên bản kiểm kê"
        >
          <Icon name="print" size={15} />
          <span>In</span>
        </button>
      ),
    },
  ];

  // Tab 5 Movement Columns
  const movementColumns: Column<StockMovement>[] = [
    {
      key: 'code',
      header: 'MÃ',
      render: row => <span className="font-mono text-[#6B7280]">{row.code || '—'}</span>,
    },
    {
      key: 'date',
      header: 'NGÀY',
      render: row => <span className="text-[#4B5563]">{formatDate(row.movement_date || (row as any).date)}</span>,
    },
    {
      key: 'type',
      header: 'LOẠI',
      align: 'center',
      render: row => <StatusBadge status={row.type} />,
    },
    {
      key: 'product',
      header: 'SẢN PHẨM',
      render: row => (
        <div>
          <span className="font-semibold text-[#111827]">{row.product_name || row.code || '—'}</span>
          <span className="text-[11.5px] text-[#6B7280] font-mono ml-2">({row.sku || '—'})</span>
        </div>
      ),
    },
    {
      key: 'in',
      header: 'NHẬP',
      align: 'right',
      render: row => (
        <span className="text-emerald-600 font-semibold tabular-nums">
          {Number(row.qty_in || 0) > 0 ? `+${formatQuantity(row.qty_in)}` : '—'}
        </span>
      ),
    },
    {
      key: 'out',
      header: 'XUẤT',
      align: 'right',
      render: row => (
        <span className="text-rose-600 font-semibold tabular-nums">
          {Number(row.qty_out || 0) > 0 ? `-${formatQuantity(row.qty_out)}` : '—'}
        </span>
      ),
    },
    {
      key: 'source',
      header: 'NGUỒN',
      render: row => <span className="font-mono text-[#6D3EEB] font-semibold">{row.source_code || row.code || '—'}</span>,
    },
    {
      key: 'note',
      header: 'GHI CHÚ',
      render: row => <span className="text-[12.5px] text-[#6B7280]">{row.note || '—'}</span>,
    },
  ];

  // Selected product for Thẻ kho (Stock Card)
  const selectedProduct = useMemo(() => {
    return products.find(p => p.sku === selectedProductSku) || products[0];
  }, [products, selectedProductSku]);

  // Gather all historical events for the selected product
  const allProductMovements = useMemo(() => {
    if (!selectedProduct) return [];
    const pId = selectedProduct.id;
    const pSku = selectedProduct.sku;

    const events: {
      id: string;
      date: string;
      code: string;
      type: string;
      partner: string;
      qtyIn: number;
      qtyOut: number;
      unitCost?: number;
      note?: string;
      rawDocType?: string;
      rawDoc?: any;
    }[] = [];

    const seenCodes = new Set<string>();

    // 1. From stockMovements
    stockMovements.forEach(m => {
      if (m.product_id === pId || m.sku === pSku) {
        let typeLabel = 'Biến động kho';
        let rawDocType = 'movement';
        if (m.type === 'purchase') {
          typeLabel = 'Nhập mua hàng';
          rawDocType = 'PN';
        } else if (m.type === 'sale') {
          typeLabel = 'Xuất bán hàng';
          rawDocType = 'PX';
        } else if (m.type === 'stocktake') {
          typeLabel = 'Cân bằng kiểm kê';
          rawDocType = 'KK';
        } else if (m.type === 'purchase_return') {
          typeLabel = 'Xuất trả NCC';
          rawDocType = 'PR';
        }

        events.push({
          id: m.id || `m-${Math.random()}`,
          date: m.movement_date || (m as any).date || new Date().toISOString(),
          code: m.code || m.source_code || '',
          type: typeLabel,
          partner: m.note || m.source_code || 'Biến động kho',
          qtyIn: Number(m.qty_in) || 0,
          qtyOut: Number(m.qty_out) || 0,
          unitCost: Number(m.unit_cost) || 0,
          note: m.note || '',
          rawDocType,
        });
        if (m.source_code) seenCodes.add(m.source_code);
        if (m.code) seenCodes.add(m.code);
      }
    });

    // 2. From purchaseOrders
    purchaseOrders.forEach(po => {
      if (po.status !== 'cancelled' && !seenCodes.has(po.code) && !seenCodes.has(po.code.replace('MH-', 'PN-'))) {
        const it = po.items?.find(i => i.product_id === pId || i.sku === pSku);
        if (it && it.quantity > 0) {
          const voucherCode = po.code.startsWith('MH-') ? po.code.replace('MH-', 'PN-') : po.code;
          events.push({
            id: `po-${po.id}`,
            date: po.order_date,
            code: voucherCode,
            type: 'Nhập mua hàng',
            partner: po.supplier_name || 'Nhà cung cấp',
            qtyIn: it.quantity,
            qtyOut: 0,
            unitCost: it.unit_price,
            note: `Nhập mua theo ${po.code}`,
            rawDocType: 'MH',
            rawDoc: po,
          });
          seenCodes.add(po.code);
          seenCodes.add(voucherCode);
        }
      }
    });

    // 3. From invoices
    invoices.forEach(inv => {
      if (inv.status !== 'cancelled' && !seenCodes.has(inv.code) && !seenCodes.has(inv.code.replace('BH-', 'PX-'))) {
        const it = inv.items?.find(i => i.product_id === pId || i.sku === pSku);
        if (it && it.quantity > 0) {
          const voucherCode = inv.code.startsWith('BH-') ? inv.code.replace('BH-', 'PX-') : inv.code;
          events.push({
            id: `inv-${inv.id}`,
            date: inv.invoice_date || (inv as any).order_date || (inv as any).created_at,
            code: voucherCode,
            type: 'Xuất bán hàng',
            partner: inv.customer_name || 'Khách hàng',
            qtyIn: 0,
            qtyOut: it.quantity,
            unitCost: it.unit_cost || it.unit_price,
            note: `Xuất bán theo ${inv.code}`,
            rawDocType: 'BH',
            rawDoc: inv,
          });
          seenCodes.add(inv.code);
          seenCodes.add(voucherCode);
        }
      }
    });

    // 4. From stocktakes
    stocktakes.forEach(st => {
      if (st.status === 'completed' && !seenCodes.has(st.code) && !seenCodes.has(`PKK-${st.code}`)) {
        const it = st.items?.find(i => i.product_id === pId || i.sku === pSku);
        if (it && it.diff_qty !== 0) {
          events.push({
            id: `stk-${st.id}`,
            date: st.stocktake_date,
            code: `PKK-${st.code}`,
            type: 'Cân bằng kiểm kê',
            partner: st.counted_by || 'Hệ thống kiểm kê',
            qtyIn: it.diff_qty > 0 ? it.diff_qty : 0,
            qtyOut: it.diff_qty < 0 ? Math.abs(it.diff_qty) : 0,
            unitCost: it.unit_cost,
            note: it.reason || `Biên bản kiểm kê ${st.code}`,
            rawDocType: 'KK',
            rawDoc: st,
          });
          seenCodes.add(`PKK-${st.code}`);
        }
      }
    });

    // Sort chronologically ascending
    return events.sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime());
  }, [selectedProduct, stockMovements, purchaseOrders, invoices, stocktakes]);

  // Compute stock card ledger numbers
  const stockCardData = useMemo(() => {
    if (!selectedProduct) {
      return { openingStock: 0, totalIn: 0, totalOut: 0, closingStock: 0, rows: [] };
    }

    const fromDate = stockCardDateRange.from;
    const toDate = stockCardDateRange.to;

    // Events within period
    const inPeriodEvents = allProductMovements.filter(e => {
      const d = (e.date || '').split('T')[0];
      if (fromDate && d && d < fromDate) return false;
      if (toDate && d && d > toDate) return false;
      return true;
    });

    // Events before period
    const beforeEvents = allProductMovements.filter(e => {
      const d = (e.date || '').split('T')[0];
      if (fromDate && d && d < fromDate) return true;
      return false;
    });

    let openingStock = 0;
    if (beforeEvents.length > 0) {
      openingStock = Math.max(0, beforeEvents.reduce((sum, e) => sum + e.qtyIn - e.qtyOut, 0));
    } else {
      const netPeriod = inPeriodEvents.reduce((sum, e) => sum + e.qtyIn - e.qtyOut, 0);
      openingStock = Math.max(0, (selectedProduct.stock_quantity || 0) - netPeriod);
    }

    let runningBalance = openingStock;
    const computedRows = inPeriodEvents.map(e => {
      runningBalance = runningBalance + e.qtyIn - e.qtyOut;
      return {
        ...e,
        balance: runningBalance,
      };
    });

    const totalIn = inPeriodEvents.reduce((sum, e) => sum + e.qtyIn, 0);
    const totalOut = inPeriodEvents.reduce((sum, e) => sum + e.qtyOut, 0);
    const closingStock = runningBalance;

    // Filter by user search or transaction type filter
    const filteredRows = computedRows.filter(r => {
      const matchSearch =
        !stockCardSearch ||
        (r.code || '').toLowerCase().includes(stockCardSearch.toLowerCase()) ||
        (r.partner || '').toLowerCase().includes(stockCardSearch.toLowerCase()) ||
        (r.note && (r.note || '').toLowerCase().includes(stockCardSearch.toLowerCase()));

      let matchType = true;
      if (stockCardTypeFilter === 'in') matchType = (r.qtyIn || 0) > 0;
      else if (stockCardTypeFilter === 'out') matchType = (r.qtyOut || 0) > 0;
      else if (stockCardTypeFilter === 'stocktake') matchType = (r.type || '').includes('kiểm kê');

      return matchSearch && matchType;
    });

    return {
      openingStock,
      totalIn,
      totalOut,
      closingStock,
      rows: filteredRows,
    };
  }, [selectedProduct, allProductMovements, stockCardDateRange, stockCardSearch, stockCardTypeFilter]);

  // Export Stock Card to Excel
  const handleExportStockCardExcel = () => {
    if (!selectedProduct) return;
    const exportColumns = [
      { key: 'date', header: 'NGÀY CHỨNG TỪ', accessor: (r: any) => formatDateTime(r.date) },
      { key: 'code', header: 'SỐ CHỨNG TỪ' },
      { key: 'type', header: 'LOẠI BIẾN ĐỘNG' },
      { key: 'partner', header: 'ĐỐI TÁC / DIỄN GIẢI' },
      { key: 'qtyIn', header: 'SỐ LƯỢNG NHẬP', accessor: (r: any) => r.qtyIn || 0 },
      { key: 'qtyOut', header: 'SỐ LƯỢNG XUẤT', accessor: (r: any) => r.qtyOut || 0 },
      { key: 'balance', header: 'TỒN LŨY KẾ' },
      { key: 'unitCost', header: 'ĐƠN GIÁ VỐN', accessor: (r: any) => r.unitCost || 0 },
      { key: 'note', header: 'GHI CHÚ' },
    ];

    const dataToExport = [
      {
        date: stockCardDateRange.from || '',
        code: 'DK',
        type: 'Số dư đầu kỳ',
        partner: 'Số tồn đầu kỳ tính lũy kế',
        qtyIn: 0,
        qtyOut: 0,
        balance: stockCardData.openingStock,
        unitCost: selectedProduct.cost_price,
        note: '',
      },
      ...stockCardData.rows,
      {
        date: stockCardDateRange.to || '',
        code: 'CK',
        type: 'Số dư cuối kỳ',
        partner: `Tổng nhập: ${stockCardData.totalIn} | Tổng xuất: ${stockCardData.totalOut}`,
        qtyIn: stockCardData.totalIn,
        qtyOut: stockCardData.totalOut,
        balance: stockCardData.closingStock,
        unitCost: selectedProduct.cost_price,
        note: '',
      },
    ];

    exportToExcelFile(dataToExport, exportColumns, `TheKho_${selectedProduct.sku}`);
  };

  // Print Stock Card (Official Vietnamese Ministry of Finance S12-DNN standard)
  const handlePrintStockCard = () => {
    if (!selectedProduct) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Vui lòng cấp quyền mở popup để in Thẻ kho.');
      return;
    }

    const companyName = companySettings?.company_name || 'LK ERP - HỆ THỐNG QUẢN TRỊ DOANH NGHIỆP';
    const companyAddress = companySettings?.address || 'TP. Hồ Chí Minh, Việt Nam';
    const companyPhone = companySettings?.phone || '0901 234 567';

    const rowsHtml = stockCardData.rows
      .map(
        (r, idx) => `
        <tr>
          <td style="text-align:center; padding:6px; border:1px solid #333;">${idx + 1}</td>
          <td style="text-align:center; padding:6px; border:1px solid #333;">${formatDate(r.date)}</td>
          <td style="text-align:center; padding:6px; border:1px solid #333; font-weight:600;">${r.qtyIn > 0 ? r.code : '—'}</td>
          <td style="text-align:center; padding:6px; border:1px solid #333; font-weight:600;">${r.qtyOut > 0 ? r.code : '—'}</td>
          <td style="padding:6px; border:1px solid #333;">${r.partner || r.type}</td>
          <td style="text-align:right; padding:6px; border:1px solid #333;">${r.unitCost ? formatCurrency(r.unitCost) : '—'}</td>
          <td style="text-align:right; padding:6px; border:1px solid #333; color:#059669; font-weight:600;">${r.qtyIn > 0 ? formatQuantity(r.qtyIn) : '—'}</td>
          <td style="text-align:right; padding:6px; border:1px solid #333; color:#E11D48; font-weight:600;">${r.qtyOut > 0 ? formatQuantity(r.qtyOut) : '—'}</td>
          <td style="text-align:right; padding:6px; border:1px solid #333; font-weight:bold;">${formatQuantity(r.balance)}</td>
        </tr>`
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>THẺ KHO - ${selectedProduct.sku} - ${selectedProduct.name}</title>
        <style>
          body { font-family: 'Times New Roman', Times, serif; font-size: 13px; color: #111; margin: 20px; line-height: 1.4; }
          .header-table { width: 100%; margin-bottom: 20px; }
          .title { text-align: center; font-size: 20px; font-weight: bold; margin: 15px 0 5px 0; text-transform: uppercase; }
          .subtitle { text-align: center; font-style: italic; margin-bottom: 15px; }
          .info-table { width: 100%; margin-bottom: 15px; }
          .data-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
          .data-table th { background: #f3f4f6; border: 1px solid #333; padding: 7px; text-align: center; font-weight: bold; font-size: 12px; }
          .footer-table { width: 100%; margin-top: 30px; text-align: center; }
          .footer-table td { padding: 5px; vertical-align: top; width: 25%; }
          @media print {
            @page { size: A4 portrait; margin: 15mm; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td>
              <strong>${companyName}</strong><br/>
              Địa chỉ: ${companyAddress}<br/>
              Điện thoại: ${companyPhone}
            </td>
            <td style="text-align: right; vertical-align: top;">
              <strong>Mẫu số S12-DNN</strong><br/>
              <em>(Ban hành theo TT số 133/2016/TT-BTC)</em>
            </td>
          </tr>
        </table>

        <div class="title">THẺ KHO (SỔ KHO)</div>
        <div class="subtitle">
          Từ ngày: ${stockCardDateRange.from ? formatDate(stockCardDateRange.from) : '...'} 
          đến ngày: ${stockCardDateRange.to ? formatDate(stockCardDateRange.to) : '...'}
        </div>

        <table class="info-table">
          <tr>
            <td style="width: 50%;"><strong>Tên sản phẩm:</strong> ${selectedProduct.name}</td>
            <td style="width: 50%;"><strong>Mã SKU:</strong> ${selectedProduct.sku}</td>
          </tr>
          <tr>
            <td><strong>Đơn vị tính:</strong> ${selectedProduct.unit}</td>
            <td><strong>Kho hàng:</strong> Kho Tổng TP.HCM</td>
          </tr>
        </table>

        <table class="data-table">
          <thead>
            <tr>
              <th rowspan="2" style="width: 35px;">STT</th>
              <th rowspan="2" style="width: 80px;">Ngày tháng</th>
              <th colspan="2">Số hiệu chứng từ</th>
              <th rowspan="2">Diễn giải</th>
              <th rowspan="2" style="width: 80px;">Đơn giá</th>
              <th colspan="3">Số lượng</th>
            </tr>
            <tr>
              <th style="width: 85px;">Nhập</th>
              <th style="width: 85px;">Xuất</th>
              <th style="width: 65px;">Nhập</th>
              <th style="width: 65px;">Xuất</th>
              <th style="width: 75px;">Tồn</th>
            </tr>
            <tr style="background: #fafafa; font-weight: bold;">
              <td style="text-align:center; padding:5px; border:1px solid #333;">—</td>
              <td style="text-align:center; padding:5px; border:1px solid #333;">${stockCardDateRange.from ? formatDate(stockCardDateRange.from) : ''}</td>
              <td style="text-align:center; padding:5px; border:1px solid #333;">—</td>
              <td style="text-align:center; padding:5px; border:1px solid #333;">—</td>
              <td style="padding:5px; border:1px solid #333; font-style:italic;">Số dư đầu kỳ</td>
              <td style="text-align:right; padding:5px; border:1px solid #333;">—</td>
              <td style="text-align:right; padding:5px; border:1px solid #333;">—</td>
              <td style="text-align:right; padding:5px; border:1px solid #333;">—</td>
              <td style="text-align:right; padding:5px; border:1px solid #333;">${formatQuantity(stockCardData.openingStock)}</td>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
          <tfoot>
            <tr style="background: #f9f9f9; font-weight: bold;">
              <td colspan="5" style="padding:7px; border:1px solid #333; text-align: center;">CỘNG PHÁT SINH VÀ SỐ DƯ CUỐI KỲ</td>
              <td style="text-align:right; padding:7px; border:1px solid #333;">—</td>
              <td style="text-align:right; padding:7px; border:1px solid #333; color:#059669;">${formatQuantity(stockCardData.totalIn)}</td>
              <td style="text-align:right; padding:7px; border:1px solid #333; color:#E11D48;">${formatQuantity(stockCardData.totalOut)}</td>
              <td style="text-align:right; padding:7px; border:1px solid #333; font-size:14px;">${formatQuantity(stockCardData.closingStock)}</td>
            </tr>
          </tfoot>
        </table>

        <table class="footer-table">
          <tr>
            <td>
              <strong>Người lập biểu</strong><br/>
              <em>(Ký, họ tên)</em>
            </td>
            <td>
              <strong>Thủ kho</strong><br/>
              <em>(Ký, họ tên)</em>
            </td>
            <td>
              <strong>Kế toán trưởng</strong><br/>
              <em>(Ký, họ tên)</em>
            </td>
            <td>
              Ngày ..... tháng ..... năm 2026<br/>
              <strong>Giám đốc</strong><br/>
              <em>(Ký, đóng dấu)</em>
            </td>
          </tr>
        </table>

        <div style="text-align: center; margin-top: 30px;">
          <button onclick="window.print()" style="padding: 8px 20px; font-size: 14px; font-weight: bold; cursor: pointer; background: #6D3EEB; color: #fff; border: none; border-radius: 6px;">
            🖨️ Bấm để in Thẻ kho
          </button>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Kho hàng"
        subtitle="Quản lý danh mục sản phẩm, tồn kho và lịch sử biến động"
      />

      <Tabs items={tabs} activeId={currentTab} onChange={onTabChange} />

      {/* Tab 1: Tổng quan kho */}
      {currentTab === 'tong-quan' && (
        <div className="space-y-5">
          {/* 5 KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <KpiCard
              label="Tổng giá trị tồn"
              value={formatCurrency(kpis.totalVal)}
              icon="inventory_2"
              iconBg="bg-[#F3EBFE]"
              iconColor="text-[#6D3EEB]"
            />
            <KpiCard
              label="Tổng số lượng tồn"
              value={formatQuantity(kpis.totalQty)}
              icon="fact_check"
              iconBg="bg-[#ECFDF5]"
              iconColor="text-[#059669]"
            />
            <KpiCard
              label="Số SKU"
              value={kpis.skuCount}
              icon="qr_code_2"
              iconBg="bg-[#EFF6FF]"
              iconColor="text-[#2563EB]"
            />
            <KpiCard
              label="Sắp hết"
              value={kpis.lowCount}
              icon="warning"
              iconBg="bg-[#FFFBEB]"
              iconColor="text-[#D97706]"
            />
            <KpiCard
              label="Hết hàng"
              value={kpis.outCount}
              icon="remove_shopping_cart"
              iconBg="bg-[#FFF1F2]"
              iconColor="text-[#E11D48]"
            />
          </div>

          {/* Section title & buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <h3 className="text-[16px] font-bold text-[#111827]">Danh sách tồn kho</h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const name = prompt('Nhập tên kho mới:');
                  if (name) {
                    const address = prompt('Địa chỉ kho:') || '';
                    createWarehouse({ name, address });
                  }
                }}
                className="px-3.5 py-2 rounded-[12px] border border-dashed border-[#6D3EEB]/60 text-[#6317D6] bg-[#F9F5FF] hover:bg-[#F3EBFE] text-[13px] font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Icon name="warehouse" size={18} />
                <span>+ Thêm kho</span>
              </button>
              <button
                type="button"
                onClick={onOpenImportDialog}
                className="px-3.5 py-2 rounded-[12px] border border-[#E5E7EB] hover:border-[#6D3EEB] text-[#1F2937] hover:bg-[#F9F5FF] text-[13px] font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Icon name="upload_file" size={18} />
                <span>Nhập Excel</span>
              </button>
              <button
                type="button"
                onClick={onOpenCreateProduct}
                className="px-4 py-2 bg-[#6D3EEB] hover:bg-[#5B2BD6] text-white text-[13.5px] font-semibold rounded-[12px] shadow-[0_8px_20px_-6px_rgba(109,62,235,0.55)] flex items-center gap-1.5 transition-all"
              >
                <Icon name="add" size={18} />
                <span>+ Thêm sản phẩm</span>
              </button>
            </div>
          </div>

          <FilterToolbar
            searchPlaceholder="Tìm sản phẩm, mã SKU..."
            searchValue={search}
            onSearchChange={setSearch}
            filters={[
              {
                label: 'Nhóm hàng',
                key: 'group',
                value: filterGroup,
                items: productGroupOptions,
                onChange: setFilterGroup,
              },
              {
                label: 'Loại hàng',
                key: 'type',
                value: filterType,
                items: [
                  { value: 'all', label: 'Loại: Tất cả' },
                  { value: 'product', label: 'Hàng hóa' },
                  { value: 'service', label: 'Dịch vụ' },
                ],
                onChange: setFilterType,
              },
              {
                label: 'Trạng thái',
                key: 'status',
                value: filterStatus,
                items: [
                  { value: 'all', label: 'Trạng thái: Tất cả' },
                  { value: 'ok', label: 'Còn hàng' },
                  { value: 'low', label: 'Sắp hết' },
                  { value: 'out', label: 'Hết hàng' },
                  { value: 'over', label: 'Vượt tồn' },
                ],
                onChange: setFilterStatus,
              },
            ]}
            onClearFilters={() => {
              setSearch('');
              setFilterGroup('all');
              setFilterType('all');
              setFilterStatus('all');
            }}
          />

          <DataTable
            columns={productColumns}
            data={filteredProducts}
            keyExtractor={row => row.id}
            emptyMessage="Chưa có sản phẩm nào"
            emptyActionText="+ Thêm sản phẩm"
            onEmptyAction={onOpenCreateProduct}
          />
        </div>
      )}

      {/* Tab 2: Nhập kho */}
      {currentTab === 'nhap-kho' && (
        <div className="space-y-4">
          <FilterToolbar
            searchPlaceholder="Tìm mã phiếu nhập, NCC, sản phẩm..."
            searchValue={search}
            onSearchChange={setSearch}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            filters={[
              {
                label: 'Trạng thái',
                key: 'status',
                value: voucherStatusFilter,
                items: [
                  { value: 'all', label: 'Trạng thái: Tất cả' },
                  { value: 'completed', label: 'Hoàn tất' },
                  { value: 'draft', label: 'Bản nháp' },
                  { value: 'cancelled', label: 'Đã hủy' },
                ],
                onChange: setVoucherStatusFilter,
              },
            ]}
            onClearFilters={() => {
              setSearch('');
              setVoucherStatusFilter('all');
              setDateRange({ from: null, to: null });
            }}
            primaryAction={{
              label: '+ Nhập kho',
              onClick: () => onOpenStockVoucherModal('in'),
            }}
          />

          <DataTable
            columns={voucherColumns}
            data={inboundVouchers}
            keyExtractor={row => row.id}
            emptyMessage="Chưa có phiếu nhập kho nào"
          />
        </div>
      )}

      {/* Tab 3: Xuất kho */}
      {currentTab === 'xuat-kho' && (
        <div className="space-y-4">
          <FilterToolbar
            searchPlaceholder="Tìm mã phiếu xuất, khách hàng, sản phẩm..."
            searchValue={search}
            onSearchChange={setSearch}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            filters={[
              {
                label: 'Trạng thái',
                key: 'status',
                value: voucherStatusFilter,
                items: [
                  { value: 'all', label: 'Trạng thái: Tất cả' },
                  { value: 'completed', label: 'Hoàn tất' },
                  { value: 'draft', label: 'Bản nháp' },
                  { value: 'cancelled', label: 'Đã hủy' },
                ],
                onChange: setVoucherStatusFilter,
              },
            ]}
            onClearFilters={() => {
              setSearch('');
              setVoucherStatusFilter('all');
              setDateRange({ from: null, to: null });
            }}
            primaryAction={{
              label: '+ Xuất kho',
              onClick: () => onOpenStockVoucherModal('out'),
            }}
          />

          <DataTable
            columns={voucherColumns}
            data={outboundVouchers}
            keyExtractor={row => row.id}
            emptyMessage="Chưa có phiếu xuất kho nào"
          />
        </div>
      )}

      {/* Tab 4: Kiểm kê */}
      {currentTab === 'kiem-ke' && (
        <div className="space-y-4">
          <FilterToolbar
            searchPlaceholder="Tìm mã phiếu kiểm kê, người kiểm..."
            searchValue={search}
            onSearchChange={setSearch}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            filters={[
              {
                label: 'Trạng thái',
                key: 'status',
                value: stocktakeStatusFilter,
                items: [
                  { value: 'all', label: 'Trạng thái: Tất cả' },
                  { value: 'balanced', label: 'Đã cân bằng kho' },
                  { value: 'has_diff', label: 'Có chênh lệch' },
                  { value: 'draft', label: 'Phiếu nháp' },
                ],
                onChange: setStocktakeStatusFilter,
              },
            ]}
            onClearFilters={() => {
              setSearch('');
              setStocktakeStatusFilter('all');
              setDateRange({ from: null, to: null });
            }}
            primaryAction={{
              label: '+ Tạo phiếu kiểm kê',
              onClick: onOpenStocktakeModal,
            }}
          />

          <DataTable
            columns={stocktakeColumns}
            data={filteredStocktakes}
            keyExtractor={row => row.id}
            emptyMessage="Chưa có phiếu kiểm kê nào"
            emptyActionText="+ Tạo phiếu kiểm kê"
            onEmptyAction={onOpenStocktakeModal}
          />
        </div>
      )}

      {/* Tab 5: Thẻ kho (Stock Card) */}
      {currentTab === 'the-kho' && (
        <div className="space-y-5">
          {/* Top Controls: Product Selector, Date Range, Actions */}
          <div className="bg-white rounded-[16px] p-4 sm:p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_2px_8px_rgba(16,24,40,0.04)] border border-[#F1F2F5] space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Product Selector Combobox */}
              <div className="flex-1 min-w-[280px]">
                <label className="block text-[12px] font-semibold text-[#4B5563] uppercase tracking-wider mb-1.5">
                  Chọn mặt hàng tra cứu Thẻ kho:
                </label>
                <div className="relative">
                  <select
                    value={selectedProduct?.sku || ''}
                    onChange={e => setSelectedProductSku(e.target.value)}
                    className="w-full h-[44px] pl-10 pr-8 bg-white border border-[#E5E7EB] hover:border-[#6D3EEB] rounded-[12px] text-[13.5px] font-semibold text-[#111827] shadow-xs outline-none transition-colors appearance-none cursor-pointer"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.sku}>
                        {p.sku} — {p.name} (Tồn: {formatQuantity(p.stock_quantity)} {p.unit})
                      </option>
                    ))}
                  </select>
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6D3EEB] pointer-events-none">
                    <Icon name="inventory_2" size={20} />
                  </div>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none">
                    <Icon name="expand_more" size={20} />
                  </div>
                </div>
              </div>

              {/* Date Filters & Action Buttons */}
              <div className="flex flex-wrap items-end gap-2.5">
                <div>
                  <label className="block text-[12px] font-semibold text-[#4B5563] uppercase tracking-wider mb-1.5">
                    Kỳ tra cứu:
                  </label>
                  <DateRangePicker
                    value={stockCardDateRange}
                    onChange={setStockCardDateRange}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportStockCardExcel}
                    className="h-[42px] px-3.5 rounded-[12px] border border-[#E5E7EB] hover:border-[#6D3EEB] bg-white hover:bg-[#F9F5FF] text-[#1F2937] text-[13px] font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    title="Xuất file Excel / CSV"
                  >
                    <Icon name="download" size={18} className="text-[#059669]" />
                    <span>Xuất Excel</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintStockCard}
                    className="h-[42px] px-4 bg-[#6D3EEB] hover:bg-[#5B2BD6] text-white text-[13px] font-semibold rounded-[12px] shadow-[0_8px_20px_-6px_rgba(109,62,235,0.55)] flex items-center gap-1.5 transition-all cursor-pointer"
                    title="In Thẻ kho chuẩn kế toán"
                  >
                    <Icon name="print" size={18} />
                    <span>In Thẻ kho</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Selected Product Specs & 4 KPIs */}
            {selectedProduct && (
              <div className="pt-3 border-t border-gray-100 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[15px] text-[#111827]">{selectedProduct.name}</span>
                    <span className="font-mono px-2 py-0.5 rounded-md bg-purple-50 text-[#6D3EEB] font-semibold text-[12px]">
                      {selectedProduct.sku}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[#4B5563] text-[12px]">
                      ĐVT: {selectedProduct.unit}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[#4B5563] text-[12px]">
                      Nhóm: {selectedProduct.group_name || 'Khác'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[12.5px] text-[#6B7280]">
                    <span>Giá vốn: <strong className="text-[#111827] font-semibold tabular-nums">{formatCurrency(selectedProduct.cost_price)}</strong></span>
                    <span>·</span>
                    <span>Giá bán: <strong className="text-[#111827] font-semibold tabular-nums">{formatCurrency(selectedProduct.sale_price)}</strong></span>
                    <span>·</span>
                    <span>Tồn kho hiện tại: <strong className="text-[#6D3EEB] font-bold tabular-nums">{formatQuantity(selectedProduct.stock_quantity)} {selectedProduct.unit}</strong></span>
                  </div>
                </div>

                {/* 4 Summary Balance Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-[12px] bg-[#F9FAFB] border border-[#E5E7EB]">
                    <span className="text-[11.5px] font-semibold text-[#6B7280] uppercase tracking-wider">Tồn đầu kỳ</span>
                    <div className="text-[20px] font-bold text-[#111827] mt-0.5 tabular-nums">
                      {formatQuantity(stockCardData.openingStock)} <span className="text-[13px] font-normal text-[#6B7280]">{selectedProduct.unit}</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-[12px] bg-[#ECFDF5] border border-[#A7F3D0]">
                    <span className="text-[11.5px] font-semibold text-[#059669] uppercase tracking-wider">Tổng nhập trong kỳ</span>
                    <div className="text-[20px] font-bold text-[#059669] mt-0.5 tabular-nums">
                      +{formatQuantity(stockCardData.totalIn)} <span className="text-[13px] font-normal text-[#059669]">{selectedProduct.unit}</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-[12px] bg-[#FFF1F2] border border-[#FECDD3]">
                    <span className="text-[11.5px] font-semibold text-[#E11D48] uppercase tracking-wider">Tổng xuất trong kỳ</span>
                    <div className="text-[20px] font-bold text-[#E11D48] mt-0.5 tabular-nums">
                      -{formatQuantity(stockCardData.totalOut)} <span className="text-[13px] font-normal text-[#E11D48]">{selectedProduct.unit}</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-[12px] bg-[#F9F5FF] border border-[#E9D5FF]">
                    <span className="text-[11.5px] font-semibold text-[#6D3EEB] uppercase tracking-wider">Tồn cuối kỳ</span>
                    <div className="text-[20px] font-bold text-[#6D3EEB] mt-0.5 tabular-nums">
                      {formatQuantity(stockCardData.closingStock)} <span className="text-[13px] font-normal text-[#6D3EEB]">{selectedProduct.unit}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Ledger Filter Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <input
                  type="text"
                  placeholder="Tìm số chứng từ, đối tác..."
                  value={stockCardSearch}
                  onChange={e => setStockCardSearch(e.target.value)}
                  className="w-full h-[40px] pl-9 pr-3.5 bg-white border border-[#E5E7EB] rounded-[10px] text-[13px] outline-none shadow-xs"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                  <Icon name="search" size={17} />
                </div>
              </div>

              <select
                value={stockCardTypeFilter}
                onChange={e => setStockCardTypeFilter(e.target.value)}
                className="h-[40px] px-3 bg-white border border-[#E5E7EB] rounded-[10px] text-[13px] font-medium text-[#374151] outline-none shadow-xs cursor-pointer"
              >
                <option value="all">Tất cả giao dịch</option>
                <option value="in">Chỉ phát sinh Nhập</option>
                <option value="out">Chỉ phát sinh Xuất</option>
                <option value="stocktake">Chỉ Cân bằng kiểm kê</option>
              </select>
            </div>

            <div className="text-[12.5px] text-[#6B7280]">
              Hiển thị <strong className="text-[#111827]">{stockCardData.rows.length}</strong> dòng chứng từ
            </div>
          </div>

          {/* Stock Card Detailed Ledger Table */}
          <div className="bg-white rounded-[16px] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_2px_8px_rgba(16,24,40,0.04)] border border-[#F1F2F5] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#F1F2F5] text-[#4B5563] text-[11.5px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-3 text-center w-12">STT</th>
                    <th className="py-3 px-3">NGÀY CHỨNG TỪ</th>
                    <th className="py-3 px-3">SỐ CHỨNG TỪ</th>
                    <th className="py-3 px-3">LOẠI BIẾN ĐỘNG</th>
                    <th className="py-3 px-3">ĐỐI TÁC / NỘI DUNG</th>
                    <th className="py-3 px-3 text-right">ĐƠN GIÁ</th>
                    <th className="py-3 px-3 text-right">SL NHẬP</th>
                    <th className="py-3 px-3 text-right">SL XUẤT</th>
                    <th className="py-3 px-3 text-right">TỒN LŨY KẾ</th>
                    <th className="py-3 px-3 text-center w-16">IN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F2F5]">
                  {/* Row 0: Opening Balance */}
                  <tr className="bg-[#FBFBFF] font-semibold text-[#111827]">
                    <td className="py-3 px-3 text-center text-[#9CA3AF]">—</td>
                    <td className="py-3 px-3 text-[#6B7280]">
                      {stockCardDateRange.from ? formatDate(stockCardDateRange.from) : '—'}
                    </td>
                    <td className="py-3 px-3 font-mono text-[#6D3EEB]">ĐẦU KỲ</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-[#4B5563]">
                        Số dư đầu kỳ
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#6B7280] italic">Số tồn đầu kỳ tính lũy kế</td>
                    <td className="py-3 px-3 text-right text-[#9CA3AF]">—</td>
                    <td className="py-3 px-3 text-right text-[#9CA3AF]">—</td>
                    <td className="py-3 px-3 text-right text-[#9CA3AF]">—</td>
                    <td className="py-3 px-3 text-right font-bold text-[#111827] tabular-nums">
                      {formatQuantity(stockCardData.openingStock)}
                    </td>
                    <td className="py-3 px-3 text-center text-[#9CA3AF]">—</td>
                  </tr>

                  {/* Dynamic Transaction Rows */}
                  {stockCardData.rows.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-[#9CA3AF]">
                        Không có phát sinh giao dịch nào cho sản phẩm này trong kỳ chọn.
                      </td>
                    </tr>
                  ) : (
                    stockCardData.rows.map((r, idx) => (
                      <tr key={r.id} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="py-3 px-3 text-center text-[#9CA3AF] text-[12px]">{idx + 1}</td>
                        <td className="py-3 px-3 text-[#374151] whitespace-nowrap">
                          {formatDateTime(r.date)}
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-[#111827]">
                          {r.code}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              r.type.includes('Nhập mua')
                                ? 'bg-[#ECFDF5] text-[#059669]'
                                : r.type.includes('Xuất bán')
                                ? 'bg-[#F9F5FF] text-[#6D3EEB]'
                                : r.type.includes('kiểm kê')
                                ? 'bg-[#FFFBEB] text-[#D97706]'
                                : 'bg-gray-100 text-[#4B5563]'
                            }`}
                          >
                            {r.type}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[#374151] max-w-xs truncate" title={r.partner}>
                          {r.partner}
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums text-[#6B7280]">
                          {r.unitCost ? formatCurrency(r.unitCost) : '—'}
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums font-semibold text-[#059669]">
                          {r.qtyIn > 0 ? `+${formatQuantity(r.qtyIn)}` : '—'}
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums font-semibold text-[#E11D48]">
                          {r.qtyOut > 0 ? `-${formatQuantity(r.qtyOut)}` : '—'}
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums font-bold text-[#111827]">
                          {formatQuantity(r.balance)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {onPrintDocument && (
                            <button
                              type="button"
                              onClick={() => {
                                if (r.rawDocType && r.rawDoc) {
                                  onPrintDocument(r.rawDocType, r.code, r.rawDoc);
                                } else {
                                  handlePrintStockCard();
                                }
                              }}
                              className="p-1 hover:text-[#6D3EEB] rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                              title="In chứng từ"
                            >
                              <Icon name="print" size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-[#F9FAFB] border-t-2 border-[#E5E7EB] font-bold text-[#111827]">
                    <td colSpan={5} className="py-3.5 px-3 text-center uppercase text-[12px] tracking-wider">
                      Cộng phát sinh trong kỳ & Tồn cuối kỳ
                    </td>
                    <td className="py-3.5 px-3 text-right text-[#9CA3AF]">—</td>
                    <td className="py-3.5 px-3 text-right tabular-nums text-[#059669] font-bold text-[14px]">
                      +{formatQuantity(stockCardData.totalIn)}
                    </td>
                    <td className="py-3.5 px-3 text-right tabular-nums text-[#E11D48] font-bold text-[14px]">
                      -{formatQuantity(stockCardData.totalOut)}
                    </td>
                    <td className="py-3.5 px-3 text-right tabular-nums text-[#6D3EEB] font-bold text-[15px]">
                      {formatQuantity(stockCardData.closingStock)}
                    </td>
                    <td className="py-3.5 px-3 text-center text-[#9CA3AF]">—</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Lịch sử kho */}
      {currentTab === 'lich-su' && (
        <div className="space-y-4">
          <FilterToolbar
            searchPlaceholder="Tìm sản phẩm, SKU, chứng từ..."
            searchValue={search}
            onSearchChange={setSearch}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            filters={[
              {
                label: 'Loại biến động',
                key: 'movement_type',
                value: movementTypeFilter,
                items: [
                  { value: 'all', label: 'Biến động: Tất cả' },
                  { value: 'in', label: 'Tăng tồn (Nhập kho, trả hàng)' },
                  { value: 'out', label: 'Giảm tồn (Xuất bán, trả NCC)' },
                ],
                onChange: setMovementTypeFilter,
              },
            ]}
            onClearFilters={() => {
              setSearch('');
              setMovementTypeFilter('all');
              setDateRange({ from: null, to: null });
            }}
          />

          <DataTable
            columns={movementColumns}
            data={filteredMovements}
            keyExtractor={row => row.id}
            emptyMessage="Chưa có biến động kho nào"
          />
        </div>
      )}
    </div>
  );
};
