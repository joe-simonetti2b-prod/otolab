/* ============ TESTS : simulateurs sur patient virtuel et outils de dépistage ============ */
const TS = { tab: 'atlas', cat: 'all', q: '', open: null, sim: null, quiz: null };
const SIMS = [
  { k: 'acou', t: 'Acoumétrie virtuelle', d: 'Weber, Rinne, Schwabach, Bing, Gellé, Federici et voix sur un patient tiré au hasard. À vous de conclure.', ic: 'diapason' },
  { k: 'rainville', t: 'Rainville / SAL', d: 'Estimer la conduction osseuse avec un bruit au vibrateur, sans masquage classique.', ic: 'bruit' },
  { k: 'topo', t: 'Batterie topodiagnostique', d: 'SISI, Fowler, tone decay, réflexes, Békésy, vocale, PEA : cochléaire, rétrocochléaire ou transmission ?', ic: 'cible' },
  { k: 'stenger', t: 'Surdité simulée ?', d: 'Test de Stenger sur un patient qui annonce une oreille sourde. Réelle ou simulée ?', ic: 'masque' },
  { k: 'bruit', t: 'Vocale dans le bruit', d: 'Procédure adaptative type test matriciel : trouver le seuil en rapport signal/bruit.', ic: 'vague' },
  { k: 'cab', t: 'Cabine tonale et vocale masquée', d: 'Hughson-Westlake, masquage et plateau, Lafon et Fournier : dans le poste Cabinet.', ic: 'cabine' }
];
const DTOOLS = [
  { k: 'balayage', t: 'Balayage de dépistage', d: 'Pass / à contrôler à 20, 25 ou 30 dB HL, mode examinateur, compte rendu.' },
  { k: 'chuchote', t: 'Voix chuchotée guidée', d: 'Triplets générés, protocole en deux essais par oreille, résultat.' },
  { k: 'vpp', t: 'Calculateur sensibilité / VPP', d: 'Voir l’effet de la prévalence sur 1000 personnes dépistées.' },
  { k: 'ambiant', t: 'Bruit ambiant', d: 'Contrôle du bruit de la pièce avant un dépistage (micro du téléphone).' }
];
const tsBack = (lab = 'Retour') => `<button class="btn ghost small" data-act="tsback">← ${lab}</button>`;
function tsHead(title, sub) { return `<div class="row between"><div>${tsBack()}</div></div><section class="hero slim"><h1>${esc(title)}</h1>${sub ? `<p class="lead">${esc(sub)}</p>` : ''}</section>`; }

/* ---------- patient virtuel commun ---------- */
const TS_POOL = ['otospongiose', 'osm', 'perforation', 'luxation', 'bouchon', 'cophose_uni', 'brusque', 'neurinome', 'presby', 'trauma_chr', 'omc_seq', 'meniere', 'tympanosclerose', 'genet_adulte', 'normale_bruit', 'labyrinthite'];
function tsCase(pool) {
  const rng = makeRng(newSeed());
  return generateCase({ patho: rng.pick(pool), seed: newSeed() });
}
const tsAC = (cs, s, i) => cabAC(cs, s, i);
const tsC = (cs, s, i) => cabCoch(cs, s, i);
const tsABG = (cs, s, i) => { const a = tsAC(cs, s, i), c = tsC(cs, s, i); return a >= 999 || c >= 999 ? 0 : Math.max(0, a - c); };
const tsSideName = s => s === 'R' ? 'droite' : 'gauche';

/* ================= ACOUMÉTRIE VIRTUELLE ================= */
const FORKS = { 256: { i: 0, bc: 60 }, 512: { i: 1, bc: 50 }, 1024: { i: 2, bc: 45 } };
function acouNew() { TS.acou = { cs: tsCase(TS_POOL), f: 512, log: [], ans: {}, done: false }; }
function acouTruth(cs, s, i) {
  const a = tsAC(cs, s, i), c = tsC(cs, s, i), g = tsABG(cs, s, i);
  if (a >= 999 || c >= 90) return 'cophose';
  if (a <= 25) return 'normale';
  if (g >= 20 && c <= 25) return 'transmission';
  if (g >= 20) return 'mixte';
  return 'perception';
}
const ACOU_T = [['normale', 'Normale'], ['transmission', 'Transmission'], ['perception', 'Perception'], ['mixte', 'Mixte'], ['cophose', 'Cophose']];
function acouDo(test, s) {
  const A = TS.acou, cs = A.cs, F0 = FORKS[A.f], i = F0.i, o = s === 'R' ? 'L' : 'R', r = 0.7;
  const C = x => tsC(cs, x, i), AC = x => tsAC(cs, x, i), G = x => tsABG(cs, x, i);
  const sec = v => Math.max(0, Math.round(v / r));
  let line = '', key = test + (s || '');
  if (test === 'weber') {
    const sc = x => C(x) >= 999 ? -999 : (50 - C(x)) + 0.6 * Math.min(G(x), 40);
    const d = sc('R') - sc('L');
    const lat = Math.abs(d) < 6 ? 'mid' : d > 0 ? 'R' : 'L';
    A.res = A.res || {}; A.res.weber = lat;
    line = `Weber ${A.f} Hz au vertex : « ${lat === 'mid' ? 'Au milieu, partout.' : lat === 'R' ? 'Plutôt à droite.' : 'Plutôt à gauche.'} »`;
  } else if (test === 'rinne') {
    const thrBC = Math.min(C(s), C(o) + 3);
    const thrAC = Math.min(AC(s), AC(o) + 50);
    const tB = sec(F0.bc - thrBC), tA = sec(75 - thrAC);
    const pos = tA > tB;
    (A.res = A.res || {})['rinne' + s] = pos ? 'pos' : 'neg';
    line = `Rinne ${sideShort(s)} : osseux ${tB} s, puis aérien ${pos ? `encore ${tA - tB} s de plus` : 'plus entendu'}. ${pos ? 'Rinne positif.' : 'Rinne négatif.'}`;
    if (tB === 0 && tA === 0) line = `Rinne ${sideShort(s)} : « Je n’entends rien, ni derrière ni devant. »`;
  } else if (test === 'schwabach') {
    const best = Math.min(...['R', 'L'].map(x => C(x) >= 999 ? 999 : C(x) - 0.4 * G(x)));
    const tp = sec(F0.bc - best), te = sec(F0.bc);
    const v = best < -6 ? 'allongé' : best > 8 ? 'raccourci' : 'normal';
    (A.res = A.res || {}).schwabach = v;
    line = `Schwabach : patient ${tp} s, examinateur ${te} s. ${v[0].toUpperCase() + v.slice(1)}.`;
  } else if (test === 'bing') {
    const pos = C(s) < 999 && G(s) < 10 && C(s) <= C(o) + 10;
    (A.res = A.res || {})['bing' + s] = pos ? 'pos' : 'neg';
    line = `Bing ${sideShort(s)} : « ${pos ? 'Plus fort quand vous bouchez.' : 'Pas de différence.'} » ${pos ? 'Bing positif.' : 'Bing négatif.'}`;
  } else if (test === 'gelle') {
    const t = cs.tymp[s];
    const aff = cs.sides.includes(s);
    let v = 'pos';
    if (t && (t.type === 'B' || t.type === 'NR')) v = 'ni';
    else if (aff && ['otospongiose', 'tympanosclerose'].includes(cs.patho.id)) v = 'neg';
    if (C(s) >= 999) v = 'ni';
    (A.res = A.res || {})['gelle' + s] = v;
    line = v === 'ni' ? `Gellé ${sideShort(s)} : non interprétable (pas d’étanchéité ou pas de perception de ce côté).` : `Gellé ${sideShort(s)} : « ${v === 'pos' ? 'Le son baisse quand vous appuyez.' : 'Aucun changement.'} » Gellé ${v === 'pos' ? 'positif' : 'négatif'}.`;
  } else if (test === 'federici') {
    const neg = G(s) >= 15 || C(s) >= 999;
    (A.res = A.res || {})['fed' + s] = neg ? 'neg' : 'pos';
    line = `Federici ${sideShort(s)} : « Plus fort ${neg ? 'derrière l’oreille' : 'sur le tragus'}. » ${neg ? 'Négatif.' : 'Positif.'}`;
  } else if (test === 'voix') {
    const p = biapAvg(cs.ears[s]);
    const dch = p >= 110 ? 0 : clamp(6 * Math.pow(10, -Math.max(0, p - 15) / 20), 0, 6);
    const dh = p >= 115 ? 0 : clamp(dch * 10, 0, 20);
    const f = d => d === 0 ? 'non perçue' : d < 0.25 ? 'au contact' : d < 1 ? (Math.round(d * 10) / 10).toString().replace('.', ',') + ' m' : (d >= 6 && d < 20 ? '≥ ' : '') + Math.round(d) + ' m';
    line = `Voix ${sideShort(s)} (autre oreille masquée) : chuchotée ${f(dch)}, voix haute ${dh >= 20 ? '≥ 20 m' : f(dh)}.`;
  }
  A.log = A.log.filter(x => x.key !== key).concat([{ key, line, f: A.f }]);
  renderView();
}
function acouView() {
  const A = TS.acou;
  const btn = (t, s, l) => `<button class="btn small" data-act="acoudo" data-t="${t}" data-s="${s || ''}">${l}</button>`;
  const earSel = (k) => chipGroup(k, [{ v: 'normale', l: 'Normale' }, { v: 'transmission', l: 'Transm.' }, { v: 'perception', l: 'Percep.' }, { v: 'mixte', l: 'Mixte' }, { v: 'cophose', l: 'Cophose' }], A.ans[k], A.done ? 'noop' : 'acouans');
  let corr = '';
  if (A.done) {
    const cs = A.cs, i = FORKS[A.f].i;
    const tR = acouTruth(cs, 'R', i), tL = acouTruth(cs, 'L', i);
    corr = `<section class="card"><h3>Correction (à ${A.f} Hz)</h3>
      <p class="fb ${A.ans.R === tR ? 'ok' : 'bad'}">OD : ${ACOU_T.find(x => x[0] === tR)[1]} (CA ${tsAC(cs, 'R', i) >= 999 ? 'pas de réponse' : tsAC(cs, 'R', i) + ' dB'}, CO ${tsC(cs, 'R', i) >= 999 ? '—' : tsC(cs, 'R', i) + ' dB'})</p>
      <p class="fb ${A.ans.L === tL ? 'ok' : 'bad'}">OG : ${ACOU_T.find(x => x[0] === tL)[1]} (CA ${tsAC(cs, 'L', i) >= 999 ? 'pas de réponse' : tsAC(cs, 'L', i) + ' dB'}, CO ${tsC(cs, 'L', i) >= 999 ? '—' : tsC(cs, 'L', i) + ' dB'})</p>
      <p class="small">Patient : ${esc(cs.patho.nom)}. ${acouExplain(cs, i)}</p>
      <div class="agwrap">${audiogramSVG(cs.ears)}</div>${agLegend()}
      <p class="muted small">Le diapason ne renseigne que sur sa fréquence : une perte limitée aux aigus passe inaperçue à 512 Hz.</p>
      <div class="row gap wrap"><button class="btn primary" data-act="acounew">Patient suivant</button><button class="btn" data-act="tsopen" data-id="acou_synth">Fiche : lire une acoumétrie</button></div></section>`;
  }
  return tsHead('Acoumétrie virtuelle', 'Faites les épreuves dans l’ordre de votre choix, puis concluez pour chaque oreille.') + `
  <section class="card"><div class="row between"><div><b>${esc(A.cs.name)}</b><span class="muted small"> · ${A.cs.ageTxt}</span></div><button class="btn ghost small" data-act="acounew">Autre patient</button></div>
    <p class="quote small">${esc(A.cs.hist.motif)}</p>
    <span class="flab">Diapason</span>${chipGroup('fork', ['256', '512', '1024'].map(v => ({ v, l: v + ' Hz' })), String(A.f), 'acoufork')}
  </section>
  <section class="card"><h3>Épreuves</h3>
    <div class="row gap wrap">${btn('weber', '', 'Weber (vertex)')}${btn('schwabach', '', 'Schwabach')}</div>
    <div class="two"><div class="stack-s"><span class="ear r">OD</span>${btn('rinne', 'R', 'Rinne')}${btn('bing', 'R', 'Bing')}${btn('gelle', 'R', 'Gellé')}${btn('federici', 'R', 'Federici')}${btn('voix', 'R', 'Voix')}</div>
    <div class="stack-s"><span class="ear l">OG</span>${btn('rinne', 'L', 'Rinne')}${btn('bing', 'L', 'Bing')}${btn('gelle', 'L', 'Gellé')}${btn('federici', 'L', 'Federici')}${btn('voix', 'L', 'Voix')}</div></div>
  </section>
  <section class="card"><h3>Réponses du patient</h3>${A.log.length ? `<ul class="log">${A.log.map(x => `<li><span class="mono muted">${x.f} Hz</span> ${esc(x.line)}</li>`).join('')}</ul>` : '<p class="muted small">Aucune épreuve réalisée.</p>'}</section>
  <section class="card"><h3>Votre conclusion à ${A.f} Hz</h3><span class="ear r">OD</span>${earSel('R')}<span class="ear l">OG</span>${earSel('L')}
    ${A.done ? '' : `<button class="btn primary wide" data-act="acouval" ${A.ans.R && A.ans.L ? '' : 'disabled'}>Corriger</button>`}</section>${corr}`;
}
function acouExplain(cs, i) {
  const bits = [];
  ['R', 'L'].forEach(s => {
    const t = acouTruth(cs, s, i);
    if (t === 'transmission' || t === 'mixte') bits.push(`À ${tsSideName(s)}, l’écart aérien-osseux de ${tsABG(cs, s, i)} dB rend le Rinne négatif s’il dépasse environ 20 à 25 dB, et attire le Weber de ce côté.`);
    if (t === 'perception') bits.push(`À ${tsSideName(s)}, la cochlée est atteinte (CO ${tsC(cs, s, i)} dB) : Rinne positif, Weber vers l’autre oreille si elle est meilleure.`);
    if (t === 'cophose') bits.push(`À ${tsSideName(s)}, cophose : le Rinne peut sembler négatif (faux négatif) car l’autre oreille entend la vibration ; le Weber part vers l’oreille saine.`);
  });
  return bits.join(' ') || 'Les deux oreilles sont normales à cette fréquence : Weber indifférent, Rinne positifs.';
}
ACT.acoudo = a => acouDo(a.dataset.t, a.dataset.s || null);
ACT.acoufork = a => { TS.acou.f = +a.dataset.val; renderView(); };
ACT.acouans = a => { TS.acou.ans[a.dataset.name] = a.dataset.val; renderView(); };
ACT.acouval = () => {
  const A = TS.acou; A.done = true;
  const i = FORKS[A.f].i;
  const ok = ['R', 'L'].filter(s => A.ans[s] === acouTruth(A.cs, s, i)).length;
  tsScore('acou', ok, 2); renderView();
};
ACT.acounew = () => { acouNew(); renderView(); window.scrollTo(0, 0); };

