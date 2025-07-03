# SmartCover AI - AI-Powered Cover Letter Generator

A production-ready React application that generates personalized cover letters using Google's Gemini AI. Upload your resume, enter job details, and get a professionally crafted cover letter in seconds.

![AI Cover Letter Generator](https://img.shields.io/badge/React-19.1.0-blue) ![Vite](https://img.shields.io/badge/Vite-7.0.0-646CFF) ![Tailwind](https://img.shields.io/badge/Tailwind-4.1.11-38B2AC) ![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285F4)

## ⚡ Quick Overview

Transform your job application process with AI-powered cover letter generation:

- 📤 **Upload Resume** → PDF/DOCX support with intelligent text extraction
- 💼 **Enter Job Details** → Company name, position, and job description
- 🤖 **AI Generation** → Multiple Gemini models for personalized content
- ⬇️ **Export Options** → PDF, Word, HTML formats + Google Drive integration
- 🔄 **Persistent State** → Resume storage & Google Drive connection across sessions

**Key Differentiators:**

- 🔒 **100% Privacy**: All processing happens in your browser
- 💾 **Smart Storage**: Save resumes + persistent Google Drive connection
- ⚡ **Advanced AI**: Multiple Gemini models with two-prompt optimization
- 📱 **Fully Responsive**: Mobile-first design that works everywhere
- ☁️ **Cloud Integration**: Seamless Google Drive export with state persistence

## 🚀 Features

### ✨ Core Functionality

- **AI-Powered Generation**: Choose from 5 advanced Gemini models for intelligent cover letter creation
  - 🚀 **Gemini 1.5 Flash**: Fast and efficient (Recommended)
  - 👑 **Gemini 1.5 Pro**: Premium quality with advanced reasoning
  - ⭐ **Gemini 1.0 Pro**: Reliable and cost-effective
  - 🧠 **Gemini 2.5 Pro**: Latest model with enhanced capabilities
  - ⚡ **Gemini 2.5 Flash**: Latest with ultra-fast performance
- **Resume Analysis**: Automatically extracts and analyzes your resume content
- **Job Matching**: Tailors cover letters to specific job descriptions and companies
- **Smart Personalization**: Extracts contact information and personalizes templates
- **Persistent Resume Storage**: Save and reuse resumes locally to avoid re-uploading
- **Google Drive Integration**: Persistent connection state across page refreshes

### 📄 File Processing

- **PDF Support**: Browser-compatible PDF text extraction with `pdfjs-dist`
- **DOCX Support**: Microsoft Word document processing with `mammoth`
- **File Validation**: Size limits, type checking, and error handling
- **Real-time Processing**: Instant feedback during file upload and processing
- **Resume Management**: Save up to 5 resumes locally with metadata and quick access

### 💾 Export Options

- **PDF Export (Direct Method)**: Optimized PDF generation with `jsPDF.html` for consistent formatting
- **Word Document (.docx)**: Native Microsoft Word format for easy editing and collaboration
- **HTML Export**: Web-friendly format with embedded styling and standalone functionality
- **Google Drive Integration**: Save cover letters directly to your Google Drive in a "SmartCover" folder
- **One-Click Downloads**: Simple dropdown menu with clearly labeled export options
- **Export History**: Track all exported cover letters with timestamps and Drive links

### ☁️ Cloud Features

- **Google OAuth Integration**: Secure authentication via Supabase with persistent sessions
- **Per-User API Keys**: Each user manages their own Gemini API key for privacy
- **Multiple AI Models**: Choose from 5 Gemini models (Flash, Pro, 2.5 variants) with real-time switching
- **Google Drive Export**: Automatic folder creation, file organization, and persistent connection
- **Cover Letter History**: Track and access previously exported files with Drive links
- **Cloud Sync**: User preferences, settings, and connection state stored securely
- **Persistent State Management**: Drive connection survives page refreshes and browser sessions
- **Automatic Token Management**: Smart token validation, expiry handling, and renewal

### 🎨 User Experience

- **Modern UI**: Beautiful, responsive design with Tailwind CSS v4 and mobile-first approach
- **Smart Modals**: Bottom sheets on mobile, centered modals on desktop with proper z-index
- **Progress Tracking**: Visual indicators for generation progress with real-time feedback
- **Edit Functionality**: Review and modify generated content before export
- **Mobile Responsive**: Fully optimized for desktop, tablet, and mobile devices
- **Persistent Footer**: Professional branding across all pages
- **Visual Status Indicators**: Real-time connection status for Google Drive integration

### 🔒 Security & Performance

- **Client-side Processing**: No data sent to external servers
- **File Size Limits**: Configurable limits to prevent abuse
- **Error Handling**: Comprehensive error management
- **API Key Security**: Environment-based configuration

## 🛠️ Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn
- Gemini API key (free from [Google AI Studio](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ai-cover-letter-generator
   ```
2. **Install dependencies**

   ```bash
   npm install
   ```
3. **Configure environment**

   Create a `.env` file with your API keys:

   ```bash
   # Gemini AI Configuration (get from Google AI Studio)
   VITE_GEMINI_API_KEY=your_gemini_api_key_here

   # Supabase Configuration (for authentication and user data)
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Google Drive Integration (optional - for Drive export feature)
   VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
   VITE_GOOGLE_API_KEY=your_google_api_key
   ```

   **Required for basic functionality:**

   - Gemini API key (free from [Google AI Studio](https://makersuite.google.com/app/apikey))
   - Supabase project (free from [Supabase](https://supabase.com))

   **Optional for Google Drive export:**

   - Google OAuth credentials (see [GOOGLE_DRIVE_SETUP.md](./GOOGLE_DRIVE_SETUP.md))
4. **Set up Supabase** (required for authentication)

   Follow the instructions in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to:

   - Create a Supabase project
   - Configure Google OAuth
   - Set up database tables
5. **Set up Google Drive** (optional)

   For Google Drive export functionality, follow [GOOGLE_DRIVE_SETUP.md](./GOOGLE_DRIVE_SETUP.md) to:

   - Create a Google Cloud project
   - Enable Drive API
   - Configure OAuth credentials
6. **Start development server**

   ```bash
   npm run dev
   ```
7. **Open your browser**

   ```
   http://localhost:3001
   ```

## 📖 Usage Guide

### Step 1: Upload Your Resume

- **New Upload**: Click "Choose File" and select your PDF or DOCX resume
- **Saved Resume**: Click "Saved Resumes" to use a previously uploaded resume
- **Save for Later**: After uploading, save your resume for future use (up to 5 resumes)
- Wait for automatic text extraction and validation
- See confirmation when processing is complete

**Resume Management Features:**

- Save resumes with custom names for easy identification
- View saved date, last used date, and file size
- Preview resume content before selecting
- Delete individual resumes or clear all saved data
- Automatic local storage (no data sent to servers)

### Step 2: Enter Job Details

- **Job Title**: The position you're applying for
- **Company Name**: Target company name
- **Job Description**: Paste the full job posting

### Step 3: Generate Cover Letter

- Click "Generate Cover Letter"
- Wait 10-30 seconds for AI processing
- Review the personalized result

### Step 4: Export & Use

**Choose your export method:**

**📱 Download to Device:**

- **PDF (Direct Method)**: Optimized PDF with consistent formatting and layout
- **Word Document**: Editable .docx format for further customization
- **HTML**: Web-friendly format with embedded styling for online use

**☁️ Save to Google Drive:** (if connected)

- **PDF to Drive**: Automatically saved to "SmartCover" folder
- **DOCX to Drive**: Word format saved with drive access
- **HTML to Drive**: Web format for online sharing
- **Automatic Organization**: Files saved with company-job naming convention
- **Export History**: Track all saved files with timestamps and links

**Google Drive Features:**

- One-click connection via OAuth
- Automatic "SmartCover" folder creation
- Files accessible from any device
- Export history with direct Drive links
- Secure access (only app-created files)

## 🔧 Advanced Features

### 📊 Real-time Feedback

- **Word Count Display**: Live word count with visual feedback for optimal length
- **Progress Indicators**: Visual loading states during AI generation
- **Error Handling**: Comprehensive error messages with actionable guidance
- **File Validation**: Real-time validation for file type, size, and content

### 💾 Resume Management System

- **Persistent Storage**: Save up to 5 resumes locally using browser localStorage
- **Smart Metadata**: Track upload date, last used date, file size, and custom names
- **Quick Access**: Browse saved resumes with preview and selection
- **Data Privacy**: All resume data stays on your device - never uploaded to servers
- **Easy Management**: Individual delete options or bulk clear functionality

### 🚀 Export System Architecture

The application includes multiple export methods for maximum compatibility:

#### Current Implementation

- **PDF (Direct Method)**: Uses `jsPDF.html()` for reliable PDF generation
- **Word (.docx)**: Structured document creation with proper formatting
- **HTML**: Standalone web format with embedded CSS

#### Additional Export Methods Available

The codebase includes additional export implementations for future use:

- **PDF (Image-based)**: High-quality visual PDF using `html2pdf.js`
- **PDF (Selectable Text)**: Text-layer PDF using `jsPDF` with content parsing
- **PDF (Canvas Method)**: Alternative implementation using `html2canvas`

### 🎯 User Experience Enhancements

- **Candidate Name Input**: Personalized header generation with contact details
- **Edit Functionality**: In-app editing of generated content before download
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Smart File Processing**: Automatic text extraction with format preservation
- **Contextual Help**: Tooltips and guidance throughout the application

## 🔧 Configuration

### Environment Variables

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_MAX_FILE_SIZE=10  # Maximum file size in MB
```

### Supported File Types

- **PDF**: `.pdf` files with extractable text (using pdfjs-dist)
- **DOCX**: Microsoft Word documents `.docx` (using mammoth)
- **File Size**: Up to 10MB per file (configurable via environment variables)
- **Text Extraction**: Automatic content parsing with structure preservation

### 📦 Key Dependencies

```json
{
  "@google/generative-ai": "^0.24.1", // Gemini AI integration (5 models supported)
  "@supabase/supabase-js": "^2.39.3", // Authentication and cloud sync
  "docx": "^9.5.1", // Word document generation
  "file-saver": "^2.0.5", // Cross-browser file downloads
  "html2pdf.js": "^0.10.3", // PDF generation (image-based method)
  "jspdf": "^2.5.2", // PDF generation (direct method)
  "mammoth": "^1.9.1", // DOCX file processing
  "pdfjs-dist": "^5.3.31", // PDF text extraction
  "react": "^19.1.0", // Modern UI framework
  "tailwindcss": "^4.1.11", // Utility-first CSS framework
  "vite": "^7.0.0" // Lightning-fast build tool
}
```

## 🏗️ Technical Architecture

### Frontend Stack

- **React 19**: Modern hooks-based architecture with functional components and latest features
- **Vite 7**: Lightning-fast build tool with HMR and optimized production builds
- **Tailwind CSS v4**: Utility-first CSS framework for rapid, responsive UI development
- **Lucide React**: Beautiful, consistent icon library with 1000+ icons
- **Supabase**: Backend-as-a-Service for authentication, database, and real-time features

### AI & Processing Pipeline

- **Multiple Gemini Models**: Advanced language models for intelligent content generation
  - **Gemini 1.5 Flash** (Recommended): Fast, efficient, cost-effective
  - **Gemini 1.5 Pro** (Premium): Advanced reasoning, superior quality
  - **Gemini 1.0 Pro** (Balanced): Reliable performance, moderate cost
  - **Gemini 2.5 Pro** (Latest): Enhanced capabilities, premium features
  - **Gemini 2.5 Flash** (Newest): Ultra-fast performance with latest improvements
- **Two-Prompt Architecture**: Sophisticated approach for consistent, high-quality output
- **Client-side File Processing**: Enhanced privacy with local text extraction
- **Intelligent Resume Analysis**: Advanced parsing and information extraction
- **Model Selection Interface**: Real-time model switching with detailed comparisons

#### AI Generation Architecture

The application implements a sophisticated dual-prompt system for superior cover letter generation:

**🔹 Five Advanced AI Models:**

The application supports 5 different Gemini models, each optimized for different use cases:

- **🚀 Gemini 1.5 Flash** (Recommended): Fast, efficient, and cost-effective. Perfect for most users.
- **👑 Gemini 1.5 Pro** (Premium): Advanced reasoning and superior quality for complex applications.
- **⭐ Gemini 1.0 Pro** (Balanced): Reliable performance with moderate cost and good quality.
- **🧠 Gemini 2.5 Pro** (Latest): Enhanced capabilities with cutting-edge AI features.
- **⚡ Gemini 2.5 Flash** (Newest): Ultra-fast performance with latest model improvements.

**Model Selection Features:**

- Real-time model switching without losing work
- Detailed comparison of speed, quality, and cost
- Visual indicators for recommended, premium, and latest models
- Smart model recommendations based on use case

**🔹 Two-Prompt System Benefits:**

- **Consistent Formatting**: Eliminates unwanted HTML/markdown in output
- **Specialized Processing**: Each prompt optimized for specific tasks
- **Enhanced Quality**: Better content structure and professional formatting
- **Reliable Output**: Robust fallback mechanisms for consistent generation
- **Faster Processing**: Optimized prompt design for quicker response times
- **Model Flexibility**: Works seamlessly across all 5 supported Gemini models

**🔹 Prompt 1: Header & Structure Generation**

- Extracts candidate information from resume
- Generates professional business letter header
- Creates consistent salutation and closing sections
- Applies current date and proper formatting
- Prepares structured template for body content

**🔹 Prompt 2: Body Content Generation**

- Focuses exclusively on main cover letter content
- Tailors content to specific job requirements and company
- Maintains optimal 250-word limit for body paragraphs
- Incorporates quantifiable achievements from resume
- Ensures professional tone and compelling narrative

**🔹 Intelligent Fallback System:**
If the two-prompt approach encounters issues, the system automatically falls back to a comprehensive single-prompt method, ensuring reliable generation under all conditions.

**🔹 Persistent State Management:**

The application now includes comprehensive persistent state management:

- **Google Drive Connection**: Maintains connection across page refreshes and browser sessions
- **Token Management**: Automatic validation, expiry checking, and renewal handling
- **Local Storage**: Resume data and user preferences saved locally
- **Connection Monitoring**: Periodic checks ensure reliable Drive integration
- **Error Recovery**: Graceful handling of network issues and token expiry

### File Processing Technology

- **pdfjs-dist**: Browser-compatible PDF text extraction with Web Worker support
- **mammoth**: Microsoft Word document processing with style preservation
- **Local Worker Configuration**: Optimized for Vite build system with static asset handling
- **Robust Error Handling**: Comprehensive validation and user feedback

### State Management & Storage

- **React Hooks**: Modern state management with useState and useEffect
- **localStorage API**: Client-side resume persistence without external dependencies
- **Structured Data Management**: Organized storage with metadata and cleanup
- **Real-time Updates**: Immediate UI feedback for all user interactions

### Export & Download

- **jsPDF**: Direct PDF generation with html parsing
- **docx**: Native Word document creation with structured formatting
- **file-saver**: Cross-browser file downloading with proper filename handling
- **html2pdf.js**: Available for alternative PDF generation (multiple export methods implemented)

### 🚀 Performance & Security

**🔒 Privacy & Security:**

- **Client-side Processing**: All file processing happens in your browser
- **No Data Upload**: Resume content never leaves your device
- **Local Storage**: Resume data stored locally using browser localStorage
- **API Security**: Gemini API key securely managed via environment variables
- **No Tracking**: No analytics or user tracking implemented

**⚡ Performance Optimizations:**

- **Efficient File Processing**: Optimized PDF/DOCX text extraction
- **Smart Caching**: Resume storage prevents repeated uploads
- **Minimal Dependencies**: Lightweight build with essential libraries only
- **Fast Development**: Vite-powered hot module replacement
- **Optimized Builds**: Production builds with code splitting and compression

## 🔧 Development

### Available Scripts

```bash
npm run dev        # Start development server (localhost:3001)
npm run build      # Build for production with optimizations
npm run preview    # Preview production build locally
npm run lint       # Run ESLint for code quality checks
```

### Development Setup

1. **Clone and install dependencies**

   ```bash
   git clone <repository-url>
   cd ai-cover-letter-generator
   npm install
   ```
2. **Environment configuration**

   ```bash
   # Create .env file with your Gemini API key
   echo "VITE_GEMINI_API_KEY=your_api_key_here" > .env
   ```
3. **Start development server**

   ```bash
   npm run dev
   # Access at http://localhost:3001
   ```

### Code Quality & Standards

- **ESLint**: Configured with React-specific rules
- **Modern JavaScript**: ES6+ features and React 18 patterns
- **Component Architecture**: Functional components with hooks
- **Error Boundaries**: Comprehensive error handling throughout
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Project Structure

```
src/
├── components/
│   ├── CoverLetterGenerator.jsx     # Main application component with responsive UI
│   ├── SavedResumesModal.jsx        # Resume management modal with mobile optimization
│   ├── ModelSelector.jsx            # AI model selection with 5 Gemini models
│   ├── LoginPage.jsx                # Authentication page with beautiful footer
│   └── DriveConnectionManager.jsx   # Google Drive integration with persistent state
├── utils/
│   ├── geminiApi.js                 # AI integration with 5-model support & two-prompt system
│   ├── fileProcessor.js             # PDF/DOCX file handling with Web Workers
│   ├── exportUtils.js               # Multiple export format handlers (PDF, DOCX, HTML)
│   ├── driveApi.js                  # Google Drive API with persistent state management
│   └── resumeStorage.js             # Local storage for resume persistence
├── contexts/
│   └── AuthContext.jsx              # Supabase authentication context
├── App.jsx                          # Root component with routing logic
└── main.jsx                         # Entry point with error boundaries
```

## 🐛 Troubleshooting

### Common Issues & Solutions

**🔑 API Key Problems**

- Ensure your Gemini API key is correctly set in `.env` file
- Verify the key has proper permissions and is active
- Check for API quotas, rate limits, or billing issues
- Restart development server after adding/changing the API key

**📄 File Processing Errors**

- Verify file is not corrupted, password-protected, or image-only
- Check file size doesn't exceed 10MB limit
- Ensure PDF files contain extractable text (not just scanned images)
- Try re-uploading the file or use a different format

**⬇️ Export & Download Issues**

- Enable pop-ups in your browser settings
- Check browser download permissions and default download location
- Try different export formats if one fails
- Clear browser cache and try again
- Ensure adequate disk space for downloads

**💾 Resume Storage Problems**

- Check if localStorage is enabled in your browser
- Clear browser data if storage appears corrupted
- Verify you haven't exceeded the 5-resume limit
- Try using incognito/private mode to isolate the issue

**🔄 Generation Failures**

- Check internet connection for AI API calls
- Verify resume text was properly extracted before generation
- Ensure all required fields (job title, company, description) are filled
- Try generating again - temporary API issues may resolve

**🎨 UI/Display Issues**

- Check browser compatibility (modern browsers recommended)
- Disable browser extensions that might interfere
- Try different screen sizes/zoom levels
- Clear browser cache and refresh

### Browser Compatibility

**✅ Fully Supported:**

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**⚠️ Limited Support:**

- Older browsers may have issues with file processing
- Some export methods may not work on older devices

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Process

1. **Fork the repository**

   ```bash
   git fork https://github.com/your-username/ai-cover-letter-generator
   ```
2. **Create a feature branch**

   ```bash
   git checkout -b feature/amazing-new-feature
   ```
3. **Make your changes**

   - Follow existing code patterns and conventions
   - Add tests for new functionality
   - Update documentation as needed
4. **Test your changes**

   ```bash
   npm run lint    # Check code quality
   npm run build   # Verify production build
   ```
5. **Commit and push**

   ```bash
   git commit -m 'Add amazing new feature'
   git push origin feature/amazing-new-feature
   ```
6. **Open a Pull Request**

   - Provide clear description of changes
   - Reference any related issues
   - Include screenshots for UI changes

### Areas for Contribution

- **Export Methods**: Additional export formats or improvements
- **UI/UX**: Design enhancements and user experience improvements
- **AI Integration**: Prompt optimization and generation improvements
- **File Processing**: Support for additional file formats
- **Testing**: Unit tests and integration test coverage
- **Documentation**: Tutorials, examples, and improved guides

## 🚀 Deployment

### Production Build

```bash
npm run build
# Output in dist/ directory
```

### Deployment Options

- **Vercel**: Zero-config deployment with automatic builds
- **Netlify**: Static site hosting with continuous deployment
- **GitHub Pages**: Free hosting for open-source projects
- **Any Static Host**: The build output is standard HTML/CSS/JS

### Environment Variables for Production

```env
VITE_GEMINI_API_KEY=your_production_api_key
VITE_MAX_FILE_SIZE=10
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### MIT License Summary

- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ❌ Liability
- ❌ Warranty

## 🙏 Acknowledgments

### Technology Stack

- **Google Gemini AI** - Advanced language generation capabilities
- **React Team** - Amazing framework and ecosystem
- **Tailwind CSS** - Beautiful, utility-first styling
- **Vite** - Lightning-fast development experience

### Open Source Libraries

- **pdfjs-dist** - Browser PDF processing
- **mammoth** - DOCX file parsing
- **docx** - Word document generation
- **html2pdf.js** - PDF export functionality
- **file-saver** - Cross-browser file downloads

### Community

- All contributors and users who help improve this project
- The open-source community for inspiration and best practices

## 📞 Support & Contact

### Getting Help

1. **Check Documentation**: Review this README and inline code comments
2. **Search Issues**: Look through existing GitHub issues
3. **Create New Issue**: Use GitHub issues for bugs and feature requests
4. **Community Support**: Join discussions in GitHub Discussions

### Issue Templates

When reporting issues, please include:

- Browser and version
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)
- Sample files (if relevant)

### Feature Requests

We love hearing about new ideas! When suggesting features:

- Describe the use case clearly
- Explain the expected behavior
- Consider implementation complexity
- Check if similar features exist

---

**Built with ❤️ and AI | Making job applications easier, one cover letter at a time**

_Last updated: July 2025 | Version: 1.0.0_
