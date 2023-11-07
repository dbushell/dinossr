<script>
  import Rule from '@components/rule.svelte';
  import Alert from '@components/alert.svelte';

  export let alert = true;
</script>

{#if alert}
  <div class="container">
    <Alert />
  </div>
{/if}
<footer class="container" class:pt-4={!alert}>
  <Rule />
  <p>
    <span>Copyright © {new Date().getFullYear()}</span>
    <a href="https://dbushell.com/">David Bushell</a>
    <span> • </span>
    <a href="https://github.com/dbushell/dinossr/">GitHub</a>
  </p>
</footer>
