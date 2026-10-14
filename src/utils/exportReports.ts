import { strToU8, zipSync } from 'fflate';

export type ExportCell = string | number;

export interface ExportSheet {
  name: string;
  rows: ExportCell[][];
}

export interface PdfReportSection {
  title: string;
  columns: string[];
  rows: ExportCell[][];
}

function csvCell(value: ExportCell): string {
  let text = String(value);
  if (typeof value === 'string' && /^[\t\r\n ]*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportSheetsToCsv(sheets: ExportSheet[], filename: string) {
  const rows = flattenExportSheets(sheets);
  const content = `\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}`;
  downloadBlob(new Blob([content], { type: 'text/csv;charset=utf-8' }), filename);
}

function flattenExportSheets(sheets: ExportSheet[]): ExportCell[][] {
  return sheets.flatMap((sheet) => [
    [sheet.name],
    ...(sheet.rows.length ? sheet.rows : []),
    [],
  ]);
}

function columnName(index: number): string {
  let value = index + 1;
  let result = '';
  while (value > 0) {
    value -= 1;
    result = String.fromCharCode(65 + (value % 26)) + result;
    value = Math.floor(value / 26);
  }
  return result;
}

function worksheetXml(rows: ExportCell[][]): string {
  const xmlRows = rows.map((row, rowIndex) => {
    const rowNumber = rowIndex + 1;
    const cells = row.map((value, columnIndex) => {
      const reference = `${columnName(columnIndex)}${rowNumber}`;
      if (typeof value === 'number' && Number.isFinite(value)) {
        return `<c r="${reference}"><v>${value}</v></c>`;
      }
      return `<c r="${reference}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
    }).join('');
    return `<row r="${rowNumber}">${cells}</row>`;
  }).join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${xmlRows}</sheetData></worksheet>`;
}

function escapeXml(value: ExportCell): string {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function worksheetNames(sheets: ExportSheet[]): string[] {
  const used = new Set<string>();
  return sheets.map(({ name }, index) => {
    const base = name.replace(/[\\/?*[\]:]/g, '').slice(0, 31) || `Sheet${index + 1}`;
    let candidate = base;
    let suffix = 2;
    while (used.has(candidate.toLowerCase())) {
      const ending = ` (${suffix})`;
      candidate = `${base.slice(0, 31 - ending.length)}${ending}`;
      suffix += 1;
    }
    used.add(candidate.toLowerCase());
    return candidate;
  });
}

export function createXlsxWorkbook(sheets: ExportSheet[]): Uint8Array {
  const names = worksheetNames(sheets);
  const workbookSheets = sheets.map((_, index) => `<sheet name="${escapeXml(names[index] ?? `Sheet${index + 1}`)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`).join('');
  const workbookRelationships = sheets.map((_, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`).join('');
  const contentTypes = sheets.map((_, index) => `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('');
  const files: Record<string, Uint8Array> = {
    '[Content_Types].xml': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${contentTypes}</Types>`),
    '_rels/.rels': strToU8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'),
    'xl/workbook.xml': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${workbookSheets}</sheets></workbook>`),
    'xl/_rels/workbook.xml.rels': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${workbookRelationships}</Relationships>`),
  };
  sheets.forEach((sheet, index) => {
    files[`xl/worksheets/sheet${index + 1}.xml`] = strToU8(worksheetXml(sheet.rows));
  });
  return zipSync(files);
}

export function exportSheetsToXlsx(sheets: ExportSheet[], filename: string) {
  const workbook = createXlsxWorkbook([{ name: 'Dashboard', rows: flattenExportSheets(sheets) }]);
  const buffer = new ArrayBuffer(workbook.byteLength);
  new Uint8Array(buffer).set(workbook);
  downloadBlob(
    new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    filename,
  );
}

function escapeHtml(value: ExportCell): string {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export async function downloadFormattedPdf(
  title: string,
  subtitle: string,
  sections: PdfReportSection[],
  filename: string,
  mapElement?: HTMLElement | null,
  mapTitle = 'Map',
): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);
  await document.fonts.ready;
  let mapImage: string | undefined;
  if (mapElement) {
    await Promise.all(Array.from(mapElement.querySelectorAll<HTMLImageElement>('.leaflet-tile')).map((tile) => tile.decode()));
    const mapCanvas = await html2canvas(mapElement, {
      backgroundColor: '#ffffff',
      scale: 1.5,
      useCORS: true,
      onclone: (clonedDocument) => {
        clonedDocument.querySelectorAll<HTMLElement>('.leaflet-control-zoom').forEach((control) => {
          control.style.display = 'none';
        });
      },
    });
    mapImage = mapCanvas.toDataURL('image/png');
  }

  const pageWidth = 900;
  const report = document.createElement('div');
  report.style.cssText = `position:fixed;left:-10000px;top:0;box-sizing:border-box;width:${pageWidth}px;padding:32px;background:#f3f4f6;color:#1e293b;font-family:Arial,sans-serif;`;
  document.body.append(report);

  const pageSections: Array<{ section: PdfReportSection; rows: ExportCell[][]; map?: string }> = [];
  for (const section of sections) {
    const chunkSize = section.columns.length > 4 ? 8 : 14;
    const rowChunks = section.rows.length
      ? Array.from({ length: Math.ceil(section.rows.length / chunkSize) }, (_, index) =>
        section.rows.slice(index * chunkSize, (index + 1) * chunkSize))
      : [[]];
    for (const rows of rowChunks) pageSections.push({ section, rows });
  }
  if (mapImage) {
    pageSections.push({
      section: { title: mapTitle, columns: [], rows: [] },
      rows: [],
      map: mapImage,
    });
  }
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  try {
    for (const [pageIndex, page] of pageSections.entries()) {
      const compactTable = page.section.columns.length > 4;
      report.innerHTML = `
        <header style="border-bottom:3px solid #0f52ba;padding:8px 0 18px;margin-bottom:24px;">
          <div style="font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#0f52ba;">TripPlanner · ${pageIndex + 1}/${pageSections.length}</div>
          <h1 style="font-size:30px;margin:12px 0 6px;">${escapeHtml(title)}</h1>
          <p style="font-size:14px;color:#64748b;margin:0;">${escapeHtml(subtitle)}</p>
        </header>
        <h2 style="font-size:20px;color:#0f52ba;margin:0 0 14px;">${escapeHtml(page.section.title)}</h2>
        ${page.map
          ? `<img src="${page.map}" style="display:block;width:100%;height:auto;border:1px solid #e2e8f0;border-radius:10px;">`
          : `<table style="width:100%;border-collapse:collapse;table-layout:fixed;font-size:${compactTable ? 11 : 14}px;">
              <thead><tr>${page.section.columns.map((column) => `<th style="padding:${compactTable ? 7 : 11}px 8px;background:#e8eef8;color:#1e293b;text-align:left;border:1px solid #cbd5e1;overflow-wrap:anywhere;">${escapeHtml(column)}</th>`).join('')}</tr></thead>
              <tbody>${page.rows.map((row, rowIndex) => `<tr>${page.section.columns.map((_, index) => `<td style="padding:${compactTable ? 7 : 10}px 8px;border:1px solid #e2e8f0;vertical-align:top;overflow-wrap:anywhere;background:${rowIndex % 2 === 0 ? '#ffffff' : '#f8fafc'};">${escapeHtml(row[index] ?? '')}</td>`).join('')}</tr>`).join('')}</tbody>
            </table>`}`;
      const canvas = await html2canvas(report, { backgroundColor: '#f3f4f6', scale: 1.5, windowWidth: pageWidth });
      if (pageIndex > 0) pdf.addPage('a4', 'portrait');

      const margin = 10;
      const contentWidth = pdf.internal.pageSize.getWidth() - margin * 2;
      const contentHeight = pdf.internal.pageSize.getHeight() - margin * 2;
      const fitScale = Math.min(contentWidth / canvas.width, contentHeight / canvas.height);
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        margin,
        margin,
        canvas.width * fitScale,
        canvas.height * fitScale,
      );
    }
    pdf.setProperties({ title });
    pdf.save(filename);
  } finally {
    report.remove();
  }
}
