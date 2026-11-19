/* ============ ATLAS DES TESTS (1/2) : acoumétrie, tonale, supraliminaire ============ */
const sc = (c, ...p) => ({ c, s: p.join('') });
const TCATS = [
  { k: 'acou', l: 'Acoumétrie', d: 'Diapason et voix, sans appareil' },
  { k: 'tonale', l: 'Tonale', d: 'Seuils, masquage, variantes' },
  { k: 'supra', l: 'Supraliminaire', d: 'Recrutement, fatigue, topodiagnostic' },
  { k: 'vocale', l: 'Vocale', d: 'Calme, bruit, listes, central' },
  { k: 'objectif', l: 'Objectifs', d: 'Impédance, OEA, PEA' },
  { k: 'nonorg', l: 'Non organique', d: 'Simulation, exagération' },
  { k: 'pedia', l: 'Enfant', d: 'Tests selon l’âge' },
  { k: 'depist', l: 'Dépistage', d: 'Principes et protocoles' }
];
const TESTS = [];
const AUD_N = [[250, 10], [500, 10], [1000, 5], [2000, 10], [4000, 10], [8000, 15]];

/* ================= ACOUMÉTRIE ================= */
TESTS.push({
  id: 'acou_voix', cat: 'acou', niv: 'base', nom: 'Acoumétrie vocale (voix chuchotée, voix haute)',
  court: 'Estimer l’audition oreille par oreille avec la voix, sans aucun appareil.',
  but: 'Première impression rapide, contrôle de cohérence de l’audiogramme, dépistage en consultation.',
  mat: 'Une pièce calme d’au moins 6 m, la voix de l’examinateur, un moyen d’exclure l’autre oreille (frottement du tragus).',
  etapes: [
    'Le patient tourne l’oreille testée vers l’examinateur et ne doit pas voir ses lèvres (lecture labiale exclue).',
    'L’oreille opposée est exclue en frottant son tragus ou en la bouchant du doigt mouillé.',
    'L’examinateur prononce des mots ou des nombres en voix chuchotée, après une expiration normale (voix de réserve), puis en voix haute si besoin.',
    'On note la distance maximale à laquelle le patient répète correctement, pour chaque voix et chaque oreille.',
    'On recommence de l’autre côté.'
  ],
  interp: [
    ['Voix chuchotée perçue de loin des deux côtés', 'Pas de perte significative sur les fréquences de la parole'],
    ['Voix chuchotée raccourcie, voix haute conservée', 'Perte légère à moyenne, souvent sur les aigus (consonnes chuchotées)'],
    ['Asymétrie franche entre les oreilles', 'Atteinte unilatérale à explorer (audiométrie, avis ORL)'],
    ['Voix haute à moins de 1 m', 'Perte sévère']
  ],
  pieges: ['L’intensité de la voix varie d’un examinateur à l’autre : la méthode est peu reproductible.', 'Sans exclusion de l’autre oreille, une oreille sourde paraît entendre.', 'La lecture labiale fausse tout : se placer de côté ou derrière.'],
  retenir: 'Outil d’orientation simple, utile pour vérifier qu’un audiogramme est plausible. Il ne remplace pas l’audiométrie.',
  sim: 'acou', video: 'acoumétrie voix chuchotée examen audition',
  anim: [
    sc('L’examinateur se place sur le côté du patient, hors de son champ de vision, pour empêcher la lecture labiale.', SV.head({}), SV.person(320, 160, 'var(--brass)', 1, 'examinateur'), SV.flow('M296 118H245', 'var(--brass)')),
    sc('L’oreille opposée est exclue : on frotte son tragus. Ce bruit occupe l’oreille non testée.', SV.head({ occl: { L: 1 } }), SV.person(40, 160, 'var(--brass)', 1, 'examinateur'), SV.waves(70, 118, 0)),
    sc('Il chuchote des nombres ou des mots après une expiration normale, en reculant progressivement.', SV.head({ occl: { L: 1 } }), SV.person(30, 160, 'var(--brass)', 1), SV.bubble(70, 70, '« soixante-deux »', 'right'), SV.arrow(28, 190, 110, 190, 'var(--muted)'), SV.t(70, 205, 'distance en mètres', 'sv-s')),
    sc('On note la distance maximale de répétition correcte, pour la voix chuchotée et la voix haute, oreille par oreille.', SV.table(70, 60, ['', 'Chuchotée', 'Voix haute'], [['OD', '5 m', '> 10 m'], ['OG', '0,5 m', '4 m']], { cw: [60, 100, 100], hl: [0, 1] }), SV.t(180, 150, 'Ici : oreille gauche nettement moins bonne', 'sv-b'))
  ],
  quiz: [
    { q: 'Pourquoi frotter le tragus de l’oreille opposée ?', o: ['Pour l’exclure : le bruit l’occupe', 'Pour stimuler l’oreille testée', 'Pour mesurer le réflexe stapédien', 'Pour éviter le larsen'], e: 'Sans exclusion, l’oreille opposée répond à la place de l’oreille testée.' },
    { q: 'Les consonnes chuchotées sont surtout portées par :', o: ['Les fréquences aiguës', 'Les fréquences graves', 'Les infrasons', 'La conduction osseuse'], e: 'La voix chuchotée n’a pas de voisement : elle teste surtout les aigus.' }
  ]
});

TESTS.push({
  id: 'weber', cat: 'acou', niv: 'base', nom: 'Test de Weber',
  court: 'Le diapason sur la ligne médiane : de quel côté le son est-il entendu ?',
  but: 'Différencier une surdité de transmission d’une surdité de perception quand l’atteinte est asymétrique.',
  mat: 'Diapason 256 ou 512 Hz (le 512 Hz limite la perception vibratoire).',
  etapes: [
    'Faire vibrer le diapason modérément (frapper sur le genou ou le coude, jamais sur une surface dure).',
    'Poser le pied du diapason sur la ligne médiane : vertex, front, racine du nez ou incisives.',
    'Demander : « Où entendez-vous le son ? À droite, à gauche, au milieu ou partout ? »',
    'Répéter une fois en cas de doute ; noter le résultat avec la fréquence utilisée.'
  ],
  interp: [
    ['Indifférent (au milieu)', 'Audition normale ou atteinte symétrique'],
    ['Latéralisé du côté de l’oreille la plus mauvaise', 'Surdité de transmission de ce côté'],
    ['Latéralisé du côté de l’oreille la meilleure', 'Surdité de perception de l’oreille opposée']
  ],
  pieges: ['Le Weber seul ne dit rien : il se lit avec les deux Rinne.', 'Une transmission de 5 à 10 dB suffit à latéraliser : il est très sensible.', 'Dans une surdité mixte, le résultat peut être indifférent alors que l’atteinte est réelle.'],
  retenir: 'Transmission : le son va vers l’oreille malade. Perception : il va vers l’oreille saine.',
  sim: 'acou', video: 'test de Weber diapason explication',
  anim: [
    sc('Le diapason vibrant est posé sur le sommet du crâne. La vibration traverse l’os et atteint les deux cochlées en même temps.', SV.head({ hit: { R: 1, L: 1 } }), SV.forkAt('vertex'), SV.flow('M180 70Q160 100 149 118', 'var(--left)'), SV.flow('M180 70Q200 100 211 118', 'var(--left)')),
    sc('Audition normale ou symétrique : les deux cochlées reçoivent la même chose. Le son est perçu au milieu.', SV.head({ hit: { R: 1, L: 1 }, lat: 'mid' }), SV.forkAt('vertex')),
    sc('Transmission à droite : le conduit ou l’oreille moyenne est bloqué. Le bruit ambiant n’atteint plus la cochlée droite et l’énergie osseuse s’y échappe moins : le son paraît plus fort à droite.', SV.head({ hit: { R: 1 }, block: { R: 'transmission' }, lat: 'R' }), SV.forkAt('vertex')),
    sc('Perception à droite : la cochlée droite est abîmée. Le son est entendu du côté de la meilleure cochlée, à gauche.', SV.head({ hit: { L: 1 }, dead: { R: 1 }, lat: 'L' }), SV.forkAt('vertex')),
    sc('À retenir : en transmission, le Weber va vers l’oreille malade ; en perception, vers l’oreille saine.', SV.table(40, 70, ['Weber', 'Signification'], [['Indifférent', 'normal ou symétrique'], ['Vers l’oreille malade', 'transmission'], ['Vers l’oreille saine', 'perception de l’autre côté']], { cw: [120, 170] }))
  ],
  quiz: [
    { q: 'Weber latéralisé à gauche, Rinne gauche négatif :', o: ['Transmission gauche', 'Perception gauche', 'Perception droite', 'Normal'], e: 'Weber vers l’oreille malade et Rinne négatif du même côté : transmission.' },
    { q: 'Weber latéralisé à droite, deux Rinne positifs :', o: ['Perception gauche', 'Transmission droite', 'Perception droite', 'Cophose droite'], e: 'En perception, le Weber va vers la meilleure cochlée.' }
  ]
});

