import {requestMap} from './shared.ts';
import type {DinoServer} from '../types.ts';

export default (server: DinoServer) => {
  server.router.use(({request, response, stopPropagation}) => {
    if (requestMap.get(request)?.ignore) return response;
    if (request.headers.get('upgrade') === 'websocket') {
      requestMap.set(request, {ignore: true});
      return response;
    }
    // Modify request url if behind proxy
    const base = new URL(request.url);
    if (request.headers.has('x-forwarded-host')) {
      base.host = request.headers.get('x-forwarded-host') ?? '';
    }
    if (request.headers.has('x-forwarded-proto')) {
      base.protocol = request.headers.get('x-forwarded-proto') ?? '';
    }
    // Validate against origin url if specified
    if (server.origin) {
      if (
        server.origin.hostname !== base.hostname ||
        server.origin.protocol !== base.protocol
      ) {
        stopPropagation();
        // Add redirect for Deno Deploy
        if (
          Deno.env.has('DENO_REGION') &&
          base.hostname.endsWith('.deno.dev')
        ) {
          base.hostname = server.origin.hostname;
          return new Response(null, {
            status: 308,
            headers: {
              location: base.href
            }
          });
        }
        return new Response(null, {status: 404});
      }
    }
    const newRequest = new Request(base, {
      method: request.method,
      headers: request.headers,
      body: request.body
    });
    return {request: newRequest, response};
  });
};
