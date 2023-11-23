import {requestMap} from './mod.ts';
import type {Router} from '../types.ts';

const defaultPolicies = {
  'child-src': ["'self'"],
  'connect-src': ["'self'"],
  'default-src': ["'self'"],
  'frame-src': ["'self'"],
  'font-src': ["'self'"],
  'img-src': ["'self'"],
  'manifest-src': ["'self'"],
  'media-src': ["'self'"],
  'object-src': ["'none'"],
  'prefetch-src': ["'self'"],
  'script-src': ["'self'"],
  'style-src': ["'self'"],
  'worker-src': ["'self'"],
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
      csp[key].push(...value.split(',').map((s) => `${s.trim()}`));
    }
  }
  return csp;
};

export const addPolicyRoute = (router: Router) => {
  router.use((request, response) => {
    if (requestMap.get(request)?.ignore) return;
    if (!response) return;
    const csp = getPolicies(response);
    // Remove redundant policies
    if (csp['default-src'].includes("'self'")) {
      for (const [k, v] of Object.entries(csp)) {
        if (k === 'default-src') continue;
        if (v.length === 1 && v[0] === "'self'") {
          delete csp[k as keyof typeof csp];
        }
      }
    }
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
