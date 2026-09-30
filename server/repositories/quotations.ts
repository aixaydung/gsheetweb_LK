import { getSheetData, appendSheetData, updateSheetData, clearSheetData, ensureSheetExists } from '../google-sheets.js';
import crypto from 'crypto';

const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1wniDalcsynG8-H1sWokE47Woi0o9mrViDwW27di7oNY';
const QUOTATIONS_SHEET = 'QUOTATIONS';
const QUOTATION_ITEMS_SHEET = 'QUOTATION_ITEMS';

const QUOTATION_HEADERS = [
  'id', 'code', 'customer_id', 'customer_name', 'customer_phone',
  'quote_date', 'expires_at', 'subtotal', 'discount_type', 'discount_value',
  'discount_amount', 'vat_rate', 'vat_amount', 'shipping_fee', 'total',
  'status', 'converted_invoice_id', 'note', 'created_at'
];

const QUOTATION_ITEM_HEADERS = [
  'id', 'quotation_id', 'product_id', 'sku', 'product_name',
  'unit', 'quantity', 'unit_price', 'discount_amount', 'line_total', 'note'
];

export interface QuotationRecord {
  id: string;
  code: string;
  customer_id?: string;
  customer_name: string;
  customer_phone?: string;
  quote_date: string;
  expires_at?: string;
  subtotal: number;
  discount_type?: string;
  discount_value?: number;
  discount_amount: number;
  vat_rate: number;
  vat_amount: number;
  shipping_fee: number;
  total: number;
  status: string;
  converted_invoice_id?: string;
  note?: string;
  created_at: string;
  items?: any[];
  rowIndex?: number;
}

export const getAllQuotations = async (): Promise<QuotationRecord[]> => {
  await ensureSheetExists(SPREADSHEET_ID, QUOTATIONS_SHEET, QUOTATION_HEADERS);
  await ensureSheetExists(SPREADSHEET_ID, QUOTATION_ITEMS_SHEET, QUOTATION_ITEM_HEADERS);

  const [quoteRows, itemRows] = await Promise.all([
    getSheetData(SPREADSHEET_ID, `${QUOTATIONS_SHEET}!A2:S`),
    getSheetData(SPREADSHEET_ID, `${QUOTATION_ITEMS_SHEET}!A2:K`),
  ]);

  const itemsByQuoteId = new Map<string, any[]>();
  itemRows.forEach((row: any) => {
    const quoteId = row[1];
    if (!quoteId) return;
    const item = {
      id: row[0],
      quotation_id: quoteId,
      product_id: row[2],
      sku: row[3],
      product_name: row[4],
      unit: row[5],
      quantity: Number(row[6]) || 1,
      unit_price: Number(row[7]) || 0,
      discount_amount: Number(row[8]) || 0,
      line_total: Number(row[9]) || 0,
      note: row[10] || '',
    };
    const list = itemsByQuoteId.get(quoteId) || [];
    list.push(item);
    itemsByQuoteId.set(quoteId, list);
  });

  return quoteRows.map((row: any, index: number) => {
    const id = row[0] || '';
    return {
      id,
      code: row[1] || '',
      customer_id: row[2] || '',
      customer_name: row[3] || 'Khách hàng',
      customer_phone: row[4] || '',
      quote_date: row[5] || '',
      expires_at: row[6] || '',
      subtotal: Number(row[7]) || 0,
      discount_type: row[8] || 'amount',
      discount_value: Number(row[9]) || 0,
      discount_amount: Number(row[10]) || 0,
      vat_rate: Number(row[11]) || 0,
      vat_amount: Number(row[12]) || 0,
      shipping_fee: Number(row[13]) || 0,
      total: Number(row[14]) || 0,
      status: row[15] || 'new',
      converted_invoice_id: row[16] || '',
      note: row[17] || '',
      created_at: row[18] || '',
      items: itemsByQuoteId.get(id) || [],
      rowIndex: index + 2,
    };
  });
};

export const createQuotation = async (quoteData: Partial<QuotationRecord>, items: any[]) => {
  await ensureSheetExists(SPREADSHEET_ID, QUOTATIONS_SHEET, QUOTATION_HEADERS);
  await ensureSheetExists(SPREADSHEET_ID, QUOTATION_ITEMS_SHEET, QUOTATION_ITEM_HEADERS);

  const id = quoteData.id || crypto.randomUUID();
  const now = new Date().toISOString();
  const dateObj = new Date();
  const ym = `${dateObj.getFullYear()}${String(dateObj.getMonth() + 1).padStart(2, '0')}`;

  const currentQuotes = await getAllQuotations();
  const nextNum = currentQuotes.filter(q => q.code && q.code.startsWith(`BG-${ym}`)).length + 1;
  const code = quoteData.code || `BG-${ym}-${String(nextNum).padStart(4, '0')}`;

  const quoteRow = [
    id,
    code,
    quoteData.customer_id || '',
    quoteData.customer_name || 'Khách hàng',
    quoteData.customer_phone || '',
    quoteData.quote_date || now,
    quoteData.expires_at || '',
    quoteData.subtotal || 0,
    quoteData.discount_type || 'amount',
    quoteData.discount_value || 0,
    quoteData.discount_amount || 0,
    quoteData.vat_rate || 0,
    quoteData.vat_amount || 0,
    quoteData.shipping_fee || 0,
    quoteData.total || 0,
    quoteData.status || 'new',
    quoteData.converted_invoice_id || '',
    quoteData.note || '',
    now,
  ];

  await appendSheetData(SPREADSHEET_ID, `${QUOTATIONS_SHEET}!A:S`, [quoteRow]);

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
      item.discount_amount || 0,
      item.line_total || ((item.quantity || 1) * (item.unit_price || 0)),
      item.note || '',
    ]);
    await appendSheetData(SPREADSHEET_ID, `${QUOTATION_ITEMS_SHEET}!A:K`, itemRows);
  }

  return { ...quoteData, id, code, items, created_at: now };
};

