import crypto from 'crypto';
import { getSheetData, appendSheetData, updateSheetData, clearSheetData } from '../google-sheets.js';
import { adjustProductStockBatch } from './products.js';

const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1wniDalcsynG8-H1sWokE47Woi0o9mrViDwW27di7oNY';
const ORDERS_SHEET = 'ORDERS';
const ORDER_ITEMS_SHEET = 'ORDER_ITEMS';
const STOCK_MOVEMENTS_SHEET = 'STOCK_MOVEMENTS';

export interface OrderItemRecord {
  id: string;
  order_id: string;
  product_id: string;
  sku: string;
  product_name: string;
  unit: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  line_total: number;
  note?: string;
}

export interface OrderRecord {
  id: string;
  code: string;
  customer_id: string;
  customer_name: string;
  order_date: string;
  subtotal: number;
  discount_amount: number;
  vat_rate: number;
  vat_amount: number;
  shipping_fee: number;
  total: number;
  paid_amount: number;
  debt_amount: number;
  payment_status: 'unpaid' | 'partial' | 'paid' | 'overpaid';
  status: 'processing' | 'completed' | 'partially_returned' | 'cancelled' | 'locked';
  note?: string;
  created_by?: string;
  created_at: string;
  items?: OrderItemRecord[];
  rowIndex?: number;
}

export const getAllOrders = async (): Promise<OrderRecord[]> => {
  const [orderRows, itemRows] = await Promise.all([
    getSheetData(SPREADSHEET_ID, `${ORDERS_SHEET}!A2:R`),
    getSheetData(SPREADSHEET_ID, `${ORDER_ITEMS_SHEET}!A2:K`),
  ]);

  const itemsByOrderId = new Map<string, OrderItemRecord[]>();
  for (const row of itemRows) {
    const orderId = row[1] || '';
    if (!orderId) continue;
    const item: OrderItemRecord = {
      id: row[0] || '',
      order_id: orderId,
      product_id: row[2] || '',
      sku: row[3] || '',
      product_name: row[4] || '',
      unit: row[5] || 'Cái',
      quantity: Number(row[6]) || 0,
      unit_price: Number(row[7]) || 0,
      discount_amount: Number(row[8]) || 0,
      line_total: Number(row[9]) || 0,
      note: row[10] || '',
    };
    if (!itemsByOrderId.has(orderId)) {
      itemsByOrderId.set(orderId, []);
    }
    itemsByOrderId.get(orderId)!.push(item);
  }

  return orderRows.map((row: any, index: number) => {
    const id = row[0] || '';
    return {
      id,
      code: row[1] || '',
      customer_id: row[2] || '',
      customer_name: row[3] || '',
      order_date: row[4] || '',
      subtotal: Number(row[5]) || 0,
      discount_amount: Number(row[6]) || 0,
      vat_rate: Number(row[7]) || 0,
      vat_amount: Number(row[8]) || 0,
      shipping_fee: Number(row[9]) || 0,
      total: Number(row[10]) || 0,
      paid_amount: Number(row[11]) || 0,
      debt_amount: Number(row[12]) || 0,
      payment_status: (row[13] as any) || 'unpaid',
      status: (row[14] as any) || 'completed',
      note: row[15] || '',
      created_by: row[16] || '',
      created_at: row[17] || '',
      items: itemsByOrderId.get(id) || [],
      rowIndex: index + 2,
    };
  });
};

export const generateOrderCode = async (): Promise<string> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const ym = `${year}${month}`;
  
  const orders = await getAllOrders();
  const currentMonthOrders = orders.filter(o => o.code && o.code.startsWith(`BH-${ym}`));
  const nextNum = currentMonthOrders.length + 1;
  return `BH-${ym}-${String(nextNum).padStart(4, '0')}`;
};

