import {serve} from '../mod.ts';

const dir = new URL('./', import.meta.url).pathname;

const dinossr = await serve(dir, {
  bumbler: {
    dev: !Deno.env.has('DENO_REGION')
  }
});

const {router, server} = dinossr;

router.onError = (error) => {
  console.log(error);
  return new Response(null, {
    status: 500
  });
};

const cssCache = new WeakMap<Deno.HttpServer, string>();

router.get('/app.css', () => {
  let css = '';
  if (cssCache.has(server)) {
    css = cssCache.get(server)!;
  } else {
    css = Deno.readTextFileSync(
      new URL('./static/app.css', import.meta.url).pathname
    );
    css = css.replace(/^\s*?@import\s+["']([^"']+?)["']\s*?;/gm, (...match) => {
      return Deno.readTextFileSync(
        new URL(`./static/${match[1]}`, import.meta.url).pathname
      );
    });
    cssCache.set(server, css);
  }
  return new Response(css, {
    headers: {
      'content-type': 'text/css; charset=utf-8'
    }
  });
});
