<script context="module">
  export const pattern = '/';
</script>

<script>
  import Layout from '@components/layout-docs.svelte';
  import Alert from '@components/docs-alert.svelte';
  import Pagination from '@components/pagination.svelte';
  import Code from '@components/code.svelte';

  const heading = 'VelociRouter';
  const title = `DinoSsr - ${heading} (Documentation)`;
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<Layout>
  <h1>{heading}</h1>
  <Alert />
  <p>
    <strong>VelociRouter</strong> is a standalone module that can be used
    outside of <strong>DinoSsr</strong> in all JavaScript runtimes.
  </p>
  <p>Import and initialize the <code>Router</code> class:</p>
  <Code
    language="javascript"
    code={`
import {Router} from 'https://deno.land/x/velocirouter/mod.ts';

const router = new Router();
    `}
  />
  <p>
    <small
      >VelociRouter is also published to <a
        href="https://www.npmjs.com/package/velocirouter-js"
        target="_blank">NPM</a
      >
      under the <code>velocirouter-js</code> package name.</small
    >
  </p>
  <p>
    For complete type information see the <a
      href="https://github.com/dbushell/velocirouter/blob/main/src/types.ts"
      target="_blank">TypeScript definitions</a
    >.
  </p>

  <h2 id="options">Options</h2>
  <p>The <code>Router</code> class accepts the following configuration:</p>
  <Code
    language="javascript"
    code={`
const router = new Router({
  onError: (error, request) => {
    console.error(error);
    return new Response(null {status: 500});
  },
  onNoMatch: (request) => {
    return new Response(null, {status: 404});
  },
  autoHead: false
});
    `}
  />
  <p id="on-error">
    <code>onError</code> - a fallback handle when an error is thrown. Default is
    a 500 response.
  </p>
  <p id="on-no-match">
    <code>onNoMatch</code> - a fallback handle when <strong>no response</strong>
    is returned from any matching routes. Default is a 404 response.
  </p>
  <p>
    <code>autoHead</code> - automatically generate corresponding
    <code
      ><a
        href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/HEAD"
        target="_blank">HEAD</a
      ></code
    >
    handles for any <code>GET</code> handles attached. Default is
    <code>true</code>.
  </p>

  <h2 id="route-handles">Route Handles</h2>
  <p>
    Route handles are attached using an <a
      href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods"
      target="_blank">HTTP method</a
    >
    name:
  </p>
  <Code
    language="javascript"
    code={`
router.get('/*', () => {
  return new Response('Hello, World!');
});
`}
  />
  <p>
    <code>Router</code> method names like <code>get</code> and <code>post</code>
    are lower case.
  </p>
  <p>
    Requests are passed through <strong>all matching handles</strong> in the order
    they were attached.
  </p>
  <p>
    The first parameter is a <a
      href="https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API"
      target="_blank">URL Pattern API</a
    >
    input. String inputs match the URL pathname. The string <code>'/*'</code> will
    match all requests. Object inputs are used to match parts of the URL. The second
    parameter is a handle function.
  </p>
  <Code
    language="javascript"
    code={`
router.get({pathname: '/hello/:name'}, ({match}) => {
  const {name} = match.pathname.groups;
  return new Response(\`Hello \${name}!\`);
});
`}
  />

  <h3 id="handle-functions">Handle Functions</h3>
  <p>
    The handle function receives a <code>props</code> object as the only argument.
  </p>
  <p>The <code>props</code> object includes:</p>
  <ul>
    <li>
      <code>request</code> - the
      <code
        ><a
          href="https://developer.mozilla.org/en-US/docs/Web/API/Request"
          target="_blank">Request</a
        ></code
      > object matching the route pattern
    </li>
    <li>
      <code>response</code> - the
      <code
        ><a
          href="https://developer.mozilla.org/en-US/docs/Web/API/Response"
          target="_blank">Response</a
        ></code
      >
      object returned by a previous handle (or <code>undefined</code>)
    </li>
    <li><code>match</code> - the <code>URLPatternResult</code></li>
    <li><code>platform</code> - any platform specific data</li>
    <li>
      <code>stopPropagation</code> - a function to stop any further handles being
      called
    </li>
  </ul>

  <h4>Handle Return Values</h4>
  <p>
    If the handle returns <code>void</code> or <code>undefined</code> it has
    <strong>no effect</strong>
    on the route. Any previous handle's <code>Response</code> is used.
  </p>
  <p>
    If the handle returns <code>null</code> any previous handles are ignored.
    The route will be handled by
    <code><a href="#on-no-match">onNoMatch</a></code>
    unless any <strong>following</strong> handles exist.
  </p>
  <p>
    If the handles returns a <code>Response</code> that becomes the route's response
    unless any following handles have an effect.
  </p>
  <p>
    Handles can return an object: <code>{`{request, response}`}</code>. The
    <code>request</code>
    property changes the routes <code>Request</code> passed to any following
    handles. The optional <code>response</code> property follows the same rules above.
  </p>
  <p>
    If an uncaught error is thrown inside a handle the
    <code><a href="#on-error">onError</a></code> option is used.
  </p>

  <h2 id="middleware">Middleware</h2>
  <p>Middleware is added with the <code>use</code> method:</p>
  <Code
    language="javascript"
    code={`
router.use(({request}) => {
  console.log(\`[\${request.method}] \${request.url}\`);
});
`}
  />
  <p>
    Handles attached with <code>use</code> match <strong>all requests</strong>.
    They are executed in order <strong>before</strong> all other route handles.
  </p>
  <p>
    A special <code>all</code> handle will match all HTTP methods with a pattern:
  </p>
  <Code
    language="javascript"
    code={`
router.all('/*', ({response}) => {
  if (response) {
    response.headers.set('x-powered-by', 'velocirouter');
  }
});
`}
  />
  <p>
    Handles attached with <code>all</code> are executed in order alongside route
    handles after any middleware.
  </p>

  <h2 id="deno-server">Deno Server</h2>
  <p>VelociRouter can be used with <code>Deno.serve</code>:</p>
  <Code
    language="javascript"
    code={`
const router = new Router<Deno.ServeHandlerInfo>();

Deno.serve(
  (request, info) => router.handle(request, info);
);
`}
  />

  <h2 id="other-runtimes">Other Runtimes</h2>
  <p>
    Pass a <code>Request</code> to <code>Router.handle</code> along with any
    platform specific data. The request is passed through all matching routes
    and a final <code>Response</code> is returned.
  </p>
  <p>
    Only Deno and Chromium based browsers have <a
      href="https://developer.mozilla.org/en-US/docs/Web/API/URLPattern"
      target="_blank">URL Pattern API support</a
    >
    right now. Other runtimes like Bun and Node require a
    <a href="https://github.com/kenchris/urlpattern-polyfill" target="_blank"
      >polyfill</a
    >.
  </p>
  <Pagination />
</Layout>
