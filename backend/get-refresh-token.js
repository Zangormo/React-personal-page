// Helper script to get your refresh token
// Run this ONCE to get your refresh token, then save it in .env

import { createServer } from 'http';
import { parse } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = 'http://127.0.0.1:8888/callback';
const SCOPES = 'user-read-currently-playing user-read-playback-state';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ Error: Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in .env file');
  process.exit(1);
}

console.log('\n🎵 Spotify Refresh Token Generator\n');
console.log('1. Add http://127.0.0.1:8888/callback to your Spotify app\'s redirect URIs (not localhost)');
console.log('2. Update CLIENT_SECRET in this file');
console.log('3. Visit this URL in your browser:\n');
console.log(`https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}\n`);
console.log('4. After authorizing, you\'ll be redirected back here...\n');

const server = createServer(async (req, res) => {
  const { query } = parse(req.url, true);
  
  if (query.code) {
    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: query.code,
          redirect_uri: REDIRECT_URI
        })
      });

      const data = await response.json();

      if (data.refresh_token) {
        console.log('\n✅ Success! Add this to your .env file:\n');
        console.log(`SPOTIFY_REFRESH_TOKEN=${data.refresh_token}\n`);
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <h1>✅ Success!</h1>
          <p>Copy this refresh token to your .env file:</p>
          <pre style="background: #f4f4f4; padding: 20px; border-radius: 8px;">SPOTIFY_REFRESH_TOKEN=${data.refresh_token}</pre>
          <p>You can close this window and stop the server (Ctrl+C)</p>
        `);
        
        setTimeout(() => {
          console.log('Closing server...');
          server.close();
          process.exit(0);
        }, 2000);
      } else {
        throw new Error('No refresh token received');
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      res.writeHead(500);
      res.end('Error: ' + error.message);
    }
  }
});

server.listen(8888, '127.0.0.1', () => {
  console.log('Server listening on http://127.0.0.1:8888');
});