TESTS.push({
  id: 'rinne', cat: 'acou', niv: 'base', nom: 'Test de Rinne',
  court: 'Comparer, sur une même oreille, la conduction aérienne et la conduction osseuse.',
  but: 'Mettre en évidence une composante de transmission sur une oreille.',
  mat: 'Diapason 512 Hz (le 256 Hz détecte des écarts plus petits mais vibre davantage).',
  etapes: [
    'Faire vibrer le diapason et poser son pied sur la mastoïde, derrière le pavillon (conduction osseuse).',
    'Quand le patient ne l’entend plus, placer aussitôt les branches à 2 cm de l’entrée du conduit, sans toucher (conduction aérienne).',
    'Demander s’il l’entend encore. Variante : comparer d’emblée l’intensité « derrière » et « devant ».',
    'Faire de même de l’autre côté, en excluant l’oreille opposée si l’asymétrie est forte.'
  ],
  interp: [
    ['Rinne positif : aérien perçu plus longtemps ou plus fort', 'Normal ou surdité de perception'],
    ['Rinne négatif : osseux meilleur que l’aérien', 'Transmission d’au moins 20 à 30 dB sur cette oreille (à 512 Hz)'],
    ['Rinne négatif sur une oreille très sourde, Weber vers l’autre oreille', 'Faux Rinne négatif : la vibration est entendue par l’oreille opposée (cophose)']
  ],
  pieges: ['Faux négatif de la cophose : masquer l’oreille opposée (assourdisseur de Bárány ou frottement).', 'Ne pas toucher les poils ou le pavillon avec les branches.', 'Une petite transmission (10 à 15 dB) laisse le Rinne positif : il est moins sensible que le Weber.'],
  retenir: 'Rinne négatif = transmission sur cette oreille, à condition d’avoir éliminé le faux négatif d’une oreille cophotique.',
  sim: 'acou', video: 'test de Rinne diapason',
  anim: [
    sc('Le diapason est posé sur la mastoïde droite : c’est la conduction osseuse, qui contourne le conduit et l’oreille moyenne.', SV.ear(40, 110, { bc: 1, bcLab: 'mastoïde' }), SV.fork(216, 40, 0, true, .5)),
    sc('Dès que le patient ne l’entend plus, on place les branches devant le conduit : c’est la conduction aérienne.', SV.ear(40, 110, { ac: 1 }), SV.fork(6, 136, 0, true, .8), SV.waves(12, 110, 0)),
    sc('Oreille normale ou de perception : l’aérien est meilleur que l’osseux. Le patient entend encore le diapason devant l’oreille. Rinne positif.', SV.ear(40, 110, { ac: 1, hcHit: 1 }), SV.tag(180, 190, 'Rinne positif : aérien > osseux', 'var(--ok)')),
    sc('Transmission : le son aérien est freiné dans le conduit ou l’oreille moyenne. L’osseux devient meilleur. Rinne négatif.', SV.ear(40, 110, { ac: 1, fluid: 1, acBlock: 150, bc: 1 }), SV.tag(180, 190, 'Rinne négatif : osseux > aérien', 'var(--bad)')),
    sc('Piège : si l’oreille testée est cophotique, la vibration osseuse traverse le crâne et est entendue par l’autre oreille. Le Rinne paraît négatif à tort. Il faut masquer l’oreille opposée.', SV.head({ dead: { R: 1 }, hit: { L: 1 }, lat: 'L', latText: 'Je l’entends… à gauche' }), SV.forkAt('mastR'), SV.flow('M136 150Q180 175 211 125', 'var(--left)'))
  ],
  quiz: [
    { q: 'Un Rinne négatif à 512 Hz suppose un écart aérien-osseux d’au moins :', o: ['20 à 30 dB environ', '5 dB', '60 dB', 'Aucun écart'], e: 'Le Rinne est peu sensible aux petites transmissions.' },
    { q: 'Rinne droit négatif, Weber latéralisé à gauche, oreille droite très sourde :', o: ['Faux Rinne négatif : cophose droite probable', 'Transmission droite', 'Transmission gauche', 'Audition normale'], e: 'La vibration osseuse est captée par l’oreille gauche.' }
  ]
});

TESTS.push({
  id: 'schwabach', cat: 'acou', niv: 'base', nom: 'Test de Schwabach',
  court: 'Durée de perception osseuse du patient comparée à celle de l’examinateur.',
  but: 'Estimer la réserve cochléaire (état de l’oreille interne).',
  mat: 'Diapason 512 Hz, un examinateur normo-entendant.',
  etapes: ['Poser le diapason sur la mastoïde du patient jusqu’à ce qu’il ne l’entende plus.', 'Le poser aussitôt sur sa propre mastoïde (ou l’inverse).', 'Comparer les durées de perception.'],
  interp: [['Normal', 'Durées comparables'], ['Raccourci', 'Perte de perception (cochléaire)'], ['Allongé', 'Transmission (effet d’occlusion, moins de bruit ambiant)']],
  pieges: ['Suppose que l’examinateur entende normalement.', 'La vibration osseuse atteint les deux cochlées : le résultat reflète surtout la meilleure.'],
  retenir: 'Raccourci = perception ; allongé = transmission.',
  sim: 'acou', video: 'épreuve de Schwabach diapason',
  anim: [
    sc('Le diapason est posé sur la mastoïde du patient jusqu’à extinction du son.', SV.head({ hit: { R: 1, L: 1 } }), SV.forkAt('mastR'), SV.meter(110, 196, 140, 0.55, 'patient')),
    sc('Puis sur la mastoïde de l’examinateur. On compare les durées.', SV.person(120, 150, 'var(--ink)', 1.3, 'patient'), SV.person(240, 150, 'var(--brass)', 1.3, 'examinateur'), SV.meter(90, 186, 70, 0.4, 'durée patient'), SV.meter(210, 186, 70, 0.7, 'durée examinateur')),
    sc('Durée raccourcie : la cochlée du patient est moins sensible, c’est une perception. Durée allongée : transmission.', SV.table(60, 80, ['Schwabach', 'Évoque'], [['Raccourci', 'perception'], ['Normal', 'normal'], ['Allongé', 'transmission']], { cw: [120, 120] }))
  ],
  quiz: [{ q: 'Schwabach allongé :', o: ['Transmission', 'Perception', 'Neurinome', 'Simulation'], e: 'L’occlusion pathologique renforce la perception osseuse.' }]
});

TESTS.push({
  id: 'bing', cat: 'acou', niv: 'base', nom: 'Test de Bing',
  court: 'Boucher le conduit renforce-t-il le son osseux ?',
  but: 'Confirmer une transmission (absence d’effet d’occlusion).',
  mat: 'Diapason 256 ou 512 Hz.',
  etapes: ['Poser le diapason sur la mastoïde.', 'Pendant qu’il vibre, fermer et ouvrir alternativement le conduit en appuyant sur le tragus.', 'Demander si le son change d’intensité.'],
  interp: [['Bing positif : le son augmente quand on bouche', 'Normal ou perception (effet d’occlusion présent)'], ['Bing négatif : aucun changement', 'Transmission (l’oreille est déjà « bouchée »)']],
  pieges: ['L’effet d’occlusion concerne surtout les graves : un 256 ou 512 Hz est indispensable.'],
  retenir: 'L’effet d’occlusion existe chez le normal et en perception, il disparaît en transmission.',
  sim: 'acou', video: 'test de Bing diapason occlusion',
  anim: [
    sc('Diapason sur la mastoïde, conduit ouvert.', SV.head({ hit: { R: 1 } }), SV.forkAt('mastR')),
    sc('On bouche le conduit en appuyant sur le tragus. Chez le normal, l’énergie osseuse ne s’échappe plus par le conduit : le son devient plus fort. Bing positif.', SV.head({ hit: { R: 1 }, occl: { R: 1 } }), SV.forkAt('mastR'), SV.tag(180, 30, 'Plus fort : Bing positif', 'var(--ok)')),
    sc('En transmission, l’oreille est déjà fonctionnellement bouchée : fermer le conduit ne change rien. Bing négatif.', SV.head({ hit: { R: 1 }, occl: { R: 1 }, block: { R: 'transmission' } }), SV.forkAt('mastR'), SV.tag(180, 30, 'Pas de changement : Bing négatif', 'var(--bad)'))
  ],
  quiz: [{ q: 'Bing négatif :', o: ['Transmission', 'Normal', 'Perception', 'Hyperacousie'], e: 'L’effet d’occlusion a disparu.' }]
});

TESTS.push({
  id: 'gelle', cat: 'acou', niv: 'base', nom: 'Épreuve de Gellé',
  court: 'La pression dans le conduit modifie-t-elle la perception osseuse ?',
  but: 'Tester la mobilité de la chaîne ossiculaire, en particulier la fixation de l’étrier.',
  mat: 'Diapason 256 ou 512 Hz, poire de Politzer ou otoscope pneumatique étanche.',
  etapes: ['Diapason sur la mastoïde.', 'Augmenter la pression dans le conduit fermé de façon étanche.', 'Demander si le son diminue pendant la compression.'],
  interp: [['Gellé positif : le son diminue', 'Chaîne mobile (normal)'], ['Gellé négatif : aucun changement', 'Chaîne bloquée, classiquement otospongiose (ankylose stapédo-vestibulaire)']],
  pieges: ['Impossible si le tympan est perforé (pas d’étanchéité) ou en cas d’épanchement.', 'Examen délaissé au profit des réflexes stapédiens, mais toujours enseigné.'],
  retenir: 'Gellé négatif + transmission à tympan normal : penser otospongiose.',
  sim: 'acou', video: 'épreuve de Gellé otospongiose',
  anim: [
    sc('Diapason sur la mastoïde, conduit fermé par l’embout d’une poire.', SV.ear(40, 110, { bc: 1, probe: 1 })),
    sc('On comprime l’air dans le conduit. Si la chaîne est mobile, la pression rigidifie le système et le son diminue. Gellé positif.', SV.ear(40, 110, { bc: 1, probe: 1, retract: 1, tympHi: 'var(--brass)' }), SV.tag(180, 190, 'Le son diminue : Gellé positif', 'var(--ok)')),
    sc('Si l’étrier est bloqué, comme dans l’otospongiose, la pression ne change rien. Gellé négatif.', SV.ear(40, 110, { bc: 1, probe: 1, fix: 1 }), SV.tag(180, 190, 'Pas de changement : Gellé négatif', 'var(--bad)'))
  ],
  quiz: [{ q: 'Gellé négatif évoque :', o: ['Une otospongiose', 'Une presbyacousie', 'Un neurinome', 'Une OSM'], e: 'L’étrier ankylosé ne réagit plus à la pression.' }]
});

