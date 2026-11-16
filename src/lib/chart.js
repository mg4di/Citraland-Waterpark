const DEFAULT_COLORS = {
  line: '#00BCD4',
  fill: '#00BCD4',
  grid: '#e2e8f0',
  label: '#94a3b8',
};

function escapeHtml(value) {
  return String(value ?? '').replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character],
  );
}

function scaleY(value, max, top, bottom) {
  if (!max) return bottom;
  return bottom - (Math.max(0, Number(value) || 0) / max) * (bottom - top);
}

function pathFromPoints(points) {
  if (!points.length) return '';
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(' ');
}

/**
 * Build an SVG area/line chart. Returns an empty-state block when there is no data.
 */
export function areaChart(values, options = {}) {
  const {
    labels = [],
    width = 760,
    height = 250,
    top = 24,
    right = 20,
    bottom = 40,
    left = 52,
    color = DEFAULT_COLORS.line,
    fill = DEFAULT_COLORS.fill,
    gradientId = `area-${Math.random().toString(36).slice(2, 9)}`,
    valueFormatter = (value) => String(value),
    emptyLabel = 'Belum ada data',
  } = options;

  const numbers = values.map((value) => Math.max(0, Number(value) || 0));
  if (!numbers.length || numbers.every((value) => value === 0)) {
    return `<div class="flex h-full min-h-40 flex-col items-center justify-center gap-2 text-center text-sm text-slate-400">
      <iconify-icon icon="lucide:chart-no-axes-column" class="text-2xl"></iconify-icon>
      <span>${escapeHtml(emptyLabel)}</span>
    </div>`;
  }

  const max = Math.max(...numbers);
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const bottomY = top + plotHeight;
  const step = numbers.length > 1 ? plotWidth / (numbers.length - 1) : 0;
  const points = numbers.map((value, index) => ({
    x: left + index * step,
    y: scaleY(value, max, top, bottomY),
  }));
  const line = pathFromPoints(points);
  const area = `${line} L${points[points.length - 1].x.toFixed(1)} ${bottomY} L${points[0].x.toFixed(1)} ${bottomY} Z`;

  const gridLines = [0, 0.33, 0.66, 1]
    .map((ratio) => {
      const y = top + plotHeight * ratio;
      const value = max * (1 - ratio);
      return `<line x1="${left}" y1="${y.toFixed(1)}" x2="${width - right}" y2="${y.toFixed(1)}" />
      <text x="${left - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end">${escapeHtml(valueFormatter(value))}</text>`;
    })
    .join('');

  const tickIndexes = new Set([
    0,
    Math.floor((numbers.length - 1) / 4),
    Math.floor((numbers.length - 1) / 2),
    Math.floor(((numbers.length - 1) * 3) / 4),
    numbers.length - 1,
  ]);
  const tickLabels = [...tickIndexes]
    .filter((index) => index >= 0 && index < labels.length)
    .map(
      (index) =>
        `<text x="${(left + index * step).toFixed(1)}" y="${height - 12}" text-anchor="${index === 0 ? 'start' : index === numbers.length - 1 ? 'end' : 'middle'}">${escapeHtml(labels[index])}</text>`,
    )
    .join('');

  const lastPoint = points[points.length - 1];
  return `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" class="h-full w-full" role="img">
    <defs>
      <linearGradient id="${gradientId}" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="${fill}" stop-opacity=".25"></stop>
        <stop offset="1" stop-color="${fill}" stop-opacity="0"></stop>
      </linearGradient>
    </defs>
    <g stroke="${DEFAULT_COLORS.grid}" stroke-dasharray="3 5" fill="${DEFAULT_COLORS.label}" font-size="11">${gridLines}</g>
    <path d="${area}" fill="url(#${gradientId})"></path>
    <path d="${line}" fill="none" stroke="${color}" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"></path>
    <circle cx="${lastPoint.x.toFixed(1)}" cy="${lastPoint.y.toFixed(1)}" r="4" fill="${color}" stroke="white" stroke-width="2"></circle>
    <g fill="${DEFAULT_COLORS.label}" font-size="11">${tickLabels}</g>
  </svg>`;
}

/**
 * Build a grouped/plain bar chart. Each value can be a number or an array of series values.
 */
