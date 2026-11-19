/* ============ ATLAS DES TESTS (2/2) : vocale, objectifs, non organique, enfant, dépistage ============ */
const VCURVE = (s, mx = 1, k = .09) => Array.from({ length: 41 }, (_, i) => { const x = i / 40; return [x, mx / (1 + Math.exp(-(x - s) / k))]; });

/* ================= VOCALE ================= */
TESTS.push({
  id: 'voc_courbe', cat: 'vocale', niv: 'base', nom: 'Courbe d’intelligibilité',
  court: 'Pourcentage de mots compris en fonction du niveau de présentation.',
  but: 'Mesurer ce que le patient comprend, et pas seulement ce qu’il détecte.',
  mat: 'Audiomètre avec entrée vocale, listes enregistrées, casque.',
  etapes: ['Commencer à un niveau confortable, environ 30 dB au-dessus de la moyenne tonale.', 'Descendre par paliers de 10 dB pour encadrer le seuil d’intelligibilité, remonter pour chercher le maximum.', 'Une liste différente à chaque palier.', 'Reporter les scores et tracer la courbe.'],
  interp: [
    ['Seuil de détection de la parole (SDP)', 'Niveau où la voix est perçue sans être comprise, environ 10 dB sous le seuil d’intelligibilité'],
    ['Seuil d’intelligibilité (SRT, 50 %)', 'Doit être proche de la moyenne tonale 500–1000–2000 Hz (± 10 dB)'],
    ['Maximum d’intelligibilité', '100 % en transmission ; souvent moins en perception'],
    ['Roll-over (la courbe redescend aux forts niveaux)', 'Suspect de rétrocochléaire si marqué (indice ≈ 0,45 avec les listes PB)'],
    ['Courbe en cloche ou plateau bas', 'Distorsion cochléaire importante, pronostic prothétique plus réservé']
  ],
  pieges: ['Seuil d’intelligibilité bien meilleur que la tonale : simulation ou erreur de consigne.', 'Toujours vérifier la cohérence entre tonale et vocale.'],
  retenir: 'Transmission : courbe normale décalée. Perception : pente plus douce, plafond bas. Rétro : plafond effondré, roll-over.',
  sim: 'cab', video: 'audiométrie vocale courbe d’intelligibilité interprétation',
  anim: [
    sc('La courbe normale monte vite : de zéro à cent pour cent de mots compris en une trentaine de décibels.', SV.graph(50, 30, 270, 150, [{ pts: VCURVE(.2), col: 'var(--ok)', draw: 1, lab: 'normale' }], { xl: 'niveau (dB)', yl: '% compris', yt: [[.5, '50'], [1, '100']], grid: 1 })),
    sc('Transmission : même forme, simplement décalée vers la droite. Avec assez de niveau, le patient comprend tout.', SV.graph(50, 30, 270, 150, [{ pts: VCURVE(.2), col: 'var(--muted)', dash: 1 }, { pts: VCURVE(.45), col: 'var(--right)', draw: 1, lab: 'transmission' }], { xl: 'niveau (dB)', yl: '% compris', yt: [[.5, '50'], [1, '100']], grid: 1 })),
    sc('Perception cochléaire : pente plus douce, et le maximum n’atteint pas cent pour cent à cause des distorsions.', SV.graph(50, 30, 270, 150, [{ pts: VCURVE(.2), col: 'var(--muted)', dash: 1 }, { pts: VCURVE(.5, .8, .12), col: 'var(--right)', draw: 1, lab: 'perception' }], { xl: 'niveau (dB)', yl: '% compris', yt: [[.5, '50'], [1, '100']], grid: 1 })),
    sc('Rétrocochléaire : plafond très bas, et la courbe redescend aux forts niveaux. C’est le roll-over.', SV.graph(50, 30, 270, 150, [{ pts: VCURVE(.2), col: 'var(--muted)', dash: 1 }, { pts: Array.from({ length: 41 }, (_, i) => { const x = i / 40; return [x, .5 / (1 + Math.exp(-(x - .4) / .08)) * (x > .65 ? 1 - (x - .65) * 1.6 : 1)]; }), col: 'var(--bad)', draw: 1, lab: 'roll-over', labAt: 30 }], { xl: 'niveau (dB)', yl: '% compris', yt: [[.5, '50'], [1, '100']], grid: 1 }))
  ],
  quiz: [
    { q: 'Seuil d’intelligibilité 15 dB, moyenne tonale 55 dB :', o: ['Incohérence : simulation ou erreur', 'Normal', 'Transmission', 'Perception'], e: 'Le SRT doit être proche de la moyenne tonale.' },
    { q: 'Courbe décalée mais atteignant 100 % :', o: ['Transmission', 'Rétrocochléaire', 'Cochléaire sévère', 'Simulation'], e: 'Forme normale, simplement décalée.' }
  ]
});

TESTS.push({
  id: 'voc_listes', cat: 'vocale', niv: 'base', nom: 'Listes françaises et cotation',
  court: 'Fournier, Lafon, Dodelé, phrases : quel matériel pour quelle question ?',
  but: 'Choisir le bon matériel et coter correctement.',
  mat: 'Enregistrements calibrés (CD ou fichiers de l’audiomètre).',
  etapes: [
    'Fournier : listes de 10 mots dissyllabiques, cotées en mots (chaque mot vaut 10 %). Redondance élevée, simples, utiles chez l’enfant et l’adulte jeune.',
    'Lafon (listes cochléaires) : 17 mots monosyllabiques de 3 phonèmes, soit 51 phonèmes, cotés en phonèmes. Peu de redondance : plus sensibles aux distorsions cochléaires.',
    'Logatomes de Dodelé : syllabes sans signification, sans aide du sens. Utilisés en audioprothèse pour juger la perception des phonèmes.',
    'Phrases : plus écologiques, servent surtout dans le bruit (voir Vocale dans le bruit).'
  ],
  interp: [['Cotation en phonèmes', 'Plus fine : un mot à moitié compris rapporte des points'], ['Mots dissyllabiques', 'Plus faciles : scores meilleurs pour une même audition'], ['Logatomes', 'Pas de suppléance mentale : reflet direct de l’audition']],
  pieges: ['Ne pas réutiliser la même liste dans la séance (effet d’apprentissage).', 'Voix en direct : niveau incontrôlable, à réserver aux cas particuliers.'],
  retenir: 'Plus le matériel est redondant, plus le score est élevé : comparer ce qui est comparable.',
  sim: 'cab', video: 'listes de Lafon Fournier audiométrie vocale',
  anim: [
    sc('Liste de Fournier : dix mots de deux syllabes. Chaque mot compris vaut dix pour cent.', SV.box(40, 50, 120, 120, 'bateau\nmaison\njardin\nsoleil\n…'), SV.tag(100, 190, 'cotation en mots', 'var(--brass)'), SV.box(200, 50, 120, 120, 'bac\nmur\nlune\npomme\n…'), SV.tag(260, 190, 'Lafon : en phonèmes', 'var(--brass)')),
    sc('Liste de Lafon : on compte les phonèmes. « Lune » répété « lume » rapporte deux phonèmes sur trois.', SV.box(90, 70, 180, 50, 'l  y  n   →   l  y  m'), SV.check(120, 140), SV.check(170, 140), SV.cross(222, 140, 6), SV.tag(180, 180, '2 / 3 phonèmes', 'var(--ok)'))
  ],
  quiz: [
    { q: 'Une liste de Lafon contient :', o: ['17 mots de 3 phonèmes (51 phonèmes)', '10 mots dissyllabiques', '20 phrases', '6 sons'], e: 'Cotation en phonèmes.' },
    { q: 'Avantage des logatomes :', o: ['Pas de suppléance par le sens', 'Plus faciles', 'Plus rapides', 'Adaptés au nourrisson'], e: 'Ils mesurent la perception pure des phonèmes.' }
  ]
});

TESTS.push({
  id: 'voc_masque', cat: 'vocale', niv: 'avancé', nom: 'Vocale au casque, en CO, et masquage',
  court: 'La parole aussi traverse le crâne : il faut parfois masquer.',
  but: 'Obtenir l’intelligibilité propre à chaque oreille.',
  mat: 'Bruit vocal (bruit au spectre de la parole) dans l’oreille opposée.',
  etapes: ['Atténuation interaurale pour la parole : environ 40 à 45 dB au casque supra-aural.', 'Masquer si le niveau de présentation − 40 dB ≥ meilleure CO de l’oreille non testée.', 'Règle pratique : bruit vocal ≈ niveau de présentation − 20 dB, en surveillant le surmasquage.', 'Vocale en CO (vibrateur) : explore la réserve cochléaire à travers la parole.'],
  interp: [['Score qui chute quand on masque', 'L’autre oreille aidait'], ['Score stable', 'Score propre à l’oreille testée']],
  pieges: ['Cophose unilatérale non masquée : intelligibilité faussement présente à fort niveau.'],
  retenir: 'Dès qu’une oreille est nettement moins bonne, la vocale se masque comme la tonale.',
  sim: 'cab', video: 'masquage audiométrie vocale',
  anim: [sc('La parole envoyée fort à l’oreille droite traverse le crâne. Le bruit vocal occupe l’oreille gauche pour qu’elle ne réponde pas.', SV.head({ casque: 1, dead: { R: 1 } }), SV.flow('M118 100Q180 60 211 118', 'var(--right)'), SV.waves(232, 118, 0, SVL), SV.bubble(120, 40, '« bateau »', 'right'))],
  quiz: [{ q: 'Règle pratique du bruit vocal controlatéral :', o: ['Niveau de présentation − 20 dB', 'Niveau de présentation + 20 dB', 'Toujours 40 dB', 'Seuil tonal + 5 dB'], e: 'À ajuster selon le risque de surmasquage.' }]
});

