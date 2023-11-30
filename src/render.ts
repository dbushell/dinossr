import {path, bumble} from './deps.ts';
import {modHash, encodeCryptoBase64} from './utils.ts';
import {readTemplate, hasTemplate} from './template.ts';
import {DinoServer} from '../mod.ts';
import type {DinoHandle, DinoBundle, DinoRoute, DinoRender} from './types.ts';

// Return a route handle that renders with `app.html`
export const createHandle = async (route: DinoRoute): Promise<DinoHandle> => {
  const template = await readTemplate();
  return async (...args) => {
    const render = await route.render(...args);
    let response = await render.response;
    if (!(response instanceof Response)) {
      response = response?.response;
    }
    if (response?.headers.get('content-type')?.startsWith('text/html')) {
      return response;
    }
    if (route.method === 'GET' && hasTemplate(response)) {
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

export const importBundle = (
  entry: string,
  dinossr: DinoServer
): Promise<DinoBundle> => {
  return dinossr.bumbler.bumbleSSR(entry, {
    filterExports: ['default', 'pattern', 'order', 'get', 'post', 'load']
  });
};

// TODO: clean up parameters
export const importModule = async (
  entry: string,
  pattern: string,
  bundle: DinoBundle | null,
  islands: boolean,
  dinossr: DinoServer
): Promise<DinoRoute[]> => {
  if (bundle === null) {
    bundle = await importBundle(entry, dinossr);
  }

  const {mod, metafile} = bundle;

  const modhash = modHash(entry, 'ssr', dinossr);

  // Append pattern to file path
  if (mod?.pattern) {
    if (/^\.\w+$/.test(mod.pattern)) {
      pattern += mod.pattern;
    } else {
      pattern = path.join(pattern, mod.pattern);
    }
  }

  const routes: DinoRoute[] = [];

  const add = (method: DinoRoute['method'], handle: DinoHandle) => {
    const route: DinoRoute = {
      method,
      pattern,
      modhash,
      render: (...args) => ({
        response: handle(...args)
      })
    };
    if (mod.order) {
      route.order = mod.order;
    }
    routes.push(route);
  };

  // Handle Svelte component
  if (typeof (mod?.default as bumble.BumbleComponent)?.render === 'function') {
    const component = mod.default as bumble.BumbleComponent;

    const islandMeta: Array<{hash: string; href: string}> = [];
    const islandEntries: string[] = [];

    if (metafile) {
      for (const [key, input] of Object.entries(metafile.inputs)) {
        const found = input.imports.find(
          (i) => i.original === '@dinossr/island'
        );
        if (!found) continue;
        islandEntries.push(path.join(dinossr.dir, key));
      }
    }

    for (const entry of islandEntries) {
      const domhash = modHash(entry, 'dom', dinossr);
      const href = `/_/immutable/${domhash}.js`;
      islandMeta.push({href, hash: domhash});
      if (dinossr.islandHashes.has(domhash)) {
        continue;
      }
      dinossr.islandHashes.add(domhash);

      if (!islands) break;

      // Add a route for the island script
      const code = await dinossr.bumbler.bumbleDOM(entry, {
        filterExports: ['default']
      });
      routes.push({
        method: 'GET',
        pattern: href,
        modhash: domhash,
        render: () => {
          return {
            response: new Response(code, {
              headers: {'content-type': 'text/javascript; charset=utf-8'}
            })
          };
        }
      });
    }

    const render: DinoRender = async (request, _response, {match}) => {
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
const islands = new WeakSet();
const islandIds = new Set();
class DinossrIsland extends HTMLElement {
  constructor() {
    super();
  }
  async connectedCallback() {
    const context = new Map();
    context.set('url', new URL('${url.pathname}', window.location.href));
    context.set('pattern', '${pattern}');
    context.set('params', ${JSON.stringify(params)});
    context.set('data', ${JSON.stringify(data)});
    context.set('browser', true);
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
        const scriptHash = await encodeCryptoBase64(script, 'SHA-256');
        headers.append('x-script-src', `'sha256-${scriptHash}'`);
        render.head += `\n`;
        islandMeta.forEach(({href}) => {
          render.head += `<link rel="modulepreload" href="${href}">\n`;
        });
        render.html += `\n<script defer type="module" data-hash="${scriptHash}">${script}</script>\n`;
      }
      const styleHash = await encodeCryptoBase64(style, 'SHA-256');
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

    routes.push({
      method: 'GET',
      pattern,
      modhash,
      render
    });

    // Allow additional GET handle
    if (typeof mod.get === 'function') {
      add('GET', mod.get as DinoHandle);
    }
  }

  // Use default function as GET handle
  else if (typeof mod.default === 'function') {
    add('GET', mod.default as DinoHandle);
  }

  // Look for named GET handle
  else if (typeof mod.get === 'function') {
    add('GET', mod.get as DinoHandle);
  }

  // Support POST handle
  if (typeof mod.post === 'function') {
    add('POST', mod.post as DinoHandle);
  }

  return routes;
};
