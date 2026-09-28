import { google } from 'googleapis';
import * as dotenv from 'dotenv';
dotenv.config();

let auth: any;
let sheets: any;

const initGoogleSheets = () => {
  if (sheets) return sheets;
  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error('Thiếu cấu hình GOOGLE_CLIENT_EMAIL hoặc GOOGLE_PRIVATE_KEY trong biến môi trường!');
  }
  
  // Format lại Private Key (Vercel thường hay bị lỗi format chuỗi \n)
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;
  if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  } else if (!privateKey.includes('\n')) {
    // Trường hợp key liền mạch, cố gắng format lại (không khuyến khích)
    // Cách an toàn nhất là người dùng dán đúng chuỗi có \n
  }

  auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  sheets = google.sheets({ version: 'v4', auth });
  return sheets;
};

/**
 * Get data from a specific range in the spreadsheet
 */
export const getSheetData = async (spreadsheetId: string, range: string) => {
  try {
    const s = initGoogleSheets();
    const response = await s.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    return response.data.values || [];
  } catch (error: any) {
    console.error(`Error reading sheet ${range}:`, error);
    throw new Error(error.message || 'Failed to read data from Google Sheets');
  }
};

/**
 * Append data to a specific range in the spreadsheet
 */
export const appendSheetData = async (spreadsheetId: string, range: string, values: any[][]) => {
  try {
    const s = initGoogleSheets();
    const response = await s.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(`Error appending to sheet ${range}:`, error);
    throw new Error(error.message || 'Failed to append data to Google Sheets');
  }
};

/**
 * Update data in a specific range in the spreadsheet
 */
export const updateSheetData = async (spreadsheetId: string, range: string, values: any[][]) => {
  try {
    const s = initGoogleSheets();
    const response = await s.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(`Error updating sheet ${range}:`, error);
    throw new Error(error.message || 'Failed to update data in Google Sheets');
  }
};

export const clearSheetData = async (spreadsheetId: string, range: string) => {
  try {
    const s = initGoogleSheets();
    const response = await s.spreadsheets.values.clear({
      spreadsheetId,
      range,
    });
    return response.data;
  } catch (error: any) {
    console.error(`Error clearing sheet ${range}:`, error);
    throw new Error(error.message || 'Failed to clear data in Google Sheets');
  }
};
