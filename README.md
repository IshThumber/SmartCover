# AI Cover Letter Generator

A production-ready React application that generates personalized cover letters using Google's Gemini AI. Upload your resume, enter job details, and get a professionally crafted cover letter in seconds.

![AI Cover Letter Generator](https://img.shields.io/badge/React-18.2.0-blue) ![Vite](https://img.shields.io/badge/Vite-5.0.0-646CFF) ![Tailwind](https://img.shields.io/badge/Tailwind-3.3.0-38B2AC) ![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285F4)

## 🚀 Features

### ✨ Core Functionality

- **AI-Powered Generation**: Uses Google Gemini 1.5 Flash for intelligent cover letter creation
- **Resume Analysis**: Automatically extracts and analyzes your resume content
- **Job Matching**: Tailors cover letters to specific job descriptions and companies
- **Smart Personalization**: Extracts contact information and personalizes templates
- **Persistent Resume Storage**: Save and reuse resumes locally to avoid re-uploading

### 📄 File Processing

- **PDF Support**: Browser-compatible PDF text extraction with `pdfjs-dist`
- **DOCX Support**: Microsoft Word document processing with `mammoth`
- **File Validation**: Size limits, type checking, and error handling
- **Real-time Processing**: Instant feedback during file upload and processing
- **Resume Management**: Save up to 5 resumes locally with metadata and quick access

### 💾 Export Options

- **PDF Export (Image-based)**: High-quality PDF generation with professional formatting
- **PDF Export (Selectable Text)**: Text-selectable PDF for accessibility and easy copying
- **Word Document**: Native .docx format for easy editing
- **HTML Export**: Web-friendly format with embedded styling
- **Multiple Downloads**: Choose your preferred format with one click

### 🎨 User Experience

- **Modern UI**: Beautiful, responsive design with Tailwind CSS
- **Progress Tracking**: Visual indicators for generation progress
- **Edit Functionality**: Review and modify generated content
- **Mobile Responsive**: Works perfectly on all devices

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

   ```bash
   # Copy the .env file and add your Gemini API key
   echo "VITE_GEMINI_API_KEY=your_api_key_here" > .env
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
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

### Step 4: Download & Use

- **PDF (Image-based)**: Professional formatting, preserves exact layout
- **PDF (Selectable Text)**: Accessible format with selectable/copyable text
- **Word Document**: Editable .docx format for further customization
- **HTML**: Web-friendly format with embedded styling
- Edit content if needed before downloading
- Use in your job applications!

## 🔧 Configuration

### Environment Variables

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_MAX_FILE_SIZE=10  # Maximum file size in MB
```

### Supported File Types

- **PDF**: `.pdf` files with extractable text
- **DOCX**: Microsoft Word documents (`.docx`)
- **File Size**: Up to 10MB (configurable)

## 🏗️ Technical Architecture

### Frontend Stack

- **React 18**: Modern hooks and functional components
- **Vite**: Lightning-fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful, customizable icons

### AI & Processing

- **Google Gemini AI**: Advanced language model for content generation
- **Two-Prompt Architecture**: Improved consistency and formatting
- **pdfjs-dist**: Browser-compatible PDF text extraction
- **mammoth**: Microsoft Word document processing
- **Client-side Processing**: Enhanced privacy and security

#### Advanced AI Generation Process

The application uses a sophisticated two-prompt approach for consistent cover letter generation:

**Prompt 1: Header & Structure**

- Generates professional header with contact information
- Creates consistent salutation and closing sections
- Extracts and formats candidate details from resume
- Uses current date and proper business letter format
- Includes placeholder for body content

**Prompt 2: Body Content**

- Focuses exclusively on the main 3-paragraph content
- Tailors content to specific job requirements
- Maintains 250-word limit for body
- Uses quantifiable achievements from resume
- Ensures professional tone and structure

**Benefits of Two-Prompt Approach:**

- **Consistent Formatting**: Eliminates HTML/markdown inconsistencies
- **Better Structure**: Separates formatting from content generation
- **Improved Quality**: Each prompt specialized for its purpose
- **Reliable Output**: Fallback mechanism if any prompt fails
- **Faster Processing**: Parallel execution of both prompts

**Fallback Mechanism:**
If the two-prompt approach fails, the system automatically falls back to a single comprehensive prompt to ensure reliable generation.

### Export & Download

- **html2pdf.js**: High-quality PDF generation
- **docx**: Native Word document creation
- **file-saver**: Cross-browser file downloading

## 🔧 Development

### Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Project Structure

```
src/
├── components/
│   └── CoverLetterGenerator.jsx  # Main component
├── utils/
│   ├── geminiApi.js             # AI integration
│   ├── fileProcessor.js         # File handling
│   └── exportUtils.js           # Export functionality
├── App.jsx                      # Root component
└── main.jsx                     # Entry point
```

## 🐛 Troubleshooting

### Common Issues

**API Key Problems**

- Ensure your Gemini API key is correctly set in `.env`
- Verify the key has proper permissions
- Check for any API quotas or limits

**File Processing Errors**

- Verify file is not corrupted or password-protected
- Check file size doesn't exceed limits
- Ensure file contains extractable text (not just images)

**Export Issues**

- Enable pop-ups in your browser
- Try different export formats
- Check browser compatibility

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini AI for powerful language generation
- React team for the amazing framework
- Tailwind CSS for beautiful styling
- All the open-source libraries that make this possible

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

**Made with ❤️ and AI**
