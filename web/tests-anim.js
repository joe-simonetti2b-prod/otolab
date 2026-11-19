/* ============ TESTS : moteur de schémas animés et narrés ============ */
/* Scène = { s: chaîne SVG (viewBox 0 0 360 220), c: légende lue à voix haute }. */
const SV = {};
const SVR = 'var(--right)', SVL = 'var(--left)';
SV.t = (x, y, t, cls = '', a = 'middle') => `<text x="${x}" y="${y}" class="sv-t ${cls}" text-anchor="${a}">${esc(t)}</text>`;
SV.tag = (x, y, t, col = 'var(--ink)', a = 'middle') => {
  const w = t.length * 5.6 + 12, x0 = a === 'middle' ? x - w / 2 : a === 'end' ? x - w : x;
  return `<g class="sv-in"><rect x="${x0}" y="${y - 11}" width="${w}" height="16" rx="8" fill="var(--surface)" stroke="${col}" stroke-width="1.2"/><text x="${x0 + w / 2}" y="${y + 1}" class="sv-t sv-b" text-anchor="middle" fill="${col}">${esc(t)}</text></g>`;
};
SV.cap = (t) => `<text x="180" y="212" class="sv-t sv-cap" text-anchor="middle">${esc(t)}</text>`;
SV.title = (t) => `<text x="12" y="18" class="sv-t sv-ttl">${esc(t)}</text>`;
SV.flow = (d, col = 'var(--brass)', w = 2.2, cls = '') => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" class="sv-flow ${cls}" stroke-linecap="round"/>`;
SV.arrow = (x1, y1, x2, y2, col = 'var(--ink)', cls = '') => {
  const a = Math.atan2(y2 - y1, x2 - x1), h = 6;
  return `<g class="${cls}"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="1.6"/><path d="M${x2} ${y2}L${x2 - h * Math.cos(a - 0.45)} ${y2 - h * Math.sin(a - 0.45)}L${x2 - h * Math.cos(a + 0.45)} ${y2 - h * Math.sin(a + 0.45)}Z" fill="${col}"/></g>`;
};
SV.waves = (x, y, ang = 0, col = 'var(--brass)', n = 3) => {
  let o = '';
  for (let k = 1; k <= n; k++) {
    const r = 6 + k * 7, a1 = ang - 0.7, a2 = ang + 0.7;
    o += `<path d="M${x + r * Math.cos(a1)} ${y + r * Math.sin(a1)}A${r} ${r} 0 0 1 ${x + r * Math.cos(a2)} ${y + r * Math.sin(a2)}" fill="none" stroke="${col}" stroke-width="1.8" class="sv-wave" style="animation-delay:${(k - 1) * 0.25}s"/>`;
  }
  return o;
};
SV.spiral = (x, y, r, cls = '', col = 'var(--ink)') => {
  let d = '';
  for (let k = 0; k <= 28; k++) { const a = k * 0.42, rr = r * (1 - k / 34); d += (k ? 'L' : 'M') + (x + rr * Math.cos(a)).toFixed(1) + ' ' + (y + rr * Math.sin(a)).toFixed(1); }
  return `<path d="${d}" fill="none" stroke="${col}" stroke-width="1.6" class="${cls}"/>`;
};
SV.cross = (x, y, s = 7, col = 'var(--bad)') => `<path d="M${x - s} ${y - s}L${x + s} ${y + s}M${x + s} ${y - s}L${x - s} ${y + s}" stroke="${col}" stroke-width="2.4" stroke-linecap="round"/>`;
SV.check = (x, y, col = 'var(--ok)') => `<path d="M${x - 6} ${y}l4 5 9-10" fill="none" stroke="${col}" stroke-width="2.4" stroke-linecap="round"/>`;
SV.box = (x, y, w, h, t, o = {}) => `<g class="${o.cls || ''}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r == null ? 6 : o.r}" fill="${o.fill || 'var(--surface)'}" stroke="${o.stroke || 'var(--line)'}" stroke-width="1.3"/>${String(t).split('\n').map((ln, i, a) => `<text x="${x + w / 2}" y="${y + h / 2 + 4 + (i - (a.length - 1) / 2) * 12}" class="sv-t ${o.tcls || ''}" text-anchor="middle">${esc(ln)}</text>`).join('')}</g>`;
SV.bubble = (x, y, t, side = 'left', col = 'var(--ink)') => {
  const w = t.length * 5.5 + 16, x0 = side === 'left' ? x - w : x;
  const tail = side === 'left' ? `M${x - 10} ${y + 8}L${x + 2} ${y + 16}L${x - 4} ${y + 8}` : `M${x + 10} ${y + 8}L${x - 2} ${y + 16}L${x + 4} ${y + 8}`;
  return `<g class="sv-in"><rect x="${x0}" y="${y - 10}" width="${w}" height="19" rx="9" fill="var(--surface)" stroke="${col}" stroke-width="1.2"/><path d="${tail}" fill="var(--surface)" stroke="${col}" stroke-width="1.2"/><text x="${x0 + w / 2}" y="${y + 3}" class="sv-t" text-anchor="middle">${esc(t)}</text></g>`;
};
/* Diapason : base de la tige en (x,y), branches vers le haut, rotation en degrés */
SV.fork = (x, y, rot = 0, vib = true, s = 1) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
  <line x1="0" y1="0" x2="0" y2="-24" stroke="var(--steel)" stroke-width="4" stroke-linecap="round"/>
  <g class="${vib ? 'sv-vib' : ''}"><path d="M-7 -60V-32Q-7 -24 0 -24Q7 -24 7 -32V-60" fill="none" stroke="var(--steel)" stroke-width="4" stroke-linecap="round"/></g></g>`;
/* Tête vue de face : OD à gauche de l'écran (le patient nous fait face) */
const HD = { cx: 180, cy: 118 };
SV.head = (o = {}) => {
  const { cx, cy } = HD;
  let s = '';
  s += `<ellipse cx="${cx}" cy="${cy}" rx="50" ry="62" fill="var(--surface-2)" stroke="var(--ink)" stroke-width="1.6"/>`;
  s += `<path d="M${cx - 22} ${cy - 92 + 62}q8-4 14 0M${cx + 8} ${cy - 30}q8-4 14 0" stroke="var(--ink)" stroke-width="1.4" fill="none"/>`;
  s += `<circle cx="${cx - 16}" cy="${cy - 20}" r="2.4" fill="var(--ink)"/><circle cx="${cx + 16}" cy="${cy - 20}" r="2.4" fill="var(--ink)"/>`;
  s += `<path d="M${cx} ${cy - 12}l-5 16h8" stroke="var(--ink)" stroke-width="1.3" fill="none"/><path d="M${cx - 12} ${cy + 26}q12 7 24 0" stroke="var(--ink)" stroke-width="1.4" fill="none"/>`;
  [['R', -1, SVR], ['L', 1, SVL]].forEach(([e, d, col]) => {
    const ex = cx + d * 54;
    s += `<ellipse cx="${ex}" cy="${cy}" rx="8" ry="17" fill="var(--surface-2)" stroke="${col}" stroke-width="2"/>`;
    s += SV.t(ex, cy + 32, e === 'R' ? 'OD' : 'OG', 'sv-b', 'middle').replace('class="sv-t', `fill="${col}" class="sv-t`);
    const kx = cx + d * 31, ky = cy + 4;
    const st = o.hit && o.hit[e];
    s += `<circle cx="${kx}" cy="${ky}" r="11" fill="${st ? 'var(--brass-soft)' : 'transparent'}" class="${st ? 'sv-pulse' : ''}"/>`;
    s += SV.spiral(kx, ky, 9, '', o.dead && o.dead[e] ? 'var(--bad)' : 'var(--ink)');
    if (o.dead && o.dead[e]) s += SV.cross(kx, ky, 8);
    if (o.block && o.block[e]) s += `<rect x="${ex - 6}" y="${cy - 5}" width="12" height="10" rx="2" fill="var(--steel)" opacity=".9"/>${SV.t(ex + d * 24, cy - 22, o.block[e], 'sv-s', d < 0 ? 'end' : 'start')}`;
    if (o.occl && o.occl[e]) s += `<ellipse cx="${ex + d * 6}" cy="${cy}" rx="7" ry="9" fill="var(--brass)" opacity=".85"/>${SV.t(ex + d * 20, cy + 46, 'doigt sur le tragus', 'sv-s', d < 0 ? 'end' : 'start')}`;
    if (o.phone && o.phone[e]) s += `<path d="M${ex + d * 2} ${cy - 26}q${d * 26} 0 ${d * 26} 26q0 26 ${-d * 26} 26" fill="none" stroke="var(--ink)" stroke-width="2.4"/><rect x="${ex + d * 20 - 6}" y="${cy - 14}" width="12" height="28" rx="5" fill="var(--ink)"/>`;
    if (o.insert && o.insert[e]) s += `<circle cx="${ex}" cy="${cy}" r="5" fill="var(--brass)"/><line x1="${ex}" y1="${cy}" x2="${ex + d * 24}" y2="${cy + 40}" stroke="var(--muted)" stroke-width="2"/>`;
    if (o.vib && o.vib[e]) s += `<rect x="${cx + d * 50 - 7}" y="${cy + 24}" width="14" height="12" rx="3" fill="var(--ink)"/>${SV.t(cx + d * 70, cy + 52, 'vibrateur', 'sv-s', d < 0 ? 'end' : 'start')}`;
  });
  if (o.casque) s += `<path d="M${cx - 58} ${cy - 6}Q${cx - 58} ${cy - 86} ${cx} ${cy - 86}Q${cx + 58} ${cy - 86} ${cx + 58} ${cy - 6}" fill="none" stroke="var(--ink)" stroke-width="3"/><rect x="${cx - 70}" y="${cy - 20}" width="14" height="38" rx="5" fill="${SVR}"/><rect x="${cx + 56}" y="${cy - 20}" width="14" height="38" rx="5" fill="${SVL}"/>`;
  if (o.vibFront) s += `<rect x="${cx - 8}" y="${cy - 52}" width="16" height="11" rx="3" fill="var(--ink)"/>${SV.t(cx, cy - 58, 'vibrateur au front', 'sv-s')}`;
  if (o.lat) {
    const pos = { R: [cx - 98, cy - 52], L: [cx + 98, cy - 52], mid: [cx, cy - 82] }[o.lat];
    s += SV.bubble(pos[0] + (o.lat === 'R' ? 30 : o.lat === 'L' ? -30 : 50), pos[1], o.latText || (o.lat === 'mid' ? 'Au milieu' : o.lat === 'R' ? 'À droite' : 'À gauche'), o.lat === 'L' ? 'left' : 'right');
  }
  return s;
};
/* Fourche posée à un endroit de la tête */
SV.forkAt = (place, vib = true) => {
  const { cx, cy } = HD;
  switch (place) {
    case 'vertex': return SV.fork(cx, cy - 62, 0, vib) + SV.waves(cx, cy - 40, Math.PI / 2, 'var(--brass)');
    case 'front': return SV.fork(cx, cy - 46, 0, vib);
    case 'dents': return SV.fork(cx, cy + 28, 180, vib);
    case 'mastR': return SV.fork(cx - 50, cy + 30, -55, vib);
    case 'mastL': return SV.fork(cx + 50, cy + 30, 55, vib);
    case 'tragR': return SV.fork(cx - 63, cy, -90, vib);
    case 'tragL': return SV.fork(cx + 63, cy, 90, vib);
    case 'airR': return SV.fork(cx - 90, cy + 34, 0, vib) + SV.waves(cx - 82, cy, 0, 'var(--brass)');
    case 'airL': return SV.fork(cx + 90, cy + 34, 0, vib) + SV.waves(cx + 82, cy, Math.PI, 'var(--brass)');
  }
  return '';
};
/* Oreille en coupe schématique (x,y = entrée du conduit) */
SV.ear = (x = 40, y = 110, o = {}) => {
  let s = '';
  s += `<path d="M${x} ${y - 46}q-26 10-22 46q4 30 22 40" fill="none" stroke="var(--ink)" stroke-width="2"/>`;
  s += `<path d="M${x} ${y - 13}H${x + 92}M${x} ${y + 13}H${x + 92}" stroke="var(--ink)" stroke-width="1.8"/>`;
  s += SV.t(x + 46, y + 32, 'conduit', 'sv-s');
  if (o.plug) s += `<rect x="${x + 48}" y="${y - 12}" width="22" height="24" rx="5" fill="var(--steel)"/>${SV.t(x + 59, y - 20, o.plug, 'sv-s')}`;
  if (o.probe) s += `<rect x="${x - 18}" y="${y - 7}" width="${o.probe === 'deep' ? 70 : 34}" height="14" rx="4" fill="var(--brass)" opacity=".9"/>${SV.t(x - 4, y - 16, 'sonde', 'sv-s')}`;
  const tx = x + 94;
  if (o.perf) s += `<path d="M${tx} ${y - 22}V${y - 6}M${tx} ${y + 6}V${y + 22}" stroke="var(--ink)" stroke-width="2.4"/>`;
  else s += `<path d="M${tx} ${y - 22}Q${tx + (o.retract ? 9 : 4)} ${y} ${tx} ${y + 22}" fill="none" stroke="${o.tympHi || 'var(--ink)'}" stroke-width="2.4" class="${o.tympVib ? 'sv-tvib' : ''}"/>`;
  s += SV.t(tx, y - 28, 'tympan', 'sv-s');
  s += `<rect x="${tx + 2}" y="${y - 30}" width="50" height="62" rx="6" fill="${o.fluid ? 'rgba(176,140,60,.35)' : 'transparent'}" stroke="var(--line)" stroke-dasharray="3 3"/>`;
  s += SV.t(tx + 27, y + 46, 'oreille moyenne', 'sv-s');
  // osselets
  s += `<path d="M${tx + 3} ${y - 4}L${tx + 16} ${y - 14}" stroke="var(--ink)" stroke-width="3"/><circle cx="${tx + 19}" cy="${y - 16}" r="4" fill="var(--ink)"/>`;
  if (!o.disc) s += `<path d="M${tx + 22} ${y - 14}L${tx + 34} ${y - 4}" stroke="var(--ink)" stroke-width="3"/>`;
  else s += `<path d="M${tx + 22} ${y - 14}L${tx + 27} ${y - 10}" stroke="var(--ink)" stroke-width="3"/>${SV.t(tx + 30, y - 22, 'rupture', 'sv-s sv-bad')}`;
  s += `<path d="M${tx + 34} ${y - 4}H${tx + 48}M${tx + 48} ${y - 11}V${y + 3}" stroke="${o.fix ? 'var(--bad)' : 'var(--ink)'}" stroke-width="3"/>`;
  if (o.fix) s += SV.t(tx + 44, y + 18, 'étrier bloqué', 'sv-s sv-bad');
  const kx = tx + 82;
  s += `<circle cx="${kx}" cy="${y - 4}" r="20" fill="${o.hcHit ? 'var(--brass-soft)' : 'transparent'}" class="${o.hcHit ? 'sv-pulse' : ''}"/>`;
  s += SV.spiral(kx, y - 4, 17, '', o.hc ? 'var(--bad)' : 'var(--ink)');
  s += SV.t(kx, y + 32, 'cochlée', 'sv-s');
  s += `<path d="M${kx + 18} ${y - 4}C${kx + 40} ${y - 4} ${kx + 40} ${y - 20} ${kx + 62} ${y - 20}" fill="none" stroke="${o.nerve ? 'var(--bad)' : 'var(--ink)'}" stroke-width="2.4"/>`;
  s += SV.t(kx + 50, y + 2, 'nerf VIII', 'sv-s');
  if (o.nerve) s += `<circle cx="${kx + 44}" cy="${y - 14}" r="7" fill="var(--bad)" opacity=".7"/>`;
  if (o.hc) s += SV.cross(kx, y - 4, 7);
  if (o.ac) s += SV.flow(`M${x - 20} ${y}H${tx}L${tx + 48} ${y - 4}H${kx - 16}`, o.acCol || 'var(--brass)');
  if (o.bc) s += SV.flow(`M${kx} ${y - 70}V${y - 26}`, 'var(--left)') + SV.t(kx + 6, y - 74, o.bcLab || 'voie osseuse', 'sv-s', 'start');
  if (o.acBlock) s += SV.cross(o.acBlock, y, 8);
  return s;
};
/* Mini-audiogramme : pts = [[freqHz, dB], ...] */
SV.audio = (x, y, w, h, series = [], o = {}) => {
  const fx = f => x + Math.log2(f / 250) / Math.log2(8000 / 250) * w;
  const top = o.top == null ? -10 : o.top, bot = o.bot == null ? 120 : o.bot;
  const dy = d => y + (d - top) / (bot - top) * h;
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="var(--surface)" stroke="var(--line)"/>`;
  for (let d = 0; d <= bot; d += 20) s += `<line x1="${x}" x2="${x + w}" y1="${dy(d)}" y2="${dy(d)}" stroke="var(--line)" stroke-width=".7"/><text x="${x - 3}" y="${dy(d) + 3}" class="sv-t sv-xs" text-anchor="end">${d}</text>`;
  [250, 500, 1000, 2000, 4000, 8000].forEach(f => { s += `<line x1="${fx(f)}" x2="${fx(f)}" y1="${y}" y2="${y + h}" stroke="var(--line)" stroke-width=".7"/><text x="${fx(f)}" y="${y - 3}" class="sv-t sv-xs" text-anchor="middle">${fLabel(f)}</text>`; });
  if (o.band) s += `<rect x="${x}" y="${dy(o.band[0])}" width="${w}" height="${dy(o.band[1]) - dy(o.band[0])}" fill="var(--brass-soft)" opacity=".6"/>`;
  series.forEach(se => {
    const col = se.col || (se.side === 'L' ? SVL : SVR);
    const p = se.pts.map(([f, d]) => [fx(f), dy(d)]);
    if (!se.noLine && p.length > 1) s += `<polyline points="${p.map(q => q.join(',')).join(' ')}" fill="none" stroke="${col}" stroke-width="1.4" ${se.bc || se.dash ? 'stroke-dasharray="3 3"' : ''} class="${se.cls || ''}"/>`;
    p.forEach(([px, py]) => {
      if (se.bc) s += se.side === 'L' ? `<path d="M${px - 3} ${py - 5}l6 5-6 5" fill="none" stroke="${col}" stroke-width="1.6"/>` : `<path d="M${px + 3} ${py - 5}l-6 5 6 5" fill="none" stroke="${col}" stroke-width="1.6"/>`;
      else if (se.side === 'L') s += `<path d="M${px - 4} ${py - 4}l8 8m0-8l-8 8" stroke="${col}" stroke-width="1.6"/>`;
      else if (se.side === 'R') s += `<circle cx="${px}" cy="${py}" r="3.6" fill="var(--surface)" stroke="${col}" stroke-width="1.6"/>`;
      else s += `<circle cx="${px}" cy="${py}" r="2.6" fill="${col}"/>`;
    });
  });
  if (o.label) s += SV.t(x + w / 2, y + h + 13, o.label, 'sv-s');
  return s;
};
/* Graphe générique : pts normalisés 0..1 */
SV.graph = (x, y, w, h, curves = [], o = {}) => {
  let s = `<line x1="${x}" y1="${y + h}" x2="${x + w}" y2="${y + h}" stroke="var(--ink)" stroke-width="1.2"/><line x1="${x}" y1="${y}" x2="${x}" y2="${y + h}" stroke="var(--ink)" stroke-width="1.2"/>`;
  if (o.grid) for (let k = 1; k < 4; k++) s += `<line x1="${x}" x2="${x + w}" y1="${y + h * k / 4}" y2="${y + h * k / 4}" stroke="var(--line)" stroke-width=".6"/>`;
  if (o.xl) s += SV.t(x + w, y + h + 13, o.xl, 'sv-s', 'end');
  if (o.yl) s += SV.t(x - 2, y - 5, o.yl, 'sv-s', 'start');
  (o.xt || []).forEach(([v, l]) => { s += SV.t(x + v * w, y + h + 12, l, 'sv-xs'); });
  (o.yt || []).forEach(([v, l]) => { s += SV.t(x - 4, y + h - v * h + 3, l, 'sv-xs', 'end'); });
  curves.forEach(c => {
    const d = c.pts.map(([u, v], i) => (i ? 'L' : 'M') + (x + u * w).toFixed(1) + ' ' + (y + h - v * h).toFixed(1)).join('');
    s += `<path d="${d}" fill="none" stroke="${c.col || 'var(--brass)'}" stroke-width="${c.w || 2}" ${c.dash ? 'stroke-dasharray="4 3"' : ''} class="${c.draw ? 'sv-draw' : ''}"/>`;
    if (c.lab) { const [u, v] = c.pts[c.labAt == null ? c.pts.length - 1 : c.labAt]; const px = x + u * w, py = y + h - v * h; const end = px + c.lab.length * 5.2 > 352; s += `<text x="${end ? px - 4 : px + 4}" y="${py - 6}" class="sv-t sv-s sv-lab" text-anchor="${end ? 'end' : 'start'}" fill="${c.col || 'var(--brass)'}">${esc(c.lab)}</text>`; }
  });
  return s;
};
/* Petits pictogrammes */
SV.person = (x, y, col = 'var(--ink)', s = 1, lab = '') => `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="0" cy="-34" r="9" fill="none" stroke="${col}" stroke-width="2"/><path d="M-14 0v-14a14 12 0 0 1 28 0v14" fill="none" stroke="${col}" stroke-width="2"/></g>${lab ? SV.t(x, y + 13, lab, 'sv-s') : ''}`;
SV.baby = (x, y) => `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="0" rx="26" ry="11" fill="var(--surface-2)" stroke="var(--ink)" stroke-width="1.5"/><circle cx="-26" cy="-4" r="11" fill="var(--surface-2)" stroke="var(--ink)" stroke-width="1.5"/><path d="M-31 -6h2M-23 -6h2" stroke="var(--ink)" stroke-width="1.4"/></g>`;
SV.speaker = (x, y, ang = 0) => `<g transform="translate(${x} ${y}) rotate(${ang})"><rect x="-10" y="-14" width="20" height="28" rx="3" fill="var(--ink)"/><circle cx="0" cy="-5" r="4" fill="var(--surface)"/><circle cx="0" cy="6" r="6" fill="var(--surface)"/></g>`;
SV.screen = (x, y, w, h, inner = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="var(--surface)" stroke="var(--ink)" stroke-width="1.6"/>${inner}`;
SV.toy = (x, y, on) => `<g class="${on ? 'sv-pop' : ''}"><rect x="${x - 16}" y="${y - 14}" width="32" height="28" rx="5" fill="${on ? 'var(--brass)' : 'var(--surface-2)'}" stroke="var(--ink)" stroke-width="1.4"/><circle cx="${x - 6}" cy="${y - 3}" r="2.5" fill="var(--ink)"/><circle cx="${x + 6}" cy="${y - 3}" r="2.5" fill="var(--ink)"/><path d="M${x - 6} ${y + 6}q6 5 12 0" stroke="var(--ink)" stroke-width="1.4" fill="none"/></g>`;
SV.meter = (x, y, w, v, lab) => `<rect x="${x}" y="${y}" width="${w}" height="10" rx="5" fill="var(--surface-2)"/><rect x="${x}" y="${y}" width="${w * clamp(v, 0, 1)}" height="10" rx="5" fill="var(--brass)" class="sv-grow"/>${lab ? SV.t(x, y - 4, lab, 'sv-s', 'start') : ''}`;
/* Arbre / logigramme : nodes {x,y,w,h,t,k}, edges [[a,b,label]] */
SV.tree = (nodes, edges = []) => {
  let s = '';
  const N = {}; nodes.forEach(n => N[n.id] = n);
  edges.forEach(([a, b, lab]) => {
    const A = N[a], B = N[b];
    const x1 = A.x + A.w / 2, y1 = A.y + A.h, x2 = B.x + B.w / 2, y2 = B.y;
    s += `<path d="M${x1} ${y1}C${x1} ${(y1 + y2) / 2} ${x2} ${(y1 + y2) / 2} ${x2} ${y2 - 2}" fill="none" stroke="var(--muted)" stroke-width="1.3"/>`;
    if (lab) s += `<text x="${(x1 + x2) / 2 + 3}" y="${(y1 + y2) / 2 + 3}" class="sv-t sv-xs" text-anchor="middle">${esc(lab)}</text>`;
  });
  nodes.forEach((n, i) => {
    const col = n.k === 'ok' ? 'var(--ok)' : n.k === 'bad' ? 'var(--bad)' : n.k === 'warn' ? 'var(--warn)' : n.k === 'hi' ? 'var(--brass)' : 'var(--line)';
    s += `<g class="sv-in" style="animation-delay:${i * 0.12}s">` + SV.box(n.x, n.y, n.w, n.h, n.t, { stroke: col, tcls: 'sv-s' }) + '</g>';
  });
  return s;
};
SV.table = (x, y, cols, rows, o = {}) => {
  const cw = o.cw || cols.map(() => 80), rh = o.rh || 21;
  let s = '', cx = x;
  cols.forEach((c, i) => { s += `<text x="${cx + 4}" y="${y}" class="sv-t sv-b sv-th">${esc(c)}</text>`; cx += cw[i]; });
  rows.forEach((r, j) => {
    let xx = x;
    s += `<line x1="${x}" x2="${x + cw.reduce((a, b) => a + b, 0)}" y1="${y + 5 + j * rh}" y2="${y + 5 + j * rh}" stroke="var(--line)"/>`;
    r.forEach((c, i) => { s += `<text x="${xx + 4}" y="${y + 19 + j * rh}" class="sv-t sv-td ${o.hl && o.hl[j] ? 'sv-hl' : ''}">${esc(c)}</text>`; xx += cw[i]; });
  });
  return s;
};

/* ---------- Narration ---------- */
const NARR = { on: Store.get('narr', true), cur: null };
function sayStop() {
  NARR.cur = null;
  try { const T = window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.TextToSpeech; if (T && Capacitor.isNativePlatform()) T.stop(); } catch (e) { }
  try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) { }
}
function say(text) {
  const token = {}; NARR.cur = token;
  const est = 1800 + text.length * 62;
  return new Promise(res => {
    const done = () => { if (NARR.cur === token) res(true); else res(false); };
    let fired = false; const once = () => { if (!fired) { fired = true; done(); } };
    const timer = setTimeout(once, est + 6000);
    try {
      const T = window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform() && Capacitor.Plugins && Capacitor.Plugins.TextToSpeech;
      if (T) { T.speak({ text, lang: 'fr-FR', rate: 1.0, pitch: 1.0, volume: 1.0, category: 'playback' }).then(() => { clearTimeout(timer); once(); }).catch(() => { setTimeout(() => { clearTimeout(timer); once(); }, est); }); return; }
      if (window.speechSynthesis && window.SpeechSynthesisUtterance) {
        const u = new SpeechSynthesisUtterance(text); u.lang = 'fr-FR'; u.rate = 1.02;
        const v = speechSynthesis.getVoices().find(x => /^fr/i.test(x.lang)); if (v) u.voice = v;
        u.onend = () => { clearTimeout(timer); once(); }; u.onerror = () => { clearTimeout(timer); setTimeout(once, est); };
        speechSynthesis.speak(u); return;
      }
    } catch (e) { }
    clearTimeout(timer); setTimeout(once, est);
  });
}

