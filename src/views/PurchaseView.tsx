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
import { PurchaseOrderDetailModal } from '../components/dialogs/PurchaseOrderDetailModal';
import { useAuth } from '../context/AuthContext';

interface PurchaseViewProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenCreatePO: () => void;
  onOpenEditPO?: (po: PurchaseOrder) => void;
  onOpenCreateReturn: () => void;
  onOpenEditReturn?: (purchaseReturn: PurchaseReturn) => void;
  onOpenCreateSupplier: () => void;
  onOpenEditSupplier?: (supplier: Supplier) => void;
  onOpenImportSupplierDialog?: () => void;
  onOpenPaymentAllocation: (supplierId?: string, poId?: string) => void;
  onPrintDocument: (type: string, code: string, doc: any) => void;
}

export const PurchaseView: React.FC<PurchaseViewProps> = ({
  currentTab,
  onTabChange,
  onOpenCreatePO,
  onOpenEditPO,
  onOpenCreateReturn,
  onOpenEditReturn,
  onOpenCreateSupplier,
  onOpenEditSupplier,
  onOpenImportSupplierDialog,
  onOpenPaymentAllocation,
  onPrintDocument,
}) => {
  const {
    purchaseOrders,
    suppliers,
    purchaseReturns,
    updatePurchaseOrderStatus,
    deletePurchaseOrder,
    deletePurchaseOrdersBatch,
    deleteSupplier,
    deleteSuppliersBatch,
    deletePurchaseReturn,
    deletePurchaseReturnsBatch,
    updateReturnStatus,
    updateInlineNote,
  } = useApp();

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Purchase Order Detail Modal State
  const [selectedPODetail, setSelectedPODetail] = useState<PurchaseOrder | null>(null);
  const [isPODetailOpen, setIsPODetailOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [filterPayment, setFilterPayment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [filterSupplierDebt, setFilterSupplierDebt] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });
  const [sortKey, setSortKey] = useState<string>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const tabs: TabItem[] = [
    { id: 'tong-quan', label: 'Tổng quan mua hàng' },
    { id: 'don-dat-hang', label: 'Đơn đặt hàng' },
    { id: 'nha-cung-cap', label: 'Nhà cung cấp' },
    { id: 'tra-hang-ncc', label: 'Trả hàng NCC' },
    { id: 'cong-no-ncc', label: 'Công nợ NCC' },
  ];

  // Supplier filter options
  const supplierFilterItems = useMemo(() => [
    { value: 'all', label: 'Nhà cung cấp: Tất cả' },
    ...suppliers.map(s => {
      // Determine if name is duplicate of code or needs cleanup
      const cleanName = s.name && s.name !== s.code ? s.name : `Nhà cung cấp ${s.code}`;
      return {
        value: s.id,
        label: `Nhà cung cấp: ${s.code} - ${cleanName}`,
        code: s.code,
        name: cleanName,
      };
    }),
  ], [suppliers]);

  // Tab 1 KPIs
  const poKpis = useMemo(() => {
    const valid = purchaseOrders.filter(p => p.status !== 'cancelled');
    const totalPurchases = valid.reduce((sum, p) => sum + p.total, 0);
    const count = valid.length;
    const debt = valid.reduce((sum, p) => sum + p.debt_amount, 0);
    const supplierCount = suppliers.length;
    return { totalPurchases, count, debt, supplierCount };
  }, [purchaseOrders, suppliers]);

  // Tab 1 Reconciliation: Mua vào - Trả lại NCC = Mua thuần
  const summaryReconciliation = useMemo(() => {
    const validPOs = purchaseOrders.filter(p => p.status !== 'cancelled');
    const grossPurchase = validPOs.reduce((sum, p) => sum + p.total, 0);
    const validReturns = purchaseReturns.filter(r => r.status !== 'cancelled');
    const purchaseReturnTotal = validReturns.reduce((sum, r) => sum + r.total_value, 0);
    const netPurchase = grossPurchase - purchaseReturnTotal;
    return { grossPurchase, purchaseReturnTotal, netPurchase };
  }, [purchaseOrders, purchaseReturns]);

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
      const matchSupplier = filterSupplier === 'all' || po.supplier_id === filterSupplier;
      let matchDate = true;
      if (dateRange.from && po.order_date < dateRange.from) matchDate = false;
      if (dateRange.to && po.order_date > dateRange.to) matchDate = false;
      return matchSearch && matchPayment && matchStatus && matchSupplier && matchDate;
    }).sort((a, b) => {
      if (sortKey === 'total') return sortDir === 'asc' ? a.total - b.total : b.total - a.total;
      if (sortKey === 'debt') return sortDir === 'asc' ? a.debt_amount - b.debt_amount : b.debt_amount - a.debt_amount;
      return sortDir === 'asc' ? a.order_date.localeCompare(b.order_date) : b.order_date.localeCompare(a.order_date);
    });
  }, [purchaseOrders, search, filterPayment, filterStatus, filterSupplier, dateRange, sortKey, sortDir]);

  const filteredPendingPOs = useMemo(() => {
    return purchaseOrders.filter(p => {
      const matchStatus = p.status === 'ordered';
      const matchSearch =
        p.code.toLowerCase().includes(search.toLowerCase()) ||
        p.supplier_name.toLowerCase().includes(search.toLowerCase());
      const matchSupplier = filterSupplier === 'all' || p.supplier_id === filterSupplier;
      let matchDate = true;
      if (dateRange.from && p.order_date < dateRange.from) matchDate = false;
      if (dateRange.to && p.order_date > dateRange.to) matchDate = false;
      return matchStatus && matchSearch && matchSupplier && matchDate;
    });
  }, [purchaseOrders, search, filterSupplier, dateRange]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase()) ||
        s.phone.includes(search);
      const matchGroup = filterGroup === 'all' || s.group_name === filterGroup;
      const matchDebt =
        filterSupplierDebt === 'all' ||
        (filterSupplierDebt === 'debt' && (s.debt_amount || 0) > 0) ||
        (filterSupplierDebt === 'no_debt' && (s.debt_amount || 0) === 0);
      let matchDate = true;
      if (dateRange.from && s.created_at && s.created_at.slice(0, 10) < dateRange.from) matchDate = false;
      if (dateRange.to && s.created_at && s.created_at.slice(0, 10) > dateRange.to) matchDate = false;
      return matchSearch && matchGroup && matchDebt && matchDate;
    }).sort((a, b) => {
      if (sortKey === 'total') return sortDir === 'asc' ? a.total_purchase - b.total_purchase : b.total_purchase - a.total_purchase;
      if (sortKey === 'debt') return sortDir === 'asc' ? a.debt_amount - b.debt_amount : b.debt_amount - a.debt_amount;
      return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    });
  }, [suppliers, search, filterGroup, filterSupplierDebt, dateRange, sortKey, sortDir]);

  const filteredReturns = useMemo(() => {
    return purchaseReturns.filter(ret => {
      const matchSearch =
        ret.code.toLowerCase().includes(search.toLowerCase()) ||
        ret.supplier_name.toLowerCase().includes(search.toLowerCase()) ||
        (ret.po_code && ret.po_code.toLowerCase().includes(search.toLowerCase()));
      const matchType = filterType === 'all' || ret.handling === filterType;
      const matchStatus = filterStatus === 'all' || ret.status === filterStatus;
      const matchSupplier = filterSupplier === 'all' || ret.supplier_id === filterSupplier;
      let matchDate = true;
      if (dateRange.from && ret.return_date < dateRange.from) matchDate = false;
      if (dateRange.to && ret.return_date > dateRange.to) matchDate = false;
      return matchSearch && matchType && matchStatus && matchSupplier && matchDate;
    });
  }, [purchaseReturns, search, filterType, filterStatus, filterSupplier, dateRange]);

  const filteredSupplierDebts = useMemo(() => {
    return purchaseOrders
      .filter(p => p.debt_amount > 0 && p.status !== 'cancelled')
      .filter(po => {
        const matchSearch =
          po.code.toLowerCase().includes(search.toLowerCase()) ||
          po.supplier_name.toLowerCase().includes(search.toLowerCase());
        const matchSupplier = filterSupplier === 'all' || po.supplier_id === filterSupplier;
        let matchDate = true;
        if (dateRange.from && po.order_date < dateRange.from) matchDate = false;
        if (dateRange.to && po.order_date > dateRange.to) matchDate = false;
        return matchSearch && matchSupplier && matchDate;
      });
  }, [purchaseOrders, search, filterSupplier, dateRange]);

  // Tab 1 PO Columns
  const poColumns: Column<PurchaseOrder>[] = [
    {
      key: 'code',
      header: 'MÃ PHIẾU',
      render: row => (
        <button
          type="button"
          onClick={() => {
            setSelectedPODetail(row);
            setIsPODetailOpen(true);
          }}
          className="font-bold text-[#6D3EEB] hover:underline cursor-pointer text-left"
        >
          {row.code}
        </button>
      ),
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
            title="Xem chi tiết phiếu mua"
            onClick={() => {
              setSelectedPODetail(row);
              setIsPODetailOpen(true);
            }}
            className="p-1.5 hover:text-[#6D3EEB] text-[#6D3EEB] rounded-full hover:bg-purple-50 transition-colors cursor-pointer"
          >
            <Icon name="visibility" size={18} />
          </button>
          <button
            type="button"
            title="In phiếu mua"
            onClick={() => onPrintDocument('PHIẾU MUA HÀNG', row.code, row)}
            className="p-1.5 hover:text-[#6D3EEB] rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <Icon name="print" size={18} />
          </button>
          {onOpenEditPO && (
            <button
              type="button"
              title="Sửa phiếu mua"
              onClick={() => onOpenEditPO(row)}
              className="p-1.5 hover:text-[#6D3EEB] text-[#6B7280] rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <Icon name="edit" size={18} />
            </button>
          )}
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
          <button
            type="button"
            title={isAdmin ? 'Xoá vĩnh viễn (Chỉ Admin)' : 'Hủy phiếu mua'}
            onClick={() => {
              if (isAdmin) {
                if (
                  confirm(
                    `[ADMIN] Bạn có chắc muốn XÓA VĨNH VIỄN phiếu mua ${row.code}? (Dữ liệu sẽ bị xóa hoàn toàn khỏi hệ thống)`
                  )
                ) {
                  deletePurchaseOrder(row.id);
                }
              } else {
                if (
                  confirm(
                    `Bạn có chắc muốn HỦY phiếu mua ${row.code}? (Chuyển trạng thái 'Đã hủy' để lưu vết sổ sách)`
                  )
                ) {
                  updatePurchaseOrderStatus(row.id, 'cancelled');
                }
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

  // Tab 2 Pending PO Columns
  const pendingColumns: Column<PurchaseOrder>[] = [
    {
      key: 'code',
      header: 'MÃ PHIẾU',
      render: row => (
        <button
          type="button"
          onClick={() => {
            setSelectedPODetail(row);
            setIsPODetailOpen(true);
          }}
          className="font-bold text-[#6D3EEB] hover:underline cursor-pointer text-left"
        >
          {row.code}
        </button>
      ),
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
        <div className="flex items-center justify-end gap-2 text-[#6B7280]">
          <button
            type="button"
            title="Xem chi tiết đơn đặt hàng"
            onClick={() => {
              setSelectedPODetail(row);
              setIsPODetailOpen(true);
            }}
            className="p-1.5 hover:text-[#6D3EEB] text-[#6D3EEB] rounded-full hover:bg-purple-50 transition-colors cursor-pointer"
          >
            <Icon name="visibility" size={18} />
          </button>
          {onOpenEditPO && (
            <button
              type="button"
              title="Sửa đơn đặt hàng"
              onClick={() => onOpenEditPO(row)}
              className="p-1.5 hover:text-[#6D3EEB] text-[#6B7280] rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <Icon name="edit" size={18} />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (confirm(`Xác nhận nhập kho cho đơn đặt hàng ${row.code}?`)) {
                updatePurchaseOrderStatus(row.id, 'received');
                onTabChange('tong-quan');
              }
            }}
            className="px-3 py-1 bg-[#6D3EEB] hover:bg-[#5B2BD6] text-white text-[12px] font-semibold rounded-[8px] transition-colors cursor-pointer"
          >
            Nhận hàng
          </button>
          <button
            type="button"
            title={isAdmin ? 'Xoá vĩnh viễn (Chỉ Admin)' : 'Hủy đơn đặt hàng'}
            onClick={() => {
              if (isAdmin) {
                if (
                  confirm(
                    `[ADMIN] Bạn có chắc muốn XÓA VĨNH VIỄN đơn đặt hàng ${row.code}? (Dữ liệu sẽ bị xóa hoàn toàn khỏi hệ thống)`
                  )
                ) {
                  deletePurchaseOrder(row.id);
                }
              } else {
                if (
                  confirm(
                    `Bạn có chắc muốn HỦY đơn đặt hàng ${row.code}? (Chuyển trạng thái 'Đã hủy' để lưu vết sổ sách)`
                  )
                ) {
                  updatePurchaseOrderStatus(row.id, 'cancelled');
                }
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
          {onOpenEditSupplier && (
            <button
              type="button"
              title="Sửa thông tin NCC"
              onClick={() => onOpenEditSupplier(row)}
              className="p-1.5 hover:text-[#6D3EEB] text-[#6B7280] rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <Icon name="edit" size={18} />
            </button>
          )}
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
            title="Xoá NCC"
            onClick={() => {
              if (confirm(`Xoá nhà cung cấp ${row.name}?`)) deleteSupplier(row.id);
            }}
            className="p-1.5 hover:text-[#E11D48] rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
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
            title="In phiếu trả NCC"
            onClick={() => onPrintDocument('PHIẾU TRẢ HÀNG NCC', row.code, row)}
            className="p-1.5 hover:text-[#6D3EEB] rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <Icon name="print" size={18} />
          </button>
          {onOpenEditReturn && (
            <button
              type="button"
              title="Sửa phiếu trả NCC"
              onClick={() => onOpenEditReturn(row)}
              className="p-1.5 hover:text-[#6D3EEB] text-[#6B7280] rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <Icon name="edit" size={18} />
            </button>
          )}
          <button
            type="button"
            title="Xóa phiếu trả NCC"
            onClick={() => {
              if (confirm(`Xóa phiếu trả NCC ${row.code}?`)) deletePurchaseReturn(row.id);
            }}
            className="p-1.5 hover:text-[#E11D48] rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <Icon name="delete" size={18} />
          </button>
        </div>
      ),
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

          {/* Banner Đối soát Mua vào - Trả lại NCC = Mua thuần (Ảnh 3) */}
          <div className="bg-[#FFF1F2] border border-[#FECDD3] rounded-[12px] p-3 px-4 flex flex-wrap items-center justify-between gap-3 text-[#E11D48] text-[14px]">
            <div className="flex items-center gap-2 font-bold">
              <Icon name="receipt_long" size={20} className="text-[#E11D48]" />
              <span>Đối soát mua hàng:</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap font-medium">
              <span>Mua vào: <strong className="text-[#111827]">{formatCurrency(summaryReconciliation.grossPurchase)}</strong></span>
              <span className="text-[#9CA3AF] font-bold">-</span>
              <span>Trả lại NCC: <strong className="text-[#E11D48]">{formatCurrency(summaryReconciliation.purchaseReturnTotal)}</strong></span>
              <span className="text-[#9CA3AF] font-bold">=</span>
              <span className="bg-[#FFE4E6] px-2.5 py-1 rounded-[8px] text-[#BE123C] font-bold border border-[#FDA4AF]">
                Mua thuần: {formatCurrency(summaryReconciliation.netPurchase)}
              </span>
            </div>
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
                label: 'Nhà cung cấp',
                key: 'supplier',
                value: filterSupplier,
                items: supplierFilterItems,
                onChange: setFilterSupplier,
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
                ],
                onChange: setFilterPayment,
              },
              {
                label: 'Trạng thái',
                key: 'status',
                value: filterStatus,
                items: [
                  { value: 'all', label: 'Trạng thái: Tất cả' },
                  { value: 'ordered', label: 'Đã đặt hàng' },
                  { value: 'received', label: 'Đã nhập kho' },
                  { value: 'completed', label: 'Hoàn tất' },
                  { value: 'cancelled', label: 'Đã hủy' },
                ],
                onChange: setFilterStatus,
              },
            ]}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            sortOptions={[
              { key: 'date', label: 'Sắp xếp: Ngày mua' },
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
              setFilterSupplier('all');
              setDateRange({ from: null, to: null });
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
            onDeleteSelected={(ids: string[]) => {
              if (isAdmin) {
                if (confirm(`[ADMIN] Xóa vĩnh viễn ${ids.length} phiếu mua đã chọn?`)) {
                  deletePurchaseOrdersBatch(ids);
                  setSelectedIds([]);
                }
              } else {
                if (
                  confirm(
                    `Bạn có muốn HỦY ${ids.length} phiếu mua đã chọn? (Chuyển trạng thái 'Đã hủy' để lưu vết sổ sách)`
                  )
                ) {
                  ids.forEach((id: string) => updatePurchaseOrderStatus(id, 'cancelled'));
                  setSelectedIds([]);
                }
              }
            }}
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
            filters={[
              {
                label: 'Nhà cung cấp',
                key: 'supplier',
                value: filterSupplier,
                items: supplierFilterItems,
                onChange: setFilterSupplier,
              },
            ]}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onClearFilters={() => {
              setSearch('');
              setFilterSupplier('all');
              setDateRange({ from: null, to: null });
            }}
          />

          <DataTable
            columns={pendingColumns}
            data={filteredPendingPOs}
            keyExtractor={row => row.id}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onDeleteSelected={(ids: string[]) => {
              if (confirm(`Xóa ${ids.length} đơn đặt hàng đã chọn?`)) {
                deletePurchaseOrdersBatch(ids);
                setSelectedIds([]);
              }
            }}
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
              {
                label: 'Công nợ',
                key: 'debt',
                value: filterSupplierDebt,
                items: [
                  { value: 'all', label: 'Công nợ: Tất cả' },
                  { value: 'debt', label: 'Đang nợ NCC' },
                  { value: 'no_debt', label: 'Không còn nợ' },
                ],
                onChange: setFilterSupplierDebt,
              },
            ]}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            sortOptions={[
              { key: 'name', label: 'Sắp xếp: Tên NCC' },
              { key: 'total', label: 'Sắp xếp: Tổng mua' },
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
              setFilterGroup('all');
              setFilterSupplierDebt('all');
              setDateRange({ from: null, to: null });
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
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onDeleteSelected={(ids: string[]) => {
              if (confirm(`Xóa ${ids.length} nhà cung cấp đã chọn?`)) {
                deleteSuppliersBatch(ids);
                setSelectedIds([]);
              }
            }}
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
                label: 'Nhà cung cấp',
                key: 'supplier',
                value: filterSupplier,
                items: supplierFilterItems,
                onChange: setFilterSupplier,
              },
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
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onClearFilters={() => {
              setSearch('');
              setFilterType('all');
              setFilterSupplier('all');
              setDateRange({ from: null, to: null });
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
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onDeleteSelected={(ids: string[]) => {
              if (confirm(`Xóa ${ids.length} phiếu trả NCC đã chọn?`)) {
                deletePurchaseReturnsBatch(ids);
                setSelectedIds([]);
              }
            }}
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
            filters={[
              {
                label: 'Nhà cung cấp',
                key: 'supplier',
                value: filterSupplier,
                items: supplierFilterItems,
                onChange: setFilterSupplier,
              },
            ]}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onClearFilters={() => {
              setSearch('');
              setFilterSupplier('all');
              setDateRange({ from: null, to: null });
            }}
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
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            emptyMessage="Không có công nợ phải trả"
          />
        </div>
      )}

      {/* Purchase Order Detail Modal (Image 2) */}
      <PurchaseOrderDetailModal
        isOpen={isPODetailOpen}
        order={selectedPODetail}
        allOrders={purchaseOrders}
        onSelectOrder={po => setSelectedPODetail(po)}
        onClose={() => {
          setIsPODetailOpen(false);
          setSelectedPODetail(null);
        }}
        onPrint={po => onPrintDocument('PHIẾU MUA HÀNG', po.code, po)}
        onEdit={po => {
          setIsPODetailOpen(false);
          setSelectedPODetail(null);
          onOpenEditPO?.(po);
        }}
        onClone={po => {
          setIsPODetailOpen(false);
          setSelectedPODetail(null);
          if (onOpenCreatePO) onOpenCreatePO();
        }}
        onPay={po => onOpenPaymentAllocation(po.supplier_id, po.id)}
        onDelete={po => {
          if (isAdmin) {
            if (
              confirm(
                `[ADMIN] Bạn có chắc muốn XÓA VĨNH VIỄN phiếu mua ${po.code}? (Dữ liệu sẽ bị xóa hoàn toàn khỏi hệ thống)`
              )
            ) {
              deletePurchaseOrder(po.id);
              setIsPODetailOpen(false);
              setSelectedPODetail(null);
            }
          } else {
            if (
              confirm(
                `Bạn có chắc muốn HỦY phiếu mua ${po.code}? (Chuyển trạng thái 'Đã hủy' để lưu vết sổ sách)`
              )
            ) {
              updatePurchaseOrderStatus(po.id, 'cancelled');
              setIsPODetailOpen(false);
              setSelectedPODetail(null);
            }
          }
        }}
      />
    </div>
  );
};
