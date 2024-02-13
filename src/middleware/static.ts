import {path, existsSync, serveDir} from '../../deps.ts';
import type {DinoServer} from '../types.ts';

export default (server: DinoServer) => {
  if (!server.options.static) {
    return;
  }
  const staticDir = path.resolve(server.dir, server.options.static);
  if (!existsSync(staticDir)) {
    console.warn(`Missing static directory: ${staticDir}`);
    return;
  }
  server.router.get(new URLPattern({}), async ({request}) => {
    const response = await serveDir(request, {
      fsRoot: staticDir,
      quiet: true
    });
    if (response.ok || response.status === 304) {
      return response;
    }
  });
};
