// China in Numbers — router and views. Hash routes, one page per section.
// Every control on every page works: year selectors, chart-type toggles,
// sortable tables, search boxes and region pickers all re-render in place.
import {
  META, POPULATION, AGE_STRUCTURE, AGE_65_PLUS, LIFE_EXPECTANCY,
  GDP, SECTORS, CPI, EMPLOYMENT, EMPLOYMENT_SECTORS, TRADE, TRADE_PARTNERS,
  REGIONS, yearRow, gdpPerCapita,
} from './data.js';
import { esc, lineChart, barChart, groupedBarChart, donutChart, rankedBars } from './charts.js';

const app = document.getElementById('app');
const nav = document.getElementById('main-nav');

const PAGES = [
  { id: 'overview', label: 'Overview', path: '#/' },
  { id: 'population', label: 'Population', path: '#/population' },
  { id: 'economy', label: 'Economy & GDP', path: '#/economy' },
  { id: 'prices', label: 'Prices & inflation', path: '#/prices' },
  { id: 'employment', label: 'Employment', path: '#/employment' },
  { id: 'trade', label: 'Trade', path: '#/trade' },
  { id: 'regions', label: 'Regions', path: '#/regions' },
  { id: 'about', label: 'About & sources', path: '#/about' },
];

// Shared UI state, kept in memory while the page is open.
const state = {
  year: 2024,
  economyChart: 'line',
  pricesChart: 'line',
  populationChart: 'line',
  tradeSort: { key: 'total', dir: -1 },
  tradeQuery: '',
  regionSort: { key: 'gdp', dir: -1 },
  regionQuery: '',
  regionPick: 'Guangdong',
};

function sourceNote(source, year) {
  return `<p class="source">Source: ${esc(source)}${year ? `, ${year}` : ''}.</p>`;
}

function yearSelect(id, label) {
  const options = META.years
    .map((y) => `<option value="${y}"${y === state.year ? ' selected' : ''}>${y}</option>`)
    .join('');
  return `<label class="field">${esc(label)} <select id="${id}" data-year-select>${options}</select></label>`;
}

function bindYearSelects() {
  app.querySelectorAll('[data-year-select]').forEach((select) => {
    select.addEventListener('change', () => {
      state.year = Number(select.value);
      render();
    });
  });
}

function kpi(label, value, unit, note) {
  return `<div class="kpi"><span class="kpi-label">${esc(label)}</span><span class="kpi-value">${esc(value)}<span class="kpi-unit">${esc(unit)}</span></span><span class="kpi-note">${esc(note)}</span></div>`;
}

function sortArrow(key, current) {
  if (current.key !== key) return '';
  return current.dir === 1 ? ' ▲' : ' ▼';
}

function toggleSort(current, key) {
  if (current.key === key) return { key, dir: -current.dir };
  return { key, dir: -1 };
}

