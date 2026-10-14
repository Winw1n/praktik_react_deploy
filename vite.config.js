import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base:'/praktik_react_deploy/' ,
  plugins: [react()],
});
