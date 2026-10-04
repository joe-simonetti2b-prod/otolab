/* ============ SIMULATEUR : interface de cas ============ */
let SIM = null, EXP = null;
const SIMF = Store.get('simFilters', { site: 'tous', pub: 'tous' });
const STEP_LAB = { anam: 'Anamnèse', exam: 'Examens', analyse: 'Analyse', conduite: 'Conduite', appar: 'Appareillage', fine: 'Réglage fin', bilan: 'Bilan' };
const DEG_OPTS = [['normale', 'Normale'], ['legere', 'Légère'], ['moyenne', 'Moyenne'], ['severe', 'Sévère'], ['profonde', 'Profonde'], ['totale', 'Totale']].map(([v, l]) => ({ v, l }));
const TYPE_OPTS = ['normale', 'transmission', 'perception', 'mixte'].map(k => ({ v: k, l: TYPE_LAB[k] }));

function simSteps() {
  const st = ['anam', 'exam', 'analyse', 'conduite'];
  const fm = SIM.cs.fitMode;
  if (fm !== 'none') st.push('appar');
  if (fm === 'full' || fm === 'train') st.push('fine');
  st.push('bilan');
  return st;
}
function stepOpen(k) {
  const L = SIM.lock;
  if (k === 'anam' || k === 'exam' || k === 'analyse') return true;
  if (k === 'conduite') return !!L.analyse;
  if (k === 'appar') return !!L.conduite;
  if (k === 'fine') return !!L.appar;
  if (k === 'bilan') return simSteps().filter(s => !['anam', 'exam', 'bilan'].includes(s)).every(s => L[s === 'appar' ? 'appar' : s]);
  return false;
}

function startCase(opts) {
  EXP = null;
  const cs = generateCase(opts);
  const rng = makeRng(cs.seed + 7);
  SIM = {
    cs, step: 'anam', ans: {}, lock: {}, pts: {},
    popts: pathoOptions(cs, rng), copts: rng.shuffle(CONDUITES.slice()),
    agShow: 'both', level: 'all', curEar: 'R', showT: true, help: false,
    fit: { R: newFitState(), L: newFitState(), device: null, ears: null },
    targets: { R: computeTargets(cs.ears.R, cs.kid), L: computeTargets(cs.ears.L, cs.kid) },
    fine: null, origin: rng.pick(['de lui-même', 'sur conseil de son médecin traitant', 'poussé par sa famille'])
  };
  renderView();
  window.scrollTo(0, 0);
}

/* ---------- accueil ---------- */
function simHome() {
  const h = Store.get('hist', []);
  const n = h.length;
  const mean = n ? Math.round(avg(h.slice(-20).map(x => x.pts / x.max * 100))) : null;
  return `
  <section class="hero">
    <p class="eyebrow">Simulateur de cabine</p>
    <h1>Un patient vous attend.</h1>
    <p class="lead">Anamnèse, otoscopie, audiométrie, impédancemétrie : analysez le dossier, choisissez la conduite à tenir puis réglez l’appareil sur une interface de préréglage. ${PATHOS.length} pathologies, et chaque dossier est tiré au hasard (âge, sévérité, latéralité, contexte).</p>
    <div class="filters">
      <div><span class="flab">Site lésionnel</span>${chipGroup('site', [{ v: 'tous', l: 'Tous' }, { v: 'externe', l: 'Externe' }, { v: 'moyenne', l: 'Moyenne' }, { v: 'interne', l: 'Interne' }], SIMF.site, 'simf')}</div>
      <div><span class="flab">Patient</span>${chipGroup('pub', [{ v: 'tous', l: 'Tous' }, { v: 'adulte', l: 'Adulte' }, { v: 'enfant', l: 'Enfant' }], SIMF.pub, 'simf')}</div>
    </div>
    <div class="row gap">
      <button class="btn primary big" data-act="newcase">Nouveau patient</button>
      <button class="btn big" data-act="express">Lecture express d’audiogrammes</button>
    </div>
  </section>
  ${(() => { const dc = generateCase({ seed: dailySeed() }); return `<section class="card daily">
    <div class="daily-t"><p class="eyebrow">Dossier du jour</p><h3>${esc(dc.name)}, ${dc.ageTxt}</h3><p class="quote small">${esc(dc.hist.motif)}</p><button class="btn" data-act="daily">Ouvrir ce dossier</button></div>
    <div class="agmini">${audiogramSVG(dc.ears, { show: 'both' })}</div></section>`; })()}
  <section class="card">
    <h3>Rejouer un dossier</h3>
    <p class="muted small">Chaque dossier a un numéro. Le même numéro redonne exactement le même patient : pratique pour comparer avec un camarade.</p>
    <form class="row gap" data-form="seed" id="seedForm"><input id="seedIn" inputmode="numeric" pattern="[0-9]*" placeholder="N° de dossier (6 chiffres)" class="inp"><button class="btn" type="submit">Ouvrir</button></form>
  </section>
  ${n ? `<section class="card"><h3>Vos derniers dossiers</h3><p class="muted small">${n} dossier${n > 1 ? 's' : ''} traités · moyenne des 20 derniers : <b>${mean} %</b></p>
    <ul class="hlist">${h.slice(-5).reverse().map(x => `<li><span>${esc((PATHOS.find(p => p.id === x.p) || {}).nom || x.p)}</span><span class="mono">${Math.round(x.pts / x.max * 100)} %</span></li>`).join('')}</ul></section>` : ''}
  `;
}
ACT.simf = a => { SIMF[a.dataset.name] = a.dataset.val; Store.set('simFilters', SIMF); renderView(); };
ACT.newcase = () => startCase({ site: SIMF.site, pub: SIMF.pub });
ACT.replay = () => startCase({ seed: SIM.cs.seed });
ACT.quitcase = () => { SIM = null; EXP = null; renderView(); };
document.addEventListener('submit', e => {
  if (e.target.id === 'seedForm') {
    e.preventDefault();
    const v = parseInt($('#seedIn').value, 10);
    if (!(v >= 100000 && v <= 999999)) { toast('Le numéro de dossier compte 6 chiffres.'); return; }
    startCase({ seed: v });
  }
});