// ---- Overview ----
function viewOverview() {
  const y = state.year;
  const pop = yearRow(POPULATION, y);
  const gdp = yearRow(GDP, y);
  const cpi = yearRow(CPI, y);
  const emp = yearRow(EMPLOYMENT, y);
  const trade = yearRow(TRADE, y);
  const surplus = (trade.exports - trade.imports).toFixed(2);
  const gdpPoints = GDP.map((r) => ({ label: String(r.year), value: r.value }));
  return `
  <section class="hero">
    <h1>China in Numbers</h1>
    <p class="lede">The key facts about the world's second-largest economy — population, GDP, prices,
    jobs and trade — with every figure sourced and dated. Data: National Bureau of Statistics of China.</p>
    <div class="hero-controls">${yearSelect('year-overview', 'Show figures for')}</div>
  </section>
  <section class="kpis" aria-label="Key indicators for ${y}">
    ${kpi('Population', pop.total.toFixed(3), 'bn', `year-end ${y}, NBS`)}
    ${kpi('GDP', gdp.value.toFixed(1), 'trillion ¥', `real growth ${gdp.growth.toFixed(1)}%, ${y}`)}
    ${kpi('GDP per person', gdp.perCapita.toLocaleString('en-US'), '¥', `current prices, ${y}`)}
    ${kpi('Consumer prices (CPI)', (cpi.cpi > 0 ? '+' : '') + cpi.cpi.toFixed(1), '%', `year on year, ${y}`)}
    ${kpi('Urban unemployment', emp.urbanUnemployment.toFixed(1), '%', `surveyed rate, ${y}`)}
    ${kpi('Goods trade', trade.total.toFixed(2), 'trillion ¥', `surplus ¥${surplus}tn, ${y}`)}
  </section>
  <section class="grid-2">
    <article class="card">
      <h2>GDP, ${META.years[0]}–${META.years[META.years.length - 1]}</h2>
      ${lineChart(gdpPoints, { title: 'GDP in trillion yuan', format: (v) => `${v.toFixed(0)}` })}
      <p class="card-note">GDP rose from ¥98.7 trillion in 2019 to ¥134.9 trillion in 2024 — a real
      increase of about one third in five years, despite the pandemic dip in 2020.</p>
      ${sourceNote(META.sources.nbs, '2024')}
    </article>
    <article class="card">
      <h2>Where to look next</h2>
      <ul class="link-list">
        <li><a href="#/population">Population &amp; demographics</a> — a shrinking, ageing population and the urban shift.</li>
        <li><a href="#/economy">Economy &amp; GDP</a> — growth, sectors and GDP per person.</li>
        <li><a href="#/prices">Prices &amp; inflation</a> — CPI, food prices and producer prices.</li>
        <li><a href="#/employment">Employment</a> — jobs, unemployment and who works where.</li>
        <li><a href="#/trade">Trade</a> — exports, imports and the biggest partners.</li>
        <li><a href="#/regions">Regions</a> — how the provinces compare.</li>
      </ul>
      <p class="card-note">All figures on this site come from the National Bureau of Statistics of China
      and the General Administration of Customs. See <a href="#/about">About &amp; sources</a> for the full list.</p>
    </article>
  </section>`;
}

// ---- Population ----
function viewPopulation() {
  const y = state.year;
  const pop = yearRow(POPULATION, y);
  const points = POPULATION.map((r) => ({ label: String(r.year), value: r.total }));
  const bars = POPULATION.map((r) => ({ label: String(r.year), value: r.total }));
  const chart = state.populationChart === 'line'
    ? lineChart(points, { title: 'Year-end population', format: (v) => v.toFixed(2) })
    : barChart(bars, { title: 'Year-end population', format: (v) => v.toFixed(2), min: 1.3 });
  const rows = POPULATION.map((r) => `<tr><td>${r.year}</td><td>${r.total.toFixed(3)}</td><td>${r.birthRate.toFixed(2)}</td><td>${r.deathRate.toFixed(2)}</td><td>${r.natural > 0 ? '+' : ''}${r.natural.toFixed(2)}</td><td>${r.urban.toFixed(1)}</td></tr>`).join('');
  return `
  <h1>Population &amp; demographics</h1>
  <p class="lede">China's population peaked in 2021 at 1.413 billion and has fallen every year since,
  while the share living in cities keeps rising.</p>
  <section class="grid-2">
    <article class="card">
      <h2>Year-end population, ${y}</h2>
      <div class="chart-toggle" role="group" aria-label="Chart type">
        <button data-chart="population" data-kind="line" class="${state.populationChart === 'line' ? 'active' : ''}">Line</button>
        <button data-chart="population" data-kind="bar" class="${state.populationChart === 'bar' ? 'active' : ''}">Bars</button>
      </div>
      ${chart}
      <p class="card-note">Population in billions. The 2020 census counted 1.412 billion people.</p>
      ${sourceNote(META.sources.nbs, '2019–2024')}
    </article>
    <article class="card">
      <h2>Age structure, 2024</h2>
      ${donutChart(AGE_STRUCTURE.map((a) => ({ label: a.group, value: a.share })), { centre: '22.0%', centreLabel: 'aged 60+', title: 'Age structure 2024' })}
      <p class="card-note">310 million people — 22.0% of the population — were aged 60 or over at the end
      of 2024, and 220 million (15.6%) were 65 or over. Life expectancy reached 79.0 years in 2024.</p>
      ${sourceNote(META.sources.communique)}
    </article>
  </section>
  <section class="card">
    <h2>Population in ${y}</h2>
    <div class="controls">${yearSelect('year-population', 'Year')}</div>
    <dl class="facts">
      <div><dt>Total population</dt><dd>${pop.total.toFixed(3)} billion</dd></div>
      <div><dt>Birth rate</dt><dd>${pop.birthRate.toFixed(2)} per 1,000</dd></div>
      <div><dt>Death rate</dt><dd>${pop.deathRate.toFixed(2)} per 1,000</dd></div>
      <div><dt>Natural change</dt><dd>${pop.natural > 0 ? '+' : ''}${pop.natural.toFixed(2)} per 1,000</dd></div>
      <div><dt>Urban share</dt><dd>${pop.urban.toFixed(1)}% of the population</dd></div>
    </dl>
    <h3>Population, births and deaths, 2019–2024</h3>
    <div class="table-wrap"><table class="data-table">
      <thead><tr><th>Year</th><th>Population (bn)</th><th>Births (‰)</th><th>Deaths (‰)</th><th>Natural change (‰)</th><th>Urban share (%)</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    ${sourceNote(META.sources.nbs, '2019–2024')}
  </section>`;
}