/* ================= RAINVILLE / SAL ================= */
const RV_I = [0, 1, 2, 3, 5];
function rvNew() {
  const pool = ['otospongiose', 'omc_seq', 'osm', 'luxation', 'presby', 'tympanosclerose', 'trauma_chr', 'perforation'];
  TS.rv = { cs: tsCase(pool), ear: 'R', E: 50, m: { R: {}, L: {} }, est: { R: {}, L: {} }, done: false };
  ['R', 'L'].forEach(s => RV_I.forEach(i => TS.rv.est[s][i] = null));
}
function rvQuiet(s, i) { const cs = TS.rv.cs, a = tsAC(cs, s, i); return a >= 999 ? { v: CAB_ACMAX[i], nr: true } : { v: Math.min(a, CAB_ACMAX[i]), nr: a > CAB_ACMAX[i] }; }
function rvNoise(s, i) {
  const cs = TS.rv.cs, E = Math.min(TS.rv.E, i === 0 ? 50 : 70);
  const a = tsAC(cs, s, i), c = tsC(cs, s, i);
  if (a >= 999) return { v: CAB_ACMAX[i], nr: true, E };
  const v = r5(Math.max(a, (a - c) + Math.max(c, E)));
  return v > CAB_ACMAX[i] ? { v: CAB_ACMAX[i], nr: true, E } : { v, nr: false, E };
}
function rvView() {
  const R = TS.rv, s = R.ear, cs = R.cs;
  const rows = RV_I.map(i => {
    const m = R.m[s][i] || {};
    const q = m.q, n = m.n;
    const shift = q && n && !q.nr && !n.nr ? n.v - q.v : null;
    const est = R.est[s][i];
    let corr = '';
    if (R.done) {
      const c = tsC(cs, s, i);
      const ok = est != null && c < 999 && Math.abs(est - c) <= 10;
      corr = `<td class="${ok ? 'ok' : 'bad'}">${c >= 999 ? '—' : c}</td>`;
    }
    return `<tr><th>${fLabel(F[i])}</th>
      <td>${q ? (q.nr ? '≥' : '') + q.v : `<button class="btn small" data-act="rvq" data-i="${i}">Mesurer</button>`}</td>
      <td>${n ? (n.nr ? '≥' : '') + n.v + `<small> (bruit ${n.E})</small>` : `<button class="btn small" data-act="rvn" data-i="${i}" ${q ? '' : 'disabled'}>Mesurer</button>`}</td>
      <td>${shift == null ? '—' : '+' + shift}</td>
      <td class="stepper"><button data-act="rvest" data-i="${i}" data-d="-5" ${R.done ? 'disabled' : ''}>−</button><span class="mono">${est == null ? '?' : est}</span><button data-act="rvest" data-i="${i}" data-d="5" ${R.done ? 'disabled' : ''}>+</button></td>${corr}</tr>`;
  }).join('');
  const series = { R: { ac: F.map(() => null), acNR: F.map(() => false), bc: F.map(() => null), bcNR: F.map(() => false) }, L: { ac: F.map(() => null), acNR: F.map(() => false), bc: F.map(() => null), bcNR: F.map(() => false) } };
  ['R', 'L'].forEach(e => RV_I.forEach(i => { const q = R.m[e][i] && R.m[e][i].q; if (q) { series[e].ac[i] = q.v; series[e].acNR[i] = q.nr; } if (R.est[e][i] != null && i < NBC) series[e].bc[i] = R.est[e][i]; }));
  return tsHead('Rainville / SAL', 'Mesurez la CA sans puis avec bruit osseux, calculez le déplacement et déduisez la conduction osseuse.') + `
  <section class="card"><div class="row between"><div><b>${esc(cs.name)}</b><span class="muted small"> · ${cs.ageTxt}</span></div><button class="btn ghost small" data-act="rvnewc">Autre patient</button></div>
  <p class="small">Réglage du montage : avec ce bruit, un normo-entendant voit son seuil monter de <b>${R.E} dB</b> (déplacement de référence ; limité à 50 dB à 250 Hz par le vibrateur).</p>
  <span class="flab">Bruit au vibrateur (dB efficaces)</span>${chipGroup('rvE', ['30', '40', '50', '60', '70'].map(v => ({ v, l: v })), String(R.E), 'rvE')}
  <div class="eartabs" style="margin-top:8px">${['R', 'L'].map(e => `<button class="eartab ${e === 'R' ? 'r' : 'l'}${e === s ? ' on' : ''}" data-act="rvear" data-val="${e}">Oreille ${tsSideName(e)}</button>`).join('')}</div>
  <div class="tscroll"><table class="tbl rvt"><thead><tr><th>Hz</th><th>Sans bruit</th><th>Avec bruit</th><th>Δ</th><th>CO est.</th>${R.done ? '<th>Vraie</th>' : ''}</tr></thead><tbody>${rows}</tbody></table></div>
  <p class="muted small">CO estimée = déplacement de référence − déplacement du patient (si le seuil ne bouge pas, la perte cochléaire dépasse le bruit : augmentez-le).</p>
  </section>
  <section class="card"><h3>Audiogramme reconstitué</h3><div class="agwrap">${audiogramSVG(series)}</div>${agLegend()}</section>
  ${R.done ? `<section class="card"><p class="small">Patient : ${esc(cs.patho.nom)}. ${esc(cs.patho.fiche.audio)}</p><div class="row gap wrap"><button class="btn primary" data-act="rvnewc">Patient suivant</button><button class="btn" data-act="tsopen" data-id="rainville">Fiche Rainville</button></div></section>`
      : `<button class="btn primary wide" data-act="rvval">Corriger les deux oreilles</button>`}`;
}
ACT.rvear = a => { TS.rv.ear = a.dataset.val; renderView(); };
ACT.rvE = a => { TS.rv.E = +a.dataset.val; renderView(); };
ACT.rvq = a => { const i = +a.dataset.i; TS.rv.m[TS.rv.ear][i] = Object.assign(TS.rv.m[TS.rv.ear][i] || {}, { q: rvQuiet(TS.rv.ear, i) }); renderView(); };
ACT.rvn = a => { const i = +a.dataset.i; TS.rv.m[TS.rv.ear][i].n = rvNoise(TS.rv.ear, i); renderView(); };
ACT.rvest = a => { const R = TS.rv, i = +a.dataset.i, cur = R.est[R.ear][i]; R.est[R.ear][i] = clamp((cur == null ? 20 : cur) + (+a.dataset.d), -10, 90); renderView(); };
ACT.rvval = () => {
  const R = TS.rv; R.done = true; let ok = 0, n = 0;
  ['R', 'L'].forEach(s => RV_I.forEach(i => { const c = tsC(R.cs, s, i); if (c >= 999) return; n++; if (R.est[s][i] != null && Math.abs(R.est[s][i] - c) <= 10) ok++; }));
  tsScore('rainville', ok, n); renderView();
};
ACT.rvnewc = () => { rvNew(); renderView(); window.scrollTo(0, 0); };

