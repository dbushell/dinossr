import {bumble, svelte} from '../deps.ts';
import {encodeHash} from '../utils.ts';

const builtin = ['island'];
const builtinURL = new URL('./', import.meta.url);

const islandMap = new Map<string, string>();
const islandImport = /import(.*?)from\s+['"]@dinossr\/island['"]/;

export const sveltePreprocess = (dir: string, deployHash: string) => {
  return (entry: string, options?: bumble.BumbleOptions) => {
    // Remove DOM render import statements from module scripts
    const domGroup: svelte.PreprocessorGroup = {
      script: (params) => {
        const code = params.content;
        if (options?.svelte?.generate !== 'dom') {
          return {code};
        }
        if (params.attributes.context !== 'module') {
          return {code};
        }
        if (entry.startsWith(builtinURL.href)) {
          return {code};
        }
        // Remove all import/export statements
        const script = new bumble.Script(code, entry, dir);
        return {code: script.getCode()};
      }
    };

    // Island preprocessor
    const islandGroup: svelte.PreprocessorGroup = {
      markup: async (params) => {
        let code = params.content;
        // Check for island import statement
        const match = islandImport.exec(code);
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
      },
      script: (params) => {
        let code = params.content;
        const hash = islandMap.get(params.filename!);
        if (!hash) {
          return {code};
        }
        // Append island hash export to module script
        if (params.attributes.context === 'module') {
          code += `\nexport const _island = "${hash}";\n`;
          return {code};
        }
        // Add absolute URL to island import
        code = code.replace(
          /^\s*?import(.*?)from\s+['"](.+?)['"]\s*?;/gm,
          (match, ...args) => {
            if (args[1].startsWith('@dinossr/')) {
              const name = args[1].slice(9);
              if (builtin.includes(name)) {
                const url = new URL(`./${name}.svelte`, builtinURL);
                return `import ${args[0]} from "${url.href}";\n`;
              }
            }
            return match;
          }
        );
        return {code};
      }
    };
    return [domGroup, islandGroup];
  };
};
