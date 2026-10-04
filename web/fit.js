/* ============ MOTEUR D'APPAREILLAGE : cibles, couplage, scoring ============ */
const CH = [250, 500, 1000, 2000, 3000, 4000, 6000];
const DEVICES = [
  { k: 'CIC', l: 'Intra-profond (CIC / IIC)', cap: 40, kind: 'intra' },
  { k: 'ITE', l: 'Intra-conque (ITE)', cap: 55, kind: 'intra' },
  { k: 'RIC-S', l: 'RIC, écouteur S', cap: 45, kind: 'ric' },
  { k: 'RIC-M', l: 'RIC, écouteur M', cap: 55, kind: 'ric' },
  { k: 'RIC-P', l: 'RIC, écouteur P', cap: 65, kind: 'ric' },
  { k: 'RIC-UP', l: 'RIC, écouteur UP', cap: 75, kind: 'ric' },
  { k: 'BTE-M', l: 'Contour d’oreille standard', cap: 60, kind: 'bte' },
  { k: 'BTE-P', l: 'Contour d’oreille Power', cap: 72, kind: 'bte' },
  { k: 'BTE-SP', l: 'Contour Super Power', cap: 85, kind: 'bte' }
];
const SPECIAL_DEV = [
  { k: 'CROS', l: 'Système CROS' }, { k: 'BiCROS', l: 'Système BiCROS' },
  { k: 'CO', l: 'Prothèse à conduction osseuse' }, { k: 'CONV', l: 'Aide auditive conventionnelle' }
];
const VENTS = [
  { k: 'ouvert', l: 'Ouvert', d: 'dôme ouvert / évent large', loss: [-25, -18, -8, -2, 0, 0, 0], msg: 32 },
  { k: 'semi', l: 'Semi-ouvert', d: 'dôme tulipe / évent 2–3 mm', loss: [-15, -9, -3, 0, 0, 0, 0], msg: 40 },
  { k: 'ferme', l: 'Fermé', d: 'dôme fermé / évent 1 mm', loss: [-6, -3, 0, 0, 0, 0, 0], msg: 48 },
  { k: 'occlusif', l: 'Occlusif', d: 'embout plein / évent de sécurité', loss: [0, 0, 0, 0, 0, 0, 0], msg: 58 }
];
const ventOf = k => VENTS.find(v => v.k === k);
const devOf = k => DEVICES.find(d => d.k === k);

function earH(ear) {
  const H = CH.map((f, i) => ear.acNR[i] ? 120 : ear.ac[i]);
  const B = CH.map((f, i) => { const j = Math.min(i, NBC - 1); return ear.bcNR[j] ? null : ear.bc[j]; });
  const ABG = H.map((h, i) => B[i] == null ? 0 : Math.max(0, h - B[i]));
  return { H, ABG, SN: H.map((h, i) => h - ABG[i]) };
}

function computeTargets(ear, kid) {
  const { H, ABG, SN } = earH(ear);
  const sum3 = H[1] + H[2] + H[3];
  const X = sum3 <= 180 ? 0.05 * sum3 : 9 + 0.116 * (sum3 - 180);
  const K = [-17, -8, 1, -1, -2, -2, -2];
  const t = { 50: [], 65: [], 80: [], mpo: [], cr: [] };
  CH.forEach((f, i) => {
    let g = X + 0.31 * H[i] + K[i] + 0.25 * ABG[i] + (kid ? 6 : 0);
    g = clamp(Math.round(g), 0, 80);
    const cr = Math.round((1 + clamp((SN[i] - 20) / 55, 0, 1.6)) * 10) / 10;
    const d = 15 * (1 - 1 / cr);
    t[65][i] = g;
    t[50][i] = clamp(Math.round(g + d), 0, 90);
    t[80][i] = clamp(Math.round(g - d), 0, 80);
    t.cr[i] = cr;
    t.mpo[i] = clamp(Math.round(98 + 0.35 * Math.max(0, SN[i] - 30) + 0.6 * ABG[i]), 95, 130);
  });
  return t;
}

