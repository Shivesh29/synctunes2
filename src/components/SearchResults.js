import { useState, useEffect } from 'react';
import { fetchFromYouTube } from '../services/youtubeApi';

export default function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState(null);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      try {
        const response = await fetchFromYouTube('search', {
          part: 'snippet',
          maxResults: parseInt(import.meta.env.VITE_YT_MAX_RESULTS_PER_PAGE) || 10,
          q: query,
          type: 'video',
          pageToken: nextPageToken
        });
        setResults(prev => [...prev, ...response.items]);
        setNextPageToken(response.nextPageToken || null);
        setHasMore(!!response.nextPageToken);
      } catch (error) {
        console.error('Error fetching YouTube results:', error);
      } finally {
        setLoading(false);
      }
    }

    if (query) fetchResults();
  }, [query, nextPageToken]);

  return (
    <div>
      <div className="results-grid">
        {results.map(item => (
          <div key={item.id.videoId} className="result-card">
            {/* Render video preview */}
          </div>
        ))}
      </div>
      {hasMore && (
        <button onClick={() => setNextPageToken(nextPageToken)} disabled={loading}>
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
