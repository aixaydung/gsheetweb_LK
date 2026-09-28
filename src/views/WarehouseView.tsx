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
import { DateRange } from '../components/ui/DateRangePicker';
import { formatCurrency, formatQuantity, formatDate } from '../lib/format';
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
    deleteProduct,
    updateInlineNote,
    createWarehouse,
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });

  const tabs: TabItem[] = [
    { id: 'tong-quan', label: 'Tổng quan kho' },
    { id: 'nhap-kho', label: 'Nhập kho' },
    { id: 'xuat-kho', label: 'Xuất kho' },
    { id: 'kiem-ke', label: 'Kiểm kê' },
    { id: 'lich-su', label: 'Lịch sử kho' },
  ];

  // 5 KPIs for Tab 1
  const kpis = useMemo(() => {
    const totalVal = products.reduce((sum, p) => sum + p.stock_value, 0);
    const totalQty = products.reduce((sum, p) => sum + (p.is_service ? 0 : p.stock_quantity), 0);
    const skuCount = products.length;
    const lowCount = products.filter(p => !p.is_service && p.stock_level === 'low').length;
    const outCount = products.filter(p => !p.is_service && p.stock_level === 'out').length;
    return { totalVal, totalQty, skuCount, lowCount, outCount };
  }, [products]);

  // Tab 1: Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchGroup = filterGroup === 'all' || p.group_name === filterGroup;
      const matchStatus = filterStatus === 'all' || p.stock_level === filterStatus;
      return matchSearch && matchGroup && matchStatus;
    });
  }, [products, search, filterGroup, filterStatus]);

  // Tab 2 & 3: Stock Vouchers
  const inboundVouchers = useMemo(() => {
    return stockVouchers.filter(
      v =>
        v.direction === 'in' &&
        (v.code.toLowerCase().includes(search.toLowerCase()) ||
          v.summary.toLowerCase().includes(search.toLowerCase()))
    );
  }, [stockVouchers, search]);

  const outboundVouchers = useMemo(() => {
    return stockVouchers.filter(
      v =>
        v.direction === 'out' &&
        (v.code.toLowerCase().includes(search.toLowerCase()) ||
          v.summary.toLowerCase().includes(search.toLowerCase()))
    );
  }, [stockVouchers, search]);

  // Tab 4: Stocktakes
  const filteredStocktakes = useMemo(() => {
    return stocktakes.filter(
      st =>
        st.code.toLowerCase().includes(search.toLowerCase()) ||
        st.counted_by.toLowerCase().includes(search.toLowerCase())
    );
  }, [stocktakes, search]);

  // Tab 5: Movements
  const filteredMovements = useMemo(() => {
    return stockMovements.filter(
      m =>
        m.product_name.toLowerCase().includes(search.toLowerCase()) ||
        m.sku.toLowerCase().includes(search.toLowerCase()) ||
        m.source_code.toLowerCase().includes(search.toLowerCase())
    );
  }, [stockMovements, search]);

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
        <div className="flex items-center justify-end gap-2 text-[#6B7280]">
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
      render: row => <span className="font-mono text-[#6B7280]">{row.code}</span>,
    },
    {
      key: 'date',
      header: 'NGÀY',
      render: row => <span className="text-[#4B5563]">{formatDate(row.movement_date)}</span>,
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
          <span className="font-semibold text-[#111827]">{row.product_name}</span>
          <span className="text-[11.5px] text-[#6B7280] font-mono ml-2">({row.sku})</span>
        </div>
      ),
    },
    {
      key: 'in',
      header: 'NHẬP',
      align: 'right',
      render: row => (
        <span className="text-emerald-600 font-semibold tabular-nums">
          {row.qty_in > 0 ? `+${formatQuantity(row.qty_in)}` : '—'}
        </span>
      ),
    },
    {
      key: 'out',
      header: 'XUẤT',
      align: 'right',
      render: row => (
        <span className="text-rose-600 font-semibold tabular-nums">
          {row.qty_out > 0 ? `-${formatQuantity(row.qty_out)}` : '—'}
        </span>
      ),
    },
    {
      key: 'source',
      header: 'NGUỒN',
      render: row => <span className="font-mono text-[#6D3EEB] font-semibold">{row.source_code}</span>,
    },
    {
      key: 'note',
      header: 'GHI CHÚ',
      render: row => <span className="text-[12.5px] text-[#6B7280]">{row.note || '—'}</span>,
    },
  ];

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
                label: 'Trạng thái',
                key: 'status',
                value: filterStatus,
                items: [
                  { value: 'all', label: 'Trạng thái: Tất cả' },
                  { value: 'ok', label: 'Còn hàng' },
                  { value: 'low', label: 'Sắp hết' },
                  { value: 'out', label: 'Hết hàng' },
                  { value: 'over', label: 'Vượt tồn' },
                  { value: 'service', label: 'Dịch vụ' },
                ],
                onChange: setFilterStatus,
              },
            ]}
            onClearFilters={() => {
              setSearch('');
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
            searchPlaceholder="Tìm mã phiếu, sản phẩm..."
            searchValue={search}
            onSearchChange={setSearch}
            onClearFilters={() => setSearch('')}
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
            searchPlaceholder="Tìm mã phiếu, sản phẩm..."
            searchValue={search}
            onSearchChange={setSearch}
            onClearFilters={() => setSearch('')}
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
            searchPlaceholder="Tìm mã phiếu kiểm kê..."
            searchValue={search}
            onSearchChange={setSearch}
            onClearFilters={() => setSearch('')}
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

      {/* Tab 5: Lịch sử kho */}
      {currentTab === 'lich-su' && (
        <div className="space-y-4">
          <FilterToolbar
            searchPlaceholder="Tìm sản phẩm, chứng từ..."
            searchValue={search}
            onSearchChange={setSearch}
            onClearFilters={() => setSearch('')}
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
