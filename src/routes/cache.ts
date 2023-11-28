import {DinoServer} from '../mod.ts';

export const addCacheRoute = (dinossr: DinoServer) => {
  dinossr.router.get({pathname: '/_/immutable/*'}, (_req, response) => {
    if (response?.ok && response?.status === 200) {
      response.headers.set(
        'cache-control',
        'public, max-age=31536000, immutable'
      );
    }
    return response;
  });
};
