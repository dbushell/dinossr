import {requestMap} from './mod.ts';
import type {Router} from '../types.ts';

const defaultPolicies = {
  'default-src': ["'self'"],
  'style-src': ["'self'"],
  'script-src': ["'self'"],
  'base-uri': ["'none'"],
  'frame-ancestors': ["'none'"],
  'form-action': ["'self'"]
};

const getPolicies = (response: Response) => {
  // @ts-ignore: all properties will be set
  const csp: typeof defaultPolicies = {};
  for (const [k, v] of Object.entries(defaultPolicies)) {
    const key = k as keyof typeof defaultPolicies;
    csp[key] = [...v];
    const xkey = `x-${key}`;
    if (response.headers.has(xkey)) {
      const value = response.headers.get(xkey)!;
      response.headers.delete(xkey);
      csp[key].push(...value.split(',').map((s) => `'${s.trim()}'`));
    }
  }
  return csp;
};

export const addPolicyRoute = (router: Router) => {
  router.use((request, response) => {
    if (requestMap.get(request)?.ignore) return;
    if (!response) return;
    const csp = getPolicies(response);
    response.headers.set('referrer-policy', 'same-origin');
    response.headers.set(
      'content-security-policy',
      Object.entries(csp)
        .map(([k, v]) => `${k} ${v.join(' ')}`)
        .join('; ')
    );
    return response;
  });
};
