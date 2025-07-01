import React, { useState, useEffect } from "react";
import { Save, Trash2, Clock, FileText, Upload, X, Database } from "lucide-react";
import { resumeStorage, formatFileSize, formatDate } from "../utils/resumeStorage";

const SavedResumesModal = ({ isOpen, onClose, onSelectResume, currentResumeText }) => {
  const [savedResumes, setSavedResumes] = useState([]);
  const [resumeName, setResumeName] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [storageInfo, setStorageInfo] = useState({ count: 0, maxCount: 5, totalSizeKB: 0 });

  useEffect(() => {
    if (isOpen) {
      loadSavedResumes();
    }
  }, [isOpen]);

  const loadSavedResumes = () => {
    const resumes = resumeStorage.getSavedResumes();
    setSavedResumes(resumes);
    setStorageInfo(resumeStorage.getStorageInfo());
  };

  const handleSaveResume = () => {
    if (!resumeName.trim()) {
      alert("Please enter a name for your resume");
      return;
    }

    if (!currentResumeText) {
      alert("No resume content to save");
      return;
    }

    try {
      resumeStorage.saveResume({
        name: resumeName.trim(),
        fileName: "Current Resume",
        text: currentResumeText,
        fileSize: new Blob([currentResumeText]).size,
        fileType: "text/plain",
      });

      setResumeName("");
      setShowSaveForm(false);
      loadSavedResumes();
    } catch (error) {
      alert("Failed to save resume: " + error.message);
    }
  };

  const handleSelectResume = (resume) => {
    resumeStorage.markAsUsed(resume.id);
    onSelectResume(resume);
    onClose();
  };

  const handleDeleteResume = (id, event) => {
    event.stopPropagation();
    if (confirm("Are you sure you want to delete this resume?")) {
      resumeStorage.deleteResume(id);
      loadSavedResumes();
    }
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to delete all saved resumes? This cannot be undone.")) {
      resumeStorage.clearAll();
      loadSavedResumes();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Saved Resumes</h2>
            <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
              {storageInfo.count}/{storageInfo.maxCount}
            </span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Save Current Resume Section */}
          {currentResumeText && (
            <div className="mb-8 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
                  <Save className="w-5 h-5" />
                  Save Current Resume
                </h3>
                {!showSaveForm && (
                  <button
                    onClick={() => setShowSaveForm(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                  >
                    Save Resume
                  </button>
                )}
              </div>

              {showSaveForm && (
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={resumeName}
                    onChange={(e) => setResumeName(e.target.value)}
                    placeholder="Enter a name for this resume (e.g., 'Software Engineer Resume')"
                    className="flex-1 px-4 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    onKeyPress={(e) => e.key === "Enter" && handleSaveResume()}
                  />
                  <button
                    onClick={handleSaveResume}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowSaveForm(false);
                      setResumeName("");
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Saved Resumes List */}
          {savedResumes.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Your Saved Resumes</h3>
                <button
                  onClick={handleClearAll}
                  className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              </div>

              {savedResumes.map((resume) => (
                <div
                  key={resume.id}
                  onClick={() => handleSelectResume(resume)}
                  className="p-4 border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        <h4 className="font-semibold text-gray-900 group-hover:text-indigo-900">{resume.name}</h4>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          <span>Saved: {formatDate(resume.savedAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Last used: {formatDate(resume.lastUsed)}</span>
                        </div>
                      </div>

                      <div className="mt-2 text-sm text-gray-500">
                        {formatFileSize(resume.text?.length || 0)} • {resume.text?.length || 0} characters
                      </div>

                      {/* Preview of resume content */}
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700 line-clamp-2">{resume.text?.substring(0, 200)}...</p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteResume(resume.id, e)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-4"
                      title="Delete resume"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Storage Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  <p>
                    <strong>Storage Usage:</strong> {storageInfo.totalSizeKB} KB used
                  </p>
                  <p>
                    <strong>Resumes:</strong> {storageInfo.count} of {storageInfo.maxCount} slots used
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    Resumes are stored locally in your browser. They will persist between sessions but may be cleared if
                    you clear browser data.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Saved Resumes</h3>
              <p className="text-gray-600 mb-4">Upload and save your resumes to avoid re-uploading them every time.</p>
              {currentResumeText && (
                <button
                  onClick={() => setShowSaveForm(true)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Save Current Resume
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedResumesModal;
