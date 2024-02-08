import {path, existsSync, serveDir} from '../../deps.ts';
import type {DinoServer} from '../types.ts';

export default (server: DinoServer) => {
  if (server.options.static === false) {
    return;
  }
  const staticDir = path.resolve(server.dir, './static');
  if (!existsSync(staticDir)) {
    return;
  }
  server.router.get({pathname: '*'}, async ({request}) => {
    const response = await serveDir(request, {
      fsRoot: staticDir,
      quiet: true
    });
    if (response.ok || response.status === 304) {
      return response;
    }
  });
};