/* ================= BATTERIE TOPODIAGNOSTIQUE ================= */
function topoNew() {
  const rng = makeRng(newSeed());
  const p = rng.wpick(['presby', 'meniere', 'trauma_chr', 'genet_adulte', 'neurinome', 'otospongiose', 'tympanosclerose'], k => k === 'neurinome' ? 3 : 1);
  const cs = generateCase({ patho: p, seed: newSeed() });
  const s = cs.biap.R >= cs.biap.L ? 'R' : 'L';
  const o = s === 'R' ? 'L' : 'R';
  const ok = i => { const a = tsAC(cs, s, i); return a >= 30 && a <= 85; };
  const fow = [2, 3, 5, 1].filter(i => ok(i) && tsAC(cs, o, i) <= 25 && tsAC(cs, s, i) - tsAC(cs, o, i) >= 20);
  const cand = [2, 3, 5].filter(ok);
  const i = fow.length ? fow[0] : cand.length ? cand[0] : 2;
  const truth = cs.patho.site === 'retro' ? 'retro' : (cs.patho.site === 'moyenne' || cs.patho.site === 'mixte') ? 'trans' : 'coch';
  TS.topo = { cs, s, i, truth, rng, done: {}, view: 'sisi', fow: { pts: [], ref: 0, lvl: null }, ans: null, fin: false };
}
const TOPO_TESTS = [['sisi', 'SISI'], ['fowler', 'Fowler'], ['decay', 'Tone decay'], ['reflexe', 'Réflexes'], ['bekesy', 'Békésy'], ['vocale', 'Vocale'], ['pea', 'PEA']];
function topoView() {
  const T = TS.topo, cs = T.cs, s = T.s, i = T.i;
  const tabs = TOPO_TESTS.map(([k, l]) => `<button class="tab${T.view === k ? ' on' : ''}" data-act="topotab" data-k="${k}">${l}${T.done[k] ? ' ✓' : ''}</button>`).join('');
  let body = '';
  const f = F[i], a = tsAC(cs, s, i), o = s === 'R' ? 'L' : 'R', ao = tsAC(cs, o, i);
  switch (T.view) {
    case 'sisi': body = topoSisi(); break;
    case 'fowler': body = topoFowler(); break;
    case 'decay': body = topoDecay(); break;
    case 'reflexe': body = topoReflex(); break;
    case 'bekesy': body = topoBekesy(); break;
    case 'vocale': body = topoVocale(); break;
    case 'pea': body = topoPea(); break;
  }
  const fin = T.fin ? `<section class="card"><h3>Correction</h3><p class="fb ${T.ans === T.truth ? 'ok' : 'bad'}">${{ coch: 'Atteinte cochléaire', retro: 'Atteinte rétrocochléaire', trans: 'Atteinte de transmission' }[T.truth]} : ${esc(cs.patho.nom)}.</p><p class="small">${esc(cs.patho.fiche.audio)}</p><p class="small">${esc(cs.patho.fiche.imp)}</p><div class="row gap wrap"><button class="btn primary" data-act="toponew">Patient suivant</button><button class="btn" data-act="tsopen" data-id="topo">Fiche synthèse</button></div></section>` : '';
  return tsHead('Batterie topodiagnostique', 'Réalisez les tests utiles sur l’oreille atteinte, puis tranchez.') + `
  <section class="card"><div class="row between"><div><b>${esc(cs.name)}</b><span class="muted small"> · ${cs.ageTxt}</span></div><button class="btn ghost small" data-act="toponew">Autre patient</button></div>
    <p class="quote small">${esc(cs.hist.motif)}</p>
    <div class="agwrap">${audiogramSVG(cs.ears)}</div>${agLegend()}
    <p class="small">Oreille testée : <b>${sideName(s)}</b>, ${fLabel(f)} Hz (seuil ${a >= 999 ? '—' : a} dB HL ; autre oreille ${ao >= 999 ? '—' : ao} dB HL).</p></section>
  <div class="tabs">${tabs}</div>${body}
  <section class="card"><h3>Votre conclusion</h3>${chipGroup('topoans', [{ v: 'coch', l: 'Cochléaire' }, { v: 'retro', l: 'Rétrocochléaire' }, { v: 'trans', l: 'Transmission' }], T.ans, T.fin ? 'noop' : 'topoans')}
  ${T.fin ? '' : `<button class="btn primary wide" data-act="topoval" ${T.ans ? '' : 'disabled'}>Corriger</button>`}</section>${fin}`;
}
ACT.topotab = a => { TS.topo.view = a.dataset.k; renderView(); };
ACT.topoans = a => { TS.topo.ans = a.dataset.val; renderView(); };
ACT.topoval = () => { const T = TS.topo; T.fin = true; tsScore('topo', T.ans === T.truth ? 1 : 0, 1); renderView(); };
ACT.toponew = () => { topoNew(); renderView(); window.scrollTo(0, 0); };
function topoSisiScore() {
  const T = TS.topo; if (T.sisi != null) return T.sisi;
  const c = tsC(T.cs, T.s, T.i), r = T.rng;
  T.sisi = T.truth === 'retro' ? r.int(0, 5) * 5 : T.truth === 'trans' ? r.int(0, 3) * 5 : c >= 35 ? r.int(14, 20) * 5 : r.int(6, 14) * 5;
  return T.sisi;
}
function topoSisi() {
  const T = TS.topo, a = tsAC(T.cs, T.s, T.i);
  const run = T.sisiRun;
  let dots = '';
  if (run) { const n = Math.round(topoSisiScore() / 5); const seq = run.seq; dots = `<div class="sisidots">${seq.map((h, k) => `<i class="${k < run.k ? (h ? 'hit' : 'miss') : ''}"></i>`).join('')}</div><p class="mono">${seq.slice(0, run.k).filter(Boolean).length} / ${run.k} incréments perçus${run.k >= 20 ? ` → <b>${topoSisiScore()} %</b>` : ''}</p>`; }
  return `<section class="card"><h3>SISI à ${fLabel(F[T.i])} Hz</h3><p class="small">Son continu à 20 dB SL (${Math.min(a + 20, 120)} dB HL), 20 incréments de 1 dB.</p>${dots}
  <button class="btn primary" data-act="sisirun" ${run && run.k < 20 ? 'disabled' : ''}>${run ? 'Refaire' : 'Lancer le SISI'}</button><p class="muted small">≥ 70 % : cochléaire. ≤ 30 % : normal, transmission ou rétrocochléaire.</p></section>`;
}
ACT.sisirun = () => {
  const T = TS.topo, sc = topoSisiScore(), n = Math.round(sc / 5);
  const seq = T.rng.shuffle(Array.from({ length: 20 }, (_, k) => k < n));
  T.sisiRun = { seq, k: 0 };
  const step = () => { if (!TS.topo || TS.topo !== T || T.sisiRun.seq !== seq) return; T.sisiRun.k++; if (T.view === 'sisi' && TAB === 'tests') renderView(); if (T.sisiRun.k < 20) T.sisiTimer = setTimeout(step, 180); else T.done.sisi = 1; };
  renderView(); T.sisiTimer = setTimeout(step, 180);
};
function fowEq(ref) {
  const T = TS.topo, cs = T.cs, s = T.s, o = s === 'R' ? 'L' : 'R', i = T.i;
  const Tb = tsAC(cs, s, i), Tg = tsAC(cs, o, i), id = cs.patho.id;
  const sl = ref - Tg;
  if (T.truth === 'trans') return Tb + sl;
  if (T.truth === 'retro') return Tb + sl * 1.25;
  const U = id === 'meniere' ? 88 : 100;
  return Tb + sl * (U - Tb) / Math.max(10, U - Tg);
}
function topoFowler() {
  const T = TS.topo, cs = T.cs, s = T.s, o = s === 'R' ? 'L' : 'R', i = T.i;
  const Tb = tsAC(cs, s, i), Tg = tsAC(cs, o, i);
  if (Tg > 25 || Tb - Tg < 20 || Tb >= 999) return `<section class="card"><h3>Fowler</h3><p class="fb warn">Non réalisable ici : il faut une oreille de référence normale (≤ 25 dB) et un écart d’au moins 20 dB à cette fréquence. Ici : ${Tg >= 999 ? '—' : Tg} dB contre ${Tb >= 999 ? '—' : Tb} dB.</p><p class="muted small">Alternative : balance monaurale de Reger, SISI, test de Metz.</p></section>`;
  const F0 = T.fow; const refs = [20, 40, 60].map(d => Math.min(Tg + d, 100));
  const ref = refs[F0.ref];
  if (F0.lvl == null) F0.lvl = Math.min(Tb + 10, 120);
  const pts = F0.pts;
  const W = 220, H = 170, y = v => 10 + (v + 10) / 130 * (H - 20);
  let lad = `<svg class="ag" viewBox="0 0 ${W + 60} ${H + 20}"><text x="40" y="10" class="ag-t" text-anchor="middle">${sideShort(o)}</text><text x="${W}" y="10" class="ag-t" text-anchor="middle">${sideShort(s)}</text>`;
  for (let d = 0; d <= 120; d += 20) lad += `<line x1="30" x2="${W + 10}" y1="${y(d)}" y2="${y(d)}" class="ag-g"/><text x="24" y="${y(d) + 3}" class="ag-t" text-anchor="end">${d}</text>`;
  pts.forEach(p => { lad += `<line x1="40" y1="${y(p.ref)}" x2="${W}" y2="${y(p.lvl)}" stroke="var(--brass)" stroke-width="2"/><circle cx="40" cy="${y(p.ref)}" r="4" fill="var(--left)"/><circle cx="${W}" cy="${y(p.lvl)}" r="4" fill="var(--right)"/>`; });
  lad += '</svg>';
  return `<section class="card"><h3>Fowler (balance binaurale) à ${fLabel(F[i])} Hz</h3>
  <p class="small">Référence dans l’oreille ${sideName(o)} : ${chipGroup('fref', refs.map((r, k) => ({ v: String(k), l: r + ' dB' })), String(F0.ref), 'fowref')}</p>
  <div class="levelbox"><button class="btn" data-act="fowlvl" data-d="-5">−5</button><button class="btn" data-act="fowlvl" data-d="-1">−1</button><div class="lvl"><span class="mono">${F0.lvl}</span><small>dB HL ${sideShort(s)}</small></div><button class="btn" data-act="fowlvl" data-d="1">+1</button><button class="btn" data-act="fowlvl" data-d="5">+5</button></div>
  <div class="row gap wrap"><button class="btn" data-act="fowask">Présenter en alternance</button><button class="btn primary" data-act="fowsave">Valider ce point</button></div>
  ${T.fowMsg ? `<p class="quote small">${esc(T.fowMsg)}</p>` : ''}
  <div class="agwrap">${lad}</div><p class="muted small">Lignes qui se rejoignent : recrutement. Parallèles : transmission. Divergentes : décrutement.</p></section>`;
}
ACT.fowref = a => { TS.topo.fow.ref = +a.dataset.val; TS.topo.fowMsg = ''; renderView(); };
ACT.fowlvl = a => { const F0 = TS.topo.fow; F0.lvl = clamp(F0.lvl + (+a.dataset.d), -10, 120); renderView(); };
ACT.fowask = () => {
  const T = TS.topo, o = T.s === 'R' ? 'L' : 'R';
  const refs = [20, 40, 60].map(d => Math.min(tsAC(T.cs, o, T.i) + d, 100));
  const eq = fowEq(refs[T.fow.ref]), d = T.fow.lvl - eq;
  T.fowMsg = Math.abs(d) <= 3 ? '« Les deux sons sont pareils. »' : d > 0 ? `« Plus fort à ${sideName(T.s)}. »` : `« Plus fort à ${sideName(o)}. »`;
  renderView();
};
ACT.fowsave = () => {
  const T = TS.topo, o = T.s === 'R' ? 'L' : 'R';
  const refs = [20, 40, 60].map(d => Math.min(tsAC(T.cs, o, T.i) + d, 100));
  T.fow.pts = T.fow.pts.filter(p => p.ref !== refs[T.fow.ref]).concat([{ ref: refs[T.fow.ref], lvl: T.fow.lvl }]);
  if (T.fow.pts.length >= 2) T.done.fowler = 1;
  if (T.fow.ref < 2) { T.fow.ref++; T.fow.lvl = null; }
  T.fowMsg = ''; renderView();
};
function topoDecay() {
  const T = TS.topo, a = tsAC(T.cs, T.s, T.i);
  if (T.decay == null) T.decay = T.truth === 'retro' ? T.rng.int(6, 9) * 5 : T.truth === 'trans' ? T.rng.int(0, 1) * 5 : T.rng.int(1, 4) * 5;
  const steps = [];
  let lv = a, t = 0;
  const n = T.decay / 5;
  for (let k = 0; k < n; k++) { const dur = Math.round(T.rng.range(T.truth === 'retro' ? 6 : 15, T.truth === 'retro' ? 18 : 40)); t += dur; steps.push(`${lv} dB : entendu ${dur} s, puis perdu → +5`); lv += 5; }
  steps.push(`${lv} dB : entendu 60 s`);
  return `<section class="card"><h3>Tone decay (Carhart) à ${fLabel(F[T.i])} Hz</h3>${T.done.decay ? `<ul class="log">${steps.map(x => `<li class="mono">${x}</li>`).join('')}</ul><p>Decay total : <b>${T.decay} dB</b>${T.decay >= 30 ? ' (plafond de 30 dB atteint)' : ''}</p>` : `<button class="btn primary" data-act="decayrun">Lancer (son continu au seuil, ${a} dB HL)</button>`}<p class="muted small">0–5 dB normal ou transmission · 10–25 dB cochléaire · ≥ 30 dB rétrocochléaire.</p></section>`;
}
ACT.decayrun = () => { TS.topo.done.decay = 1; renderView(); };
function topoReflex() {
  const T = TS.topo, cs = T.cs, s = T.s, txt = cs.reflex[s] || '';
  const m = txt.match(/(\d+) dB/);
  const thr = tsAC(cs, s, 2);
  T.done.reflexe = 1;
  return `<section class="card"><h3>Réflexe stapédien (stimulation ${sideName(s)}, 1 kHz)</h3><p class="mono">${esc(txt)}</p><p class="small">Seuil tonal à 1 kHz : ${thr >= 999 ? '—' : thr} dB HL${m && thr < 999 ? ` · écart réflexe − seuil : <b>${+m[1] - thr} dB</b>` : ''}</p>
  <p class="small">Tympanogramme ${sideName(s)} : type ${cs.tymp[s] ? cs.tymp[s].type : 'A'}.</p><p class="muted small">Metz &lt; 60 dB : recrutement. Absent ou fatigable : transmission côté sonde, perte trop forte, ou nerf VIII.</p></section>`;
}
function topoBekesy() {
  const T = TS.topo; T.done.bekesy = 1;
  const type = T.truth === 'retro' ? (T.rng.chance(0.5) ? 'III' : 'IV') : T.truth === 'trans' ? 'I' : 'II';
  if (!T.bek) T.bek = type;
  const W = 300, H = 140, pul = [], con = [];
  for (let k = 0; k < 40; k++) {
    const x = 20 + k / 39 * (W - 30), base = 60 + k * 0.6;
    pul.push(`${x},${base + (k % 2 ? 6 : -6)}`);
    let c = base;
    if (T.bek === 'II') c = base + (k > 14 ? 14 : 0); if (T.bek === 'IV') c = base + 26; if (T.bek === 'III') c = Math.min(H - 6, base + k * 2.6);
    con.push(`${x},${c + (k % 2 ? (T.bek === 'II' ? 2 : 6) : (T.bek === 'II' ? -2 : -6))}`);
  }
  return `<section class="card"><h3>Békésy (balayage de fréquence)</h3><svg class="ag" viewBox="0 0 ${W} ${H}"><line x1="20" x2="${W - 10}" y1="${H - 4}" y2="${H - 4}" class="ag-g"/><polyline points="${pul.join(' ')}" fill="none" stroke="var(--ink)" stroke-width="1.3"/><polyline points="${con.join(' ')}" fill="none" stroke="var(--right)" stroke-width="1.3"/><text x="24" y="14" class="ag-t">noir : pulsé · rouge : continu (vers le bas = moins bien)</text></svg><p class="muted small">I superposés · II continu sous le pulsé dans les aigus, petits zigzags · III effondrement · IV écart > 20 dB partout · V continu meilleur.</p></section>`;
}
function topoVocale() {
  const T = TS.topo, cs = T.cs, s = T.s; T.done.vocale = 1;
  const pts = []; for (let L = 20; L <= 110; L += 10) pts.push([L, Math.round(cabPIntell(cs, s, L, 'lafon') * 100)]);
  const mx = Math.max(...pts.map(p => p[1])), lvMax = pts.find(p => p[1] === mx)[0];
  const after = pts.filter(p => p[0] > lvMax), mn = after.length ? Math.min(...after.map(p => p[1])) : mx;
  const ri = mx ? (mx - mn) / mx : 0;
  const W = 300, H = 150, x = L => 30 + (L - 20) / 90 * (W - 40), y = p => H - 20 - p / 100 * (H - 30);
  const svg = `<svg class="ag" viewBox="0 0 ${W} ${H}">${[0, 50, 100].map(p => `<line x1="30" x2="${W - 10}" y1="${y(p)}" y2="${y(p)}" class="ag-g"/><text x="26" y="${y(p) + 3}" class="ag-t" text-anchor="end">${p}</text>`).join('')}${[20, 50, 80, 110].map(L => `<text x="${x(L)}" y="${H - 6}" class="ag-t" text-anchor="middle">${L}</text>`).join('')}<polyline points="${pts.map(p => x(p[0]) + ',' + y(p[1])).join(' ')}" fill="none" stroke="var(--right)" stroke-width="2"/>${pts.map(p => `<circle cx="${x(p[0])}" cy="${y(p[1])}" r="3" fill="var(--right)"/>`).join('')}</svg>`;
  return `<section class="card"><h3>Vocale (Lafon, ${sideName(s)})</h3><div class="agwrap">${svg}</div><p class="small">Maximum ${mx} % à ${lvMax} dB · minimum au-delà ${mn} % · indice de roll-over <b>${ri.toFixed(2)}</b></p><p class="muted small">Roll-over marqué (≈ ≥ 0,45 avec des listes PB) et plafond effondré : arguments rétrocochléaires.</p></section>`;
}
function topoPea() {
  const T = TS.topo, cs = T.cs, s = T.s, o = s === 'R' ? 'L' : 'R'; T.done.pea = 1;
  if (!T.pea) {
    const r = T.rng, mk = (ear) => {
      const sh = T.truth === 'trans' && cs.sides.includes(ear) ? tsABG(cs, ear, 3) * 0.02 : 0;
      let I = 1.6 + sh + r.range(-0.05, 0.05), III = 3.75 + sh + r.range(-0.08, 0.08), V = 5.6 + sh + r.range(-0.1, 0.1);
      if (T.truth === 'retro' && ear === s) { III += r.range(0.3, 0.6); V = I + r.range(4.6, 5.2); }
      if (T.truth === 'coch' && tsAC(cs, ear, 5) > 60) V += 0.15;
      return { I, III, V };
    };
    T.pea = { [s]: mk(s), [o]: mk(o) };
  }
  const P = T.pea;
  const wave = (L, col, yy) => { let d = ''; for (let k = 0; k <= 100; k++) { const t = k / 10; const v = 14 * Math.exp(-Math.pow((t - L.I) / .25, 2)) + 11 * Math.exp(-Math.pow((t - L.III) / .25, 2)) + 20 * Math.exp(-Math.pow((t - L.V) / .3, 2)) - 12 * Math.exp(-Math.pow((t - L.V - .7) / .3, 2)); d += (k ? 'L' : 'M') + (30 + t * 26) + ' ' + (yy - v); } return `<path d="${d}" fill="none" stroke="${col}" stroke-width="1.6"/>`; };
  const iv = e => (P[e].V - P[e].I).toFixed(2);
  const it5 = Math.abs(P.R.V - P.L.V).toFixed(2);
  return `<section class="card"><h3>PEA (clics 80 dB nHL)</h3><svg class="ag" viewBox="0 0 300 150">${wave(P.R, 'var(--right)', 60)}${wave(P.L, 'var(--left)', 130)}<text x="30" y="14" class="ag-t">OD</text><text x="30" y="88" class="ag-t">OG</text><text x="290" y="146" class="ag-t" text-anchor="end">10 ms</text></svg>
  <div class="tscroll"><table class="tbl"><thead><tr><th></th><th>I</th><th>III</th><th>V</th><th>I–V</th></tr></thead><tbody>${['R', 'L'].map(e => `<tr class="${e === 'R' ? 'r' : 'l'}"><th>${sideShort(e)}</th><td>${P[e].I.toFixed(2)}</td><td>${P[e].III.toFixed(2)}</td><td>${P[e].V.toFixed(2)}</td><td>${iv(e)}</td></tr>`).join('')}</tbody></table></div>
  <p class="small">Différence interaurale de l’onde V : <b>${it5} ms</b></p><p class="muted small">I–V normal ≈ 4,0 ms (anormal au-delà d’environ 4,4) · différence interaurale de V anormale au-delà de 0,2 à 0,3 ms.</p></section>`;
}

