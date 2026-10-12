import { defineConfig } from 'astro/config';
import servicesEditor from './scripts/services-editor.mjs';

export default defineConfig({
  site: 'https://pmh.codes',
  output: 'static',
  compressHTML: true,
  integrations: [servicesEditor()],
  vite: {
    plugins: [{
      name: 'fontsource-no-swap',
      enforce: 'pre',
      transform(source, id) {
        if (/\/node_modules\/@fontsource(?:-variable)?\//.test(id) && id.endsWith('.css')) {
          return source.replace(/font-display:\s*swap/g, 'font-display: optional');
        }
      },
    }],
  },
});
