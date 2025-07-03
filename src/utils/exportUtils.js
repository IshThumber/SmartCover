import html2pdf from "html2pdf.js";
import jsPDF from "jspdf";
import { Document, Paragraph, TextRun, HeadingLevel, Packer } from "docx";
import { saveAs } from "file-saver";
import { exportToDrive, checkDriveConnection } from "./driveApi";

export const exportToPDF = async (htmlContent, filename = "cover-letter") => {
  try {
    const element = document.createElement("div");
    element.innerHTML = htmlContent;

    const options = {
      margin: 1,
      filename: `${filename}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
      },
      jsPDF: {
        unit: "in",
        format: "letter",
        orientation: "portrait",
      },
    };

    return html2pdf().set(options).from(element).save();
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    throw new Error("Failed to export to PDF");
  }
};

export const exportToHTML = (htmlContent, filename = "cover-letter") => {
  try {
    const fullHtmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cover Letter</title>
    <style>
        body { 
            font-family: 'Times New Roman', serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 40px 20px; 
            line-height: 1.6; 
            color: #333;
            background: white;
        }
        .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 1px solid #eee;
            padding-bottom: 20px;
        }
        .header h2 { 
            margin: 0 0 10px 0; 
            font-size: 24px; 
            font-weight: bold;
        }
        .header p { 
            margin: 5px 0; 
            color: #666;
        }
        .date, .recipient, .subject { 
            margin-bottom: 20px; 
        }
        .subject strong {
            font-weight: bold;
        }
        .body p { 
            margin-bottom: 15px; 
            text-align: justify;
        }
        .body ul { 
            margin: 15px 0; 
            padding-left: 20px;
        }
        .body li { 
            margin-bottom: 8px; 
        }
        .signature {
            margin-top: 30px;
        }
        @media print {
            body { 
                padding: 20px; 
            }
        }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`;

    const blob = new Blob([fullHtmlContent], { type: "text/html" });
    saveAs(blob, `${filename}.html`);
  } catch (error) {
    console.error("Error exporting to HTML:", error);
    throw new Error("Failed to export to HTML");
  }
};

export const exportToWord = async (htmlContent, filename = "cover-letter") => {
  try {
    // Parse HTML content to extract text and structure
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");

    const documentParagraphs = [];

    // Helper function to create paragraphs from text
    const createParagraph = (text, options = {}) => {
      if (!text || !text.trim()) return null;

      return new Paragraph({
        children: [
          new TextRun({
            text: text.trim(),
            bold: options.bold || false,
            size: options.size || 22,
          }),
        ],
        alignment: options.alignment || "left",
        heading: options.heading || undefined,
        spacing: {
          after: options.spacingAfter || 200,
        },
      });
    };

    // Extract all text content and structure it properly
    const allElements = doc.body.querySelectorAll("*");
    let foundContent = false;

    // Try to find structured content first
    const headerElement = doc.querySelector(".cover-letter-header, .header");
    const bodyElement = doc.querySelector(".body, .body-content, .cover-letter-body");

    if (headerElement || bodyElement) {
      foundContent = true;

      // Process header
      if (headerElement) {
        const nameElements = headerElement.querySelectorAll("h1, h2, h3");
        nameElements.forEach((nameEl) => {
          const para = createParagraph(nameEl.textContent, {
            bold: true,
            size: 28,
            alignment: "center",
            heading: HeadingLevel.HEADING_1,
            spacingAfter: 100,
          });
          if (para) documentParagraphs.push(para);
        });

        const headerParagraphs = headerElement.querySelectorAll("p");
        headerParagraphs.forEach((p) => {
          const para = createParagraph(p.textContent, {
            size: 20,
            alignment: "center",
            spacingAfter: 100,
          });
          if (para) documentParagraphs.push(para);
        });
      }

      // Add spacing
      documentParagraphs.push(new Paragraph({ children: [new TextRun({ text: "" })] }));

      // Process body
      if (bodyElement) {
        const bodyParagraphs = bodyElement.querySelectorAll("p");
        bodyParagraphs.forEach((p) => {
          const para = createParagraph(p.textContent, {
            size: 22,
            spacingAfter: 200,
          });
          if (para) documentParagraphs.push(para);
        });

        // Process lists
        const lists = bodyElement.querySelectorAll("ul, ol");
        lists.forEach((list) => {
          const listItems = list.querySelectorAll("li");
          listItems.forEach((li) => {
            const para = createParagraph(`• ${li.textContent}`, {
              size: 22,
              spacingAfter: 100,
            });
            if (para) documentParagraphs.push(para);
          });
        });
      }
    }

    // Fallback: if no structured content found, process all paragraphs
    if (!foundContent) {
      const allParagraphs = doc.querySelectorAll("p");
      const allHeadings = doc.querySelectorAll("h1, h2, h3, h4, h5, h6");

      // Add headings first
      allHeadings.forEach((heading) => {
        const para = createParagraph(heading.textContent, {
          bold: true,
          size: 26,
          alignment: "center",
          heading: HeadingLevel.HEADING_1,
          spacingAfter: 150,
        });
        if (para) documentParagraphs.push(para);
      });

      // Add paragraphs
      allParagraphs.forEach((p) => {
        const para = createParagraph(p.textContent, {
          size: 22,
          spacingAfter: 200,
        });
        if (para) documentParagraphs.push(para);
      });

      // If still no content, use the raw text
      if (documentParagraphs.length === 0) {
        const textContent = doc.body.textContent || htmlContent.replace(/<[^>]*>/g, "");
        const lines = textContent.split("\n").filter((line) => line.trim());

        lines.forEach((line) => {
          const para = createParagraph(line, {
            size: 22,
            spacingAfter: 200,
          });
          if (para) documentParagraphs.push(para);
        });
      }
    }

    // Ensure we have at least one paragraph
    if (documentParagraphs.length === 0) {
      documentParagraphs.push(
        createParagraph("Cover Letter", {
          bold: true,
          size: 24,
          alignment: "center",
        })
      );
    }

    // Create the document with proper settings
    const wordDoc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440, // 1 inch in twentieths of a point
                right: 1440, // 1 inch
                bottom: 1440, // 1 inch
                left: 1440, // 1 inch
              },
            },
          },
          children: documentParagraphs,
        },
      ],
    });

    // Generate and save the document
    const buffer = await Packer.toBuffer(wordDoc);
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    saveAs(blob, `${filename}.docx`);
    return true;
  } catch (error) {
    console.error("Error exporting to Word:", error);
    throw new Error(`Failed to export to Word document: ${error.message}`);
  }
};

