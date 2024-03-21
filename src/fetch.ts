import type {DinoRouter, DinoPlatform} from './types.ts';

export const serverFetch = (
  request: Request,
  router: DinoRouter,
  platform: DinoPlatform
) => {
  return (...args: Parameters<typeof fetch>): ReturnType<typeof fetch> => {
    // Prevent infinite redirects
    const depth = Number(request.headers.get('x-fetch-depth') ?? 0);
    if (depth >= 5) {
      throw new Error('Server fetch depth exceeded');
    }
    const requestURL = new URL(request.url);
    let local = false;
    // Convert string to URL (use request as base for relative href)
    if (typeof args[0] === 'string') {
      try {
        args[0] = new URL(args[0]);
        // Local if same origin
        local = args[0].origin === requestURL.origin;
      } catch {
        args[0] = new URL(args[0], requestURL);
        // Always local if relative
        local = true;
      }
    }
    // Not local; use native fetch
    if (!local) {
      return fetch(...args);
    }
    // Local; pass request through router
    const newRequest = new Request(args[0], args[1]);
    newRequest.headers.set('x-fetch-depth', String(depth + 1));
    const newPlatform: DinoPlatform = {
      ...platform,
      publicData: {},
      serverData: {}
    };
    Object.freeze(newPlatform);
    return router.handle(newRequest, newPlatform);
  };
};