TESTS.push({
  id: 'voc_champ', cat: 'vocale', niv: 'base', nom: 'Vocale en champ libre et gain prothétique',
  court: 'Comparer la compréhension sans et avec les aides auditives.',
  but: 'Démontrer le bénéfice de l’appareillage, contrôle d’efficacité.',
  mat: 'Haut-parleur à 1 m, 0°, pièce traitée, sonomètre pour vérifier les niveaux.',
  etapes: ['Mesurer sans appareils à voix moyenne (≈ 65 dB) et faible (≈ 50 dB).', 'Mesurer avec appareils dans les mêmes conditions.', 'Optionnel : avec et sans lecture labiale, au calme puis dans le bruit.', 'Gain prothétique vocal = différence de seuil d’intelligibilité (ou de score à niveau fixe).'],
  interp: [['Score à 65 dB avec appareils proche du maximum au casque', 'Réglage efficace'], ['Écart important', 'Revoir le réglage (mesure in vivo) ou la limite cochléaire']],
  pieges: ['Bruit de fond de la pièce.', 'Patient qui tourne la tête.'],
  retenir: 'Le maximum au casque fixe le plafond à atteindre avec appareils.',
  sim: 'cab', video: 'gain prothétique vocal champ libre audioprothésiste',
  anim: [sc('Sans puis avec appareils : la courbe se déplace vers la gauche. L’écart horizontal est le gain prothétique.', SV.graph(50, 30, 270, 150, [{ pts: VCURVE(.6, .85, .1), col: 'var(--muted)', dash: 1, lab: 'sans' }, { pts: VCURVE(.33, .9, .1), col: 'var(--ok)', draw: 1, lab: 'avec' }], { xl: 'niveau (dB)', yl: '% compris', grid: 1 }), SV.arrow(212, 105, 140, 105, 'var(--brass)'), SV.t(176, 98, 'gain', 'sv-s'))],
  quiz: [{ q: 'Le score maximal au casque sert à :', o: ['Fixer le plafond attendu avec appareils', 'Régler le MPO', 'Mesurer le RECD', 'Rien en prothèse'], e: 'On ne fera pas mieux que la cochlée.' }]
});

TESTS.push({
  id: 'voc_bruit', cat: 'vocale', niv: 'base', nom: 'Vocale dans le bruit',
  court: 'Le rapport signal sur bruit qui permet de comprendre une phrase sur deux.',
  but: 'Mesurer la gêne principale des patients : comprendre en milieu bruyant.',
  mat: 'Tests de phrases dans le bruit : HINT (version française), FrMatrix (test matriciel), VRB (vocale rapide dans le bruit), test des triplets de chiffres.',
  etapes: [
    'Parole à niveau fixe (souvent 65 dB), bruit variable, ou l’inverse.',
    'Procédure adaptative : bonne réponse → on augmente le bruit ; erreur → on le baisse.',
    'Le seuil (SRT) est le rapport signal/bruit donnant 50 % de compréhension.',
    'Bruits possibles : stationnaire au spectre de la parole, cocktail party, bruit fluctuant.'
  ],
  interp: [
    ['SRT négatif (par exemple −6 dB au test matriciel)', 'Normo-entendant : comprend même quand le bruit est plus fort que la voix'],
    ['SRT de 0 dB ou positif', 'Perte de rapport signal/bruit : gêne réelle au restaurant'],
    ['Chaque dB de RSB perdu', 'Correspond à une baisse sensible de compréhension sur la pente des phrases']
  ],
  pieges: ['Deux personnes au même audiogramme peuvent avoir des SRT très différents.', 'Le bruit stationnaire sous-estime la gêne des bruits fluctuants (et inversement selon les profils).'],
  retenir: 'L’audiogramme dit ce que le patient entend ; le test dans le bruit dit ce qu’il comprend au quotidien.',
  sim: 'bruit', video: 'test vocal dans le bruit matrix HINT',
  anim: [
    sc('La phrase est envoyée à niveau fixe. Le bruit monte quand le patient répète correctement et descend quand il se trompe.', SV.speaker(70, 118), SV.waves(84, 118, 0, 'var(--brass)'), SV.head({ hit: { R: 1, L: 1 } }), SV.speaker(290, 118, 180), SV.waves(276, 118, Math.PI, 'var(--muted)')),
    sc('La procédure converge vers le rapport signal sur bruit qui donne cinquante pour cent de compréhension.', SV.graph(40, 30, 280, 150, [{ pts: [[0, .7], [.1, .6], [.2, .5], [.3, .4], [.4, .5], [.5, .4], [.6, .32], [.7, .4], [.8, .35], [.9, .4], [1, .36]], col: 'var(--brass)', draw: 1 }, { pts: [[.5, .38], [1, .38]], col: 'var(--ok)', dash: 1, lab: 'SRT' }], { xl: 'phrases', yl: 'RSB (dB)', grid: 1 })),
    sc('Un normo-entendant comprend encore à moins six décibels. Un patient malentendant a souvent besoin de zéro ou plus.', SV.graph(40, 30, 280, 150, [{ pts: VCURVE(.3, 1, .05), col: 'var(--ok)', lab: 'normal' }, { pts: VCURVE(.55, 1, .06), col: 'var(--right)', lab: 'patient', labAt: 28 }], { xl: 'RSB', yl: '%', xt: [[.3, '−6'], [.55, '0']], grid: 1 }))
  ],
  quiz: [
    { q: 'SRT dans le bruit à −6 dB RSB :', o: ['Proche de la norme', 'Perte sévère', 'Simulation', 'Impossible'], e: 'Le normo-entendant comprend même quand le bruit domine.' },
    { q: 'Dans une procédure adaptative, une bonne réponse entraîne :', o: ['Un RSB plus difficile', 'La fin du test', 'Un RSB plus facile', 'Un changement de liste'], e: 'On rend la tâche plus difficile.' }
  ]
});

TESTS.push({
  id: 'central', cat: 'vocale', niv: 'avancé', nom: 'Tests centraux (traitement auditif)',
  court: 'Écoute dichotique, parole dégradée, résolution temporelle.',
  but: 'Explorer un trouble du traitement auditif quand l’audiogramme est normal mais la plainte réelle.',
  mat: 'Tests dichotiques (chiffres), phrases filtrées ou compressées, détection de silence (gap), PEA tardifs.',
  etapes: ['Écoute dichotique : deux messages différents en même temps, un dans chaque oreille.', 'Parole filtrée : redondance réduite.', 'Détection de gap : le plus petit silence perçu dans un bruit.'],
  interp: [['Avantage d’oreille droite exagéré', 'Évoque un trouble de transfert interhémisphérique'], ['Seuil de gap allongé', 'Trouble de résolution temporelle']],
  pieges: ['Attention, langage et fatigue influencent beaucoup les résultats : bilan pluridisciplinaire.'],
  retenir: 'Audiogramme normal ne veut pas dire audition normale.',
  video: 'tests auditifs centraux écoute dichotique',
  anim: [sc('Écoute dichotique : « sept » à droite et « deux » à gauche en même temps. Le patient doit répéter les deux.', SV.head({ casque: 1, hit: { R: 1, L: 1 } }), SV.bubble(110, 40, '« sept »', 'left', SVR), SV.bubble(250, 40, '« deux »', 'right', SVL))],
  quiz: [{ q: 'Un trouble du traitement auditif se rencontre avec :', o: ['Un audiogramme qui peut être normal', 'Toujours une perte de transmission', 'Toujours une cophose', 'Un tympanogramme B'], e: 'C’est le traitement central qui est en cause.' }]
});

