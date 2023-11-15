<script context="module">
  const protectedProps = ['data-island'];
</script>

<script>
  export let _island = '';
  const props = Object.fromEntries(
    Object.entries($$props ?? {}).filter(([k]) => !/^[_$]/.test(k))
  );
  protectedProps.forEach((k) => delete props[k]);
</script>

<span data-island={_island} {...props}>
  <slot />
</span>
