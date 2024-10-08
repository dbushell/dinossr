# 🦕 DinoSsr

⚠️ **Development paused!** ⚠️

Development of DinoSsr has paused. I am working on a lightweight successor, [Hyperserve](https://github.com/dbushell/hyperserve). I may return to DinoSsr after Svelte 5 has released.

A minimal web framework powered by [VelociRouter](https://github.com/dbushell/velocirouter).

## Usage

```javascript
import {DinoSsr} from 'jsr:@ssr/dinossr';

const dir = new URL('./', import.meta.url).pathname;
const dinossr = new DinoSsr(dir);
await dinossr.init();
```

* * *

[MIT License](/LICENSE) | Copyright © 2024 [David Bushell](https://dbushell.com)
