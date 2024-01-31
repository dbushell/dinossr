import {path, existsSync, ensureFileSync} from '../deps.ts';
import {encodeHash} from './utils.ts';
import type {DinoManifest} from './types.ts';

export const manifestDir = path.join(Deno.cwd(), '.dinossr');
export const manifestMeta = path.join(manifestDir, 'manifest.json');
export const manifestImport = path.join(manifestDir, 'manifest.js');

export const getManifest = (deployHash?: string): DinoManifest => {
  // Generate new manifest if new build or not found
  if (Deno.env.get('DINOSSR_BUILD') || !existsSync(manifestMeta)) {
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
  const code: string[] = [
    `const dir = new URL(import.meta.resolve('./')).pathname;`,
    `const MODULES = [];`,
    `const ISLANDS = [];`
  ];
  code.push();
  manifest.modules.forEach((mod) => {
    code.push(`import * as mod_${mod.hash} from './${mod.hash}.js';`);
    code.push(`MODULES.push({`);
    code.push(`entry: "${mod.entry}",`);
    code.push(`hash: "${mod.hash}",`);
    code.push(`pattern: "${mod.pattern}",`);
    code.push(`mod: mod_${mod.hash},`);
    code.push(
      `metafile: JSON.parse(Deno.readTextFileSync(\`\${dir}${mod.hash}.json\`)),`
    );
    code.push(`});`);
  });
  manifest.islands.forEach((dom) => {
    code.push(`ISLANDS.push({`);
    code.push(`entry: "${dom.entry}",`);
    code.push(`hash: "${dom.hash}",`);
    code.push(`pattern: "${dom.pattern}",`);
    code.push(`code: Deno.readTextFileSync(\`\${dir}${dom.hash}.js\`),`);
    code.push(
      `metafile: JSON.parse(Deno.readTextFileSync(\`\${dir}${dom.hash}.json\`)),`
    );
    code.push(`});`);
  });
  code.push(`export {MODULES, ISLANDS};`);
  Deno.writeTextFileSync(manifestImport, code.join('\n'));
  console.log(`📜 ${manifestImport}`);
};
