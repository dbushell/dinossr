import {encodeBase64} from 'https://deno.land/std@0.214.0/encoding/base64.ts';

import {default as random} from 'npm:lodash/random.js';

export const pattern = '/';

const get = () => {
  const {version} = Deno;
  return Response.json({
    ...version,
    random: random(0, 100),
    base64: encodeBase64(JSON.stringify(version))
  });
};

export default get;
