
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleSpotifyCallback } from "../utils/spotifyAuth";
import { handleYouTubeCallback } from "../utils/youtubeAuth";
import { toast } from "@/components/ui/use-toast";

const Callback = () => {
  const [processing, setProcessing] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for service type in localStorage
    const authService = localStorage.getItem('auth_service');
    let result;

    if (authService === "spotify") {
      result = handleSpotifyCallback();
      if (result.accessToken) {
        toast({
          title: "Connected to Spotify",
          description: "Your Spotify account has been connected successfully.",
        });
      } else {
        toast({
          title: "Connection Error",
          description: result.error || "Failed to connect to Spotify.",
          variant: "destructive",
        });
      }
    } else if (authService === "youtube") {
      result = handleYouTubeCallback();
      if (result.accessToken) {
        toast({
          title: "Connected to YouTube Music",
          description: "Your YouTube Music account has been connected successfully.",
        });
      } else {
        toast({
          title: "Connection Error",
          description: result.error || "Failed to connect to YouTube Music.",
          variant: "destructive",
        });
      }
    }

    // Clear the service marker
    localStorage.removeItem('auth_service');
    
    // Redirect back to the home page
    setTimeout(() => {
      setProcessing(false);
      navigate("/");
    }, 1500);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black to-zinc-900 p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-white mb-4">
          {processing ? "Processing authentication..." : "Authentication complete!"}
        </h1>
        <p className="text-zinc-400">
          {processing 
            ? "Please wait while we connect your account." 
            : "Redirecting you back to the application..."}
        </p>
        <div className="mt-6">
          <div className="w-8 h-8 border-t-2 border-b-2 border-purple-500 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default Callback;
