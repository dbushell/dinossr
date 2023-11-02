import {path, existsSync, bumble} from './deps.ts';
import {importModule} from './render.ts';
import {readTemplate, hasTemplate} from './template.ts';
import type {VRouter, RenderModule, RenderHandler, VHandle} from './types.ts';

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

// Generate route handlers for directory
const generate = async (
  dir: string,
  bumbler: bumble.default<RenderModule>
): Promise<RenderHandler[]> => {
  const handlers: RenderHandler[] = [];
  for (const abspath of await traverse(dir)) {
    let pattern = '/' + path.relative(dir, abspath);
    // Replace non-capturing groups
    pattern = pattern.replaceAll(/\([^\)]+?\)\/?/g, '');
    // Replace named parameters
    pattern = pattern.replaceAll(/\[([^\]]+?)\]/g, ':$1');
    // Remove URL
    pattern = path.dirname(pattern);
    // Import module
    const newHandlers = await importModule(abspath, bumbler);
    if (!newHandlers.length) {
      console.warn(`Invalid route: (${abspath})`);
      continue;
    }
    for (const handler of newHandlers) {
      // Append module pattern
      if (handler.pattern.length) {
        pattern = path.join(pattern, handler.pattern);
      }
      // Add trailing slash
      if (pattern.at(-1) !== '/') {
        pattern += '/';
      }
      handlers.push({
        ...handler,
        pattern
      });
    }
  }
  return handlers;
};

// Add redirect for missing trailing slash
const redirect = (router: VRouter, handler: RenderHandler) => {
  if (handler.pattern === '/') return;
  if (handler.pattern.at(-1) !== '/') return;
  router.get(handler.pattern.slice(0, -1), (request) => {
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

// Return a route handle that renders with `app.html`
const createHandle = (handler: RenderHandler, template: string): VHandle => {
  return async (...args) => {
    const render = await handler.render(...args);
    let response = await render.response;
    if (handler.method === 'GET' && hasTemplate(response)) {
      response = response as Response;
      let body = template.replace('%BODY%', await response.text());
      body = body.replace('%HEAD%', render.head || '');
      response = new Response(body, response);
      response.headers.set('content-type', 'text/html; charset=utf-8');
    }
    return response;
  };
};

export const addRoutes = async (
  router: VRouter,
  bumbler: bumble.default<RenderModule>,
  dir: string
) => {
  const routesDir = path.resolve(dir, './routes');
  if (!existsSync(routesDir)) {
    return;
  }

  const template = await readTemplate(dir);

  // Generate file-based routes
  for (const handler of await generate(routesDir, bumbler)) {
    console.debug(`${handler.method} → ${handler.pattern}`);
    const key = handler.method.toLowerCase() as Lowercase<
      RenderHandler['method']
    >;
    router[key](handler.pattern, createHandle(handler, template));
    if (handler.method === 'GET') {
      redirect(router, handler);
    }
  }

  // Only return body content for GET requests
  const sendBody = (request: Request) =>
    request.method === 'GET' &&
    request.headers.get('accept')?.includes('text/html');

  // Custom 500 page
  const errorPath = path.join(routesDir, '_500.svelte');
  if (existsSync(errorPath)) {
    const handler = await importModule(errorPath, bumbler);
    const vhandle = createHandle(handler[0], template);
    router.onError = async (error, request, platform) => {
      console.error(error);
      if (!sendBody(request)) {
        return new Response(null, {status: 500});
      }
      // @ts-ignore: TODO: fix?
      const response = (await vhandle(request, null, {platform})) as Response;
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
    const handler = await importModule(nomatchPath, bumbler);
    const vhandle = createHandle(handler[0], template);
    router.onNoMatch = async (request, platform) => {
      if (!sendBody(request)) {
        return new Response(null, {status: 404});
      }
      // @ts-ignore: TODO: fix?
      const response = (await vhandle(request, null, {platform})) as Response;
      return new Response(await response.text(), {
        status: 404,
        headers: {
          'content-type': 'text/html; charset=utf-8'
        }
      });
    };
  }
};
