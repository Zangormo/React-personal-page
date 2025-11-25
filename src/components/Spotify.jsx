import { useState, useEffect } from "react";
import "./Spotify.css";
import { translations } from "../translations.js";
import { getPlaybackFromBackend } from "../backendApi.js";

function Spotify({ language = 'en' }) {
  const [playback, setPlayback] = useState(null);
  const [timestamp, setTimestamp] = useState(null);
  const [localProgress, setLocalProgress] = useState(0);

  const t = translations[language];

  useEffect(() => {
    const fetchPlayback = async () => {
      try {
        const data = await getPlaybackFromBackend();
        
        if (!data || !data.playing) {
          setPlayback(null);
          return;
        }

        setTimestamp(data.timestamp);

        const playbackInfo = new PlaybackInfo(
          data.songName,
          data.artistName,
          data.progressMs,
          data.coverUrl,
          data.isPlaying,
          data.durationMs,
          data.albumUri
        );

        setPlayback(playbackInfo);
        setLocalProgress(data.progressMs);
      } catch (error) {
        console.error("Failed to fetch playback:", error);
      }
    };

    fetchPlayback();
    const interval = setInterval(fetchPlayback, 1000);

    return () => clearInterval(interval);
  }, []);

  // Smooth progress animation
  useEffect(() => {
    if (!playback || !playback.isPlaying) return;

    const animationInterval = setInterval(() => {
      setLocalProgress((prev) => {
        const next = prev + 100; // Add 100ms every 100ms
        return Math.min(next, playback.durationMs);
      });
    }, 100);

    return () => clearInterval(animationInterval);
  }, [playback]);

  if (!playback) return <p className="spotify-empty">Ничего не играет</p>;

  const minutesAgo =
    !playback.isPlaying && timestamp
      ? Math.floor((Date.now() - timestamp) / 60000)
      : null;
  
  const progressPercent = playback
    ? Math.min((localProgress / playback.durationMs) * 100, 100)
    : 0;

  // Convert spotify:album:xxx to https://open.spotify.com/album/xxx
  const albumUrl = playback.albumUri 
    ? playback.albumUri.replace('spotify:album:', 'https://open.spotify.com/album/')
    : '#';

  return ( 
    <div>
        <div className="spotify-paused">
          {!playback.isPlaying && minutesAgo !== null && (
            <>{minutesAgo} {t.minAgo}</>
          )}
        </div>
        <div className="spotify-player">
        {playback.coverMedium && (
            <a href={albumUrl} target="_blank" rel="noopener noreferrer">
              <img src={playback.coverMedium} alt="cover" className="spotify-cover" />
            </a>
        )}
            
        <div className="spotify-info">
            <div className="spotify-title">{playback.songName}</div>
            <div className="spotify-artist">{playback.artistName}</div>

        
            <div className="spotify-progress-bar">
              <div
                  className={`spotify-progress-fill ${!playback.isPlaying ? 'paused' : ''}`}
                  style={{ width: `${progressPercent}%` }}
              >
                <div className="spotify-progress-dot"></div>
              </div>
            </div>

        </div>
        </div>
    </div>
  );
}

export default Spotify;

class PlaybackInfo {
  constructor(songName, artistName, progressMs, coverMedium, isPlaying, durationMs, albumUri) {
    this.songName = songName;
    this.artistName = artistName;
    this.progressMs = progressMs;
    this.coverMedium = coverMedium;
    this.isPlaying = isPlaying;
    this.durationMs = durationMs;
    this.albumUri = albumUri;
  }
}
