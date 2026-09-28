import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/ui/PageHeader';
import { KpiCard } from '../components/ui/KpiCard';
import { FilterToolbar, FilterOption } from '../components/ui/FilterToolbar';
import { DataTable, Column } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Icon } from '../components/ui/Icon';
import { formatCurrency, formatDateTime } from '../lib/format';
import { exportToExcelFile, ExportColumn } from '../lib/excelExport';
import { Payment } from '../types';

interface CashbookViewProps {
  onOpenCreateReceipt: () => void;
  onOpenCreatePayment: () => void;
  onPrintDocument?: (type: string, code: string, doc: any) => void;
}

export const CashbookView: React.FC<CashbookViewProps> = ({
  onOpenCreateReceipt,
  onOpenCreatePayment,
  onPrintDocument,
}) => {
  const { payments, cancelPayment } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'in' | 'out'>('all');
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filtered payments list
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      // Tab filter (all, in = Thu, out = Chi)
      if (activeTab === 'in' && p.direction !== 'in') return false;
      if (activeTab === 'out' && p.direction !== 'out') return false;

      // Method filter
      if (methodFilter !== 'all' && p.method !== methodFilter) return false;

      // Status filter
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const codeMatch = p.code.toLowerCase().includes(q);
        const partnerMatch = (p.partner_name || '').toLowerCase().includes(q);
        const noteMatch = (p.note || '').toLowerCase().includes(q);
        const refMatch = (p.allocations || []).some(a => (a.doc_code || '').toLowerCase().includes(q));
        if (!codeMatch && !partnerMatch && !noteMatch && !refMatch) return false;
      }

      return true;
    });
  }, [payments, activeTab, methodFilter, statusFilter, search]);

  // Aggregate stats
  const activePayments = useMemo(() => payments.filter(p => p.status !== 'cancelled'), [payments]);
  const totalIn = useMemo(
    () => activePayments.filter(p => p.direction === 'in').reduce((sum, p) => sum + p.amount, 0),
    [activePayments]
  );
  const totalOut = useMemo(
    () => activePayments.filter(p => p.direction === 'out').reduce((sum, p) => sum + p.amount, 0),
    [activePayments]
  );
  const netFund = totalIn - totalOut;

  // Handle Cancel Payment
  const handleCancel = (payment: Payment) => {
    if (window.confirm(`Bạn có chắc muốn hủy phiếu ${payment.code}? Công nợ hóa đơn/đơn mua tương ứng sẽ được tự động hoàn lại.`)) {
      cancelPayment(payment.id);
    }
  };

  // Handle Export Excel
  const handleExportExcel = () => {
    const exportColumns: ExportColumn<Payment>[] = [
      { key: 'code', header: 'Mã phiếu' },
      {
        key: 'payment_date',
        header: 'Ngày ghi sổ',
        accessor: p => formatDateTime(p.payment_date),
      },
      {
        key: 'direction',
        header: 'Loại phiếu',
        accessor: p => (p.direction === 'in' ? 'Phiếu thu' : 'Phiếu chi'),
      },
      {
        key: 'partner_name',
        header: 'Đối tác',
        accessor: p => p.partner_name || 'Khách vãng lai',
      },
      {
        key: 'partner_type',
        header: 'Loại đối tác',
        accessor: p => (p.partner_type === 'customer' ? 'Khách hàng' : 'Nhà cung cấp'),
      },
      {
        key: 'method',
        header: 'Hình thức',
        accessor: p => (p.method === 'cash' ? 'Tiền mặt' : p.method === 'transfer' ? 'Chuyển khoản' : 'Khác'),
      },
      {
        key: 'amount',
        header: 'Số tiền',
        accessor: p => p.amount,
      },
      {
        key: 'reference_code',
        header: 'Chứng từ tham chiếu',
        accessor: p => (p.allocations || []).map(a => a.doc_code || a.doc_id).join('; '),
      },
      {
        key: 'note',
        header: 'Ghi chú',
        accessor: p => p.note || '',
      },
      {
        key: 'status',
        header: 'Trạng thái',
        accessor: p => (p.status === 'active' ? 'Đã ghi sổ' : 'Đã hủy'),
      },
    ];

    exportToExcelFile(filteredPayments, exportColumns, 'So_quy_thu_chi');
  };

  const columns: Column<Payment>[] = [
    {
      key: 'code',
      header: 'Mã phiếu',
      render: (p: Payment) => (
        <div className="flex items-center gap-2">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 ${
              p.direction === 'in' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}
          >
            <Icon name={p.direction === 'in' ? 'south_west' : 'north_east'} size={14} />
          </span>
          <div>
            <div className="font-semibold text-[#111827]">{p.code}</div>
            <div className="text-[11.5px] text-[#6B7280]">{formatDateTime(p.payment_date)}</div>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'direction',
      header: 'Loại phiếu',
      render: (p: Payment) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${
            p.direction === 'in'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {p.direction === 'in' ? 'Phiếu thu' : 'Phiếu chi'}
        </span>
      ),
    },
    {
      key: 'partner_name',
      header: 'Đối tác',
      render: (p: Payment) => (
        <div>
          <div className="font-medium text-[#111827]">{p.partner_name || 'Khách vãng lai'}</div>
          <div className="text-[11.5px] text-[#6B7280]">
            {p.partner_type === 'customer' ? 'Khách hàng' : 'Nhà cung cấp'}
          </div>
        </div>
      ),
    },
    {
      key: 'method',
      header: 'Hình thức',
      render: (p: Payment) => (
        <span className="text-[13px] text-[#374151] font-medium flex items-center gap-1.5">
          <Icon name={p.method === 'cash' ? 'payments' : 'account_balance'} size={15} className="text-[#6B7280]" />
          {p.method === 'cash' ? 'Tiền mặt' : p.method === 'transfer' ? 'Chuyển khoản' : 'Khác'}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Số tiền (VNĐ)',
      render: (p: Payment) => (
        <div className="text-right">
          <span
            className={`font-bold text-[14.5px] ${
              p.status === 'cancelled'
                ? 'line-through text-[#9CA3AF]'
                : p.direction === 'in'
                ? 'text-emerald-600'
                : 'text-rose-600'
            }`}
          >
            {p.direction === 'in' ? '+' : '-'}{formatCurrency(p.amount)}
          </span>
        </div>
      ),
      sortable: true,
      align: 'right',
    },
    {
      key: 'reference_code',
      header: 'Chứng từ tham chiếu',
      render: (p: Payment) => {
        if (!p.allocations || p.allocations.length === 0) {
          return <span className="text-[#9CA3AF] text-[12px]">—</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {p.allocations.map((a, idx) => (
              <span
                key={a.id || idx}
                className="px-2 py-0.5 bg-[#F3F4F6] text-[#374151] rounded text-[11px] font-medium"
              >
                {a.doc_code || a.doc_id}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'note',
      header: 'Ghi chú',
      render: (p: Payment) => (
        <span className="text-[12.5px] text-[#4B5563] truncate max-w-[180px] inline-block">{p.note || '—'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (p: Payment) => (
        <StatusBadge
          status={p.status === 'active' ? 'completed' : 'cancelled'}
          customLabel={p.status === 'active' ? 'Đã ghi sổ' : 'Đã hủy'}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (p: Payment) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onPrintDocument?.(p.direction === 'in' ? 'PHIẾU THU TIỀN' : 'PHIẾU CHI TIỀN', p.code, p)}
            title="In phiếu thu/chi này"
            className="px-2.5 py-1 text-[12px] text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-[8px] transition-colors font-medium border border-[#E5E7EB] inline-flex items-center gap-1"
          >
            <Icon name="print" size={13} />
            <span>In</span>
          </button>
          {p.status === 'active' && (
            <button
              type="button"
              onClick={() => handleCancel(p)}
              title="Hủy phiếu thu/chi này"
              className="px-2.5 py-1 text-[12px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-[8px] transition-colors font-medium border border-rose-200"
            >
              Hủy
            </button>
          )}
        </div>
      ),
      align: 'right',
    },
  ];

  const filterOptions: FilterOption[] = [
    {
      key: 'method',
      label: 'Hình thức',
      value: methodFilter,
      onChange: setMethodFilter,
      items: [
        { label: 'Tất cả hình thức', value: 'all' },
        { label: 'Chuyển khoản', value: 'transfer' },
        { label: 'Tiền mặt', value: 'cash' },
      ],
    },
    {
      key: 'status',
      label: 'Trạng thái',
      value: statusFilter,
      onChange: setStatusFilter,
      items: [
        { label: 'Tất cả trạng thái', value: 'all' },
        { label: 'Đã ghi sổ', value: 'active' },
        { label: 'Đã hủy', value: 'cancelled' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Sổ quỹ tiền mặt & Ngân hàng"
        subtitle="Quản lý toàn diện các khoản thu, chi, gạch nợ và đối chiếu dòng tiền"
        rightAction={
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-[12px] border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#374151] text-[13px] sm:text-[14px] font-semibold transition-all shadow-xs active:scale-98"
              title="Xuất danh sách sổ quỹ ra file Excel (CSV UTF-8 BOM)"
            >
              <Icon name="download" size={17} className="text-[#6D3EEB]" />
              <span>Xuất Excel</span>
            </button>
            <button
              type="button"
              onClick={onOpenCreatePayment}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-[12px] border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#374151] text-[13px] sm:text-[14px] font-semibold transition-all shadow-xs active:scale-98"
            >
              <Icon name="remove_circle" size={17} className="text-rose-600" />
              <span>Tạo phiếu chi</span>
            </button>
            <button
              type="button"
              onClick={onOpenCreateReceipt}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-[12px] bg-[#6D3EEB] hover:bg-[#5B31D0] text-white text-[13px] sm:text-[14px] font-semibold transition-all shadow-sm active:scale-98"
            >
              <Icon name="add_circle" size={17} />
              <span>Tạo phiếu thu</span>
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          label="Tổng tiền thu"
          value={formatCurrency(totalIn)}
          icon="south_west"
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          trend={{ value: 'Đã vào quỹ', isUp: true }}
        />
        <KpiCard
          label="Tổng tiền chi"
          value={formatCurrency(totalOut)}
          icon="north_east"
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
          trend={{ value: 'Đã xuất quỹ', isUp: false }}
        />
        <KpiCard
          label="Tồn quỹ ròng"
          value={formatCurrency(netFund)}
          icon="account_balance_wallet"
          iconBg={netFund >= 0 ? 'bg-purple-50' : 'bg-amber-50'}
          iconColor={netFund >= 0 ? 'text-[#6D3EEB]' : 'text-amber-600'}
          trend={{ value: 'Số dư thực tế', isUp: netFund >= 0 }}
        />
        <KpiCard
          label="Tổng số phiếu"
          value={payments.length.toString()}
          icon="receipt_long"
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          trend={{ value: `${activePayments.length} đang hiệu lực`, isUp: true }}
        />
      </div>

      {/* Segmented Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-[13.5px] font-semibold rounded-[10px] transition-colors ${
            activeTab === 'all'
              ? 'bg-[#6D3EEB] text-white shadow-xs'
              : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6]'
          }`}
        >
          Tất cả phiếu ({payments.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('in')}
          className={`px-4 py-2 text-[13.5px] font-semibold rounded-[10px] transition-colors flex items-center gap-1.5 ${
            activeTab === 'in'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6]'
          }`}
        >
          <Icon name="south_west" size={15} />
          Phiếu thu ({payments.filter(p => p.direction === 'in').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('out')}
          className={`px-4 py-2 text-[13.5px] font-semibold rounded-[10px] transition-colors flex items-center gap-1.5 ${
            activeTab === 'out'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6]'
          }`}
        >
          <Icon name="north_east" size={15} />
          Phiếu chi ({payments.filter(p => p.direction === 'out').length})
        </button>
      </div>

      {/* Filter Toolbar */}
      <FilterToolbar
        searchPlaceholder="Tìm theo mã PT/PC, đối tác, số hóa đơn, ghi chú..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={filterOptions}
      />

      {/* Main Data Table */}
      <div className="bg-white rounded-[16px] border border-[#E5E7EB] shadow-xs overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredPayments}
          keyExtractor={p => p.id}
          emptyMessage="Chưa có phiếu thu/chi nào phù hợp với bộ lọc."
        />
      </div>
    </div>
  );
};