/* ================= STENGER ================= */
function stNew() {
  const r = makeRng(newSeed());
  const bad = r.chance(0.5) ? 'R' : 'L', good = bad === 'R' ? 'L' : 'R';
  const sim = r.chance(0.55);
  const tg = r5(r.range(0, 15)), tb = sim ? r5(r.range(0, 20)) : r5(r.range(70, 95));
  const adm = sim ? r5(r.range(60, 85)) : tb;
  TS.st = { bad, good, sim, tru: { [good]: tg, [bad]: tb }, adm: { [good]: tg, [bad]: adm }, lv: { [good]: tg + 10, [bad]: adm - 10 }, log: [], ans: null, done: false, name: (r.chance(0.5) ? r.pick(FIRST_M) : r.pick(FIRST_F)) + ' ' + r.pick(LAST), ctx: r.pick(['Expertise après un accident du travail', 'Demande de reconnaissance de surdité après un choc', 'Bilan après un pétard à l’oreille', 'Contrôle pour un dossier d’assurance']) };
}
function stResp(which) {
  const S = TS.st, on = { R: which === 'R' || which === 'both', L: which === 'L' || which === 'both' };
  const sl = e => on[e] ? S.lv[e] - S.tru[e] : -99;
  const slR = sl('R'), slL = sl('L');
  if (slR < 0 && slL < 0) return { r: false, why: 'rien perçu' };
  const dom = slR >= slL ? 'R' : 'L';
  if (!S.sim) return { r: true, dom };
  if (dom === S.bad && S.lv[S.bad] < S.adm[S.bad]) return { r: false, dom, why: 'perçu du côté « sourd » sous le seuil annoncé' };
  return { r: true, dom };
}
function stView() {
  const S = TS.st;
  const ear = e => `<div class="stepear"><span class="ear ${e === 'R' ? 'r' : 'l'}">${sideShort(e)}</span><div class="levelbox mini"><button class="btn small" data-act="stlv" data-e="${e}" data-d="-5">−5</button><div class="lvl"><span class="mono">${S.lv[e]}</span><small>dB HL</small></div><button class="btn small" data-act="stlv" data-e="${e}" data-d="5">+5</button></div><p class="muted small">seuil annoncé ${S.adm[e]} dB</p></div>`;
  const adm = { R: { ac: F.map(() => null), acNR: F.map(() => false) }, L: { ac: F.map(() => null), acNR: F.map(() => false) } };
  const r = makeRng(S.tru.R * 7 + S.adm.L);
  ['R', 'L'].forEach(e => [0, 1, 2, 3, 5, 7].forEach(i => adm[e].ac[i] = clamp(r5(S.adm[e] + r.range(-5, 5)), -10, 120)));
  let corr = '';
  if (S.done) corr = `<section class="card"><p class="fb ${S.ans === (S.sim ? 'sim' : 'org') ? 'ok' : 'bad'}">${S.sim ? `Simulation : l’oreille ${sideName(S.bad)} entend en réalité vers ${S.tru[S.bad]} dB HL.` : `Surdité réelle : seuil vrai ${S.tru[S.bad]} dB HL à ${sideName(S.bad)}.`}</p><p class="small">${S.sim ? 'Avec le son 10 dB au-dessus du seuil de la bonne oreille et 10 dB sous le seuil annoncé de la « mauvaise », le patient perçoit le son du côté prétendu sourd, plus fort pour lui, et ne répond pas : Stenger positif. Notez aussi l’absence de courbe fantôme sur l’audiogramme annoncé.' : 'Le son de la mauvaise oreille reste sous son seuil vrai : le patient perçoit celui de la bonne oreille et répond. Stenger négatif.'}</p><div class="row gap wrap"><button class="btn primary" data-act="stnew">Patient suivant</button><button class="btn" data-act="tsopen" data-id="stenger">Fiche Stenger</button></div></section>`;
  return tsHead('Surdité simulée ?', 'Le test de Stenger à 1000 Hz. Réglez les deux niveaux et présentez.') + `
  <section class="card"><b>${esc(S.name)}</b><p class="quote small">${esc(S.ctx)} : « Je n’entends plus rien de l’oreille ${sideName(S.bad)}. »</p>
  <h4>Audiogramme annoncé (sans masquage)</h4><div class="agwrap">${audiogramSVG(adm, { noBC: true })}</div></section>
  <section class="card"><div class="two">${ear('R')}${ear('L')}</div>
  <div class="row gap wrap"><button class="btn" data-act="stpres" data-w="${S.good}">Bonne oreille seule</button><button class="btn" data-act="stpres" data-w="${S.bad}">Mauvaise oreille seule</button><button class="btn primary" data-act="stpres" data-w="both">Les deux ensemble</button></div>
  <button class="btn ghost small" data-act="stpreset">Régler le Stenger classique (bonne +10 / mauvaise −10)</button>
  ${S.log.length ? `<ul class="log">${S.log.slice(-6).reverse().map(x => `<li class="mono">${x}</li>`).join('')}</ul>` : ''}</section>
  <section class="card"><h3>Conclusion</h3>${chipGroup('stans', [{ v: 'org', l: 'Surdité réelle' }, { v: 'sim', l: 'Simulation' }], S.ans, S.done ? 'noop' : 'stans')}${S.done ? '' : `<button class="btn primary wide" data-act="stval" ${S.ans ? '' : 'disabled'}>Corriger</button>`}</section>${corr}`;
}
ACT.stlv = a => { const S = TS.st; S.lv[a.dataset.e] = clamp(S.lv[a.dataset.e] + (+a.dataset.d), -10, 110); renderView(); };
ACT.stpreset = () => { const S = TS.st; S.lv[S.good] = S.tru[S.good] + 10; S.lv[S.bad] = S.adm[S.bad] - 10; renderView(); };
ACT.stpres = a => { const S = TS.st, w = a.dataset.w, r = stResp(w); const lab = w === 'both' ? `OD ${S.lv.R} + OG ${S.lv.L}` : `${sideShort(w)} ${S.lv[w]}`; S.log.push(`${lab} dB → ${r.r ? 'répond' : 'ne répond pas'}`); renderView(); };
ACT.stans = a => { TS.st.ans = a.dataset.val; renderView(); };
ACT.stval = () => { const S = TS.st; S.done = true; tsScore('stenger', S.ans === (S.sim ? 'sim' : 'org') ? 1 : 0, 1); renderView(); };
ACT.stnew = () => { stNew(); renderView(); window.scrollTo(0, 0); };

