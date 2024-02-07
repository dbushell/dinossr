<script>
  import App from '@components/app.svelte';
  import Header from '@components/header.svelte';
  import {Footer} from '@components/patchwork.ts';
  import {header, footer} from '@lib/data.json';

</script>

<App>
  <Header menu={header.menu} />
  <slot />
  <Footer menu={footer.menu} />
</App>
