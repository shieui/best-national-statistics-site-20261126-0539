// China in Numbers — all figures with source and year.
// Sources: National Bureau of Statistics of China (NBS), Statistical Communiqué 2024
// and the China Statistical Yearbook; General Administration of Customs (GACC) for trade.
// Figures are rounded honestly to the precision published; where a figure is an
// approximation it is labelled as such in the page text.

export const META = {
  country: 'China',
  updated: 'November 2026',
  years: [2019, 2020, 2021, 2022, 2023, 2024],
  sources: {
    nbs: 'National Bureau of Statistics of China',
    yearbook: 'China Statistical Yearbook',
    customs: 'General Administration of Customs of China',
    communique: 'NBS Statistical Communiqué 2024',
  },
};

// Year-end population, billions of people (NBS).
export const POPULATION = [
  { year: 2019, total: 1.400, birthRate: 10.48, deathRate: 7.14, natural: 3.34, urban: 60.6 },
  { year: 2020, total: 1.412, birthRate: 8.52, deathRate: 7.07, natural: 1.45, urban: 63.9 },
  { year: 2021, total: 1.413, birthRate: 7.52, deathRate: 7.18, natural: 0.34, urban: 64.7 },
  { year: 2022, total: 1.412, birthRate: 6.77, deathRate: 7.37, natural: -0.60, urban: 65.2 },
  { year: 2023, total: 1.410, birthRate: 6.39, deathRate: 7.87, natural: -1.48, urban: 66.2 },
  { year: 2024, total: 1.408, birthRate: 6.77, deathRate: 7.76, natural: -0.99, urban: 67.0 },
];

// Age structure, end of 2024, share of population (NBS Communiqué 2024).
export const AGE_STRUCTURE = [
  { group: 'Aged 0–15', share: 17.6, millions: 248 },
  { group: 'Aged 16–59', share: 60.9, millions: 858 },
  { group: 'Aged 60 and over', share: 22.0, millions: 310 },
];
export const AGE_65_PLUS = { share: 15.6, millions: 220 };
export const LIFE_EXPECTANCY = { year: 2024, years: 79.0 };

// GDP, trillion yuan at current prices, and real growth (NBS).
export const GDP = [
  { year: 2019, value: 98.7, growth: 6.0, perCapita: 70078 },
  { year: 2020, value: 101.4, growth: 2.2, perCapita: 71828 },
  { year: 2021, value: 114.9, growth: 8.6, perCapita: 81370 },
  { year: 2022, value: 121.0, growth: 3.0, perCapita: 85698 },
  { year: 2023, value: 126.1, growth: 5.2, perCapita: 89358 },
  { year: 2024, value: 134.9, growth: 5.0, perCapita: 95749 },
];

// Shares of GDP by sector, 2024 (NBS).
export const SECTORS = [
  { name: 'Primary (agriculture, forestry, fishing, mining)', share: 7.1 },
  { name: 'Secondary (manufacturing, construction)', share: 38.3 },
  { name: 'Tertiary (services)', share: 54.6 },
];

// Consumer prices, annual change in % (NBS).
export const CPI = [
  { year: 2019, cpi: 2.9, food: 9.2, nonFood: 1.4, ppi: -0.3 },
  { year: 2020, cpi: 2.5, food: 10.6, nonFood: 0.4, ppi: -1.8 },
  { year: 2021, cpi: 0.9, food: -1.4, nonFood: 1.4, ppi: 8.1 },
  { year: 2022, cpi: 2.0, food: 2.8, nonFood: 1.7, ppi: 4.1 },
  { year: 2023, cpi: 0.2, food: -0.3, nonFood: 0.4, ppi: -3.0 },
  { year: 2024, cpi: 0.2, food: -0.6, nonFood: 0.3, ppi: -2.2 },
];

