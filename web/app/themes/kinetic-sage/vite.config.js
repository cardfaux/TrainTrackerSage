import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import laravel from 'laravel-vite-plugin';
import { wordpressPlugin, wordpressThemeJson } from '@roots/vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base:
    process.env.NODE_ENV === 'production'
      ? '/app/themes/sage/public/build/'
      : 'http://localhost:5173/',
  plugins: [
    react(),
    tailwindcss(),
    laravel({
      input: [
        'resources/css/app.css',
        'resources/js/app.jsx',
        'resources/css/editor.css',
        'resources/js/editor.js',
      ],
      refresh: true,
    }),
    wordpressPlugin(),
    wordpressThemeJson({
      disableTailwindColors: false,
      disableTailwindFonts: false,
      disableTailwindFontSizes: false,
    }),
  ],
  resolve: {
    alias: {
      '@scripts': '/resources/js',
      '@styles': '/resources/css',
      '@fonts': '/resources/fonts',
      '@images': '/resources/images',
    },
  },
});
