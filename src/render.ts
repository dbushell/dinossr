import {path, bumble} from './deps.ts';
import {encodeHash, encodeHash64} from './utils.ts';
import {readTemplate, hasTemplate} from './template.ts';
import type {Bumbler, Handle, Renderer, RenderCallback} from './types.ts';

const islandHashes = new Set<string>();

// Return a route handle that renders with `app.html`
export const createHandle = async (renderer: Renderer): Promise<Handle> => {
  const template = await readTemplate();
  return async (...args) => {
    const render = await renderer.render(...args);
    let response = await render.response;
    if (!(response instanceof Response)) {
      response = response?.response;
    }
    if (response?.headers.get('content-type')?.startsWith('text/html')) {
      return response;
    }
    if (renderer.method === 'GET' && hasTemplate(response)) {
      response = response as Response;
      let body = await response.text();
      if (!template) {
        if (/<([^>]+)(\s[^>]+)?>(.*?)<\/\1>/.test(body)) {
          response.headers.set('content-type', 'text/html; charset=utf-8');
        }
        return response;
      }
      body = template.replace('%BODY%', `<dinossr-root>${body}</dinossr-root>`);
      body = body.replace('%HEAD%', render.head || '');
      response = new Response(body, response);
      response.headers.set('content-type', 'text/html; charset=utf-8');
    }
    return response;
  };
};

export const importModule = async (
  entry: string,
  pattern: string,
  bumbler: Bumbler
): Promise<Renderer[]> => {
  const {manifest, mod} = await bumbler.bumbleSSR(entry, {
    filterExports: ['default', 'pattern', 'order', 'get', 'post', 'load']
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
      order: mod.order ?? 0,
      pattern,
      method,
      render
    });
  };

  // Handle Svelte component
  if (typeof (mod?.default as bumble.BumbleComponent)?.render === 'function') {
    const component = mod.default as bumble.BumbleComponent;

    const islandMeta: Array<{hash: string; href: string}> = [];

    const islandEntries: string[] = [];
    for (const [entry, dep] of manifest.dependencies) {
      if (dep.exports.includes('_island')) {
        islandEntries.push(entry);
      }
    }

    for (const entry of islandEntries) {
      const hash = await encodeHash(bumbler.deployHash + entry, 'SHA-1');
      const href = `/_/immutable/${hash}.js`;
      islandMeta.push({hash, href});
      if (islandHashes.has(hash)) {
        continue;
      }
      islandHashes.add(hash);
      // Add a route for the island script
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
      const render = component.render({}, {context});
      const headers = new Headers();
      let style = `
dinossr-root {
  display: contents;
}
`;
      if (islandMeta.length) {
        style += `
dinossr-island {
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
const islands = new WeakSet();
const islandIds = new Set();
class DinossrIsland extends HTMLElement {
  constructor() {
    super();
  }
  async connectedCallback() {
    const uuid = this.dataset.uuid;
    if (islands.has(this) || islandIds.has(uuid)) return;
    islands.add(this);
    islandIds.add(uuid);
    if (this.parentNode.closest('dinossr-island')) return;
    const [hash, id] = uuid.split(':');
    const json = document.head.querySelector(\`[data-uuid="\${uuid}"][type*="/json"]\`);
    const props = json ? JSON.parse(json.textContent) : {};
    context.set('_islandId', id);
    const mod = await import(\`/_/immutable/\${hash}.js\`);
    const target = document.createDocumentFragment();
    const div = document.createElement('div');
    this.replaceWith(div);
    target.appendChild(this);
    new mod.default({context, props, target, hydrate: true});
    div.replaceWith(target);
  }
}
customElements.define('dinossr-island', DinossrIsland);
`;
        const scriptHash = await encodeHash64(script, 'SHA-256');
        headers.append('x-script-src', `'sha256-${scriptHash}'`);
        render.head += `\n`;
        islandMeta.forEach(({href}) => {
          render.head += `<link rel="modulepreload" href="${href}">\n`;
        });
        render.html += `\n<script defer type="module" data-hash="${scriptHash}">${script}</script>\n`;
      }
      const styleHash = await encodeHash64(style, 'SHA-256');
      headers.append('x-style-src', `'sha256-${styleHash}'`);
      render.head += `<style data-hash="${styleHash}">${style}</style>\n`;
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

    // Allow additional GET handle
    if (typeof mod.get === 'function') {
      add('GET', mod.get as Handle);
    }
  }

  // Use default function as GET handle
  else if (typeof mod.default === 'function') {
    add('GET', mod.default as Handle);
  }

  // Look for named GET handle
  else if (typeof mod.get === 'function') {
    add('GET', mod.get as Handle);
  }

  // Support POST handle
  if (typeof mod.post === 'function') {
    add('POST', mod.post as Handle);
  }

  return renderers;
};
