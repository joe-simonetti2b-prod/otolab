/* ============ CABINET : poste de travail simulé ============
   Deux applications comme au cabinet : « Gestion » (dossier patient, façon Cosium)
   et « Audio » (plateforme d'audiométrie et d'appareillage, façon Noah).
   Le patient virtuel répond selon ses seuils réels cachés : transfert transcrânien,
   masquage, surmasquage, vibrotactile, consignes. */
const CAB_IA = [40, 40, 40, 45, 45, 50, 50, 50];          // atténuation interaurale, casque supra-aural
const CAB_ACMAX = [105, 120, 120, 120, 120, 120, 110, 100];
const CAB_VT = [40, 55];                                  // vibrotactile en CO à 250 et 500 Hz
const CAB_BRANDS = ['Phonak', 'ReSound', 'Signia'];
const CAB_MUT = ['Harmonie Mutuelle', 'MGEN', 'Malakoff Humanis', 'AG2R La Mondiale', 'Groupama', 'Complémentaire santé solidaire'];
const CAB_TIMES = ['08:45', '09:30', '10:30', '11:15', '14:00', '15:00', '16:00'];
const CAB_RDV = [
  { k: 'j8', l: 'Dans 8 à 15 jours', d: 'contrôle d’adaptation' },
  { k: 'm1', l: 'Dans 1 mois', d: 'contrôle et réglage' },
  { k: 'm6', l: 'Dans 6 mois', d: 'suivi' },
  { k: 'orl', l: 'Courrier à l’ORL', d: 'nouveau RDV après son avis' }
];
const W_LAFON = ['bac', 'bal', 'bec', 'bol', 'bus', 'cap', 'car', 'col', 'coq', 'dur', 'fer', 'fil', 'gaz', 'lac', 'mal', 'mer', 'mur', 'pic', 'sac', 'sel', 'sol', 'tir', 'vol', 'vis', 'jupe', 'lune', 'mode', 'nappe', 'neuf', 'pâte', 'pipe', 'poche', 'pomme', 'pull', 'rame', 'riche', 'robe', 'roche', 'soupe', 'tache', 'tube', 'vache', 'ville', 'zone', 'bague', 'boule', 'bouche', 'cage', 'canne', 'chaise', 'chêne', 'code', 'colle', 'coupe', 'date', 'dame', 'digue', 'douche', 'femme', 'fête', 'figue', 'foule', 'gare', 'gomme', 'guide', 'jeune', 'case', 'lime', 'mousse', 'nage', 'page', 'pile', 'rive', 'sabre', 'tasse', 'toile', 'vague', 'bise', 'cube', 'dune'];
const W_FOURN = ['bateau', 'cheval', 'maison', 'jardin', 'soleil', 'chapeau', 'gâteau', 'lapin', 'mouton', 'poisson', 'bouteille', 'camion', 'citron', 'couteau', 'crayon', 'dragon', 'fromage', 'garçon', 'girafe', 'journal', 'marteau', 'montagne', 'oiseau', 'orange', 'panier', 'papier', 'pinceau', 'poulet', 'raisin', 'rideau', 'salade', 'sapin', 'savon', 'serpent', 'tableau', 'tapis', 'tortue', 'tracteur', 'valise', 'vélo', 'violon', 'voisin', 'bonbon', 'cadeau', 'canard', 'carton', 'château', 'chemin', 'cochon', 'dauphin', 'docteur', 'facteur', 'fusée', 'garage', 'guitare', 'hibou', 'matin', 'melon', 'moulin', 'navire', 'nuage', 'pompier', 'râteau', 'renard', 'requin', 'rocher', 'ruisseau', 'sirop', 'soldat', 'bouton', 'manteau', 'ballon'];
const CAB_CONF = { p: 'b', b: 'p', t: 'd', d: 't', c: 'g', g: 'c', f: 'v', v: 'f', s: 'ch', m: 'n', n: 'm', l: 'r', r: 'l', j: 'ch' };
const ANAM_Q = [
  { k: 'motif', l: 'Qu’est-ce qui vous amène ?', key: true },
  { k: 'gene', l: 'Dans quelles situations êtes-vous gêné(e) ?' },
  { k: 'ant', l: 'Antécédents d’oreille : otites, chirurgie, traumatisme ?', key: true },
  { k: 'acou', l: 'Avez-vous des acouphènes ?', key: true },
  { k: 'vert', l: 'Avez-vous des vertiges ou des troubles de l’équilibre ?', key: true },
  { k: 'bruit', l: 'Êtes-vous exposé(e) au bruit (travail, loisirs) ?', key: true },
  { k: 'orl', l: 'Avez-vous vu un ORL ? Avez-vous une ordonnance ?', key: true },
  { k: 'appa', l: 'Avez-vous déjà porté des appareils auditifs ?' },
  { k: 'attente', l: 'Qu’attendez-vous de l’appareillage ?' }
];
const CAB_GENE = ['au restaurant et en famille quand tout le monde parle', 'devant la télévision, ma famille dit que je mets le son trop fort', 'au téléphone et en réunion', 'quand on me parle de dos ou d’une autre pièce', 'avec les voix d’enfants et les voix féminines', 'à la messe et dans les grandes salles'];
const CAB_ATT = ['Comprendre à nouveau mes petits-enfants.', 'Suivre les conversations au travail sans faire répéter.', 'Regarder la télévision sans gêner les voisins.', 'Ne plus être fatigué(e) le soir après les repas de famille.', 'Être à l’aise au téléphone.'];

let CAB = { day: null, P: null, app: 'gest', debrief: null };

/* ---------- vérités cachées ---------- */
const cabAC = (cs, s, i) => cs.ears[s].acNR[i] ? 999 : cs.ears[s].ac[i];
function cabCoch(cs, s, i) {
  const e = cs.ears[s];
  if (i < NBC) return e.bcNR[i] ? (e.acNR[i] ? 999 : e.ac[i]) : e.bc[i];
  const gap = Math.max(0, cabAC(cs, s, NBC - 1) - cabCoch(cs, s, NBC - 1));
  return cabAC(cs, s, i) >= 999 ? 999 : Math.max(-10, cabAC(cs, s, i) - Math.min(gap, 60));
}
function cabThreshold(P, s, tr, i, mask, mlvl) {
  const cs = P.cs, o = s === 'R' ? 'L' : 'R';
  const ACs = cabAC(cs, s, i), Cs = cabCoch(cs, s, i);
  const ABGs = ACs >= 999 ? 0 : Math.max(0, ACs - Cs);
  const ACo = cabAC(cs, o, i), Co = cabCoch(cs, o, i);
  const ABGo = ACo >= 999 ? 0 : Math.max(0, ACo - Co);
  const om = mask ? mlvl - CAB_IA[i] : -99;              // bruit qui repasse vers la cochlée testée
  let direct = tr === 'CA' ? Math.max(ACs, om + ABGs) : Math.max(Cs, om);
  if (mask) direct += 3;                                 // masquage central
  const oThr = mask ? Math.max(Co, mlvl - ABGo) : Co;   // cochlée non testée, masquée ou non
  const cross = oThr + (tr === 'CA' ? CAB_IA[i] : 5);
  return { thr: Math.min(direct, cross), via: direct <= cross ? 'direct' : 'cross', direct, cross, over: mask && om + (tr === 'CA' ? ABGs : 0) > (tr === 'CA' ? ACs : Cs) };
}
/* besoin de masquage (règles classiques, sur les vrais seuils) */
function cabMaskNeed(P, s, tr, i) {
  const cs = P.cs, o = s === 'R' ? 'L' : 'R';
  const ACs = cabAC(cs, s, i), Cs = cabCoch(cs, s, i), ACo = cabAC(cs, o, i), Co = cabCoch(cs, o, i);
  const ABGo = ACo >= 999 ? 0 : Math.max(0, ACo - Co);
  const base = Math.min(ACo, 110) + 10;                         // le bruit doit être entendu par l'oreille masquée
  if (tr === 'CA') {
    const thr = Math.min(ACs, CAB_ACMAX[i]);
    if (thr - CAB_IA[i] < Co) return { need: false };           // pas de transfert possible
    return { need: true, min: Math.max(base, thr - CAB_IA[i] + ABGo + 10), max: Cs >= 999 ? 999 : Cs + CAB_IA[i] - 5 };
  }
  if (!(ACs - Cs >= 15 || Math.abs(Cs - Co) >= 15 || Cs >= 999)) return { need: false };
  const thr = Math.min(Cs, BC_MAX[i]);
  return { need: true, min: Math.max(base, thr - 5 + ABGo + 10), max: Cs >= 999 ? 999 : Cs + CAB_IA[i] - 5 };
}

