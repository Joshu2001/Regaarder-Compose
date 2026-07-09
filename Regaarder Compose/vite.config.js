import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    minify: false,
    chunkSizeWarningLimit: 5000,
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignore "use client" warnings from lucide-react or others
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes('use client')) {
          return;
        }
        warn(warning);
      }
    }
  }
});
