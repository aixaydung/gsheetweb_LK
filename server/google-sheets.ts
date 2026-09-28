import { google } from 'googleapis';
import * as dotenv from 'dotenv';
dotenv.config();

// Initialize the Google Auth client
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

/**
 * Get data from a specific range in the spreadsheet
 */
export const getSheetData = async (spreadsheetId: string, range: string) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    return response.data.values || [];
  } catch (error) {
    console.error(`Error reading sheet ${range}:`, error);
    throw new Error('Failed to read data from Google Sheets');
  }
};

/**
 * Append data to a specific range in the spreadsheet
 */
export const appendSheetData = async (spreadsheetId: string, range: string, values: any[][]) => {
  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error appending to sheet ${range}:`, error);
    throw new Error('Failed to append data to Google Sheets');
  }
};

/**
 * Update data in a specific range in the spreadsheet
 */
export const updateSheetData = async (spreadsheetId: string, range: string, values: any[][]) => {
  try {
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating sheet ${range}:`, error);
    throw new Error('Failed to update data in Google Sheets');
  }
};

export const clearSheetData = async (spreadsheetId: string, range: string) => {
  try {
    const response = await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range,
    });
    return response.data;
  } catch (error) {
    console.error(`Error clearing sheet ${range}:`, error);
    throw new Error('Failed to clear data in Google Sheets');
  }
};
