<script>
  import Header from '@components/header.svelte';
  import Footer from '@components/footer.svelte';
  import Container from '@components/container.svelte';
  import Menu from '@components/menu.svelte';
  import docs from '@lib/docs.json';
</script>

<div class="App">
  <Header />
  <Container>
    <aside>
      <Menu items={docs.pages} />
    </aside>
    <main>
      <slot />
    </main>
  </Container>
  <Footer />
</div>
