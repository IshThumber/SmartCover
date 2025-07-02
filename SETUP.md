# AI Cover Letter Generator - Setup Guide

## Prerequisites

1. **Gemini API Key**: You need to get a free API key from Google AI Studio
   - Visit: https://makersuite.google.com/app/apikey
   - Create a new API key
   - Copy the API key

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd ai-cover-letter-generator
npm install
```

### 2. Configure Environment Variables

Open the `.env` file in the root directory and replace `your_gemini_api_key_here` with your actual Gemini API key:

```env
VITE_GEMINI_API_KEY=your_actual_api_key_here
VITE_MAX_FILE_SIZE=10
```

### 3. Run the Application

```bash
npm run dev
```

The application will start on `http://localhost:5173`

## Features

### ✅ Production-Ready Features Implemented

1. **Real Gemini AI Integration**

   - Uses Google's Gemini 1.5 Flash model for cover letter generation
   - Intelligent personalization based on resume content
   - Automatic extraction of contact information from resumes

2. **Enhanced File Processing**

   - Real PDF text extraction using `pdfjs-dist` (browser-compatible)
   - Local PDF.js worker for reliable processing (no CDN dependencies)
   - DOCX file processing with `mammoth`
   - File size validation (configurable, default 10MB)
   - Comprehensive error handling

3. **Multiple Export Options**

   - **PDF Export**: High-quality PDF generation using `html2pdf.js`
   - **Word Document**: DOCX format using `docx` library
   - **HTML Export**: Styled HTML file for web viewing

4. **File Validation & Security**

   - File type validation (PDF and DOCX only)
   - File size limits to prevent abuse
   - Input sanitization and error handling

5. **Enhanced User Experience**

   - Real-time file processing feedback
   - Progress indicators during AI generation
   - Dropdown menu for export options
   - Edit functionality for generated content
   - Persistent resume storage (save up to 5 resumes locally)
   - Resume management with metadata and quick access

### 🔧 Technical Implementation

- **Frontend**: React with modern hooks and state management
- **Styling**: Tailwind CSS with custom animations
- **File Processing**: Client-side processing for security
- **AI Integration**: Direct Gemini API calls with error handling
- **Export**: Multiple format support with proper formatting

### 📝 Usage

1. **Upload Resume**: Select a PDF or DOCX file containing your resume
2. **Fill Job Details**: Enter job title, company name, and job description
3. **Generate**: Click to generate a personalized cover letter
4. **Review & Edit**: Review the generated content and make edits if needed
5. **Download**: Choose from PDF, Word, or HTML formats

### 🛡️ Security Considerations

- API keys are stored in environment variables
- File processing happens client-side
- File size and type validation
- No data is stored on servers (client-side only)

### 🚀 Performance Optimizations

- Lazy loading of heavy libraries
- Efficient file processing
- Optimized API calls with proper error handling
- Responsive design for all devices

### 🔄 Error Handling

- Comprehensive error messages for file processing
- API error handling with user-friendly messages
- File validation with specific error descriptions
- Graceful degradation for unsupported features

## Troubleshooting

### Common Issues

1. **"React is not defined" error**

   - Make sure all React imports are properly added
   - Check that JSX files have React imported

2. **API Key Issues**

   - Verify your Gemini API key is correctly set in `.env`
   - Ensure the API key has proper permissions
   - Check the API key is not expired

3. **File Processing Errors**

   - Ensure files are not corrupted
   - Check file size limits
   - Verify file types are supported (PDF/DOCX only)
   - **PDF Processing**: Uses browser-compatible `pdfjs-dist` library

4. **PDF Worker Issues**

   - If you see "Setting up fake worker failed" errors
   - The app automatically copies PDF.js worker files to the public directory
   - Worker files are served locally for better reliability
   - Check that `/pdf.worker.min.js` is accessible from your dev server
   - If issues persist, try clearing browser cache and restarting dev server

5. **Module Externalization Errors**

   - If you see "Module has been externalized for browser compatibility" errors
   - This usually means a Node.js-only library is being used in the browser
   - The app uses `pdfjs-dist` instead of `pdf-parse` for browser compatibility

6. **Export Issues**

   - Modern browsers required for PDF export
   - Enable pop-ups for download functionality
   - Check browser compatibility for all features

## Browser Compatibility

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Modern mobile browsers

## Development Notes

- Built with Vite for fast development
- Uses modern React patterns (hooks, functional components)
- Tailwind CSS for consistent styling
- ESLint configuration for code quality
