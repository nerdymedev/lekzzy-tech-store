# Google OAuth Setup Guide for Supabase

This guide will help you set up Google OAuth authentication for your Supabase project.

## Prerequisites

- A Supabase project (already created)
- A Google Cloud Console account
- Your application running on `http://localhost:3000`

## Step 1: Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to **APIs & Services** → **Library**
   - Search for "Google+ API" and enable it
   - Also enable "Google Identity API" if available

## Step 2: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client IDs**
3. Configure the OAuth consent screen first if prompted:
   - Choose **External** user type
   - Fill in the required fields:
     - App name: Your app name
     - User support email: Your email
     - Developer contact information: Your email
   - Add scopes: `email`, `profile`, `openid`
   - Add test users if needed

4. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Name: Your app name
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - Authorized redirect URIs:
     - `https://jzpfanjnhjebxsrfpxpp.supabase.co/auth/v1/callback`
     - Replace `jzpfanjnhjebxsrfpxpp` with your actual Supabase project reference

5. Save and copy the **Client ID** and **Client Secret**

## Step 3: Configure Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **Providers**
4. Find **Google** and click to configure
5. Enable Google provider
6. Enter your Google OAuth credentials:
   - **Client ID**: Paste from Google Cloud Console
   - **Client Secret**: Paste from Google Cloud Console
7. Click **Save**

## Step 4: Configure Site URL and Redirect URLs

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `http://localhost:3000` (for development)
3. Add **Redirect URLs**:
   - `http://localhost:3000/**`
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/**` (for production)

## Step 5: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/sign-in`
3. Click "Sign in with Google"
4. You should be redirected to Google's OAuth consent screen
5. After authorization, you should be redirected back to your app

## Code Example: Google OAuth with Email Scope

For Google Workspace/Suite users, you may need to explicitly request the email scope:

```javascript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
    scopes: 'https://www.googleapis.com/auth/userinfo.email'
  }
})
```

## Important: Use SSR Package for Next.js

For Next.js applications, make sure to use `@supabase/ssr` instead of `@supabase/supabase-js` for proper session management:

```javascript
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
```

This prevents "refresh_token_not_found" errors and ensures proper cookie-based session handling.

## Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch" error**:
   - Check that your redirect URI in Google Cloud Console matches exactly
   - Ensure you're using the correct Supabase project reference

2. **"invalid_client" error**:
   - Verify your Client ID and Client Secret are correct
   - Make sure the Google+ API is enabled

3. **404 error after OAuth**:
   - This was fixed by creating the `/auth/auth-code-error` page
   - Ensure your callback route is working

4. **"access_denied" error**:
   - User cancelled the OAuth flow
   - Check OAuth consent screen configuration

5. **Google Suite/Workspace Authentication Errors**:
   - If you get errors like "Error getting user email from external provider" or "Missing required authentication credential", add the email scope as shown in the code example above
   - This is required for some Google Workspace configurations

6. **Refresh Token Not Found Errors**:
   - If you get "refresh_token_not_found" errors after OAuth callback, ensure you're using `@supabase/ssr` package instead of `@supabase/supabase-js`
   - Use `createBrowserClient` from `@supabase/ssr` for proper cookie-based session management in Next.js

### Debug Steps:

1. Check browser network tab for failed requests
2. Check Supabase logs in the dashboard
3. Verify environment variables are loaded correctly
4. Test with a different Google account

## Production Deployment

When deploying to production:

1. Update Google Cloud Console:
   - Add production domain to authorized origins
   - Add production callback URL to redirect URIs

2. Update Supabase:
   - Change Site URL to production domain
   - Add production redirect URLs

3. Update environment variables:
   - Ensure production environment has correct Supabase keys

## Security Notes

- Never expose your Client Secret in client-side code
- Use HTTPS in production
- Regularly rotate your OAuth credentials
- Monitor OAuth usage in Google Cloud Console

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase OAuth Providers](https://supabase.com/docs/guides/auth/social-login)