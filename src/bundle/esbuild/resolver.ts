import {path, svelte} from '../../../deps.ts';
import type {EsbuildType, EsbuildResolve} from '../types.ts';

type Resolver = (args: EsbuildType.OnResolveArgs) => EsbuildResolve;

const url = new URL('../svelte/', import.meta.url);

export const svelteResolver: Resolver = (args) => {
  // Resolve built-in components
  if (args.path.startsWith('@dinossr/')) {
    return {
      path: new URL(`./${args.path.slice(9)}.svelte`, url).href,
      namespace: 'fetch'
    };
  }
};

export const createResolver = (dir: string): Resolver => {
  return (args) => {
    // Fetch remote dependencies
    if (/^(file|https):/.test(args.path)) {
      return {
        path: args.path,
        namespace: 'fetch'
      };
    }
    // Fetch external Svelte dependencies
    if (args.path.startsWith('svelte')) {
      const href = `https://esm.sh/${args.path.replace(
        'svelte',
        `svelte@${svelte.VERSION}`
      )}?target=esnext`;
      return {
        path: href,
        namespace: 'fetch'
      };
    }
    if (args.namespace === 'fetch') {
      return {
        path: new URL(args.path, args.importer).href,
        namespace: 'fetch'
      };
    }
    if (args.path.startsWith('@')) {
      return {path: path.resolve(dir, args.path.slice(1))};
    }
    if (args.path.startsWith('/')) {
      return {path: args.path};
    }
    if (args.path.startsWith('.')) {
      return {path: path.resolve(args.resolveDir, args.path)};
    }
    return {path: path.join(dir, args.path)};
  };
};