// Employment (NBS). Surveyed urban unemployment rate, %, and total employed, millions.
export const EMPLOYMENT = [
  { year: 2019, urbanUnemployment: 5.2, employed: 775, urbanEmployed: 442 },
  { year: 2020, urbanUnemployment: 5.6, employed: 750, urbanEmployed: 463 },
  { year: 2021, urbanUnemployment: 5.1, employed: 746, urbanEmployed: 467 },
  { year: 2022, urbanUnemployment: 5.6, employed: 734, urbanEmployed: 459 },
  { year: 2023, urbanUnemployment: 5.2, employed: 740, urbanEmployed: 470 },
  { year: 2024, urbanUnemployment: 5.1, employed: 734, urbanEmployed: 474 },
];
// Employment by sector, 2024, share of all employed (NBS, approx.).
export const EMPLOYMENT_SECTORS = [
  { sector: 'Primary', share: 22.5 },
  { sector: 'Secondary', share: 28.5 },
  { sector: 'Tertiary', share: 49.0 },
];

// Foreign trade in goods, trillion yuan (GACC).
export const TRADE = [
  { year: 2019, total: 31.54, exports: 17.23, imports: 14.31 },
  { year: 2020, total: 32.16, exports: 17.93, imports: 14.22 },
  { year: 2021, total: 39.10, exports: 21.73, imports: 17.37 },
  { year: 2022, total: 42.07, exports: 23.97, imports: 18.10 },
  { year: 2023, total: 41.76, exports: 23.77, imports: 17.99 },
  { year: 2024, total: 43.85, exports: 25.45, imports: 18.41 },
];

// Largest trading partners, goods trade 2024, trillion yuan (GACC, approx.).
export const TRADE_PARTNERS = [
  { partner: 'ASEAN', total: 6.99, exports: 3.91, imports: 3.08 },
  { partner: 'European Union', total: 5.59, exports: 3.56, imports: 2.03 },
  { partner: 'United States', total: 4.44, exports: 3.32, imports: 1.12 },
  { partner: 'Japan', total: 2.33, exports: 1.11, imports: 1.22 },
  { partner: 'South Korea', total: 2.33, exports: 1.01, imports: 1.32 },
  { partner: 'Hong Kong, China', total: 2.09, exports: 2.01, imports: 0.08 },
  { partner: 'Taiwan, China', total: 1.97, exports: 0.57, imports: 1.40 },
  { partner: 'Russia', total: 1.74, exports: 0.86, imports: 0.88 },
];

// Provinces and municipalities, 2024: GDP in trillion yuan, population in millions (NBS).
export const REGIONS = [
  { name: 'Guangdong', gdp: 14.16, population: 127.1 },
  { name: 'Jiangsu', gdp: 13.71, population: 85.3 },
  { name: 'Shandong', gdp: 9.86, population: 101.6 },
  { name: 'Zhejiang', gdp: 9.01, population: 65.4 },
  { name: 'Sichuan', gdp: 6.47, population: 83.4 },
  { name: 'Henan', gdp: 6.36, population: 98.1 },
  { name: 'Hubei', gdp: 6.00, population: 58.5 },
  { name: 'Fujian', gdp: 5.77, population: 41.8 },
  { name: 'Shanghai', gdp: 5.39, population: 24.8 },
  { name: 'Hunan', gdp: 5.33, population: 65.7 },
  { name: 'Anhui', gdp: 5.07, population: 61.1 },
  { name: 'Beijing', gdp: 4.98, population: 21.8 },
  { name: 'Hebei', gdp: 4.84, population: 73.8 },
  { name: 'Shaanxi', gdp: 3.55, population: 39.6 },
  { name: 'Chongqing', gdp: 3.21, population: 32.1 },
  { name: 'Liaoning', gdp: 3.23, population: 41.6 },
];

export function yearRow(table, year) {
  return table.find((row) => row.year === year) ?? table[table.length - 1];
}

export function gdpPerCapita(region) {
  return Math.round((region.gdp * 10000) / region.population);
}
