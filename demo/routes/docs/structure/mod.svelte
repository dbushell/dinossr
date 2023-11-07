<script>
  import {setContext} from 'svelte';
  import Layout from '@components/layout.svelte';
  import DocsBreadcrumb from '@components/docs-breadcrumb.svelte';
  import DocsNav from '@components/docs-nav.svelte';
  import DocsStructure from '@components/docs-structure.svelte';

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
  <DocsBreadcrumb />
  <div class="mb-4">
    <p>Project files are organised like so:</p>
    <DocsStructure />
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
  <DocsNav />
</Layout>
