import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      open: false,
      allowedHosts: [env.VITE_ALLOWED_HOST || 'gratitude.evenwel.me'],
    },
  };
});
