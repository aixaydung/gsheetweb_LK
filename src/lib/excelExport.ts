// Excel / CSV Export utility matching Section 9.1 & 9.2

export interface ExportColumn<T = any> {
  key: keyof T | string;
  header: string;
  accessor?: (row: T) => string | number | null | undefined;
  format?: (val: any) => string | number | null | undefined;
}

export function exportToExcelFile<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filePrefix: string
) {
  const now = new Date();
  const yyyy = now.getFullYear();
  const MM = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const HH = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const filename = `${filePrefix}_${yyyy}${MM}${dd}_${HH}${mm}.csv`;

  // Build CSV with UTF-8 BOM for Microsoft Excel compatibility
  const headerRow = columns.map(c => escapeCsvValue(c.header)).join(',');
  const rows = data.map(row => {
    return columns
      .map(col => {
        let val: any;
        if (col.accessor) {
          val = col.accessor(row);
        } else {
          val = (row as any)[col.key];
          if (col.format) {
            val = col.format(val);
          }
        }
        return escapeCsvValue(val);
      })
      .join(',');
  });

  const csvContent = '\uFEFF' + [headerRow, ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsvValue(val: any): string {
  if (val === null || val === undefined) return '""';
  if (typeof val === 'number') return String(val);
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}
