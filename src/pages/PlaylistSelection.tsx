import { transferSpotifyPlaylistToYouTube } from "@/utils/transferService";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { SpotifyIcon } from "@/components/icons/SpotifyIcon";
import { YouTubeMusicIcon } from "@/components/icons/YouTubeMusicIcon";
import { toast } from "@/components/ui/use-toast";
import { getSpotifyToken } from "@/utils/spotifyAuth";
import { getYouTubeToken } from "@/utils/youtubeAuth";
import { fetchSpotifyPlaylists } from "@/utils/spotifyApi";
import { fetchYouTubePlaylists } from "@/utils/youtubeApi";
import { ArrowLeft, ArrowRight, Loader2, Music } from "lucide-react";

// Define types for playlist objects
type SpotifyPlaylist = {
  id: string;
  name: string;
  images: Array<{ url: string }>;
  tracks: { total: number };
  selected?: boolean;
};

type YouTubePlaylist = {
  id: string;
  snippet: {
    title: string;
    thumbnails: {
      default?: { url: string };
      medium?: { url: string };
      high?: { url: string };
    };
  };
  contentDetails: {
    itemCount: number;
  };
  selected?: boolean;
};

const PlaylistSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[] | YouTubePlaylist[]>([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([]);
  const [transferring, setTransferring] = useState(false);
  
  // Get transfer direction from state or default to spotifyToYt
  const transferDirection = location.state?.direction || "spotifyToYt";
  const isFromSpotify = transferDirection === "spotifyToYt";
  
  // Determine source service based on transfer direction
  const sourceService = isFromSpotify ? "Spotify" : "YouTube Music";
  const targetService = isFromSpotify ? "YouTube Music" : "Spotify";
  
  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        setLoading(true);
        let fetchedPlaylists = [];
        
        if (isFromSpotify) {
          // Fetch Spotify playlists
          const spotifyToken = getSpotifyToken();
          if (!spotifyToken) {
            toast({
              title: "Authentication Error",
              description: "Please connect your Spotify account first.",
              variant: "destructive",
            });
            navigate("/");
            return;
          }
          fetchedPlaylists = await fetchSpotifyPlaylists(spotifyToken);
        } else {
          // Fetch YouTube playlists
          const youtubeToken = getYouTubeToken();
          if (!youtubeToken) {
            toast({
              title: "Authentication Error",
              description: "Please connect your YouTube Music account first.",
              variant: "destructive",
            });
            navigate("/");
            return;
          }
          fetchedPlaylists = await fetchYouTubePlaylists(youtubeToken);
        }
        
        setPlaylists(fetchedPlaylists);
      } catch (error) {
        toast({
          title: "Error Fetching Playlists",
          description: `Could not load your ${sourceService} playlists.`,
          variant: "destructive",
        });
        console.error("Error fetching playlists:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlaylists();
  }, [isFromSpotify, navigate, sourceService]);
  
  const handlePlaylistSelection = (playlistId: string) => {
    setSelectedPlaylists(prev => {
      if (prev.includes(playlistId)) {
        return prev.filter(id => id !== playlistId);
      } else {
        return [...prev, playlistId];
      }
    });
  };
  
  const handleSelectAll = () => {
    if (selectedPlaylists.length === playlists.length) {
      // Deselect all
      setSelectedPlaylists([]);
    } else {
      // Select all
      if (isFromSpotify) {
        setSelectedPlaylists((playlists as SpotifyPlaylist[]).map(p => p.id));
      } else {
        setSelectedPlaylists((playlists as YouTubePlaylist[]).map(p => p.id));
      }
    }
  };
  
  const handleTransfer = async () => {
    if (selectedPlaylists.length === 0) {
      toast({
        title: "No Playlists Selected",
        description: "Please select at least one playlist to transfer.",
        variant: "destructive",
      });
      return;
    }
    
    setTransferring(true);
    
    try {
      if (transferDirection === "spotifyToYt") {
        // Get tokens
        const spotifyToken = getSpotifyToken();
        const youtubeToken = getYouTubeToken();
        
        if (!spotifyToken || !youtubeToken) {
          throw new Error("Authentication tokens not available");
        }
        
        // Track progress and results
        const successfulTransfers = [];
        const failedTransfers = [];
        
        // Process each selected playlist
        for (const playlistId of selectedPlaylists) {
          try {
            // Find the playlist object
            const playlist = playlists.find(p => 'id' in p && p.id === playlistId) as SpotifyPlaylist;
            
            if (!playlist) continue;
            
            // Update progress message
            toast({
              title: "Transfer in Progress",
              description: `Transferring playlist: ${playlist.name}`,
            });
            
            // Transfer the playlist
            await transferSpotifyPlaylistToYouTube(
              spotifyToken,
              youtubeToken,
              playlist
            );
            
            successfulTransfers.push(playlist.name);
          } catch (error) {
            console.error(`Error transferring playlist:`, error);
            failedTransfers.push(playlistId);
          }
        }
        
        // Show completion message
        if (successfulTransfers.length > 0) {
          toast({
            title: "Transfer Complete",
            description: `Successfully transferred ${successfulTransfers.length} ${successfulTransfers.length === 1 ? 'playlist' : 'playlists'} to YouTube Music.`,
          });
        }
        
        if (failedTransfers.length > 0) {
          toast({
            title: "Some Transfers Failed",
            description: `Failed to transfer ${failedTransfers.length} ${failedTransfers.length === 1 ? 'playlist' : 'playlists'}.`,
            variant: "destructive"
          });
        }
        
      } else {
        // YouTube to Spotify direction not implemented yet
        toast({
          title: "Not Supported Yet",
          description: "Transferring from YouTube Music to Spotify is not implemented yet.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Transfer error:", error);
      toast({
        title: "Transfer Failed",
        description: "There was an error transferring your playlists. Please try again.",
        variant: "destructive"
      });
    } finally {
      setTransferring(false);
      navigate("/");
    }
  };
  
  // Render Spotify playlists
  const renderSpotifyPlaylists = () => {
    return (playlists as SpotifyPlaylist[]).map((playlist) => (
      <Card key={playlist.id} className="bg-zinc-800 border-zinc-700 hover:bg-zinc-750 transition">
        <CardContent className="p-4 flex items-center">
          <div className="flex-shrink-0 mr-4">
            <Checkbox
              checked={selectedPlaylists.includes(playlist.id)}
              onCheckedChange={() => handlePlaylistSelection(playlist.id)}
              className="data-[state=checked]:bg-[#1DB954] data-[state=checked]:text-white"
            />
          </div>
          
          <div className="flex items-center flex-grow min-w-0">
            <div className="h-12 w-12 rounded overflow-hidden flex-shrink-0 mr-3 bg-zinc-700">
              {playlist.images && playlist.images[0] ? (
                <img 
                  src={playlist.images[0].url} 
                  alt={playlist.name} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-zinc-700">
                  <Music size={20} className="text-zinc-400" />
                </div>
              )}
            </div>
            
            <div className="min-w-0">
              <h3 className="text-white font-medium truncate">{playlist.name}</h3>
              <p className="text-zinc-400 text-sm">{playlist.tracks.total} tracks</p>
            </div>
          </div>
        </CardContent>
      </Card>
    ));
  };
  
  // Render YouTube playlists
  const renderYouTubePlaylists = () => {
    return (playlists as YouTubePlaylist[]).map((playlist) => (
      <Card key={playlist.id} className="bg-zinc-800 border-zinc-700 hover:bg-zinc-750 transition">
        <CardContent className="p-4 flex items-center">
          <div className="flex-shrink-0 mr-4">
            <Checkbox
              checked={selectedPlaylists.includes(playlist.id)}
              onCheckedChange={() => handlePlaylistSelection(playlist.id)}
              className="data-[state=checked]:bg-[#FF0000] data-[state=checked]:text-white"
            />
          </div>
          
          <div className="flex items-center flex-grow min-w-0">
            <div className="h-12 w-12 rounded overflow-hidden flex-shrink-0 mr-3 bg-zinc-700">
              {playlist.snippet.thumbnails && (
                playlist.snippet.thumbnails.medium?.url || 
                playlist.snippet.thumbnails.default?.url
              ) ? (
                <img 
                  src={
                    playlist.snippet.thumbnails.medium?.url || 
                    playlist.snippet.thumbnails.default?.url || ''
                  } 
                  alt={playlist.snippet.title} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-zinc-700">
                  <Music size={20} className="text-zinc-400" />
                </div>
              )}
            </div>
            
            <div className="min-w-0">
              <h3 className="text-white font-medium truncate">{playlist.snippet.title}</h3>
              <p className="text-zinc-400 text-sm">
                {playlist.contentDetails?.itemCount || 0} videos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    ));
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-zinc-900 p-4">
      <div className="w-full max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div className="flex items-center space-x-2">
            {isFromSpotify ? (
              <>
                <SpotifyIcon className="h-5 w-5" />
                <ArrowRight className="h-4 w-4 text-zinc-400" />
                <YouTubeMusicIcon className="h-5 w-5" />
              </>
            ) : (
              <>
                <YouTubeMusicIcon className="h-5 w-5" />
                <ArrowRight className="h-4 w-4 text-zinc-400" />
                <SpotifyIcon className="h-5 w-5" />
              </>
            )}
          </div>
        </div>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Select Playlists to Transfer</h1>
          <p className="text-zinc-400 mt-1">
            Choose which {sourceService} playlists to transfer to {targetService}
          </p>
        </div>
        
        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Your Playlists</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSelectAll}
                className="text-zinc-300 border-zinc-600 hover:bg-zinc-700"
              >
                {selectedPlaylists.length === playlists.length 
                  ? "Deselect All" 
                  : "Select All"}
              </Button>
            </div>
            <CardDescription className="text-zinc-400">
              {loading 
                ? "Loading your playlists..." 
                : `${selectedPlaylists.length} of ${playlists.length} selected`}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="max-h-[60vh] overflow-y-auto space-y-2 p-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 text-purple-500 animate-spin mb-2" />
                <p className="text-zinc-400">Loading your playlists...</p>
              </div>
            ) : playlists.length === 0 ? (
              <div className="text-center py-8">
                <Music className="h-10 w-10 text-zinc-500 mx-auto mb-3" />
                <p className="text-zinc-300 font-medium">No playlists found</p>
                <p className="text-zinc-500 text-sm mt-1">
                  We couldn't find any playlists in your {sourceService} account.
                </p>
              </div>
            ) : (
              isFromSpotify ? renderSpotifyPlaylists() : renderYouTubePlaylists()
            )}
          </CardContent>
          
          <CardFooter>
            <Button 
              onClick={handleTransfer} 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              disabled={selectedPlaylists.length === 0 || transferring}
            >
              {transferring ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Transferring...
                </>
              ) : (
                <>
                  Transfer to {targetService}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default PlaylistSelection;
