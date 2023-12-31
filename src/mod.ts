import {path, deepMerge, bumble, velocirouter} from './deps.ts';
import * as middleware from './middleware/mod.ts';
import {readTemplate} from './template.ts';
import {manifestDir, getManifest, setManifest} from './manifest.ts';
import Cookies from './cookies.ts';
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

  constructor(dir?: string, options: DinoOptions = {}) {
    // Ensure absolute path
    dir ??= Deno.cwd();
    this.#dir = path.resolve(dir, './');
    // Get new or prebuilt manifest
    this.#manifest = getManifest(options.deployHash);
    // Setup options
    const defaultOptions: DinoOptions = {
      origin: Deno.env.has('ORIGIN')
        ? new URL(Deno.env.get('ORIGIN')!)
        : undefined,
      unhandledRejection: (error: PromiseRejectionEvent) => {
        error.preventDefault();
        console.error(error.reason);
      },
      bumbler: {
        build: Deno.env.has('DINOSSR_BUILD'),
        buildDir: manifestDir
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
      ...this.options.bumbler
    });

    await readTemplate(this.dir);

    await this.#setup();

    if (this.options.bumbler?.build) {
      setManifest(this.manifest);
      this.bumbler.stop();
      Deno.exit(0);
    }

    globalThis.addEventListener(
      'unhandledrejection',
      this.options.unhandledRejection!
    );

    // Setup server
    this.#server = Deno.serve(
      this.options.serve ?? {},
      async (request, info) => {
        const cookies = new Cookies(request.headers);
        const response = await this.router.handle(request, {
          info,
          cookies,
          deployHash: this.deployHash
        });
        cookies.headers(response);
        return response;
      }
    );

    this.server.finished.then(() => {
      this.bumbler.stop();
      globalThis.removeEventListener(
        'unhandledrejection',
        this.options.unhandledRejection!
      );
    });

    if (this.bumbler.dev) {
      const time = (performance.now() - start).toFixed(2);
      console.log(`🚀 Server ${time}ms (${this.deployHash})`);
      if (this.origin) console.log(this.origin.href);
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
