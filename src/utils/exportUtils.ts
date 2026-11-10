/**
 * Utility functions for generating and downloading DOCX, PDF, XLSX and PPT files
 */

export const exportToDocx = (filename: string, title: string, htmlContent: string) => {
  const header = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' 
      xmlns:w='urn:schemas-microsoft-com:office:word' 
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>${title}</title>
<style>
  body { font-family: 'SimSun', 'Songti SC', 'Times New Roman', serif; font-size: 11pt; line-height: 1.5; color: #111; }
  h1 { font-size: 18pt; text-align: center; color: #1e3a8a; margin-bottom: 8pt; }
  h2 { font-size: 14pt; color: #1e40af; border-bottom: 1.5pt solid #1e40af; padding-bottom: 3pt; margin-top: 14pt; margin-bottom: 6pt; }
  h3 { font-size: 12pt; color: #1e293b; margin-top: 10pt; margin-bottom: 4pt; }
  table { width: 100%; border-collapse: collapse; margin-top: 8pt; margin-bottom: 12pt; }
  th, td { border: 1pt solid #475569; padding: 5pt 8pt; font-size: 10pt; text-align: left; }
  th { background-color: #f1f5f9; font-weight: bold; color: #0f172a; }
  .formula-box { background: #f8fafc; border: 1pt solid #cbd5e1; padding: 6pt 10pt; font-family: 'Courier New', monospace; margin: 6pt 0; }
  .footer-note { font-size: 9pt; color: #64748b; text-align: right; margin-top: 20pt; }
</style>
</head>
<body>
${htmlContent}
<div class="footer-note">本文件由 AI 教师助理·职业教育智能教学工作台自动生成并归档校验</div>
</body>
</html>`;

  const blob = new Blob(['\ufeff', header], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.docx') ? filename : `${filename}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportToXlsx = (filename: string, rows: (string | number)[][]) => {
  // Generate CSV/Excel friendly format
  const csvContent = rows
    .map((row) =>
      row
        .map((cell) => {
          const str = String(cell ?? '').replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(',')
    )
    .join('\r\n');

  const blob = new Blob(['\ufeff', csvContent], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') || filename.endsWith('.xlsx') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportToPdfPrint = () => {
  window.print();
};
