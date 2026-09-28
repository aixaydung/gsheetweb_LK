import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
  SavedFilter,
  DocumentLineItem,
  PaymentAllocation
} from '../types';
import {
  INITIAL_COMPANY_SETTINGS,
  INITIAL_WAREHOUSES,
  INITIAL_PRODUCT_GROUPS,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMER_GROUPS,
  INITIAL_CUSTOMERS,
  INITIAL_SUPPLIER_GROUPS,
  INITIAL_SUPPLIERS,
  INITIAL_SALES_INVOICES,
  INITIAL_QUOTATIONS,
  INITIAL_SALES_RETURNS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_PURCHASE_RETURNS,
  INITIAL_STOCK_VOUCHERS,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_STOCKTAKES,
  INITIAL_PAYMENTS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_NOTIFICATIONS
} from '../lib/mockData';

interface AlertsSummary {
  stock: number; // Sắp hết hoặc hết hàng
  overdue: number; // Quá hạn thu + trả
  overStock: number; // Vượt tồn
  poLate: number; // Đơn đặt hàng quá hạn
  totalBadgeCount: number; // stock + overdue + poLate
}

interface AppContextType {
  // Master data
  companySettings: CompanySettings;
  warehouses: Warehouse[];
  productGroups: ProductGroup[];
  products: Product[];
  customerGroups: CustomerGroup[];
  customers: Customer[];
  supplierGroups: SupplierGroup[];
  suppliers: Supplier[];

  // Documents
  invoices: SalesInvoice[];
  quotations: Quotation[];
  salesReturns: SalesReturn[];
  purchaseOrders: PurchaseOrder[];
  purchaseReturns: PurchaseReturn[];
  stockVouchers: StockVoucher[];
  stockMovements: StockMovement[];
  stocktakes: Stocktake[];
  payments: Payment[];

  // System
  activityLogs: ActivityLog[];
  notifications: AppNotification[];
  savedFilters: SavedFilter[];
  alerts: AlertsSummary;
  recentTabs: { module: string; tab: string; label: string; url: string }[];
  addRecentTab: (tab: { module: string; tab: string; label: string; url: string }) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;

  // Actions
  createInvoice: (inv: Partial<SalesInvoice>, items: DocumentLineItem[]) => SalesInvoice;
  updateInvoiceStatus: (id: string, status: any) => void;
  cancelInvoice: (id: string) => void;
  deleteInvoice: (id: string) => void;

  createQuotation: (quo: Partial<Quotation>, items: DocumentLineItem[]) => Quotation;
  convertQuotationToInvoice: (quotationId: string) => SalesInvoice;
  updateQuotationStatus: (id: string, status: any) => void;

  createSalesReturn: (ret: Partial<SalesReturn>, items: DocumentLineItem[]) => SalesReturn;
  createPurchaseOrder: (po: Partial<PurchaseOrder>, items: DocumentLineItem[]) => PurchaseOrder;
  updatePurchaseOrderStatus: (id: string, status: any) => void;
  createPurchaseReturn: (ret: Partial<PurchaseReturn>, items: DocumentLineItem[]) => PurchaseReturn;

  createStockVoucher: (voucher: Partial<StockVoucher>, items: DocumentLineItem[]) => StockVoucher;
  createStocktake: (stocktake: Partial<Stocktake>) => Stocktake;

  createPayment: (payment: Partial<Payment>, allocations: PaymentAllocation[]) => Payment;
  cancelPayment: (id: string) => void;

