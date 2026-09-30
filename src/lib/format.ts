// Formatting helpers adhering strictly to LK ERP specifications

/**
 * Format currency in VND:
 * 1.234.000 đ
 * -74.000 đ
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0 đ';
  }
  const isNegative = amount < 0;
  const absVal = Math.round(Math.abs(amount));
  const formatted = absVal.toLocaleString('vi-VN');
  return `${isNegative ? '-' : ''}${formatted} đ`;
}

/**
 * Format quantity with vi-VN conventions (max 2 decimal places):
 * 285.601,32 or 1.000
 */
export function formatQuantity(qty: number | null | undefined): string {
  if (qty === null || qty === undefined || isNaN(qty)) {
    return '0';
  }
  return Number(qty).toLocaleString('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/**
 * Format date dd/MM/yyyy
 */
export function formatDate(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateString || '—';
  }
}

/**
 * Format date & time dd/MM/yyyy HH:mm
 */
export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return dateString || '—';
  }
}

/**
 * Short number format for charts: 700tr, 100tr, 900k
 */
export function formatCompactNumber(val: number): string {
  if (val === 0) return '0';
  const abs = Math.abs(val);
  const sign = val < 0 ? '-' : '';
  if (abs >= 1_000_000_000) {
    return `${sign}${(abs / 1_000_000_000).toFixed(1).replace('.0', '')}tỷ`;
  }
  if (abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toFixed(0)}tr`;
  }
  if (abs >= 1_000) {
    return `${sign}${(abs / 1_000).toFixed(0)}k`;
  }
  return `${val}`;
}

/**
 * Calculate difference in days between target date and today
 */
export function getDaysDiff(targetDateString?: string | null): number {
  if (!targetDateString) return 0;
  const target = new Date(targetDateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - target.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

const VIETNAMESE_DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

function readGroupOfThree(threeDigits: string, showZeroHundreds: boolean): string {
  const hundreds = parseInt(threeDigits[0], 10);
  const tens = parseInt(threeDigits[1], 10);
  const units = parseInt(threeDigits[2], 10);
  let result = '';

  if (hundreds === 0 && tens === 0 && units === 0) return '';

  if (hundreds !== 0 || showZeroHundreds) {
    result += `${VIETNAMESE_DIGITS[hundreds]} trăm `;
    if (tens === 0 && units !== 0) {
      result += 'lẻ ';
    }
  }

  if (tens === 1) {
    result += 'mười ';
  } else if (tens > 1) {
    result += `${VIETNAMESE_DIGITS[tens]} mươi `;
  }

  if (tens > 0 && units === 1) {
    result += tens === 1 ? 'một ' : 'mốt ';
  } else if (units === 5 && tens > 0) {
    result += 'lăm ';
  } else if (units > 0) {
    result += `${VIETNAMESE_DIGITS[units]} `;
  }

  return result;
}

/**
 * Convert number into Vietnamese words:
 * e.g. 48178000 -> "Bốn mươi tám triệu một trăm bảy mươi tám nghìn đồng."
 */
export function numberToVietnameseWords(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(n) || n === 0) {
    return 'Không đồng.';
  }

  const isNegative = n < 0;
  const absAmount = Math.floor(Math.abs(n));
  if (absAmount === 0) return 'Không đồng.';

  const scales = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
  let str = absAmount.toString();
  while (str.length % 3 !== 0) {
    str = '0' + str;
  }

  const groups: string[] = [];
  for (let i = 0; i < str.length; i += 3) {
    groups.push(str.substring(i, i + 3));
  }

  let words = '';
  const totalGroups = groups.length;

  for (let i = 0; i < totalGroups; i++) {
    const scaleIndex = totalGroups - 1 - i;
    const groupStr = groups[i];
    const groupWords = readGroupOfThree(groupStr, i > 0);
    if (groupWords.trim() !== '') {
      words += `${groupWords}${scales[scaleIndex]} `;
    }
  }

  words = words.trim();
  if (!words) return 'Không đồng.';

  const capitalized = words.charAt(0).toUpperCase() + words.slice(1);
  return `${isNegative ? 'Âm ' : ''}${capitalized} đồng.`;
}

