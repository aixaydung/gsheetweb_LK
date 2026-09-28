import { initGoogleSheets } from '../google-sheets.js';
import * as dotenv from 'dotenv';
dotenv.config();

const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1wniDalcsynG8-H1sWokE47Woi0o9mrViDwW27di7oNY';

interface SheetSchema {
  title: string;
  headers: string[];
}

const REQUIRED_SHEETS: SheetSchema[] = [
  {
    title: 'USERS',
    headers: [
      'id', 'email', 'password_hash', 'name', 'role',
      'google_sub', 'google_email', 'auth_provider',
      'last_login_at', 'session_version', 'created_at', 'status'
    ]
  },
  {
    title: 'CUSTOMERS',
    headers: [
      'id', 'code', 'name', 'phone', 'email',
      'address', 'tax_code', 'group_id', 'debt_amount',
      'credit_limit', 'note', 'status', 'created_at', 'updated_at'
    ]
  },
  {
    title: 'PRODUCTS',
    headers: [
      'id', 'sku', 'name', 'unit', 'cost_price',
      'selling_price', 'stock_quantity', 'min_stock',
      'max_stock', 'group_id', 'barcode', 'description',
      'status', 'created_at', 'updated_at'
    ]
  },
  {
    title: 'VENDORS',
    headers: [
      'id', 'code', 'name', 'phone', 'email',
      'address', 'tax_code', 'debt_amount', 'note',
      'status', 'created_at', 'updated_at'
    ]
  },
  {
    title: 'ORDERS',
    headers: [
      'id', 'code', 'customer_id', 'customer_name', 'order_date',
      'subtotal', 'discount_amount', 'vat_rate', 'vat_amount',
      'shipping_fee', 'total', 'paid_amount', 'debt_amount',
      'payment_status', 'status', 'note', 'created_by', 'created_at'
    ]
  },
  {
    title: 'ORDER_ITEMS',
    headers: [
      'id', 'order_id', 'product_id', 'sku', 'product_name',
      'unit', 'quantity', 'unit_price', 'discount_amount',
      'line_total', 'note'
    ]
  },
  {
    title: 'STOCK_MOVEMENTS',
    headers: [
      'id', 'code', 'type', 'reference_doc_type', 'reference_doc_code',
      'warehouse_id', 'date', 'total_amount', 'note', 'status',
      'created_by', 'created_at'
    ]
  },
  {
    title: 'PAYMENTS',
    headers: [
      'id', 'code', 'payment_date', 'direction', 'partner_type',
      'partner_id', 'partner_name', 'amount', 'payment_method',
      'reference_code', 'note', 'status', 'created_by', 'created_at'
    ]
  },
  {
    title: 'PURCHASE_ORDERS',
    headers: [
      'id', 'code', 'supplier_id', 'supplier_name', 'order_date',
      'expected_date', 'subtotal', 'discount_amount', 'vat_rate',
      'vat_amount', 'shipping_fee', 'total', 'paid_amount', 'debt_amount',
      'payment_status', 'status', 'note', 'created_by', 'created_at'
    ]
  },
  {
    title: 'PURCHASE_ORDER_ITEMS',
    headers: [
      'id', 'po_id', 'product_id', 'sku', 'product_name',
      'unit', 'quantity', 'unit_price', 'discount_amount',
      'line_total', 'note'
    ]
  }
];

export async function initializeDatabase() {
  console.log(`Starting Google Sheets Schema Initialization for: ${SPREADSHEET_ID}...`);
  const sheets = initGoogleSheets();

  // 1. Fetch current sheets
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const existingTitles = new Set(meta.data.sheets?.map((s: any) => s.properties?.title) || []);
  console.log('Existing sheets found:', Array.from(existingTitles));

  // 2. Identify missing sheets to add
  const missingSheets = REQUIRED_SHEETS.filter(s => !existingTitles.has(s.title));

  if (missingSheets.length > 0) {
    console.log(`Adding ${missingSheets.length} missing sheet tabs:`, missingSheets.map(s => s.title));
    const requests = missingSheets.map(s => ({
      addSheet: {
        properties: {
          title: s.title,
          gridProperties: {
            frozenRowCount: 1
          }
        }
      }
    }));

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { requests }
    });
    console.log('Successfully created all missing sheets!');
  } else {
    console.log('All required sheet tabs already exist.');
  }

  // 3. Ensure Header row for each sheet
  for (const sheet of REQUIRED_SHEETS) {
    const endColLetter = String.fromCharCode(64 + sheet.headers.length);
    const range = `${sheet.title}!A1:${endColLetter}1`;
    
    // Check existing header
    try {
      const existing = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range,
      });

      if (!existing.data.values || existing.data.values.length === 0 || existing.data.values[0].length < sheet.headers.length) {
        console.log(`Writing headers for ${sheet.title} (${range})...`);
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [sheet.headers]
          }
        });
        console.log(`Headers written for ${sheet.title}.`);
      } else {
        console.log(`Headers already present for ${sheet.title}.`);
      }
    } catch (err: any) {
      console.error(`Error checking/writing headers for ${sheet.title}:`, err.message);
    }
  }

  console.log('Database initialization completed successfully!');
}

initializeDatabase()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Fatal initialization error:', err);
    process.exit(1);
  });
