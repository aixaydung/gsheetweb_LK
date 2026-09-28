// Rich seeded data based strictly on Section 12 test assertions
import {
  Product,
  ProductGroup,
  Warehouse,
  Customer,
  CustomerGroup,
  Supplier,
  SupplierGroup,
  SalesInvoice,
  Quotation,
  SalesReturn,
  PurchaseOrder,
  PurchaseReturn,
  StockVoucher,
  StockMovement,
  Stocktake,
  Payment,
  CompanySettings,
  ActivityLog,
  AppNotification,
  SavedFilter
} from '../types';

export const INITIAL_COMPANY_SETTINGS: CompanySettings = {
  company_name: 'CÔNG TY LK ERP',
  address: 'Tòa nhà Landmark, 720A Điện Biên Phủ, Phường 22, Bình Thạnh, TP. Hồ Chí Minh',
  phone: '0908 123 456',
  email: 'contact@lkerp.vn',
  tax_code: '0316889988',
  website: 'https://lkerp.sheetapp.store',
  logo_url: '',
  bank_name: 'MB Bank - CN Sài Gòn',
  bank_account_no: '988886666888',
  bank_account_name: 'CONG TY LK ERP',
  bank_bin: '970422',
  allow_negative_stock: true,
  default_min_stock: 10,
  default_payment_term_days: 15,
  allocate_shipping_to_cost: true,
  require_bill_for_transfer: false,
  lock_before_date: null,
  print_defaults: {
    paper_size: 'A4',
    show_logo: true,
    show_partner_info: true,
    show_sku: true,
    show_unit: true,
    show_price_total: true,
    show_discount: true,
    show_qr: true,
    show_note: true,
    show_signatures: true,
    show_old_debt: true,
  }
};

export const INITIAL_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-01',
    code: 'K01',
    name: 'Kho Tổng TP.HCM',
    address: 'Số 12 Đường Số 9, P. Linh Trung, TP. Thủ Đức, TP.HCM',
    is_default: true,
    is_active: true,
  },
  {
    id: 'wh-02',
    code: 'K02',
    name: 'Kho Phụ Miền Đông',
    address: 'KCN Sóng Thần 1, Dĩ An, Bình Dương',
    is_default: false,
    is_active: true,
  }
];

