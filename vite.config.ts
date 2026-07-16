import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import Inspector from 'unplugin-vue-dev-locator/vite'

export default defineConfig({
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return
          }

          if (
            id.includes('html2canvas')
            || id.includes('jspdf')
            || id.includes('canvg')
            || id.includes('dompurify')
          ) {
            return 'export-tools'
          }

          if (
            id.includes('echarts')
            || id.includes('zrender')
            || id.includes('vue-echarts')
          ) {
            return 'charts'
          }

          if (
            id.includes('ant-design-vue')
            || id.includes('@ant-design')
            || id.includes('rc-')
          ) {
            return 'antd'
          }

          if (
            id.includes('/node_modules/vue/')
            || id.includes('/node_modules/@vue/')
            || id.includes('vue-router')
            || id.includes('pinia')
          ) {
            return 'vue-vendor'
          }
        },
      },
    },
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
