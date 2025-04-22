// API utility functions for Spotify

// Function to fetch user's playlists from Spotify
export const fetchSpotifyPlaylists = async (accessToken: string) => {
  try {
    const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
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
    console.error('Error fetching Spotify playlists:', error);
    throw error;
  }
};

// Function to fetch tracks from a specific playlist
export const fetchPlaylistTracks = async (accessToken: string, playlistId: string) => {
  try {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch playlist tracks: ${response.status}`);
    }
    
    const data = await response.json();
    return data.items;
  } catch (error) {
    console.error('Error fetching playlist tracks:', error);
    throw error;
  }
};

// Function to fetch tracks from a Spotify playlist
export const fetchSpotifyPlaylistTracks = async (accessToken: string, playlistId: string) => {
  try {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch playlist tracks: ${response.status}`);
    }

    const data = await response.json();
    return data.items.map((item: any) => ({
      name: item.track.name,
      artists: item.track.artists.map((artist: any) => artist.name)
    }));
  } catch (error) {
    console.error('Error fetching Spotify playlist tracks:', error);
    throw error;
  }
};
