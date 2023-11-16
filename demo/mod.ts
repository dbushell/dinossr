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

const getCSP = (response: Response) => {
  // @ts-ignore: TODO types
  const csp: typeof CSP = {};
  for (const [k, v] of Object.entries(CSP)) {
    const key = k as keyof typeof CSP;
    csp[key] = [...v];
    const xkey = `x-${key}`;
    if (response.headers.has(xkey)) {
      const value = response.headers.get(xkey)!;
      response.headers.delete(xkey);
      csp[key].push(...value.split(',').map((s) => `'${s.trim()}'`));
    }
  }
  return csp;
};

router.use((_request, response) => {
  if (response) {
    const csp = getCSP(response);
    response.headers.set('referrer-policy', 'same-origin');
    response.headers.set(
      'content-security-policy',
      Object.entries(csp)
        .map(([k, v]) => `${k} ${v.join(' ')}`)
        .join('; ')
    );
  }
  return response;
});
