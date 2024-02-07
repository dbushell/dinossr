<script context="module">
  export const island = true;
</script>

<script>
  import {Hero} from '@components/patchwork.ts';
</script>

<Hero {...$$props}>
  <svelte:fragment slot="image">
    <div class="Hero__image">
      <img
        src="/512x512.svg"
        alt="look out! a dinosaur!"
        width="512"
        height="512"
      />
    </div>
  </svelte:fragment>
</Hero>