function ventIdeal(ear, kid, biap, t) {
  const { H, ABG } = earH(ear);
  const lf = (H[0] + H[1]) / 2;
  const abg = avg([ABG[1], ABG[2], ABG[3]]);
  let ok;
  if (lf <= 30) ok = ['ouvert', 'semi'];
  else if (lf <= 45) ok = ['semi', 'ferme'];
  else if (lf <= 65) ok = ['ferme', 'occlusif'];
  else ok = ['occlusif'];
  if (abg >= 20 && lf > 30) ok = ['ferme', 'occlusif'];
  let needEmbout = kid || biap >= 70 || (ok.length === 1 && ok[0] === 'occlusif');
  // le couplage doit aussi tenir le gain aigu sans larsen
  if (t) {
    const hf = Math.max(...t[50].slice(3));
    const stable = k => ventOf(k).msg + (needEmbout ? 4 : 0) >= hf;
    let f = ok.filter(stable);
    if (!f.length) {
      const i0 = VENTS.findIndex(v => v.k === ok[ok.length - 1]);
      f = VENTS.slice(i0).map(v => v.k).filter(stable).slice(0, 1);
      if (!f.length) { f = ['occlusif']; needEmbout = true; }
    }
    ok = f;
  }
  return { ok, needEmbout, lf: Math.round(lf) };
}

function earsToFit(cs) {
  const need = s => cs.biap[s] >= 26 && cs.biap[s] < 120;
  const R = need('R'), L = need('L');
  const ok = [];
  if (R && L) ok.push('both');
  else if (R) ok.push('R');
  else if (L) ok.push('L');
  // oreille limite (21–30) : uni ou bilatéral acceptés
  if (R && !L && cs.biap.L > 20) ok.push('both');
  if (L && !R && cs.biap.R > 20) ok.push('both');
  if (!ok.length) ok.push('both');
  return ok;
}

function deviceVerdict(cs, devK, fittedSides, targets) {
  const d = devOf(devK);
  if (!d) return { pts: 0, why: 'Type d’appareil non adapté à ce cas.' };
  const need = Math.max(...fittedSides.map(s => Math.max(...targets[s][50]))) + 5;
  const maxBiap = Math.max(...fittedSides.map(s => cs.biap[s]));
  const canalPb = ['exostoses', 'perforation', 'otite_ext', 'omc_seq', 'cholesteatome'].includes(cs.patho.id);
  if (d.kind === 'intra' && cs.kid) return { pts: 0, why: 'Les intras sont contre-indiqués chez l’enfant (croissance du conduit, sécurité).' };
  if (d.kind === 'intra' && maxBiap >= 75) return { pts: 0, why: 'Un intra n’est pas adapté à une perte sévère ou profonde (puissance, larsen).' };
  if (d.kind === 'intra' && canalPb) return { pts: 3, why: 'Un intra occlut un conduit fragile : préférer un contour ou un RIC avec couplage aéré.' };
  if (d.kind === 'ric' && cs.kid && cs.age < 8) return { pts: 8, why: 'Chez le jeune enfant, le contour avec embout sur mesure reste la référence (solidité, embout évolutif, coude pédiatrique).' };
  if (d.cap < need) return { pts: 3, why: `Puissance insuffisante : la cible demande environ ${need} dB de gain pour les sons faibles, cet appareil plafonne vers ${d.cap} dB.` };
  if (d.cap - need > (cs.kid && d.kind === 'bte' ? 45 : 28)) return { pts: 10, why: 'Appareil surdimensionné : il fonctionnera, mais un écouteur ou un boîtier moins puissant serait plus discret et plus confortable.' };
  return { pts: 15, why: 'Choix cohérent avec la perte et le contexte.' };
}
function bestDevices(cs, fittedSides, targets) {
  return DEVICES.filter(d => deviceVerdict(cs, d.k, fittedSides, targets).pts === 15).map(d => d.l);
}

function newFitState() {
  return { g50: CH.map(() => 25), g65: CH.map(() => 20), g80: CH.map(() => 15), mpo: CH.map(() => 105), vent: null, support: null };
}

function effGain(fs, L) {
  const v = fs.vent ? ventOf(fs.vent) : VENTS[3];
  return fs['g' + L].map((g, i) => g + v.loss[i]);
}
function msgOf(fs, devK) {
  const v = fs.vent ? ventOf(fs.vent) : VENTS[3];
  let m = v.msg + (fs.support === 'embout' ? 4 : 0);
  return m;
}
const crOf = (g50, g80) => { const d = g50 - g80; return d >= 29.5 ? Infinity : 30 / (30 - d); };

