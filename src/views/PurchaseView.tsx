import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Tabs, TabItem } from '../components/ui/Tabs';
import { KpiCard } from '../components/ui/KpiCard';
import { FilterToolbar } from '../components/ui/FilterToolbar';
import { DataTable, Column } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { InlineStatusSelect } from '../components/ui/InlineStatusSelect';
import { NoteCell } from '../components/ui/NoteCell';
import { Icon } from '../components/ui/Icon';
import { DateRange } from '../components/ui/DateRangePicker';
import { formatCurrency, formatDate } from '../lib/format';
import { PurchaseOrder, Supplier, PurchaseReturn } from '../types';

interface PurchaseViewProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenCreatePO: () => void;
  onOpenCreateReturn: () => void;
  onOpenCreateSupplier: () => void;
  onOpenImportSupplierDialog?: () => void;
  onOpenPaymentAllocation: (supplierId?: string, poId?: string) => void;
  onPrintDocument: (type: string, code: string, doc: any) => void;
}

export const PurchaseView: React.FC<PurchaseViewProps> = ({
  currentTab,
  onTabChange,
  onOpenCreatePO,
  onOpenCreateReturn,
  onOpenCreateSupplier,
  onOpenImportSupplierDialog,
  onOpenPaymentAllocation,
  onPrintDocument,
}) => {
  const {
    purchaseOrders,
    suppliers,
    purchaseReturns,
    updatePurchaseOrderStatus,
    deleteSupplier,
    updateInlineNote,
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterPayment, setFilterPayment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const tabs: TabItem[] = [
    { id: 'tong-quan', label: 'Tổng quan mua hàng' },
    { id: 'don-dat-hang', label: 'Đơn đặt hàng' },
    { id: 'nha-cung-cap', label: 'Nhà cung cấp' },
    { id: 'tra-hang-ncc', label: 'Trả hàng NCC' },
    { id: 'cong-no-ncc', label: 'Công nợ NCC' },
  ];

  // Tab 1 KPIs
  const poKpis = useMemo(() => {
    const valid = purchaseOrders.filter(p => p.status !== 'cancelled');
    const totalPurchases = valid.reduce((sum, p) => sum + p.total, 0);
    const count = valid.length;
    const debt = valid.reduce((sum, p) => sum + p.debt_amount, 0);
    const supplierCount = suppliers.length;
    return { totalPurchases, count, debt, supplierCount };
  }, [purchaseOrders, suppliers]);

  // Tab 2: Orders waiting delivery KPIs
  const pendingKpis = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const pendingOrders = purchaseOrders.filter(p => p.status === 'ordered');
    const waitingCount = pendingOrders.length;
    const waitingValue = pendingOrders.reduce((sum, p) => sum + p.total, 0);
    const overdueCount = pendingOrders.filter(p => p.expected_date && p.expected_date < today).length;
    return { waitingCount, waitingValue, overdueCount };
  }, [purchaseOrders]);

  // Filters
  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter(po => {
      const matchSearch =
        po.code.toLowerCase().includes(search.toLowerCase()) ||
        po.supplier_name.toLowerCase().includes(search.toLowerCase());
      const matchPayment = filterPayment === 'all' || po.payment_status === filterPayment;
      const matchStatus = filterStatus === 'all' || po.status === filterStatus;
      return matchSearch && matchPayment && matchStatus;
    });
  }, [purchaseOrders, search, filterPayment, filterStatus]);

  const filteredPendingPOs = useMemo(() => {
    return purchaseOrders.filter(
      p =>
        p.status === 'ordered' &&
        (p.code.toLowerCase().includes(search.toLowerCase()) ||
          p.supplier_name.toLowerCase().includes(search.toLowerCase()))
    );
  }, [purchaseOrders, search]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase()) ||
        s.phone.includes(search);
      const matchGroup = filterGroup === 'all' || s.group_name === filterGroup;
      return matchSearch && matchGroup;
    });
  }, [suppliers, search, filterGroup]);

  const filteredReturns = useMemo(() => {
    return purchaseReturns.filter(ret => {
      const matchSearch =
        ret.code.toLowerCase().includes(search.toLowerCase()) ||
        ret.supplier_name.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === 'all' || ret.handling === filterType;
      return matchSearch && matchType;
    });
  }, [purchaseReturns, search, filterType]);

  const filteredSupplierDebts = useMemo(() => {
    return purchaseOrders
      .filter(p => p.debt_amount > 0 && p.status !== 'cancelled')
      .filter(
        po =>
          po.code.toLowerCase().includes(search.toLowerCase()) ||
          po.supplier_name.toLowerCase().includes(search.toLowerCase())
      );
  }, [purchaseOrders, search]);

  // Tab 1 PO Columns
  const poColumns: Column<PurchaseOrder>[] = [
    {
      key: 'code',
      header: 'MÃ PHIẾU',
      render: row => <span className="font-semibold text-[#111827]">{row.code}</span>,
    },
    {
      key: 'date',
      header: 'NGÀY MUA',
      render: row => <span className="text-[#4B5563]">{formatDate(row.order_date)}</span>,
    },
    {
      key: 'supplier',
      header: 'NHÀ CUNG CẤP',
      render: row => <span className="font-semibold text-[#111827]">{row.supplier_name}</span>,
    },
    {
      key: 'total',
      header: 'TỔNG TIỀN',
      align: 'right',
      render: row => <span className="font-bold text-[#111827]">{formatCurrency(row.total)}</span>,
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
          onSave={newNote => updateInlineNote('purchase_order', row.id, newNote)}
        />
      ),
    },
    {
      key: 'status',
      header: 'TRẠNG THÁI',
      align: 'center',
      render: row => (
        <InlineStatusSelect
          currentStatus={row.status === 'received' ? 'received_po' : row.status}
          options={[
            { value: 'ordered', label: 'Đã đặt hàng' },
            { value: 'received_po', label: 'Đã nhập kho' },
            { value: 'completed', label: 'Hoàn tất' },
            { value: 'cancelled', label: 'Đã hủy' },
          ]}
          onSelect={newStatus => {
            const val = newStatus === 'received_po' ? 'received' : newStatus;
            updatePurchaseOrderStatus(row.id, val);
          }}
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
            title="In phiếu mua"
            onClick={() => onPrintDocument('PHIẾU MUA HÀNG', row.code, row)}
            className="p-1.5 hover:text-[#6D3EEB] rounded-full hover:bg-gray-100 transition-colors"
          >
            <Icon name="print" size={18} />
          </button>
          <button
            type="button"
            title="Thanh toán nợ cho phiếu mua này"
            disabled={row.debt_amount === 0}
            onClick={() => onOpenPaymentAllocation(row.supplier_id, row.id)}
            className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors ${
              row.debt_amount > 0 ? 'text-[#059669]' : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            <Icon name="payments" size={18} />
          </button>
        </div>
      ),
    },
  ];

  // Tab 2 Pending PO Columns
  const pendingColumns: Column<PurchaseOrder>[] = [
    {
      key: 'code',
      header: 'MÃ PHIẾU',
      render: row => <span className="font-semibold text-[#111827]">{row.code}</span>,
    },
    {
      key: 'date',
      header: 'NGÀY ĐẶT',
      render: row => <span className="text-[#4B5563]">{formatDate(row.order_date)}</span>,
    },
    {
      key: 'supplier',
      header: 'NHÀ CUNG CẤP',
      render: row => <span className="font-semibold text-[#111827]">{row.supplier_name}</span>,
    },
    {
      key: 'items_count',
      header: 'SỐ MẶT HÀNG',
      align: 'center',
      render: row => <span>{row.items?.length || 1}</span>,
    },
    {
      key: 'total',
      header: 'TỔNG TIỀN',
      align: 'right',
      render: row => <span className="font-bold">{formatCurrency(row.total)}</span>,
    },
    {
      key: 'expected',
      header: 'NGÀY DỰ KIẾN',
      render: row => {
        const isOverdue =
          row.expected_date && row.expected_date < new Date().toISOString().split('T')[0];
        return (
          <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-[#4B5563]'}>
            {formatDate(row.expected_date)} {isOverdue && '(Trễ)'}
          </span>
        );
      },
    },
    {
      key: 'paid',
      header: 'ĐÃ TRẢ TRƯỚC',
      align: 'right',
      render: row => (
        <span className="text-[#6317D6] tabular-nums">{formatCurrency(row.paid_amount)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: row => (
        <button
          type="button"
          onClick={() => {
            if (confirm(`Xác nhận nhập kho cho đơn đặt hàng ${row.code}?`)) {
              updatePurchaseOrderStatus(row.id, 'received');
              onTabChange('tong-quan');
            }
          }}
          className="px-3 py-1 bg-[#6D3EEB] hover:bg-[#5B2BD6] text-white text-[12px] font-semibold rounded-[8px] transition-colors"
        >
          Nhận hàng
        </button>
      ),
    },
  ];

  // Tab 3 Supplier Columns
  const supplierColumns: Column<Supplier>[] = [
    {
      key: 'code',
      header: 'MÃ',
      render: row => <span className="font-mono text-[#6B7280]">{row.code}</span>,
    },
    {
      key: 'name',
      header: 'TÊN NCC',
      render: row => <span className="font-semibold text-[#111827]">{row.name}</span>,
    },
    {
      key: 'contact',
      header: 'LIÊN HỆ',
      render: row => (
        <span className="text-[#4B5563] whitespace-nowrap truncate max-w-[140px] inline-block">
          {row.contact_name || '—'}
        </span>
      ),
    },
    {
      key: 'phone',
      header: 'SĐT',
      render: row => <span className="text-[#4B5563]">{row.phone}</span>,
    },
    {
      key: 'total',
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
          onSave={newNote => updateInlineNote('supplier', row.id, newNote)}
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
            title="Thanh toán công nợ"
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
              if (confirm(`Xoá nhà cung cấp ${row.name}?`)) deleteSupplier(row.id);
            }}
            className="p-1.5 hover:text-[#E11D48] rounded-full hover:bg-gray-100 transition-colors"
          >
            <Icon name="delete" size={18} />
          </button>
        </div>
      ),
    },
  ];

  // Tab 4 Returns Columns
  const returnColumns: Column<PurchaseReturn>[] = [
    {
      key: 'code',
      header: 'MÃ PHIẾU',
      render: row => <span className="font-semibold text-[#111827]">{row.code}</span>,
    },
    {
      key: 'date',
      header: 'NGÀY TRẢ',
      render: row => <span className="text-[#4B5563]">{formatDate(row.return_date)}</span>,
    },
    {
      key: 'supplier',
      header: 'NHÀ CUNG CẤP',
      render: row => <span className="font-semibold text-[#111827]">{row.supplier_name}</span>,
    },
    {
      key: 'po',
      header: 'PHIẾU MUA GỐC',
      render: row => (
        <span className="font-mono text-[#6D3EEB]">{row.po_code || '—'}</span>
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
      header: 'NCC CÒN PHẢI HOÀN',
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
      key: 'reason',
      header: 'LÝ DO',
      render: row => <span className="text-[12.5px] text-[#4B5563] truncate">{row.reason || '—'}</span>,
    },
    {
      key: 'status',
      header: 'TRẠNG THÁI',
      align: 'center',
      render: row => <StatusBadge status={row.status} />,
    },
  ];

  // Tab 5 Debt Columns
  const debtColumns: Column<PurchaseOrder>[] = [
    {
      key: 'code',
      header: 'MÃ PHIẾU',
      render: row => <span className="font-semibold text-[#111827]">{row.code}</span>,
    },
    {
      key: 'supplier',
      header: 'NCC',
      render: row => <span className="font-semibold text-[#111827]">{row.supplier_name}</span>,
    },
    {
      key: 'total',
      header: 'TỔNG TIỀN',
      align: 'right',
      render: row => <span className="tabular-nums">{formatCurrency(row.total)}</span>,
    },
    {
      key: 'paid',
      header: 'ĐÃ TRẢ',
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
      key: 'status',
      header: 'TÌNH TRẠNG',
      align: 'center',
      render: row => <StatusBadge status={row.payment_status} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: row => (
        <button
          type="button"
          onClick={() => onOpenPaymentAllocation(row.supplier_id, row.id)}
          className="px-3 py-1 bg-[#F9F5FF] hover:bg-[#F3EBFE] text-[#6317D6] text-[12.5px] font-semibold rounded-[8px] transition-colors"
        >
          Thanh toán
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Mua hàng"
        subtitle="Quản lý nhà cung cấp và phiếu mua hàng từ nhà cung cấp"
      />

      <Tabs items={tabs} activeId={currentTab} onChange={onTabChange} />

      {/* Tab 1: Tổng quan mua hàng */}
      {currentTab === 'tong-quan' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Mua hàng (thuần)"
              value={formatCurrency(poKpis.totalPurchases)}
              icon="shopping_cart"
              iconBg="bg-[#F3EBFE]"
              iconColor="text-[#6D3EEB]"
            />
            <KpiCard
              label="Số phiếu mua"
              value={poKpis.count}
              icon="receipt_long"
              iconBg="bg-[#EFF6FF]"
              iconColor="text-[#2563EB]"
            />
            <KpiCard
              label="Công nợ phải trả"
              value={formatCurrency(poKpis.debt)}
              icon="payments"
              iconBg="bg-[#FFF1F2]"
              iconColor="text-[#E11D48]"
            />
            <KpiCard
              label="NCC trong bộ lọc"
              value={poKpis.supplierCount}
              icon="storefront"
              iconBg="bg-[#ECFDF5]"
              iconColor="text-[#059669]"
            />
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-[#111827]">
              Danh sách phiếu mua
            </h3>
          </div>

          <FilterToolbar
            searchPlaceholder="Tìm theo mã phiếu, NCC..."
            searchValue={search}
            onSearchChange={setSearch}
            filters={[
              {
                label: 'Thanh toán',
                key: 'payment',
                value: filterPayment,
                items: [
                  { value: 'all', label: 'Thanh toán: Tất cả' },
                  { value: 'unpaid', label: 'Chưa thanh toán' },
                  { value: 'partial', label: 'Thanh toán một phần' },
                  { value: 'paid', label: 'Đã thanh toán' },
                ],
                onChange: setFilterPayment,
              },
            ]}
            onClearFilters={() => {
              setSearch('');
              setFilterPayment('all');
            }}
            primaryAction={{
              label: '+ Tạo phiếu mua',
              onClick: onOpenCreatePO,
            }}
          />

          <DataTable
            columns={poColumns}
            data={filteredPOs}
            keyExtractor={row => row.id}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            emptyMessage="Chưa có dữ liệu"
            emptyActionText="+ Tạo phiếu mua"
            onEmptyAction={onOpenCreatePO}
          />
        </div>
      )}

      {/* Tab 2: Đơn đặt hàng */}
      {currentTab === 'don-dat-hang' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard
              label="Đơn đang chờ hàng về"
              value={pendingKpis.waitingCount}
              icon="local_shipping"
              iconBg="bg-[#F3EBFE]"
              iconColor="text-[#6D3EEB]"
            />
            <KpiCard
              label="Giá trị đang chờ"
              value={formatCurrency(pendingKpis.waitingValue)}
              icon="inventory_2"
              iconBg="bg-[#FFFBEB]"
              iconColor="text-[#D97706]"
            />
            <KpiCard
              label="Quá hạn nhận"
              value={pendingKpis.overdueCount}
              icon="warning"
              iconBg="bg-[#FFF1F2]"
              iconColor="text-[#E11D48]"
            />
          </div>

          <FilterToolbar
            searchPlaceholder="Tìm mã đơn, nhà cung cấp..."
            searchValue={search}
            onSearchChange={setSearch}
            onClearFilters={() => setSearch('')}
          />

          <DataTable
            columns={pendingColumns}
            data={filteredPendingPOs}
            keyExtractor={row => row.id}
            emptyMessage="Không có đơn nào đang chờ hàng về"
          />
        </div>
      )}

      {/* Tab 3: Nhà cung cấp */}
      {currentTab === 'nha-cung-cap' && (
        <div className="space-y-4">
          <FilterToolbar
            searchPlaceholder="Tìm nhà cung cấp theo tên, SĐT..."
            searchValue={search}
            onSearchChange={setSearch}
            filters={[
              {
                label: 'Nhóm',
                key: 'group',
                value: filterGroup,
                items: [
                  { value: 'all', label: 'Nhóm: Tất cả' },
                  { value: 'Nguyên liệu', label: 'Nguyên liệu' },
                  { value: 'Bao bì', label: 'Bao bì' },
                  { value: 'Thiết bị', label: 'Thiết bị' },
                ],
                onChange: setFilterGroup,
              },
            ]}
            onClearFilters={() => {
              setSearch('');
              setFilterGroup('all');
            }}
            secondaryAction={
              onOpenImportSupplierDialog
                ? {
                    label: 'Nhập Excel',
                    icon: 'upload_file',
                    onClick: onOpenImportSupplierDialog,
                  }
                : undefined
            }
            primaryAction={{
              label: '+ Thêm NCC',
              onClick: onOpenCreateSupplier,
            }}
          />

          <DataTable
            columns={supplierColumns}
            data={filteredSuppliers}
            keyExtractor={row => row.id}
            emptyMessage="Không tìm thấy nhà cung cấp nào"
            emptyActionText="+ Thêm NCC"
            onEmptyAction={onOpenCreateSupplier}
          />
        </div>
      )}

      {/* Tab 4: Trả hàng NCC */}
      {currentTab === 'tra-hang-ncc' && (
        <div className="space-y-4">
          <FilterToolbar
            searchPlaceholder="Tìm phiếu trả, nhà cung cấp, phiếu mua..."
            searchValue={search}
            onSearchChange={setSearch}
            filters={[
              {
                label: 'Kiểu xử lý',
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
            onClearFilters={() => {
              setSearch('');
              setFilterType('all');
            }}
            primaryAction={{
              label: 'Tạo phiếu trả NCC',
              icon: 'assignment_return',
              onClick: onOpenCreateReturn,
            }}
          />

          <DataTable
            columns={returnColumns}
            data={filteredReturns}
            keyExtractor={row => row.id}
            emptyMessage="Chưa có phiếu trả hàng nhà cung cấp"
            emptyActionText="Tạo phiếu trả NCC"
            onEmptyAction={onOpenCreateReturn}
          />
        </div>
      )}

      {/* Tab 5: Công nợ NCC */}
      {currentTab === 'cong-no-ncc' && (
        <div className="space-y-4">
          <FilterToolbar
            searchPlaceholder="Tìm phiếu mua, NCC..."
            searchValue={search}
            onSearchChange={setSearch}
            onClearFilters={() => setSearch('')}
            primaryAction={{
              label: 'Trả tiền (phân bổ nhiều phiếu)',
              icon: 'payments',
              onClick: () => onOpenPaymentAllocation(),
            }}
          />

          <DataTable
            columns={debtColumns}
            data={filteredSupplierDebts}
            keyExtractor={row => row.id}
            emptyMessage="Không có công nợ phải trả"
          />
        </div>
      )}
    </div>
  );
};
