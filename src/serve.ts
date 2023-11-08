import {path, deepMerge, bumble, velocirouter} from './deps.ts';
import {addStaticRoutes} from './static.ts';
import {addRoutes} from './routes.ts';
import type {ServeOptions, VRouter, RenderModule} from './types.ts';

// Convert relative TypeScript paths to absolute
export const resolvePaths = (dir: string, options: ServeOptions) => {
  const paths: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(
    options.bumble!.typescript!.paths!
  )) {
    for (let i = 0; i < value.length; i++) {
      value[i] = path.resolve(dir, value[i]);
    }
    paths[key] = value;
  }
  return paths;
};

export const serve = async (dir: string, options?: ServeOptions) => {
  const start = performance.now();
  // Add file system routes
  if (!path.isAbsolute(dir)) {
    throw new Error('Directory path must be absolute');
  }
  dir = path.resolve(dir, './');

  // Setup options
  const defaultOptions: ServeOptions = {
    bumble: {
      deployId: Deno.env.get('DENO_DEPLOYMENT_ID') ?? Date.now().toString(),
      dynamicImports: Deno.env.has('DENO_REGION') === false
    }
  };
  // deno-lint-ignore no-explicit-any
  options = deepMerge<any>(defaultOptions, options ?? {});
  if (options?.bumble?.typescript?.paths) {
    options.bumble.typescript.paths = resolvePaths(dir, options);
  }

  // Setup router
  const router: VRouter = new velocirouter.Router({
    ...options?.router
  });

  // Setup bundler
  const bumbler = new bumble.default<RenderModule>(dir, {
    ...options?.bumble
  });

  await addStaticRoutes(router, dir);
  await addRoutes(router, bumbler, dir);

  // Setup server
  const server = Deno.serve(options?.serve ?? {}, (request, info) =>
    router.handle(request, info)
  );
  if (options?.bumble?.dev) {
    const time = (performance.now() - start).toFixed(2);
    console.log(`🚀 ${time}ms`);
  }
  return {router, bumbler, server};
};
