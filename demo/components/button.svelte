<script>
  export let label = 'Button';
  export let href;
  export let type;
  export let small;

  const tag = href ? 'a' : 'button';

  const props = {
    href,
    type
  };
</script>

<svelte:element
  this={tag}
  {...props}
  class="Button"
  class:Button--small={small}
>
  <span class="Button__label">{label}</span>
</svelte:element>