function scoreEar(cs, s, fs, t, devK) {
  const parts = [];
  const vi = ventIdeal(cs.ears[s], cs.kid, cs.biap[s], t);
  let vp = 0;
  const vIdx = VENTS.findIndex(v => v.k === fs.vent);
  if (vi.ok.includes(fs.vent)) vp = 10;
  else if (vi.ok.some(k => Math.abs(VENTS.findIndex(v => v.k === k) - vIdx) === 1)) vp = 5;
  const sp = (vi.needEmbout && fs.support !== 'embout') ? 0 : 5;
  parts.push({ k: 'Couplage', pts: vp + sp, max: 15 });
  let gs = 0, n = 0;
  [50, 65, 80].forEach(L => {
    const e = effGain(fs, L);
    CH.forEach((f, i) => {
      const tt = t[L][i];
      const d = Math.abs(e[i] - tt);
      let p = d <= 3 ? 1 : d <= 6 ? 0.6 : d <= 10 ? 0.25 : 0;
      if (tt <= 3 && e[i] <= 8) p = 1;
      gs += p; n++;
    });
  });
  parts.push({ k: 'Gains 50/65/80', pts: Math.round(gs / n * 55), max: 55 });
  let mp = 0;
  CH.forEach((f, i) => { const d = Math.abs(fs.mpo[i] - t.mpo[i]); mp += d <= 5 ? 1 : d <= 10 ? 0.4 : 0; });
  parts.push({ k: 'MPO', pts: Math.round(mp / CH.length * 10), max: 10 });
  const m = msgOf(fs, devK);
  const lars = CH.some((f, i) => i >= 3 && fs.g50[i] > m);
  parts.push({ k: 'Stabilité (larsen)', pts: lars ? 0 : 5, max: 5 });
  return { parts, vi, larsen: lars };
}

