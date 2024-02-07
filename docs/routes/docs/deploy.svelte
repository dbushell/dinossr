<script context="module">
  export const pattern = '/';
</script>

<script>
  import Layout from '@components/layout-docs.svelte';
  import Alert from '@components/docs-alert.svelte';
  import Pagination from '@components/pagination.svelte';
  import Code from '@components/code.svelte';

  const heading = 'Deno Deploy';
  const title = `DinoSsr - ${heading} (Documentation)`;
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<Layout>
  <h1>{heading}</h1>
  <Alert />
  <p>
    <strong>DinoSsr</strong> can be deployed to
    <a href="https://deno.com/deploy" target="_blank">Deno Deploy</a> with a few
    limitations.
  </p>
  <p>
    <strong>DinoSsr</strong> compiles and bundles all
    <a href="/docs/routing/">Svelte routes</a>
    when the server starts up. On <strong>Deno Deploy</strong>
    <a href="/docs/advanced-routes/">advanced routes</a>
    are also bundled due to lack of true
    <a
      href="https://github.com/denoland/deploy_feedback/issues/433"
      target="_blank">dynamic imports</a
    >. If you need 3rd party libraries use
    <a href="/docs/middleware/">middleware routes</a> instead as they are not bundled.
  </p>
  <h2>Prebuilt Bundles</h2>
  <p>
    The <a href="/docs/server/">Deno server</a> can take a few seconds to start up.
    Exact time depends on route size and CPU power. However, it will likely be too
    slow on Deno Deploy where isolates are shut down and started up on request.
  </p>
  <p>
    Bundles can be built and published before deployment allowing for near
    instant start up. This is done setting the <code>DINOSSR_BUILD</code>
    <a href="/docs/environment-variables/">environment variable</a>.
  </p>
  <p>This can be done with a <strong>GitHub Action</strong> for example:</p>
  <Code
    language="yaml"
    code={`steps:
  - name: Clone Repo
    uses: actions/checkout@v4
  - name: Setup Deno
    uses: denoland/setup-deno@v1
    with:
      deno-version: vx.x.x
  - name: Build
    run: DINOSSR_BUILD=1 DINOSSR_DEPLOY_ID=\${{ github.run_id }} deno run -A mod.ts
  - name: Deploy
    uses: denoland/deployctl@v1
    with:
      project: dinossr
      entrypoint: mod.ts
`}
  />
  <p>
    This is not necessary for a normal Deno server unless it is very low
    powered.
  </p>
  <Pagination />
</Layout>
