// Simple API client for backend
// Empty string uses the same host (works with proxy)
const API_URL = import.meta.env.VITE_API_URL || '';

export async function getPlaybackFromBackend() {
  try {
    const response = await fetch(`${API_URL}/api/playback`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch playback from backend:', error);
    return null;
  }
}
