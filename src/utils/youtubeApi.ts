// API utility functions for YouTube Music

// Function to fetch user's playlists from YouTube Music
export const fetchYouTubePlaylists = async (accessToken: string) => {
  try {
    const response = await fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&mine=true&maxResults=50', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch playlists: ${response.status}`);
    }
    
    const data = await response.json();
    return data.items;
  } catch (error) {
    console.error('Error fetching YouTube playlists:', error);
    throw error;
  }
};

// Function to fetch videos from a specific playlist
export const fetchPlaylistVideos = async (accessToken: string, playlistId: string) => {
  try {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch playlist videos: ${response.status}`);
    }
    
    const data = await response.json();
    return data.items;
  } catch (error) {
    console.error('Error fetching playlist videos:', error);
    throw error;
  }
};

// Function to create a new YouTube playlist
export const createYouTubePlaylist = async (accessToken: string, title: string, description?: string) => {
  try {
    const response = await fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet,status', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        snippet: {
          title,
          description
        },
        status: {
          privacyStatus: 'private'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create playlist: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating YouTube playlist:', error);
    throw error;
  }
};

// Function to search for a track on YouTube
// Function to search for a track on YouTube
export const searchYouTubeTrack = async (accessToken: string, query: string) => {
  try {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=1`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to search for track: ${response.status}`);
    }

    const data = await response.json();
    return data.items.length > 0 ? data.items[0] : null;  // Return first result or null
  } catch (error) {
    console.error('Error searching YouTube track:', error);
    throw error;
  }
};

// Function to add a track to a YouTube playlist
export const addTrackToYouTubePlaylist = async (accessToken: string, playlistId: string, videoId: string) => {
  try {
    const response = await fetch('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        snippet: {
          playlistId,
          resourceId: {
            kind: 'youtube#video',
            videoId
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to add track to playlist: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding track to YouTube playlist:', error);
    throw error;
  }
};