// export const exportSelectablePDF = (htmlContent, filename = "cover-letter") => {
//   try {
//     const doc = new jsPDF({
//       unit: "mm",
//       format: "a4",
//       orientation: "portrait",
//     });

//     // Set font and styling
//     doc.setFont("times", "normal");
//     doc.setFontSize(12);

//     // Margins and layout
//     const marginLeft = 15;
//     const marginRight = 15;
//     const marginTop = 20;
//     const maxLineWidth = 180; // A4 width (210mm) - left margin (15mm) - right margin (15mm)
//     const lineHeight = 6;
//     const pageHeight = 297; // A4 height in mm
//     const marginBottom = 20;

//     let currentY = marginTop;

//     // Parse HTML content to extract structured information
//     const parser = new DOMParser();
//     const htmlDoc = parser.parseFromString(htmlContent, "text/html");

//     // Helper function to add text with proper spacing
//     const addText = (text, fontSize = 12, isBold = false, alignment = "left", spacingAfter = 6) => {
//       if (!text || !text.trim()) return;

//       doc.setFontSize(fontSize);
//       doc.setFont("times", isBold ? "bold" : "normal");

//       const lines = doc.splitTextToSize(text.trim(), maxLineWidth);

//       lines.forEach((line) => {
//         // Check if we need a new page
//         if (currentY > pageHeight - marginBottom) {
//           doc.addPage();
//           currentY = marginTop;
//         }

