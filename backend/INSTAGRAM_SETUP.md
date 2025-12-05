# Instagram OAuth Setup Guide

## Overview
Instagram uses Facebook's OAuth system for authentication. To connect Instagram accounts, you need to create a Facebook App and configure it properly.

## Step 1: Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Select "Business" as the app type
4. Fill in your app details:
   - App Name: OnlyFlow (or your preferred name)
   - App Contact Email: your email
   - Business Account: (optional)

## Step 2: Add Instagram Basic Display Product

1. In your Facebook App dashboard, go to "Add Product"
2. Find "Instagram Basic Display" and click "Set Up"
3. Follow the setup wizard

## Step 3: Configure OAuth Settings

1. Go to **Settings** → **Basic** in your Facebook App
2. Add **OAuth Redirect URIs**:
   ```
   http://localhost:3001/api/social/oauth/callback/instagram
   https://yourdomain.com/api/social/oauth/callback/instagram
   ```
3. Save changes

## Step 4: Get App Credentials

1. In **Settings** → **Basic**, you'll find:
   - **App ID** → This is your `FACEBOOK_APP_ID`
   - **App Secret** → Click "Show" to reveal → This is your `FACEBOOK_APP_SECRET`

## Step 5: Configure Environment Variables

Add these to your `backend/.env` file:

```env
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here
FACEBOOK_REDIRECT_URI=/api/social/oauth/callback/instagram
BASE_URL=http://localhost:3001
```

For production:
```env
BASE_URL=https://yourdomain.com
```

## Step 6: Link Instagram to Facebook Page

**Important:** Instagram accounts must be linked to a Facebook Page to use the Instagram API.

1. Go to your Facebook Page
2. Go to **Settings** → **Instagram**
3. Connect your Instagram Business or Creator account
4. Make sure the account is approved and linked

## Step 7: Test the Connection

1. Start your backend server
2. Go to `http://localhost:5173/social`
3. Select an influencer
4. Click "Connect Account" on Instagram
5. You'll be redirected to Facebook to authorize
6. After authorization, you'll be redirected back with your Instagram account connected

## Troubleshooting

### "No Instagram Business Account found"
- Make sure your Instagram account is a Business or Creator account
- Ensure it's linked to a Facebook Page
- Check that the Facebook Page has Instagram connected in Settings

### "Invalid OAuth redirect URI"
- Make sure the redirect URI in your `.env` matches exactly what's configured in Facebook App settings
- Check for trailing slashes or protocol mismatches (http vs https)

### "App Not Setup"
- Make sure you've added the "Instagram Basic Display" product to your Facebook App
- Verify all required permissions are requested in the OAuth scope

## Required Permissions

The app requests these permissions:
- `instagram_basic` - Basic profile information
- `instagram_content_publish` - Post content to Instagram
- `pages_show_list` - List Facebook Pages
- `pages_read_engagement` - Read page engagement data

## Production Checklist

Before going to production:
- [ ] Update `BASE_URL` to your production domain
- [ ] Add production redirect URI to Facebook App settings
- [ ] Test OAuth flow in production environment
- [ ] Set up proper error logging
- [ ] Configure token refresh mechanism (tokens expire after 60 days)

