/* ============ OUTILS CLINIQUES : audio, diapason, audiomètre, autotest ============ */
const AU = { ctx: null };
function actx() {
  if (!AU.ctx) { const C = window.AudioContext || window.webkitAudioContext; AU.ctx = new C(); }
  if (AU.ctx.state === 'suspended') AU.ctx.resume();
  return AU.ctx;
}
function routeTo(ctx, ear) {
  const m = ctx.createChannelMerger(2);
  m.connect(ctx.destination);
  const g = ctx.createGain();
  if (ear === 'both') { g.connect(m, 0, 0); g.connect(m, 0, 1); }
  else g.connect(m, 0, ear === 'L' ? 0 : 1);
  return g;
}
const DEF_REF = { 250: -78, 500: -86, 1000: -92, 2000: -92, 3000: -90, 4000: -88, 6000: -82, 8000: -78 };
function getCal() { return Store.get('calib', null); }
function refDB(ear, f) { const c = getCal(); return c && c[ear] && c[ear][f] != null ? c[ear][f] : DEF_REF[f]; }
function maxHL(ear, f) { return Math.floor((-1 - refDB(ear, f)) / 5) * 5; }
const amp = dbfs => Math.pow(10, dbfs / 20);

/* son pur : continu, pulsé ou wobulé ; renvoie une fonction d'arrêt */
function playTone({ f, hl, ear, dur = 1.2, mode = 'pulse' }) {
  const ctx = actx();
  const out = routeTo(ctx, ear);
  const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = f;
  const g = ctx.createGain(); g.gain.value = 0;
  osc.connect(g); g.connect(out);
  const A = Math.min(0.89, amp(refDB(ear === 'both' ? 'R' : ear, f) + hl));
  const t0 = ctx.currentTime + 0.02;
  const r = 0.025;
  if (mode === 'pulse') {
    if (!isFinite(dur)) dur = 60;
    for (let k = 0, t = t0; t < t0 + dur - 0.1; k++, t += 0.4) {
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(A, t + r);
      g.gain.setValueAtTime(A, t + 0.22 - r); g.gain.linearRampToValueAtTime(0, t + 0.22);
    }
  } else {
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(A, t0 + r);
    if (isFinite(dur)) { g.gain.setValueAtTime(A, t0 + dur - r); g.gain.linearRampToValueAtTime(0, t0 + dur); }
  }
  let lfo;
  if (mode === 'warble') {
    lfo = ctx.createOscillator(); lfo.frequency.value = 5;
    const lg = ctx.createGain(); lg.gain.value = f * 0.05;
    lfo.connect(lg); lg.connect(osc.frequency); lfo.start(t0);
  }
  osc.start(t0);
  if (isFinite(dur)) { osc.stop(t0 + dur + 0.05); if (lfo) lfo.stop(t0 + dur + 0.05); }
  return () => {
    const t = ctx.currentTime;
    try { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0, t + r); osc.stop(t + r + 0.02); if (lfo) lfo.stop(t + r + 0.02); } catch (e) { }
  };
}
/* bruit à bande étroite (1/3 d'octave) pour le masquage */
function playNoise({ f, hl, ear }) {
  const ctx = actx();
  const out = routeTo(ctx, ear);
  const len = ctx.sampleRate * 2;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = 4.3;
  const g = ctx.createGain();
  const bw = f * 0.23;
  const comp = 0.707 / (0.577 * Math.sqrt(bw / (ctx.sampleRate / 2)));
  g.gain.value = Math.min(0.5, amp(refDB(ear, f) + hl) * comp);
  src.connect(bp); bp.connect(g); g.connect(out); src.start();
  return { stop: () => { try { src.stop(); } catch (e) { } }, set: v => { g.gain.value = Math.min(0.5, amp(refDB(ear, f) + v) * comp); } };
}

let CLIN = { tab: 'diapason' };
function renderClinic() {
  const tabs = [['diapason', 'Diapason'], ['audiometre', 'Audiomètre'], ['autotest', 'Autotest'], ['etal', 'Étalonnage']];
  let body = '';
  if (CLIN.tab === 'diapason') body = forkView();
  else if (CLIN.tab === 'audiometre') body = audioView();
  else if (CLIN.tab === 'autotest') body = autoView();
  else body = calView();
  return `<section class="hero slim"><p class="eyebrow">Outils de consultation</p><h1>Une première impression, au fauteuil.</h1>
  <p class="lead">Diapason guidé, audiomètre manuel et autotest au casque. Outils de dépistage : ils ne remplacent ni la cabine ni un audiomètre étalonné.</p></section>
  <div class="tabs">${tabs.map(([k, l]) => `<button class="tab${CLIN.tab === k ? ' on' : ''}" data-act="ctab" data-k="${k}">${l}</button>`).join('')}</div>
  <div class="stack">${body}</div>`;
}
ACT.ctab = a => { stopAll(); CLIN.tab = a.dataset.k; renderView(); };
function stopAll() {
  if (FK.stop) FK.stop(); FK.stop = null;
  if (AM.noise) { AM.noise.stop(); AM.noise = null; }
  if (AM.stop) { AM.stop(); AM.stop = null; }
  if (AT.timer) { clearTimeout(AT.timer); AT.timer = null; }
  if (AT.phase === 'run') AT.phase = 'paused';
}

