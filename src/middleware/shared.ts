import {createHandle} from '../render.ts';
import type {DinoServer, DinoRoute} from '../types.ts';

export const requestMap = new WeakMap<Request, {ignore?: boolean}>();

// Only return body content for GET requests
const sendBody = (request: Request) =>
  request.method === 'GET' &&
  request.headers.get('accept')?.includes('text/html');

export const addRoute = async (route: DinoRoute, server: DinoServer) => {
  if (route.pattern === '/500') {
    addError(route, server);
    return;
  }
  if (route.pattern === '/404') {
    addNoMatch(route, server);
    return;
  }
  if (server.dev) {
    console.log(`🪄 ${route.method} → ${route.pattern}`);
  }
  const key = route.method.toLowerCase() as Lowercase<DinoRoute['method']>;
  server.router[key]({pathname: route.pattern}, await createHandle(route));
};

export const addError = async (route: DinoRoute, server: DinoServer) => {
  const handle = await createHandle(route);
  server.router.onError = async (error, request, platform) => {
    console.error(error);
    if (!sendBody(request)) {
      return new Response(null, {status: 500});
    }
    // @ts-ignore: TODO: fix 3rd argument?
    const response = (await handle(request, undefined, {platform})) as Response;
    return new Response(await response.text(), {
      status: 500,
      headers: {
        'content-type': 'text/html; charset=utf-8'
      }
    });
  };
};

export const addNoMatch = async (route: DinoRoute, server: DinoServer) => {
  const handle = await createHandle(route);
  server.router.onNoMatch = async (request, platform) => {
    if (!sendBody(request)) {
      return new Response(null, {status: 404});
    }
    // @ts-ignore: TODO: fix 3rd argument?
    const response = (await handle(request, undefined, {platform})) as Response;
    return new Response(await response.text(), {
      status: 404,
      headers: {
        'content-type': 'text/html; charset=utf-8'
      }
    });
  };
};
