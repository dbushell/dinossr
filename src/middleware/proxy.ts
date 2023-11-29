import {DinoServer} from '../mod.ts';
import {requestMap} from './shared.ts';

export default (dinossr: DinoServer) => {
  dinossr.router.use((request, response, {stopPropagation}) => {
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
    if (dinossr.origin) {
      if (
        dinossr.origin.hostname !== base.hostname ||
        dinossr.origin.protocol !== base.protocol
      ) {
        stopPropagation();
        // Add redirect for Deno Deploy
        if (
          Deno.env.has('DENO_REGION') &&
          base.hostname.endsWith('.deno.dev')
        ) {
          base.hostname = dinossr.origin.hostname;
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