export const INITIAL_PRODUCT_GROUPS: ProductGroup[] = [
  { id: 'pg-1', name: 'Thực phẩm', color: '#8B5CF6', sort_order: 1 },
  { id: 'pg-2', name: 'Thức uống', color: '#6366F1', sort_order: 2 },
  { id: 'pg-3', name: 'Nguyên liệu', color: '#10B981', sort_order: 3 },
  { id: 'pg-4', name: 'Hũ pet', color: '#F59E0B', sort_order: 4 },
  { id: 'pg-5', name: 'Bao bì', color: '#EF4444', sort_order: 5 },
  { id: 'pg-6', name: 'HÓA PHẨM', color: '#06B6D4', sort_order: 6 },
  { id: 'pg-7', name: 'Thiết bị', color: '#EC4899', sort_order: 7 },
  { id: 'pg-8', name: 'PLA Basic', color: '#A855F7', sort_order: 8 },
  { id: 'pg-9', name: 'Dịch vụ', color: '#3B82F6', sort_order: 9 },
  { id: 'pg-10', name: 'Khác', color: '#6B7280', sort_order: 10 }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-01',
    sku: 'CP001',
    name: 'Cà phê rang xay Robusta thượng hạng',
    group_id: 'pg-1',
    group_name: 'Thực phẩm',
    unit: 'kg',
    cost_price: 85000,
    last_purchase_price: 85000,
    sale_price: 120000,
    min_stock: 10,
    max_stock: 500,
    is_service: false,
    is_active: true,
    stock_quantity: 173,
    stock_value: 173 * 85000,
    stock_level: 'ok',
    note: 'Hàng bán chạy chủ lực'
  },
  {
    id: 'prod-02',
    sku: 'TD005',
    name: 'Trà đào túi lọc hương tự nhiên (25 gói)',
    group_id: 'pg-2',
    group_name: 'Thức uống',
    unit: 'hộp',
    cost_price: 32000,
    last_purchase_price: 32000,
    sale_price: 45000,
    min_stock: 15,
    max_stock: 300,
    is_service: false,
    is_active: true,
    stock_quantity: 85,
    stock_value: 85 * 32000,
    stock_level: 'ok'
  },
  {
    id: 'prod-03',
    sku: 'SY003',
    name: 'Siro dâu đậm đặc pha chế 750ml',
    group_id: 'pg-3',
    group_name: 'Nguyên liệu',
    unit: 'chai',
    cost_price: 25000,
    last_purchase_price: 25000,
    sale_price: 35000,
    min_stock: 10,
    max_stock: 200,
    is_service: false,
    is_active: true,
    stock_quantity: 42,
    stock_value: 42 * 25000,
    stock_level: 'ok'
  },
  {
    id: 'prod-04',
    sku: 'HP001',
    name: 'Hũ pet nắp nhôm xé 500ml cao cấp',
    group_id: 'pg-4',
    group_name: 'Hũ pet',
    unit: 'cái',
    cost_price: 3200,
    last_purchase_price: 3200,
    sale_price: 5500,
    min_stock: 200,
    max_stock: 2000,
    is_service: false,
    is_active: true,
    stock_quantity: 1250,
    stock_value: 1250 * 3200,
    stock_level: 'ok'
  },
  {
    id: 'prod-05',
    sku: 'HP002',
    name: 'Hũ pet nắp vặn nhựa trong 350ml',
    group_id: 'pg-4',
    group_name: 'Hũ pet',
    unit: 'cái',
    cost_price: 2800,
    last_purchase_price: 2800,
    sale_price: 4800,
    min_stock: 150,
    max_stock: 1500,
    is_service: false,
    is_active: true,
    stock_quantity: 840,
    stock_value: 840 * 2800,
    stock_level: 'ok'
  },
  {
    id: 'prod-06',
    sku: 'BB010',
    name: 'Túi zip giấy kraft có cửa sổ (100 cái)',
    group_id: 'pg-5',
    group_name: 'Bao bì',
    unit: 'xấp',
    cost_price: 45000,
    last_purchase_price: 45000,
    sale_price: 68000,
    min_stock: 50,
    max_stock: 500,
    is_service: false,
    is_active: true,
    stock_quantity: 320,
    stock_value: 320 * 45000,
    stock_level: 'ok'
  },
  {
    id: 'prod-07',
    sku: 'HP501',
    name: 'Nước rửa khử khuẩn Organic đa năng 1L',
    group_id: 'pg-6',
    group_name: 'HÓA PHẨM',
    unit: 'chai',
    cost_price: 58000,
    last_purchase_price: 58000,
    sale_price: 89000,
    min_stock: 10,
    max_stock: 100,
    is_service: false,
    is_active: true,
    stock_quantity: 4,
    stock_value: 4 * 58000,
    stock_level: 'low', // Sắp hết
    note: 'Cần đặt hàng NCC sớm'
  },
  {
    id: 'prod-08',
    sku: 'PLA01',
    name: 'Cuộn nhựa in 3D PLA Basic 1.75mm 1kg',
    group_id: 'pg-8',
    group_name: 'PLA Basic',
    unit: 'cuộn',
    cost_price: 140000,
    last_purchase_price: 140000,
    sale_price: 195000,
    min_stock: 5,
    max_stock: 80,
    is_service: false,
    is_active: true,
    stock_quantity: 0,
    stock_value: 0,
    stock_level: 'out', // Hết hàng
    note: 'Cháy hàng 3 ngày'
  },
  {
    id: 'prod-09',
    sku: 'DV001',
    name: 'Dịch vụ dán nhãn & đóng gói quà tặng',
    group_id: 'pg-9',
    group_name: 'Dịch vụ',
    unit: 'gói',
    cost_price: 0,
    last_purchase_price: 0,
    sale_price: 15000,
    min_stock: 0,
    is_service: true,
    is_active: true,
    stock_quantity: 0,
    stock_value: 0,
    stock_level: 'service'
  }
];

export const INITIAL_CUSTOMER_GROUPS: CustomerGroup[] = [
  { id: 'cg-1', name: 'Đại lý' },
  { id: 'cg-2', name: 'Doanh nghiệp' },
  { id: 'cg-3', name: 'Khách lẻ' },
  { id: 'cg-4', name: 'DỰ ÁN' }
];

/**
 * 5 customers with debt matching Section 12 test assertions:
 * 1) xe10: 4.422.000 đ
 * 2) Đại lý Hoàng Gia: 2.173.600 đ total, paid 869.440 đ, debt 1.304.160 đ, overdue (due 03/04/2026, 176+ days)
 * 3) Shop Mộc Nhiên: 643.500 đ
 * 4) Winmart TimCity: 250.000 đ (overdue, due 02/09/2026)
 * 5) Công ty Minh An: 250.000 đ
 * Total Receivables = 6.869.660 đ, Overdue = 1.554.160 đ
 */
