/* ============ PÉDIATRIE ============ */
const PED_FICHES = [
  {
    id: 'p_depist', t: 'Dépistage néonatal', sec: [
      ['Organisation', `<p>Dépistage proposé à tous les nouveau-nés en France (généralisé depuis 2014), en maternité, avant la sortie. Une surdité permanente bilatérale concerne environ 1 naissance sur 1000.</p>
      <ul><li><b>OEA automatisées</b> : rapides, mais ne testent que l’oreille jusqu’aux cellules ciliées externes.</li><li><b>PEA automatisés</b> : testent aussi le nerf ; indispensables chez les nouveau-nés à risque (néonatologie) pour ne pas manquer une neuropathie auditive.</li></ul>`],
      ['Repère 1-3-6', `<p>Dépistage avant 1 mois, diagnostic avant 3 mois, prise en charge (appareillage, accompagnement) avant 6 mois.</p>`],
      ['Facteurs de risque', `<ul><li>Antécédents familiaux de surdité de l’enfant.</li><li>Séjour en réanimation néonatale, ventilation, prématurité, anoxie.</li><li>Infections congénitales : CMV, toxoplasmose, rubéole, syphilis.</li><li>Hyperbilirubinémie avec exsanguinotransfusion.</li><li>Malformations craniofaciales, syndromes.</li><li>Méningite, traitements ototoxiques, traumatisme crânien.</li></ul>
      <p>Un dépistage normal ne protège pas d’une surdité acquise ou évolutive (CMV, aqueduc large) : tout doute des parents justifie un contrôle.</p>`]
    ]
  },
  {
    id: 'p_dev', t: 'Développement de l’audition et du langage', sec: [
      ['Repères', `<div class="tscroll"><table class="tbl"><thead><tr><th>Âge</th><th>Ce que l’on attend</th></tr></thead><tbody>
      <tr><td>Naissance</td><td>Sursaut ou clignement aux bruits forts, s’apaise à la voix</td></tr>
      <tr><td>3–4 mois</td><td>Cherche la source des yeux, gazouille, réagit à la voix de la mère</td></tr>
      <tr><td>6 mois</td><td>Tourne la tête vers le son, joue avec sa voix</td></tr>
      <tr><td>6–10 mois</td><td>Babillage canonique (« bababa »), réagit à son prénom</td></tr>
      <tr><td>12 mois</td><td>Premiers mots, comprend des consignes simples en contexte</td></tr>
      <tr><td>18–24 mois</td><td>Vocabulaire qui s’accélère, associe deux mots vers 2 ans</td></tr>
      <tr><td>3 ans</td><td>Phrases simples, compris par la famille</td></tr>
      <tr><td>4 ans</td><td>Compris par tout le monde, raconte</td></tr></tbody></table></div>`],
      ['Signaux d’alerte', `<ul><li>Pas de babillage canonique à 10 mois.</li><li>Pas de mot à 18 mois, pas d’association de mots à 2 ans.</li><li>Régression du langage, inquiétude des parents.</li><li>Enfant « dans sa bulle », qui répond seulement quand il voit l’interlocuteur.</li></ul>`]
    ]
  },
  {
    id: 'p_tests', t: 'Examens selon l’âge', sec: [
      ['0–6 mois', `<p>Mesures objectives : PEA (seuils estimés par oreille), ASSR (par fréquence), OEA, tympanométrie à 1000 Hz. L’observation comportementale seule n’est pas fiable pour fixer un seuil.</p>`],
      ['6–30 mois', `<p><b>Audiométrie à renforcement visuel</b> (réflexe d’orientation conditionné) : l’enfant tourne la tête vers le son et un jouet lumineux le récompense. Champ libre (meilleure oreille), puis inserts pour obtenir des seuils par oreille.</p>`],
      ['2 ans ½ – 5 ans', `<p><b>Audiométrie ludique</b> : l’enfant fait une action de jeu (pion dans une boîte, perle sur un fil) à chaque son. Vocale par désignation d’images.</p>`],
      ['À partir de 5–6 ans', `<p>Audiométrie tonale classique, listes vocales adaptées à l’âge.</p>`],
      ['Conseils pratiques', `<ul><li>Séances courtes, deux examinateurs si possible.</li><li>Fréquences clés d’abord : 500 et 2000 Hz, puis 1000 et 4000 Hz.</li><li>Varier les intervalles, contrôler les fausses réponses avec des essais sans son.</li><li>Recouper avec les mesures objectives et l’observation des parents.</li></ul>`]
    ]
  },
  {
    id: 'p_etio', t: 'Étiologies', sec: [
      ['Génétiques (environ la moitié des surdités congénitales)', `<ul><li><b>Non syndromiques</b> : GJB2 (connexine 26) en tête, OTOF (neuropathie), SLC26A4 (aqueduc élargi)…</li>
      <li><b>Syndromiques</b> : Usher (rétinite pigmentaire), Pendred (goitre, aqueduc élargi), Waardenburg (mèche blanche, yeux de couleurs différentes), Alport (atteinte rénale), Jervell et Lange-Nielsen (QT long : faire un ECG), CHARGE, Treacher Collins (malformations de l’oreille externe et moyenne).</li></ul>`],
      ['Acquises', `<ul><li>CMV congénital (première cause non génétique), toxoplasmose, rubéole.</li><li>Prématurité, anoxie, hyperbilirubinémie.</li><li>Méningite bactérienne (risque d’ossification cochléaire).</li><li>Ototoxiques (aminosides, cisplatine).</li><li>Otite séromuqueuse : cause la plus fréquente de surdité de transmission de l’enfant.</li></ul>`]
    ]
  },
  {
    id: 'p_appar', t: 'Appareillage de l’enfant', sec: [
      ['Matériel', `<ul><li>Contour d’oreille avec embout souple sur mesure, coude pédiatrique.</li><li>Embouts à refaire souvent la première année (croissance rapide du conduit), puis à chaque larsen persistant.</li><li>Tiroir pile verrouillé ou appareil rechargeable, commandes désactivables, voyant de fonctionnement.</li><li>Cordons de sécurité, crochets adaptés.</li></ul>`],
      ['Réglage', `<ul><li>Formule DSL v5 (ou NAL-NL2 selon les équipes).</li><li>RECD mesuré dès que possible, sinon valeurs moyennes pour l’âge ; le réglage se vérifie au coupleur corrigé.</li><li>Objectif : rendre audible toute la parole, y compris le [s] faible et aigu.</li><li>Abaissement fréquentiel discuté si les aigus restent inaudibles.</li><li>Datalogging : l’objectif est un port pendant tout le temps d’éveil.</li></ul>`],
      ['Contrôle d’efficacité', `<p>Test des 6 sons de Ling ([m], [u], [a], [i], [ʃ], [s]) : détection puis identification. Observation des parents et de l’orthophoniste, questionnaires de développement auditif, audiométrie avec appareils en champ libre.</p>`],
      ['Autour de l’appareil', `<p>Microphone déporté (système HF numérique) à la crèche et à l’école, accompagnement parental, orthophonie précoce, services d’éducation spécialisée (SAFEP avant 3 ans, SSEFS ensuite), demande à la MDPH (AEEH). Respecter le choix de communication de la famille (oral, LfPC, LSF, bilinguisme).</p>`]
    ]
  },
  {
    id: 'p_ic', t: 'Implant cochléaire chez l’enfant', sec: [
      ['Indications', `<p>Surdité sévère à profonde bilatérale avec bénéfice insuffisant des aides auditives après un essai bien conduit. Implantation précoce (souvent vers 12 mois), bilatérale simultanée ou rapprochée. Après méningite : sans attendre, à cause du risque d’ossification.</p>`],
      ['Rôle de l’audioprothésiste', `<p>Essai prothétique de qualité (c’est lui qui permet de juger le bénéfice), appareillage d’attente, appareillage controlatéral en bimodal si indiqué, lien avec le centre implanteur.</p>`],
      ['Recherche', `<p>Thérapie génique de la surdité liée à l’otoferline (OTOF) : premiers essais chez l’enfant avec restauration d’audition publiés en 2024. Pas encore une pratique courante.</p>`]
    ]
  }
];