/* ================= VOCALE DANS LE BRUIT (adaptatif) ================= */
const MX = [
  ['Paul', 'Léa', 'Marc', 'Julie', 'Hugo', 'Anne', 'Louis', 'Emma', 'Pierre', 'Sophie'],
  ['achète', 'voit', 'prend', 'vend', 'donne', 'range', 'porte', 'garde', 'trouve', 'cherche'],
  ['deux', 'trois', 'cinq', 'six', 'huit', 'neuf', 'dix', 'douze', 'quinze', 'vingt'],
  ['vélos', 'livres', 'bateaux', 'crayons', 'ballons', 'gâteaux', 'chapeaux', 'verres', 'sacs', 'pommes'],
  ['rouges', 'jaunes', 'roses', 'beiges', 'mauves', 'pourpres', 'kaki', 'orange', 'marron', 'turquoise']
];
function bnNew() {
  const cs = tsCase(['presby', 'trauma_chr', 'presby', 'genet_adulte', 'neurinome', 'otospongiose', 'normale_bruit', 'meniere']);
  const best = Math.min(cs.biap.R, cs.biap.L);
  const sn = Math.min(...['R', 'L'].map(s => avg([1, 2, 3, 5].map(i => tsC(cs, s, i) >= 999 ? 120 : tsC(cs, s, i)))));
  let srt = -6.2 + Math.max(0, sn - 20) * 0.13 + (cs.patho.site === 'retro' ? 3 : 0) + (best > 55 ? (best - 55) * 0.5 : 0) + makeRng(cs.seed).gauss(0, 0.8);
  TS.bn = { cs, srt: Math.round(srt * 10) / 10, snr: 0, step: 2, rev: 0, last: null, n: 0, track: [], cur: null, auto: Store.get('bnAuto', false), ans: null, done: false, rng: makeRng(cs.seed + 3) };
  bnNext();
}
function bnNext() {
  const B = TS.bn, r = B.rng;
  if (B.n >= 20) { B.cur = null; return; }
  const words = MX.map(c => r.pick(c));
  const p = 1 / (1 + Math.exp(-(B.snr - B.srt) / 1.67));
  const got = words.map(() => r.f() < p);
  const heard = words.map((w, k) => got[k] ? w : (r.f() < 0.4 ? '…' : r.pick(MX[k].filter(x => x !== w))));
  B.cur = { words, got, heard, mark: B.auto ? got.slice() : words.map(() => false), snr: B.snr };
}
function bnSubmit() {
  const B = TS.bn, c = B.cur, k = c.mark.filter(Boolean).length;
  B.track.push({ snr: c.snr, k, ok: c.mark.every((m, i) => m === c.got[i]) });
  B.n++;
  const dir = k >= 3 ? -1 : 1;
  if (B.last != null && dir !== B.last) { B.rev++; if (B.rev === 4) B.step = 1; }
  B.last = dir;
  B.snr = clamp(B.snr + dir * B.step, -20, 20);
  bnNext();
}
function bnView() {
  const B = TS.bn, c = B.cur;
  const W = 300, H = 140, x = n => 26 + n / 20 * (W - 36), y = v => 10 + (12 - v) / 28 * (H - 30);
  let svg = `<svg class="ag" viewBox="0 0 ${W} ${H}">${[10, 0, -10].map(v => `<line x1="26" x2="${W - 10}" y1="${y(v)}" y2="${y(v)}" class="ag-g"/><text x="22" y="${y(v) + 3}" class="ag-t" text-anchor="end">${v}</text>`).join('')}<line x1="26" x2="${W - 10}" y1="${y(-6)}" y2="${y(-6)}" stroke="var(--ok)" stroke-dasharray="4 3"/><text x="${W - 12}" y="${y(-6) - 3}" class="ag-t" text-anchor="end" fill="var(--ok)">norme ≈ −6</text>`;
  if (B.track.length) svg += `<polyline points="${B.track.map((t, n) => x(n) + ',' + y(t.snr)).join(' ')}" fill="none" stroke="var(--brass)" stroke-width="2"/>` + B.track.map((t, n) => `<circle cx="${x(n)}" cy="${y(t.snr)}" r="3" fill="${t.k >= 3 ? 'var(--ok)' : 'var(--bad)'}"/>`).join('');
  svg += '</svg>';
  const srtM = B.track.length >= 12 ? Math.round(avg(B.track.slice(-10).map(t => t.snr)) * 10) / 10 : null;
  let live = '';
  if (c) live = `<section class="card"><p class="eyebrow mono">Phrase ${B.n + 1} / 20 · RSB ${c.snr > 0 ? '+' : ''}${c.snr} dB</p>
    <p class="small muted">Phrase émise : ${c.words.join(' ')}</p>
    <p class="quote">Le patient répète : « ${c.heard.join(' ')} »</p>
    <p class="small">Touchez les mots correctement répétés :</p>
    <div class="chips">${c.words.map((w, k) => `<button class="chip${c.mark[k] ? ' on' : ''}" data-act="bnmark" data-k="${k}">${w}</button>`).join('')}</div>
    <div class="row gap wrap" style="margin-top:8px"><button class="btn primary" data-act="bnok">Valider (${c.mark.filter(Boolean).length}/5)</button><label class="tog"><input type="checkbox" id="bnAuto" data-chg="bnauto" ${B.auto ? 'checked' : ''}> Cotation automatique</label><button class="btn ghost small" data-act="bnfast">Terminer automatiquement</button></div></section>`;
  let end = '';
  if (!c) {
    const cat = srtM <= -4 ? 'normal' : srtM <= 0 ? 'leger' : 'important';
    end = `<section class="card"><h3>Résultat</h3><p>SRT (moyenne des 10 dernières phrases) : <b>${srtM > 0 ? '+' : ''}${srtM} dB RSB</b></p>
    <span class="flab">Votre interprétation</span>${chipGroup('bnans', [{ v: 'normal', l: 'Proche de la norme' }, { v: 'leger', l: 'Gêne modérée' }, { v: 'important', l: 'Gêne importante' }], B.ans, B.done ? 'noop' : 'bnans')}
    ${B.done ? `<p class="fb ${B.ans === cat ? 'ok' : 'bad'}">${cat === 'normal' ? 'Proche de la norme (≈ −6 dB).' : cat === 'leger' ? `Perte de rapport signal/bruit d’environ ${Math.round(srtM + 6)} dB : gêne réelle dans le bruit.` : `Perte de rapport signal/bruit d’environ ${Math.round(srtM + 6)} dB : gêne importante, la voix doit dominer le bruit.`}</p><p class="small">Patient : ${esc(B.cs.patho.nom)} · moyenne tonale meilleure oreille ${Math.min(B.cs.biap.R, B.cs.biap.L).toFixed(0)} dB. Cotation exacte ${B.track.filter(t => t.ok).length}/20.</p><div class="row gap wrap"><button class="btn primary" data-act="bnnew">Patient suivant</button><button class="btn" data-act="tsopen" data-id="voc_bruit">Fiche vocale dans le bruit</button></div>` : `<button class="btn primary wide" data-act="bnval" ${B.ans ? '' : 'disabled'}>Corriger</button>`}</section>`;
  }
  return tsHead('Vocale dans le bruit', 'Parole à 65 dB, bruit adaptatif. 3 mots justes ou plus : le bruit monte. Sinon : il baisse.') + `
  <section class="card"><b>${esc(B.cs.name)}</b><span class="muted small"> · ${B.cs.ageTxt}</span><p class="quote small">${esc(B.cs.hist.motif)}</p><div class="agwrap">${svg}</div></section>${live}${end}`;
}
ACT.bnmark = a => { const c = TS.bn.cur; c.mark[+a.dataset.k] = !c.mark[+a.dataset.k]; renderView(); };
ACT.bnok = () => { bnSubmit(); renderView(); };
ACT.bnauto = a => { TS.bn.auto = a.checked; Store.set('bnAuto', a.checked); if (a.checked && TS.bn.cur) TS.bn.cur.mark = TS.bn.cur.got.slice(); renderView(); };
ACT.bnfast = () => { const B = TS.bn; while (B.cur) { B.cur.mark = B.cur.got.slice(); bnSubmit(); } renderView(); };
ACT.bnans = a => { TS.bn.ans = a.dataset.val; renderView(); };
ACT.bnval = () => { const B = TS.bn; B.done = true; const srtM = Math.round(avg(B.track.slice(-10).map(t => t.snr)) * 10) / 10; const cat = srtM <= -4 ? 'normal' : srtM <= 0 ? 'leger' : 'important'; tsScore('bruit', B.ans === cat ? 1 : 0, 1); renderView(); };
ACT.bnnew = () => { bnNew(); renderView(); window.scrollTo(0, 0); };

