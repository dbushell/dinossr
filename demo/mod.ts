import {serve} from '../mod.ts';

const dir = new URL('./', import.meta.url).pathname;

await serve(dir, {
  bumbler: {
    dev: !Deno.env.has('DENO_REGION')
    // dynamicImports: false
  }
});