/* ================= OBJECTIFS ================= */
TESTS.push({
  id: 'tympano', cat: 'objectif', niv: 'base', nom: 'Tympanométrie',
  court: 'Mobilité du tympan en fonction de la pression dans le conduit.',
  but: 'Explorer l’oreille moyenne en quelques secondes, sans réponse du patient.',
  mat: 'Impédancemètre, sonde étanche. 226 Hz chez l’adulte et l’enfant, 1000 Hz avant 6 mois.',
  etapes: ['Otoscopie.', 'Embout adapté, étanchéité.', 'Balayage de +200 à −400 daPa.', 'Lire la pression du pic, la compliance, le volume du conduit.'],
  interp: [
    ['A : pic entre −100 et +50 daPa, compliance normale', 'Oreille moyenne normale'],
    ['As : compliance faible', 'Rigidité : otospongiose, tympanosclérose'],
    ['Ad : compliance très élevée', 'Disjonction ossiculaire, tympan flaccide'],
    ['B, volume normal', 'Épanchement (otite séromuqueuse)'],
    ['B, volume élevé (> 2 ml adulte)', 'Perforation ou aérateur perméable'],
    ['B, volume faible', 'Bouchon ou sonde contre la paroi'],
    ['C : pic au-delà de −100 daPa', 'Dysfonction tubaire']
  ],
  pieges: ['Une otospongiose peut donner un type A : le tympanogramme ne suffit pas.', 'Nourrisson : le 226 Hz est trompeur, utiliser 1000 Hz.', 'Variante multifréquence : fréquence de résonance augmentée par la rigidité, abaissée par la masse ou la discontinuité.'],
  retenir: 'Toujours lire le volume avec un type B.',
  video: 'tympanométrie interprétation type A B C',
  anim: [
    sc('La sonde ferme le conduit, fait varier la pression et mesure l’énergie renvoyée par le tympan.', SV.ear(40, 110, { probe: 1, tympVib: 1 })),
    sc('Type A : le tympan est le plus mobile quand la pression est égale des deux côtés. Pic près de zéro.', SV.graph(50, 30, 260, 150, [{ pts: Array.from({ length: 61 }, (_, i) => { const p = i / 60; return [p, .08 + .7 * Math.exp(-Math.pow((p - .66) / .08, 2))]; }), col: 'var(--ok)', draw: 1, lab: 'A', labAt: 40 }], { yl: 'compliance', xt: [[0, '−400 daPa'], [.66, '0'], [.95, '+200']] })),
    sc('Type B : courbe plate. Avec un volume normal, c’est un épanchement. Avec un grand volume, une perforation.', SV.graph(50, 30, 260, 150, [{ pts: [[0, .1], [1, .14]], col: 'var(--bad)', draw: 1, lab: 'B' }], { yl: 'compliance', xt: [[0, '−400 daPa'], [.66, '0'], [.95, '+200']] })),
    sc('Type C : pic décalé vers les pressions négatives. La trompe d’Eustache ventile mal la caisse.', SV.graph(50, 30, 260, 150, [{ pts: Array.from({ length: 61 }, (_, i) => { const p = i / 60; return [p, .08 + .5 * Math.exp(-Math.pow((p - .33) / .08, 2))]; }), col: 'var(--warn)', draw: 1, lab: 'C', labAt: 22 }], { yl: 'compliance', xt: [[0, '−400 daPa'], [.66, '0'], [.95, '+200']] }))
  ],
  quiz: [{ q: 'Tympanogramme B avec volume de 0,9 ml chez un adulte :', o: ['Épanchement probable', 'Perforation', 'Bouchon', 'Normal'], e: 'Volume normal : la sonde voit un tympan immobile.' }]
});

TESTS.push({
  id: 'reflexes', cat: 'objectif', niv: 'base', nom: 'Réflexe stapédien (Metz, decay)',
  court: 'Contraction du muscle de l’étrier en réponse à un son fort.',
  but: 'Explorer l’arc réflexe : oreille moyenne, cochlée, nerf VIII, tronc cérébral, nerf facial.',
  mat: 'Impédancemètre : stimulation ipsilatérale (même oreille que la sonde) ou controlatérale.',
  etapes: ['Stimuler à 500, 1000, 2000 Hz en montant par pas de 5 dB.', 'Seuil réflexe = plus faible niveau donnant une variation reproductible.', 'Metz : seuil réflexe − seuil tonal à la même fréquence.', 'Decay : stimulation 10 dB au-dessus du seuil réflexe pendant 10 s à 500 et 1000 Hz.'],
  interp: [
    ['Seuil réflexe 70 à 100 dB HL', 'Normal'],
    ['Metz < 60 dB', 'Recrutement : cochléaire'],
    ['Absent côté sonde', 'Transmission côté sonde (même légère)'],
    ['Absent quand on stimule une oreille (ipsi et contra)', 'Perte trop importante ou atteinte du nerf VIII de cette oreille'],
    ['Absent chaque fois que la sonde est d’un côté', 'Atteinte du nerf facial de ce côté'],
    ['Decay : amplitude divisée par 2 en moins de 5 s', 'Rétrocochléaire'],
    ['Ipsi présents, contra absents des deux côtés', 'Atteinte du tronc cérébral']
  ],
  pieges: ['Une petite transmission côté sonde abolit le réflexe.', 'Ne pas dépasser environ 105 à 110 dB HL de stimulation.'],
  retenir: 'Réflexe présent à faible écart du seuil = recrutement. Réflexe qui s’épuise = nerf.',
  video: 'réflexe stapédien arc réflexe interprétation',
  anim: [
    sc('L’arc réflexe : cochlée, nerf auditif, noyaux du tronc cérébral, puis nerf facial des deux côtés jusqu’au muscle de l’étrier.', SV.box(30, 40, 80, 30, 'cochlée D'), SV.box(30, 150, 80, 30, 'étrier D'), SV.box(250, 40, 80, 30, 'cochlée G'), SV.box(250, 150, 80, 30, 'étrier G'), SV.box(140, 95, 80, 30, 'tronc'), SV.flow('M110 55Q140 70 160 95', 'var(--brass)'), SV.flow('M180 125Q140 150 110 165', 'var(--brass)'), SV.flow('M200 125Q220 150 250 165', 'var(--brass)'), SV.t(180, 200, 'VIII → olive → VII des deux côtés', 'sv-s')),
    sc('Test de Metz : si le réflexe apparaît moins de soixante décibels au-dessus du seuil tonal, la cochlée recrute.', SV.graph(80, 30, 200, 150, [{ pts: [[.25, .8], [.25, .45]], col: 'var(--right)', w: 5, lab: 'seuil 50' }, { pts: [[.7, .8], [.7, .15]], col: 'var(--ok)', w: 5, lab: 'réflexe 95' }], { yl: 'dB HL' }), SV.tag(180, 200, 'écart 45 dB < 60 : recrutement', 'var(--ok)')),
    sc('Decay du réflexe : stimulation prolongée dix secondes. Si l’amplitude tombe de moitié en moins de cinq secondes, on suspecte une atteinte du nerf.', SV.graph(40, 40, 280, 130, [{ pts: [[0, .1], [.05, .8], [.5, .8], [1, .78]], col: 'var(--ok)', lab: 'stable' }, { pts: [[0, .1], [.05, .8], [.2, .55], [.4, .3], [1, .15]], col: 'var(--bad)', draw: 1, lab: 'decay', labAt: 2 }], { xl: '10 s' }))
  ],
  quiz: [
    { q: 'Metz : réflexe à 90 dB, seuil tonal à 45 dB :', o: ['Recrutement', 'Pas de recrutement', 'Rétrocochléaire', 'Transmission'], e: 'Écart 45 dB < 60.' },
    { q: 'Réflexes absents chaque fois que la sonde est à droite :', o: ['Transmission droite ou atteinte du VII droit', 'Surdité gauche', 'Normal', 'Atteinte du tronc'], e: 'C’est l’effecteur droit qui ne répond pas.' }
  ]
});

TESTS.push({
  id: 'oea', cat: 'objectif', niv: 'base', nom: 'Otoémissions acoustiques (OEAP, PDA)',
  court: 'Le son émis par les cellules ciliées externes, recueilli dans le conduit.',
  but: 'Vérifier rapidement la fonction cochléaire, sans participation du patient.',
  mat: 'Sonde avec microphone et écouteurs. OEAP : clics. PDA : deux sons f1 et f2 (rapport f2/f1 ≈ 1,22), on recherche 2f1 − f2.',
  etapes: ['Otoscopie, pièce calme, patient immobile.', 'Sonde étanche.', 'Lecture : présence de réponse au-dessus du bruit de fond, par bande de fréquence.'],
  interp: [['Présentes', 'Cellules ciliées externes fonctionnelles, oreille moyenne normale (perte probablement < 30 à 40 dB)'], ['Absentes', 'Perte cochléaire, ou oreille moyenne pathologique, ou mauvaise mesure'], ['Présentes avec PEA absents', 'Neuropathie auditive']],
  pieges: ['Un épanchement ou un bouchon suffit à les abolir.', 'Elles ne mesurent pas un seuil.'],
  retenir: 'OEA présentes = cochlée externe en bon état jusqu’à environ 30 dB de perte.',
  video: 'otoémissions acoustiques explication',
  anim: [
    sc('La sonde envoie un clic. Les cellules ciliées externes de la cochlée vibrent et renvoient un son très faible.', SV.ear(40, 110, { probe: 1, ac: 1, hcHit: 1 })),
    sc('Ce son, l’otoémission, repart vers le conduit où le microphone de la sonde le capte.', SV.ear(40, 110, { probe: 1, hcHit: 1 }), SV.flow('M200 106H30', 'var(--ok)', 2.2, 'sv-rev'), SV.tag(180, 190, 'réponse présente : cochlée externe fonctionnelle', 'var(--ok)'))
  ],
  quiz: [{ q: 'OEA présentes, PEA absents :', o: ['Neuropathie auditive', 'Surdité de transmission', 'Audition normale', 'Simulation'], e: 'Les CCE fonctionnent, le nerf ne transmet pas.' }]
});

