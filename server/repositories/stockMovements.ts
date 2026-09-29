import { getSheetData } from '../google-sheets.js';

const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1wniDalcsynG8-H1sWokE47Woi0o9mrViDwW27di7oNY';
const SHEET_NAME = 'STOCK_MOVEMENTS';

export interface StockMovementRecord {
  id: string;
  code: string;
  type: string;
  reference_doc_type: string;
  reference_doc_code: string;
  warehouse_id: string;
  date: string;
  total_amount: number;
  note: string;
  status: string;
  created_by: string;
  created_at: string;
  rowIndex: number;
}

export const getAllStockMovements = async (): Promise<StockMovementRecord[]> => {
  const rows = await getSheetData(SPREADSHEET_ID, `${SHEET_NAME}!A2:L`);
  return rows.map((row: any, index: number) => ({
    id: row[0] || '',
    code: row[1] || '',
    type: row[2] || '',
    reference_doc_type: row[3] || '',
    reference_doc_code: row[4] || '',
    warehouse_id: row[5] || 'wh-01',
    date: row[6] || '',
    total_amount: Number(row[7]) || 0,
    note: row[8] || '',
    status: row[9] || 'delivered',
    created_by: row[10] || '',
    created_at: row[11] || '',
    rowIndex: index + 2,
  }));
};
