import {path} from './deps.ts';
import {velocirouter} from './deps.ts';

const templateCache = new Map<string, string>();

// Return the `app.html` template
export const readTemplate = async (dir?: string): Promise<string> => {
  if (!dir) return [...templateCache.values()]?.at(0) ?? '';
  if (templateCache.has(dir)) return templateCache.get(dir)!;
  let template = '';
  try {
    template = await Deno.readTextFile(path.resolve(dir, './app.html'));
  } catch {
    console.warn(`Missing template: ${dir}/app.html`);
  }
  templateCache.set(dir, template);
  return template;
};

// Return true if response should use `app.html`
export const hasTemplate = (resonse: velocirouter.MaybeResponse) => {
  if (!resonse) return false;
  const type = resonse.headers.get('content-type');
  if (!type) return false;
  if (type.startsWith('text/html')) return true;
  if (type.startsWith('text/plain')) return true;
  return false;
};