// ---- Economy ----
function viewEconomy() {
  const y = state.year;
  const gdp = yearRow(GDP, y);
  const points = GDP.map((r) => ({ label: String(r.year), value: r.value }));
  const chart = state.economyChart === 'line'
    ? lineChart(points, { title: 'GDP in trillion yuan', format: (v) => `${v.toFixed(0)}` })
    : barChart(points, { title: 'GDP in trillion yuan', format: (v) => `${v.toFixed(0)}` });
  const growthBars = GDP.map((r) => ({ label: String(r.year), value: r.growth }));
  const rows = GDP.map((r) => `<tr><td>${r.year}</td><td>${r.value.toFixed(1)}</td><td>${r.growth.toFixed(1)}</td><td>${r.perCapita.toLocaleString('en-US')}</td></tr>`).join('');
  return `
  <h1>Economy &amp; GDP</h1>
  <p class="lede">GDP reached ¥134.9 trillion in 2024, growing 5.0% in real terms. Services now make
  up more than half of the economy.</p>
  <section class="grid-2">
    <article class="card">
      <h2>GDP, 2019–2024 (trillion yuan)</h2>
      <div class="chart-toggle" role="group" aria-label="Chart type">
        <button data-chart="economy" data-kind="line" class="${state.economyChart === 'line' ? 'active' : ''}">Line</button>
        <button data-chart="economy" data-kind="bar" class="${state.economyChart === 'bar' ? 'active' : ''}">Bars</button>
      </div>
      ${chart}
      ${sourceNote(META.sources.nbs, '2019–2024')}
    </article>
    <article class="card">
      <h2>What the economy is made of, 2024</h2>
      ${donutChart(SECTORS.map((s) => ({ label: s.name, value: s.share })), { centre: '54.6%', centreLabel: 'services', title: 'GDP by sector 2024' })}
      <p class="card-note">Services (tertiary sector) contributed 54.6% of GDP in 2024, manufacturing and
      construction 38.3%, and agriculture, forestry, fishing and mining 7.1%.</p>
      ${sourceNote(META.sources.nbs, '2024')}
    </article>
  </section>
  <section class="grid-2">
    <article class="card">
      <h2>Real GDP growth by year (%)</h2>
      ${barChart(growthBars, { title: 'Real GDP growth', format: (v) => `${v.toFixed(1)}%` })}
      <p class="card-note">Growth rebounded to 8.6% in 2021 after the 2.2% pandemic year, then settled
      at 5.0–5.2% in 2023–2024.</p>
      ${sourceNote(META.sources.nbs, '2019–2024')}
    </article>
    <article class="card">
      <h2>GDP in ${y}</h2>
      <div class="controls">${yearSelect('year-economy', 'Year')}</div>
      <dl class="facts">
        <div><dt>GDP</dt><dd>¥${gdp.value.toFixed(1)} trillion</dd></div>
        <div><dt>Real growth</dt><dd>${gdp.growth.toFixed(1)}% year on year</dd></div>
        <div><dt>GDP per person</dt><dd>¥${gdp.perCapita.toLocaleString('en-US')}</dd></div>
        <div><dt>GDP per person</dt><dd>about US$13,400 (2024, at market rates)</dd></div>
      </dl>
      <h3>GDP, growth and GDP per person</h3>
      <div class="table-wrap"><table class="data-table">
        <thead><tr><th>Year</th><th>GDP (trillion ¥)</th><th>Real growth (%)</th><th>GDP per person (¥)</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
      ${sourceNote(META.sources.nbs, '2019–2024')}
    </article>
  </section>`;
}

