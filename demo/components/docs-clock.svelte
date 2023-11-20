<script>
  import {onMount} from 'svelte';
  import Island from '@dinossr/island';

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

<Island props={{label}}>
  <time>
    {#if label}{label}{/if}
    <b>{time}</b>
  </time>
</Island>
