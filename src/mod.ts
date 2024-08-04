/**
 * @module
 * Module exports the DinoSsr Server class
 */
import * as path from '@std/path';
import {Router as VelociRouter} from '@ssr/velocirouter';
import * as middleware from './middleware/mod.ts';
import {encodeHash} from './utils.ts';
import {readTemplate} from './template.ts';
import Cookies from './cookies.ts';

import type {
  DinoData,
  DinoServer,
  DinoOptions,
  DinoRouter,
  DinoManifest,
  DinoPlatform
} from './types.ts';

/** DinoSsr server */
export class DinoSsr<T extends DinoData = DinoData> implements DinoServer<T> {
  #initialized = false;
  #dir: string;
  #options: DinoOptions;
  #manifest!: DinoManifest;
  #router!: DinoRouter<T>;
  #server!: Deno.HttpServer;

  /**
   * Create a new DinoSsr server
   * @param dir     Base directory
   * @param options Server options {@link DinoOptions}
   */
  constructor(dir?: string, options: DinoOptions = {}) {
    // Ensure absolute path
    dir ??= Deno.cwd();
    this.#dir = path.resolve(dir, './');
    // Check deployment
    if (Deno.env.has('DENO_REGION')) {
      console.warn('⚠️ Deno Deploy is slow ⚠️');
    }
    // Setup options
    const defaultOptions: DinoOptions = {
      origin: Deno.env.has('ORIGIN')
        ? new URL(Deno.env.get('ORIGIN')!)
        : undefined,
      static: 'static',
      unhandledRejection: (error: PromiseRejectionEvent) => {
        error.preventDefault();
        console.error(error.reason);
      },
      rejectionHandled: (error: PromiseRejectionEvent) => {
        error.preventDefault();
        console.error(error.reason);
      }
    };
    this.#options = {
      ...defaultOptions,
      ...(options ?? {})
    };
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

  get router(): DinoRouter<T> {
    if (!this.initialized) throw new Error('Not initialized');
    return this.#router;
  }

  get server(): Deno.HttpServer {
    if (!this.initialized) throw new Error('Not initialized');
    return this.#server;
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    this.#initialized = true;

    const deployHash = await encodeHash(
      // Use build environment variable
      Deno.env.get('DINOSSR_DEPLOY_ID') ??
        // Use unique per startup
        Date.now().toString()
    );

    this.#manifest = {
      deployHash,
      islands: [],
      modules: []
    };

    const start = performance.now();

    // Setup router
    this.#router = new VelociRouter<DinoPlatform<T>>({
      onError: (error) => {
        console.error(error);
        return new Response(null, {status: 500});
      }
    });

    await readTemplate(this.dir);

    await this.#setup();

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
        const platform: DinoPlatform<T> = {
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
    const builtin = [
      middleware.proxy,
      middleware.static,
      middleware.manifest,
      middleware.redirect,
      middleware.cache,
      middleware.policy
    ];
    for (const callback of builtin) {
      /** @todo Pass generic T type necessary? */
      await Promise.resolve(callback(this as unknown as DinoServer));
    }
    if (this.dev) {
      const time = (performance.now() - start).toFixed(2);
      console.log(`🚀 Routes ${time}ms`);
    }
  }

  /** Hash a value with the deploy hash */
  hash(value: string, salt = ''): Promise<string> {
    return encodeHash(value + salt + this.deployHash);
  }
}
