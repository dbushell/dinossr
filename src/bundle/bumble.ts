import * as path from '@std/path';
import {esbuildBundle} from './esbuild/mod.ts';
import {importBundle} from './import.ts';
import type {DinoSsr} from '../mod.ts';
import type {
  BumbleOptions,
  BumbleBundle,
  BumbleDOMBundle,
  BumbleSSRBundle
} from './types.ts';

/** Bundle the entry file (write if build) */
const bumble = async (
  server: DinoSsr,
  options: BumbleOptions
): Promise<BumbleBundle> => {
  const {entry, generate} = options;
  const bundle = await esbuildBundle(server, entry, generate);
  return bundle;
};

/** Bundle the entry file for client-side rendering */
export const bumbleDOM = async (
  server: DinoSsr,
  options: BumbleOptions
): Promise<BumbleDOMBundle> => {
  const {entry, hash} = options;
  options.generate = 'dom';
  const s1 = performance.now();
  const bundle = await bumble(server, options);
  const code = await bundle.script.serialize({
    exports: options.exports ?? true,
    exportType: 'module'
  });
  if (server.dev) {
    const rel = path.relative(server.dir, entry) + '-dom';
    const t1 = (performance.now() - s1).toFixed(2).padStart(7, ' ');
    console.log(`📦 ${t1}ms [dom] ${rel}`);
  }
  return {entry, hash, code, metafile: bundle.metafile};
};

/** Bundle the entry file for server-side rendering */
export const bumbleSSR = async <M>(
  server: DinoSsr,
  options: BumbleOptions
): Promise<BumbleSSRBundle<M>> => {
  const {entry, hash} = options;
  options.generate = 'ssr';
  const s1 = performance.now();
  const bundle = await bumble(server, options);
  const t1 = (performance.now() - s1).toFixed(2).padStart(7, ' ');
  const s2 = performance.now();
  const mod = await importBundle<M>(
    bundle,
    !Deno.env.has('DENO_REGION'),
    options.exports
  );
  if (server.dev) {
    const rel = path.relative(server.dir, entry);
    const t2 = (performance.now() - s2).toFixed(2).padStart(7, ' ');
    console.log(`📦 ${t1}ms [ssr] ${rel}`);
    console.log(`🐝 ${t2}ms [ssr] ↑`);
  }
  return {entry, hash, mod, metafile: bundle.metafile};
};