TESTS.push({
  id: 'pea', cat: 'objectif', niv: 'base', nom: 'Potentiels évoqués auditifs (PEA)',
  court: 'Activité électrique du nerf et du tronc cérébral dans les 10 ms suivant un clic.',
  but: 'Estimer un seuil sans réponse du patient, explorer le nerf auditif.',
  mat: 'Électrodes (front, mastoïdes), clics ou tone-bursts, patient détendu ou endormi.',
  etapes: ['Préparation de la peau, impédances d’électrodes basses.', 'Stimulation par clics à fort niveau : lecture des ondes I, III, V.', 'Descendre le niveau pour suivre l’onde V jusqu’au seuil.'],
  interp: [
    ['Onde I : nerf distal ; III : noyaux cochléaires ; V : lemnisque latéral, colliculus inférieur', 'Repères anatomiques'],
    ['Latences allongées, intervalle I–V normal', 'Transmission (tout est décalé)'],
    ['I–V normal, latences normales à fort niveau', 'Cochléaire'],
    ['I–V allongé (> environ 4,4 ms) ou onde V décalée entre les oreilles (> 0,2 à 0,3 ms)', 'Rétrocochléaire']
  ],
  pieges: ['Le seuil au clic reflète surtout 2 à 4 kHz : utiliser des tone-bursts pour les graves.', 'Une perte cochléaire aiguë importante peut allonger l’onde V.'],
  retenir: 'Seuil objectif chez le nourrisson ; intervalle I–V pour le nerf.',
  video: 'potentiels évoqués auditifs ondes I III V',
  anim: [
    sc('Un clic dans l’oreille. Des électrodes recueillent la réponse électrique du nerf et du tronc cérébral.', SV.head({ insert: { R: 1 }, hit: { R: 1 } }), SV.t(180, 40, 'électrodes', 'sv-s'), `<circle cx="180" cy="62" r="4" fill="var(--brass)"/><circle cx="128" cy="150" r="4" fill="var(--brass)"/><circle cx="232" cy="150" r="4" fill="var(--brass)"/>`),
    sc('Les ondes un, trois et cinq apparaissent dans les dix millisecondes. L’intervalle de l’onde un à l’onde cinq mesure la conduction dans le tronc cérébral.', SV.graph(30, 40, 300, 120, [{ pts: Array.from({ length: 101 }, (_, i) => { const t = i / 100; return [t, .5 + .25 * Math.exp(-Math.pow((t - .16) / .025, 2)) + .2 * Math.exp(-Math.pow((t - .38) / .025, 2)) + .35 * Math.exp(-Math.pow((t - .56) / .03, 2)) - .2 * Math.exp(-Math.pow((t - .63) / .03, 2))]; }), col: 'var(--ink)', draw: 1 }], { xl: '10 ms' }), SV.t(78, 60, 'I', 'sv-b'), SV.t(144, 66, 'III', 'sv-b'), SV.t(198, 50, 'V', 'sv-b'), SV.arrow(78, 175, 198, 175, 'var(--brass)'), SV.t(138, 192, 'I–V ≈ 4 ms', 'sv-s'))
  ],
  quiz: [{ q: 'Intervalle I–V allongé :', o: ['Rétrocochléaire', 'Transmission', 'Normal', 'Bouchon'], e: 'Ralentissement dans le nerf ou le tronc.' }]
});

TESTS.push({
  id: 'assr', cat: 'objectif', niv: 'avancé', nom: 'ASSR (potentiels évoqués stationnaires)',
  court: 'Seuils objectifs par fréquence grâce à des sons modulés.',
  but: 'Estimer un audiogramme chez le nourrisson ou le patient non coopérant, y compris pour les pertes profondes.',
  mat: 'Sons porteurs de 500 à 4000 Hz modulés (≈ 80 à 100 Hz chez l’enfant endormi), détection statistique automatique.',
  etapes: ['Stimulation simultanée de plusieurs fréquences et des deux oreilles.', 'Le logiciel détecte la réponse à la fréquence de modulation.', 'Descente de niveau jusqu’au seuil.'],
  interp: [['Seuils ASSR', 'Proches des seuils comportementaux, surtout dans les pertes moyennes à profondes'], ['Réponses à très fort niveau', 'Permettent de documenter une perte profonde (bilan d’implant)']],
  pieges: ['Moins précis dans les pertes légères.'],
  retenir: 'L’ASSR donne un audiogramme estimé par fréquence.',
  video: 'ASSR auditory steady state response',
  anim: [sc('Chaque fréquence est modulée à son propre rythme. Le cerveau suit ces rythmes ; le logiciel détecte chaque réponse séparément.', SV.graph(30, 50, 300, 110, [{ pts: Array.from({ length: 120 }, (_, i) => [i / 119, .5 + .3 * Math.sin(i / 1.2) * (.5 + .5 * Math.sin(i / 9))]), col: 'var(--brass)', draw: 1 }], { xl: 'temps' }))],
  quiz: [{ q: 'Intérêt majeur de l’ASSR :', o: ['Seuils objectifs par fréquence', 'Mesurer l’effet d’occlusion', 'Tester le nerf facial', 'Remplacer le tympanogramme'], e: 'Audiogramme estimé.' }]
});

TESTS.push({
  id: 'ecochg', cat: 'objectif', niv: 'avancé', nom: 'Électrocochléographie',
  court: 'Potentiels de la cochlée et du nerf, recueillis près du tympan.',
  but: 'Argument pour un hydrops endolymphatique (Ménière).',
  mat: 'Électrode tympanique ou transtympanique, clics.',
  etapes: ['Recueillir le potentiel de sommation (SP) et le potentiel d’action (AP).', 'Calculer le rapport SP/AP.'],
  interp: [['Rapport SP/AP augmenté (au-delà d’environ 0,4 à 0,5)', 'Évoque un hydrops']],
  pieges: ['Sensibilité limitée : un résultat normal n’exclut pas Ménière.'],
  retenir: 'SP/AP élevé = argument pour un hydrops.',
  video: 'électrocochléographie Ménière SP AP',
  anim: [sc('Le potentiel de sommation, en épaulement, précède le potentiel d’action du nerf. Dans l’hydrops, il est anormalement grand.', SV.graph(40, 40, 280, 130, [{ pts: Array.from({ length: 101 }, (_, i) => { const t = i / 100; return [t, .8 - .25 * (t > .2 && t < .45 ? 1 : 0) * Math.sin((t - .2) / .25 * Math.PI) - .45 * Math.exp(-Math.pow((t - .35) / .04, 2))]; }), col: 'var(--ink)', draw: 1 }], { xl: 'ms' }), SV.t(110, 90, 'SP', 'sv-b'), SV.t(140, 170, 'AP', 'sv-b'))],
  quiz: [{ q: 'Un rapport SP/AP élevé évoque :', o: ['Un hydrops (Ménière)', 'Une otospongiose', 'Un neurinome', 'Une OSM'], e: 'Argument électrophysiologique.' }]
});

/* ================= NON ORGANIQUE ================= */
TESTS.push({
  id: 'stenger', cat: 'nonorg', niv: 'base', nom: 'Test de Stenger',
  court: 'Deux sons identiques dans les deux oreilles : seul le plus fort est perçu.',
  but: 'Dépister une surdité unilatérale simulée ou exagérée.',
  mat: 'Audiomètre deux canaux (variantes au diapason et en vocale).',
  etapes: ['Mesurer les seuils annoncés des deux oreilles (écart d’au moins 20 dB).', 'Présenter un son 10 dB au-dessus du seuil de la bonne oreille : le patient répond.', 'Présenter en même temps le même son 10 dB au-dessus du seuil vrai de la bonne oreille et 10 dB sous le seuil annoncé de la « mauvaise ».', 'Observer la réponse.'],
  interp: [['Le patient répond (Stenger négatif)', 'Surdité unilatérale réelle : il entend le son de la bonne oreille'], ['Le patient ne répond plus (Stenger positif)', 'Simulation : il perçoit le son du côté « sourd » seulement et refuse de répondre']],
  pieges: ['Sans effet si l’écart entre les oreilles est faible.'],
  retenir: 'Stenger positif = le patient entend mieux qu’il ne le dit du côté « sourd ».',
  sim: 'stenger', video: 'test de Stenger simulation surdité unilatérale',
  anim: [
    sc('Principe de Stenger : avec deux sons identiques, un dans chaque oreille, on ne perçoit que celui qui est le plus fort, du côté où il est le plus fort.', SV.head({ casque: 1, hit: { R: 1 } }), SV.tag(110, 30, 'OD : +10 dB SL', SVR), SV.tag(250, 30, 'OG : +5 dB SL', SVL), SV.bubble(120, 60, 'à droite', 'right')),
    sc('Simulateur : il annonce soixante-dix décibels à droite alors qu’il entend normalement. On envoie vingt à gauche et soixante à droite.', SV.head({ casque: 1, hit: { R: 1 } }), SV.tag(110, 30, 'OD : 60 dB', SVR), SV.tag(250, 30, 'OG : 20 dB', SVL)),
    sc('Il perçoit le son à droite, plus fort pour lui, et ne répond pas pour rester cohérent. Pourtant le son de gauche, seul, l’aurait fait répondre. Stenger positif.', SV.head({ casque: 1, hit: { R: 1 } }), SV.bubble(250, 60, '…', 'left'), SV.tag(180, 205, 'Pas de réponse : Stenger positif', 'var(--bad)'))
  ],
  quiz: [{ q: 'Stenger positif :', o: ['Évoque une simulation unilatérale', 'Confirme une cophose', 'Est normal', 'Évoque un neurinome'], e: 'Le patient perçoit le son du côté prétendu sourd.' }]
});

