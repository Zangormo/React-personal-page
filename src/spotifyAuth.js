const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID; // Replace with your Spotify Client ID
const REDIRECT_URI = window.location.origin + "/callback"; // Dynamically use current URL
const SCOPES = "user-read-currently-playing user-read-playback-state";

// Generate a random string for PKCE
function generateRandomString(length) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

// Hash the code verifier using SHA-256
async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
}

// Base64 encode the hash
function base64encode(input) {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export async function redirectToSpotifyAuth() {
  const codeVerifier = generateRandomString(64);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);

  // Store the verifier for later use
  localStorage.setItem('code_verifier', codeVerifier);

  const authUrl = new URL("https://accounts.spotify.com/authorize");
  const params = {
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    scope: SCOPES
  };

  authUrl.search = new URLSearchParams(params).toString();
  window.location.href = authUrl.toString();
}

export async function getAccessToken() {
  console.log("getAccessToken called");
  
  // Check if we have an authorization code in URL (after redirect from Spotify)
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  
  if (code) {
    console.log("Found authorization code, exchanging for token...");
    const codeVerifier = localStorage.getItem('code_verifier');
    
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier,
      }),
    });

    const data = await response.json();
    console.log("Token response:", data);
    
    if (data.access_token) {
      const expiryTime = Date.now() + data.expires_in * 1000;
      localStorage.setItem("spotify_access_token", data.access_token);
      localStorage.setItem("spotify_token_expiry", expiryTime.toString());
      localStorage.setItem("spotify_refresh_token", data.refresh_token);
      localStorage.removeItem('code_verifier');
      
      // Clean up URL
      window.history.replaceState({}, document.title, "/");
      
      return data.access_token;
    }
  }
  
  // Check if token is in localStorage
  const token = localStorage.getItem("spotify_access_token");
  const expiry = localStorage.getItem("spotify_token_expiry");

  if (token && expiry && Date.now() < parseInt(expiry)) {
    console.log("Found valid token in localStorage");
    return token;
  }

  console.log("No valid token found");
  return null;
}

export function logout() {
  localStorage.removeItem("spotify_access_token");
  localStorage.removeItem("spotify_token_expiry");
  localStorage.removeItem("spotify_refresh_token");
  localStorage.removeItem("code_verifier");
}
