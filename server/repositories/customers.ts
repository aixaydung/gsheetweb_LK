import crypto from 'crypto';
import { getSheetData, appendSheetData, updateSheetData } from '../google-sheets.js';

const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1wniDalcsynG8-H1sWokE47Woi0o9mrViDwW27di7oNY';
const SHEET_NAME = 'CUSTOMERS';

export interface CustomerRecord {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  tax_code: string;
  group_id: string;
  debt_amount: number;
  credit_limit: number;
  note: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  rowIndex: number;
}

export const getAllCustomers = async (): Promise<CustomerRecord[]> => {
  const rows = await getSheetData(SPREADSHEET_ID, `${SHEET_NAME}!A2:N`);
  return rows.map((row: any, index: number) => ({
    id: row[0] || '',
    code: row[1] || '',
    name: row[2] || '',
    phone: row[3] || '',
    email: row[4] || '',
    address: row[5] || '',
    tax_code: row[6] || '',
    group_id: row[7] || '',
    debt_amount: Number(row[8]) || 0,
    credit_limit: Number(row[9]) || 0,
    note: row[10] || '',
    status: (row[11] as any) || 'active',
    created_at: row[12] || '',
    updated_at: row[13] || '',
    rowIndex: index + 2,
  }));
};

export const createCustomer = async (data: Partial<CustomerRecord>) => {
  const id = data.id || crypto.randomUUID();
  const existing = await getAllCustomers();
  const nextNum = existing.length + 1;
  const code = data.code || `KH-${String(nextNum).padStart(4, '0')}`;
  const now = new Date().toISOString();

  const row = [
    id,
    code,
    data.name || '',
    data.phone || '',
    data.email || '',
    data.address || '',
    data.tax_code || '',
    data.group_id || 'GRP_RETAIL',
    data.debt_amount || 0,
    data.credit_limit || 0,
    data.note || '',
    data.status || 'active',
    now,
    now,
  ];

  await appendSheetData(SPREADSHEET_ID, `${SHEET_NAME}!A:N`, [row]);
  return { ...data, id, code, created_at: now, updated_at: now };
};

export const createCustomersBatch = async (items: Partial<CustomerRecord>[]) => {
  const existing = await getAllCustomers();
  let nextNum = existing.length + 1;
  const now = new Date().toISOString();
  const created: any[] = [];
  const rows: any[][] = [];

  for (const data of items) {
    const id = data.id || crypto.randomUUID();
    const code = data.code || `KH-${String(nextNum++).padStart(4, '0')}`;
    const row = [
      id,
      code,
      data.name || '',
      data.phone || '',
      data.email || '',
      data.address || '',
      data.tax_code || '',
      data.group_id || 'GRP_RETAIL',
      Number(data.debt_amount) || 0,
      Number(data.credit_limit) || 0,
      data.note || '',
      data.status || 'active',
      now,
      now,
    ];
    rows.push(row);
    created.push({ ...data, id, code, created_at: now, updated_at: now });
  }

  if (rows.length > 0) {
    await appendSheetData(SPREADSHEET_ID, `${SHEET_NAME}!A:N`, rows);
  }
  return created;
};

export const updateCustomer = async (id: string, data: Partial<CustomerRecord>) => {
  const customers = await getAllCustomers();
  const target = customers.find(c => c.id === id);
  if (!target) throw new Error(`Customer with ID ${id} not found`);

  const now = new Date().toISOString();
  const updatedRow = [
    target.id,
    data.code ?? target.code,
    data.name ?? target.name,
    data.phone ?? target.phone,
    data.email ?? target.email,
    data.address ?? target.address,
    data.tax_code ?? target.tax_code,
    data.group_id ?? target.group_id,
    data.debt_amount ?? target.debt_amount,
    data.credit_limit ?? target.credit_limit,
    data.note ?? target.note,
    data.status ?? target.status,
    target.created_at,
    now,
  ];

  await updateSheetData(SPREADSHEET_ID, `${SHEET_NAME}!A${target.rowIndex}:N${target.rowIndex}`, [updatedRow]);
  return { ...target, ...data, updated_at: now };
};

export const deleteCustomer = async (id: string) => {
  // Soft delete: sets status to inactive
  return updateCustomer(id, { status: 'inactive' });
};
