import {DinoSsr} from '../mod.ts';

const dir = new URL('./', import.meta.url).pathname;

const dinossr = new DinoSsr(dir, {
  dev: true
});

await dinossr.init();
