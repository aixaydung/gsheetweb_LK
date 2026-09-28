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
  created_at: string;
  rowIndex: number; // To help with updates
}

export const getAllUsers = async (): Promise<User[]> => {
  const rows = await getSheetData(SPREADSHEET_ID, `${USERS_SHEET}!A2:K`);
  return rows.map((row, index) => ({
    id: row[0] || '',
    email: row[1] || '',
    password_hash: row[2] || '',
    name: row[3] || '',
    role: row[4] || '',
    google_sub: row[5] || '',
    google_email: row[6] || '',
    auth_provider: row[7] || '',
    last_login_at: row[8] || '',
    session_version: row[9] || '1',
    created_at: row[10] || '',
    rowIndex: index + 2 // A2 is row 2
  }));
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const users = await getAllUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
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
    new Date().toISOString()
  ];
  await appendSheetData(SPREADSHEET_ID, `${USERS_SHEET}!A:K`, [row]);
  return { ...user, id: newId };
};

export const updateUser = async (rowIndex: number, user: Partial<User>) => {
  // In a real scenario, you'd merge existing data. Here we fetch the existing user row to avoid overwriting with empties.
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
    existing.created_at
  ];
  
  await updateSheetData(SPREADSHEET_ID, `${USERS_SHEET}!A${rowIndex}:K${rowIndex}`, [updatedRow]);
};