/* ---------- Lecteur ---------- */
const ANIM = { scenes: null, i: 0, playing: false, timer: null, key: null };
function animHTML(key, scenes) {
  if (ANIM.key !== key) { animStop(); ANIM.key = key; ANIM.i = 0; }
  ANIM.scenes = scenes;
  const i = Math.min(ANIM.i, scenes.length - 1);
  return `<div class="anim" id="anim">
    <div class="anim-stage" id="animStage">${animSVG(scenes[i])}</div>
    <p class="anim-cap" id="animCap" aria-live="polite">${esc(scenes[i].c)}</p>
    <div class="anim-ctl">
      <button class="ab" data-act="animprev" aria-label="Étape précédente"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
      <button class="ab play" id="animPlay" data-act="animplay" aria-label="Lecture">${ANIM.playing ? ICO_PAUSE : ICO_PLAY}</button>
      <button class="ab" data-act="animnext" aria-label="Étape suivante"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>
      <div class="adots" id="animDots">${scenes.map((s, k) => `<button class="${k === i ? 'on' : ''}" data-act="animgo" data-i="${k}" aria-label="Étape ${k + 1}"></button>`).join('')}</div>
      <button class="ab narr${NARR.on ? ' on' : ''}" id="animNarr" data-act="animnarr" aria-label="Narration">${NARR.on ? ICO_SPK : ICO_MUTE}</button>
    </div></div>`;
}
const ICO_PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" class="fillc"/></svg>';
const ICO_PAUSE = '<svg viewBox="0 0 24 24"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" class="fillc"/></svg>';
const ICO_SPK = '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
const ICO_MUTE = '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>';
function animSVG(sc) { return `<svg viewBox="0 0 360 220" class="sv" role="img" aria-label="${esc(sc.c)}">${typeof sc.s === 'function' ? sc.s() : sc.s}</svg>`; }
function animShow(i) {
  const S = ANIM.scenes; if (!S) return;
  ANIM.i = clamp(i, 0, S.length - 1);
  const st = $('#animStage'), cp = $('#animCap');
  if (!st) return;
  st.innerHTML = animSVG(S[ANIM.i]); cp.textContent = S[ANIM.i].c;
  $$('#animDots button').forEach((b, k) => b.classList.toggle('on', k === ANIM.i));
}
function animStop() { ANIM.playing = false; clearTimeout(ANIM.timer); sayStop(); const b = $('#animPlay'); if (b) b.innerHTML = ICO_PLAY; }
async function animStep() {
  if (!ANIM.playing) return;
  const sc = ANIM.scenes[ANIM.i];
  const t0 = Date.now();
  const min = 2600 + sc.c.length * 40;
  if (NARR.on) { const ok = await say(sc.c); if (!ok || !ANIM.playing) return; }
  const wait = Math.max(700, min - (Date.now() - t0));
  ANIM.timer = setTimeout(() => {
    if (!ANIM.playing) return;
    if (ANIM.i >= ANIM.scenes.length - 1) { animStop(); return; }
    animShow(ANIM.i + 1); animStep();
  }, NARR.on ? 650 : wait);
}
ACT.animplay = () => {
  if (ANIM.playing) { animStop(); return; }
  if (ANIM.i >= ANIM.scenes.length - 1) animShow(0);
  ANIM.playing = true; $('#animPlay').innerHTML = ICO_PAUSE; animStep();
};
ACT.animnext = () => { const p = ANIM.playing; animStop(); animShow(ANIM.i + 1); if (p) ACT.animplay(); };
ACT.animprev = () => { const p = ANIM.playing; animStop(); animShow(ANIM.i - 1); if (p) ACT.animplay(); };
ACT.animgo = a => { animStop(); animShow(+a.dataset.i); };
ACT.animnarr = a => { NARR.on = !NARR.on; Store.set('narr', NARR.on); if (!NARR.on) sayStop(); a.classList.toggle('on', NARR.on); a.innerHTML = NARR.on ? ICO_SPK : ICO_MUTE; if (ANIM.playing) { animStop(); ACT.animplay(); } };
