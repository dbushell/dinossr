import {path, existsSync} from './deps.ts';
import {createHandle, importModule} from './render.ts';
import type {Bumbler, Router, Renderer} from './types.ts';
import {addError, addNoMatch} from './errors.ts';

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
    if (['.js', '.ts', '.svelte'].includes(path.extname(entry.name))) {
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
    if (pattern.at(-1) !== '/') {
      pattern += '/';
    }
    // Append filename if not index
    if (!/index\./.test(path.basename(abspath))) {
      pattern += path.basename(abspath, path.extname(abspath));
    }
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
      renderers.push({
        ...renderer,
        pattern
      });
    }
  }
  return renderers;
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

  // Possible routes for auto redirects
  const redirects = new Set<string>();

  // Generate file-based routes
  for (const renderer of await generate(routesDir, bumbler)) {
    if (renderer.pattern === '/_500') {
      addError(router, renderer);
      continue;
    }
    if (renderer.pattern === '/_404') {
      addNoMatch(router, renderer);
      continue;
    }
    if (bumbler.dev) {
      console.log(`🪄 ${renderer.method} → ${renderer.pattern}`);
    }
    const key = renderer.method.toLowerCase() as Lowercase<Renderer['method']>;
    router[key]({pathname: renderer.pattern}, await createHandle(renderer));
    if (renderer.method === 'GET') {
      if (!/\.[\w]+$/.test(renderer.pattern)) {
        redirects.add(renderer.pattern);
      }
    }
  }

  // Setup trailing slash redirects
  redirects.forEach((pattern) => {
    if (pattern === '/') return;
    let alt = pattern;
    if (pattern.at(-1) === '/') {
      alt = pattern.slice(0, -1);
    } else {
      alt += '/';
    }
    if (redirects.has(alt)) {
      if (bumbler.dev) {
        console.log(`⚠️ ${alt} + ${pattern}`);
      }
      return;
    }
    if (bumbler.dev) {
      console.log(`🪄 308 ${alt} → ${pattern}`);
    }
    router.get(alt, (request) => {
      const url = new URL(request.url);
      if (url.pathname.at(-1) === '/') {
        url.pathname = url.pathname.slice(0, -1);
      } else {
        url.pathname += '/';
      }
      return new Response(null, {
        status: 308,
        headers: {
          location: url.href
        }
      });
    });
  });
};
