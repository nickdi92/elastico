import { readFileSync, readdirSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import preact from '@preact/preset-vite';

/** Crea sw.js con l'elenco dei file da salvare per l'uso offline. */
function serviceWorker(): Plugin {
  return {
    name: 'elastico-sw',
    apply: 'build',
    generateBundle(_options, bundle) {
      const files = Object.keys(bundle).filter((f) => !f.endsWith('.map'));
      const photos = readdirSync(new URL('./public/exercises', import.meta.url)).map((f) => `./exercises/${f}`);
      const precache = ['./', ...files.map((f) => `./${f}`), './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png', ...photos];
      const source = readFileSync(new URL('./sw.template.js', import.meta.url), 'utf8')
        .replace('__PRECACHE__', JSON.stringify(precache))
        .replace('__VERSION__', Date.now().toString(36));
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [preact(), serviceWorker()],
  test: {
    include: ['src/**/*.test.ts'],
  },
});
