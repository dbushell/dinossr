<script>
  import {getContext} from 'svelte';

  export let _$island = '';
  export let props = {};

  const browser = getContext('browser');
</script>

<svelte:head>
  {#if !browser}
    {@html `<script data-island="${_$island}" type="application/json">${JSON.stringify(
      props
    )}</script>`}
  {/if}
</svelte:head>

<dinossr-island data-island={_$island}>
  <slot />
</dinossr-island>
