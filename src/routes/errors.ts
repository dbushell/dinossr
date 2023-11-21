import {createHandle} from '../render.ts';
import type {Renderer, Router} from '../types.ts';

// Only return body content for GET requests
const sendBody = (request: Request) =>
  request.method === 'GET' &&
  request.headers.get('accept')?.includes('text/html');

export const addError = async (router: Router, renderer: Renderer) => {
  const handle = await createHandle(renderer);
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
};

export const addNoMatch = async (router: Router, renderer: Renderer) => {
  const handle = await createHandle(renderer);
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
};
