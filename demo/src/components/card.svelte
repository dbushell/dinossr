<script>
  export let title = '';
  export let subtitle = '';
  export let text = '';
  export let link = '';
  export let linkText = '';
</script>

<div class="card">
  <div class="card-body">
    {#if title}
      <h5 class="card-title">{title}</h5>
    {/if}
    {#if subtitle}
      <h6 class="card-subtitle mb-2 text-body-secondary">{subtitle}</h6>
    {/if}
    {#if text}
      <p class="card-text">{text}</p>
    {/if}
    {#if link && linkText}
      <a href={link} class="card-link">{linkText}</a>
    {/if}
  </div>
</div>
