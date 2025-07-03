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
    this.tokenClient = null;
    this.tokenExpiryTime = null;

    // Restore state from localStorage on initialization
    this.restoreState();
  }

  // Save state to localStorage
  saveState() {
    try {
      const state = {
        accessToken: this.accessToken,
        isSignedIn: this.isSignedIn,
        tokenExpiryTime: this.tokenExpiryTime,
        timestamp: Date.now(),
      };
      localStorage.setItem("driveApiState", JSON.stringify(state));
    } catch (error) {
      console.warn("Failed to save Drive API state:", error);
    }
  }

  // Restore state from localStorage
  restoreState() {
    try {
      const savedState = localStorage.getItem("driveApiState");
      if (savedState) {
        const state = JSON.parse(savedState);

        // Check if the saved state is not too old (24 hours)
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        if (Date.now() - state.timestamp < maxAge) {
          this.accessToken = state.accessToken;
          this.isSignedIn = state.isSignedIn;
          this.tokenExpiryTime = state.tokenExpiryTime;

          // Check if token has expired based on stored expiry time
          if (this.tokenExpiryTime && Date.now() >= this.tokenExpiryTime) {
            console.log("Stored token has expired, clearing state");
            this.clearState();
            return;
          }

          // Validate the token if it exists (async, but don't block initialization)
          if (this.accessToken) {
            this.validateStoredToken().catch((error) => {
              console.warn("Token validation failed during restore:", error);
            });
          }
        } else {
          // Clear old state
          this.clearState();
        }
      }
    } catch (error) {
      console.warn("Failed to restore Drive API state:", error);
      this.clearState();
    }
  }

  // Clear stored state
  clearState() {
    try {
      localStorage.removeItem("driveApiState");
    } catch (error) {
      console.warn("Failed to clear Drive API state:", error);
    }
    this.accessToken = null;
    this.isSignedIn = false;
    this.tokenExpiryTime = null;
  }

  // Validate stored token by making a test API call
  async validateStoredToken() {
    if (!this.accessToken) return false;

    try {
      const response = await fetch("https://www.googleapis.com/drive/v3/about?fields=user", {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (response.ok) {
        this.isSignedIn = true;
        this.saveState();
        return true;
      } else {
        // Token is invalid, clear state
        this.clearState();
        return false;
      }
    } catch (error) {
      console.warn("Token validation failed:", error);
      this.clearState();
      return false;
    }
  }

  // Initialize Google API with Google Identity Services
  async initializeGapi() {
    if (this.isInitialized) return true;

    try {
      // Load the Google API script and Google Identity Services
      if (!window.gapi) {
        await this.loadGapiScript();
      }

      if (!window.google) {
        await this.loadGoogleIdentityScript();
      }

      // Initialize the gapi client
      await new Promise((resolve, reject) => {
        window.gapi.load("client", {
          callback: resolve,
          onerror: reject,
        });
      });

      await window.gapi.client.init({
        apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
      });

      // Initialize the Google Identity Services token client
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: (response) => {
          if (response.access_token) {
            this.accessToken = response.access_token;
            this.isSignedIn = true;

            // Calculate token expiry time (Google tokens typically expire in 1 hour)
            this.tokenExpiryTime = Date.now() + (response.expires_in ? response.expires_in * 1000 : 3600000);

            // Save state to localStorage
            this.saveState();
            this.storeDriveConnectionStatus(true);
          }
        },
        error_callback: (error) => {
          console.error("OAuth error:", error);
          this.isSignedIn = false;
          this.accessToken = null;
          this.tokenExpiryTime = null;

          // Clear stored state on error
          this.clearState();

          // Handle verification error specifically
          if (
            error.message &&
            (error.message.includes("verification") ||
              error.message.includes("not completed") ||
              error.message.includes("access_blocked"))
          ) {
            console.warn("Google Drive access blocked due to app verification requirements");
          }
        },
      });

      this.gapi = window.gapi;
      this.isInitialized = true;

      return true;
    } catch (error) {
      console.error("Failed to initialize Google API:", error);
      throw new Error("Failed to initialize Google Drive API");
    }
  }

  // Load Google API script dynamically
  loadGapiScript() {
    return new Promise((resolve, reject) => {
      if (document.querySelector('script[src*="apis.google.com/js/api.js"]')) {
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

  // Load Google Identity Services script
  loadGoogleIdentityScript() {
    return new Promise((resolve, reject) => {
      if (document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Sign in to Google Drive using Google Identity Services
  async signInToDrive() {
    if (!this.isInitialized) {
      await this.initializeGapi();
    }

    try {
      if (!this.isSignedIn) {
        // Check if we have a valid token already
        if (this.accessToken) {
          try {
            // Test the token by making a simple API call
            const response = await fetch("https://www.googleapis.com/drive/v3/about?fields=user", {
              headers: {
                Authorization: `Bearer ${this.accessToken}`,
              },
            });

            if (response.ok) {
              this.isSignedIn = true;
              await this.storeDriveConnectionStatus(true);
              return true;
            }
          } catch (error) {
            // Token is invalid, need to request new one
            this.accessToken = null;
          }
        }

        // Request access token using Google Identity Services
        return new Promise((resolve, reject) => {
          this.tokenClient.callback = async (response) => {
            if (response.access_token) {
              this.accessToken = response.access_token;
              this.isSignedIn = true;
              await this.storeDriveConnectionStatus(true);
              resolve(true);
            } else {
              reject(new Error("Failed to get access token"));
            }
          };

          this.tokenClient.error_callback = (error) => {
            console.error("OAuth error:", error);

            // Handle specific Google verification errors
            if (
              error.message &&
              (error.message.includes("verification") ||
                error.message.includes("not completed") ||
                error.message.includes("access_blocked"))
            ) {
              reject(
                new Error(
                  "Google Drive access is currently unavailable due to app verification requirements. Please use local export options instead."
                )
              );
            } else if (error.type === "popup_blocked") {
              reject(new Error("Popup blocked. Please allow popups for this site and try again."));
            } else if (error.type === "popup_closed_by_user") {
              reject(new Error("Authentication cancelled by user."));
            } else {
              reject(new Error(`Authentication failed: ${error.type || error.message || "Unknown error"}`));
            }
          };

          // Request the token
          this.tokenClient.requestAccessToken({ prompt: "consent" });
        });
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

      // Check if token has expired based on stored time
      if (this.tokenExpiryTime && Date.now() >= this.tokenExpiryTime) {
        console.log("Token has expired, clearing state");
        this.clearState();
        await this.storeDriveConnectionStatus(false);
        return false;
      }

      if (this.accessToken) {
        // If token is expiring soon, warn but don't force re-auth yet
        if (this.isTokenExpiring()) {
          console.warn(`Token expiring in ${this.getTokenTimeRemaining()} minutes`);
        }

        try {
          // Test the token by making a simple API call
          const response = await fetch("https://www.googleapis.com/drive/v3/about?fields=user", {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
          });

          if (response.ok) {
            this.isSignedIn = true;
            // Update state to confirm token is still valid
            this.saveState();
            return true;
          } else {
            // Token is invalid
            console.log("Token validation failed, clearing state");
            this.clearState();
            await this.storeDriveConnectionStatus(false);
          }
        } catch (error) {
          console.log("Token validation error, clearing state:", error);
          this.clearState();
          await this.storeDriveConnectionStatus(false);
        }
      }

      return this.isSignedIn;
    } catch (error) {
      console.error("Error checking Drive connection:", error);
      return false;
    }
  }

  // Check if token needs to be refreshed (refresh 5 minutes before expiry)
  isTokenExpiring() {
    if (!this.tokenExpiryTime) return false;
    const fiveMinutesInMs = 5 * 60 * 1000;
    return Date.now() >= this.tokenExpiryTime - fiveMinutesInMs;
  }

  // Get time until token expires (in minutes)
  getTokenTimeRemaining() {
    if (!this.tokenExpiryTime) return 0;
    const timeRemaining = this.tokenExpiryTime - Date.now();
    return Math.max(0, Math.floor(timeRemaining / (60 * 1000)));
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
      if (!this.accessToken) {
        throw new Error("Not authenticated with Google Drive");
      }

      // First, search for existing SmartCover folder
      const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
        "name='SmartCover' and mimeType='application/vnd.google-apps.folder' and trashed=false"
      )}&fields=files(id,name)`;

      const searchResponse = await fetch(searchUrl, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (!searchResponse.ok) {
        throw new Error(`Search failed: ${searchResponse.statusText}`);
      }

      const searchResult = await searchResponse.json();

      if (searchResult.files && searchResult.files.length > 0) {
        return searchResult.files[0].id;
      }

      // Create SmartCover folder if it doesn't exist
      const folderMetadata = {
        name: "SmartCover",
        mimeType: "application/vnd.google-apps.folder",
      };

      const createResponse = await fetch("https://www.googleapis.com/drive/v3/files?fields=id", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(folderMetadata),
      });

      if (!createResponse.ok) {
        throw new Error(`Folder creation failed: ${createResponse.statusText}`);
      }

      const createResult = await createResponse.json();
      return createResult.id;
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
    // try {
    //   // Use html2pdf to generate PDF blob
    //   const element = document.createElement("div");
    //   element.innerHTML = htmlContent;

    //   const options = {
    //     margin: 1,
    //     filename: `${fileName}.pdf`,
    //     image: { type: "jpeg", quality: 0.98 },
    //     html2canvas: {
    //       scale: 2,
    //       useCORS: true,
    //       letterRendering: true,
    //     },
    //     jsPDF: {
    //       unit: "in",
    //       format: "letter",
    //       orientation: "portrait",
    //     },
    //   };

    //   // Generate PDF as blob
    //   const pdfBlob = await new Promise((resolve, reject) => {
    //     import("html2pdf.js").then((html2pdf) => {
    //       html2pdf.default().set(options).from(element).outputPdf("blob").then(resolve).catch(reject);
    //     });
    //   });

    //   // Upload to Drive
    //   const result = await this.uploadFileToDrive(pdfBlob, `${fileName}.pdf`, "application/pdf");

    //   return result;
    // } catch (error) {
    //   console.error("Error exporting PDF to Drive:", error);
    //   throw new Error("Failed to export PDF to Google Drive");
    // }

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
      // jsPDF setup
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      // Convert HTML to PDF
      await pdf.html(styledHtml, {
        x: 10,
        y: 10,
        width: 190,
        windowWidth: 650,
      });

      // Convert PDF to Blob
      const pdfBlob = pdf.output("blob");

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
        // With Google Identity Services, we revoke the token
        if (this.accessToken) {
          try {
            await fetch(`https://oauth2.googleapis.com/revoke?token=${this.accessToken}`, {
              method: "POST",
              headers: {
                "Content-type": "application/x-www-form-urlencoded",
              },
            });
          } catch (error) {
            console.warn("Error revoking token:", error);
            // Continue with logout even if revoke fails
          }
        }

        this.isSignedIn = false;
        this.accessToken = null;

        // Update connection status
        await this.storeDriveConnectionStatus(false);
      }
    } catch (error) {
      console.error("Error signing out from Drive:", error);
    }
  }

  // Check if Google Drive is available for this app
  async isDriveAvailable() {
    try {
      await this.initializeGapi();
      return true;
    } catch (error) {
      if (
        error.message &&
        (error.message.includes("verification") ||
          error.message.includes("not completed") ||
          error.message.includes("access_blocked"))
      ) {
        return false;
      }
      throw error;
    }
  }
}

// Create singleton instance
export const driveApi = new DriveApiManager();

// Export utility functions with verification check
export const exportToDrive = async (htmlContent, fileName, format = "pdf") => {
  try {
    // Check if Drive is available first
    const isAvailable = await driveApi.isDriveAvailable();
    if (!isAvailable) {
      throw new Error(
        "Google Drive export is currently unavailable due to app verification requirements. Please use local export options instead."
      );
    }

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
  try {
    const isAvailable = await driveApi.isDriveAvailable();
    if (!isAvailable) {
      return false;
    }
    return await driveApi.checkDriveConnection();
  } catch (error) {
    console.error("Error checking Drive connection:", error);
    return false;
  }
};

export const connectToDrive = async () => {
  try {
    const isAvailable = await driveApi.isDriveAvailable();
    if (!isAvailable) {
      throw new Error("Google Drive connection is currently unavailable due to app verification requirements.");
    }
    return await driveApi.signInToDrive();
  } catch (error) {
    console.error("Error connecting to Drive:", error);
    throw error;
  }
};

export const disconnectFromDrive = async () => {
  return await driveApi.signOutFromDrive();
};

export const getCoverLetterHistory = async () => {
  return await driveApi.getCoverLetterHistory();
};
