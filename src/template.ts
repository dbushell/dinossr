import {path} from './deps.ts';
import {velocirouter} from './deps.ts';

// Return the `app.html` template
export const readTemplate = async (dir: string): Promise<string> => {
  let template = '';
  try {
    template = await Deno.readTextFile(path.resolve(dir, './app.html'));
  } catch {
    console.warn(`Missing template: ${dir}/app.html`);
  }
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