/* ---------- patients et journée ---------- */
function cabNewDay() {
  const seed = newSeed(), rng = makeRng(seed);
  const kinds = rng.shuffle(['bilan', 'bilan', 'bilan', 'controle', 'controle']);
  const d = new Date();
  CAB.day = { seed, date: d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }), pts: kinds.map((k, i) => cabPatient(k, rng.int(100000, 999999), CAB_TIMES[i], rng)) };
  CAB.P = null; CAB.app = 'gest'; CAB.debrief = null;
}
function cabPatient(kind, seed, time, drng) {
  let cs, s = seed;
  const wantFit = kind === 'controle' || drng.chance(0.7);
  for (let t = 0; t < 60; t++) {
    cs = generateCase({ seed: s, pub: 'adulte' });
    if (!wantFit || (cs.conduite === 'appareil' && cs.fitMode === 'full')) break;
    s = 100000 + (s * 7919 + 13) % 899999;
  }
  const rng = makeRng(cs.seed + 4242);
  const off = {};
  ['R', 'L'].forEach(e => off[e] = CH.map((f, i) => Math.round(rng.gauss(i >= 4 ? -2 : 0, i >= 4 ? 4 : 2))));
  const blank = () => ({ ac: F.map(() => null), acNR: F.map(() => false), acM: F.map(() => null), bc: F.slice(0, NBC).map(() => null), bcNR: F.slice(0, NBC).map(() => false), bcM: F.slice(0, NBC).map(() => null) });
  const P = {
    kind, time, cs, status: 'attente', rng: makeRng(cs.seed + 31),
    mut: rng.pick(CAB_MUT), origin: rng.pick(['de lui-même', 'sur conseil de son médecin traitant', 'poussé par sa famille']), orl: 'Dr ' + rng.pick(LAST), gene: rng.pick(CAB_GENE), att: rng.pick(CAB_ATT),
    ordoDate: (() => { const d = new Date(); d.setDate(d.getDate() - rng.int(5, 60)); return d.toLocaleDateString('fr-FR'); })(),
    gtab: kind === 'bilan' ? 'id' : 'suivi', nmod: 'home',
    asked: {}, oto: { R: false, L: false }, otoBefore: null,
    aud: { R: blank(), L: blank() },
    ton: { ear: 'R', tr: 'CA', fi: 2, lvl: 30, mask: false, mlvl: 50, instr: false, minstr: false, stim: false, resp: null, say: '', n: 0, busy: false },
    voc: { ear: 'R', list: 'fournier', lvl: 50, mask: false, mlvl: 40, run: null, pts: { R: [], L: [] }, judged: 0, wrong: 0, listNo: { fournier: 1, lafon: 1 } },
    targets: { R: computeTargets(cs.ears.R, false), L: computeTargets(cs.ears.L, false) },
    fit: { brand: null, ears: null, device: null, R: newFitState(), L: newFitState(), cur: 'R', level: 65, first: false, adapt: 3 },
    rem: { probe: { R: null, L: null }, meas: { R: null, L: null }, n: 0, cur: 'R' },
    off, saved: {}, cr: { type: {}, deg: {}, cond: null, classe: null, rdv: null, action: null },
    result: null
  };
  if (kind === 'controle') cabSetupControl(P);
  return P;
}
function cabSides(fit) { return fit.ears === 'both' ? ['R', 'L'] : fit.ears ? [fit.ears] : []; }
function cabSetupControl(P) {
  const cs = P.cs, rng = makeRng(cs.seed + 77), T = P.targets;
  const e0 = earsToFit(cs)[0];
  const sides = e0 === 'both' ? ['R', 'L'] : [e0];
  P.fit.ears = e0;
  const best = DEVICES.find(d => deviceVerdict(cs, d.k, sides, T).pts === 15) || devOf('BTE-M');
  P.fit.device = best.k; P.fit.brand = rng.pick(CAB_BRANDS); P.fit.first = true; P.fit.cur = sides[0];
  const onTarget = s => {
    const fs = P.fit[s], v = ventOf(fs.vent);
    [50, 65, 80].forEach(L => { fs['g' + L] = T[s][L].map((g, i) => clamp(g - v.loss[i], 0, 90)); });
    fs.mpo = T[s].mpo.slice();
  };
  sides.forEach(s => {
    const vi = ventIdeal(cs.ears[s], false, cs.biap[s], T[s]);
    P.fit[s].vent = (vi.lf <= 35 && vi.ok.find(k => k === 'ouvert' || k === 'semi')) || vi.ok[0]; P.fit[s].support = vi.needEmbout ? 'embout' : 'dome';
    onTarget(s);
  });
  const add = (s, key, idx, d) => idx.forEach(i => { P.fit[s][key][i] = clamp(P.fit[s][key][i] + d, 0, 90); });
  const PERT = {
    occlusion: s => { if (ventIdeal(cs.ears[s], false, cs.biap[s]).lf > 35 || !['ouvert', 'semi'].includes(P.fit[s].vent)) return false; P.fit[s].vent = 'ferme'; onTarget(s); return true; },
    larsen: s => { const m = msgOf(P.fit[s]); [3, 4, 5].forEach(i => { P.fit[s].g50[i] = Math.max(P.fit[s].g50[i], m + 6); }); return true; },
    agressif: s => { add(s, 'g80', [3, 4, 5, 6], 11); return true; },
    intell: s => { add(s, 'g65', [3, 4, 5], -11); return true; },
    faible: s => { add(s, 'g50', [2, 3, 4, 5], -11); return true; },
    grave: s => { ['g50', 'g65', 'g80'].forEach(k => add(s, k, [0, 1, 2], 12)); return true; },
    metal: s => { add(s, 'g65', [4, 5, 6], 11); return true; }
  };
  const order = rng.shuffle(Object.keys(PERT));
  const snap = JSON.stringify({ R: P.fit.R, L: P.fit.L });
  P.baseIssues = detectIssues(cs, P.fit, T, sides);
  for (const k of order) {
    const st = JSON.parse(snap); P.fit.R = st.R; P.fit.L = st.L;
    if (!sides.every(s => PERT[k](s))) continue;
    if (!P.baseIssues.includes(k) && detectIssues(cs, P.fit, T, sides).includes(k)) { P.issue = k; break; }
  }
  if (!P.issue) { P.issue = 'accl'; const st = JSON.parse(snap); P.fit.R = st.R; P.fit.L = st.L; }
  P.fitStart = JSON.stringify({ R: P.fit.R, L: P.fit.L });
  P.acts = rng.shuffle([COMPLAINTS[P.issue].ok, ...COMPLAINTS[P.issue].no]);
  const low = ['occlusion', 'larsen', 'agressif', 'grave', 'metal'].includes(P.issue);
  P.dl = { h: low ? rng.int(2, 5) : rng.int(8, 13), calme: rng.int(30, 55), parole: rng.int(15, 35), bruit: 0, musique: rng.int(0, 8), weeks: rng.int(3, 6) };
  P.dl.bruit = Math.max(0, 100 - P.dl.calme - P.dl.parole - P.dl.musique);
  ['R', 'L'].forEach(s => { const a = P.aud[s], e = cs.ears[s]; a.ac = e.ac.slice(); a.acNR = e.acNR.slice(); a.bc = e.bc.slice(); a.bcNR = e.bcNR.slice(); });
  P.saved.tonal = 'old';
}

/* ---------- son de contrôle (volume faible, non étalonné) ---------- */
let CAB_SOUND = Store.get('cabSound', true);
function cabBeep(f, ear, lvl) {
  if (!CAB_SOUND) return;
  try {
    const ctx = actx(), out = routeTo(ctx, ear);
    const o = ctx.createOscillator(); o.frequency.value = f;
    const g = ctx.createGain(); g.gain.value = 0; o.connect(g); g.connect(out);
    const A = 0.01 + 0.09 * clamp(lvl, 0, 120) / 120, t0 = ctx.currentTime + 0.02;
    for (let k = 0; k < 3; k++) { const t = t0 + k * 0.33; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(A, t + 0.02); g.gain.setValueAtTime(A, t + 0.2); g.gain.linearRampToValueAtTime(0, t + 0.22); }
    o.start(t0); o.stop(t0 + 1.05);
  } catch (e) { }
}
function cabRender() { if (TAB === 'cab') renderView(); }

/* ---------- vue principale ---------- */
function renderCab() {
  if (!CAB.day) cabNewDay();
  const P = CAB.P;
  const bar = `<div class="ws-bar" role="tablist" aria-label="Applications du poste">
    <button class="ws-app g${CAB.app === 'gest' ? ' on' : ''}" data-act="cbapp" data-k="gest" role="tab" aria-selected="${CAB.app === 'gest'}"><b>Gestion</b><small>dossier patient · type Cosium</small></button>
    <button class="ws-app n${CAB.app === 'noah' ? ' on' : ''}" data-act="cbapp" data-k="noah" role="tab" aria-selected="${CAB.app === 'noah'}"><b>Audio</b><small>audiométrie · type Noah</small></button>
  </div>`;
  let body;
  if (CAB.debrief) body = cabDebriefView();
  else if (CAB.app === 'noah') body = cabNoah();
  else body = P ? cabFiche() : cabAgenda();
  return `<div class="ws">${CAB.debrief ? '' : bar}${body}</div>`;
}
ACT.cbapp = a => { if (a.dataset.k === 'noah' && !CAB.P) { toast('Ouvrez d’abord un dossier patient dans Gestion'); return; } CAB.app = a.dataset.k; renderView(); window.scrollTo(0, 0); };
function cabWin(cls, title, sub, inner, tools = '') {
  return `<section class="ws-win ${cls}"><header class="ws-title"><div><b>${title}</b>${sub ? `<span>${sub}</span>` : ''}</div>${tools}</header><div class="ws-body">${inner}</div></section>`;
}

/* ---------- Gestion : agenda ---------- */
function cabAgenda() {
  const d = CAB.day;
  const h = Store.get('cabHist', []);
  const rows = d.pts.map((P, i) => {
    const st = P.status === 'clos' ? `<span class="tag ok">Clôturé · ${P.result.pc} %</span>` : P.status === 'encours' ? '<span class="tag warn">En cours</span>' : '<span class="tag">En salle d’attente</span>';
    return `<button class="agrow" data-act="cbopen" data-i="${i}">
      <span class="mono agtime">${P.time}</span>
      <span class="agwho"><b>${esc(P.cs.name)}</b><small>${P.cs.ageTxt} · ${P.kind === 'bilan' ? 'Bilan auditif, 1er rendez-vous' : 'Contrôle d’appareillage'}</small></span>${st}</button>`;
  }).join('');
  const intro = `<p class="small muted">Ouvrez un dossier, menez le rendez-vous comme au cabinet, puis clôturez-le pour obtenir la correction. Sur le PC du cabinet, le clavier fonctionne comme dans le vrai logiciel (Espace, flèches, D/G, F5, +/−, S).</p>`;
  const tools = `<button class="btn small" data-act="cbnewday">Nouvelle journée</button>`;
  return cabWin('g', 'Agenda', esc(d.date), `${intro}<div class="aglist">${rows}</div>
    ${h.length ? `<p class="small muted">${h.length} dossier${h.length > 1 ? 's' : ''} clôturé${h.length > 1 ? 's' : ''} au total · moyenne des 10 derniers : <b class="mono">${Math.round(avg(h.slice(-10).map(x => x.pc)))} %</b></p>` : ''}`, tools);
}
ACT.cbnewday = () => { cabNewDay(); renderView(); };
ACT.cbopen = a => {
  const P = CAB.day.pts[+a.dataset.i];
  if (P.status === 'clos') { CAB.P = P; CAB.debrief = P.result; renderView(); window.scrollTo(0, 0); return; }
  P.status = 'encours'; CAB.P = P; CAB.app = 'gest'; renderView(); window.scrollTo(0, 0);
};
ACT.cbclose = () => { CAB.P = null; CAB.app = 'gest'; renderView(); window.scrollTo(0, 0); };

