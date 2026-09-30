import {
  Product,
  SalesInvoice,
  PurchaseOrder,
  StockVoucher,
  Stocktake,
  SalesReturn,
  PurchaseReturn,
  Quotation,
} from '../types/index.js';

export interface AppDataSources {
  invoices: SalesInvoice[];
  purchaseOrders: PurchaseOrder[];
  stockVouchers: StockVoucher[];
  stocktakes: Stocktake[];
  salesReturns: SalesReturn[];
  purchaseReturns: PurchaseReturn[];
  quotations: Quotation[];
}

export interface ProductDeletionImpact {
  product: Product;
  severity: 'blocked' | 'warning' | 'safe';
  canDelete: boolean;
  canHardDelete: boolean;
  canSoftDelete: boolean;
  hasStock: boolean;
  stockQuantity: number;
  stockValue: number;
  primaryReason: string;
  suggestion: string;
  stats: {
    invoiceCount: number;
    pendingInvoiceCount: number;
    sampleInvoices: string[];
    poCount: number;
    pendingPOCount: number;
    samplePOs: string[];
    voucherCount: number;
    sampleVouchers: string[];
    stocktakeCount: number;
    returnCount: number;
    quotationCount: number;
    totalLinkedRecords: number;
  };
}

export const checkProductDeletionImpact = (
  product: Product,
  sources: AppDataSources
): ProductDeletionImpact => {
  const pId = product.id;
  const pSku = (product.sku || '').trim().toLowerCase();

  // Match helper: checks by product id or sku
  const matchesItem = (item: any) => {
    if (!item) return false;
    if (item.product_id && item.product_id === pId) return true;
    const itemSku = (item.sku || item.product_sku || '').trim().toLowerCase();
    if (itemSku && pSku && itemSku === pSku) return true;
    return false;
  };

  // 1. Sales Invoices
  const matchedInvoices = sources.invoices.filter(inv =>
    Array.isArray(inv.items) && inv.items.some(matchesItem)
  );
  const pendingInvoices = matchedInvoices.filter(
    inv => inv.status === 'processing'
  );

  // 2. Purchase Orders
  const matchedPOs = sources.purchaseOrders.filter(po =>
    Array.isArray(po.items) && po.items.some(matchesItem)
  );
  const pendingPOs = matchedPOs.filter(
    po => po.status === 'ordered' || (po as any).status === 'pending'
  );

  // 3. Stock Vouchers
  const matchedVouchers = sources.stockVouchers.filter(v => {
    if (Array.isArray(v.items) && v.items.some(matchesItem)) return true;
    const refCode = (v.ref_code || '').trim().toLowerCase();
    const summary = (v.summary || '').trim().toLowerCase();
    if (refCode && pSku && refCode.includes(pSku)) return true;
    if (summary && product.name && summary.includes(product.name.toLowerCase())) return true;
    return false;
  });

  // 4. Stocktakes
  const matchedStocktakes = sources.stocktakes.filter(st =>
    Array.isArray(st.items) && st.items.some(matchesItem)
  );
  const pendingStocktakes = matchedStocktakes.filter(
    st => st.status === 'draft'
  );

  // 5. Sales Returns & Purchase Returns
  const matchedSalesReturns = sources.salesReturns.filter(ret =>
    Array.isArray(ret.items) && ret.items.some(matchesItem)
  );
  const matchedPurchaseReturns = sources.purchaseReturns.filter(ret =>
    Array.isArray(ret.items) && ret.items.some(matchesItem)
  );
  const returnCount = matchedSalesReturns.length + matchedPurchaseReturns.length;

  // 6. Quotations
  const matchedQuotations = sources.quotations.filter(quo =>
    Array.isArray(quo.items) && quo.items.some(matchesItem)
  );

  const totalLinkedRecords =
    matchedInvoices.length +
    matchedPOs.length +
    matchedVouchers.length +
    matchedStocktakes.length +
    returnCount +
    matchedQuotations.length;

  const stockQuantity = product.stock_quantity || 0;
  const stockValue = product.stock_value || (stockQuantity * (product.cost_price || 0));
  const hasStock = !product.is_service && stockQuantity !== 0;

  const stats = {
    invoiceCount: matchedInvoices.length,
    pendingInvoiceCount: pendingInvoices.length,
    sampleInvoices: matchedInvoices.slice(0, 3).map(i => i.code),
    poCount: matchedPOs.length,
    pendingPOCount: pendingPOs.length,
    samplePOs: matchedPOs.slice(0, 3).map(p => p.code),
    voucherCount: matchedVouchers.length,
    sampleVouchers: matchedVouchers.slice(0, 3).map(v => v.code),
    stocktakeCount: matchedStocktakes.length,
    returnCount,
    quotationCount: matchedQuotations.length,
    totalLinkedRecords,
  };

  // Decision logic
  if (hasStock) {
    const isNegative = stockQuantity < 0;
    return {
      product,
      severity: 'blocked',
      canDelete: false,
      canHardDelete: false,
      canSoftDelete: false,
      hasStock: true,
      stockQuantity,
      stockValue,
      primaryReason: isNegative
        ? `Sản phẩm đang có số lượng tồn kho ÂM (${stockQuantity} ${product.unit}). Kho bị lệch sổ sách.`
        : `Sản phẩm vẫn còn tồn kho thực tế (${stockQuantity.toLocaleString('vi-VN')} ${product.unit}), giá trị tồn: ${Math.round(stockValue).toLocaleString('vi-VN')} đ.`,
      suggestion: isNegative
        ? 'Cần nhập bổ sung hoặc lập biên bản kiểm kê cân bằng kho trước khi thực hiện xóa.'
        : 'Cần xuất kho hết số lượng tồn hoặc tạo phiếu kiểm kê điều chỉnh về 0 trước khi xóa.',
      stats,
    };
  }

  if (pendingInvoices.length > 0 || pendingPOs.length > 0 || pendingStocktakes.length > 0) {
    const pendingDesc: string[] = [];
    if (pendingInvoices.length > 0) pendingDesc.push(`${pendingInvoices.length} đơn bán đang xử lý`);
    if (pendingPOs.length > 0) pendingDesc.push(`${pendingPOs.length} đơn nhập hàng đang chờ`);
    if (pendingStocktakes.length > 0) pendingDesc.push(`${pendingStocktakes.length} phiếu kiểm kê nháp`);

    return {
      product,
      severity: 'blocked',
      canDelete: false,
      canHardDelete: false,
      canSoftDelete: false,
      hasStock: false,
      stockQuantity: 0,
      stockValue: 0,
      primaryReason: `Đang có chứng từ chưa hoàn tất liên quan: ${pendingDesc.join(', ')}.`,
      suggestion: 'Vui lòng hoàn thành hoặc hủy bỏ các chứng từ đang xử lý trước khi xóa sản phẩm.',
      stats,
    };
  }

  if (totalLinkedRecords > 0) {
    return {
      product,
      severity: 'warning',
      canDelete: true,
      canHardDelete: false, // Not safe for hard delete because history will break
      canSoftDelete: true,
      hasStock: false,
      stockQuantity: 0,
      stockValue: 0,
      primaryReason: `Tồn kho đã về 0, nhưng sản phẩm đã phát sinh ${totalLinkedRecords} giao dịch lịch sử trong hệ thống.`,
      suggestion: 'Khuyến nghị chuyển sang trạng thái "Ngừng kinh doanh" để giữ nguyên lịch sử báo cáo tài chính và thẻ kho.',
      stats,
    };
  }

  // Completely clean product
  return {
    product,
    severity: 'safe',
    canDelete: true,
    canHardDelete: true,
    canSoftDelete: true,
    hasStock: false,
    stockQuantity: 0,
    stockValue: 0,
    primaryReason: 'Sản phẩm mới, tồn kho bằng 0 và chưa từng phát sinh chứng từ nào.',
    suggestion: 'An toàn tuyệt đối để xóa vĩnh viễn khỏi cơ sở dữ liệu.',
    stats,
  };
};