/* ---------- Diapason ---------- */
const FK = { f: 512, ear: 'both', stop: null, raf: 0, t0: 0, w: 'mid', rr: null, rl: null, sch: null, gr: null, gl: null };
function forkView() {
  return `<section class="card">
    <div class="forkrow">
      <svg class="fork" viewBox="0 0 120 220" aria-hidden="true"><g id="tines"><path id="tineL" d="M38 20 v100 q0 22 22 22" fill="none" stroke="var(--steel)" stroke-width="9" stroke-linecap="round"/><path id="tineR" d="M82 20 v100 q0 22 -22 22" fill="none" stroke="var(--steel)" stroke-width="9" stroke-linecap="round"/></g><rect x="55" y="140" width="10" height="70" rx="4" fill="var(--steel)"/><circle cx="60" cy="212" r="7" fill="var(--steel)"/><text x="60" y="190" class="forklab" text-anchor="middle" transform="rotate(-90 60 180)">${FK.f} Hz</text></svg>
      <div class="forkctl">
        <span class="flab">Fréquence</span>${chipGroup('ff', [128, 256, 512, 1024, 2048].map(f => ({ v: String(f), l: f + ' Hz' })), String(FK.f), 'fkpick')}
        <span class="flab">Sortie (casque)</span>${chipGroup('fe', [{ v: 'L', l: 'Gauche' }, { v: 'both', l: 'Les deux' }, { v: 'R', l: 'Droite' }], FK.ear, 'fkpick')}
        <button class="btn primary big" data-act="fkstrike">Frapper le diapason</button>
        <div class="decay"><i id="fkbar" style="width:0%"></i></div>
      </div>
    </div>
    <p class="muted small">Le diapason du téléphone sort en conduction aérienne (casque ou haut-parleur) : il sert à reconnaître les fréquences, faire écouter un son de référence et démontrer la décroissance. Les épreuves de Weber, Rinne et Gellé se pratiquent avec un vrai diapason posé sur l’os ; l’assistant ci-dessous enregistre vos résultats et propose l’interprétation.</p>
  </section>
  <section class="card"><h3>Assistant d’interprétation</h3>
    <span class="flab">Weber (diapason 256 ou 512 Hz sur le front ou le vertex)</span>${chipGroup('w', [{ v: 'L', l: 'Latéralisé à gauche' }, { v: 'mid', l: 'Indifférent' }, { v: 'R', l: 'Latéralisé à droite' }], FK.w, 'fkans')}
    <div class="two">
      <div><span class="ear r">OD</span><span class="flab">Rinne 512 Hz</span>${chipGroup('rr', [{ v: 'pos', l: 'Positif' }, { v: 'neg', l: 'Négatif' }], FK.rr, 'fkans')}<span class="flab">Gellé</span>${chipGroup('gr', [{ v: 'pos', l: 'Positif' }, { v: 'neg', l: 'Négatif' }], FK.gr, 'fkans')}</div>
      <div><span class="ear l">OG</span><span class="flab">Rinne 512 Hz</span>${chipGroup('rl', [{ v: 'pos', l: 'Positif' }, { v: 'neg', l: 'Négatif' }], FK.rl, 'fkans')}<span class="flab">Gellé</span>${chipGroup('gl', [{ v: 'pos', l: 'Positif' }, { v: 'neg', l: 'Négatif' }], FK.gl, 'fkans')}</div>
    </div>
    <span class="flab">Schwabach (comparé à l’examinateur)</span>${chipGroup('sch', [{ v: 'short', l: 'Raccourci' }, { v: 'norm', l: 'Normal' }, { v: 'long', l: 'Allongé' }], FK.sch, 'fkans')}
    <div class="interp">${forkInterp().map(x => `<p class="fb ${x[0]}">${x[1]}</p>`).join('')}</div>
    <div class="row gap"><button class="btn small" data-act="fkreset">Effacer</button><button class="btn small" data-act="fkcopy">Copier le résultat</button></div>
  </section>
  <section class="card"><h3>Rappel des épreuves</h3>
    <details class="fiche"><summary><span>Weber</span></summary><div class="fbody"><p>Diapason vibrant posé sur la ligne médiane (front, vertex, incisives). Le son est perçu au milieu (normal ou atteinte symétrique), du côté de la transmission, ou du côté opposé à la perception (vers la meilleure cochlée).</p></div></details>
    <details class="fiche"><summary><span>Rinne</span></summary><div class="fbody"><p>On compare la conduction osseuse (pied sur la mastoïde) et aérienne (branches devant le conduit). Positif : perçu plus longtemps ou plus fort en aérien (normal ou perception). Négatif : osseux meilleur (transmission d’au moins 20 à 30 dB à 512 Hz). Attention au faux négatif d’une oreille cophotique : masquer l’oreille opposée.</p></div></details>
    <details class="fiche"><summary><span>Gellé</span></summary><div class="fbody"><p>Diapason sur la mastoïde, on fait varier la pression dans le conduit (poire de Politzer ou otoscope pneumatique). Positif (normal) : le son diminue quand la pression augmente. Négatif : pas de variation, chaîne ossiculaire bloquée (otospongiose).</p></div></details>
    <details class="fiche"><summary><span>Schwabach et Bing</span></summary><div class="fbody"><p>Schwabach : durée de perception osseuse comparée à celle de l’examinateur ; allongée en transmission, raccourcie en perception. Bing : occlusion du conduit pendant la stimulation osseuse ; renforcement chez le normal et en perception, pas de changement en transmission.</p></div></details>
  </section>`;
}
ACT.fkpick = a => { if (a.dataset.name === 'ff') FK.f = +a.dataset.val; else FK.ear = a.dataset.val; renderView(); };
ACT.fkans = a => { const k = a.dataset.name; FK[k] = FK[k] === a.dataset.val && k !== 'w' ? null : a.dataset.val; renderView(); };
ACT.fkreset = () => { Object.assign(FK, { w: 'mid', rr: null, rl: null, sch: null, gr: null, gl: null }); renderView(); };
ACT.fkcopy = a => copyText('Acoumétrie au diapason — ' + new Date().toLocaleDateString('fr-FR') + '\n' +
  `Weber : ${{ L: 'latéralisé à gauche', R: 'latéralisé à droite', mid: 'indifférent' }[FK.w]}\nRinne OD : ${FK.rr || 'non testé'} · OG : ${FK.rl || 'non testé'}\nGellé OD : ${FK.gr || '—'} · OG : ${FK.gl || '—'}\nSchwabach : ${FK.sch || '—'}\n` +
  forkInterp().map(x => '• ' + x[1]).join('\n'), a);