/* ---------- Gestion : fiche patient ---------- */
function cabFiche() {
  const P = CAB.P, cs = P.cs;
  const tabs = P.kind === 'bilan'
    ? [['id', 'Identité'], ['anam', 'Anamnèse'], ['oto', 'Otoscopie'], ['res', 'Examens'], ['cr', 'Compte rendu']]
    : [['suivi', 'Suivi'], ['id', 'Identité'], ['res', 'Examens'], ['cr', 'Compte rendu']];
  const nav = `<nav class="tabs ws-tabs">${tabs.map(([k, l]) => `<button class="tab${P.gtab === k ? ' on' : ''}" data-act="cbgtab" data-k="${k}">${l}</button>`).join('')}</nav>`;
  let inner = '';
  switch (P.gtab) {
    case 'id': inner = cabIdView(); break;
    case 'anam': inner = cabAnamView(); break;
    case 'oto': inner = cabOtoView(); break;
    case 'res': inner = cabResView(); break;
    case 'cr': inner = cabCrView(); break;
    case 'suivi': inner = cabSuiviView(); break;
  }
  const head = `<div class="ws-pt"><span class="avatar">${cs.sex === 'F' ? 'F' : 'H'}</span><div><b>${esc(cs.name)}</b><span class="small muted">${cs.ageTxt} · dossier <span class="mono">${cs.seed}</span> · RDV ${P.time}</span></div></div>`;
  const tools = `<button class="btn small" data-act="cbclose">Agenda</button>`;
  return cabWin('g', 'Dossier patient', P.kind === 'bilan' ? 'Bilan auditif' : 'Contrôle', `${head}${nav}<div class="stack">${inner}</div>
    <button class="btn wide ws-launch" data-act="cbapp" data-k="noah">Ouvrir le patient dans Audio</button>`, tools);
}
ACT.cbgtab = a => { CAB.P.gtab = a.dataset.k; renderView(); };
function cabIdView() {
  const P = CAB.P, cs = P.cs;
  const ordo = cs.prescribed || P.kind === 'controle'
    ? `Prescription d’appareillage du ${P.orl} (ORL), datée du ${P.ordoDate}.`
    : `Aucune ordonnance d’ORL dans le dossier. Patient venu ${P.origin}.`;
  let hist = '';
  if (P.kind === 'controle') hist = `<dt>Appareillé</dt><dd>Il y a ${P.dl.weeks} semaines · ${P.fit.brand}, ${esc(devOf(P.fit.device).l)} · ${cabSides(P.fit).map(s => sideShort(s)).join(' + ')}</dd>`;
  return `<section class="card"><dl class="kv">
    <dt>Identité</dt><dd>${cs.sex === 'F' ? 'Mme' : 'M.'} ${esc(cs.name)}, ${cs.ageTxt}</dd>
    <dt>Adresse</dt><dd>${esc(cs.city)}</dd>
    <dt>Profession</dt><dd>${esc(cs.job)}</dd>
    <dt>Couverture</dt><dd>Assurance maladie · ${esc(P.mut)}</dd>
    <dt>Ordonnance</dt><dd>${ordo}</dd>${hist}</dl></section>
    ${!(cs.prescribed || P.kind === 'controle') ? '<p class="note warn">Sans prescription médicale, pas de prise en charge d’un appareillage : pensez à la conduite à tenir.</p>' : ''}`;
}
function cabAnswer(P, k) {
  const cs = P.cs, h = cs.hist, all = h.symptoms.concat(h.antecedents, h.misc);
  const find = re => all.filter(x => re.test(x));
  const no = ['Non, pas du tout.', 'Non, rien de ce côté-là.', 'Non, jamais.'];
  switch (k) {
    case 'motif': return h.motif ? h.motif + '.' : 'J’entends moins bien depuis quelque temps.';
    case 'gene': return 'Surtout ' + P.gene + '.';
    case 'ant': { const r = find(/otite|chirurg|opér|traumat|tympan|perfor|écoul|drain|aérateur|cholest/i); return r.length ? r.join(' · ') : no[0]; }
    case 'acou': { const r = find(/acouph|siffl|bourdon/i); return r.length ? r.join(' · ') : no[1]; }
    case 'vert': { const r = find(/vertig|équilibre|tangage|instab/i); return r.length ? r.join(' · ') : no[2]; }
    case 'bruit': { const r = find(/bruit|chasse|tir|musique|concert|explos|discoth|armes/i); return (/maçon|militaire|musicien|agricult|carrière|aéroport|chaudronn|DJ|bûcheron|imprimerie/i.test(cs.job) ? 'Oui, je suis ' + cs.job + '. ' : '') + (r.length ? r.join(' · ') : (/maçon|militaire|musicien|DJ/i.test(cs.job) ? '' : 'Non, pas particulièrement.')); }
    case 'orl': return cs.prescribed ? `Oui, j’ai vu le ${P.orl}, j’ai l’ordonnance.` : 'Non, je n’ai vu personne pour l’instant.';
    case 'appa': return 'Non, ce serait la première fois.';
    case 'attente': return P.att;
  }
  return '';
}
function cabAnamView() {
  const P = CAB.P;
  return `<section class="card"><h3>Questions au patient</h3><p class="small muted">Touchez une question pour la poser. Les réponses s’ajoutent au dossier.</p>
    <div class="opts">${ANAM_Q.map(q => P.asked[q.k] ? `<div class="opt on"><small>${esc(q.l)}</small><span>« ${esc(cabAnswer(P, q.k))} »</span></div>` : `<button class="opt" data-act="cbask" data-k="${q.k}">${esc(q.l)}</button>`).join('')}</div></section>
`;
}
ACT.cbask = a => { CAB.P.asked[a.dataset.k] = true; renderView(); };
function cabOtoView() {
  const P = CAB.P;
  return `<section class="card"><h3>Otoscopie</h3><p class="small muted">À faire avant toute mesure et avant toute empreinte.</p>
    <div class="two">${['R', 'L'].map(s => `<div class="stack"><span class="ear ${s === 'R' ? 'r' : 'l'}">${sideShort(s)}</span>${P.oto[s] ? `<p class="small">${esc(P.cs.oto[s])}</p>` : `<button class="btn" data-act="cboto" data-s="${s}">Examiner l’oreille ${sideName(s)}</button>`}</div>`).join('')}</div></section>
    <section class="card"><h3>Tympanométrie</h3>${P.saved.tymp ? `${tympSVG(P.cs.tymp)}<p class="small">${['R', 'L'].map(s => `${sideShort(s)} : type ${P.cs.tymp[s].type === 'NR' ? 'non réalisable' : P.cs.tymp[s].type}, réflexe ${esc(P.cs.reflex[s])}`).join('<br>')}</p>` : `<button class="btn" data-act="cbtymp">Lancer l’impédancemètre</button>`}</section>`;
}
ACT.cboto = a => { CAB.P.oto[a.dataset.s] = true; renderView(); };
ACT.cbtymp = () => { const P = CAB.P; if (!P.oto.R || !P.oto.L) { toast('Otoscopie d’abord : on ne met pas de sonde dans un conduit non examiné'); return; } P.saved.tymp = true; renderView(); };
function cabResView() {
  const P = CAB.P;
  const ton = P.saved.tonal;
  const voc = P.saved.vocal;
  return `<section class="card"><h3>Audiométrie tonale</h3>${ton ? `<div class="agwrap">${audiogramSVG(cabAudObj(P))}</div>${agLegend()}${ton === 'old' ? '<p class="small muted">Audiogramme du bilan initial.</p>' : `<p class="small">${['R', 'L'].map(s => { const m = cabBiapMeasured(P, s); return `${sideShort(s)} : moyenne BIAP mesurée ${m == null ? 'incomplète' : Math.round(m) + ' dB HL'}`; }).join(' · ')}</p>`}` : '<p class="small muted">Rien d’enregistré. Mesurez dans Audio puis sauvegardez (touche S).</p>'}</section>
    <section class="card"><h3>Audiométrie vocale</h3>${voc ? `${cabSpeechSVG(P)}<p class="small">${['R', 'L'].map(s => { const r = cabSpeechRes(P.voc.pts[s]); return `${sideShort(s)} : ${r ? `SRT ≈ ${r.srt == null ? 'non atteint' : r.srt + ' dB'}, max ${r.max} %${r.roll ? ', chute aux forts niveaux' : ''}` : 'non faite'}`; }).join('<br>')}</p>` : '<p class="small muted">Rien d’enregistré.</p>'}</section>
    ${P.kind === 'bilan' ? `<section class="card"><h3>Tympanométrie</h3>${P.saved.tymp ? tympSVG(P.cs.tymp) : '<p class="small muted">Non faite (onglet Otoscopie).</p>'}</section>` : ''}`;
}
function cabAudObj(P) {
  const o = {};
  ['R', 'L'].forEach(s => { const a = P.aud[s]; o[s] = { ac: a.ac, acNR: a.acNR, bc: a.bc, bcNR: a.bcNR }; });
  return o;
}
function cabBiapMeasured(P, s) {
  const a = P.aud[s], idx = [1, 2, 3, 5];
  if (idx.some(i => a.ac[i] == null)) return null;
  return avg(idx.map(i => a.acNR[i] ? 120 : a.ac[i]));
}

/* ---------- Gestion : suivi (patient de contrôle) ---------- */
function cabSuiviView() {
  const P = CAB.P, d = P.dl;
  return `<section class="card"><h3>Ce que dit le patient</h3><p class="quote">${esc(COMPLAINTS[P.issue].q)}</p></section>
  <section class="card"><h3>Datalogging (lu dans les appareils)</h3><dl class="kv">
    <dt>Port</dt><dd><b class="mono">${d.h} h/jour</b> en moyenne sur ${d.weeks} semaines ${d.h < 6 ? '<span class="tag warn">faible</span>' : ''}</dd>
    <dt>Ambiances</dt><dd>Calme ${d.calme} % · parole ${d.parole} % · bruit ${d.bruit} % · musique ${d.musique} %</dd></dl>
    <p class="small muted">Ouvrez le patient dans Audio : les réglages actuels des appareils sont déjà lus. Corrigez, vérifiez en mesure in vivo, sauvegardez.</p></section>`;
}

/* ---------- Gestion : compte rendu ---------- */
function cabCrView() {
  const P = CAB.P, cs = P.cs, c = P.cr;
  if (P.kind === 'controle') {
    return `<section class="card"><h3>Action principale menée</h3><div class="opts">${P.acts.map(t => `<button class="opt${c.action === t ? ' on' : ''}" data-act="cbcr" data-name="action" data-val="${esc(t)}">${esc(t)}</button>`).join('')}</div></section>
    <section class="card"><h3>Prochain rendez-vous</h3>${chipGroup('rdv', CAB_RDV.map(r => ({ v: r.k, l: r.l })), c.rdv, 'cbcr')}</section>
    <button class="btn primary wide" data-act="cbfinish">Clôturer le dossier et voir la correction</button>`;
  }
  const earQ = s => `<div class="earq"><span class="ear ${s === 'R' ? 'r' : 'l'}">${sideShort(s)}</span>
    <span class="flab">Type</span>${chipGroup('type' + s, TYPE_OPTS, c.type[s], 'cbcr')}
    <span class="flab">Degré (moyenne BIAP)</span>${chipGroup('deg' + s, DEG_OPTS, c.deg[s], 'cbcr')}</div>`;
  const fitting = c.cond === 'appareil';
  return `<section class="card"><h3>Conclusion audiométrique</h3><div class="earqs">${earQ('R')}${earQ('L')}</div>
    ${c.type.R && c.deg.R && c.type.L && c.deg.L ? `<p class="note">« ${esc(cabPhrase(c))} »</p>` : ''}</section>
    <section class="card"><h3>Conduite à tenir</h3><div class="opts">${CONDUITES.map(o => `<button class="opt${c.cond === o.k ? ' on' : ''}" data-act="cbcr" data-name="cond" data-val="${o.k}">${esc(o.l)}</button>`).join('')}</div></section>
    ${fitting ? `<section class="card"><h3>Devis normalisé</h3>${chipGroup('classe', [{ v: 'I', l: 'Classe I (100 % Santé)' }, { v: 'II', l: 'Classe II (tarif libre)' }], c.classe, 'cbcr')}
      <p class="small muted">Deux offres obligatoires sur le devis, dont une en classe I. Renouvellement possible tous les 4 ans.</p></section>` : ''}
    <section class="card"><h3>Prochain rendez-vous</h3>${chipGroup('rdv', CAB_RDV.map(r => ({ v: r.k, l: r.l })), c.rdv, 'cbcr')}</section>
    <button class="btn primary wide" data-act="cbfinish">Clôturer le dossier et voir la correction</button>`;
}
function cabPhrase(c) {
  const t = s => ({ normale: 'audition normale', transmission: 'surdité de transmission', perception: 'surdité de perception', mixte: 'surdité mixte' }[c.type[s]]);
  const d = s => ({ normale: '', legere: 'légère', moyenne: 'moyenne', severe: 'sévère', profonde: 'profonde', totale: 'totale' }[c.deg[s]]);
  const one = s => c.type[s] === 'normale' ? `audition normale à ${sideName(s)}` : `${t(s)} ${sideName(s)}${d(s) ? ' ' + d(s) : ''}`;
  if (c.type.R === c.type.L && c.deg.R === c.deg.L && c.type.R !== 'normale') return `${t('R').charAt(0).toUpperCase() + t('R').slice(1)} bilatérale ${d('R')}, symétrique`;
  const s = one('R') + ', ' + one('L');
  return s.charAt(0).toUpperCase() + s.slice(1);
}
ACT.cbcr = a => {
  const c = CAB.P.cr, n = a.dataset.name, v = a.dataset.val;
  if (n.startsWith('type')) c.type[n.slice(4)] = v; else if (n.startsWith('deg')) c.deg[n.slice(3)] = v; else c[n] = v;
  renderView();
};

