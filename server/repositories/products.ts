import crypto from 'crypto';
import { getSheetData, appendSheetData, updateSheetData, clearSheetData } from '../google-sheets.js';

const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1wniDalcsynG8-H1sWokE47Woi0o9mrViDwW27di7oNY';
const SHEET_NAME = 'PRODUCTS';

export interface ProductRecord {
  id: string;
  sku: string;
  name: string;
  unit: string;
  cost_price: number;
  selling_price: number;
  sale_price?: number;
  stock_quantity: number;
  min_stock: number;
  max_stock: number;
  group_id: string;
  barcode: string;
  description: string;
  status: 'active' | 'inactive';
  stock_level?: 'out' | 'low' | 'ok' | 'over';
  stock_value?: number;
  created_at: string;
  updated_at: string;
  rowIndex: number;
}

export const getAllProducts = async (includeInactive = false): Promise<ProductRecord[]> => {
  const rows = await getSheetData(SPREADSHEET_ID, `${SHEET_NAME}!A2:O`);
  const list = rows.map((row: any, index: number) => {
    const cost_price = Number(row[4]) || 0;
    const selling_price = Number(row[5]) || 0;
    const stock_quantity = Number(row[6]) || 0;
    const min_stock = Number(row[7]) || 5;
    const max_stock = Number(row[8]) || 1000;

    let stock_level: 'out' | 'low' | 'ok' | 'over' = 'ok';
    if (stock_quantity <= 0) stock_level = 'out';
    else if (stock_quantity <= min_stock) stock_level = 'low';
    else if (max_stock && stock_quantity > max_stock) stock_level = 'over';

    return {
      id: row[0] || '',
      sku: row[1] || '',
      name: row[2] || '',
      unit: row[3] || 'Cái',
      cost_price,
      selling_price,
      sale_price: selling_price,
      stock_quantity,
      min_stock,
      max_stock,
      group_id: row[9] || 'GRP_GENERAL',
      barcode: row[10] || '',
      description: row[11] || '',
      status: (row[12] as any) || 'active',
      stock_level,
      stock_value: stock_quantity * cost_price,
      created_at: row[13] || '',
      updated_at: row[14] || '',
      rowIndex: index + 2,
    };
  });
  if (includeInactive) return list;
  return list.filter((p: any) => p.status !== 'inactive');
};

export const createProduct = async (data: Partial<ProductRecord>) => {
  const id = data.id || crypto.randomUUID();
  const existing = await getAllProducts(true);
  const nextNum = existing.length + 1;
  const sku = data.sku || `SP-${String(nextNum).padStart(4, '0')}`;
  const now = new Date().toISOString();

  const row = [
    id,
    sku,
    data.name || '',
    data.unit || 'Cái',
    data.cost_price || 0,
    data.selling_price || 0,
    data.stock_quantity || 0,
    data.min_stock || 5,
    data.max_stock || 1000,
    data.group_id || 'GRP_GENERAL',
    data.barcode || '',
    data.description || '',
    data.status || 'active',
    now,
    now,
  ];

  await appendSheetData(SPREADSHEET_ID, `${SHEET_NAME}!A:O`, [row]);
  return { ...data, id, sku, created_at: now, updated_at: now };
};

export const createProductsBatch = async (items: Partial<ProductRecord>[]) => {
  const existing = await getAllProducts(true);
  let nextNum = existing.length + 1;
  const now = new Date().toISOString();
  const created: any[] = [];
  const rows: any[][] = [];

  for (const data of items) {
    const id = data.id || crypto.randomUUID();
    const sku = data.sku || `SP-${String(nextNum++).padStart(4, '0')}`;
    const row = [
      id,
      sku,
      data.name || '',
      data.unit || 'Cái',
      Number(data.cost_price) || 0,
      Number(data.selling_price) || 0,
      Number(data.stock_quantity) || 0,
      Number(data.min_stock) || 5,
      Number(data.max_stock) || 1000,
      data.group_id || 'GRP_GENERAL',
      data.barcode || '',
      data.description || '',
      data.status || 'active',
      now,
      now,
    ];
    rows.push(row);
    created.push({ ...data, id, sku, created_at: now, updated_at: now });
  }

  if (rows.length > 0) {
    await appendSheetData(SPREADSHEET_ID, `${SHEET_NAME}!A:O`, rows);
  }
  return created;
};

