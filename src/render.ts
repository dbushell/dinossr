import {path, bumble} from './deps.ts';
import {encodeHash, encodeHash64} from './utils.ts';
import {readTemplate, hasTemplate} from './template.ts';
import type {Bumbler, Handle, Renderer, RenderCallback} from './types.ts';

// Return a route handle that renders with `app.html`
export const createHandle = async (renderer: Renderer): Promise<Handle> => {
  const template = await readTemplate();
  return async (...args) => {
    const render = await renderer.render(...args);
    let response = await render.response;
    if (renderer.method === 'GET' && hasTemplate(response)) {
      response = response as Response;
      let body = await response.text();
      body = template.replace('%BODY%', `<div data-root>${body}</div>`);
      body = body.replace('%HEAD%', render.head || '');
      response = new Response(body, response);
      response.headers.set('content-type', 'text/html; charset=utf-8');
    }
    return response;
  };
};

export const importModule = async (
  abspath: string,
  pattern: string,
  bumbler: Bumbler
): Promise<Renderer[]> => {
  const {manifest, mod} = await bumbler.bumbleSSR(abspath, {
    filterExports: ['default', 'pattern', 'get', 'post', 'load']
  });

  // Append pattern to file path
  if (mod.pattern) {
    if (/^\.\w+$/.test(mod.pattern)) {
      pattern += mod.pattern;
    } else {
      pattern = path.join(pattern, mod.pattern);
    }
  }

  const renderers: Renderer[] = [];

  const add = (method: Renderer['method'], handle: Handle) => {
    const render: RenderCallback = (...args) => ({
      response: handle(...args)
    });
    renderers.push({
      pattern,
      method,
      render
    });
  };

  // Support POST handle
  if (typeof mod.post === 'function') {
    add('POST', mod.post as Handle);
  }

  // Use default function as GET handle
  if (typeof mod.default === 'function') {
    add('GET', mod.default as Handle);
  }
  // Look for named GET handle
  else if (typeof mod.get === 'function') {
    add('GET', mod.get as Handle);
  }
  // Handle Svelte component export
  else if (typeof mod?.default?.render === 'function') {
    const component = mod.default as bumble.BumbleComponent;

    const islandMeta: Array<{hash: string; href: string}> = [];

    const islandEntries: string[] = [];
    for (const [entry, dep] of manifest.dependencies) {
      if (dep.exports.includes('_island')) {
        islandEntries.push(entry);
      }
    }

    for (const entry of islandEntries) {
      const hash = await encodeHash(
        (await bumbler.deployHash) + entry,
        'SHA-1'
      );
      const href = `/_/immutable/${hash}.js`;
      islandMeta.push({hash, href});
      const code = await bumbler.bumbleDOM(entry, {
        filterExports: ['default']
      });
      renderers.push({
        method: 'GET',
        pattern: href,
        render: () => {
          return {
            response: new Response(code, {
              headers: {'content-type': 'text/javascript; charset=utf-8'}
            })
          };
        }
      });
    }
    const render: RenderCallback = async (request, _response, {match}) => {
      // Setup context and props
      const url = new URL(request.url);
      const params = match?.pathname?.groups;
      const data = mod.load ? await mod.load(request, {params}) : {};
      const context = new Map<string, unknown>();
      context.set('url', url);
      context.set('pattern', pattern);
      context.set('params', params);
      context.set('data', data);
      const render = component.render(Object.fromEntries(context), {context});
      const headers = new Headers();
      render.head += `\n`;
      let style = `
[data-root] {
  display: contents;
}
`;
      if (islandMeta.length) {
        style += `
[data-island] {
  display: contents;
}
`;
        const script = `
const context = new Map();
context.set('url', new URL('${url.pathname}', window.location.href));
context.set('pattern', '${pattern}');
context.set('params', ${JSON.stringify(params)});
context.set('data', ${JSON.stringify(data)});
context.set('browser', true);
const props = Object.fromEntries(context);
const islands = Array.from(document.querySelectorAll('[data-island]'));
islands.forEach(async (isle) => {
  if (isle.parentNode.closest('[data-island]')) {
    return;
  }
  try {
    const mod = await import(\`/_/immutable/\${isle.dataset.island}.js\`);
    const target = document.createDocumentFragment();
    const div = document.createElement('div');
    isle.replaceWith(div);
    target.appendChild(isle);
    new mod.default({context, props, target, hydrate: true});
    div.replaceWith(target);
  } catch (err) {
    console.log(err);
  }
});
`;
        const importMap = `
{
  "imports": {
    "svelte": "https://cdn.skypack.dev/svelte@4.2.3",
    "svelte/internal": "https://cdn.skypack.dev/svelte@4.2.3/internal"
  }
}
`;
        const importHash = await encodeHash64(importMap, 'SHA-256');
        const scriptHash = await encodeHash64(script, 'SHA-256');
        headers.append('x-script-src', `sha256-${importHash}`);
        headers.append('x-script-src', `sha256-${scriptHash}`);
        render.head += `<script type="importmap" data-hash="${importHash}">${importMap}</script>\n`;
        islandMeta.forEach(({href}) => {
          render.head += `<link rel="modulepreload" href="${href}">\n`;
        });
        render.head += `<script defer type="module" data-hash="${scriptHash}">${script}</script>\n`;
      }
      const styleHash = await encodeHash64(style, 'SHA-256');
      headers.append('x-style-src', `sha256-${styleHash}`);
      render.head += `<style data-hash="${styleHash}">${style}</style>\n`;
      headers.set('content-type', 'text/html; charset=utf-8');
      const response = new Response(render.html, {
        headers
      });
      return {
        response,
        head: render.head,
        css: render.css?.code
      };
    };
    renderers.push({
      method: 'GET',
      pattern,
      render
    });
  }

  return renderers;
};