function forkInterp() {
  const { w, rr, rl, sch, gr, gl } = FK, o = [];
  const side = s => s === 'R' ? 'droite' : 'gauche';
  if (!rr && !rl) { o.push(['', 'Renseignez au moins le Weber et les deux Rinne pour obtenir une interprétation.']); }
  else if (rr && rl) {
    if (w === 'mid') {
      if (rr === 'pos' && rl === 'pos') o.push(['ok', 'Pas d’argument pour une surdité de transmission : audition normale ou surdité de perception symétrique.']);
      else if (rr === 'neg' && rl === 'neg') o.push(['warn', 'Surdité de transmission bilatérale, à peu près symétrique.']);
      else { const n = rr === 'neg' ? 'R' : 'L'; o.push(['warn', `Rinne négatif ${side(n)} avec Weber indifférent : résultat peu cohérent. Refaire le Weber à 256 Hz, envisager une transmission légère ${side(n)}.`]); }
    } else {
      const lat = w, opp = w === 'R' ? 'L' : 'R';
      const rLat = lat === 'R' ? rr : rl, rOpp = lat === 'R' ? rl : rr;
      if (rLat === 'neg' && rOpp === 'pos') o.push(['warn', `Surdité de transmission ${side(lat)}.`]);
      else if (rLat === 'neg' && rOpp === 'neg') o.push(['warn', `Surdité de transmission bilatérale, plus marquée à ${side(lat)}.`]);
      else if (rLat === 'pos' && rOpp === 'pos') o.push(['warn', `Surdité de perception ${side(opp)} (le Weber part vers la meilleure cochlée).`]);
      else if (rLat === 'pos' && rOpp === 'neg') o.push(['bad', `Rinne négatif ${side(opp)} alors que le Weber va à ${side(lat)} : évoque une cophose ${side(opp)} (faux Rinne négatif, le son est perçu par l’oreille ${side(lat)}). Refaire le Rinne en masquant l’oreille ${side(lat)}, puis audiométrie.`]);
    }
  } else o.push(['', 'Renseignez le Rinne des deux côtés.']);
  if (gr === 'neg') o.push(['warn', 'Gellé négatif à droite : blocage ossiculaire (otospongiose ?).']);
  if (gl === 'neg') o.push(['warn', 'Gellé négatif à gauche : blocage ossiculaire (otospongiose ?).']);
  if (sch === 'long') o.push(['', 'Schwabach allongé : en faveur d’une transmission.']);
  if (sch === 'short') o.push(['', 'Schwabach raccourci : en faveur d’une perception.']);
  if (o.some(x => x[0] === 'warn' || x[0] === 'bad')) o.push(['', 'Une anomalie à l’acoumétrie justifie une audiométrie tonale et vocale complète et, selon le contexte, un avis ORL.']);
  return o;
}
ACT.fkstrike = () => {
  if (FK.stop) FK.stop();
  const ctx = actx();
  const out = routeTo(ctx, FK.ear);
  const t0 = ctx.currentTime + 0.01, T = 14, tau = 3.2;
  const osc = ctx.createOscillator(); osc.frequency.value = FK.f;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.35, t0 + 0.004);
  g.gain.setTargetAtTime(0.0001, t0 + 0.004, tau);
  osc.connect(g); g.connect(out); osc.start(t0); osc.stop(t0 + T);
  // son de frappe : partiel élevé très bref (≈ 6,25 × f)
  const cl = ctx.createOscillator(); cl.frequency.value = Math.min(FK.f * 6.25, 16000);
  const cg = ctx.createGain(); cg.gain.setValueAtTime(0.12, t0); cg.gain.setTargetAtTime(0.0001, t0, 0.03);
  cl.connect(cg); cg.connect(out); cl.start(t0); cl.stop(t0 + 0.5);
  FK.t0 = performance.now();
  cancelAnimationFrame(FK.raf);
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const step = () => {
    const t = (performance.now() - FK.t0) / 1000;
    const a = Math.exp(-t / tau);
    const bar = $('#fkbar'); if (bar) bar.style.width = (a * 100).toFixed(1) + '%';
    const L = $('#tineL'), R = $('#tineR');
    if (L && R && !reduce) { const d = Math.sin(t * 60) * 3 * a; L.setAttribute('transform', `translate(${-d} 0)`); R.setAttribute('transform', `translate(${d} 0)`); }
    if (t < T && a > 0.003) FK.raf = requestAnimationFrame(step);
    else if (L && R) { L.removeAttribute('transform'); R.removeAttribute('transform'); }
  };
  FK.raf = requestAnimationFrame(step);
  FK.stop = () => { try { g.gain.cancelScheduledValues(ctx.currentTime); g.gain.setTargetAtTime(0, ctx.currentTime, 0.02); osc.stop(ctx.currentTime + 0.2); } catch (e) { } };
};

