import esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

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
