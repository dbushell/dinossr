# 🦕 DinoSsr

A minimal web framework powered by [VelociRouter](https://github.com/dbushell/velocirouter).

## Usage

```javascript
import {DinoSsr} from 'jsr:@ssr/dinossr';

const dir = new URL('./', import.meta.url).pathname;
const dinossr = new DinoSsr(dir);
await dinossr.init();
```

## Documentation

DinoSsr Documentation 👉 [ssr.rocks](https://ssr.rocks) (coming soon)

* * *

[MIT License](/LICENSE) | Copyright © 2024 [David Bushell](https://dbushell.com)
