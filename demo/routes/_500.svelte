<script>
  import Layout from '@components/layout.svelte';

  const heading = '500 Internal Server Error';
  const title = `DinoSrr - ${heading}`;
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<Layout>
  <h1 class="mb-4">{heading}</h1>
</Layout>
