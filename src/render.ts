import {path, debounce, bumble} from './deps.ts';
import {encodeHash} from './utils.ts';
import {readTemplate, hasTemplate} from './template.ts';
import type {Bumbler, Handle, Renderer, RenderCallback} from './types.ts';

const watchModules = new Map<string, Deno.FsWatcher>();
const watchRenderers = new Map<string, Renderer>();

// Return a route handle that renders with `app.html`
export const createHandle = async (renderer: Renderer): Promise<Handle> => {
  const template = await readTemplate();
  return async (...args) => {
    for (const r of watchRenderers.values()) {
      if (r.method === renderer.method && r.pattern === renderer.pattern) {
        renderer = r;
        break;
      }
    }
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
  bumbler: Bumbler,
  watch?: boolean
): Promise<Renderer[]> => {
  const {manifest, mod} = await bumbler.bumbleSSR(abspath, {
    filterExports: ['default', 'pattern', 'get', 'post', 'load', 'csr']
  });

  // Append pattern to file path
  if (mod.pattern) {
    pattern = path.join(pattern, mod.pattern);
  }

  // TODO: pass as prop/context?
  // Unique to deployment and component
  const hash = await encodeHash((await bumbler.deployHash) + pattern, 'SHA-1');

  if (watch) {
    if (watchModules.has(abspath)) {
      const watcher = watchModules.get(abspath) as Deno.FsWatcher;
      watcher.close();
    }
    const watcher = Deno.watchFs([...manifest.dependencies.keys()]);
    const update = debounce(async (ev: Deno.FsEvent) => {
      if (ev.kind === 'modify') {
        watcher.close();
        await importModule(abspath, pattern, bumbler, watch);
      }
    }, 500);
    (async () => {
      for await (const event of watcher) {
        update(event);
      }
    })();
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
    };
    renderers.push({
      method: 'GET',
      pattern,
      render
    });

    // Render DOM for client-side hydration
    if (mod.csr && abspath.endsWith('.svelte')) {
      let dom = await bumbler.bumbleDOM(abspath, {
        filterExports: ['default', 'pattern']
      });
      dom = dom.replaceAll(
        'from "svelte',
        'from "https://cdn.skypack.dev/svelte@4.2.2'
      );
      const pattern = `/_/immutable/${hash}.js`;
      const render: RenderCallback = () => {
        return {
          response: new Response(dom, {
            headers: {'content-type': 'text/javascript; charset=utf-8'}
          })
        };
      };
      renderers.push({
        method: 'GET',
        pattern,
        render
      });
    }
  }

  if (watch) {
    renderers.forEach((newRenderer) => {
      const key = newRenderer.method + newRenderer.pattern;
      const oldRenderer = watchRenderers.get(key);
      if (oldRenderer) {
        oldRenderer.render = newRenderer.render;
      } else {
        watchRenderers.set(key, newRenderer);
      }
    });
  }

  return renderers;
};
