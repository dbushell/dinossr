<script context="module">
  const unicode = [
    '🕐',
    '🕑',
    '🕒',
    '🕓',
    '🕔',
    '🕕',
    '🕖',
    '🕗',
    '🕘',
    '🕙',
    '🕚',
    '🕛'
  ];
</script>

<script>
  import {onMount} from 'svelte';
  import Island from '@dinossr/island';

  export let title = '';

  let datetime = '';
  let emoji = '';
  let time = '';

  const update = () => {
    const now = new Date();
    now.setMilliseconds(0);
    datetime = now.toISOString();
    time = now.toLocaleTimeString('en-GB');
    emoji = unicode[(now.getHours() % 12 || 12) - 1];
  };

  update();

  onMount(() => {
    setInterval(update, 1000);
  });
</script>

<Island props={$$props}>
  <time {title} {datetime}>{emoji} <code>{time}</code></time>
</Island>
