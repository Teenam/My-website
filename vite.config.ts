import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'auto-version',
      buildStart() {
        try {
          execSync('node scripts/update_version.js', { stdio: 'inherit' });
        } catch (error) {
          console.error('Failed to update version:', error);
        }
      }
    }
  ],
  base: '/My-website/',
})
