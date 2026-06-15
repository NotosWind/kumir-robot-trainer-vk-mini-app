import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base нужен только для сборки под GitHub Pages (проект публикуется по адресу
// https://notoswind.github.io/kumir-robot-trainer-vk-mini-app/). В режиме разработки
// приложение остаётся на корне, чтобы было удобно запускать локально.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/kumir-robot-trainer-vk-mini-app/' : '/',
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5174,
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
}))