TESTS.push({
  id: 'federici', cat: 'acou', niv: 'avancé', nom: 'Test de Lewis-Federici',
  court: 'Comparer la perception du diapason sur la mastoïde et sur le tragus.',
  but: 'Confirmer une transmission, complément du Rinne.',
  mat: 'Diapason 512 Hz.',
  etapes: ['Poser le diapason sur la mastoïde, puis son pied sur le tragus qui ferme le conduit.', 'Demander où le son est le plus fort.'],
  interp: [['Plus fort sur le tragus (Federici positif)', 'Normal ou perception'], ['Plus fort sur la mastoïde (Federici négatif)', 'Transmission']],
  pieges: ['Résultat proche du Rinne : il n’apporte qu’une confirmation.'],
  retenir: 'Federici négatif = transmission.',
  sim: 'acou', video: 'test de Lewis Federici diapason',
  anim: [
    sc('Diapason sur la mastoïde.', SV.head({ hit: { R: 1 } }), SV.forkAt('mastR')),
    sc('Puis sur le tragus, qui ferme le conduit et transmet la vibration par voie aérienne et osseuse.', SV.head({ hit: { R: 1 } }), SV.forkAt('tragR')),
    sc('Normal ou perception : plus fort sur le tragus. Transmission : plus fort sur la mastoïde.', SV.table(60, 80, ['Plus fort sur', 'Évoque'], [['le tragus', 'normal ou perception'], ['la mastoïde', 'transmission']], { cw: [120, 150] }))
  ],
  quiz: [{ q: 'Plus fort sur la mastoïde que sur le tragus :', o: ['Transmission', 'Perception', 'Normal', 'Simulation'], e: 'Federici négatif.' }]
});

TESTS.push({
  id: 'acou_synth', cat: 'acou', niv: 'base', nom: 'Lire une acoumétrie complète',
  court: 'Croiser Weber, Rinne, Schwabach et Bing pour conclure.',
  but: 'Arriver à une conclusion cohérente avant l’audiométrie.',
  mat: 'Résultats des épreuves au diapason.',
  etapes: ['Commencer par le Weber : il donne le côté.', 'Lire les deux Rinne : ils disent s’il y a une transmission.', 'Schwabach et Bing confirment.', 'Vérifier la cohérence : un résultat isolé contradictoire fait refaire l’épreuve en masquant.'],
  interp: [
    ['Weber D, Rinne D −, Rinne G +', 'Transmission droite'],
    ['Weber G, Rinne D +, Rinne G +', 'Perception droite'],
    ['Weber indifférent, Rinne D −, Rinne G −', 'Transmission bilatérale symétrique'],
    ['Weber G, Rinne D −, Rinne G +', 'Cophose droite probable (faux Rinne négatif)'],
    ['Weber indifférent, deux Rinne +', 'Normal ou perception symétrique']
  ],
  pieges: ['Surdité mixte : les épreuves peuvent se contredire, l’audiométrie tranche.', 'Le 512 Hz ne renseigne que sur les fréquences moyennes.'],
  retenir: 'Weber pour le côté, Rinne pour le type, toujours ensemble.',
  sim: 'acou', video: 'interprétation Weber Rinne surdité transmission perception',
  anim: [
    sc('Transmission droite : Weber vers la droite, Rinne négatif à droite, positif à gauche.', SV.head({ block: { R: 'transmission' }, lat: 'R' }), SV.tag(90, 205, 'Rinne D −', 'var(--bad)'), SV.tag(270, 205, 'Rinne G +', 'var(--ok)')),
    sc('Perception droite : Weber vers la gauche, deux Rinne positifs.', SV.head({ dead: { R: 1 }, lat: 'L' }), SV.tag(90, 205, 'Rinne D +', 'var(--ok)'), SV.tag(270, 205, 'Rinne G +', 'var(--ok)')),
    sc('Cophose droite : Weber vers la gauche, mais Rinne droit négatif. C’est un faux négatif, la vibration est entendue à gauche.', SV.head({ dead: { R: 1 }, lat: 'L' }), SV.tag(90, 205, 'Rinne D − (faux)', 'var(--warn)'), SV.tag(270, 205, 'Rinne G +', 'var(--ok)'))
  ],
  quiz: [{ q: 'Weber indifférent, deux Rinne négatifs :', o: ['Transmission bilatérale symétrique', 'Normal', 'Perception bilatérale', 'Cophose bilatérale'], e: 'Les deux oreilles ont une transmission, le Weber reste au centre.' }]
});

/* ================= TONALE ================= */
TESTS.push({
  id: 'ca_hw', cat: 'tonale', niv: 'base', nom: 'Conduction aérienne (Hughson-Westlake)',
  court: 'Rechercher le seuil liminaire par la méthode ascendante, fréquence par fréquence.',
  but: 'Mesurer le seuil de chaque oreille de 125 ou 250 à 8000 Hz, base de tout bilan.',
  mat: 'Audiomètre étalonné, casque supra-aural ou inserts, cabine ou pièce calme.',
  etapes: [
    'Otoscopie : conduit libre, pas de collapsus sous le casque.',
    'Consigne : « Levez la main ou appuyez dès que vous entendez un bip, même très faible. »',
    'Familiarisation à 1000 Hz, à un niveau clairement audible (par exemple 40 dB HL, ou 30 dB au-dessus du seuil présumé).',
    'Après chaque réponse : descendre de 10 dB. Sans réponse : monter de 5 dB.',
    'Seuil = niveau le plus faible obtenu en montée, au moins 2 fois sur 3 (ou dans la moitié des montées).',
    'Ordre : 1000, 2000, 4000, 8000 Hz, retest de 1000 Hz (écart ≤ 5 dB), puis 500, 250 Hz. Intermédiaires (750, 1500, 3000, 6000) si deux octaves voisines diffèrent de 20 dB ou plus.',
    'Commencer par la meilleure oreille.'
  ],
  interp: [['Seuil ≤ 20 dB HL', 'Normal'], ['Retest 1000 Hz différent de plus de 5 dB', 'Fiabilité douteuse : reconsigner, refaire'], ['Écarts brusques entre fréquences voisines', 'Mesurer les inter-octaves']],
  pieges: ['Rythme régulier : le patient anticipe. Varier les intervalles.', 'Acouphène : utiliser des sons pulsés ou wobulés.', 'Conduit qui se collabe sous le casque (sujet âgé) : faux écart sur les aigus, utiliser des inserts.', 'Courbe fantôme sans masquage (voir Masquage).'],
  retenir: '« 10 en bas, 5 en haut », seuil retenu en montée, 2 réponses sur 3.',
  video: 'audiométrie tonale méthode Hughson Westlake', sim: 'cab',
  anim: [
    sc('Familiarisation : un son clairement audible à 1000 Hz pour que le patient reconnaisse le signal.', SV.head({ casque: 1, hit: { R: 1 } }), SV.tag(180, 200, '1000 Hz · 40 dB HL', 'var(--brass)')),
    sc('Le patient répond : on descend de 10 dB. Il ne répond plus : on remonte de 5 dB.', SV.graph(40, 30, 280, 150, [{ pts: [[0, .78], [.1, .64], [.2, .5], [.3, .36], [.4, .43], [.5, .5], [.6, .36], [.7, .43], [.8, .5], [.9, .36], [1, .43]], col: 'var(--brass)', draw: 1 }], { xl: 'présentations', yl: 'dB HL', grid: 1 }), SV.t(260, 60, '− 10 après réponse', 'sv-s'), SV.t(260, 76, '+ 5 sans réponse', 'sv-s')),
    sc('Le seuil est le niveau le plus faible entendu en montée au moins deux fois sur trois.', SV.graph(40, 30, 280, 150, [{ pts: [[0, .78], [.1, .64], [.2, .5], [.3, .36], [.4, .43], [.5, .5], [.6, .36], [.7, .43], [.8, .5], [.9, .36], [1, .43]], col: 'var(--muted)' }, { pts: [[0, .43], [1, .43]], col: 'var(--ok)', dash: 1, lab: 'seuil' }], { grid: 1 }), SV.check(126, 103), SV.check(210, 103), SV.check(300, 103)),
    sc('On parcourt les fréquences, on vérifie 1000 Hz, et on reporte les seuils sur l’audiogramme.', SV.audio(70, 30, 230, 150, [{ side: 'R', pts: [[250, 15], [500, 15], [1000, 20], [2000, 30], [4000, 50], [8000, 60]] }], { label: 'oreille droite' }))
  ],
  quiz: [
    { q: 'Après une réponse, en Hughson-Westlake modifiée, on :', o: ['Descend de 10 dB', 'Monte de 5 dB', 'Descend de 5 dB', 'Change de fréquence'], e: '« 10 en bas, 5 en haut ».' },
    { q: 'On teste 3000 Hz quand :', o: ['2000 et 4000 Hz diffèrent de 20 dB ou plus', 'Toujours en premier', 'Jamais en audiométrie clinique', 'Seulement en CO'], e: 'Règle des inter-octaves.' }
  ]
});

