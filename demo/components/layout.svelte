<script>
  import Navbar from '@components/navbar.svelte';
  import Footer from '@components/footer.svelte';

  export let alert = true;
</script>

<Navbar heading="DinoSsr" />

<main class="container pt-5">
  <slot />
</main>

<Footer {alert} />