TESTS.push({
  id: 'lombard', cat: 'nonorg', niv: 'avancé', nom: 'Test de Lombard',
  court: 'Dans le bruit, on parle plus fort sans s’en rendre compte.',
  but: 'Dépister une surdité bilatérale simulée.',
  mat: 'Bruit au casque, texte à lire.',
  etapes: ['Le patient lit un texte à voix haute.', 'On ajoute un bruit dans les deux oreilles, à un niveau qu’il prétend ne pas entendre.', 'Observer l’intensité de sa voix.'],
  interp: [['La voix monte avec le bruit', 'Il entend le bruit : simulation probable'], ['La voix ne change pas', 'Compatible avec une surdité réelle']],
  pieges: ['Test qualitatif, aujourd’hui supplanté par les mesures objectives.'],
  retenir: 'L’effet Lombard est réflexe et difficile à contrôler.',
  video: 'effet Lombard test simulation',
  anim: [sc('Le patient lit à voix haute. Dès que le bruit arrive, sa voix monte : il l’entend.', SV.head({ casque: 1 }), SV.waves(232, 118, 0, 'var(--muted)'), SV.bubble(100, 40, 'LE PETIT CHAT…', 'right'), SV.meter(110, 196, 140, .8, 'intensité de la voix'))],
  quiz: [{ q: 'Effet Lombard présent chez un patient se disant totalement sourd :', o: ['Évoque une simulation', 'Confirme la surdité', 'Évoque une transmission', 'N’a aucune valeur'], e: 'Il entend le bruit.' }]
});

TESTS.push({
  id: 'nonorg', cat: 'nonorg', niv: 'base', nom: 'Signes d’alerte de surdité non organique',
  court: 'Les incohérences qui doivent faire douter.',
  but: 'Reconnaître une exagération ou une simulation, sans accusation, et la documenter.',
  mat: 'L’ensemble du bilan.',
  etapes: ['Comparer comportement, tonale, vocale et mesures objectives.', 'Reconsigner calmement, refaire les mesures.', 'Utiliser des tests objectifs (réflexes, OEA, PEA, ASSR).'],
  interp: [
    ['Seuil d’intelligibilité bien meilleur que la moyenne tonale', 'Incohérence majeure'],
    ['Cophose unilatérale annoncée sans courbe fantôme non masquée', 'Impossible physiquement'],
    ['Réflexe stapédien présent à un niveau inférieur au seuil annoncé', 'Le patient entend mieux qu’il ne dit'],
    ['OEA présentes avec un seuil annoncé à 60 dB', 'Incohérent'],
    ['Réponses à moitié, test-retest instable, Békésy type V', 'Évocateurs']
  ],
  pieges: ['Une surdité non organique peut se superposer à une vraie perte.', 'Rester neutre : enfants et adultes peuvent exagérer pour de nombreuses raisons.'],
  retenir: 'L’absence de courbe fantôme dans une « cophose » unilatérale non masquée est un signe très fort.',
  sim: 'stenger', video: 'surdité non organique simulation audiométrie',
  anim: [sc('Une oreille cophotique non masquée devrait laisser apparaître une courbe fantôme. Si le patient ne répond jamais, même à cent décibels, c’est physiquement impossible.', SV.audio(70, 30, 230, 150, [{ side: 'L', pts: [[250, 10], [500, 10], [1000, 10], [2000, 15], [4000, 15]] }, { side: 'R', pts: [[250, 105], [500, 120], [1000, 120], [2000, 120], [4000, 120]] }], { label: 'aucune réponse à droite, même sans masquage : suspect' }))],
  quiz: [{ q: 'Cophose droite annoncée, aucune réponse à droite sans masquage même à 100 dB, oreille gauche normale :', o: ['Incohérent : simulation probable', 'Cophose confirmée', 'Transmission droite', 'Neurinome'], e: 'L’oreille gauche aurait dû répondre par transfert vers 40 à 60 dB.' }]
});

/* ================= ENFANT ================= */
TESTS.push({
  id: 'ped_observ', cat: 'pedia', niv: 'base', nom: 'Audiométrie comportementale d’observation (0–6 mois)',
  court: 'Observer les réactions réflexes du nourrisson aux sons.',
  but: 'Impression qualitative, jamais un seuil.',
  mat: 'Jouets sonores, audiomètre en champ libre, deux observateurs.',
  etapes: ['Bébé calme, éveillé, sur les genoux d’un parent.', 'Présenter des sons de différentes hauteurs et intensités.', 'Observer : clignement (réflexe cochléo-palpébral aux sons forts), sursaut (Moro), arrêt de la succion, réveil, orientation à partir de 4 à 6 mois.'],
  interp: [['Réactions présentes', 'Rassurant mais ne quantifie rien'], ['Absence de réaction aux sons forts', 'Bilan objectif urgent (PEA, ASSR)']],
  pieges: ['Habituation très rapide.', 'Les réactions visuelles ou vibratoires trompent.'],
  retenir: 'Chez le nourrisson, le seuil se mesure objectivement : PEA et ASSR.',
  video: 'audiométrie comportementale nourrisson',
  anim: [sc('Un son fort fait cligner les yeux du nourrisson : c’est le réflexe cochléo-palpébral. Il prouve qu’un son fort est perçu, pas que l’audition est normale.', SV.baby(170, 130), SV.speaker(300, 120, 180), SV.waves(286, 120, Math.PI, 'var(--brass)'), SV.bubble(140, 90, 'clignement', 'left'))],
  quiz: [{ q: 'Chez un nourrisson de 2 mois, le seuil auditif se détermine par :', o: ['PEA ou ASSR', 'Le réflexe cochléo-palpébral', 'L’audiométrie ludique', 'La voix chuchotée'], e: 'Les réactions comportementales ne donnent pas de seuil.' }]
});

TESTS.push({
  id: 'ped_vra', cat: 'pedia', niv: 'base', nom: 'Réflexe d’orientation conditionné (VRA, 6–30 mois)',
  court: 'L’enfant tourne la tête vers le son et un jouet lumineux le récompense.',
  but: 'Obtenir des niveaux minimaux de réponse par fréquence, puis par oreille.',
  mat: 'Haut-parleurs latéraux, jouets animés lumineux, inserts dès que toléré, deux examinateurs.',
  etapes: ['Conditionnement : son fort + allumage immédiat du jouet du même côté.', 'Quand l’enfant tourne la tête dès le son, diminuer les niveaux.', 'Récompense seulement après une vraie réponse.', 'Essais sans son pour contrôler les fausses réponses.', 'Passer aux inserts pour avoir chaque oreille.'],
  interp: [['Réponses fiables jusqu’à des niveaux faibles', 'Audition probablement utile'], ['Niveaux minimaux élevés', 'Perte à confirmer et quantifier objectivement']],
  pieges: ['L’enfant se lasse vite : 10 à 15 minutes utiles.', 'L’examinateur qui regarde le jouet induit la réponse.'],
  retenir: 'Son, tête qui tourne, récompense : uniquement dans cet ordre.',
  video: 'audiométrie renforcement visuel VRA enfant',
  anim: [
    sc('Le son arrive d’un côté. Aussitôt, le jouet du même côté s’allume.', SV.baby(170, 150), SV.speaker(310, 90, 180), SV.waves(296, 90, Math.PI, 'var(--brass)'), SV.toy(310, 140, 1)),
    sc('Après quelques essais, l’enfant tourne la tête dès qu’il entend le son, pour voir le jouet. On baisse alors le niveau.', SV.baby(170, 150), SV.speaker(310, 90, 180), SV.waves(296, 90, Math.PI, 'var(--brass)'), SV.toy(310, 140, 0), SV.arrow(150, 120, 260, 110, 'var(--brass)'))
  ],
  quiz: [{ q: 'Dans le VRA, la récompense visuelle est donnée :', o: ['Seulement après une vraie réponse au son', 'Avant chaque son', 'En continu', 'Jamais'], e: 'Sinon le conditionnement est faussé.' }]
});

