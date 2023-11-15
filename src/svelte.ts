import {path, svelte} from './deps.ts';
import {encodeHash} from './utils.ts';

const builtin = ['island'];
const builtinDir = new URL('./svelte', import.meta.url).pathname;

const islandMap = new Map<string, string>();
const islandImport = /^\s*?import(.*?)from\s+['"]@dinossr\/island['"]/m;

export const sveltePreprocessor = (deployHash: string) => {
  // Island preprocessor
  const islandGroup: svelte.PreprocessorGroup = {
    markup: async (params) => {
      let code = params.content;
      const match = islandImport.exec(code);
      if (!match) {
        return {code};
      }
      const tag = new RegExp(`<(${match[1].trim()})([^/>]*?)>`, 'g');
      if (!tag.test(code)) {
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
      // Append island hash export to module script
      if (hash && params.attributes.context === 'module') {
        code += `\nexport const _island = "${hash}";\n`;
      } else {
        code = code.replace(
          /^\s*?import(.*?)from\s+['"](.+?)['"]\s*?;/gm,
          (match, ...args) => {
            if (args[1].startsWith('@dinossr/')) {
              const name = args[1].slice(9);
              if (builtin.includes(name)) {
                args[1] = path.resolve(builtinDir, name) + '.svelte';
                return `import ${args[0]} from "${args[1]}";\n`;
              }
            }
            return match;
          }
        );
      }
      return {code};
    }
  };
  return [islandGroup];
};