/* ---------- Audiomètre manuel ---------- */
const AM = { ear: 'R', fi: 2, hl: 30, mode: 'pulse', mask: false, mhl: 40, stop: null, noise: null, res: { R: { ac: F.map(() => null), acNR: F.map(() => false) }, L: { ac: F.map(() => null), acNR: F.map(() => false) } } };
function audioView() {
  const f = F[AM.fi], mx = maxHL(AM.ear, f);
  const cal = getCal();
  return `${calBanner(cal)}
  <section class="card">
    <div class="row between"><div class="eartabs">${['R', 'L'].map(s => `<button class="eartab ${s === 'R' ? 'r' : 'l'}${AM.ear === s ? ' on' : ''}" data-act="amear" data-val="${s}">Oreille ${sideName(s)}</button>`).join('')}</div></div>
    <span class="flab">Fréquence</span>
    <div class="chips">${F.map((x, i) => `<button class="chip${AM.fi === i ? ' on' : ''}" data-act="amf" data-i="${i}">${fLabel(x)}</button>`).join('')}</div>
    <div class="levelbox">
      <button class="btn" data-act="amlvl" data-d="-10">−10</button><button class="btn" data-act="amlvl" data-d="-5">−5</button>
      <div class="lvl"><span class="mono" id="amhl">${AM.hl}</span><small>dB HL</small><small class="muted">max ${mx}</small></div>
      <button class="btn" data-act="amlvl" data-d="5">+5</button><button class="btn" data-act="amlvl" data-d="10">+10</button>
    </div>
    ${chipGroup('mode', [{ v: 'pulse', l: 'Pulsé' }, { v: 'cont', l: 'Continu' }, { v: 'warble', l: 'Wobulé' }], AM.mode, 'ammode')}
    <button class="btn primary big wide send ${AM.ear === 'R' ? 'r' : 'l'}" id="amsend" data-hold="1">Maintenir pour émettre</button>
    <div class="row gap wrap"><button class="btn" data-act="amrec">Noter le seuil (${AM.hl} dB)</button><button class="btn" data-act="amnr">Pas de réponse</button></div>
    <div class="maskrow"><label class="tog"><input type="checkbox" id="ammask" data-chg="ammask" ${AM.mask ? 'checked' : ''}> Masquage oreille ${sideName(AM.ear === 'R' ? 'L' : 'R')}</label>
      ${AM.mask ? `<button class="btn small" data-act="ammlvl" data-d="-5">−5</button><span class="mono">${AM.mhl} dB</span><button class="btn small" data-act="ammlvl" data-d="5">+5</button>` : ''}</div>
    <p class="muted small">Bruit à bande étroite (1/3 d’octave) dans l’autre écouteur. Avec des écouteurs de téléphone, l’atténuation interaurale est faible : un masquage vrai n’est pas garanti.</p>
  </section>
  <section class="card"><h3>Audiogramme du patient</h3><div class="agwrap">${audiogramSVG(AM.res, { noBC: true })}</div>${agLegend()}
    ${resSummary(AM.res)}
    <div class="row gap"><button class="btn small" data-act="amclear">Effacer</button><button class="btn small" data-act="amcopy">Copier le compte rendu</button></div></section>`;
}
ACT.amear = a => { AM.ear = a.dataset.val; AM.hl = Math.min(AM.hl, maxHL(AM.ear, F[AM.fi])); if (AM.noise) { AM.noise.stop(); AM.noise = null; AM.mask = false; } renderView(); };
ACT.amf = a => { AM.fi = +a.dataset.i; AM.hl = Math.min(AM.hl, maxHL(AM.ear, F[AM.fi])); if (AM.noise) { AM.noise.stop(); AM.noise = null; startMask(); } renderView(); };
ACT.amlvl = a => { AM.hl = clamp(AM.hl + (+a.dataset.d), -10, maxHL(AM.ear, F[AM.fi])); const el = $('#amhl'); if (el) el.textContent = AM.hl; const b = $('[data-act="amrec"]'); if (b) b.textContent = `Noter le seuil (${AM.hl} dB)`; };
ACT.ammode = a => { AM.mode = a.dataset.val; renderView(); };
function startMask() { const o = AM.ear === 'R' ? 'L' : 'R'; AM.noise = playNoise({ f: F[AM.fi], hl: AM.mhl, ear: o }); }
ACT.ammask = a => { AM.mask = a.checked; if (AM.mask) startMask(); else if (AM.noise) { AM.noise.stop(); AM.noise = null; } renderView(); };
ACT.ammlvl = a => { AM.mhl = clamp(AM.mhl + (+a.dataset.d), 0, 90); if (AM.noise) AM.noise.set(AM.mhl); renderView(); };
ACT.amrec = () => { AM.res[AM.ear].ac[AM.fi] = AM.hl; AM.res[AM.ear].acNR[AM.fi] = false; toast(`Seuil noté : ${sideShort(AM.ear)} ${fLabel(F[AM.fi])} Hz, ${AM.hl} dB HL`); renderView(); };
ACT.amnr = () => { AM.res[AM.ear].ac[AM.fi] = maxHL(AM.ear, F[AM.fi]); AM.res[AM.ear].acNR[AM.fi] = true; renderView(); };
ACT.amclear = () => { ['R', 'L'].forEach(s => { AM.res[s].ac = F.map(() => null); AM.res[s].acNR = F.map(() => false); }); renderView(); };
ACT.amcopy = a => copyText(reportText(AM.res, 'Audiométrie tonale (audiomètre de l’application, conduction aérienne)'), a);
document.addEventListener('pointerdown', e => {
  const b = e.target.closest('#amsend'); if (!b) return;
  e.preventDefault();
  if (AM.stop) AM.stop();
  AM.stop = playTone({ f: F[AM.fi], hl: AM.hl, ear: AM.ear, dur: AM.mode === 'pulse' ? 60 : Infinity, mode: AM.mode });
  b.classList.add('live');
  const up = () => { if (AM.stop) AM.stop(); AM.stop = null; b.classList.remove('live'); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); };
  window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
});

