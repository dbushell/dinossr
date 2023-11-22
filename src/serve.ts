import {fs, path, deepMerge, bumble, velocirouter} from './deps.ts';
import {
  addRoutes,
  addStaticRoutes,
  addProxyRoute,
  addPolicyRoute,
  addCacheRoute
} from './routes/mod.ts';
import {readTemplate} from './template.ts';
import {sveltePreprocessor} from './svelte/preprocess.ts';
import {encodeHash} from './utils.ts';
import type {ServeOptions, Router, Bumbler} from './types.ts';

export const serve = async (dir: string, options?: ServeOptions) => {
  const start = performance.now();
  // Add file system routes
  if (!path.isAbsolute(dir)) {
    throw new Error('Directory path must be absolute');
  }
  dir = path.resolve(dir, './');

  let deployHash = '';
  const deployHashPath = path.join(Deno.cwd(), '.dinossr/id.txt');
  if (!Deno.env.has('DINOSSR_DEPLOY_ID')) {
    if (await fs.exists(deployHashPath)) {
      deployHash = await Deno.readTextFile(deployHashPath);
      deployHash = deployHash.trim();
      console.log(`Deploy hash: "${deployHash}"`);
    }
  }

  deployHash =
    deployHash ||
    (await encodeHash(
      Deno.env.get('DINOSSR_DEPLOY_ID') ??
        Deno.env.get('DENO_DEPLOYMENT_ID') ??
        Date.now().toString(),
      'SHA-1'
    ));

  // Setup options
  const defaultOptions: ServeOptions = {
    origin: Deno.env.has('ORIGIN')
      ? new URL(Deno.env.get('ORIGIN')!)
      : undefined,
    bumbler: {
      build: Deno.env.has('DINOSSR_BUILD'),
      deployHash,
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

  bumbler.sveltePreprocess = sveltePreprocessor(dir, deployHash);

  await bumbler.start();

  await readTemplate(dir);

  addProxyRoute(router, options?.origin);
  await addStaticRoutes(router, dir);
  await addRoutes(router, bumbler, dir);

  addCacheRoute(router);
  addPolicyRoute(router);

  bumbler.stop();

  if (Deno.env.has('DINOSSR_BUILD')) {
    await fs.ensureFile(deployHashPath);
    await Deno.writeTextFile(deployHashPath, deployHash);
    return;
  }

  for await (const dir of Deno.readDir(path.join(Deno.cwd(), '.dinossr', deployHash))) {
    console.log(`Cache: ${dir.name}`);
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
