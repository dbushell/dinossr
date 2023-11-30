import {DinoServer} from '../mod.ts';
import {requestMap} from './shared.ts';

const ignore = new Set(['/', '/_404', '/_500']);

export default (dinossr: DinoServer) => {
  // Possible routes for auto redirects
  const redirects = new Set<string>();
  for (const mod of dinossr.manifest.modules) {
    for (const route of mod.routes) {
      if (route.method !== 'GET') continue;
      if (ignore.has(route.pattern)) continue;
      // TODO: better way to determine redirect routes
      if (!/\.[\w]+$|\*/.test(route.pattern)) {
        redirects.add(route.pattern);
      }
    }
  }
  for (const pattern of redirects) {
    let alt = pattern;
    if (pattern.at(-1) === '/') {
      alt = pattern.slice(0, -1);
    } else {
      alt += '/';
    }
    // Check for conflicts e.g. /about/index.svelte & /about.svelte
    if (redirects.has(alt)) {
      if (dinossr.bumbler.dev) {
        console.log(`⚠️ Possible conflict: ${alt} + ${pattern}`);
      }
      continue;
    }
    if (dinossr.bumbler.dev) {
      console.log(`🪄 308 ${alt} → ${pattern}`);
    }
    dinossr.router.get(alt, (request, response) => {
      if (requestMap.get(request)?.ignore) return response;
      const url = new URL(request.url);
      if (url.pathname.at(-1) === '/') {
        url.pathname = url.pathname.slice(0, -1);
      } else {
        url.pathname += '/';
      }
      return new Response(null, {
        status: 308,
        headers: {
          location: url.href
        }
      });
    });
  }
};
