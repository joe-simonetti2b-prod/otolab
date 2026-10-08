/* ============ PONT ANDROID (Capacitor) ============ */
(function () {
  const C = window.Capacitor;
  if (!C || !C.isNativePlatform || !C.isNativePlatform()) return;
  document.documentElement.classList.add('native');
  const App = C.Plugins && C.Plugins.App;
  if (!App) return;
  App.addListener('backButton', () => {
    if (TAB === 'sim' && EXP) { EXP = null; renderView(); return; }
    if (TAB === 'sim' && SIM) {
      const st = simSteps();
      const i = st.indexOf(SIM.step);
      if (i > 0) SIM.step = st[i - 1]; else SIM = null;
      renderView(); window.scrollTo(0, 0); return;
    }
    if (TAB === 'cab' && (CAB.debrief || CAB.P)) {
      if (CAB.debrief) { CAB.debrief = null; CAB.P = null; }
      else if (CAB.app === 'noah') { if (CAB.P.nmod !== 'home') CAB.P.nmod = 'home'; else CAB.app = 'gest'; }
      else CAB.P = null;
      renderView(); window.scrollTo(0, 0); return;
    }
    if (TAB !== 'sim') { goTab('sim'); return; }
    App.exitApp();
  });
  App.addListener('pause', () => { try { stopAll(); } catch (e) { } });
})();
