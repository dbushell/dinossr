import * as path from '@std/path';
import {findExportValue} from '../mod.ts';
import {tagExtract} from './utils.ts';
import type {DinoSsr} from '../../mod.ts';
import type {PreprocessorGroup} from 'svelte/compiler';

const islandMap = new Map<string, string>();

const preTags = ['script', 'svelte:window', 'svelte:document', 'svelte:head'];
const postTags = ['style'];

export const svelteGroup = (server: DinoSsr, entry: string) => {
  // Append _island export to module script
  const islandExport: PreprocessorGroup = {
    script: async (params) => {
      let code = params.content;
      if (
        params.attributes.context !== 'module' ||
        (await findExportValue(code, 'island')) !== true
      ) {
        return {code};
      }
      if (
        params.filename === entry &&
        entry.startsWith(path.join(server.dir, './routes'))
      ) {
        throw new Error('Top-level routes cannot be islands');
      }
      const hash = await server.hash(params.filename!, 'dom');
      code = `\nexport const _$island = '${hash}';\n${code}`;
      islandMap.set(params.filename!, hash);
      return {code};
    }
  };

  // Append import statement for Island component
  const islandImport: PreprocessorGroup = {
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
  const islandMarkup: PreprocessorGroup = {
    markup: (params) => {
      let code = params.content;
      const hash = islandMap.get(params.filename!);
      if (!hash) return {code};
      let pre: Array<string> = [];
      let post: Array<string> = [];
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
