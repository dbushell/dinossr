import {path, existsSync} from '../deps.ts';
import {DinoServer} from '../mod.ts';
import {createHandle, importModule} from '../render.ts';
import {addError, addNoMatch} from './errors.ts';
import type {DinoBumbler, DinoRoute} from '../types.ts';

export {addProxyRoute} from './proxy.ts';
export {addStaticRoutes} from './static.ts';
export {addPolicyRoute} from './policy.ts';
export {addCacheRoute} from './cache.ts';

export const requestMap = new WeakMap<Request, {ignore?: boolean}>();

// Recursively find routes within directory
const traverse = async (dir: string, depth = 0): Promise<string[]> => {
  // TODO: provide option to override?
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
const generate = async (
  dir: string,
  bumbler: DinoBumbler
): Promise<DinoRoute[]> => {
  const routes: DinoRoute[] = [];
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
    const mod = await importModule(entry, dir, pattern, bumbler);
    if (!mod.length) {
      console.warn(`Invalid route: (${entry})`);
      continue;
    }
    for (const route of mod) {
      // Allow route to modify pattern
      if (route.pattern) {
        pattern = route.pattern;
      }
      routes.push({
        ...route,
        pattern
      });
    }
  }
  return routes;
};

export const addRoutes = async (dinossr: DinoServer) => {
  const routesDir = path.resolve(dinossr.dir, './routes');
  if (!existsSync(routesDir)) {
    return;
  }

  // Possible routes for auto redirects
  const redirects = new Set<string>();

  // Generate file-based routes
  const routes = await generate(routesDir, dinossr.bumbler);
  routes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  for (const route of routes) {
    if (route.pattern === '/_500') {
      addError(dinossr, route);
      continue;
    }
    if (route.pattern === '/_404') {
      addNoMatch(dinossr, route);
      continue;
    }
    if (dinossr.bumbler.dev) {
      console.log(`🪄 ${route.method} → ${route.pattern}`);
    }
    const key = route.method.toLowerCase() as Lowercase<DinoRoute['method']>;
    dinossr.router[key]({pathname: route.pattern}, await createHandle(route));
    if (route.method === 'GET') {
      // TODO: better way to determine redirect routes
      if (!/\.[\w]+$|\*/.test(route.pattern)) {
        redirects.add(route.pattern);
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
      if (dinossr.bumbler.dev) {
        console.log(`⚠️ ${alt} + ${pattern}`);
      }
      return;
    }
    if (dinossr.bumbler.dev) {
      console.log(`🪄 308 ${alt} → ${pattern}`);
    }
    dinossr.router.get(alt, (request) => {
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
