# Google Drive Integration Setup

This document provides step-by-step instructions for setting up Google Drive integration in the AI Cover Letter Generator.

## Overview

The Google Drive integration allows users to:

- Automatically save generated cover letters to a "SmartCover" folder in their Google Drive
- Export cover letters in multiple formats (PDF, DOCX, HTML) directly to Drive
- Maintain a history of exported cover letters
- Access their files from anywhere

## Prerequisites

- A Google Cloud Console account
- A Supabase project (already configured)
- Basic understanding of OAuth 2.0

## Setup Steps

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter a project name (e.g., "AI Cover Letter Generator")
4. Click "Create"

### 2. Enable the Google Drive API

1. In your Google Cloud project, go to "APIs & Services" → "Library"
2. Search for "Google Drive API"
3. Click on "Google Drive API" and click "Enable"

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in the required fields:
     - App name: "AI Cover Letter Generator"
     - User support email: Your email
     - Developer contact information: Your email
   - Add scopes: `https://www.googleapis.com/auth/drive.file`
   - Add test users if needed
4. Create OAuth client ID:
   - Application type: "Web application"
   - Name: "AI Cover Letter Generator"
   - Authorized JavaScript origins:
     - `http://localhost:5173` (for development)
     - Your production domain (e.g., `https://your-domain.com`)
   - Authorized redirect URIs:
     - `http://localhost:5173` (for development)
     - Your production domain (e.g., `https://your-domain.com`)

### 4. Create an API Key

1. In "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API key"
3. Copy the API key
4. (Optional) Restrict the API key:
   - Click on the API key to edit
   - Under "API restrictions", select "Restrict key"
   - Choose "Google Drive API"

### 5. Update Environment Variables

Add the following to your `.env` file:

```env
# Google Drive Integration
VITE_GOOGLE_CLIENT_ID=your_oauth_client_id_here
VITE_GOOGLE_API_KEY=your_api_key_here
```

Replace the placeholder values with your actual credentials from steps 3 and 4.

## Database Schema Updates

The following tables are used for Google Drive integration:

### user_settings table

```sql
-- Add drive_connected column if not exists
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS drive_connected BOOLEAN DEFAULT FALSE;
```

### cover_letter_history table

```sql
-- This table should already exist from the main setup
-- It stores the history of exported cover letters
CREATE TABLE IF NOT EXISTS cover_letter_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    drive_file_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE cover_letter_history ENABLE ROW LEVEL SECURITY;

-- Create policy for users to access their own history
CREATE POLICY "Users can access their own cover letter history" ON cover_letter_history
    FOR ALL USING (auth.uid() = user_id);
```

## How It Works

### Authentication Flow

1. User clicks "Connect to Drive" in the app
2. Google OAuth popup opens for authentication
3. User grants permissions for Drive access
4. Access token is stored in the browser session
5. Drive connection status is saved to Supabase

### Export Flow

1. User generates a cover letter
2. User selects a Drive export option (PDF, DOCX, or HTML)
3. App checks for "SmartCover" folder in user's Drive
4. If folder doesn't exist, it's created automatically
5. File is uploaded to the SmartCover folder
6. Export details are saved to cover_letter_history table
7. User receives confirmation with Drive link

### File Organization

- All cover letters are saved to a "SmartCover" folder in the user's Drive root
- Files are named with the format: `{Company}-{Job-Title} - Cover Letter.{extension}`
- The folder is created automatically if it doesn't exist

## Security Considerations

### OAuth Scope

The app only requests `https://www.googleapis.com/auth/drive.file` scope, which means:

- The app can only access files it creates
- It cannot read or modify other files in the user's Drive
- It cannot access the user's entire Drive

### Data Privacy

- No cover letter content is stored on external servers
- Only file metadata (name, Drive file ID) is stored in Supabase
- All file processing happens in the user's browser

### Token Management

- Access tokens are stored in browser session storage only
- Tokens expire and require re-authentication
- No long-term refresh tokens are stored

## Troubleshooting

### Common Issues

1. **"OAuth client ID not found"**

   - Check that VITE_GOOGLE_CLIENT_ID is set correctly
   - Verify the client ID in Google Cloud Console

2. **"Redirect URI mismatch"**

   - Ensure your domain is added to authorized redirect URIs
   - Check that the current URL matches the configured URIs

3. **"API key not valid"**

   - Verify VITE_GOOGLE_API_KEY is set correctly
   - Check that the Drive API is enabled for your project

4. **"Access denied"**
   - User may have denied permissions
   - App may need to go through OAuth verification if not verified

### Development vs Production

**Development:**

- Use `http://localhost:5173` for authorized origins and redirects
- Test with personal Google account
- API keys can be unrestricted for testing

**Production:**

- Use your actual domain for authorized origins and redirects
- Consider API key restrictions for security
- May need OAuth app verification for external users

## Testing

1. Start the development server: `npm run dev`
2. Log in to the app with your Google account (via Supabase)
3. Click "Drive" in the header to open Drive connection manager
4. Click "Connect to Drive" and complete OAuth flow
5. Generate a cover letter and try exporting to Drive
6. Check your Google Drive for the "SmartCover" folder and exported file

## Deployment Notes

When deploying to production:

1. Update the authorized JavaScript origins and redirect URIs in Google Cloud Console
2. Set the correct environment variables in your hosting platform
3. Consider enabling OAuth app verification if your app will have external users
4. Test the complete flow in the production environment

## Rate Limits

Google Drive API has the following rate limits:

- 1,000 requests per 100 seconds per user
- 10,000 requests per 100 seconds

These limits are generally sufficient for typical cover letter generation usage patterns.

## Support

If you encounter issues with Google Drive integration:

1. Check the browser console for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure the Google Cloud project is configured properly
4. Check that the user has granted the necessary permissions

For additional help, refer to the [Google Drive API documentation](https://developers.google.com/drive/api/v3/about-sdk).
