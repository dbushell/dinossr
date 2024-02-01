import {path, existsSync, ensureFileSync} from '../deps.ts';
import {encodeHash} from './utils.ts';
import type {DinoManifest} from './types.ts';

export const manifestDir = path.join(Deno.cwd(), '.dinossr');
export const manifestMeta = path.join(manifestDir, 'manifest.json');
export const manifestImport = path.join(manifestDir, 'manifest.js');

export const getManifest = (deployHash?: string): DinoManifest => {
  // Generate new manifest if new build or not found
  if (Deno.env.has('DINOSSR_BUILD') || !existsSync(manifestMeta)) {
    deployHash = encodeHash(
      // Use specified option
      deployHash ??
        // Use build environment variable
        Deno.env.get('DINOSSR_DEPLOY_ID') ??
        // Use Deno Deploy environment variable
        Deno.env.get('DENO_DEPLOYMENT_ID') ??
        // Use unique per startup
        Date.now().toString()
    );
    // Return empty manifest
    return {deployHash, modules: [], islands: []};
  }
  // Return existing manifest
  return JSON.parse(Deno.readTextFileSync(manifestMeta));
};

export const setManifest = (manifest: DinoManifest) => {
  // Write manifest
  ensureFileSync(manifestMeta);
  Deno.writeTextFileSync(manifestMeta, JSON.stringify(manifest, null, 2));
  // Write importable manifest module
  const code: Array<string> = [
    `const dir = new URL(import.meta.resolve('./'));`,
    `const MODULES = [];`,
    `const ISLANDS = [];`
  ];
  code.push();
  manifest.modules.forEach((mod) => {
    const unbundled = /\.(js|ts)$/.test(mod.entry);
    let from = `./${mod.hash}.js`;
    if (unbundled) {
      from = path.relative(manifestDir, mod.entry);
    }
    code.push(`import * as mod_${mod.hash} from '${from}';`);
    code.push(`MODULES.push({`);
    code.push(`entry: '${mod.entry}',`);
    code.push(`hash: '${mod.hash}',`);
    code.push(`pattern: '${mod.pattern}',`);
    code.push(`mod: mod_${mod.hash},`);
    code.push(`islands: JSON.parse(\`${JSON.stringify(mod.islands)}\`),`);
    code.push(`});`);
  });
  manifest.islands.forEach((dom) => {
    code.push(`ISLANDS.push({`);
    code.push(`entry: '${dom.entry}',`);
    code.push(`hash: '${dom.hash}',`);
    code.push(`pattern: '${dom.pattern}',`);
    code.push(`code: Deno.readTextFileSync(new URL('./${dom.hash}.js', dir)),`);
    code.push(`});`);
  });
  code.push(`export {MODULES, ISLANDS};`);
  Deno.writeTextFileSync(manifestImport, code.join('\n'));
  console.log(`📜 ${manifestImport}`);
};
