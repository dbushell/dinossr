<script context="module">
  export const pattern = '/';
</script>

<script>
  import Layout from '@components/layout-docs.svelte';
  import Alert from '@components/docs-alert.svelte';
  import Pagination from '@components/pagination.svelte';

  const heading = 'Introduction';
  const title = `DinoSsr - ${heading} (Documentation)`;
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<Layout>
  <h1>{heading}</h1>
  <Alert />
  <p>
    <strong>DinoSsr</strong> is a
    <a href="https://deno.com/" target="_blank">Deno</a>
    server-side web framework built upon
    <a href="/docs/velocirouter/">VelociRouter</a>.
  </p>
  <p>
    The router takes a <code>Request</code> and passes it through all matching
    handles before serving the final <code>Response</code>.
  </p>
  <h2>How it works</h2>
  <p>
    When <a href="/docs/server/">the server</a> launches it automatically scans
    the <a href="/docs/project-structure/">project directory</a>.
  </p>
  <p>Router handles are generated for:</p>
  <ol>
    <li>Direct path routes for files in <code>static/</code></li>
    <li>Dynamic path routes built with Svelte in <code>routes/</code></li>
  </ol>
  <p>
    Static files use <code>serveFile</code> from the
    <a
      href="https://deno.land/std@0.214.0/http/file_server.ts?s=serveFile"
      target="_blank">Deno Standard Library</a
    >
    to create the initial <code>Response</code>.
    <a href="/docs/routing/">Svelte routes</a>
    are compiled and bundled just-in-time to render their <code>Response</code>
    wrapped in <code>app.html</code>.
  </p>
  <h3>Router magic ✨</h3>
  <p>
    Unlike other routers <a href="/docs/velocirouter/"
      >VelociRouter</a
    >
    allows you to chain handles. You can do things like modify the
    <code>Response</code>
    HTML body after Svelte templates are rendered. Or even add database API endpoints
    running on the same server with <a href="/docs/middleware/">middleware</a>.
  </p>
  <h2>And more...</h2>
  <p>
    Although <strong>DinoSsr</strong> is primarily server-side its
    <a href="/docs/islands/">Island components</a> can be rehydrated in the browser.
  </p>
  <Pagination />
</Layout>
