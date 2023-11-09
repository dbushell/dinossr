<script>
  import Layout from '@components/layout.svelte';
  import DocsBreadcrumb from '@components/docs-breadcrumb.svelte';
  import DocsNav from '@components/docs-nav.svelte';
  import Code from '@components/code.svelte';

  const heading = 'Routing';
  const title = `DinoSrr - ${heading} (Documentation)`;
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<Layout>
  <h1>{heading}</h1>
  <DocsBreadcrumb />
  <div class="mb-4">
    <p>
      Routes are <code>mod.svelte</code> files nested in the
      <code>routes</code> directory.
    </p>
    <p>
      Routes can export a <code>pattern</code> to extend the pathname using the
      <a
        href="https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API"
        target="_blank">URL Pattern API</a
      >.
    </p>
    <p>For example:</p>
    <table class="table">
      <thead>
        <tr>
          <th scope="col"><code>routes/</code></th>
          <th scope="col">Pattern export</th>
          <th scope="col">URL pathname</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>mod.svelte</code></td>
          <td>&nbsp;</td>
          <td><code>/</code></td>
        </tr>
        <tr>
          <td><code>docs/mod.svelte</code></td>
          <td>&nbsp;</td>
          <td><code>/docs/</code></td>
        </tr>
        <tr>
          <td><code>blog/mod.svelte</code></td>
          <td><code>/:slug</code></td>
          <td><code>/blog/hello-world/</code></td>
        </tr>
        <tr>
          <td><code>blog/(post)/mod.svelte</code></td>
          <td><code>/:year(\\d+)/:month(\\d+)/:slug</code></td>
          <td><code>/blog/2023/11/hello-world/</code></td>
        </tr>
      </tbody>
    </table>
    <p>
      Using parentheses around a directory name removes it from the URL
      pathname.
    </p>
    <p>
      Patterns are exported from the Svelte component <a
        href="https://svelte.dev/docs/svelte-components#script-context-module"
        target="_blank">module script</a
      >
      leading the <code>mod.svelte</code> route file.
    </p>
    <Code
      language="javascript"
      code={`
<script context="module">
  export const pattern = '/:year(\\d+)/:month(\\d+)/:slug';
</script>
`}
    />
  </div>
  <DocsNav />
</Layout>
