import {path, existsSync, ensureFileSync} from './deps.ts';
import {encodeHash} from './utils.ts';
import type {DinoManifest} from './types.ts';

const manifestPath = path.join(Deno.cwd(), '.bumble/manifest.json');

export const getManifest = (deployHash?: string): DinoManifest => {
  // Generate new manifest if new build or not found
  if (Deno.env.get('DINOSSR_BUILD') || !existsSync(manifestPath)) {
    deployHash = encodeHash(
      deployHash ??
        Deno.env.get('DINOSSR_DEPLOY_ID') ??
        Deno.env.get('DENO_DEPLOYMENT_ID') ??
        Date.now().toString()
    );
    return {deployHash, modules: [], islands: []};
  }
  return JSON.parse(Deno.readTextFileSync(manifestPath));
};

export const setManifest = (manifest: DinoManifest) => {
  // Write manifest
  ensureFileSync(manifestPath);
  Deno.writeTextFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  // Write importable manifest module
  const manifestModule = manifestPath.replace('.json', '.js');
  const code: string[] = [
    `const dir = new URL(import.meta.resolve('./')).pathname;`,
    `const modules = [];`,
    `const islands = [];`
  ];
  code.push();
  manifest.modules.forEach((mod) => {
    code.push(`import * as mod_${mod.hash} from './${mod.hash}.js';`);
    code.push(`modules.push({`);
    code.push(`mod: mod_${mod.hash},`);
    code.push(`metafile: JSON.parse(Deno.readTextFileSync(\`\${dir}${mod.hash}.json\`)),`);
    code.push(`manifest: ${JSON.stringify(mod)},`);
    code.push(`});`);
  });
  manifest.islands.forEach((island) => {
    code.push(`islands.push({`);
    code.push(`code: Deno.readTextFileSync(\`\${dir}${island.hash}.js\`),`);
    code.push(`manifest: ${JSON.stringify(island)},`);
    code.push(`});`);
  });
  code.push(`export {modules, islands};`);
  Deno.writeTextFileSync(manifestModule, code.join('\n'));
};
