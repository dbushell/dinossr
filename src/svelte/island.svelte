<script context="module">
  const protectedProps = ['data-uuid', 'props'];
</script>

<script>
  import {getContext} from 'svelte';

  export let _island = '';
  export let _islandId = getContext('_islandId') ?? crypto.randomUUID();
  export let props = {};

  const browser = getContext('browser');

  const containerProps = Object.fromEntries(
    Object.entries($$props ?? {}).filter(([k]) => !/^[_$]/.test(k))
  );
  protectedProps.forEach((k) => delete containerProps[k]);
</script>

<svelte:head>
  {#if !browser && Object.keys(props).length}
    {@html `<script data-uuid="${_island}:${_islandId}" type="application/json">${JSON.stringify(
      props
    )}</script>`}
  {/if}
</svelte:head>

<dinossr-island data-uuid="{_island}:{_islandId}" {...containerProps}>
  <slot />
</dinossr-island>
