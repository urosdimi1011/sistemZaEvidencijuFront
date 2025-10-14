import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path';
import {VitePWA} from "vite-plugin-pwa";
// https://vite.dev/config/
export default defineConfig({
  plugins: [
      react(),
      tailwindcss(),
      VitePWA({
          registerType: 'autoUpdate',
          manifest: {
              name: 'Sistem za evidenciju - Dositej',
              short_name: 'SZA-Dositej',
              description: '',
              theme_color: '#ffffff',
              background_color: '#ffffff',
              display: 'standalone',
              scope: '/',
              start_url: '/',
              icons: [
                  {
                      src: '/pwa-192x192.png',
                      sizes: '192x192',
                      type: 'image/png'
                  },
                  {
                      src: '/pwa-256x256.png',
                      sizes: '256x256',
                      type: 'image/png'
                  },
                  {
                      src: '/pwa-384x384.png',
                      sizes: '384x384',
                      type: 'image/png'
                  },
                  {
                      src: '/pwa-512x512.png',
                      sizes: '512x512',
                      type: 'image/png',
                      purpose: 'any maskable'
                  }
              ]
          }
      })
  ],
    resolve:{
      alias : {
          "@" : path.resolve(__dirname,'public'),
          '@src': path.resolve(__dirname, 'src')
      }
    },
    server: {
        port: 5173,  // tvoj React dev server
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                // opcionalno: prepravi putanju (u ovom slučaju ne diramo je)
                rewrite: (path) => path.replace(/^\/api/, '/api'),
            },
        },
        historyApiFallback: true
    },
})