/* ---------- Audio : accueil ---------- */
function cabNoah() {
  const P = CAB.P;
  const mods = P.kind === 'bilan'
    ? [['tonal', 'Audiométrie tonale', 'CA, CO, masquage'], ['vocal', 'Audiométrie vocale', 'listes type Lafon et Fournier'], ['fit', 'Logiciel fabricant', 'choix, couplage, réglage'], ['rem', 'Mesure in vivo', 'gain réel vs cible']]
    : [['fit', 'Logiciel fabricant', 'lecture et réglage des appareils'], ['rem', 'Mesure in vivo', 'gain réel vs cible'], ['tonal', 'Audiométrie tonale', 'contrôle si besoin']];
  const LAB = { home: 'Accueil', tonal: 'Tonale', vocal: 'Vocale', fit: 'Réglage', rem: 'In vivo' };
  const nav = `<nav class="tabs ws-tabs">${['home'].concat(mods.map(m => m[0])).map(k => `<button class="tab${P.nmod === k ? ' on' : ''}" data-act="cbmod" data-k="${k}">${LAB[k]}</button>`).join('')}</nav>`;
  let inner;
  switch (P.nmod) {
    case 'tonal': inner = cabTonal(); break;
    case 'vocal': inner = cabVocal(); break;
    case 'fit': inner = cabFit(); break;
    case 'rem': inner = cabRem(); break;
    default: inner = `<p class="small muted">Patient transmis depuis Gestion. Choisissez un module.</p><div class="modgrid">${mods.map(m => `<button class="modtile" data-act="cbmod" data-k="${m[0]}"><b>${m[1]}</b><small>${m[2]}</small>${P.saved[m[0] === 'fit' ? 'fit' : m[0]] ? '<span class="tag ok">Sauvegardé</span>' : ''}</button>`).join('')}</div>
      <p class="small muted">Touche S ou bouton Sauvegarder dans chaque module : sans sauvegarde, rien ne remonte dans le dossier.</p>`;
  }
  const tools = `<button class="btn small" data-act="cbsound" aria-pressed="${CAB_SOUND}">${CAB_SOUND ? 'Son activé' : 'Son coupé'}</button>`;
  return cabWin('n', esc(P.cs.name), P.cs.ageTxt + ' · dossier ' + P.cs.seed, nav + `<div class="stack">${inner}</div>`, tools);
}
ACT.cbmod = a => { CAB.P.nmod = a.dataset.k; renderView(); };
ACT.cbsound = () => { CAB_SOUND = !CAB_SOUND; Store.set('cabSound', CAB_SOUND); renderView(); };
function cabSave(mod) {
  const P = CAB.P;
  if (mod === 'tonal') { if (!P.aud.R.ac.some(v => v != null) && !P.aud.L.ac.some(v => v != null)) { toast('Aucun seuil à sauvegarder'); return; } P.saved.tonal = true; }
  if (mod === 'vocal') { if (!P.voc.pts.R.length && !P.voc.pts.L.length) { toast('Aucun point vocal à sauvegarder'); return; } P.saved.vocal = true; }
  if (mod === 'fit') { if (!P.fit.device || !P.fit.ears) { toast('Choisissez d’abord l’appareil et le côté'); return; } P.saved.fit = true; P.savedFit = JSON.stringify({ R: P.fit.R, L: P.fit.L }); }
  if (mod === 'rem') { if (!P.rem.meas.R && !P.rem.meas.L) { toast('Aucune mesure à sauvegarder'); return; } P.saved.rem = true; }
  toast('Sauvegardé dans le dossier patient');
  renderView();
}
ACT.cbsave = a => cabSave(a.dataset.k);

/* ---------- Audio : audiométrie tonale ---------- */
function cabCursor(svg, T) {
  const x0 = 40, y0 = 30, w = 300, h = 285;
  const yD = d => y0 + (d + 10) / 140 * h;
  const x = xF(F[T.fi], x0, w) + (T.tr === 'CO' ? (T.ear === 'R' ? -9 : 9) : 0), y = yD(T.lvl);
  const col = T.ear === 'R' ? 'var(--right)' : 'var(--left)';
  const c = `<line x1="${x}" x2="${x}" y1="${y0}" y2="${y0 + h}" stroke="${col}" stroke-width="1" opacity=".35"/><line x1="${x0}" x2="${x0 + w}" y1="${y}" y2="${y}" stroke="${col}" stroke-width="1" opacity=".35"/><circle cx="${x}" cy="${y}" r="9" fill="none" stroke="${col}" stroke-width="1.5" stroke-dasharray="3 2"/>`;
  return svg.replace('</svg>', c + '</svg>');
}
function cabMaskMarks(svg, P) {
  const x0 = 40, y0 = 30, w = 300, h = 285, yD = d => y0 + (d + 10) / 140 * h;
  let m = '';
  ['R', 'L'].forEach(s => {
    const a = P.aud[s], col = s === 'R' ? 'var(--right)' : 'var(--left)';
    a.ac.forEach((v, i) => { if (v != null && a.acM[i] != null) m += `<text x="${xF(F[i], x0, w) + 7}" y="${yD(v) - 7}" class="ag-t" fill="${col}" style="fill:${col}">m</text>`; });
    a.bc.forEach((v, i) => { if (v != null && a.bcM[i] != null) m += `<text x="${xF(F[i], x0, w) + (s === 'R' ? -20 : 14)}" y="${yD(v) - 7}" class="ag-t" style="fill:${col}">m</text>`; });
  });
  return svg.replace('</svg>', m + '</svg>');
}
function cabTonal() {
  const P = CAB.P, T = P.ton;
  const svg = cabCursor(cabMaskMarks(audiogramSVG(cabAudObj(P)), P), T);
  const o = sideShort(T.ear === 'R' ? 'L' : 'R');
  const status = `<div class="adisp mono" aria-live="polite">
    <span class="${T.ear === 'R' ? 'r' : 'l'}">${T.ear === 'R' ? 'OD' : 'OG'} ${T.tr}</span><span>${fLabel(F[T.fi])} Hz</span><b>${T.lvl} dB</b>
    <span class="lamp${T.stim ? ' stim' : ''}" title="Son envoyé"><i></i>son</span><span class="lamp${T.resp === true ? ' resp' : ''}" title="Réponse du patient"><i></i>rép.</span></div>`;
  const say = T.say ? `<p class="patsay">${esc(T.say)}</p>` : '';
  const k = (key, lab, act, extra = '', cls = '') => `<button class="key ${cls}" data-act="${act}" ${extra}><b>${key}</b><small>${lab}</small></button>`;
  const pad = `<div class="kpad k6">
    ${k('D', 'droite', 'cbtk', 'data-k="d"', T.ear === 'R' ? 'on r' : '')}${k('G', 'gauche', 'cbtk', 'data-k="g"', T.ear === 'L' ? 'on l' : '')}
    ${k('O', T.tr === 'CA' ? '→ CO' : '→ CA', 'cbtk', 'data-k="o"')}${k('F', 'micro', 'cbtk', 'data-k="f"', T.micOpen ? 'on' : '')}
    ${k('↑', '+5 dB', 'cbtk', 'data-k="ArrowUp"')}${k('↓', '−5 dB', 'cbtk', 'data-k="ArrowDown"')}
    ${k('←', 'fréq.', 'cbtk', 'data-k="ArrowLeft"')}${k('→', 'fréq.', 'cbtk', 'data-k="ArrowRight"')}
    ${k('Espace', 'envoyer', 'cbtk', 'data-k=" "', 'wide2 send')}${k('Entrée', 'noter', 'cbtk', 'data-k="Enter"', 'wide2')}
    ${k('M', T.mask ? 'masque ' + o + ' ' + T.mlvl : 'masque ' + o, 'cbtk', 'data-k="m"', T.mask ? 'on mk wide2' : 'wide2')}${k('Pg↓', 'masque −5', 'cbtk', 'data-k="PageDown"')}${k('Pg↑', 'masque +5', 'cbtk', 'data-k="PageUp"')}
    ${k('N', 'pas de rép.', 'cbtk', 'data-k="n"')}${k('Suppr', 'effacer', 'cbtk', 'data-k="Delete"')}
  </div>`;
  const mic = T.micOpen ? `<div class="card mic"><h3>Micro (parler au patient)</h3><div class="opts">
    <button class="opt" data-act="cbsay" data-k="instr">« Vous allez entendre des sons, parfois très faibles. Dès que vous entendez, même tout petit, appuyez sur le bouton. »</button>
    <button class="opt" data-act="cbsay" data-k="mask">« Vous allez entendre un souffle dans l’autre oreille. Ne vous en occupez pas, répondez seulement aux bips. »</button>
    <button class="opt" data-act="cbsay" data-k="ear">« On passe à l’autre oreille, même consigne. »</button></div></div>` : '';
  return `<div class="agwrap">${svg}</div>${agLegend()}${mic}<div class="kdock">${status}${say}${pad}</div>
    <div class="row gap wrap"><button class="btn primary" data-act="cbsave" data-k="tonal">Sauvegarder (S)</button><span class="small muted">${P.saved.tonal === true ? 'Dernière sauvegarde dans le dossier ✓' : 'Pas encore sauvegardé'}</span></div>
    <details class="fiche"><summary>Raccourcis clavier</summary><div class="fbody small">Espace : envoyer le son · ↑ ↓ : niveau · ← → : fréquence · D / G : oreille · O : CA ou CO · M : masquage · Page↑ / Page↓ : niveau du masque · Entrée : noter le seuil · N : pas de réponse · F : micro · S : sauvegarder · Ctrl+Maj (ou Win+Maj) : changer d’application.</div></details>`;
}
ACT.cbmask = a => { cabTonKey(a.checked !== CAB.P.ton.mask ? 'm' : ''); };
ACT.cbtk = a => cabTonKey(a.dataset.k);
ACT.cbsay = a => {
  const T = CAB.P.ton, k = a.dataset.k;
  if (k === 'instr') { T.instr = true; T.say = 'Patient : « D’accord, j’appuie dès que j’entends. »'; }
  if (k === 'mask') { T.minstr = true; T.say = 'Patient : « Le souffle, je l’ignore. Compris. »'; }
  if (k === 'ear') { T.say = 'Patient : « Très bien. »'; }
  T.micOpen = false; renderView();
};
function cabTonKey(key) {
  const P = CAB.P, T = P.ton;
  const maxL = () => T.tr === 'CA' ? CAB_ACMAX[T.fi] : BC_MAX[T.fi];
  switch (key) {
    case ' ': cabPresent(); return;
    case 'ArrowUp': T.lvl = Math.min(T.lvl + 5, maxL()); break;
    case 'ArrowDown': T.lvl = Math.max(T.lvl - 5, -10); break;
    case 'ArrowLeft': case 'ArrowRight': {
      const lim = T.tr === 'CO' ? NBC - 1 : F.length - 1;
      T.fi = clamp(T.fi + (key === 'ArrowLeft' ? -1 : 1), 0, lim); T.lvl = Math.min(T.lvl, maxL()); break;
    }
    case 'd': case 'D': if (T.ear !== 'R') { T.ear = 'R'; T.say = ''; } break;
    case 'g': case 'G': if (T.ear !== 'L') { T.ear = 'L'; T.say = ''; } break;
    case 'o': case 'O': T.tr = T.tr === 'CA' ? 'CO' : 'CA'; if (T.tr === 'CO' && T.fi >= NBC) T.fi = NBC - 1; T.lvl = Math.min(T.lvl, maxL()); break;
    case 'm': case 'M': T.mask = !T.mask; break;
    case 'PageUp': T.mlvl = Math.min(T.mlvl + 5, 110); break;
    case 'PageDown': T.mlvl = Math.max(T.mlvl - 5, 0); break;
    case 'f': case 'F': T.micOpen = !T.micOpen; break;
    case 'Enter': cabStore(false); return;
    case 'n': case 'N': cabStore(true); return;
    case 'Delete': case 'Backspace': {
      const a = P.aud[T.ear];
      if (T.tr === 'CA') { a.ac[T.fi] = null; a.acNR[T.fi] = false; a.acM[T.fi] = null; } else { a.bc[T.fi] = null; a.bcNR[T.fi] = false; a.bcM[T.fi] = null; }
      break;
    }
    case 's': case 'S': cabSave('tonal'); return;
    default: return;
  }
  renderView();
}
function cabPresent() {
  const P = CAB.P, T = P.ton;
  if (T.busy) return;
  if (P.otoBefore == null) P.otoBefore = P.kind === 'controle' || (P.oto.R && P.oto.L);
  T.busy = true; T.n++; T.stim = true; T.resp = null; T.say = '';
  cabBeep(F[T.fi], T.ear, T.lvl);
  const rng = P.rng;
  let resp = false, say = '';
  if (!T.instr) { say = 'Patient : « Euh… je dois faire quoi, exactement ? » (donnez la consigne au micro, touche F)'; }
  else {
    const th = cabThreshold(P, T.ear, T.tr, T.fi, T.mask, T.mlvl);
    const p = 1 / (1 + Math.exp(-(T.lvl - th.thr + 1.5) / 1.6));
    resp = rng.f() < p || rng.f() < 0.02;
    if (T.tr === 'CO' && T.fi < 2 && T.lvl >= CAB_VT[T.fi]) { resp = true; say = 'Patient : « Je ne sais pas si j’entends… je sens que ça vibre. »'; }
    if (T.mask && !T.minstr && rng.f() < 0.6) { resp = true; say = 'Patient : « J’entends un souffle de l’autre côté, je dois appuyer ? »'; }
    if (T.lvl >= 100 && resp && rng.f() < 0.5) say = 'Patient : « Oh, c’est fort ! »';
  }
  cabRender();
  setTimeout(() => { T.resp = resp; T.say = say; cabRender(); }, 350 + rng.f() * 450);
  setTimeout(() => { T.stim = false; cabRender(); }, 1000);
  setTimeout(() => { T.resp = null; T.busy = false; cabRender(); }, 1500);
}
function cabStore(nr) {
  const P = CAB.P, T = P.ton, a = P.aud[T.ear];
  if (T.tr === 'CA') { a.ac[T.fi] = nr ? CAB_ACMAX[T.fi] : T.lvl; a.acNR[T.fi] = nr; a.acM[T.fi] = T.mask ? T.mlvl : null; }
  else { if (T.fi >= NBC) { toast('La CO se mesure de 250 à 4000 Hz'); return; } a.bc[T.fi] = nr ? BC_MAX[T.fi] : T.lvl; a.bcNR[T.fi] = nr; a.bcM[T.fi] = T.mask ? T.mlvl : null; }
  toast(`${sideShort(T.ear)} ${T.tr} ${fLabel(F[T.fi])} Hz : ${nr ? 'pas de réponse' : T.lvl + ' dB'}${T.mask ? ' (masqué ' + T.mlvl + ' dB)' : ''}`);
  renderView();
}

