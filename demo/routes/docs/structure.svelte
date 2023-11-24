<script context="module">
  export const pattern = '/';
</script>

<script>
  import Layout from '@components/layout-docs.svelte';
  import Alert from '@components/docs-alert.svelte';
  import DocsStructure from '@components/docs-structure.svelte';
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
  <p>Project files are organised like so:</p>
  <DocsStructure />
  <p>
    Automatic routes are generated from the <code>routes</code> directory structure.
  </p>
  <p><code>index.svelte</code> is the index page for a specific route.</p>
  <p>
    <code>_404.svelte</code> and <code>_500.svelte</code> are optional templates
    for their corresponding error pages.
  </p>
  <p>
    Additional directories can be used to organise Svelte components. Files in <code
      >project/components</code
    >
    can be imported from
    <code>@components/name.svelte</code> for example.
  </p>
  <Pagination />
</Layout>
