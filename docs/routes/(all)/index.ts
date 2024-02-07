import type {DinoHandle} from 'dinossr';

// Match all routes
export const pattern = '/*';

// After all other routes
export const order = 999;

const themes = ['light', 'dark'];

export const get: DinoHandle = async ({request, response, platform}) => {
  if (!(response instanceof Response)) {
    return response;
  }
  // Add strict security headers
  if (request.url.startsWith(Deno.env.get('ORIGIN')!)) {
    try {
      response.headers.set(
        'strict-transport-security',
        'max-age=63072000; includeSubDomains; preload'
      );
    } catch {
      // Ignore immutable headers
    }
  }
  if (response.headers.get('content-type')?.includes('text/html')) {
    try {
      // Add policy to allow `data:` URIs in the stylesheet
      response.headers.append('x-img-src', 'data:');
    } catch {
      // Ignore immutable headers
    }
    // Add theme attribute to HTML document
    const theme = platform.cookies.get('theme')?.value;
    if (themes.includes(theme!)) {
      let body = await response.text();
      body = body.replace(/<html([^>]+?)>/, `<html$1 data-theme="${theme}">`);
      response = new Response(body, response);
    }
  }
  response.headers.set('x-powered-by', 'DinoSsr');
  return response;
};
