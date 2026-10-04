/* ============ RÉVISIONS : fiches pratiques, pathologies, nouveautés, quiz ============ */
const FICHES = [
  {
    id: 'tonale', t: 'Audiométrie tonale et masquage', sec: [
      ['Conduction aérienne', `<p>Casque supra-auriculaire ou inserts, de 125/250 à 8000 Hz. Ordre usuel : 1000 Hz, puis les aigus, puis les graves, et retest à 1000 Hz (écart ≤ 5 dB attendu). Commencer par la meilleure oreille.</p>
      <p><b>Méthode ascendante (Hughson-Westlake modifiée).</b> Après une réponse : −10 dB ; sans réponse : +5 dB. Le seuil est le niveau le plus faible obtenu au moins 2 fois sur 3 montées.</p>`],
      ['Conduction osseuse', `<p>Vibrateur sur la mastoïde, de 250 à 4000 Hz. Sorties maximales limitées (environ 45 dB à 250 Hz, 60 à 500 Hz, 70 dB vers 1–2 kHz) : une absence de réponse en CO doit être notée avec la flèche « pas de réponse ».</p>
      <p>Au-dessous de 1000 Hz, une forte stimulation osseuse peut être perçue de façon vibrotactile : prudence avec les réponses aux graves dans les pertes profondes.</p>`],
      ['Quand masquer', `<ul>
      <li><b>Atténuation interaurale</b> (valeurs prudentes) : ≈ 40 dB au casque supra-auriculaire, ≈ 55 dB aux inserts, 0 dB en conduction osseuse.</li>
      <li><b>CA :</b> masquer l’oreille non testée si le seuil CA de l’oreille testée dépasse de 40 dB ou plus la CO de l’oreille non testée.</li>
      <li><b>CO :</b> masquer dès qu’un écart aérien-osseux de 10 dB ou plus apparaît sur l’oreille testée.</li>
      </ul>`],
      ['Méthode du plateau (Hood)', `<p>On augmente le bruit de masquage dans l’oreille non testée par paliers (souvent 10 dB) en recherchant le seuil à chaque palier. Seuil vrai : il reste stable sur au moins trois paliers consécutifs (le plateau). Au-delà, le bruit passe à l’oreille testée : <b>surmasquage</b>.</p>
      <p><b>Dilemme de masquage</b> : surdité de transmission bilatérale importante, le plateau n’existe pas. Les inserts (atténuation plus forte) aident.</p>
      <p><b>Effet d’occlusion en CO</b> : couvrir l’oreille non testée avec le casque de masquage renforce les graves perçus (≈ +15 dB à 250 Hz, +10 dB à 500 Hz) ; à corriger, sauf si cette oreille a une composante de transmission.</p>`],
      ['Pièges classiques', `<ul><li>Courbe fantôme de l’oreille cophotique non masquée, parallèle à l’oreille saine.</li><li>Bouchon de cérumen ou conduit collabé par le casque (sujets âgés) : faux écart sur les aigus. Les inserts l’évitent.</li><li>Patient qui répond au rythme plutôt qu’au son : varier les intervalles.</li></ul>`]
    ]
  },
  {
    id: 'vocale', t: 'Audiométrie vocale', sec: [
      ['Principe', `<p>Mesure de la compréhension de mots présentés à différents niveaux. Listes françaises usuelles : mots dissyllabiques de Fournier, listes cochléaires de Lafon (monosyllabes de trois phonèmes, cotation possible en phonèmes).</p>
      <p>On relève le <b>seuil d’intelligibilité</b> (50 % de mots compris), le <b>maximum d’intelligibilité</b> et le niveau auquel il est atteint.</p>`],
      ['Lecture des courbes', `<ul>
      <li><b>Transmission</b> : courbe normale décalée vers la droite, atteint 100 %.</li>
      <li><b>Perception endocochléaire</b> : pente moins raide, maximum souvent inférieur à 100 %, parfois baisse à fort niveau (roll-over modéré).</li>
      <li><b>Rétrocochléaire</b> : maximum effondré sans rapport avec la tonale, roll-over marqué.</li>
      </ul>
      <p>Le seuil d’intelligibilité doit être cohérent avec la moyenne tonale 500–1000–2000 Hz (± 10 dB). Un écart important fait suspecter une erreur ou une simulation.</p>`],
      ['En prothèse', `<p>Vocale en champ libre sans puis avec appareils, voix moyenne (65 dB) et faible (50 dB), au calme puis dans le bruit. C’est le contrôle d’efficacité qui parle au patient : le gain prothétique vocal.</p>`]
    ]
  },
  {
    id: 'impedance', t: 'Impédancemétrie, réflexes, OEA, PEA', sec: [
      ['Tympanométrie', `<p>Sonde 226 Hz chez l’adulte et l’enfant ; <b>1000 Hz chez le nourrisson de moins de 6 mois</b> (le 226 Hz peut paraître normal malgré un épanchement).</p>
      <div class="tscroll"><table class="tbl"><thead><tr><th>Type</th><th>Aspect</th><th>Évoque</th></tr></thead><tbody>
      <tr><th>A</th><td>Pic entre −100 et +50 daPa, compliance normale</td><td>Oreille moyenne normale, surdité de perception</td></tr>
      <tr><th>As</th><td>Pic centré, compliance faible</td><td>Otospongiose, tympanosclérose</td></tr>
      <tr><th>Ad</th><td>Pic centré, compliance très élevée</td><td>Disjonction ossiculaire, tympan flaccide ou cicatriciel</td></tr>
      <tr><th>B</th><td>Plat, pas de pic</td><td>Volume normal : épanchement (OSM). Volume élevé : perforation ou aérateur perméable. Volume faible : bouchon, sonde contre la paroi</td></tr>
      <tr><th>C</th><td>Pic au-delà de −100 daPa</td><td>Dysfonction tubaire</td></tr>
      </tbody></table></div>
      <p>Volume équivalent du conduit : environ 0,6 à 1,5 ml chez l’adulte, plus faible chez l’enfant ; au-delà de 2 ml chez l’adulte, penser perforation.</p>`],
      ['Réflexe stapédien', `<p>Arc réflexe : nerf cochléaire → noyaux cochléaires → complexe olivaire supérieur → noyau du facial → muscle de l’étrier, des deux côtés. Seuil normal vers 70 à 100 dB HL.</p>
      <ul><li><b>Recrutement (test de Metz)</b> : écart seuil réflexe − seuil tonal inférieur à 60 dB = atteinte endocochléaire.</li>
      <li><b>Absent</b> : composante de transmission côté sonde, perte trop importante côté stimulus, atteinte du VIII ou du VII.</li>
      <li><b>Fatigabilité (decay)</b> : stimulation 10 dB au-dessus du seuil réflexe pendant 10 s à 500 et 1000 Hz ; une baisse de plus de 50 % évoque une atteinte rétrocochléaire.</li></ul>`],
      ['Otoémissions acoustiques', `<p>Sons émis par les cellules ciliées externes, recueillis dans le conduit : provoquées (transitoires) ou produits de distorsion. Présentes si l’oreille moyenne est normale et la perte cochléaire faible (absentes au-delà de 30 à 40 dB environ). Outil de dépistage néonatal.</p>`],
      ['Potentiels évoqués auditifs', `<p>Ondes I à V dans les 10 ms suivant un clic ou un tone-burst. Servent à estimer le seuil (nourrisson, patient non coopérant) et à explorer le nerf (allongement de I–V, asymétrie de la latence de l’onde V). ASSR : seuils estimés par fréquence.</p>`]
    ]
  },
  {
    id: 'biap', t: 'Classification BIAP (et OMS)', sec: [
      ['Calcul', `<p>Moyenne des seuils CA à 500, 1000, 2000 et 4000 Hz, par oreille. Une fréquence non perçue compte pour 120 dB.</p>
      <div class="tscroll"><table class="tbl"><thead><tr><th>Moyenne</th><th>Degré BIAP</th></tr></thead><tbody>
      <tr><td>≤ 20 dB</td><td>Audition normale ou subnormale</td></tr>
      <tr><td>21–40 dB</td><td>Déficience légère</td></tr>
      <tr><td>41–55 / 56–70 dB</td><td>Moyenne, 1er / 2e degré</td></tr>
      <tr><td>71–80 / 81–90 dB</td><td>Sévère, 1er / 2e degré</td></tr>
      <tr><td>91–100 / 101–110 / 111–119 dB</td><td>Profonde, 1er / 2e / 3e degré</td></tr>
      <tr><td>≥ 120 dB</td><td>Totale (cophose)</td></tr></tbody></table></div>`],
      ['À ne pas confondre', `<p>La classification de l’OMS (2021) utilise la même moyenne mais sur la meilleure oreille et avec d’autres bornes : légère à partir de 20 dB, modérée 35, modérément sévère 50, sévère 65, profonde 80, complète 95.</p>
      <p>Une moyenne normale peut masquer un scotome à 4 kHz ou une perte des aigus : le degré ne dispense pas de regarder la forme de la courbe.</p>`]
    ]
  },
  {
    id: 'formules', t: 'Formules de préréglage et compression', sec: [
      ['Formules linéaires', `<ul>
      <li><b>Demi-gain</b> (Lybarger, 1944) : gain ≈ perte ÷ 2.</li>
      <li><b>POGO</b> (1983) : demi-gain, −10 dB à 250 Hz, −5 dB à 500 Hz.</li>
      <li><b>NAL-R</b> (1986) : G = X + 0,31 × H + k, avec X = 0,05 × (H500 + H1k + H2k) et k = −17, −8, +1, −1, −2, −2 dB de 250 à 6000 Hz. Composante de transmission : ajouter environ 25 % de l’écart aérien-osseux.</li></ul>`],
      ['Formules non linéaires', `<ul>
      <li><b>NAL-NL1 / NAL-NL2</b> (Australie) : maximiser l’intelligibilité pour une sonie globale normale ou réduite. NL2 intègre l’âge, le sexe, l’expérience, la langue, l’appareillage uni ou bilatéral.</li>
      <li><b>DSL v5</b> (Canada) : rendre le spectre de la parole audible dans la dynamique résiduelle, cibles en dB SPL au tympan. Référence en pédiatrie.</li>
      <li><b>Formules fabricants</b> : propriétaires, souvent plus confortables au premier port. Toujours vérifier par mesures in vivo.</li></ul>`],
      ['Compression', `<p><b>Taux de compression</b> = variation d’entrée ÷ variation de sortie. Avec G50 et G80 : TC = 30 ÷ (30 − (G50 − G80)). Exemple : G50 = 30, G80 = 20 → 30 ÷ 20 = 1,5:1.</p>
      <ul><li>Seuil d’enclenchement (point de genou) bas = WDRC.</li><li>Constantes de temps courtes (syllabique) ou longues (AGC lente).</li><li>Limitation de sortie (MPO) : protège du son douloureux ; à régler sous le seuil d’inconfort.</li><li>Expansion : réduit le gain pour les bruits très faibles (souffle, bruit interne).</li><li>Transmission : la cochlée n’a pas de recrutement, donc peu de compression. Perception : compression d’autant plus forte que la dynamique est réduite.</li></ul>`]
    ]
  },
  {
    id: 'rem', t: 'Mesures in vivo (REM)', sec: [
      ['Les grandeurs', `<ul>
      <li><b>REUR / REUG</b> : réponse et gain de l’oreille nue, avec une résonance naturelle d’environ 15 à 20 dB vers 2,5–3 kHz.</li>
      <li><b>REOR</b> : oreille occluse, appareil éteint (perte d’insertion, vérification de l’évent).</li>
      <li><b>REAR / REAG</b> : appareil allumé.</li>
      <li><b>REIG = REAG − REUG</b> : gain d’insertion, ce que l’appareil apporte réellement.</li>
      <li><b>RESR</b> : sortie maximale in situ (signal à 85–90 dB), contrôle du MPO.</li>
      <li><b>RECD</b> : différence entre l’oreille réelle et le coupleur 2 cc. Plus grande chez l’enfant (petit conduit) : indispensable en pédiatrie.</li></ul>`],
      ['Pratique', `<p>Otoscopie, tube sonde à environ 5 mm du tympan (au-delà de l’extrémité de l’embout), calibrage de la sonde, haut-parleur à 45° ou 0°, signal vocal international (ISTS) à 50, 65 et 80 dB. Le speechmapping montre le spectre de la parole amplifiée par rapport aux seuils convertis en dB SPL : très parlant pour le patient.</p>`]
    ]
  },
  {
    id: 'couplage', t: 'Couplage acoustique, évents, empreintes', sec: [
      ['Évent', `<p>Il laisse passer les graves naturels, réduit l’effet d’occlusion et la sensation d’oreille bouchée, mais il réduit le gain réel sur les graves et abaisse le gain stable maximal (plus de risque de larsen sur les aigus). Tout le réglage est un compromis entre ces deux effets.</p>
      <ul><li>Graves ≤ 30 dB HL : dôme ouvert ou évent large.</li><li>30–45 dB : semi-ouvert (tulipe, évent 2–3 mm).</li><li>45–65 dB : fermé ou petit évent.</li><li>Au-delà : embout plein, évent de sécurité.</li></ul>`],
      ['Effet d’occlusion', `<p>Conduit fermé : la voix propre, transmise par voie osseuse, est piégée et renforcée sur les graves. Solutions : ouvrir l’évent, embout plus profond (jusqu’à la partie osseuse du conduit), réduire le gain grave. Monter le gain grave aggrave la plainte.</p>`],
      ['Embouts', `<p>Acrylique (dur, durable) ou silicone (souple, enfants, pertes sévères, meilleure étanchéité). Formes : canule, squelette, demi-conque, conque pleine. Un cornet (horn) renforce les aigus, un filtre amortisseur lisse les pics de résonance du tube.</p>`],
      ['Prise d’empreinte', `<ol><li>Otoscopie : conduit libre, tympan fermé, pas d’infection.</li><li>Protecteur (coton ou mousse avec fil) placé au-delà du deuxième coude.</li><li>Injection de la pâte du fond vers l’extérieur, sans bulle ; bouche entrouverte avec cale pour les intras profonds.</li><li>Temps de prise respecté, retrait doux en rompant l’étanchéité.</li><li>Otoscopie de contrôle : aucun résidu.</li></ol>
      <p>Contre-indications : otorrhée, perforation non protégée, otite externe, chirurgie récente, exostoses obstructives (prudence).</p>`]
    ]
  },
  {
    id: 'acouphene', t: 'Acouphènes et hyperacousie', sec: [
      ['Évaluation', `<p>Questionnaires (THI, échelle visuelle analogique), acouphénométrie (fréquence, intensité, niveau minimal de masquage, inhibition résiduelle), seuils d’inconfort pour l’hyperacousie.</p>`],
      ['Signaux d’alerte → ORL', `<ul><li>Acouphène pulsatile (rythmé par le cœur).</li><li>Acouphène unilatéral ou surdité asymétrique.</li><li>Apparition brutale avec surdité, vertiges.</li><li>Signes neurologiques.</li></ul>`],
      ['Prise en charge', `<p>Correction de la perte auditive (souvent la première amélioration), thérapie sonore, générateurs de bruit, thérapies cognitivo-comportementales (meilleur niveau de preuve), TRT, relaxation. Accompagnement : expliquer le mécanisme diminue l’anxiété.</p>`]
    ]
  },
  {
    id: 'reglementation', t: 'Cadre réglementaire en France', sec: [
      ['Profession', `<p>Profession de santé réglementée par le Code de la santé publique (articles L4361-1 et suivants) : diplôme d’État d’audioprothésiste. Les aides auditives sont des dispositifs médicaux (règlement européen 2017/745).</p>`],
      ['Réforme 100 % Santé', `<ul><li>Depuis le 1er janvier 2021 : <b>classe I</b> (reste à charge zéro, prix limite de vente de 950 € par oreille) et <b>classe II</b> (prix libre).</li><li>Renouvellement pris en charge tous les 4 ans.</li><li>Devis normalisé, essai avant achat, suivi inclus dans la prestation.</li></ul>
      <p class="muted small">Montants et règles de prescription évoluent : vérifier les textes en vigueur (Ameli, Légifrance) avant de les citer à un patient.</p>`],
      ['Prescription', `<p>Appareillage sur prescription médicale. Le rôle de l’audioprothésiste comprend aussi l’orientation : toute anomalie otoscopique, asymétrie inexpliquée, surdité rapide ou brusque, vertige ou acouphène unilatéral justifie un avis médical avant de poursuivre.</p>`],
      ['Bruit au travail', `<p>Actions de prévention dès 80 dB(A) sur 8 h, protections obligatoires à 85 dB(A), valeur limite d’exposition de 87 dB(A) (protecteurs pris en compte). Surdité professionnelle : tableau 42 du régime général.</p>`]
    ]
  },
  {
    id: 'techno', t: 'Nouvelles technologies (état mi-2026)', sec: [
      ['Intelligence artificielle embarquée', `<p>Depuis 2024, plusieurs aides auditives intègrent des réseaux de neurones pour séparer la parole du bruit en temps réel, parfois sur une puce dédiée (exemples : Phonak Audéo Sphere Infinio, Starkey Edge AI). D’autres exploitent des capteurs de mouvement pour adapter la directivité à l’intention d’écoute (Oticon Intent) ou suivre la conversation (Signia IX).</p>
      <p class="muted small">Exemples cités à titre indicatif : les gammes changent chaque année, vérifier les documentations fabricants.</p>`],
      ['Connectivité', `<p><b>Bluetooth LE Audio</b> (codec LC3) et <b>Auracast</b> : diffusion audio vers un nombre illimité d’auditeurs (télévision, gares, salles de spectacle), complémentaire de la boucle magnétique. Diffusion directe des smartphones, réglage à distance (téléaudiologie), applications de contrôle.</p>`],
      ['Autres évolutions', `<ul><li>Batteries lithium-ion rechargeables couvrant une journée avec diffusion.</li><li>Capteurs santé : podomètre, détection de chute avec alerte.</li><li>Aux États-Unis : aides auditives en vente libre (OTC, depuis 2022) et écouteurs grand public autorisés comme aides auditives pour les pertes légères à moyennes (AirPods Pro 2, 2024). Le cadre français reste celui du dispositif médical sur prescription.</li><li>Implants : stimulation électro-acoustique (graves acoustiques + aigus électriques), appareillage bimodal, contrôle à distance.</li><li>Recherche : thérapie génique de la surdité liée à l’otoferline (OTOF), avec les premiers résultats positifs chez l’enfant publiés en 2024.</li></ul>`]
    ]
  }
];

