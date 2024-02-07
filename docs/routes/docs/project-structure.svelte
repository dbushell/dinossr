<script context="module">
  export const pattern = '/';
</script>

<script>
  import Layout from '@components/layout-docs.svelte';
  import Alert from '@components/docs-alert.svelte';
  import Pagination from '@components/pagination.svelte';

  const heading = 'Project Structure';
  const title = `DinoSsr - ${heading} (Documentation)`;
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<Layout>
  <h1>{heading}</h1>
  <Alert />
  <p><strong>DinoSsr</strong> project directories are organised like so:</p>
  <pre class="Code"><code
      ><span>+</span> <span>project/</span>
<span>|--+</span> <span>routes/</span>
<span>|  |--</span> 404.svelte
<span>|  |--</span> index.svelte
<span>|--+</span> <span>static/</span>
<span>|  |--</span> favicon.ico
<span>|--</span> app.html
<span>|--</span> mod.ts
</code></pre>
  <p>
    Automatic routes are generated for the <code>static</code> files and the
    <code>routes</code>
    directory structure. Svelte routes are wrapped in the <code>app.html</code> template.
  </p>
  <p>
    <code>index.svelte</code> is the index page for a specific route. The
    optional <code>404.svelte</code> and <code>500.svelte</code> templates are for
    their corresponding error pages.
  </p>
  <p>
    Additional directories can be used to organise Svelte components. Files in <code
      >components</code
    >
    can be imported from <code>@components/name.svelte</code> for example.
  </p>
  <p>
    <code>mod.ts</code> is <a href="/docs/server/">the server</a> entry point.
  </p>
  <Pagination />
</Layout>