/* ---------- Audio : audiométrie vocale ---------- */
function cabPIntell(cs, s, L, list) {
  const sp = cs.speech[s];
  if (!sp || sp.srt == null || !sp.max) return 0;
  const mx = sp.max / 100, k = list === 'lafon' ? 6 : 4.5;
  const srt = sp.srt + (list === 'lafon' ? 5 : 0);
  let c = srt;
  if (mx > 0.5) { const q = 0.5 / mx; c = srt - k * Math.log(q / (1 - q)); }
  let p = mx / (1 + Math.exp(-(L - c) / k));
  if (cs.patho.site === 'retro' && L > srt + 30) p *= Math.max(0.2, 1 - (L - srt - 30) * 0.025);
  return clamp(p, 0, 1);
}
function cabPVocal(P, s, L, list, mask, mlvl) {
  const cs = P.cs, o = s === 'R' ? 'L' : 'R', IA = 45;
  let Ls = L, Lo = L - IA;
  if (mask) {
    const Nc = mlvl - IA;                                  // bruit qui repasse vers l'oreille testée
    if (Nc > Ls - 15) Ls -= (Nc - (Ls - 15)) * 2;          // surmasquage
    Lo -= Math.max(0, mlvl - Lo + 10) * 2;                 // oreille opposée occupée par le bruit
  }
  const ps = cabPIntell(cs, s, Ls, list);
  const po = cabPIntell(cs, o, Lo, list);
  return Math.max(ps, po);
}
function cabDistort(w, rng) {
  const pos = [];
  for (let i = 0; i < w.length; i++) if (CAB_CONF[w[i]]) pos.push(i);
  if (!pos.length || rng.f() < 0.15) return rng.f() < 0.5 ? '… (pas de réponse)' : w.slice(0, -1) + '…';
  const i = rng.pick(pos);
  const r = w.slice(0, i) + CAB_CONF[w[i]] + w.slice(i + 1);
  return r === w ? w + 'e' : r;
}
function cabVocal() {
  const P = CAB.P, V = P.voc, R = V.run;
  const status = `<div class="adisp mono"><span class="${V.ear === 'R' ? 'r' : 'l'}">${V.ear === 'R' ? 'OD' : 'OG'}</span><span>${V.list === 'lafon' ? 'Lafon' : 'Fournier'} n°${V.listNo[V.list]}</span><b>${V.lvl} dB</b>${V.mask ? `<span>bruit ${V.mlvl}</span>` : ''}</div>`;
  let live = '';
  if (R && !R.done) {
    const w = R.items[R.i];
    live = `<div class="card vword"><div class="vpair"><span class="small muted vnum">Mot ${R.i + 1}/${R.items.length}</span><div><small>Liste</small><b>${esc(w.w)}</b></div><div><small>Le patient répète</small><b>« ${esc(w.said)} »</b></div></div></div>`;
  } else if (R && R.done) {
    live = `<div class="card vword"><span class="small muted">Liste terminée · ${sideShort(R.ear)} · ${R.lvl} dB${R.mask ? ' · masqué ' + R.mlvl + ' dB' : ''}</span><div class="vscore mono">${R.pct} %</div>
      ${R.placed ? '<p class="small">Point placé sur l’audiogramme vocal.</p>' : `<button class="btn primary" data-act="cbvk" data-k="Enter">Placer le point (Entrée ou Ctrl+clic sur le graphe)</button>`}</div>`;
  }
  const k = (key, lab, extra, cls = '') => `<button class="key ${cls}" data-act="cbvk" ${extra}><b>${key}</b><small>${lab}</small></button>`;
  const busy = R && !R.done;
  const pad = `<div class="kpad k6">
    ${k('D', 'droite', 'data-k="d"', V.ear === 'R' ? 'on r' : '')}${k('G', 'gauche', 'data-k="g"', V.ear === 'L' ? 'on l' : '')}
    ${k('←', 'liste', 'data-k="ArrowLeft"')}${k('→', 'liste', 'data-k="ArrowRight"')}${k('↑', '+5 dB', 'data-k="ArrowUp"')}${k('↓', '−5 dB', 'data-k="ArrowDown"')}
    ${k('F5', 'lancer', 'data-k="F5"', 'wide2' + (busy ? '' : ' send'))}${k('+', 'juste', 'data-k="+"', 'wide2 kok')}${k('−', 'erreur', 'data-k="-"', 'wide2 kbad')}
    ${k('M', V.mask ? 'bruit ' + V.mlvl : 'bruit opp.', 'data-k="m"', V.mask ? 'on mk' : '')}${k('Pg↓', '−5', 'data-k="PageDown"')}${k('Pg↑', '+5', 'data-k="PageUp"')}${k('Entrée', 'placer', 'data-k="Enter"', 'wide2' + (R && R.done && !R.placed ? ' send' : ''))}${k('S', 'sauver', 'data-k="s"')}
  </div>`;
  return `<div class="agwrap" data-act="cbvchart">${cabSpeechSVG(P)}</div>
    <div class="legend"><span class="lg"><span class="sw" style="background:var(--right)"></span>Droite</span><span class="lg"><span class="sw" style="background:var(--left)"></span>Gauche</span><span class="lg"><span class="sw tg"></span>Normo-entendant</span></div>
    <div class="kdock">${status}${live}${pad}</div>
    <div class="row gap wrap"><button class="btn primary" data-act="cbsave" data-k="vocal">Sauvegarder (S)</button><button class="btn small" data-act="cbvk" data-k="Delete">Retirer le dernier point</button><span class="small muted">${P.saved.vocal ? 'Sauvegardé ✓' : ''}</span></div>
    <details class="fiche"><summary>Rappel méthode</summary><div class="fbody small">Commencez environ 30 dB au-dessus de la moyenne tonale, puis descendez pour encadrer le seuil d’intelligibilité (50 %) et montez pour chercher le maximum. Listes type Lafon (monosyllabes, plus sensibles à la distorsion cochléaire) ou type Fournier (dissyllabes, plus faciles). Masquez l’oreille opposée si le niveau dépasse d’environ 45 dB sa conduction osseuse. Mots d’entraînement générés : ce ne sont pas les listes officielles.</div></details>`;
}
ACT.cbvk = a => cabVocKey(a.dataset.k);
ACT.cbvmask = () => cabVocKey('m');
ACT.cbvchart = (a, e) => { if (e.ctrlKey || e.metaKey) cabVocKey('Enter'); };
function cabVocKey(key) {
  const P = CAB.P, V = P.voc, R = V.run;
  const busy = R && !R.done;
  switch (key) {
    case 'F5': cabStartList(); return;
    case '+': case '-': case '−': {
      if (!busy) return;
      const it = R.items[R.i], mark = key === '+';
      it.mark = mark; V.judged++; if (mark !== it.ok) V.wrong++;
      R.i++;
      if (R.i >= R.items.length) { R.done = true; R.pct = Math.round(R.items.filter(x => x.mark).length / R.items.length * 100); V.listNo[R.list]++; }
      break;
    }
    case 'Enter': {
      if (!R || !R.done || R.placed) return;
      V.pts[R.ear].push({ lvl: R.lvl, pct: R.pct, list: R.list, mask: R.mask ? R.mlvl : null, truth: Math.round(R.items.filter(x => x.ok).length / R.items.length * 100) });
      V.pts[R.ear].sort((x, y) => x.lvl - y.lvl);
      R.placed = true; toast('Point placé'); break;
    }
    case 'Delete': { const arr = V.pts[V.ear]; if (arr.length) { arr.pop(); toast('Dernier point retiré'); } break; }
    case 'ArrowUp': if (!busy) V.lvl = Math.min(V.lvl + 5, 120); break;
    case 'ArrowDown': if (!busy) V.lvl = Math.max(V.lvl - 5, 0); break;
    case 'ArrowLeft': case 'ArrowRight': if (!busy) V.list = V.list === 'lafon' ? 'fournier' : 'lafon'; break;
    case 'd': case 'D': if (!busy) V.ear = 'R'; break;
    case 'g': case 'G': if (!busy) V.ear = 'L'; break;
    case 'm': case 'M': if (!busy) V.mask = !V.mask; break;
    case 'PageUp': V.mlvl = Math.min(V.mlvl + 5, 100); break;
    case 'PageDown': V.mlvl = Math.max(V.mlvl - 5, 0); break;
    case 's': case 'S': cabSave('vocal'); return;
    default: return;
  }
  renderView();
}
function cabStartList() {
  const P = CAB.P, V = P.voc;
  if (V.run && !V.run.done) { toast('Terminez la liste en cours (+ ou −)'); return; }
  const rng = P.rng, bank = V.list === 'lafon' ? W_LAFON : W_FOURN;
  const p = cabPVocal(P, V.ear, V.lvl, V.list, V.mask, V.mlvl);
  const items = rng.shuffle(bank).slice(0, 10).map(w => { const ok = rng.f() < p; return { w, ok, said: ok ? w : cabDistort(w, rng), mark: null }; });
  V.run = { ear: V.ear, lvl: V.lvl, list: V.list, mask: V.mask, mlvl: V.mlvl, items, i: 0, done: false, pct: null, placed: false };
  if (V.lvl >= 105) toast('Patient : « C’est très fort, ça me gêne. »');
  renderView();
}
function cabSpeechRes(pts) {
  if (!pts || !pts.length) return null;
  const s = pts.slice().sort((a, b) => a.lvl - b.lvl);
  let srt = null;
  for (let i = 0; i < s.length; i++) {
    if (s[i].pct >= 50) { srt = i === 0 ? s[0].lvl : Math.round(s[i - 1].lvl + (50 - s[i - 1].pct) / Math.max(1, s[i].pct - s[i - 1].pct) * (s[i].lvl - s[i - 1].lvl)); break; }
  }
  const max = Math.max(...s.map(x => x.pct));
  const iMax = s.findIndex(x => x.pct === max);
  const roll = s.slice(iMax + 1).some(x => x.pct <= max - 20);
  return { srt, max, roll, n: s.length };
}
function cabSpeechSVG(P) {
  const W = 360, H = 230, x0 = 40, y0 = 14, w = 300, h = 180;
  const x = L => x0 + L / 120 * w, y = p => y0 + h - p / 100 * h;
  let s = `<svg class="ag" viewBox="0 0 ${W} ${H}" role="img" aria-label="Audiogramme vocal">`;
  for (let L = 0; L <= 120; L += 10) { s += `<line x1="${x(L)}" x2="${x(L)}" y1="${y0}" y2="${y0 + h}" class="ag-g"/>`; if (L % 20 === 0) s += `<text x="${x(L)}" y="${y0 + h + 14}" class="ag-t" text-anchor="middle">${L}</text>`; }
  for (let p = 0; p <= 100; p += 25) { s += `<line x1="${x0}" x2="${x0 + w}" y1="${y(p)}" y2="${y(p)}" class="${p === 50 ? 'ag-g20' : 'ag-g'}"/><text x="${x0 - 6}" y="${y(p) + 3}" class="ag-t" text-anchor="end">${p}</text>`; }
  s += `<text x="${x0 + w}" y="${H - 2}" class="ag-t" text-anchor="end">dB</text><text x="4" y="${y0 + 4}" class="ag-t">%</text>`;
  const norm = [];
  for (let L = 0; L <= 60; L += 2) norm.push(x(L) + ',' + y(100 / (1 + Math.exp(-(L - 15) / 4))));
  s += `<polyline points="${norm.join(' ')}" fill="none" stroke="var(--muted)" stroke-width="1" stroke-dasharray="4 3"/>`;
  ['R', 'L'].forEach(e => {
    const pts = P.voc.pts[e]; if (!pts.length) return;
    const col = e === 'R' ? 'var(--right)' : 'var(--left)';
    if (pts.length > 1) s += `<polyline points="${pts.map(p => x(p.lvl) + ',' + y(p.pct)).join(' ')}" fill="none" stroke="${col}" stroke-width="1.6" ${e === 'L' ? 'stroke-dasharray="5 3"' : ''}/>`;
    pts.forEach(p => { s += e === 'R' ? `<circle cx="${x(p.lvl)}" cy="${y(p.pct)}" r="5" fill="var(--surface)" stroke="${col}" stroke-width="1.8"/>` : `<path d="M${x(p.lvl) - 5} ${y(p.pct) - 5}L${x(p.lvl) + 5} ${y(p.pct) + 5}M${x(p.lvl) + 5} ${y(p.pct) - 5}L${x(p.lvl) - 5} ${y(p.pct) + 5}" stroke="${col}" stroke-width="1.8"/>`; });
  });
  const V = P.voc;
  if (CAB.app === 'noah') s += `<line x1="${x(V.lvl)}" x2="${x(V.lvl)}" y1="${y0}" y2="${y0 + h}" stroke="${V.ear === 'R' ? 'var(--right)' : 'var(--left)'}" stroke-dasharray="3 3" opacity=".5"/>`;
  return s + '</svg>';
}

