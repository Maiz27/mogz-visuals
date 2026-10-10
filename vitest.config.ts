import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      // Next.js resolves `server-only` itself at build time; tests run as server code.
      'server-only': 'next/dist/compiled/server-only/empty.js',
    },
  },
  test: {
    environment: 'node',
    globals: true,
  },
});
