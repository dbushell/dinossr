<script lang="ts">
  import Header from '@components/header.svelte';
  import Footer from '@components/footer.svelte';
  import Main from '@components/main.svelte';
  import Clock from '@components/clock.svelte';

  const title = 'DinoSsr Demo';
  const heading = 'Hello, World!';
  const footerItems = [
    {
      name: 'David Bushell',
      href: 'https://dbushell.com'
    },
    {
      name: 'GitHub',
      href: 'https://github.com/dbushell/dinossr'
    }
  ];
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<Header {heading} />
<Main>
  <p>This is a basic DinoSsr demo.</p>
  <Clock title="Your local time" />
</Main>
<Footer menu={footerItems} />