/* ================= OUTILS DE DÉPISTAGE ================= */
/* --- balayage --- */
function bsNew() { const lv = Store.get('bsLevel', 25); const fr = Store.get('bsFreq', [1000, 2000, 4000, 500]); TS.bs = { lv, fr, items: [], k: 0, phase: 'setup', res: {} }; }
function bsStart() {
  const B = TS.bs; B.items = []; ['R', 'L'].forEach(e => B.fr.forEach(f => B.items.push({ e, f, r: null, retest: false })));
  B.k = 0; B.phase = 'run'; actx();
}
function bsView() {
  const B = TS.bs, cal = getCal();
  if (B.phase === 'setup') return tsHead('Balayage de dépistage', 'Mode examinateur : vous présentez, le patient lève la main, vous notez.') + `${calBanner(cal)}
  <section class="card"><span class="flab">Niveau de dépistage</span>${chipGroup('bslv', ['20', '25', '30'].map(v => ({ v, l: v + ' dB HL' })), String(B.lv), 'bslv')}
  <span class="flab">Fréquences</span><div class="chips">${[500, 1000, 2000, 3000, 4000, 6000].map(f => `<button class="chip${B.fr.includes(f) ? ' on' : ''}" data-act="bsfr" data-f="${f}">${fLabel(f)}</button>`).join('')}</div>
  <ol class="bul small"><li>Mesurer le bruit ambiant (outil « Bruit ambiant »).</li><li>Casque filaire, bien placé, rouge à droite.</li><li>Consigne : « Levez la main à chaque bip, même très faible. » Démonstration à 40 dB.</li><li>Le patient ne voit ni l’écran ni votre main.</li></ol>
  <div class="row gap wrap"><button class="btn small" data-act="bsdemo">Démonstration 40 dB (1 kHz, les deux oreilles)</button></div>
  <button class="btn primary big wide" data-act="bsstart" ${B.fr.length ? '' : 'disabled'}>Commencer</button></section>
  <section class="card"><p class="small">Critère : « à contrôler » si une fréquence n’est pas entendue sur une oreille, confirmée au retest. Un signe d’alerte (douleur, écoulement, surdité brutale, acouphène unilatéral, vertige) impose une orientation quel que soit le résultat.</p></section>`;
  if (B.phase === 'run') {
    const it = B.items[B.k];
    const mx = maxHL(it.e, it.f);
    const grid = bsGrid();
    return tsHead('Balayage de dépistage') + `<section class="card atrun"><p class="eyebrow">${B.k + 1} / ${B.items.length}${it.retest ? ' · retest' : ''}</p>
    <p class="big-ear ${it.e === 'R' ? 'r' : 'l'}">Oreille ${sideName(it.e)} · ${fLabel(it.f)} Hz · ${Math.min(B.lv, mx)} dB HL</p>
    <button class="btn big wide send ${it.e === 'R' ? 'r' : 'l'}" data-act="bsplay">Présenter le son</button>
    <div class="row gap" style="justify-content:center;margin-top:10px"><button class="btn primary big" data-act="bsmark" data-r="1">Réponse</button><button class="btn big" data-act="bsmark" data-r="0">Pas de réponse</button></div>
    ${mx < B.lv ? `<p class="fb warn">Sortie maximale du téléphone limitée à ${mx} dB HL à cette fréquence.</p>` : ''}</section>${grid}`;
  }
  const grid = bsGrid();
  const fails = B.items.filter(x => x.r === false && (x.retest || !B.items.some(y => y.e === x.e && y.f === x.f && y.retest)));
  const pass = !fails.length;
  return tsHead('Résultat du dépistage') + `<section class="card"><p class="fb ${pass ? 'ok' : 'bad'}" style="font-size:1rem">${pass ? 'PASSE : toutes les fréquences entendues aux deux oreilles.' : 'À CONTRÔLER : ' + [...new Set(fails.map(x => sideName(x.e)))].map(x => 'oreille ' + x).join(' et ') + '.'}</p>
  <p class="small">${pass ? 'Pas d’argument pour une perte gênante aujourd’hui à ces fréquences. Contrôle régulier conseillé (tous les 1 à 2 ans après 60 ans), et à tout moment en cas de gêne.' : 'Orientation vers le médecin traitant ou un ORL pour un bilan auditif complet. Le dépistage ne pose pas de diagnostic.'}</p>
  ${grid}<div class="row gap wrap"><button class="btn" data-act="bscopy">Copier le compte rendu</button><button class="btn primary" data-act="bsreset">Nouveau dépistage</button></div></section>`;
}
function bsGrid() {
  const B = TS.bs;
  const cell = (e, f) => { const r = B.items.filter(x => x.e === e && x.f === f); const last = r.filter(x => x.r != null).slice(-1)[0]; return last ? (last.r ? '✓' : '✗') : '·'; };
  return `<section class="card"><div class="tscroll"><table class="tbl"><thead><tr><th></th>${B.fr.map(f => `<th>${fLabel(f)}</th>`).join('')}</tr></thead><tbody>${['R', 'L'].map(e => `<tr class="${e === 'R' ? 'r' : 'l'}"><th>${sideShort(e)}</th>${B.fr.map(f => { const v = cell(e, f); return `<td class="${v === '✓' ? 'ok' : v === '✗' ? 'bad' : ''}">${v}</td>`; }).join('')}</tr>`).join('')}</tbody></table></div></section>`;
}
ACT.bslv = a => { TS.bs.lv = +a.dataset.val; Store.set('bsLevel', TS.bs.lv); renderView(); };
ACT.bsfr = a => { const B = TS.bs, f = +a.dataset.f; B.fr = B.fr.includes(f) ? B.fr.filter(x => x !== f) : B.fr.concat([f]).sort((x, y) => [1000, 2000, 3000, 4000, 6000, 500].indexOf(x) - [1000, 2000, 3000, 4000, 6000, 500].indexOf(y)); Store.set('bsFreq', B.fr); renderView(); };
ACT.bsdemo = () => { playTone({ f: 1000, hl: 40, ear: 'both', dur: 1.2, mode: 'pulse' }); };
ACT.bsstart = () => { bsStart(); renderView(); };
ACT.bsplay = () => { const B = TS.bs, it = B.items[B.k]; playTone({ f: it.f, hl: Math.min(B.lv, maxHL(it.e, it.f)), ear: it.e, dur: 1.4, mode: 'pulse' }); };
ACT.bsmark = a => {
  const B = TS.bs, it = B.items[B.k];
  it.r = a.dataset.r === '1';
  if (!it.r && !it.retest) B.items.splice(B.k + 1, 0, { e: it.e, f: it.f, r: null, retest: true });
  B.k++;
  if (B.k >= B.items.length) { B.phase = 'done'; const h = Store.get('depist', []); h.push({ d: Date.now(), lv: B.lv }); Store.set('depist', h.slice(-50)); }
  renderView();
};
ACT.bsreset = () => { bsNew(); renderView(); };
ACT.bscopy = a => {
  const B = TS.bs;
  const fails = B.items.filter(x => x.r === false && (x.retest || !B.items.some(y => y.e === x.e && y.f === x.f && y.retest)));
  const line = e => B.fr.map(f => { const r = B.items.filter(x => x.e === e && x.f === f && x.r != null).slice(-1)[0]; return `${fLabel(f)} ${r ? (r.r ? 'oui' : 'non') : '—'}`; }).join(' · ');
  copyText(`Dépistage auditif par balayage — ${new Date().toLocaleDateString('fr-FR')}\nNiveau : ${B.lv} dB HL ${getCal() ? '(étalonnage biologique)' : '(non étalonné)'}\nOD : ${line('R')}\nOG : ${line('L')}\nRésultat : ${fails.length ? 'À CONTRÔLER — orientation vers le médecin ou un ORL' : 'PASSE'}\nCe dépistage ne constitue pas un diagnostic.`, a);
};

