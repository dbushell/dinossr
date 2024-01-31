const TOKENS = new Map<string, string>();

if (Deno.env.has('DENO_AUTH_TOKENS')) {
  const tokens = Deno.env
    .get('DENO_AUTH_TOKENS')!
    .split(';')
    .map((t) => t.trim().split('@'));
  for (const [token, host] of tokens) {
    TOKENS.set(host, token);
  }
}

const fetchHeaders = (fetchpath: string) => {
  const headers: Record<string, string> = {};
  const url = new URL(fetchpath);
  for (const [k, v] of TOKENS) {
    if (url.host.startsWith(k)) {
      headers['authorization'] = `Bearer ${v}`;
      break;
    }
  }
  return headers;
};

export const fetchImport = (fetchpath: string) => {
  return fetch(fetchpath, {
    headers: {...fetchHeaders(fetchpath)}
  });
};
