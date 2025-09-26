[1mdiff --git a/manifest.json b/manifest.json[m
[1mindex 549819e..cd6d7c1 100644[m
[1m--- a/manifest.json[m
[1m+++ b/manifest.json[m
[36m@@ -63,7 +63,7 @@[m
           "sizes": "96x96"[m
         }[m
       ][m
[31m-    },[m
[32m+[m[32m    }[m
   ],[m
   "related_applications": [],[m
   "prefer_related_applications": false,[m
[1mdiff --git a/script.js b/script.js[m
[1mindex 1f6eb6f..0e60e73 100644[m
[1m--- a/script.js[m
[1m+++ b/script.js[m
[36m@@ -1394,347 +1394,203 @@[m [mclass CostCalculator {[m
         const inputs = this.getInputs();[m
         const { jsPDF } = window.jspdf;[m
         const doc = new jsPDF();[m
[32m+[m[32m        const pageWidth = doc.internal.pageSize.getWidth();[m
[32m+[m[32m        const margin = 20;[m
[32m+[m[32m        const primaryBlue = { r: 23, g: 64, b: 139 };[m
[32m+[m[32m        const darkBlue = { r: 12, g: 44, b: 103 };[m
[32m+[m[32m        const lightGray = { r: 245, g: 248, b: 252 };[m
[32m+[m[32m        const softBorder = { r: 216, g: 222, b: 233 };[m
 [m
[31m-        // Clean professional header[m
[31m-        doc.setFillColor(34, 197, 94); // Clean green[m
[31m-        doc.rect(0, 0, 210, 35, 'F');[m
[31m-        [m
[31m-        // Clean company branding[m
[32m+[m[32m        const quoteNum = `QUO-${Date.now().toString().slice(-6)}`;[m
[32m+[m
[32m+[m[32m        // Top header background[m
[32m+[m[32m        doc.setFillColor(primaryBlue.r, primaryBlue.g, primaryBlue.b);[m
[32m+[m[32m        doc.rect(margin - 10, 10, pageWidth - (margin - 10) * 2, 42, 'F');[m
[32m+[m
[32m+[m[32m        // Company branding[m
         doc.setTextColor(255, 255, 255);[m
[32m+[m[32m        doc.setFont('times', 'bold');[m
         doc.setFontSize(20);[m
[32m+[m[32m        doc.text('ANJANEYA BOREWELLS', margin, 30);[m
[32m+[m[32m        doc.setFont('times', 'italic');[m
[32m+[m[32m        doc.setFontSize(10);[m
[32m+[m[32m        doc.text('Professional Borewell Solutions | Makers of Green India', margin, 37);[m
[32m+[m
[32m+[m[32m        // Quotation meta[m
         doc.setFont('helvetica', 'bold');[m
[31m-        doc.text('ANJANEYA BOREWELLS', 20, 20);[m
[31m-        [m
[31m-        // Clean tagline[m
[31m-        doc.setFontSize(9);[m
[32m+[m[32m        doc.setFontSize(12);[m
[32m+[m[32m        doc.text('QUOTATION', pageWidth - margin, 23, { align: 'right' });[m
         doc.setFont('helvetica', 'normal');[m
[31m-        doc.text('Professional Borewell Solutions | Makers of Green India', 20, 26);[m
[31m-        [m
[31m-        // Clean contact information[m
[31m-        doc.setFontSize(8);[m
[31m-        doc.text('📞 +91 965 965 7777 | +91 944 33 73573', 20, 30);[m
[31m-        doc.text('📧 anjaneyaborewells@gmail.com', 20, 34);[m
[32m+[m[32m        doc.setFontSize(9);[m
[32m+[m[32m        doc.text(`Quote #: ${quoteNum}`, pageWidth - margin, 30, { align: 'right' });[m
[32m+[m[32m        doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - margin, 35, { align: 'right' });[m
[32m+[m[32m        doc.text(`Valid Until: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}`, pageWidth - margin, 40, { align: 'right' });[m
[32m+[m
[32m+[m[32m        let yPos = 64;[m
[32m+[m
[32m+[m[32m        // Bill to / payment info boxes[m
[32m+[m[32m        doc.setDrawColor(darkBlue.r, darkBlue.g, darkBlue.b);[m
[32m+[m[32m        doc.setLineWidth(0.6);[m
[32m+[m[32m        doc.rect(margin, yPos, 85, 34);[m
[32m+[m[32m        doc.rect(pageWidth - margin - 85, yPos, 85, 34);[m
[32m+[m
[32m+[m[32m        doc.setFont('times', 'bold');[m
[32m+[m[32m        doc.setFontSize(11);[m
[32m+[m[32m        doc.setTextColor(darkBlue.r, darkBlue.g, darkBlue.b);[m
[32m+[m[32m        doc.text('PROJECT SUMMARY', margin + 4, yPos + 6);[m
[32m+[m[32m        doc.text('PAYMENT INFORMATION', pageWidth - margin - 81, yPos + 6);[m
 [m
[31m-        // Clean quotation section[m
[32m+[m[32m        doc.setFont('helvetica', 'normal');[m
[32m+[m[32m        doc.setFontSize(9);[m
[32m+[m[32m        doc.setTextColor(40, 40, 40);[m
[32m+[m[32m        doc.text(`Total Depth: ${inputs.totalDepth} ft`, margin + 4, yPos + 13);[m
[32m+[m[32m        doc.text(`Base Rate: Rs.${inputs.drillingRate}/ft`, margin + 4, yPos + 19);[m
[32m+[m[32m        doc.text(`Drilling Type: ${inputs.drillingType === 'repair' ? 'Rebore (Repair)' : 'New Drilling'}`, margin + 4, yPos + 25);[m
[32m+[m[32m        doc.text(`PVC (7"/10"): ${inputs.pvc7Length} ft / ${inputs.pvc10Length} ft`, margin + 4, yPos + 31);[m
[32m+[m
[32m+[m[32m        doc.text('Bank: Anjaneya Corporate Account', pageWidth - margin - 81, yPos + 13);[m
[32m+[m[32m        doc.text('Name: Anjaneya Borewells', pageWidth - margin - 81, yPos + 19);[m
[32m+[m[32m        doc.text('Account: 1234 5678 9012', pageWidth - margin - 81, yPos + 25);[m
[32m+[m[32m        doc.text('IFSC: ANJA0012345', pageWidth - margin - 81, yPos + 31);[m
[32m+[m
[32m+[m[32m        yPos += 48;[m
[32m+[m
[32m+[m[32m        // Items table header[m
[32m+[m[32m        doc.setFillColor(darkBlue.r, darkBlue.g, darkBlue.b);[m
[32m+[m[32m        doc.setDrawColor(darkBlue.r, darkBlue.g, darkBlue.b);[m
[32m+[m[32m        doc.rect(margin, yPos, pageWidth - margin * 2, 10, 'F');[m
         doc.setTextColor(255, 255, 255);[m
[31m-        doc.setFontSize(12);[m
         doc.setFont('helvetica', 'bold');[m
[31m-        const quoteNum = `QUO-${Date.now().toString().slice(-6)}`;[m
[31m-        doc.text('QUOTATION', 140, 16);[m
[31m-        [m
[31m-        doc.setFontSize(9);[m
[32m+[m[32m        doc.setFontSize(10);[m
[32m+[m[32m        doc.text('DESCRIPTION', margin + 6, yPos + 7);[m
[32m+[m[32m        doc.text('RATE', pageWidth - margin - 36, yPos + 7);[m
[32m+[m[32m        doc.text('AMOUNT', pageWidth - margin - 6, yPos + 7, { align: 'right' });[m
[32m+[m
[32m+[m[32m        yPos += 14;[m
[32m+[m[32m        doc.setDrawColor(softBorder.r, softBorder.g, softBorder.b);[m
[32m+[m[32m        doc.setTextColor(40, 40, 40);[m
         doc.setFont('helvetica', 'normal');[m
[31m-        doc.text(`Quote #: ${quoteNum}`, 140, 22);[m
[31m-        doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 140, 28);[m
[31m-        doc.text(`Valid Until: ${new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('en-IN')}`, 140, 34);[m
[32m+[m[32m        doc.setFontSize(9);[m
 [m
[31m-        // Reset text color[m
[31m-        doc.setTextColor(0, 0, 0);[m
[32m+[m[32m        const tableWidth = pageWidth - margin * 2;[m
[32m+[m[32m        const tableStartY = yPos - 8;[m
 [m
[31m-        // Clean title[m
[31m-        doc.setFontSize(16);[m
[31m-        doc.setFont('helvetica', 'bold');[m
[31m-        doc.setTextColor(34, 197, 94);[m
[31m-        doc.text('BOREWELL COST ESTIMATE', 20, 50);[m
[31m-        [m
[31m-        // Clean underline[m
[31m-        doc.setDrawColor(34, 197, 94);[m
[31m-        doc.setLineWidth(2);[m
[31m-        doc.line(20, 52, 80, 52);[m
[32m+[m[32m        const addTableRow = (detail, rateText, amountText, highlight = false) => {[m
[32m+[m[32m            if (highlight) {[m
[32m+[m[32m                doc.setFillColor(lightGray.r, lightGray.g, lightGray.b);[m
[32m+[m[32m                doc.rect(margin, yPos - 5, tableWidth, 10, 'F');[m
[32m+[m[32m            }[m
[32m+[m[32m            doc.setDrawColor(softBorder.r, softBorder.g, softBorder.b);[m
[32m+[m[32m            doc.line(margin, yPos + 1, pageWidth - margin, yPos + 1);[m
 [m
[31m-        // Professional project details section[m
[31m-        let yPos = 70;[m
[31m-        [m
[31m-        // Clean section header[m
[31m-        doc.setFillColor(248, 250, 252);[m
[31m-        doc.rect(15, yPos - 5, 180, 10, 'F');[m
[31m-        doc.setDrawColor(34, 197, 94);[m
[31m-        doc.setLineWidth(1);[m
[31m-        doc.rect(15, yPos - 5, 180, 10);[m
[31m-        [m