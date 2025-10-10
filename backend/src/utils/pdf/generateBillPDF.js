// backend/src/utils/pdf/generateBillPDF.js
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

const pdfDir = path.join(__dirname, '..', '..', '..', 'uploads', 'bills');
fs.mkdir(pdfDir, { recursive: true }).catch(console.error);

const formatDate = (dateString) => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            console.warn(`Invalid date string provided to formatDate: ${dateString}`);
            return 'N/A';
        }
        return date.toLocaleDateString();
    } catch (e) {
        console.error(`Error formatting date ${dateString}:`, e);
        return 'N/A';
    }
};

const generateBillPDF = async (billData) => {
    let browser;
    try {
        console.log('Attempting to launch Puppeteer browser for Bill PDF...');
        browser = await puppeteer.launch({});
        console.log('Puppeteer browser launched successfully for Bill PDF.');

        const page = await browser.newPage();

        await page.setDefaultNavigationTimeout(60000); // Set navigation timeout to 60 seconds
        await page.setDefaultTimeout(60000); // Set default timeout to 60 seconds


        page.on('pageerror', (err) => {
            console.error('Page error during Bill PDF generation (Puppeteer console):', err);
        });
        page.on('error', (err) => {
            console.error('Puppeteer page crash/error (Puppeteer console):', err);
        });
        page.on('console', (msg) => {
            console.log('Browser console for Bill PDF:', msg.text());
        });

        const vendorAddressParts = [];
        if (billData.vendor?.address?.street) vendorAddressParts.push(billData.vendor.address.street);
        if (billData.vendor?.address?.city) vendorAddressParts.push(billData.vendor.address.city);
        if (billData.vendor?.address?.state) vendorAddressParts.push(billData.vendor.address.state);
        if (billData.vendor?.address?.zipCode) vendorAddressParts.push(billData.vendor.address.zipCode);
        const vendorAddressHtml = vendorAddressParts.length > 0 ? `<p class="text-gray-600">${vendorAddressParts.join(', ')}</p>` : '';

        const itemsHtml = billData.items.map(item => `
            <tr>
                <td class="px-4 py-2 text-sm text-gray-800">${item.description || 'N/A'}</td>
                <td class="px-4 py-2 text-sm text-gray-800 text-right">${parseFloat(item.quantity).toFixed(0) || '0'}</td>
                <td class="px-4 py-2 text-sm text-gray-800 text-right">${parseFloat(item.unitPrice).toFixed(2) || '0.00'}</td>
                <td class="px-4 py-2 text-sm text-gray-800 text-right">${parseFloat(item.quantity * item.unitPrice).toFixed(2) || '0.00'}</td>
            </tr>
        `).join('');

        const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bill</title>
    <style>
        body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 0;
            color: #333;
            line-height: 1.4;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            font-size: 1em;
        }
        .container {
            width: 95%;
            max-width: 700px;
            margin: 10px auto;
            padding: 15px;
            border: 1px solid #eee;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
            background-color: #fff;
            border-radius: 8px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #007bff;
            padding-bottom: 15px;
        }
        .header h1 {
            color: #007bff;
            margin: 0;
            font-size: 2em;
        }
        .header p {
            margin: 5px 0;
            color: #555;
            font-size: 0.9em;
        }
        .section {
            margin-bottom: 15px;
        }
        .section-title {
            font-size: 1.2em;
            color: #007bff;
            border-bottom: 1px solid #eee;
            padding-bottom: 6px;
            margin-bottom: 8px;
            font-weight: bold;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            border-radius: 8px;
            overflow: hidden;
        }
        table th, table td {
            border: 1px solid #ddd;
            padding: 6px 8px;
            text-align: left;
            font-size: 0.9em;
        }
        table th {
            background-color: #f7f7f7;
            font-weight: bold;
            color: #333;
            text-transform: uppercase;
        }
        table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .text-right {
            text-align: right;
        }
        .total-section {
            text-align: right;
            margin-top: 15px;
            padding-top: 8px;
            border-top: 2px solid #eee;
        }
        .total-section p {
            margin: 2px 0;
            font-size: 1.1em;
        }
        .total-section .grand-total {
            font-size: 1.5em;
            font-weight: bold;
            color: #007bff;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 9999px;
            font-size: 0.65em;
            font-weight: bold;
            text-transform: capitalize;
            color: #fff;
            margin-left: 8px;
        }
        .status-issued { background-color: #007bff; }
        .status-paid { background-color: #28a745; }
        .status-unpaid { background-color: #dc3545; }
        .status-pending { background-color: #ffc107; color: #333; }
        .status-cancelled { background-color: #6c757d; }
        .status-partially_paid { background-color: #fd7e14; }
        .status-overdue { background-color: #6f42c1; }
        .status-sent { background-color: #17a2b8; }
        .status-default { background-color: #6c757d; }

        .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #eee;
            font-size: 0.7em;
            color: #777;
        }

        .font-semibold { font-weight: 600; }
        .font-bold { font-weight: bold; }
        .text-sm { font-size: 0.8em; }
        .text-lg { font-size: 1em; }
        .text-xl { font-size: 1.1em; }
        .text-2xl { font-size: 1.3em; }
        .text-3xl { font-size: 1.6em; }
        .text-primary { color: #007bff; }
        .text-secondary { color: #555; }
    </style>
</head>
<body style="background-color: #f4f4f4;">
    <div class="container">
        <header class="header">
            <h1>Bill / Invoice</h1>
            <p>Bill Number: <span class="font-semibold">${billData.billNumber || 'N/A'}</span></p>
            <p>Issue Date: <span class="font-semibold">${formatDate(billData.issueDate)}</span></p>
            <p>Due Date: <span class="font-semibold">${billData.dueDate ? formatDate(billData.dueDate) : 'N/A'}</span></p>
        </header>

        <section class="section">
            <h2 class="section-title">Bill To</h2>
            <p class="text-lg font-semibold">${billData.vendor?.businessName || 'N/A'}</p>
            <p class="text-secondary">${billData.vendor?.contactEmail || 'N/A'}</p>
            ${vendorAddressHtml}
        </section>

        ${billData.purchaseOrder ? `
        <section class="section">
            <h2 class="section-title">Linked Purchase Order</h2>
            <p class="text-secondary">PO Number: <span class="font-semibold">${billData.purchaseOrder.orderNumber || 'N/A'}</span></p>
        </section>
        ` : ''}

        <section class="section">
            <h2 class="section-title">Items</h2>
            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th class="text-right">Quantity</th>
                        <th class="text-right">Unit Price</th>
                        <th class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
        </section>

        <section class="total-section">
            <p>Subtotal: $${parseFloat(billData.totalAmount).toFixed(2) || '0.00'}</p>
            <p class="grand-total">Grand Total: $${parseFloat(billData.totalAmount).toFixed(2) || '0.00'}</p>
        </section>

        <section class="section">
            <h2 class="section-title">Status & Notes</h2>
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <p style="margin-right: 15px;">Bill Status:
                    <span class="status-badge status-${billData.status || 'default'}">${billData.status || 'N/A'}</span>
                </p>
                ${billData.paymentStatus ? `
                <p>Payment Status:
                    <span class="status-badge status-${billData.paymentStatus || 'default'}">${billData.paymentStatus || 'N/A'}</span>
                </p>
                ` : ''}
            </div>
            ${billData.notes ? `
            <div>
                <p class="font-semibold">Notes:</p>
                <p class="text-secondary">${billData.notes}</p>
            </div>
            ` : ''}
            ${billData.generatedBy ? `
            <div style="margin-top: 15px;">
                <p class="font-semibold">Generated By:</p>
                <p class="text-secondary">${billData.generatedBy.name || 'N/A'} (${billData.generatedBy.email || 'N/A'})</p>
            </div>
            ` : ''}
        </section>
 
        <footer class="footer" style="margin-top:20px; padding-top:10px; font-size:0.8em; line-height: 1.2;">
            <p style="margin-bottom: 5px;">Thank you for your business!</p>
            <p style="margin-bottom:0;">Your Company Name | Contact: your@email.com | Phone: (123) 456-7890</p>
        </footer>
    </div>
</body>
</html>`;

        console.log('generateBillPDF: Setting HTML content for page...');
        try {
            await page.setContent(htmlTemplate, { waitUntil: 'networkidle0' });
        } catch (setContentError) {
            console.error('Error setting HTML content:', setContentError);
            console.error('setContentError details:', {
                message: setContentError.message,
                stack: setContentError.stack,
            });
        }

        page.on('console', msg => {
            console.log('Page console:', msg.text());
        });

        page.on('pageerror', err => {
            console.error('Page error:', err);
        });

        console.log('generateBillPDF: Waiting for 500ms before generating PDF...');
        await new Promise(resolve => setTimeout(resolve, 500));
        let pdfBuffer;

        console.log('generateBillPDF: HTML content set. Attempting to generate PDF...');
        const pdfOptions = {
            format: 'A4',
        };
        try {
            pdfBuffer = await page.pdf(pdfOptions);
            console.log('generateBillPDF: PDF buffer generated.');
        } catch (pdfError) {
            console.error('Error during PDF generation:', pdfError);
            console.error('PDF generation error details:', {
                message: pdfError.message,
                stack: pdfError.stack,
                context: {
                    billNumber: billData.billNumber,
                    issueDate: billData.issueDate,
                    vendor: billData.vendor?.businessName
                }
            });
            //throw pdfError;
        }

        await fs.mkdir(pdfDir, { recursive: true });

        const pdfFileName = `bill_${billData.billNumber.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
        const pdfPathFull = path.join(pdfDir, pdfFileName);
        await fs.writeFile(pdfPathFull, pdfBuffer);
        console.log(`generateBillPDF: PDF saved to: ${pdfPathFull}`);
        console.log(`generateBillPDF: PDF saved with filename: ${pdfFileName}`);

        return `bills/${pdfFileName}`;
    } catch (error) {
        console.error('CRITICAL ERROR in generateBillPDF (Puppeteer):', error);
        throw new Error(`Could not generate bill PDF: ${error.message}`);
    } finally {
        if (browser) {
            console.log('generateBillPDF: Closing Puppeteer browser.');
            await browser.close();
        }
    }
};

module.exports = generateBillPDF;
