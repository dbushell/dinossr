<script lang="ts">
  import Layout from '@components/layout.svelte';
  import Clock from '@components/clock.svelte';

  const title = 'Islands - DinoSsr Demo';
  const heading = 'Islands';
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<Layout {title} {heading}>
  <p>This is a live island demo.</p>
  <Clock title="Your local time" />
  <p><a href="/">return home</a></p>
</Layout>
