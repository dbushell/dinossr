import {serve} from '../mod.ts';

const dir = new URL('./', import.meta.url).pathname;

const {router} = await serve(dir, {
  bumbler: {
    dev: true
    // dynamicImports: false
  }
});

const CSP = {
  'default-src': ["'self'"],
  'script-src': ["'self'"],
  'base-uri': ["'none'"],
  'frame-ancestors': ["'none'"],
  'form-action': ["'self'"]
};

router.use((_req, response) => {
  if (response) {
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