TESTS.push({
  id: 'ped_jeu', cat: 'pedia', niv: 'base', nom: 'Audiométrie ludique (dès 2 ans ½ – 3 ans)',
  court: 'Une action de jeu à chaque son entendu.',
  but: 'Seuils tonals par oreille au casque, CA et CO.',
  mat: 'Casque ou inserts, jeux (pions, perles, puzzle), anciennement « peep-show ».',
  etapes: ['Démonstration : l’examinateur met un pion dans la boîte en entendant le son.', 'L’enfant fait de même, d’abord à fort niveau.', 'Méthode ascendante simplifiée, fréquences clés d’abord (500, 2000 puis 1000, 4000 Hz).', 'Varier les intervalles, contrôler l’attente.'],
  interp: [['Seuils cohérents d’une séance à l’autre', 'Fiables comme chez l’adulte']],
  pieges: ['Enfant qui joue en rythme sans écouter.', 'Fatigue : séances courtes.'],
  retenir: 'Fréquences clés en premier : on n’aura peut-être pas le temps de tout faire.',
  video: 'audiométrie ludique enfant conditionnement jeu',
  anim: [sc('Le son retentit : l’enfant met un pion dans la boîte. Chaque son entendu donne une action de jeu.', SV.person(180, 160, 'var(--ink)', .9, 'enfant'), SV.box(220, 150, 60, 30, 'boîte'), SV.arrow(196, 120, 236, 146, 'var(--brass)'), SV.tag(180, 40, '♪ 2000 Hz', 'var(--brass)'))],
  quiz: [{ q: 'Fréquences à obtenir en priorité chez le jeune enfant :', o: ['500 et 2000 Hz', '8000 Hz', '125 Hz', '6000 Hz'], e: 'Elles résument au mieux l’audition pour la parole.' }]
});

TESTS.push({
  id: 'ped_vocale', cat: 'pedia', niv: 'base', nom: 'Vocale de l’enfant et test des 6 sons de Ling',
  court: 'Désigner des images, répéter des mots, détecter et identifier les sons de Ling.',
  but: 'Évaluer la perception de la parole, contrôler l’appareillage au quotidien.',
  mat: 'Planches d’images (choix fermé), listes adaptées à l’âge, la voix de l’examinateur pour les sons de Ling.',
  etapes: ['Choix fermé : l’enfant désigne l’image du mot entendu.', 'Choix ouvert : il répète, dès que son langage le permet.', 'Ling : [m], [u], [a], [i], [ʃ], [s], à distance et sans lecture labiale ; détection (lever la main) puis identification (répéter).'],
  interp: [['Les 6 sons détectés et identifiés', 'Spectre de la parole audible, du grave ([m], [u]) à l’aigu ([s])'], ['[s] ou [ʃ] non perçus', 'Manque d’audibilité dans les aigus : contrôler l’appareil et le réglage']],
  pieges: ['Vocabulaire de l’enfant à vérifier avant le test.'],
  retenir: 'Le test de Ling se fait chaque matin avec les appareils.',
  video: 'test des six sons de Ling',
  anim: [sc('Les six sons de Ling couvrent le spectre de la parole, du grave à l’aigu.', SV.graph(40, 40, 280, 120, [{ pts: [[0, .2], [1, .2]], col: 'var(--line)' }], { xt: [[.05, '[m] grave'], [.2, '[u]'], [.4, '[a]'], [.6, '[i]'], [.8, '[ʃ]'], [.97, 'aigu [s]']] }), SV.tag(70, 120, 'm', 'var(--brass)'), SV.tag(110, 110, 'u', 'var(--brass)'), SV.tag(160, 90, 'a', 'var(--brass)'), SV.tag(210, 100, 'i', 'var(--brass)'), SV.tag(260, 80, 'ʃ', 'var(--brass)'), SV.tag(310, 70, 's', 'var(--brass)'))],
  quiz: [{ q: 'Le son de Ling le plus aigu :', o: ['[s]', '[m]', '[u]', '[a]'], e: 'Il teste l’audibilité des hautes fréquences.' }]
});

/* ================= DÉPISTAGE ================= */
TESTS.push({
  id: 'dep_principes', cat: 'depist', niv: 'base', nom: 'Principes d’un dépistage',
  court: 'Un test simple qui trie : « passe » ou « à contrôler ». Ce n’est pas un diagnostic.',
  but: 'Repérer, dans une population, les personnes qui ont besoin d’un bilan complet.',
  mat: 'Un test court, standardisé, avec un critère de réussite fixé à l’avance.',
  etapes: [
    'Définir la population, le test, le critère (par exemple : réponse à 25 dB HL à 1, 2 et 4 kHz) et la conduite en cas d’échec.',
    'Sensibilité : proportion de malentendants que le test repère. Spécificité : proportion de normo-entendants qu’il laisse passer.',
    'Valeur prédictive positive (VPP) : parmi les « à contrôler », combien ont vraiment une perte. Elle chute quand la maladie est rare.',
    'Critères de Wilson et Jungner (OMS, 1968) : problème de santé important, traitement disponible, stade précoce repérable, test acceptable, structures de diagnostic accessibles, coût raisonnable, démarche continue.',
    'Orientation systématique des « à contrôler » vers un bilan, avec traçabilité.'
  ],
  interp: [['Faux positif', 'Personne normale classée « à contrôler » : inquiétude, bilan inutile'], ['Faux négatif', 'Perte manquée : fausse réassurance, retard de prise en charge'], ['Maladie rare (1 naissance sur 1000)', 'Même avec un excellent test, la majorité des « à contrôler » sont des faux positifs : d’où le retest']],
  pieges: ['Dire « échec » ou « sourd » à l’issue d’un dépistage : on dit « à contrôler ».', 'Changer le critère en cours de route.'],
  retenir: 'Un dépistage trie, il ne diagnostique pas. Sa valeur dépend autant de la prévalence que du test.',
  sim: 'vpp', video: 'sensibilité spécificité valeur prédictive dépistage',
  anim: [
    sc('Deux cents personnes dépistées. Les points rouges ont une vraie perte auditive.', `<g class="sv-in">${Array.from({ length: 200 }, (_, i) => `<circle cx="${40 + (i % 25) * 11.5}" cy="${40 + Math.floor(i / 25) * 17}" r="4" fill="${i % 9 === 4 ? 'var(--right)' : 'var(--line)'}"/>`).join('')}</g>`, SV.t(180, 200, 'prévalence élevée : 1 sur 9', 'sv-s')),
    sc('Sensibilité : le test repère la plupart des vrais malentendants. Spécificité : il laisse passer la plupart des normo-entendants.', SV.table(60, 60, ['', 'Perte réelle', 'Pas de perte'], [['Test « à contrôler »', 'vrai positif', 'faux positif'], ['Test « passe »', 'faux négatif', 'vrai négatif']], { cw: [110, 90, 90] })),
    sc('Quand la surdité est rare, comme chez le nouveau-né, même un très bon test produit surtout des faux positifs. C’est pourquoi on refait le test avant d’inquiéter.', SV.graph(60, 30, 240, 150, [{ pts: [[0, .02], [.1, .16], [.25, .35], [.5, .6], [.75, .8], [1, .9]], col: 'var(--brass)', draw: 1, lab: 'VPP' }], { yl: 'VPP', xt: [[0, 'maladie rare'], [.9, 'fréquente']] }))
  ],
  quiz: [
    { q: 'Valeur prédictive positive :', o: ['Proportion de vrais malentendants parmi les « à contrôler »', 'Proportion de malentendants repérés', 'Proportion de normaux qui passent', 'Prévalence'], e: 'Elle dépend fortement de la prévalence.' },
    { q: 'On dit à des parents après un dépistage néonatal non concluant :', o: ['« Le test est à contrôler »', '« Votre enfant est sourd »', '« Le test est en échec »', 'Rien'], e: 'Formulation non alarmante et exacte.' }
  ]
});

