import React, { useState, useRef, useEffect } from "react";
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
  LogOut,
  Settings,
  User,
  Cloud,
  CloudOff,
} from "lucide-react";
import { extractTextFromFile } from "../utils/fileProcessor";
import { generateCoverLetterWithGemini } from "../utils/geminiApi";
import {
  // exportToPDF,
  exportToHTML,
  exportToWord,
  // exportSelectablePDF,
  GeneratePDFFromHTMLDirect,
  exportToDriveAsPDF,
  exportToDriveAsDocx,
  exportToDriveAsHTML,
  getExportOptions,
} from "../utils/exportUtils";
import { checkDriveConnection } from "../utils/driveApi";
import SavedResumesModal from "./SavedResumesModal";
import ModelSelector from "./ModelSelector";
import DriveConnectionManager from "./DriveConnectionManager";
import { useAuth } from "../contexts/AuthContext";

const CoverLetterGenerator = ({ apiKey }) => {
  const { user, signOut } = useAuth();
  const [selectedModel, setSelectedModel] = useState("gemini-1.5-flash");
  const [showModelSelector, setShowModelSelector] = useState(false);
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
  const [isDriveConnected, setIsDriveConnected] = useState(false);
  const [showDriveManager, setShowDriveManager] = useState(false);
  const [exportOptions, setExportOptions] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef(null);

  // Check Drive connection status on component mount and set up periodic checks
  useEffect(() => {
    checkDriveStatus();
    loadExportOptions();

    // Set up periodic Drive connection check (every 5 minutes)
    const connectionCheckInterval = setInterval(() => {
      checkDriveStatus();
    }, 5 * 60 * 1000); // 5 minutes

    // Cleanup interval on unmount
    return () => {
      clearInterval(connectionCheckInterval);
    };
  }, []);

  // Update export options when Drive connection changes
  useEffect(() => {
    loadExportOptions();
  }, [isDriveConnected]);

  // Prevent body scroll when modals are open
  useEffect(() => {
    const isModalOpen = showModelSelector || showDriveManager || showSavedResumesModal;
    if (isModalOpen) {
      document.body.style.overflow = "hidden";

      // Handle escape key to close modals
      const handleEscape = (e) => {
        if (e.key === "Escape") {
          setShowModelSelector(false);
          setShowDriveManager(false);
          setShowSavedResumesModal(false);
        }
      };

      document.addEventListener("keydown", handleEscape);

      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "unset";
      };
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showModelSelector, showDriveManager, showSavedResumesModal]);

  const checkDriveStatus = async () => {
    try {
      const connected = await checkDriveConnection();
      setIsDriveConnected(connected);

      // Log connection status for debugging
      console.log('Drive connection status:', connected);
    } catch (error) {
      console.error("Error checking Drive status:", error);
      setIsDriveConnected(false);
    }
  };

  const loadExportOptions = async () => {
    try {
      const options = await getExportOptions();
      setExportOptions(options);
    } catch (error) {
      console.error("Error loading export options:", error);
      setExportOptions([
        { id: "pdf", label: "PDF (Download)", icon: "Download" },
        { id: "html", label: "HTML (Download)", icon: "Download" },
        { id: "docx", label: "Word Document (Download)", icon: "Download" },
      ]);
    }
  };

  const handleDriveConnectionChange = (connected) => {
    setIsDriveConnected(connected);
  };

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
      // const aiResponse = await generateCoverLetterWithGemini(
      //   formData.jobTitle,
      //   formData.companyName,
      //   formData.jobDescription,
      //   resumeText,
      //   formData.candidateName,
      //   apiKey,
      //   selectedModel
      // );

      const aiResponse = `
            <div class="cover-letter-header">
        <div class="candidate-info">
          <h2>Ish Thumber</h2>
          <p>ishthumber343@gmail.com | 9909919803</p>
        </div>
        <div class="date-section">
          <p>July 2, 2025</p>
        </div>
        <div class="recipient-info">
          <p>Hiring Manager<br>
          SpotDraft<br>
          [Company Address]</p>
        </div>
      </div>
      <div class="salutation">
        <p>Dear Hiring Manager,</p>
      </div>
      <div class="body-content">
      <p>I am writing to express my strong interest in the Cloud Engineer position at SpotDraft. As an AWS Community Builder with proven experience in architecting secure, scalable multi-cloud infrastructure and robust CI/CD pipelines, I am confident I possess the skills to contribute to your innovative contract management platform and help drive its reliability and performance.</p>
      <p>At Searce Inc., I architected highly available API gateways handling millions of requests and designed secure private API connectivity using Private Service Connect and VPC Service Controls to safeguard sensitive data. I have a strong record of driving efficiency, having built a multi-account Terraform pipeline that reduced manual infrastructure provisioning by 70%. My expertise in implementing firewall solutions and building comprehensive observability stacks further ensures a foundation of security and 99%+ uptime, which I believe is critical for a platform like SpotDraft.</p>
      <p>I am excited by SpotDraft's mission to streamline the contract lifecycle and am eager to apply my automation and security skills to enhance your platform. Thank you for your time and consideration. I look forward to discussing how my experience building resilient cloud systems can be a valuable asset to your team.</p>
      </div>
      <div class="closing">
        <p>Sincerely,<br>
        Ish Thumber</p>
      </div>`;

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

  // Enhanced download options with Drive support
  const downloadCoverLetter = async (format = "html") => {
    setIsExporting(true);
    setError("");

    try {
      const baseFilename = `${formData.companyName.replace(/\s+/g, "-")}-${formData.jobTitle.replace(
        /\s+/g,
        "-"
      )} - Cover Letter`;

      switch (format) {
        // Google Drive exports
        case "drive-pdf":
          const pdfResult = await exportToDriveAsPDF(generatedCoverLetter, baseFilename);
          alert(
            `✓ Cover letter exported to Google Drive successfully!\nFile: ${pdfResult.fileName}\nView: ${pdfResult.driveUrl}`
          );
          break;
        case "drive-docx":
          const docxResult = await exportToDriveAsDocx(generatedCoverLetter, baseFilename);
          alert(
            `✓ Cover letter exported to Google Drive successfully!\nFile: ${docxResult.fileName}\nView: ${docxResult.driveUrl}`
          );
          break;
        case "drive-html":
          const htmlResult = await exportToDriveAsHTML(generatedCoverLetter, baseFilename);
          alert(
            `✓ Cover letter exported to Google Drive successfully!\nFile: ${htmlResult.fileName}\nView: ${htmlResult.driveUrl}`
          );
          break;

        // Local downloads
        case "pdf-direct":
          await GeneratePDFFromHTMLDirect(generatedCoverLetter, `${baseFilename}.pdf`);
          break;
        case "pdf":
          await exportToPDF(generatedCoverLetter, baseFilename);
          break;
        case "pdf-selectable":
          await exportSelectablePDF(generatedCoverLetter, baseFilename);
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
      console.error(`Export error for ${format}:`, error);
      if (format.startsWith("drive-")) {
        if (error.message.includes("verification") || error.message.includes("app verification")) {
          setError(
            `Google Drive export is currently unavailable due to app verification requirements. Please use the local download options below instead.`
          );
        } else {
          setError(`Failed to export to Google Drive: ${error.message}`);
        }
      } else {
        setError(`Failed to download as ${format.toUpperCase()}: ${error.message}`);
      }
    } finally {
      setIsExporting(false);
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* User Header - Responsive */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 sm:mb-8">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              {/* User Info - Mobile First */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                    {user?.user_metadata?.full_name || user?.email}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500">
                    <span className="font-medium">Model: {selectedModel}</span>
                    <span className="hidden sm:inline">•</span>
                    <div className="flex items-center gap-1">
                      {isDriveConnected ? (
                        <Cloud className="w-3 h-3 text-green-500" />
                      ) : (
                        <CloudOff className="w-3 h-3 text-gray-400" />
                      )}
                      <span className="truncate">{isDriveConnected ? "Drive Connected" : "Drive Disconnected"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Responsive Stack */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => setShowDriveManager(!showDriveManager)}
                  className={`flex items-center justify-center sm:justify-start gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${isDriveConnected
                      ? "text-green-700 bg-green-50 hover:bg-green-100 border border-green-200"
                      : "text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200"
                    }`}
                >
                  {isDriveConnected ? <Cloud className="w-4 h-4" /> : <CloudOff className="w-4 h-4" />}
                  <span className="hidden sm:inline">Drive</span>
                  <span className="sm:hidden">{isDriveConnected ? "Connected" : "Connect Drive"}</span>
                </button>
                <button
                  onClick={() => setShowModelSelector(!showModelSelector)}
                  className="flex items-center justify-center sm:justify-start gap-2 px-3 py-2 text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200 text-sm font-medium"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Settings</span>
                  <span className="sm:hidden">AI Model</span>
                </button>
                <button
                  onClick={signOut}
                  className="flex items-center justify-center sm:justify-start gap-2 px-3 py-2 text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all duration-200 text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                  <span className="sm:hidden">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Model Selector Modal - Responsive */}
        {showModelSelector && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowModelSelector(false);
              }
            }}
          >
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl sm:w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">AI Model Settings</h3>
                  <p className="text-sm text-gray-500 mt-1">Choose your preferred AI model</p>
                </div>
                <button
                  onClick={() => setShowModelSelector(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4 sm:p-6 max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)] overflow-y-auto">
                <ModelSelector
                  selectedModel={selectedModel}
                  onModelChange={(model) => {
                    setSelectedModel(model);
                    setShowModelSelector(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Drive Connection Manager Modal - Responsive */}
        {showDriveManager && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowDriveManager(false);
              }
            }}
          >
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl sm:w-full max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Google Drive Integration</h3>
                  <p className="text-sm text-gray-500 mt-1">Connect your Google Drive to save cover letters</p>
                </div>
                <button
                  onClick={() => setShowDriveManager(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4 sm:p-6 max-h-[calc(90vh-80px)] overflow-y-auto">
                <DriveConnectionManager onConnectionChange={handleDriveConnectionChange} />
              </div>
            </div>
          </div>
        )}

        {/* Header - Responsive Hero Section */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-indigo-600" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
              AI Cover Letter Generator
            </h1>
          </div>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl lg:max-w-3xl mx-auto px-4">
            Generate professional, personalized cover letters in seconds using AI
          </p>
        </div>

        {/* Progress Steps - Responsive */}
        <div className="flex justify-center mb-8 sm:mb-12 overflow-x-auto pb-2">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-max px-4">
            <div className={`flex items-center ${step >= 1 ? "text-indigo-600" : "text-gray-400"}`}>
              <div
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${step >= 1 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"
                  }`}
              >
                1
              </div>
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium whitespace-nowrap">Input Details</span>
            </div>
            <div className="w-8 sm:w-16 h-0.5 bg-gray-200"></div>
            <div className={`flex items-center ${step >= 2 ? "text-indigo-600" : "text-gray-400"}`}>
              <div
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${step >= 2 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"
                  }`}
              >
                2
              </div>
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium whitespace-nowrap">Generate</span>
            </div>
            <div className="w-8 sm:w-16 h-0.5 bg-gray-200"></div>
            <div className={`flex items-center ${step >= 3 ? "text-indigo-600" : "text-gray-400"}`}>
              <div
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${step >= 3 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"
                  }`}
              >
                3
              </div>
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium whitespace-nowrap">Review & Export</span>
            </div>
          </div>
        </div>

        {/* Main Content - Responsive Grid Layout */}
        <div className="max-w-7xl mx-auto">
          {step === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              {/* Form Section */}
              <div className="lg:col-span-8">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                  {/* Form Header */}
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                      <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
                      Enter Job Details
                    </h2>
                    <p className="text-indigo-100 text-sm sm:text-base mt-1">
                      Fill in the details to generate your perfect cover letter
                    </p>
                  </div>

                  {/* Form Content */}
                  <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                    {/* Candidate Name */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Your Full Name *</label>
                      <input
                        type="text"
                        name="candidateName"
                        value={formData.candidateName}
                        onChange={handleInputChange}
                        placeholder="e.g., John Smith"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base transition-all duration-200"
                        required
                      />
                      <p className="text-xs sm:text-sm text-gray-500">
                        This will be used in the cover letter header and signature
                      </p>
                    </div>

                    {/* Job Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Job Title *</label>
                        <input
                          type="text"
                          name="jobTitle"
                          value={formData.jobTitle}
                          onChange={handleInputChange}
                          placeholder="e.g., Frontend Developer"
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base transition-all duration-200"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Company Name *</label>
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          placeholder="e.g., Google"
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base transition-all duration-200"
                          required
                        />
                      </div>
                    </div>

                    {/* Job Description */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Job Description *</label>
                      <textarea
                        name="jobDescription"
                        value={formData.jobDescription}
                        onChange={handleInputChange}
                        placeholder="Paste the job description here..."
                        rows={5}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base transition-all duration-200 resize-y"
                        required
                      />
                    </div>

                    {/* Resume Upload Section */}
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <label className="block text-sm font-semibold text-gray-700">Upload Resume *</label>
                        <button
                          type="button"
                          onClick={() => setShowSavedResumesModal(true)}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-all duration-200 self-start sm:self-auto"
                        >
                          <Database className="w-4 h-4" />
                          <span className="whitespace-nowrap">Saved Resumes</span>
                        </button>
                      </div>

                      {/* Resume Status Display */}
                      {resumeName && (
                        <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 text-green-700">
                            <History className="w-4 h-4 flex-shrink-0" />
                            <span className="font-medium text-sm sm:text-base">Using saved resume: {resumeName}</span>
                          </div>
                        </div>
                      )}

                      {/* Upload Area */}
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 lg:p-8 text-center hover:border-indigo-400 transition-all duration-200 bg-gray-50 hover:bg-gray-100">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept=".pdf,.docx"
                          className="hidden"
                          disabled={isLoading}
                        />
                        <Upload className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                        <p className="text-gray-600 mb-2 text-sm sm:text-base font-medium">
                          {resumeFile
                            ? resumeFile.name
                            : resumeName
                              ? "Upload a new resume or use your saved one"
                              : "Click to upload your resume"}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 mb-4">PDF or DOCX files only (max 10MB)</p>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading}
                            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base"
                          >
                            {isLoading ? (
                              <div className="flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Processing...</span>
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
                            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
                          >
                            <Database className="w-4 h-4" />
                            <span>Saved Resumes</span>
                          </button>
                        </div>
                      </div>

                      {/* Resume Success State */}
                      {resumeText && (
                        <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                            <span className="font-medium text-sm sm:text-base">Resume uploaded successfully!</span>
                          </div>
                          <p className="text-xs sm:text-sm text-green-600 mt-1">
                            {resumeText.length} characters extracted
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Error Display */}
                    {error && (
                      <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span className="text-sm sm:text-base">{error}</span>
                      </div>
                    )}

                    {/* Generate Button */}
                    <button
                      onClick={handleSubmit}
                      disabled={
                        isLoading ||
                        !formData.candidateName ||
                        !formData.jobTitle ||
                        !formData.companyName ||
                        !formData.jobDescription ||
                        !resumeText
                      }
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 sm:py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:shadow-none"
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>Generate Cover Letter</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Sidebar - Tips & Preview */}
              <div className="lg:col-span-4">
                <div className="sticky top-6 space-y-6">
                  {/* Tips Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 sm:p-6">
                    <h3 className="font-semibold text-blue-900 mb-3 text-sm sm:text-base">💡 Tips for Best Results</h3>
                    <ul className="space-y-2 text-xs sm:text-sm text-blue-800">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>Use your complete, up-to-date resume</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>Include the full job description for better matching</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>Your cover letter will be concise (max 300 words)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>Save resumes for quick reuse across applications</span>
                      </li>
                    </ul>
                  </div>

                  {/* AI Model Info */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-4 sm:p-6">
                    <h3 className="font-semibold text-purple-900 mb-3 text-sm sm:text-base">
                      🤖 AI Model: {selectedModel}
                    </h3>
                    <p className="text-xs sm:text-sm text-purple-800 mb-3">
                      Currently using {selectedModel} for intelligent cover letter generation.
                    </p>
                    <button
                      onClick={() => setShowModelSelector(true)}
                      className="w-full px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                    >
                      Change Model
                    </button>
                  </div>

                  {/* Drive Status */}
                  <div
                    className={`border-2 rounded-2xl p-4 sm:p-6 ${isDriveConnected
                        ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                        : "bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200"
                      }`}
                  >
                    <h3
                      className={`font-semibold mb-3 text-sm sm:text-base ${isDriveConnected ? "text-green-900" : "text-gray-900"
                        }`}
                    >
                      {isDriveConnected ? "☁️ Google Drive Connected" : "📁 Google Drive"}
                    </h3>
                    <p className={`text-xs sm:text-sm mb-3 ${isDriveConnected ? "text-green-800" : "text-gray-600"}`}>
                      {isDriveConnected
                        ? 'Your cover letters will be automatically saved to your Google Drive in a "SmartCover" folder.'
                        : "Connect Google Drive to automatically save your cover letters to the cloud."}
                    </p>
                    <button
                      onClick={() => setShowDriveManager(true)}
                      className={`w-full px-3 py-2 rounded-lg transition-colors text-sm font-medium ${isDriveConnected
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        }`}
                    >
                      {isDriveConnected ? "Manage Connection" : "Connect Drive"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="max-w-xl sm:max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="p-4 sm:p-6 lg:p-8 xl:p-12 text-center">
                  <div className="relative mb-4 sm:mb-6">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full animate-pulse"></div>
                    </div>
                    <Loader2 className="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-indigo-600 animate-spin mx-auto" />
                  </div>

                  <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                    Generating Your Cover Letter
                  </h2>

                  <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base max-w-sm sm:max-w-md mx-auto leading-relaxed px-4 sm:px-0">
                    Our AI is analyzing your resume and crafting a concise, professional cover letter based on the job
                    requirements...
                  </p>

                  <div className="max-w-xs sm:max-w-sm mx-auto bg-gray-200 rounded-full h-2 mb-3 sm:mb-4">
                    <div
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full animate-pulse transition-all duration-1000"
                      style={{ width: "70%" }}
                    ></div>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8">This usually takes 10-30 seconds</p>

                  {/* Features Preview */}
                  <div className="pt-4 sm:pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                          <span className="text-blue-600 text-sm sm:text-base">📝</span>
                        </div>
                        <span className="text-xs sm:text-sm text-gray-600 font-medium">Personalized Content</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                          <span className="text-green-600 text-sm sm:text-base">⚡</span>
                        </div>
                        <span className="text-xs sm:text-sm text-gray-600 font-medium">Perfect Length</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                          <span className="text-purple-600 text-sm sm:text-base">🎯</span>
                        </div>
                        <span className="text-xs sm:text-sm text-gray-600 font-medium">Job-Matched</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 sm:space-y-8">
              <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                    Your Cover Letter
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={handleEdit}
                      className="w-full sm:w-auto px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors text-center font-medium"
                    >
                      Edit
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => document.getElementById("download-menu").classList.toggle("hidden")}
                        className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base font-medium"
                        disabled={isExporting}
                      >
                        {isExporting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="hidden sm:inline">Exporting...</span>
                            <span className="sm:hidden">...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            <span>Export</span>
                            <svg
                              className="w-3 h-3 sm:w-4 sm:h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </>
                        )}
                      </button>
                      <div
                        id="download-menu"
                        className="hidden absolute right-0 mt-2 w-full sm:w-72 lg:w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-72 sm:max-h-80 lg:max-h-96 overflow-y-auto"
                      >
                        {/* Google Drive Options (if connected) */}
                        {isDriveConnected && (
                          <>
                            <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b text-sm font-semibold text-green-700 flex items-center gap-2">
                              <Cloud className="w-4 h-4" />
                              <span>Save to Google Drive</span>
                            </div>
                            {exportOptions
                              .filter((option) => option.id.startsWith("drive-"))
                              .map((option) => (
                                <button
                                  key={option.id}
                                  onClick={() => {
                                    downloadCoverLetter(option.id);
                                    document.getElementById("download-menu").classList.add("hidden");
                                  }}
                                  className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-green-50 transition-colors flex items-center gap-3 group"
                                  disabled={isExporting}
                                >
                                  <Cloud className="w-4 h-4 text-green-500 group-hover:text-green-600" />
                                  <span className="text-sm sm:text-base text-gray-700 group-hover:text-green-700 font-medium">
                                    {option.label}
                                  </span>
                                </button>
                              ))}
                          </>
                        )}

                        {/* Local Download Options */}
                        <div
                          className={`px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-gray-50 to-slate-50 ${isDriveConnected ? "border-t border-b" : "border-b"
                            } text-sm font-semibold text-gray-700 flex items-center gap-2`}
                        >
                          <Download className="w-4 h-4" />
                          <span>Download to Device</span>
                        </div>
                        {exportOptions
                          .filter((option) => !option.id.startsWith("drive-"))
                          .map((option, index, array) => (
                            <button
                              key={option.id}
                              onClick={() => {
                                downloadCoverLetter(option.id);
                                document.getElementById("download-menu").classList.add("hidden");
                              }}
                              className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 group ${index === array.length - 1 ? "rounded-b-xl" : ""
                                }`}
                              disabled={isExporting}
                            >
                              <FileDown
                                className={`w-4 h-4 ${option.id.includes("pdf")
                                    ? "text-red-500 group-hover:text-red-600"
                                    : option.id.includes("docx")
                                      ? "text-blue-500 group-hover:text-blue-600"
                                      : "text-green-500 group-hover:text-green-600"
                                  }`}
                              />
                              <span className="text-sm sm:text-base text-gray-700 group-hover:text-gray-900 font-medium">
                                {option.label}
                              </span>
                            </button>
                          ))}

                        {/* Drive Connection CTA (if not connected) */}
                        {!isDriveConnected && (
                          <div className="border-t border-gray-200 p-3 sm:p-4">
                            <div className="text-xs text-gray-500 mb-2">Want to save directly to Google Drive?</div>
                            <button
                              onClick={() => {
                                setShowDriveManager(true);
                                document.getElementById("download-menu").classList.add("hidden");
                              }}
                              className="w-full px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                            >
                              <Cloud className="w-4 h-4" />
                              <span>Connect Google Drive</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {isEditMode ? (
                  <div className="space-y-4">
                    <textarea
                      value={generatedCoverLetter}
                      onChange={handleEditChange}
                      className="w-full h-64 sm:h-80 lg:h-96 p-3 sm:p-4 border border-gray-300 rounded-lg font-mono text-sm sm:text-base resize-y"
                      placeholder="Edit your cover letter here..."
                    />
                    {/* Word count in edit mode */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm text-gray-600">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <span>
                          Word count: <strong className="text-gray-900">{getWordCount(generatedCoverLetter)}</strong>
                          /300
                        </span>
                        {getWordCount(generatedCoverLetter) > 300 && (
                          <span className="text-amber-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Consider shortening for best impact</span>
                            <span className="sm:hidden">Too long</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                      <button
                        onClick={() => setIsEditMode(false)}
                        className="w-full sm:w-auto px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div
                      className="prose prose-sm sm:prose-base max-w-none border rounded-lg p-4 sm:p-6 bg-gray-50 overflow-x-auto"
                      dangerouslySetInnerHTML={{ __html: generatedCoverLetter }}
                    />
                    {/* Word count indicator */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm text-gray-600">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <span>
                          Word count: <strong className="text-gray-900">{getWordCount(generatedCoverLetter)}</strong>
                          /300
                        </span>
                        {getWordCount(generatedCoverLetter) > 300 && (
                          <span className="text-amber-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Exceeds recommended length</span>
                            <span className="sm:hidden">Too long</span>
                          </span>
                        )}
                        {getWordCount(generatedCoverLetter) <= 300 && getWordCount(generatedCoverLetter) > 0 && (
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Perfect length</span>
                            <span className="sm:hidden">Perfect</span>
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 hidden sm:block">
                        Professional cover letters should be concise
                      </span>
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
                  className="w-full sm:w-auto px-6 py-3 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
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
