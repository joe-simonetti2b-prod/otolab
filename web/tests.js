/* ============ ONGLET TESTS : atlas, patient virtuel, dépistage, quiz ============ */
const NIV = { base: 'Essentiel', 'avancé': 'Approfondi' };
function testsStop() { animStop(); ambStop(); if (TS.topo && TS.topo.sisiTimer) clearTimeout(TS.topo.sisiTimer); }
function renderTests() {
  if (TS.open) return testView(TESTS.find(t => t.id === TS.open));
  if (TS.sim) return simView(TS.sim);
  const tabs = [['atlas', 'Atlas'], ['sim', 'Patient virtuel'], ['depist', 'Dépistage'], ['quiz', 'Quiz']];
  let body = '';
  if (TS.tab === 'atlas') body = atlasView();
  else if (TS.tab === 'sim') body = simsList();
  else if (TS.tab === 'depist') body = depistHub();
  else body = tsQuizView();
  return `<section class="hero slim"><p class="eyebrow">Tests audiologiques</p><h1>Chaque test, pas à pas.</h1>
  <p class="lead">${TESTS.length} fiches avec schéma animé et commenté, des patients virtuels pour s’exercer, et des outils de dépistage utilisables au cabinet.</p></section>
  <div class="tabs">${tabs.map(([k, l]) => `<button class="tab${TS.tab === k ? ' on' : ''}" data-act="tstab" data-k="${k}">${l}</button>`).join('')}</div>
  <div class="stack">${body}</div>`;
}
ACT.tstab = a => { TS.tab = a.dataset.k; renderView(); };
ACT.tsback = () => { testsStop(); if (TS.open) TS.open = null; else TS.sim = null; renderView(); window.scrollTo(0, TS._sy || 0); };
ACT.tsopen = a => { testsStop(); TS._sy = TS.open || TS.sim ? 0 : window.scrollY; TS.sim = null; TS.open = a.dataset.id; if (TAB !== 'tests') goTab('tests'); else { renderView(); window.scrollTo(0, 0); } };
ACT.tssim = a => {
  const k = a.dataset.k;
  if (k === 'cab') { testsStop(); TS.open = null; goTab('cab'); return; }
  testsStop(); TS._sy = window.scrollY; TS.open = null; TS.sim = k;
  ({ acou: acouNew, rainville: rvNew, topo: topoNew, stenger: stNew, bruit: bnNew, balayage: bsNew, chuchote: chNew, vpp: () => { TS.vpp = null; }, ambiant: () => { } })[k]();
  if (TAB !== 'tests') goTab('tests'); else { renderView(); window.scrollTo(0, 0); }
};
function simView(k) {
  switch (k) {
    case 'acou': return acouView(); case 'rainville': return rvView(); case 'topo': return topoView();
    case 'stenger': return stView(); case 'bruit': return bnView(); case 'balayage': return bsView();
    case 'chuchote': return chView(); case 'vpp': return vppView(); case 'ambiant': return ambView();
  }
  return '';
}

/* ---------- Atlas ---------- */
function atlasView() {
  const q = TS.q.trim().toLowerCase();
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const match = t => !q || norm(t.nom + ' ' + t.court + ' ' + t.but).includes(norm(q));
  const list = TESTS.filter(t => (TS.cat === 'all' || t.cat === TS.cat) && match(t));
  const seen = Store.get('tsSeen', {});
  const cats = TCATS.filter(c => TS.cat === 'all' || c.k === TS.cat);
  const chips = [{ v: 'all', l: 'Tout' }].concat(TCATS.map(c => ({ v: c.k, l: `${c.l} ${TESTS.filter(t => t.cat === c.k).length}` })));
  const groups = cats.map(c => {
    const items = list.filter(t => t.cat === c.k);
    if (!items.length) return '';
    return `<h3 class="gtitle">${c.l} <span class="muted">· ${c.d}</span></h3><div class="tlist">${items.map(t => `
      <button class="titem" data-act="tsopen" data-id="${t.id}">
        <span class="tmain"><b>${esc(t.nom)}</b><small>${esc(t.court)}</small></span>
        <span class="tmeta">${seen[t.id] ? '<i class="tseen" title="Vue">✓</i>' : ''}<em class="niv ${t.niv === 'base' ? 'b' : 'a'}">${NIV[t.niv]}</em>${t.sim && t.sim !== 'cab' ? '<em class="niv s">Simulateur</em>' : ''}</span>
      </button>`).join('')}</div>`;
  }).join('');
  const n = Object.keys(seen).length;
  return `<section class="card"><label class="flab" for="tsQ">Rechercher un test</label><input id="tsQ" class="inp" data-inp="tsq" placeholder="Rinne, Rainville, Lafon, OEA, dépistage…" value="${esc(TS.q)}">
  <div class="chips" style="margin-top:8px">${chips.map(c => `<button class="chip${TS.cat === c.v ? ' on' : ''}" data-act="tscat" data-val="${c.v}">${c.l}</button>`).join('')}</div>
  <p class="muted small">${n} / ${TESTS.length} fiches consultées</p></section>
  ${groups || '<section class="card"><p class="small">Aucun test ne correspond à cette recherche.</p></section>'}`;
}
INP.tsq = a => { TS.q = a.value; const pos = a.selectionStart; renderView(); const el = $('#tsQ'); if (el) { el.focus(); try { el.setSelectionRange(pos, pos); } catch (e) { } } };
ACT.tscat = a => { TS.cat = a.dataset.val; renderView(); };

