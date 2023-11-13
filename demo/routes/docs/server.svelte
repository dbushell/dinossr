<script context="module">
  export const pattern = '/';
</script>

<script>
  import Layout from '@components/layout.svelte';
  import DocsBreadcrumb from '@components/docs-breadcrumb.svelte';
  import DocsNav from '@components/docs-nav.svelte';
  import Code from '@components/code.svelte';

  const heading = 'Deno Server';
  const title = `DinoSrr - ${heading} (Documentation)`;
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
    <Code
      language="javascript"
      code={`
import {serve} from 'dinossr';

const dir = new URL('./', import.meta.url).pathname;

serve(dir);
`}
    />
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
    <Code
      language="javascript"
      code={`
const {router, server} = await serve(dir);

router.use((request, response) => {
  if (response) {
    response.headers.set('referrer-policy', 'same-origin');
  }
  return response;
});
`}
    />
    <p>
      Additional middleware and routes can be added or existing route responses
      modified.
    </p>
  </div>
  <DocsNav />
</Layout>