export const createOrderWithItems = async (orderData: Partial<OrderRecord>, items: OrderItemRecord[] = []) => {
  const id = orderData.id || crypto.randomUUID();
  const code = orderData.code || (await generateOrderCode());
  const now = new Date().toISOString();

  // 1. Append to ORDERS sheet
  const orderRow = [
    id,
    code,
    orderData.customer_id || '',
    orderData.customer_name || 'Khách lẻ',
    orderData.order_date || now,
    orderData.subtotal || 0,
    orderData.discount_amount || 0,
    orderData.vat_rate || 0,
    orderData.vat_amount || 0,
    orderData.shipping_fee || 0,
    orderData.total || 0,
    orderData.paid_amount || 0,
    orderData.debt_amount || 0,
    orderData.payment_status || 'unpaid',
    orderData.status || 'completed',
    orderData.note || '',
    orderData.created_by || 'Hệ thống',
    now,
  ];

  await appendSheetData(SPREADSHEET_ID, `${ORDERS_SHEET}!A:R`, [orderRow]);

  // 2. Append to ORDER_ITEMS sheet if items present
  if (items && items.length > 0) {
    const itemRows = items.map(it => [
      it.id || crypto.randomUUID(),
      id,
      it.product_id || '',
      it.sku || '',
      it.product_name || '',
      it.unit || 'Cái',
      it.quantity || 1,
      it.unit_price || 0,
      it.discount_amount || 0,
      it.line_total || 0,
      it.note || '',
    ]);
    await appendSheetData(SPREADSHEET_ID, `${ORDER_ITEMS_SHEET}!A:K`, itemRows);
  }

  // 3. Auto record Stock Out voucher into STOCK_MOVEMENTS
  const pxCode = code.replace('BH-', 'PX-');
  const movementRow = [
    crypto.randomUUID(),
    pxCode,
    'sale',
    'sales_invoice',
    code,
    'wh-01',
    now,
    orderData.total || 0,
    `Xuất kho cho hóa đơn bán ${code}`,
    'delivered',
    orderData.created_by || 'Hệ thống',
    now,
  ];
  await appendSheetData(SPREADSHEET_ID, `${STOCK_MOVEMENTS_SHEET}!A:L`, [movementRow]);

  // 4. Automatically deduct product stocks in PRODUCTS sheet
  if (orderData.status !== 'cancelled') {
    if (items && items.length > 0) {
      await adjustProductStockBatch(
        items.map(it => ({
          product_id: it.product_id,
          sku: it.sku,
          quantity: Number(it.quantity) || 1,
        })),
        'out'
      ).catch(err => console.error('Failed to deduct stock on create order:', err.message));
    }
  }

  return { ...orderData, id, code, items, created_at: now };
};

export const updateOrderStatus = async (id: string, newStatus: string) => {
  const orders = await getAllOrders();
  const target = orders.find(o => o.id === id);
  if (!target || !target.rowIndex) throw new Error('Order not found');

  const oldStatus = target.status;
  // Status column is O (column 15)
  await updateSheetData(SPREADSHEET_ID, `${ORDERS_SHEET}!O${target.rowIndex}:O${target.rowIndex}`, [[newStatus]]);

  if (oldStatus !== 'cancelled' && newStatus === 'cancelled' && target.items && target.items.length > 0) {
    // Rollback stock (put back) if order cancelled
    await adjustProductStockBatch(
      target.items.map(it => ({
        product_id: it.product_id,
        sku: it.sku,
        quantity: Number(it.quantity) || 1,
      })),
      'in'
    ).catch(err => console.error('Failed to return stock on cancel order:', err.message));
  } else if (oldStatus === 'cancelled' && newStatus !== 'cancelled' && target.items && target.items.length > 0) {
    // Re-deduct stock if reactivated
    await adjustProductStockBatch(
      target.items.map(it => ({
        product_id: it.product_id,
        sku: it.sku,
        quantity: Number(it.quantity) || 1,
      })),
      'out'
    ).catch(err => console.error('Failed to re-deduct stock on reactivate order:', err.message));
  }
};