TESTS.push({
  id: 'co', cat: 'tonale', niv: 'base', nom: 'Conduction osseuse',
  court: 'Mesurer la sensibilité de la cochlée en court-circuitant conduit et oreille moyenne.',
  but: 'Séparer transmission et perception grâce à l’écart aérien-osseux.',
  mat: 'Vibrateur osseux (type B71 ou B81) sur serre-tête, mastoïde ou front.',
  etapes: ['Vibrateur sur la mastoïde, sans toucher le pavillon, appui ferme.', 'Fréquences de 250 à 4000 Hz, même méthode ascendante.', 'Masquer dès qu’un écart aérien-osseux apparaît (voir Masquage en CO).', 'Noter « pas de réponse » si la sortie maximale est atteinte.'],
  interp: [['CO normale, CA abaissée', 'Transmission'], ['CO = CA, toutes deux abaissées', 'Perception'], ['CO abaissée, CA encore plus', 'Surdité mixte']],
  pieges: ['Sortie maximale limitée (environ 45 dB à 250 Hz, 60 dB à 500 Hz, 70 dB vers 1 à 2 kHz) : penser à la flèche « pas de réponse ».', 'Aux graves, une forte stimulation peut être sentie (vibrotactile) plutôt qu’entendue.', 'Vers 3 et 4 kHz, le vibrateur rayonne un peu de son dans l’air : faux écart possible.', 'Sans masquage, la CO mesurée est celle de la meilleure cochlée (atténuation interaurale ≈ 0 dB).'],
  retenir: 'La CO non masquée appartient toujours à la meilleure cochlée.',
  video: 'conduction osseuse audiométrie vibrateur masquage', sim: 'cab',
  anim: [
    sc('Le vibrateur fait vibrer le crâne. Le son atteint directement la cochlée, sans passer par le conduit ni l’oreille moyenne.', SV.ear(40, 110, { bc: 1, bcLab: 'vibrateur', hcHit: 1 })),
    sc('Le crâne vibre en bloc : les deux cochlées reçoivent le stimulus, l’atténuation interaurale est quasi nulle.', SV.head({ vib: { R: 1 }, hit: { R: 1, L: 1 } }), SV.flow('M130 150Q180 178 211 122', 'var(--left)'), SV.flow('M130 150Q140 135 149 122', 'var(--left)')),
    sc('Transmission : la CO reste normale, la CA est abaissée. L’écart entre les deux est l’écart aérien-osseux.', SV.audio(70, 30, 230, 150, [{ side: 'R', pts: [[250, 45], [500, 40], [1000, 35], [2000, 30], [4000, 30]] }, { side: 'R', bc: 1, pts: [[250, 5], [500, 10], [1000, 10], [2000, 15], [4000, 10]] }], { label: 'écart aérien-osseux de 25 à 35 dB' }))
  ],
  quiz: [{ q: 'Atténuation interaurale en conduction osseuse :', o: ['Environ 0 dB', '40 dB', '55 dB', '80 dB'], e: 'Le crâne vibre en bloc.' }]
});

TESTS.push({
  id: 'masq_ca', cat: 'tonale', niv: 'base', nom: 'Masquage en conduction aérienne',
  court: 'Occuper l’oreille non testée pour éviter qu’elle réponde à la place de l’autre.',
  but: 'Obtenir le seuil vrai d’une oreille nettement moins bonne que l’autre.',
  mat: 'Bruit à bande étroite centré sur la fréquence testée, envoyé dans l’oreille non testée.',
  etapes: [
    'Repérer le risque : seuil CA de l’oreille testée − atténuation interaurale ≥ CO de l’oreille non testée.',
    'Atténuation interaurale prudente : ≈ 40 dB au casque supra-aural, ≈ 55 dB aux inserts.',
    'Niveau de départ du bruit : seuil CA de l’oreille non testée + 10 dB.',
    'Rechercher le seuil avec le bruit, puis appliquer la méthode du plateau (fiche suivante).'
  ],
  interp: [['Seuil inchangé avec le bruit', 'Le seuil non masqué était vrai'], ['Seuil qui monte avec le bruit puis se stabilise', 'Le premier seuil était une courbe fantôme ; le plateau donne le seuil vrai']],
  pieges: ['Courbe fantôme : une oreille cophotique non masquée donne une courbe parallèle à l’oreille saine, environ 40 à 60 dB plus bas.', 'Surmasquage : un bruit trop fort repasse vers l’oreille testée et fausse le seuil.', 'Les inserts réduisent le besoin de masquage grâce à une atténuation plus grande.'],
  retenir: 'Masquer en CA quand CA(testée) − 40 ≥ CO(non testée) au casque.',
  video: 'masquage audiométrie tonale courbe fantôme', sim: 'cab',
  anim: [
    sc('Oreille droite cophotique. Sans masquage, un son fort envoyé à droite traverse le crâne, atténué d’environ 40 dB, et la cochlée gauche l’entend.', SV.head({ casque: 1, dead: { R: 1 }, hit: { L: 1 } }), SV.flow('M118 100Q180 60 211 118', 'var(--right)'), SV.tag(180, 30, '90 dB à droite → ≈ 50 dB à gauche', 'var(--right)')),
    sc('Résultat : une courbe fantôme, parallèle à l’oreille gauche, qui n’appartient pas à l’oreille droite.', SV.audio(70, 30, 230, 150, [{ side: 'L', pts: [[250, 10], [500, 10], [1000, 15], [2000, 15], [4000, 20]] }, { side: 'R', pts: [[250, 55], [500, 50], [1000, 55], [2000, 60], [4000, 60]], cls: 'sv-ghost' }], { label: 'courbe fantôme ≈ 40 à 50 dB sous l’oreille saine' })),
    sc('On envoie un bruit dans l’oreille gauche. Elle est occupée et ne peut plus répondre au son transféré.', SV.head({ casque: 1, dead: { R: 1 } }), SV.waves(232, 118, 0, SVL), SV.tag(270, 40, 'bruit à gauche', SVL), SV.flow('M118 100Q180 60 211 118', 'var(--right)'), SV.cross(205, 112)),
    sc('Avec un masquage suffisant, l’oreille droite ne répond plus : pas de réponse au maximum de l’audiomètre. C’est le seuil vrai.', SV.audio(70, 30, 230, 150, [{ side: 'L', pts: [[250, 10], [500, 10], [1000, 15], [2000, 15], [4000, 20]] }, { side: 'R', pts: [[250, 105], [500, 120], [1000, 120], [2000, 120], [4000, 120]] }], { label: 'OD masquée : pas de réponse' }))
  ],
  quiz: [
    { q: 'Atténuation interaurale prudente aux inserts :', o: ['≈ 55 dB', '≈ 0 dB', '≈ 20 dB', '≈ 100 dB'], e: 'Plus élevée qu’au casque supra-aural (≈ 40 dB).' },
    { q: 'Une courbe parallèle à l’oreille saine, 45 dB plus bas, sans masquage :', o: ['Courbe fantôme probable', 'Surdité symétrique', 'Simulation certaine', 'Transmission'], e: 'C’est l’autre oreille qui répond par transfert transcrânien.' }
  ]
});

TESTS.push({
  id: 'hood', cat: 'tonale', niv: 'avancé', nom: 'Méthode du plateau (Hood) et limites du masquage',
  court: 'Augmenter le bruit par paliers jusqu’à ce que le seuil ne bouge plus.',
  but: 'Trouver le seuil vrai sans sous-masquer ni surmasquer.',
  mat: 'Audiomètre avec masquage controlatéral à bande étroite.',
  etapes: [
    'Bruit initial : CA de l’oreille masquée + 10 dB. Rechercher le seuil.',
    'Monter le bruit de 5 à 10 dB, rechercher à nouveau le seuil.',
    'Si le seuil monte à chaque palier : sous-masquage, on continue.',
    'Plateau : le seuil reste stable sur au moins 3 paliers successifs (15 à 20 dB de largeur). C’est le seuil vrai.',
    'Si le seuil remonte encore après le plateau : surmasquage, le bruit atteint l’oreille testée.'
  ],
  interp: [
    ['Masquage minimal efficace', '≈ seuil testé − atténuation interaurale + écart aérien-osseux de l’oreille masquée + 10 dB'],
    ['Masquage maximal (surmasquage)', '≈ CO de l’oreille testée + atténuation interaurale − 5 dB'],
    ['Plateau introuvable', 'Dilemme de masquage (transmission bilatérale importante) : inserts, Rainville, Weber audiométrique']
  ],
  pieges: ['Un écart aérien-osseux sur l’oreille masquée « mange » le bruit : il en faut davantage.', 'En CO, l’atténuation interaurale du bruit reste celle de la voie aérienne (≈ 40 ou 55 dB) : c’est elle qui limite le surmasquage.'],
  retenir: 'Sous-masquage : le seuil monte. Plateau : seuil vrai. Surmasquage : le seuil remonte encore.',
  video: 'méthode du plateau Hood masquage audiométrie', sim: 'cab',
  anim: [
    sc('On trace le seuil de l’oreille testée en fonction du niveau de bruit dans l’autre oreille.', SV.graph(50, 30, 260, 150, [], { xl: 'bruit (dB EM)', yl: 'seuil testé', grid: 1 })),
    sc('Zone de sous-masquage : chaque fois qu’on monte le bruit, le seuil monte aussi. L’oreille masquée répondait encore.', SV.graph(50, 30, 260, 150, [{ pts: [[0, .15], [.1, .25], [.2, .35], [.3, .45]], col: 'var(--warn)', draw: 1, lab: 'sous-masquage', labAt: 1 }], { xl: 'bruit (dB EM)', yl: 'seuil testé', grid: 1 })),
    sc('Plateau : le seuil reste stable sur plusieurs paliers. C’est le seuil vrai de l’oreille testée.', SV.graph(50, 30, 260, 150, [{ pts: [[0, .15], [.1, .25], [.2, .35], [.3, .45]], col: 'var(--warn)' }, { pts: [[.3, .45], [.4, .46], [.5, .45], [.6, .46], [.7, .46]], col: 'var(--ok)', w: 3, draw: 1, lab: 'plateau = seuil vrai', labAt: 1 }], { xl: 'bruit (dB EM)', yl: 'seuil testé', grid: 1 })),
    sc('Au-delà, le bruit repasse vers l’oreille testée et le seuil remonte : c’est le surmasquage.', SV.graph(50, 30, 260, 150, [{ pts: [[0, .15], [.1, .25], [.2, .35], [.3, .45]], col: 'var(--warn)' }, { pts: [[.3, .45], [.4, .46], [.5, .45], [.6, .46], [.7, .46]], col: 'var(--ok)', w: 3 }, { pts: [[.7, .46], [.8, .58], [.9, .7], [1, .82]], col: 'var(--bad)', draw: 1, lab: 'surmasquage', labAt: 1 }], { xl: 'bruit (dB EM)', yl: 'seuil testé', grid: 1 }))
  ],
  quiz: [
    { q: 'Le seuil continue de monter à chaque augmentation du bruit, dès le début :', o: ['Sous-masquage : continuer', 'Plateau atteint', 'Surmasquage', 'Fin de l’examen'], e: 'L’oreille masquée répondait encore.' },
    { q: 'Masquage maximal approximatif :', o: ['CO testée + atténuation interaurale − 5', 'CA masquée + 10', 'Seuil testé − 40', 'Toujours 90 dB'], e: 'Au-delà, le bruit atteint la cochlée testée.' }
  ]
});

