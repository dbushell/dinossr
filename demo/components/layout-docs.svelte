<script>
  import Header from '@components/header.svelte';
  import Footer from '@components/footer.svelte';
  import Container from '@components/container.svelte';
  import Menu from '@components/menu.svelte';
  import {docs, header, footer} from '@lib/data.json';
</script>

<div class="App">
  <Header menu={header.menu} />
  <Container>
    <aside>
      <Menu items={docs.menu} />
    </aside>
    <main>
      <slot />
    </main>
  </Container>
  <Footer menu={footer.menu} />
</div>