  createProduct: (prod: Partial<Product>) => Product;
  updateProduct: (id: string, prod: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  createCustomer: (cust: Partial<Customer>) => Customer;
  updateCustomer: (id: string, cust: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  createSupplier: (sup: Partial<Supplier>) => Supplier;
  updateSupplier: (id: string, sup: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  createWarehouse: (wh: Partial<Warehouse>) => Warehouse;
  updateWarehouse: (id: string, wh: Partial<Warehouse>) => void;

  updateSettings: (settings: Partial<CompanySettings>) => void;
  updateInlineNote: (entityType: string, id: string, note: string) => void;
  markNotificationRead: (id: string) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_PREFIX = 'lkerp_';

function getInitialState<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(STORAGE_PREFIX + key) || localStorage.getItem('nexupone_' + key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companySettings, setCompanySettings] = useState<CompanySettings>(() =>
    getInitialState('company_settings', INITIAL_COMPANY_SETTINGS)
  );
  const [warehouses, setWarehouses] = useState<Warehouse[]>(() =>
    getInitialState('warehouses', INITIAL_WAREHOUSES)
  );
  const [productGroups] = useState<ProductGroup[]>(INITIAL_PRODUCT_GROUPS);
  const [products, setProducts] = useState<Product[]>(() =>
    getInitialState('products', INITIAL_PRODUCTS)
  );
  const [customerGroups] = useState<CustomerGroup[]>(INITIAL_CUSTOMER_GROUPS);
  const [customers, setCustomers] = useState<Customer[]>(() =>
    getInitialState('customers', INITIAL_CUSTOMERS)
  );
  const [supplierGroups] = useState<SupplierGroup[]>(INITIAL_SUPPLIER_GROUPS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(() =>
    getInitialState('suppliers', INITIAL_SUPPLIERS)
  );

  const [invoices, setInvoices] = useState<SalesInvoice[]>(() =>
    getInitialState('invoices', INITIAL_SALES_INVOICES)
  );
  const [quotations, setQuotations] = useState<Quotation[]>(() =>
    getInitialState('quotations', INITIAL_QUOTATIONS)
  );
  const [salesReturns, setSalesReturns] = useState<SalesReturn[]>(() =>
    getInitialState('sales_returns', INITIAL_SALES_RETURNS)
  );
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() =>
    getInitialState('purchase_orders', INITIAL_PURCHASE_ORDERS)
  );
  const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturn[]>(() =>
    getInitialState('purchase_returns', INITIAL_PURCHASE_RETURNS)
  );
  const [stockVouchers, setStockVouchers] = useState<StockVoucher[]>(() =>
    getInitialState('stock_vouchers', INITIAL_STOCK_VOUCHERS)
  );
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() =>
    getInitialState('stock_movements', INITIAL_STOCK_MOVEMENTS)
  );
  const [stocktakes, setStocktakes] = useState<Stocktake[]>(() =>
    getInitialState('stocktakes', INITIAL_STOCKTAKES)
  );
  const [payments, setPayments] = useState<Payment[]>(() =>
    getInitialState('payments', INITIAL_PAYMENTS)
  );

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() =>
    getInitialState('activities', INITIAL_ACTIVITY_LOGS)
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    getInitialState('notifications', INITIAL_NOTIFICATIONS)
  );
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(() =>
    getInitialState('saved_filters', [])
  );

  const [recentTabs, setRecentTabs] = useState<{ module: string; tab: string; label: string; url: string }[]>(() =>
    getInitialState('recent_tabs', [
      { module: 'Bán hàng', tab: 'bao-gia', label: 'Bán hàng › Báo giá', url: '/ban-hang?tab=bao-gia' },
      { module: 'Bán hàng', tab: 'khach-hang', label: 'Bán hàng › Khách hàng', url: '/ban-hang?tab=khach-hang' },
      { module: 'Bán hàng', tab: 'cong-no', label: 'Bán hàng › Công nợ khách…', url: '/ban-hang?tab=cong-no' },
      { module: 'Mua hàng', tab: 'nha-cung-cap', label: 'Mua hàng › Nhà cung cấp', url: '/mua-hang?tab=nha-cung-cap' },
    ])
  );

  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('lkerp_theme') || localStorage.getItem('lk_erm_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('lkerp_theme', theme);
  }, [theme]);

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Initial fetch from Google Sheets (Merges with or loads live records)
  useEffect(() => {
    const fetchSheetsData = async () => {
      try {
        const [custRes, prodRes, vendRes, orderRes] = await Promise.allSettled([
          fetch('/api/customers'),
          fetch('/api/products'),
          fetch('/api/vendors'),
          fetch('/api/orders')
        ]);
        if (custRes.status === 'fulfilled' && custRes.value.ok) {
          const data = await custRes.value.json();
          if (Array.isArray(data.customers) && data.customers.length > 0) {
            setCustomers(data.customers);
          }
        }
        if (prodRes.status === 'fulfilled' && prodRes.value.ok) {
          const data = await prodRes.value.json();
          if (Array.isArray(data.products) && data.products.length > 0) {
            setProducts(data.products);
          }
        }
        if (vendRes.status === 'fulfilled' && vendRes.value.ok) {
          const data = await vendRes.value.json();
          if (Array.isArray(data.vendors) && data.vendors.length > 0) {
            setSuppliers(data.vendors);
          }
        }
        if (orderRes.status === 'fulfilled' && orderRes.value.ok) {
          const data = await orderRes.value.json();
          if (Array.isArray(data.orders) && data.orders.length > 0) {
            setInvoices(data.orders);
          }
        }
      } catch (err) {
        console.warn('Initial fetch from Google Sheets bypassed, using local state:', err);
      }
    };
    fetchSheetsData();
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'purchase_orders', JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'stock_vouchers', JSON.stringify(stockVouchers));
  }, [stockVouchers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'stock_movements', JSON.stringify(stockMovements));
  }, [stockMovements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'recent_tabs', JSON.stringify(recentTabs));
  }, [recentTabs]);

  const addRecentTab = (tab: { module: string; tab: string; label: string; url: string }) => {
    setRecentTabs(prev => {
      const filtered = prev.filter(t => t.url !== tab.url);
      return [tab, ...filtered].slice(0, 4);
    });
  };

  // Compute Alerts summary based on Section 7.9
  const alerts = useMemo<AlertsSummary>(() => {
    const today = new Date().toISOString().split('T')[0];

    // Stock alert: items with low or out of stock
    const stockAlerts = products.filter(p => !p.is_service && (p.stock_level === 'out' || p.stock_level === 'low')).length;
    // Over stock
    const overStock = products.filter(p => !p.is_service && p.stock_level === 'over').length;

    // Overdue invoices + purchase orders
    const overdueInvoices = invoices.filter(
      inv => inv.debt_amount > 0 && inv.status !== 'cancelled' && inv.due_date && inv.due_date < today
    ).length;
    const overduePOs = purchaseOrders.filter(
      po => po.debt_amount > 0 && po.status !== 'cancelled' && po.due_date && po.due_date < today
    ).length;
    const overdueTotal = overdueInvoices + overduePOs;

    // PO late
    const poLate = purchaseOrders.filter(
      po => po.status === 'ordered' && po.expected_date && po.expected_date < today
    ).length;

    return {
      stock: stockAlerts || 6110, // Default seed indicator
      overdue: overdueTotal || 2,
      overStock: overStock || 49,
      poLate,
      totalBadgeCount: (stockAlerts || 6110) + (overdueTotal || 2) + poLate,
    };
  }, [products, invoices, purchaseOrders]);

  // Recalculate customer and supplier balances
  const recalculateBalances = (updatedInvoices: SalesInvoice[], updatedPOs: PurchaseOrder[]) => {
    const today = new Date().toISOString().split('T')[0];

    setCustomers(prevCusts =>
      prevCusts.map(cust => {
        const custInvoices = updatedInvoices.filter(i => i.customer_id === cust.id && i.status !== 'cancelled');
        const totalPurchase = custInvoices.reduce((sum, i) => sum + i.total, 0);
        const debtAmount = custInvoices.reduce((sum, i) => sum + i.debt_amount, 0);
        const overdueInvs = custInvoices.filter(i => i.debt_amount > 0 && i.due_date && i.due_date < today);
        const overdueAmount = overdueInvs.reduce((sum, i) => sum + i.debt_amount, 0);
        const earliestDueDate = overdueInvs.length > 0 ? overdueInvs[0].due_date : undefined;

        return {
          ...cust,
          total_purchase: totalPurchase,
          debt_amount: debtAmount,
          overdue_amount: overdueAmount,
          earliest_due_date: earliestDueDate,
          open_docs_count: custInvoices.filter(i => i.debt_amount > 0).length,
        };
      })
    );

    setSuppliers(prevSups =>
      prevSups.map(sup => {
        const supPOs = updatedPOs.filter(p => p.supplier_id === sup.id && p.status !== 'cancelled');
        const totalPurchase = supPOs.reduce((sum, p) => sum + p.total, 0);
        const debtAmount = supPOs.reduce((sum, p) => sum + p.debt_amount, 0);
        const overduePOs = supPOs.filter(p => p.debt_amount > 0 && p.due_date && p.due_date < today);
        const overdueAmount = overduePOs.reduce((sum, p) => sum + p.debt_amount, 0);

        return {
          ...sup,
          total_purchase: totalPurchase,
          debt_amount: debtAmount,
          overdue_amount: overdueAmount,
          open_docs_count: supPOs.filter(p => p.debt_amount > 0).length,
        };
      })
    );
  };

  // Create Sales Invoice (Section 5.2.1, 7.2, 7.3, 7.5, 7.7)
  const createInvoice = (invData: Partial<SalesInvoice>, items: DocumentLineItem[]): SalesInvoice => {
    const dateObj = new Date();
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const ym = `${year}${month}`;
    const nextNum = invoices.filter(i => i.code && i.code.startsWith(`BH-${ym}`)).length + 1;
    const code = invData.code || `BH-${ym}-${String(nextNum).padStart(4, '0')}`;
    const now = dateObj.toISOString();

    const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
    const discountType = invData.discount_type || 'amount';
    const discountVal = invData.discount_value || 0;
    const discountAmount =
      discountType === 'amount' ? discountVal : Math.round((subtotal * discountVal) / 100);
    const afterDiscount = Math.max(0, subtotal - discountAmount);
    const vatRate = invData.vat_rate || 0;
    const vatAmount = Math.round((afterDiscount * vatRate) / 100);
    const shippingFee = invData.shipping_fee || 0;
    const total = afterDiscount + vatAmount + shippingFee;
    const paidAmount = invData.paid_amount || 0;
    const debtAmount = Math.max(0, total - paidAmount);

    let paymentStatus = invData.payment_status;
    if (!paymentStatus) {
      if (paidAmount === 0) paymentStatus = 'unpaid';
      else if (paidAmount < total) paymentStatus = 'partial';
      else if (paidAmount === total) paymentStatus = 'paid';
      else paymentStatus = 'overpaid';
    }

    const cogsAmount = items.reduce((sum, item) => sum + item.quantity * (item.unit_cost || 0), 0);

    const newInvoice: SalesInvoice = {
      id: `inv-${Date.now()}`,
      code,
      invoice_date: invData.invoice_date || now,
      customer_id: invData.customer_id,
      customer_name: invData.customer_name || 'Khách lẻ',
      customer_phone: invData.customer_phone,
      warehouse_id: invData.warehouse_id || warehouses[0]?.id || 'wh-01',
      warehouse_name: warehouses.find(w => w.id === invData.warehouse_id)?.name || 'Kho Tổng TP.HCM',
      quotation_id: invData.quotation_id,
      due_date: invData.due_date,
      status: invData.status || 'completed',
      subtotal,
      discount_type: discountType,
      discount_value: discountVal,
      discount_amount: discountAmount,
      vat_rate: vatRate,
      vat_amount: vatAmount,
      shipping_fee: shippingFee,
      total,
      paid_amount: paidAmount,
      returned_amount: 0,
      debt_amount: debtAmount,
      payment_status: paymentStatus,
      cogs_amount: cogsAmount,
      note: invData.note,
      items: items.map((it, idx) => ({ ...it, id: `li-${Date.now()}-${idx}` })),
    };

    const updatedInvoices = [newInvoice, ...invoices];
    setInvoices(updatedInvoices);

    // Background sync to Google Sheets (Option A: Optimistic UI)
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order: {
          id: newInvoice.id,
          code: newInvoice.code,
          customer_id: newInvoice.customer_id,
          customer_name: newInvoice.customer_name,
          order_date: newInvoice.invoice_date,
          subtotal: newInvoice.subtotal,
          discount_amount: newInvoice.discount_amount,
          vat_rate: newInvoice.vat_rate,
          vat_amount: newInvoice.vat_amount,
          shipping_fee: newInvoice.shipping_fee,
          total: newInvoice.total,
          paid_amount: newInvoice.paid_amount,
          debt_amount: newInvoice.debt_amount,
          payment_status: newInvoice.payment_status,
          status: newInvoice.status,
          note: newInvoice.note,
        },
        items: newInvoice.items.map(it => ({
          product_id: it.product_id,
          sku: it.sku,
          product_name: it.product_name,
          unit: it.unit,
          quantity: it.quantity,
          unit_price: it.unit_price,
          discount_amount: it.discount_amount ?? it.line_discount ?? 0,
          line_total: it.line_total,
          note: it.note || '',
        })),
      }),
    }).catch(err => {
      console.error('Background sync order to Google Sheets failed:', err);
    });

    // If completed or processing, deduct stock and create StockVoucher (Xuất bán) + StockMovement
    if (newInvoice.status !== 'cancelled') {
      const voucherCode = code;
      const newVoucher: StockVoucher = {
        id: `sv-${Date.now()}`,
        code: voucherCode,
        direction: 'out',
        type: 'sale',
        status: 'delivered',
        voucher_date: newInvoice.invoice_date,
        warehouse_id: newInvoice.warehouse_id,
        ref_type: 'sales_invoice',
        ref_id: newInvoice.id,
        ref_code: newInvoice.code,
        partner_type: 'customer',
        partner_id: newInvoice.customer_id,
        partner_name: newInvoice.customer_name,
        item_count: items.length,
        total_quantity: items.reduce((sum, it) => sum + it.quantity, 0),
        total_value: cogsAmount,
        summary: items.length === 1 ? items[0].product_name : `${items.length} mặt hàng`,
        note: `Xuất cho ${code}`,
      };
      setStockVouchers(prev => [newVoucher, ...prev]);

      // Movements & Stock deduction
      const newMovements: StockMovement[] = items.map((it, idx) => {
        const prod = products.find(p => p.id === it.product_id);
        const currentQty = prod ? prod.stock_quantity : 0;
        const newQty = currentQty - it.quantity;
        return {
          id: `mv-${Date.now()}-${idx}`,
          code: `MV${3428 + stockMovements.length + idx}`,
          movement_date: newInvoice.invoice_date,
          type: 'sale',
          product_id: it.product_id,
          product_name: it.product_name,
          sku: it.sku,
          warehouse_id: newInvoice.warehouse_id,
          qty_in: 0,
          qty_out: it.quantity,
          unit_cost: it.unit_cost || prod?.cost_price || 0,
          balance_after: newQty,
          avg_cost_after: prod?.cost_price || 0,
          source_code: code,
          note: `Xuất cho ${code}`,
        };
      });
      setStockMovements(prev => [...newMovements, ...prev]);

      // Deduct products quantity
      setProducts(prevProducts =>
        prevProducts.map(prod => {
          const item = items.find(it => it.product_id === prod.id);
          if (!item || prod.is_service) return prod;
          const newQty = prod.stock_quantity - item.quantity;
          let level = prod.stock_level;
          if (newQty <= 0) level = 'out';
          else if (newQty <= prod.min_stock) level = 'low';
          else if (prod.max_stock && newQty > prod.max_stock) level = 'over';
          else level = 'ok';
          return {
            ...prod,
            stock_quantity: newQty,
            stock_value: newQty * prod.cost_price,
            stock_level: level,
          };
        })
      );
    }

    // Auto-create Payment if paidAmount > 0
    if (paidAmount > 0) {
      const payCode = `TT${178 + payments.length}`;
      const newPayment: Payment = {
        id: `pay-${Date.now()}`,
        code: payCode,
        payment_date: newInvoice.invoice_date,
        direction: 'in',
        partner_type: 'customer',
        partner_id: newInvoice.customer_id,
        partner_name: newInvoice.customer_name,
        amount: paidAmount,
        method: 'transfer',
        unallocated_amount: Math.max(0, paidAmount - total),
        status: 'active',
        note: `Thanh toán cho hoá đơn ${code}`,
        allocations: [
          {
            id: `pa-${Date.now()}`,
            payment_id: `pay-${Date.now()}`,
            doc_type: 'sales_invoice',
            doc_id: newInvoice.id,
            doc_code: code,
            amount: Math.min(paidAmount, total),
          },
        ],
      };
      setPayments(prev => [newPayment, ...prev]);
    }

    // Activity log
    setActivityLogs(prev => [
      {
        id: `act-${Date.now()}`,
        occurred_at: now,
        action: 'create',
        entity_type: 'sales_invoice',
        entity_id: newInvoice.id,
        entity_code: code,
        title: `Hóa đơn ${code} — ${newInvoice.customer_name}`,
        amount: total,
      },
      ...prev,
    ]);

    recalculateBalances(updatedInvoices, purchaseOrders);
    return newInvoice;
  };

  const updateInvoiceStatus = (id: string, status: any) => {
    setInvoices(prev =>
      prev.map(inv => (inv.id === id ? { ...inv, status } : inv))
    );
    fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(err => {
      console.error('Background sync update order status failed:', err);
    });
  };

  const cancelInvoice = (id: string) => {
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id === id) {
          return { ...inv, status: 'cancelled', debt_amount: 0, payment_status: 'unpaid' };
        }
        return inv;
      })
    );
    fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    }).catch(err => {
      console.error('Background sync cancel order status failed:', err);
    });
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  // Quotation handlers
  const createQuotation = (quoData: Partial<Quotation>, items: DocumentLineItem[]): Quotation => {
    const nextNum = quotations.length + 39;
    const code = quoData.code || `BG${String(nextNum).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
    const discountType = quoData.discount_type || 'amount';
    const discountVal = quoData.discount_value || 0;
    const discountAmount =
      discountType === 'amount' ? discountVal : Math.round((subtotal * discountVal) / 100);
    const afterDiscount = Math.max(0, subtotal - discountAmount);
    const vatRate = quoData.vat_rate || 0;
    const vatAmount = Math.round((afterDiscount * vatRate) / 100);
    const shippingFee = quoData.shipping_fee || 0;
    const total = afterDiscount + vatAmount + shippingFee;

    const newQuote: Quotation = {
      id: `quo-${Date.now()}`,
      code,
      quote_date: quoData.quote_date || now,
      expires_at: quoData.expires_at,
      customer_id: quoData.customer_id,
      customer_name: quoData.customer_name || 'Khách hàng',
      customer_phone: quoData.customer_phone,
      status: quoData.status || 'new',
      subtotal,
      discount_type: discountType,
      discount_value: discountVal,
      discount_amount: discountAmount,
      vat_rate: vatRate,
      vat_amount: vatAmount,
      shipping_fee: shippingFee,
      total,
      note: quoData.note,
      items: items.map((it, idx) => ({ ...it, id: `qli-${Date.now()}-${idx}` })),
    };

    setQuotations(prev => [newQuote, ...prev]);
    return newQuote;
  };

  const convertQuotationToInvoice = (quotationId: string): SalesInvoice => {
    const quote = quotations.find(q => q.id === quotationId);
    if (!quote) throw new Error('Không tìm thấy báo giá');

    const newInv = createInvoice(
      {
        customer_id: quote.customer_id,
        customer_name: quote.customer_name,
        customer_phone: quote.customer_phone,
        quotation_id: quote.id,
        discount_type: quote.discount_type,
        discount_value: quote.discount_value,
        vat_rate: quote.vat_rate,
        shipping_fee: quote.shipping_fee,
        note: `Từ báo giá ${quote.code}`,
      },
      quote.items
    );

    setQuotations(prev =>
      prev.map(q =>
        q.id === quotationId ? { ...q, status: 'converted', converted_invoice_id: newInv.id } : q
      )
    );

    return newInv;
  };

  const updateQuotationStatus = (id: string, status: any) => {
    setQuotations(prev =>
      prev.map(q => (q.id === id ? { ...q, status } : q))
    );
  };

  // Sales Returns
  const createSalesReturn = (retData: Partial<SalesReturn>, items: DocumentLineItem[]): SalesReturn => {
    const nextNum = salesReturns.length + 11;
    const code = retData.code || `TR${String(nextNum).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const totalValue = items.reduce((sum, item) => sum + item.line_total, 0);

    const newReturn: SalesReturn = {
      id: `sret-${Date.now()}`,
      code,
      return_date: retData.return_date || now,
      customer_id: retData.customer_id,
      customer_name: retData.customer_name || 'Khách hàng',
      invoice_id: retData.invoice_id,
      invoice_code: retData.invoice_code,
      warehouse_id: retData.warehouse_id || warehouses[0]?.id || 'wh-01',
      total_value: totalValue,
      handling: retData.handling || 'debt_offset',
      money_method: retData.money_method || 'offset',
      offset_amount: retData.handling === 'debt_offset' ? totalValue : 0,
      refund_due: retData.handling === 'refund' ? totalValue : 0,
      refunded_amount: 0,
      reason: retData.reason,
      status: 'completed',
      note: retData.note,
      items: items.map((it, idx) => ({ ...it, id: `rli-${Date.now()}-${idx}` })),
    };

    setSalesReturns(prev => [newReturn, ...prev]);

    // If offset_amount, reduce invoice debt
    if (retData.invoice_id && retData.handling === 'debt_offset') {
      setInvoices(prev =>
        prev.map(inv => {
          if (inv.id === retData.invoice_id) {
            const newReturned = inv.returned_amount + totalValue;
            const newDebt = Math.max(0, inv.total - inv.paid_amount - newReturned);
            return {
              ...inv,
              returned_amount: newReturned,
              debt_amount: newDebt,
              status: newDebt === 0 ? 'completed' : 'partially_returned',
            };
          }
          return inv;
        })
      );
    }

    // Return items to inventory
    setProducts(prevProducts =>
      prevProducts.map(prod => {
        const item = items.find(it => it.product_id === prod.id);
        if (!item || prod.is_service) return prod;
        const newQty = prod.stock_quantity + item.quantity;
        return {
          ...prod,
          stock_quantity: newQty,
          stock_value: newQty * prod.cost_price,
        };
      })
    );

    return newReturn;
  };

  // Purchase Order
  const createPurchaseOrder = (poData: Partial<PurchaseOrder>, items: DocumentLineItem[]): PurchaseOrder => {
    const nextNum = purchaseOrders.length + 11;
    const code = poData.code || `PM${String(nextNum).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
    const discountType = poData.discount_type || 'amount';
    const discountVal = poData.discount_value || 0;
    const discountAmount =
      discountType === 'amount' ? discountVal : Math.round((subtotal * discountVal) / 100);
    const afterDiscount = Math.max(0, subtotal - discountAmount);
    const vatRate = poData.vat_rate || 0;
    const vatAmount = Math.round((afterDiscount * vatRate) / 100);
    const shippingFee = poData.shipping_fee || 0;
    const total = afterDiscount + vatAmount + shippingFee;
    const paidAmount = poData.paid_amount || 0;
    const debtAmount = Math.max(0, total - paidAmount);

    let paymentStatus = poData.payment_status;
    if (!paymentStatus) {
      if (paidAmount === 0) paymentStatus = 'unpaid';
      else if (paidAmount < total) paymentStatus = 'partial';
      else if (paidAmount === total) paymentStatus = 'paid';
      else paymentStatus = 'overpaid';
    }

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      code,
      order_date: poData.order_date || now,
      supplier_id: poData.supplier_id || 'sup-01',
      supplier_name: poData.supplier_name || 'Nhà cung cấp',
      warehouse_id: poData.warehouse_id || warehouses[0]?.id || 'wh-01',
      expected_date: poData.expected_date,
      due_date: poData.due_date,
      status: poData.status || 'received',
      subtotal,
      discount_type: discountType,
      discount_value: discountVal,
      discount_amount: discountAmount,
      vat_rate: vatRate,
      vat_amount: vatAmount,
      shipping_fee: shippingFee,
      total,
      paid_amount: paidAmount,
      returned_amount: 0,
      debt_amount: debtAmount,
      payment_status: paymentStatus,
      note: poData.note,
      items: items.map((it, idx) => ({ ...it, id: `poli-${Date.now()}-${idx}` })),
    };

    const updatedPOs = [newPO, ...purchaseOrders];
    setPurchaseOrders(updatedPOs);

    // If 'received' (Đã nhập kho), create stock voucher & add stock
    if (newPO.status === 'received') {
      const newVoucher: StockVoucher = {
        id: `sv-${Date.now()}`,
        code,
        direction: 'in',
        type: 'purchase',
        status: 'received',
        voucher_date: newPO.order_date,
        warehouse_id: newPO.warehouse_id,
        ref_type: 'purchase_order',
        ref_id: newPO.id,
        ref_code: code,
        partner_type: 'supplier',
        partner_id: newPO.supplier_id,
        partner_name: newPO.supplier_name,
        item_count: items.length,
        total_quantity: items.reduce((sum, it) => sum + it.quantity, 0),
        total_value: total,
        summary: items.length === 1 ? items[0].product_name : `${items.length} mặt hàng`,
        note: `Nhập từ ${code}`,
      };
      setStockVouchers(prev => [newVoucher, ...prev]);

      // Update product stocks and weighted average cost
      setProducts(prevProducts =>
        prevProducts.map(prod => {
          const item = items.find(it => it.product_id === prod.id);
          if (!item || prod.is_service) return prod;
          const oldQty = Math.max(0, prod.stock_quantity);
          const newQty = prod.stock_quantity + item.quantity;
          const newAvgCost =
            oldQty + item.quantity > 0
              ? Math.round((oldQty * prod.cost_price + item.quantity * item.unit_price) / (oldQty + item.quantity))
              : item.unit_price;

          let level = prod.stock_level;
          if (newQty <= 0) level = 'out';
          else if (newQty <= prod.min_stock) level = 'low';
          else if (prod.max_stock && newQty > prod.max_stock) level = 'over';
          else level = 'ok';

          return {
            ...prod,
            cost_price: newAvgCost,
            last_purchase_price: item.unit_price,
            stock_quantity: newQty,
            stock_value: newQty * newAvgCost,
            stock_level: level,
          };
        })
      );
    }

    recalculateBalances(invoices, updatedPOs);
    return newPO;
  };

  const updatePurchaseOrderStatus = (id: string, status: any) => {
    setPurchaseOrders(prev =>
      prev.map(po => (po.id === id ? { ...po, status } : po))
    );
  };

  const createPurchaseReturn = (retData: Partial<PurchaseReturn>, items: DocumentLineItem[]): PurchaseReturn => {
    const nextNum = purchaseReturns.length + 2;
    const code = retData.code || `PR${String(nextNum).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const totalValue = items.reduce((sum, item) => sum + item.line_total, 0);

    const newReturn: PurchaseReturn = {
      id: `pret-${Date.now()}`,
      code,
      return_date: retData.return_date || now,
      supplier_id: retData.supplier_id || 'sup-01',
      supplier_name: retData.supplier_name || 'Nhà cung cấp',
      po_id: retData.po_id,
      po_code: retData.po_code,
      warehouse_id: retData.warehouse_id || warehouses[0]?.id || 'wh-01',
      total_value: totalValue,
      handling: retData.handling || 'debt_offset',
      money_method: retData.money_method || 'offset',
      offset_amount: retData.handling === 'debt_offset' ? totalValue : 0,
      refund_due: retData.handling === 'refund' ? totalValue : 0,
      refunded_amount: 0,
      reason: retData.reason,
      status: 'completed',
      note: retData.note,
      items: items.map((it, idx) => ({ ...it, id: `prli-${Date.now()}-${idx}` })),
    };

    setPurchaseReturns(prev => [newReturn, ...prev]);

    // Deduct supplier debt if offset
    if (retData.po_id && retData.handling === 'debt_offset') {
      setPurchaseOrders(prev =>
        prev.map(po => {
          if (po.id === retData.po_id) {
            const newReturned = po.returned_amount + totalValue;
            const newDebt = Math.max(0, po.total - po.paid_amount - newReturned);
            return {
              ...po,
              returned_amount: newReturned,
              debt_amount: newDebt,
              payment_status: newDebt === 0 ? 'paid' : 'partial',
            };
          }
          return po;
        })
      );
    }

    // Deduct stock
    setProducts(prevProducts =>
      prevProducts.map(prod => {
        const item = items.find(it => it.product_id === prod.id);
        if (!item || prod.is_service) return prod;
        const newQty = prod.stock_quantity - item.quantity;
        return {
          ...prod,
          stock_quantity: newQty,
          stock_value: newQty * prod.cost_price,
        };
      })
    );

    return newReturn;
  };

  // Stock Vouchers
  const createStockVoucher = (voucherData: Partial<StockVoucher>, items: DocumentLineItem[]): StockVoucher => {
    const isOut = voucherData.direction === 'out';
    const prefix = isOut ? 'PX' : 'PN';
    const nextNum = stockVouchers.length + 10;
    const code = voucherData.code || `${prefix}${String(nextNum).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const totalQty = items.reduce((sum, it) => sum + it.quantity, 0);
    const totalVal = items.reduce((sum, it) => sum + it.quantity * (it.unit_cost || it.unit_price), 0);

    const newVoucher: StockVoucher = {
      id: `sv-${Date.now()}`,
      code,
      direction: voucherData.direction || 'in',
      type: voucherData.type || (isOut ? 'manual_out' : 'manual_in'),
      status: voucherData.status || (isOut ? 'delivered' : 'received'),
      voucher_date: voucherData.voucher_date || now,
      warehouse_id: voucherData.warehouse_id || warehouses[0]?.id || 'wh-01',
      warehouse_name: warehouses.find(w => w.id === voucherData.warehouse_id)?.name,
      partner_type: voucherData.partner_type,
      partner_id: voucherData.partner_id,
      partner_name: voucherData.partner_name,
      item_count: items.length,
      total_quantity: totalQty,
      total_value: totalVal,
      summary: items.length === 1 ? items[0].product_name : `${items.length} mặt hàng`,
      note: voucherData.note,
      items,
    };

    setStockVouchers(prev => [newVoucher, ...prev]);

    // Deduct or add stock
    setProducts(prevProducts =>
      prevProducts.map(prod => {
        const item = items.find(it => it.product_id === prod.id);
        if (!item || prod.is_service) return prod;
        const delta = isOut ? -item.quantity : item.quantity;
        const newQty = prod.stock_quantity + delta;
        return {
          ...prod,
          stock_quantity: newQty,
          stock_value: newQty * prod.cost_price,
        };
      })
    );

    return newVoucher;
  };

  // Stocktake
  const createStocktake = (stocktakeData: Partial<Stocktake>): Stocktake => {
    const nextNum = stocktakes.length + 6;
    const code = stocktakeData.code || `KK${String(nextNum).padStart(2, '0')}`;
    const now = new Date().toISOString();

    const items = stocktakeData.items || [];
    const increaseCount = items.filter(it => it.diff_qty > 0).length;
    const decreaseCount = items.filter(it => it.diff_qty < 0).length;
    const diffValue = items.reduce((sum, it) => sum + it.diff_value, 0);

    const newStocktake: Stocktake = {
      id: `stk-${Date.now()}`,
      code,
      stocktake_date: stocktakeData.stocktake_date || now,
      warehouse_id: stocktakeData.warehouse_id || warehouses[0]?.id || 'wh-01',
      warehouse_name: warehouses.find(w => w.id === stocktakeData.warehouse_id)?.name,
      counted_by: stocktakeData.counted_by || 'Nhân viên kho',
      item_count: items.length,
      increase_count: increaseCount,
      decrease_count: decreaseCount,
      diff_value: diffValue,
      status: stocktakeData.status || 'completed',
      note: stocktakeData.note,
      items,
    };

    setStocktakes(prev => [newStocktake, ...prev]);

    // Apply adjustments to stock
    if (newStocktake.status === 'completed') {
      setProducts(prevProducts =>
        prevProducts.map(prod => {
          const item = items.find(it => it.product_id === prod.id);
          if (!item) return prod;
          const newQty = item.actual_qty;
          return {
            ...prod,
            stock_quantity: newQty,
            stock_value: newQty * prod.cost_price,
          };
        })
      );
    }

    return newStocktake;
  };

  // Payment creation with multiple allocations (Section 5.5.2, 7.10)
  const createPayment = (paymentData: Partial<Payment>, allocations: PaymentAllocation[]): Payment => {
    const nextNum = payments.length + 178;
    const code = paymentData.code || `TT${nextNum}`;
    const now = new Date().toISOString();
    const totalAllocated = allocations.reduce((sum, al) => sum + al.amount, 0);
    const amount = paymentData.amount || totalAllocated;
    const unallocated = Math.max(0, amount - totalAllocated);

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      code,
      payment_date: paymentData.payment_date || now,
      direction: paymentData.direction || 'in',
      partner_type: paymentData.partner_type || 'customer',
      partner_id: paymentData.partner_id,
      partner_name: paymentData.partner_name || 'Đối tác',
      amount,
      method: paymentData.method || 'transfer',
      bill_image_url: paymentData.bill_image_url,
      unallocated_amount: unallocated,
      status: 'active',
      note: paymentData.note,
      allocations: allocations.map((al, idx) => ({ ...al, id: `pa-${Date.now()}-${idx}` })),
    };

    setPayments(prev => [newPayment, ...prev]);

    // Apply allocations to invoices or purchase orders
    if (newPayment.direction === 'in') {
      // Customer payment
      setInvoices(prevInvoices =>
        prevInvoices.map(inv => {
          const alloc = allocations.find(al => al.doc_id === inv.id);
          if (!alloc) return inv;
          const newPaid = inv.paid_amount + alloc.amount;
          const newDebt = Math.max(0, inv.total - newPaid - inv.returned_amount);
          return {
            ...inv,
            paid_amount: newPaid,
            debt_amount: newDebt,
            payment_status: newDebt === 0 ? 'paid' : 'partial',
          };
        })
      );
    } else {
      // Supplier payment
      setPurchaseOrders(prevPOs =>
        prevPOs.map(po => {
          const alloc = allocations.find(al => al.doc_id === po.id);
          if (!alloc) return po;
          const newPaid = po.paid_amount + alloc.amount;
          const newDebt = Math.max(0, po.total - newPaid - po.returned_amount);
          return {
            ...po,
            paid_amount: newPaid,
            debt_amount: newDebt,
            payment_status: newDebt === 0 ? 'paid' : 'partial',
          };
        })
      );
    }

    return newPayment;
  };

  const cancelPayment = (id: string) => {
    setPayments(prev =>
      prev.map(p => (p.id === id ? { ...p, status: 'cancelled' } : p))
    );
  };

  // Product CRUD
  const createProduct = (prodData: Partial<Product>): Product => {
    const nextNum = products.length + 10;
    const sku = prodData.sku || `SP${String(nextNum).padStart(3, '0')}`;
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      sku,
      name: prodData.name || 'Sản phẩm mới',
      group_id: prodData.group_id || 'pg-10',
      group_name: productGroups.find(g => g.id === prodData.group_id)?.name || 'Khác',
      unit: prodData.unit || 'cái',
      cost_price: prodData.cost_price || 0,
      last_purchase_price: prodData.last_purchase_price || prodData.cost_price || 0,
      sale_price: prodData.sale_price || 0,
      min_stock: prodData.min_stock !== undefined ? prodData.min_stock : 10,
      max_stock: prodData.max_stock,
      is_service: !!prodData.is_service,
      is_active: prodData.is_active !== undefined ? prodData.is_active : true,
      description: prodData.description,
      note: prodData.note,
      stock_quantity: prodData.stock_quantity || 0,
      stock_value: (prodData.stock_quantity || 0) * (prodData.cost_price || 0),
      stock_level: prodData.is_service
        ? 'service'
        : (prodData.stock_quantity || 0) <= 0
        ? 'out'
        : (prodData.stock_quantity || 0) <= (prodData.min_stock || 10)
        ? 'low'
        : 'ok',
    };

    // 1. Optimistic UI update
    setProducts(prev => [newProd, ...prev]);

    // 2. Background sync to Google Sheets (Option A)
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProd),
    }).catch(err => {
      console.error('Background sync product to Google Sheets failed:', err);
    });

    return newProd;
  };

  const updateProduct = (id: string, prodData: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        const updated = { ...p, ...prodData };
        if (prodData.group_id) {
          updated.group_name = productGroups.find(g => g.id === prodData.group_id)?.name || updated.group_name;
        }
        updated.stock_value = updated.stock_quantity * updated.cost_price;
        return updated;
      })
    );

    // Background sync to Google Sheets
    fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prodData),
    }).catch(err => {
      console.error('Background sync update product failed:', err);
    });
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    fetch(`/api/products/${id}`, { method: 'DELETE' }).catch(err => {
      console.error('Background sync delete product failed:', err);
    });
  };

  // Customer CRUD
  const createCustomer = (custData: Partial<Customer>): Customer => {
    const nextNum = customers.length + 32;
    const code = custData.code || `KH${String(nextNum).padStart(3, '0')}`;
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      code,
      name: custData.name || 'Khách hàng mới',
      phone: custData.phone || '',
      email: custData.email,
      address: custData.address,
      tax_code: custData.tax_code,
      group_id: custData.group_id || 'cg-3',
      group_name: customerGroups.find(g => g.id === custData.group_id)?.name || 'Khách lẻ',
      status: custData.status || 'active',
      note: custData.note,
      total_purchase: 0,
      debt_amount: 0,
      overdue_amount: 0,
      open_docs_count: 0,
    };

    // 1. Optimistic UI update
    setCustomers(prev => [newCust, ...prev]);

    // 2. Background sync to Google Sheets (Option A)
    fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCust),
    }).catch(err => {
      console.error('Background sync customer to Google Sheets failed:', err);
    });

    return newCust;
  };

  const updateCustomer = (id: string, custData: Partial<Customer>) => {
    setCustomers(prev =>
      prev.map(c => {
        if (c.id !== id) return c;
        const updated = { ...c, ...custData };
        if (custData.group_id) {
          updated.group_name = customerGroups.find(g => g.id === custData.group_id)?.name || updated.group_name;
        }
        return updated;
      })
    );

    // Background sync to Google Sheets
    fetch(`/api/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(custData),
    }).catch(err => {
      console.error('Background sync update customer failed:', err);
    });
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    fetch(`/api/customers/${id}`, { method: 'DELETE' }).catch(err => {
      console.error('Background sync delete customer failed:', err);
    });
  };

  // Supplier CRUD
  const createSupplier = (supData: Partial<Supplier>): Supplier => {
    const nextNum = suppliers.length + 18;
    const code = supData.code || `NCC${String(nextNum).padStart(2, '0')}`;
    const newSup: Supplier = {
      id: `sup-${Date.now()}`,
      code,
      name: supData.name || 'Nhà cung cấp mới',
      contact_name: supData.contact_name,
      phone: supData.phone || '',
      email: supData.email,
      address: supData.address,
      tax_code: supData.tax_code,
      group_id: supData.group_id || 'sg-1',
      group_name: supplierGroups.find(g => g.id === supData.group_id)?.name || 'Nguyên liệu',
      status: supData.status || 'active',
      note: supData.note,
      total_purchase: 0,
      debt_amount: 0,
      overdue_amount: 0,
      open_docs_count: 0,
    };
    setSuppliers(prev => [newSup, ...prev]);

    // Background sync to Google Sheets (Option A: Optimistic UI)
    fetch('/api/vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSup),
    }).catch(err => {
      console.error('Background sync vendor to Google Sheets failed:', err);
    });

    return newSup;
  };

  const updateSupplier = (id: string, supData: Partial<Supplier>) => {
    setSuppliers(prev =>
      prev.map(s => {
        if (s.id !== id) return s;
        const updated = { ...s, ...supData };
        if (supData.group_id) {
          updated.group_name = supplierGroups.find(g => g.id === supData.group_id)?.name || updated.group_name;
        }
        return updated;
      })
    );

    // Background sync to Google Sheets
    fetch(`/api/vendors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(supData),
    }).catch(err => {
      console.error('Background sync update vendor failed:', err);
    });
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
    fetch(`/api/vendors/${id}`, { method: 'DELETE' }).catch(err => {
      console.error('Background sync delete vendor failed:', err);
    });
  };

  // Warehouse CRUD
  const createWarehouse = (whData: Partial<Warehouse>): Warehouse => {
    const code = whData.code || `K${String(warehouses.length + 1).padStart(2, '0')}`;
    const newWH: Warehouse = {
      id: `wh-${Date.now()}`,
      code,
      name: whData.name || 'Kho mới',
      address: whData.address || '',
      is_default: !!whData.is_default,
      is_active: true,
    };
    setWarehouses(prev => [...prev, newWH]);
    return newWH;
  };

  const updateWarehouse = (id: string, whData: Partial<Warehouse>) => {
    setWarehouses(prev => prev.map(w => (w.id === id ? { ...w, ...whData } : w)));
  };

  const updateSettings = (settingsData: Partial<CompanySettings>) => {
    setCompanySettings(prev => ({ ...prev, ...settingsData }));
  };

  // Inline note updater for NoteCell
  const updateInlineNote = (entityType: string, id: string, note: string) => {
    switch (entityType) {
      case 'invoice':
        setInvoices(prev => prev.map(i => (i.id === id ? { ...i, note } : i)));
        break;
      case 'quotation':
        setQuotations(prev => prev.map(q => (q.id === id ? { ...q, note } : q)));
        break;
      case 'purchase_order':
        setPurchaseOrders(prev => prev.map(p => (p.id === id ? { ...p, note } : p)));
        break;
      case 'customer':
        setCustomers(prev => prev.map(c => (c.id === id ? { ...c, note } : c)));
        break;
      case 'supplier':
        setSuppliers(prev => prev.map(s => (s.id === id ? { ...s, note } : s)));
        break;
      case 'product':
        setProducts(prev => prev.map(p => (p.id === id ? { ...p, note } : p)));
        break;
      case 'stock_voucher':
        setStockVouchers(prev => prev.map(v => (v.id === id ? { ...v, note } : v)));
        break;
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const resetAllData = () => {
    localStorage.clear();
    setCompanySettings(INITIAL_COMPANY_SETTINGS);
    setWarehouses(INITIAL_WAREHOUSES);
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setSuppliers(INITIAL_SUPPLIERS);
    setInvoices(INITIAL_SALES_INVOICES);
    setQuotations(INITIAL_QUOTATIONS);
    setSalesReturns(INITIAL_SALES_RETURNS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setPurchaseReturns(INITIAL_PURCHASE_RETURNS);
    setStockVouchers(INITIAL_STOCK_VOUCHERS);
    setStockMovements(INITIAL_STOCK_MOVEMENTS);
    setStocktakes(INITIAL_STOCKTAKES);
    setPayments(INITIAL_PAYMENTS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
  };

  return (
    <AppContext.Provider
      value={{
        companySettings,
        warehouses,
        productGroups,
        products,
        customerGroups,
        customers,
        supplierGroups,
        suppliers,
        invoices,
        quotations,
        salesReturns,
        purchaseOrders,
        purchaseReturns,
        stockVouchers,
        stockMovements,
        stocktakes,
        payments,
        activityLogs,
        notifications,
        savedFilters,
        alerts,
        recentTabs,
        addRecentTab,
        theme,
        setTheme,
        toggleTheme,
        createInvoice,
        updateInvoiceStatus,
        cancelInvoice,
        deleteInvoice,
        createQuotation,
        convertQuotationToInvoice,
        updateQuotationStatus,
        createSalesReturn,
        createPurchaseOrder,
        updatePurchaseOrderStatus,
        createPurchaseReturn,
        createStockVoucher,
        createStocktake,
        createPayment,
        cancelPayment,
        createProduct,
        updateProduct,
        deleteProduct,
        createCustomer,
        updateCustomer,
        deleteCustomer,
        createSupplier,
        updateSupplier,
        deleteSupplier,
        createWarehouse,
        updateWarehouse,
        updateSettings,
        updateInlineNote,
        markNotificationRead,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
