import { getSheetData, appendSheetData, updateSheetData, clearSheetData, ensureSheetExists } from '../google-sheets.js';
import crypto from 'crypto';

const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1wniDalcsynG8-H1sWokE47Woi0o9mrViDwW27di7oNY';
const RETURNS_SHEET = 'RETURNS';
const RETURN_ITEMS_SHEET = 'RETURN_ITEMS';
const STOCK_MOVEMENTS_SHEET = 'STOCK_MOVEMENTS';

const RETURN_HEADERS = [
  'id', 'code', 'type', 'return_date', 'partner_type', 'partner_id', 'partner_name',
  'reference_doc_id', 'reference_doc_code', 'warehouse_id', 'total_value',
  'handling', 'money_method', 'offset_amount', 'refund_due', 'refunded_amount',
  'reason', 'status', 'note', 'created_at'
];

const RETURN_ITEM_HEADERS = [
  'id', 'return_id', 'product_id', 'sku', 'product_name',
  'unit', 'quantity', 'unit_price', 'line_total', 'note'
];

export interface ReturnRecord {
  id: string;
  code: string;
  type: 'sales_return' | 'purchase_return';
  return_date: string;
  partner_type: 'customer' | 'supplier';
  partner_id?: string;
  partner_name: string;
  reference_doc_id?: string;
  reference_doc_code?: string;
  warehouse_id?: string;
  total_value: number;
  handling?: string;
  money_method?: string;
  offset_amount: number;
  refund_due: number;
  refunded_amount: number;
  reason?: string;
  status: string;
  note?: string;
  created_at: string;
  items?: any[];
  rowIndex?: number;
}

export const getAllReturns = async (filterType?: 'sales_return' | 'purchase_return'): Promise<ReturnRecord[]> => {
  await ensureSheetExists(SPREADSHEET_ID, RETURNS_SHEET, RETURN_HEADERS);
  await ensureSheetExists(SPREADSHEET_ID, RETURN_ITEMS_SHEET, RETURN_ITEM_HEADERS);

  const [returnRows, itemRows] = await Promise.all([
    getSheetData(SPREADSHEET_ID, `${RETURNS_SHEET}!A2:T`),
    getSheetData(SPREADSHEET_ID, `${RETURN_ITEMS_SHEET}!A2:J`),
  ]);

  const itemsByReturnId = new Map<string, any[]>();
  itemRows.forEach((row: any) => {
    const returnId = row[1];
    if (!returnId) return;
    const item = {
      id: row[0],
      return_id: returnId,
      product_id: row[2],
      sku: row[3],
      product_name: row[4],
      unit: row[5],
      quantity: Number(row[6]) || 1,
      unit_price: Number(row[7]) || 0,
      line_total: Number(row[8]) || 0,
      note: row[9] || '',
    };
    const list = itemsByReturnId.get(returnId) || [];
    list.push(item);
    itemsByReturnId.set(returnId, list);
  });

  const allRecords = returnRows.map((row: any, index: number) => {
    const id = row[0] || '';
    return {
      id,
      code: row[1] || '',
      type: (row[2] || 'sales_return') as 'sales_return' | 'purchase_return',
      return_date: row[3] || '',
      partner_type: (row[4] || 'customer') as 'customer' | 'supplier',
      partner_id: row[5] || '',
      partner_name: row[6] || 'Đối tác',
      reference_doc_id: row[7] || '',
      reference_doc_code: row[8] || '',
      warehouse_id: row[9] || 'wh-01',
      total_value: Number(row[10]) || 0,
      handling: row[11] || 'refund',
      money_method: row[12] || 'cash',
      offset_amount: Number(row[13]) || 0,
      refund_due: Number(row[14]) || 0,
      refunded_amount: Number(row[15]) || 0,
      reason: row[16] || '',
      status: row[17] || 'completed',
      note: row[18] || '',
      created_at: row[19] || '',
      items: itemsByReturnId.get(id) || [],
      rowIndex: index + 2,
    };
  });

  if (filterType) {
    return allRecords.filter((r: ReturnRecord) => r.type === filterType);
  }
  return allRecords;
};

