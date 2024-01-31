import {svelte} from '../../../deps.ts';
import {encodeHash} from '../../utils.ts';
import type {EsbuildType} from '../types.ts';

const processedMap = new Map<string, Promise<svelte.Processed>>();

export const typescriptGroup = (
  transform: typeof EsbuildType.transform
): svelte.PreprocessorGroup => {
  return {
    script: ({content, attributes}) => {
      // Skip non-TypeScript code
      if (attributes.lang !== 'ts') {
        return Promise.resolve({code: content});
      }
      // Check if code is already processed
      const hash = encodeHash(content);
      if (processedMap.has(hash)) {
        return processedMap.get(hash);
      }
      // Process TypeScript code and return cached promise
      const {promise, resolve} = Promise.withResolvers<svelte.Processed>();
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
