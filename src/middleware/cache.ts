import {DinoServer} from '../mod.ts';
import {requestMap} from './shared.ts';

export default (dinossr: DinoServer) => {
  dinossr.router.get({pathname: '/_/immutable/*'}, (request, response) => {
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
