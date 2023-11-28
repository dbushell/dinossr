import {DinoServer} from '../mod.ts';

const dinossr = new DinoServer(new URL('./', import.meta.url).pathname, {
  bumbler: {
    dev: true
  }
});

await dinossr.init();

dinossr.router.onError = (error) => {
  console.log(error);
  return new Response(null, {
    status: 500
  });
};

const cssCache = new WeakMap<DinoServer, string>();

dinossr.router.get('/app.css', () => {
  let css = '';
  if (cssCache.has(dinossr)) {
    css = cssCache.get(dinossr)!;
  } else {
    css = Deno.readTextFileSync(
      new URL('./static/app.css', import.meta.url).pathname
    );
    css = css.replace(/^\s*?@import\s+["']([^"']+?)["']\s*?;/gm, (...match) => {
      return Deno.readTextFileSync(
        new URL(`./static/${match[1]}`, import.meta.url).pathname
      );
    });
    cssCache.set(dinossr, css);
  }
  return new Response(css, {
    headers: {
      'content-type': 'text/css; charset=utf-8'
    }
  });
});
