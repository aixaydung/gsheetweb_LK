import React from 'react';
import { PurchaseOrder } from '../../types';
import { Icon } from '../ui/Icon';
import { formatCurrency, formatDate } from '../../lib/format';
import { useApp } from '../../context/AppContext';

interface PurchaseOrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: PurchaseOrder | null;
  allOrders?: PurchaseOrder[];
  onSelectOrder?: (po: PurchaseOrder) => void;
  onPrint?: (po: PurchaseOrder) => void;
  onDelete?: (po: PurchaseOrder) => void;
  onEdit?: (po: PurchaseOrder) => void;
  onClone?: (po: PurchaseOrder) => void;
  onPay?: (po: PurchaseOrder) => void;
}

export const PurchaseOrderDetailModal: React.FC<PurchaseOrderDetailModalProps> = ({
  isOpen,
  onClose,
  order,
  allOrders = [],
  onSelectOrder,
  onPrint,
  onDelete,
  onEdit,
  onClone,
  onPay,
}) => {
  const { payments } = useApp();

  if (!isOpen || !order) return null;

  const currentIndex = allOrders.findIndex(o => o.id === order.id);
  const totalCount = allOrders.length > 0 ? allOrders.length : 1;

  const handlePrev = () => {
    if (currentIndex > 0 && onSelectOrder) {
      onSelectOrder(allOrders[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < allOrders.length - 1 && onSelectOrder) {
      onSelectOrder(allOrders[currentIndex + 1]);
    }
  };

  // Find related payment history
  const relatedPayments = payments.filter(p =>
    p.allocations?.some(a => a.doc_id === order.id || a.doc_code === order.code)
  );

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'ordered':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[12.5px] font-semibold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
            Đã đặt hàng
          </span>
        );
      case 'received':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[12.5px] font-semibold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
            Đã nhập kho
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[12.5px] font-semibold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
            Hoàn thành
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[12.5px] font-semibold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
            Đã huỷ
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[12.5px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            Bản nháp
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (status?: string, debt?: number) => {
    if (debt === 0 || status === 'paid') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-[12.5px] font-semibold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
          Đã thanh toán
        </span>
      );
    }
    if (status === 'partial') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-[12.5px] font-semibold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
          Thanh toán 1 phần
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-[12.5px] font-semibold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
        Chưa thanh toán
      </span>
    );
  };

  const debt =
    order.debt_amount !== undefined
      ? order.debt_amount
      : Math.max(0, order.total - (order.paid_amount || 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-[#1E232E] rounded-[22px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-[#E5E7EB] dark:border-gray-800 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header (Matching Image 2) */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800/80">
          <div className="flex items-center gap-3.5">
            {/* Purple Icon Box with Shopping Cart */}
            <div className="w-12 h-12 rounded-[14px] bg-[#6D3EEB] flex items-center justify-center text-white shadow-md shadow-purple-500/25 shrink-0">
              <Icon name="shopping_cart" size={24} />
            </div>
            <div>
              <h2 className="text-[19px] font-bold text-[#111827] dark:text-white leading-tight flex items-center gap-2">
                Phiếu mua {order.code}
              </h2>
              <p className="text-[13.5px] text-[#6B7280] dark:text-gray-400 font-medium mt-0.5">
                {order.supplier_name ? `NCC ${order.supplier_name}` : 'Nhà cung cấp'}
              </p>
            </div>
          </div>

          {/* Right Controls: Navigation + Close */}
          <div className="flex items-center gap-3">
            {allOrders.length > 1 && (
              <div className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 rounded-[10px] border border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIndex <= 0}
                  className="p-1 hover:text-black dark:hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Icon name="chevron_left" size={16} />
                </button>
                <span>
                  {currentIndex + 1}/{totalCount}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentIndex >= totalCount - 1}
                  className="p-1 hover:text-black dark:hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Icon name="chevron_right" size={16} />
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <Icon name="close" size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Row 1: Order Date & Status Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-[14px] text-[#4B5563] dark:text-gray-300">
              Ngày mua: <strong className="text-[#111827] dark:text-white font-bold">{formatDate(order.order_date)}</strong>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(order.status)}
              {getPaymentStatusBadge(order.payment_status, debt)}
            </div>
          </div>

          {/* Products Table (Matching Image 2) */}
          <div className="border border-[#E5E7EB] dark:border-gray-800 rounded-[14px] overflow-hidden">
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Sản phẩm</th>
                  <th className="py-2.5 px-3 text-center">SL</th>
                  <th className="py-2.5 px-3 text-right">Đơn giá</th>
                  <th className="py-2.5 px-4 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] dark:divide-gray-800">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {item.product_name}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[11px] font-medium bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                            <Icon name="inventory_2" size={12} />
                            <span>Hàng hóa</span>
                          </span>
                        </div>
                        {item.sku && (
                          <div className="text-[11.5px] text-gray-400 mt-0.5">Mã: {item.sku}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center text-gray-700 dark:text-gray-300 font-medium tabular-nums">
                        {item.quantity} {item.unit ? <span className="text-gray-400 text-[11.5px]">{item.unit}</span> : ''}
                      </td>
                      <td className="py-3 px-3 text-right text-gray-700 dark:text-gray-300 font-medium tabular-nums">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-gray-900 dark:text-white tabular-nums">
                        {formatCurrency(item.line_total)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-400">
                      Không có sản phẩm nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Summary Box (Matching Image 2) */}
          <div className="bg-[#F9FAFB] dark:bg-gray-800/30 rounded-[16px] p-4 space-y-2 border border-gray-100 dark:border-gray-800/60">
            <div className="flex items-center justify-between text-[13.5px]">
              <span className="text-gray-500 font-medium">Tổng tiền</span>
              <span className="text-[17px] font-bold text-[#111827] dark:text-white tabular-nums">
                {formatCurrency(order.total)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[13.5px]">
              <span className="text-gray-500 font-medium">Đã trả</span>
              <span className="text-[14.5px] font-semibold text-[#059669] tabular-nums">
                {formatCurrency(order.paid_amount || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[13.5px] pt-1 border-t border-gray-200/60 dark:border-gray-700/60">
              <span className="text-gray-500 font-medium">Còn nợ</span>
              <span className="text-[17px] font-bold text-[#DC2626] tabular-nums">
                {formatCurrency(debt)}
              </span>
            </div>
          </div>

          {/* Payment History Box (Dashed border matching Image 2) */}
          <div className="border-2 border-dashed border-gray-200 dark:border-gray-700/60 rounded-[14px] p-4">
            {relatedPayments.length > 0 ? (
              <div className="space-y-2">
                <div className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">
                  Lịch sử thanh toán ({relatedPayments.length} giao dịch)
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {relatedPayments.map(p => (
                    <div key={p.id} className="py-2 flex items-center justify-between text-[13px]">
                      <div>
                        <div className="font-semibold text-gray-800 dark:text-gray-200">{p.code}</div>
                        <div className="text-[11.5px] text-gray-400">{formatDate(p.payment_date)} · {p.method === 'transfer' ? 'Chuyển khoản' : 'Tiền mặt'}</div>
                      </div>
                      <div className="font-bold text-[#059669] tabular-nums">
                        {formatCurrency(p.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-[13px] text-gray-500 dark:text-gray-400 py-1">
                Chưa có lịch sử giao dịch thanh toán cho chứng từ này.
              </p>
            )}
          </div>
        </div>

        {/* Footer (5 Action Buttons matching Image 2 exactly) */}
        <div className="p-4 px-6 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-end gap-2.5 bg-gray-50/50 dark:bg-gray-800/20">
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(order)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-[#1F2937] dark:text-gray-200 text-[13px] font-semibold rounded-[12px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs active:scale-95"
            >
              <Icon name="delete" size={17} className="text-gray-500" />
              <span>Xóa</span>
            </button>
          )}

          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(order);
              }}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-[#1F2937] dark:text-gray-200 text-[13px] font-semibold rounded-[12px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs active:scale-95"
            >
              <Icon name="edit" size={17} className="text-gray-500" />
              <span>Sửa</span>
            </button>
          )}

          {onClone && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onClone(order);
              }}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-[#1F2937] dark:text-gray-200 text-[13px] font-semibold rounded-[12px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs active:scale-95"
            >
              <Icon name="content_copy" size={17} className="text-gray-500" />
              <span>Tạo phiếu giống</span>
            </button>
          )}

          {onPrint && (
            <button
              type="button"
              onClick={() => {
                onPrint(order);
              }}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-[#1F2937] dark:text-gray-200 text-[13px] font-semibold rounded-[12px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs active:scale-95"
            >
              <Icon name="print" size={17} className="text-gray-500" />
              <span>In / Gửi</span>
            </button>
          )}

          {onPay && debt > 0 && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onPay(order);
              }}
              className="px-4 py-2 bg-[#6D3EEB] hover:bg-[#5B2BD6] text-white text-[13px] font-semibold rounded-[12px] shadow-[0_8px_20px_-6px_rgba(109,62,235,0.55)] flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Icon name="payments" size={17} />
              <span>Thanh toán</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
