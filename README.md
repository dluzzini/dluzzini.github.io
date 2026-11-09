# davideluzzini.com

Personal website of Davide Luzzini. Astro, static, published on GitHub Pages. The full academic CV lives in a separate repo (`dluzzini/cv`, Quarto) and is linked from the header.

## Update routine
- Text of a page: edit the file in `src/pages/` (one file per page).
- Publications: copy the CV's `bib/*.bib` into `data/bib/`, then `npm run data`. Abstracts/tags not found automatically go in `data/overrides.json` (never write an abstract by hand; leave it empty if there is none).
- Research topics (home + Research page): edit `src/data/topics.json` (name, short text, "learn more" text, DOIs of selected papers). Each DOI must exist in the publications; the build stops and names any DOI it cannot find. Swap topics freely as the work changes.
- Talks: edit `src/data/talks.json` (date `YYYY-MM`, kind, place, tags, optional one-line description). Add a talk only after it has happened.
- Links, e-mail, CV address: `src/config.ts`.

## Run locally
    npm ci
    npm run dev      # http://localhost:4321
    npm run build    # static site in dist/

## Rules for content
First person, simple English, no self-promotion. Davide's name is never bold in author lists. Further content rules are kept in Davide's private notes, not in this public repo.
