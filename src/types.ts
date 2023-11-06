import {bumble, velocirouter} from './deps.ts';

export type VHandle = velocirouter.Handle<Deno.ServeHandlerInfo>;

export type VRouter = velocirouter.Router<Deno.ServeHandlerInfo>;

export interface ServeOptions {
  serve?: Deno.ServeOptions;
  router?: velocirouter.RouterOptions<Deno.ServeHandlerInfo>;
  bumble?: bumble.BumbleOptions;
}

export interface RenderModule {
  pattern?: string;
  csr?: boolean;
  get?: VHandle;
  post?: VHandle;
  load?: (
    request: Request,
    {params}: {params?: Record<string, string | undefined>}
  ) => Promise<Record<string, unknown>>;
}

export interface RenderResponse {
  response: ReturnType<VHandle>;
  head?: string;
  css?: string;
}

export interface RenderHandler {
  method: velocirouter.Method;
  pattern: string;
  render: (
    ...args: Parameters<VHandle>
  ) => RenderResponse | Promise<RenderResponse>;
}
