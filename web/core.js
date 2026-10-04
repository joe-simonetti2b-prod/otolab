'use strict';
/* ============ CORE : utilitaires, aléatoire, stockage, graphiques ============ */
const F = [250, 500, 1000, 2000, 3000, 4000, 6000, 8000];
const NBC = 6; // conduction osseuse mesurée de 250 à 4000 Hz
const BC_MAX = [45, 60, 70, 70, 70, 65];
const AC_MAX = 120;
const fLabel = f => f >= 1000 ? (f / 1000) + 'k' : String(f);

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const r5 = v => Math.round(v / 5) * 5;
const avg = a => a.reduce((s, x) => s + x, 0) / a.length;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const sideName = s => s === 'R' ? 'droite' : 'gauche';
const sideShort = s => s === 'R' ? 'OD' : 'OG';

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function makeRng(seed) {
  const r = mulberry32(seed);
  const R = {
    f: r,
    int: (a, b) => a + Math.floor(r() * (b - a + 1)),
    range: (a, b) => a + r() * (b - a),
    pick: arr => arr[Math.floor(r() * arr.length)],
    chance: p => r() < p,
    gauss: (m = 0, s = 1) => {
      const u = 1 - r(), v = r();
      return m + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    },
    shuffle: arr => {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
      return a;
    },
    wpick: (items, wf) => {
      const tot = items.reduce((s, it) => s + wf(it), 0);
      let x = r() * tot;
      for (const it of items) { x -= wf(it); if (x <= 0) return it; }
      return items[items.length - 1];
    }
  };
  return R;
}
const newSeed = () => Math.floor(Math.random() * 899999) + 100000;