function resSummary(res) {
  const line = s => {
    const e = res[s];
    const need = [1, 2, 3, 5];
    if (need.some(i => e.ac[i] == null)) return `<p class="small"><span class="ear ${s === 'R' ? 'r' : 'l'}">${sideShort(s)}</span> Mesurer 500, 1000, 2000 et 4000 Hz pour la moyenne.</p>`;
    const p = biapAvg(e);
    return `<p class="small"><span class="ear ${s === 'R' ? 'r' : 'l'}">${sideShort(s)}</span> Moyenne ${p.toFixed(1)} dB → ${biapSub(p)}</p>`;
  };
  let asym = '';
  const both = [1, 2, 3, 4, 5].filter(i => res.R.ac[i] != null && res.L.ac[i] != null);
  const big = both.filter(i => Math.abs(res.R.ac[i] - res.L.ac[i]) >= 15);
  if (big.length >= 2) asym = `<p class="fb warn">Asymétrie de 15 dB ou plus sur ${big.map(i => fLabel(F[i])).join(', ')} Hz : avis ORL recommandé.</p>`;
  return `<div class="summary">${line('R')}${line('L')}${asym}</div>`;
}
function reportText(res, title) {
  const cal = getCal();
  let t = `${title} — ${new Date().toLocaleDateString('fr-FR')}\n`;
  t += cal ? `Étalonnage biologique du ${new Date(cal.date).toLocaleDateString('fr-FR')} (${cal.label || 'casque non précisé'})\n` : 'Appareil non étalonné : niveaux indicatifs\n';
  ['R', 'L'].forEach(s => {
    t += `${sideShort(s)} : ` + F.map((f, i) => res[s].ac[i] == null ? null : `${fLabel(f)} ${res[s].acNR[i] ? '≥' : ''}${res[s].ac[i]}`).filter(Boolean).join(' · ');
    if ([1, 2, 3, 5].every(i => res[s].ac[i] != null)) { const p = biapAvg(res[s]); t += ` → moyenne ${p.toFixed(1)} dB (${biapSub(p)})`; }
    t += '\n';
  });
  t += 'Dépistage en conduction aérienne seule : ne distingue pas transmission et perception. À confirmer par une audiométrie complète.';
  return t;
}
function calBanner(cal) {
  return cal ? `<p class="note">Étalonnage biologique actif (${esc(cal.label || 'casque non précisé')}, ${new Date(cal.date).toLocaleDateString('fr-FR')}). Gardez le même casque et le même volume.</p>`
    : `<p class="note warn">Non étalonné : les niveaux en dB HL sont estimés. Faites l’étalonnage biologique avec le casque utilisé pour des valeurs comparables.</p>`;
}

