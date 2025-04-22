import Cache from '../utils/cache';
import RateLimiter from '../utils/rateLimiter';
import { convertToYouTubeMusicUrl, enhancePlaylistMetadata } from '../utils/youtubeMusic';

const spotifyCache = new Cache('spotify', process.env.VITE_SPOTIFY_CACHE_TTL);
const ytCache = new Cache('youtube', process.env.VITE_YT_CACHE_TTL);

const spotifyRateLimiter = new RateLimiter(process.env.VITE_SPOTIFY_RATE_LIMIT, 60000);
const ytRateLimiter = new RateLimiter(process.env.VITE_YT_RATE_LIMIT, 60000);

async function fetchWithCacheAndRateLimit(url, cache, rateLimiter, options = {}) {
    const cachedResponse = cache.get(url);
    if (cachedResponse) {
        return cachedResponse;
    }

    const response = await rateLimiter.schedule(() => fetch(url, options));
    const data = await response.json();
    cache.set(url, data);
    return data;
}

export async function fetchSpotifyData(endpoint, options) {
    const url = `https://api.spotify.com/v1/${endpoint}`;
    return fetchWithCacheAndRateLimit(url, spotifyCache, spotifyRateLimiter, options);
}

export async function fetchYouTubeData(endpoint, options) {
    const url = `https://www.googleapis.com/youtube/v3/${endpoint}`;
    return fetchWithCacheAndRateLimit(url, ytCache, ytRateLimiter, options);
}

export async function transferPlaylist(playlistId) {
    const youtubeUrl = `https://www.youtube.com/playlist?list=${playlistId}`;
    const youtubeMusicUrl = convertToYouTubeMusicUrl(playlistId);
    const enhancedMetadata = enhancePlaylistMetadata(metadata);

    return {
        youtubeUrl,
        youtubeMusicUrl,
        metadata: enhancedMetadata
    };
}
