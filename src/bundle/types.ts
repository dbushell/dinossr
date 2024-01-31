import {svelte} from '../../deps.ts';
import Script from './script.ts';
import type * as EsbuildType from 'https://raw.githubusercontent.com/evanw/esbuild/v0.20.0/lib/shared/types.ts';

export type {EsbuildType};

export type Deferred<T> = ReturnType<typeof Promise.withResolvers<T>>;

export type SveltePreprocess =
  | svelte.PreprocessorGroup
  | svelte.PreprocessorGroup[];

export type EsbuildResolve =
  | null
  | void
  | undefined
  | EsbuildType.OnResolveResult
  | Promise<EsbuildResolve>;

export type EsbuildMetafile = Exclude<
  EsbuildType.BuildResult['metafile'],
  undefined
>;

export type BumbleOptions = {
  exports?: boolean | string[];
  generate?: 'dom' | 'ssr';
};

export interface BumbleBundle {
  script: Script;
  metafile: EsbuildType.Metafile;
}

export interface BumbleDOMBundle {
  entry: string;
  hash: string;
  code: string;
  metafile: EsbuildType.Metafile;
}

export interface BumbleSSRBundle<M> {
  entry: string;
  hash: string;
  mod: BumbleModule<M>;
  metafile: EsbuildType.Metafile;
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
