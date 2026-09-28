import crypto from 'crypto';
import { getSheetData, appendSheetData, updateSheetData } from '../google-sheets.js';
import { updateProduct, getAllProducts } from './products.js';

const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1wniDalcsynG8-H1sWokE47Woi0o9mrViDwW27di7oNY';
const STOCKTAKES_SHEET = 'STOCKTAKES';
const STOCKTAKE_ITEMS_SHEET = 'STOCKTAKE_ITEMS';
const STOCK_MOVEMENTS_SHEET = 'STOCK_MOVEMENTS';

export interface StocktakeItemRecord {
  id?: string;
  stocktake_id?: string;
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

export interface StocktakeRecord {
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
  status: 'draft' | 'completed' | 'cancelled';
  note?: string;
  created_by?: string;
  created_at: string;
  items?: StocktakeItemRecord[];
  rowIndex?: number;
}

export const getAllStocktakes = async (): Promise<StocktakeRecord[]> => {
  const rows = await getSheetData(SPREADSHEET_ID, `${STOCKTAKES_SHEET}!A2:N`);
  return rows.map((row: any, index: number) => ({
    id: row[0] || '',
    code: row[1] || '',
    stocktake_date: row[2] || '',
    warehouse_id: row[3] || 'wh-01',
    warehouse_name: row[4] || 'Kho Tổng TP.HCM',
    counted_by: row[5] || 'Thủ kho',
    item_count: Number(row[6]) || 0,
    increase_count: Number(row[7]) || 0,
    decrease_count: Number(row[8]) || 0,
    diff_value: Number(row[9]) || 0,
    status: (row[10] as any) || 'completed',
    note: row[11] || '',
    created_by: row[12] || '',
    created_at: row[13] || '',
    items: [],
    rowIndex: index + 2,
  }));
};

export const generateStocktakeCode = async (): Promise<string> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const ym = `${year}${month}`;

  const stocktakes = await getAllStocktakes();
  const currentMonthStocktakes = stocktakes.filter(s => s.code && s.code.startsWith(`KK-${ym}`));
  const nextNum = currentMonthStocktakes.length + 1;
  return `KK-${ym}-${String(nextNum).padStart(4, '0')}`;
};

export const createStocktakeWithItems = async (data: Partial<StocktakeRecord>, items: StocktakeItemRecord[] = []) => {
  const id = data.id || crypto.randomUUID();
  const code = data.code || (await generateStocktakeCode());
  const now = new Date().toISOString();

  const increaseCount = items.filter(it => it.diff_qty > 0).length;
  const decreaseCount = items.filter(it => it.diff_qty < 0).length;
  const diffValue = items.reduce((sum, it) => sum + (it.diff_value || 0), 0);

  // 1. Append to STOCKTAKES sheet
  const masterRow = [
    id,
    code,
    data.stocktake_date || now,
    data.warehouse_id || 'wh-01',
    data.warehouse_name || 'Kho Tổng TP.HCM',
    data.counted_by || 'Thủ kho',
    items.length,
    increaseCount,
    decreaseCount,
    diffValue,
    data.status || 'completed',
    data.note || '',
    data.created_by || 'Hệ thống',
    now,
  ];

  await appendSheetData(SPREADSHEET_ID, `${STOCKTAKES_SHEET}!A:N`, [masterRow]);

  // 2. Append to STOCKTAKE_ITEMS sheet
  if (items && items.length > 0) {
    const itemRows = items.map(it => [
      it.id || crypto.randomUUID(),
      id,
      it.product_id || '',
      it.sku || '',
      it.product_name || '',
      it.unit || 'Cái',
      it.system_qty || 0,
      it.actual_qty || 0,
      it.diff_qty || 0,
      it.unit_cost || 0,
      it.diff_value || 0,
      it.reason || '',
    ]);
    await appendSheetData(SPREADSHEET_ID, `${STOCKTAKE_ITEMS_SHEET}!A:L`, itemRows);
  }

  // 3. If completed, create stock movement entry and update product stocks
  if (data.status === 'completed' || !data.status) {
    const movementRow = [
      crypto.randomUUID(),
      `PKK-${code}`,
      'stocktake',
      'stocktake',
      code,
      data.warehouse_id || 'wh-01',
      now,
      Math.abs(diffValue),
      `Cân chỉnh kho theo phiếu kiểm kê ${code}`,
      'delivered',
      data.created_by || 'Hệ thống',
      now,
    ];
    await appendSheetData(SPREADSHEET_ID, `${STOCK_MOVEMENTS_SHEET}!A:L`, [movementRow]);

    // Update actual stocks in PRODUCTS tab
    const products = await getAllProducts();
    for (const item of items) {
      const prod = products.find(p => p.id === item.product_id || p.sku === item.sku);
      if (prod) {
        await updateProduct(prod.id, {
          stock_quantity: item.actual_qty,
        }).catch(err => {
          console.error(`Failed to update product stock for ${prod.sku}:`, err.message);
        });
      }
    }
  }

  return { ...data, id, code, items, created_at: now };
};

export const updateStocktakeStatus = async (id: string, newStatus: string) => {
  const stocktakes = await getAllStocktakes();
  const target = stocktakes.find(s => s.id === id);
  if (!target || !target.rowIndex) throw new Error('Stocktake record not found');

  // Status column is K (column 11)
  await updateSheetData(SPREADSHEET_ID, `${STOCKTAKES_SHEET}!K${target.rowIndex}:K${target.rowIndex}`, [[newStatus]]);
};