// ---- Prices ----
function viewPrices() {
  const y = state.year;
  const cpi = yearRow(CPI, y);
  const points = CPI.map((r) => ({ label: String(r.year), value: r.cpi }));
  const chart = state.pricesChart === 'line'
    ? lineChart(points, { title: 'CPI annual change', format: (v) => `${v.toFixed(1)}%`, min: 0 })
    : barChart(points, { title: 'CPI annual change', format: (v) => `${v.toFixed(1)}%`, min: 0 });
  const rows = CPI.map((r) => `<tr><td>${r.year}</td><td>${r.cpi > 0 ? '+' : ''}${r.cpi.toFixed(1)}</td><td>${r.food > 0 ? '+' : ''}${r.food.toFixed(1)}</td><td>${r.nonFood > 0 ? '+' : ''}${r.nonFood.toFixed(1)}</td><td>${r.ppi > 0 ? '+' : ''}${r.ppi.toFixed(1)}</td></tr>`).join('');
  return `
  <h1>Prices &amp; inflation</h1>
  <p class="lede">Consumer prices barely moved in 2023 and 2024 — up just 0.2% each year — while
  factory-gate prices fell for a second year running.</p>
  <section class="grid-2">
    <article class="card">
      <h2>Consumer price index, annual change (%)</h2>
      <div class="chart-toggle" role="group" aria-label="Chart type">
        <button data-chart="prices" data-kind="line" class="${state.pricesChart === 'line' ? 'active' : ''}">Line</button>
        <button data-chart="prices" data-kind="bar" class="${state.pricesChart === 'bar' ? 'active' : ''}">Bars</button>
      </div>
      ${chart}
      <p class="card-note">CPI inflation fell from 2.9% in 2019 to 0.2% in 2023 and stayed there in 2024 —
      the softest price environment in two decades.</p>
      ${sourceNote(META.sources.nbs, '2019–2024')}
    </article>
    <article class="card">
      <h2>Prices in ${y}</h2>
      <div class="controls">${yearSelect('year-prices', 'Year')}</div>
      <dl class="facts">
        <div><dt>CPI</dt><dd>${cpi.cpi > 0 ? '+' : ''}${cpi.cpi.toFixed(1)}% year on year</dd></div>
        <div><dt>Food prices</dt><dd>${cpi.food > 0 ? '+' : ''}${cpi.food.toFixed(1)}% year on year</dd></div>
        <div><dt>Non-food prices</dt><dd>${cpi.nonFood > 0 ? '+' : ''}${cpi.nonFood.toFixed(1)}% year on year</dd></div>
        <div><dt>Producer prices (PPI)</dt><dd>${cpi.ppi > 0 ? '+' : ''}${cpi.ppi.toFixed(1)}% year on year</dd></div>
      </dl>
      <p class="card-note">Food prices fell 0.6% in 2024 after a 0.3% fall in 2023. Producer prices fell
      2.2% in 2024, the second straight annual decline.</p>
      ${sourceNote(META.sources.nbs, '2024')}
    </article>
  </section>
  <section class="card">
    <h2>Price indices, 2019–2024 (annual change, %)</h2>
    <div class="table-wrap"><table class="data-table">
      <thead><tr><th>Year</th><th>CPI</th><th>Food CPI</th><th>Non-food CPI</th><th>PPI</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    ${sourceNote(META.sources.nbs, '2019–2024')}
  </section>`;
}