const Store = {
  get(k, d) { try { const v = localStorage.getItem('otolab.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('otolab.' + k, JSON.stringify(v)); } catch (e) { } }
};

/* ---------- Actions déléguées ---------- */
const ACT = {};
const INP = {};
document.addEventListener('click', e => {
  const a = e.target.closest('[data-act]');
  if (!a || a.disabled) return;
  const fn = ACT[a.dataset.act];
  if (fn) fn(a, e);
});
document.addEventListener('input', e => {
  const a = e.target.closest('[data-inp]');
  if (!a) return;
  const fn = INP[a.dataset.inp];
  if (fn) fn(a, e);
});
document.addEventListener('change', e => {
  const a = e.target.closest('[data-chg]');
  if (!a) return;
  const fn = ACT[a.dataset.chg];
  if (fn) fn(a, e);
});

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { t.hidden = true; }, 2600);
}

function copyText(txt, btn) {
  const done = () => { toast('Copié dans le presse-papiers'); };
  try {
    navigator.clipboard.writeText(txt).then(done).catch(() => fallback());
  } catch (e) { fallback(); }
  function fallback() {
    const ta = document.createElement('textarea');
    ta.value = txt; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { toast('Sélectionnez le texte pour le copier'); }
    ta.remove();
  }
}

/* ---------- Classification BIAP ---------- */
function biapAvg(ear) {
  // moyenne 500/1000/2000/4000, pas de réponse = 120
  const idx = [1, 2, 3, 5];
  return avg(idx.map(i => ear.acNR[i] ? 120 : ear.ac[i]));
}
const BIAP = [
  { k: 'normale', lab: 'Audition normale ou subnormale', max: 20 },
  { k: 'legere', lab: 'Déficience légère', max: 40 },
  { k: 'moyenne', lab: 'Déficience moyenne', max: 70 },
  { k: 'severe', lab: 'Déficience sévère', max: 90 },
  { k: 'profonde', lab: 'Déficience profonde', max: 119.9 },
  { k: 'totale', lab: 'Déficience totale (cophose)', max: 999 }
];
function biapCat(p) { return BIAP.find(b => p <= b.max); }
function biapSub(p) {
  if (p <= 20) return 'audition normale ou subnormale';
  if (p <= 40) return 'légère';
  if (p <= 55) return 'moyenne 1er degré';
  if (p <= 70) return 'moyenne 2e degré';
  if (p <= 80) return 'sévère 1er degré';
  if (p <= 90) return 'sévère 2e degré';
  if (p <= 100) return 'profonde 1er degré';
  if (p <= 110) return 'profonde 2e degré';
  if (p < 120) return 'profonde 3e degré';
  return 'totale (cophose)';
}
function hearingType(ear) {
  const p = biapAvg(ear);
  const mx = Math.max(...[0, 1, 2, 3, 4, 5].map(i => ear.acNR[i] ? 120 : ear.ac[i]));
  if (p <= 20 && mx <= 30) return 'normale';
  // écart aérien-osseux calculé seulement là où la CO a répondu
  const idx = [1, 2, 3].filter(i => !(ear.bcNR && ear.bcNR[i]));
  if (!idx.length) return 'perception';
  const gap = avg(idx.map(i => (ear.acNR[i] ? 120 : ear.ac[i]) - ear.bc[i]));
  const bcAvg = avg([1, 2, 3].map(i => ear.bc[i]));
  if (gap >= 15 && bcAvg <= 20) return 'transmission';
  if (gap >= 15) return 'mixte';
  return 'perception';
}
const TYPE_LAB = { normale: 'Normale', transmission: 'Transmission', perception: 'Perception', mixte: 'Mixte' };

/* ---------- Audiogramme SVG ---------- */
function xF(f, x0, w) { return x0 + Math.log2(f / 125) / Math.log2(8000 / 125) * w; }
function audiogramSVG(ears, opts = {}) {
  const show = opts.show || 'both';
  const W = 360, H = 330, x0 = 40, y0 = 30, w = 300, h = 285;
  const yD = d => y0 + (d + 10) / 140 * h;
  const fx = f => xF(f, x0, w);
  let s = `<svg class="ag" viewBox="0 0 ${W} ${H}" role="img" aria-label="Audiogramme">`;
  // zones BIAP
  const zones = [[21, 40, 'légère'], [41, 70, 'moyenne'], [71, 90, 'sévère'], [91, 119, 'profonde']];
  zones.forEach((z, i) => {
    s += `<rect x="${x0}" y="${yD(z[0] - 0.5)}" width="${w}" height="${yD(z[1] + 0.5) - yD(z[0] - 0.5)}" fill="var(--zone${i % 2})"/>`;
    s += `<text x="${x0 + w - 4}" y="${yD(z[1]) - 3}" class="ag-zone" text-anchor="end">${z[2]}</text>`;
  });
  // grille
  for (let d = -10; d <= 130; d += 10) {
    s += `<line x1="${x0}" x2="${x0 + w}" y1="${yD(d)}" y2="${yD(d)}" class="${d === 20 ? 'ag-g20' : 'ag-g'}"/>`;
    s += `<text x="${x0 - 6}" y="${yD(d) + 3}" class="ag-t" text-anchor="end">${d}</text>`;
  }
  [125, 250, 500, 750, 1000, 1500, 2000, 3000, 4000, 6000, 8000].forEach(f => {
    const main = [125, 250, 500, 1000, 2000, 4000, 8000].includes(f);
    s += `<line x1="${fx(f)}" x2="${fx(f)}" y1="${y0}" y2="${y0 + h}" class="${main ? 'ag-g' : 'ag-g2'}"/>`;
    if (main) s += `<text x="${fx(f)}" y="${y0 - 8}" class="ag-t" text-anchor="middle">${fLabel(f)}</text>`;
  });
  s += `<text x="${x0 - 30}" y="${y0 - 8}" class="ag-t">dB HL</text>`;
  s += `<text x="${x0 + w}" y="${H - 2}" class="ag-t" text-anchor="end">Hz</text>`;

  const draw = (side) => {
    const e = ears[side]; if (!e) return '';
    const col = side === 'R' ? 'var(--right)' : 'var(--left)';
    let o = '';
    // CA
    const pts = [];
    F.forEach((f, i) => { if (e.ac[i] != null) pts.push([fx(f), yD(e.ac[i]), e.acNR[i]]); });
    if (pts.length > 1) o += `<polyline points="${pts.map(p => p[0] + ',' + p[1]).join(' ')}" fill="none" stroke="${col}" stroke-width="1.6" ${side === 'L' ? 'stroke-dasharray="5 3"' : ''}/>`;
    pts.forEach(([x, y, nr]) => {
      if (side === 'R') o += `<circle cx="${x}" cy="${y}" r="5.5" fill="var(--surface)" stroke="${col}" stroke-width="1.8"/>`;
      else o += `<path d="M${x - 5} ${y - 5}L${x + 5} ${y + 5}M${x + 5} ${y - 5}L${x - 5} ${y + 5}" stroke="${col}" stroke-width="1.8"/>`;
      if (nr) { const dx = side === 'R' ? -1 : 1; o += `<path d="M${x + dx * 4} ${y + 5}l${dx * 7} 9m0 0l${-dx * 1} -5m${dx * 1} 5l${-dx * 5} -1" stroke="${col}" stroke-width="1.5" fill="none"/>`; }
    });
    // CO
    if (e.bc && !opts.noBC) {
      const bp = [];
      for (let i = 0; i < NBC; i++) if (e.bc[i] != null) bp.push([fx(F[i]) + (side === 'R' ? -9 : 9), yD(e.bc[i]), e.bcNR && e.bcNR[i]]);
      if (bp.length > 1) o += `<polyline points="${bp.map(p => p[0] + ',' + p[1]).join(' ')}" fill="none" stroke="${col}" stroke-width="1" stroke-dasharray="1.5 3"/>`;
      bp.forEach(([x, y, nr]) => {
        if (side === 'R') o += `<path d="M${x + 3} ${y - 6}L${x - 3} ${y}L${x + 3} ${y + 6}" stroke="${col}" stroke-width="1.8" fill="none"/>`;
        else o += `<path d="M${x - 3} ${y - 6}L${x + 3} ${y}L${x - 3} ${y + 6}" stroke="${col}" stroke-width="1.8" fill="none"/>`;
        if (nr) { const dx = side === 'R' ? -1 : 1; o += `<path d="M${x} ${y + 6}l${dx * 6} 8" stroke="${col}" stroke-width="1.4"/>`; }
      });
    }
    return o;
  };
  if (show !== 'L') s += draw('R');
  if (show !== 'R') s += draw('L');
  s += '</svg>';
  return s;
}
function agLegend() {
  return `<div class="legend"><span class="lg r"><svg width="14" height="14"><circle cx="7" cy="7" r="5" fill="none" stroke="var(--right)" stroke-width="1.8"/></svg>CA droite</span>
  <span class="lg l"><svg width="14" height="14"><path d="M2 2L12 12M12 2L2 12" stroke="var(--left)" stroke-width="1.8"/></svg>CA gauche</span>
  <span class="lg r"><svg width="14" height="14"><path d="M10 1L4 7L10 13" stroke="var(--right)" stroke-width="1.8" fill="none"/></svg>CO droite</span>
  <span class="lg l"><svg width="14" height="14"><path d="M4 1L10 7L4 13" stroke="var(--left)" stroke-width="1.8" fill="none"/></svg>CO gauche</span>
  <span class="lg"><svg width="14" height="14"><path d="M3 3l7 9" stroke="var(--muted)" stroke-width="1.5"/></svg>Pas de réponse</span></div>`;
}

/* ---------- Tympanogramme SVG ---------- */
function tympSVG(t) {
  const W = 360, H = 200, x0 = 40, y0 = 14, w = 300, h = 150;
  let maxC = 2;
  ['R', 'L'].forEach(s => { if (t[s] && t[s].type !== 'NR') maxC = Math.max(maxC, Math.ceil((t[s].comp + 0.3) * 2) / 2); });
  const px = p => x0 + (p + 400) / 600 * w;
  const cy = c => y0 + h - c / maxC * h;
  let s = `<svg class="ag" viewBox="0 0 ${W} ${H}" role="img" aria-label="Tympanogramme">`;
  s += `<rect x="${px(-100)}" y="${cy(1.6)}" width="${px(50) - px(-100)}" height="${cy(0.3) - cy(1.6)}" fill="var(--zone1)" stroke="var(--line)" stroke-dasharray="3 3"/>`;
  for (let p = -400; p <= 200; p += 100) {
    s += `<line x1="${px(p)}" x2="${px(p)}" y1="${y0}" y2="${y0 + h}" class="ag-g"/>`;
    s += `<text x="${px(p)}" y="${y0 + h + 14}" class="ag-t" text-anchor="middle">${p}</text>`;
  }
  for (let c = 0; c <= maxC + 0.01; c += 0.5) {
    s += `<line x1="${x0}" x2="${x0 + w}" y1="${cy(c)}" y2="${cy(c)}" class="ag-g"/>`;
    s += `<text x="${x0 - 6}" y="${cy(c) + 3}" class="ag-t" text-anchor="end">${c.toFixed(1)}</text>`;
  }
  s += `<text x="${x0 + w}" y="${H - 4}" class="ag-t" text-anchor="end">daPa</text><text x="4" y="${y0 + 4}" class="ag-t">ml</text>`;
  ['R', 'L'].forEach(side => {
    const e = t[side]; if (!e || e.type === 'NR') return;
    const col = side === 'R' ? 'var(--right)' : 'var(--left)';
    const pts = [];
    for (let p = -400; p <= 200; p += 10) {
      let c;
      if (e.type === 'B') c = 0.08 + (p + 400) / 600 * 0.06;
      else { const wd = e.type === 'Ad' ? 55 : e.type === 'As' ? 80 : 65; c = 0.05 + e.comp * Math.exp(-Math.pow((p - e.peak) / wd, 2)); }
      pts.push(px(p) + ',' + cy(Math.min(c, maxC)));
    }
    s += `<polyline points="${pts.join(' ')}" fill="none" stroke="${col}" stroke-width="2" ${side === 'L' ? 'stroke-dasharray="5 3"' : ''}/>`;
  });
  s += '</svg>';
  return s;
}

/* ---------- Courbes de gain SVG ---------- */
function gainSVG(o) {
  // o: {chF, g:{50,65,80}, t:{50,65,80}, eff65, msg, cap, mode}
  const W = 360, H = 230, x0 = 34, y0 = 12, w = 314, h = 190;
  const maxG = Math.max(70, Math.ceil((Math.max(o.cap || 0, ...o.g[50], ...(o.t ? o.t[50] : [0])) + 5) / 10) * 10);
  const fx = f => x0 + Math.log2(f / 200) / Math.log2(7000 / 200) * w;
  const gy = g => y0 + h - clamp(g, -10, maxG) / maxG * h;
  let s = `<svg class="ag" viewBox="0 0 ${W} ${H}" role="img" aria-label="Courbes de gain">`;
  for (let g = 0; g <= maxG; g += 10) {
    s += `<line x1="${x0}" x2="${x0 + w}" y1="${gy(g)}" y2="${gy(g)}" class="ag-g"/>`;
    s += `<text x="${x0 - 5}" y="${gy(g) + 3}" class="ag-t" text-anchor="end">${g}</text>`;
  }
  o.chF.forEach(f => { s += `<text x="${fx(f)}" y="${H - 6}" class="ag-t" text-anchor="middle">${fLabel(f)}</text>`; });
  s += `<text x="4" y="${y0 + 4}" class="ag-t">dB</text>`;
  if (o.msg) {
    const p = o.chF.map((f, i) => i >= 3 ? `${fx(f)},${gy(o.msg)}` : null).filter(Boolean);
    s += `<polyline points="${p.join(' ')}" fill="none" stroke="var(--bad)" stroke-width="1.2" stroke-dasharray="2 3"/>`;
    s += `<text x="${fx(o.chF[3]) - 4}" y="${gy(o.msg) - 4}" class="ag-t" fill="var(--bad)">limite larsen</text>`;
  }
  const line = (arr, cls, extra = '') => `<polyline points="${arr.map((g, i) => fx(o.chF[i]) + ',' + gy(g)).join(' ')}" fill="none" class="${cls}" ${extra}/>`;
  const sel = o.mode || 65;
  // cible : bande ±3 dB pour le niveau sélectionné
  if (o.t) {
  const t = o.t[sel];
  const band = t.map((g, i) => fx(o.chF[i]) + ',' + gy(g + 3)).join(' ') + ' ' + t.slice().reverse().map((g, i) => fx(o.chF[t.length - 1 - i]) + ',' + gy(g - 3)).join(' ');
  s += `<polygon points="${band}" fill="var(--brass-soft)" opacity=".9"/>`;
  [50, 65, 80].forEach(L => { s += line(o.t[L], 'gc-t' + (L === sel ? ' on' : '')); });
  }
  if (o.eff65) s += line(o.eff65, 'gc-eff');
  [80, 65, 50].forEach(L => {
    s += line(o.g[L], 'gc-g' + L + (L === sel ? ' on' : ''));
    o.g[L].forEach((g, i) => { s += `<circle cx="${fx(o.chF[i])}" cy="${gy(g)}" r="${L === sel ? 3.2 : 2}" class="gc-p${L}"/>`; });
  });
  s += '</svg>';
  return s;
}

/* ---------- Petits composants ---------- */
function chipGroup(name, options, value, act = 'pick') {
  return `<div class="chips" role="radiogroup">${options.map(o => {
    const v = typeof o === 'string' ? o : o.v; const l = typeof o === 'string' ? o : o.l;
    return `<button type="button" class="chip${value === v ? ' on' : ''}" data-act="${act}" data-name="${name}" data-val="${esc(v)}" role="radio" aria-checked="${value === v}">${l}</button>`;
  }).join('')}</div>`;
}
function pctBar(p) {
  const cls = p >= 75 ? 'ok' : p >= 50 ? 'warn' : 'bad';
  return `<div class="pbar"><i class="${cls}" style="width:${clamp(p, 0, 100)}%"></i></div>`;
}
