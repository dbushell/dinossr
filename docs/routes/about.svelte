<script context="module">
  export const pattern = '/';
</script>

<script>
  import Layout from '@components/layout.svelte';
  import Alert from '@components/docs-alert.svelte';
  import Code from '@components/code.svelte';
  import {Container} from '@components/patchwork.ts';

  const heading = 'About DinoSsr';
  const title = `DinoSsr - ${heading}`;
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<Layout>
  <Container>
    <main>
      <h1>{heading}</h1>
      <p>
        DinoSsr is a minimal web framework for <a
          href="https://deno.land/"
          target="_blank">Deno</a
        >
        and <a href="https://svelte.dev/" target="_blank">Svelte</a> fans. It's
        similar to
        <a href="https://kit.svelte.dev/" target="_blank">SvelteKit</a>
        and <a href="https://fresh.deno.dev/" target="_blank">Fresh</a> but with
        a smaller focus.
      </p>
      <p>DinoSsr aims to achieve:</p>
      <ul>
        <li>Easy setup with minimal ceremony</li>
        <li>Just-in-time rendering with no build step <sup>†</sup></li>
      </ul>
      <p>DinoSsr is perfect for:</p>
      <ul>
        <li>Small content based websites</li>
        <li>Quick prototyping</li>
      </ul>
      <h2>Why Svelte?</h2>
      <p>
        Svelte allows for HTML components and templates using web standards.
      </p>

      <p>A basic Svelte component is just HTML:</p>
      <Code
        language="html"
        code={`
<header>
  <h1>Hello, World!</h1>
</header>
`}
      />
      <p>This can be reused in other components:</p>
      <Code
        language="svelte"
        code={`
<script>
  import Header from 'header.svelte';
<\/script>

<Header />
<p>Welcome to my website!</p>
`}
      />
      <p>This simplicity is perfect for server-side rendering.</p>
      <p>
        <strong>DinoSsr</strong> has minimal setup and works with only a single route
        and entry point.
      </p>
      <Code language="text" code={`routes/index.svelte\nmod.ts`} />
      <p><code>mod.ts</code> contains:</p>
      <Code
        language="javascript"
        code={`
import {DinoSsr} from 'dinossr';
const dinossr = new DinoSsr();
await dinossr.init();
        `}
      />
      <p>The server is started with:</p>
      <Code language="bash" code="deno run -A test mod.ts" />
      <p>That's all you need to get started!</p>
      <p>See the <a href="/docs/">documentation</a> to learn more.</p>
      <Alert />
      <p><sup>†</sup> there's always a build step.</p>
    </main>
  </Container>
</Layout>
