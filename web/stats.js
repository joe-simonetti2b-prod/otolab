/* ============ SUIVI & APPLICATION ============ */
let STATS = { confirm: false };
function renderStats() {
  const h = Store.get('hist', []);
  const e = Store.get('expTot', { n: 0, ok: 0 });
  const qa = Store.get('quiz_adulte', null), qp = Store.get('quiz_pedia', null);
  const at = Store.get('autotests', []);
  const n = h.length;
  const mean = n ? Math.round(avg(h.map(x => x.pts / x.max * 100))) : 0;
  const last10 = n ? Math.round(avg(h.slice(-10).map(x => x.pts / x.max * 100))) : 0;
  const diag = n ? Math.round(h.filter(x => x.diag).length / n * 100) : 0;
  const cond = n ? Math.round(h.filter(x => x.cond).length / n * 100) : 0;
  const bySite = {};
  h.forEach(x => { const k = x.site; (bySite[k] = bySite[k] || { n: 0, d: 0 }); bySite[k].n++; if (x.diag) bySite[k].d++; });
  const byP = {};
  h.forEach(x => { (byP[x.p] = byP[x.p] || { n: 0, d: 0, s: 0 }); byP[x.p].n++; if (x.diag) byP[x.p].d++; byP[x.p].s += x.pts / x.max; });
  const weak = Object.entries(byP).map(([k, v]) => ({ k, r: v.s / v.n, n: v.n })).sort((a, b) => a.r - b.r).slice(0, 5);
  const seen = Object.keys(byP).length;
  const spark = h.slice(-30).map(x => x.pts / x.max * 100);
  return `<section class="hero slim"><p class="eyebrow">Suivi</p><h1>Votre progression.</h1><p class="lead">Les résultats restent sur cet appareil. Ils servent à repérer ce qu’il faut retravailler.</p></section>
  <div class="kpis">
    <div class="kpi"><span class="mono big">${n}</span><span>dossiers traités</span></div>
    <div class="kpi"><span class="mono big">${n ? last10 + ' %' : '—'}</span><span>moyenne des 10 derniers</span></div>
    <div class="kpi"><span class="mono big">${n ? diag + ' %' : '—'}</span><span>diagnostics justes</span></div>
    <div class="kpi"><span class="mono big">${seen}/${PATHOS.length}</span><span>pathologies rencontrées</span></div>
  </div>
  ${n > 1 ? `<section class="card"><h3>30 derniers dossiers</h3>${sparkSVG(spark)}<p class="muted small">Moyenne générale ${mean} % · conduites justes ${cond} %</p></section>` : `<section class="card"><h3>Pas encore de dossier</h3><p class="small">Traitez un premier patient dans l’onglet Cas : la progression s’affichera ici.</p><button class="btn primary" data-act="tab" data-tab="sim">Ouvrir un dossier</button></section>`}
  ${n ? `<section class="card"><h3>Diagnostic par site lésionnel</h3><ul class="parts">${Object.entries(bySite).map(([k, v]) => `<li><span>${SITES[k]}</span>${pctBar(v.d / v.n * 100)}<span class="mono">${v.d}/${v.n}</span></li>`).join('')}</ul></section>
  <section class="card"><h3>À retravailler</h3><ul class="hlist">${weak.map(w => { const p = PATHOS.find(x => x.id === w.k); return `<li><button class="linkbtn" data-act="openfiche" data-id="${w.k}">${esc(p ? p.nom : w.k)}</button><span class="mono">${Math.round(w.r * 100)} % · ${w.n}×</span></li>`; }).join('')}</ul></section>` : ''}
  <section class="card"><h3>Autres exercices</h3><dl class="kv">
    <dt>Lecture express</dt><dd class="mono">${e.n ? `${e.ok}/${e.n} parfaits · record ${Store.get('expBest', 0)}` : '—'}</dd>
    <dt>Quiz révisions</dt><dd class="mono">${qa ? qa.ok + '/' + qa.n : '—'}</dd>
    <dt>Quiz pédiatrie</dt><dd class="mono">${qp ? qp.ok + '/' + qp.n : '—'}</dd>
    <dt>Autotests réalisés</dt><dd class="mono">${at.length}</dd></dl></section>
  <section class="card">${STATS.confirm ? `<p class="small">Effacer tout l’historique, les scores et l’étalonnage de cet appareil ?</p><div class="row gap"><button class="btn danger" data-act="reset2">Oui, tout effacer</button><button class="btn" data-act="reset0">Annuler</button></div>` : `<button class="btn ghost small" data-act="reset1">Réinitialiser les données</button>`}</section>`;
}
function sparkSVG(v) {
  const W = 340, H = 90, x0 = 6, w = W - 12;
  const x = i => x0 + (v.length < 2 ? 0 : i / (v.length - 1) * w);
  const y = p => 8 + (100 - p) / 100 * (H - 16);
  const pts = v.map((p, i) => x(i) + ',' + y(p)).join(' ');
  const area = `${x(0)},${y(0)} ${pts} ${x(v.length - 1)},${y(0)}`;
  return `<svg class="ag" viewBox="0 0 ${W} ${H}" role="img" aria-label="Évolution des scores">
  ${[25, 50, 75].map(p => `<line x1="${x0}" x2="${x0 + w}" y1="${y(p)}" y2="${y(p)}" class="ag-g"/>`).join('')}
  <polygon points="${area}" fill="var(--brass-soft)"/><polyline points="${pts}" fill="none" stroke="var(--brass)" stroke-width="2"/>
  <circle cx="${x(v.length - 1)}" cy="${y(v[v.length - 1])}" r="4" fill="var(--brass)"/></svg>`;
}
ACT.reset1 = () => { STATS.confirm = true; renderView(); };
ACT.reset0 = () => { STATS.confirm = false; renderView(); };
ACT.reset2 = () => { ['hist', 'expTot', 'expBest', 'quiz_adulte', 'quiz_pedia', 'autotests', 'calib'].forEach(k => Store.set(k, null)); Store.set('hist', []); STATS.confirm = false; toast('Données effacées'); renderView(); };

/* ---------- Application ---------- */
const VIEWS = { sim: renderSim, learn: renderLearn, pedia: renderPedia, clinic: renderClinic, stats: renderStats };
let TAB = (location.hash || '').replace('#', '');
if (!VIEWS[TAB]) TAB = Store.get('tab', 'sim');
if (!VIEWS[TAB]) TAB = 'sim';
function renderView() {
  $('#view').innerHTML = VIEWS[TAB]();
  $$('.nav button').forEach(b => { const on = b.dataset.tab === TAB; b.classList.toggle('on', on); b.setAttribute('aria-current', on ? 'page' : 'false'); });
}
function goTab(t) { if (t !== 'clinic') stopAll(); TAB = t; Store.set('tab', t); renderView(); window.scrollTo(0, 0); }
ACT.tab = a => goTab(a.dataset.tab);
ACT.daily = () => startCase({ seed: dailySeed() });
function dailySeed() { const d = new Date(); return 100000 + ((d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate()) * 7919) % 899999; }
renderView();
