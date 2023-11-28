import {fs, path, base64, MurmurHash3} from './deps.ts';

export const encodeHash = (value: string) =>
  new MurmurHash3(value).result().toString(16);

export const encodeCrypto = async (value: string, algorithm = 'SHA-256') =>
  new Uint8Array(
    await crypto.subtle.digest(algorithm, new TextEncoder().encode(value))
  );

export const encodeCryptoBase64 = async (value: string, algorithm?: string) =>
  base64.encodeBase64(await encodeCrypto(value, algorithm));

const deployHashPath = path.join(Deno.cwd(), '.bumble/hash.txt');

export const getDeployHash = (): string => {
  // Check for prebuilt deployment
  let deployHash = '';
  if (!Deno.env.has('DINOSSR_DEPLOY_ID')) {
    if (fs.existsSync(deployHashPath)) {
      deployHash = Deno.readTextFileSync(deployHashPath);
    }
  }
  // Otherwise generate deploy hash
  if (deployHash.length === 0) {
    deployHash = encodeHash(
      Deno.env.get('DINOSSR_DEPLOY_ID') ??
        Deno.env.get('DENO_DEPLOYMENT_ID') ??
        Date.now().toString()
    );
  }
  return deployHash;
};

export const setDeployHash = (deployHash: string) => {
  fs.ensureFileSync(deployHashPath);
  Deno.writeTextFileSync(deployHashPath, deployHash);
};
