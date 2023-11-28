import {DinoServer} from '../mod.ts';

const dinossr = new DinoServer(new URL('./', import.meta.url).pathname, {
  bumbler: {
    dev: !Deno.env.has('DENO_REGION')
  }
});

await dinossr.init();

dinossr.router.onError = (error) => {
  console.log(error);
  return new Response(null, {
    status: 500
  });
};

const cssCache = new WeakMap<Deno.HttpServer, string>();

dinossr.router.get('/app.css', () => {
  let css = '';
  if (cssCache.has(dinossr.server)) {
    css = cssCache.get(dinossr.server)!;
  } else {
    css = Deno.readTextFileSync(
      new URL('./static/app.css', import.meta.url).pathname
    );
    css = css.replace(/^\s*?@import\s+["']([^"']+?)["']\s*?;/gm, (...match) => {
      return Deno.readTextFileSync(
        new URL(`./static/${match[1]}`, import.meta.url).pathname
      );
    });
    cssCache.set(dinossr.server, css);
  }
  return new Response(css, {
    headers: {
      'content-type': 'text/css; charset=utf-8'
    }
  });
});
