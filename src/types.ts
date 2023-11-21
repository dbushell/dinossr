import {bumble, velocirouter} from './deps.ts';

export type Platform = {info: Deno.ServeHandlerInfo; deployHash: string};

export type Handle = velocirouter.Handle<Platform>;

export type Router = velocirouter.Router<Platform>;

export type Bumbler = bumble.Bumbler<RenderModule>;

export interface ServeOptions {
  origin?: URL;
  serve?: Deno.ServeOptions;
  router?: velocirouter.RouterOptions<Platform>;
  bumbler?: bumble.BumbleOptions;
}

export interface RenderModule {
  pattern?: string;
  get?: Handle;
  post?: Handle;
  load?: (
    request: Request,
    {params}: {params?: Record<string, string | undefined>}
  ) => Promise<Record<string, unknown>>;
}

export interface RenderResponse {
  response: ReturnType<Handle>;
  head?: string;
  css?: string;
}

export interface RenderCallback {
  (...args: Parameters<Handle>): RenderResponse | Promise<RenderResponse>;
}

export interface Renderer {
  method: velocirouter.Method;
  pattern: string;
  render: RenderCallback;
}
