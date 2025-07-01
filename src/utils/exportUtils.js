import html2pdf from "html2pdf.js";
import jsPDF from "jspdf";
import { Document, Paragraph, TextRun, HeadingLevel, Packer } from "docx";
import { saveAs } from "file-saver";

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

    // Extract content from HTML
    const headerElement = doc.querySelector(".header");
    const bodyElement = doc.querySelector(".body");
    const dateElement = doc.querySelector(".date");
    const recipientElement = doc.querySelector(".recipient");
    const subjectElement = doc.querySelector(".subject");

    const documentParagraphs = [];

    // Add header
    if (headerElement) {
      const nameElement = headerElement.querySelector("h2");
      if (nameElement) {
        documentParagraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: nameElement.textContent,
                bold: true,
                size: 28,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            alignment: "center",
          })
        );
      }

      const contactPs = headerElement.querySelectorAll("p");
      contactPs.forEach((p) => {
        if (p.textContent.trim()) {
          documentParagraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: p.textContent,
                  size: 20,
                }),
              ],
              alignment: "center",
            })
          );
        }
      });
    }

    // Add spacing
    documentParagraphs.push(new Paragraph({ children: [new TextRun({ text: "" })] }));

    // Add date
    if (dateElement) {
      documentParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: dateElement.textContent.trim(),
              size: 22,
            }),
          ],
        })
      );
    }

    // Add spacing
    documentParagraphs.push(new Paragraph({ children: [new TextRun({ text: "" })] }));

    // Add recipient
    if (recipientElement) {
      const recipientText = recipientElement.textContent.trim();
      recipientText.split("\n").forEach((line) => {
        if (line.trim()) {
          documentParagraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line.trim(),
                  size: 22,
                }),
              ],
            })
          );
        }
      });
    }

    // Add spacing
    documentParagraphs.push(new Paragraph({ children: [new TextRun({ text: "" })] }));

    // Add subject
    if (subjectElement) {
      documentParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: subjectElement.textContent.trim(),
              bold: true,
              size: 22,
            }),
          ],
        })
      );
    }

    // Add spacing
    documentParagraphs.push(new Paragraph({ children: [new TextRun({ text: "" })] }));

    // Add body content
    if (bodyElement) {
      const paragraphs = bodyElement.querySelectorAll("p");
      const lists = bodyElement.querySelectorAll("ul");

      // Process paragraphs
      paragraphs.forEach((p) => {
        if (p.textContent.trim()) {
          documentParagraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: p.textContent.trim(),
                  size: 22,
                }),
              ],
              spacing: {
                after: 200,
              },
            })
          );
        }
      });

      // Process lists
      lists.forEach((ul) => {
        const listItems = ul.querySelectorAll("li");
        listItems.forEach((li) => {
          if (li.textContent.trim()) {
            documentParagraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `• ${li.textContent.trim()}`,
                    size: 22,
                  }),
                ],
                spacing: {
                  after: 100,
                },
              })
            );
          }
        });
      });
    }

    // Create the document
    const wordDoc = new Document({
      sections: [
        {
          properties: {},
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
  } catch (error) {
    console.error("Error exporting to Word:", error);
    throw new Error("Failed to export to Word document");
  }
};

export const exportSelectablePDF = (htmlContent, filename = "cover-letter") => {
  try {
    const doc = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    });

    // Set font and styling
    doc.setFont("times", "normal");
    doc.setFontSize(12);

    // Margins and layout
    const marginLeft = 15;
    const marginRight = 15;
    const marginTop = 20;
    const maxLineWidth = 180; // A4 width (210mm) - left margin (15mm) - right margin (15mm)
    const lineHeight = 6;
    const pageHeight = 297; // A4 height in mm
    const marginBottom = 20;

    let currentY = marginTop;

    // Parse HTML content to extract structured information
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(htmlContent, "text/html");

    // Helper function to add text with proper spacing
    const addText = (text, fontSize = 12, isBold = false, alignment = "left", spacingAfter = 6) => {
      if (!text || !text.trim()) return;

      doc.setFontSize(fontSize);
      doc.setFont("times", isBold ? "bold" : "normal");

      const lines = doc.splitTextToSize(text.trim(), maxLineWidth);

      lines.forEach((line) => {
        // Check if we need a new page
        if (currentY > pageHeight - marginBottom) {
          doc.addPage();
          currentY = marginTop;
        }

        let xPosition = marginLeft;
        if (alignment === "center") {
          const textWidth = doc.getTextWidth(line);
          xPosition = (210 - textWidth) / 2; // Center on A4 page (210mm wide)
        }

        doc.text(line, xPosition, currentY);
        currentY += lineHeight;
      });

      currentY += spacingAfter;
    };

    // Extract and format header
    const headerElement = htmlDoc.querySelector(".cover-letter-header");
    if (headerElement) {
      // Candidate name
      const nameElement = headerElement.querySelector(".candidate-info h2");
      if (nameElement) {
        addText(nameElement.textContent, 16, true, "center", 4);
      }

      // Contact info
      const contactElement = headerElement.querySelector(".candidate-info p");
      if (contactElement) {
        addText(contactElement.textContent, 11, false, "center", 12);
      }

      // Date
      const dateElement = headerElement.querySelector(".date-section p");
      if (dateElement) {
        addText(dateElement.textContent, 12, false, "left", 12);
      }

      // Recipient
      const recipientElement = headerElement.querySelector(".recipient-info p");
      if (recipientElement) {
        const recipientText = recipientElement.innerHTML.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, "");
        addText(recipientText, 12, false, "left", 12);
      }
    }

    // Salutation
    const salutationElement = htmlDoc.querySelector(".salutation p");
    if (salutationElement) {
      addText(salutationElement.textContent, 12, false, "left", 8);
    }

    // Body content
    const bodyElement = htmlDoc.querySelector(".body-content");
    if (bodyElement) {
      const paragraphs = bodyElement.querySelectorAll("p");
      paragraphs.forEach((p, index) => {
        if (p.textContent.trim()) {
          addText(p.textContent, 12, false, "left", index < paragraphs.length - 1 ? 8 : 12);
        }
      });
    }

    // Closing
    const closingElement = htmlDoc.querySelector(".closing p");
    if (closingElement) {
      const closingText = closingElement.innerHTML.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, "");
      addText(closingText, 12, false, "left", 0);
    }

    doc.save(`${filename}.pdf`);
  } catch (error) {
    console.error("Error generating selectable PDF:", error);
    throw new Error("Failed to generate selectable text PDF");
  }
};