/* ---------- Fiche d'un test ---------- */
function testView(t) {
  if (!t) { TS.open = null; return renderTests(); }
  const seen = Store.get('tsSeen', {}); if (!seen[t.id]) { seen[t.id] = Date.now(); Store.set('tsSeen', seen); }
  const idx = TESTS.indexOf(t), prev = TESTS[idx - 1], next = TESTS[idx + 1];
  const cat = TCATS.find(c => c.k === t.cat);
  const simInfo = t.sim ? (SIMS.find(s => s.k === t.sim) || DTOOLS.find(s => s.k === t.sim)) : null;
  const qz = (TS.qa && TS.qa.id === t.id) ? TS.qa : (TS.qa = { id: t.id, sel: {} , order: t.quiz.map(q => makeRng(t.id.length * 31 + q.q.length).shuffle(q.o)) });
  return `<div class="row between"><button class="btn ghost small" data-act="tsback">← Atlas</button><span class="chip static">${cat.l}</span></div>
  <section class="hero slim"><p class="eyebrow">${NIV[t.niv]}</p><h1>${esc(t.nom)}</h1><p class="lead">${esc(t.court)}</p></section>
  ${animHTML(t.id, t.anim)}
  <section class="card"><dl class="kv"><dt>But</dt><dd>${esc(t.but)}</dd><dt>Matériel</dt><dd>${esc(t.mat)}</dd></dl></section>
  <section class="card"><h3>Déroulé</h3><ol class="steps-ol">${t.etapes.map(e => `<li>${esc(e)}</li>`).join('')}</ol></section>
  <section class="card"><h3>Interprétation</h3><div class="tscroll"><table class="tbl itbl"><tbody>${t.interp.map(([a, b]) => `<tr><th>${esc(a)}</th><td>${esc(b)}</td></tr>`).join('')}</tbody></table></div></section>
  <section class="card"><h3>Pièges</h3><ul class="bul">${t.pieges.map(p => `<li>${esc(p)}</li>`).join('')}</ul></section>
  <p class="note"><b>À retenir.</b> ${esc(t.retenir)}</p>
  <div class="row gap wrap">
    ${simInfo ? `<button class="btn primary" data-act="tssim" data-k="${t.sim}">S’exercer : ${esc(simInfo.t)}</button>` : ''}
    <a class="btn" href="https://www.youtube.com/results?search_query=${encodeURIComponent(t.video)}" target="_blank" rel="noopener">Vidéos de démonstration ↗</a>
  </div>
  <section class="card"><h3>Testez-vous</h3>${t.quiz.map((q, k) => {
    const sel = qz.sel[k];
    return `<div class="qblock"><p class="qtxt">${esc(q.q)}</p><div class="opts">${qz.order[k].map(o => {
      const cls = sel == null ? '' : o === q.o[0] ? ' ok' : o === sel ? ' bad' : '';
      return `<button class="opt${cls}" data-act="${sel == null ? 'tsqa' : 'noop'}" data-k="${k}" data-val="${esc(o)}"><span>${esc(o)}</span></button>`;
    }).join('')}</div>${sel != null ? `<p class="small">${esc(q.e)}</p>` : ''}</div>`;
  }).join('')}</section>
  <div class="row between">${prev ? `<button class="btn small" data-act="tsopen" data-id="${prev.id}">← ${esc(prev.nom.length > 28 ? prev.nom.slice(0, 26) + '…' : prev.nom)}</button>` : '<span></span>'}${next ? `<button class="btn small" data-act="tsopen" data-id="${next.id}">${esc(next.nom.length > 28 ? next.nom.slice(0, 26) + '…' : next.nom)} →</button>` : ''}</div>`;
}
ACT.tsqa = a => { TS.qa.sel[+a.dataset.k] = a.dataset.val; const sy = window.scrollY; renderView(); window.scrollTo(0, sy); };

/* ---------- Patient virtuel ---------- */
function simsList() {
  const sc = Store.get('tsScores', {});
  return `<div class="simgrid">${SIMS.map(s => { const x = sc[s.k]; return `<button class="simcard" data-act="tssim" data-k="${s.k}"><b>${esc(s.t)}</b><small>${esc(s.d)}</small>${x ? `<span class="mono muted">${x.runs} séance${x.runs > 1 ? 's' : ''} · ${Math.round(x.ok / Math.max(1, x.n) * 100)} %</span>` : ''}</button>`; }).join('')}</div>`;
}

