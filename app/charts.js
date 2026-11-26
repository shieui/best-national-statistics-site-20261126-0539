// Hand-rolled SVG charts — no libraries. Each helper takes plain data and returns
// an inline <svg> string. Colours come from the site palette in style.css.

const PALETTE = ['#12395b', '#1f7a6d', '#c8a24a', '#7a9cc4', '#b65c3a', '#5b7a4a'];

export function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function niceMax(value) {
  const power = 10 ** Math.floor(Math.log10(value));
  const scaled = value / power;
  const nice = scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 2.5 ? 2.5 : scaled <= 5 ? 5 : 10;
  return nice * power;
}

function axisLabels(max, steps) {
  const labels = [];
  for (let i = 0; i <= steps; i += 1) labels.push((max * i) / steps);
  return labels;
}

// A line chart. points: [{label, value}], valueLabel formats the y axis.
export function lineChart(points, opts = {}) {
  const width = opts.width ?? 640;
  const height = opts.height ?? 260;
  const padL = 58;
  const padR = 14;
  const padT = 14;
  const padB = 34;
  const values = points.map((p) => p.value);
  const max = niceMax(Math.max(...values) * 1.05);
  const min = opts.min ?? 0;
  const span = max - min || 1;
  const x = (i) => padL + ((width - padL - padR) * i) / (points.length - 1);
  const y = (v) => padT + (height - padT - padB) * (1 - (v - min) / span);
  const fmt = opts.format ?? ((v) => String(v));
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const dots = points
    .map((p, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(p.value).toFixed(1)}" r="4" fill="${PALETTE[0]}"><title>${esc(p.label)}: ${fmt(p.value)}</title></circle>`)
    .join('');
  const grid = axisLabels(max, 4)
    .map((v) => {
      const gy = y(v);
      return `<line x1="${padL}" y1="${gy.toFixed(1)}" x2="${width - padR}" y2="${gy.toFixed(1)}" stroke="#e3e8ee" stroke-width="1"/><text x="${padL - 8}" y="${(gy + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="#5a6b7c">${fmt(v)}</text>`;
    })
    .join('');
  const xlabels = points
    .map((p, i) => `<text x="${x(i).toFixed(1)}" y="${height - 10}" text-anchor="middle" font-size="11" fill="#5a6b7c">${esc(p.label)}</text>`)
    .join('');
  const last = points[points.length - 1];
  const endLabel = `<text x="${x(points.length - 1) - 4}" y="${(y(last.value) - 10).toFixed(1)}" text-anchor="end" font-size="12" font-weight="700" fill="${PALETTE[0]}">${fmt(last.value)}</text>`;
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(opts.title ?? 'Line chart')}">${grid}<path d="${line}" fill="none" stroke="${PALETTE[0]}" stroke-width="2.5" stroke-linejoin="round"/>${dots}${endLabel}${xlabels}</svg>`;
}

// A vertical bar chart. bars: [{label, value}]
export function barChart(bars, opts = {}) {
  const width = opts.width ?? 640;
  const height = opts.height ?? 260;
  const padL = 58;
  const padR = 14;
  const padT = 14;
  const padB = 34;
  const values = bars.map((b) => b.value);
  const max = niceMax(Math.max(...values) * 1.05);
  const min = opts.min ?? 0;
  const span = max - min || 1;
  const slot = (width - padL - padR) / bars.length;
  const barW = Math.min(46, slot * 0.62);
  const y = (v) => padT + (height - padT - padB) * (1 - (v - min) / span);
  const fmt = opts.format ?? ((v) => String(v));
  const grid = axisLabels(max, 4)
    .map((v) => {
      const gy = y(v);
      return `<line x1="${padL}" y1="${gy.toFixed(1)}" x2="${width - padR}" y2="${gy.toFixed(1)}" stroke="#e3e8ee" stroke-width="1"/><text x="${padL - 8}" y="${(gy + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="#5a6b7c">${fmt(v)}</text>`;
    })
    .join('');
  const rects = bars
    .map((b, i) => {
      const cx = padL + slot * i + slot / 2;
      const top = y(b.value);
      const base = y(min);
      return `<rect x="${(cx - barW / 2).toFixed(1)}" y="${top.toFixed(1)}" width="${barW.toFixed(1)}" height="${Math.max(1, base - top).toFixed(1)}" rx="3" fill="${PALETTE[i % PALETTE.length]}"><title>${esc(b.label)}: ${fmt(b.value)}</title></rect><text x="${cx.toFixed(1)}" y="${(top - 6).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="700" fill="#33465c">${fmt(b.value)}</text>`;
    })
    .join('');
  const xlabels = bars
    .map((b, i) => `<text x="${(padL + slot * i + slot / 2).toFixed(1)}" y="${height - 10}" text-anchor="middle" font-size="11" fill="#5a6b7c">${esc(b.label)}</text>`)
    .join('');
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(opts.title ?? 'Bar chart')}">${grid}${rects}${xlabels}</svg>`;
}

