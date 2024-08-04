/**
 * Types for `jsr:@ssr/dinossr`.
 *
 * @module
 */
import type {Cookie} from '@std/http/cookie';
import type {Handle, Method, Platform, Router} from '@ssr/velocirouter';
import type {BumbleDOMBundle, BumbleSSRBundle} from './bundle/types.ts';

/** DinoSsr cookie map */
export type DinoCookies = Map<string, Cookie>;

/** DinoSsr custom platform context */
export type DinoData = {publicData: Platform; serverData: Platform};

/** DinoSsr platform context for VelociRouter */
export type DinoPlatform<T extends DinoData = DinoData> = {
  info: Deno.ServeHandlerInfo;
  cookies: DinoCookies;
  deployHash: string;
  publicData: T['publicData'];
  serverData: T['serverData'];
};

/** Init options for DinoSsr class */
export type DinoOptions = {
  dev?: boolean;
  origin?: URL;
  static?: string;
  deployHash?: string;
  unhandledRejection?: (error: PromiseRejectionEvent) => void;
  rejectionHandled?: (error: PromiseRejectionEvent) => void;
  serve?: Deno.ServeOptions;
};

/** DinoSsr router handle */
export type DinoHandle<T extends DinoData = DinoData> = Handle<DinoPlatform<T>>;

/** DinoSsr router */
export type DinoRouter<T extends DinoData = DinoData> = Router<DinoPlatform<T>>;

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
export type DinoLoad<T extends DinoData = DinoData> = {
  (
    props: DinoPlatform<T> & {
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
  islands: Array<DinoIsland>;
  modules: Array<
    Omit<DinoSSRBundle, 'mod' | 'metafile'> & {
      routes: Array<DinoRoute>;
    }
  >;
}

/** DinoSsr server interface */
export interface DinoServer<T extends DinoData = DinoData> {
  readonly options: DinoOptions;
  readonly initialized: boolean;
  readonly dev: boolean;
  readonly dir: string;
  readonly deployHash: string;
  readonly origin?: URL;
  readonly manifest: DinoManifest;
  readonly router: DinoRouter<T>;
  readonly server: Deno.HttpServer;
  init(): Promise<void>;
  hash(value: string, salt?: string): Promise<string>;
}
