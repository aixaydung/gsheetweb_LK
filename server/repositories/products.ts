import crypto from 'crypto';
import { getSheetData, appendSheetData, updateSheetData } from '../google-sheets.js';

const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1wniDalcsynG8-H1sWokE47Woi0o9mrViDwW27di7oNY';
const SHEET_NAME = 'PRODUCTS';

export interface ProductRecord {
  id: string;
  sku: string;
  name: string;
  unit: string;
  cost_price: number;
  selling_price: number;
  stock_quantity: number;
  min_stock: number;
  max_stock: number;
  group_id: string;
  barcode: string;
  description: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  rowIndex: number;
}

export const getAllProducts = async (): Promise<ProductRecord[]> => {
  const rows = await getSheetData(SPREADSHEET_ID, `${SHEET_NAME}!A2:O`);
  return rows.map((row: any, index: number) => ({
    id: row[0] || '',
    sku: row[1] || '',
    name: row[2] || '',
    unit: row[3] || 'Cái',
    cost_price: Number(row[4]) || 0,
    selling_price: Number(row[5]) || 0,
    stock_quantity: Number(row[6]) || 0,
    min_stock: Number(row[7]) || 0,
    max_stock: Number(row[8]) || 0,
    group_id: row[9] || 'GRP_GENERAL',
    barcode: row[10] || '',
    description: row[11] || '',
    status: (row[12] as any) || 'active',
    created_at: row[13] || '',
    updated_at: row[14] || '',
    rowIndex: index + 2,
  }));
};

export const createProduct = async (data: Partial<ProductRecord>) => {
  const id = data.id || crypto.randomUUID();
  const existing = await getAllProducts();
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
  const existing = await getAllProducts();
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
  const products = await getAllProducts();
  const target = products.find(p => p.id === id);
  if (!target) throw new Error(`Product with ID ${id} not found`);

  const now = new Date().toISOString();
  const updatedRow = [
    target.id,
    data.sku ?? target.sku,
    data.name ?? target.name,
    data.unit ?? target.unit,
    data.cost_price ?? target.cost_price,
    data.selling_price ?? target.selling_price,
    data.stock_quantity ?? target.stock_quantity,
    data.min_stock ?? target.min_stock,
    data.max_stock ?? target.max_stock,
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

export const deleteProduct = async (id: string) => {
  return updateProduct(id, { status: 'inactive' });
};
