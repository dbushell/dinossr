import * as path from '@std/path';
import {existsSync} from '@std/fs';
import {serveDir} from '@std/http/file-server';
import type {DinoSsr} from '../mod.ts';

export default (server: DinoSsr) => {
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