export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-01',
    code: 'KH031',
    name: 'xe10',
    phone: '0874112664',
    email: 'xe10.transport@gmail.com',
    address: 'Bến xe Miền Đông, Q. Bình Thạnh, TP.HCM',
    group_id: 'cg-2',
    group_name: 'Doanh nghiệp',
    status: 'active',
    note: 'Khách hợp đồng vận chuyển',
    total_purchase: 4422000,
    debt_amount: 4422000,
    overdue_amount: 0,
    earliest_due_date: undefined,
    open_docs_count: 1
  },
  {
    id: 'cust-02',
    code: 'KH002',
    name: 'Đại lý Hoàng Gia',
    phone: '0938445566',
    email: 'hoanggia.retail@gmail.com',
    address: '154 Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM',
    group_id: 'cg-1',
    group_name: 'Đại lý',
    payment_term_days: 15,
    status: 'active',
    note: 'Đã nhắc nợ lần 3, hứa thanh toán cuối tuần',
    total_purchase: 2173600,
    debt_amount: 1304160,
    overdue_amount: 1304160,
    earliest_due_date: '2026-04-03',
    max_overdue_days: 176,
    open_docs_count: 1
  },
  {
    id: 'cust-03',
    code: 'KH005',
    name: 'Shop Mộc Nhiên',
    phone: '0909334411',
    email: 'mocnhien.organic@gmail.com',
    address: '45 Nguyễn Đình Chiểu, P. Đa Kao, Quận 1, TP.HCM',
    group_id: 'cg-3',
    group_name: 'Khách lẻ',
    status: 'active',
    note: 'Khách hàng thân thiết',
    total_purchase: 643500,
    debt_amount: 643500,
    overdue_amount: 0,
    earliest_due_date: '2026-10-15',
    open_docs_count: 1
  },
  {
    id: 'cust-04',
    code: 'KH012',
    name: 'Winmart TimCity',
    phone: '0918776655',
    email: 'winmart.times@retail.vn',
    address: 'TTTM Times City, Hai Bà Trưng, Hà Nội',
    group_id: 'cg-2',
    group_name: 'Doanh nghiệp',
    status: 'active',
    note: 'Chờ đối soát hoá đơn tháng 8',
    total_purchase: 250000,
    debt_amount: 250000,
    overdue_amount: 250000,
    earliest_due_date: '2026-09-02',
    max_overdue_days: 25,
    open_docs_count: 1
  },
  {
    id: 'cust-05',
    code: 'KH008',
    name: 'Công ty Minh An',
    phone: '0978665544',
    email: 'minhan.corp@gmail.com',
    address: '88 Hoàng Hoa Thám, P. 12, Q. Tân Bình, TP.HCM',
    group_id: 'cg-2',
    group_name: 'Doanh nghiệp',
    status: 'active',
    note: 'Hạn nợ trong hạn mức',
    total_purchase: 250000,
    debt_amount: 250000,
    overdue_amount: 0,
    earliest_due_date: '2026-09-28',
    open_docs_count: 1
  },
  {
    id: 'cust-06',
    code: 'KH001',
    name: 'anh binh',
    phone: '0903123456',
    group_id: 'cg-3',
    group_name: 'Khách lẻ',
    status: 'active',
    total_purchase: 1250000,
    debt_amount: 0,
    overdue_amount: 0,
    open_docs_count: 0
  },
  {
    id: 'cust-07',
    code: 'KH003',
    name: 'nắng rooftop-minh',
    phone: '0988223344',
    group_id: 'cg-3',
    group_name: 'Khách lẻ',
    status: 'active',
    total_purchase: 595000000,
    debt_amount: 0,
    overdue_amount: 0,
    open_docs_count: 0
  }
];

export const INITIAL_SUPPLIER_GROUPS: SupplierGroup[] = [
  { id: 'sg-1', name: 'Nguyên liệu' },
  { id: 'sg-2', name: 'Bao bì' },
  { id: 'sg-3', name: 'Thiết bị' }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-01',
    code: 'NCC010',
    name: 'a ngữ - khang hưng',
    contact_name: 'Anh Ngữ',
    phone: '0914123456',
    email: 'khanghung.supply@gmail.com',
    address: 'Khu phố 3, P. An Phú, TP. Thủ Đức, TP.HCM',
    group_id: 'sg-1',
    group_name: 'Nguyên liệu',
    status: 'active',
    note: 'Nhà cung cấp cà phê nhân & rang xay chính',
    total_purchase: 200000,
    debt_amount: 80000, // 200.000 total - 120.000 offset = 80.000 remaining
    overdue_amount: 0,
    open_docs_count: 1
  },
  {
    id: 'sup-02',
    code: 'NCC001',
    name: 'Bao Bì Sài Gòn',
    contact_name: 'Chị Mai',
    phone: '0903889123',
    email: 'saigonpackaging@gmail.com',
    address: 'KCN Tân Bình, Tây Thạnh, Tân Phú, TP.HCM',
    group_id: 'sg-2',
    group_name: 'Bao bì',
    status: 'active',
    total_purchase: 12500000,
    debt_amount: 0,
    overdue_amount: 0,
    open_docs_count: 0
  },
  {
    id: 'sup-03',
    code: 'NCC002',
    name: 'Hương Liệu Á Châu',
    contact_name: 'Anh Tuấn',
    phone: '0977112233',
    email: 'achau.flavor@gmail.com',
    address: 'Quận 7, TP.HCM',
    group_id: 'sg-1',
    group_name: 'Nguyên liệu',
    status: 'active',
    total_purchase: 8400000,
    debt_amount: 0,
    overdue_amount: 0,
    open_docs_count: 0
  }
];

