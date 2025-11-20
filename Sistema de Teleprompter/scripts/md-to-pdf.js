const fs = require('fs');
const path = require('path');
const marked = require('marked');
const puppeteer = require('puppeteer');

(async () => {
  try {
    const mdPath = path.resolve(__dirname, '..', 'test-scripts', 'reports', 'incident_report_2025-11-20.md');
    const outPdf = path.resolve(__dirname, '..', 'test-scripts', 'reports', 'incident_report_2025-11-20.pdf');

    if (!fs.existsSync(mdPath)) {
      console.error('Markdown file not found:', mdPath);
      process.exit(2);
    }

    const md = fs.readFileSync(mdPath, 'utf8');
    const htmlBody = marked(md);

    const html = `<!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Incident Report</title>
      <style>
        body { font-family: Arial, Helvetica, sans-serif; margin: 40px; color: #111; }
        h1,h2,h3 { color: #111; }
        pre { background:#f5f5f5; padding:10px; overflow:auto; }
        code { background:#f5f5f5; padding:2px 4px; }
        table { border-collapse: collapse; width: 100%; }
        table, th, td { border: 1px solid #ccc; }
        th, td { padding: 8px; text-align: left; }
      </style>
    </head>
    <body>
    ${htmlBody}
    </body>
    </html>`;

    // Launch puppeteer
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({ path: outPdf, format: 'A4', printBackground: true, margin: { top: '20mm', bottom: '20mm' } });
    await browser.close();

    console.log('PDF generado en:', outPdf);
    process.exit(0);
  } catch (err) {
    console.error('Error generando PDF:', err);
    process.exit(1);
  }
})();