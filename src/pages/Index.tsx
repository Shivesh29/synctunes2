import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SpotifyIcon } from "@/components/icons/SpotifyIcon";
import { YouTubeMusicIcon } from "@/components/icons/YouTubeMusicIcon";
import { ArrowLeftRight, List } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { initiateSpotifyLogin, getSpotifyToken, logoutSpotify } from "@/utils/spotifyAuth";
import { initiateYouTubeLogin, getYouTubeToken, logoutYouTube } from "@/utils/youtubeAuth";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [ytMusicConnected, setYtMusicConnected] = useState(false);
  const [transferDirection, setTransferDirection] = useState<"spotifyToYt" | "ytToSpotify">("spotifyToYt");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Check if tokens exist on page load
  useEffect(() => {
    const spotifyToken = getSpotifyToken();
    const youtubeToken = getYouTubeToken();
    
    if (spotifyToken) {
      console.log("Spotify token found in localStorage");
      setSpotifyConnected(true);
    }
    
    if (youtubeToken) {
      console.log("YouTube Music token found in localStorage");
      setYtMusicConnected(true);
    }
  }, []);

  const handleSpotifyConnect = () => {
    if (spotifyConnected) {
      logoutSpotify();
      setSpotifyConnected(false);
      toast({
        title: "Disconnected from Spotify",
        description: "Your Spotify account has been disconnected.",
      });
    } else {
      console.log("Connecting to Spotify...");
      // Set the service being authenticated
      localStorage.setItem('auth_service', 'spotify');
      // Start OAuth flow
      initiateSpotifyLogin();
    }
  };

  const handleYouTubeMusicConnect = () => {
    if (ytMusicConnected) {
      logoutYouTube();
      setYtMusicConnected(false);
      toast({
        title: "Disconnected from YouTube Music",
        description: "Your YouTube Music account has been disconnected.",
      });
    } else {
      console.log("Connecting to YouTube Music...");
      // Set the service being authenticated
      localStorage.setItem('auth_service', 'youtube');
      // Start OAuth flow
      initiateYouTubeLogin();
    }
  };

  const handleTransfer = () => {
    if (!spotifyConnected || !ytMusicConnected) {
      toast({
        title: "Connection Required",
        description: "Please connect both music services before transferring.",
        variant: "destructive",
      });
      return;
    }
    
    // Navigate to playlist selection instead of direct transfer
    navigate("/playlists", { 
      state: { 
        direction: transferDirection 
      } 
    });
  };

  const toggleTransferDirection = () => {
    setTransferDirection(transferDirection === "spotifyToYt" ? "ytToSpotify" : "spotifyToYt");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black to-zinc-900 p-4">
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Music Transfer</h1>
          <p className="text-zinc-400">Transfer your playlists between Spotify and YouTube Music</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <SpotifyIcon className="h-6 w-6" />
                Spotify
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Connect your Spotify account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-300 text-sm mb-4">
                {spotifyConnected 
                  ? "Your Spotify account is connected" 
                  : "Connect to access your Spotify playlists"}
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSpotifyConnect} 
                className={`w-full ${spotifyConnected 
                  ? "bg-red-600 hover:bg-red-700" 
                  : "bg-[#1DB954] hover:bg-[#1DB954]/90"} text-white`}
              >
                {spotifyConnected ? "Disconnect" : "Connect Spotify"}
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <YouTubeMusicIcon className="h-6 w-6" />
                YouTube Music
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Connect your YouTube Music account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-300 text-sm mb-4">
                {ytMusicConnected 
                  ? "Your YouTube Music account is connected" 
                  : "Connect to access your YouTube Music playlists"}
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleYouTubeMusicConnect} 
                className={`w-full ${ytMusicConnected 
                  ? "bg-red-600 hover:bg-red-700" 
                  : "bg-[#FF0000] hover:bg-[#FF0000]/90"} text-white`}
              >
                {ytMusicConnected ? "Disconnect" : "Connect YouTube Music"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader>
            <CardTitle className="text-white">Transfer Direction</CardTitle>
            <CardDescription className="text-zinc-400">
              Choose which way to transfer your music
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-4">
              <div className={`text-center ${transferDirection === "spotifyToYt" ? "text-white" : "text-zinc-500"}`}>
                <SpotifyIcon className="h-8 w-8 mx-auto" />
                <p className="mt-2 text-sm">Spotify</p>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTransferDirection}
                className="text-zinc-400 hover:text-white hover:bg-zinc-700"
              >
                <ArrowLeftRight className="h-5 w-5" />
              </Button>
              
              <div className={`text-center ${transferDirection === "ytToSpotify" ? "text-white" : "text-zinc-500"}`}>
                <YouTubeMusicIcon className="h-8 w-8 mx-auto" />
                <p className="mt-2 text-sm">YouTube Music</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleTransfer} 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              disabled={!spotifyConnected || !ytMusicConnected || isLoading}
            >
              <List className="mr-2" />
              {isLoading ? "Loading..." : "Select Playlists"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Index;
