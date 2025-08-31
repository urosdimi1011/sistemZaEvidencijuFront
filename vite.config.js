import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path';
// https://vite.dev/config/
export default defineConfig({
  plugins: [
      react(),
      tailwindcss()
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
    },
})
