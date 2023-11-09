import {bumble} from './deps.ts';
import {encodeHash} from './utils.ts';
import type {VHandle, RenderModule, RenderHandler} from './types.ts';

export const importModule = async (
  abspath: string,
  bumbler: bumble.default<RenderModule>
): Promise<RenderHandler[]> => {
  const mod = await bumbler.bumbleSSR(abspath);
  const pattern = mod.pattern ?? '';

  const handlers: RenderHandler[] = [];

  // Default functions are treated as GET handlers
  if (typeof mod.default === 'function') {
    handlers.push({
      pattern,
      method: 'GET',
      render: (...args) => ({
        response: (mod.default as VHandle)(...args)
      })
    });
    return handlers;
  }
  // Handle Svelte component export
  else if (typeof mod?.default?.render === 'function') {
    const component = mod.default as bumble.BumbleComponent;

    const csrHash = await encodeHash(
      (await bumbler.deployHash) + pattern,
      'SHA-1'
    );

    handlers.push({
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
          const script = new URL(`/_/${csrHash}.js`, url);
          render.head += `\n<link rel="modulepreload" href="${script.href}">`;
          render.html += `\n<script type="module">
const mod = await import('${script.href}');
const target = document.querySelector('#app');
target.innerHTML = '';
const context = new Map();
context.set('url', new URL('${url.href}'));
context.set('pattern', '${pattern}');
context.set('params', ${JSON.stringify(params)});
context.set('data', ${JSON.stringify(data)});
context.set('browser', true);
new mod.default({target, context, props: Object.fromEntries(context)});
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
      handlers.push({
        pattern: `^/_/${csrHash}.js`,
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
  // Otherwise look for GET handler
  else if (typeof mod.get === 'function') {
    handlers.push({
      pattern,
      method: 'GET',
      render: (...args) => ({
        response: (mod.get as VHandle)(...args)
      })
    });
  }
  // Support POST handler
  if (typeof mod.post === 'function') {
    handlers.push({
      pattern,
      method: 'POST',
      render: (...args) => ({
        response: (mod.post as VHandle)(...args)
      })
    });
  }
  return handlers;
};
