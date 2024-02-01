import {
  path,
  deepMerge,
  velocirouter,
  ensureDirSync,
  existsSync
} from '../deps.ts';
import * as middleware from './middleware/mod.ts';
import {encodeHash} from './utils.ts';
import {readTemplate} from './template.ts';
import {manifestDir, getManifest, setManifest} from './manifest.ts';
import Cookies from './cookies.ts';

import type {
  DinoServer,
  DinoOptions,
  DinoRouter,
  DinoManifest,
  DinoPlatform
} from './types.ts';

export class DinoSsr implements DinoServer {
  #initialized = false;
  #dir: string;
  #options: DinoOptions;
  #manifest: DinoManifest;
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
      rejectionHandled: (error: PromiseRejectionEvent) => {
        error.preventDefault();
        console.error(error.reason);
      }
    };
    this.#options = deepMerge<DinoOptions>(defaultOptions, options ?? {});
  }

  get options(): DinoOptions {
    return this.#options;
  }

  get initialized(): boolean {
    return this.#initialized;
  }

  get dev(): boolean {
    return this.options.dev ?? false;
  }

  get dir(): string {
    return this.#dir;
  }

  get deployHash(): string {
    return this.manifest.deployHash;
  }

  get origin(): URL | undefined {
    return this.options.origin;
  }

  get manifest(): DinoManifest {
    return this.#manifest;
  }

  get router(): DinoRouter {
    if (!this.initialized) throw new Error('Not initialized');
    return this.#router;
  }

  get server(): Deno.HttpServer {
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
      }
    });

    await readTemplate(this.dir);

    if (Deno.env.has('DINOSSR_BUILD')) {
      if (existsSync(manifestDir)) {
        Deno.removeSync(manifestDir, {recursive: true});
      }
      ensureDirSync(manifestDir);
    }

    await this.#setup();

    if (Deno.env.has('DINOSSR_BUILD')) {
      setManifest(this.manifest);
      // stop esbuild?
      Deno.exit(0);
    }

    globalThis.addEventListener(
      'unhandledrejection',
      this.options.unhandledRejection!
    );

    globalThis.addEventListener(
      'rejectionhandled',
      this.options.rejectionHandled!
    );

    // Setup server
    this.#server = Deno.serve(
      this.options.serve ?? {},
      async (request, info) => {
        const cookies = new Cookies(request.headers);
        const platform: DinoPlatform = {
          info,
          cookies,
          deployHash: this.deployHash,
          publicData: {},
          serverData: {}
        };
        Object.freeze(platform);
        const response = await this.router.handle(request, platform);
        cookies.headers(response);
        return response;
      }
    );

    this.server.finished.then(() => {
      // stop esbuild?
      globalThis.removeEventListener(
        'unhandledrejection',
        this.options.unhandledRejection!
      );
      globalThis.removeEventListener(
        'rejectionhandled',
        this.options.rejectionHandled!
      );
    });

    if (this.dev) {
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
    if (this.dev) {
      const time = (performance.now() - start).toFixed(2);
      console.log(`🚀 Routes ${time}ms`);
    }
  }

  /** Hash a value with the deploy hash */
  hash(value: string, salt = '') {
    return encodeHash(value + salt + this.deployHash);
  }
}
