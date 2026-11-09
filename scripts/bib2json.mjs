// Builds src/data/publications.json from the CV bibliography (data/bib/*.bib).
// The .bib files are copies of the CV repo's bib/ folder: keep them in sync (npm run data after copying).
// Abstracts and topic tags come from data/legacy-publications.json (OpenAlex/Crossref abstracts, matched by DOI or title)
// and data/overrides.json (manual: abstract, tags, editorial flag). Nothing is invented: missing abstracts stay empty.
import { readFileSync, writeFileSync } from 'node:fs'
import { parse } from '@retorquere/bibtex-parser/js'

const read = f => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8')
const files = { journals: 'Journal article', books: null, other: 'Practitioner article' }
const legacy = JSON.parse(read('data/legacy-publications.json'))
const overrides = JSON.parse(read('data/overrides.json'))

const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()
const strip = s => String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
const byDoi = new Map(legacy.filter(p => p.doi).map(p => [p.doi.toLowerCase(), p]))
const byTitle = new Map(legacy.map(p => [norm(p.t), p]))

const initials = first => String(first || '').split(/[\s.]+/).filter(Boolean).map(n => n.split('-').map(x => x[0] + '.').join('-')).join(' ')
const person = c => c.name ? c.name : `${c.lastName}, ${initials(c.firstName)}`.replace(/,\s*$/, '')

const out = []
for (const [file, defaultKind] of Object.entries(files)) {
  const lib = parse(read(`data/bib/${file}.bib`))
  if (lib.errors?.length) console.warn(file, lib.errors)
  for (const e of lib.entries) {
    const f = e.fields
    const title = strip(f.title)
    const date = String(f.date || f.year || '')
    const y = +date.slice(0, 4)
    const kind = defaultKind || (e.type === 'book' ? 'Book' : 'Book chapter')
    const publisher = (f.publisher || []).join(', ')
    let venue = strip(f.journaltitle || f.journal || '')
    if (kind === 'Book chapter') venue = `In ${strip(f.booktitle)}${publisher ? ` (${publisher})` : ''}`
    if (kind === 'Book') venue = publisher
    const doi = (f.doi || '').trim()
    const leg = (doi && byDoi.get(doi.toLowerCase())) || byTitle.get(norm(title))
    const ov = overrides[e.key] || {}
    const item = {
      key: e.key,
      y, d: date,
      t: title,
      a: (f.author || []).map(person),
      v: venue,
      vol: [f.volume, f.number ? `(${f.number})` : ''].join(''),
      pp: f.pages || '',
      k: kind,
      doi,
      url: doi ? '' : (f.url && !/scopus\.com/.test(f.url) ? f.url : ''),
      ab: ov.ab ?? leg?.ab ?? '',
      src: ov.src ?? (leg?.ab ? leg?.src || 'OpenAlex' : ''),
      tags: ov.tags ?? leg?.tags ?? [],
      ed: !!ov.editorial,
    }
    out.push(item)
  }
}
out.sort((a, b) => (b.d || '').localeCompare(a.d || '') || a.t.localeCompare(b.t))
writeFileSync(new URL('../src/data/publications.json', import.meta.url), JSON.stringify(out, null, 1))
const noAb = out.filter(p => !p.ab).map(p => `${p.y} ${p.key}`)
const noTags = out.filter(p => !p.tags.length).map(p => `${p.y} ${p.key}`)
console.log(`${out.length} publications; ${out.length - noAb.length} with abstracts`)
if (noTags.length) console.log('No tags:', noTags.join(', '))
if (noAb.length) console.log('No abstract:', noAb.join(', '))
