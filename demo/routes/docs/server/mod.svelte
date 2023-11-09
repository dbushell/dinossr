<script>
  import Layout from '@components/layout.svelte';
  import DocsBreadcrumb from '@components/docs-breadcrumb.svelte';
  import DocsNav from '@components/docs-nav.svelte';

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
    <pre class="bg-secondary-subtle p-4 me-4"><code
        >import &#123;serve&#125; from 'dinossr';

const dir = new URL('./', import.meta.url).pathname;

serve(dir);</code
      ></pre>
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
    <pre class="bg-secondary-subtle p-4 me-4"><code
        >const &#123;router, server&#125; = await serve(dir);

router.use((request, response) =&gt; &#123;
  if (response) &#123;
    response.headers.set('referrer-policy', 'same-origin');
  &#125;
  return response;
&#125;);</code
      ></pre>
    <p>
      Additional middleware and routes can be added or existing route responses
      modified.
    </p>
  </div>
  <DocsNav />
</Layout>
