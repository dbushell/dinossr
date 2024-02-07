<script context="module">
  export const pattern = '/';
</script>

<script>
  import Layout from '@components/layout-docs.svelte';
  import Alert from '@components/docs-alert.svelte';
  import Pagination from '@components/pagination.svelte';

  const heading = 'Environment Variables';
  const title = `DinoSsr - ${heading} (Documentation)`;
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<Layout>
  <h1>{heading}</h1>
  <Alert />
  <h3><code>ORIGIN</code></h3>
  <p>Example: <code>https://ssr.rocks</code></p>
  <p>
    If defined <strong>DinoSsr</strong> will only respond to requests matching
    the hostname and protocol. If hosted with a custom domain on
    <strong>Deno Deploy</strong>
    requests to <code>[project].deno.dev</code> are redirected.
  </p>
  <h3><code>DINOSSR_DEPLOY_ID</code></h3>
  <p>
    Used to generate a deterministic <code>deployHash</code>. If not defined a
    new hash is generated based on deploy time.
  </p>
  <h3><code>DINOSSR_BUILD</code></h3>
  <p>
    If defined routes a compiled and bundled to <code>.dinossr</code> in the project
    root directory. This speeds up server cold starts significantly. Yes, it’s a
    build step!
  </p>
  <p>
    See notes on <a href="/docs/deploy/">Deno Deploy</a> for usage.
  </p>
  <Pagination />
</Layout>
