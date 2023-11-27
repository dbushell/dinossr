<script>
  /** @type Array<{name: string, href: string, target?: string}> */
  export let menu = [];
</script>

<footer class="Grid | Footer">
  <div class="Footer__main">
    <p>
      <small>
        <span>Copyright &copy; {new Date().getFullYear()}</span>
        {#each menu as item, i}
          {#if i > 0}<span> • </span>{/if}
          <a href={item.href} target={item.target}>
            <span>{item.name}</span>
          </a>
        {/each}
      </small>
    </p>
  </div>
</footer>
