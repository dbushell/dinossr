import {path} from '../deps.ts';
import {replace, encodeCryptoBase64} from './utils.ts';
import {readTemplate, hasTemplate} from './template.ts';
import {serverFetch} from './fetch.ts';
import type {BumbleComponent} from './bundle/types.ts';
import type {
  DinoServer,
  DinoHandle,
  DinoLoad,
  DinoRoute,
  DinoRender,
  DinoModule,
  DinoSSRBundle
} from './types.ts';

const islandScript = await (
  await fetch(new URL('./bundle/svelte/island.min.js', import.meta.url))
).text();

export const routeMethods: Array<keyof DinoModule> = [
  'DELETE',
  'GET',
  'PATCH',
  'POST',
  'PUT'
];

// Return a route handle that renders with `app.html`
export const createHandle = async (
  server: DinoServer,
  route: DinoRoute
): Promise<DinoHandle> => {
  const template = await readTemplate();
  return async (props) => {
    const render = await route.render(props);
    let {response} = await Promise.resolve(
      server.router.resolve(props.request, render.response)
    );
    if (!(response instanceof Response)) {
      return response;
    }
    if (response.headers.get('content-type')?.startsWith('text/html')) {
      return response;
    }
    if (route.method === 'GET' && hasTemplate(props.request, response)) {
      const html = await response.text();
      if (!template) {
        if (/<([^>]+)(\s[^>]+)?>(.*?)<\/\1>/.test(html)) {
          response.headers.set('content-type', 'text/html; charset=utf-8');
        }
        return response;
      }
      let body = replace(template, '%HEAD%', render.head || '');
      body = replace(body, '%DEPLOY_HASH%', props.platform.deployHash, true);
      body = replace(body, '%BODY%', html);
      response = new Response(body, response);
      response.headers.set('content-type', 'text/html; charset=utf-8');
    }
    return response;
  };
};

export const importRoutes = (
  server: DinoServer,
  bundle: DinoSSRBundle
): {routes: Array<DinoRoute>} => {
  const {hash, mod, islands} = bundle;
  const routes: Array<DinoRoute> = [];

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

    // Create render callback
    const render: DinoRender = async ({request, match, platform}) => {
      // Setup context and props
      const url = new URL(request.url);
      const params = match?.pathname?.groups ?? {};
      const loadProps: Parameters<DinoLoad>[0] = {
        ...platform,
        fetch: serverFetch(request, server.router, platform),
        params: structuredClone(params),
        request
      };
      Object.freeze(loadProps);
      // TODO: allow load to return `null` for 404?
      const loadResponse = mod.load ? await mod.load(loadProps) : {};
      if (loadResponse instanceof Response) {
        return {
          response: loadResponse.status === 404 ? undefined : loadResponse
        };
      }
      // Setup render context
      const context = new Map<string, unknown>();
      context.set('url', url);
      context.set('pattern', pattern);
      context.set('params', structuredClone(params));
      context.set('publicData', platform.publicData);
      context.set('serverData', platform.serverData);

      // Render server-side component
      const render = component.render({}, {context});

      // Custom headers for content security policy
      const headers = new Headers();

      // Add client-side Islands init script
      let style = '';
      if (islands.length) {
        const context = {
          pattern,
          params,
          url: url.pathname,
          publicData: platform.publicData,
          browser: true
        };
        style += `dinossr-island { display: contents; }`;
        let script = islandScript.trim();
        script = replace(script, '%DEPLOY_HASH%', server.deployHash, true);
        const scriptHash = await encodeCryptoBase64(script, 'SHA-256');
        headers.append('x-script-src', `'sha256-${scriptHash}'`);
        render.head += `\n`;
        islands.forEach(({hash}) => {
          render.head += `<link rel="modulepreload" href="/_/immutable/${hash}.js">\n`;
        });
        render.html += `\n<script data-context="${
          server.deployHash
        }" type="application/json">${JSON.stringify(context)}</script>`;
        render.html += `\n<script defer type="module" data-hash="${scriptHash}">${script}</script>\n`;
      }

      // Add component styles
      style = style.replaceAll(/\s+/g, ' ').trim();
      if (render.css?.code) {
        style += `\n${render.css.code}`;
      }
      if (style.length) {
        style = replace(style, '%DEPLOY_HASH%', server.deployHash, true);
        const styleHash = await encodeCryptoBase64(style, 'SHA-256');
        headers.append('x-style-src', `'sha256-${styleHash}'`);
        render.head += `<style data-hash="${styleHash}">${style}</style>\n`;
      }

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
  }

  // Use default function as GET handle
  else if (typeof mod.default === 'function') {
    add('GET', mod.default as DinoHandle);
  }

  // Support other handles
  routeMethods.forEach((method) => {
    if (typeof mod[method] === 'function') {
      add(method as DinoRoute['method'], mod[method] as DinoHandle);
    }
  });

  return {routes};
};
