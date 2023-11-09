import {path, existsSync, serveFile} from './deps.ts';
import type {Router} from './types.ts';

// Generate list of static files
const traverse = async (dir: string, depth = 0): Promise<string[]> => {
  // TODO: provide option to override?
  if (depth >= 10) {
    throw new Error('Exceeded maximum depth for static directory');
  }
  let routes: string[] = [];
  for await (const entry of Deno.readDir(dir)) {
    // Ignore hidden files
    if (['.', '_'].includes(entry.name.at(0)!)) {
      continue;
    }
    if (entry.isDirectory) {
      routes = routes.concat(
        await traverse(path.join(dir, entry.name), depth + 1)
      );
      continue;
    }
    if (!entry.isFile) {
      continue;
    }
    routes.push(path.join(dir, entry.name));
  }
  return routes;
};

export const addStaticRoutes = async (router: Router, dir: string) => {
  const staticDir = path.resolve(dir, './static');
  if (!existsSync(staticDir)) {
    return;
  }
  for (const abspath of await traverse(staticDir)) {
    const pattern = '/' + path.relative(staticDir, abspath);
    router.get({pathname: pattern}, (request: Request) => {
      return serveFile(request, abspath);
    });
  }
};