TESTS.push({
  id: 'occlusion', cat: 'tonale', niv: 'avancé', nom: 'Masquage en CO et effet d’occlusion',
  court: 'Le casque de masquage bouche l’oreille non testée : la CO y devient meilleure dans les graves.',
  but: 'Masquer correctement en conduction osseuse.',
  mat: 'Vibrateur sur l’oreille testée, écouteur de masquage sur l’oreille opposée.',
  etapes: ['Masquer en CO dès qu’un écart aérien-osseux de 10 dB ou plus apparaît sur l’oreille testée.', 'Bruit initial : CA de l’oreille masquée + 10 dB + correction d’occlusion.', 'Correction d’occlusion (oreille masquée sans transmission) : ≈ +15 dB à 250 Hz, +10 dB à 500 Hz, +5 dB à 1000 Hz, rien au-delà.', 'Méthode du plateau comme en CA.'],
  interp: [['Oreille masquée avec transmission', 'Pas d’effet d’occlusion : pas de correction'], ['Inserts profonds', 'Effet d’occlusion réduit']],
  pieges: ['Oublier l’effet d’occlusion : sous-masquage aux graves, faux écart aérien-osseux.'],
  retenir: 'En CO, ajouter l’effet d’occlusion au bruit initial dans les graves si l’oreille masquée n’a pas de transmission.',
  video: 'effet d’occlusion masquage conduction osseuse', sim: 'cab',
  anim: [
    sc('L’écouteur de masquage couvre l’oreille non testée. Il la bouche.', SV.head({ vib: { R: 1 }, block: { L: 'écouteur' } }), SV.waves(232, 118, 0, SVL)),
    sc('Boucher une oreille renforce la conduction osseuse dans les graves : la cochlée gauche entend mieux le vibrateur. Il faut plus de bruit pour l’occuper.', SV.head({ vib: { R: 1 }, block: { L: 'écouteur' }, hit: { L: 1 } }), SV.flow('M130 150Q180 178 211 122', 'var(--left)'), SV.tag(270, 40, '+15 dB à 250 Hz', 'var(--brass)'))
  ],
  quiz: [{ q: 'Correction d’occlusion à 2000 Hz :', o: ['Aucune', '+15 dB', '+10 dB', '+30 dB'], e: 'L’effet d’occlusion concerne les graves.' }]
});

TESTS.push({
  id: 'weber_audio', cat: 'tonale', niv: 'avancé', nom: 'Weber audiométrique',
  court: 'Le Weber réalisé avec le vibrateur de l’audiomètre, fréquence par fréquence.',
  but: 'Savoir à quelle oreille appartient une CO non masquée, et aider en cas de dilemme de masquage.',
  mat: 'Vibrateur posé sur le front.',
  etapes: ['Vibrateur au front.', 'Présenter 250, 500, 1000, 2000 Hz environ 10 à 15 dB au-dessus du seuil osseux.', 'Demander de quel côté le son est perçu.'],
  interp: [['Latéralisé vers l’oreille la plus mauvaise en CA', 'Transmission de cette oreille'], ['Latéralisé vers la meilleure oreille', 'Perception de l’autre oreille'], ['Indifférent', 'Symétrie cochléaire']],
  pieges: ['Aux graves, risque de réponse vibratoire.'],
  retenir: 'Même logique que le Weber au diapason, mais par fréquence et avec un niveau connu.',
  video: 'Weber audiométrique vibrateur front', sim: 'cab',
  anim: [sc('Le vibrateur est posé au front. On présente chaque fréquence un peu au-dessus du seuil osseux et on demande le côté.', SV.head({ vibFront: 1, hit: { R: 1, L: 1 }, lat: 'R' }), SV.tag(180, 205, '500 Hz · 20 dB : « à droite »', 'var(--brass)'))],
  quiz: [{ q: 'Intérêt principal du Weber audiométrique :', o: ['Attribuer une CO non masquée à une oreille', 'Mesurer le seuil d’inconfort', 'Remplacer l’otoscopie', 'Tester le nerf facial'], e: 'Il indique quelle cochlée répond.' }]
});

TESTS.push({
  id: 'rainville', cat: 'tonale', niv: 'avancé', nom: 'Test de Rainville et SAL',
  court: 'Mesurer la réserve cochléaire avec un bruit osseux, sans les pièges du masquage classique.',
  but: 'Estimer la conduction osseuse quand le masquage est impossible (dilemme de masquage) ou la CO douteuse.',
  mat: 'Audiomètre, vibrateur délivrant un bruit large bande (front ou mastoïde), casque pour le son test.',
  etapes: [
    'Mesurer le seuil en CA au casque sans bruit, fréquence par fréquence.',
    'Envoyer un bruit blanc par le vibrateur, à niveau fixe et connu.',
    'Mesurer de nouveau le seuil en CA en présence de ce bruit osseux.',
    'Calculer le déplacement du seuil : seuil avec bruit − seuil sans bruit.',
    'Comparer au déplacement obtenu chez des normo-entendants avec le même bruit (étalonnage biologique du montage).',
    'SAL (Jerger et Tillman, 1960) : niveau de sensibilité neurosensorielle = déplacement normal − déplacement du patient. C’est l’estimation de la perte cochléaire.'
  ],
  interp: [
    ['Déplacement égal à la norme', 'Cochlée normale : la perte est transmissionnelle'],
    ['Déplacement réduit', 'Perte de perception, égale à la réduction (SAL)'],
    ['Aucun déplacement', 'Perte cochléaire au moins égale au niveau du bruit : augmenter le bruit']
  ],
  pieges: ['Le bruit osseux atteint les deux cochlées : c’est ce qui supprime le transfert transcrânien, mais il faut le niveau du bruit en dB efficaces.', 'Limite : la sortie maximale du vibrateur borne la mesure des pertes cochléaires importantes.', 'Méthode exigeante en étalonnage : la norme de déplacement est propre à chaque montage.'],
  retenir: 'Le bruit osseux décale le seuil autant que chez le normal si la cochlée est saine, moins si elle est atteinte : la différence donne la perte de perception.',
  sim: 'rainville', video: 'test SAL sensorineural acuity level Rainville',
  anim: [
    sc('Premier temps : seuil en conduction aérienne au casque, sans bruit.', SV.head({ casque: 1, hit: { R: 1 } }), SV.tag(180, 30, 'OD 1000 Hz : 50 dB HL', 'var(--right)')),
    sc('Deuxième temps : un bruit blanc est envoyé par le vibrateur au front. Il atteint directement les deux cochlées, sans passer par l’oreille moyenne.', SV.head({ casque: 1, vibFront: 1, hit: { R: 1, L: 1 } }), SV.flow('M180 72Q160 100 149 118', 'var(--left)'), SV.flow('M180 72Q200 100 211 118', 'var(--left)')),
    sc('Chez le normo-entendant, ce bruit relève le seuil de, par exemple, 50 dB. C’est le déplacement de référence.', SV.graph(60, 40, 240, 130, [{ pts: [[.1, .9], [.1, .5]], col: 'var(--ok)', w: 4 }, { pts: [[.4, .9], [.4, .5]], col: 'var(--right)', w: 4 }, { pts: [[.75, .9], [.75, .7]], col: 'var(--right)', w: 4 }], { yt: [[.9, 'sans bruit'], [.5, '+50']] }), SV.t(84, 190, 'normal : +50', 'sv-s'), SV.t(156, 190, 'transmission : +50', 'sv-s'), SV.t(240, 190, 'perception : +20', 'sv-s')),
    sc('Transmission : le bruit osseux décale le seuil autant que chez le normal. La cochlée est saine.', SV.ear(40, 110, { fluid: 1, bc: 1, bcLab: 'bruit osseux', hcHit: 1 }), SV.tag(180, 190, 'déplacement normal → cochlée normale', 'var(--ok)')),
    sc('Perception : la cochlée atteinte est moins gênée par le bruit. Le déplacement est réduit de 30 dB : la perte cochléaire est de 30 dB. C’est le SAL.', SV.ear(40, 110, { hc: 1, bc: 1, bcLab: 'bruit osseux' }), SV.tag(180, 190, 'SAL = 50 − 20 = 30 dB de perte cochléaire', 'var(--bad)'))
  ],
  quiz: [
    { q: 'Bruit osseux : déplacement normal 50 dB, déplacement du patient 50 dB. La cochlée est :', o: ['Normale (perte de transmission)', 'Atteinte de 50 dB', 'Morte', 'Impossible à dire'], e: 'Même effet du bruit que chez le normal.' },
    { q: 'Déplacement normal 45 dB, patient 15 dB. Perte cochléaire estimée (SAL) :', o: ['30 dB', '15 dB', '45 dB', '60 dB'], e: '45 − 15 = 30 dB.' }
  ]
});

