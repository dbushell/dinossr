<script context="module">
  export const pattern = '/';
</script>

<script>
  import Layout from '@components/layout-docs.svelte';
  import Alert from '@components/docs-alert.svelte';
  import Pagination from '@components/pagination.svelte';
  import {docs} from '@lib/data.json';

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
    {#each docs.menu.slice(1) as item}
      <li>
        <a href={item.href}>
          <span>{item.name}</span>
        </a>
      </li>
    {/each}
  </ul>
  <p>
    <strong>DinoSsr</strong> is currently beta status and functionality may change.
  </p>
  <Pagination />
</Layout>
