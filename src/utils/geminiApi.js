import { GoogleGenerativeAI } from "@google/generative-ai";

// Create Gemini AI instance with dynamic API key
const createGenAI = (apiKey) => {
  if (!apiKey) {
    throw new Error("API key is required");
  }
  return new GoogleGenerativeAI(apiKey);
};

// Available Gemini models
export const GEMINI_MODELS = {
  "gemini-1.5-flash": "gemini-1.5-flash",
  "gemini-1.5-pro": "gemini-1.5-pro",
  "gemini-2.5-pro": "gemini-2.5-pro",
  "gemini-2.5-flash": "gemini-2.5-flash",
  "gemini-1.0-pro": "gemini-1.0-pro",
};

// Generate the header, salutation, and closing sections of the cover letter
export const generateCoverLetterHeader = async (
  jobTitle,
  companyName,
  candidateName,
  contactInfo,
  apiKey,
  modelName = "gemini-1.5-flash"
) => {
  try {
    const genAI = createGenAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODELS[modelName] || "gemini-1.5-flash" });

    // Get current date
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const prompt = `
You are a professional career counselor. Generate ONLY the header, salutation, and closing sections for a business cover letter.

**Information provided:**
- Job Title: ${jobTitle}
- Company Name: ${companyName}
- Candidate Name: ${candidateName}
- Email: ${contactInfo.email || "[Email]"}
- Phone: ${contactInfo.phone || "[Phone]"}
- LinkedIn: ${contactInfo.linkedin || "[LinkedIn]"}
- Current Date: ${currentDate}

**CRITICAL REQUIREMENTS:**
1. Generate ONLY the header, salutation, and closing sections
2. Use professional business letter format
3. Return clean HTML without markdown formatting or code blocks
4. Include placeholder {{BODY_CONTENT}} exactly where the main body wi  ll go
5. Use the EXACT contact information provided

**EXACT FORMAT REQUIRED:**
<div class="cover-letter-header">
  <div class="candidate-info">
    <h2>${candidateName}</h2>
    <p>${contactInfo.email || "[Email]"} | ${contactInfo.phone || "[Phone]"}${
      contactInfo.linkedin ? " | " + contactInfo.linkedin : ""
    }</p>
  </div>
  
  <div class="date-section">
    <p>${currentDate}</p>
  </div>
  
  <div class="recipient-info">
    <p>Hiring Manager<br>
    ${companyName}<br>
    [Company Address]</p>
  </div>
</div>

<div class="salutation">
  <p>Dear Hiring Manager,</p>
</div>

{{BODY_CONTENT}}

<div class="closing">
  <p>Sincerely,<br>
  ${candidateName}</p>
</div>

Return EXACTLY the HTML format shown above with the contact information filled in and the {{BODY_CONTENT}} placeholder preserved.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up any potential markdown formatting
    text = text
      .replace(/```html/g, "")
      .replace(/```/g, "")
      .trim();

    // Ensure the placeholder is preserved
    if (!text.includes("{{BODY_CONTENT}}")) {
      console.warn("Header generation missing body placeholder, attempting to fix...");
      text = text.replace('</div>\n\n<div class="closing">', '</div>\n\n{{BODY_CONTENT}}\n\n<div class="closing">');
    }

    return text;
  } catch (error) {
    console.error("Error generating cover letter header:", error);
    throw new Error(`Failed to generate cover letter header: ${error.message}`);
  }
};

// Generate the main body content (3 paragraphs) of the cover letter
export const generateCoverLetterBody = async (
  jobTitle,
  companyName,
  jobDescription,
  resumeText,
  apiKey,
  modelName = "gemini-1.5-flash"
) => {
  try {
    const genAI = createGenAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODELS[modelName] || "gemini-1.5-flash" });

    const prompt = `
You are a professional career counselor and resume writer. Generate ONLY the main body content (3 paragraphs) for a cover letter.

**Job Information:**
- Job Title: ${jobTitle}
- Company Name: ${companyName}
- Job Description: ${jobDescription}

**Resume/Candidate Information:**
${resumeText}

**CRITICAL REQUIREMENTS:**
1. Generate EXACTLY 3 paragraphs only - no more, no less
2. Maximum 250 words total for the body content
3. Use specific examples from the candidate's background
4. Tailor content to the job requirements and company
5. Return clean HTML paragraphs without any header, salutation, or closing
6. Do NOT include any markdown formatting, code blocks, or extra text

**BODY PARAGRAPH STRUCTURE:**
Paragraph 1: Opening statement expressing interest in the specific position and company, briefly mentioning key qualifications (2-3 sentences max)
Paragraph 2: Highlight most relevant experience and achievements that directly relate to job requirements, include specific examples with quantifiable results (3-4 sentences max)  
Paragraph 3: Closing paragraph expressing enthusiasm, mentioning next steps, and thanking them (2-3 sentences max)

**WRITING GUIDELINES:**
- Keep each paragraph focused and concise
- Use active voice and strong action verbs
- Include specific achievements with quantifiable results when possible
- Match the candidate's experience to job requirements
- Show knowledge of the company when possible
- Maintain professional but engaging tone
- Stay under 250 words total

**REQUIRED FORMAT:**
Return EXACTLY this structure:
<div class="body-content">
<p>[First paragraph content here]</p>
<p>[Second paragraph content here]</p>
<p>[Third paragraph content here]</p>
</div>

Return only the HTML content as specified above, without any markdown formatting, code blocks, or additional text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up any potential markdown formatting
    text = text
      .replace(/```html/g, "")
      .replace(/```/g, "")
      .trim();

    // Ensure proper body content structure
    if (!text.includes('<div class="body-content">')) {
      console.warn("Body generation missing proper structure, attempting to fix...");
      text = `<div class="body-content">\n${text}\n</div>`;
    }

    return text;
  } catch (error) {
    console.error("Error generating cover letter body:", error);
    throw new Error(`Failed to generate cover letter body: ${error.message}`);
  }
};

