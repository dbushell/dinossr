<script>
  import {setContext} from 'svelte';
  import Layout from '@components/layout.svelte';
  import DocsBreadcrumb from '@components/docs-breadcrumb.svelte';
  import DocsNav from '@components/docs-nav.svelte';

  /** @type {URL} */
  export let url;

  setContext('url', url);

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
  </div>
  <DocsNav />
</Layout>
