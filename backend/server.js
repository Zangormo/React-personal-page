import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let cachedToken = null;
let tokenExpiry = 0;

// Function to get a fresh access token using refresh token
async function getAccessToken() {
  // If we have a valid cached token, use it
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!refreshToken || !clientId || !clientSecret) {
    throw new Error('Missing Spotify credentials in environment variables');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  });

  const data = await response.json();
  
  if (data.access_token) {
    cachedToken = data.access_token;
    // Set expiry to 50 minutes (tokens last 1 hour)
    tokenExpiry = Date.now() + (50 * 60 * 1000);
    return cachedToken;
  }

  throw new Error('Failed to refresh token');
}

// Endpoint to get current playback
app.get('/api/playback', async (req, res) => {
  try {
    const token = await getAccessToken();
    
    const response = await fetch('https://api.spotify.com/v1/me/player', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 204) {
      return res.json({ playing: false });
    }

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Return sanitized data
    res.json({
      playing: true,
      songName: data?.item?.name || 'Unknown',
      artistName: data?.item?.artists?.[0]?.name || 'Unknown',
      progressMs: data?.progress_ms || 0,
      coverUrl: data?.item?.album?.images?.[1]?.url || null,
      isPlaying: data?.is_playing || false,
      durationMs: data?.item?.duration_ms || 1,
      albumUri: data?.item?.album?.uri || null,
      timestamp: data?.timestamp || Date.now()
    });

  } catch (error) {
    console.error('Error fetching playback:', error);
    res.status(500).json({ error: 'Failed to fetch playback data' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🎵 Spotify backend running on http://localhost:${PORT}`);
});
