import crypto from 'crypto';
import { getSheetData, appendSheetData, updateSheetData } from '../google-sheets.js';

const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1wniDalcsynG8-H1sWokE47Woi0o9mrViDwW27di7oNY';
const SHEET_NAME = 'VENDORS';

export interface VendorRecord {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  tax_code: string;
  debt_amount: number;
  note: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  rowIndex: number;
}

export const getAllVendors = async (): Promise<VendorRecord[]> => {
  const rows = await getSheetData(SPREADSHEET_ID, `${SHEET_NAME}!A2:L`);
  return rows.map((row: any, index: number) => ({
    id: row[0] || '',
    code: row[1] || '',
    name: row[2] || '',
    phone: row[3] || '',
    email: row[4] || '',
    address: row[5] || '',
    tax_code: row[6] || '',
    debt_amount: Number(row[7]) || 0,
    note: row[8] || '',
    status: (row[9] as any) || 'active',
    created_at: row[10] || '',
    updated_at: row[11] || '',
    rowIndex: index + 2,
  }));
};

export const createVendor = async (data: Partial<VendorRecord>) => {
  const id = data.id || crypto.randomUUID();
  const existing = await getAllVendors();
  const nextNum = existing.length + 1;
  const code = data.code || `NCC-${String(nextNum).padStart(4, '0')}`;
  const now = new Date().toISOString();

  const row = [
    id,
    code,
    data.name || '',
    data.phone || '',
    data.email || '',
    data.address || '',
    data.tax_code || '',
    data.debt_amount || 0,
    data.note || '',
    data.status || 'active',
    now,
    now,
  ];

  await appendSheetData(SPREADSHEET_ID, `${SHEET_NAME}!A:L`, [row]);
  return { ...data, id, code, created_at: now, updated_at: now };
};

export const updateVendor = async (id: string, data: Partial<VendorRecord>) => {
  const vendors = await getAllVendors();
  const target = vendors.find(v => v.id === id);
  if (!target) throw new Error(`Vendor with ID ${id} not found`);

  const now = new Date().toISOString();
  const updatedRow = [
    target.id,
    data.code ?? target.code,
    data.name ?? target.name,
    data.phone ?? target.phone,
    data.email ?? target.email,
    data.address ?? target.address,
    data.tax_code ?? target.tax_code,
    data.debt_amount ?? target.debt_amount,
    data.note ?? target.note,
    data.status ?? target.status,
    target.created_at,
    now,
  ];

  await updateSheetData(SPREADSHEET_ID, `${SHEET_NAME}!A${target.rowIndex}:L${target.rowIndex}`, [updatedRow]);
  return { ...target, ...data, updated_at: now };
};

export const deleteVendor = async (id: string) => {
  return updateVendor(id, { status: 'inactive' });
};
