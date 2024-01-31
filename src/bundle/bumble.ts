import {path} from '../../deps.ts';
import {DinoServer} from '../mod.ts';
import {esbuildBundle} from './esbuild/mod.ts';
import {manifestDir} from './../manifest.ts';
import {importBundle} from './import.ts';
import type {
  BumbleOptions,
  BumbleBundle,
  BumbleDOMBundle,
  BumbleSSRBundle
} from '../types.ts';

/** Bundle the entry file (write if build) */
const bumble = async (
  dinossr: DinoServer,
  entry: string,
  hash: string,
  options: BumbleOptions
): Promise<BumbleBundle> => {
  const bundle = await esbuildBundle(
    dinossr.dir,
    entry,
    dinossr.deployHash,
    options.generate ?? 'ssr'
  );
  if (Deno.env.has('DINOSSR_BUILD')) {
    // Write the esbuild metafile
    await Deno.writeTextFile(
      path.join(manifestDir, `${hash}.json`),
      JSON.stringify(bundle.metafile, null, 2)
    );
    // Write the esbuild bundled script
    await Deno.writeTextFile(
      path.join(manifestDir, `${hash}.js`),
      bundle.script.serialize({
        exports: options.exports,
        exportType: 'module'
      })
    );
  }
  return bundle;
};

/** Bundle the entry file for client-side rendering */
export const bumbleDOM = async (
  dinossr: DinoServer,
  entry: string,
  hash: string,
  options: BumbleOptions = {}
): Promise<BumbleDOMBundle> => {
  options.generate = 'dom';
  const s1 = performance.now();
  const bundle = await bumble(dinossr, entry, hash, options);
  const code = bundle.script.serialize({
    exports: options.exports ?? true,
    exportType: 'module'
  });
  if (dinossr.dev) {
    const rel = path.relative(dinossr.dir, entry) + '-dom';
    const t1 = (performance.now() - s1).toFixed(2).padStart(7, ' ');
    console.log(`📦 ${t1}ms [dom] ${rel}`);
  }
  return {entry, hash, code, metafile: bundle.metafile};
};

/** Bundle the entry file for server-side rendering */
export const bumbleSSR = async <M>(
  dinossr: DinoServer,
  entry: string,
  hash: string,
  options: BumbleOptions = {}
): Promise<BumbleSSRBundle<M>> => {
  options.generate = 'ssr';
  const s1 = performance.now();
  const bundle = await bumble(dinossr, entry, hash, options);
  const t1 = (performance.now() - s1).toFixed(2).padStart(7, ' ');
  const s2 = performance.now();
  const mod = await importBundle<M>(
    bundle,
    !Deno.env.has('DENO_REGION'),
    options.exports
  );
  if (dinossr.dev) {
    const rel = path.relative(dinossr.dir, entry);
    const t2 = (performance.now() - s2).toFixed(2).padStart(7, ' ');
    console.log(`📦 ${t1}ms [ssr] ${rel}`);
    console.log(`🐝 ${t2}ms [ssr] ↑`);
  }
  return {entry, hash, mod, metafile: bundle.metafile};
};
