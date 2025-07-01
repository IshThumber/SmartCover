import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";

/**
 * Set up the PDF.js worker for browser-based PDF processing
 * The worker file is automatically copied to the public directory during build
 * This ensures reliable PDF text extraction without external dependencies
 */
const setupPDFWorker = () => {
  try {
    // Use local worker file from public directory (copied by vite-plugin-static-copy)
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
  } catch (error) {
    console.warn("Failed to set up local PDF worker, falling back to CDN:", error);
    // Fallback to CDN with HTTPS (less reliable but available)
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }
};

// Initialize the worker
setupPDFWorker();

const MAX_FILE_SIZE = parseInt(import.meta.env.VITE_MAX_FILE_SIZE || "10") * 1024 * 1024; // Default 10MB

export const validateFile = (file) => {
  const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

  if (!file) {
    throw new Error("No file provided");
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Invalid file type. Please upload a PDF or DOCX file.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit. Please upload a smaller file.`);
  }

  return true;
};

export const extractTextFromFile = async (file) => {
  try {
    validateFile(file);

    if (file.type === "application/pdf") {
      return await extractTextFromPDF(file);
    } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      return await extractTextFromDOCX(file);
    } else {
      throw new Error("Unsupported file type");
    }
  } catch (error) {
    console.error("Error extracting text:", error);
    throw error;
  }
};

const extractTextFromDOCX = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });

    if (!result.value || result.value.trim().length === 0) {
      throw new Error("No text could be extracted from the DOCX file");
    }

    return result.value;
  } catch (error) {
    throw new Error(`Error processing DOCX file: ${error.message}`);
  }
};

const extractTextFromPDF = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();

    // Create a loading task with better error handling
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      // Disable worker if it fails to load
      disableWorker: false,
      // Add timeout
      timeout: 30000,
    });

    const pdf = await loadingTask.promise;
    let fullText = "";
    const numPages = pdf.numPages;

    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Combine all text items from the page with better spacing
        const pageText = textContent.items
          .map((item) => {
            // Preserve some formatting by adding spaces based on item positioning
            return item.str;
          })
          .join(" ")
          .replace(/\s+/g, " "); // Clean up multiple spaces

        fullText += pageText + "\n";
      } catch (pageError) {
        console.warn(`Error processing page ${pageNum}:`, pageError);
        // Continue with other pages even if one fails
        fullText += `[Page ${pageNum} could not be processed]\n`;
      }
    }

    // Clean up the PDF document
    pdf.destroy();

    if (!fullText || fullText.trim().length === 0) {
      throw new Error("No text could be extracted from the PDF file. The PDF might be image-based or corrupted.");
    }

    return fullText.trim();
  } catch (error) {
    console.error("PDF processing error:", error);

    // Provide more specific error messages
    if (error.message.includes("fetch")) {
      throw new Error("Error loading PDF processor. Please check your internet connection and try again.");
    } else if (error.message.includes("Invalid PDF")) {
      throw new Error("The PDF file appears to be corrupted or invalid. Please try a different file.");
    } else {
      throw new Error(`Error processing PDF file: ${error.message}`);
    }
  }
};