/* ---------- Audio : logiciel fabricant ---------- */
function cabFit() {
  const P = CAB.P, Ft = P.fit, cs = P.cs;
  if (!Ft.brand) return `<p class="small muted">Choisissez le logiciel du fabricant.</p><div class="modgrid">${CAB_BRANDS.map(b => `<button class="modtile" data-act="cbfit" data-name="brand" data-val="${b}"><b>${b}</b><small>logiciel de réglage</small></button>`).join('')}</div>`;
  const sides = cabSides(Ft);
  let html = `<p class="eyebrow">Logiciel ${Ft.brand}${P.kind === 'controle' ? ' · appareils lus' : ''}</p>`;
  html += `<section class="card"><h3>Côté(s) appareillé(s)</h3>${chipGroup('ears', [{ v: 'R', l: 'Droite' }, { v: 'L', l: 'Gauche' }, { v: 'both', l: 'Les deux' }], Ft.ears, 'cbfit')}
    <h4>Appareil</h4><div class="opts dev">${DEVICES.map(d => `<button class="opt${Ft.device === d.k ? ' on' : ''}" data-act="cbfit" data-name="device" data-val="${d.k}">${esc(d.l)}<small>gain max ≈ ${d.cap} dB</small></button>`).join('')}</div></section>`;
  if (!sides.length || !Ft.device) return html;
  if (!sides.includes(Ft.cur)) Ft.cur = sides[0];
  const s = Ft.cur, fs = Ft[s], t = P.targets[s];
  html += `<div class="eartabs">${sides.map(e => `<button class="eartab ${e === 'R' ? 'r' : 'l'}${Ft.cur === e ? ' on' : ''}" data-act="cbfit" data-name="cur" data-val="${e}">${e === 'R' ? 'Droite' : 'Gauche'}</button>`).join('')}</div>
  <section class="card"><h3>Couplage ${sideShort(s)}</h3>${chipGroup('vent', VENTS.map(v => ({ v: v.k, l: v.l })), fs.vent, 'cbfit')}
    <span class="flab">Support</span>${chipGroup('support', [{ v: 'dome', l: 'Dôme standard' }, { v: 'embout', l: 'Embout sur mesure' }], fs.support, 'cbfit')}</section>`;
  if (!fs.vent || !fs.support) return html + '<p class="small muted">Choisissez le couplage pour continuer.</p>';
  if (!Ft.first) {
    return html + `<section class="card"><h3>Premier réglage</h3><p class="small">Formule de préréglage : NAL-NL2 (approximation). Niveau d’adaptation :</p>
      ${chipGroup('adapt', [{ v: '1', l: 'Niveau 1 (−6 dB)' }, { v: '2', l: 'Niveau 2 (−3 dB)' }, { v: '3', l: 'Niveau 3 (cible)' }], String(Ft.adapt), 'cbfit')}
      <button class="btn primary" data-act="cbfirst">Calculer le premier réglage</button></section>`;
  }
  const L = Ft.level;
  const key = L === 'mpo' ? 'mpo' : 'g' + L;
  const tgt = i => L === 'mpo' ? t.mpo[i] : t[L][i] - ventOf(fs.vent).loss[i];
  const cell = i => { const v = fs[key][i], d = v - tgt(i); const c = Math.abs(d) <= 3 ? 'ok' : Math.abs(d) <= 6 ? 'warn' : 'bad'; return `<div class="fd"><span class="fd-f mono">${fLabel(CH[i])}</span><button data-act="cbg" data-i="${i}" data-d="1" aria-label="plus">▲</button><output class="mono ${c}">${v}</output><button data-act="cbg" data-i="${i}" data-d="-1" aria-label="moins">▼</button><small class="mono muted">${tgt(i)}</small></div>`; };
  const g = { 50: fs.g50, 65: fs.g65, 80: fs.g80 };
  html += `<section class="card fitpanel"><h3 class="eartitle ${s === 'R' ? 'r' : 'l'}">Réglage ${sideName(s)}</h3>
    <div class="lvtabs" style="grid-template-columns:repeat(4,1fr)">${[[50, 'G50 faibles'], [65, 'G65 moyens'], [80, 'G80 forts'], ['mpo', 'MPO']].map(([v, l]) => `<button class="lvtab${String(L) === String(v) ? ' on' : ''}" data-act="cbfit" data-name="level" data-val="${v}">${l}</button>`).join('')}</div>
    <div class="faders cbcells">${CH.map((f, i) => cell(i)).join('')}</div>
    <p class="small muted">Chiffre du bas : valeur visée par le logiciel. Pas de 1 dB.</p>
    <div class="row gap wrap"><button class="btn small" data-act="cbgall" data-d="-2">Tout −2</button><button class="btn small" data-act="cbgall" data-d="2">Tout +2</button></div>
    ${gainSVG({ chF: CH, g, t: L === 'mpo' ? null : t, eff65: effGain(fs, 65), msg: msgOf(fs), mode: L === 'mpo' ? 65 : L })}
    <div class="legend"><span class="lg"><span class="sw g50"></span>G50</span><span class="lg"><span class="sw g65"></span>G65</span><span class="lg"><span class="sw g80"></span>G80</span><span class="lg"><span class="sw tg"></span>cible</span><span class="lg"><span class="sw eff"></span>G65 après évent</span></div>
    ${CH.some((f, i) => i >= 3 && fs.g50[i] > msgOf(fs)) ? '<p class="fb bad">Risque de larsen : le gain aigu dépasse la limite de stabilité du couplage.</p>' : ''}</section>
    <div class="row gap wrap"><button class="btn primary" data-act="cbsave" data-k="fit">Sauvegarder (S)</button><button class="btn" data-act="cbmod" data-k="rem">Vérifier en mesure in vivo</button><span class="small muted">${P.saved.fit ? 'Sauvegardé ✓' : ''}</span></div>`;
  return html;
}
ACT.cbfit = a => {
  const P = CAB.P, Ft = P.fit, n = a.dataset.name, v = a.dataset.val;
  if (n === 'vent' || n === 'support') Ft[Ft.cur][n] = v;
  else if (n === 'level') Ft.level = v === 'mpo' ? 'mpo' : +v;
  else if (n === 'adapt') Ft.adapt = +v;
  else Ft[n] = v;
  if (n === 'ears' && !cabSides(Ft).includes(Ft.cur)) Ft.cur = cabSides(Ft)[0];
  renderView();
};
ACT.cbfirst = () => {
  const P = CAB.P, Ft = P.fit, d = [0, -6, -3, 0][Ft.adapt];
  for (const s of cabSides(Ft)) if (!Ft[s].vent || !Ft[s].support) { Ft.cur = s; toast('Choisissez aussi le couplage de l’oreille ' + sideName(s)); renderView(); return; }
  cabSides(Ft).forEach(s => { const fs = Ft[s], t = P.targets[s], v = ventOf(fs.vent); [50, 65, 80].forEach(L => { fs['g' + L] = t[L].map((g, i) => clamp(Math.round(g - v.loss[i] + d), 0, 90)); }); fs.mpo = t.mpo.slice(); });
  Ft.first = true; toast('Premier réglage appliqué'); renderView();
};
ACT.cbg = a => { const P = CAB.P, fs = P.fit[P.fit.cur], k = P.fit.level === 'mpo' ? 'mpo' : 'g' + P.fit.level, i = +a.dataset.i; fs[k][i] = clamp(fs[k][i] + (+a.dataset.d), k === 'mpo' ? 80 : 0, k === 'mpo' ? 135 : 90); renderView(); };
ACT.cbgall = a => { const P = CAB.P, fs = P.fit[P.fit.cur], k = P.fit.level === 'mpo' ? 'mpo' : 'g' + P.fit.level; fs[k] = fs[k].map(v => clamp(v + (+a.dataset.d), k === 'mpo' ? 80 : 0, k === 'mpo' ? 135 : 90)); renderView(); };