export const INITIAL_SALES_INVOICES: SalesInvoice[] = [
  {
    id: 'inv-01',
    code: 'HD104',
    invoice_date: '2026-09-27T08:30:00Z',
    customer_id: 'cust-01',
    customer_name: 'xe10',
    customer_phone: '0874112664',
    warehouse_id: 'wh-01',
    warehouse_name: 'Kho Tổng TP.HCM',
    status: 'completed',
    subtotal: 4422000,
    discount_type: 'amount',
    discount_value: 0,
    discount_amount: 0,
    vat_rate: 0,
    vat_amount: 0,
    shipping_fee: 0,
    total: 4422000,
    paid_amount: 0,
    returned_amount: 0,
    debt_amount: 4422000,
    payment_status: 'unpaid',
    cogs_amount: 3120000,
    note: 'Đơn hàng giao qua nhà xe',
    items: [
      {
        id: 'li-01',
        product_id: 'prod-01',
        sku: 'CP001',
        product_name: 'Cà phê rang xay Robusta thượng hạng',
        unit: 'kg',
        quantity: 36,
        unit_price: 120000,
        line_discount: 0,
        line_total: 4320000,
        unit_cost: 85000
      },
      {
        id: 'li-02',
        product_id: 'prod-03',
        sku: 'SY003',
        product_name: 'Siro dâu đậm đặc pha chế 750ml',
        unit: 'chai',
        quantity: 3,
        unit_price: 34000,
        line_discount: 0,
        line_total: 102000,
        unit_cost: 25000
      }
    ]
  },
  {
    id: 'inv-02',
    code: 'HD003',
    invoice_date: '2026-03-20T10:00:00Z',
    due_date: '2026-04-03', // Overdue since 03/04/2026
    customer_id: 'cust-02',
    customer_name: 'Đại lý Hoàng Gia',
    customer_phone: '0938445566',
    warehouse_id: 'wh-01',
    status: 'completed',
    subtotal: 2173600,
    discount_type: 'amount',
    discount_value: 0,
    discount_amount: 0,
    vat_rate: 0,
    vat_amount: 0,
    shipping_fee: 0,
    total: 2173600,
    paid_amount: 869440,
    returned_amount: 0,
    debt_amount: 1304160,
    payment_status: 'partial',
    cogs_amount: 1540000,
    note: 'Khách khó tính, nợ quá hạn lâu',
    items: [
      {
        id: 'li-03',
        product_id: 'prod-01',
        sku: 'CP001',
        product_name: 'Cà phê rang xay Robusta thượng hạng',
        unit: 'kg',
        quantity: 18,
        unit_price: 120000,
        line_discount: 0,
        line_total: 2160000,
        unit_cost: 85000
      }
    ]
  },
  {
    id: 'inv-03',
    code: 'HD012',
    invoice_date: '2026-09-20T14:15:00Z',
    due_date: '2026-10-15',
    customer_id: 'cust-03',
    customer_name: 'Shop Mộc Nhiên',
    customer_phone: '0909334411',
    warehouse_id: 'wh-01',
    status: 'completed',
    subtotal: 643500,
    discount_type: 'amount',
    discount_value: 0,
    discount_amount: 0,
    vat_rate: 0,
    vat_amount: 0,
    shipping_fee: 0,
    total: 643500,
    paid_amount: 0,
    returned_amount: 0,
    debt_amount: 643500,
    payment_status: 'unpaid',
    cogs_amount: 450000,
    note: 'Khách hẹn thanh toán giữa tháng 10',
    items: [
      {
        id: 'li-04',
        product_id: 'prod-02',
        sku: 'TD005',
        product_name: 'Trà đào túi lọc hương tự nhiên (25 gói)',
        unit: 'hộp',
        quantity: 14,
        unit_price: 45000,
        line_discount: 0,
        line_total: 630000,
        unit_cost: 32000
      }
    ]
  },
  {
    id: 'inv-04',
    code: 'HD067',
    invoice_date: '2026-08-20T09:00:00Z',
    due_date: '2026-09-02', // Overdue since 02/09/2026
    customer_id: 'cust-04',
    customer_name: 'Winmart TimCity',
    customer_phone: '0918776655',
    warehouse_id: 'wh-01',
    status: 'completed',
    subtotal: 250000,
    discount_type: 'amount',
    discount_value: 0,
    discount_amount: 0,
    vat_rate: 0,
    vat_amount: 0,
    shipping_fee: 0,
    total: 250000,
    paid_amount: 0,
    returned_amount: 0,
    debt_amount: 250000,
    payment_status: 'unpaid',
    cogs_amount: 170000,
    note: 'Chờ đối soát nợ',
    items: [
      {
        id: 'li-05',
        product_id: 'prod-01',
        sku: 'CP001',
        product_name: 'Cà phê rang xay Robusta thượng hạng',
        unit: 'kg',
        quantity: 2,
        unit_price: 125000,
        line_discount: 0,
        line_total: 250000,
        unit_cost: 85000
      }
    ]
  },
  {
    id: 'inv-05',
    code: 'HD105',
    invoice_date: '2026-09-26T16:00:00Z',
    due_date: '2026-09-28',
    customer_id: 'cust-05',
    customer_name: 'Công ty Minh An',
    customer_phone: '0978665544',
    warehouse_id: 'wh-01',
    status: 'completed',
    subtotal: 250000,
    discount_type: 'amount',
    discount_value: 0,
    discount_amount: 0,
    vat_rate: 0,
    vat_amount: 0,
    shipping_fee: 0,
    total: 250000,
    paid_amount: 0,
    returned_amount: 0,
    debt_amount: 250000,
    payment_status: 'unpaid',
    cogs_amount: 175000,
    note: 'Giao trực tiếp văn phòng',
    items: [
      {
        id: 'li-06',
        product_id: 'prod-03',
        sku: 'SY003',
        product_name: 'Siro dâu đậm đặc pha chế 750ml',
        unit: 'chai',
        quantity: 7,
        unit_price: 35000,
        line_discount: 0,
        line_total: 245000,
        unit_cost: 25000
      }
    ]
  },
  {
    id: 'inv-06',
    code: 'HD085',
    invoice_date: '2026-09-25T11:20:00Z',
    customer_id: 'cust-07',
    customer_name: 'nắng rooftop-minh',
    customer_phone: '0988223344',
    warehouse_id: 'wh-01',
    status: 'completed',
    subtotal: 595000000,
    discount_type: 'amount',
    discount_value: 0,
    discount_amount: 0,
    vat_rate: 0,
    vat_amount: 0,
    shipping_fee: 0,
    total: 595000000,
    paid_amount: 595000000,
    returned_amount: 0,
    debt_amount: 0,
    payment_status: 'paid',
    cogs_amount: 420000000,
    note: 'Đơn hàng dự án chuỗi F&B, đã chuyển khoản đủ',
    items: [
      {
        id: 'li-07',
        product_id: 'prod-01',
        sku: 'CP001',
        product_name: 'Cà phê rang xay Robusta thượng hạng',
        unit: 'kg',
        quantity: 5000,
        unit_price: 119000,
        line_discount: 0,
        line_total: 595000000,
        unit_cost: 84000
      }
    ]
  }
];

