import crypto from 'crypto';
import { getSheetData, appendSheetData, updateSheetData, clearSheetData } from '../google-sheets.js';

const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1wniDalcsynG8-H1sWokE47Woi0o9mrViDwW27di7oNY';
const PO_SHEET = 'PURCHASE_ORDERS';
const PO_ITEMS_SHEET = 'PURCHASE_ORDER_ITEMS';
const STOCK_MOVEMENTS_SHEET = 'STOCK_MOVEMENTS';

export interface PurchaseOrderItemRecord {
  id: string;
  po_id: string;
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

export interface PurchaseOrderRecord {
  id: string;
  code: string;
  supplier_id: string;
  supplier_name: string;
  order_date: string;
  expected_date?: string;
  subtotal: number;
  discount_amount: number;
  vat_rate: number;
  vat_amount: number;
  shipping_fee: number;
  total: number;
  paid_amount: number;
  debt_amount: number;
  payment_status: 'unpaid' | 'partial' | 'paid' | 'overpaid';
  status: 'ordered' | 'received' | 'partially_returned' | 'cancelled';
  note?: string;
  created_by?: string;
  created_at: string;
  items?: PurchaseOrderItemRecord[];
  rowIndex?: number;
}

export const getAllPurchases = async (): Promise<PurchaseOrderRecord[]> => {
  const [poRows, itemRows] = await Promise.all([
    getSheetData(SPREADSHEET_ID, `${PO_SHEET}!A2:S`),
    getSheetData(SPREADSHEET_ID, `${PO_ITEMS_SHEET}!A2:K`),
  ]);

  const itemsByPoId = new Map<string, PurchaseOrderItemRecord[]>();
  for (const row of itemRows) {
    const poId = row[1] || '';
    if (!poId) continue;
    const item: PurchaseOrderItemRecord = {
      id: row[0] || '',
      po_id: poId,
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
    if (!itemsByPoId.has(poId)) {
      itemsByPoId.set(poId, []);
    }
    itemsByPoId.get(poId)!.push(item);
  }

  return poRows.map((row: any, index: number) => {
    const id = row[0] || '';
    return {
      id,
      code: row[1] || '',
      supplier_id: row[2] || '',
      supplier_name: row[3] || '',
      order_date: row[4] || '',
      expected_date: row[5] || '',
      subtotal: Number(row[6]) || 0,
      discount_amount: Number(row[7]) || 0,
      vat_rate: Number(row[8]) || 0,
      vat_amount: Number(row[9]) || 0,
      shipping_fee: Number(row[10]) || 0,
      total: Number(row[11]) || 0,
      paid_amount: Number(row[12]) || 0,
      debt_amount: Number(row[13]) || 0,
      payment_status: (row[14] as any) || 'unpaid',
      status: (row[15] as any) || 'received',
      note: row[16] || '',
      created_by: row[17] || '',
      created_at: row[18] || '',
      items: itemsByPoId.get(id) || [],
      rowIndex: index + 2,
    };
  });
};

export const generatePurchaseCode = async (): Promise<string> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const ym = `${year}${month}`;
  
  const purchases = await getAllPurchases();
  const currentMonthPurchases = purchases.filter(p => p.code && p.code.startsWith(`MH-${ym}`));
  const nextNum = currentMonthPurchases.length + 1;
  return `MH-${ym}-${String(nextNum).padStart(4, '0')}`;
};

export const createPurchaseWithItems = async (poData: Partial<PurchaseOrderRecord>, items: PurchaseOrderItemRecord[] = []) => {
  const id = poData.id || crypto.randomUUID();
  const code = poData.code || (await generatePurchaseCode());
  const now = new Date().toISOString();

  // 1. Append to PURCHASE_ORDERS sheet (A:S)
  const poRow = [
    id,
    code,
    poData.supplier_id || '',
    poData.supplier_name || 'Nhà cung cấp',
    poData.order_date || now,
    poData.expected_date || '',
    poData.subtotal || 0,
    poData.discount_amount || 0,
    poData.vat_rate || 0,
    poData.vat_amount || 0,
    poData.shipping_fee || 0,
    poData.total || 0,
    poData.paid_amount || 0,
    poData.debt_amount || 0,
    poData.payment_status || 'unpaid',
    poData.status || 'received',
    poData.note || '',
    poData.created_by || 'Hệ thống',
    now,
  ];

  await appendSheetData(SPREADSHEET_ID, `${PO_SHEET}!A:S`, [poRow]);

  // 2. Append to PURCHASE_ORDER_ITEMS sheet if items present (A:K)
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
    await appendSheetData(SPREADSHEET_ID, `${PO_ITEMS_SHEET}!A:K`, itemRows);
  }

