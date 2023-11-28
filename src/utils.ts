import {fs, path, hex, base64} from './deps.ts';

export const hash = async (value: string, algorithm = 'SHA-256') =>
  new Uint8Array(
    await crypto.subtle.digest(algorithm, new TextEncoder().encode(value))
  );

export const encodeHash = async (value: string, algorithm?: string) =>
  hex.encodeHex(await hash(value, algorithm));

export const encodeHash64 = async (value: string, algorithm?: string) =>
  base64.encodeBase64(await hash(value, algorithm));

const deployHashPath = path.join(Deno.cwd(), '.bumble/hash.txt');

export const getDeployHash = async (): Promise<string> => {
  // Check for prebuilt deployment
  let deployHash = '';
  if (!Deno.env.has('DINOSSR_DEPLOY_ID')) {
    if (await fs.exists(deployHashPath)) {
      deployHash = await Deno.readTextFile(deployHashPath);
    }
  }
  // Otherwise generate deploy hash
  if (deployHash.length === 0) {
    deployHash = await encodeHash(
      Deno.env.get('DINOSSR_DEPLOY_ID') ??
        Deno.env.get('DENO_DEPLOYMENT_ID') ??
        Date.now().toString(),
      'SHA-1'
    );
  }
  return deployHash;
};

export const setDeployHash = async (deployHash: string) => {
  await fs.ensureFile(deployHashPath);
  await Deno.writeTextFile(deployHashPath, deployHash);
};
