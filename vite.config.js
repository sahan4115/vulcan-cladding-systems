import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Local dev serves at root (port 5199); production build is served from the
// GitHub Pages project subpath. Set BASE_PATH in CI to override.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? process.env.BASE_PATH || '/vulcan-cladding-systems/' : '/',
  server: {
    port: Number(process.env.PORT) || 5199,
    strictPort: false,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        vulcalap: resolve(__dirname, 'vulcalap.html'),
        cases: resolve(__dirname, 'cases.html'),
        about: resolve(__dirname, 'about.html'),
        contact: resolve(__dirname, 'contact.html'),
        downloads: resolve(__dirname, 'downloads.html'),
        caseKnights: resolve(__dirname, 'case-knights-hill.html'),
        caseMerle: resolve(__dirname, 'case-merle-court.html'),
        ral: resolve(__dirname, 'ral-colours.html'),
      },
    },
  },
}));
