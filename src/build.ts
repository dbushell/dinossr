// This file will overwrite itself building for Deno Deploy
if (Deno.env.get('DINOSSR_BUILD') === 'DENO_DEPLOY') {
  const path = new URL(import.meta.url).pathname;
  const script = `export * from '/src/.bumble/manifest.js';`;
  Deno.writeTextFileSync(path, script);
}

import {path, existsSync} from './deps.ts';

let modules = [];
let islands = [];

const manifestPath = path.join(Deno.cwd(), '.bumble/manifest.js');
if (existsSync(manifestPath)) {
  ({modules, islands} = await import(manifestPath));
}

export {modules, islands};
