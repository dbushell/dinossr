<script context="module">
  export const pattern = '/';
</script>

<script>
  import Layout from '@components/layout-docs.svelte';
  import Alert from '@components/docs-alert.svelte';
  import Pagination from '@components/pagination.svelte';
  import Code from '@components/code.svelte';

  const heading = 'Advanced Routes';
  const title = `DinoSsr - ${heading} (Documentation)`;
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<Layout>
  <h1>{heading}</h1>
  <Alert />
  <p>
    <strong>DinoSsr</strong> is built upon
    <a href="/docs/velocirouter/">VelociRouter</a>. The
    <code>request</code> and <code>response</code> are passed through all
    matching handles. <a href="/docs/routing/">Routes</a> can also be JavaScript
    or TypeScript files exporting a handle. The same file path and URL pattern matching
    is applied.
  </p>
  <p>
    JavaScript routes can export a <code>get</code> and or <code>post</code> function.
  </p>
  <p><code>routes/(all)/index.js</code></p>
  <Code
    language="javascript"
    code={`
export const pattern = '/*';

export const order = 999;

export const get = async (props) => {
  if (props.response) {
    props.response.headers.set('x-powered-by', 'DinoSsr');
  }
};
`}
  />
  <p>
    The <strong>optional</strong> <code>order</code> export gives an explicit
    order to assign the handle. If no <code>order</code> is exported routes are handled
    in the order they're discovered.
  </p>
  <h2>Parameters</h2>
  <p>
    See the <a href="/docs/velocirouter/#handle-functions"
      ><strong>VelociRouter</strong> documentation</a
    >
    for all <code>props</code> passed to the handle function.
  </p>
  <h3><code>platform</code></h3>
  <p>Includes the follow properties:</p>
  <h4><code>platform.info</code></h4>
  <p>
    The <a href="https://deno.land/api?s=Deno.ServeHandlerInfo" target="_blank"
      ><code>ServeHandlerInfo</code></a
    > for the request.
  </p>
  <h4><code>platform.deployHash</code></h4>
  <p>
    The current <strong>DinoSsr</strong> deploy hash (useful for cache busting, etc).
  </p>
  <h4><code>platform.cookies</code></h4>
  <p>
    A <code>Map</code> object to read, set, or delete cookies in the response header.
  </p>
  <h4><code>platform.publicData</code></h4>
  <p>An object to read and assign <a href="/docs/context/">context data</a>.</p>
  <h4><code>platform.serverData</code></h4>
  <p>An object to read and assign <a href="/docs/context/">context data</a>.</p>
  <Pagination />
</Layout>
