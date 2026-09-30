import crypto from 'crypto';
import { getSheetData, appendSheetData, updateSheetData, clearSheetData } from '../google-sheets.js';

const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1wniDalcsynG8-H1sWokE47Woi0o9mrViDwW27di7oNY';
const SHEET_NAME = 'PAYMENTS';

export interface PaymentAllocationRecord {
  id?: string;
  doc_type?: string;
  doc_id?: string;
  doc_code?: string;
  amount: number;
}

export interface PaymentRecord {
  id: string;
  code: string;
  payment_date: string;
  direction: 'in' | 'out';
  partner_type: 'customer' | 'supplier';
  partner_id?: string;
  partner_name: string;
  amount: number;
  payment_method: string;
  method?: string;
  bill_image_url?: string;
  reference_code?: string;
  note?: string;
  status: 'active' | 'cancelled';
  created_by?: string;
  created_at: string;
  allocations?: PaymentAllocationRecord[];
  rowIndex?: number;
}

export const getAllPayments = async (): Promise<PaymentRecord[]> => {
  const rows = await getSheetData(SPREADSHEET_ID, `${SHEET_NAME}!A2:N`);
  return rows.map((row: any, index: number) => ({
    id: row[0] || '',
    code: row[1] || '',
    payment_date: row[2] || '',
    direction: (row[3] as any) || 'in',
    partner_type: (row[4] as any) || 'customer',
    partner_id: row[5] || '',
    partner_name: row[6] || '',
    amount: Number(row[7]) || 0,
    payment_method: row[8] || 'transfer',
    method: row[8] || 'transfer',
    reference_code: row[9] || '',
    note: row[10] || '',
    status: (row[11] as any) || 'active',
    created_by: row[12] || '',
    created_at: row[13] || '',
    allocations: [],
    rowIndex: index + 2,
  }));
};

export const generatePaymentCode = async (direction: 'in' | 'out'): Promise<string> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const ym = `${year}${month}`;
  const prefix = direction === 'in' ? 'PT' : 'PC';

  const payments = await getAllPayments();
  const filtered = payments.filter(p => p.code && p.code.startsWith(`${prefix}-${ym}`));
  const nextNum = filtered.length + 1;
  return `${prefix}-${ym}-${String(nextNum).padStart(4, '0')}`;
};

export const createPayment = async (data: Partial<PaymentRecord>) => {
  const id = data.id || crypto.randomUUID();
  const direction = data.direction || 'in';
  const code = data.code || (await generatePaymentCode(direction));
  const now = new Date().toISOString();

  // If allocations exist, extract reference codes
  let refCode = data.reference_code || '';
  if (!refCode && data.allocations && data.allocations.length > 0) {
    refCode = data.allocations.map(a => a.doc_code || a.doc_id).filter(Boolean).join(', ');
  }

  const row = [
    id,
    code,
    data.payment_date || now,
    direction,
    data.partner_type || 'customer',
    data.partner_id || '',
    data.partner_name || '',
    data.amount || 0,
    data.payment_method || data.method || 'transfer',
    refCode,
    data.note || '',
    data.status || 'active',
    data.created_by || 'Hệ thống',
    now,
  ];

  await appendSheetData(SPREADSHEET_ID, `${SHEET_NAME}!A:N`, [row]);
  return { ...data, id, code, reference_code: refCode, created_at: now };
};

export const cancelPayment = async (id: string) => {
  const payments = await getAllPayments();
  const target = payments.find(p => p.id === id);
  if (!target || !target.rowIndex) throw new Error('Payment record not found');

  // Status column is L (column 12)
  await updateSheetData(SPREADSHEET_ID, `${SHEET_NAME}!L${target.rowIndex}:L${target.rowIndex}`, [['cancelled']]);
};

export const updatePayment = async (id: string, data: Partial<PaymentRecord>) => {
  const payments = await getAllPayments();
  const target = payments.find(p => p.id === id);
  if (!target || !target.rowIndex) throw new Error('Payment record not found');

  const updatedRow = [
    target.id,
    data.code ?? target.code,
    data.payment_date ?? target.payment_date,
    data.direction ?? target.direction,
    data.partner_type ?? target.partner_type,
    data.partner_id ?? target.partner_id,
    data.partner_name ?? target.partner_name,
    data.amount ?? target.amount,
    data.payment_method ?? data.method ?? target.payment_method,
    data.reference_code ?? target.reference_code,
    data.note ?? target.note,
    data.status ?? target.status,
    target.created_by || 'Hệ thống',
    target.created_at,
  ];

  await updateSheetData(
    SPREADSHEET_ID,
    `${SHEET_NAME}!A${target.rowIndex}:N${target.rowIndex}`,
    [updatedRow]
  );

  return { ...target, ...data };
};

export const deletePayment = async (id: string) => {
  const rawRows = await getSheetData(SPREADSHEET_ID, `${SHEET_NAME}!A2:N`);
  const remaining = rawRows.filter((r: any) => r[0] !== id);
  await clearSheetData(SPREADSHEET_ID, `${SHEET_NAME}!A2:N`);
  if (remaining.length > 0) {
    await updateSheetData(SPREADSHEET_ID, `${SHEET_NAME}!A2:N${remaining.length + 1}`, remaining);
  }
  return { id, deleted: true };
};
