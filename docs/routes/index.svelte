<script>
  import Layout from '@components/layout.svelte';
  import Hero from '@components/hero.svelte';
  import {Container, Button} from '@components/patchwork.ts';

  const description = 'A minimal web framework for Deno and Svelte fans';
  const title = `DinoSsr - ${description}`;
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<Layout>
  <Hero heading="DinoSsr" {description} />
  <Container>
    <div class="Card-container">
      <article class="Card">
        <h3>Svelte: Just in Time</h3>
        <p>
          DinoSsr renders server-side with Svelte templates and no build step.
        </p>
        <Button small href="/docs/" label="Documentation" />
      </article>
      <article class="Card">
        <h3>Flexible Routing</h3>
        <p>
          DinoSsr uses file based routing with web standard <strong
            >URL Pattern API</strong
          > configuration.
        </p>
        <Button small href="/docs/routing/" label="Routing Docs" />
      </article>
      <article class="Card">
        <h3>Island Hydration</h3>
        <p>
          Islands are Svelte components that become interactive on the
          front-end.
        </p>
        <Button small href="/docs/islands/" label="Island Docs" />
      </article>
    </div>
  </Container>
  <Container>
    <div class="Alert">
      <p>
        <strong>DinoSsr</strong> is an experimental work in progress and subject
        to change!
      </p>
    </div>
  </Container>
</Layout>
