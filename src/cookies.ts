import type {CookieOptions, CookieMap} from './types.ts';

/*!
 * Based on: https://github.com/jshttp/cookie
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

// deno-lint-ignore no-control-regex
const fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;

export default class Cookies implements CookieMap {
  #set: Set<string> = new Set();
  #map: CookieMap = new Map();

  constructor(header: string = '') {
    for (const [name, value] of Object.entries(Cookies.parse(header))) {
      this.#map.set(name, {value});
    }
  }

  [Symbol.iterator]() {
    return this.#map[Symbol.iterator]();
  }

  get [Symbol.toStringTag]() {
    return 'CookieMap';
  }

  get size() {
    return this.#map.size;
  }

  clear() {
    this.#set.clear();
    this.#map.clear();
  }

  delete(name: string) {
    this.#set.delete(name);
    return this.#map.delete(name);
  }

  entries() {
    return this.#map.entries();
  }

  forEach(...args: Parameters<CookieMap['forEach']>): void {
    return this.#map.forEach(...args);
  }

  get(name: string) {
    return this.#map.get(name);
  }

  has(name: string) {
    return this.#map.has(name);
  }

  keys() {
    return this.#map.keys();
  }

  set(name: string, options: {value: string} & CookieOptions) {
    this.#set.add(name);
    this.#map.set(name, options);
    return this;
  }

  values() {
    return this.#map.values();
  }

  headers() {
    const headers = new Headers();
    for (const [name, {value, ...options}] of this.#map) {
      if (this.#set.has(name)) {
        headers.append('set-cookie', Cookies.serialize(name, value, options));
      }
    }
    return headers;
  }

  static encode(value: string) {
    return encodeURIComponent(value);
  }

  static decode(value: string) {
    try {
      return value.indexOf('%') !== -1 ? decodeURIComponent(value) : value;
    } catch {
      return value;
    }
  }

  static parse(header: string): Record<string, string> {
    const obj: Record<string, string> = {};
    let index = 0;
    while (index < header.length) {
      const eqIdx = header.indexOf('=', index);
      // no more cookie pairs
      if (eqIdx === -1) {
        break;
      }
      let endIdx = header.indexOf(';', index);
      if (endIdx === -1) {
        endIdx = header.length;
      } else if (endIdx < eqIdx) {
        // backtrack on prior semicolon
        index = header.lastIndexOf(';', eqIdx - 1) + 1;
        continue;
      }
      const key = header.slice(index, eqIdx).trim();
      // only assign once
      if (undefined === obj[key]) {
        let value = header.slice(eqIdx + 1, endIdx).trim();
        // quoted values
        if (value.charCodeAt(0) === 0x22) {
          value = value.slice(1, -1);
        }
        obj[key] = Cookies.decode(value);
      }
      index = endIdx + 1;
    }
    return obj;
  }

  static serialize(name: string, value: string, options: CookieOptions = {}) {
    if (!fieldContentRegExp.test(name)) {
      throw new TypeError('argument name is invalid');
    }
    value = Cookies.encode(value);
    if (value && !fieldContentRegExp.test(value)) {
      throw new TypeError('argument val is invalid');
    }
    value = name + '=' + value;
    if (null != options.maxAge) {
      const maxAge = options.maxAge - 0;
      if (isNaN(maxAge) || !isFinite(maxAge)) {
        throw new TypeError('option maxAge is invalid');
      }
      value += '; Max-Age=' + Math.floor(maxAge);
    }
    if (options.domain) {
      if (!fieldContentRegExp.test(options.domain)) {
        throw new TypeError('option domain is invalid');
      }
      value += '; Domain=' + options.domain;
    }
    if (options.path) {
      if (!fieldContentRegExp.test(options.path)) {
        throw new TypeError('option path is invalid');
      }
      value += '; Path=' + options.path;
    }
    if (options.expires) {
      const expires = options.expires;
      if (!(expires instanceof Date) || isNaN(expires.valueOf())) {
        throw new TypeError('option expires is invalid');
      }
      value += '; Expires=' + expires.toUTCString();
    }
    if (options.httpOnly) {
      value += '; HttpOnly';
    }
    if (options.secure) {
      value += '; Secure';
    }
    if (options.partitioned) {
      value += '; Partitioned';
    }
    if (options.priority) {
      const priority =
        typeof options.priority === 'string'
          ? options.priority.toLowerCase()
          : options.priority;
      switch (priority) {
        case 'low':
          value += '; Priority=Low';
          break;
        case 'medium':
          value += '; Priority=Medium';
          break;
        case 'high':
          value += '; Priority=High';
          break;
        default:
          throw new TypeError('option priority is invalid');
      }
    }
    if (options.sameSite) {
      const sameSite =
        typeof options.sameSite === 'string'
          ? options.sameSite.toLowerCase()
          : options.sameSite;
      switch (sameSite) {
        case true:
          value += '; SameSite=Strict';
          break;
        case 'lax':
          value += '; SameSite=Lax';
          break;
        case 'strict':
          value += '; SameSite=Strict';
          break;
        case 'none':
          value += '; SameSite=None';
          break;
        default:
          throw new TypeError('option sameSite is invalid');
      }
    }
    return value;
  }
}
