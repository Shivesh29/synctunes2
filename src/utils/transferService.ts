import { fetchPlaylistTracks } from './spotifyApi';
import { createYouTubePlaylist, searchYouTubeTrack, addTrackToYouTubePlaylist } from './youtubeApi';

export const transferSpotifyPlaylistToYouTube = async (spotifyAccessToken: string, youtubeAccessToken: string, playlist: { id: string, name: string, description?: string }) => {
  try {
    // Fetch tracks from Spotify playlist
    const spotifyTracksResponse = await fetchPlaylistTracks(spotifyAccessToken, playlist.id);

    // Create a new YouTube playlist
    const youtubePlaylist = await createYouTubePlaylist(youtubeAccessToken, playlist.name, playlist.description);
    const youtubePlaylistId = youtubePlaylist.id;

    // Search for each track on YouTube and add to the new YouTube playlist
    for (const item of spotifyTracksResponse) {
      if (!item.track) continue; // Skip null tracks
      
      const track = item.track;
      const artistNames = track.artists.map((artist: any) => artist.name).join(' ');
      const query = `${track.name} ${artistNames}`;
      
      const youtubeSearchResult = await searchYouTubeTrack(youtubeAccessToken, query);

      if (youtubeSearchResult && youtubeSearchResult.id && youtubeSearchResult.id.videoId) {
        await addTrackToYouTubePlaylist(youtubeAccessToken, youtubePlaylistId, youtubeSearchResult.id.videoId);
      }
    }

    return youtubePlaylistId;
  } catch (error) {
    console.error('Error transferring Spotify playlist to YouTube:', error);
    throw error;
  }
};