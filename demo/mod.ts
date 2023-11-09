import {serve} from '../mod.ts';

const dir = new URL('./', import.meta.url).pathname;

const {router} = await serve(dir, {
  bumble: {
    dev: true
    // dynamicImports: false
  }
});

router.use((request, response) => {
  if (response) {
    response.headers.set('referrer-policy', 'same-origin');
    response.headers.set(
      'content-security-policy',
      `default-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self';`
    );
  }
  return response;
});
