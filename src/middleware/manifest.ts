import {path, existsSync} from '../deps.ts';
import {DinoServer} from '../mod.ts';
import {importModule} from '../render.ts';
import {addRoute} from './shared.ts';
import {modHash} from '../utils.ts';
import {esbuildResolve, sveltePreprocess} from '../svelte/mod.ts';
import type {DinoRoute, DinoSSRBundle, DinoManifest} from '../types.ts';

import {modules, islands} from '../build.ts';

// Recursively find routes within directory
const traverse = async (dir: string, depth = 0): Promise<string[]> => {
  if (depth >= 10) {
    throw new Error('Exceeded maximum depth for route directory');
  }
  let paths: string[] = [];
  for await (const entry of Deno.readDir(dir)) {
    if (entry.isDirectory) {
      paths = paths.concat(
        await traverse(path.join(dir, entry.name), depth + 1)
      );
      continue;
    }
    if (!entry.isFile) {
      continue;
    }
    if (/\.(js|ts|svelte)$/.test(entry.name)) {
      paths.push(path.join(dir, entry.name));
    }
  }
  return paths;
};

// Generate routes for directory
const generate = async function* (
  dinossr: DinoServer
): AsyncGenerator<DinoManifest['modules'][number]> {
  const dir = path.join(dinossr.dir, './routes');
  if (!existsSync(dir)) {
    throw new Error(`No routes directory`);
  }
  for (const entry of await traverse(dir)) {
    let pattern = '/' + path.relative(dir, entry);
    // Replace non-capturing groups
    pattern = pattern.replaceAll(/\([^\)]+?\)\/?/g, '');
    // Replace named parameters
    pattern = pattern.replaceAll(/\[([^\]]+?)\]/g, ':$1');
    // Remove URL
    pattern = path.dirname(pattern);
    if (pattern.at(-1) !== '/') {
      pattern += '/';
    }
    // Append filename if not index
    if (!/index\./.test(path.basename(entry))) {
      pattern += path.basename(entry, path.extname(entry));
    }
    // Import module
    const hash = modHash(entry, 'ssr', dinossr);
    const bundle: DinoSSRBundle = {
      pattern,
      ...(await dinossr.bumbler.bumbleSSR(entry, hash, {
        esbuildResolve,
        sveltePreprocess: sveltePreprocess(dinossr),
        filterExports: ['default', 'pattern', 'order', 'get', 'post', 'load']
      }))
    };
    const routes: DinoRoute[] = await importModule(bundle, true, dinossr);
    if (!routes.length) {
      console.warn(`Invalid route: (${entry})`);
      continue;
    }
    yield {entry, hash, pattern, routes};
  }
};

const generateManifest = async (dinossr: DinoServer) => {
  // Create new routes and new manifest
  const routes: DinoRoute[] = [];
  const manifest: DinoManifest = {
    deployHash: dinossr.deployHash,
    modules: [],
    islands: []
  };
  for await (const mod of generate(dinossr)) {
    manifest.modules.push(mod);
    for (const route of mod.routes ?? []) {
      if (/^\/_\/immutable\/[^\\]+\.js/.test(route.pattern)) {
        manifest.islands.push({
          entry: mod.entry,
          pattern: route.pattern,
          hash: route.hash
        });
      }
      routes.push(route);
    }
  }
  routes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  routes.map((route) => addRoute(route, dinossr));
  return manifest;
};

const importManifest = async (dinossr: DinoServer) => {
  const routes: DinoRoute[] = [];
  for (const mod of islands) {
    routes.push({
      method: 'GET',
      pattern: mod.pattern,
      hash: mod.hash,
      render: () => {
        return {
          response: new Response(mod.code, {
            headers: {'content-type': 'text/javascript; charset=utf-8'}
          })
        };
      }
    });
  }
  for (const mod of modules) {
    routes.push(...(await importModule(mod as DinoSSRBundle, false, dinossr)));
  }
  routes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  routes.map((route) => addRoute(route, dinossr));
  return dinossr.manifest;
};

export default (dinossr: DinoServer): Promise<DinoManifest> => {
  if (dinossr.manifest.modules.length) {
    return importManifest(dinossr);
  }
  return generateManifest(dinossr);
};
