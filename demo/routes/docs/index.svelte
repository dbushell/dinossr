<script context="module">
  export const pattern = '/';
</script>

<script>
  import Layout from '@components/layout-docs.svelte';
  import Alert from '@components/docs-alert.svelte';
  import Pagination from '@components/pagination.svelte';
  import docs from '@lib/docs.json';

  const heading = 'Documentation';
  const title = `DinoSsr - ${heading}`;
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<Layout>
  <h1>Documentation</h1>
  <Alert />
  <p>Current documentation:</p>
  <ul>
    {#each docs.pages.slice(1) as page}
      <li>
        <a href={page.href}>
          <span>{page.name}</span>
        </a>
      </li>
    {/each}
  </ul>
  <p>Further documentation to come.</p>
  <Pagination />
</Layout>