// Grouped bars: two series side by side. series: [{name, colour, values:[...]}]
export function groupedBarChart(labels, series, opts = {}) {
  const width = opts.width ?? 640;
  const height = opts.height ?? 280;
  const padL = 58;
  const padR = 14;
  const padT = 26;
  const padB = 34;
  const all = series.flatMap((s) => s.values);
  const max = niceMax(Math.max(...all) * 1.05);
  const y = (v) => padT + (height - padT - padB) * (1 - v / max);
  const fmt = opts.format ?? ((v) => String(v));
  const slot = (width - padL - padR) / labels.length;
  const groupW = Math.min(72, slot * 0.68);
  const barW = groupW / series.length;
  const grid = axisLabels(max, 4)
    .map((v) => {
      const gy = y(v);
      return `<line x1="${padL}" y1="${gy.toFixed(1)}" x2="${width - padR}" y2="${gy.toFixed(1)}" stroke="#e3e8ee" stroke-width="1"/><text x="${padL - 8}" y="${(gy + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="#5a6b7c">${fmt(v)}</text>`;
    })
    .join('');
  const rects = labels
    .map((label, i) =>
      series
        .map((s, j) => {
          const cx = padL + slot * i + (slot - groupW) / 2 + barW * j;
          const top = y(s.values[i]);
          return `<rect x="${cx.toFixed(1)}" y="${top.toFixed(1)}" width="${(barW - 2).toFixed(1)}" height="${Math.max(1, y(0) - top).toFixed(1)}" rx="2" fill="${s.colour}"><title>${esc(label)} ${esc(s.name)}: ${fmt(s.values[i])}</title></rect>`;
        })
        .join(''),
    )
    .join('');
  const xlabels = labels
    .map((label, i) => `<text x="${(padL + slot * i + slot / 2).toFixed(1)}" y="${height - 10}" text-anchor="middle" font-size="11" fill="#5a6b7c">${esc(label)}</text>`)
    .join('');
  const legend = series
    .map((s, j) => `<rect x="${padL + j * 130}" y="6" width="12" height="12" rx="2" fill="${s.colour}"/><text x="${padL + j * 130 + 17}" y="16" font-size="12" fill="#33465c">${esc(s.name)}</text>`)
    .join('');
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(opts.title ?? 'Grouped bar chart')}">${legend}${grid}${rects}${xlabels}</svg>`;
}

// A donut chart. slices: [{label, value, colour?}]
export function donutChart(slices, opts = {}) {
  const size = opts.size ?? 240;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 14;
  const inner = r * 0.58;
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  let angle = -Math.PI / 2;
  const paths = slices
    .map((s, i) => {
      const frac = s.value / total;
      const a0 = angle;
      const a1 = angle + frac * Math.PI * 2;
      angle = a1;
      const large = frac > 0.5 ? 1 : 0;
      const x0 = cx + r * Math.cos(a0);
      const y0 = cy + r * Math.sin(a0);
      const x1 = cx + r * Math.cos(a1);
      const y1 = cy + r * Math.sin(a1);
      const xi1 = cx + inner * Math.cos(a1);
      const yi1 = cy + inner * Math.sin(a1);
      const xi0 = cx + inner * Math.cos(a0);
      const yi0 = cy + inner * Math.sin(a0);
      const colour = s.colour ?? PALETTE[i % PALETTE.length];
      return `<path d="M${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 ${large} 1 ${x1.toFixed(1)},${y1.toFixed(1)} L${xi1.toFixed(1)},${yi1.toFixed(1)} A${inner},${inner} 0 ${large} 0 ${xi0.toFixed(1)},${yi0.toFixed(1)} Z" fill="${colour}"><title>${esc(s.label)}: ${s.value}%</title></path>`;
    })
    .join('');
  const legend = slices
    .map((s, i) => {
      const colour = s.colour ?? PALETTE[i % PALETTE.length];
      return `<div class="legend-item"><span class="swatch" style="background:${colour}"></span>${esc(s.label)} — <strong>${s.value}%</strong></div>`;
    })
    .join('');
  const centre = opts.centre ?? '';
  return `<div class="donut-wrap"><svg viewBox="0 0 ${size} ${size}" role="img" aria-label="${esc(opts.title ?? 'Donut chart')}">${paths}<text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="20" font-weight="700" fill="#12395b">${esc(centre)}</text><text x="${cx}" y="${cy + 16}" text-anchor="middle" font-size="11" fill="#5a6b7c">${esc(opts.centreLabel ?? '')}</text></svg><div class="legend">${legend}</div></div>`;
}

// Horizontal ranked bars: [{label, value}] sorted by the caller.
export function rankedBars(rows, opts = {}) {
  const width = opts.width ?? 640;
  const rowH = 34;
  const height = rows.length * rowH + 8;
  const fmt = opts.format ?? ((v) => String(v));
  const max = Math.max(...rows.map((r) => r.value));
  const labelW = 110;
  const valueW = 64;
  const barMax = width - labelW - valueW - 16;
  const bars = rows
    .map((row, i) => {
      const y = 8 + i * rowH;
      const w = Math.max(2, (row.value / max) * barMax);
      return `<text x="${labelW - 8}" y="${y + 15}" text-anchor="end" font-size="12" fill="#33465c">${esc(row.label)}</text><rect x="${labelW}" y="${y + 4}" width="${w.toFixed(1)}" height="18" rx="3" fill="${PALETTE[i % PALETTE.length]}"><title>${esc(row.label)}: ${fmt(row.value)}</title></rect><text x="${labelW + w + 8}" y="${y + 17}" font-size="12" font-weight="700" fill="#33465c">${fmt(row.value)}</text>`;
    })
    .join('');
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(opts.title ?? 'Ranked bars')}">${bars}</svg>`;
}
