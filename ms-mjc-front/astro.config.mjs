import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  integrations: [react(), tailwind()],
  output: 'static',
  site: isProduction ? 'https://chillaso.github.io' : 'http://localhost:4321',
  base: isProduction ? '/mtg-rules/' : '',
  build: {
    assets: 'assets'
  }
}); 