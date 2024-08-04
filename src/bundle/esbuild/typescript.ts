import {encodeHash} from '../../utils.ts';
import type * as esbuild from 'esbuild';
import type {PreprocessorGroup, Processed} from 'svelte/compiler';

const processedMap = new Map<string, Promise<Processed>>();

export const typescriptGroup = (
  transform: typeof esbuild.transform
): PreprocessorGroup => {
  return {
    script: async ({content, attributes}) => {
      // Skip non-TypeScript code
      if (attributes.lang !== 'ts') {
        return Promise.resolve({code: content});
      }
      // Check if code is already processed
      const hash = await encodeHash(content);
      if (processedMap.has(hash)) {
        return processedMap.get(hash);
      }
      // Process TypeScript code and return cached promise
      const {promise, resolve} = Promise.withResolvers<Processed>();
      processedMap.set(hash, promise);
      transform(content, {
        loader: 'ts',
        format: 'esm',
        target: 'esnext',
        tsconfigRaw: {
          compilerOptions: {
            target: 'esnext',
            verbatimModuleSyntax: true
          }
        }
      }).then(({code}) => resolve({code}));
      return promise;
    }
  };
};
