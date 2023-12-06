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
  </ul>
</Layout>
