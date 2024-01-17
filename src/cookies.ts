import {cookie} from './deps.ts';
import type {DinoCookies} from './types.ts';

export default class Cookies implements DinoCookies {
  #set: Set<string> = new Set();
  #map: DinoCookies = new Map();

  constructor(headers: Headers) {
    for (const [name, value] of Object.entries(cookie.getCookies(headers))) {
      this.#map.set(name, {name, value});
    }
  }

  [Symbol.iterator]() {
    return this.#map[Symbol.iterator]();
  }

  get [Symbol.toStringTag]() {
    return 'DinoCookies';
  }

  get size() {
    return this.#map.size;
  }

  clear() {
    this.#set.clear();
    this.#map.clear();
  }

  delete(name: string) {
    this.set(name, {
      name,
      value: '',
      path: '/',
      expires: new Date(0)
    });
    return true;
  }

  entries() {
    return this.#map.entries();
  }

  forEach(...args: Parameters<DinoCookies['forEach']>): void {
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

  set(name: string, cookie: cookie.Cookie) {
    cookie.name = name;
    this.#set.add(name);
    this.#map.set(name, cookie);
    return this;
  }

  values() {
    return this.#map.values();
  }

  headers(response?: Response) {
    const headers = response?.headers ?? new Headers();
    for (const [name, value] of this.#map) {
      if (this.#set.has(name)) {
        cookie.setCookie(headers, value);
      }
    }
    return headers;
  }
}