/* ---------- Plaintes du patient (réglage fin) ---------- */
const COMPLAINTS = {
  occlusion: {
    q: '« Ma propre voix résonne, j’ai l’impression de parler dans un tonneau. Et quand je mange, c’est insupportable. »',
    ok: 'Ouvrir le couplage (évent plus large, dôme plus ouvert) et alléger les graves',
    no: ['Augmenter le gain des graves pour couvrir la résonance', 'Augmenter la compression sur les aigus', 'Activer le réducteur de bruit maximal'],
    exp: 'Effet d’occlusion : avec des graves peu atteints, un conduit fermé renforce la conduction osseuse de la propre voix. On aère le couplage ; augmenter les graves aggraverait la sensation.'
  },
  larsen: {
    q: '« Ça siffle dès que je mets la main près de l’oreille, et parfois quand je souris. »',
    ok: 'Réduire le gain aigu ou fermer davantage le couplage, puis relancer l’initialisation anti-larsen',
    no: ['Ouvrir l’évent pour aérer', 'Augmenter le MPO', 'Augmenter le gain sur 3–6 kHz'],
    exp: 'Le gain dans les aigus dépasse le gain stable maximal du couplage. Soit on baisse ces gains, soit on ferme le couplage (moins de fuite acoustique), puis on recalibre l’anti-larsen.'
  },
  agressif: {
    q: '« Le bruit du papier, de la vaisselle, des clés… c’est agressif, ça me fait sursauter. »',
    ok: 'Réduire le gain pour les sons forts (G80) et/ou le MPO dans les aigus',
    no: ['Augmenter le gain pour les sons faibles dans les aigus', 'Ouvrir l’évent', 'Augmenter le gain global'],
    exp: 'Les sons forts aigus sont trop amplifiés : on agit sur G80 (plus de compression) ou sur le niveau de sortie maximal, sans toucher aux sons faibles.'
  },
  intell: {
    q: '« J’entends que les gens parlent, mais je ne comprends pas les mots. »',
    ok: 'Augmenter le gain pour les sons moyens (G65) entre 2 et 4 kHz',
    no: ['Augmenter le gain des graves', 'Réduire le MPO', 'Fermer complètement l’évent'],
    exp: 'Les consonnes (indices d’intelligibilité) sont dans les aigus : il manque du gain moyen sur 2–4 kHz par rapport à la cible.'
  },
  faible: {
    q: '« Les voix faibles, les chuchotements, la petite-fille au fond du salon : je ne les entends pas. »',
    ok: 'Augmenter le gain pour les sons faibles (G50), donc la compression',
    no: ['Augmenter le gain pour les sons forts (G80)', 'Diminuer le gain pour les sons faibles', 'Diminuer le MPO'],
    exp: 'Les sons faibles sont sous-amplifiés : on relève G50 sans toucher G80, ce qui augmente le taux de compression.'
  },
  grave: {
    q: '« Tout est trop fort et sourd : le moteur de la voiture, ma voix, la hotte. »',
    ok: 'Réduire le gain des graves (250 à 1000 Hz)',
    no: ['Réduire le gain des aigus', 'Fermer l’évent', 'Augmenter le MPO'],
    exp: 'Trop de gain sur les graves : les bruits de fond, de basse fréquence, masquent la parole et la voix propre paraît grossie.'
  },
  metal: {
    q: '« Le son est métallique, comme une vieille radio, c’est fatigant. »',
    ok: 'Réduire légèrement le gain des aigus (3 à 6 kHz)',
    no: ['Augmenter le gain des aigus', 'Réduire le gain des graves', 'Augmenter la compression sur les graves'],
    exp: 'Gain aigu supérieur à la cible : timbre métallique. Baisser par petites touches, en gardant l’intelligibilité.'
  },
  accl: {
    q: '« Tout me paraît très aigu, j’entends le frigo, mes pas… Je suis fatigué(e) le soir. »',
    ok: 'Expliquer l’acclimatation, port progressif, éventuellement un palier d’adaptation un peu plus bas',
    no: ['Baisser les aigus de 10 dB pour qu’il soit à l’aise', 'Changer de modèle d’appareil', 'Conseiller de ne porter les appareils qu’en cas de besoin'],
    exp: 'Le réglage est proche de la cible : la gêne décrite est celle de la redécouverte des sons. On accompagne (port quotidien progressif, gestionnaire d’adaptation) au lieu de sous-amplifier.'
  },
  resto: {
    q: '« Au restaurant, je n’entends que le brouhaha. »',
    ok: 'Créer un programme bruit : directivité microphonique + réducteur de bruit, conseils de placement',
    no: ['Augmenter le gain global', 'Fermer l’évent', 'Augmenter G50 sur toutes les bandes'],
    exp: 'Le gain seul n’améliore pas le rapport signal/bruit. Directivité, réduction de bruit, placement dos au bruit, et microphone déporté si besoin.'
  },
  tel: {
    q: '« Au téléphone, j’ai du mal, et ça siffle quand je colle le combiné. »',
    ok: 'Proposer la diffusion directe (Bluetooth) du téléphone vers les aides auditives',
    no: ['Augmenter les aigus de 10 dB', 'Retirer l’appareil pour téléphoner', 'Fermer complètement l’évent'],
    exp: 'La diffusion directe supprime le larsen du combiné et améliore la qualité. Sinon, programme téléphone dédié.'
  }
};

function detectIssues(cs, fit, t, sides) {
  const out = new Set();
  sides.forEach(s => {
    const fs = fit[s]; const tt = t[s];
    const vi = ventIdeal(cs.ears[s], cs.kid, cs.biap[s]);
    if (['ferme', 'occlusif'].includes(fs.vent) && vi.lf <= 35) out.add('occlusion');
    if (CH.some((f, i) => i >= 3 && fs.g50[i] > msgOf(fs, fit.device))) out.add('larsen');
    const e50 = effGain(fs, 50), e65 = effGain(fs, 65), e80 = effGain(fs, 80);
    const dif = (e, L, idx) => avg(idx.map(i => e[i] - tt[L][i]));
    if (dif(e80, 80, [3, 4, 5, 6]) > 5 || CH.some((f, i) => i >= 3 && fs.mpo[i] - tt.mpo[i] > 7)) out.add('agressif');
    if (dif(e65, 65, [3, 4, 5]) < -5) out.add('intell');
    if (dif(e50, 50, [2, 3, 4, 5]) < -5) out.add('faible');
    if (dif(e65, 65, [0, 1, 2]) > 6) out.add('grave');
    if (dif(e65, 65, [4, 5, 6]) > 6) out.add('metal');
  });
  return [...out];
}
