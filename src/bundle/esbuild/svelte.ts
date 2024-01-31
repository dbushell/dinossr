import {svelte} from '../../../deps.ts';
import {path} from '../../../deps.ts';
import {modHash} from '../../utils.ts';
import {findExportValue} from '../mod.ts';
import {tagExtract} from './utils.ts';

const islandMap = new Map<string, string>();

const preTags = ['script', 'svelte:window', 'svelte:document', 'svelte:head'];
const postTags = ['style'];

export const svelteGroup = (dir: string, entry: string, deployHash: string) => {
  // Append _island export to module script
  const islandExport: svelte.PreprocessorGroup = {
    script: (params) => {
      let code = params.content;
      if (
        params.attributes.context !== 'module' ||
        findExportValue(code, 'island') !== true
      ) {
        return {code};
      }
      if (
        params.filename === entry &&
        entry.startsWith(path.join(dir, './routes'))
      ) {
        throw new Error('Top-level routes cannot be islands');
      }
      const hash = modHash(dir, params.filename!, 'dom', deployHash);
      code = `\nexport const _$island = '${hash}';\n${code}`;
      islandMap.set(params.filename!, hash);
      return {code};
    }
  };

  // Append import statement for Island component
  const islandImport: svelte.PreprocessorGroup = {
    script: (params) => {
      let code = params.content;
      if (params.attributes.context) {
        return {code};
      }
      if (islandMap.has(params.filename!)) {
        code = `\nimport DinossrIsland from '@dinossr/island';\n${code}`;
      }
      return {code};
    }
  };

  // Wrap component around markup
  const islandMarkup: svelte.PreprocessorGroup = {
    markup: (params) => {
      let code = params.content;
      const hash = islandMap.get(params.filename!);
      if (!hash) return {code};
      let pre: string[] = [];
      let post: string[] = [];
      ({code, out: pre} = tagExtract(code, preTags));
      ({code, out: post} = tagExtract(code, postTags));
      code =
        pre.join('\n') +
        `\n<DinossrIsland props={$$props} _$island="${hash}">\n${code}\n</DinossrIsland>\n` +
        post.join('\n');
      return {code};
    }
  };

  return [islandExport, islandImport, islandMarkup];
};
