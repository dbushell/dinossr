<div class="App">
  <slot />
</div>

<style>
  :root {
    --external: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18.885 2a1 1 0 0 0-1-1h-6a1 1 0 1 0 0 2h3.586L9.178 9.293a1 1 0 1 0 1.414 1.414l6.293-6.293V8a1 1 0 1 0 2 0zM3.009 3a2.012 2.012 0 0 0-1.998 2.218c.148 1.453.374 3.978.374 5.782 0 1.746-.212 4.17-.36 5.642a2.028 2.028 0 0 0 2.218 2.218c1.473-.148 3.896-.36 5.642-.36 1.804 0 4.33.226 5.782.374a2.012 2.012 0 0 0 2.218-1.998V12a1 1 0 1 0-2 0v4.878l-.003.003a.018.018 0 0 1-.006.003h-.006c-1.451-.147-4.068-.384-5.985-.384-1.857 0-4.37.222-5.842.37h-.008a.034.034 0 0 1-.012-.008.033.033 0 0 1-.008-.012.01.01 0 0 1 0-.002v-.006c.148-1.473.37-3.985.37-5.842 0-1.917-.237-4.534-.385-5.985v-.006l.004-.006A.016.016 0 0 1 3.007 5h4.878a1 1 0 0 0 0-2z"/></svg>');
  }

  :global(:where(main > p) [href^='http']),
  :global(:where(main > * > li) [href^='http']) {
    --icon-size: calc(var(--font-size) * 0.5);
    display: inline-block;
    position: relative;
    margin-inline-end: var(--icon-size);
  }

  :global(:where(main > p) [href^='http']::after),
  :global(:where(main > * > li) [href^='http']::after) {
    aspect-ratio: 1 / 1;
    background: currentColor;
    content: '';
    display: block;
    inline-size: var(--icon-size);
    inset-block-start: 20%;
    inset-inline-start: calc(100% + (var(--icon-size) / 4));
    mask: var(--external) center center / 100% auto no-repeat;
    position: absolute;
  }
</style>
