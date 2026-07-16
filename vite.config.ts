import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import Inspector from 'unplugin-vue-dev-locator/vite'

export default defineConfig({
  build: {
    sourcemap: 'hidden',
  },
  server: {
    port: 9880,
    strictPort: true,
  },
  preview: {
    port: 9880,
    strictPort: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
  plugins: [
    vue(),
    Inspector(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
