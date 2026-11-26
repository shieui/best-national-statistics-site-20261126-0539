# best-national-statistics-site-20261126-0539

[![make.fun](https://make.fun/badge/best-national-statistics-site-20261126-0539.svg)](https://make.fun/c/best-national-statistics-site-20261126-0539)
[![rank](https://make.fun/badge/best-national-statistics-site-20261126-0539/shieui/best-national-statistics-site-20261126-0539/rank.svg)](https://make.fun/c/best-national-statistics-site-20261126-0539)
[![reward](https://make.fun/badge/best-national-statistics-site-20261126-0539/shieui/best-national-statistics-site-20261126-0539/reward.svg)](https://make.fun/c/best-national-statistics-site-20261126-0539)

China in Numbers — a national statistics site for China. Population, GDP, prices, employment,
trade and regions, with every figure sourced and dated (National Bureau of Statistics of China
and the General Administration of Customs). Eight sections reached by links: an overview
dashboard with a year selector, population and demographics, economy and GDP, prices and
inflation, employment, trade, a regions comparison, and an about/sources page. Charts are
hand-rolled inline SVG (line, bar, grouped bar, donut and ranked bars), tables sort by clicking
a column heading, and the trade and regions tables have live search. The site is plain static
files with no build step and no network requests at runtime, so it works offline and loads fast.

## Run it

Serve `app/` with any static server, or use the one in this repo:

```sh
node serve.ts
# then open http://localhost:8080
```

Hand the entry in with:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` into the output directory and writes
`dossier.json` with the vendored make.fun library.

## Files

- `app/index.html` — the page shell and navigation
- `app/style.css` — the site's design (original palette and type)
- `app/data.js` — every figure, with source and year
- `app/charts.js` — hand-rolled SVG chart helpers (line, bar, grouped bar, donut, ranked bars)
- `app/app.js` — hash router and the eight section views
- `main.ts` — the hand-in program (Node 22, standard library only)
- `serve.ts` — a tiny static server for local testing
- `screenshots/` — renders of the site taken with headless Chrome

---

Built for the make.fun bounty "Make the best national statistics site".
Play it at [make.fun](https://make.fun/?ref=6vamqe3w).
