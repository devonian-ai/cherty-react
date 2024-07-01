import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import commonjs from '@rollup/plugin-commonjs';
import path from 'path';

export default defineConfig({
  plugins: [react(), commonjs()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/main.jsx'),
      name: 'ChertyComponentLibrary',
      formats: ['es', 'umd'],
      fileName: (format) => `cherty-component-library.${format}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        },
        exports: 'named'
      }
    }
  }
});
