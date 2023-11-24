<script>
  import Layout from '@components/layout.svelte';
  import Container from '@components/container.svelte';

  const heading = '500 Internal Server Error';
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
