import {path, existsSync, serveFile} from '../../deps.ts';
import {DinoServer} from '../mod.ts';

// Generate list of static files
const traverse = async (dir: string, depth = 0): Promise<string[]> => {
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

export default async (dinossr: DinoServer) => {
  const staticDir = path.resolve(dinossr.dir, './static');
  if (!existsSync(staticDir)) {
    return;
  }
  for (const entry of await traverse(staticDir)) {
    const pattern = '/' + path.relative(staticDir, entry);
    dinossr.router.get({pathname: pattern}, (request: Request) => {
      return serveFile(request, entry);
    });
  }
};