/* ---------- rendu principal ---------- */
function renderSim() {
  if (EXP) return expressView();
  if (!SIM) return simHome();
  const cs = SIM.cs;
  const steps = simSteps();
  const nav = steps.map(k => {
    const open = stepOpen(k);
    const done = SIM.lock[k];
    return `<button class="step${SIM.step === k ? ' on' : ''}${done ? ' done' : ''}" data-act="gostep" data-k="${k}" ${open ? '' : 'disabled'}>${STEP_LAB[k]}</button>`;
  }).join('');
  let body = '';
  switch (SIM.step) {
    case 'anam': body = anamView(); break;
    case 'exam': body = examView(); break;
    case 'analyse': body = analyseView(); break;
    case 'conduite': body = conduiteView(); break;
    case 'appar': body = apparView(); break;
    case 'fine': body = fineView(); break;
    case 'bilan': body = bilanView(); break;
  }
  return `
  <div class="pbar-head">
    <div class="pt">
      <div class="pt-id"><span class="avatar">${cs.kid ? 'E' : cs.sex === 'F' ? 'F' : 'H'}</span>
        <div><b>${esc(cs.name)}</b><span class="muted small">${cs.ageTxt} · dossier <span class="mono">${cs.seed}</span>${cs.fitMode === 'train' ? '' : ''}</span></div></div>
      <button class="btn ghost small" data-act="quitcase" aria-label="Fermer le dossier">Fermer</button>
    </div>
    <nav class="steps" aria-label="Étapes du dossier">${nav}</nav>
  </div>
  <div class="stepbody">${body}</div>`;
}
ACT.gostep = a => { SIM.step = a.dataset.k; renderView(); window.scrollTo(0, 0); };
function nextBtn(k, lab) { return `<button class="btn primary wide" data-act="gostep" data-k="${k}">${lab}</button>`; }