let LEARN = { tab: 'fiches', open: null, q: null };
function renderLearn() {
  const tabs = [['fiches', 'Fiches pratiques'], ['patho', 'Pathologies'], ['quiz', 'Quiz']];
  let body = '';
  if (LEARN.tab === 'fiches') body = FICHES.map(ficheHTML).join('');
  else if (LEARN.tab === 'patho') body = pathoFiches(false);
  else body = quizView('adulte');
  return `<section class="hero slim"><p class="eyebrow">Révisions</p><h1>Rappels de pratique.</h1><p class="lead">Audiométrie, impédancemétrie, préréglage, couplage, réglementation et nouveautés. Les fiches pathologies sont celles du simulateur.</p></section>
  <div class="tabs">${tabs.map(([k, l]) => `<button class="tab${LEARN.tab === k ? ' on' : ''}" data-act="ltab" data-k="${k}">${l}</button>`).join('')}</div>
  <div class="stack">${body}</div>`;
}
ACT.ltab = a => { LEARN.tab = a.dataset.k; if (LEARN.tab !== 'quiz') LEARN.q = null; renderView(); };
function ficheHTML(f) {
  return `<details class="fiche" id="f-${f.id}"${LEARN.open === f.id ? ' open' : ''}><summary><span>${f.t}</span></summary>
  <div class="fbody">${f.sec.map(([h, c]) => `<h4>${h}</h4>${c}`).join('')}</div></details>`;
}
function pathoFiches(pedia) {
  const groups = {};
  PATHOS.filter(p => pedia ? p.pedia && (p.adult === false || ['osm', 'atresie', 'corps_etr'].includes(p.id)) : p.adult !== false).forEach(p => { (groups[p.site] = groups[p.site] || []).push(p); });
  return Object.keys(SITES).filter(k => groups[k]).map(k => `<h3 class="gtitle">${SITES[k]}</h3>` + groups[k].map(p => `
    <details class="fiche" id="f-${p.id}"${LEARN.open === p.id ? ' open' : ''}><summary><span>${esc(p.nom)}</span></summary><div class="fbody">
    <h4>Définition</h4><p>${esc(p.fiche.def)}</p><h4>Clinique</h4><p>${esc(p.fiche.clin)}</p><h4>Examens</h4><p>${esc(p.fiche.audio)}</p>
    <h4>Point de vigilance</h4><p>${esc(p.fiche.imp)}</p><h4>Conduite</h4><p>${esc(p.fiche.cat)}</p><h4>Prothèse</h4><p>${esc(p.fiche.proth)}</p>
    <button class="btn small" data-act="casefrom" data-id="${p.id}">S’entraîner sur ce cas</button></div></details>`).join('')).join('');
}
ACT.casefrom = a => { goTab('sim'); startCase({ patho: a.dataset.id }); };
ACT.openfiche = a => {
  const p = PATHOS.find(x => x.id === a.dataset.id);
  const ped = p && p.adult === false;
  LEARN.open = a.dataset.id;
  if (ped) { PEDIA.tab = 'patho'; goTab('pedia'); } else { LEARN.tab = 'patho'; goTab('learn'); }
  setTimeout(() => { const el = document.getElementById('f-' + a.dataset.id); if (el) el.scrollIntoView({ block: 'start' }); }, 50);
};

