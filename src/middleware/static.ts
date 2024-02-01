import {path, existsSync, serveFile} from '../../deps.ts';
import {traverse} from '../utils.ts';
import type {DinoServer} from '../types.ts';

export default async (server: DinoServer) => {
  const staticDir = path.resolve(server.dir, './static');
  if (!existsSync(staticDir)) {
    return;
  }
  const routes: Array<string> = [];
  await traverse(staticDir, (dir, entry) => {
    routes.push(path.join(dir, entry.name));
  });
  for (const entry of routes) {
    const pattern = '/' + path.relative(staticDir, entry);
    server.router.get({pathname: pattern}, (request: Request) => {
      return serveFile(request, entry);
    });
  }
};