let PEDIA = { tab: 'fiches', q: null };
function renderPedia() {
  const tabs = [['fiches', 'Fiches'], ['patho', 'Pathologies'], ['cas', 'Cas'], ['quiz', 'Quiz']];
  let body = '';
  if (PEDIA.tab === 'fiches') body = PED_FICHES.map(ficheHTML).join('');
  else if (PEDIA.tab === 'patho') body = pathoFiches(true);
  else if (PEDIA.tab === 'quiz') body = quizView('pedia');
  else body = `<section class="card"><h3>Dossiers pédiatriques</h3><p class="muted small">Nourrissons, jeunes enfants et adolescents : méthodes d’examen adaptées à l’âge, cibles orientées DSL, contraintes de matériel. Tirage aléatoire dans ${PATHOS.filter(p => p.pedia).length} pathologies de l’enfant.</p>
    <div class="row gap wrap"><button class="btn primary big" data-act="pedcase" data-site="tous">Cas pédiatrique</button>
    <button class="btn" data-act="pedcase" data-site="interne">Surdités de perception</button><button class="btn" data-act="pedcase" data-site="moyenne">Oreille moyenne</button><button class="btn" data-act="pedcase" data-site="externe">Oreille externe</button></div></section>`;
  return `<section class="hero slim"><p class="eyebrow">Pédiatrie</p><h1>L’enfant n’est pas un petit adulte.</h1><p class="lead">Dépistage, développement, examens par âge, étiologies et appareillage de l’enfant, avec des dossiers d’entraînement dédiés.</p></section>
  <div class="tabs">${tabs.map(([k, l]) => `<button class="tab${PEDIA.tab === k ? ' on' : ''}" data-act="ptab" data-k="${k}">${l}</button>`).join('')}</div>
  <div class="stack">${body}</div>`;
}
ACT.ptab = a => { PEDIA.tab = a.dataset.k; if (PEDIA.tab !== 'quiz') PEDIA.q = null; renderView(); };
ACT.pedcase = a => { goTab('sim'); startCase({ pub: 'enfant', site: a.dataset.site }); };
