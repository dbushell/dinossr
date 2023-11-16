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
  const value = response.headers.get(key)!;
  response.headers.delete(key);
  const hash = value.split(',').map((s) => `'${s.trim()}'`);
  hash.forEach((h) => {
    if (!CSP[csp].includes(h)) {
      CSP[csp].push(h);
    }
  });
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