export const updateOrderWithItems = async (
  id: string,
  orderData: Partial<OrderRecord>,
  items?: OrderItemRecord[]
) => {
  const orders = await getAllOrders();
  const target = orders.find(o => o.id === id);
  if (!target || !target.rowIndex) throw new Error('Order not found');

  const updatedRow = [
    target.id,
    orderData.code ?? target.code,
    orderData.customer_id ?? target.customer_id,
    orderData.customer_name ?? target.customer_name,
    orderData.order_date ?? target.order_date,
    orderData.subtotal ?? target.subtotal,
    orderData.discount_amount ?? target.discount_amount,
    orderData.vat_rate ?? target.vat_rate,
    orderData.vat_amount ?? target.vat_amount,
    orderData.shipping_fee ?? target.shipping_fee,
    orderData.total ?? target.total,
    orderData.paid_amount ?? target.paid_amount,
    orderData.debt_amount ?? target.debt_amount,
    orderData.payment_status ?? target.payment_status,
    orderData.status ?? target.status,
    orderData.note ?? target.note,
    target.created_by || 'Hệ thống',
    target.created_at,
  ];

  await updateSheetData(
    SPREADSHEET_ID,
    `${ORDERS_SHEET}!A${target.rowIndex}:R${target.rowIndex}`,
    [updatedRow]
  );

  if (items && Array.isArray(items)) {
    const rawItemRows = await getSheetData(SPREADSHEET_ID, `${ORDER_ITEMS_SHEET}!A2:K`);
    const remainingItems = rawItemRows.filter((r: any) => r[1] !== id);
    const newItems = items.map(it => [
      it.id || crypto.randomUUID(),
      id,
      it.product_id || '',
      it.sku || '',
      it.product_name || '',
      it.unit || 'Cái',
      it.quantity || 1,
      it.unit_price || 0,
      it.discount_amount || 0,
      it.line_total || 0,
      it.note || '',
    ]);
    const allItemRows = [...remainingItems, ...newItems];
    await clearSheetData(SPREADSHEET_ID, `${ORDER_ITEMS_SHEET}!A2:K`);
    if (allItemRows.length > 0) {
      await updateSheetData(SPREADSHEET_ID, `${ORDER_ITEMS_SHEET}!A2:K${allItemRows.length + 1}`, allItemRows);
    }
  }

  return { ...target, ...orderData, items: items || target.items };
};

export const deleteOrder = async (id: string) => {
  const orders = await getAllOrders();
  const target = orders.find(o => o.id === id);
  if (target && target.status !== 'cancelled' && target.items && target.items.length > 0) {
    await adjustProductStockBatch(
      target.items.map(it => ({
        product_id: it.product_id,
        sku: it.sku,
        quantity: Number(it.quantity) || 1,
      })),
      'in'
    ).catch(err => console.error('Failed to return stock on delete order:', err.message));
  }

  // 1. Remove from ORDERS
  const rawOrderRows = await getSheetData(SPREADSHEET_ID, `${ORDERS_SHEET}!A2:R`);
  const remainingOrders = rawOrderRows.filter((r: any) => r[0] !== id);
  await clearSheetData(SPREADSHEET_ID, `${ORDERS_SHEET}!A2:R`);
  if (remainingOrders.length > 0) {
    await updateSheetData(SPREADSHEET_ID, `${ORDERS_SHEET}!A2:R${remainingOrders.length + 1}`, remainingOrders);
  }

  // 2. Remove from ORDER_ITEMS
  const rawItemRows = await getSheetData(SPREADSHEET_ID, `${ORDER_ITEMS_SHEET}!A2:K`);
  const remainingItems = rawItemRows.filter((r: any) => r[1] !== id);
  await clearSheetData(SPREADSHEET_ID, `${ORDER_ITEMS_SHEET}!A2:K`);
  if (remainingItems.length > 0) {
    await updateSheetData(SPREADSHEET_ID, `${ORDER_ITEMS_SHEET}!A2:K${remainingItems.length + 1}`, remainingItems);
  }

  return { id, deleted: true };
};
