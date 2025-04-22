import { RateLimiter } from './rateLimiter';
import { searchYouTube } from './youtubeApi';

const spotifyRateLimiter = new RateLimiter(
  parseInt(import.meta.env.VITE_SPOTIFY_RATE_LIMIT) || 100,
  1000
);

const retryDelay = parseInt(import.meta.env.VITE_RETRY_DELAY) || 2000;
const maxRetries = parseInt(import.meta.env.VITE_MAX_RETRIES) || 3;
const batchSize = parseInt(import.meta.env.VITE_BATCH_SIZE) || 5;

async function transferTrack(track, spotifyApi, youtubeApi) {
  console.log(`Starting transfer for track: ${track.title}`);
  const searchQueries = [
    `${track.title} ${track.artist} official audio`,
    `${track.title} ${track.artist}`,
    `${track.title.replace(/\(.*?\)/g, '')} ${track.artist}`, // Remove parentheses
  ];

  let youtubeTrack = null;
  for (const query of searchQueries) {
    youtubeTrack = await searchYouTube(query);
    if (youtubeTrack) break;
  }

  if (!youtubeTrack) {
    console.warn(`No match found for track: ${track.title}`);
    return { success: false, track, reason: 'No match found' };
  }

  try {
    await youtubeApi.addTrackToPlaylist(youtubeTrack.id);
    console.log(`Successfully transferred track: ${track.title}`);
    return { success: true, track };
  } catch (error) {
    console.error(`Failed to transfer track: ${track.title}`, error);
    return { success: false, track, reason: error.message };
  }
}

async function retry(fn, attempt = 1) {
  try {
    return await fn();
  } catch (error) {
    if (attempt >= maxRetries) {
      console.error(`Failed after ${attempt} attempts:`, error);
      return { success: false, error };
    }
    const delay = retryDelay * Math.pow(2, attempt - 1);
    console.warn(`Retrying in ${delay}ms...`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return retry(fn, attempt + 1);
  }
}

export async function transferAllTracks(tracks, spotifyApi, youtubeApi) {
  const results = [];
  for (let i = 0; i < tracks.length; i += batchSize) {
    const batch = tracks.slice(i, i + batchSize);
    console.log(`Processing batch: ${batch.map(t => t.title).join(', ')}`);
    for (const track of batch) {
      const result = await retry(() => transferTrack(track, spotifyApi, youtubeApi));
      results.push(result);
    }
  }
  return results;
}
