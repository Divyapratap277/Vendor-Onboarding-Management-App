// backend/src/utils/pdf/generatePurchaseOrderPDF.js
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const generatePurchaseOrderPDF = async (purchaseOrder) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Professional HTML template
    const itemsHtml = purchaseOrder.items.map(item => `
        <tr>
            <td>${item.description}</td>
            <td>${item.quantity}</td>
            <td>${item.unitPrice.toFixed(2)}</td>
            <td>${(item.quantity * item.unitPrice).toFixed(2)}</td>
        </tr>
    `).join('');

    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Purchase Order - ${purchaseOrder.orderNumber}</title>
        <style>
            body { font-family: 'Inter', sans-serif; margin: 20px; color: #333; }
            .container { max-width: 800px; margin: auto; border: 1px solid #eee; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1); border-radius: 8px; }
            h1 { text-align: center; color: #4a90e2; margin-bottom: 20px; border-bottom: 2px solid #4a90e2; padding-bottom: 10px; }
            .header-info, .vendor-info, .po-details, .items-table { margin-bottom: 20px; }
            .header-info div, .vendor-info div, .po-details div { margin-bottom: 5px; }
            .header-info span, .vendor-info strong, .po-details strong { font-weight: bold; color: #555; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f2f2f2; color: #333; }
            .total-amount { text-align: right; font-size: 1.2em; font-weight: bold; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; font-size: 0.8em; color: #777; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>PURCHASE ORDER</h1>
            <div class="header-info">
                <div><strong>Order Number:</strong> ${purchaseOrder.orderNumber}</div>
                <div><strong>Issue Date:</strong> ${new Date(purchaseOrder.issueDate).toLocaleDateString()}</div>
                <div><strong>Delivery Date:</strong> ${new Date(purchaseOrder.deliveryDate).toLocaleDateString()}</div>
            </div>
            <div class="vendor-info">
                <h2>Vendor Details:</h2>
                <div><strong>Business Name:</strong> ${purchaseOrder.vendor.businessName}</div>
                <div><strong>Contact Person:</strong> ${purchaseOrder.vendor.contactPerson}</div>
                <div><strong>Contact Email:</strong> ${purchaseOrder.vendor.contactEmail}</div>
                <div><strong>Address:</strong> ${purchaseOrder.vendor.address.street}, ${purchaseOrder.vendor.address.city}, ${purchaseOrder.vendor.address.state}, ${purchaseOrder.vendor.address.zipCode}</div>
            </div>
            <div class="items-table">
                <h2>Order Items:</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Line Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
            </div>
            <div class="total-amount">
                Total Amount: ${purchaseOrder.totalAmount.toFixed(2)}
            </div>
            <div class="footer">
                <p>Thank you for your business!</p>
            </div>
        </div>
    </body>
    </html>
    `;

    await page.setContent(htmlTemplate);
    const pdfBuffer = await page.pdf({ format: 'A4' });

    await browser.close();

    // Save the PDF to a file
    // Corrected: 'purchase-orders' to 'purchase_orders' to match frontend URL expectation
    const pdfDir = path.join(__dirname, '..', '..', '..', 'uploads', 'purchase_orders');
    if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
    }
    const pdfPath = path.join(pdfDir, `PO-${purchaseOrder.orderNumber}.pdf`);
    fs.writeFileSync(pdfPath, pdfBuffer);

    // Corrected: 'purchase-orders' to 'purchase_orders' in the returned path
    return `purchase_orders/PO-${purchaseOrder.orderNumber}.pdf`;
};

module.exports = generatePurchaseOrderPDF;
