import {bumble, velocirouter} from './deps.ts';

export type Handle = velocirouter.Handle<Deno.ServeHandlerInfo>;

export type Router = velocirouter.Router<Deno.ServeHandlerInfo>;

export type Bumbler = bumble.Bumbler<RenderModule>;

export interface ServeOptions {
  serve?: Deno.ServeOptions;
  router?: velocirouter.RouterOptions<Deno.ServeHandlerInfo>;
  bumbler?: bumble.BumbleOptions;
}

export interface RenderModule {
  pattern?: string;
  csr?: boolean;
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

export interface Renderer {
  method: velocirouter.Method;
  pattern: string;
  render: (
    ...args: Parameters<Handle>
  ) => RenderResponse | Promise<RenderResponse>;
}
