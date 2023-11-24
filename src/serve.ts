import {path, deepMerge, bumble, velocirouter} from './deps.ts';
import {
  addRoutes,
  addStaticRoutes,
  addProxyRoute,
  addPolicyRoute,
  addCacheRoute
} from './routes/mod.ts';
import {readTemplate} from './template.ts';
import {sveltePreprocess} from './svelte/preprocess.ts';
import {getDeployHash, setDeployHash} from './utils.ts';
import type {ServeOptions, Router, Bumbler} from './types.ts';

export const serve = async (dir?: string, options?: ServeOptions) => {
  const start = performance.now();

  dir = dir ?? Deno.cwd();
  if (!path.isAbsolute(dir)) {
    console.warn('An absolute directory path is preferred!');
  }
  dir = path.resolve(dir, './');

  // Setup options
  const deployHash = await getDeployHash();
  const defaultOptions: ServeOptions = {
    origin: Deno.env.has('ORIGIN')
      ? new URL(Deno.env.get('ORIGIN')!)
      : undefined,
    bumbler: {
      build: Deno.env.has('DINOSSR_BUILD'),
      dynamicImports: Deno.env.has('DENO_REGION') === false,
      deployHash
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
    ...options?.bumbler,
    sveltePreprocess: sveltePreprocess(dir, deployHash)
  });

  await readTemplate(dir);

  await bumbler.start();

  addProxyRoute(router, options?.origin);
  await addStaticRoutes(router, dir);
  await addRoutes(router, bumbler, dir);

  addCacheRoute(router);
  addPolicyRoute(router);

  bumbler.stop();

  if (Deno.env.has('DINOSSR_BUILD')) {
    await setDeployHash(deployHash);
    return;
  }

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
