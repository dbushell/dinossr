import {serve} from '../mod.ts';

const dir = new URL('./', import.meta.url).pathname;

serve(dir, {
  // bumble: {
  //   dynamicImports: false
  // }
});
