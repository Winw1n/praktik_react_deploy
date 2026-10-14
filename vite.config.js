import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/praktik_react_deploy/' : '/',
  plugins: [react()],
});
