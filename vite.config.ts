
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Bureau of Standards // Development Pipeline Configuration
export default defineConfig({
  plugins: [react()],
  define: {
    // Inject the API_KEY from the host environment into the client-side process.env shim
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  server: {
    host: true,
    port: 3000,
    strictPort: true
  },
  build: {
    target: 'esnext',
    outDir: 'dist'
  }
});
