<script>
  export let light;
  export let dark;
</script>

<div
  class="Grid | Container"
  class:Container--light={light}
  class:Container--dark={dark}
>
  <slot />
</div>