/* --- voix chuchotée --- */
const CH_D = ['1', '2', '3', '4', '5', '6', '8', '9'], CH_L = ['K', 'M', 'T', 'R', 'L', 'F', 'J', 'Z'];
function chNew() { const r = makeRng(newSeed()); TS.ch = { r, ear: 'R', res: { R: [], L: [] }, cur: null, done: { R: null, L: null } }; chTrip(); }
function chTrip() { const C = TS.ch, r = C.r; const t = r.shuffle([r.pick(CH_D), r.pick(CH_L), r.pick(CH_D.filter(x => x !== '7'))]); C.cur = { t, ok: [null, null, null] }; }
function chView() {
  const C = TS.ch, e = C.ear;
  const resLine = s => { const tr = C.res[s]; if (!tr.length) return '—'; const tot = tr.reduce((a, x) => a + x, 0); return tr.map(x => x + '/3').join(' + ') + (C.done[s] ? ` → <b class="${C.done[s] === 'pass' ? 'okc' : 'badc'}">${C.done[s] === 'pass' ? 'passe' : 'à contrôler'}</b>` : ''); };
  const cur = C.done[e] ? `<p class="fb ${C.done[e] === 'pass' ? 'ok' : 'bad'}">Oreille ${sideName(e)} : ${C.done[e] === 'pass' ? 'passe' : 'à contrôler'}.</p>${C.done.R && C.done.L ? '' : `<button class="btn primary" data-act="chear" data-val="${e === 'R' ? 'L' : 'R'}">Passer à l’oreille ${sideName(e === 'R' ? 'L' : 'R')}</button>`}`
    : `<p class="small">Triplet ${C.res[e].length + 1} : chuchotez ces trois éléments, puis notez chaque élément répété.</p>
    <div class="trip">${C.cur.t.map((x, k) => `<div class="tripc"><span class="mono">${x}</span><div class="row gap"><button class="chip${C.cur.ok[k] === true ? ' on' : ''}" data-act="chok" data-k="${k}" data-v="1">✓</button><button class="chip${C.cur.ok[k] === false ? ' on' : ''}" data-act="chok" data-k="${k}" data-v="0">✗</button></div></div>`).join('')}</div>
    <button class="btn primary wide" data-act="chval" ${C.cur.ok.every(x => x != null) ? '' : 'disabled'}>Valider le triplet</button>`;
  return tsHead('Voix chuchotée guidée', 'Protocole en deux triplets maximum par oreille.') + `
  <section class="card"><ol class="bul small"><li>Placez-vous derrière le patient, à bout de bras (≈ 60 cm), hors de sa vue.</li><li>Masquez l’oreille opposée en frottant son tragus.</li><li>Expirez complètement, puis chuchotez le triplet.</li><li>Trois éléments justes au premier triplet : passe. Sinon, second triplet ; moins de 3 éléments justes sur 6 : à contrôler.</li></ol></section>
  <section class="card"><div class="eartabs">${['R', 'L'].map(s => `<button class="eartab ${s === 'R' ? 'r' : 'l'}${s === e ? ' on' : ''}" data-act="chear" data-val="${s}">Oreille ${sideName(s)}</button>`).join('')}</div>${cur}</section>
  <section class="card"><dl class="kv"><dt>OD</dt><dd>${resLine('R')}</dd><dt>OG</dt><dd>${resLine('L')}</dd></dl>
  <div class="row gap wrap"><button class="btn small" data-act="chcopy" ${C.done.R && C.done.L ? '' : 'disabled'}>Copier le résultat</button><button class="btn ghost small" data-act="chreset">Recommencer</button></div></section>`;
}
ACT.chear = a => { const C = TS.ch; C.ear = a.dataset.val; if (!C.done[C.ear]) chTrip(); renderView(); };
ACT.chok = a => { TS.ch.cur.ok[+a.dataset.k] = a.dataset.v === '1'; renderView(); };
ACT.chval = () => {
  const C = TS.ch, e = C.ear, n = C.cur.ok.filter(Boolean).length;
  C.res[e].push(n);
  if (C.res[e].length === 1 && n === 3) C.done[e] = 'pass';
  else if (C.res[e].length === 2) C.done[e] = (C.res[e][0] + C.res[e][1]) >= 3 ? 'pass' : 'refer';
  else chTrip();
  renderView();
};
ACT.chreset = () => { chNew(); renderView(); };
ACT.chcopy = a => { const C = TS.ch; copyText(`Test de la voix chuchotée — ${new Date().toLocaleDateString('fr-FR')}\nOD : ${C.res.R.join('+')} → ${C.done.R === 'pass' ? 'passe' : 'à contrôler'}\nOG : ${C.res.L.join('+')} → ${C.done.L === 'pass' ? 'passe' : 'à contrôler'}\nTest de repérage, ne constitue pas un diagnostic.`, a); };

