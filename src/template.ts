import {path} from '../deps.ts';

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
export const hasTemplate = (request: Request, response: Response) => {
  // Skip static files served by Deno
  const server = response.headers.get('server');
  if (server === 'deno') return false;
  // Check content type
  const type = response.headers.get('content-type');
  if (!type) return false;
  const url = new URL(request.url);
  if (type.startsWith('text/html')) return true;
  if (!url.pathname.endsWith('.txt')) {
    if (type.startsWith('text/plain')) return true;
  }
  return false;
};
