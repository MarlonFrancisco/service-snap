/** Escape a CSV cell for Excel/pt-BR (`;` separators). */
export function escapeCsvCell(value: string | number | null | undefined): string {
  const raw = value == null ? '' : String(value);
  if (/[;"\n\r]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

export function rowsToCsv(
  headers: string[],
  rows: Array<Array<string | number | null | undefined>>,
): string {
  const lines = [
    headers.map(escapeCsvCell).join(';'),
    ...rows.map((row) => row.map(escapeCsvCell).join(';')),
  ];
  return lines.join('\n');
}

export function downloadCsv(filename: string, csv: string) {
  // Single UTF-8 BOM for Excel; callers may concatenate multiple tables.
  const withBom = csv.startsWith('\uFEFF') ? csv : `\uFEFF${csv}`;
  const blob = new Blob([withBom], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
