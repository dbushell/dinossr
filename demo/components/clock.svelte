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

  let datetime = '';
  let emoji = '';
  let time = '';

  const update = () => {
    const now = new Date();
    now.setMilliseconds(0);
    datetime = now.toISOString();
    emoji = unicode[(now.getHours() % 12 || 12) - 1];
    const hh = now.getHours().toString().padStart(2, '0');
    const mm = now.getMinutes().toString().padStart(2, '0');
    const ss = now.getSeconds().toString().padStart(2, '0');
    time = `${hh}:${mm}:${ss}`;
  };

  update();

  onMount(() => {
    setInterval(update, 1000);
  });
</script>

<Island>
  <time {datetime}>{emoji} <code>{time}</code></time>
</Island>