TESTS.push({
  id: 'dep_neonat', cat: 'depist', niv: 'base', nom: 'Dépistage néonatal (OEAA, PEAA)',
  court: 'Tous les nouveau-nés, en maternité, avant la sortie.',
  but: 'Repérer tôt une surdité permanente bilatérale (≈ 1 naissance sur 1000) pour agir avant 6 mois.',
  mat: 'OEA automatisées (OEAA) ou PEA automatisés (PEAA), réponse « passe / à contrôler ».',
  etapes: [
    'Information des parents (dépistage proposé, non obligatoire ; cadre en France : arrêté du 23 avril 2012).',
    'Test en maternité, bébé endormi ou calme, de préférence après 24 h de vie (moins de liquide dans le conduit).',
    'Si « à contrôler » : nouveau test avant la sortie.',
    'Si toujours « à contrôler » : test de contrôle dans les semaines suivantes, puis bilan diagnostique en centre spécialisé (PEA diagnostiques, tympanométrie 1000 Hz).',
    'Objectif 1-3-6 : dépistage avant 1 mois, diagnostic avant 3 mois, prise en charge avant 6 mois (le JCIH 2019 propose même 1-2-3 pour les programmes performants).',
    'Néonatologie et facteurs de risque : PEAA plutôt qu’OEAA, et suivi audiologique même si le test passe.'
  ],
  interp: [
    ['OEAA « passe »', 'Cochlée externe fonctionnelle ; ne détecte pas une neuropathie auditive'],
    ['PEAA « passe »', 'Voie auditive jusqu’au tronc fonctionnelle à environ 35 dB nHL'],
    ['« À contrôler » unilatéral', 'Même circuit de contrôle que le bilatéral'],
    ['Test normal puis inquiétude des parents', 'Toujours recontrôler : CMV, surdités évolutives ou acquises']
  ],
  pieges: ['Liquide amniotique ou vernix dans le conduit : faux « à contrôler » les premières heures.', 'Bruit dans la chambre, bébé agité.', 'Un dépistage normal ne garantit pas l’audition future.'],
  retenir: 'OEAA pour la population générale, PEAA en néonatologie. Retester avant d’inquiéter, et suivre les enfants à risque.',
  video: 'dépistage auditif néonatal OEA PEA automatisés maternité',
  anim: [
    sc('En maternité, le bébé endormi est testé par otoémissions automatisées ou potentiels évoqués automatisés. Résultat : passe, ou à contrôler.', SV.baby(170, 130), SV.screen(240, 70, 90, 60, SV.t(285, 95, 'PASSE', 'sv-b sv-ok') + SV.t(285, 115, 'OD  OG', 'sv-s'))),
    sc('Le parcours en cas de test à contrôler.', SV.tree([
      { id: 'a', x: 120, y: 20, w: 120, h: 26, t: 'Test en maternité', k: 'hi' },
      { id: 'b', x: 20, y: 70, w: 100, h: 26, t: 'Passe', k: 'ok' },
      { id: 'c', x: 200, y: 70, w: 140, h: 26, t: 'À contrôler → retest', k: 'warn' },
      { id: 'd', x: 130, y: 120, w: 100, h: 26, t: 'Passe', k: 'ok' },
      { id: 'e', x: 240, y: 120, w: 110, h: 26, t: 'Contrôle (semaines)', k: 'warn' },
      { id: 'f', x: 210, y: 170, w: 140, h: 30, t: 'Bilan diagnostique\navant 3 mois', k: 'bad' }
    ], [['a', 'b'], ['a', 'c'], ['c', 'd'], ['c', 'e'], ['e', 'f']])),
    sc('Piège : les otoémissions ne détectent pas la neuropathie auditive, car les cellules ciliées externes fonctionnent. En néonatologie, on utilise les potentiels évoqués automatisés.', SV.ear(40, 110, { probe: 1, hcHit: 1, nerve: 1 }), SV.tag(110, 190, 'OEAA : passe', 'var(--ok)'), SV.tag(260, 190, 'PEAA : à contrôler', 'var(--bad)'))
  ],
  quiz: [
    { q: 'Pourquoi des PEAA en néonatologie ?', o: ['Les OEAA ne voient pas la neuropathie auditive', 'Ils sont plus rapides', 'Les OEAA sont interdits', 'Pour mesurer le RECD'], e: 'La neuropathie est plus fréquente chez ces enfants.' },
    { q: 'Le repère 1-3-6 signifie :', o: ['Dépistage < 1 mois, diagnostic < 3 mois, prise en charge < 6 mois', 'Trois tests en six mois', 'Une oreille, trois fréquences, six dB', 'Contrôles à 1, 3 et 6 ans'], e: 'Recommandation internationale (JCIH).' }
  ]
});

TESTS.push({
  id: 'dep_enfant', cat: 'depist', niv: 'base', nom: 'Dépistage de l’enfant et en milieu scolaire',
  court: 'Repérer les surdités acquises ou évolutives, et les otites séromuqueuses.',
  but: 'Éviter qu’une perte, même légère ou unilatérale, retentisse sur le langage et les apprentissages.',
  mat: 'Jouets sonores calibrés (boîtes de Moatti) chez le petit, voix chuchotée, audiomètre de dépistage, tympanomètre.',
  etapes: [
    'Avant 2 ans : réactions d’orientation à des jouets sonores calibrés, sons graves et aigus, hors du champ visuel.',
    'Bilans en maternelle (PMI) et visite de la 6e année : audiométrie de dépistage par balayage, souvent à 20 ou 25 dB HL sur 500 (ou 1000), 2000 et 4000 Hz, oreille par oreille.',
    'Critère d’échec : absence de réponse à une fréquence sur une oreille, confirmée au retest.',
    'Tympanométrie si échec : une otite séromuqueuse explique beaucoup d’échecs en maternelle.',
    'Orientation vers le médecin ou l’ORL, information claire des parents.'
  ],
  interp: [['Échec bilatéral avec tympanogramme B', 'Otite séromuqueuse probable : avis médical, contrôle à distance'], ['Échec unilatéral, tympanogramme A', 'Surdité de perception unilatérale possible : bilan ORL'], ['Retard de langage, quel que soit le dépistage', 'Bilan audiologique complet']],
  pieges: ['Salle bruyante (cour, couloir) : faux échecs.', 'Enfant qui répond au rythme ou regarde l’examinateur.', 'Une perte unilatérale passe souvent inaperçue au quotidien.'],
  retenir: 'Au moindre doute des parents ou de l’enseignant sur l’audition ou le langage, on teste.',
  sim: 'balayage', video: 'dépistage auditif école maternelle audiométrie',
  anim: [
    sc('Chez le petit, un jouet sonore calibré est actionné hors de son champ visuel. On observe s’il tourne la tête vers le son.', SV.person(170, 160, 'var(--ink)', .8, 'enfant de 9 mois'), SV.toy(300, 120, 1), SV.waves(282, 120, Math.PI, 'var(--brass)'), SV.arrow(190, 110, 260, 110, 'var(--brass)')),
    sc('À l’école, balayage à vingt ou vingt-cinq décibels sur quelques fréquences, oreille par oreille. Toute absence de réponse confirmée au retest oriente vers un bilan.', SV.table(60, 60, ['', '500', '1000', '2000', '4000'], [['OD', '✓', '✓', '✓', '✓'], ['OG', '✓', '✗', '✗', '✓']], { cw: [50, 50, 50, 50, 50], hl: [0, 1] }), SV.tag(180, 160, 'à contrôler : oreille gauche', 'var(--bad)'))
  ],
  quiz: [{ q: 'Échec au dépistage scolaire bilatéral avec tympanogramme B :', o: ['Otite séromuqueuse probable', 'Surdité de perception certaine', 'Simulation', 'Rien à faire'], e: 'Avis médical et contrôle.' }]
});

TESTS.push({
  id: 'dep_adulte', cat: 'depist', niv: 'base', nom: 'Dépistage de l’adulte et du senior',
  court: 'Questionnaire, voix chuchotée, test dans le bruit, balayage tonal.',
  but: 'Repérer les pertes qui gênent la communication, souvent ignorées par le patient lui-même.',
  mat: 'Questionnaire de handicap (type HHIE-S), voix chuchotée, test des triplets de chiffres dans le bruit, audiomètre de dépistage.',
  etapes: [
    'Questionnaire : HHIE-S (10 questions, score de 0 à 40 ; au-delà de 8, un handicap est probable ; à partir de 26, handicap important).',
    'Voix chuchotée : à bout de bras (≈ 60 cm) derrière le patient, oreille opposée masquée par frottement du tragus, après expiration ; triplets de chiffres et lettres.',
    'Frottement des doigts à bout de bras : test rapide de repérage.',
    'Triplets de chiffres dans le bruit (par exemple l’appli hearWHO de l’OMS) : seuil en dB de rapport signal/bruit, à faire au casque.',
    'Balayage tonal à 25 dB HL à 1000, 2000 et 4000 Hz (± 500 Hz), oreille par oreille.'
  ],
  interp: [['Échec à un des tests', 'Audiométrie complète et avis médical'], ['Questionnaire positif, tests normaux', 'Explorer la plainte (bruit, central, attentes)']],
  pieges: ['La voix chuchotée dépend de l’examinateur : la standardiser (expiration, distance, masquage).', 'Les triplets dans le bruit au haut-parleur du téléphone ne sont pas fiables.'],
  retenir: 'La perte auditive non corrigée figure parmi les principaux facteurs de risque modifiables de déclin cognitif identifiés par la commission du Lancet : la repérer a un vrai enjeu.',
  sim: 'chuchote', video: 'test voix chuchotée dépistage adulte',
  anim: [
    sc('Voix chuchotée : l’examinateur est derrière le patient, à bout de bras. Il frotte le tragus de l’oreille opposée, expire, puis chuchote trois éléments.', SV.head({ occl: { L: 1 } }), SV.person(50, 160, 'var(--brass)', 1, '≈ 60 cm'), SV.bubble(95, 60, '« 6 – K – 2 »', 'right')),
    sc('Les trois sont répétés : l’oreille passe. Sinon, nouveau triplet. Moins de trois éléments sur six : à contrôler.', SV.table(60, 70, ['Triplet', 'Répété', 'Score'], [['6 K 2', '6 K 2', '3/3 : passe'], ['4 M 9', '4 N …', '1/3'], ['total', '', '4/6 : passe']], { cw: [80, 80, 100] }))
  ],
  quiz: [{ q: 'Voix chuchotée : l’oreille est « à contrôler » si le patient répète correctement :', o: ['Moins de 3 éléments sur 6', 'Moins de 6 sur 6', 'Moins de 1 sur 3', 'Le test n’a pas de critère'], e: 'Protocole classique en deux triplets.' }]
});

