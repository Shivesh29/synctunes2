
// YouTube Music OAuth Configuration
const YT_CLIENT_ID = import.meta.env.VITE_YT_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";
const YT_REDIRECT_URI = `${window.location.origin}/callback`;
const YT_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const YT_SCOPES = [
  "https://www.googleapis.com/auth/youtube",
  "https://www.googleapis.com/auth/youtube.readonly"
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

// Initiate YouTube Music OAuth Flow
export const initiateYouTubeLogin = (): void => {
  const state = generateStateParameter();
  localStorage.setItem('youtube_auth_state', state);
  
  const authUrl = new URL(YT_AUTH_ENDPOINT);
  authUrl.searchParams.append("client_id", YT_CLIENT_ID);
  authUrl.searchParams.append("redirect_uri", YT_REDIRECT_URI);
  authUrl.searchParams.append("scope", YT_SCOPES.join(" "));
  authUrl.searchParams.append("response_type", "token");
  authUrl.searchParams.append("state", state);
  authUrl.searchParams.append("include_granted_scopes", "true");
  
  window.location.href = authUrl.toString();
};

// Handle YouTube OAuth Callback
export const handleYouTubeCallback = (): { accessToken: string | null; error: string | null } => {
  if (window.location.hash) {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = params.get("access_token");
    const state = params.get("state");
    const storedState = localStorage.getItem('youtube_auth_state');
    
    if (state === null || state !== storedState) {
      return { accessToken: null, error: "State mismatch" };
    }
    
    localStorage.removeItem('youtube_auth_state');
    localStorage.setItem('youtube_access_token', accessToken || '');
    
    return { accessToken, error: null };
  }
  return { accessToken: null, error: "No token found in URL" };
};

// Check if YouTube token exists
export const getYouTubeToken = (): string | null => {
  return localStorage.getItem('youtube_access_token');
};

// Logout from YouTube
export const logoutYouTube = (): void => {
  localStorage.removeItem('youtube_access_token');
};