/* ---------- Dépistage ---------- */
function depistHub() {
  const fiches = TESTS.filter(t => t.cat === 'depist');
  return `<section class="card"><h3>Outils de dépistage</h3><p class="muted small">Utilisables avec un patient. Le son passe par le casque, avec l’étalonnage de l’onglet Clinique.</p>
  <div class="simgrid">${DTOOLS.map(s => `<button class="simcard" data-act="tssim" data-k="${s.k}"><b>${esc(s.t)}</b><small>${esc(s.d)}</small></button>`).join('')}</div></section>
  <section class="card"><h3>Les fiches dépistage</h3><div class="tlist">${fiches.map(t => `<button class="titem" data-act="tsopen" data-id="${t.id}"><span class="tmain"><b>${esc(t.nom)}</b><small>${esc(t.court)}</small></span></button>`).join('')}</div></section>
  <section class="card"><h3>Signes d’alerte : orientation médicale, quel que soit le test</h3><ul class="bul">
  <li>Surdité brutale (installée en moins de 72 h) : urgence ORL le jour même.</li><li>Otorrhée, otalgie, conduit ou tympan anormal.</li><li>Asymétrie, acouphène unilatéral ou pulsatile.</li><li>Vertiges associés.</li><li>Enfant : inquiétude des parents, retard de langage, méningite, traumatisme crânien.</li></ul></section>`;
}

/* ---------- Quiz ---------- */
function tsQuizView() {
  const Q = TS.quiz;
  if (!Q) {
    const best = Store.get('tsQuiz', null);
    return `<section class="card"><h3>Série de 12 questions</h3><p class="muted small">Tirées des ${TESTS.reduce((a, t) => a + t.quiz.length, 0)} questions des fiches.</p>
    <span class="flab">Thème</span>${chipGroup('tsqcat', [{ v: 'all', l: 'Tous les tests' }].concat(TCATS.map(c => ({ v: c.k, l: c.l }))), TS.qcat || 'all', 'tsqcat')}
    ${best ? `<p class="small">Dernière série : <b>${best.ok}/${best.n}</b></p>` : ''}<button class="btn primary" data-act="tsqstart">Commencer</button></section>`;
  }
  if (Q.i >= Q.list.length) return `<section class="card score"><div class="ring" style="--p:${Math.round(Q.ok / Q.list.length * 100)}"><span class="mono">${Q.ok}<small>/${Q.list.length}</small></span></div><div><h2>Série terminée</h2><p class="muted small">Chaque question renvoie à sa fiche.</p></div></section><button class="btn primary wide" data-act="tsqstart">Nouvelle série</button><button class="btn wide" data-act="tsqreset">Changer de thème</button>`;
  const q = Q.list[Q.i];
  return `<section class="card"><p class="eyebrow mono">Question ${Q.i + 1} / ${Q.list.length} · ${Q.ok} juste${Q.ok > 1 ? 's' : ''}</p><h3 class="qtxt">${esc(q.q)}</h3>
  <div class="opts">${q.o.map(o => { const cls = Q.sel != null ? (o === q.ok ? ' ok' : o === Q.sel ? ' bad' : '') : ''; return `<button class="opt${cls}" data-act="${Q.sel != null ? 'noop' : 'tsqans'}" data-val="${esc(o)}"><span>${esc(o)}</span></button>`; }).join('')}</div>
  ${Q.sel != null ? `<p class="small">${esc(q.e)}</p><div class="row gap wrap"><button class="btn primary" data-act="tsqnext">Suivante</button><button class="btn small" data-act="tsopen" data-id="${q.id}">Voir la fiche</button></div>` : ''}</section>`;
}
ACT.tsqcat = a => { TS.qcat = a.dataset.val; renderView(); };
ACT.tsqstart = () => {
  const r = makeRng(newSeed());
  const pool = [];
  TESTS.filter(t => !TS.qcat || TS.qcat === 'all' || t.cat === TS.qcat).forEach(t => t.quiz.forEach(q => pool.push({ id: t.id, q: q.q, ok: q.o[0], o: r.shuffle(q.o), e: q.e })));
  TS.quiz = { list: r.shuffle(pool).slice(0, 12), i: 0, ok: 0, sel: null }; renderView();
};
ACT.tsqans = a => { const Q = TS.quiz; Q.sel = a.dataset.val; if (Q.sel === Q.list[Q.i].ok) Q.ok++; if (Q.i === Q.list.length - 1) Store.set('tsQuiz', { ok: Q.ok, n: Q.list.length, d: Date.now() }); renderView(); };
ACT.tsqnext = () => { TS.quiz.i++; TS.quiz.sel = null; renderView(); };
ACT.tsqreset = () => { TS.quiz = null; renderView(); };