TESTS.push({
  id: 'bekesy', cat: 'tonale', niv: 'avancé', nom: 'Audiométrie de Békésy (types de Jerger)',
  court: 'Le patient trace lui-même son seuil en son pulsé et en son continu.',
  but: 'Audiométrie automatique et topodiagnostic (adaptation au son continu).',
  mat: 'Audiomètre à poursuite : le niveau baisse tant que le patient appuie, monte quand il relâche.',
  etapes: ['Balayage lent de fréquence (ou fréquence fixe) en son pulsé, puis en son continu.', 'Comparer les deux tracés : position et amplitude des zigzags.'],
  interp: [
    ['Type I : tracés superposés', 'Normal ou transmission'],
    ['Type II : continu 10 à 20 dB sous le pulsé à partir de 1 kHz, petits zigzags', 'Atteinte cochléaire (recrutement)'],
    ['Type III : le continu s’effondre très vite', 'Atteinte rétrocochléaire'],
    ['Type IV : continu sous le pulsé de plus de 20 dB sur toutes les fréquences', 'Rétrocochléaire'],
    ['Type V : continu meilleur que le pulsé', 'Surdité non organique']
  ],
  pieges: ['Demande de la coopération et de la concentration.'],
  retenir: 'II cochléaire, III et IV rétrocochléaires, V non organique.',
  sim: 'topo', video: 'audiométrie de Békésy types Jerger',
  anim: [
    sc('Le patient appuie tant qu’il entend : le niveau baisse. Il relâche : le niveau monte. Le tracé zigzague autour du seuil.', SV.graph(40, 30, 280, 150, [{ pts: Array.from({ length: 30 }, (_, k) => [k / 29, .6 + (k % 2 ? .05 : -.05)]), col: 'var(--ink)', w: 1.4, draw: 1, lab: 'pulsé' }], { xl: 'fréquence', yl: 'dB HL' })),
    sc('Type deux, cochléaire : le tracé en son continu passe sous le pulsé dans les aigus, avec des zigzags plus petits, signe de recrutement.', SV.graph(40, 30, 280, 150, [{ pts: Array.from({ length: 30 }, (_, k) => [k / 29, .6 + (k % 2 ? .05 : -.05)]), col: 'var(--ink)', w: 1.2, lab: 'pulsé' }, { pts: Array.from({ length: 30 }, (_, k) => [k / 29, .6 - (k > 10 ? .12 : 0) + (k % 2 ? .02 : -.02)]), col: 'var(--right)', w: 1.2, draw: 1, lab: 'continu', labAt: 25 }], { xl: 'fréquence', yl: 'dB HL' })),
    sc('Type trois, rétrocochléaire : en son continu, le seuil s’effondre très vite. Le nerf ne tient pas la stimulation prolongée.', SV.graph(40, 30, 280, 150, [{ pts: Array.from({ length: 30 }, (_, k) => [k / 29, .6 + (k % 2 ? .05 : -.05)]), col: 'var(--ink)', w: 1.2, lab: 'pulsé' }, { pts: Array.from({ length: 30 }, (_, k) => [k / 29, Math.max(.05, .6 - k * .04) + (k % 2 ? .03 : -.03)]), col: 'var(--bad)', w: 1.2, draw: 1, lab: 'continu', labAt: 8 }], { xl: 'fréquence', yl: 'dB HL' }))
  ],
  quiz: [{ q: 'Békésy type V :', o: ['Évoque une surdité non organique', 'Est cochléaire', 'Est normal', 'Est rétrocochléaire'], e: 'Le continu meilleur que le pulsé n’a pas d’explication organique.' }]
});

TESTS.push({
  id: 'hf', cat: 'tonale', niv: 'avancé', nom: 'Audiométrie haute fréquence',
  court: 'Mesurer les seuils de 8 à 16 kHz (parfois 20 kHz).',
  but: 'Détecter précocement l’ototoxicité ou un traumatisme sonore, explorer un acouphène à audiogramme normal.',
  mat: 'Audiomètre étendu, casque circumaural dédié (étalonnage spécifique).',
  etapes: ['Mesure de référence avant le traitement ototoxique.', 'Contrôles réguliers pendant et après le traitement.', 'Comparer chaque contrôle à la référence.'],
  interp: [['Critères ASHA de toxicité', '≥ 20 dB de baisse sur 1 fréquence, ou ≥ 10 dB sur 2 fréquences voisines, ou perte de réponse sur 3 fréquences consécutives'], ['Seuils élevés dès 25 ans', 'Peut être normal : forte variabilité et effet de l’âge']],
  pieges: ['Normes très dépendantes de l’âge : comparer surtout le patient à lui-même.', 'Positionnement du casque critique : petites variations, grands écarts.'],
  retenir: 'Le suivi haute fréquence repère l’ototoxicité avant qu’elle touche la parole.',
  video: 'audiométrie haute fréquence ototoxicité',
  anim: [sc('Les médicaments ototoxiques atteignent d’abord l’extrême base de la cochlée, donc les très hautes fréquences, avant les fréquences de la parole.', SV.graph(40, 30, 280, 150, [{ pts: [[0, .9], [.5, .88], [.65, .84], [.75, .7], [.85, .45], [1, .2]], col: 'var(--bad)', draw: 1, lab: 'contrôle' }, { pts: [[0, .9], [.5, .9], [.65, .88], [.75, .85], [.85, .8], [1, .75]], col: 'var(--ok)', dash: 1, lab: 'référence', labAt: 4 }], { xt: [[0, '1k'], [.5, '8k'], [.75, '12k'], [1, '16k']], yl: 'audition' }))],
  quiz: [{ q: 'Une baisse de 10 dB sur deux fréquences voisines au suivi d’un traitement par cisplatine :', o: ['Remplit un critère ASHA de toxicité', 'Est toujours normale', 'Impose un appareillage immédiat', 'Signe une simulation'], e: 'À signaler à l’équipe médicale.' }]
});

TESTS.push({
  id: 'inconfort', cat: 'tonale', niv: 'base', nom: 'Seuils d’inconfort et champ dynamique',
  court: 'Jusqu’où peut-on monter le son sans gêne ?',
  but: 'Connaître la dynamique résiduelle pour régler le niveau de sortie maximal des aides auditives.',
  mat: 'Audiomètre, sons pulsés ou bruits à bande étroite, échelle de sonie.',
  etapes: ['Expliquer : « Dites-moi quand le son devient désagréable, pas douloureux. »', 'Monter par pas de 5 dB à partir d’un niveau confortable.', 'Variante catégorielle : le patient classe la sonie (très faible à trop fort, test de type Cox).', 'Champ dynamique = seuil d’inconfort − seuil liminaire.'],
  interp: [['Seuil d’inconfort ≈ 100 dB HL', 'Habituel'], ['Champ dynamique réduit', 'Recrutement : compression plus forte'], ['Seuil d’inconfort bas avec audition normale', 'Hyperacousie']],
  pieges: ['Ne jamais aller jusqu’à la douleur.', 'Résultats variables selon la consigne : la standardiser.'],
  retenir: 'Le niveau de sortie maximal se règle sous le seuil d’inconfort.',
  video: 'seuil d’inconfort audiométrie champ dynamique',
  anim: [sc('Le champ dynamique est l’espace entre le seuil liminaire et le seuil d’inconfort. Dans une perte cochléaire, il se rétrécit : c’est le recrutement.', SV.audio(70, 30, 230, 150, [{ side: 'R', pts: [[250, 30], [500, 35], [1000, 45], [2000, 60], [4000, 70]] }, { side: 'X', col: 'var(--bad)', dash: 1, pts: [[250, 100], [500, 100], [1000, 100], [2000, 95], [4000, 95]] }], { label: 'dynamique : 70 dB aux graves, 25 dB à 4 kHz' }))],
  quiz: [{ q: 'Champ dynamique :', o: ['Seuil d’inconfort − seuil liminaire', 'Seuil liminaire − 20 dB', 'Écart aérien-osseux', 'Différence entre les oreilles'], e: 'Il guide la compression et le niveau de sortie maximal.' }]
});

TESTS.push({
  id: 'acouphenometrie', cat: 'tonale', niv: 'avancé', nom: 'Acouphénométrie',
  court: 'Caractériser l’acouphène : hauteur, intensité, masquabilité.',
  but: 'Objectiver l’acouphène, suivre son évolution, orienter la thérapie sonore.',
  mat: 'Audiomètre (sons purs, bandes étroites, bruit blanc), questionnaires (THI, échelle visuelle).',
  etapes: [
    'Appariement de fréquence : choix forcé entre deux sons, en contrôlant les erreurs d’octave.',
    'Appariement d’intensité : niveau en dB au-dessus du seuil à cette fréquence (dB SL), souvent faible.',
    'Niveau minimal de masquage : bruit qui couvre juste l’acouphène.',
    'Inhibition résiduelle : après 60 s de bruit au niveau minimal + 10 dB, l’acouphène disparaît-il un moment ?',
    'Courbes de masquage de Feldmann : comparer seuil et niveau de masquage par fréquence.'
  ],
  interp: [['Intensité faible en dB SL mais gêne forte', 'Classique : la gêne dépend du vécu, pas du niveau'], ['Inhibition résiduelle présente', 'Argument pour une thérapie sonore']],
  pieges: ['Confusions d’octave fréquentes.', 'Un acouphène pulsatile ou unilatéral impose un avis médical.'],
  retenir: 'L’intensité mesurée est souvent de quelques dB SL : c’est la gêne qu’on traite.',
  video: 'acouphénométrie mesure acouphène',
  anim: [sc('On cherche la fréquence qui ressemble le plus à l’acouphène, puis son intensité, puis le bruit qui le masque.', SV.graph(40, 40, 280, 140, [{ pts: [[0, .2], [.3, .25], [.6, .4], [.8, .6], [1, .7]], col: 'var(--right)', lab: 'seuil' }, { pts: [[.78, .68], [.82, .68]], col: 'var(--brass)', w: 6, lab: 'acouphène 6 kHz, +5 dB SL', labAt: 0 }], { xl: 'fréquence', yl: 'perte' }))],
  quiz: [{ q: 'Un acouphène pulsatile impose :', o: ['Un avis médical', 'Un générateur de bruit immédiat', 'Rien de particulier', 'Une audiométrie haute fréquence seule'], e: 'Il peut révéler une cause vasculaire.' }]
});