TESTS.push({
  id: 'dep_travail', cat: 'depist', niv: 'base', nom: 'Dépistage en santé au travail',
  court: 'Suivre l’audition des salariés exposés au bruit.',
  but: 'Repérer tôt un traumatisme sonore et vérifier l’efficacité de la protection.',
  mat: 'Audiométrie tonale (cabine ou audiomètre de dépistage), questionnaire d’exposition.',
  etapes: ['Audiogramme de référence à l’embauche.', 'Contrôles périodiques, idéalement après au moins 12 h sans exposition au bruit (pas de fatigue auditive temporaire).', 'Comparer à la référence, surveiller 3 à 6 kHz.', 'Valeurs d’exposition (8 h) : actions dès 80 dB(A), protecteurs obligatoires à 85 dB(A), valeur limite 87 dB(A).'],
  interp: [['Encoche qui se creuse vers 4 kHz', 'Traumatisme sonore débutant : renforcer la protection'], ['Perte établie', 'Maladie professionnelle possible (tableau 42 du régime général)']],
  pieges: ['Mesure juste après le poste : seuils temporairement abaissés.'],
  retenir: 'L’audiogramme de référence est la pièce maîtresse du suivi.',
  video: 'surveillance audiométrique travail bruit encoche 4000',
  anim: [sc('Le suivi compare chaque contrôle à l’audiogramme de référence. L’encoche à quatre kilohertz se creuse avant que la parole soit touchée.', SV.audio(70, 30, 230, 150, [{ side: 'R', dash: 1, col: 'var(--muted)', pts: [[250, 10], [500, 10], [1000, 10], [2000, 10], [4000, 15], [8000, 15]] }, { side: 'R', pts: [[250, 10], [500, 10], [1000, 15], [2000, 20], [4000, 45], [8000, 25]] }], { label: 'référence (pointillé) et contrôle' }))],
  quiz: [{ q: 'Valeur limite d’exposition au bruit sur 8 h en France :', o: ['87 dB(A)', '80 dB(A)', '85 dB(A)', '95 dB(A)'], e: 'Protecteurs pris en compte.' }]
});

TESTS.push({
  id: 'dep_magasin', cat: 'depist', niv: 'base', nom: 'Dépistage en magasin, optique ou pharmacie',
  court: 'Un test court hors cabine, qui doit rester fiable et bien orienter.',
  but: 'Repérer, orienter vers le médecin, sans jamais poser de diagnostic.',
  mat: 'Casque fermé (circumaural de préférence), tablette ou audiomètre de dépistage étalonné, coin calme.',
  etapes: [
    'Environnement : coin fermé, loin de la caisse, de la rue et de la musique. Un bureau calme se situe vers 35 à 45 dB(A) ; au-delà d’environ 50 dB(A), un dépistage à 20–25 dB HL n’est plus fiable.',
    'Matériel : même casque et même volume que lors de l’étalonnage ; vérifier les écouteurs droit et gauche.',
    'Consigne simple, démonstration à niveau confortable.',
    'Protocole court : balayage 1, 2, 4 kHz (± 500 Hz) à 25 dB HL, chaque oreille, essais silencieux pour vérifier la fiabilité.',
    'Résultat formulé sans diagnostic : « votre test est à contrôler, je vous conseille de consulter votre médecin ou un ORL ».',
    'Traçabilité : compte rendu remis, données de santé traitées avec consentement et en quantité minimale.'
  ],
  interp: [['Toutes les réponses présentes', 'Pas d’argument pour une perte gênante aujourd’hui ; conseiller un contrôle régulier après 60 ans'], ['Une absence de réponse confirmée', 'À contrôler : orientation médicale'], ['Signe d’alerte (douleur, écoulement, surdité brutale, acouphène unilatéral, vertige)', 'Orientation médicale rapide, quel que soit le résultat']],
  pieges: ['Bluetooth : latence et coupures des sons faibles, préférer le filaire.', 'Égaliseurs et réducteurs de bruit du téléphone ou de la tablette : à désactiver.', 'Promettre un résultat « médical » : le dépistage oriente, il ne diagnostique pas.'],
  retenir: 'Un bon dépistage hors cabine, c’est 80 % de conditions (bruit, casque, étalonnage, consigne) et 20 % de test.',
  sim: 'balayage', video: 'dépistage auditif en pharmacie optique conditions',
  anim: [
    sc('Le coin de dépistage : fermé, loin de la caisse et de la rue, casque fermé, matériel étalonné.', SV.box(30, 30, 300, 150, '', { fill: 'var(--surface-2)' }), SV.person(140, 150, 'var(--ink)', 1, 'client'), SV.screen(200, 100, 70, 46, SV.t(235, 128, 'TEST', 'sv-b')), SV.tag(270, 50, '≈ 40 dB(A)', 'var(--ok)')),
    sc('Le bruit ambiant se mesure avant de commencer. Au-delà d’environ cinquante décibels A, un dépistage à vingt-cinq décibels HL n’est plus fiable.', SV.meter(60, 90, 240, .45, 'bureau calme ≈ 40 dB(A)'), SV.meter(60, 140, 240, .78, 'zone de caisse ≈ 60 dB(A) : non fiable')),
    sc('Le résultat ne pose jamais de diagnostic. Il oriente : passe, ou à contrôler chez le médecin.', SV.tree([{ id: 'a', x: 110, y: 30, w: 140, h: 26, t: 'Balayage 25 dB HL', k: 'hi' }, { id: 'b', x: 20, y: 100, w: 140, h: 30, t: 'Passe : conseil\nde contrôle régulier', k: 'ok' }, { id: 'c', x: 200, y: 100, w: 140, h: 30, t: 'À contrôler :\nmédecin ou ORL', k: 'bad' }], [['a', 'b'], ['a', 'c']]))
  ],
  quiz: [
    { q: 'En magasin, le principal facteur de faux « à contrôler » est :', o: ['Le bruit ambiant', 'La couleur du casque', 'L’âge du client', 'L’heure de la journée'], e: 'Il masque les sons faibles.' },
    { q: 'Formulation correcte après un dépistage anormal :', o: ['« Votre test est à contrôler, consultez votre médecin ou un ORL »', '« Vous avez une presbyacousie »', '« Il vous faut des appareils »', '« Ce n’est rien »'], e: 'Le dépistage oriente sans diagnostiquer.' }
  ]
});

TESTS.push({
  id: 'dep_parfait', cat: 'depist', niv: 'base', nom: 'Le dépistage parfait : check-list et signes d’alerte',
  court: 'Avant, pendant, après : tout ce qui rend un dépistage fiable et utile.',
  but: 'Un résultat juste, compris, suivi d’une orientation adaptée.',
  mat: 'Cette liste.',
  etapes: [
    'Avant : pièce calme (bruit mesuré), matériel étalonné et vérifié (écouteurs droit/gauche, câble), otoscopie si on en a la compétence.',
    'Avant : interroger brièvement (gêne, acouphène, vertiges, écoulement, surdité brutale, traitements ototoxiques, bruit).',
    'Pendant : consigne claire et démonstration, patient qui ne voit ni l’écran ni la main de l’examinateur.',
    'Pendant : intervalles variés, essais silencieux, retest de 1000 Hz, les deux oreilles.',
    'Après : résultat « passe » ou « à contrôler » expliqué simplement, compte rendu écrit, orientation précise.',
    'Après : traçabilité et relance si le patient ne consulte pas.'
  ],
  interp: [
    ['Surdité brutale (< 72 h)', 'Urgence ORL le jour même'],
    ['Otorrhée, otalgie, conduit anormal', 'Avis médical avant tout'],
    ['Asymétrie (≥ 15 dB sur deux fréquences voisines), acouphène unilatéral ou pulsatile', 'Avis ORL (imagerie possible)'],
    ['Vertiges associés', 'Avis médical'],
    ['Enfant : inquiétude parentale, retard de langage, méningite, traumatisme crânien', 'Bilan audiologique complet']
  ],
  pieges: ['Rassurer à tort après un test passé alors qu’un signe d’alerte est présent.'],
  retenir: 'Un signe d’alerte l’emporte toujours sur un test « passe ».',
  sim: 'balayage', video: 'protocole dépistage auditif bonnes pratiques',
  anim: [
    sc('Avant le test : environnement calme, matériel vérifié, questions sur les signes d’alerte.', SV.table(40, 50, ['Avant', ''], [['Bruit ambiant mesuré', '✓'], ['Casque et étalonnage vérifiés', '✓'], ['Écouteurs D / G vérifiés', '✓'], ['Signes d’alerte recherchés', '✓']], { cw: [220, 40] })),
    sc('Pendant : consigne et démonstration, intervalles variés, essais silencieux, retest de mille hertz.', SV.table(40, 50, ['Pendant', ''], [['Consigne + démonstration', '✓'], ['Intervalles variés', '✓'], ['Essais silencieux', '✓'], ['Retest 1000 Hz', '✓']], { cw: [220, 40] })),
    sc('Après : résultat expliqué sans diagnostic, compte rendu, orientation et relance. Un signe d’alerte l’emporte toujours sur un test réussi.', SV.table(40, 50, ['Après', ''], [['Passe / à contrôler expliqué', '✓'], ['Compte rendu remis', '✓'], ['Orientation précise', '✓'], ['Relance si besoin', '✓']], { cw: [220, 40] }))
  ],
  quiz: [{ q: 'Dépistage « passe » mais surdité brutale depuis hier :', o: ['Urgence ORL le jour même', 'Rassurer', 'Contrôle dans un an', 'Appareiller'], e: 'Le signe d’alerte prime.' }]
});
