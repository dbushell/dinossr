<script context="module">
  import {highlight} from '@lib/highlight.js';

  export const pattern = '/';

  export const load = () => {
    return {
      code1: highlight(
        'html',
        `
<header>
  <h1>Hello, World!</h1>
</header>
`
      ),
      code2: highlight(
        'svelte',
        `
<script>
  import Header from 'header.svelte';
<\/script>

<Header />
<p>Welcome to my website!</p>
`
      ),
      code3: highlight(
        'javascript',
        `
import {DinoServer} from 'dinossr';
const dinossr = new DinoServer();
await dinossr.init();
`
      )
    };
  };
</script>

<script>
  import {getContext} from 'svelte';
  import Layout from '@components/layout.svelte';
  import Container from '@components/container.svelte';
  import Alert from '@components/docs-alert.svelte';
  import Button from '@components/button.svelte';
  import Code from '@components/code.svelte';

  const heading = 'About DinoSsr';
  const title = `DinoSsr - ${heading}`;

  const {code1, code2, code3} = getContext('data') ?? {};
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
      <Code language="html" code={code1} />
      <p>This can be reused in other components:</p>
      <Code language="svelte" code={code2} />
      <p>This simplicity is perfect for server-side rendering.</p>
      <p>
        <strong>DinoSsr</strong> has minimal setup and works with only a single route
        and entry point.
      </p>
      <Code language="text" code={`routes/index.svelte\nmod.ts`} />
      <p><code>mod.ts</code> contains:</p>
      <Code language="javascript" code={code3} />
      <p>The server is started with:</p>
      <Code language="bash" code="deno run -A mod.ts" />
      <p>That's all you need to get started!</p>
      <p>See the <a href="/docs/">documentation</a> to learn more.</p>
      <Alert />
      <p><sup>†</sup> there's always a build step.</p>
    </main>
  </Container>
</Layout>
