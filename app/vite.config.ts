import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, type PluginOption } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

process.env.VITE_SITE_URL ||= process.env.SITE_URL || 'http://localhost:3000'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const plugins: PluginOption[] = [react()]
  if (mode === 'development') {
    plugins.unshift(inspectAttr())
  }

  return {
    base: './',
    plugins,
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:4000',
          changeOrigin: true,
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 600,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
});
