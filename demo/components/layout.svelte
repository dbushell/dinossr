<script>
  import Header from '@components/header.svelte';
  import Footer from '@components/footer.svelte';
  import {header, footer} from '@lib/data.json';

</script>

<div class="App">
  <Header menu={header.menu} />
  <slot />
  <Footer menu={footer.menu} />
</div>
