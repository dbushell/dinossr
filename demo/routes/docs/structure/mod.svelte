<script>
  import {setContext} from 'svelte';
  import Layout from '@components/layout.svelte';
  import Structure from '@components/structure.svelte';

  /** @type {URL} */
  export let url;

  setContext('url', url);

  const heading = 'Project Structure';
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
    <p>Project files are organised like so:</p>
    <Structure />
    <p>
      Automatic routes are generated from the <code>routes</code> directory structure.
    </p>
    <p><code>mod.svelte</code> is the index page for a specific route.</p>
    <p>
      <code>_404.svelte</code> and <code>_500.svelte</code> are optional templates
      for their corresponding error pages.
    </p>
    <p>
      Additional directories can be used to organise Svelte components. For
      example, files in <code>project/components</code> can be imported from
      <code>@components/name.svelte</code>.
    </p>
  </div>
  <div class="mb-4 d-flex align-items-center justify-content-between">
    <a href="/docs/" class="btn btn-small btn-outline-info">
      <span>← Documentation</span>
    </a>
    <a href="/docs/server/" class="btn btn-small btn-outline-info">
      <span>Deno Server →</span>
    </a>
  </div>
</Layout>
