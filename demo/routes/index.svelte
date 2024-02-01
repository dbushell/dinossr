<script lang="ts">
  import Layout from '@components/layout.svelte';

  const title = 'DinoSsr Demo';
  const heading = 'Hello, World!';
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<Layout {title} {heading}>
  <p>This is a basic DinoSsr demo.</p>
  <ul>
    <li><a href="/islands">Islands</a></li>
    <li><a href="/cookies">Cookies</a></li>
    <li><a href="/test">Test</a></li>
  </ul>
</Layout>

<style>
  p {
    font-weight: 700;
    font-size: 1.5rem;
    margin: 0 0 1rem 0;
  }

  li {
    font-size: 1rem;
    margin: 0 0 0.5rem 0;
  }
</style>
