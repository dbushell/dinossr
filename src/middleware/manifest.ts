import {path, existsSync} from '../../deps.ts';
import {DinoServer} from '../mod.ts';
import {importModule} from '../render.ts';
import {addRoute} from './shared.ts';
import {modHash} from '../utils.ts';
import {bumbleDOM, bumbleSSR} from '../bundle/mod.ts';
import {MODULES, ISLANDS} from '../build.ts';
import type {
  DinoRoute,
  DinoIsland,
  DinoSSRBundle,
  DinoManifest
} from '../types.ts';

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
    const hash = modHash(dinossr.dir, entry, 'ssr', dinossr.deployHash);
    const bundle: DinoSSRBundle = {
      pattern,
      ...(await bumbleSSR(dinossr, entry, hash, {
        exports: ['default', 'pattern', 'order', 'get', 'post', 'load']
      }))
    };
    const {routes, islands} = importModule(bundle, dinossr);
    if (!routes.length) {
      console.warn(`Invalid route: (${entry})`);
      continue;
    }
    yield {entry, hash, pattern, routes, islands};
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
  const islands: Map<string, DinoIsland> = new Map();
  for await (const mod of generate(dinossr)) {
    manifest.modules.push(mod);
    routes.push(...mod.routes);
    mod.islands?.map((meta) => islands.set(meta.hash, meta));
  }
  routes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  for (const dom of islands.values()) {
    manifest.islands.unshift(dom);
    const {code} = await bumbleDOM(dinossr, dom.entry, dom.hash, {
      exports: ['default']
    });
    routes.unshift({
      method: 'GET',
      pattern: dom.pattern,
      hash: dom.hash,
      render: () => {
        return {
          response: new Response(code, {
            headers: {'content-type': 'text/javascript; charset=utf-8'}
          })
        };
      }
    });
  }
  routes.map((route) => addRoute(route, dinossr));
  return manifest;
};

const importManifest = (dinossr: DinoServer) => {
  const routes: DinoRoute[] = [];
  for (const dom of ISLANDS) {
    routes.push({
      method: 'GET',
      pattern: dom.pattern,
      hash: dom.hash,
      render: () => {
        return {
          response: new Response(dom.code, {
            headers: {'content-type': 'text/javascript; charset=utf-8'}
          })
        };
      }
    });
  }
  for (const mod of MODULES) {
    const {routes: modRoutes} = importModule(mod as DinoSSRBundle, dinossr);
    routes.push(...modRoutes);
  }
  routes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  routes.map((route) => addRoute(route, dinossr));
  return dinossr.manifest;
};

export default (dinossr: DinoServer): Promise<DinoManifest> => {
  if (dinossr.manifest.modules.length) {
    return Promise.resolve(importManifest(dinossr));
  }
  return generateManifest(dinossr);
};