TESTS.push({
  id: 'champlibre', cat: 'tonale', niv: 'base', nom: 'Audiométrie tonale en champ libre',
  court: 'Seuils mesurés avec un haut-parleur, avec et sans aides auditives.',
  but: 'Mesurer le gain prothétique tonal, tester un enfant qui refuse le casque.',
  mat: 'Haut-parleur à 1 m, à 0° (face) ou 45°, sons wobulés ou bruits à bande étroite.',
  etapes: ['Placer le patient à 1 m du haut-parleur, tête immobile.', 'Utiliser des sons wobulés ou des bandes étroites, jamais des sons purs (ondes stationnaires).', 'Mesurer sans puis avec appareils.', 'Gain prothétique tonal = seuil sans − seuil avec.'],
  interp: [['Seuils en champ libre', 'Reflètent la meilleure oreille, sauf masquage'], ['Gain prothétique', 'Contrôle simple, moins précis que la mesure in vivo']],
  pieges: ['Bruit de fond de la pièce : il limite les seuils mesurables.', 'Un mouvement de tête change le niveau reçu.'],
  retenir: 'En champ libre, c’est la meilleure oreille qui répond.',
  video: 'audiométrie champ libre gain prothétique',
  anim: [sc('Le patient est à un mètre du haut-parleur. Les sons wobulés évitent les ondes stationnaires de la pièce.', SV.speaker(60, 118), SV.flow('M74 118H122', 'var(--brass)'), SV.head({ hit: { R: 1, L: 1 } }), SV.arrow(60, 190, 180, 190, 'var(--muted)'), SV.t(120, 205, '1 m', 'sv-s'))],
  quiz: [{ q: 'Pourquoi éviter les sons purs en champ libre ?', o: ['Ondes stationnaires dans la pièce', 'Ils sont trop graves', 'Ils provoquent un larsen', 'Ils sont interdits par la loi'], e: 'Le niveau varie fortement d’un point à l’autre.' }]
});

TESTS.push({
  id: 'ten', cat: 'tonale', niv: 'avancé', nom: 'TEN test (zones mortes cochléaires)',
  court: 'Rechercher une région de la cochlée sans cellules ciliées internes fonctionnelles.',
  but: 'Décider s’il est utile d’amplifier une fréquence, ou s’il vaut mieux l’abaisser (transposition).',
  mat: 'Bruit TEN (bruit à seuil égal), version HL intégrée à certains audiomètres.',
  etapes: ['Mesurer le seuil absolu.', 'Envoyer le bruit TEN dans la même oreille, au moins 10 dB au-dessus du seuil.', 'Mesurer le seuil masqué dans ce bruit.'],
  interp: [['Seuil masqué ≈ niveau du bruit', 'Pas de zone morte'], ['Seuil masqué ≥ 10 dB au-dessus du bruit ET ≥ 10 dB au-dessus du seuil absolu', 'Zone morte probable à cette fréquence']],
  pieges: ['Difficile au-delà de 90 dB HL (niveaux de bruit élevés).', 'Utile surtout dans les pentes raides.'],
  retenir: 'Zone morte : le son est entendu « à côté », par des régions voisines. L’amplifier apporte peu.',
  video: 'TEN test zone morte cochléaire',
  anim: [sc('Dans une zone morte, un son à 4 kilohertz est capté par les régions voisines encore saines. Le bruit TEN couvre ces régions : le seuil masqué grimpe bien au-dessus du bruit.', SV.ear(40, 110, { hc: 1, ac: 1 }), SV.tag(180, 190, 'seuil masqué ≫ niveau du bruit : zone morte', 'var(--bad)'))],
  quiz: [{ q: 'Critère de zone morte au TEN test :', o: ['Seuil masqué ≥ 10 dB au-dessus du bruit et du seuil absolu', 'Seuil masqué égal au bruit', 'Seuil absolu > 40 dB', 'Réflexe absent'], e: 'Critère de Moore.' }]
});

/* ================= SUPRALIMINAIRE ================= */
TESTS.push({
  id: 'fowler', cat: 'supra', niv: 'base', nom: 'Test de Fowler (balance binaurale, ABLB)',
  court: 'Égaliser la sonie entre une oreille saine et une oreille atteinte à plusieurs niveaux.',
  but: 'Mettre en évidence le recrutement, signe d’atteinte cochléaire.',
  mat: 'Audiomètre deux canaux. Condition : une oreille normale (ou nettement meilleure), écart d’au moins 20 dB à la fréquence testée.',
  etapes: ['Choisir une fréquence où les oreilles diffèrent de 20 dB ou plus.', 'Présenter alternativement un son de référence dans l’oreille saine (par exemple 20, 40, 60, 80 dB HL).', 'Ajuster le niveau dans l’oreille atteinte jusqu’à ce que le patient juge les deux sons aussi forts.', 'Reporter les paires sur le diagramme en échelle (laddergram).'],
  interp: [['Lignes parallèles', 'Pas de recrutement : transmission'], ['Lignes qui se rejoignent à fort niveau', 'Recrutement complet : cochléaire'], ['Rapprochement partiel', 'Recrutement partiel'], ['Lignes qui se croisent', 'Hyper-recrutement (Ménière)'], ['Lignes qui s’écartent', 'Décrutement : rétrocochléaire']],
  pieges: ['Impossible si les deux oreilles sont atteintes de façon symétrique (variante monaurale de Reger : comparer deux fréquences de la même oreille).'],
  retenir: 'Les sons forts sont perçus aussi forts par l’oreille malade cochléaire : c’est le recrutement.',
  sim: 'topo', video: 'test de Fowler recrutement ABLB',
  anim: [
    sc('Oreille gauche normale, seuil 10 décibels. Oreille droite atteinte, seuil 50 décibels.', SV.head({ casque: 1, hit: { L: 1 } }), SV.tag(110, 30, 'OD seuil 50', SVR), SV.tag(250, 30, 'OG seuil 10', SVL)),
    sc('À chaque niveau dans l’oreille saine, on cherche le niveau droit perçu aussi fort. On relie les paires.', SV.graph(80, 30, 200, 150, [{ pts: [[0, .08], [1, .4]], col: 'var(--muted)', w: 1 }, { pts: [[0, .25], [1, .52]], col: 'var(--muted)', w: 1 }, { pts: [[0, .42], [1, .63]], col: 'var(--muted)', w: 1 }, { pts: [[0, .58], [1, .75]], col: 'var(--muted)', w: 1 }], { xt: [[0, 'OG'], [1, 'OD']], yl: 'dB HL' })),
    sc('Recrutement : les lignes se rejoignent aux niveaux forts. Quatre-vingts décibels à gauche équivalent à quatre-vingts à droite malgré la perte. C’est cochléaire.', SV.graph(80, 30, 200, 150, [{ pts: [[0, .1], [1, .4]], col: 'var(--ok)' }, { pts: [[0, .3], [1, .5]], col: 'var(--ok)' }, { pts: [[0, .5], [1, .6]], col: 'var(--ok)' }, { pts: [[0, .7], [1, .7]], col: 'var(--ok)', w: 3, lab: 'égalité' }], { xt: [[0, 'OG'], [1, 'OD']], yl: 'dB HL' })),
    sc('Lignes parallèles : pas de recrutement, typique d’une transmission. Lignes qui s’écartent : décrutement, suspect de rétrocochléaire.', SV.graph(40, 40, 120, 120, [{ pts: [[0, .1], [1, .4]], col: 'var(--muted)' }, { pts: [[0, .35], [1, .65]], col: 'var(--muted)' }, { pts: [[0, .6], [1, .9]], col: 'var(--muted)' }], { xt: [[0, 'OG'], [1, 'OD']] }), SV.t(100, 180, 'parallèles : transmission', 'sv-s'), SV.graph(210, 40, 120, 120, [{ pts: [[0, .1], [1, .4]], col: 'var(--bad)' }, { pts: [[0, .3], [1, .7]], col: 'var(--bad)' }, { pts: [[0, .5], [1, .98]], col: 'var(--bad)' }], { xt: [[0, 'OG'], [1, 'OD']] }), SV.t(270, 180, 'divergentes : décrutement', 'sv-s'))
  ],
  quiz: [{ q: 'Laddergram : lignes convergentes aux forts niveaux :', o: ['Recrutement, atteinte cochléaire', 'Transmission', 'Rétrocochléaire', 'Simulation'], e: 'Recrutement complet.' }]
});

