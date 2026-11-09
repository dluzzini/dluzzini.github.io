import pubs from '../data/publications.json';
import talks from '../data/talks.json';

export type Item = { id: string; y: number; when: string; title: string; meta: string; abs: string; link?: { href: string; label: string }; src?: string; kind: string; tags: string[]; text: string };
const esc = (s: string) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const authors = (a: string[]) => a.length > 1 ? a.slice(0, -1).join(', ') + ' & ' + a[a.length - 1] : a[0] || '';

export type Pub = (typeof pubs)[number];
export const publications: Pub[] = pubs;
export const pubItem = (p: Pub): Item => ({
  id: 'p-' + p.key, y: p.y, when: String(p.y), title: p.t,
  meta: `${esc(authors(p.a))} · <i>${esc(p.v)}</i>`,
  abs: p.ab, src: p.src || undefined, kind: p.k, tags: p.tags,
  link: p.doi ? { href: `https://doi.org/${p.doi}`, label: 'Read the paper ↗' } : p.url ? { href: p.url, label: 'Read it ↗' } : undefined,
  text: [p.t, p.a.join(' '), p.v, p.ab, p.tags.join(' ')].join(' '),
});

export type Talk = (typeof talks)[number];
export const talkList: Talk[] = [...talks].sort((a, b) => b.d.localeCompare(a.d));
export const talkItem = (t: Talk, i: number): Item => ({
  id: `t-${i}`, y: t.y, when: `${months[+t.d.slice(5, 7) - 1]} ${t.y}`, title: t.t,
  meta: `${esc(t.k)} · ${esc(t.where)}`, abs: t.ab, kind: t.k, tags: t.tags,
  text: [t.t, t.where, t.k, t.ab, t.tags.join(' ')].join(' '),
});