// ---- Employment ----
function viewEmployment() {
  const y = state.year;
  const emp = yearRow(EMPLOYMENT, y);
  const points = EMPLOYMENT.map((r) => ({ label: String(r.year), value: r.urbanUnemployment }));
  const rows = EMPLOYMENT.map((r) => `<tr><td>${r.year}</td><td>${r.urbanUnemployment.toFixed(1)}</td><td>${r.employed}</td><td>${r.urbanEmployed}</td></tr>`).join('');
  return `
  <h1>Employment</h1>
  <p class="lede">734 million people were employed in 2024, 474 million of them in cities. The
  surveyed urban unemployment rate was 5.1%.</p>
  <section class="grid-2">
    <article class="card">
      <h2>Surveyed urban unemployment rate (%)</h2>
      ${lineChart(points, { title: 'Urban unemployment rate', format: (v) => `${v.toFixed(1)}%`, min: 4 })}
      <p class="card-note">Unemployment spiked to 5.6% in 2020 and again in 2022, then eased to 5.1% in 2024.</p>
      ${sourceNote(META.sources.nbs, '2019–2024')}
    </article>
    <article class="card">
      <h2>Who works where, 2024</h2>
      ${donutChart(EMPLOYMENT_SECTORS.map((s) => ({ label: s.sector, value: s.share })), { centre: '49.0%', centreLabel: 'in services', title: 'Employment by sector 2024' })}
      <p class="card-note">Services now employ about half of all workers (49.0%), industry and construction
      28.5%, and farming, forestry and fishing 22.5% — down from roughly a quarter five years earlier.</p>
      ${sourceNote(META.sources.nbs, '2024, approximate shares')}
    </article>
  </section>
  <section class="card">
    <h2>Employment in ${y}</h2>
    <div class="controls">${yearSelect('year-employment', 'Year')}</div>
    <dl class="facts">
      <div><dt>Surveyed urban unemployment</dt><dd>${emp.urbanUnemployment.toFixed(1)}%</dd></div>
      <div><dt>Total employed</dt><dd>${emp.employed} million</dd></div>
      <div><dt>Employed in urban areas</dt><dd>${emp.urbanEmployed} million</dd></div>
      <div><dt>Urban share of jobs</dt><dd>${((emp.urbanEmployed / emp.employed) * 100).toFixed(1)}%</dd></div>
    </dl>
    <h3>Employment, 2019–2024</h3>
    <div class="table-wrap"><table class="data-table">
      <thead><tr><th>Year</th><th>Urban unemployment (%)</th><th>Total employed (m)</th><th>Urban employed (m)</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    ${sourceNote(META.sources.nbs, '2019–2024')}
  </section>`;
}

