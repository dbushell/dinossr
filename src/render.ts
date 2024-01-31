import {path} from '../deps.ts';
import {replace, modHash, encodeCryptoBase64} from './utils.ts';
import {readTemplate, hasTemplate} from './template.ts';
import {serverFetch} from './fetch.ts';
import {DinoServer} from '../mod.ts';
import type {
  BumbleComponent,
  DinoHandle,
  DinoRoute,
  DinoRender,
  DinoIsland,
  DinoSSRBundle
} from './types.ts';

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
    if (route.method === 'GET' && hasTemplate(args[0], response)) {
      response = response as Response;
      const html = await response.text();
      if (!template) {
        if (/<([^>]+)(\s[^>]+)?>(.*?)<\/\1>/.test(html)) {
          response.headers.set('content-type', 'text/html; charset=utf-8');
        }
        return response;
      }
      let body = replace(template, '%HEAD%', render.head || '');
      body = replace(body, '%DEPLOY_HASH%', args[2].platform.deployHash, true);
      body = replace(body, '%BODY%', `<dinossr-root>${html}</dinossr-root>`);
      response = new Response(body, response);
      response.headers.set('content-type', 'text/html; charset=utf-8');
    }
    return response;
  };
};

export const importModule = (
  bundle: DinoSSRBundle,
  dinossr: DinoServer
): {routes: DinoRoute[]; islands: DinoIsland[]} => {
  const {hash, mod, metafile} = bundle;
  const routes: DinoRoute[] = [];
  const islands: DinoIsland[] = [];

  // Append pattern to file path
  let {pattern} = bundle;
  if (mod.pattern) {
    if (/^\.\w+$/.test(mod.pattern)) {
      pattern += mod.pattern;
    } else {
      pattern = path.join(pattern, mod.pattern);
    }
  }

  // Helper function for non-Svelte components
  const add = (method: DinoRoute['method'], handle: DinoHandle) => {
    const route: DinoRoute = {
      method,
      pattern,
      hash,
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
  if (typeof (mod?.default as BumbleComponent)?.render === 'function') {
    const component = mod.default as BumbleComponent;

    // Find island dependencies
    if (metafile) {
      for (const [key, input] of Object.entries(metafile.inputs)) {
        const found = input.imports.find(
          (i) => i.original === '@dinossr/island'
        );
        if (!found) continue;
        const entry = path.join(dinossr.dir, key);
        const hash = modHash(dinossr.dir, entry, 'dom', dinossr.deployHash);
        islands.push({
          entry,
          hash,
          pattern: `/_/immutable/${hash}.js`
        });
      }
    }

    // Create render callback
    const render: DinoRender = async (request, _response, props) => {
      // Setup context and props
      const url = new URL(request.url);
      const params = props.match?.pathname?.groups ?? {};
      const loadProps = {
        ...props.platform,
        fetch: serverFetch(request, dinossr.router, props.platform),
        params: structuredClone(params),
        request
      };
      Object.freeze(loadProps);
      const loadResponse = mod.load ? await mod.load(loadProps) : {};
      if (loadResponse instanceof Response) {
        return {
          response: loadResponse
        };
      }
      const context = new Map<string, unknown>();
      context.set('url', url);
      context.set('pattern', pattern);
      context.set('params', structuredClone(params));
      context.set('publicData', props.platform.publicData ?? {});
      context.set('serverData', props.platform.serverData ?? {});
      const render = component.render({}, {context});
      const headers = new Headers();
      let style = `
dinossr-root {
  display: contents;
}
`;
      if (islands.length) {
        style += `
dinossr-island {
  display: contents;
}
`;
        const script = `
const islands = new WeakSet();
const islandCount = new Map();
class DinossrIsland extends HTMLElement {
  constructor() {
    super();
  }
  async connectedCallback() {
    if (islands.has(this)) return;
    islands.add(this);
    const context = new Map();
    context.set('url', new URL('${url.pathname}', window.location.href));
    context.set('pattern', '${pattern}');
    context.set('params', ${JSON.stringify(params)});
    context.set('publicData', ${JSON.stringify(
      props.platform.publicData ?? {}
    )});
    context.set('browser', true);
    const {island} = this.dataset;
    islandCount.set(island, (islandCount.get(island) ?? 0) + 1);
    if (this.parentNode.closest('dinossr-island')) return;
    const count = islandCount.get(island);
    const selector = \`[data-island="\${island}"][type*="/json"]\`;
    const json = document.head.querySelectorAll(selector).item(count - 1);
    const props = json ? JSON.parse(json.textContent) : {};
    const mod = await import(\`/_/immutable/\${island}.js\`);
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
        islands.forEach(({pattern}) => {
          render.head += `<link rel="modulepreload" href="${pattern}">\n`;
        });
        render.html += `\n<script defer type="module" data-hash="${scriptHash}">${script}</script>\n`;
      }

      style = style.replaceAll(/\s+/g, ' ').trim();
      if (render.css?.code) {
        style += `\n${render.css.code}`;
      }
      const styleHash = await encodeCryptoBase64(style, 'SHA-256');
      headers.append('x-style-src', `'sha256-${styleHash}'`);
      render.head += `<style data-hash="${styleHash}">${style}</style>\n`;

      return {
        head: render.head,
        response: new Response(render.html, {
          headers
        })
      };
    };

    routes.push({
      method: 'GET',
      pattern,
      hash,
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

  return {routes, islands};
};
