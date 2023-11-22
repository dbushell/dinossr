import {path, deepMerge, bumble, velocirouter} from './deps.ts';
import {
  addRoutes,
  addStaticRoutes,
  addProxyRoute,
  addPolicyRoute,
  addCacheRoute
} from './routes/mod.ts';
import {readTemplate} from './template.ts';
import {sveltePreprocessor} from './svelte/preprocess.ts';
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
    origin: Deno.env.has('ORIGIN')
      ? new URL(Deno.env.get('ORIGIN')!)
      : undefined,
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

  addProxyRoute(router, options?.origin);
  await addStaticRoutes(router, dir);
  await addRoutes(router, bumbler, dir);

  addCacheRoute(router);
  addPolicyRoute(router);

  bumbler.stop();

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
