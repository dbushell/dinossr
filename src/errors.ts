import {path, existsSync} from './deps.ts';
import {createHandle, importModule} from './render.ts';
import type {Bumbler, Router} from './types.ts';

// Only return body content for GET requests
const sendBody = (request: Request) =>
  request.method === 'GET' &&
  request.headers.get('accept')?.includes('text/html');

export const addErrors = async (
  router: Router,
  bumbler: Bumbler,
  dir: string
) => {
  const routesDir = path.resolve(dir, './routes');
  if (!existsSync(routesDir)) {
    return;
  }

  // Custom 500 page
  const errorPath = path.join(routesDir, '_500.svelte');
  if (existsSync(errorPath)) {
    const renderer = await importModule(errorPath, '(500)', bumbler);
    const handle = await createHandle(renderer[0]);
    router.onError = async (error, request, platform) => {
      console.error(error);
      if (!sendBody(request)) {
        return new Response(null, {status: 500});
      }
      // @ts-ignore: TODO: fix?
      const response = (await handle(request, null, {platform})) as Response;
      return new Response(await response.text(), {
        status: 500,
        headers: {
          'content-type': 'text/html; charset=utf-8'
        }
      });
    };
  }

  // Custom 404 page
  const nomatchPath = path.join(routesDir, '_404.svelte');
  if (existsSync(nomatchPath)) {
    const renderer = await importModule(nomatchPath, '(404)', bumbler);
    const handle = await createHandle(renderer[0]);
    router.onNoMatch = async (request, platform) => {
      if (!sendBody(request)) {
        return new Response(null, {status: 404});
      }
      // @ts-ignore: TODO: fix?
      const response = (await handle(request, null, {platform})) as Response;
      return new Response(await response.text(), {
        status: 404,
        headers: {
          'content-type': 'text/html; charset=utf-8'
        }
      });
    };
  }
};
