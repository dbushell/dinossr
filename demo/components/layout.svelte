<script>
  import Header from '@components/header.svelte';
  import Footer from '@components/footer.svelte';
</script>

<div class="App">
  <Header />
  <slot />
  <Footer />
</div>
