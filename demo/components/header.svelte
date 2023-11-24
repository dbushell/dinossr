<script>
  import {onMount} from 'svelte';
  import Island from '@dinossr/island';
  import Menu from '@components/menu.svelte';
  import IconMenu from '@components/icon-menu.svelte';
  import IconClose from '@components/icon-close.svelte';

  export let heading = 'DinoSsr';
  export let tag = 'Alpha';

  export let menuItems = [
    {
      href: '/',
      name: 'Home'
    },
    {
      href: '/about/',
      name: 'About'
    },
    {
      href: '/docs/',
      name: 'Documentation'
    },
    {
      href: 'https://github.com/dbushell/dinossr/',
      name: 'GitHub',
      button: true
    }
  ];

  let nav;
  let toggle;
  let open = false;

  // Native popover event
  const onBefore = (ev) => {
    open = ev.newState === 'open';
  };

  // Fallback popover toggle
  const togglePopover = (show = true) => {
    if ('popover' in nav) return;
    if (show) {
      nav.classList.add(':popover-open');
      open = true;
    } else {
      nav.classList.remove(':popover-open');
      open = false;
    }
  };

  const onResize = () => {
    if (!open) return;
    // TODO: fix for fallback popover
    const display = window.getComputedStyle(toggle).display;
    if (display === 'none') {
      if ('popover' in nav) {
        nav.hidePopover();
      } else {
        togglePopover(false);
      }
    }
  };

  let scrollY = 0;
  let scrollY2 = 0;
  let scrollDir = 1;

  const onScroll = () => {
    scrollY2 = scrollY;
    scrollY = window.scrollY;
    scrollDir = Math.max(-1, Math.min(1, scrollY - scrollY2));
    scrollDir = scrollDir === 0 ? 1 : scrollDir;
    document.documentElement.style.setProperty('--scroll-y', scrollY);
    document.documentElement.style.setProperty('--scroll-dir', scrollDir);
  };

  const onLoad = () => {
    onResize();
    onScroll();
  };

  onMount(() => {
    onLoad();
    requestAnimationFrame(onLoad);
  });
</script>

<svelte:window on:load={onLoad} on:resize={onResize} on:scroll={onScroll} />

<Island props={$$props}>
  <header class="Grid | Header">
    <div class="Header__main">
      <a class="Header__logo" href="/">
        {heading}
        {#if tag}<span class="Header__tag">{tag}</span>{/if}
      </a>
      <button
        bind:this={toggle}
        on:click={() => togglePopover(true)}
        class="Button Button--nav"
        aria-label="toggle navigation"
        popovertarget="nav"
        popovertargetaction="toggle"
      >
        <IconMenu />
      </button>
      <nav
        bind:this={nav}
        on:beforetoggle={onBefore}
        class="Grid | Header__nav"
        id="nav"
        popover
      >
        <button
          on:click={() => togglePopover(false)}
          class="Button Button--nav"
          aria-label="hide navigation"
          popovertarget="nav"
          popovertargetaction="hide"
        >
          <IconClose />
        </button>
        <Menu items={menuItems} />
      </nav>
    </div>
  </header>
</Island>
