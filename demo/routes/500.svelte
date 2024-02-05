<script lang="ts">
  import Layout from '@components/layout.svelte';

  const title = 'DinoSsr Demo';
  const heading = 'Error';
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<Layout {title} {heading}>
  <p>500</p>
</Layout>
