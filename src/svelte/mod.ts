import {path, bumble} from '../deps.ts';
import {DinoServer} from '../mod.ts';
import {modHash} from '../utils.ts';

const url = new URL('./', import.meta.url);

const islandMap = new Map<string, string>();
const islandMatch = /import(.*?)from\s+['"]@dinossr\/island['"]/;

type Resolver = bumble.BumbleBundleOptions['esbuildResolve'];
type Preprocessor = bumble.BumbleBundleOptions['sveltePreprocess'];

export const esbuildResolve: Resolver = (args) => {
  // Resolve DinoSsr built-in components
  if (args.path.startsWith('@dinossr/')) {
    return {
      path: new URL(`./${args.path.slice(9)}.svelte`, url).href,
      namespace: 'fetch'
    };
  }
};

export const sveltePreprocess = (dinossr: DinoServer) => {
  return (entry: string, options: bumble.BumbleBundleOptions) => {
    const islandDom: Preprocessor = {
      script: (params) => {
        const code = params.content;
        // Ignore server-side render
        if (options.svelteCompile?.generate !== 'dom') {
          return {code};
        }
        // Ignore built-in components
        if (params.filename!.startsWith(url.pathname)) {
          return {code};
        }
        if (
          params.filename === entry &&
          entry.startsWith(path.join(dinossr.dir, './routes'))
        ) {
          throw new Error('Top-level routes cannot be islands');
        }
        return {code};
      }
    };

    // Island preprocessor
    const islandImport: Preprocessor = {
      markup: (params) => {
        let code = params.content;
        // Check for island import statement
        const match = islandMatch.exec(code);
        if (!match) {
          return {code};
        }
        // Get import name and check for usage
        const name = match[1].trim();
        const tag = new RegExp(`<(${name})([^/>]*?)>`, 'g');
        if (!tag.test(code)) {
          return {code};
        }
        // Avoid false positives?
        const tags = /<([^>]+)(\s[^>]+)?>(.*?)<\/\1>/gs;
        const matches = [...code.matchAll(tags)];
        if (!matches.find((m) => m[1] === name)) {
          return {code};
        }
        // Add island hash prop to component
        const hash = modHash(params.filename!, 'dom', dinossr);
        code = params.content.replace(tag, `<$1 $2 _island="${hash}">`);
        islandMap.set(params.filename!, hash);
        // Look for module script
        let context = false;
        const scripts = code.matchAll(/<script(\b[^>]*)>(.*?)<\/script>/gis);
        for (const match of scripts) {
          if (/context=(["'])module\1/.test(match[1])) {
            context = true;
            break;
          }
        }
        // Add empty module script if missing
        if (!context) {
          code = '<script context="module"></script>\n' + code;
        }
        return {code};
      }
    };

    const islandId: Preprocessor = {
      script: (params) => {
        let code = params.content;
        // Append island hash export to module script
        const hash = islandMap.get(params.filename!);
        if (hash && params.attributes.context === 'module') {
          code += `\nexport const _island = "${hash}";\n`;
        }
        return {code};
      }
    };
    return [islandDom, islandImport, islandId];
  };
};