/* ---------- Autotest automatique ---------- */
const AT = { phase: 'setup', set: 'std', calib: false, timer: null };
const AT_SETS = { std: [1000, 2000, 4000, 500], full: [1000, 2000, 3000, 4000, 6000, 8000, 500, 250] };
function autoView() {
  if (AT.phase === 'setup' || !AT.res) return atSetup();
  if (AT.phase === 'done') return atDone();
  const fi = AT.order[AT.k];
  const prog = Math.round(AT.k / AT.order.length * 100);
  return `<section class="card atrun">
    <p class="eyebrow">${AT.calib ? 'Étalonnage en cours' : 'Autotest en cours'} · ${prog} %</p>
    <div class="pbar"><i class="ok" style="width:${prog}%"></i></div>
    <p class="mono small">${fi ? `Oreille ${sideName(fi.ear)} · ${fLabel(fi.f)} Hz` : ''}</p>
    <button class="hearbtn ${fi && fi.ear === 'R' ? 'r' : 'l'}" id="hearbtn" data-act="heard">J’entends</button>
    <p class="muted small">Appuyez dès que vous percevez les bips, même très faibles. Certains essais sont silencieux.</p>
    <div class="row gap"><button class="btn small" data-act="${AT.phase === 'paused' ? 'atresume' : 'atpause'}">${AT.phase === 'paused' ? 'Reprendre' : 'Pause'}</button><button class="btn small ghost" data-act="atstop">Arrêter</button></div>
  </section>`;
}
function atSetup() {
  const cal = getCal();
  return `${calBanner(cal)}
  <section class="card"><h3>Avant de commencer</h3>
    <ol class="bul"><li>Casque ou écouteurs filaires de préférence (le Bluetooth peut couper les sons faibles), bien insérés, côté droit/gauche respecté.</li>
    <li>Volume du téléphone au maximum, égaliseur et effets audio désactivés, mode Ne pas déranger.</li><li>Pièce calme : le bruit ambiant relève les seuils.</li><li>Expliquer au patient : appuyer dès qu’il entend, même faiblement.</li></ol>
    <div class="row gap wrap"><button class="btn small" data-act="lrcheck" data-ear="L">Tester l’écouteur gauche</button><button class="btn small" data-act="lrcheck" data-ear="R">Tester l’écouteur droit</button></div>
    <span class="flab">Fréquences</span>${chipGroup('set', [{ v: 'std', l: '500 à 4000 Hz (≈ 5 min)' }, { v: 'full', l: '250 à 8000 Hz (≈ 10 min)' }], AT.set, 'atset')}
    <button class="btn primary big wide" data-act="atstart">Lancer l’autotest</button>
  </section>
  ${AT.last ? `<section class="card"><h3>Dernier résultat</h3><div class="agwrap">${audiogramSVG(AT.last.res, { noBC: true })}</div>${resSummary(AT.last.res)}</section>` : ''}
  <section class="card"><h3>Comment ça marche</h3><p class="small">Méthode ascendante automatisée : −10 dB après chaque réponse, +5 dB sinon ; le seuil retenu est le niveau le plus faible entendu deux fois en montée. Des essais silencieux mesurent les fausses alertes ; une fiabilité faible est signalée.</p></section>`;
}
ACT.atset = a => { AT.set = a.dataset.val; renderView(); };
ACT.lrcheck = a => { playTone({ f: 1000, hl: 50, ear: a.dataset.ear, dur: 1.2, mode: 'pulse' }); toast('Bips envoyés à ' + (a.dataset.ear === 'R' ? 'droite' : 'gauche')); };
ACT.atstart = () => atBegin(false);
function atBegin(calib) {
  actx();
  AT.calib = calib;
  const fs = calib ? F.slice() : AT_SETS[AT.set];
  AT.order = [];
  ['R', 'L'].forEach(ear => fs.forEach(f => AT.order.push({ ear, f })));
  AT.order.push({ ear: 'R', f: 1000, retest: true });
  AT.k = 0; AT.fa = 0; AT.trials = 0; AT.catch = 0;
  AT.res = { R: { ac: F.map(() => null), acNR: F.map(() => false) }, L: { ac: F.map(() => null), acNR: F.map(() => false) } };
  AT.retest = null;
  AT.phase = 'run';
  try { navigator.wakeLock && navigator.wakeLock.request('screen').then(l => { AT.lock = l; }).catch(() => { }); } catch (e) { }
  atInitFreq();
  renderView();
  atSchedule();
}
function atInitFreq() { AT.st = { level: 40, prevHeard: null, asc: {}, n: 0 }; }
function atSchedule() {
  if (AT.phase !== 'run') return;
  const isi = 1300 + Math.random() * 1800;
  AT.timer = setTimeout(atPresent, isi);
}
function atPresent() {
  if (AT.phase !== 'run') return;
  const it = AT.order[AT.k];
  const mx = maxHL(it.ear, it.f);
  AT.st.level = clamp(AT.st.level, -10, mx);
  const silent = Math.random() < 0.1 && AT.st.n > 1;
  AT.win = { open: true, silent, heard: false };
  if (!silent) playTone({ f: it.f, hl: AT.st.level, ear: it.ear, dur: 1.2, mode: 'pulse' });
  AT.trials++;
  AT.timer = setTimeout(atClose, 2300);
}
ACT.heard = () => {
  const b = $('#hearbtn'); if (b) { b.classList.add('tap'); setTimeout(() => b.classList.remove('tap'), 150); }
  if (AT.phase !== 'run') return;
  if (AT.win && AT.win.open) { if (AT.win.silent) AT.fa++; else AT.win.heard = true; }
  else AT.fa++;
};
function atClose() {
  if (AT.phase !== 'run') return;
  const w = AT.win; w.open = false;
  if (w.silent) { AT.catch++; atSchedule(); return; }
  const st = AT.st, it = AT.order[AT.k], mx = maxHL(it.ear, it.f);
  st.n++;
  const heard = w.heard;
  let thr = null, nr = false;
  if (heard) st.ever = true;
  // présentation atteinte en montée : on compte les réponses à ce niveau
  if (st.prevHeard === false && st.ever) {
    const a = st.asc[st.level] || (st.asc[st.level] = { n: 0, h: 0 });
    a.n++; if (heard) a.h++;
    if (a.h >= 2) thr = st.level;
  }
  if (thr == null) {
    if (heard) {
      if (st.level <= -10) { st.floor = (st.floor || 0) + 1; if (st.floor >= 2) thr = -10; }
      st.level = Math.max(-10, st.level - 10);
    } else {
      if (st.level >= mx) { st.maxMiss = (st.maxMiss || 0) + 1; if (st.maxMiss >= 2) { thr = mx; nr = true; } }
      st.level = Math.min(mx, st.level + (st.ever ? 5 : 15));
    }
  }
  st.prevHeard = heard;
  if (thr == null && st.n >= 28) {
    const lv = Object.keys(st.asc).map(Number).filter(l => st.asc[l].h / st.asc[l].n >= 0.5).sort((x, y) => x - y);
    thr = lv.length ? lv[0] : st.level;
  }
  if (thr != null) {
    const i = F.indexOf(it.f);
    if (it.retest) AT.retest = { first: AT.res.R.ac[i], second: thr };
    else { AT.res[it.ear].ac[i] = thr; AT.res[it.ear].acNR[i] = nr; }
    AT.k++;
    if (AT.k >= AT.order.length) return atFinish();
    atInitFreq();
    renderView();
  }
  atSchedule();
}
ACT.atpause = () => { if (AT.timer) clearTimeout(AT.timer); AT.phase = 'paused'; renderView(); };
ACT.atresume = () => { AT.phase = 'run'; atInitFreq(); renderView(); atSchedule(); };
ACT.atstop = () => { if (AT.timer) clearTimeout(AT.timer); AT.phase = 'setup'; AT.res = null; try { AT.lock && AT.lock.release(); } catch (e) { } renderView(); };
function atFinish() {
  if (AT.timer) clearTimeout(AT.timer);
  try { AT.lock && AT.lock.release(); } catch (e) { }
  if (AT.calib) {
    const cal = { date: Date.now(), label: (CAL.label || '').trim(), R: {}, L: {} };
    ['R', 'L'].forEach(s => F.forEach((f, i) => { cal[s][f] = refDB(s, f) + (AT.res[s].ac[i] != null ? AT.res[s].ac[i] : 0); }));
    Store.set('calib', cal);
    AT.phase = 'setup'; AT.res = null; AT.calib = false;
    CLIN.tab = 'etal'; CAL.done = true; renderView(); return;
  }
  AT.phase = 'done';
  AT.last = { res: AT.res, d: Date.now() };
  const hist = Store.get('autotests', []); hist.push({ d: Date.now(), res: AT.res, fa: AT.fa, trials: AT.trials }); Store.set('autotests', hist.slice(-30));
  renderView();
}
function atDone() {
  const faRate = AT.trials ? AT.fa / AT.trials : 0;
  const rt = AT.retest;
  const rel = faRate > 0.2 || (rt && rt.first != null && Math.abs(rt.first - rt.second) > 10) ? 'bad' : faRate > 0.1 ? 'warn' : 'ok';
  return `<section class="card"><h3>Résultat de l’autotest</h3>
    <div class="agwrap">${audiogramSVG(AT.res, { noBC: true })}</div>${agLegend()}
    ${resSummary(AT.res)}
    <p class="fb ${rel}">Fiabilité : ${rel === 'ok' ? 'bonne' : rel === 'warn' ? 'moyenne' : 'douteuse'} · fausses alertes ${Math.round(faRate * 100)} %${rt && rt.first != null ? ` · retest 1 kHz OD : ${rt.first} puis ${rt.second} dB` : ''}.</p>
    <p class="small">Première impression seulement : conduction aérienne, sans masquage, ${getCal() ? 'étalonnage biologique' : 'sans étalonnage'}. Toute perte, asymétrie ou plainte justifie une audiométrie complète en cabine et l’otoscopie.</p>
    <div class="row gap wrap"><button class="btn small" data-act="atcopy">Copier le compte rendu</button><button class="btn small" data-act="atstop">Nouveau test</button></div>
  </section>`;
}
ACT.atcopy = a => copyText(reportText(AT.res, 'Autotest auditif automatisé (conduction aérienne)'), a);

