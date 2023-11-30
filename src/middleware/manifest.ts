import {path, existsSync} from '../deps.ts';
import {DinoServer} from '../mod.ts';
import {importModule} from '../render.ts';
import {addRoute} from './shared.ts';
import {modHash} from '../utils.ts';
import type {
  DinoRoute,
  DinoBundle,
  DinoManifest,
  DinoManifestModule
} from '../types.ts';

// @ts-ignore TODO: types
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
): AsyncGenerator<DinoManifestModule> {
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
    const routes: DinoRoute[] = await importModule(
      entry,
      pattern,
      null,
      true,
      dinossr
    );
    if (!routes.length) {
      console.warn(`Invalid route: (${entry})`);
      continue;
    }
    const hash = modHash(entry, 'ssr', dinossr);
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
    for (const route of mod.routes) {
      if (/^\/_\/immutable\/[^\\]+\.js/.test(route.pattern)) {
        manifest.islands.push({
          hash: route.modhash,
          pattern: route.pattern,
          code: ''
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
  // console.log(modules, islands);
  for (const mod of islands) {
    routes.push({
      method: 'GET',
      pattern: mod.manifest.pattern,
      modhash: mod.manifest.hash,
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
    routes.push(
      ...(await importModule(
        mod.manifest.entry,
        mod.manifest.pattern,
        mod as DinoBundle,
        false,
        dinossr
      ))
    );
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
