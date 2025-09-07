import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Make env variables available to the client
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || 'https://bhewlutzthgxcgcmyizy.supabase.co'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoZXdsdXR6dGhneGNnY215aXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwOTY0NDQsImV4cCI6MjA3MjY3MjQ0NH0.xt-tEVPcStK-ruBao3NXImRSyz0L3anwZ0fhaOcXYEI'),
    'import.meta.env.VITE_TELEGRAM_BOT_TOKEN_HN35': JSON.stringify(env.VITE_TELEGRAM_BOT_TOKEN_HN35),
    'import.meta.env.VITE_TELEGRAM_CHAT_ID_HN35': JSON.stringify(env.VITE_TELEGRAM_CHAT_ID_HN35),
    'import.meta.env.VITE_TELEGRAM_BOT_NAME_HN35': JSON.stringify(env.VITE_TELEGRAM_BOT_NAME_HN35),
    'import.meta.env.VITE_TELEGRAM_BOT_TOKEN_HN40': JSON.stringify(env.VITE_TELEGRAM_BOT_TOKEN_HN40),
    'import.meta.env.VITE_TELEGRAM_CHAT_ID_HN40': JSON.stringify(env.VITE_TELEGRAM_CHAT_ID_HN40),
    'import.meta.env.VITE_TELEGRAM_BOT_NAME_HN40': JSON.stringify(env.VITE_TELEGRAM_BOT_NAME_HN40),
    'import.meta.env.VITE_APP_TITLE': JSON.stringify(env.VITE_APP_TITLE),
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(env.VITE_APP_VERSION),
  },
};
});
