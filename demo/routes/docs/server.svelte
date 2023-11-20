<script context="module">
  import {highlight} from '@lib/highlight.js';

  export const pattern = '/';

  export const load = () => {
    return {
      code1: highlight(
        'javascript',
        `
import {serve} from 'dinossr';

const dir = new URL('./', import.meta.url).pathname;

serve(dir);
`
      ),
      code2: highlight(
        'javascript',
        `
const {router, server} = await serve(dir);

router.use((request, response) => {
  if (response) {
    response.headers.set('referrer-policy', 'same-origin');
  }
  return response;
});
`
      )
    };
  };
</script>

<script>
  import {getContext} from 'svelte';
  import Layout from '@components/layout.svelte';
  import DocsBreadcrumb from '@components/docs-breadcrumb.svelte';
  import DocsNav from '@components/docs-nav.svelte';
  import Code from '@components/code.svelte';

  const heading = 'Deno Server';
  const title = `DinoSrr - ${heading} (Documentation)`;

  const {code1, code2} = getContext('data') ?? {};
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<Layout>
  <h1>{heading}</h1>
  <DocsBreadcrumb />
  <div class="mb-4">
    <p>
      The <code>mod.ts</code> file at the root of the project is the server entry
      point.
    </p>
    <Code language="javascript" code={code1} />
    <p>This is started with: <code>deno run -A mod.ts</code>.</p>
    <p>
      The <code>serve</code> function returns the internal instances of
      <a href="https://github.com/dbushell/velocirouter" target="_blank"
        >VelociRouter</a
      >
      and
      <a href="https://deno.land/api?s=Deno.HttpServer" target="_blank"
        >Deno.HttpServer</a
      >.
    </p>
    <Code language="javascript" code={code2} />
    <p>
      Additional middleware and routes can be added or existing route responses
      modified.
    </p>
  </div>
  <DocsNav />
</Layout>