TESTS.push({
  id: 'sisi', cat: 'supra', niv: 'base', nom: 'SISI (indice de sensibilité aux petits incréments)',
  court: 'Le patient perçoit-il des augmentations de 1 dB d’un son continu ?',
  but: 'Rechercher un recrutement cochléaire.',
  mat: 'Audiomètre avec fonction SISI.',
  etapes: ['Son continu à 20 dB au-dessus du seuil (20 dB SL), souvent à 1000 et 4000 Hz.', 'Entraînement avec des incréments de 5 dB.', '20 incréments de 1 dB, toutes les 5 secondes environ.', 'Score = pourcentage d’incréments perçus.'],
  interp: [['70 à 100 %', 'Atteinte cochléaire'], ['0 à 30 %', 'Normal, transmission ou rétrocochléaire'], ['Entre les deux', 'Douteux']],
  pieges: ['Variante à fort niveau (≈ 75 dB HL) : là, un normal perçoit aussi les incréments ; un score bas évoque le rétrocochléaire.'],
  retenir: 'SISI élevé = cochléaire.',
  sim: 'topo', video: 'test SISI audiométrie recrutement',
  anim: [sc('Un son continu à 20 décibels au-dessus du seuil, avec de petits sursauts de un décibel. Une cochlée qui recrute les détecte presque tous.', SV.graph(30, 50, 300, 110, [{ pts: Array.from({ length: 41 }, (_, k) => [k / 40, k % 4 === 2 ? .62 : .5]), col: 'var(--brass)', w: 2, draw: 1 }], { xl: 'temps', yl: 'niveau' }), SV.tag(180, 195, 'cochléaire : ≥ 70 % des incréments perçus', 'var(--ok)'))],
  quiz: [{ q: 'SISI à 85 % :', o: ['Atteinte cochléaire', 'Transmission', 'Rétrocochléaire', 'Normal'], e: '≥ 70 % : cochléaire.' }]
});

TESTS.push({
  id: 'decay', cat: 'supra', niv: 'base', nom: 'Tone decay (Carhart, Rosenberg)',
  court: 'Le patient entend-il un son continu pendant 60 secondes ?',
  but: 'Rechercher une fatigue auditive anormale, signe d’atteinte rétrocochléaire.',
  mat: 'Audiomètre, chronomètre.',
  etapes: ['Carhart : son continu au seuil.', 'Dès que le patient ne l’entend plus, monter de 5 dB sans interrompre le son et relancer le chronomètre.', 'Fin quand le son est entendu 60 s, ou après 30 dB de montée.', 'Rosenberg (modifié) : durée totale limitée à 60 s, on note la montée totale.', 'Olsen-Noffsinger : départ à 20 dB SL pour gagner du temps.'],
  interp: [['0 à 5 dB', 'Normal ou transmission'], ['10 à 25 dB', 'Cochléaire'], ['30 dB ou plus', 'Rétrocochléaire']],
  pieges: ['Ne jamais couper le son entre deux paliers.', 'Fatigant pour le patient : limiter à 1 ou 2 fréquences.'],
  retenir: 'Decay ≥ 30 dB : penser au nerf auditif.',
  sim: 'topo', video: 'tone decay test Carhart',
  anim: [sc('Le son continu s’éteint pour le patient : on monte de cinq décibels sans couper. Une oreille rétrocochléaire « lâche » à répétition.', SV.graph(40, 30, 280, 150, [{ pts: [[0, .2], [.15, .2], [.15, .3], [.28, .3], [.28, .4], [.4, .4], [.4, .5], [.5, .5], [.5, .6], [.6, .6], [.6, .7], [1, .7]], col: 'var(--bad)', draw: 1, lab: '+30 dB : rétro', labAt: 10 }, { pts: [[0, .2], [.3, .2], [.3, .3], [1, .3]], col: 'var(--ok)', dash: 1, lab: 'cochléaire' }], { xl: 'temps (60 s)', yl: 'niveau' }))],
  quiz: [{ q: 'Tone decay de 35 dB :', o: ['Rétrocochléaire', 'Normal', 'Transmission', 'Cochléaire typique'], e: '≥ 30 dB.' }]
});

TESTS.push({
  id: 'luscher', cat: 'supra', niv: 'avancé', nom: 'Seuil différentiel d’intensité (Lüscher-Zwislocki)',
  court: 'La plus petite variation d’intensité perçue sur un son modulé.',
  but: 'Rechercher un recrutement (test historique).',
  mat: 'Son modulé en amplitude, à niveau fixe au-dessus du seuil.',
  etapes: ['Présenter un son modulé en amplitude à niveau fixe (par exemple 40 dB SL).', 'Réduire la profondeur de modulation jusqu’à ce que le patient ne perçoive plus la variation.'],
  interp: [['Seuil différentiel anormalement petit', 'Recrutement : cochléaire'], ['Seuil normal ou grand', 'Normal, transmission ou rétrocochléaire']],
  pieges: ['Grande variabilité : remplacé en pratique par le SISI et les réflexes.'],
  retenir: 'Même idée que le SISI : la cochlée qui recrute perçoit de très petites variations.',
  video: 'test de Lüscher seuil différentiel intensité',
  anim: [sc('Un son dont l’intensité ondule légèrement. On réduit l’ondulation jusqu’à ce qu’elle ne soit plus perçue.', SV.graph(30, 60, 300, 100, [{ pts: Array.from({ length: 80 }, (_, k) => [k / 79, .5 + Math.sin(k / 3) * .15 * (1 - k / 90)]), col: 'var(--brass)', draw: 1 }], { xl: 'temps' }))],
  quiz: [{ q: 'Un seuil différentiel d’intensité très petit évoque :', o: ['Un recrutement', 'Une transmission', 'Une simulation', 'Un bouchon'], e: 'Même principe que le SISI.' }]
});

TESTS.push({
  id: 'langenbeck', cat: 'supra', niv: 'avancé', nom: 'Audiométrie tonale dans le bruit (Langenbeck)',
  court: 'Mesurer les seuils en présence d’un bruit dans la même oreille.',
  but: 'Différencier atteinte cochléaire et rétrocochléaire (méthode historique).',
  mat: 'Bruit large bande ipsilatéral à niveau fixe.',
  etapes: ['Mesurer le seuil absolu.', 'Mesurer le seuil en présence du bruit à niveau fixe.', 'Comparer à la courbe de masquage normale.'],
  interp: [['Seuils masqués qui rejoignent la courbe de masquage normale', 'Atteinte cochléaire'], ['Seuils masqués qui restent au-dessus, avec un écart', 'Atteinte rétrocochléaire']],
  pieges: ['Peu utilisé aujourd’hui, mais fréquent dans les questions d’examen.'],
  retenir: 'Cochléaire : le seuil rejoint la ligne du bruit. Rétro : il reste à distance.',
  video: 'audiométrie dans le bruit Langenbeck',
  anim: [sc('Dans le bruit, la cochlée atteinte rejoint la courbe de masquage normale. Le nerf atteint garde un écart.', SV.graph(40, 30, 280, 150, [{ pts: [[0, .45], [1, .45]], col: 'var(--muted)', dash: 1, lab: 'masquage normal' }, { pts: [[0, .45], [.5, .46], [1, .48]], col: 'var(--ok)', lab: 'cochléaire', labAt: 1 }, { pts: [[0, .55], [.5, .62], [1, .7]], col: 'var(--bad)', lab: 'rétro' }], { xl: 'fréquence', yl: 'seuil' }))],
  quiz: [{ q: 'Au Langenbeck, des seuils masqués qui restent nettement au-dessus de la courbe de masquage normale évoquent :', o: ['Une atteinte rétrocochléaire', 'Une atteinte cochléaire', 'Une transmission', 'Une audition normale'], e: 'Écart persistant.' }]
});

TESTS.push({
  id: 'topo', cat: 'supra', niv: 'base', nom: 'Synthèse topodiagnostique',
  court: 'Cochléaire ou rétrocochléaire : croiser tous les arguments.',
  but: 'Décider s’il faut adresser à l’ORL pour imagerie avant d’appareiller.',
  mat: 'Tonale, vocale, réflexes, tests supraliminaires, PEA.',
  etapes: ['Rassembler les arguments de chaque test.', 'Un seul argument rétrocochléaire, surtout une asymétrie, justifie un avis ORL : l’IRM est l’examen de référence.'],
  interp: [
    ['Recrutement (Fowler, Metz < 60 dB, SISI ≥ 70 %)', 'Cochléaire'],
    ['Tone decay ≥ 30 dB, decay du réflexe, Békésy III ou IV', 'Rétrocochléaire'],
    ['Intelligibilité effondrée, roll-over marqué', 'Rétrocochléaire'],
    ['PEA : I–V allongé, différence interaurale de l’onde V > 0,2 à 0,3 ms', 'Rétrocochléaire'],
    ['OEA présentes, PEA absents', 'Neuropathie auditive']
  ],
  pieges: ['Aucun test n’est parfait : un faisceau d’arguments compte plus qu’un résultat isolé.', 'Asymétrie inexpliquée = avis ORL, même si tous les tests sont « cochléaires ».'],
  retenir: 'Recrutement = cochlée. Fatigue anormale et intelligibilité effondrée = nerf.',
  sim: 'topo', video: 'diagnostic topographique surdité cochléaire rétrocochléaire',
  anim: [sc('Chaque test ajoute un argument. On conclut sur l’ensemble, et toute asymétrie inexpliquée part chez l’ORL.', SV.table(20, 40, ['Test', 'Cochléaire', 'Rétrocochléaire'], [['Recrutement', 'présent', 'absent'], ['SISI', '≥ 70 %', '≤ 30 %'], ['Tone decay', '≤ 25 dB', '≥ 30 dB'], ['Réflexe', 'Metz < 60', 'absent / decay'], ['Vocale', 'cohérente', 'effondrée'], ['PEA', 'normaux', 'I–V allongé']], { cw: [90, 110, 120] }))],
  quiz: [{ q: 'Asymétrie de 25 dB inexpliquée, tests supraliminaires cochléaires :', o: ['Avis ORL quand même', 'Appareiller sans bilan', 'Conclure à une presbyacousie', 'Refaire dans deux ans'], e: 'L’asymétrie suffit à justifier l’imagerie.' }]
});
