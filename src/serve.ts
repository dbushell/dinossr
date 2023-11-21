import {path, deepMerge, bumble, velocirouter} from './deps.ts';
import {addStaticRoutes} from './static.ts';
import {addRoutes} from './routes.ts';
import {readTemplate} from './template.ts';
import {sveltePreprocessor} from './svelte/preprocess.ts';
import type {ServeOptions, Router, Bumbler} from './types.ts';

const cdnCache = new Map<string, string>();

export const serve = async (dir: string, options?: ServeOptions) => {
  const start = performance.now();
  // Add file system routes
  if (!path.isAbsolute(dir)) {
    throw new Error('Directory path must be absolute');
  }
  dir = path.resolve(dir, './');

  // Setup options
  const defaultOptions: ServeOptions = {
    bumbler: {
      deployId: Deno.env.get('DENO_DEPLOYMENT_ID') ?? Date.now().toString(),
      dynamicImports: Deno.env.has('DENO_REGION') === false
    }
  };

  // deno-lint-ignore no-explicit-any
  options = deepMerge<any>(defaultOptions, options ?? {});

  // Setup router
  const router: Router = new velocirouter.Router({
    onError: (error) => {
      console.error(error);
      return new Response(null, {status: 500});
    },
    ...options?.router
  });

  // Setup bundler
  const bumbler: Bumbler = new bumble.Bumbler(dir, {
    ...options?.bumbler
  });

  const deployHash = (await bumbler.deployHash) ?? '';

  bumbler.sveltePreprocess = sveltePreprocessor(dir, deployHash);

  await readTemplate(dir);
  await addStaticRoutes(router, dir);
  await addRoutes(router, bumbler, dir);

  router.get(
    {pathname: '/_/immutable/svelte@*'},
    async (_req, _res, {match}) => {
      let slug = match.pathname.groups[0];
      if (!slug) return;
      if (!slug.startsWith('/-/')) {
        slug = `/svelte@${slug}`;
      }
      const url = new URL(`https://cdn.skypack.dev${slug}`);
      let body = cdnCache.get(url.href);
      if (!body) {
        const res = await fetch(url, {
          // cache: 'no-store',
          headers: {
            'cache-control': 'no-store'
          }
        });
        if (!res.ok || res.status !== 200) return;
        body = await res.text();
        body = body.replaceAll('/-/svelte@', '/_/immutable/svelte@/-/svelte@');
        cdnCache.set(url.href, body);
      }
      return new Response(body, {
        headers: {
          'content-type': 'text/javascript; charset=utf-8',
          'content-length': body.length.toString()
        }
      });
    }
  );

  router.get({pathname: '/_/immutable/*'}, (_req, response) => {
    if (response?.ok && response?.status === 200) {
      response.headers.set(
        'cache-control',
        'public, max-age=31536000, immutable'
      );
    }
    return response;
  });

  // Setup server
  const server = Deno.serve(options?.serve ?? {}, (request, info) =>
    router.handle(request, {info, deployHash})
  );
  if (options?.bumbler?.dev) {
    const time = (performance.now() - start).toFixed(2);
    console.log(`🚀 ${time}ms`);
  }
  return {router, bumbler, server};
};
