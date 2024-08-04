import {crypto, type DigestAlgorithm} from '@std/crypto';
import {encodeHex} from '@std/encoding';
import {path, encodeBase64} from '../deps.ts';

export const encodeHash = (value: string): Promise<string> =>
  crypto.subtle
    .digest('FNV32A', new TextEncoder().encode(value))
    .then(encodeHex);

export const encodeCrypto = async (
  value: string,
  algorithm?: DigestAlgorithm
): Promise<Uint8Array> =>
  new Uint8Array(
    await crypto.subtle.digest(
      algorithm ?? 'SHA-256',
      new TextEncoder().encode(value)
    )
  );

export const encodeCryptoBase64 = async (
  value: string,
  algorithm?: DigestAlgorithm
) => encodeBase64(await encodeCrypto(value, algorithm));

// Recursively find routes within directory
export const traverse = async (
  dir: string,
  callback: (dir: string, entry: Deno.DirEntry) => unknown,
  depth = 0
) => {
  if (depth >= 10) {
    throw new Error('Exceeded maximum depth for static directory');
  }
  for await (const entry of Deno.readDir(dir)) {
    // Ignore hidden files
    if (['.', '_'].includes(entry.name.at(0)!)) {
      continue;
    }
    if (entry.isDirectory) {
      await traverse(path.join(dir, entry.name), callback, depth + 1);
      continue;
    }
    if (entry.isFile) {
      callback(dir, entry);
    }
  }
};

/**
 * Replace text in a string without special replacement patterns
 * Avoid replacement string patterns in native `String.replace`
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#specifying_a_string_as_the_replacement
 */
export const replace = (
  subject: string,
  search: string,
  replace = '',
  all = false
) => {
  let parts = subject.split(search);
  if (parts.length === 1) {
    return subject;
  }
  if (!all) {
    parts = [parts.shift()!, parts.join(search)];
  }
  return parts.join(replace);
};
