import {bumble} from './deps.ts';
import type {VHandle, RenderModule, RenderHandler} from './types.ts';

export const importModule = async (
  abspath: string,
  bumbler: bumble.default<RenderModule>
): Promise<RenderHandler[]> => {
  const mod = await bumbler.bumble(abspath);
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
    handlers.push({
      pattern,
      method: 'GET',
      render: async (request, _response, {match}) => {
        const url = new URL(request.url);
        const params = match?.pathname?.groups;
        const data = mod.load ? await mod.load(request, {params}) : {};
        const render = component.render({
          url,
          params,
          pattern,
          data
        });
        return {
          response: new Response(render.html, {
            headers: {'content-type': 'text/html; charset=utf-8'}
          }),
          head: render.head,
          css: render.css?.code
        };
      }
    });
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
