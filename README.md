# 🦕 DinoSsr

Documentation 👉 [ssr.rocks](https://ssr.rocks)

A minimal web framework powered by [VelociRouter](https://github.com/dbushell/velocirouter).

## Usage

Add dependency from JSR: [@ssr/dinossr](https://jsr.io/@ssr/dinossr)

```javascript
import {DinoSsr} from 'dinossr';

const dir = new URL('./', import.meta.url).pathname;
const dinossr = new DinoServer(dir);
await dinossr.init();
```

## Documentation

[DinoSsr Documentation](https://ssr.rocks)

* * *

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://dbushell.com/tip/)

[MIT License](/LICENSE) | Copyright © 2024 [David Bushell](https://dbushell.com)