export const INITIAL_QUOTATIONS: Quotation[] = [
  {
    id: 'quo-01',
    code: 'BG038',
    quote_date: '2026-09-27T07:45:00Z',
    expires_at: '2026-10-04',
    customer_id: 'cust-02',
    customer_name: 'Đại lý Hoàng Gia',
    status: 'new',
    subtotal: 3500000,
    discount_type: 'percent',
    discount_value: 5,
    discount_amount: 175000,
    vat_rate: 8,
    vat_amount: 266000,
    shipping_fee: 50000,
    total: 3641000,
    note: 'Báo giá lô hàng tháng 10 ưu đãi chiết khấu 5%',
    items: [
      {
        id: 'qli-01',
        product_id: 'prod-01',
        sku: 'CP001',
        product_name: 'Cà phê rang xay Robusta thượng hạng',
        unit: 'kg',
        quantity: 25,
        unit_price: 120000,
        line_discount: 0,
        line_total: 3000000
      },
      {
        id: 'qli-02',
        product_id: 'prod-02',
        sku: 'TD005',
        product_name: 'Trà đào túi lọc hương tự nhiên (25 gói)',
        unit: 'hộp',
        quantity: 11,
        unit_price: 45000,
        line_discount: 0,
        line_total: 495000
      }
    ]
  },
  {
    id: 'quo-02',
    code: 'BG036',
    quote_date: '2026-09-24T14:00:00Z',
    expires_at: '2026-10-01',
    customer_id: 'cust-01',
    customer_name: 'xe10',
    status: 'converted',
    subtotal: 4422000,
    discount_type: 'amount',
    discount_value: 0,
    discount_amount: 0,
    vat_rate: 0,
    vat_amount: 0,
    shipping_fee: 0,
    total: 4422000,
    converted_invoice_id: 'inv-01',
    note: 'Đã chuyển thành Hóa đơn HD104',
    items: [
      {
        id: 'qli-03',
        product_id: 'prod-01',
        sku: 'CP001',
        product_name: 'Cà phê rang xay Robusta thượng hạng',
        unit: 'kg',
        quantity: 36,
        unit_price: 120000,
        line_discount: 0,
        line_total: 4320000
      }
    ]
  }
];