  // 3. Auto record Stock In voucher into STOCK_MOVEMENTS if received
  if (poData.status !== 'cancelled') {
    const pnCode = code.replace('MH-', 'PN-');
    const movementRow = [
      crypto.randomUUID(),
      pnCode,
      'purchase',
      'purchase_order',
      code,
      'wh-01',
      now,
      poData.total || 0,
      `Nhập kho từ đơn mua ${code}`,
      'received',
      poData.created_by || 'Hệ thống',
      now,
    ];
    await appendSheetData(SPREADSHEET_ID, `${STOCK_MOVEMENTS_SHEET}!A:L`, [movementRow]);
  }

  return { ...poData, id, code, items, created_at: now };
};

export const updatePurchaseStatus = async (id: string, newStatus: string) => {
  const purchases = await getAllPurchases();
  const target = purchases.find(p => p.id === id);
  if (!target || !target.rowIndex) throw new Error('Purchase order not found');

  // Status column is P (column 16)
  await updateSheetData(SPREADSHEET_ID, `${PO_SHEET}!P${target.rowIndex}:P${target.rowIndex}`, [[newStatus]]);
};

export const updatePurchaseWithItems = async (
  id: string,
  poData: Partial<PurchaseOrderRecord>,
  items?: PurchaseOrderItemRecord[]
) => {
  const purchases = await getAllPurchases();
  const target = purchases.find(p => p.id === id);
  if (!target || !target.rowIndex) throw new Error('Purchase order not found');

  const updatedRow = [
    target.id,
    poData.code ?? target.code,
    poData.supplier_id ?? target.supplier_id,
    poData.supplier_name ?? target.supplier_name,
    poData.order_date ?? target.order_date,
    poData.expected_date ?? target.expected_date,
    poData.subtotal ?? target.subtotal,
    poData.discount_amount ?? target.discount_amount,
    poData.vat_rate ?? target.vat_rate,
    poData.vat_amount ?? target.vat_amount,
    poData.shipping_fee ?? target.shipping_fee,
    poData.total ?? target.total,
    poData.paid_amount ?? target.paid_amount,
    poData.debt_amount ?? target.debt_amount,
    poData.payment_status ?? target.payment_status,
    poData.status ?? target.status,
    poData.note ?? target.note,
    target.created_by || 'Hệ thống',
    target.created_at,
  ];

  await updateSheetData(
    SPREADSHEET_ID,
    `${PO_SHEET}!A${target.rowIndex}:S${target.rowIndex}`,
    [updatedRow]
  );

  if (items && Array.isArray(items)) {
    const rawItemRows = await getSheetData(SPREADSHEET_ID, `${PO_ITEMS_SHEET}!A2:K`);
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
    await clearSheetData(SPREADSHEET_ID, `${PO_ITEMS_SHEET}!A2:K`);
    if (allItemRows.length > 0) {
      await updateSheetData(SPREADSHEET_ID, `${PO_ITEMS_SHEET}!A2:K${allItemRows.length + 1}`, allItemRows);
    }
  }

  return { ...target, ...poData, items: items || target.items };
};

export const deletePurchase = async (id: string) => {
  // 1. Remove from PURCHASE_ORDERS
  const rawRows = await getSheetData(SPREADSHEET_ID, `${PO_SHEET}!A2:S`);
  const remaining = rawRows.filter((r: any) => r[0] !== id);
  await clearSheetData(SPREADSHEET_ID, `${PO_SHEET}!A2:S`);
  if (remaining.length > 0) {
    await updateSheetData(SPREADSHEET_ID, `${PO_SHEET}!A2:S${remaining.length + 1}`, remaining);
  }

  // 2. Remove from PURCHASE_ORDER_ITEMS
  const rawItemRows = await getSheetData(SPREADSHEET_ID, `${PO_ITEMS_SHEET}!A2:K`);
  const remainingItems = rawItemRows.filter((r: any) => r[1] !== id);
  await clearSheetData(SPREADSHEET_ID, `${PO_ITEMS_SHEET}!A2:K`);
  if (remainingItems.length > 0) {
    await updateSheetData(SPREADSHEET_ID, `${PO_ITEMS_SHEET}!A2:K${remainingItems.length + 1}`, remainingItems);
  }

  return { id, deleted: true };
};
