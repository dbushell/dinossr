/**
 * Types for `jsr:@ssr/dinossr`.
 *
 * @module
 */
import type {Cookie, Handle, Method, Router} from '../deps.ts';
import type {BumbleDOMBundle, BumbleSSRBundle} from './bundle/types.ts';

/** DinoSsr cookie map */
export type DinoCookies = Map<string, Cookie>;

/** DinoSsr route data for Svelte context */
export type DinoData = Record<string, unknown>;

/** DinoSsr platform context for VelociRouter */
export type DinoPlatform = {
  info: Deno.ServeHandlerInfo;
  cookies: DinoCookies;
  deployHash: string;
  publicData: DinoData;
  serverData: DinoData;
};

/** Init options for DinoSsr class */
export type DinoOptions = {
  dev?: boolean;
  origin?: URL;
  static?: string;
  deployHash?: string;
  manifest?: DinoManifest;
  unhandledRejection?: (error: PromiseRejectionEvent) => void;
  rejectionHandled?: (error: PromiseRejectionEvent) => void;
  serve?: Deno.ServeOptions;
};

/** DinoSsr router handle */
export type DinoHandle = Handle<DinoPlatform>;

/** DinoSsr router */
export type DinoRouter = Router<DinoPlatform>;

/** DinoSsr island client-side bundle */
export type DinoDOMBundle = BumbleDOMBundle & {
  pattern: string;
};

/** DinoSsr route server-side bundle */
export type DinoSSRBundle = BumbleSSRBundle<DinoModule> & {
  pattern: string;
  islands: Array<DinoIsland>;
};

/** DinoSsr route load function */
export type DinoLoad = {
  (
    props: DinoPlatform & {
      fetch: typeof fetch;
      params?: Record<string, string | undefined>;
      request: Request;
    }
  ): Promise<Response | void>;
};

/** DinoSsr route dynamic module */
export type DinoModule = {
  pattern?: string;
  order?: number;
  DELETE?: DinoHandle;
  GET?: DinoHandle;
  PATCH?: DinoHandle;
  POST?: DinoHandle;
  PUT?: DinoHandle;
  load?: DinoLoad;
};

/** DinoSsr rendered route response */
export interface DinoResponse {
  response: ReturnType<DinoHandle>;
  head?: string;
}

/** DinoSsr route render function */
export interface DinoRender {
  (...args: Parameters<DinoHandle>): DinoResponse | Promise<DinoResponse>;
}

/** DinoSsr route */
export interface DinoRoute {
  method: Method;
  pattern: string;
  hash: string;
  render: DinoRender;
  order?: number;
}

/** DinoSsr island for build manifest */
export interface DinoIsland {
  entry: string;
  hash: string;
  pattern: string;
}

/** DinoSsr build manifest */
export interface DinoManifest {
  deployHash: string;
  modules: Array<
    Omit<DinoSSRBundle, 'mod' | 'metafile'> & {
      routes: Array<DinoRoute>;
    }
  >;
  islands: Array<DinoIsland>;
  MODULES: Array<DinoSSRBundle>;
  ISLANDS: Array<DinoDOMBundle>;
}

/** DinoSsr server interface */
export interface DinoServer {
  readonly options: DinoOptions;
  readonly initialized: boolean;
  readonly dev: boolean;
  readonly dir: string;
  readonly deployHash: string;
  readonly origin?: URL;
  readonly manifest: DinoManifest;
  readonly router: DinoRouter;
  readonly server: Deno.HttpServer;
  init(): Promise<void>;
  hash(value: string, salt?: string): string;
}
