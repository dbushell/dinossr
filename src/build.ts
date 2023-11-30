// Deno Deploy does not support dynamic imports
// This file will overwrite itself with a direct import
// Only when building for Deno Deploy
if (Deno.env.get('DINOSSR_BUILD') === 'DENO_DEPLOY') {
  const path = new URL(import.meta.url).pathname;
  const script = `export * from '/src/.bumble/manifest.js';`;
  Deno.writeTextFileSync(path, script);
}

import {existsSync} from './deps.ts';
import {manifestImport} from './manifest.ts';
import type {DinoBuild} from './types.ts';

let modules: DinoBuild['modules'] = [];
let islands: DinoBuild['islands'] = [];

if (existsSync(manifestImport)) {
  ({modules, islands} = await import(manifestImport));
}

export {modules, islands};
