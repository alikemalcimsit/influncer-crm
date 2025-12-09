# 🔐 OAuth Setup Guide

Complete guide to set up OAuth authentication for all social media platforms.

---

## 📋 Table of Contents

1. [YouTube (Google OAuth)](#youtube-google-oauth)
2. [Instagram (Facebook Login)](#instagram-facebook-login)
3. [TikTok (TikTok Login Kit)](#tiktok-tiktok-login-kit)
4. [Twitter/X (OAuth 2.0)](#twitterx-oauth-20)
5. [Testing OAuth Flow](#testing-oauth-flow)
6. [Troubleshooting](#troubleshooting)

---

## 🎥 YouTube (Google OAuth)

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Project name: "Influencer CRM" (or your choice)

### Step 2: Enable YouTube Data API v3

1. Navigate to **APIs & Services** → **Library**
2. Search for "YouTube Data API v3"
3. Click **Enable**

### Step 3: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Configure consent screen:
   - User Type: **External**
   - App name: "Influencer CRM"
   - Support email: Your email
   - Scopes: Add `youtube.upload`, `youtube.readonly`
4. Application type: **Web application**
5. Authorized redirect URIs:
   ```
   http://localhost:5001/api/oauth/youtube/callback
   https://yourdomain.com/api/oauth/youtube/callback
   ```
6. Copy **Client ID** and **Client Secret**

### Step 4: Add to .env

```env
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5001/api/oauth/youtube/callback
```

### Required Scopes
- `https://www.googleapis.com/auth/youtube.upload`
- `https://www.googleapis.com/auth/youtube.readonly`
- `https://www.googleapis.com/auth/userinfo.profile`

---

## 📸 Instagram (Facebook Login)

### Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/apps)
2. Click **Create App**
3. App type: **Business**
4. App name: "Influencer CRM"

### Step 2: Add Instagram Basic Display

1. In your app dashboard, click **Add Product**
2. Find **Instagram Basic Display** → Click **Set Up**
3. Create New App (if prompted)

### Step 3: Add Instagram Graph API

1. Add **Instagram Graph API** product
2. This allows posting to Instagram Business accounts

### Step 4: Configure OAuth Settings

1. Go to **Settings** → **Basic**
2. Copy **App ID** and **App Secret**
3. Add to **Valid OAuth Redirect URIs**:
   ```
   http://localhost:5001/api/oauth/instagram/callback
   https://yourdomain.com/api/oauth/instagram/callback
   ```

### Step 5: Connect Instagram Business Account

1. You need a **Facebook Page**
2. Instagram account must be **Business or Creator** account
3. Link Instagram account to Facebook Page:
   - Instagram app → Settings → Account → Linked Accounts → Facebook

### Step 6: Add to .env

```env
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here
FACEBOOK_REDIRECT_URI=http://localhost:5001/api/oauth/instagram/callback
```

### Required Permissions
- `instagram_basic`
- `instagram_content_publish`
- `pages_read_engagement`
- `pages_show_list`

### Important Notes
- Instagram only supports **Business** and **Creator** accounts
- Personal accounts cannot use Instagram Graph API
- Long-lived tokens last 60 days (auto-refresh implemented)

---

## 🎵 TikTok (TikTok Login Kit)

### Step 1: Register as TikTok Developer

1. Go to [TikTok Developers](https://developers.tiktok.com/)
2. Sign in with TikTok account
3. Apply for developer access
4. Verification may take 1-2 days

### Step 2: Create App

1. Navigate to **My Apps**
2. Click **Create App**
3. Fill in app details:
   - App name: "Influencer CRM"
   - Category: Social Media Management
   - Description: Content scheduling and management platform

### Step 3: Add TikTok Login Kit

1. In app dashboard, go to **Products**
2. Add **TikTok Login Kit**
3. Add **Content Posting API**

### Step 4: Configure Redirect URI

1. Go to **Settings** → **Redirect URI**
2. Add:
   ```
   http://localhost:5001/api/oauth/tiktok/callback
   https://yourdomain.com/api/oauth/tiktok/callback
   ```

### Step 5: Add to .env

```env
TIKTOK_CLIENT_KEY=your_client_key_here
TIKTOK_CLIENT_SECRET=your_client_secret_here
TIKTOK_REDIRECT_URI=http://localhost:5001/api/oauth/tiktok/callback
```

### Required Scopes
- `user.info.basic`
- `video.upload`
- `video.list`
- `video.publish`

### Important Notes
- Tokens expire every **24 hours** (auto-refresh implemented)
- Video size limit: **287 MB**
- Video duration: **10 minutes max**
- Approved apps only (review process required)

---

## 🐦 Twitter/X (OAuth 2.0)

### Step 1: Create Twitter Developer Account

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Sign in with Twitter/X account
3. Apply for **Elevated access** (required for media upload)
4. Approval usually instant or within 24 hours

### Step 2: Create App

1. Click **Create Project** → **Create App**
2. Project name: "Influencer CRM"
3. App name: "Influencer CRM Bot" (must be unique)
4. Environment: **Production**

### Step 3: Configure OAuth 2.0

1. Go to app **Settings** → **User authentication settings**
2. Enable **OAuth 2.0**
3. Type of App: **Web App, Automated App or Bot**
4. Callback URI:
   ```
   http://localhost:5001/api/oauth/twitter/callback
   https://yourdomain.com/api/oauth/twitter/callback
   ```
5. Website URL: `http://localhost:3000`

### Step 4: Get Keys

1. Go to **Keys and tokens**
2. Copy **OAuth 2.0 Client ID** and **Client Secret**
3. Generate **Bearer Token** (optional, for app-only auth)

### Step 5: Add to .env

```env
TWITTER_CLIENT_ID=your_client_id_here
TWITTER_CLIENT_SECRET=your_client_secret_here
TWITTER_REDIRECT_URI=http://localhost:5001/api/oauth/twitter/callback
```

### Required Scopes
- `tweet.read`
- `tweet.write`
- `users.read`
- `offline.access` (for refresh tokens)

### Important Notes
- **Free tier**: 1,500 tweets/month
- **Basic tier** ($100/month): 3,000 tweets/month, 50,000 reads
- **Elevated access** required for media uploads
- Refresh tokens valid indefinitely (until revoked)

---

## 🧪 Testing OAuth Flow

### Backend Testing

1. **Start Backend:**
   ```bash
   cd backend
   npm start
   ```
   Server runs on `http://localhost:5001`

2. **Test Authorization Endpoint:**
   ```bash
   # Get auth URL (requires JWT token)
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        http://localhost:5001/api/oauth/youtube/authorize
   ```

3. **Expected Response:**
   ```json
   {
     "success": true,
     "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?client_id=..."
   }
   ```

### Frontend Flow

1. User clicks "Connect YouTube" button
2. Frontend calls `/api/oauth/youtube/authorize` with JWT token
3. Backend returns authorization URL
4. Frontend redirects user to authorization URL
5. User grants permissions
6. OAuth provider redirects to callback URL
7. Backend exchanges code for tokens
8. Backend stores connection in database
9. Backend redirects user back to frontend with success message

### Manual Testing

1. Get authorization URL from browser:
   ```
   http://localhost:5001/api/oauth/youtube/authorize
   ```
   
2. Copy the `authUrl` from response

3. Open `authUrl` in browser

4. Grant permissions

5. You'll be redirected to:
   ```
   http://localhost:3000/dashboard/platforms?success=youtube
   ```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Invalid redirect URI"
- **Solution**: Make sure redirect URI in .env matches exactly what's configured in OAuth provider
- Include `http://` or `https://`
- No trailing slashes

#### 2. "Invalid state parameter"
- **Cause**: State expired (>10 minutes) or already used
- **Solution**: Restart OAuth flow
- In production, use Redis to store state

#### 3. "Token expired"
- **Cause**: Access token expired
- **Solution**: Call `/api/oauth/:platform/refresh` endpoint
- Auto-refresh is implemented in `PlatformConnection` model

#### 4. "Instagram: No business account found"
- **Cause**: Instagram account is personal, not business
- **Solution**: Convert to Business or Creator account in Instagram app

#### 5. "TikTok: Unauthorized"
- **Cause**: App not approved or scopes not granted
- **Solution**: Submit app for review in TikTok Developer Portal

#### 6. "Twitter: Insufficient permissions"
- **Cause**: App doesn't have Elevated access
- **Solution**: Apply for Elevated access in Twitter Developer Portal

### Debug Mode

Enable verbose logging:

```javascript
// In oauth.service.js
console.log('OAuth Request:', {
  platform,
  code,
  redirectUri
});
```

### Check Connection Status

```bash
# Get all connections for user
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:5001/api/oauth/connections
```

Response:
```json
{
  "success": true,
  "connections": [
    {
      "platform": "youtube",
      "status": "active",
      "platformUsername": "YourChannel",
      "expiresAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

## 📊 OAuth Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/oauth/:platform/authorize` | GET | Get authorization URL |
| `/api/oauth/:platform/callback` | GET | OAuth callback (called by provider) |
| `/api/oauth/:platform/refresh` | POST | Refresh access token |
| `/api/oauth/:platform/revoke` | DELETE | Revoke connection |
| `/api/oauth/connections` | GET | Get all user connections |

---

## 🔄 Token Refresh Strategy

### Automatic Refresh

Implemented in `PlatformConnection` model:

```javascript
// Before each publish, check token expiry
if (connection.isTokenExpired()) {
  await connection.refreshToken();
}
```

### Manual Refresh

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5001/api/oauth/youtube/refresh
```

### Refresh Schedule

- **YouTube**: Every 55 minutes (token expires in 1 hour)
- **Instagram**: Every 50 days (token expires in 60 days)
- **TikTok**: Every 20 hours (token expires in 24 hours)
- **Twitter**: On-demand (refresh token never expires)

---

## 🔒 Security Best Practices

1. **Never commit .env file**
   - Add `.env` to `.gitignore`
   - Use `.env.example` for documentation

2. **Use HTTPS in production**
   - Update redirect URIs to use `https://`
   - Enable SSL certificates

3. **Implement CSRF protection**
   - State parameter is validated
   - State stored temporarily (10 minutes)

4. **Store tokens securely**
   - Tokens encrypted in database (recommended)
   - Never expose tokens in API responses

5. **Rate limiting**
   - Respect API rate limits for each platform
   - Implement exponential backoff

6. **Token rotation**
   - Refresh tokens before expiry
   - Revoke old tokens when refreshed

---

## 📚 Official Documentation

- [YouTube Data API](https://developers.google.com/youtube/v3)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- [TikTok Open API](https://developers.tiktok.com/doc/overview)
- [Twitter API v2](https://developer.twitter.com/en/docs/twitter-api)

---

**Last Updated:** December 9, 2025  
**Status:** ✅ Complete - All OAuth flows implemented
