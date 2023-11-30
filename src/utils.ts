import {path, base64, MurmurHash3} from './deps.ts';
import {DinoServer} from './mod.ts';

export const encodeHash = (value: string) =>
  new MurmurHash3(value).result().toString(16);

export const encodeCrypto = async (value: string, algorithm = 'SHA-256') =>
  new Uint8Array(
    await crypto.subtle.digest(algorithm, new TextEncoder().encode(value))
  );

export const encodeCryptoBase64 = async (value: string, algorithm?: string) =>
  base64.encodeBase64(await encodeCrypto(value, algorithm));

export const modHash = (entry: string, suffix: string, dinossr: DinoServer) => {
  const rel = path.relative(dinossr.dir, entry) + '-' + suffix;
  return encodeHash(rel + dinossr.deployHash);
};
