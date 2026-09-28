// LK ERP Core Types & Enums based on specification

export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'overpaid';
export type InvoiceStatus = 'processing' | 'completed' | 'partially_returned' | 'cancelled' | 'locked';
export type QuoteStatus = 'new' | 'sent' | 'converted' | 'cancelled';
export type PurchaseStatus = 'ordered' | 'received' | 'completed' | 'cancelled';
export type ReturnHandling = 'debt_offset' | 'refund';
export type ReturnStatus = 'pending_refund' | 'refunded' | 'completed' | 'cancelled';
export type MoneyMethod = 'cash' | 'transfer' | 'offset';
export type Direction = 'in' | 'out';

export type StockInType = 'purchase' | 'manual_in' | 'opening' | 'sales_return';
export type StockInStatus = 'processing' | 'ordered' | 'received' | 'cancelled' | 'returned_to_supplier';
export type StockOutType = 'sale' | 'manual_out' | 'purchase_return';
export type StockOutStatus = 'packing' | 'ready' | 'shipping' | 'delivered' | 'cancelled' | 'returned';

export type MovementType = 
  | 'opening' 
  | 'purchase' 
  | 'manual_in' 
  | 'sales_return' 
  | 'sale' 
  | 'manual_out' 
  | 'purchase_return' 
  | 'stocktake' 
  | 'cost_adjust';

export type StockLevel = 'out' | 'low' | 'ok' | 'over' | 'service';
export type DebtState = 'overdue' | 'in_term';
export type StocktakeStatus = 'draft' | 'completed' | 'cancelled';
export type DiscountType = 'amount' | 'percent';
export type PartnerType = 'customer' | 'supplier';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  avatar_url?: string;
  is_active: boolean;
}

export interface CompanySettings {
  company_name: string;
  address: string;
  phone: string;
  email: string;
  tax_code: string;
  website: string;
  logo_url: string;
  bank_name: string;
  bank_account_no: string;
  bank_account_name: string;
  bank_bin: string;
  allow_negative_stock: boolean;
  default_min_stock: number;
  default_payment_term_days: number;
  allocate_shipping_to_cost: boolean;
  require_bill_for_transfer: boolean;
  lock_before_date: string | null;
  print_defaults: {
    paper_size: 'A4' | 'A5' | 'K80';
    show_logo: boolean;
    show_partner_info: boolean;
    show_sku: boolean;
    show_unit: boolean;
    show_price_total: boolean;
    show_discount: boolean;
    show_qr: boolean;
    show_note: boolean;
    show_signatures: boolean;
    show_old_debt: boolean;
  };
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: string;
  is_default: boolean;
  is_active: boolean;
}

export interface ProductGroup {
  id: string;
  name: string;
  color: string;
  sort_order: number;
}

export interface Product {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  group_id: string;
  group_name?: string;
  unit: string;
  image_url?: string;
  cost_price: number; // Giá vốn bình quân
  last_purchase_price: number;
  sale_price: number;
  min_stock: number;
  max_stock?: number;
  is_service: boolean;
  is_active: boolean;
  description?: string;
  note?: string;
  stock_quantity: number; // Tổng tồn
  stock_value: number; // stock_quantity * cost_price
  stock_level: StockLevel;
}

export interface CustomerGroup {
  id: string;
  name: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  tax_code?: string;
  group_id: string;
  group_name?: string;
  payment_term_days?: number;
  credit_limit?: number;
  status: 'active' | 'inactive';
  note?: string;
  total_purchase: number;
  debt_amount: number;
  overdue_amount: number;
  earliest_due_date?: string;
  max_overdue_days?: number;
  open_docs_count: number;
}

export interface SupplierGroup {
  id: string;
  name: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contact_name?: string;
  phone: string;
  email?: string;
  address?: string;
  tax_code?: string;
  bank_name?: string;
  bank_account_no?: string;
  group_id: string;
  group_name?: string;
  payment_term_days?: number;
  status: 'active' | 'inactive';
  note?: string;
  total_purchase: number;
  debt_amount: number;
  overdue_amount: number;
  earliest_due_date?: string;
  max_overdue_days?: number;
  open_docs_count: number;
}

export interface DocumentLineItem {
  id: string;
  product_id: string;
  sku: string;
  product_name: string;
  unit: string;
  quantity: number;
  unit_price: number;
  line_discount: number;
  line_total: number;
  unit_cost?: number; // Snapshot of cost at sale/purchase
  returned_quantity?: number;
  available_stock?: number;
}

export interface SalesInvoice {
  id: string;
  code: string;
  invoice_date: string; // ISO
  customer_id?: string;
  customer_name: string;
  customer_phone?: string;
  warehouse_id: string;
  warehouse_name?: string;
  quotation_id?: string;
  due_date?: string;
  status: InvoiceStatus;
  subtotal: number;
  discount_type: DiscountType;
  discount_value: number;
  discount_amount: number;
  vat_rate: number;
  vat_amount: number;
  shipping_fee: number;
  total: number;
  paid_amount: number;
  returned_amount: number;
  debt_amount: number;
  payment_status: PaymentStatus;
  cogs_amount: number;
  note?: string;
  items: DocumentLineItem[];
}

