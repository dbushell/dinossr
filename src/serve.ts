import {path, deepMerge, bumble, velocirouter} from './deps.ts';
import {addStaticRoutes} from './static.ts';
import {addRoutes} from './routes.ts';
import {readTemplate} from './template.ts';
import {sveltePreprocessor} from './svelte.ts';
import type {ServeOptions, Router, Bumbler} from './types.ts';

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
    ...options?.router
  });

  // Setup bundler
  const bumbler: Bumbler = new bumble.Bumbler(dir, {
    ...options?.bumbler
  });

  const deployHash = (await bumbler.deployHash) ?? '';

  bumbler.sveltePreprocess = sveltePreprocessor(deployHash);

  await readTemplate(dir);
  await addStaticRoutes(router, dir);
  await addRoutes(router, bumbler, dir);

  router.get('/_/immutable/:hash:ext(\\.\\w+)', (_req, response) => {
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
