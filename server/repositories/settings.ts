import { getSheetData, appendSheetData, updateSheetData, ensureSheetExists } from '../google-sheets.js';

const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1wniDalcsynG8-H1sWokE47Woi0o9mrViDwW27di7oNY';
const SETTINGS_SHEET = 'SYSTEM_SETTINGS';

const SETTINGS_HEADERS = [
  'key',
  'value_json',
  'updated_at',
  'updated_by',
  'description',
];

export interface SettingItem {
  key: string;
  value: any;
  updated_at: string;
  updated_by: string;
  description: string;
  rowIndex?: number;
}

export const getAllSettings = async (): Promise<Record<string, any>> => {
  await ensureSheetExists(SPREADSHEET_ID, SETTINGS_SHEET, SETTINGS_HEADERS);

  const rows = await getSheetData(SPREADSHEET_ID, `${SETTINGS_SHEET}!A2:E`);
  const result: Record<string, any> = {};

  rows.forEach((row: any, idx: number) => {
    const key = (row[0] || '').trim();
    if (!key) return;

    let parsedVal = row[1];
    try {
      if (typeof row[1] === 'string' && (row[1].startsWith('{') || row[1].startsWith('['))) {
        parsedVal = JSON.parse(row[1]);
      }
    } catch {
      parsedVal = row[1];
    }

    result[key] = {
      value: parsedVal,
      updated_at: row[2] || '',
      updated_by: row[3] || '',
      description: row[4] || '',
      rowIndex: idx + 2,
    };
  });

  return result;
};

export const updateSetting = async (
  key: string,
  value: any,
  updatedBy: string = 'admin',
  description?: string
): Promise<SettingItem> => {
  await ensureSheetExists(SPREADSHEET_ID, SETTINGS_SHEET, SETTINGS_HEADERS);

  const rows = await getSheetData(SPREADSHEET_ID, `${SETTINGS_SHEET}!A2:E`);
  const cleanKey = key.trim();
  const valueJson = typeof value === 'string' ? value : JSON.stringify(value);
  const now = new Date().toISOString();

  let targetIndex = -1;
  let currentDesc = description || '';

  rows.forEach((row: any, idx: number) => {
    if ((row[0] || '').trim() === cleanKey) {
      targetIndex = idx + 2;
      if (!description && row[4]) {
        currentDesc = row[4];
      }
    }
  });

  if (!currentDesc) {
    if (cleanKey === 'company_info') currentDesc = 'Thông tin doanh nghiệp, MST, hotline, logo';
    else if (cleanKey === 'bank_accounts') currentDesc = 'Danh sách tài khoản ngân hàng thụ hưởng VietQR Napas';
    else if (cleanKey === 'print_config') currentDesc = 'Cấu hình mẫu in hóa đơn, khổ giấy A4/A5/K80';
    else if (cleanKey === 'sales_policy') currentDesc = 'Quy tắc bán hàng, hạn mức nợ, chiết khấu';
    else if (cleanKey === 'warehouse_policy') currentDesc = 'Chính sách xuất nhập kho, bán âm kho, tồn tối thiểu';
    else if (cleanKey === 'debt_policy') currentDesc = 'Chính sách công nợ & khóa sổ kế toán';
    else if (cleanKey === 'reminder_config') currentDesc = 'Cấu hình nhắc nợ tự động & gửi email';
  }

  const rowData = [cleanKey, valueJson, now, updatedBy, currentDesc];

  if (targetIndex > 0) {
    await updateSheetData(SPREADSHEET_ID, `${SETTINGS_SHEET}!A${targetIndex}:E${targetIndex}`, [rowData]);
  } else {
    await appendSheetData(SPREADSHEET_ID, `${SETTINGS_SHEET}!A:E`, [rowData]);
  }

  return {
    key: cleanKey,
    value,
    updated_at: now,
    updated_by: updatedBy,
    description: currentDesc,
  };
};

export const updateMultipleSettings = async (
  settingsMap: Record<string, any>,
  updatedBy: string = 'admin'
): Promise<Record<string, any>> => {
  const results: Record<string, any> = {};
  for (const [key, val] of Object.entries(settingsMap)) {
    if (val !== undefined) {
      const res = await updateSetting(key, val, updatedBy);
      results[key] = res;
    }
  }
  return results;
};
