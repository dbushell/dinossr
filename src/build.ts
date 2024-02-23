import {existsSync} from '../deps.ts';
import {manifestImport} from './manifest.ts';
import type {DinoBuild} from './types.ts';

let MODULES: DinoBuild['modules'] = [];
let ISLANDS: DinoBuild['islands'] = [];

// Check Deno Deploy build location
if (existsSync('/src/.dinossr/manifest.js')) {
  const manifestPath = 'file:///src/.dinossr/manifest.js';
  ({MODULES, ISLANDS} = await import(manifestPath));
} else if (!Deno.env.has('DENO_REGION')) {
  if (existsSync(manifestImport)) {
    const importPath = `file://${manifestImport}`;
    ({MODULES, ISLANDS} = await import(importPath));
  }
}

export {MODULES, ISLANDS};
