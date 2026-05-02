import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { defineConfig } from 'vite';
import prerender from '@prerenderer/rollup-plugin';
import puppeteer from '@prerenderer/renderer-puppeteer';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
      prerender({
        routes: ['/', '/entry', '/stats', '/funnel', '/ai-analyst', '/settings'],
        renderer: new puppeteer({
          renderAfterDocumentEvent: 'render-event', // We can trigger this manually or just wait
          renderAfterTime: 2000, // Wait 2 seconds for data to load
        }),
        staticDir: path.join(__dirname, 'dist'),
      }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
