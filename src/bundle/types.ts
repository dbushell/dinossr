import type Script from './script.ts';
import type {Metafile} from 'esbuild';

export type Deferred<T> = ReturnType<typeof Promise.withResolvers<T>>;

export type BumbleOptions = {
  entry: string;
  hash: string;
  generate?: 'dom' | 'ssr';
  exports?: boolean | Array<string>;
};

export interface BumbleBundle {
  script: Script;
  metafile: Metafile;
}

export interface BumbleDOMBundle {
  entry: string;
  hash: string;
  code: string;
  metafile: Metafile;
}

export interface BumbleSSRBundle<M> {
  entry: string;
  hash: string;
  mod: BumbleModule<M>;
  metafile: Metafile;
}

// Partial of `create_ssr_component` return type:
// https://github.com/sveltejs/svelte/blob/master/packages/svelte/src/runtime/internal/ssr.js
export interface BumbleComponent {
  render: (
    props?: Record<string, unknown>,
    options?: {context?: Map<string, unknown>}
  ) => {
    html: string;
    css?: {code: string};
    head?: string;
  };
}

export type BumbleModule<M> = M & {
  default: BumbleComponent | CallableFunction;
};

export type ParseExportMap = Map<string, string>;

export type ParseImportMap = Map<string, Array<{alias: string; local: string}>>;