export const INITIAL_SALES_RETURNS: SalesReturn[] = [
  {
    id: 'sret-01',
    code: 'TR010',
    return_date: '2026-09-25T15:30:00Z',
    customer_id: 'cust-03',
    customer_name: 'Shop Mộc Nhiên',
    invoice_id: 'inv-03',
    invoice_code: 'HD012',
    warehouse_id: 'wh-01',
    total_value: 90000,
    handling: 'debt_offset',
    money_method: 'offset',
    offset_amount: 90000,
    refund_due: 0,
    refunded_amount: 0,
    reason: 'Bao bì bị móp méo khi vận chuyển',
    status: 'completed',
    note: 'Đã trừ công nợ HD012',
    items: [
      {
        id: 'rli-01',
        product_id: 'prod-02',
        sku: 'TD005',
        product_name: 'Trà đào túi lọc hương tự nhiên (25 gói)',
        unit: 'hộp',
        quantity: 2,
        unit_price: 45000,
        line_discount: 0,
        line_total: 90000,
        unit_cost: 32000
      }
    ]
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-01',
    code: 'PM010',
    order_date: '2026-09-27T10:15:00Z',
    supplier_id: 'sup-01',
    supplier_name: 'a ngữ - khang hưng',
    warehouse_id: 'wh-01',
    status: 'received', // Đã nhập kho
    subtotal: 200000,
    discount_type: 'amount',
    discount_value: 0,
    discount_amount: 0,
    vat_rate: 0,
    vat_amount: 0,
    shipping_fee: 0,
    total: 200000,
    paid_amount: 120000, // Đã trừ qua phiếu trả hàng PR001
    returned_amount: 120000,
    debt_amount: 80000, // Còn nợ 80.000 đ
    payment_status: 'partial',
    note: 'Nhập hạt cà phê mẫu và siro',
    items: [
      {
        id: 'poli-01',
        product_id: 'prod-01',
        sku: 'CP001',
        product_name: 'Cà phê rang xay Robusta thượng hạng',
        unit: 'kg',
        quantity: 1,
        unit_price: 120000,
        line_discount: 0,
        line_total: 120000,
        unit_cost: 120000
      },
      {
        id: 'poli-02',
        product_id: 'prod-02',
        sku: 'TD005',
        product_name: 'Trà đào túi lọc hương tự nhiên (25 gói)',
        unit: 'hộp',
        quantity: 1,
        unit_price: 45000,
        line_discount: 0,
        line_total: 45000,
        unit_cost: 45000
      },
      {
        id: 'poli-03',
        product_id: 'prod-03',
        sku: 'SY003',
        product_name: 'Siro dâu đậm đặc pha chế 750ml',
        unit: 'chai',
        quantity: 1,
        unit_price: 35000,
        line_discount: 0,
        line_total: 35000,
        unit_cost: 35000
      }
    ]
  }
];

export const INITIAL_PURCHASE_RETURNS: PurchaseReturn[] = [
  {
    id: 'pret-01',
    code: 'PR001',
    return_date: '2026-09-27T11:00:00Z',
    supplier_id: 'sup-01',
    supplier_name: 'a ngữ - khang hưng',
    po_id: 'po-01',
    po_code: 'PM010',
    warehouse_id: 'wh-01',
    total_value: 120000,
    handling: 'debt_offset',
    money_method: 'offset',
    offset_amount: 120000,
    refund_due: 0,
    refunded_amount: 0,
    reason: 'Hàng sai quy cách rang theo thoả thuận',
    status: 'completed',
    note: 'Trừ trực tiếp vào công nợ PM010',
    items: [
      {
        id: 'prli-01',
        product_id: 'prod-01',
        sku: 'CP001',
        product_name: 'Cà phê rang xay Robusta thượng hạng',
        unit: 'kg',
        quantity: 1,
        unit_price: 120000,
        line_discount: 0,
        line_total: 120000
      }
    ]
  }
];

