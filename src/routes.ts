import {path, existsSync} from './deps.ts';
import {createHandle, importModule} from './render.ts';
import type {Bumbler, Router, Renderer} from './types.ts';

// Recursively find routes within directory
const traverse = async (dir: string, depth = 0): Promise<string[]> => {
  // TODO: provide option to override?
  if (depth >= 10) {
    throw new Error('Exceeded maximum depth for route directory');
  }
  let routes: string[] = [];
  for await (const entry of Deno.readDir(dir)) {
    if (entry.isDirectory) {
      routes = routes.concat(
        await traverse(path.join(dir, entry.name), depth + 1)
      );
      continue;
    }
    if (!entry.isFile) {
      continue;
    }
    if (/mod\.(js|ts|svelte)$/.test(entry.name)) {
      routes.push(path.join(dir, entry.name));
    }
  }
  return routes;
};

// Generate route renderer for directory
const generate = async (dir: string, bumbler: Bumbler): Promise<Renderer[]> => {
  const renderers: Renderer[] = [];
  for (const abspath of await traverse(dir)) {
    let pattern = '/' + path.relative(dir, abspath);
    // Replace non-capturing groups
    pattern = pattern.replaceAll(/\([^\)]+?\)\/?/g, '');
    // Replace named parameters
    pattern = pattern.replaceAll(/\[([^\]]+?)\]/g, ':$1');
    // Remove URL
    pattern = path.dirname(pattern);
    // Import module
    const mod = await importModule(abspath, pattern, bumbler);
    if (!mod.length) {
      console.warn(`Invalid route: (${abspath})`);
      continue;
    }
    for (const renderer of mod) {
      // Allow renderer to modify pattern
      if (renderer.pattern) {
        pattern = renderer.pattern;
      }
      // Add trailing slash
      if (pattern.at(-1) !== '/' && !/\.[\w]+$/.test(pattern)) {
        pattern += '/';
      }
      renderers.push({
        ...renderer,
        pattern
      });
    }
  }
  return renderers;
};

// Add redirect for missing trailing slash
const redirect = (router: Router, renderer: Renderer) => {
  if (renderer.pattern === '/') return;
  if (renderer.pattern.at(-1) !== '/') return;
  router.get(renderer.pattern.slice(0, -1), (request) => {
    const url = new URL(request.url);
    url.pathname += '/';
    return new Response(null, {
      status: 308,
      headers: {
        location: url.href
      }
    });
  });
};

export const addRoutes = async (
  router: Router,
  bumbler: Bumbler,
  dir: string
) => {
  const routesDir = path.resolve(dir, './routes');
  if (!existsSync(routesDir)) {
    return;
  }

  // Generate file-based routes
  for (const renderer of await generate(routesDir, bumbler)) {
    if (bumbler.dev) {
      console.log(`🪄 ${renderer.method} → ${renderer.pattern}`);
    }
    const key = renderer.method.toLowerCase() as Lowercase<Renderer['method']>;
    router[key]({pathname: renderer.pattern}, await createHandle(renderer));
    if (renderer.method === 'GET') {
      redirect(router, renderer);
    }
  }
};
