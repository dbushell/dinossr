import {bumble, velocirouter} from './deps.ts';

export interface CookieOptions {
  domain?: string;
  expires?: Date | number;
  httpOnly?: boolean;
  maxAge?: number;
  partitioned?: boolean;
  path?: string;
  priority?: 'low' | 'medium' | 'high';
  sameSite?: true | 'lax' | 'strict' | 'none';
  secure?: boolean;
}

export type CookieMap = Map<string, CookieOptions & {value: string}>;

export type DinoPlatform = {
  info: Deno.ServeHandlerInfo;
  cookies: CookieMap;
  deployHash: string;
};

export type DinoOptions = {
  origin?: URL;
  deployHash?: string;
  serve?: Deno.ServeOptions;
  router?: velocirouter.RouterOptions<DinoPlatform>;
  bumbler?: bumble.BumbleOptions;
};

export type DinoHandle = velocirouter.Handle<DinoPlatform>;

export type DinoRouter = velocirouter.Router<DinoPlatform>;

export type DinoBumbler = bumble.Bumbler<DinoModule>;

export type DinoDOMBundle = bumble.BumbleDOMBundle & {
  pattern: string;
};

export type DinoSSRBundle = bumble.BumbleSSRBundle<DinoModule> & {
  pattern: string;
};

export type DinoModule = {
  pattern?: string;
  order?: number;
  get?: DinoHandle;
  post?: DinoHandle;
  load?: (
    request: Request,
    props: Partial<DinoPlatform> & {
      params?: Record<string, string | undefined>;
    }
  ) => Promise<Record<string, unknown>>;
};

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
  hash: string;
  render: DinoRender;
  order?: number;
}

export interface DinoIsland {
  entry: string;
  hash: string;
  pattern: string;
}

export interface DinoManifest {
  deployHash: string;
  modules: Array<{
    entry: string;
    hash: string;
    pattern: string;
    routes: DinoRoute[];
    islands: Array<DinoIsland>;
  }>;
  islands: Array<DinoIsland>;
}

export interface DinoBuild {
  modules: Array<DinoSSRBundle>;
  islands: Array<DinoDOMBundle>;
}
