import {path, deepMerge, bumble, velocirouter} from './deps.ts';
import * as routes from './routes/mod.ts';
import {esbuildResolve, sveltePreprocess} from './svelte/mod.ts';
import {readTemplate} from './template.ts';
import {getDeployHash, setDeployHash} from './utils.ts';
import type {DinoOptions, DinoRouter, DinoBumbler} from './types.ts';

export class DinoServer {
  #initialized = false;
  #dir: string;
  #options: DinoOptions;
  #bumbler!: DinoBumbler;
  #router!: DinoRouter;
  #server!: Deno.HttpServer;

  constructor(dir?: string, options: DinoOptions = {}) {
    dir ??= Deno.cwd();
    this.#dir = path.resolve(dir, './');
    const defaultOptions: DinoOptions = {
      origin: Deno.env.has('ORIGIN')
        ? new URL(Deno.env.get('ORIGIN')!)
        : undefined,
      bumbler: {
        build: Deno.env.has('DINOSSR_BUILD'),
        dynamicImports: Deno.env.has('DENO_REGION') === false,
        deployHash: getDeployHash()
      }
    };
    this.#options = deepMerge<DinoOptions>(defaultOptions, options ?? {});
  }

  get initialized() {
    return this.#initialized;
  }

  get dir() {
    return this.#dir;
  }

  get options() {
    return this.#options;
  }

  get origin() {
    return this.options.origin;
  }

  get deployHash() {
    return this.options.bumbler!.deployHash!;
  }

  get bumbler() {
    if (!this.initialized) throw new Error('Not initialized');
    return this.#bumbler;
  }

  get router() {
    if (!this.initialized) throw new Error('Not initialized');
    return this.#router;
  }

  get server() {
    if (!this.initialized) throw new Error('Not initialized');
    return this.#server;
  }

  async init() {
    if (this.initialized) return;
    this.#initialized = true;

    const start = performance.now();

    // Setup router
    this.#router = new velocirouter.Router({
      onError: (error) => {
        console.error(error);
        return new Response(null, {status: 500});
      },
      ...this.options.router
    });

    // Setup bundler
    this.#bumbler = new bumble.Bumbler(this.dir, {
      ...this.options.bumbler,
      sveltePreprocess: sveltePreprocess(this),
      esbuildResolve
    });

    // Setup server
    this.#server = Deno.serve(this.options.serve ?? {}, (request, info) =>
      this.router.handle(request, {info, deployHash: this.deployHash})
    );
    this.server.finished.then(() => {
      this.bumbler.stop();
    });

    await this.bumbler.start();

    await readTemplate(this.dir);

    await this.#addRoutes();

    if (this.options.bumbler?.build) {
      setDeployHash(this.deployHash);
      Deno.exit(0);
    }

    if (this.bumbler.dev) {
      const time = (performance.now() - start).toFixed(2);
      console.log(`🚀 Server ${time}ms`);
    }
  }

  async #addRoutes() {
    const start = performance.now();
    const mods = [
      routes.addProxyRoute,
      routes.addStaticRoutes,
      routes.addRoutes,
      routes.addCacheRoute,
      routes.addPolicyRoute
    ];
    for (const callback of mods) {
      await callback(this);
    }
    if (this.bumbler.dev) {
      const time = (performance.now() - start).toFixed(2);
      console.log(`🚀 Routes ${time}ms`);
    }
  }
}
