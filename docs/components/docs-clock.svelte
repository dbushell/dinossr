<script context="module">
  export const island = true;
</script>

<script>
  import {onMount} from 'svelte';

  export let label = '';

  let time = '';
  const update = () => {
    time = new Date().toLocaleTimeString();
  };
  update();

  onMount(() => {
    setInterval(update, 1000);
  });
</script>

<time>
  {#if label}{label}{/if}
  <b>{time}</b>
</time>
