import {bumble, svelte} from '../deps.ts';
import {encodeHash} from '../utils.ts';

const url = new URL('./', import.meta.url);

const islandMap = new Map<string, string>();
const islandMatch = /import(.*?)from\s+['"]@dinossr\/island['"]/;

export const esbuildResolve: bumble.BumbleOptions['esbuildResolve'] = (
  args
) => {
  // Resolve DinoSsr built-in components
  if (args.path.startsWith('@dinossr/')) {
    return {
      path: new URL(`./${args.path.slice(9)}.svelte`, url).href,
      namespace: 'fetch'
    };
  }
};

export const sveltePreprocess = (dir: string, deployHash: string) => {
  return (entry: string, options?: bumble.BumbleOptions) => {
    // Remove DOM render import statements from module scripts
    const islandDom: svelte.PreprocessorGroup = {
      script: (params) => {
        let code = params.content;
        if (options?.svelteCompile?.generate !== 'dom') {
          return {code};
        }
        if (params.attributes.context !== 'module') {
          return {code};
        }
        if (params.filename!.startsWith(url.pathname)) {
          return {code};
        }
        // Remove all import/export statements
        const script = new bumble.Script(code, entry, dir);
        code = script.getCode({
          exports: true,
          filterExports: options.filterExports
        });
        return {code};
      }
    };

    // Island preprocessor
    const islandImport: svelte.PreprocessorGroup = {
      markup: async (params) => {
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
        const hash = await encodeHash(deployHash + params.filename, 'SHA-1');
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

    const islandId: svelte.PreprocessorGroup = {
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
