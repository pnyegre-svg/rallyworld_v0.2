
export function downloadCsv(filename: string, rows: any[], headers?: string[]) {
const cols = headers ?? Object.keys(rows[0] ?? {});
const escape = (v:any) => '"' + String(v ?? '').replaceAll('"','""') + '"';
const lines = [cols.join(',')].concat(rows.map(r => cols.map(c => escape(r[c])).join(',')));
const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url; a.download = filename; a.click();
URL.revokeObjectURL(url);
}
