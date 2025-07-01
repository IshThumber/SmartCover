import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("VITE_GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(API_KEY);

export const generateCoverLetterWithGemini = async (jobTitle, companyName, jobDescription, resumeText) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const prompt = `
You are a professional career counselor and resume writer. Generate a compelling, personalized cover letter based on the following information:

**Job Title:** ${jobTitle}
**Company Name:** ${companyName}
**Job Description:** ${jobDescription}

**Resume/Candidate Information:**
${resumeText}

**Instructions:**
1. Create a professional cover letter that highlights the candidate's most relevant skills and experiences
2. Tailor the content specifically to the job requirements and company
3. Use a professional but engaging tone
4. Include specific examples from the candidate's background that align with the job requirements
5. Keep it concise (3 paragraphs) < 300 words
6. Format it as HTML with proper structure and styling
7. Include placeholders for contact information that the user can fill in
8. Make it compelling and personalized, not generic

**Format the response as clean HTML with the following structure:**
- Header with candidate name and contact info placeholders
- Date
- Recipient information
- Subject line
- Body paragraphs
- Professional closing

Return only the HTML content without any markdown formatting or code blocks.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Error generating cover letter with Gemini:", error);
    throw new Error(`Failed to generate cover letter: ${error.message}`);
  }
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
