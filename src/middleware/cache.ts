import {requestMap} from './shared.ts';
import type {DinoSsr} from '../mod.ts';

export default (server: DinoSsr) => {
  const input = new URLPattern({pathname: '/_/immutable/*'});
  server.router.get(input, ({request, response}) => {
    try {
      if (requestMap.get(request)?.ignore) return response;
      if (response?.ok && response?.status === 200) {
        response.headers.set(
          'cache-control',
          'public, max-age=31536000, immutable'
        );
      }
    } catch {
      // Headers probably immutable
    }
    return response;
  });
};
