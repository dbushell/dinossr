import * as path from '@std/path';
import {existsSync} from '@std/fs';
import {routeMethods, importRoutes} from '../render.ts';
import {addRoute} from './shared.ts';
import {traverse} from '../utils.ts';
import {bumbleDOM, bumbleSSR} from '../bundle/mod.ts';
import type {
  DinoServer,
  DinoRoute,
  DinoIsland,
  DinoSSRBundle,
  DinoManifest
} from '../types.ts';

// Generate routes for directory
const generate = async function* (
  server: DinoServer
): AsyncGenerator<DinoManifest['modules'][number]> {
  const dir = path.join(server.dir, './routes');
  if (!existsSync(dir)) {
    throw new Error(`No routes directory`);
  }
  const paths: string[] = [];
  await traverse(dir, (dir, entry) => {
    if (/\.(js|ts|svelte)$/.test(entry.name)) {
      paths.push(path.join(dir, entry.name));
    }
  });
  for (const entry of paths) {
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
    const hash = await server.hash(entry, 'ssr');
    let bundle: DinoSSRBundle;
    if (!Deno.env.has('DENO_DEPLOYMENT_ID') && /\.(js|ts)$/.test(entry)) {
      // Skip bundler if not building or deploying
      const entryPath = `file://${entry}`;
      const s1 = performance.now();
      bundle = {
        pattern,
        entry,
        hash,
        mod: await import(entryPath),
        metafile: {inputs: {}, outputs: {}},
        islands: []
      };
      if (server.dev) {
        const t1 = (performance.now() - s1).toFixed(2).padStart(7, ' ');
        const rel = path.relative(server.dir, entry);
        console.log(`⚡ ${t1}ms [ssr] ${rel}`);
      }
    } else {
      bundle = {
        pattern,
        islands: [],
        ...(await bumbleSSR(server, {
          entry,
          hash,
          exports: ['default', 'pattern', 'order', 'load'].concat(routeMethods)
        }))
      };
      // Use metafile to find islands in Svelte component bundles
      if (entry.endsWith('.svelte')) {
        for (const [key, input] of Object.entries(bundle.metafile.inputs)) {
          const found = input.imports.find(
            (i) => i.original === '@dinossr/island'
          );
          if (!found) continue;
          const entry = path.join(server.dir, key);
          const hash = await server.hash(entry, 'dom');
          bundle.islands.push({
            entry,
            hash,
            pattern: `/_/immutable/${hash}.js`
          });
        }
      }
    }
    const {routes} = importRoutes(server, bundle);
    if (!routes.length) {
      console.warn(`Invalid route: (${entry})`);
      continue;
    }
    yield {entry, hash, pattern, routes, islands: bundle.islands};
  }
};

const generateManifest = async (server: DinoServer) => {
  // Create new routes and new manifest
  const routes: Array<DinoRoute> = [];
  // const manifest: DinoManifest = server.manifest;
  const islands: Map<string, DinoIsland> = new Map();
  for await (const mod of generate(server)) {
    server.manifest.modules.push(mod);
    routes.push(...mod.routes);
    mod.islands?.map((meta) => islands.set(meta.hash, meta));
  }
  routes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  for (const dom of islands.values()) {
    server.manifest.islands.unshift(dom);
    const {code} = await bumbleDOM(server, {
      entry: dom.entry,
      hash: dom.hash,
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
  routes.map((route) => addRoute(server, route));
  return server.manifest;
};

export default (server: DinoServer): Promise<DinoManifest> => {
  return generateManifest(server);
};
