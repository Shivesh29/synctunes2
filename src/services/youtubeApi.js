import { createCache } from './cache';

const shortTermCache = createCache(parseInt(import.meta.env.VITE_YT_CACHE_TTL) || 3600);
let remainingQuota = 10000;

export async function fetchFromYouTube(endpoint, params) {
  const cacheKey = `${endpoint}_${JSON.stringify(params)}`;
  const cachedData = shortTermCache.get(cacheKey);
  if (cachedData) return cachedData;

  try {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/${endpoint}?${new URLSearchParams({
      key: import.meta.env.VITE_YT_CLIENT_ID,
      ...params
    })}`);
    if (!response.ok) throw new Error(`YouTube API error: ${response.status}`);
    const data = await response.json();
    shortTermCache.set(cacheKey, data);
    logQuotaUsage(endpoint, params);
    return data;
  } catch (error) {
    console.error('YouTube API request failed:', error);
    throw error;
  }
}

function logQuotaUsage(endpoint, params) {
  const quotaCost = endpoint === 'search' ? 100 : 1;
  remainingQuota -= quotaCost;
  console.log(`Quota used: ${quotaCost}, Remaining quota: ${remainingQuota}`);
}

export async function searchYouTube(query, options = {}) {
  console.log(`Searching YouTube with query: "${query}"`);
  const response = await fetchFromYouTube('search', {
    part: 'snippet',
    maxResults: parseInt(import.meta.env.VITE_YT_MAX_RESULTS_PER_PAGE) || 10,
    q: query,
    type: 'video',
  });
  console.log(`Search results for "${query}":`, response.items);
  return response.items[0] || null; // Return the first result as the best match
}

export async function fetchVideosByIds(ids) {
  const batchSize = 50; // Max IDs per request
  const results = [];

  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const response = await fetchFromYouTube('videos', {
      part: 'snippet,contentDetails,statistics',
      id: batch.join(','),
    });
    results.push(...response.items);
  }

  return results;
}