export const createReturn = async (returnData: Partial<ReturnRecord>, items: any[]) => {
  await ensureSheetExists(SPREADSHEET_ID, RETURNS_SHEET, RETURN_HEADERS);
  await ensureSheetExists(SPREADSHEET_ID, RETURN_ITEMS_SHEET, RETURN_ITEM_HEADERS);

  const id = returnData.id || crypto.randomUUID();
  const now = new Date().toISOString();
  const dateObj = new Date();
  const ym = `${dateObj.getFullYear()}${String(dateObj.getMonth() + 1).padStart(2, '0')}`;

  const type = returnData.type || 'sales_return';
  const prefix = type === 'sales_return' ? 'TH' : 'PR';

  const currentReturns = await getAllReturns(type);
  const nextNum = currentReturns.filter(r => r.code && r.code.startsWith(`${prefix}-${ym}`)).length + 1;
  const code = returnData.code || `${prefix}-${ym}-${String(nextNum).padStart(4, '0')}`;

  const returnRow = [
    id,
    code,
    type,
    returnData.return_date || now,
    returnData.partner_type || (type === 'sales_return' ? 'customer' : 'supplier'),
    returnData.partner_id || '',
    returnData.partner_name || 'Đối tác',
    returnData.reference_doc_id || '',
    returnData.reference_doc_code || '',
    returnData.warehouse_id || 'wh-01',
    returnData.total_value || 0,
    returnData.handling || 'refund',
    returnData.money_method || 'cash',
    returnData.offset_amount || 0,
    returnData.refund_due || 0,
    returnData.refunded_amount || 0,
    returnData.reason || '',
    returnData.status || 'completed',
    returnData.note || '',
    now,
  ];

  await appendSheetData(SPREADSHEET_ID, `${RETURNS_SHEET}!A:T`, [returnRow]);

  if (items && items.length > 0) {
    const itemRows = items.map(item => [
      item.id || crypto.randomUUID(),
      id,
      item.product_id || '',
      item.sku || '',
      item.product_name || '',
      item.unit || 'Cái',
      item.quantity || 1,
      item.unit_price || 0,
      item.line_total || ((item.quantity || 1) * (item.unit_price || 0)),
      item.note || '',
    ]);
    await appendSheetData(SPREADSHEET_ID, `${RETURN_ITEMS_SHEET}!A:J`, itemRows);
  }

  // Auto record stock movement into STOCK_MOVEMENTS
  const movementRow = [
    crypto.randomUUID(),
    code,
    type === 'sales_return' ? 'sales_return' : 'purchase_return',
    type === 'sales_return' ? 'sales_return' : 'purchase_return',
    returnData.reference_doc_code || code,
    returnData.warehouse_id || 'wh-01',
    returnData.return_date || now,
    returnData.total_value || 0,
    `${type === 'sales_return' ? 'Nhập hàng khách trả' : 'Xuất trả hàng NCC'} ${code}`,
    'delivered',
    'Hệ thống',
    now,
  ];
  await appendSheetData(SPREADSHEET_ID, `${STOCK_MOVEMENTS_SHEET}!A:L`, [movementRow]);

  return { ...returnData, id, code, items, created_at: now };
};

export const updateReturnStatus = async (id: string, status: string) => {
  const all = await getAllReturns();
  const target = all.find(r => r.id === id);
  if (!target || !target.rowIndex) throw new Error('Return record not found');

  const range = `${RETURNS_SHEET}!R${target.rowIndex}`;
  await updateSheetData(SPREADSHEET_ID, range, [[status]]);
  return { id, status };
};

export const updateReturnWithItems = async (
  id: string,
  returnData: Partial<ReturnRecord>,
  items?: any[]
) => {
  const all = await getAllReturns();
  const target = all.find(r => r.id === id);
  if (!target || !target.rowIndex) throw new Error('Return record not found');

  const updatedRow = [
    target.id,
    returnData.code ?? target.code,
    returnData.type ?? target.type,
    returnData.return_date ?? target.return_date,
    returnData.partner_type ?? target.partner_type,
    returnData.partner_id ?? target.partner_id,
    returnData.partner_name ?? target.partner_name,
    returnData.reference_doc_id ?? target.reference_doc_id,
    returnData.reference_doc_code ?? target.reference_doc_code,
    returnData.warehouse_id ?? target.warehouse_id,
    returnData.total_value ?? target.total_value,
    returnData.handling ?? target.handling,
    returnData.money_method ?? target.money_method,
    returnData.offset_amount ?? target.offset_amount,
    returnData.refund_due ?? target.refund_due,
    returnData.refunded_amount ?? target.refunded_amount,
    returnData.reason ?? target.reason,
    returnData.status ?? target.status,
    returnData.note ?? target.note,
    target.created_at,
  ];

  await updateSheetData(
    SPREADSHEET_ID,
    `${RETURNS_SHEET}!A${target.rowIndex}:T${target.rowIndex}`,
    [updatedRow]
  );

  if (items && Array.isArray(items)) {
    const rawItemRows = await getSheetData(SPREADSHEET_ID, `${RETURN_ITEMS_SHEET}!A2:J`);
    const remainingItems = rawItemRows.filter((r: any) => r[1] !== id);
    const newItems = items.map(item => [
      item.id || crypto.randomUUID(),
      id,
      item.product_id || '',
      item.sku || '',
      item.product_name || '',
      item.unit || 'Cái',
      item.quantity || 1,
      item.unit_price || 0,
      item.line_total || ((item.quantity || 1) * (item.unit_price || 0)),
      item.note || '',
    ]);
    const allItemRows = [...remainingItems, ...newItems];
    await clearSheetData(SPREADSHEET_ID, `${RETURN_ITEMS_SHEET}!A2:J`);
    if (allItemRows.length > 0) {
      await updateSheetData(SPREADSHEET_ID, `${RETURN_ITEMS_SHEET}!A2:J${allItemRows.length + 1}`, allItemRows);
    }
  }

  return { ...target, ...returnData, items: items || target.items };
};

export const deleteReturn = async (id: string) => {
  // 1. Remove from RETURNS
  const rawRows = await getSheetData(SPREADSHEET_ID, `${RETURNS_SHEET}!A2:T`);
  const remaining = rawRows.filter((r: any) => r[0] !== id);
  await clearSheetData(SPREADSHEET_ID, `${RETURNS_SHEET}!A2:T`);
  if (remaining.length > 0) {
    await updateSheetData(SPREADSHEET_ID, `${RETURNS_SHEET}!A2:T${remaining.length + 1}`, remaining);
  }

  // 2. Remove from RETURN_ITEMS
  const rawItemRows = await getSheetData(SPREADSHEET_ID, `${RETURN_ITEMS_SHEET}!A2:J`);
  const remainingItems = rawItemRows.filter((r: any) => r[1] !== id);
  await clearSheetData(SPREADSHEET_ID, `${RETURN_ITEMS_SHEET}!A2:J`);
  if (remainingItems.length > 0) {
    await updateSheetData(SPREADSHEET_ID, `${RETURN_ITEMS_SHEET}!A2:J${remainingItems.length + 1}`, remainingItems);
  }

  return { id, deleted: true };
};