//         let xPosition = marginLeft;
//         if (alignment === "center") {
//           const textWidth = doc.getTextWidth(line);
//           xPosition = (210 - textWidth) / 2; // Center on A4 page (210mm wide)
//         }

//         doc.text(line, xPosition, currentY);
//         currentY += lineHeight;
//       });

//       currentY += spacingAfter;
//     };

//     // Extract and format header
//     const headerElement = htmlDoc.querySelector(".cover-letter-header");
//     if (headerElement) {
//       // Candidate name
//       const nameElement = headerElement.querySelector(".candidate-info h2");
//       if (nameElement) {
//         addText(nameElement.textContent, 16, true, "center", 4);
//       }

//       // Contact info
//       const contactElement = headerElement.querySelector(".candidate-info p");
//       if (contactElement) {
//         addText(contactElement.textContent, 11, false, "center", 8);
//       }

//       // Date
//       const dateElement = headerElement.querySelector(".date-section p");
//       if (dateElement) {
//         addText(dateElement.textContent, 12, false, "left", 6);
//       }

//       // Recipient
//       const recipientElement = headerElement.querySelector(".recipient-info p");
//       if (recipientElement) {
//         const recipientText = recipientElement.innerHTML.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, "");
//         addText(recipientText, 12, false, "left", 6);
//       }
//     }

//     // Salutation
//     const salutationElement = htmlDoc.querySelector(".salutation p");
//     if (salutationElement) {
//       addText(salutationElement.textContent, 12, false, "left", 6);
//     }

//     // Body content
//     const bodyElement = htmlDoc.querySelector(".body-content");
//     if (bodyElement) {
//       const paragraphs = bodyElement.querySelectorAll("p");
//       paragraphs.forEach((p, index) => {
//         if (p.textContent.trim()) {
//           addText(p.textContent, 12, false, "left", index < paragraphs.length - 1 ? 6 : 8);
//         }
//       });
//     }

//     // Closing
//     const closingElement = htmlDoc.querySelector(".closing p");
//     if (closingElement) {
//       const closingText = closingElement.innerHTML.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, "");
//       addText(closingText, 12, false, "left", 0);
//     }

//     doc.save(`${filename}.pdf`);
//   } catch (error) {
//     console.error("Error generating selectable PDF:", error);
//     throw new Error("Failed to generate selectable text PDF");
//   }
// };

export const GeneratePDFFromHTMLDirect = async (htmlContent, filename = "document.pdf") => {
  if (typeof htmlContent !== "string") {
    throw new Error("Invalid HTML content: input must be a string.");
  }

  try {
    const aggressiveSpaceRegex = /[\s\u00A0\u2000-\u200A\u2028\u2029\u202F\u3000]+([@,])/g;

    const cleanedHtml = htmlContent
      .replace(aggressiveSpaceRegex, "$1")
      .replace(/\s*-\s*/g, "-")
      .replace(/\n/g, " ")
      .replace(/\s{2,}/g, " ");

    // Wrap cleaned HTML with a div to apply default font styling
    const styledHtml = `
      <div style="font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; color: #333;">
        ${cleanedHtml}
      </div>
    `;

    const pdf = new jsPDF();
    await pdf.html(styledHtml, {
      callback: function (doc) {
        doc.save(filename);
      },
      x: 10,
      y: 10,
      width: 190,
      windowWidth: 650,
    });

    return true;
  } catch (error) {
    console.error("Error during cleaning:", error);
    throw new Error("Failed to clean HTML");
  }
};

