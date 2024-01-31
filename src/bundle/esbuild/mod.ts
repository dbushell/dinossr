import {path, svelte} from '../../../deps.ts';
import Script from '../script.ts';
import {fetchImport} from './fetch.ts';
import {createResolver, svelteResolver} from './resolver.ts';
import {svelteGroup} from './svelte.ts';
import {typescriptGroup} from './typescript.ts';
import {componentName, normalizeMeta} from './utils.ts';
import type {EsbuildType, Deferred} from '../types.ts';

let esbuild: typeof EsbuildType | undefined;

export const esbuildStart = async () => {
  if (esbuild) {
    return esbuild;
  }
  const wasm = Deno.env.has('DENO_REGION');
  esbuild = wasm
    ? await import('https://deno.land/x/esbuild@v0.20.0/wasm.js')
    : await import('https://deno.land/x/esbuild@v0.20.0/mod.js');
  await esbuild.initialize({
    worker: false
  });
  return esbuild;
};

export const esbuildStop = async () => {
  if (esbuild) {
    await esbuild.stop();
  }
};

const deferredMap = new Map<string, Deferred<string>>();
const mtimeMap = new Map<string, number>();

const deferredCode = (
  key: string,
  entry: string | null,
  callback: () => Promise<string>
) => {
  if (entry) {
    const stat = Deno.statSync(entry);
    if (stat.mtime && stat.mtime.getTime() !== mtimeMap.get(key)) {
      mtimeMap.set(key, stat.mtime.getTime());
      deferredMap.delete(key);
    }
  }
  if (!deferredMap.has(key)) {
    const deffered = Promise.withResolvers<string>();
    deferredMap.set(key, deffered);
    callback().then((code) => deffered.resolve(code));
  }
  return deferredMap.get(key)!.promise;
};

export const esbuildBundle = async (
  dir: string,
  entry: string,
  buildHash: string,
  generate: 'dom' | 'ssr' = 'ssr'
) => {
  const esbuild = await esbuildStart();

  // Setup preprocessors
  const group: Array<svelte.PreprocessorGroup> = [
    typescriptGroup(esbuild.transform),
    ...svelteGroup(dir, entry, buildHash)
  ];

  const svelteCompile = async (entry: string, src?: string) => {
    src ??= await Deno.readTextFile(entry);
    const preprocess = await svelte.preprocess(src, [...group], {
      filename: entry
    });
    const opts: svelte.CompileOptions = {
      name: componentName(entry),
      generate,
      hydratable: true,
      immutable: true,
      discloseVersion: false,
      enableSourcemap: false,
      css: 'external'
    };
    const result = svelte.compile(preprocess.code, opts);
    return result;
  };

  const resolver = createResolver(dir);

  const sveltePlugin: EsbuildType.Plugin = {
    name: 'svelte',
    setup(build) {
      build.onResolve({filter: /.*/}, async (args) => {
        let result = await svelteResolver(args);
        if (result) return result;
        result = await resolver(args);
        if (result) return result;
      });
      build.onLoad({filter: /^(file|https):/}, async (args) => {
        const key = `fetch:${args.path}`;
        let loader: EsbuildType.Loader = 'js';
        let contents = await deferredCode(key, null, async () => {
          const response = await fetchImport(args.path);
          if (!response.ok) {
            console.error(`Failed to fetch: "${args.path}"`, response);
            throw new Error();
          }
          return await response.text();
        });
        if (args.path.endsWith('.svelte')) {
          const pathname = new URL(args.path).pathname;
          const key = `compile:${generate}:${pathname}`;
          contents = await deferredCode(key, null, async () => {
            const compile = await svelteCompile(pathname, contents);
            return compile.js.code;
          });
        } else {
          const ext = path.extname(args.path).substring(1);
          if (/^(js|ts|json)$/.test(ext)) {
            loader = ext as EsbuildType.Loader;
          }
        }
        return {
          contents,
          loader
        };
      });
      build.onLoad({filter: /\.svelte$/}, async (args) => {
        const key = `compile:${generate}:${args.path}`;
        return {
          contents: await deferredCode(key, args.path, async () => {
            const compile = await svelteCompile(args.path);
            return compile.js.code;
          })
        };
      });
      build.onLoad({filter: /\.(js|ts|json)$/}, async (args) => {
        const key = `file:${generate}:${args.path}`;
        const ext = path.extname(args.path).substring(1);
        return {
          contents: await deferredCode(key, args.path, () => {
            return Deno.readTextFile(args.path);
          }),
          loader: ext as EsbuildType.Loader
        };
      });
    }
  };

  const esbuildOptions: EsbuildType.BuildOptions = {
    entryPoints: [entry],
    plugins: [sveltePlugin],
    format: 'esm',
    target: 'esnext',
    bundle: true,
    minify: false,
    minifyWhitespace: generate === 'dom',
    minifyIdentifiers: generate === 'dom',
    write: false,
    metafile: true
  };

  const results = await esbuild.build(esbuildOptions);
  const script = new Script(results.outputFiles![0].text);
  const metafile = normalizeMeta(dir, results.metafile!);

  return {script, metafile};
};