// Combined function that generates the complete cover letter using two prompts
export const generateCoverLetterWithGemini = async (
  jobTitle,
  companyName,
  jobDescription,
  resumeText,
  candidateName = null,
  apiKey,
  modelName = "gemini-1.5-flash"
) => {
  try {
    // Validate API key
    if (!apiKey) {
      throw new Error("API key is required for cover letter generation");
    }

    // Use provided candidate name or extract from resume as fallback
    const finalCandidateName = candidateName || extractNameFromResume(resumeText);
    const contactInfo = extractContactInfoFromResume(resumeText);

    console.log("Generating cover letter with two-prompt approach...");
    console.log("Model:", modelName);
    console.log("Candidate Name:", finalCandidateName);
    console.log("Contact Info:", contactInfo);

    // Generate header and body separately with parallel execution
    const [headerContent, bodyContent] = await Promise.all([
      generateCoverLetterHeader(jobTitle, companyName, finalCandidateName, contactInfo, apiKey, modelName),
      generateCoverLetterBody(jobTitle, companyName, jobDescription, resumeText, apiKey, modelName),
    ]);

    console.log("Header content generated:", headerContent.substring(0, 200) + "...");
    console.log("Body content generated:", bodyContent.substring(0, 200) + "...");

    // Combine the two parts
    let completeCoverLetter = headerContent.replace("{{BODY_CONTENT}}", bodyContent);

    // Additional cleanup to remove any residual markdown or formatting issues
    completeCoverLetter = completeCoverLetter
      .replace(/```html/g, "")
      .replace(/```/g, "")
      .replace(/^\s*\n/gm, "")
      .trim();

    // Validate the final output
    if (
      !completeCoverLetter.includes('<div class="cover-letter-header">') ||
      !completeCoverLetter.includes('<div class="body-content">') ||
      !completeCoverLetter.includes('<div class="closing">')
    ) {
      console.warn("Generated cover letter missing required sections, using fallback approach...");
      throw new Error("Generated content missing required sections");
    }

    console.log("Complete cover letter generated successfully");
    return completeCoverLetter;
  } catch (error) {
    console.error("Error generating cover letter with Gemini:", error);

    // Fallback: try single prompt approach if two-prompt fails
    console.log("Attempting fallback single-prompt generation...");
    try {
      return await generateCoverLetterSinglePrompt(
        jobTitle,
        companyName,
        jobDescription,
        resumeText,
        finalCandidateName,
        apiKey,
        modelName
      );
    } catch (fallbackError) {
      console.error("Fallback generation also failed:", fallbackError);
      throw new Error(`Failed to generate cover letter: ${error.message}`);
    }
  }
};