// Google Drive Export Functions
export const exportToDriveAsPDF = async (htmlContent, filename = "cover-letter") => {
  try {
    const isConnected = await checkDriveConnection();
    if (!isConnected) {
      throw new Error("Not connected to Google Drive. Please connect first.");
    }

    const result = await exportToDrive(htmlContent, filename, "pdf");
    return result;
  } catch (error) {
    console.error("Error exporting PDF to Drive:", error);
    throw new Error(`Failed to export PDF to Google Drive: ${error.message}`);
  }
};

export const exportToDriveAsDocx = async (htmlContent, filename = "cover-letter") => {
  try {
    const isConnected = await checkDriveConnection();
    if (!isConnected) {
      throw new Error("Not connected to Google Drive. Please connect first.");
    }

    const result = await exportToDrive(htmlContent, filename, "docx");
    return result;
  } catch (error) {
    console.error("Error exporting DOCX to Drive:", error);
    throw new Error(`Failed to export DOCX to Google Drive: ${error.message}`);
  }
};

export const exportToDriveAsHTML = async (htmlContent, filename = "cover-letter") => {
  try {
    const isConnected = await checkDriveConnection();
    if (!isConnected) {
      throw new Error("Not connected to Google Drive. Please connect first.");
    }

    // Create full HTML document
    const fullHtmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cover Letter</title>
    <style>
        body { 
            font-family: 'Times New Roman', serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 40px 20px; 
            line-height: 1.6; 
            color: #333;
            background: white;
        }
        .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 1px solid #eee;
            padding-bottom: 20px;
        }
        .header h2 { 
            margin: 0 0 10px 0; 
            font-size: 24px; 
            font-weight: bold;
        }
        .header p { 
            margin: 5px 0; 
            color: #666;
        }
        .date, .recipient, .subject { 
            margin-bottom: 20px; 
        }
        .subject strong {
            font-weight: bold;
        }
        .body p { 
            margin-bottom: 15px; 
            text-align: justify;
        }
        .body ul { 
            margin: 15px 0; 
            padding-left: 20px;
        }
        .body li { 
            margin-bottom: 8px; 
        }
        .signature {
            margin-top: 30px;
        }
        @media print {
            body { 
                padding: 20px; 
            }
        }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`;

    // Upload HTML file directly using driveApi
    const { driveApi } = await import("./driveApi");
    const result = await driveApi.uploadFileToDrive(fullHtmlContent, `${filename}.html`, "text/html");

    return result;
  } catch (error) {
    console.error("Error exporting HTML to Drive:", error);
    throw new Error(`Failed to export HTML to Google Drive: ${error.message}`);
  }
};

// Utility function to get export options based on Drive connection
export const getExportOptions = async () => {
  try {
    const isDriveConnected = await checkDriveConnection();

    const baseOptions = [
      { id: "pdf", label: "PDF (Download)", icon: "Download" },
      { id: "html", label: "HTML (Download)", icon: "Download" },
      { id: "docx", label: "Word Document (Download)", icon: "Download" },
      { id: "pdf-selectable", label: "PDF with Selectable Text (Download)", icon: "Download" },
      { id: "pdf-canvas", label: "PDF via Canvas (Download)", icon: "Download" },
      { id: "pdf-direct", label: "PDF Direct (Download)", icon: "Download" },
    ];

    if (isDriveConnected) {
      const driveOptions = [
        { id: "drive-pdf", label: "PDF to Google Drive", icon: "Cloud" },
        { id: "drive-docx", label: "Word Document to Google Drive", icon: "Cloud" },
        { id: "drive-html", label: "HTML to Google Drive", icon: "Cloud" },
      ];
      return [...driveOptions, ...baseOptions];
    }

    return baseOptions;
  } catch (error) {
    console.error("Error getting export options:", error);
    return [
      { id: "pdf", label: "PDF (Download)", icon: "Download" },
      { id: "html", label: "HTML (Download)", icon: "Download" },
      { id: "docx", label: "Word Document (Download)", icon: "Download" },
    ];
  }
};
