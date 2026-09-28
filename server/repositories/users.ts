import crypto from 'crypto';
import { getSheetData, appendSheetData, updateSheetData } from '../google-sheets.js';

const SPREADSHEET_ID = process.env.SPREADSHEET_ID!;
const USERS_SHEET = 'USERS';

// Map Google Sheet columns to User object
// Schema: ['id', 'email', 'password_hash', 'name', 'role', 'google_sub', 'google_email', 'auth_provider', 'last_login_at', 'session_version', 'created_at']
export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: string;
  google_sub: string;
  google_email: string;
  auth_provider: string;
  last_login_at: string;
  session_version: string;
  status: 'active' | 'pending' | 'blocked';
  created_at: string;
  rowIndex: number; // To help with updates
}

export const getAllUsers = async (): Promise<User[]> => {
  const rows = await getSheetData(SPREADSHEET_ID, `${USERS_SHEET}!A2:L`);
  return rows.map((row: any, index: number) => {
    const role = row[4] || 'user';
    let status: 'active' | 'pending' | 'blocked' = (row[11] as any) || (role === 'admin' ? 'active' : 'pending');
    if (!row[11] && role === 'admin') {
      status = 'active';
    }
    return {
      id: row[0] || '',
      email: row[1] || '',
      password_hash: row[2] || '',
      name: row[3] || '',
      role,
      google_sub: row[5] || '',
      google_email: row[6] || '',
      auth_provider: row[7] || '',
      last_login_at: row[8] || '',
      session_version: row[9] || '1',
      created_at: row[10] || '',
      status,
      rowIndex: index + 2 // A2 is row 2
    };
  });
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const users = await getAllUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
};

export const getUserById = async (id: string): Promise<User | null> => {
  const users = await getAllUsers();
  return users.find(u => u.id === id) || null;
};

export const getUserByGoogleSub = async (googleSub: string): Promise<User | null> => {
  const users = await getAllUsers();
  return users.find(u => u.google_sub === googleSub) || null;
};

export const createUser = async (user: Omit<User, 'rowIndex' | 'id'>) => {
  const newId = crypto.randomUUID();
  const row = [
    newId,
    user.email,
    user.password_hash,
    user.name,
    user.role,
    user.google_sub,
    user.google_email,
    user.auth_provider,
    user.last_login_at,
    user.session_version || '1',
    new Date().toISOString(),
    user.status || 'pending'
  ];
  await appendSheetData(SPREADSHEET_ID, `${USERS_SHEET}!A:L`, [row]);
  return { ...user, id: newId };
};

export const updateUser = async (rowIndex: number, user: Partial<User>) => {
  const users = await getAllUsers();
  const existing = users.find(u => u.rowIndex === rowIndex);
  if (!existing) throw new Error('User not found');
  
  const updatedRow = [
    existing.id,
    user.email ?? existing.email,
    user.password_hash ?? existing.password_hash,
    user.name ?? existing.name,
    user.role ?? existing.role,
    user.google_sub ?? existing.google_sub,
    user.google_email ?? existing.google_email,
    user.auth_provider ?? existing.auth_provider,
    user.last_login_at ?? existing.last_login_at,
    user.session_version ?? existing.session_version,
    existing.created_at,
    user.status ?? existing.status
  ];
  
  await updateSheetData(SPREADSHEET_ID, `${USERS_SHEET}!A${rowIndex}:L${rowIndex}`, [updatedRow]);
};
