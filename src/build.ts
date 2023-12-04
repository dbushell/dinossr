import {existsSync} from './deps.ts';
import {manifestImport} from './manifest.ts';
import type {DinoBuild} from './types.ts';

let MODULES: DinoBuild['modules'] = [];
let ISLANDS: DinoBuild['islands'] = [];

// Check Deno Deploy build location
const buildpath = 'file:///src/.dinossr/manifest.js';
if (existsSync(buildpath)) {
  ({MODULES, ISLANDS} = await import(buildpath));
} else if (!Deno.env.has('DENO_REGION')) {
  if (existsSync(manifestImport)) {
    ({MODULES, ISLANDS} = await import(`file://${manifestImport}`));
  }
}

export {MODULES, ISLANDS};
