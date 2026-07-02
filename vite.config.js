import { defineConfig } from 'vite';

// Local dev serves at root (port 5199); production build is served from the
// GitHub Pages project subpath. Set BASE_PATH in CI to override.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? process.env.BASE_PATH || '/vulcan-cladding-systems/' : '/',
  server: {
    port: Number(process.env.PORT) || 5199,
    strictPort: false,
  },
}));
