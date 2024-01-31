<script context="module">
  export const island = true;

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

<script lang="ts">
  import {onMount} from 'svelte';

  export let title: string = '';
  export let offset: number = 0;

  let datetime: string;
  let emoji: string;
  let time: string;

  const update = () => {
    const now = new Date();
    now.setMilliseconds(0);
    if (offset) {
      now.setHours(now.getHours() + offset);
    }
    datetime = now.toISOString();
    time = now.toLocaleTimeString('en-GB');
    emoji = unicode[(now.getHours() % 12 || 12) - 1];
  };

  update();

  onMount(() => {
    setInterval(update, 1000);
  });
</script>

<time {title} {datetime}>{emoji} <code>{time}</code></time>

<style>
  time {
    display: block;
    font-size: 1.5rem;
    margin: 2rem 0;
  }
</style>
