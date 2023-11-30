import {path, deepMerge, bumble, velocirouter} from './deps.ts';
import * as middleware from './middleware/mod.ts';
import {esbuildResolve, sveltePreprocess} from './svelte/mod.ts';
import {readTemplate} from './template.ts';
import {getManifest, setManifest} from './manifest.ts';
import type {
  DinoOptions,
  DinoRouter,
  DinoBumbler,
  DinoManifest
} from './types.ts';

export class DinoServer {
  #initialized = false;
  #dir: string;
  #options: DinoOptions;
  #manifest: DinoManifest;
  #bumbler!: DinoBumbler;
  #router!: DinoRouter;
  #server!: Deno.HttpServer;
  islandHashes = new Set<string>();

  constructor(dir?: string, options: DinoOptions = {}) {
    dir ??= Deno.cwd();
    this.#dir = path.resolve(dir, './');
    // TODO: tidy up deployHash config
    this.#manifest = getManifest(options.bumbler?.deployHash);
    const defaultOptions: DinoOptions = {
      origin: Deno.env.has('ORIGIN')
        ? new URL(Deno.env.get('ORIGIN')!)
        : undefined,
      bumbler: {
        build: Deno.env.has('DINOSSR_BUILD'),
        dynamicImports: Deno.env.has('DENO_REGION') === false,
        deployHash: this.manifest.deployHash
      }
    };
    this.#options = deepMerge<DinoOptions>(defaultOptions, options ?? {});
    this.#options.bumbler!.deployHash = this.manifest.deployHash;
  }

  get initialized() {
    return this.#initialized;
  }

  get dir() {
    return this.#dir;
  }

  get manifest() {
    return this.#manifest;
  }

  get deployHash() {
    return this.manifest.deployHash;
  }

  get options() {
    return this.#options;
  }

  get origin() {
    return this.options.origin;
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

    await readTemplate(this.dir);

    await this.#setup();

    if (this.options.bumbler?.build) {
      setManifest(this.manifest);
      this.bumbler.stop();
      Deno.exit(0);
    }

    // Setup server
    this.#server = Deno.serve(this.options.serve ?? {}, (request, info) =>
      this.router.handle(request, {info, deployHash: this.deployHash})
    );
    this.server.finished.then(() => {
      this.bumbler.stop();
    });

    if (this.bumbler.dev) {
      const time = (performance.now() - start).toFixed(2);
      console.log(`🚀 Server ${time}ms (${this.deployHash})`);
    }
  }

  async #setup() {
    const start = performance.now();
    let manifest: DinoManifest;
    const builtin = [
      middleware.proxy,
      middleware.static,
      async () => {
        manifest = await middleware.manifest(this);
        if (this.manifest !== manifest) {
          this.#manifest = manifest;
        }
      },
      middleware.redirect,
      middleware.cache,
      middleware.policy
    ];
    for (const callback of builtin) {
      await Promise.resolve(callback(this));
    }
    if (this.bumbler.dev) {
      const time = (performance.now() - start).toFixed(2);
      console.log(`🚀 Routes ${time}ms`);
    }
  }
}