export interface Quotation {
  id: string;
  code: string;
  quote_date: string;
  expires_at?: string;
  customer_id?: string;
  customer_name: string;
  customer_phone?: string;
  status: QuoteStatus;
  subtotal: number;
  discount_type: DiscountType;
  discount_value: number;
  discount_amount: number;
  vat_rate: number;
  vat_amount: number;
  shipping_fee: number;
  total: number;
  converted_invoice_id?: string;
  note?: string;
  items: DocumentLineItem[];
}

export interface SalesReturn {
  id: string;
  code: string;
  return_date: string;
  customer_id?: string;
  customer_name: string;
  invoice_id?: string;
  invoice_code?: string;
  warehouse_id: string;
  total_value: number;
  handling: ReturnHandling;
  money_method: MoneyMethod;
  offset_amount: number;
  refund_due: number;
  refunded_amount: number;
  reason?: string;
  status: ReturnStatus;
  note?: string;
  items: DocumentLineItem[];
}

export interface PurchaseOrder {
  id: string;
  code: string;
  order_date: string;
  supplier_id: string;
  supplier_name: string;
  warehouse_id: string;
  expected_date?: string;
  received_at?: string;
  due_date?: string;
  status: PurchaseStatus;
  subtotal: number;
  discount_type: DiscountType;
  discount_value: number;
  discount_amount: number;
  vat_rate: number;
  vat_amount: number;
  shipping_fee: number;
  total: number;
  paid_amount: number;
  returned_amount: number;
  debt_amount: number;
  payment_status: PaymentStatus;
  note?: string;
  items: DocumentLineItem[];
}

export interface PurchaseReturn {
  id: string;
  code: string;
  return_date: string;
  supplier_id: string;
  supplier_name: string;
  po_id?: string;
  po_code?: string;
  warehouse_id: string;
  total_value: number;
  handling: ReturnHandling;
  money_method: MoneyMethod;
  offset_amount: number;
  refund_due: number;
  refunded_amount: number;
  reason?: string;
  status: ReturnStatus;
  note?: string;
  items: DocumentLineItem[];
}

export interface StockVoucher {
  id: string;
  code: string;
  direction: 'in' | 'out';
  type: StockInType | StockOutType;
  status: StockInStatus | StockOutStatus;
  voucher_date: string;
  warehouse_id: string;
  warehouse_name?: string;
  ref_type?: 'sales_invoice' | 'purchase_order' | 'sales_return' | 'purchase_return' | 'manual';
  ref_id?: string;
  ref_code?: string;
  partner_type?: PartnerType;
  partner_id?: string;
  partner_name?: string;
  item_count: number;
  total_quantity: number;
  total_value: number;
  summary: string;
  note?: string;
  items?: DocumentLineItem[];
}

export interface StockMovement {
  id: string;
  code: string; // MVxxxx
  movement_date: string;
  type: MovementType;
  product_id: string;
  product_name: string;
  sku: string;
  warehouse_id: string;
  qty_in: number;
  qty_out: number;
  unit_cost: number;
  balance_after: number;
  avg_cost_after: number;
  source_code: string;
  note?: string;
}

export interface Stocktake {
  id: string;
  code: string;
  stocktake_date: string;
  warehouse_id: string;
  warehouse_name?: string;
  counted_by: string;
  item_count: number;
  increase_count: number;
  decrease_count: number;
  diff_value: number;
  status: StocktakeStatus;
  note?: string;
  items: StocktakeItem[];
}

export interface StocktakeItem {
  id: string;
  product_id: string;
  sku: string;
  product_name: string;
  unit: string;
  system_qty: number;
  actual_qty: number;
  diff_qty: number;
  unit_cost: number;
  diff_value: number;
  reason?: string;
}

export interface PaymentAllocation {
  id: string;
  payment_id: string;
  doc_type: 'sales_invoice' | 'purchase_order' | 'sales_return' | 'purchase_return';
  doc_id: string;
  doc_code: string;
  amount: number;
}

export interface Payment {
  id: string;
  code: string; // TTxxx
  payment_date: string;
  direction: Direction; // in = Thu, out = Chi
  partner_type: PartnerType;
  partner_id?: string;
  partner_name: string;
  amount: number;
  method: MoneyMethod;
  bill_image_url?: string;
  unallocated_amount: number;
  status: 'active' | 'cancelled';
  note?: string;
  allocations: PaymentAllocation[];
}

export interface ActivityLog {
  id: string;
  occurred_at: string;
  action: 'create' | 'update' | 'cancel' | 'delete' | 'pay' | 'status_change';
  entity_type: string;
  entity_id: string;
  entity_code: string;
  title: string;
  amount?: number;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  created_at: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  link?: string;
  read: boolean;
}

export interface SavedFilter {
  id: string;
  page_key: string;
  name: string;
  filters: Record<string, any>;
  is_default?: boolean;
}
