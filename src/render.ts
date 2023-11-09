import {path, bumble} from './deps.ts';
import {encodeHash} from './utils.ts';
import {readTemplate, hasTemplate} from './template.ts';
import type {Bumbler, Handle, Renderer} from './types.ts';

// Return a route handle that renders with `app.html`
export const createHandle = async (renderer: Renderer): Promise<Handle> => {
  const template = await readTemplate();
  return async (...args) => {
    const render = await renderer.render(...args);
    let response = await render.response;
    if (renderer.method === 'GET' && hasTemplate(response)) {
      response = response as Response;
      let body = await response.text();
      body = template.replace('%BODY%', `<div id="app">${body}</div>`);
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
  const mod = await bumbler.bumbleSSR(abspath);

  // Append pattern to file path
  if (mod.pattern) {
    pattern = path.join(pattern, mod.pattern);
  }
  if (pattern.at(-1) !== '/') {
    pattern += '/';
  }

  // TODO: pass as prop/context?
  // Unique to deployment and component
  const hash = await encodeHash((await bumbler.deployHash) + pattern, 'SHA-1');

  const renderers: Renderer[] = [];

  const add = (method: Renderer['method'], handle: Handle) => {
    renderers.push({
      pattern,
      method,
      render: (...args) => ({
        response: handle(...args)
      })
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

    renderers.push({
      pattern,
      method: 'GET',
      render: async (request, _response, {match}) => {
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
        if (mod.csr) {
          const script = new URL(`/_/immutable/${hash}.js`, url);
          render.head += `\n<link rel="modulepreload" href="${script.pathname}">`;
          render.html += `\n<script type="module">
const mod = await import('${script.pathname}');
const target = document.querySelector('#app');
const context = new Map();
context.set('url', new URL('${url.pathname}', window.location.href));
context.set('pattern', '${pattern}');
context.set('params', ${JSON.stringify(params)});
context.set('data', ${JSON.stringify(data)});
context.set('browser', true);
new mod.default({target, context, hydrate: true, props: Object.fromEntries(context)});
</script>
`;
        }
        return {
          response: new Response(render.html, {
            headers: {'content-type': 'text/html; charset=utf-8'}
          }),
          head: render.head,
          css: render.css?.code
        };
      }
    });

    // Render DOM for client-side hydration
    if (mod.csr && abspath.endsWith('.svelte')) {
      let dom = await bumbler.bumbleDOM(abspath);
      dom = dom.replaceAll(
        'from "svelte',
        'from "https://cdn.skypack.dev/svelte@4.2.2'
      );
      renderers.push({
        pattern: `/_/immutable/${hash}.js`,
        method: 'GET',
        render: () => {
          return {
            response: new Response(dom, {
              headers: {'content-type': 'text/javascript; charset=utf-8'}
            })
          };
        }
      });
    }
  }

  return renderers;
};
