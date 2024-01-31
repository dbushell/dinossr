import {existsSync} from '../deps.ts';
import {manifestImport} from './manifest.ts';
import type {DinoBuild} from './types.ts';

let MODULES: DinoBuild['modules'] = [];
let ISLANDS: DinoBuild['islands'] = [];

// Check Deno Deploy build location
if (existsSync('/src/.dinossr/manifest.js')) {
  ({MODULES, ISLANDS} = await import('file:///src/.dinossr/manifest.js'));
} else if (!Deno.env.has('DENO_REGION')) {
  if (existsSync(manifestImport)) {
    ({MODULES, ISLANDS} = await import(`file://${manifestImport}`));
  }
}

export {MODULES, ISLANDS};
