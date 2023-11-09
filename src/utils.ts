import {hex} from './deps.ts';

export const hash = async (value: string, algorithm = 'SHA-256') =>
  new Uint8Array(
    await crypto.subtle.digest(algorithm, new TextEncoder().encode(value))
  );

export const encodeHash = async (value: string, algorithm?: string) =>
  hex.encodeHex(await hash(value, algorithm));
