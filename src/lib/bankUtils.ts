import { CompanySettings } from '../types';

export interface BankAccountItem {
  id: string;
  bankCode: string;
  bankBin: string;
  bankName: string;
  accountNo: string;
  accountName: string;
  defaultContent: string;
  printLine: string;
  isDefault: boolean;
}

export const BANK_ACCOUNTS_STORAGE_KEY = 'lkerp_bank_accounts';
export const BANK_ACCOUNTS_LEGACY_KEY = 'nexupone_bank_accounts';

export function getStoredBankAccounts(companySettings?: Partial<CompanySettings>): BankAccountItem[] {
  try {
    const saved =
      localStorage.getItem(BANK_ACCOUNTS_STORAGE_KEY) ||
      localStorage.getItem(BANK_ACCOUNTS_LEGACY_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to parse bank accounts from localStorage:', err);
  }

  // Fallback to company settings or default MB Bank account
  return [
    {
      id: 'ba_default',
      bankCode: 'MB',
      bankBin: companySettings?.bank_bin || '970422',
      bankName: companySettings?.bank_name || 'MB Bank - CN Sài Gòn',
      accountNo: companySettings?.bank_account_no || '988886666888',
      accountName: companySettings?.bank_account_name || 'CONG TY LK ERP',
      defaultContent: 'Thanh toan don hang',
      printLine: `MB - ${companySettings?.bank_account_no || '988886666888'} - ${companySettings?.bank_account_name || 'CONG TY LK ERP'}`,
      isDefault: true,
    },
  ];
}

export function buildVietQrUrl(params: {
  bankBin?: string;
  bankCode?: string;
  accountNo: string;
  accountName?: string;
  amount?: number;
  addInfo?: string;
  template?: 'compact2' | 'compact' | 'qr_only' | 'print';
}): string {
  const {
    bankBin,
    bankCode,
    accountNo,
    accountName = '',
    amount = 0,
    addInfo = '',
    template = 'qr_only',
  } = params;
  if (!accountNo) return '';

  const bankIdentifier = bankBin?.trim() || bankCode?.trim() || '970422';
  const cleanAccountNo = accountNo.replace(/\s+/g, '');
  const encodedContent = encodeURIComponent(addInfo.trim());
  const encodedName = encodeURIComponent(accountName.trim());
  const safeAmount = Math.max(0, Math.round(amount));

  return `https://img.vietqr.io/image/${bankIdentifier}-${cleanAccountNo}-${template}.png?amount=${safeAmount}&addInfo=${encodedContent}&accountName=${encodedName}`;
}
