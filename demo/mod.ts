import {serve} from '../mod.ts';

const dir = new URL('./', import.meta.url).pathname;

const dev = !Deno.env.has('DENO_REGION');

const {router} = await serve(dir, {
  bumbler: {
    dev
    // dynamicImports: false
  }
});

const CSP = {
  'default-src': ["'self'"],
  'style-src': ["'self'"],
  'script-src': ["'self'", 'https://cdn.skypack.dev'],
  'base-uri': ["'none'"],
  'frame-ancestors': ["'none'"],
  'form-action': ["'self'"]
};

const updateCSP = (response: Response, csp: keyof typeof CSP) => {
  const key = `x-${csp}`;
  if (!response.headers.has(key)) {
    return;
  }
  const hash = response.headers
    .get(key)!
    .split(',')
    .map((s) => `'${s.trim()}'`);
  CSP[csp].push(...hash);
  response.headers.delete(key);
};

router.use((_request, response) => {
  if (response) {
    updateCSP(response, 'style-src');
    updateCSP(response, 'script-src');
    response.headers.set('referrer-policy', 'same-origin');
    response.headers.set(
      'content-security-policy',
      Object.entries(CSP)
        .map(([k, v]) => `${k} ${v.join(' ')}`)
        .join('; ')
    );
  }
  return response;
});
