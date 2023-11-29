import {path, existsSync} from '../deps.ts';
import {DinoServer} from '../mod.ts';
import {importModule} from '../render.ts';
import {addRoute} from './shared.ts';
import type {Deferred, DinoRoute, DinoManifest} from '../types.ts';

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
  dir: string,
  dinossr: DinoServer
): AsyncGenerator<DinoRoute[]> {
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
    const mod: DinoRoute[] = await importModule(entry, pattern, dinossr);
    if (!mod.length) {
      console.warn(`Invalid route: (${entry})`);
      continue;
    }
    yield mod;
  }
};

export default async (dinossr: DinoServer) => {
  const routesDir = path.resolve(dinossr.dir, './routes');
  if (!existsSync(routesDir)) {
    throw new Error(`No routes directory`);
  }

  // Create deferred render functions for prebuilt routes
  if (dinossr.manifest.routes.length) {
    const start = performance.now();
    const deferredMap = new Map<string, Deferred<DinoRoute>>();
    for (let route of dinossr.manifest.routes) {
      const deferred = Promise.withResolvers<DinoRoute>();
      deferredMap.set(route.pattern, deferred);
      deferred.promise.then(() => deferredMap.delete(route.pattern));
      route = {
        ...route,
        render: async (...args) => {
          return (await deferred.promise).render(...args);
        }
      };
      await addRoute(route, dinossr);
    }
    // Resolve deferred routes after module import
    (async () => {
      for await (const routes of generate(routesDir, dinossr)) {
        for (const route of routes) {
          const deferred = deferredMap.get(route.pattern);
          if (deferred) deferred.resolve(route);
        }
      }
      const time = (performance.now() - start).toFixed(2);
      console.log(`🚀 Deferred routes ${time}ms`);
    })();
    return dinossr.manifest;
  }

  // Create new routes and new manifest
  const routes: DinoRoute[] = [];
  for await (const route of generate(routesDir, dinossr)) {
    routes.push(...route);
  }
  routes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  routes.map((route) => addRoute(route, dinossr));
  const manifest: DinoManifest = {
    deployHash: dinossr.deployHash,
    routes
  };
  return manifest;
};
