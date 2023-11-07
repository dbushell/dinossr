<script>
  import {setContext} from 'svelte';
  import Layout from '@components/layout.svelte';

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
  <nav aria-label="breadcrumb">
    <ol class="breadcrumb">
      <li class="breadcrumb-item"><a href="/docs/">Documentation</a></li>
      <li class="breadcrumb-item active" aria-current="page">{heading}</li>
    </ol>
  </nav>
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
  <div class="mb-4 d-flex align-items-center justify-content-between">
    <a href="/docs/structure/" class="btn btn-small btn-outline-info">
      <span>← Project Structure</span>
    </a>
  </div>
</Layout>
