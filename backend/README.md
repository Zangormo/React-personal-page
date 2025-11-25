# Spotify Backend Server

This backend handles Spotify authentication server-side so all visitors see YOUR playback without needing to login.

## Setup Instructions

### 1. Get Your Spotify Client Secret

1. Go to https://developer.spotify.com/dashboard
2. Click on your app (your_app_name)
3. Click "Settings"
4. Copy your **Client Secret**

### 2. Add Redirect URI

In the same Spotify Dashboard settings, add this redirect URI:
```
http://127.0.0.1:8888/callback
```
(Spotify doesn't allow localhost, use 127.0.0.1 instead)

### 3. Get Your Refresh Token

1. Open `get-refresh-token.js` and replace `YOUR_CLIENT_SECRET` with your actual client secret
2. Run:
   ```bash
   cd backend
   npm install
   node get-refresh-token.js
   ```
3. Follow the instructions in the terminal
4. Copy the refresh token it gives you

### 4. Configure Environment

1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```
2. Fill in your credentials in `.env`:
   ```
   SPOTIFY_CLIENT_ID=your_client_id_here
   SPOTIFY_CLIENT_SECRET=your_secret_here
   SPOTIFY_REFRESH_TOKEN=your_refresh_token_here
   PORT=3001
   ```

### 5. Run the Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will run on http://localhost:3001

### 6. Test It

Visit: http://localhost:3001/api/playback

You should see your current Spotify playback data!

## Deployment

### Option 1: Railway (Easiest)
1. Push code to GitHub
2. Go to https://railway.app
3. Create new project from GitHub repo
4. Add environment variables in Railway dashboard
5. Deploy!

### Option 2: Render
1. Push code to GitHub
2. Go to https://render.com
3. Create new Web Service
4. Add environment variables
5. Deploy!

### Option 3: Vercel Serverless
Convert this to a serverless function (see Vercel docs)

## Next Steps

After deploying your backend, update your React app to use the backend API instead of client-side OAuth.