/* --- calculateur VPP --- */
const VPPPRE = { neo: { se: 95, sp: 96, pr: 0.1, l: 'Néonatal (1 sur 1000)' }, school: { se: 90, sp: 90, pr: 3, l: 'Scolaire' }, senior: { se: 90, sp: 80, pr: 30, l: 'Senior (70 ans et plus)' } };
function vppView() {
  const V = TS.vpp || (TS.vpp = { se: 95, sp: 96, pr: 0.1 });
  const N = 1000, D = N * V.pr / 100, VP = D * V.se / 100, FN = D - VP, H = N - D, FP = H * (1 - V.sp / 100), VN = H - FP;
  const vpp = VP + FP ? VP / (VP + FP) * 100 : 0, vpn = VN + FN ? VN / (VN + FN) * 100 : 0;
  const counts = [['vp', Math.round(VP)], ['fn', Math.round(FN)], ['fp', Math.round(FP)]];
  let cells = [], k = 0; counts.forEach(([c, n]) => { for (let j = 0; j < n && k < N; j++, k++) cells.push(c); }); while (cells.length < N) cells.push('vn');
  const grid = `<svg class="ag" viewBox="0 0 400 250">${cells.map((c, i) => `<rect x="${(i % 40) * 10}" y="${Math.floor(i / 40) * 10}" width="8" height="8" rx="2" class="vg-${c}"/>`).join('')}</svg>`;
  const fmt = v => v < 10 ? v.toFixed(1).replace('.', ',') : Math.round(v);
  const sl = (k, min, max, step, lab) => `<label class="flab" for="vpp_${k}">${lab} : <b class="mono">${V[k]}${k === 'pr' ? ' %' : ' %'}</b></label><input type="range" id="vpp_${k}" min="${min}" max="${max}" step="${step}" value="${V[k]}" data-inp="vpp" data-k="${k}" class="range">`;
  return tsHead('Sensibilité, spécificité, VPP', 'Mille personnes dépistées : qui est vraiment malentendant parmi les « à contrôler » ?') + `
  <section class="card"><div class="chips">${Object.entries(VPPPRE).map(([k, p]) => `<button class="chip" data-act="vpppre" data-k="${k}">${p.l}</button>`).join('')}</div>
  ${sl('se', 50, 100, 1, 'Sensibilité')}${sl('sp', 50, 100, 1, 'Spécificité')}${sl('pr', 0.1, 50, 0.1, 'Prévalence')}</section>
  <section class="card"><div class="agwrap">${grid}</div>
  <div class="legend"><span class="lg"><i class="sw vg-vp"></i>vrais positifs ${fmt(VP)}</span><span class="lg"><i class="sw vg-fp"></i>faux positifs ${fmt(FP)}</span><span class="lg"><i class="sw vg-fn"></i>faux négatifs ${fmt(FN)}</span><span class="lg"><i class="sw vg-vn"></i>vrais négatifs ${fmt(VN)}</span></div>
  <div class="kpis"><div class="kpi"><span class="mono big">${fmt(vpp)} %</span><span>VPP : malentendants parmi les « à contrôler »</span></div><div class="kpi"><span class="mono big">${fmt(vpn)} %</span><span>VPN : normo-entendants parmi les « passe »</span></div></div>
  <p class="small">${vpp < 20 ? 'La grande majorité des « à contrôler » sont des faux positifs : c’est pourquoi on retest avant d’inquiéter, et qu’on parle de test « à contrôler ».' : vpp < 60 ? 'Un « à contrôler » sur deux environ est un vrai malentendant : le bilan complet reste indispensable.' : 'La plupart des « à contrôler » ont une vraie perte.'}</p></section>`;
}
INP.vpp = a => { TS.vpp[a.dataset.k] = +a.value; const sy = window.scrollY; renderView(); window.scrollTo(0, sy); const el = document.getElementById('vpp_' + a.dataset.k); if (el) el.focus(); };
ACT.vpppre = a => { const p = VPPPRE[a.dataset.k]; TS.vpp = { se: p.se, sp: p.sp, pr: p.pr }; renderView(); };

/* --- bruit ambiant --- */
const AMB = { on: false, stream: null, raf: 0, cur: null, ref: Store.get('ambRef', null), off: Store.get('ambOff', null), err: null };
function ambView() {
  const v = AMB.cur;
  const abs = v != null && AMB.off != null ? v + AMB.off : null;
  const rel = v != null && AMB.ref != null ? v - AMB.ref : null;
  let verdict = '';
  if (abs != null) verdict = abs <= 45 ? `<p class="fb ok">≈ ${Math.round(abs)} dB(A) : conditions correctes pour un dépistage à 20–25 dB HL au casque fermé.</p>` : abs <= 50 ? `<p class="fb warn">≈ ${Math.round(abs)} dB(A) : limite. Préférez 25 ou 30 dB HL et un casque fermé, ou un lieu plus calme.</p>` : `<p class="fb bad">≈ ${Math.round(abs)} dB(A) : trop bruyant, le dépistage ne sera pas fiable.</p>`;
  else if (rel != null) verdict = `<p class="fb ${rel <= 3 ? 'ok' : rel <= 8 ? 'warn' : 'bad'}">${rel > 0 ? '+' : ''}${Math.round(rel)} dB par rapport à votre pièce de référence.</p>`;
  return tsHead('Bruit ambiant', 'Indicateur avec le micro du téléphone. Sans étalonnage, il compare seulement à une pièce de référence.') + `
  <section class="card atrun"><div class="ambnum mono">${v == null ? '—' : abs != null ? Math.round(abs) : (rel != null ? (rel > 0 ? '+' : '') + Math.round(rel) : Math.round(v))}<small>${abs != null ? ' dB(A) approx.' : rel != null ? ' dB rel.' : ' dBFS'}</small></div>
  <div class="pbar"><i class="${abs != null ? (abs <= 45 ? 'ok' : abs <= 50 ? 'warn' : 'bad') : 'ok'}" style="width:${v == null ? 0 : clamp((v + 90) / 80 * 100, 0, 100)}%"></i></div>
  ${verdict}${AMB.err ? `<p class="fb bad">${esc(AMB.err)}</p>` : ''}
  <button class="btn primary big" data-act="ambtoggle">${AMB.on ? 'Arrêter' : 'Mesurer'}</button></section>
  <section class="card"><h3>Référence et étalonnage</h3>
  <div class="row gap wrap"><button class="btn small" data-act="ambref" ${v == null ? 'disabled' : ''}>Mémoriser comme pièce de référence</button></div>
  <label class="flab" for="ambCal">Étalonner avec un sonomètre : niveau lu sur le sonomètre (dB(A))</label>
  <div class="row gap"><input id="ambCal" class="inp" inputmode="decimal" placeholder="ex. 42"><button class="btn small" data-act="ambcal" ${v == null ? 'disabled' : ''}>Étalonner</button>${AMB.off != null ? '<button class="btn ghost small" data-act="ambcalx">Effacer</button>' : ''}</div>
  <p class="muted small">Repères : bureau calme ≈ 35–45 dB(A) ; au-delà d’environ 50 dB(A), un dépistage à 20–25 dB HL au casque n’est plus fiable. Le micro d’un téléphone n’est pas un sonomètre : valeurs indicatives.</p></section>`;
}
async function ambStart() {
  AMB.err = null;
  try {
    const st = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    const ctx = actx(); const src = ctx.createMediaStreamSource(st);
    const hp1 = ctx.createBiquadFilter(); hp1.type = 'highpass'; hp1.frequency.value = 20.6; hp1.Q.value = 0.5;
    const hp2 = ctx.createBiquadFilter(); hp2.type = 'highpass'; hp2.frequency.value = 282; hp2.Q.value = 0.5;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 12194; lp.Q.value = 0.5;
    const an = ctx.createAnalyser(); an.fftSize = 4096;
    src.connect(hp1); hp1.connect(hp2); hp2.connect(lp); lp.connect(an);
    const buf = new Float32Array(an.fftSize);
    AMB.stream = st; AMB.on = true; let acc = [];
    const loop = () => {
      if (!AMB.on) return;
      an.getFloatTimeDomainData(buf); let s = 0; for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i];
      const db = 10 * Math.log10(s / buf.length + 1e-12);
      acc.push(db); if (acc.length > 20) acc.shift();
      AMB.cur = 10 * Math.log10(avg(acc.map(d => Math.pow(10, d / 10))));
      if (TAB === 'tests' && TS.sim === 'ambiant') { const n = $('.ambnum'); if (n && !(AMB._t > Date.now())) { AMB._t = Date.now() + 400; renderView(); } }
      AMB.raf = requestAnimationFrame(loop);
    };
    loop();
  } catch (e) { AMB.on = false; AMB.err = 'Micro indisponible : autorisez l’accès au microphone pour OtoLab dans les réglages du téléphone.'; renderView(); }
}
function ambStop() { AMB.on = false; cancelAnimationFrame(AMB.raf); try { AMB.stream && AMB.stream.getTracks().forEach(t => t.stop()); } catch (e) { } AMB.stream = null; }
ACT.ambtoggle = () => { if (AMB.on) { ambStop(); renderView(); } else { ambStart(); renderView(); } };
ACT.ambref = () => { AMB.ref = AMB.cur; Store.set('ambRef', AMB.ref); toast('Pièce de référence mémorisée'); renderView(); };
ACT.ambcal = () => { const v = parseFloat(($('#ambCal').value || '').replace(',', '.')); if (!(v > 15 && v < 110)) { toast('Entrez le niveau lu sur le sonomètre, entre 15 et 110 dB(A).'); return; } AMB.off = v - AMB.cur; Store.set('ambOff', AMB.off); toast('Étalonnage enregistré'); renderView(); };
ACT.ambcalx = () => { AMB.off = null; Store.set('ambOff', null); renderView(); };

/* ---------- scores des simulateurs ---------- */
function tsScore(k, ok, n) { const h = Store.get('tsScores', {}); const x = h[k] || { ok: 0, n: 0, runs: 0 }; x.ok += ok; x.n += n; x.runs++; h[k] = x; Store.set('tsScores', h); }