/* ---------- Audio : mesure in vivo ---------- */
function cabReig(P, s) {
  const fs = P.fit[s], probe = P.rem.probe[s], e = effGain(fs, 65), rng = P.rng;
  return CH.map((f, i) => {
    let v = e[i] + P.off[s][i] + rng.gauss(0, 1);
    if (probe === 'entree' && i >= 4) v -= [0, 0, 0, 0, 6, 9, 14][i];
    return Math.round(v);
  });
}
function cabRem() {
  const P = CAB.P, Ft = P.fit, sides = cabSides(Ft);
  if (!Ft.first || !sides.length) return '<p class="small muted">Faites d’abord le premier réglage dans le logiciel fabricant.</p>';
  if (!sides.includes(P.rem.cur)) P.rem.cur = sides[0];
  const s = P.rem.cur, m = P.rem.meas[s], t = P.targets[s][65];
  const probe = P.rem.probe[s];
  let html = `<div class="eartabs">${sides.map(e => `<button class="eartab ${e === 'R' ? 'r' : 'l'}${s === e ? ' on' : ''}" data-act="cbrem" data-name="cur" data-val="${e}">${e === 'R' ? 'Droite' : 'Gauche'}</button>`).join('')}</div>
  <section class="card"><h3>1. Sonde ${sideShort(s)}</h3><p class="small muted">Otoscopie faite, tube sonde étalonné. Où placez-vous l’extrémité du tube ?</p>
  ${chipGroup('probe', [{ v: 'entree', l: 'À l’entrée du conduit' }, { v: 'ok', l: 'À environ 5 mm du tympan' }, { v: 'contact', l: 'Au contact du tympan' }], probe, 'cbrem')}
  ${probe === 'contact' ? '<p class="fb bad">Le patient sursaute : douleur et risque de lésion. Retirez et replacez la sonde à distance du tympan.</p>' : ''}</section>`;
  if (!probe || probe === 'contact') return html;
  html += `<section class="card"><h3>2. Mesure</h3><p class="small">Signal de parole international, 65 dB SPL, haut-parleur à 1 m, 0°.</p><button class="btn primary" data-act="cbmeasure">Mesurer le gain réel (REIG)</button>`;
  if (m) {
    const ok = [1, 2, 3, 5].filter(i => Math.abs(m[i] - t[i]) <= 5).length;
    html += cabRemSVG(m, t, effGain(P.fit[s], 65)) + `<div class="legend"><span class="lg"><span class="sw" style="background:${s === 'R' ? 'var(--right)' : 'var(--left)'}"></span>Mesuré</span><span class="lg"><span class="sw tg"></span>Cible ±5 dB</span><span class="lg"><span class="sw eff"></span>Prévu par le logiciel</span></div>
    <div class="tscroll"><table class="tbl"><thead><tr><th></th>${CH.map(f => `<th>${fLabel(f)}</th>`).join('')}</tr></thead><tbody>
    <tr><th>Cible</th>${t.map(v => `<td>${v}</td>`).join('')}</tr><tr><th>Mesuré</th>${m.map(v => `<td>${v}</td>`).join('')}</tr>
    <tr><th>Écart</th>${m.map((v, i) => { const d = v - t[i]; return `<td class="${Math.abs(d) <= 5 ? 'ok' : Math.abs(d) <= 8 ? 'warn' : 'bad'}">${d > 0 ? '+' : ''}${d}</td>`; }).join('')}</tr></tbody></table></div>
    ${CH.some((f, i) => i >= 3 && P.fit[s].g50[i] > msgOf(P.fit[s])) ? '<p class="fb bad">Attention : avec ce couplage, le gain aigu pour les sons faibles dépasse la limite de stabilité (larsen).</p>' : ''}
    <p class="small">${ok}/4 fréquences clés (500, 1k, 2k, 4k) à ±5 dB de la cible. ${ok < 4 ? 'Corrigez dans le logiciel fabricant puis remesurez.' : 'Réglage vérifié.'}</p>`;
  }
  html += `</section><div class="row gap wrap"><button class="btn" data-act="cbmod" data-k="fit">Retour au réglage</button><button class="btn primary" data-act="cbsave" data-k="rem">Sauvegarder (S)</button><span class="small muted">${P.saved.rem ? 'Sauvegardé ✓' : ''}</span></div>`;
  return html;
}
ACT.cbrem = a => { const R = CAB.P.rem; if (a.dataset.name === 'cur') R.cur = a.dataset.val; else { R.probe[R.cur] = a.dataset.val; R.meas[R.cur] = null; } renderView(); };
ACT.cbmeasure = () => { const P = CAB.P, s = P.rem.cur; P.rem.meas[s] = cabReig(P, s); P.rem.measProbe = P.rem.measProbe || {}; P.rem.measProbe[s] = P.rem.probe[s]; P.rem.n++; P.rem.fitAt = P.rem.fitAt || {}; P.rem.fitAt[s] = JSON.stringify(P.fit[s]); renderView(); };
function cabRemSVG(m, t, soft) {
  const W = 360, H = 210, x0 = 34, y0 = 12, w = 314, h = 170;
  const fx = f => x0 + Math.log2(f / 200) / Math.log2(7000 / 200) * w;
  const top = Math.max(60, Math.ceil((Math.max(...m, ...t) + 10) / 10) * 10);
  const gy = g => y0 + h - clamp(g, -10, top) / top * h;
  let s = `<svg class="ag" viewBox="0 0 ${W} ${H}" role="img" aria-label="Mesure in vivo">`;
  for (let g = 0; g <= top; g += 10) s += `<line x1="${x0}" x2="${x0 + w}" y1="${gy(g)}" y2="${gy(g)}" class="ag-g"/><text x="${x0 - 5}" y="${gy(g) + 3}" class="ag-t" text-anchor="end">${g}</text>`;
  CH.forEach(f => { s += `<text x="${fx(f)}" y="${H - 4}" class="ag-t" text-anchor="middle">${fLabel(f)}</text>`; });
  const band = t.map((g, i) => fx(CH[i]) + ',' + gy(g + 5)).join(' ') + ' ' + t.slice().reverse().map((g, i) => fx(CH[t.length - 1 - i]) + ',' + gy(g - 5)).join(' ');
  s += `<polygon points="${band}" fill="var(--brass-soft)"/>`;
  const line = (a, extra) => `<polyline points="${a.map((g, i) => fx(CH[i]) + ',' + gy(g)).join(' ')}" fill="none" ${extra}/>`;
  s += line(t, 'class="gc-t on"') + line(soft, 'class="gc-eff"') + line(m, `stroke="var(--ink)" stroke-width="2.4"`);
  m.forEach((g, i) => { s += `<circle cx="${fx(CH[i])}" cy="${gy(g)}" r="3" fill="var(--ink)"/>`; });
  return s + '</svg>';
}

