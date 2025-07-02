import { supabase } from "./supabase";

// Google Drive API configuration
const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";
const SCOPES = "https://www.googleapis.com/auth/drive.file";

class DriveApiManager {
  constructor() {
    this.gapi = null;
    this.isInitialized = false;
    this.isSignedIn = false;
    this.accessToken = null;
  }

  // Initialize Google API
  async initializeGapi() {
    if (this.isInitialized) return true;

    try {
      // Load the Google API script
      if (!window.gapi) {
        await this.loadGapiScript();
      }

      await new Promise((resolve, reject) => {
        window.gapi.load("client:auth2", {
          callback: resolve,
          onerror: reject,
        });
      });

      await window.gapi.client.init({
        apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        discoveryDocs: [DISCOVERY_DOC],
        scope: SCOPES,
      });

      this.gapi = window.gapi;
      this.isInitialized = true;
      this.isSignedIn = this.gapi.auth2.getAuthInstance().isSignedIn.get();

      if (this.isSignedIn) {
        this.accessToken = this.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
      }

      return true;
    } catch (error) {
      console.error("Failed to initialize Google API:", error);
      throw new Error("Failed to initialize Google Drive API");
    }
  }

  // Load Google API script dynamically
  loadGapiScript() {
    return new Promise((resolve, reject) => {
      if (document.querySelector('script[src*="apis.google.com"]')) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/api.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Sign in to Google Drive
  async signInToDrive() {
    if (!this.isInitialized) {
      await this.initializeGapi();
    }

    try {
      const authInstance = this.gapi.auth2.getAuthInstance();

      if (!this.isSignedIn) {
        const user = await authInstance.signIn();
        this.isSignedIn = true;
        this.accessToken = user.getAuthResponse().access_token;

        // Store Drive connection status in Supabase
        await this.storeDriveConnectionStatus(true);
      }

      return true;
    } catch (error) {
      console.error("Failed to sign in to Google Drive:", error);
      throw new Error("Failed to authenticate with Google Drive");
    }
  }

  // Check if user is signed in to Drive
  async checkDriveConnection() {
    try {
      if (!this.isInitialized) {
        await this.initializeGapi();
      }

      const authInstance = this.gapi.auth2.getAuthInstance();
      this.isSignedIn = authInstance.isSignedIn.get();

      if (this.isSignedIn) {
        this.accessToken = authInstance.currentUser.get().getAuthResponse().access_token;
      }

      return this.isSignedIn;
    } catch (error) {
      console.error("Error checking Drive connection:", error);
      return false;
    }
  }

  // Store Drive connection status in Supabase
  async storeDriveConnectionStatus(isConnected) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("user_settings").upsert(
        {
          user_id: user.id,
          drive_connected: isConnected,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

      if (error) {
        console.error("Error storing Drive connection status:", error);
      }
    } catch (error) {
      console.error("Error updating Drive connection status:", error);
    }
  }

  // Get or create SmartCover folder
  async getOrCreateSmartCoverFolder() {
    try {
      // First, search for existing SmartCover folder
      const searchResponse = await this.gapi.client.drive.files.list({
        q: "name='SmartCover' and mimeType='application/vnd.google-apps.folder' and trashed=false",
        fields: "files(id, name)",
      });

      if (searchResponse.result.files && searchResponse.result.files.length > 0) {
        return searchResponse.result.files[0].id;
      }

      // Create SmartCover folder if it doesn't exist
      const folderMetadata = {
        name: "SmartCover",
        mimeType: "application/vnd.google-apps.folder",
      };

      const createResponse = await this.gapi.client.drive.files.create({
        resource: folderMetadata,
        fields: "id",
      });

      return createResponse.result.id;
    } catch (error) {
      console.error("Error creating/finding SmartCover folder:", error);
      throw new Error("Failed to access SmartCover folder in Google Drive");
    }
  }

  // Upload file to Google Drive
  async uploadFileToDrive(fileContent, fileName, mimeType = "application/pdf") {
    try {
      if (!this.isSignedIn) {
        await this.signInToDrive();
      }

      const folderId = await this.getOrCreateSmartCoverFolder();

      // Convert content to blob if it's not already
      let blob;
      if (fileContent instanceof Blob) {
        blob = fileContent;
      } else if (typeof fileContent === "string") {
        blob = new Blob([fileContent], { type: mimeType });
      } else {
        blob = new Blob([fileContent], { type: mimeType });
      }

      // Create form data for multipart upload
      const metadata = {
        name: fileName,
        parents: [folderId],
      };

      const form = new FormData();
      form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
      form.append("file", blob);

      // Upload using fetch since gapi doesn't handle multipart uploads well
      const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: form,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Save to cover letter history
      await this.saveToCoverLetterHistory(fileName, result.id);

      return {
        success: true,
        fileId: result.id,
        fileName: fileName,
        driveUrl: `https://drive.google.com/file/d/${result.id}/view`,
      };
    } catch (error) {
      console.error("Error uploading to Drive:", error);
      throw new Error(`Failed to upload to Google Drive: ${error.message}`);
    }
  }

  // Save cover letter to history
  async saveToCoverLetterHistory(fileName, driveFileId = null) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("cover_letter_history").insert({
        user_id: user.id,
        file_name: fileName,
        drive_file_id: driveFileId,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error saving to cover letter history:", error);
      }
    } catch (error) {
      console.error("Error saving cover letter history:", error);
    }
  }

  // Export cover letter as PDF to Drive
  async exportPDFToDrive(htmlContent, fileName) {
    try {
      // Use html2pdf to generate PDF blob
      const element = document.createElement("div");
      element.innerHTML = htmlContent;

      const options = {
        margin: 1,
        filename: `${fileName}.pdf`,
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

      // Generate PDF as blob
      const pdfBlob = await new Promise((resolve, reject) => {
        import("html2pdf.js").then((html2pdf) => {
          html2pdf.default().set(options).from(element).outputPdf("blob").then(resolve).catch(reject);
        });
      });

      // Upload to Drive
      const result = await this.uploadFileToDrive(pdfBlob, `${fileName}.pdf`, "application/pdf");

      return result;
    } catch (error) {
      console.error("Error exporting PDF to Drive:", error);
      throw new Error("Failed to export PDF to Google Drive");
    }
  }

  // Export cover letter as DOCX to Drive
  async exportDocxToDrive(htmlContent, fileName) {
    try {
      // Convert HTML to DOCX format (simplified)
      const { Document, Paragraph, TextRun, Packer } = await import("docx");

      // Parse HTML content to text (simplified)
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = htmlContent;
      const textContent = tempDiv.textContent || tempDiv.innerText || "";

      // Split into paragraphs
      const paragraphs = textContent
        .split("\n")
        .filter((p) => p.trim())
        .map(
          (text) =>
            new Paragraph({
              children: [new TextRun(text.trim())],
            })
        );

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: paragraphs,
          },
        ],
      });

      const docxBlob = await Packer.toBlob(doc);

      // Upload to Drive
      const result = await this.uploadFileToDrive(
        docxBlob,
        `${fileName}.docx`,
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );

      return result;
    } catch (error) {
      console.error("Error exporting DOCX to Drive:", error);
      throw new Error("Failed to export DOCX to Google Drive");
    }
  }

  // Get user's cover letter history from Drive
  async getCoverLetterHistory() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("cover_letter_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching cover letter history:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error getting cover letter history:", error);
      return [];
    }
  }

  // Sign out from Drive
  async signOutFromDrive() {
    try {
      if (this.isInitialized && this.isSignedIn) {
        const authInstance = this.gapi.auth2.getAuthInstance();
        await authInstance.signOut();
        this.isSignedIn = false;
        this.accessToken = null;

        // Update connection status
        await this.storeDriveConnectionStatus(false);
      }
    } catch (error) {
      console.error("Error signing out from Drive:", error);
    }
  }
}

// Create singleton instance
export const driveApi = new DriveApiManager();

// Export utility functions
export const exportToDrive = async (htmlContent, fileName, format = "pdf") => {
  try {
    if (format === "pdf") {
      return await driveApi.exportPDFToDrive(htmlContent, fileName);
    } else if (format === "docx") {
      return await driveApi.exportDocxToDrive(htmlContent, fileName);
    } else {
      throw new Error("Unsupported format for Drive export");
    }
  } catch (error) {
    console.error("Error exporting to Drive:", error);
    throw error;
  }
};

export const checkDriveConnection = async () => {
  return await driveApi.checkDriveConnection();
};

export const connectToDrive = async () => {
  return await driveApi.signInToDrive();
};

export const disconnectFromDrive = async () => {
  return await driveApi.signOutFromDrive();
};

export const getCoverLetterHistory = async () => {
  return await driveApi.getCoverLetterHistory();
};
