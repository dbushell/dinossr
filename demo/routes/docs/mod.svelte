<script>
  import Layout from '@components/layout.svelte';
  import DocsNav from '@components/docs-nav.svelte';
  import docs from '@data/docs.json';

  const heading = 'Documentation';
  const title = `DinoSrr - ${heading}`;
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<Layout>
  <h1>{heading}</h1>
  <p class="lead">
    DinoSsr is an experimental work in progress and subject to change.
  </p>
  <div class="mb-4">
    <ul class="nav flex-column mb-4">
      {#each docs.pages.slice(1) as page}
      <li class="nav-item">
        <a class="nav-link" href={page.href}>
          <span>→ {page.name}</span>
        </a>
      </li>
      {/each}
    </ul>
  </div>
  <DocsNav />
</Layout>
