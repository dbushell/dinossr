import {DinoServer} from '../mod.ts';

const dir = new URL('./', import.meta.url).pathname;

const dinossr = new DinoServer(dir, {
  dev: true
});

await dinossr.init();
