import {createHandle} from '../render.ts';
import type {DinoServer, DinoRoute} from '../types.ts';

export const requestMap = new WeakMap<Request, {ignore?: boolean}>();

// Only return body content for GET requests
const sendBody = (request: Request) =>
  request.method === 'GET' &&
  request.headers.get('accept')?.includes('text/html');

export const addRoute = async (server: DinoServer, route: DinoRoute) => {
  if (route.pattern === '/500') {
    addError(server, route);
    return;
  }
  if (route.pattern === '/404') {
    addNoMatch(server, route);
    return;
  }
  if (server.dev) {
    console.log(`🪄 ${route.method} → ${route.pattern}`);
  }
  const key = route.method.toLowerCase() as Lowercase<DinoRoute['method']>;
  const input = new URLPattern({pathname: route.pattern});
  server.router[key](input, await createHandle(server, route));
};

export const addError = async (server: DinoServer, route: DinoRoute) => {
  const handle = await createHandle(server, route);
  server.router.onError = async (error, request, platform) => {
    console.error(error);
    const defaultResponse = new Response(null, {status: 500});
    if (!sendBody(request)) {
      return defaultResponse;
    }
    const {response} = await server.router.resolve(
      request,
      handle({
        request,
        platform,
        stopPropagation: () => {},
        match: new URLPattern({pathname: '*'}).exec(request.url)!
      })
    );
    if (!response) {
      return defaultResponse;
    }
    return new Response(await response.text(), {
      status: 500,
      headers: {
        'content-type': 'text/html; charset=utf-8'
      }
    });
  };
};

export const addNoMatch = async (server: DinoServer, route: DinoRoute) => {
  const handle = await createHandle(server, route);
  server.router.onNoMatch = async (request, platform) => {
    const defaultResponse = new Response(null, {status: 404});
    if (!sendBody(request)) {
      return defaultResponse;
    }
    const {response} = await server.router.resolve(
      request,
      handle({
        request,
        platform,
        stopPropagation: () => {},
        match: new URLPattern({pathname: '*'}).exec(request.url)!
      })
    );
    if (!response) {
      return defaultResponse;
    }
    return new Response(await response.text(), {
      status: 404,
      headers: {
        'content-type': 'text/html; charset=utf-8'
      }
    });
  };
};
