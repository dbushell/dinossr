import {bumble, velocirouter} from './deps.ts';

export type Deferred<T> = ReturnType<typeof Promise.withResolvers<T>>;

export type DinoPlatform = {info: Deno.ServeHandlerInfo; deployHash: string};

export type DinoHandle = velocirouter.Handle<DinoPlatform>;

export type DinoRouter = velocirouter.Router<DinoPlatform>;

export type DinoBumbler = bumble.Bumbler<DinoModule>;

export interface DinoOptions {
  [key: PropertyKey]: unknown;
  origin?: URL;
  serve?: Deno.ServeOptions;
  router?: velocirouter.RouterOptions<DinoPlatform>;
  bumbler?: Pick<
    bumble.BumbleOptions,
    'dev' | 'build' | 'deployHash' | 'dynamicImports'
  >;
}

export interface DinoModule {
  pattern?: string;
  order?: number;
  get?: DinoHandle;
  post?: DinoHandle;
  load?: (
    request: Request,
    {params}: {params?: Record<string, string | undefined>}
  ) => Promise<Record<string, unknown>>;
}

export interface DinoResponse {
  response: ReturnType<DinoHandle>;
  head?: string;
  css?: string;
}

export interface DinoRender {
  (...args: Parameters<DinoHandle>): DinoResponse | Promise<DinoResponse>;
}

export interface DinoRoute {
  method: velocirouter.Method;
  pattern: string;
  modhash: string;
  render: DinoRender;
  order?: number;
}

export interface DinoManifest {
  deployHash: string;
  routes: Array<DinoRoute>;
}
