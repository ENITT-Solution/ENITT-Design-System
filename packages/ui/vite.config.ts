import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: fileURLToPath(new URL('src/index.ts', import.meta.url)),
      formats: ['es'],
      fileName: 'index',
      // 소비 앱은 `@enitt/ui/styles.css` 한 줄로 전체 스타일을 가져간다.
      cssFileName: 'styles',
    },
    rollupOptions: {
      // 소비 앱이 react 버전을 정한다 — 번들에 넣지 않는다.
      external: ['react', 'react-dom', 'react/jsx-runtime', /^@enitt\//],
    },
    sourcemap: true,
    target: 'es2022',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
