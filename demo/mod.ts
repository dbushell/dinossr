import {DinoServer} from 'https://raw.githubusercontent.com/dbushell/dinossr/v0.12.1/mod.ts';

const dir = new URL('./', import.meta.url).pathname;

const dinossr = new DinoServer(dir, {
  bumbler: {dev: true}
});

await dinossr.init();