export function barChart(values, labels, options = {}) {
  const {
    width = 760,
    height = 250,
    top = 24,
    right = 20,
    bottom = 40,
    left = 52,
    colors = ['#00BCD4'],
    emptyLabel = 'Belum ada data',
  } = options;

  const series = values.map((value) =>
    Array.isArray(value)
      ? value.map((item) => Math.max(0, Number(item) || 0))
      : [Math.max(0, Number(value) || 0)],
  );
  const flattened = series.flat();
  if (!flattened.length || flattened.every((value) => value === 0)) {
    return `<div class="flex h-full min-h-40 flex-col items-center justify-center gap-2 text-center text-sm text-slate-400">
      <iconify-icon icon="lucide:chart-no-axes-column" class="text-2xl"></iconify-icon>
      <span>${escapeHtml(emptyLabel)}</span>
    </div>`;
  }

  const max = Math.max(...flattened);
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const bottomY = top + plotHeight;
  const slot = plotWidth / Math.max(1, series.length);
  const barWidth = Math.max(6, Math.min(28, (slot * 0.55) / Math.max(1, series[0].length)));
  const gridLines = [0, 0.33, 0.66, 1]
    .map((ratio) => {
      const y = top + plotHeight * ratio;
      const value = max * (1 - ratio);
      return `<line x1="${left}" y1="${y.toFixed(1)}" x2="${width - right}" y2="${y.toFixed(1)}" />
      <text x="${left - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end">${Math.round(value).toLocaleString('id-ID')}</text>`;
    })
    .join('');

  const bars = series
    .map((group, index) => {
      const groupCenter = left + slot * index + slot / 2;
      return group
        .map((value, seriesIndex) => {
          const y = scaleY(value, max, top, bottomY);
          const x = groupCenter - (barWidth * group.length) / 2 + barWidth * seriesIndex;
          return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${Math.max(0, bottomY - y).toFixed(1)}" rx="4" fill="${colors[seriesIndex] ?? colors[0]}" class="bar-animate" style="animation-delay:${(index * 0.03).toFixed(2)}s"></rect>`;
        })
        .join('');
    })
    .join('');

  const tickEvery = Math.ceil(labels.length / 12);
  const tickLabels = labels
    .map((label, index) => {
      if (index % tickEvery !== 0 && index !== labels.length - 1) return '';
      return `<text x="${(left + slot * index + slot / 2).toFixed(1)}" y="${height - 12}" text-anchor="middle">${escapeHtml(label)}</text>`;
    })
    .join('');

  return `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" class="h-full w-full" role="img">
    <g stroke="${DEFAULT_COLORS.grid}" stroke-dasharray="3 5" fill="${DEFAULT_COLORS.label}" font-size="11">${gridLines}</g>
    <g>${bars}</g>
    <g fill="${DEFAULT_COLORS.label}" font-size="11">${tickLabels}</g>
  </svg>`;
}

const DONUT_COLORS = {
  paid: '#00BCD4',
  pending: '#f59e0b',
  failed: '#f43f5e',
  cancelled: '#94a3b8',
  refunded: '#8b5cf6',
  weekday: '#00BCD4',
  weekend: '#0097A7',
};

export function donutSegments(items) {
  const segments = items
    .map((item) => ({
      key: item.key,
      label: item.label,
      value: Math.max(0, Number(item.value) || 0),
      color: item.color ?? DONUT_COLORS[item.key] ?? '#cbd5e1',
    }))
    .filter((item) => item.value > 0);
  const total = segments.reduce((sum, item) => sum + item.value, 0);
  if (!total) {
    return {
      total: 0,
      gradient: 'conic-gradient(#e2e8f0 0 100%)',
      segments: [],
    };
  }
  let cursor = 0;
  const stops = segments.map((item) => {
    const start = cursor;
    const end = cursor + (item.value / total) * 100;
    cursor = end;
    return `${item.color} ${start.toFixed(2)}% ${end.toFixed(2)}%`;
  });
  return {
    total,
    gradient: `conic-gradient(${stops.join(', ')})`,
    segments,
  };
}

export function percent(part, total) {
  if (!total) return 0;
  return Math.round((Number(part) / Number(total)) * 1000) / 10;
}
