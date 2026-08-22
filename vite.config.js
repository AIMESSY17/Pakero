import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Phaser pesa ~1.2 MB y se carga con import() dinamico recien cuando entras
    // a un minijuego, asi que su chunk grande no molesta al arranque.
    chunkSizeWarningLimit: 1500,
  },
});
