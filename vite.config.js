import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@regaarder/ui': path.resolve(import.meta.dirname, '../packages/ui/src/index.js'),
      canvg: path.resolve(import.meta.dirname, 'src/mock-canvg.js')
    }
  },
  optimizeDeps: {
    include: ['canvg']
  },
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