/* ---------- Étalonnage biologique ---------- */
const CAL = { label: '', done: false };
function calView() {
  const cal = getCal();
  const rows = cal ? F.map(f => `<tr><th>${fLabel(f)}</th><td>${cal.R[f].toFixed(0)}</td><td>${cal.L[f].toFixed(0)}</td><td>${Math.min(maxHL('R', f), maxHL('L', f))}</td></tr>`).join('') : '';
  return `<section class="card"><h3>Étalonnage biologique</h3>
    <p class="small">Un téléphone et un casque ne sont pas étalonnés. On mesure donc une fois les seuils d’une personne jeune à l’audition normale, dans une pièce calme, avec <b>le casque et le volume qui serviront ensuite</b>. Ses seuils deviennent la référence 0 dB HL de l’appareil.</p>
    ${CAL.done ? '<p class="fb ok">Étalonnage enregistré. Les niveaux de l’audiomètre et de l’autotest en tiennent compte.</p>' : ''}
    <label class="flab" for="calLabel">Casque utilisé</label><input id="calLabel" class="inp" data-inp="callabel" placeholder="Ex. écouteurs filaires du cabinet" value="${esc(CAL.label)}">
    <div class="row gap wrap"><button class="btn primary" data-act="calstart">Lancer l’étalonnage (8 fréquences, 2 oreilles)</button>${cal ? '<button class="btn ghost" data-act="calreset">Revenir aux valeurs estimées</button>' : ''}</div>
    <p class="muted small">Pour une meilleure référence, refaites-le avec deux ou trois personnes normo-entendantes et gardez une valeur cohérente. Limite : la sortie maximale du téléphone plafonne les niveaux forts (colonne « max »).</p>
  </section>
  ${cal ? `<section class="card"><h3>Référence actuelle</h3><div class="tscroll"><table class="tbl"><thead><tr><th>Hz</th><th>OD dBFS</th><th>OG dBFS</th><th>max dB HL</th></tr></thead><tbody>${rows}</tbody></table></div></section>` : ''}`;
}
INP.callabel = a => { CAL.label = a.value; };
ACT.calstart = () => { CAL.done = false; CLIN.tab = 'autotest'; atBegin(true); };
ACT.calreset = () => { Store.set('calib', null); CAL.done = false; renderView(); };
