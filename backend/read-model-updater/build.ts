import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

esbuild.build({
  entryPoints: [path.join(__dirname, 'src', 'main.ts')],
  outfile: path.join(__dirname, 'dist', 'main.js'),
  platform: 'node',
  bundle: true,
  sourcemap: true,
  minify: true,
  format: 'esm',
});
