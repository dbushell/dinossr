import {path, base64, MurmurHash3, existsSync, ensureFileSync} from './deps.ts';
import type {DinoManifest} from './types.ts';

export const encodeHash = (value: string) =>
  new MurmurHash3(value).result().toString(16);

export const encodeCrypto = async (value: string, algorithm = 'SHA-256') =>
  new Uint8Array(
    await crypto.subtle.digest(algorithm, new TextEncoder().encode(value))
  );

export const encodeCryptoBase64 = async (value: string, algorithm?: string) =>
  base64.encodeBase64(await encodeCrypto(value, algorithm));

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
    return {deployHash, routes: []};
  }
  return JSON.parse(Deno.readTextFileSync(manifestPath));
};

export const setManifest = (manifest: DinoManifest) => {
  // Render function is automatically ommitted by serialization
  ensureFileSync(manifestPath);
  Deno.writeTextFileSync(manifestPath, JSON.stringify(manifest, null, 2));
};