/* ---------- Quiz ---------- */
const QB = [
  { q: 'Jusqu’à quel écart entre la CA de l’oreille testée et la CO de l’oreille non testée peut-on se passer de masquage au casque supra-auriculaire ?', o: ['Moins de 40 dB', 'Moins de 10 dB', 'Moins de 60 dB', 'Le masquage n’est jamais nécessaire en CA'], e: 'L’atténuation interaurale prudente au casque est d’environ 40 dB.' },
  { q: 'Chez un nourrisson de 3 mois, quelle fréquence de sonde utiliser en tympanométrie ?', o: ['1000 Hz', '226 Hz', '678 Hz', '4000 Hz'], e: 'À 226 Hz, l’oreille du nourrisson peut donner un tracé faussement normal malgré un épanchement.', tag: 'pedia' },
  { q: 'Un tympanogramme plat avec un volume de 3,8 ml chez un adulte évoque :', o: ['Une perforation ou un aérateur perméable', 'Une otite séromuqueuse', 'Un bouchon de cérumen', 'Une otospongiose'], e: 'Volume élevé : la sonde mesure le conduit et la caisse.' },
  { q: 'Test de Metz : un écart seuil réflexe − seuil tonal de 45 dB signifie :', o: ['Un recrutement, donc une atteinte endocochléaire', 'Une atteinte rétrocochléaire', 'Une surdité de transmission', 'Un résultat normal'], e: 'Un écart inférieur à 60 dB traduit un recrutement.' },
  { q: 'Encoche de Carhart : où et dans quelle pathologie ?', o: ['Sur la CO vers 2 kHz, otospongiose', 'Sur la CA à 4 kHz, traumatisme sonore', 'Sur la CO à 250 Hz, Ménière', 'Sur la CA à 8 kHz, ototoxicité'], e: 'Artefact de la CO lié à la fixation de l’étrier, qui régresse souvent après chirurgie.' },
  { q: 'Scotome à 4 kHz avec remontée à 8 kHz chez un maçon de 50 ans :', o: ['Traumatisme sonore chronique', 'Presbyacousie', 'Ototoxicité', 'Maladie de Ménière'], e: 'La remontée à 8 kHz distingue l’encoche traumatique de la pente presbyacousique.' },
  { q: 'Moyenne BIAP de 58 dB. Degré ?', o: ['Moyenne 2e degré', 'Moyenne 1er degré', 'Sévère 1er degré', 'Légère'], e: '56 à 70 dB : moyenne 2e degré.' },
  { q: 'Fréquences utilisées pour la moyenne BIAP :', o: ['500, 1000, 2000, 4000 Hz', '500, 1000, 2000 Hz', '250 à 8000 Hz', '1000, 2000, 4000 Hz'], e: 'Une fréquence non perçue compte pour 120 dB.' },
  { q: 'NAL-R : quel facteur multiplie le seuil à chaque fréquence ?', o: ['0,31', '0,5', '0,05', '0,25'], e: 'G = X + 0,31 H + k.' },
  { q: 'Formule de référence pour l’enfant :', o: ['DSL v5', 'Demi-gain', 'POGO', 'Aucune, réglage à l’oreille'], e: 'DSL vise l’audibilité du spectre de la parole, cibles en dB SPL au tympan, avec RECD.', tag: 'pedia' },
  { q: 'G50 = 35 dB et G80 = 20 dB sur un canal. Taux de compression ?', o: ['2:1', '1,5:1', '3:1', '1:1'], e: '30 ÷ (30 − 15) = 2.' },
  { q: 'Le patient se plaint que sa voix résonne avec un dôme fermé et des graves à 20 dB HL. Que faites-vous ?', o: ['Ouvrir le couplage', 'Monter les graves', 'Fermer davantage', 'Augmenter le MPO'], e: 'Effet d’occlusion : on aère.' },
  { q: 'REIG est égal à :', o: ['REAG − REUG', 'REAR − REUR + RECD', 'REOR − REUR', 'Gain coupleur + RECD'], e: 'Le gain d’insertion est ce qui est ajouté par rapport à l’oreille nue.' },
  { q: 'Pourquoi mesurer le RECD chez l’enfant ?', o: ['Son petit conduit produit plus de pression que le coupleur : sans correction, on surestime le besoin de gain', 'Pour calculer la moyenne BIAP', 'Pour vérifier la pile', 'Il n’a pas d’intérêt chez l’enfant'], e: 'Le RECD est plus grand chez l’enfant ; il permet de régler au coupleur avec précision.', tag: 'pedia' },
  { q: 'Asymétrie de 25 dB sur 2–4 kHz, acouphène unilatéral, intelligibilité à 40 % de ce côté :', o: ['Avis ORL et IRM avant tout appareillage', 'Appareillage immédiat', 'CROS', 'Surveillance à un an'], e: 'Tableau évocateur d’un schwannome vestibulaire.' },
  { q: 'Sujet diabétique de 78 ans, otorrhée depuis 6 semaines et douleur nocturne :', o: ['Urgence ORL : otite externe nécrosante', 'Prise d’empreinte pour un embout ventilé', 'Gouttes et contrôle dans un mois', 'Bouchon de cérumen'], e: 'Ostéite de la base du crâne à Pseudomonas : urgence.' },
  { q: 'Weber latéralisé à droite, Rinne négatif à droite, positif à gauche :', o: ['Transmission droite', 'Perception droite', 'Perception gauche', 'Transmission gauche'], e: 'Le Weber va du côté de la transmission.' },
  { q: 'Weber latéralisé à gauche, Rinne positif des deux côtés :', o: ['Perception droite', 'Transmission gauche', 'Perception gauche', 'Audition normale'], e: 'En perception, le Weber va vers la meilleure oreille.' },
  { q: 'Épreuve de Gellé négative :', o: ['Blocage de la chaîne ossiculaire (otospongiose)', 'Audition normale', 'Surdité de perception', 'Perforation'], e: 'La pression dans le conduit ne modifie plus la perception : chaîne bloquée.' },
  { q: 'Classe I de la réforme 100 % Santé :', o: ['Reste à charge zéro, prix plafonné', 'Prix libre', 'Réservée aux enfants', 'Aides auditives en vente libre'], e: 'Prix limite de vente de 950 € par oreille.' },
  { q: 'Périodicité de renouvellement prise en charge pour l’adulte :', o: ['4 ans', '2 ans', '5 ans', '10 ans'], e: 'Depuis 2021.' },
  { q: 'Valeur limite d’exposition au bruit au travail (8 h) en France :', o: ['87 dB(A)', '80 dB(A)', '85 dB(A)', '95 dB(A)'], e: '80 : actions de prévention ; 85 : protections obligatoires ; 87 : valeur limite.' },
  { q: 'Auracast permet :', o: ['La diffusion d’un flux audio vers un nombre illimité d’auditeurs en Bluetooth LE Audio', 'La recharge sans fil', 'La mesure in vivo automatique', 'La réduction de bruit par IA'], e: 'Complément moderne de la boucle magnétique.' },
  { q: 'Indication classique d’implant cochléaire chez l’adulte (HAS 2012) :', o: ['Intelligibilité ≤ 50 % aux dissyllabes à 60 dB avec prothèses optimisées', 'Moyenne tonale > 60 dB', 'Toute surdité de perception bilatérale', 'Acouphènes invalidants isolés'], e: 'Critère fonctionnel, pas seulement tonal.' },
  { q: 'Tympanogramme Ad avec écart aérien-osseux de 55 dB et tympan normal :', o: ['Disjonction ossiculaire', 'Otospongiose', 'Otite séromuqueuse', 'Dysfonction tubaire'], e: 'Hypercompliance + transmission maximale.' },
  { q: 'Dans une cophose droite, sans masquage, le Rinne droit apparaît :', o: ['Négatif (faux négatif par l’oreille gauche)', 'Positif', 'Impossible à réaliser', 'Toujours indifférent'], e: 'Le diapason posé sur la mastoïde droite est perçu par l’oreille gauche.' },
  { q: 'Courbe ascendante (perte sur les graves), fluctuante, vertiges de plusieurs heures :', o: ['Maladie de Ménière', 'Presbyacousie', 'Otospongiose', 'Neurinome'], e: 'Hydrops endolymphatique.' },
  { q: 'Larsen sur les aigus avec dôme ouvert et perte de 65 dB à 4 kHz :', o: ['Fermer le couplage ou réduire le gain aigu, relancer l’anti-larsen', 'Ouvrir encore l’évent', 'Augmenter G50', 'Monter le MPO'], e: 'Le gain stable maximal d’un dôme ouvert est faible.' },
  { q: 'Le test des 6 sons de Ling utilise :', o: ['[m], [u], [a], [i], [ʃ], [s]', 'Six fréquences pures de 250 à 8000 Hz', 'Six mots dissyllabiques', 'Six niveaux de bruit'], e: 'Ils couvrent le spectre de la parole, du grave à l’aigu.', tag: 'pedia' },
  { q: 'Repère 1-3-6 du dépistage :', o: ['Dépistage avant 1 mois, diagnostic avant 3 mois, prise en charge avant 6 mois', 'Contrôles à 1, 3 et 6 ans', '1 oreille, 3 fréquences, 6 dB', 'Appareillage 1 h, 3 h puis 6 h par jour'], e: 'Recommandation internationale.', tag: 'pedia' },
  { q: 'Pourquoi dépister par PEA automatisés en néonatologie ?', o: ['Les OEA ne détectent pas la neuropathie auditive', 'Les PEA sont plus rapides', 'Les OEA sont interdites', 'Pour mesurer le RECD'], e: 'La neuropathie conserve des OEA présentes alors que le nerf ne transmet pas.', tag: 'pedia' },
  { q: 'Première cause non génétique de surdité congénitale :', o: ['CMV congénital', 'Rubéole', 'Toxoplasmose', 'Prématurité'], e: 'Avec un risque d’apparition ou d’aggravation retardée.', tag: 'pedia' },
  { q: 'Cause génétique la plus fréquente de surdité congénitale non syndromique :', o: ['Mutations de GJB2 (connexine 26)', 'Gène SLC26A4', 'Gène OTOF', 'Gène USH2A'], e: 'DFNB1, transmission autosomique récessive.', tag: 'pedia' },
  { q: 'Syndrome de Jervell et Lange-Nielsen : quel examen ne pas oublier ?', o: ['Électrocardiogramme (QT long)', 'IRM des rochers', 'Fond d’œil', 'Bilan rénal'], e: 'Surdité profonde + QT long : risque de mort subite.', tag: 'pedia' },
  { q: 'Après une méningite bactérienne avec surdité profonde, l’implantation est urgente parce que :', o: ['La cochlée peut s’ossifier', 'Le nerf dégénère en quelques jours', 'Les aides auditives sont contre-indiquées', 'La méningite récidive'], e: 'Labyrinthite ossifiante.', tag: 'pedia' },
  { q: 'Audiométrie à renforcement visuel : à quel âge ?', o: ['Environ 6 à 30 mois', 'Dès la naissance', 'Après 5 ans', 'Uniquement chez l’adulte'], e: 'L’enfant tourne la tête vers le son et est récompensé par un stimulus visuel.', tag: 'pedia' },
  { q: 'Type d’appareil de première intention chez un enfant de 2 ans :', o: ['Contour d’oreille + embout souple sur mesure', 'Intra-profond', 'RIC avec dôme ouvert', 'Écouteurs grand public'], e: 'Robustesse, embout évolutif, sécurité du tiroir pile.', tag: 'pedia' }
];
const TYMP_Q = { bouchon: 'B, volume faible', osm: 'B, volume normal', tubaire: 'C', perforation: 'B, volume élevé', luxation: 'Ad', tympanosclerose: 'As', presby: 'A' };
function genQuestions(tag, n) {
  const rng = makeRng(newSeed());
  const out = [];
  const bank = QB.filter(q => tag === 'pedia' ? q.tag === 'pedia' : q.tag !== 'pedia' || rng.chance(0.3));
  rng.shuffle(bank).slice(0, Math.ceil(n * 0.6)).forEach(q => out.push({ q: q.q, ok: q.o[0], o: rng.shuffle(q.o), e: q.e }));
  const pool = PATHOS.filter(p => tag === 'pedia' ? p.pedia : p.adult !== false);
  let guard = 0;
  while (out.length < n && guard++ < 50) {
    const p = rng.pick(pool);
    const t = rng.int(0, 2);
    if (t === 0) {
      const sites = ['externe', 'moyenne', 'interne', 'retro'];
      const ok = SITES[p.site === 'mixte' ? 'moyenne' : p.site === 'fonction' ? 'interne' : p.site];
      if (p.site === 'fonction') continue;
      out.push({ q: `Site lésionnel principal : ${p.nom} ?`, ok, o: rng.shuffle(sites.map(s => SITES[s])), e: p.fiche.def });
    } else if (t === 1 && TYMP_Q[p.id]) {
      const all = ['A', 'As', 'Ad', 'B, volume normal', 'B, volume élevé', 'B, volume faible', 'C'];
      const ok = TYMP_Q[p.id];
      out.push({ q: `Tympanogramme typique : ${p.nom} ?`, ok, o: rng.shuffle([ok].concat(rng.shuffle(all.filter(x => x !== ok)).slice(0, 3))), e: p.fiche.audio });
    } else if (t === 2 && typeof p.conduite === 'string') {
      const ok = condLab(p.conduite);
      const others = rng.shuffle(CONDUITES.filter(c => c.k !== p.conduite)).slice(0, 3).map(c => c.l);
      out.push({ q: `${p.nom} : conduite à tenir de l’audioprothésiste ?`, ok, o: rng.shuffle([ok].concat(others)), e: p.fiche.cat });
    }
  }
  return rng.shuffle(out).slice(0, n);
}
function quizView(tag) {
  const st = tag === 'pedia' ? PEDIA : LEARN;
  if (!st.q) {
    const best = Store.get('quiz_' + tag, null);
    return `<section class="card"><h3>Série de 10 questions</h3><p class="muted small">Questions tirées d’une banque fixe et générées à partir des fiches pathologies : chaque série est différente.</p>
    ${best ? `<p class="small">Dernière série : <b>${best.ok}/${best.n}</b></p>` : ''}
    <button class="btn primary" data-act="qstart" data-tag="${tag}">Commencer</button></section>`;
  }
  const Q = st.q;
  if (Q.i >= Q.list.length) {
    return `<section class="card score"><div class="ring" style="--p:${Math.round(Q.ok / Q.list.length * 100)}"><span class="mono">${Q.ok}<small>/${Q.list.length}</small></span></div><div><h2>Série terminée</h2><p class="muted small">Les explications restent dans les fiches.</p></div></section>
    <button class="btn primary wide" data-act="qstart" data-tag="${tag}">Nouvelle série</button>`;
  }
  const q = Q.list[Q.i];
  const opts = q.o.map(o => {
    const sel = Q.sel === o, good = o === q.ok;
    const cls = Q.sel != null ? (good ? ' ok' : sel ? ' bad' : '') : '';
    return `<button class="opt${cls}" data-act="${Q.sel != null ? 'noop' : 'qans'}" data-tag="${tag}" data-val="${esc(o)}"><span>${esc(o)}</span></button>`;
  }).join('');
  return `<section class="card"><p class="eyebrow mono">Question ${Q.i + 1} / ${Q.list.length} · ${Q.ok} juste${Q.ok > 1 ? 's' : ''}</p><h3 class="qtxt">${esc(q.q)}</h3><div class="opts">${opts}</div>
  ${Q.sel != null ? `<p class="small">${esc(q.e)}</p><button class="btn primary wide" data-act="qnext" data-tag="${tag}">Suivante</button>` : ''}</section>`;
}
ACT.qstart = a => { const st = a.dataset.tag === 'pedia' ? PEDIA : LEARN; st.q = { list: genQuestions(a.dataset.tag, 10), i: 0, ok: 0, sel: null }; renderView(); };
ACT.qans = a => {
  const tag = a.dataset.tag, st = tag === 'pedia' ? PEDIA : LEARN, Q = st.q;
  Q.sel = a.dataset.val;
  if (Q.sel === Q.list[Q.i].ok) Q.ok++;
  if (Q.i === Q.list.length - 1) Store.set('quiz_' + tag, { ok: Q.ok, n: Q.list.length, d: Date.now() });
  renderView();
};
ACT.qnext = a => { const st = a.dataset.tag === 'pedia' ? PEDIA : LEARN; st.q.i++; st.q.sel = null; renderView(); };
