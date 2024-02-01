import {DinoSsr} from '../mod.ts';

const dinossr = new DinoSsr(import.meta.dirname, {
  dev: true
});

await dinossr.init();