/* ---------- Clôture et correction ---------- */
ACT.cbfinish = () => {
  const P = CAB.P, c = P.cr;
  if (P.kind === 'bilan') {
    if (!c.type.R || !c.type.L || !c.deg.R || !c.deg.L || !c.cond || !c.rdv) { toast('Complétez la conclusion, la conduite et le prochain RDV'); return; }
    if (c.cond === 'appareil' && !c.classe) { toast('Indiquez la classe proposée sur le devis'); return; }
  } else if (!c.action || !c.rdv) { toast('Choisissez l’action menée et le prochain RDV'); return; }
  const r = P.kind === 'bilan' ? cabScoreBilan(P) : cabScoreControle(P);
  P.result = r; P.status = 'clos'; CAB.debrief = r;
  const h = Store.get('cabHist', []);
  h.push({ d: Date.now(), seed: P.cs.seed, kind: P.kind, p: P.cs.patho.id, pc: r.pc });
  Store.set('cabHist', h.slice(-300));
  if (P.kind === 'bilan') {
    const hh = Store.get('hist', []);
    hh.push({ d: Date.now(), seed: P.cs.seed, p: P.cs.patho.id, site: P.cs.patho.site, kid: false, pts: r.pts, max: r.max, diag: r.diagOk, cond: c.cond === P.cs.conduite, src: 'cabinet' });
    Store.set('hist', hh.slice(-400));
  }
  renderView(); window.scrollTo(0, 0);
};
function cabScoreBilan(P) {
  const cs = P.cs, c = P.cr, parts = [], notes = [];
  const part = (k, pts, max) => parts.push({ k, pts: Math.round(pts), max });
  const say = (cls, t) => notes.push({ cls, t });
  // anamnèse
  const keys = ANAM_Q.filter(q => q.key), askedK = keys.filter(q => P.asked[q.k]).length;
  part('Anamnèse', askedK / keys.length * 10, 10);
  if (askedK < keys.length) say('warn', 'Anamnèse : questions clés oubliées : ' + keys.filter(q => !P.asked[q.k]).map(q => q.l.replace(/ \?$/, '')).join(' ; ') + '.');
  // otoscopie
  let oto = P.oto.R && P.oto.L ? (P.otoBefore === false ? 2 : 5) : 0;
  part('Otoscopie', oto, 5);
  if (!(P.oto.R && P.oto.L)) say('bad', 'Otoscopie non faite des deux côtés : c’est le premier geste, avant toute mesure.');
  else if (P.otoBefore === false) say('warn', 'Otoscopie faite après avoir commencé l’audiométrie : à faire avant.');
  // tonale
  let accN = 0, accS = 0, need = 0, have = 0, mNeed = 0, mOk = 0;
  const mErr = [], dil = new Set();
  ['R', 'L'].forEach(s => {
    const a = P.aud[s];
    F.forEach((f, i) => {
      need++;
      if (a.ac[i] == null) return; have++;
      const tr = cabAC(cs, s, i), st = a.acNR[i] ? 999 : a.ac[i];
      const d = tr >= 999 || st >= 999 ? (tr >= 999 && st >= 999 ? 0 : (st >= 999 ? Math.max(0, tr - CAB_ACMAX[i]) : 999)) : Math.abs(st - tr);
      accS += d <= 5 ? 1 : d <= 10 ? 0.5 : 0; accN++;
      const mn = cabMaskNeed(P, s, 'CA', i);
      if (mn.need) { mNeed++; const m = a.acM[i]; if (mn.max < mn.min && m != null) { mOk++; dil.add(`${fLabel(f)} Hz`); } else if (m != null && m >= mn.min && m <= mn.max) mOk++; else mErr.push(`${sideShort(s)} CA ${fLabel(f)} Hz ${m == null ? 'non masquée' : m < mn.min ? 'masque insuffisant (' + m + ' dB)' : 'surmasquage (' + m + ' dB)'}`); }
    });
    const bcNeed = F.slice(0, NBC).some((f, i) => cabAC(cs, s, i) > 20);
    [1, 2, 3, 5].forEach(i => {
      if (!bcNeed) return;
      need++;
      if (a.bc[i] == null) return; have++;
    });
    a.bc.forEach((v, i) => {
      if (v == null) return;
      const tr = cs.ears[s].bcNR[i] ? 999 : cs.ears[s].bc[i], st = a.bcNR[i] ? 999 : v;
      const d = tr >= 999 || st >= 999 ? (tr >= 999 && st >= 999 ? 0 : st >= 999 ? 0 : 999) : Math.abs(st - tr);
      accS += d <= 5 ? 1 : d <= 10 ? 0.5 : 0; accN++;
      const mn = cabMaskNeed(P, s, 'CO', i);
      if (mn.need) { mNeed++; const m = a.bcM[i]; if (mn.max < mn.min && m != null) { mOk++; dil.add(`${fLabel(F[i])} Hz`); } else if (m != null && m >= mn.min && m <= mn.max) mOk++; else mErr.push(`${sideShort(s)} CO ${fLabel(F[i])} Hz ${m == null ? 'non masquée' : m < mn.min ? 'masque insuffisant (' + m + ' dB)' : 'surmasquage (' + m + ' dB)'}`); }
    });
  });
  const comp = need ? have / need : 0, acc = accN ? accS / accN : 0;
  part('Audiométrie tonale', 25 * acc * Math.min(1, comp / 0.85), 25);
  if (comp < 0.85) say('warn', `Audiogramme incomplet : ${have}/${need} points attendus (CA de 250 à 8000 Hz des deux côtés, CO 500, 1k, 2k et 4k dès qu’il y a une perte).`);
  if (accN && acc < 0.8) say('warn', `Précision des seuils : ${Math.round(acc * 100)} %. Méthode : descendre de 10 dB après chaque réponse, remonter de 5 dB, retenir le niveau obtenu 2 fois sur 3.`);
  if (mNeed) { part('Masquage', mOk / mNeed * 10, 10); if (mErr.length) say(mErr.length > 2 ? 'bad' : 'warn', 'Masquage : ' + mErr.slice(0, 6).join(' · ') + (mErr.length > 6 ? ' …' : '') + '. Règle : masquer la CA quand l’écart avec la CO opposée atteint l’atténuation interaurale (≈ 40 dB), et la CO dès qu’il existe un Rinne ou une asymétrie.'); else say('ok', 'Masquage maîtrisé sur tous les points qui le demandaient.'); }
  else part('Masquage', 10, 10);
  if (dil.size) say('warn', `Dilemme de masquage (${[...dil].join(', ')}) : le bruit efficace dépasse déjà le niveau qui repasse vers l’oreille testée, typique des surdités de transmission bilatérales. Des écouteurs intra-auriculaires (inserts) augmentent l’atténuation interaurale ; sinon, noter le seuil comme incertain.`);
  if (!P.saved.tonal) say('bad', 'Audiogramme tonal non sauvegardé (touche S) : il n’est pas dans le dossier.');
  // vocale
  let vp = 0;
  const vres = {};
  ['R', 'L'].forEach(s => {
    const r = cabSpeechRes(P.voc.pts[s]), sp = cs.speech[s]; vres[s] = r;
    if (!r) return;
    let e = 0;
    if (r.n >= 3) e += 2;
    if (sp && sp.srt != null && r.srt != null && Math.abs(r.srt - sp.srt) <= 10) e += 2;
    else if (sp && sp.max < 50 && r.srt == null) e += 2;
    if (r.max >= (sp ? sp.max : 0) - 15) e += 2;
    vp += e;
  });
  const judg = P.voc.judged ? 1 - P.voc.wrong / P.voc.judged : 0;
  part('Audiométrie vocale', vp + (P.voc.judged ? judg * 3 : 0), 15);
  if (!P.voc.pts.R.length || !P.voc.pts.L.length) say('warn', 'Vocale à faire sur les deux oreilles : au moins 3 niveaux par oreille pour encadrer les 50 % et trouver le maximum.');
  if (P.voc.wrong) say('warn', `${P.voc.wrong} mot${P.voc.wrong > 1 ? 's' : ''} mal coté${P.voc.wrong > 1 ? 's' : ''} sur ${P.voc.judged} (+ alors que le patient s’était trompé, ou l’inverse).`);
  // interprétation
  let ip = 0;
  const tCat = s => biapCat(cs.biap[s]).k;
  ['R', 'L'].forEach(s => { if (c.type[s] === cs.type[s]) ip += 3; else say('bad', `Type ${sideShort(s)} : ${TYPE_LAB[cs.type[s]]} (vous : ${TYPE_LAB[c.type[s]]}).`); if (c.deg[s] === tCat(s)) ip += 2; else say('bad', `Degré ${sideShort(s)} : ${biapSub(cs.biap[s])}, moyenne BIAP ${Math.round(cs.biap[s])} dB.`); });
  const condOk = c.cond === cs.conduite;
  ip += condOk ? 5 : 0;
  part('Interprétation et conduite', ip, 15);
  if (!condOk) say('bad', `Conduite attendue : ${condLab(cs.conduite)}.`);
  // appareillage
  const fitNeeded = cs.fitMode === 'full';
  if (fitNeeded) {
    const sides = cabSides(P.fit);
    let ap = 0;
    if (P.fit.device && sides.length) {
      const v = deviceVerdict(cs, P.fit.device, sides, P.targets);
      ap += v.pts / 15 * 6;
      if (v.pts < 15) say('warn', 'Appareil : ' + v.why);
      if (earsToFit(cs).includes(P.fit.ears)) ap += 2; else say('warn', 'Côtés appareillés : attendu ' + earsToFit(cs).map(e => e === 'both' ? 'bilatéral' : sideName(e)).join(' ou ') + '.');
      let remOk = 0;
      sides.forEach(s => {
        const m = P.rem.meas[s], fresh = m && P.rem.fitAt && P.rem.fitAt[s] === JSON.stringify(P.fit[s]);
        if (!m) return;
        const real = cabReigNoNoise(P, s), t = P.targets[s][65];
        const k = [1, 2, 3, 5].filter(i => Math.abs(real[i] - t[i]) <= 5).length;
        remOk += (fresh ? 1 : 0.6) * k / 4;
        if (P.rem.measProbe && P.rem.measProbe[s] === 'entree') say('warn', `In vivo ${sideShort(s)} : sonde trop superficielle, les aigus mesurés sont faussement bas.`);
      });
      ap += remOk / sides.length * 8;
      if (!P.rem.n) say('warn', 'Pas de mesure in vivo : le gain affiché par le logiciel n’est qu’une estimation, seule la mesure dans le conduit le vérifie.');
      const sc = sides.map(s => scoreEar(cs, s, P.fit[s], P.targets[s], P.fit.device));
      if (sc.some(x => x.larsen)) { ap -= 5; say('bad', 'Réglage instable : le gain aigu pour les sons faibles dépasse la limite de stabilité du couplage (larsen). Fermer davantage le couplage ou réduire G50 dans les aigus.'); }
      ap += avg(sc.map(x => x.parts[0].pts / 15)) * 4;
      if (!P.saved.fit) say('warn', 'Réglage non sauvegardé dans les appareils (S).');
    } else say('bad', 'Appareillage indiqué mais non réalisé.');
    part('Appareillage et in vivo', Math.max(0, ap), 20);
  } else if (P.fit.device && P.saved.fit) say('bad', 'Un appareil a été réglé alors que la conduite n’était pas l’appareillage immédiat.');
  // suivi
  const rdvOk = cs.conduite === 'appareil' ? (fitNeeded ? c.rdv === 'j8' : ['m6', 'm1'].includes(c.rdv)) : ['orl', 'urgence', 'implant', 'co'].includes(cs.conduite) ? c.rdv === 'orl' : ['m6', 'm1'].includes(c.rdv);
  part('Organisation du suivi', rdvOk ? 5 : 0, 5);
  if (!rdvOk) say('warn', 'Prochain RDV : ' + (cs.conduite === 'appareil' && fitNeeded ? 'contrôle à 8–15 jours après la pose.' : ['orl', 'urgence', 'implant', 'co'].includes(cs.conduite) ? 'courrier à l’ORL, nouveau RDV après son avis.' : 'surveillance à distance.'));
  const pts = parts.reduce((a, p) => a + p.pts, 0), max = parts.reduce((a, p) => a + p.max, 0);
  return { kind: 'bilan', parts, notes, pts, max, pc: Math.round(pts / max * 100), diagOk: c.type.R === cs.type.R && c.type.L === cs.type.L, vres };
}
function cabReigNoNoise(P, s) {
  const e = effGain(P.fit[s], 65);
  return CH.map((f, i) => Math.round(e[i] + P.off[s][i]));
}
function cabScoreControle(P) {
  const cs = P.cs, c = P.cr, parts = [], notes = [];
  const part = (k, pts, max) => parts.push({ k, pts: Math.round(pts), max });
  const say = (cls, t) => notes.push({ cls, t });
  const C = COMPLAINTS[P.issue], sides = cabSides(P.fit);
  const okAct = c.action === C.ok;
  part('Analyse de la plainte', okAct ? 10 : 0, 10);
  say(okAct ? 'ok' : 'bad', (okAct ? 'Bonne analyse. ' : `Action attendue : ${C.ok}. `) + C.exp);
  const after = detectIssues(cs, P.fit, P.targets, sides).filter(k => k === P.issue || !(P.baseIssues || []).includes(k));
  const changed = JSON.stringify({ R: P.fit.R, L: P.fit.L }) !== P.fitStart;
  if (P.issue === 'accl') {
    part('Réglage', changed ? 8 : 15, 15);
    if (changed) say('warn', 'Le réglage était déjà proche de la cible : mieux vaut accompagner l’acclimatation que baisser le gain.');
  } else {
    const fixed = !after.includes(P.issue);
    part('Réglage', (fixed ? 12 : 0) + (fixed && after.length === 0 ? 3 : 0), 15);
    if (!fixed) say('bad', 'Le problème est toujours présent dans les réglages des appareils.');
    else if (after.length) say('warn', 'Problème corrigé, mais le réglage en crée un autre : ' + after.map(k => COMPLAINTS[k].q.slice(0, 60) + '…').join(' '));
  }
  part('Vérification in vivo', P.rem.n ? 5 : 0, 5);
  if (!P.rem.n) say('warn', 'Après une retouche, vérifier en mesure in vivo.');
  part('Sauvegarde dans les appareils', P.saved.fit ? 5 : 0, 5);
  if (!P.saved.fit) say('bad', 'Réglage non sauvegardé : le patient repart avec l’ancien réglage.');
  const rdvOk = ['j8', 'm1'].includes(c.rdv);
  part('Suivi', rdvOk ? 5 : 0, 5);
  if (P.dl.h < 6) say('warn', `Port faible (${P.dl.h} h/jour) : signe d’inconfort, à relier à la plainte et à suivre.`);
  const pts = parts.reduce((a, p) => a + p.pts, 0), max = parts.reduce((a, p) => a + p.max, 0);
  return { kind: 'controle', parts, notes, pts, max, pc: Math.round(pts / max * 100) };
}
function cabDebriefView() {
  const P = CAB.P, r = CAB.debrief, cs = P.cs, Pa = cs.patho;
  let truth = '';
  if (r.kind === 'bilan') {
    truth = `<section class="card"><h3>Votre audiogramme</h3><div class="agwrap">${audiogramSVG(cabAudObj(P))}</div></section>
    <section class="card"><h3>Audiogramme réel du patient</h3><div class="agwrap">${audiogramSVG(cs.ears)}</div>${agLegend()}
    <p class="small">${['R', 'L'].map(s => `${sideShort(s)} : ${TYPE_LAB[cs.type[s]]}, ${biapSub(cs.biap[s])} (${Math.round(cs.biap[s])} dB)${cs.speech[s] ? `, SRT ${cs.speech[s].srt} dB, max ${cs.speech[s].max} %` : ''}`).join('<br>')}</p></section>`;
  }
  return `<section class="card score"><div class="ring" style="--p:${r.pc}"><span class="mono">${r.pc}<small>%</small></span></div>
    <div><p class="eyebrow">${r.kind === 'bilan' ? 'Bilan' : 'Contrôle'} · dossier ${cs.seed}</p><h2>${esc(cs.name)}</h2><p class="muted small">${esc(Pa.nom)} · ${SITES[Pa.site]}</p></div></section>
  <section class="card"><ul class="parts">${r.parts.map(p => `<li><span>${p.k}</span>${pctBar(p.pts / p.max * 100)}<span class="mono">${p.pts}/${p.max}</span></li>`).join('')}</ul></section>
  <section class="card"><h3>Correction</h3>${r.notes.length ? r.notes.map(n => `<p class="fb ${n.cls}">${esc(n.t)}</p>`).join('') : '<p class="fb ok">Dossier mené sans faute.</p>'}</section>
  ${truth}
  <section class="card"><h3>${esc(Pa.nom)}</h3><p class="small"><b>Audiométrie.</b> ${esc(Pa.fiche.audio)}</p><p class="small"><b>Côté prothèse.</b> ${esc(Pa.fiche.proth)}</p></section>
  <div class="row gap wrap"><button class="btn primary big" data-act="cbback">Retour à l’agenda</button><button class="btn" data-act="openfiche" data-id="${Pa.id}">Fiche complète</button></div>`;
}
ACT.cbback = () => { CAB.debrief = null; CAB.P = null; CAB.app = 'gest'; renderView(); window.scrollTo(0, 0); };

/* ---------- Clavier physique ---------- */
document.addEventListener('keydown', e => {
  if (typeof TAB === 'undefined' || TAB !== 'cab' || !CAB.P || CAB.debrief) return;
  if (e.target.closest && e.target.closest('input[type=text],textarea,select')) return;
  if (e.shiftKey && (e.metaKey || e.ctrlKey) && !e.altKey) { e.preventDefault(); CAB.app = CAB.app === 'gest' ? 'noah' : 'gest'; renderView(); return; }
  if (CAB.app !== 'noah' || e.altKey || (e.ctrlKey && e.key !== 'Enter')) return;
  const mod = CAB.P.nmod;
  let k = e.key;
  if (k === 'Add' || e.code === 'NumpadAdd') k = '+';
  if (k === 'Subtract' || e.code === 'NumpadSubtract') k = '-';
  if (k === 'Spacebar') k = ' ';
  if (mod === 'tonal') {
    if (k === 'Enter' && e.ctrlKey) return;
    if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'PageUp', 'PageDown', 'Delete', 'Backspace'].includes(k) || /^[dgofmnsDGOFMNS]$/.test(k)) { e.preventDefault(); if (!e.repeat || k.startsWith('Arrow')) cabTonKey(k); }
  } else if (mod === 'vocal') {
    if (['F5', '+', '-', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Delete'].includes(k) || /^[dgmsDGMS]$/.test(k)) { e.preventDefault(); if (!e.repeat) cabVocKey(k); }
  } else if ((mod === 'fit' || mod === 'rem') && /^[sS]$/.test(k)) { e.preventDefault(); cabSave(mod); }
});