export const INITIAL_STOCK_VOUCHERS: StockVoucher[] = [
  {
    id: 'sv-01',
    code: 'PM010',
    direction: 'in',
    type: 'purchase',
    status: 'received',
    voucher_date: '2026-09-27T10:15:00Z',
    warehouse_id: 'wh-01',
    ref_type: 'purchase_order',
    ref_id: 'po-01',
    ref_code: 'PM010',
    partner_type: 'supplier',
    partner_name: 'a ngữ - khang hưng',
    item_count: 3,
    total_quantity: 3,
    total_value: 200000,
    summary: '3 mặt hàng',
    note: 'Nhập từ PM010'
  },
  {
    id: 'sv-02',
    code: 'PR001',
    direction: 'out',
    type: 'purchase_return',
    status: 'delivered',
    voucher_date: '2026-09-27T11:00:00Z',
    warehouse_id: 'wh-01',
    ref_type: 'purchase_return',
    ref_id: 'pret-01',
    ref_code: 'PR001',
    partner_type: 'supplier',
    partner_name: 'a ngữ - khang hưng',
    item_count: 1,
    total_quantity: 1,
    total_value: 120000,
    summary: 'Cà phê rang xay Robusta thượng hạng',
    note: 'Xuất trả cho PR001'
  },
  {
    id: 'sv-03',
    code: 'HD104',
    direction: 'out',
    type: 'sale',
    status: 'delivered',
    voucher_date: '2026-09-27T08:30:00Z',
    warehouse_id: 'wh-01',
    ref_type: 'sales_invoice',
    ref_id: 'inv-01',
    ref_code: 'HD104',
    partner_type: 'customer',
    partner_name: 'xe10',
    item_count: 2,
    total_quantity: 39,
    total_value: 3120000,
    summary: '2 mặt hàng',
    note: 'Xuất cho HD104'
  }
];

export const INITIAL_STOCK_MOVEMENTS: StockMovement[] = [
  {
    id: 'mv-01',
    code: 'MV3425',
    movement_date: '2026-09-27T08:30:00Z',
    type: 'sale',
    product_id: 'prod-01',
    product_name: 'Cà phê rang xay Robusta thượng hạng',
    sku: 'CP001',
    warehouse_id: 'wh-01',
    qty_in: 0,
    qty_out: 36,
    unit_cost: 85000,
    balance_after: 173,
    avg_cost_after: 85000,
    source_code: 'HD104',
    note: 'Xuất cho HD104'
  },
  {
    id: 'mv-02',
    code: 'MV3426',
    movement_date: '2026-09-27T10:15:00Z',
    type: 'purchase',
    product_id: 'prod-01',
    product_name: 'Cà phê rang xay Robusta thượng hạng',
    sku: 'CP001',
    warehouse_id: 'wh-01',
    qty_in: 1,
    qty_out: 0,
    unit_cost: 120000,
    balance_after: 174,
    avg_cost_after: 85200,
    source_code: 'PM010',
    note: 'Nhập từ PM010'
  },
  {
    id: 'mv-03',
    code: 'MV3427',
    movement_date: '2026-09-27T11:00:00Z',
    type: 'purchase_return',
    product_id: 'prod-01',
    product_name: 'Cà phê rang xay Robusta thượng hạng',
    sku: 'CP001',
    warehouse_id: 'wh-01',
    qty_in: 0,
    qty_out: 1,
    unit_cost: 120000,
    balance_after: 173,
    avg_cost_after: 85000,
    source_code: 'PR001',
    note: 'Trả hàng NCC theo PR001'
  }
];

