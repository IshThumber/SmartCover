/**
 * Utility for managing persistent resume storage in the browser
 * Stores resume text and metadata in localStorage for reuse
 */

const STORAGE_KEY = "ai_cover_letter_resumes";
const MAX_RESUMES = 5; // Limit the number of stored resumes

export const resumeStorage = {
  // Get all saved resumes
  getSavedResumes: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error loading saved resumes:", error);
      return [];
    }
  },

  // Save a new resume
  saveResume: (resumeData) => {
    try {
      const saved = resumeStorage.getSavedResumes();
      const newResume = {
        id: Date.now().toString(),
        name: resumeData.name,
        fileName: resumeData.fileName,
        text: resumeData.text,
        fileSize: resumeData.fileSize,
        fileType: resumeData.fileType,
        savedAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
      };

      // Check if resume with same name already exists
      const existingIndex = saved.findIndex((resume) => resume.name === newResume.name);

      if (existingIndex !== -1) {
        // Update existing resume
        saved[existingIndex] = { ...saved[existingIndex], ...newResume, id: saved[existingIndex].id };
      } else {
        // Add new resume
        saved.unshift(newResume);

        // Keep only the most recent resumes
        if (saved.length > MAX_RESUMES) {
          saved.splice(MAX_RESUMES);
        }
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      return newResume.id;
    } catch (error) {
      console.error("Error saving resume:", error);
      throw new Error("Failed to save resume");
    }
  },

  // Get a specific resume by ID
  getResume: (id) => {
    const saved = resumeStorage.getSavedResumes();
    return saved.find((resume) => resume.id === id);
  },

  // Update last used time for a resume
  markAsUsed: (id) => {
    try {
      const saved = resumeStorage.getSavedResumes();
      const resumeIndex = saved.findIndex((resume) => resume.id === id);

      if (resumeIndex !== -1) {
        saved[resumeIndex].lastUsed = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      }
    } catch (error) {
      console.error("Error updating resume usage:", error);
    }
  },

  // Delete a resume
  deleteResume: (id) => {
    try {
      const saved = resumeStorage.getSavedResumes();
      const filtered = saved.filter((resume) => resume.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error("Error deleting resume:", error);
      return false;
    }
  },

  // Clear all saved resumes
  clearAll: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error("Error clearing resumes:", error);
      return false;
    }
  },

  // Get storage usage info
  getStorageInfo: () => {
    try {
      const saved = resumeStorage.getSavedResumes();
      const totalSize = saved.reduce((sum, resume) => sum + (resume.text?.length || 0), 0);
      return {
        count: saved.length,
        maxCount: MAX_RESUMES,
        totalSize,
        totalSizeKB: Math.round(totalSize / 1024),
      };
    } catch (error) {
      return { count: 0, maxCount: MAX_RESUMES, totalSize: 0, totalSizeKB: 0 };
    }
  },
};

// Helper function to format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Helper function to format date
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
