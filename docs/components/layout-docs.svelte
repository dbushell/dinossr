<script>
  import App from '@components/app.svelte';
  import Header from '@components/header.svelte';
  import {Footer, Container, Menu} from '@components/patchwork.ts';
  import {docs, header, footer} from '@lib/data.json';
</script>

<App>
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
</App>