// ---- Trade ----
function viewTrade() {
  const y = state.year;
  const trade = yearRow(TRADE, y);
  const labels = TRADE.map((r) => String(r.year));
  const chart = groupedBarChart(
    labels,
    [
      { name: 'Exports', colour: '#12395b', values: TRADE.map((r) => r.exports) },
      { name: 'Imports', colour: '#1f7a6d', values: TRADE.map((r) => r.imports) },
    ],
    { title: 'Exports and imports', format: (v) => `${v.toFixed(0)}` },
  );
  const query = state.tradeQuery.trim().toLowerCase();
  let partners = TRADE_PARTNERS.filter((p) => !query || p.partner.toLowerCase().includes(query));
  const { key, dir } = state.tradeSort;
  const tradeValue = (p) => (key === 'partner' ? p.partner : key === 'balance' ? p.exports - p.imports : p[key]);
  partners = [...partners].sort((a, b) => {
    const av = tradeValue(a);
    const bv = tradeValue(b);
    if (typeof av === 'string') return av.localeCompare(bv) * dir;
    return (av - bv) * dir;
  });
  const rows = partners
    .map((p) => `<tr><td>${esc(p.partner)}</td><td>${p.total.toFixed(2)}</td><td>${p.exports.toFixed(2)}</td><td>${p.imports.toFixed(2)}</td><td>${(p.exports - p.imports).toFixed(2)}</td></tr>`)
    .join('');
  return `
  <h1>Trade</h1>
  <p class="lede">China traded ¥43.85 trillion of goods with the world in 2024 — exports of ¥25.45
  trillion against imports of ¥18.41 trillion, a surplus of ¥7.04 trillion.</p>
  <section class="grid-2">
    <article class="card">
      <h2>Exports and imports, 2019–2024 (trillion yuan)</h2>
      ${chart}
      ${sourceNote(META.sources.customs, '2019–2024')}
    </article>
    <article class="card">
      <h2>Trade in ${y}</h2>
      <div class="controls">${yearSelect('year-trade', 'Year')}</div>
      <dl class="facts">
        <div><dt>Total goods trade</dt><dd>¥${trade.total.toFixed(2)} trillion</dd></div>
        <div><dt>Exports</dt><dd>¥${trade.exports.toFixed(2)} trillion</dd></div>
        <div><dt>Imports</dt><dd>¥${trade.imports.toFixed(2)} trillion</dd></div>
        <div><dt>Trade surplus</dt><dd>¥${(trade.exports - trade.imports).toFixed(2)} trillion</dd></div>
      </dl>
      <p class="card-note">Total trade hit a record in 2024. ASEAN is China's largest trading partner,
      ahead of the European Union and the United States.</p>
      ${sourceNote(META.sources.customs, '2024')}
    </article>
  </section>
  <section class="card">
    <h2>Largest trading partners, 2024</h2>
    <div class="controls">
      <label class="field">Search partner <input type="search" id="trade-search" placeholder="e.g. ASEAN" value="${esc(state.tradeQuery)}"></label>
    </div>
    <div class="table-wrap"><table class="data-table">
      <thead><tr>
        <th><button class="sort" data-sort="partner">Partner${sortArrow('partner', state.tradeSort)}</button></th>
        <th><button class="sort" data-sort="total">Total (¥tn)${sortArrow('total', state.tradeSort)}</button></th>
        <th><button class="sort" data-sort="exports">Exports (¥tn)${sortArrow('exports', state.tradeSort)}</button></th>
        <th><button class="sort" data-sort="imports">Imports (¥tn)${sortArrow('imports', state.tradeSort)}</button></th>
        <th><button class="sort" data-sort="balance">Balance (¥tn)${sortArrow('balance', state.tradeSort)}</button></th>
      </tr></thead>
      <tbody>${rows || '<tr><td colspan="5">No partner matches that search.</td></tr>'}</tbody>
    </table></div>
    <p class="card-note">Partner totals are approximate, rounded from customs data. Balance is exports minus imports.</p>
    ${sourceNote(META.sources.customs, '2024')}
  </section>`;
}