export const updateProduct = async (id: string, data: Partial<ProductRecord>) => {
  const products = await getAllProducts(true);
  const target = products.find(p => p.id === id);
  if (!target) throw new Error(`Product with ID ${id} not found`);

  const now = new Date().toISOString();
  const updatedRow = [
    target.id,
    data.sku ?? target.sku,
    data.name ?? target.name,
    data.unit ?? target.unit,
    data.cost_price !== undefined ? Number(data.cost_price) : target.cost_price,
    data.selling_price !== undefined ? Number(data.selling_price) : (data.sale_price !== undefined ? Number(data.sale_price) : target.selling_price),
    data.stock_quantity !== undefined ? Number(data.stock_quantity) : target.stock_quantity,
    data.min_stock !== undefined ? Number(data.min_stock) : target.min_stock,
    data.max_stock !== undefined ? Number(data.max_stock) : target.max_stock,
    data.group_id ?? target.group_id,
    data.barcode ?? target.barcode,
    data.description ?? target.description,
    data.status ?? target.status,
    target.created_at,
    now,
  ];

  await updateSheetData(SPREADSHEET_ID, `${SHEET_NAME}!A${target.rowIndex}:O${target.rowIndex}`, [updatedRow]);
  return { ...target, ...data, updated_at: now };
};

export interface StockAdjustmentItem {
  product_id?: string;
  sku?: string;
  quantity: number;
  unit_price?: number;
}

export const adjustProductStockBatch = async (
  items: StockAdjustmentItem[],
  mode: 'in' | 'out'
) => {
  if (!items || items.length === 0) return;
  const products = await getAllProducts(true);

  for (const item of items) {
    const qty = Number(item.quantity) || 0;
    if (qty <= 0) continue;

    const prod = products.find(
      p => (item.product_id && p.id === item.product_id) || (item.sku && p.sku === item.sku)
    );
    if (!prod) continue;

    const currentQty = Math.max(0, prod.stock_quantity || 0);
    const unitPrice = item.unit_price !== undefined ? Number(item.unit_price) : undefined;

    let newQty = currentQty;
    let newCost = prod.cost_price;

    if (mode === 'in') {
      newQty = currentQty + qty;
      if (unitPrice !== undefined && unitPrice >= 0) {
        newCost =
          newQty > 0
            ? Math.round((currentQty * prod.cost_price + qty * unitPrice) / newQty)
            : unitPrice;
      }
    } else {
      // mode === 'out'
      newQty = Math.max(0, currentQty - qty);
    }

    // Update in-memory for subsequent items in the same batch
    prod.stock_quantity = newQty;
    prod.cost_price = newCost;

    await updateProduct(prod.id, {
      stock_quantity: newQty,
      cost_price: newCost,
    }).catch(err => {
      console.error(`Failed to adjust stock for ${prod.sku}:`, err.message);
    });
  }
};

export const deleteProduct = async (id: string, hard = false) => {
  if (hard) {
    const rawRows = await getSheetData(SPREADSHEET_ID, `${SHEET_NAME}!A2:O`);
    const remaining = rawRows.filter((r: any) => r[0] !== id);
    await clearSheetData(SPREADSHEET_ID, `${SHEET_NAME}!A2:O`);
    if (remaining.length > 0) {
      await updateSheetData(SPREADSHEET_ID, `${SHEET_NAME}!A2:O${remaining.length + 1}`, remaining);
    }
    return { id, deleted: true, hard: true };
  }
  return updateProduct(id, { status: 'inactive' });
};
