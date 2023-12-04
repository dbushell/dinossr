<script lang="ts">
  export let menu: {name: string; href: string}[] = [];
</script>

<footer>
  <p>
    <small>
      <span>Copyright &copy; {new Date().getFullYear()}</span>
      {#each menu as item, i}
        {#if i > 0}<span> • </span>{/if}
        <a href={item.href}>
          <span>{item.name}</span>
        </a>
      {/each}
    </small>
  </p>
</footer>
