<script>
  import {setContext} from 'svelte';
  import Layout from '@components/layout.svelte';

  /** @type {URL} */
  export let url;

  setContext('url', url);

  const title = 'DinoSrr - Documentation';
  const heading = 'Documentation';
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<Layout>
  <h1>{heading}</h1>
  <p class="lead">Coming soon...</p>
</Layout>