export const updateQuotationStatus = async (
  id: string,
  status?: string,
  convertedInvoiceId?: string,
  note?: string
) => {
  const quotes = await getAllQuotations();
  const target = quotes.find(q => q.id === id);
  if (!target || !target.rowIndex) throw new Error('Quotation not found');

  const newStatus = status !== undefined ? status : (target.status || 'new');
  const newConvertedId = convertedInvoiceId !== undefined ? convertedInvoiceId : (target.converted_invoice_id || '');
  const newNote = note !== undefined ? note : (target.note || '');

  // P: status, Q: converted_invoice_id, R: note
  const range = `${QUOTATIONS_SHEET}!P${target.rowIndex}:R${target.rowIndex}`;
  await updateSheetData(SPREADSHEET_ID, range, [[newStatus, newConvertedId, newNote]]);
  return { id, status: newStatus, converted_invoice_id: newConvertedId, note: newNote };
};

export const updateQuotationWithItems = async (
  id: string,
  quoteData: Partial<QuotationRecord>,
  items?: any[]
) => {
  const quotes = await getAllQuotations();
  const target = quotes.find(q => q.id === id);
  if (!target || !target.rowIndex) throw new Error('Quotation not found');

  const updatedRow = [
    target.id,
    quoteData.code ?? target.code,
    quoteData.customer_id ?? target.customer_id,
    quoteData.customer_name ?? target.customer_name,
    quoteData.customer_phone ?? target.customer_phone,
    quoteData.quote_date ?? target.quote_date,
    quoteData.expires_at ?? target.expires_at,
    quoteData.subtotal ?? target.subtotal,
    quoteData.discount_type ?? target.discount_type,
    quoteData.discount_value ?? target.discount_value,
    quoteData.discount_amount ?? target.discount_amount,
    quoteData.vat_rate ?? target.vat_rate,
    quoteData.vat_amount ?? target.vat_amount,
    quoteData.shipping_fee ?? target.shipping_fee,
    quoteData.total ?? target.total,
    quoteData.status ?? target.status,
    quoteData.converted_invoice_id ?? target.converted_invoice_id,
    quoteData.note ?? target.note,
    target.created_at,
  ];

  await updateSheetData(
    SPREADSHEET_ID,
    `${QUOTATIONS_SHEET}!A${target.rowIndex}:S${target.rowIndex}`,
    [updatedRow]
  );

  if (items && Array.isArray(items)) {
    const rawItemRows = await getSheetData(SPREADSHEET_ID, `${QUOTATION_ITEMS_SHEET}!A2:K`);
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
      item.discount_amount || 0,
      item.line_total || ((item.quantity || 1) * (item.unit_price || 0)),
      item.note || '',
    ]);
    const allItemRows = [...remainingItems, ...newItems];
    await clearSheetData(SPREADSHEET_ID, `${QUOTATION_ITEMS_SHEET}!A2:K`);
    if (allItemRows.length > 0) {
      await updateSheetData(SPREADSHEET_ID, `${QUOTATION_ITEMS_SHEET}!A2:K${allItemRows.length + 1}`, allItemRows);
    }
  }

  return { ...target, ...quoteData, items: items || target.items };
};

export const deleteQuotation = async (id: string) => {
  // 1. Remove from QUOTATIONS
  const rawRows = await getSheetData(SPREADSHEET_ID, `${QUOTATIONS_SHEET}!A2:S`);
  const remaining = rawRows.filter((r: any) => r[0] !== id);
  await clearSheetData(SPREADSHEET_ID, `${QUOTATIONS_SHEET}!A2:S`);
  if (remaining.length > 0) {
    await updateSheetData(SPREADSHEET_ID, `${QUOTATIONS_SHEET}!A2:S${remaining.length + 1}`, remaining);
  }

  // 2. Remove from QUOTATION_ITEMS
  const rawItemRows = await getSheetData(SPREADSHEET_ID, `${QUOTATION_ITEMS_SHEET}!A2:K`);
  const remainingItems = rawItemRows.filter((r: any) => r[1] !== id);
  await clearSheetData(SPREADSHEET_ID, `${QUOTATION_ITEMS_SHEET}!A2:K`);
  if (remainingItems.length > 0) {
    await updateSheetData(SPREADSHEET_ID, `${QUOTATION_ITEMS_SHEET}!A2:K${remainingItems.length + 1}`, remainingItems);
  }

  return { id, deleted: true };
};
