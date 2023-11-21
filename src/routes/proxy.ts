import type {Router} from '../types.ts';

export const addProxyRoute = (router: Router, origin?: URL) => {
  router.use((request, response, {stopPropagation}) => {
    // Modify request url if behind proxy
    const base = new URL(request.url);
    if (request.headers.has('x-forwarded-host')) {
      base.host = request.headers.get('x-forwarded-host') ?? '';
    }
    if (request.headers.has('x-forwarded-proto')) {
      base.protocol = request.headers.get('x-forwarded-proto') ?? '';
    }
    // Validate against origin url if specified
    if (origin) {
      if (
        origin.hostname !== base.hostname ||
        origin.protocol !== base.protocol
      ) {
        stopPropagation();
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
