import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  Download,
  Mail,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle,
  FileDown,
  Database,
  History,
} from "lucide-react";
import { extractTextFromFile } from "../utils/fileProcessor";
import { generateCoverLetterWithGemini } from "../utils/geminiApi";
import { exportToPDF, exportToHTML, exportToWord, exportSelectablePDF } from "../utils/exportUtils";
import SavedResumesModal from "./SavedResumesModal";

const CoverLetterGenerator = () => {
  const [formData, setFormData] = useState({
    jobTitle: "",
    companyName: "",
    jobDescription: "",
    candidateName: "",
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [resumeName, setResumeName] = useState(""); // For displaying which resume is loaded
  const [showSavedResumesModal, setShowSavedResumesModal] = useState(false);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const fileInputRef = useRef(null);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file upload and text extraction
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setResumeFile(file);
    setResumeName(""); // Clear saved resume name when uploading new file
    setError("");
    setIsLoading(true);

    try {
      const extractedText = await extractTextFromFile(file);
      setResumeText(extractedText);
    } catch (err) {
      setError(err.message);
      setResumeFile(null);
      setResumeText("");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate cover letter using Gemini API with two-prompt approach
  const generateCoverLetter = async () => {
    setIsLoading(true);
    setError("");

    try {
      const aiResponse = await generateCoverLetterWithGemini(
        formData.jobTitle,
        formData.companyName,
        formData.jobDescription,
        resumeText,
        formData.candidateName
      );

      console.log("AI Response:", aiResponse);

      setGeneratedCoverLetter(aiResponse);
      setStep(3);
    } catch (err) {
      console.error("Error generating cover letter:", err);
      setError(err.message || "Failed to generate cover letter. Please check your API key and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (
      !formData.candidateName ||
      !formData.jobTitle ||
      !formData.companyName ||
      !formData.jobDescription ||
      !resumeText
    ) {
      setError("Please fill in all fields and upload your resume.");
      return;
    }
    setStep(2);
    generateCoverLetter();
  };

  // Enhanced download options
  const downloadCoverLetter = async (format = "html") => {
    try {
      const baseFilename = `${formData.companyName.replace(/\s+/g, "-")}-${formData.jobTitle.replace(
        /\s+/g,
        "-"
      )} - Cover Letter`;

      switch (format) {
        case "pdf":
          await exportToPDF(generatedCoverLetter, baseFilename);
          break;
        case "pdf-selectable":
          exportSelectablePDF(generatedCoverLetter, baseFilename);
          break;
        case "docx":
        case "word":
          await exportToWord(generatedCoverLetter, baseFilename);
          break;
        case "html":
        default:
          exportToHTML(generatedCoverLetter, baseFilename);
          break;
      }
    } catch (error) {
      setError(`Failed to download as ${format.toUpperCase()}: ${error.message}`);
    }
  };

  // Edit cover letter
  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleSaveEdit = () => {
    setIsEditMode(false);
  };

  const handleEditChange = (e) => {
    setGeneratedCoverLetter(e.target.value);
  };

  // Handle selecting a saved resume
  const handleSelectSavedResume = (savedResume) => {
    setResumeText(savedResume.text);
    setResumeName(savedResume.name);
    setResumeFile(null); // Clear file reference since we're using saved text
    setError("");
  };

  // Count words in the generated cover letter
  const getWordCount = (htmlContent) => {
    if (!htmlContent) return 0;
    // Remove HTML tags and count words
    const textContent = htmlContent.replace(/<[^>]*>/g, " ").trim();
    const words = textContent.split(/\s+/).filter((word) => word.length > 0);
    return words.length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">AI Cover Letter Generator</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Generate professional, personalized cover letters in seconds using AI
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${step >= 1 ? "text-indigo-600" : "text-gray-400"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 1 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                1
              </div>
              <span className="ml-2 text-sm font-medium">Input Details</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-200"></div>
            <div className={`flex items-center ${step >= 2 ? "text-indigo-600" : "text-gray-400"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 2 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                2
              </div>
              <span className="ml-2 text-sm font-medium">Generate</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-200"></div>
            <div className={`flex items-center ${step >= 3 ? "text-indigo-600" : "text-gray-400"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 3 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                3
              </div>
              <span className="ml-2 text-sm font-medium">Review & Download</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {step === 1 && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                <Mail className="w-6 h-6 text-indigo-600" />
                Enter Job Details
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Full Name *</label>
                  <input
                    type="text"
                    name="candidateName"
                    value={formData.candidateName}
                    onChange={handleInputChange}
                    placeholder="e.g., John Smith"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This will be used in the cover letter header and signature
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      placeholder="e.g., Frontend Developer"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="e.g., Google"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Description *</label>
                  <textarea
                    name="jobDescription"
                    value={formData.jobDescription}
                    onChange={handleInputChange}
                    placeholder="Paste the job description here..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Upload Resume *</label>
                    <button
                      type="button"
                      onClick={() => setShowSavedResumesModal(true)}
                      className="flex items-center gap-2 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Database className="w-4 h-4" />
                      Saved Resumes
                    </button>
                  </div>

                  {/* Display currently loaded resume info */}
                  {resumeName && (
                    <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700">
                        <History className="w-4 h-4" />
                        <span className="font-medium">Using saved resume: {resumeName}</span>
                      </div>
                    </div>
                  )}

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".pdf,.docx"
                      className="hidden"
                      disabled={isLoading}
                    />
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      {resumeFile
                        ? resumeFile.name
                        : resumeName
                        ? "Upload a new resume or use your saved one"
                        : "Click to upload your resume"}
                    </p>
                    <p className="text-sm text-gray-500">PDF or DOCX files only (max 10MB)</p>
                    <div className="flex gap-3 justify-center mt-4">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Processing...
                          </div>
                        ) : resumeFile ? (
                          "Change File"
                        ) : (
                          "Choose File"
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowSavedResumesModal(true)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                      >
                        <Database className="w-4 h-4" />
                        Saved Resumes
                      </button>
                    </div>
                  </div>
                  {resumeText && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Resume uploaded successfully!</span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">{resumeText.length} characters extracted</p>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-lg font-medium"
                >
                  <Sparkles className="w-5 h-5" />
                  Generate Cover Letter
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Generating Your Cover Letter</h2>
              <p className="text-gray-600 mb-4">
                Our AI is analyzing your resume and crafting a concise, professional cover letter (max 3 paragraphs, 300
                words) based on the job requirements...
              </p>
              <div className="max-w-md mx-auto bg-gray-200 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full animate-pulse" style={{ width: "70%" }}></div>
              </div>
              <p className="text-sm text-gray-500 mt-4">This usually takes 10-30 seconds</p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-indigo-600" />
                    Your Cover Letter
                  </h2>
                  <div className="flex gap-3">
                    <button
                      onClick={handleEdit}
                      className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      Edit
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => document.getElementById("download-menu").classList.toggle("hidden")}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div
                        id="download-menu"
                        className="hidden absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                      >
                        <button
                          onClick={() => {
                            downloadCoverLetter("pdf");
                            document.getElementById("download-menu").classList.add("hidden");
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 rounded-t-lg"
                        >
                          <FileDown className="w-4 h-4 text-red-600" />
                          PDF (Image-based)
                        </button>
                        <button
                          onClick={() => {
                            downloadCoverLetter("pdf-selectable");
                            document.getElementById("download-menu").classList.add("hidden");
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <FileDown className="w-4 h-4 text-red-500" />
                          PDF (Selectable Text)
                        </button>
                        <button
                          onClick={() => {
                            downloadCoverLetter("docx");
                            document.getElementById("download-menu").classList.add("hidden");
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <FileDown className="w-4 h-4 text-blue-600" />
                          Download as Word
                        </button>
                        <button
                          onClick={() => {
                            downloadCoverLetter("html");
                            document.getElementById("download-menu").classList.add("hidden");
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 rounded-b-lg"
                        >
                          <FileDown className="w-4 h-4 text-green-600" />
                          Download as HTML
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {isEditMode ? (
                  <div>
                    <textarea
                      value={generatedCoverLetter}
                      onChange={handleEditChange}
                      className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm"
                    />
                    {/* Word count in edit mode */}
                    <div className="mt-2 flex justify-between items-center text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <span>
                          Word count: <strong>{getWordCount(generatedCoverLetter)}</strong>/300
                        </span>
                        {getWordCount(generatedCoverLetter) > 300 && (
                          <span className="text-amber-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            Consider shortening for best impact
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                      <button
                        onClick={() => setIsEditMode(false)}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div
                      className="prose max-w-none border rounded-lg p-6 bg-gray-50"
                      dangerouslySetInnerHTML={{ __html: generatedCoverLetter }}
                    />
                    {/* Word count indicator */}
                    <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <span>
                          Word count: <strong>{getWordCount(generatedCoverLetter)}</strong>/300
                        </span>
                        {getWordCount(generatedCoverLetter) > 300 && (
                          <span className="text-amber-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            Exceeds recommended length
                          </span>
                        )}
                        {getWordCount(generatedCoverLetter) <= 300 && getWordCount(generatedCoverLetter) > 0 && (
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Perfect length
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">Professional cover letters should be concise</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center">
                <button
                  onClick={() => {
                    setStep(1);
                    setGeneratedCoverLetter("");
                    setFormData({ candidateName: "", jobTitle: "", companyName: "", jobDescription: "" });
                    setResumeFile(null);
                    setResumeText("");
                    setResumeName("");
                    setError("");
                  }}
                  className="px-6 py-3 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  Generate Another Cover Letter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Saved Resumes Modal */}
      <SavedResumesModal
        isOpen={showSavedResumesModal}
        onClose={() => setShowSavedResumesModal(false)}
        onSelectResume={handleSelectSavedResume}
        currentResumeText={resumeText}
      />
    </div>
  );
};

export default CoverLetterGenerator;
