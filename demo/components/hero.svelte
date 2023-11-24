<script>
  import {onMount} from 'svelte';
  import Island from '@dinossr/island';

  export let heading = '';
  export let description = '';

  let hero;
  let heroMain;
  let heroHeading;

  let top = 0;
  let height = 0;
  let mainHeight = 0;
  let headingHeight = 0;

  const space = () => {
    return (
      Number.parseInt(
        window
          .getComputedStyle(heroMain)
          .getPropertyValue('padding-block-start')
      ) * 2 || 0
    );
  };

  const onResize = () => {
    top = hero.offsetTop;
    height = hero.offsetHeight;
    mainHeight = heroMain.offsetHeight;
    headingHeight = heroHeading.offsetHeight + space();
  };

  const onLoad = () => {
    onResize();
  };

  onMount(() => {
    onLoad();
    requestAnimationFrame(onLoad);
  });
</script>

<svelte:window on:load={onLoad} on:resize={onResize} />

<Island props={$$props}>
  <div
    class="Grid | Hero"
    bind:this={hero}
    style:--hero-offset-top={top}
    style:--hero-offset-height={height}
    style:--hero-main-offset-height={mainHeight}
    style:--hero-heading-offset-height={headingHeight}
  >
    <div class="Hero__main" bind:this={heroMain}>
      <svg
        class="Hero__dino"
        alt="look out! a dinosaur!"
        xmlns="http://www.w3.org/2000/svg"
        width="350"
        height="370"
        viewBox="0 0 350 370"
      >
        <path
          d="M238.44 304.43c.83 6.71 1.91 13.41 2.42 20.15.73 9.62 1.38 19.27 1.44 28.92.05 7.99-1.62 9.22-9.44 9.23-10 .01-20 .04-30-.01-6.15-.03-7.71-1.15-7.23-7.35.8-10.27 2.67-20.45 3.53-30.72.55-6.57.1-13.22.1-20.18-39.88 15.95-79.49 13.55-119.77-.89.14 2.78.17 4.84.35 6.88 1.15 12.76 2.33 25.51 3.48 38.27.1 1.16.03 2.33-.03 3.5-.51 9.47-1.6 10.51-10.91 10.51s-18.33.04-27.5-.02c-6.91-.05-9.18-2.01-8.96-8.96.18-5.79.55-11.79 2.22-17.28 6.67-21.97 4.26-43.81.25-65.76-1.99-10.86-5.15-21.16-10.2-31.15-8.96-17.74-12.09-37.3-15.07-56.73-3.47-22.59-5.17-45.36-4.13-68.23 1.56-34.09 14.51-63.53 38.37-87.66C61.29 12.86 79.05 6.44 99.1 7.35c5.81.27 11.65.62 17.4 1.44 15.17 2.15 29.63 16.84 31.8 31.96 1.31 9.17-1.7 14.06-10.93 14.73-12.43.89-24.96.5-37.44.78-4.98.11-9.98.29-14.92.9-12.2 1.5-21.18 8.2-26.58 18.91-11.22 22.3-15.57 46.02-11.51 70.78 3.56 21.66 14.53 30.79 36.78 30.54 17.14-.19 34.25-1.91 51.4-2.37 17.38-.47 34.48 1.9 51.49 5.72 22.44 5.04 39.75 17.45 51.67 36.49 12.26 19.59 23.03 40.11 34.23 60.36 8.06 14.57 15.15 29.71 23.81 43.91 5.13 8.41 12.12 15.8 18.92 23.04 4.5 4.8 10.62 7.17 17.46 7.7 3.5.27 9.01-.24 8.61 5.17-.39 5.34-5.86 4.72-9.62 4.67-17.88-.23-33.94-6.13-48.43-16.45-12.6-8.98-22.81-20.38-32.65-32.19-3.07-3.69-6.78-6.86-10.2-10.27-.65.43-1.31.86-1.96 1.29v-.03Z"
        />
      </svg>
      <h1 class="H0 | Hero__heading" bind:this={heroHeading}>{heading}</h1>
      <div class="Hero__intro">
        <p>{description}</p>
      </div>
    </div>
  </div>
</Island>
