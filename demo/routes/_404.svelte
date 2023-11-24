<script>
  import Layout from '@components/layout.svelte';
  import Container from '@components/container.svelte';

  const heading = '404 Not Found';
  const title = `DinoSsr - ${heading}`;
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<Layout>
  <Container>
    <h1>{heading}</h1>
  </Container>
</Layout>