// Fallback single prompt function
const generateCoverLetterSinglePrompt = async (
  jobTitle,
  companyName,
  jobDescription,
  resumeText,
  candidateName = null,
  apiKey,
  modelName = "gemini-1.5-flash"
) => {
  const genAI = createGenAI(apiKey);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODELS[modelName] || "gemini-1.5-flash" });
  const finalCandidateName = candidateName || extractNameFromResume(resumeText);
  const contactInfo = extractContactInfoFromResume(resumeText);
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const prompt = `
Generate a complete professional cover letter with proper formatting.

**Job Information:**
- Job Title: ${jobTitle}
- Company Name: ${companyName}
- Job Description: ${jobDescription}

**Candidate Information:**
- Name: ${finalCandidateName}
- Email: ${contactInfo.email || "[Email]"}
- Phone: ${contactInfo.phone || "[Phone]"}
- LinkedIn: ${contactInfo.linkedin || ""}
- Resume: ${resumeText}

**Requirements:**
- Professional business letter format
- Maximum 300 words
- Exactly 3 body paragraphs
- Clean HTML formatting

Return the complete cover letter in the following HTML structure:

<div class="cover-letter-header">
  <div class="candidate-info">
    <h2>${finalCandidateName}</h2>
    <p>${contactInfo.email || "[Email]"} | ${contactInfo.phone || "[Phone]"}${
    contactInfo.linkedin ? " | " + contactInfo.linkedin : ""
  }</p>
  </div>
  <div class="date-section">
    <p>${currentDate}</p>
  </div>
  <div class="recipient-info">
    <p>Hiring Manager<br>${companyName}<br>[Company Address]</p>
  </div>
</div>

<div class="salutation">
  <p>Dear Hiring Manager,</p>
</div>

<div class="body-content">
<p>[Paragraph 1: Opening and interest]</p>
<p>[Paragraph 2: Relevant experience]</p>
<p>[Paragraph 3: Closing and next steps]</p>
</div>

<div class="closing">
  <p>Sincerely,<br>${finalCandidateName}</p>
</div>`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response
    .text()
    .replace(/```html/g, "")
    .replace(/```/g, "")
    .trim();
};

export const extractNameFromResume = (resumeText) => {
  // Simple name extraction logic - looks for name patterns at the beginning of resume
  const lines = resumeText.split("\n").filter((line) => line.trim().length > 0);

  // Look for the first line that looks like a name (not too long, has capital letters)
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();

    // Skip lines that look like headers, emails, phones, or are too long
    if (
      line.includes("@") ||
      line.includes("http") ||
      line.includes("Resume") ||
      line.includes("CV") ||
      line.length > 50 ||
      /^\d/.test(line)
    ) {
      continue;
    }

    // Check if it looks like a name (2-4 words, mostly letters)
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 4) {
      const namePattern = /^[A-Za-z\s'-]+$/;
      if (namePattern.test(line)) {
        return line;
      }
    }
  }

  return "Your Name"; // Fallback
};

export const extractContactInfoFromResume = (resumeText) => {
  const contactInfo = {
    email: "",
    phone: "",
    linkedin: "",
  };

  // Extract email
  const emailMatch = resumeText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  if (emailMatch) {
    contactInfo.email = emailMatch[0];
  }
  console.log("Extracted email:", contactInfo.email);

  // Extract phone
  const phoneMatch = resumeText.match(/\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/);
  if (phoneMatch) {
    contactInfo.phone = phoneMatch[0];
  }
  console.log("Extracted phone:", contactInfo.phone);

  // Extract LinkedIn
  const linkedinMatch = resumeText.match(/(?:linkedin\.com\/in\/|linkedin\.com\/profile\/view\?id=)([A-Za-z0-9-]+)/i);
  if (linkedinMatch) {
    contactInfo.linkedin = `linkedin.com/in/${linkedinMatch[1]}`;
  }
  console.log("Extracted LinkedIn:", contactInfo.linkedin);

  console.log("Extracted contact info:", contactInfo);
  return contactInfo;
};

