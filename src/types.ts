import {cookie, velocirouter} from '../deps.ts';
import type {BumbleDOMBundle, BumbleSSRBundle} from './bundle/types.ts';

export type * from './bundle/types.ts';

export type DinoCookies = Map<string, cookie.Cookie>;

export type DinoData = Record<string, unknown>;

export type DinoPlatform = {
  info: Deno.ServeHandlerInfo;
  cookies: DinoCookies;
  deployHash: string;
  publicData: DinoData;
  serverData: DinoData;
};

export type DinoOptions = {
  dev?: boolean;
  origin?: URL;
  deployHash?: string;
  unhandledRejection?: (error: PromiseRejectionEvent) => void;
  rejectionHandled?: (error: PromiseRejectionEvent) => void;
  serve?: Deno.ServeOptions;
};

export type DinoHandle = velocirouter.Handle<DinoPlatform>;

export type DinoRouter = velocirouter.Router<DinoPlatform>;

export type DinoDOMBundle = BumbleDOMBundle & {
  pattern: string;
};

export type DinoSSRBundle = BumbleSSRBundle<DinoModule> & {
  pattern: string;
};

export type DinoModule = {
  pattern?: string;
  order?: number;
  get?: DinoHandle;
  post?: DinoHandle;
  load?: (
    props: Partial<DinoPlatform> & {
      request: Request;
      fetch: typeof fetch;
      params?: Record<string, string | undefined>;
    }
  ) => Promise<Response | Record<string, unknown>>;
};

export interface DinoResponse {
  response: ReturnType<DinoHandle>;
  head?: string;
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
