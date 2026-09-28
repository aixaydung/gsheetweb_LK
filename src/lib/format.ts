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