export const INITIAL_STOCKTAKES: Stocktake[] = [
  {
    id: 'stk-01',
    code: 'KK05',
    stocktake_date: '2026-09-26T17:00:00Z',
    warehouse_id: 'wh-01',
    warehouse_name: 'Kho Tổng TP.HCM',
    counted_by: 'Hệ thống',
    item_count: 5,
    increase_count: 3,
    decrease_count: 2,
    diff_value: 145000,
    status: 'completed',
    note: 'Kiểm kê định kỳ cuối tháng 9',
    items: [
      {
        id: 'ski-01',
        product_id: 'prod-01',
        sku: 'CP001',
        product_name: 'Cà phê rang xay Robusta thượng hạng',
        unit: 'kg',
        system_qty: 171,
        actual_qty: 173,
        diff_qty: 2,
        unit_cost: 85000,
        diff_value: 170000,
        reason: 'Hàng kiểm đếm sót đợt trước'
      },
      {
        id: 'ski-02',
        product_id: 'prod-03',
        sku: 'SY003',
        product_name: 'Siro dâu đậm đặc pha chế 750ml',
        unit: 'chai',
        system_qty: 43,
        actual_qty: 42,
        diff_qty: -1,
        unit_cost: 25000,
        diff_value: -25000,
        reason: 'Bị vỡ nứt chai khi sắp xếp'
      }
    ]
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-01',
    code: 'TT177',
    payment_date: '2026-09-25T11:30:00Z',
    direction: 'in',
    partner_type: 'customer',
    partner_id: 'cust-07',
    partner_name: 'nắng rooftop-minh',
    amount: 595000000,
    method: 'transfer',
    unallocated_amount: 0,
    status: 'active',
    note: 'Chuyển khoản thanh toán toàn bộ HD085',
    allocations: [
      {
        id: 'pa-01',
        payment_id: 'pay-01',
        doc_type: 'sales_invoice',
        doc_id: 'inv-06',
        doc_code: 'HD085',
        amount: 595000000
      }
    ]
  },
  {
    id: 'pay-02',
    code: 'TT176',
    payment_date: '2026-03-25T15:00:00Z',
    direction: 'in',
    partner_type: 'customer',
    partner_id: 'cust-02',
    partner_name: 'Đại lý Hoàng Gia',
    amount: 869440,
    method: 'transfer',
    unallocated_amount: 0,
    status: 'active',
    note: 'Thanh toán đợt 1 tiền hàng HD003',
    allocations: [
      {
        id: 'pa-02',
        payment_id: 'pay-02',
        doc_type: 'sales_invoice',
        doc_id: 'inv-02',
        doc_code: 'HD003',
        amount: 869440
      }
    ]
  }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'act-01',
    occurred_at: '2026-09-27T11:00:00Z',
    action: 'create',
    entity_type: 'purchase_return',
    entity_id: 'pret-01',
    entity_code: 'PR001',
    title: 'Phiếu trả NCC PR001 — a ngữ - khang hưng',
    amount: 120000
  },
  {
    id: 'act-02',
    occurred_at: '2026-09-27T10:15:00Z',
    action: 'create',
    entity_type: 'purchase_order',
    entity_id: 'po-01',
    entity_code: 'PM010',
    title: 'Phiếu mua hàng PM010 — a ngữ - khang hưng',
    amount: 200000
  },
  {
    id: 'act-03',
    occurred_at: '2026-09-27T08:30:00Z',
    action: 'create',
    entity_type: 'sales_invoice',
    entity_id: 'inv-01',
    entity_code: 'HD104',
    title: 'Hóa đơn bán hàng HD104 — xe10',
    amount: 4422000
  },
  {
    id: 'act-04',
    occurred_at: '2026-09-26T17:00:00Z',
    action: 'create',
    entity_type: 'stocktake',
    entity_id: 'stk-01',
    entity_code: 'KK05',
    title: 'Phiếu kiểm kê KK05 — Kho Tổng TP.HCM'
  },
  {
    id: 'act-05',
    occurred_at: '2026-09-25T11:30:00Z',
    action: 'pay',
    entity_type: 'payment',
    entity_id: 'pay-01',
    entity_code: 'TT177',
    title: 'Thu tiền TT177 — nắng rooftop-minh',
    amount: 595000000
  },
  {
    id: 'act-06',
    occurred_at: '2026-09-25T11:20:00Z',
    action: 'create',
    entity_type: 'sales_invoice',
    entity_id: 'inv-06',
    entity_code: 'HD085',
    title: 'Hóa đơn HD085 — nắng rooftop-minh',
    amount: 595000000
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-01',
    title: 'Hoá đơn mới đã được thanh toán',
    body: 'Hóa đơn HD085 trị giá 595.000.000 đ đã được thanh toán đầy đủ.',
    created_at: '2026-09-25T11:30:00Z',
    type: 'success',
    read: false,
    link: '/ban-hang?tab=tong-quan'
  },
  {
    id: 'notif-02',
    title: 'Cảnh báo nợ quá hạn',
    body: 'Khách hàng Đại lý Hoàng Gia có hóa đơn HD003 quá hạn thanh toán 176 ngày.',
    created_at: '2026-09-27T08:00:00Z',
    type: 'danger',
    read: false,
    link: '/cong-no?tab=qua-han'
  },
  {
    id: 'notif-03',
    title: 'Tồn kho sắp hết',
    body: 'Mặt hàng Nước rửa khử khuẩn Organic đa năng 1L còn 4 chai (tồn tối thiểu 10).',
    created_at: '2026-09-27T07:30:00Z',
    type: 'warning',
    read: true,
    link: '/kho-hang?tab=tong-quan'
  }
];
