import React, { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Icon } from '../ui/Icon';
import { Product } from '../../types/index.js';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { checkProductDeletionImpact, ProductDeletionImpact } from '../../utils/productValidation.js';
import { formatCurrency, formatQuantity, formatDate, formatDateTime } from '../../lib/format';

interface ProductDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSuccess?: () => void;
  onNavigateToStockCard?: (sku: string) => void;
}

export const ProductDeleteModal: React.FC<ProductDeleteModalProps> = ({
  isOpen,
  onClose,
  products,
  onSuccess,
  onNavigateToStockCard,
}) => {
  const {
    invoices,
    purchaseOrders,
    stockVouchers,
    stocktakes,
    salesReturns,
    purchaseReturns,
    quotations,
    deleteProduct,
    deleteProductsBatch,
    updateProduct,
  } = useApp();

  const { user } = useAuth();

  const [confirmText, setConfirmText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [overrideAdminConfirm, setOverrideAdminConfirm] = useState(false);

  const isAdmin = user?.role === 'admin';

  const dataSources = useMemo(
    () => ({
      invoices,
      purchaseOrders,
      stockVouchers,
      stocktakes,
      salesReturns,
      purchaseReturns,
      quotations,
    }),
    [invoices, purchaseOrders, stockVouchers, stocktakes, salesReturns, purchaseReturns, quotations]
  );

  // Single or multiple analysis
  const reports: ProductDeletionImpact[] = useMemo(() => {
    if (!products || products.length === 0) return [];
    return products.map(p => checkProductDeletionImpact(p, dataSources));
  }, [products, dataSources]);

  const isSingle = reports.length === 1;
  const singleReport = reports[0];

  // Batch breakdown
  const blockedProducts = useMemo(() => reports.filter(r => r.severity === 'blocked'), [reports]);
  const warningProducts = useMemo(() => reports.filter(r => r.severity === 'warning'), [reports]);
  const safeProducts = useMemo(() => reports.filter(r => r.severity === 'safe'), [reports]);

  // Action: Deactivate (Soft-delete / Ngừng kinh doanh)
  const handleDeactivate = async (targetProducts: Product[]) => {
    setIsProcessing(true);
    try {
      targetProducts.forEach(p => {
        // Soft delete: sets status to inactive
        deleteProduct(p.id, false);
      });
      onSuccess?.();
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  // Action: Hard delete (Permanent delete from Google Sheets)
  const handleHardDelete = async (targetProducts: Product[]) => {
    setIsProcessing(true);
    try {
      if (targetProducts.length === 1) {
        deleteProduct(targetProducts[0].id, true);
      } else {
        deleteProductsBatch(targetProducts.map(p => p.id), true);
      }
      onSuccess?.();
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || reports.length === 0) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isSingle ? `Kiểm tra & Xóa sản phẩm: ${singleReport.product.name}` : `Kiểm tra an toàn: Xóa ${reports.length} sản phẩm`}
      subtitle="Báo cáo kiểm tra tồn kho thực tế và tính toàn vẹn chứng từ liên quan"
      icon="inventory_2"
      width={isSingle ? 'md' : 'lg'}
    >
      {isSingle ? (
        /* SINGLE PRODUCT VIEW */
        <div className="space-y-5 text-sm">
          {/* Header Card */}
          <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 font-mono">MÃ SKU: <span className="font-bold text-gray-900">{singleReport.product.sku}</span></div>
              <div className="text-base font-bold text-gray-900">{singleReport.product.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                Nhóm: <span className="text-gray-700 font-medium">{singleReport.product.group_name || 'Khác'}</span> | ĐVT: <span className="text-gray-700 font-medium">{singleReport.product.unit}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Giá bán</div>
              <div className="text-sm font-semibold text-[#6D3EEB]">{formatCurrency(singleReport.product.sale_price)}</div>
            </div>
          </div>

          {/* Severity Banner */}
          {singleReport.severity === 'blocked' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon name="block" size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-red-900 uppercase tracking-wide">
                    KHÔNG THỂ XÓA SẢN PHẨM NÀY
                  </h4>
                  <p className="text-xs text-red-700 mt-1 leading-relaxed font-medium">
                    {singleReport.primaryReason}
                  </p>
                  <div className="mt-2.5 pt-2.5 border-t border-red-200 text-xs text-red-800 flex items-center gap-1.5">
                    <Icon name="lightbulb" size={16} />
                    <span><strong>Hướng xử lý:</strong> {singleReport.suggestion}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {singleReport.severity === 'warning' && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon name="warning" size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-amber-900 uppercase tracking-wide">
                    CẢNH BÁO RỦI RO KẾ TOÁN & LỊCH SỬ KHO
                  </h4>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    {singleReport.primaryReason}
                  </p>
                  <p className="text-xs text-amber-900 mt-2 font-medium bg-amber-100/70 p-2 rounded-lg">
                    💡 <strong>Khuyến nghị LK ERP:</strong> Hãy chọn <strong>"Ngừng kinh doanh"</strong>. Sản phẩm sẽ bị ẩn khỏi menu bán hàng và nhập hàng mới, nhưng toàn bộ doanh thu, lợi nhuận và thẻ kho quá khứ được giữ nguyên 100%.
                  </p>
                </div>
              </div>
            </div>
          )}

          {singleReport.severity === 'safe' && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon name="check_circle" size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-emerald-900 uppercase tracking-wide">
                    ĐỦ ĐIỀU KIỆN XÓA AN TOÀN
                  </h4>
                  <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                    {singleReport.primaryReason}
                  </p>
                  <p className="text-xs text-emerald-800 mt-1">
                    Bạn có thể xóa hoàn toàn sản phẩm này mà không ảnh hưởng đến bất kỳ báo cáo hoặc sổ sách nào.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Audit Trace Detail Grid */}
          <div className="border border-gray-200 rounded-xl p-3.5 space-y-3 bg-white">
            <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Icon name="fact_check" size={16} />
              Chi tiết kiểm tra các ràng buộc hệ thống
            </h5>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className={`p-2.5 rounded-lg border ${singleReport.hasStock ? 'bg-red-50/50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="text-gray-500 font-medium">Tồn kho hiện tại</div>
                <div className={`text-base font-bold tabular-nums mt-0.5 ${singleReport.hasStock ? 'text-red-600' : 'text-emerald-600'}`}>
                  {formatQuantity(singleReport.stockQuantity)} {singleReport.product.unit}
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">Giá trị: {formatCurrency(singleReport.stockValue)}</div>
              </div>

              <div className={`p-2.5 rounded-lg border ${singleReport.stats.invoiceCount > 0 ? 'bg-purple-50/50 border-purple-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="text-gray-500 font-medium">Hóa đơn bán hàng</div>
                <div className="text-base font-bold text-gray-900 tabular-nums mt-0.5">
                  {singleReport.stats.invoiceCount} đơn
                </div>
                {singleReport.stats.pendingInvoiceCount > 0 && (
                  <div className="text-[11px] text-red-600 font-medium">({singleReport.stats.pendingInvoiceCount} đang xử lý)</div>
                )}
              </div>

              <div className={`p-2.5 rounded-lg border ${singleReport.stats.poCount > 0 ? 'bg-blue-50/50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="text-gray-500 font-medium">Đơn mua hàng NCC</div>
                <div className="text-base font-bold text-gray-900 tabular-nums mt-0.5">
                  {singleReport.stats.poCount} đơn
                </div>
                {singleReport.stats.pendingPOCount > 0 && (
                  <div className="text-[11px] text-red-600 font-medium">({singleReport.stats.pendingPOCount} chờ giao)</div>
                )}
              </div>

              <div className="p-2.5 rounded-lg border bg-gray-50 border-gray-200">
                <div className="text-gray-500 font-medium">Phiếu xuất / nhập kho</div>
                <div className="text-base font-bold text-gray-900 tabular-nums mt-0.5">
                  {singleReport.stats.voucherCount} phiếu
                </div>
              </div>

              <div className="p-2.5 rounded-lg border bg-gray-50 border-gray-200">
                <div className="text-gray-500 font-medium">Phiếu kiểm kê kho</div>
                <div className="text-base font-bold text-gray-900 tabular-nums mt-0.5">
                  {singleReport.stats.stocktakeCount} lần
                </div>
              </div>

              <div className="p-2.5 rounded-lg border bg-gray-50 border-gray-200">
                <div className="text-gray-500 font-medium">Trả hàng & Báo giá</div>
                <div className="text-base font-bold text-gray-900 tabular-nums mt-0.5">
                  {singleReport.stats.returnCount + singleReport.stats.quotationCount} phiếu
                </div>
              </div>
            </div>
          </div>

          {/* Admin Override Input (Only shown if warning and admin) */}
          {singleReport.severity === 'warning' && isAdmin && (
            <div className="p-3 bg-red-50/60 border border-red-200 rounded-xl space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-red-900">
                <input
                  type="checkbox"
                  checked={overrideAdminConfirm}
                  onChange={e => setOverrideAdminConfirm(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                />
                [ADMIN] Tôi chấp nhận xóa vĩnh viễn và hiểu rằng lịch sử báo cáo cũ sẽ bị mất mã này
              </label>
              {overrideAdminConfirm && (
                <div className="text-xs text-gray-600 pl-6">
                  Vui lòng gõ chữ <strong className="text-red-600 font-mono">XOA</strong> để mở khóa:
                  <input
                    type="text"
                    placeholder="Gõ XOA để xác nhận"
                    value={confirmText}
                    onChange={e => setConfirmText(e.target.value.toUpperCase())}
                    className="mt-1 block w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>

            {/* If blocked: Offer link to stock card or cancel */}
            {singleReport.severity === 'blocked' && (
              <>
                {onNavigateToStockCard && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToStockCard(singleReport.product.sku);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Icon name="history_edu" size={16} />
                    Xem Thẻ kho
                  </button>
                )}
                <button
                  type="button"
                  disabled
                  title="Không thể xóa do vi phạm điều kiện tồn kho hoặc chứng từ"
                  className="px-4 py-2 text-xs font-semibold text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed border border-gray-200"
                >
                  Xóa sản phẩm (Đã khóa)
                </button>
              </>
            )}

            {/* If warning: Recommend Deactivate */}
            {singleReport.severity === 'warning' && (
              <>
                <button
                  type="button"
                  onClick={() => handleDeactivate([singleReport.product])}
                  disabled={isProcessing}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#6D3EEB] hover:bg-[#5B2FD1] rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Icon name="archive" size={16} />
                  Ngừng kinh doanh (Khuyến nghị)
                </button>

                {isAdmin && overrideAdminConfirm && (
                  <button
                    type="button"
                    disabled={isProcessing || confirmText !== 'XOA'}
                    onClick={() => handleHardDelete([singleReport.product])}
                    className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors flex items-center gap-1.5 ${
                      confirmText === 'XOA' && !isProcessing
                        ? 'bg-red-600 hover:bg-red-700 cursor-pointer'
                        : 'bg-red-300 cursor-not-allowed'
                    }`}
                  >
                    <Icon name="delete_forever" size={16} />
                    Xóa vĩnh viễn
                  </button>
                )}
              </>
            )}

            {/* If safe: Direct hard delete */}
            {singleReport.severity === 'safe' && (
              <button
                type="button"
                onClick={() => handleHardDelete([singleReport.product])}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Icon name="delete" size={16} />
                Xóa vĩnh viễn ngay
              </button>
            )}
          </div>
        </div>
      ) : (
        /* BATCH SELECTION VIEW */
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <div className="text-red-700 font-semibold flex items-center gap-1">
                <Icon name="block" size={16} />
                Bị chặn (Không thể xóa)
              </div>
              <div className="text-xl font-bold text-red-700 mt-1 tabular-nums">
                {blockedProducts.length} <span className="text-xs font-normal">sản phẩm</span>
              </div>
              <div className="text-[11px] text-red-600 mt-1">Còn tồn kho hoặc có đơn đang xử lý</div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="text-amber-800 font-semibold flex items-center gap-1">
                <Icon name="warning" size={16} />
                Có lịch sử giao dịch
              </div>
              <div className="text-xl font-bold text-amber-800 mt-1 tabular-nums">
                {warningProducts.length} <span className="text-xs font-normal">sản phẩm</span>
              </div>
              <div className="text-[11px] text-amber-700 mt-1">Nên chuyển Ngừng kinh doanh</div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="text-emerald-700 font-semibold flex items-center gap-1">
                <Icon name="check_circle" size={16} />
                An toàn để xóa
              </div>
              <div className="text-xl font-bold text-emerald-700 mt-1 tabular-nums">
                {safeProducts.length} <span className="text-xs font-normal">sản phẩm</span>
              </div>
              <div className="text-[11px] text-emerald-600 mt-1">0 tồn kho & 0 giao dịch</div>
            </div>
          </div>

          {/* List breakdown table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">Sản phẩm</th>
                  <th className="py-2.5 px-3 text-right">Tồn kho</th>
                  <th className="py-2.5 px-3 text-right">Chứng từ</th>
                  <th className="py-2.5 px-3 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map(r => (
                  <tr key={r.product.id} className="hover:bg-gray-50/50">
                    <td className="py-2 px-3">
                      <div className="font-semibold text-gray-900">{r.product.name}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{r.product.sku}</div>
                    </td>
                    <td className="py-2 px-3 text-right font-medium tabular-nums">
                      <span className={r.hasStock ? 'text-red-600 font-bold' : 'text-gray-600'}>
                        {formatQuantity(r.stockQuantity)} {r.product.unit}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-gray-700 tabular-nums">
                      {r.stats.totalLinkedRecords}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {r.severity === 'blocked' && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-700">
                          Bị chặn
                        </span>
                      )}
                      {r.severity === 'warning' && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                          Có lịch sử
                        </span>
                      )}
                      {r.severity === 'safe' && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">
                          An toàn
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-between border-t border-gray-200">
            <div className="text-xs text-gray-500">
              {blockedProducts.length > 0 && (
                <span className="text-red-600 font-medium">
                  * {blockedProducts.length} sản phẩm bị chặn sẽ tự động được bỏ qua để bảo vệ kho.
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>

              {warningProducts.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleDeactivate(warningProducts.map(r => r.product))}
                  disabled={isProcessing}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#6D3EEB] hover:bg-[#5B2FD1] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Icon name="archive" size={16} />
                  Ngừng kinh doanh ({warningProducts.length})
                </button>
              )}

              {safeProducts.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleHardDelete(safeProducts.map(r => r.product))}
                  disabled={isProcessing}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Icon name="delete" size={16} />
                  Xóa an toàn ({safeProducts.length})
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