// ---- Regions ----
function viewRegions() {
  const query = state.regionQuery.trim().toLowerCase();
  let regions = REGIONS.filter((r) => !query || r.name.toLowerCase().includes(query));
  const { key, dir } = state.regionSort;
  regions = [...regions].sort((a, b) => {
    const av = key === 'perCapita' ? gdpPerCapita(a) : a[key];
    const bv = key === 'perCapita' ? gdpPerCapita(b) : b[key];
    if (typeof av === 'string') return av.localeCompare(bv) * dir;
    return (av - bv) * dir;
  });
  const rows = regions
    .map((r) => `<tr><td>${esc(r.name)}</td><td>${r.gdp.toFixed(2)}</td><td>${r.population.toFixed(1)}</td><td>${gdpPerCapita(r).toLocaleString('en-US')}</td></tr>`)
    .join('');
  const picked = REGIONS.find((r) => r.name === state.regionPick) ?? REGIONS[0];
  const top8 = [...REGIONS].sort((a, b) => b.gdp - a.gdp).slice(0, 8);
  const options = REGIONS.map((r) => `<option${r.name === picked.name ? ' selected' : ''}>${esc(r.name)}</option>`).join('');
  return `
  <h1>Regions</h1>
  <p class="lede">Guangdong's economy (¥14.16 trillion) is bigger than most countries'. The gap between
  the richest and poorest provinces is wide — and narrowing slowly.</p>
  <section class="grid-2">
    <article class="card">
      <h2>Largest provincial economies, 2024 (trillion yuan)</h2>
      ${rankedBars(top8.map((r) => ({ label: r.name, value: r.gdp })), { title: 'Provincial GDP 2024', format: (v) => v.toFixed(2) })}
      ${sourceNote(META.sources.nbs, '2024')}
    </article>
    <article class="card">
      <h2>Compare one region</h2>
      <div class="controls"><label class="field">Region <select id="region-pick">${options}</select></label></div>
      <dl class="facts">
        <div><dt>GDP</dt><dd>¥${picked.gdp.toFixed(2)} trillion</dd></div>
        <div><dt>Population</dt><dd>${picked.population.toFixed(1)} million</dd></div>
        <div><dt>GDP per person</dt><dd>¥${gdpPerCapita(picked).toLocaleString('en-US')}</dd></div>
        <div><dt>Share of national GDP</dt><dd>${((picked.gdp / 134.9) * 100).toFixed(1)}%</dd></div>
      </dl>
      <p class="card-note">${esc(picked.name)}'s GDP per person is ${gdpPerCapita(picked) > 95749 ? 'above' : 'below'} the national average of ¥95,749 (2024).</p>
      ${sourceNote(META.sources.nbs, '2024')}
    </article>
  </section>
  <section class="card">
    <h2>All provinces in this table, 2024</h2>
    <div class="controls">
      <label class="field">Search region <input type="search" id="region-search" placeholder="e.g. Sichuan" value="${esc(state.regionQuery)}"></label>
    </div>
    <div class="table-wrap"><table class="data-table">
      <thead><tr>
        <th><button class="sort" data-sort="name">Region${sortArrow('name', state.regionSort)}</button></th>
        <th><button class="sort" data-sort="gdp">GDP (¥tn)${sortArrow('gdp', state.regionSort)}</button></th>
        <th><button class="sort" data-sort="population">Population (m)${sortArrow('population', state.regionSort)}</button></th>
        <th><button class="sort" data-sort="perCapita">GDP per person (¥)${sortArrow('perCapita', state.regionSort)}</button></th>
      </tr></thead>
      <tbody>${rows || '<tr><td colspan="4">No region matches that search.</td></tr>'}</tbody>
    </table></div>
    <p class="card-note">Click a column heading to sort. The 16 provinces and municipalities shown here
    cover about 90% of national GDP; figures are rounded from NBS provincial releases.</p>
    ${sourceNote(META.sources.nbs, '2024')}
  </section>`;
}

