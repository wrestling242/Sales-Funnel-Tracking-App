import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import prerender from '@prerenderer/rollup-plugin';
import puppeteer from '@prerenderer/renderer-puppeteer';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      prerender({
        routes: ['/', '/entry', '/stats', '/funnel', '/ai-analyst', '/settings'],
        renderer: new puppeteer({
          renderAfterDocumentEvent: 'render-event',
          renderAfterTime: 2000,
        }),
        staticDir: path.join(__dirname, 'dist'),
      }),
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
