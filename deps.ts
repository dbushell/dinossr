export * as path from 'jsr:@std/path@0.221';
export * as cookie from 'jsr:@std/http@0.221/cookie';
export type {Cookie} from 'jsr:@std/http@0.221/cookie';
export {encodeBase64} from 'jsr:@std/encoding@0.221/base64';
export {existsSync, ensureFileSync, ensureDirSync} from 'jsr:@std/fs@0.221';
export {deepMerge} from 'jsr:@std/collections@0.221/deep-merge';
export {serveDir} from 'jsr:@std/http@0.221/file-server';
export {Router as VelociRouter} from 'jsr:@ssr/velocirouter@0.9.0';
export type {
  Handle,
  Method,
  Platform,
  Router
} from 'jsr:@ssr/velocirouter@0.9.0';
export * as svelte from 'npm:svelte@4.2.12/compiler';
export * as acorn from 'npm:acorn@8.11.3';