// ---- About ----
function viewAbout() {
  return `
  <h1>About &amp; sources</h1>
  <p class="lede">China in Numbers is an independent, original statistics site. It is not affiliated
  with the National Bureau of Statistics of China or any government body.</p>
  <section class="card">
    <h2>Where the numbers come from</h2>
    <ul class="source-list">
      <li><strong>National Bureau of Statistics of China</strong> — Statistical Communiqué 2024 and the
      China Statistical Yearbook: population, GDP, prices, employment and provincial figures.</li>
      <li><strong>General Administration of Customs of China</strong> — annual trade releases: total goods
      trade, exports, imports and trading partners.</li>
      <li><strong>National Bureau of Statistics, 2020 census</strong> — the population count used as the
      base for the 2020 figure.</li>
    </ul>
    <h2>How to read the figures</h2>
    <ul class="source-list">
      <li>Figures are rounded to the precision the source publishes; small differences from other
      tables are rounding, not error.</li>
      <li>GDP is at current prices unless a figure says "real growth", which is adjusted for inflation.</li>
      <li>The surveyed urban unemployment rate covers people in cities and towns; it is not the
      registered unemployment rate.</li>
      <li>Trade-partner totals are approximate, rounded from customs data.</li>
      <li>Population figures are year-end resident population. The 2024 total, 1.408 billion, is the
      third straight annual fall.</li>
    </ul>
    <h2>About this site</h2>
    <p>China in Numbers is a static site: no accounts, no tracking, no network requests. Every page,
    chart and table is built from files shipped with the site, so it works offline and loads fast.
    Charts are drawn as inline SVG by the site's own code. Last updated November 2026.</p>
    <p><a href="#/">Back to the overview</a></p>
  </section>`;
}

const VIEWS = {
  overview: viewOverview,
  population: viewPopulation,
  economy: viewEconomy,
  prices: viewPrices,
  employment: viewEmployment,
  trade: viewTrade,
  regions: viewRegions,
  about: viewAbout,
};

function bindControls() {
  bindYearSelects();
  app.querySelectorAll('[data-chart]').forEach((button) => {
    button.addEventListener('click', () => {
      const kind = button.dataset.kind;
      if (button.dataset.chart === 'population') state.populationChart = kind;
      if (button.dataset.chart === 'economy') state.economyChart = kind;
      if (button.dataset.chart === 'prices') state.pricesChart = kind;
      render();
    });
  });
  app.querySelectorAll('[data-sort]').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.sort;
      if (document.getElementById('trade-search')) state.tradeSort = toggleSort(state.tradeSort, key);
      if (document.getElementById('region-search')) state.regionSort = toggleSort(state.regionSort, key);
      render();
    });
  });
  const tradeSearch = document.getElementById('trade-search');
  if (tradeSearch) {
    tradeSearch.addEventListener('input', () => {
      state.tradeQuery = tradeSearch.value;
      render();
      const again = document.getElementById('trade-search');
      again.focus();
      again.setSelectionRange(again.value.length, again.value.length);
    });
  }
  const regionSearch = document.getElementById('region-search');
  if (regionSearch) {
    regionSearch.addEventListener('input', () => {
      state.regionQuery = regionSearch.value;
      render();
      const again = document.getElementById('region-search');
      again.focus();
      again.setSelectionRange(again.value.length, again.value.length);
    });
  }
  const regionPick = document.getElementById('region-pick');
  if (regionPick) {
    regionPick.addEventListener('change', () => {
      state.regionPick = regionPick.value;
      render();
    });
  }
}

function render() {
  const hash = window.location.hash.replace(/^#\/?/, '') || 'overview';
  const page = VIEWS[hash] ? hash : 'overview';
  nav.querySelectorAll('a').forEach((link) => {
    const id = link.getAttribute('href').replace(/^#\/?/, '') || 'overview';
    link.classList.toggle('current', id === page);
    if (id === page) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  app.innerHTML = VIEWS[page]();
  bindControls();
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', render);
render();
