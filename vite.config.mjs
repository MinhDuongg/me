import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';

// Keep Pong available before the larger 3D JavaScript bundle has downloaded.
export default defineConfig({
  base: './',
  build: { target: 'es2022', chunkSizeWarningLimit: 1100 },
  plugins: [{
    name: 'inline-pong-loader',
    transformIndexHtml: {
      order: 'pre',
      handler: html => html.replace('<!-- pong-loader -->', `<script>${readFileSync(new URL('./src/pong-loader.js', import.meta.url), 'utf8')}</script>`),
    },
    handleHotUpdate({file, server}) {
      if (file.endsWith('/pong-loader.js')) server.ws.send({type:'full-reload'});
    },
  }],
});
