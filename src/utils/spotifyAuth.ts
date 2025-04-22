
// Spotify OAuth Configuration
const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || "YOUR_SPOTIFY_CLIENT_ID";
const SPOTIFY_REDIRECT_URI = `${window.location.origin}/callback`;
const SPOTIFY_AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const SPOTIFY_SCOPES = [
  "user-read-private",
  "user-read-email",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-modify-private"
];

// Generate a random string for state parameter
export const generateStateParameter = (length = 16): string => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

// Initiate Spotify OAuth Flow
export const initiateSpotifyLogin = (): void => {
  const state = generateStateParameter();
  localStorage.setItem('spotify_auth_state', state);
  
  const authUrl = new URL(SPOTIFY_AUTH_ENDPOINT);
  authUrl.searchParams.append("client_id", SPOTIFY_CLIENT_ID);
  authUrl.searchParams.append("redirect_uri", SPOTIFY_REDIRECT_URI);
  authUrl.searchParams.append("scope", SPOTIFY_SCOPES.join(" "));
  authUrl.searchParams.append("response_type", "token");
  authUrl.searchParams.append("state", state);
  
  window.location.href = authUrl.toString();
};

// Handle Spotify OAuth Callback
export const handleSpotifyCallback = (): { accessToken: string | null; error: string | null } => {
  if (window.location.hash) {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = params.get("access_token");
    const state = params.get("state");
    const storedState = localStorage.getItem('spotify_auth_state');
    
    if (state === null || state !== storedState) {
      return { accessToken: null, error: "State mismatch" };
    }
    
    localStorage.removeItem('spotify_auth_state');
    localStorage.setItem('spotify_access_token', accessToken || '');
    
    return { accessToken, error: null };
  }
  return { accessToken: null, error: "No token found in URL" };
};

// Check if Spotify token exists
export const getSpotifyToken = (): string | null => {
  return localStorage.getItem('spotify_access_token');
};

// Logout from Spotify
export const logoutSpotify = (): void => {
  localStorage.removeItem('spotify_access_token');
};
