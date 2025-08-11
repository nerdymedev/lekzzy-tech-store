# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication for the Lekzzy Tech Store application.

## Prerequisites

- A Supabase account (free tier available)
- Basic understanding of environment variables

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account or log in
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `lekzzy-tech-store` (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose the closest region to your users
6. Click "Create new project"
7. Wait for the project to be set up (usually takes 1-2 minutes)

## Step 2: Get Your Project Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")

## Step 3: Configure Environment Variables

1. Open the `.env` file in your project root
2. Replace the placeholder values with your actual Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Example:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 4: Set Up Authentication

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Configure the following settings:

### Site URL
- **Site URL**: `http://localhost:3000` (for development)
- For production, use your actual domain

### Redirect URLs
Add these URLs to allow redirects after authentication:
- `http://localhost:3000/**` (for development)
- `https://yourdomain.com/**` (for production)

### Email Templates (Optional)
Customize the email templates for:
- Confirm signup
- Reset password
- Magic link

## Step 5: Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Ensure **Email** is enabled (it should be by default)
3. Configure email settings if needed

## Step 6: Set Up User Metadata

The application stores additional user information in the `user_metadata` field:
- `firstName`: User's first name
- `lastName`: User's last name
- `full_name`: User's full name

This is automatically handled by the application during signup.

## Step 7: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`
3. Try signing up with a new account
4. Check your email for the confirmation link
5. Confirm your account and try signing in

## Available Features

### Authentication
- ✅ Email/Password signup and signin
- ✅ Email verification
- ✅ Password reset (can be implemented)
- ✅ User profile management
- ✅ Secure session management

### User Management
- ✅ User metadata storage (name, etc.)
- ✅ Profile updates
- ✅ Account deletion (can be implemented)

### Security
- ✅ Row Level Security (RLS) ready
- ✅ JWT-based authentication
- ✅ Secure API endpoints

## Available Routes

- `/sign-in` - Custom sign-in page
- `/sign-up` - Custom sign-up page
- `/` - Home page (shows user status)
- `/seller` - Seller dashboard (requires authentication)

## Troubleshooting

### Common Issues

1. **"Invalid API key" error**
   - Double-check your environment variables
   - Ensure you're using the `anon` key, not the `service_role` key
   - Restart your development server after changing `.env`

2. **Email not sending**
   - Check your Supabase project's email settings
   - Verify your email provider configuration
   - Check spam folder

3. **Redirect issues**
   - Ensure your Site URL and Redirect URLs are correctly configured
   - Check for typos in the URLs

4. **User not persisting**
   - Check browser console for errors
   - Verify your Supabase client configuration
   - Ensure cookies are enabled

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Community](https://github.com/supabase/supabase/discussions)

## Next Steps

After setting up authentication, you can:

1. **Set up database tables** for products, orders, etc.
2. **Implement Row Level Security** for data protection
3. **Add social authentication** (Google, GitHub, etc.)
4. **Set up email templates** for better user experience
5. **Configure webhooks** for advanced integrations

## Production Deployment

When deploying to production:

1. Update your Site URL and Redirect URLs in Supabase
2. Set your production environment variables
3. Consider upgrading to a paid Supabase plan for better performance
4. Set up proper error monitoring and logging

---

**Note**: Keep your Supabase keys secure and never commit them to version control. The `anon` key is safe to use in client-side code, but the `service_role` key should only be used server-side.