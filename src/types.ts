import {bumble, velocirouter} from './deps.ts';

export type Deferred<T> = ReturnType<typeof Promise.withResolvers<T>>;

export type DinoPlatform = {info: Deno.ServeHandlerInfo; deployHash: string};

export type DinoHandle = velocirouter.Handle<DinoPlatform>;

export type DinoRouter = velocirouter.Router<DinoPlatform>;

export type DinoBumbler = bumble.Bumbler<DinoModule>;

export interface DinoBundle {
  mod: bumble.BumbleModule<DinoModule>;
  metafile: bumble.esbuildType.Metafile;
}

export type DinoOptions = {
  origin?: URL;
  deployHash?: string;
  serve?: Deno.ServeOptions;
  router?: velocirouter.RouterOptions<DinoPlatform>;
  bumbler?: bumble.BumbleOptions;
};

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
  modules: Array<{
    entry: string;
    hash: string;
    pattern: string;
    routes: DinoRoute[];
  }>;
  islands: Array<{
    hash: string;
    pattern: string;
    code: string;
  }>;
}

export interface DinoBuild {
  modules: Array<
    DinoBundle & {
      manifest: DinoManifest['modules'][number];
    }
  >;
  islands: Array<{
    code: string;
    manifest: DinoManifest['islands'][number];
  }>;
}