/* ---------- Anamnèse ---------- */
function anamView() {
  const cs = SIM.cs, h = cs.hist;
  const presc = cs.prescribed
    ? (cs.kid ? 'Prescription d’appareillage de l’ORL pédiatrique, bilan étiologique en cours ou fait.' : 'Ordonnance d’appareillage de l’ORL : bilan réalisé, pas de contre-indication médicale.')
    : (cs.kid ? 'Adressé(e) par le pédiatre pour un premier bilan, pas d’ordonnance.' : 'Pas d’ordonnance : vient ' + SIM.origin + '.');
  const list = arr => arr.length ? `<ul class="bul">${arr.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '<p class="muted">—</p>';
  return `
  <section class="card">
    <dl class="kv">
      <dt>Patient</dt><dd>${cs.kid ? (cs.sex === 'F' ? 'Fille' : 'Garçon') : (cs.sex === 'F' ? 'Femme' : 'Homme')}, ${cs.ageTxt}, ${esc(cs.city)}</dd>
      <dt>${cs.kid ? 'Scolarité' : 'Activité'}</dt><dd>${esc(cs.job)}</dd>
      <dt>Prescription</dt><dd>${esc(presc)}</dd>
    </dl>
  </section>
  <section class="card">
    <h3>Motif de consultation</h3><p class="quote">${esc(h.motif)}</p>
    <h4>Signes rapportés</h4>${list(h.symptoms)}
    <h4>Antécédents</h4>${list(h.antecedents)}
    ${h.misc.length ? `<h4>Notes</h4>${list(h.misc)}` : ''}
  </section>
  <section class="card">
    <h3>Otoscopie</h3>
    <div class="two">
      <div><span class="ear r">OD</span><p>${esc(cs.oto.R)}</p></div>
      <div><span class="ear l">OG</span><p>${esc(cs.oto.L)}</p></div>
    </div>
  </section>
  ${nextBtn('exam', 'Voir les examens')}`;
}

/* ---------- Examens ---------- */
function agCard(compact) {
  const cs = SIM.cs;
  return `<section class="card">
    <div class="row between"><h3>Audiogramme tonal</h3>${chipGroup('agShow', [{ v: 'R', l: 'OD' }, { v: 'both', l: 'OD + OG' }, { v: 'L', l: 'OG' }], SIM.agShow, 'agshow')}</div>
    <div class="agwrap">${audiogramSVG(cs.ears, { show: SIM.agShow })}</div>
    ${agLegend()}
    ${compact ? '' : `<p class="muted small">${esc(cs.method)}.</p>`}
    <details class="vals"><summary>Valeurs en dB HL</summary>${thrTable(cs.ears)}</details>
  </section>`;
}
ACT.agshow = a => { SIM.agShow = a.dataset.val; renderView(); };
function thrTable(ears) {
  const cell = (v, nr) => v == null ? '—' : (nr ? '≥' + v : v);
  let t = '<div class="tscroll"><table class="tbl"><thead><tr><th></th>' + F.map(f => `<th>${fLabel(f)}</th>`).join('') + '</tr></thead><tbody>';
  [['R', 'CA OD', 'ac', 'acNR'], ['R', 'CO OD', 'bc', 'bcNR'], ['L', 'CA OG', 'ac', 'acNR'], ['L', 'CO OG', 'bc', 'bcNR']].forEach(([s, lab, k, nk]) => {
    t += `<tr class="${s === 'R' ? 'r' : 'l'}"><th>${lab}</th>` + F.map((f, i) => `<td>${cell(ears[s][k][i], ears[s][nk] && ears[s][nk][i])}</td>`).join('') + '</tr>';
  });
  return t + '</tbody></table></div>';
}
function examView() {
  const cs = SIM.cs;
  const ty = s => {
    const t = cs.tymp[s];
    if (!t || t.type === 'NR') return 'Non réalisable';
    if (t.type === 'B') return `Pas de pic identifiable · volume ${t.ecv.toFixed(1)} ml`;
    return `Pic à ${Math.round(t.peak)} daPa · compliance ${t.comp.toFixed(2)} ml · volume ${t.ecv.toFixed(1)} ml`;
  };
  const sp = s => {
    const v = cs.speech[s];
    if (v === null) return 'Non réalisable à cet âge';
    if (!v || v.srt == null) return 'Aucune intelligibilité';
    return `Seuil d’intelligibilité ${v.srt} dB · maximum ${v.max} % à ${v.lvl} dB`;
  };
  const showOAE = cs.kid || cs.patho.id === 'neuropathie';
  return `${agCard(false)}
  <section class="card">
    <h3>Tympanométrie (226 Hz)</h3>
    <div class="agwrap">${tympSVG(cs.tymp)}</div>
    <p class="muted small">Zone grisée : normes adulte (−100 à +50 daPa, 0,3 à 1,6 ml).</p>
    <div class="two">
      <div><span class="ear r">OD</span><p class="mono small">${ty('R')}</p><p class="small">Réflexe : ${esc(cs.reflex.R)}</p></div>
      <div><span class="ear l">OG</span><p class="mono small">${ty('L')}</p><p class="small">Réflexe : ${esc(cs.reflex.L)}</p></div>
    </div>
  </section>
  <section class="card">
    <h3>Audiométrie vocale</h3>
    <div class="two"><div><span class="ear r">OD</span><p class="small">${sp('R')}</p></div><div><span class="ear l">OG</span><p class="small">${sp('L')}</p></div></div>
    ${showOAE ? `<h4>Otoémissions acoustiques</h4><div class="two"><div><span class="ear r">OD</span><p class="small">${cs.oae.R}</p></div><div><span class="ear l">OG</span><p class="small">${cs.oae.L}</p></div></div>` : ''}
  </section>
  ${nextBtn('analyse', 'Passer à l’analyse')}`;
}

/* ---------- Analyse ---------- */
function analyseView() {
  const cs = SIM.cs, A = SIM.ans, L = SIM.lock.analyse;
  const earQ = s => {
    const tOK = cs.type[s], dOK = biapCat(cs.biap[s]).k;
    return `<div class="earq"><span class="ear ${s === 'R' ? 'r' : 'l'}">${sideShort(s)}</span>
      <span class="flab">Type</span>${chipGroup('type' + s, TYPE_OPTS, A['type' + s], L ? 'noop' : 'ans')}
      <span class="flab">Degré (classification BIAP)</span>${chipGroup('deg' + s, DEG_OPTS, A['deg' + s], L ? 'noop' : 'ans')}
      ${L ? `<p class="fb ${A['type' + s] === tOK ? 'ok' : 'bad'}">Type : ${TYPE_LAB[tOK]}</p>
      <p class="fb ${A['deg' + s] === dOK ? 'ok' : 'bad'}">Moyenne BIAP ${cs.biap[s].toFixed(1)} dB → ${biapSub(cs.biap[s])}</p>` : ''}
    </div>`;
  };
  const pOpts = SIM.popts.map(p => {
    const sel = A.patho === p.id; const good = p.id === cs.patho.id;
    const cls = L ? (good ? ' ok' : sel ? ' bad' : '') : (sel ? ' on' : '');
    return `<button class="opt${cls}" data-act="${L ? 'noop' : 'ans'}" data-name="patho" data-val="${p.id}"><span>${esc(p.nom)}</span><small>${SITES[p.site]}</small></button>`;
  }).join('');
  const ready = ['typeR', 'typeL', 'degR', 'degL', 'patho'].every(k => A[k]);
  return `${agCard(true)}
  <section class="card">
    <h3>Lecture de l’audiogramme</h3>
    <p class="muted small">Degré selon la moyenne 500 / 1000 / 2000 / 4000 Hz. Type : écart aérien-osseux de 15 dB ou plus en moyenne sur 500–2000 Hz.</p>
    <div class="earqs">${earQ('R')}${earQ('L')}</div>
  </section>
  <section class="card">
    <h3>Hypothèse diagnostique</h3>
    <div class="opts">${pOpts}</div>
    ${L ? `<p class="fb ${A.patho === cs.patho.id ? 'ok' : 'bad'}">${A.patho === cs.patho.id ? 'Bien vu.' : 'Il s’agissait de : ' + esc(cs.patho.nom) + '.'} ${esc(cs.patho.fiche.audio)}</p>` : ''}
  </section>
  ${L ? nextBtn('conduite', 'Conduite à tenir') : `<button class="btn primary wide" data-act="valanalyse" ${ready ? '' : 'disabled'}>Valider l’analyse</button>`}`;
}
ACT.noop = () => { };
ACT.ans = a => { SIM.ans[a.dataset.name] = a.dataset.val; renderView(); };
ACT.valanalyse = () => {
  const cs = SIM.cs, A = SIM.ans;
  let p = 0;
  ['R', 'L'].forEach(s => { if (A['type' + s] === cs.type[s]) p += 5; if (A['deg' + s] === biapCat(cs.biap[s]).k) p += 5; });
  if (A.patho === cs.patho.id) p += 20;
  SIM.pts.analyse = { pts: p, max: 40 };
  SIM.lock.analyse = true; renderView();
};

/* ---------- Conduite ---------- */
function conduiteView() {
  const cs = SIM.cs, A = SIM.ans, L = SIM.lock.conduite;
  const opts = SIM.copts.map(c => {
    const sel = A.cond === c.k, good = c.k === cs.conduite;
    const cls = L ? (good ? ' ok' : sel ? ' bad' : '') : (sel ? ' on' : '');
    return `<button class="opt${cls}" data-act="${L ? 'noop' : 'ans'}" data-name="cond" data-val="${c.k}"><span>${esc(c.l)}</span></button>`;
  }).join('');
  let after = '';
  if (L) {
    const fm = cs.fitMode;
    after = `<section class="card"><p class="fb ${A.cond === cs.conduite ? 'ok' : 'bad'}">${A.cond === cs.conduite ? 'Conduite adaptée.' : 'Conduite attendue : ' + esc(condLab(cs.conduite)) + '.'}</p>
      <p><b>Point clé.</b> ${esc(cs.patho.fiche.imp)}</p><p><b>Prise en charge.</b> ${esc(cs.patho.fiche.cat)}</p>
      ${fm === 'train' ? '<p class="note">Pour l’entraînement, on suppose maintenant l’avis ORL favorable à un appareillage : vous pouvez réaliser le réglage.</p>' : ''}
      ${fm === 'none' ? '<p class="note">Pas de réglage dans ce dossier : la conduite ne passe pas par une aide auditive à ce stade.</p>' : ''}</section>`;
  }
  const next = cs.fitMode !== 'none' ? 'appar' : 'bilan';
  return `<section class="card"><h3>Que proposez-vous ?</h3><p class="muted small">Une seule réponse : la décision la plus appropriée aujourd’hui.</p><div class="opts">${opts}</div></section>
  ${after}
  ${L ? nextBtn(next, next === 'appar' ? 'Passer à l’appareillage' : 'Voir le bilan') : `<button class="btn primary wide" data-act="valcond" ${A.cond ? '' : 'disabled'}>Valider</button>`}`;
}
ACT.valcond = () => {
  SIM.pts.conduite = { pts: SIM.ans.cond === SIM.cs.conduite ? 20 : 0, max: 20 };
  SIM.lock.conduite = true;
  if (SIM.cs.fitMode === 'none') finishCase();
  renderView();
};

/* ---------- Appareillage ---------- */
function fitSides() { const e = SIM.fit.ears; return e === 'both' ? ['R', 'L'] : e ? [e] : []; }
function apparView() {
  const cs = SIM.cs;
  if (cs.fitMode === 'device') return deviceOnlyView();
  const Fi = SIM.fit, L = SIM.lock.appar;
  const act = L ? 'noop' : 'fitpick';
  let h = `<section class="card"><h3>Oreille(s) à appareiller</h3>${chipGroup('ears', [{ v: 'R', l: 'Droite' }, { v: 'L', l: 'Gauche' }, { v: 'both', l: 'Bilatéral' }], Fi.ears, act)}
    <p class="muted small">BIAP : OD ${cs.biap.R.toFixed(0)} dB · OG ${cs.biap.L.toFixed(0)} dB</p></section>`;
  h += `<section class="card"><h3>Type d’appareil</h3><div class="opts dev">${DEVICES.map(d => `<button class="opt${Fi.device === d.k ? ' on' : ''}" data-act="${act}" data-name="device" data-val="${d.k}"><span>${d.l}</span><small class="mono">gain max ≈ ${d.cap} dB</small></button>`).join('')}</div></section>`;
  const sides = fitSides();
  if (sides.length) {
    if (!sides.includes(SIM.curEar)) SIM.curEar = sides[0];
    const s = SIM.curEar, fs = Fi[s];
    const intra = Fi.device && devOf(Fi.device).kind === 'intra';
    if (intra) fs.support = 'embout';
    h += `<section class="card fitpanel">
      ${sides.length > 1 ? `<div class="eartabs">${sides.map(x => `<button class="eartab ${x === 'R' ? 'r' : 'l'}${x === s ? ' on' : ''}" data-act="curear" data-val="${x}">Oreille ${sideName(x)}</button>`).join('')}</div>` : `<p class="eartitle ${s === 'R' ? 'r' : 'l'}">Oreille ${sideName(s)}</p>`}
      <span class="flab">Couplage acoustique</span>
      <div class="chips">${VENTS.map(v => `<button class="chip${fs.vent === v.k ? ' on' : ''}" data-act="${act}" data-name="vent" data-val="${v.k}" title="${v.d}">${v.l}</button>`).join('')}</div>
      <p class="muted small">${fs.vent ? ventOf(fs.vent).d : 'Choisissez le degré d’aération.'}</p>
      <span class="flab">Support</span>
      ${intra ? '<p class="small">Coque sur mesure (intra).</p>' : chipGroup('support', [{ v: 'dome', l: 'Dôme standard' }, { v: 'embout', l: 'Embout sur mesure' }], fs.support, act)}
      <div class="lvtabs" role="tablist">${[['all', 'Global'], ['50', 'G50 faibles'], ['65', 'G65 moyens'], ['80', 'G80 forts'], ['mpo', 'MPO']].map(([k, l]) => `<button class="lvtab${SIM.level === k ? ' on' : ''}" data-act="level" data-val="${k}">${l}</button>`).join('')}</div>
      <div id="faders" class="faders">${fadersHTML()}</div>
      <div class="row gap wrap qbtns">
        ${[-3, -1, 1, 3].map(d => `<button class="btn small" data-act="fall" data-d="${d}" ${L ? 'disabled' : ''}>Tous ${d > 0 ? '+' : '−'}${Math.abs(d)}</button>`).join('')}
        <label class="tog"><input type="checkbox" id="showT" data-chg="showt" ${SIM.showT ? 'checked' : ''}> Cible</label>
      </div>
      <div id="gchart" class="agwrap">${chartHTML()}</div>
      <div class="legend"><span class="lg"><i class="sw g50"></i>Faibles (50)</span><span class="lg"><i class="sw g65"></i>Moyens (65)</span><span class="lg"><i class="sw g80"></i>Forts (80)</span><span class="lg"><i class="sw tg"></i>Cibles</span><span class="lg"><i class="sw eff"></i>G65 programmé</span></div>
      <p class="muted small">Courbes : gain réel dans le conduit, une fois la fuite de l’évent déduite. Les curseurs règlent le gain programmé. Cibles de type NAL-R simplifiées${cs.kid ? ' (+6 dB, orientation DSL pédiatrique)' : ''}, corrigées de la composante de transmission.</p>
      ${L ? '' : `<button class="btn ghost small" data-act="firstfit">Premier calcul automatique (pénalité)</button>`}
    </section>`;
  }
  const ready = Fi.ears && Fi.device && sides.every(x => Fi[x].vent && Fi[x].support);
  if (L) h += apparResult() + nextBtn('fine', 'Écouter le patient (réglage fin)');
  else h += `<button class="btn primary wide" data-act="valfit" ${ready ? '' : 'disabled'}>Valider le premier réglage</button>`;
  if (cs.fitMode === 'train') h = `<p class="note">Réglage d’entraînement (conduite réelle : ${esc(condLab(cs.conduite))}).</p>` + h;
  return h;
}
ACT.fitpick = a => {
  const n = a.dataset.name, v = a.dataset.val;
  if (n === 'ears' || n === 'device') SIM.fit[n] = v;
  else SIM.fit[SIM.curEar][n] = v;
  if (n === 'vent' || n === 'support') { /* une fois choisi pour une oreille, propose le même pour l'autre */
    const o = SIM.curEar === 'R' ? 'L' : 'R';
    if (!SIM.fit[o][n]) SIM.fit[o][n] = v;
  }
  renderView();
};
ACT.curear = a => { SIM.curEar = a.dataset.val; renderView(); };
ACT.level = a => { SIM.level = a.dataset.val; refreshFit(true); $$('.lvtab').forEach(b => b.classList.toggle('on', b.dataset.val === SIM.level)); };
ACT.showt = a => { SIM.showT = a.checked; refreshFit(true); };

function fadRange() { return SIM.level === 'mpo' ? [80, 135] : [0, 90]; }
function fadVal(fs, i) {
  const L = SIM.level;
  if (L === 'mpo') return fs.mpo[i];
  if (L === 'all' || L === '65') return fs.g65[i];
  return fs['g' + L][i];
}
function fadTarget(i) {
  const t = SIM.targets[SIM.curEar], L = SIM.level;
  const v = ventOf(SIM.fit[SIM.curEar].vent || 'occlusif');
  if (L === 'mpo') return t.mpo[i];
  const lv = L === 'all' ? 65 : +L;
  return t[lv][i] - v.loss[i]; // valeur programmée qui atteindrait la cible
}
function fadersHTML() {
  const fs = SIM.fit[SIM.curEar];
  const [a, b] = fadRange();
  const pct = v => clamp((v - a) / (b - a) * 100, 0, 100);
  return CH.map((f, i) => {
    const v = fadVal(fs, i), tg = fadTarget(i);
    const d = Math.abs(v - tg);
    const st = !SIM.showT ? '' : d <= 3 ? 'ok' : d <= 6 ? 'warn' : 'bad';
    const cr = crOf(fs.g50[i], fs.g80[i]);
    return `<div class="fd">
      <output class="mono ${st}">${v}</output>
      <div class="fd-track" data-i="${i}" role="slider" aria-label="${fLabel(f)} Hz" aria-valuemin="${a}" aria-valuemax="${b}" aria-valuenow="${v}" tabindex="0">
        <div class="fd-fill" style="height:${pct(v)}%"></div>
        ${SIM.showT ? `<div class="fd-tgt" style="bottom:${pct(tg)}%"></div>` : ''}
        <div class="fd-thumb ${st}" style="bottom:${pct(v)}%"></div>
      </div>
      <span class="fd-f mono">${fLabel(f)}</span>
      <span class="fd-cr mono" title="Taux de compression">${cr === Infinity ? '∞' : cr.toFixed(1)}:1</span>
      <div class="fd-b"><button data-act="fstep" data-i="${i}" data-d="1" aria-label="Plus">+</button><button data-act="fstep" data-i="${i}" data-d="-1" aria-label="Moins">−</button></div>
    </div>`;
  }).join('');
}
function chartHTML() {
  const s = SIM.curEar, fs = SIM.fit[s], t = SIM.targets[s];
  const lv = SIM.level === 'all' || SIM.level === 'mpo' ? 65 : +SIM.level;
  return gainSVG({
    chF: CH, mode: lv,
    g: { 50: effGain(fs, 50), 65: effGain(fs, 65), 80: effGain(fs, 80) },
    t: SIM.showT ? { 50: t[50], 65: t[65], 80: t[80] } : null,
    eff65: fs.g65, msg: fs.vent ? msgOf(fs, SIM.fit.device) : null, cap: SIM.fit.device ? devOf(SIM.fit.device).cap : 0
  });
}
function refreshFit(all) {
  const f = $('#faders'); if (f) f.innerHTML = fadersHTML();
  const c = $('#gchart'); if (c) c.innerHTML = chartHTML();
}
function setFad(i, v) {
  if (SIM.lock.appar) return;
  const fs = SIM.fit[SIM.curEar];
  const [a, b] = fadRange();
  v = clamp(Math.round(v), a, b);
  const L = SIM.level;
  if (L === 'mpo') fs.mpo[i] = v;
  else if (L === 'all') { const d = v - fs.g65[i]; ['g50', 'g65', 'g80'].forEach(k => fs[k][i] = clamp(fs[k][i] + d, 0, 90)); }
  else fs['g' + L][i] = v;
}
ACT.fstep = a => { const i = +a.dataset.i; setFad(i, fadVal(SIM.fit[SIM.curEar], i) + (+a.dataset.d)); refreshFit(); };
ACT.fall = a => { CH.forEach((f, i) => setFad(i, fadVal(SIM.fit[SIM.curEar], i) + (+a.dataset.d))); refreshFit(); };
ACT.firstfit = () => {
  fitSides().forEach(s => {
    const fs = SIM.fit[s], t = SIM.targets[s];
    const v = ventOf(fs.vent || 'occlusif');
    [50, 65, 80].forEach(L => { fs['g' + L] = t[L].map((g, i) => clamp(g - v.loss[i], 0, 90)); });
    fs.mpo = t.mpo.slice();
  });
  SIM.help = true; toast('Premier calcul appliqué : la note de gain sera réduite.'); refreshFit();
};
document.addEventListener('pointerdown', e => {
  const tr = e.target.closest('.fd-track');
  if (!tr || !SIM || SIM.lock.appar) return;
  e.preventDefault();
  const i = +tr.dataset.i;
  const [a, b] = fadRange();
  const r = tr.getBoundingClientRect();
  const move = ev => {
    const fr = 1 - (ev.clientY - r.top) / r.height;
    setFad(i, a + clamp(fr, 0, 1) * (b - a));
    refreshFit();
  };
  try { tr.setPointerCapture(e.pointerId); } catch (x) { }
  move(e);
  const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); };
  window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
});
document.addEventListener('keydown', e => {
  const tr = e.target.closest && e.target.closest('.fd-track');
  if (!tr || !SIM) return;
  const i = +tr.dataset.i;
  const d = e.key === 'ArrowUp' ? 1 : e.key === 'ArrowDown' ? -1 : e.key === 'PageUp' ? 5 : e.key === 'PageDown' ? -5 : 0;
  if (!d) return;
  e.preventDefault();
  setFad(i, fadVal(SIM.fit[SIM.curEar], i) + d); refreshFit();
  const n = $$('.fd-track')[i]; if (n) n.focus();
});

ACT.valfit = () => {
  const cs = SIM.cs, Fi = SIM.fit, sides = fitSides();
  const earsOK = earsToFit(cs).includes(Fi.ears);
  const dv = deviceVerdict(cs, Fi.device, sides, SIM.targets);
  const per = {};
  sides.forEach(s => {
    per[s] = scoreEar(cs, s, Fi[s], SIM.targets[s], Fi.device);
    if (SIM.help) per[s].parts[1].pts = Math.round(per[s].parts[1].pts * 0.4);
  });
  const earAvg = avg(sides.map(s => per[s].parts.reduce((a, p) => a + p.pts, 0)));
  const raw = (earsOK ? 10 : 0) + dv.pts + earAvg;
  SIM.fitRes = { earsOK, dv, per, raw };
  SIM.pts.appar = { pts: Math.round(raw / 110 * 30), max: 30 };
  SIM.lock.appar = true;
  // plaintes générées à partir des écarts du réglage
  const iss = detectIssues(cs, Fi, SIM.targets, sides);
  const rng = makeRng(cs.seed + 31);
  let list = iss.slice(0, 2);
  if (list.length < 2) list.push(rng.pick(iss.length ? ['resto', 'tel'] : ['accl', 'resto', 'tel']));
  SIM.fine = { list, ans: {}, opts: {} };
  list.forEach(k => { const C = COMPLAINTS[k]; SIM.fine.opts[k] = rng.shuffle([C.ok].concat(C.no)); });
  renderView();
};
function apparResult() {
  const cs = SIM.cs, R = SIM.fitRes, sides = fitSides();
  const exp = earsToFit(cs);
  const best = bestDevices(cs, sides, SIM.targets);
  let h = `<section class="card"><h3>Correction du premier réglage</h3>
    <p class="fb ${R.earsOK ? 'ok' : 'bad'}">Oreilles : ${R.earsOK ? 'choix cohérent' : 'attendu : ' + exp.map(x => x === 'both' ? 'bilatéral' : 'oreille ' + sideName(x)).join(' ou ')}.</p>
    <p class="fb ${R.dv.pts >= 15 ? 'ok' : R.dv.pts >= 8 ? 'warn' : 'bad'}">Appareil : ${esc(R.dv.why)}${best.length && R.dv.pts < 15 ? ' Choix optimaux : ' + best.join(', ') + '.' : ''}</p>`;
  sides.forEach(s => {
    const p = R.per[s];
    h += `<h4><span class="ear ${s === 'R' ? 'r' : 'l'}">${sideShort(s)}</span> ${p.parts.reduce((a, x) => a + x.pts, 0)} / 85</h4>
      <ul class="parts">${p.parts.map(x => `<li><span>${x.k}</span>${pctBar(x.pts / x.max * 100)}<span class="mono">${x.pts}/${x.max}</span></li>`).join('')}</ul>
      <p class="small">Couplage conseillé : ${p.vi.ok.map(k => ventOf(k).l.toLowerCase()).join(' ou ')} (graves à ${p.vi.lf} dB HL)${p.vi.needEmbout ? ', embout sur mesure' : ''}.${p.larsen ? ' <b>Larsen probable</b> sur les aigus avec ce couplage.' : ''}</p>
      ${targetTable(s)}`;
  });
  if (SIM.help) h += '<p class="note">Premier calcul automatique utilisé : note de gain réduite.</p>';
  return h + '</section>';
}
function targetTable(s) {
  const t = SIM.targets[s], fs = SIM.fit[s];
  const e = { 50: effGain(fs, 50), 65: effGain(fs, 65), 80: effGain(fs, 80) };
  let h = '<div class="tscroll"><table class="tbl"><thead><tr><th></th>' + CH.map(f => `<th>${fLabel(f)}</th>`).join('') + '</tr></thead><tbody>';
  [50, 65, 80].forEach(L => {
    h += `<tr><th>G${L}</th>` + CH.map((f, i) => { const d = e[L][i] - t[L][i]; const c = Math.abs(d) <= 3 || (t[L][i] <= 3 && e[L][i] <= 8) ? 'ok' : Math.abs(d) <= 6 ? 'warn' : 'bad'; return `<td class="${c}">${e[L][i]}<small>/${t[L][i]}</small></td>`; }).join('') + '</tr>';
  });
  h += '<tr><th>MPO</th>' + CH.map((f, i) => { const d = Math.abs(fs.mpo[i] - t.mpo[i]); return `<td class="${d <= 5 ? 'ok' : d <= 10 ? 'warn' : 'bad'}">${fs.mpo[i]}<small>/${t.mpo[i]}</small></td>`; }).join('') + '</tr>';
  return h + '</tbody></table></div><p class="muted small">Réglé / cible (gain réel dans le conduit, en dB).</p>';
}

function deviceOnlyView() {
  const cs = SIM.cs, L = SIM.lock.appar, A = SIM.ans;
  const want = cs.patho.id === 'atresie' ? 'CO' : cs.crosType;
  const opts = SPECIAL_DEV.map(d => {
    const sel = A.sdev === d.k; const good = d.k === want;
    const cls = L ? (good ? ' ok' : sel ? ' bad' : '') : (sel ? ' on' : '');
    return `<button class="opt${cls}" data-act="${L ? 'noop' : 'ans'}" data-name="sdev" data-val="${d.k}"><span>${d.l}</span></button>`;
  }).join('');
  const expl = cs.patho.id === 'atresie'
    ? 'Sans conduit, la voie aérienne est impossible : la cochlée étant normale, la conduction osseuse transmet le son directement (bandeau souple chez l’enfant, ancrage osseux ensuite).'
    : (cs.crosType === 'CROS' ? 'Oreille controlatérale normale : le CROS capte le son du côté sourd et le transmet à l’oreille saine. Une prothèse à ancrage osseux (transmission transcrânienne) est une alternative.' : 'Oreille controlatérale elle-même atteinte : le BiCROS capte le côté sourd et amplifie aussi la meilleure oreille.');
  return `<section class="card"><h3>Quelle solution ?</h3><div class="opts">${opts}</div></section>
  ${L ? `<section class="card"><p class="fb ${A.sdev === want || (A.sdev === 'CO' && cs.patho.id === 'cophose_uni') ? 'ok' : 'bad'}">${esc(expl)}</p></section>` + nextBtn('bilan', 'Voir le bilan')
      : `<button class="btn primary wide" data-act="valdev" ${A.sdev ? '' : 'disabled'}>Valider</button>`}`;
}
ACT.valdev = () => {
  const cs = SIM.cs, want = cs.patho.id === 'atresie' ? 'CO' : cs.crosType;
  const v = SIM.ans.sdev;
  const p = v === want ? 30 : (v === 'CO' && cs.patho.id === 'cophose_uni') ? 24 : (cs.crosType && ['CROS', 'BiCROS'].includes(v)) ? 15 : 0;
  SIM.pts.appar = { pts: p, max: 30 };
  SIM.lock.appar = true; finishCase(); renderView();
};

/* ---------- Réglage fin ---------- */
function fineView() {
  const Fn = SIM.fine, L = SIM.lock.fine;
  const blocks = Fn.list.map((k, n) => {
    const C = COMPLAINTS[k];
    const opts = Fn.opts[k].map(o => {
      const sel = Fn.ans[k] === o, good = o === C.ok;
      const cls = L ? (good ? ' ok' : sel ? ' bad' : '') : (sel ? ' on' : '');
      return `<button class="opt${cls}" data-act="${L ? 'noop' : 'fineans'}" data-k="${k}" data-val="${esc(o)}"><span>${esc(o)}</span></button>`;
    }).join('');
    return `<section class="card"><p class="eyebrow">Visite de contrôle · plainte ${n + 1}</p><p class="quote">${esc(C.q)}</p><div class="opts">${opts}</div>${L ? `<p class="small">${esc(C.exp)}</p>` : ''}</section>`;
  }).join('');
  const ready = Fn.list.every(k => Fn.ans[k]);
  return `<p class="muted small">Le patient revient après une semaine de port. Ses plaintes découlent de votre réglage.</p>${blocks}
  ${L ? nextBtn('bilan', 'Voir le bilan') : `<button class="btn primary wide" data-act="valfine" ${ready ? '' : 'disabled'}>Valider</button>`}`;
}
ACT.fineans = a => { SIM.fine.ans[a.dataset.k] = a.dataset.val; renderView(); };
ACT.valfine = () => {
  const Fn = SIM.fine;
  const ok = Fn.list.filter(k => Fn.ans[k] === COMPLAINTS[k].ok).length;
  SIM.pts.fine = { pts: Math.round(ok / Fn.list.length * 10), max: 10 };
  SIM.lock.fine = true; finishCase(); renderView();
};

/* ---------- Bilan ---------- */
function finishCase() {
  if (SIM.saved) return;
  const tot = Object.values(SIM.pts).reduce((a, p) => ({ pts: a.pts + p.pts, max: a.max + p.max }), { pts: 0, max: 0 });
  SIM.total = tot; SIM.saved = true;
  const h = Store.get('hist', []);
  h.push({ d: Date.now(), seed: SIM.cs.seed, p: SIM.cs.patho.id, site: SIM.cs.patho.site, kid: SIM.cs.kid, pts: tot.pts, max: tot.max, diag: SIM.ans.patho === SIM.cs.patho.id, cond: SIM.ans.cond === SIM.cs.conduite });
  Store.set('hist', h.slice(-400));
}
function bilanView() {
  const cs = SIM.cs, T = SIM.total || { pts: 0, max: 1 };
  const pc = Math.round(T.pts / T.max * 100);
  const lab = { analyse: 'Analyse et diagnostic', conduite: 'Conduite à tenir', appar: 'Appareillage', fine: 'Réglage fin' };
  const P = cs.patho;
  return `<section class="card score">
    <div class="ring" style="--p:${pc}"><span class="mono">${pc}<small>%</small></span></div>
    <div><p class="eyebrow">Dossier ${cs.seed}</p><h2>${esc(P.nom)}</h2><p class="muted small">${SITES[P.site]} · ${cs.name}, ${cs.ageTxt}</p></div>
  </section>
  <section class="card"><ul class="parts">${Object.entries(SIM.pts).map(([k, p]) => `<li><span>${lab[k]}</span>${pctBar(p.pts / p.max * 100)}<span class="mono">${p.pts}/${p.max}</span></li>`).join('')}</ul></section>
  <section class="card"><h3>À retenir</h3>
    <p><b>Définition.</b> ${esc(P.fiche.def)}</p>
    <p><b>Clinique.</b> ${esc(P.fiche.clin)}</p>
    <p><b>Audiométrie.</b> ${esc(P.fiche.audio)}</p>
    <p><b>Côté prothèse.</b> ${esc(P.fiche.proth)}</p>
  </section>
  <div class="row gap wrap">
    <button class="btn primary big" data-act="newcase">Patient suivant</button>
    <button class="btn" data-act="replay">Rejouer ce dossier</button>
    <button class="btn" data-act="openfiche" data-id="${P.id}">Fiche complète</button>
  </div>`;
}

/* ---------- Lecture express ---------- */
ACT.express = () => { SIM = null; EXP = { n: 0, ok: 0, streak: 0, best: Store.get('expBest', 0) }; nextExpress(); };
function nextExpress() { EXP.cs = generateCase({ pub: SIMF.pub, site: SIMF.site }); EXP.ans = {}; EXP.done = false; renderView(); window.scrollTo(0, 0); }
ACT.expnext = () => nextExpress();
ACT.expans = a => { if (EXP.done) return; EXP.ans[a.dataset.name] = a.dataset.val; renderView(); };
ACT.expval = () => {
  const cs = EXP.cs, A = EXP.ans;
  let good = 0;
  ['R', 'L'].forEach(s => { if (A['type' + s] === cs.type[s]) good++; if (A['deg' + s] === biapCat(cs.biap[s]).k) good++; });
  EXP.done = true; EXP.n++; EXP.good = good;
  if (good === 4) { EXP.ok++; EXP.streak++; } else EXP.streak = 0;
  if (EXP.streak > EXP.best) { EXP.best = EXP.streak; Store.set('expBest', EXP.best); }
  const e = Store.get('expTot', { n: 0, ok: 0 }); e.n++; if (good === 4) e.ok++; Store.set('expTot', e);
  renderView();
};
function expressView() {
  const cs = EXP.cs, A = EXP.ans, D = EXP.done;
  const earQ = s => `<div class="earq"><span class="ear ${s === 'R' ? 'r' : 'l'}">${sideShort(s)}</span>
    ${chipGroup('type' + s, TYPE_OPTS, A['type' + s], D ? 'noop' : 'expans')}
    ${chipGroup('deg' + s, DEG_OPTS, A['deg' + s], D ? 'noop' : 'expans')}
    ${D ? `<p class="fb ${A['type' + s] === cs.type[s] && A['deg' + s] === biapCat(cs.biap[s]).k ? 'ok' : 'bad'}">${TYPE_LAB[cs.type[s]]} · ${biapSub(cs.biap[s])} (${cs.biap[s].toFixed(1)} dB)</p>` : ''}</div>`;
  const ready = ['typeR', 'typeL', 'degR', 'degL'].every(k => A[k]);
  return `<div class="row between"><div><p class="eyebrow">Lecture express</p><p class="mono small">${EXP.ok}/${EXP.n} parfaits · série ${EXP.streak} · record ${EXP.best}</p></div><button class="btn ghost small" data-act="quitcase">Terminer</button></div>
  <section class="card"><div class="agwrap">${audiogramSVG(cs.ears, { show: 'both' })}</div>${agLegend()}<details class="vals"><summary>Valeurs en dB HL</summary>${thrTable(cs.ears)}</details></section>
  <section class="card"><div class="earqs">${earQ('R')}${earQ('L')}</div>
  ${D ? `<p class="small muted">Dossier : ${esc(cs.patho.nom)}.</p>` : ''}</section>
  ${D ? '<button class="btn primary wide" data-act="expnext">Audiogramme suivant</button>' : `<button class="btn primary wide" data-act="expval" ${ready ? '' : 'disabled'}>Valider</button>`}`;
}
