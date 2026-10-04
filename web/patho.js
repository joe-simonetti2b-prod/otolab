/* ============ PATHOLOGIES & GÉNÉRATEUR DE PATIENTS ============ */
const SITES = {
  externe: 'Oreille externe', moyenne: 'Oreille moyenne', interne: 'Oreille interne',
  retro: 'Rétrocochléaire', mixte: 'Atteinte mixte', fonction: 'Sans lésion objectivée'
};
const CONDUITES = [
  { k: 'appareil', l: 'Appareillage conventionnel (sur prescription médicale)' },
  { k: 'orl', l: 'Avis ORL / bilan médical avant tout appareillage' },
  { k: 'urgence', l: 'Orientation ORL en urgence (le jour même)' },
  { k: 'implant', l: 'Orientation vers un centre d’implantation cochléaire' },
  { k: 'co', l: 'Solution CROS / BiCROS ou conduction osseuse' },
  { k: 'surveillance', l: 'Pas d’appareillage : conseils, protection, contrôle' }
];
const condLab = k => (CONDUITES.find(c => c.k === k) || {}).l;

const SH = {
  flat: v => F.map(() => v),
  slope: (a, b) => F.map((f, i) => a + (b - a) * i / 7),
  presb: v => [0.3, 0.35, 0.5, 0.8, 1, 1.1, 1.2, 1.3].map(k => k * v),
  notch: d => [0, 0, 0, 0.15, 0.6, 1, 0.7, 0.35].map(k => k * d),
  low: v => [1, 0.95, 0.6, 0.3, 0.2, 0.2, 0.25, 0.3].map(k => k * v),
  cookie: v => [0.3, 0.6, 1, 1, 0.8, 0.6, 0.45, 0.35].map(k => k * v),
  steep: v => [0, 0, 0, 0.15, 0.4, 0.7, 0.95, 1].map(k => k * v),
  hf: v => [0, 0.05, 0.2, 0.6, 0.85, 1, 1.05, 1.1].map(k => k * v),
  stiff: g => [1, 1, 0.8, 0.35, 0.45, 0.55, 0.6, 0.6].map(k => k * g),
  mass: g => [0.8, 0.85, 0.9, 1, 1, 1, 1, 1].map(k => k * g),
  lowgap: g => [1, 0.8, 0.4, 0, 0, 0, 0, 0].map(k => k * g),
  carhart: d => [0, 0.3, 0.5, 1, 0.6, 0.4, 0, 0].map(k => k * d)
};

const OTO_N = ['Tympan normal, nacré, triangle lumineux présent.', 'CAE libre, tympan d’aspect normal.', 'Tympan normal, reliefs ossiculaires visibles.'];
const FIRST_M = ['Ange', 'Jean-Baptiste', 'Paul-Antoine', 'Dominique', 'Pierre', 'Mathieu', 'Antoine', 'Laurent', 'Marc', 'Julien', 'Sébastien', 'Nicolas', 'Thomas', 'François', 'Michel', 'Bernard', 'Jacques', 'Joseph', 'André', 'Karim', 'Mehdi', 'Olivier', 'Christian', 'Toussaint', 'Lisandru', 'Ghjuvanni', 'Philippe', 'Alain', 'Patrick', 'Yves'];
const FIRST_F = ['Marie-Ange', 'Laetitia', 'Santa', 'Pascale', 'Catherine', 'Sylvie', 'Nathalie', 'Isabelle', 'Julie', 'Camille', 'Sandrine', 'Monique', 'Josette', 'Colette', 'Anne-Marie', 'Francesca', 'Maria', 'Nadia', 'Sophie', 'Valérie', 'Christine', 'Hélène', 'Céline', 'Élodie', 'Paula', 'Danielle', 'Jeanne', 'Anna', 'Fatima', 'Brigitte'];
const KID_M = ['Lucas', 'Hugo', 'Gabriel', 'Léo', 'Raphaël', 'Louis', 'Jules', 'Ange', 'Paul', 'Mattéo', 'Adam', 'Nolan', 'Sauveur', 'Petru', 'Ilyes', 'Timéo'];
const KID_F = ['Emma', 'Chloé', 'Manon', 'Jade', 'Inès', 'Lina', 'Alba', 'Léa', 'Lisa', 'Rose', 'Anna', 'Mia', 'Saveria', 'Livia', 'Nina', 'Zoé'];
const LAST = ['Santoni', 'Mattei', 'Leca', 'Casanova', 'Rossi', 'Ottaviani', 'Peretti', 'Luciani', 'Filippi', 'Giacomoni', 'Martin', 'Bernard', 'Dubois', 'Moreau', 'Girard', 'Fabre', 'Mercier', 'Blanc', 'Garcia', 'Martinez', 'Benali', 'Haddad', 'Nguyen', 'Lopez', 'Costa', 'Ferreira', 'Pietri', 'Paoli', 'Albertini', 'Agostini', 'Bartoli', 'Cristofari', 'Orsini', 'Franceschi', 'Vincenti', 'Poli'];
const CITIES = ['Bastia', 'Ajaccio', 'Corte', 'Porto-Vecchio', 'Calvi', 'L’Île-Rousse', 'Propriano', 'Biguglia', 'Borgo', 'Marseille', 'Nice', 'Toulon', 'Aix-en-Provence', 'Avignon', 'Fréjus', 'Antibes'];
const JOBS_N = ['comptable', 'enseignant(e)', 'infirmier(e)', 'commerçant(e)', 'secrétaire médicale', 'agent immobilier', 'fonctionnaire territorial', 'pharmacien(ne)', 'informaticien(ne)', 'vendeur(se)', 'aide-soignant(e)', 'cuisinier(e)', 'chauffeur de bus'];
const JOBS_B = ['maçon (BTP, marteau-piqueur)', 'militaire (armes à feu)', 'musicien(ne) de bal', 'agriculteur (tracteur, tronçonneuse)', 'ouvrier en carrière', 'mécanicien aéroportuaire', 'chaudronnier', 'DJ', 'bûcheron', 'employé(e) d’imprimerie'];
const JOBS_P = ['moniteur de plongée', 'pêcheur sous-marin', 'surfeur et maître-nageur', 'plongeur professionnel'];

/* ---------------- Bibliothèque ---------------- */
const PATHOS = [
  /* ===== OREILLE EXTERNE ===== */
  {
    id: 'bouchon', nom: 'Bouchon de cérumen obstructif', site: 'externe', ages: [5, 94], w: 5, lat: 'either', pedia: true,
    conduite: 'orl', fitAfterOrl: false,
    gen(c, add, sides) {
      sides.forEach(s => {
        add(s, 'cg', SH.slope(c.rng.range(10, 20), c.rng.range(20, 35)));
        c.tymp[s] = { type: 'B', peak: 0, comp: 0.1, ecv: c.rng.range(0.15, 0.4) };
        c.oto[s] = 'CAE obstrué par un bouchon brun compact, tympan non visible.';
      });
      c.hist.motif = 'Sensation d’oreille bouchée apparue après la douche';
      c.hist.symptoms.push('Baisse d’audition récente, quasi brutale', 'Autophonie (entend sa voix résonner)');
      c.hist.antecedents.push('Utilise des cotons-tiges quotidiennement');
    },
    fiche: {
      def: 'Accumulation de cérumen obstruant totalement le conduit auditif externe (CAE).',
      clin: 'Oreille bouchée souvent brutale (après la douche ou un bain : le cérumen gonfle), autophonie, parfois acouphènes ou vertiges légers. Favorisé par les cotons-tiges, les CAE étroits ou poilus et le port d’embouts.',
      audio: 'Surdité de transmission légère (10 à 35 dB), un peu plus marquée sur les aigus. Tympanogramme plat (type B) avec un volume équivalent faible, typique d’un conduit obstrué.',
      imp: 'Otoscopie systématique avant toute mesure et avant toute prise d’empreinte. Aucune audiométrie définitive tant que le conduit n’est pas libre.',
      cat: 'Retrait par un médecin (lavage, aspiration, curette). Refaire l’audiogramme après retrait.',
      proth: 'Chez le porteur d’aides auditives : contrôle et nettoyage réguliers, pare-cérumen à changer, conseil d’entretien. Penser au bouchon devant un « appareil qui ne marche plus ».'
    }
  },
  {
    id: 'otite_ext', nom: 'Otite externe aiguë', site: 'externe', ages: [8, 75], w: 2, lat: 'uni', pedia: true, job: 'eau',
    conduite: 'orl', fitAfterOrl: false,
    gen(c, add, sides) {
      const s = sides[0];
      add(s, 'cg', SH.flat(c.rng.range(8, 22)));
      c.tymp[s] = { type: 'NR' };
      c.oto[s] = 'CAE œdématié, rouge, sécrétions blanchâtres ; douleur vive à la pression du tragus, tympan mal visible.';
      c.hist.motif = 'Douleur d’oreille ' + sideName(s) + ' depuis 3 jours';
      c.hist.symptoms.push('Otalgie intense, réveillée par la mastication', 'Écoulement clair puis épais', 'Démangeaisons');
      c.hist.antecedents.push(c.rng.pick(['Baignades quotidiennes en mer cet été', 'Piscine trois fois par semaine', 'Grattage avec des cotons-tiges']));
    },
    fiche: {
      def: 'Infection (souvent Pseudomonas ou staphylocoque) de la peau du conduit auditif externe. Appelée aussi « otite du baigneur ».',
      clin: 'Douleur intense provoquée par la traction du pavillon ou la pression du tragus, conduit inflammatoire et rétréci, otorrhée, parfois adénopathie prétragienne. Facteurs : eau, chaleur, grattage, eczéma, embout occlusif.',
      audio: 'Transmission légère si le conduit est fermé par l’œdème. Tympanométrie souvent impossible à cause de la douleur.',
      imp: 'Ne jamais prendre d’empreinte ni insérer de dôme pendant l’épisode. Orienter vers le médecin (gouttes antibiotiques, antalgiques).',
      cat: 'Avis médical. Reprise du port de l’appareil après guérison.',
      proth: 'Chez un porteur : vérifier l’hygiène de l’embout, une possible allergie au matériau (passer à un embout silicone hypoallergénique ou ventilé), réduire l’occlusion.'
    }
  },
  {
    id: 'oe_necro', nom: 'Otite externe nécrosante (« maligne »)', site: 'externe', ages: [65, 92], w: 1.2, lat: 'uni', sexF: 0.3,
    conduite: 'urgence', fitAfterOrl: false,
    gen(c, add, sides) {
      const s = sides[0];
      add(s, 'cg', SH.flat(c.rng.range(10, 25)));
      c.tymp[s] = { type: 'NR' };
      c.oto[s] = 'Tissu de granulation sur le plancher du CAE, otorrhée purulente, conduit très douloureux.';
      c.hist.motif = 'Otorrhée ' + (s === 'R' ? 'droite' : 'gauche') + ' qui ne guérit pas depuis 5 semaines';
      c.hist.symptoms.push('Douleurs intenses, surtout la nuit', 'Gouttes antibiotiques sans effet');
      c.hist.antecedents.push('Diabète de type 2 mal équilibré');
      if (c.rng.chance(0.3)) c.hist.symptoms.push('Asymétrie récente du visage (paralysie faciale ?)');
    },
    fiche: {
      def: 'Ostéite de la base du crâne partant du conduit auditif externe, due le plus souvent à Pseudomonas aeruginosa, chez le diabétique âgé ou l’immunodéprimé.',
      clin: 'Otalgie intense à prédominance nocturne, otorrhée persistante malgré le traitement, tissu de granulation au plancher du CAE. Complications : paralysie faciale, atteinte d’autres nerfs crâniens, extension intracrânienne.',
      audio: 'Peu informative (transmission légère). Le diagnostic est clinique et radiologique.',
      imp: 'Signal d’alarme absolu : sujet âgé diabétique + otite externe qui traîne + douleur nocturne.',
      cat: 'Urgence ORL : hospitalisation, antibiothérapie prolongée, imagerie.',
      proth: 'Aucun appareillage de cette oreille pendant la prise en charge.'
    }
  },
  {
    id: 'exostoses', nom: 'Exostoses du conduit (oreille du surfeur)', site: 'externe', ages: [25, 70], w: 1.5, lat: 'bi', sexF: 0.2, job: 'plongee',
    conduite: 'orl', fitAfterOrl: true,
    gen(c, add, sides) {
      sides.forEach(s => {
        add(s, 'cg', SH.mass(c.rng.range(5, 22)));
        const obstr = c.rng.chance(0.5);
        c.tymp[s] = obstr ? { type: 'B', peak: 0, comp: 0.1, ecv: c.rng.range(0.4, 0.7) } : null;
        c.oto[s] = 'Plusieurs formations osseuses sessiles, lisses et blanchâtres, réduisant fortement la lumière du CAE' + (obstr ? ' ; tympan à peine visible.' : ' ; tympan visible en partie, normal.');
      });
      c.hist.motif = 'Oreilles qui se bouchent souvent après l’eau, otites externes à répétition';
      c.hist.symptoms.push('Eau qui reste piégée dans les oreilles', 'Baisse d’audition fluctuante');
      c.hist.antecedents.push('Pratique la plongée / le surf en eau fraîche depuis plus de 15 ans');
    },
    fiche: {
      def: 'Hyperostoses osseuses sessiles et multiples du conduit osseux, liées à l’exposition répétée à l’eau froide et au vent. Bilatérales le plus souvent. À distinguer de l’ostéome, unique et pédiculé.',
      clin: 'Rétention d’eau et de cérumen, otites externes à répétition, oreille bouchée. Très fréquentes chez les surfeurs, plongeurs et pêcheurs sous-marins.',
      audio: 'Audition normale tant que la lumière persiste ; transmission légère si obstruction (bouchon associé).',
      imp: 'Prise d’empreinte délicate : risque de blocage de la pâte derrière les exostoses. Otoscopie attentive, coton protecteur bien placé, pâte souple.',
      cat: 'Avis ORL si obstruction ou infections répétées (canaloplastie). Protection : bouchons de baignade, cagoule.',
      proth: 'Embouts courts ou dômes de petite taille, éviter l’occlusion qui entretient l’humidité.'
    }
  },
  {
    id: 'atresie', nom: 'Aplasie majeure / atrésie du conduit', site: 'externe', ages: [0.3, 30], w: 1.2, lat: 'uni', pedia: true,
    conduite: 'co', fitAfterOrl: false, latBiChance: 0.2,
    gen(c, add, sides) {
      sides.forEach(s => {
        add(s, 'cg', SH.flat(c.rng.range(48, 60)));
        c.tymp[s] = { type: 'NR' };
        c.oto[s] = 'Microtie (pavillon malformé), absence de conduit auditif externe visible.';
      });
      c.hist.motif = c.age < 16 ? 'Suivi d’une malformation d’oreille constatée à la naissance' : 'Souhaite améliorer son audition, malformation d’oreille depuis la naissance';
      c.hist.symptoms.push(sides.length > 1 ? 'Retentissement sur le langage signalé par l’école' : 'Gêne pour localiser les sons et dans le bruit');
      c.hist.antecedents.push('Scanner des rochers réalisé : chaîne ossiculaire malformée, oreille interne normale');
    },
    fiche: {
      def: 'Malformation congénitale de l’oreille externe et moyenne : absence de conduit (atrésie), souvent associée à une microtie et une malformation ossiculaire. L’oreille interne est le plus souvent normale.',
      clin: 'Visible dès la naissance. Unilatérale dans la majorité des cas. Peut s’intégrer à un syndrome (Treacher Collins, Goldenhar…).',
      audio: 'Surdité de transmission maximale (50 à 60 dB), conduction osseuse normale. Tympanométrie impossible.',
      imp: 'Une aide auditive en conduction aérienne est impossible faute de conduit : la voie osseuse est la solution.',
      cat: 'Prothèse à conduction osseuse : sur bandeau souple (softband) chez le petit enfant, puis implant à ancrage osseux ou dispositif transcutané selon l’âge et l’avis de l’équipe. En bilatéral, appareillage précoce indispensable pour le langage.',
      proth: 'Réglage spécifique conduction osseuse (mesures en couplage osseux), suivi rapproché chez l’enfant.'
    }
  },
  {
    id: 'corps_etr', nom: 'Corps étranger du conduit', site: 'externe', ages: [2, 10], w: 1, lat: 'uni', pedia: true, adult: false,
    conduite: 'orl', fitAfterOrl: false,
    gen(c, add, sides) {
      const s = sides[0];
      add(s, 'cg', SH.flat(c.rng.range(10, 25)));
      c.tymp[s] = { type: 'NR' };
      c.oto[s] = 'Corps étranger ' + c.rng.pick(['rond et coloré (perle)', 'végétal (graine)', 'en mousse']) + ' au fond du CAE.';
      c.hist.motif = 'L’enfant se plaint d’entendre moins bien de l’oreille ' + sideName(s);
      c.hist.symptoms.push('Se gratte l’oreille depuis quelques jours');
    },
    fiche: {
      def: 'Objet introduit dans le conduit, fréquent chez l’enfant (perle, graine, gomme, mousse).',
      clin: 'Gêne, douleur, parfois otorrhée si l’objet est ancien.',
      audio: 'Transmission légère, unilatérale.',
      imp: 'Ne pas tenter de retrait soi-même. Ne pas laver si le corps étranger est végétal : il gonfle avec l’eau.',
      cat: 'Retrait médical (ORL ou médecin équipé).',
      proth: 'Sans objet. Penser aux piles bouton : leur ingestion ou leur introduction est une urgence.'
    }
  },

  /* ===== OREILLE MOYENNE ===== */
  {
    id: 'osm', nom: 'Otite séromuqueuse', site: 'moyenne', ages: [1.5, 75], w: 5, lat: 'either', pedia: true,
    conduite: 'orl', fitAfterOrl: false,
    gen(c, add, sides) {
      const kid = c.age < 16;
      if (!kid && sides.length > 1) sides.splice(1);
      sides.forEach(s => {
        add(s, 'cg', SH.mass(c.rng.range(18, 35)));
        c.tymp[s] = { type: 'B', peak: 0, comp: 0.1, ecv: kid ? c.rng.range(0.5, 0.9) : c.rng.range(0.9, 1.4) };
        c.oto[s] = c.rng.pick(['Tympan mat, rétracté, de couleur ambrée.', 'Tympan bombé, jaune ambré, niveau liquidien et bulles visibles.', 'Tympan terne et rétracté, manche du marteau horizontalisé.']);
      });
      if (kid) {
        c.hist.motif = 'L’enseignante signale que l’enfant « n’écoute pas » et monte le son de la télévision';
        c.hist.symptoms.push('Rhinopharyngites à répétition cet hiver', 'Ronfle la nuit');
        c.hist.antecedents.push('Plusieurs otites moyennes aiguës depuis la crèche');
      } else {
        c.hist.motif = 'Oreille ' + sideName(sides[0]) + ' pleine depuis deux mois';
        c.hist.symptoms.push('Plénitude unilatérale', 'Saignements de nez occasionnels', 'Obstruction nasale du même côté');
        c.hist.antecedents.push('Aucun antécédent otologique');
      }
    },
    fiche: {
      def: 'Épanchement liquidien dans la caisse du tympan, sans signe d’infection aiguë, lié à un dysfonctionnement tubaire.',
      clin: 'Pic de fréquence entre 2 et 5 ans (rhinopharyngites, végétations). Enfant « inattentif », retard ou stagnation du langage. Chez l’adulte, une OSM unilatérale impose d’éliminer une tumeur du cavum (nasofibroscopie).',
      audio: 'Surdité de transmission de 20 à 40 dB, assez plate. Tympanogramme plat (type B) avec volume du conduit normal. Réflexes stapédiens absents. OEA absentes.',
      imp: 'Ne pas appareiller sans avis ORL : la cause se traite. Un tympanogramme B avec volume normal oriente vers l’épanchement ; avec volume élevé, vers une perforation ou un aérateur perméable.',
      cat: 'Avis ORL. Surveillance (guérison spontanée fréquente) ; si OSM bilatérale de plus de 3 mois avec retentissement : aérateurs transtympaniques ± adénoïdectomie. Adulte unilatéral : nasofibroscopie.',
      proth: 'Appareillage transitoire rare, discuté en cas d’OSM chronique chez l’enfant avec retentissement sur le langage et contre-indication chirurgicale.'
    }
  },
  {
    id: 'tubaire', nom: 'Dysfonction tubaire', site: 'moyenne', ages: [5, 60], w: 2, lat: 'either', pedia: true,
    conduite: 'orl', fitAfterOrl: false,
    gen(c, add, sides) {
      sides.forEach(s => {
        add(s, 'cg', SH.lowgap(c.rng.range(8, 18)));
        c.tymp[s] = { type: 'C', peak: -c.rng.range(150, 320), comp: c.rng.range(0.3, 0.7), ecv: c.age < 16 ? 0.7 : 1.2 };
        c.oto[s] = 'Tympan rétracté, relief du manche du marteau marqué, mobilité réduite au Siegle.';
      });
      c.hist.motif = 'Oreilles qui se bouchent, surtout en avion et lors des rhumes';
      c.hist.symptoms.push('Autophonie', 'Craquements à la déglutition');
      c.hist.antecedents.push('Rhinite allergique saisonnière');
    },
    fiche: {
      def: 'Défaut d’ouverture de la trompe d’Eustache qui ne ventile plus correctement la caisse : dépression dans l’oreille moyenne.',
      clin: 'Oreille pleine, autophonie, craquements, gêne aux changements d’altitude. Terrain : rhinite, allergie, reflux, végétations.',
      audio: 'Transmission légère, surtout sur les graves. Tympanogramme de type C (pic décalé vers les pressions négatives, au-delà de −100 daPa).',
      imp: 'Peut évoluer vers l’otite séromuqueuse ou la poche de rétraction. Ne justifie pas un appareillage.',
      cat: 'Avis ORL : traitement de la cause, manœuvres d’autoinsufflation, parfois dilatation tubaire.',
      proth: 'Sans objet. Chez un porteur, un embout occlusif peut majorer l’inconfort : privilégier l’évent.'
    }
  },
  {
    id: 'perforation', nom: 'Perforation tympanique', site: 'moyenne', ages: [10, 75], w: 2.5, lat: 'uni', pedia: true,
    conduite: 'orl', fitAfterOrl: true,
    gen(c, add, sides) {
      const s = sides[0];
      add(s, 'cg', SH.slope(c.rng.range(20, 35), c.rng.range(10, 20)));
      c.tymp[s] = { type: 'B', peak: 0, comp: 0.1, ecv: c.rng.range(2.3, 4.8) };
      c.oto[s] = c.rng.pick(['Perforation centrale non marginale du quadrant antéro-inférieur, caisse sèche.', 'Perforation réniforme d’environ un tiers de la membrane, muqueuse de la caisse rosée et sèche.']);
      c.hist.motif = 'Entend moins bien de l’oreille ' + sideName(s) + ' depuis longtemps';
      c.hist.symptoms.push('Écoulements intermittents après les baignades');
      c.hist.antecedents.push(c.rng.pick(['Otites à répétition dans l’enfance', 'Gifle reçue il y a plusieurs années', 'Aérateurs posés dans l’enfance']));
    },
    fiche: {
      def: 'Ouverture de la membrane tympanique, séquelle d’otite, de traumatisme ou d’aérateur.',
      clin: 'Hypoacousie, otorrhées à l’eau. Une perforation marginale ou attico-postérieure doit faire craindre un cholestéatome.',
      audio: 'Transmission de 15 à 40 dB selon la taille et la localisation, souvent plus marquée sur les graves. Tympanogramme plat avec volume élevé (souvent > 2 ml chez l’adulte) : la sonde mesure le conduit et la caisse.',
      imp: 'Prise d’empreinte avec grande prudence (protection soigneuse, pâte peu fluide) ou après avis ORL.',
      cat: 'Avis ORL : myringoplastie ou tympanoplastie selon le contexte. Appareillage possible si oreille sèche.',
      proth: 'Embout ventilé ou dôme ouvert pour limiter la macération, surveillance des otorrhées. Gain à adapter à la composante transmissionnelle.'
    }
  },
  {
    id: 'cholesteatome', nom: 'Cholestéatome', site: 'moyenne', ages: [8, 65], w: 1.8, lat: 'uni', pedia: true,
    conduite: 'orl', fitAfterOrl: false,
    gen(c, add, sides) {
      const s = sides[0];
      add(s, 'cg', SH.mass(c.rng.range(25, 45)));
      if (c.rng.chance(0.5)) add(s, 'sn', SH.hf(c.rng.range(5, 25)));
      c.tymp[s] = { type: 'B', peak: 0, comp: 0.1, ecv: c.rng.range(0.8, 1.5) };
      c.oto[s] = 'Poche de rétraction attique remplie de squames blanchâtres, otorrhée fétide.';
      c.hist.motif = 'Écoulement malodorant de l’oreille ' + sideName(s) + ' depuis plusieurs mois';
      c.hist.symptoms.push('Baisse d’audition progressive du même côté', c.rng.pick(['Vertiges brefs en appuyant sur le tragus', 'Pas de douleur']));
      c.hist.antecedents.push('Otites chroniques depuis l’enfance');
    },
    fiche: {
      def: 'Présence d’épithélium malpighien kératinisant dans l’oreille moyenne, à l’origine d’une ostéolyse progressive.',
      clin: 'Otorrhée chronique fétide, hypoacousie progressive. Complications : destruction ossiculaire, fistule labyrinthique (vertige à la pression du tragus), paralysie faciale, labyrinthite, méningite.',
      audio: 'Transmission souvent importante, parfois mixte si le labyrinthe est atteint.',
      imp: 'Toute otorrhée chronique fétide ou poche de rétraction avec squames impose un avis ORL rapide. Pas d’empreinte.',
      cat: 'Traitement exclusivement chirurgical, surveillance à long terme (récidives).',
      proth: 'Appareillage éventuel après chirurgie, oreille sèche ; parfois conduction osseuse si cavité d’évidement humide.'
    }
  },
  {
    id: 'otospongiose', nom: 'Otospongiose', site: 'moyenne', ages: [20, 58], w: 4, lat: 'either', sexF: 0.68, latBiChance: 0.75,
    conduite: c => c.prescribed ? 'appareil' : 'orl', presc: 0.4, fitAfterOrl: true,
    gen(c, add, sides) {
      sides.forEach((s, k) => {
        const g = c.rng.range(20, 45) * (k ? c.rng.range(0.6, 1) : 1);
        add(s, 'cg', SH.stiff(g));
        add(s, 'bcx', SH.carhart(c.rng.range(10, 18)));
        if (c.age > 45 && c.rng.chance(0.35)) add(s, 'sn', SH.hf(c.rng.range(10, 25)));
        c.tymp[s] = c.rng.chance(0.55) ? { type: 'As', peak: c.rng.range(-40, 10), comp: c.rng.range(0.15, 0.3), ecv: 1.3 } : { type: 'A', peak: c.rng.range(-30, 10), comp: c.rng.range(0.35, 0.6), ecv: 1.3 };
        c.reflex[s] = 'absent';
        c.oto[s] = 'Tympan normal, mobile.';
      });
      c.hist.motif = 'Baisse d’audition progressive depuis quelques années';
      c.hist.symptoms.push('Entend mieux dans le bruit (paracousie de Willis)', 'Acouphènes graves');
      c.hist.antecedents.push(c.rng.pick(['Mère appareillée à 40 ans', 'Aggravation pendant la dernière grossesse', 'Sœur opérée des oreilles']));
      if (c.prescribed) c.hist.misc.push('Le patient ne souhaite pas l’intervention chirurgicale pour l’instant.');
    },
    fiche: {
      def: 'Ostéodystrophie de la capsule otique entraînant l’ankylose de la platine de l’étrier dans la fenêtre ovale.',
      clin: 'Femme de 20 à 40 ans le plus souvent, hérédité (autosomique dominante à pénétrance incomplète), aggravation lors des grossesses, bilatérale dans 70 à 80 % des cas. Paracousie de Willis, acouphènes. Tympan normal.',
      audio: 'Surdité de transmission prédominant sur les graves (courbe « de rigidité »), encoche de Carhart sur la CO vers 2 kHz, réflexes stapédiens abolis (effet on-off au début). Tympanogramme A ou As. Rinne négatif, Weber latéralisé du côté le plus atteint, Gellé négatif.',
      imp: 'Un audiogramme de transmission à tympan normal évoque d’abord ce diagnostic. Formes évoluées : composante cochléaire (surdité mixte).',
      cat: 'Avis ORL : stapédotomie ou appareillage selon le choix du patient. Les deux options sont légitimes.',
      proth: 'Excellente indication : intelligibilité conservée, peu de compression nécessaire, gain plus élevé sur les graves (cibles corrigées de la composante de transmission). Couplage plutôt fermé.'
    }
  },
  {
    id: 'tympanosclerose', nom: 'Tympanosclérose', site: 'moyenne', ages: [20, 75], w: 1.5, lat: 'either',
    conduite: c => c.prescribed ? 'appareil' : 'orl', presc: 0.6, fitAfterOrl: true,
    gen(c, add, sides) {
      sides.forEach(s => {
        add(s, 'cg', SH.mass(c.rng.range(12, 30)));
        c.tymp[s] = { type: 'As', peak: c.rng.range(-50, 0), comp: c.rng.range(0.12, 0.28), ecv: 1.3 };
        c.oto[s] = 'Plaques blanches crayeuses dans l’épaisseur du tympan, membrane fermée.';
      });
      c.hist.motif = 'Gêne auditive ancienne, s’aggrave lentement';
      c.hist.antecedents.push('Nombreuses otites dans l’enfance, aérateurs posés à 4 ans');
    },
    fiche: {
      def: 'Dépôts hyalins calcifiés, séquelles d’inflammations chroniques, dans le tympan (myringosclérose) et parfois dans la caisse autour des osselets.',
      clin: 'La myringosclérose isolée est souvent sans conséquence. L’atteinte de la chaîne ossiculaire entraîne une hypoacousie de transmission.',
      audio: 'Transmission de 10 à 35 dB, tympanogramme de faible compliance (As).',
      imp: 'Oreille sèche, tympan fermé : bonne condition pour appareiller une fois le bilan ORL fait.',
      cat: 'Avis ORL (chirurgie aux résultats inconstants). Appareillage fréquent.',
      proth: 'Bonne indication, couplage plutôt fermé, compression faible.'
    }
  },
  {
    id: 'luxation', nom: 'Luxation / disjonction ossiculaire', site: 'moyenne', ages: [15, 65], w: 1.2, lat: 'uni',
    conduite: 'orl', fitAfterOrl: true,
    gen(c, add, sides) {
      const s = sides[0];
      add(s, 'cg', SH.flat(c.rng.range(42, 58)));
      c.tymp[s] = { type: 'Ad', peak: c.rng.range(-30, 10), comp: c.rng.range(1.9, 3.2), ecv: 1.4 };
      c.reflex[s] = 'absent';
      c.oto[s] = c.rng.pick(['Tympan normal, très mobile au Siegle.', 'Fine cicatrice tympanique, membrane flaccide.']);
      c.hist.motif = 'Baisse d’audition de l’oreille ' + sideName(s) + ' depuis un traumatisme';
      c.hist.antecedents.push(c.rng.pick(['Chute à vélo avec choc sur la tempe il y a 4 mois', 'Gifle reçue lors d’une altercation', 'Coton-tige enfoncé brutalement']));
    },
    fiche: {
      def: 'Rupture de la continuité de la chaîne ossiculaire, le plus souvent disjonction incudo-stapédienne, après traumatisme ou infection chronique.',
      clin: 'Hypoacousie unilatérale après un traumatisme crânien, une gifle, un barotraumatisme ou un coton-tige.',
      audio: 'Transmission maximale plate (50 à 60 dB), CO normale. Tympanogramme Ad (compliance très élevée). Réflexes absents.',
      imp: 'Écart aérien-osseux de 50 à 60 dB avec tympan fermé et Ad : penser disjonction.',
      cat: 'Avis ORL : ossiculoplastie, ou appareillage si refus ou contre-indication.',
      proth: 'Appareillage efficace en raison d’une cochlée intacte : gain élevé, compression faible.'
    }
  },
  {
    id: 'barotrauma', nom: 'Barotraumatisme de l’oreille', site: 'moyenne', ages: [18, 62], w: 1.5, lat: 'uni', job: 'plongee',
    conduite: c => c.flags.inner ? 'urgence' : 'orl', fitAfterOrl: false,
    gen(c, add, sides) {
      const s = sides[0];
      add(s, 'cg', SH.mass(c.rng.range(10, 25)));
      c.flags.inner = c.rng.chance(0.35);
      if (c.flags.inner) add(s, 'sn', SH.slope(c.rng.range(20, 40), c.rng.range(35, 55)));
      c.tymp[s] = c.rng.chance(0.5) ? { type: 'B', peak: 0, comp: 0.1, ecv: 1.2 } : { type: 'C', peak: -c.rng.range(180, 300), comp: 0.4, ecv: 1.2 };
      c.oto[s] = c.rng.pick(['Tympan congestif, hémotympan (caisse bleutée).', 'Tympan rouge et rétracté, petites pétéchies.']);
      c.hist.motif = 'Oreille ' + sideName(s) + ' bouchée depuis une plongée il y a 2 jours';
      c.hist.symptoms.push('Difficulté à équilibrer lors de la descente');
      if (c.flags.inner) c.hist.symptoms.push('Vertiges et acouphène sifflant depuis la remontée');
    },
    fiche: {
      def: 'Lésions de l’oreille dues à une variation de pression non compensée (plongée, avion). Atteinte de l’oreille moyenne (la plus fréquente) ou de l’oreille interne (fistule périlymphatique).',
      clin: 'Douleur à la descente, oreille bouchée, hémotympan, parfois perforation. Vertiges, acouphènes et surdité de perception signent l’atteinte de l’oreille interne.',
      audio: 'Transmission légère dans la forme moyenne. Une composante de perception change totalement la conduite.',
      imp: 'Plongeur + surdité de perception ou vertiges = urgence (barotraumatisme de l’oreille interne ou accident de décompression).',
      cat: 'Forme oreille moyenne : avis ORL, arrêt de la plongée, décongestion. Forme oreille interne : urgence.',
      proth: 'Sans objet à la phase aiguë.'
    }
  },

  /* ===== MIXTE ===== */
  {
    id: 'omc_seq', nom: 'Otite chronique séquellaire (surdité mixte)', site: 'mixte', ages: [45, 88], w: 2.5, lat: 'either',
    conduite: c => c.prescribed ? 'appareil' : 'orl', presc: 0.7, fitAfterOrl: true,
    gen(c, add, sides) {
      sides.forEach(s => {
        add(s, 'cg', SH.mass(c.rng.range(18, 32)));
        add(s, 'sn', SH.presb(c.rng.range(10, 30)));
        const perf = c.rng.chance(0.4);
        c.tymp[s] = perf ? { type: 'B', peak: 0, comp: 0.1, ecv: c.rng.range(2.4, 4) } : { type: 'As', peak: -40, comp: 0.2, ecv: 1.3 };
        c.oto[s] = perf ? 'Perforation sèche ancienne, caisse calme.' : 'Tympan cicatriciel, plaques de myringosclérose, membrane fermée.';
      });
      c.hist.motif = 'Gêne auditive importante, souhaite être appareillé(e)';
      c.hist.antecedents.push('Otites chroniques dans la jeunesse, opéré(e) d’une oreille il y a 30 ans');
    },
    fiche: {
      def: 'Association d’une atteinte transmissionnelle séquellaire (tympan, osselets) et d’une atteinte cochléaire (âge, toxicité de l’inflammation chronique).',
      clin: 'Hypoacousie ancienne, antécédents d’otites ou de chirurgie, oreille actuellement sèche.',
      audio: 'Surdité mixte : CO abaissée et écart aérien-osseux persistant.',
      imp: 'Vérifier l’absence d’otorrhée active avant empreinte. Composante de transmission = plus de gain, moins de compression.',
      cat: 'Avis ORL si non suivi ; appareillage sinon.',
      proth: 'Embout ventilé si perforation, gain augmenté d’environ un quart de l’écart aérien-osseux, MPO plus élevé, conduction osseuse si écart très important ou oreille humide.'
    }
  },

  /* ===== OREILLE INTERNE ===== */
  {
    id: 'presby', nom: 'Presbyacousie', site: 'interne', ages: [60, 94], w: 12, lat: 'bi',
    conduite: c => (Math.max(c.biap.R, c.biap.L) < 28 ? 'surveillance' : 'appareil'), presc: 0.75, fitAfterOrl: true,
    gen(c, add, sides) {
      const v = c.rng.range(0, 35);
      sides.forEach(s => add(s, 'sn', SH.presb(v + c.rng.range(-5, 5))));
      c.hist.motif = c.rng.pick(['Son entourage lui reproche de monter le son de la télévision', 'Difficultés lors des repas de famille', 'Fait répéter de plus en plus souvent']);
      c.hist.symptoms.push('Comprend mal dans le bruit', c.rng.pick(['Acouphènes aigus intermittents', 'Pas d’acouphènes', 'Sifflement permanent dans les deux oreilles']));
      if (c.rng.chance(0.4)) c.hist.symptoms.push('« J’entends, mais je ne comprends pas »');
    },
    fiche: {
      def: 'Surdité de perception liée au vieillissement de la cochlée (cellules ciliées, strie vasculaire) et des voies auditives.',
      clin: 'Bilatérale, symétrique, progressive. Gêne d’abord dans le bruit et en groupe, puis au calme. Acouphènes fréquents. Retentissement social et cognitif : la perte auditive non corrigée est un facteur de risque modifiable de déclin cognitif.',
      audio: 'Courbe descendante sur les aigus, CO superposée à la CA. Recrutement (réflexes présents à faible écart de seuil). Intelligibilité diminuée, surtout dans le bruit.',
      imp: 'Toute asymétrie supérieure à 15 dB sur deux fréquences n’est pas une presbyacousie simple : orienter vers l’ORL.',
      cat: 'Appareillage bilatéral sur prescription médicale. Accompagnement, entraînement auditif, stratégies de communication.',
      proth: 'Formules NAL-NL2 ou fabricant. Dômes ouverts si les graves sont préservés (≤ 30 dB), compression adaptée au recrutement, réducteurs de bruit et directivité, programmes simples.'
    }
  },
  {
    id: 'trauma_chr', nom: 'Traumatisme sonore chronique', site: 'interne', ages: [35, 75], w: 6, lat: 'bi', sexF: 0.15, job: 'bruit',
    conduite: c => (Math.max(c.biap.R, c.biap.L) < 28 ? 'surveillance' : 'appareil'), presc: 0.7, fitAfterOrl: true,
    gen(c, add, sides) {
      const d = c.rng.range(20, 50);
      const shooter = /militaire|chass/.test(c.job) || c.rng.chance(0.15);
      sides.forEach(s => {
        let k = 1;
        if (shooter) k = s === 'L' ? 1.25 : 0.8;
        add(s, 'sn', SH.notch(d * k));
        if (c.age > 55) add(s, 'sn', SH.hf(c.rng.range(5, 20)));
      });
      if (shooter) c.hist.antecedents.push('Chasseur depuis 30 ans, tire de l’épaule droite');
      c.hist.motif = 'Acouphènes aigus et difficultés en réunion';
      c.hist.symptoms.push('Sifflement aigu bilatéral permanent', 'Ne portait pas de protections auditives');
    },
    fiche: {
      def: 'Surdité de perception due à une exposition prolongée au bruit (en France, actions obligatoires dès 80 dB(A) sur 8 h, valeur limite 87 dB(A)). Maladie professionnelle (tableau 42 du régime général).',
      clin: 'Acouphènes aigus, gêne dans le bruit. Irréversible. Le tir à l’arme d’épaule atteint davantage l’oreille opposée à l’épaule de tir (oreille gauche chez un droitier).',
      audio: 'Scotome (encoche) centré sur 4 kHz (entre 3 et 6 kHz) avec remontée à 8 kHz, bilatéral et souvent symétrique ; extension aux fréquences voisines avec le temps.',
      imp: 'La remontée à 8 kHz distingue l’encoche traumatique de la pente de la presbyacousie. Conseil systématique de protection (bouchons moulés filtrés).',
      cat: 'Protection auditive, surveillance ; appareillage si gêne et perte suffisante. Déclaration de maladie professionnelle selon le contexte.',
      proth: 'Dômes ouverts, gain concentré sur 2–6 kHz, attention au larsen. Générateur de bruit ou thérapie sonore pour les acouphènes.'
    }
  },
  {
    id: 'trauma_aigu', nom: 'Traumatisme sonore aigu', site: 'interne', ages: [15, 45], w: 2, lat: 'either',
    conduite: 'urgence', fitAfterOrl: false,
    gen(c, add, sides) {
      sides.forEach(s => add(s, 'sn', SH.notch(c.rng.range(30, 55))));
      c.hist.motif = c.rng.pick(['Sifflement et oreilles cotonneuses depuis un concert avant-hier', 'Acouphène permanent depuis l’explosion d’un pétard tout près de l’oreille hier soir', 'Tir sans protection au stand hier']);
      c.hist.symptoms.push('Acouphène aigu permanent', 'Sensation d’oreille cotonneuse', 'Hyperacousie (sons forts douloureux)');
    },
    fiche: {
      def: 'Lésion cochléaire après exposition brève à un bruit très intense (explosion, tir, concert).',
      clin: 'Acouphène aigu, oreille cotonneuse, hyperacousie dans les suites immédiates.',
      audio: 'Scotome autour de 4 kHz, uni ou bilatéral.',
      imp: 'La récupération est meilleure si le traitement débute tôt (dans les 24 à 48 h).',
      cat: 'Urgence ORL (corticothérapie selon avis), repos sonore. Prévention pour l’avenir.',
      proth: 'Protections sur mesure pour l’avenir (musiciens, tireurs).'
    }
  },
  {
    id: 'brusque', nom: 'Surdité brusque', site: 'interne', ages: [28, 75], w: 3, lat: 'uni',
    conduite: 'urgence', fitAfterOrl: false,
    gen(c, add, sides) {
      const s = sides[0];
      const form = c.rng.pick(['flat', 'low', 'hf', 'flat']);
      const v = c.rng.range(40, 85);
      add(s, 'sn', form === 'flat' ? SH.flat(v) : form === 'low' ? SH.low(v) : SH.hf(v));
      c.disc[s] = clamp(Math.round(c.rng.range(20, 70)), 0, 100);
      c.hist.motif = 'Oreille ' + sideName(s) + ' « éteinte » au réveil ' + c.rng.pick(['ce matin', 'hier', 'il y a 3 jours']);
      c.hist.symptoms.push('Plénitude d’oreille', 'Acouphène unilatéral', c.rng.chance(0.3) ? 'Vertiges le premier jour' : 'Pas de vertige');
    },
    fiche: {
      def: 'Surdité de perception d’installation rapide (en moins de 72 h), le plus souvent unilatérale et idiopathique (hypothèses vasculaire, virale).',
      clin: 'Oreille « éteinte » au réveil, plénitude, acouphène, parfois vertiges (pronostic moins bon).',
      audio: 'Perte de perception unilatérale de forme variable (plate, graves, aigus), tympanogramme normal.',
      imp: 'Urgence : plus le traitement est précoce, meilleure est la récupération. Une IRM est demandée pour éliminer un schwannome vestibulaire.',
      cat: 'Orientation ORL le jour même.',
      proth: 'Si séquelle : appareillage, CROS ou implant selon la perte résiduelle et l’oreille controlatérale.'
    }
  },
  {
    id: 'meniere', nom: 'Maladie de Ménière', site: 'interne', ages: [30, 65], w: 2.5, lat: 'uni',
    conduite: c => c.prescribed ? 'appareil' : 'orl', presc: 0.4, fitAfterOrl: true,
    gen(c, add, sides) {
      const s = sides[0];
      add(s, 'sn', SH.low(c.rng.range(30, 60)));
      if (c.rng.chance(0.3)) add(s, 'sn', SH.flat(c.rng.range(5, 15)));
      c.hist.motif = 'Crises de vertiges et baisse d’audition de l’oreille ' + sideName(s);
      c.hist.symptoms.push('Grands vertiges rotatoires de 30 min à plusieurs heures avec vomissements', 'Bourdonnement grave et oreille pleine avant les crises', 'Audition qui fluctue d’un jour à l’autre');
    },
    fiche: {
      def: 'Hydrops endolymphatique (excès d’endolymphe) idiopathique, le plus souvent unilatéral au début.',
      clin: 'Triade : crises de vertige rotatoire (20 min à 12 h), surdité de perception fluctuante, acouphène grave ; plus la plénitude d’oreille. Évolue par crises vers une surdité plus plate et définitive.',
      audio: 'Perte de perception sur les graves (courbe ascendante), fluctuante. Recrutement marqué, distorsions (diplacousie).',
      imp: 'Audiogramme à refaire : les seuils varient. La fluctuation complique l’appareillage.',
      cat: 'Avis ORL si non diagnostiquée. Appareillage possible sur prescription une fois le diagnostic posé.',
      proth: 'Gain sur les graves, couplage plus fermé (perte grave), compression forte, plusieurs programmes ou réglages de volume larges pour suivre les fluctuations.'
    }
  },
  {
    id: 'neurinome', nom: 'Schwannome vestibulaire (neurinome de l’acoustique)', site: 'retro', ages: [38, 72], w: 2.2, lat: 'uni',
    conduite: 'orl', fitAfterOrl: false,
    gen(c, add, sides) {
      const s = sides[0];
      add(s, 'sn', SH.hf(c.rng.range(20, 55)));
      add(s, 'sn', SH.flat(c.rng.range(0, 10)));
      c.disc[s] = Math.round(c.rng.range(25, 60));
      c.reflex[s] = c.rng.chance(0.5) ? 'absent' : 'fatigable';
      c.hist.motif = 'Entend moins bien au téléphone avec l’oreille ' + sideName(s);
      c.hist.symptoms.push('Acouphène unilatéral permanent', 'Légère instabilité');
    },
    fiche: {
      def: 'Tumeur bénigne développée sur la gaine de Schwann du nerf vestibulaire, dans le conduit auditif interne. Bilatérale dans la neurofibromatose de type 2.',
      clin: 'Surdité unilatérale progressive, acouphène unilatéral, instabilité, parfois surdité brusque inaugurale.',
      audio: 'Perte de perception asymétrique, intelligibilité effondrée par rapport à la tonale (atteinte rétrocochléaire), réflexes stapédiens absents ou fatigables (decay), allongement des latences aux PEA.',
      imp: 'Toute asymétrie inexpliquée (≥ 15 dB sur deux fréquences) ou tout acouphène unilatéral doit être adressé à l’ORL pour une IRM avant d’appareiller.',
      cat: 'Avis ORL, IRM. Surveillance, radiochirurgie ou chirurgie selon la taille.',
      proth: 'Bénéfice souvent limité par la mauvaise intelligibilité ; CROS si l’oreille devient non fonctionnelle.'
    }
  },
  {
    id: 'ototox', nom: 'Surdité ototoxique', site: 'interne', ages: [20, 78], w: 1.8, lat: 'bi',
    conduite: 'appareil', presc: 1, fitAfterOrl: true,
    gen(c, add, sides) {
      const v = c.rng.range(50, 80);
      sides.forEach(s => add(s, 'sn', SH.steep(v + c.rng.range(-5, 5))));
      c.hist.motif = 'Gêne apparue après un traitement médical lourd';
      c.hist.antecedents.push(c.rng.pick(['Chimiothérapie par cisplatine il y a un an', 'Traitement par gentamicine lors d’une infection grave', 'Traitement par amikacine pour une infection pulmonaire']));
      c.hist.symptoms.push('Acouphènes aigus bilatéraux');
    },
    fiche: {
      def: 'Atteinte cochléaire (et parfois vestibulaire) d’origine médicamenteuse : aminosides, cisplatine, certains diurétiques de l’anse à fortes doses, macrolides à forte dose (réversible).',
      clin: 'Bilatérale, symétrique, débutant par les très hautes fréquences ; acouphènes. Les aminosides peuvent aussi détruire le vestibule (instabilité, oscillopsies).',
      audio: 'Pente raide sur les aigus, débutant au-delà de 4 kHz. Une audiométrie haute fréquence (jusqu’à 16 kHz) permet un dépistage précoce pendant le traitement.',
      imp: 'Le suivi audiométrique pendant un traitement ototoxique est un rôle de prévention.',
      cat: 'Appareillage sur prescription.',
      proth: 'Pentes raides : dômes ouverts si graves normaux, fort gain aigu à surveiller (larsen), éventuellement abaissement fréquentiel si zones mortes.'
    }
  },
  {
    id: 'genet_adulte', nom: 'Surdité héréditaire évolutive de l’adulte jeune', site: 'interne', ages: [18, 50], w: 2, lat: 'bi',
    conduite: c => c.prescribed ? 'appareil' : 'orl', presc: 0.6, fitAfterOrl: true,
    gen(c, add, sides) {
      const form = c.rng.pick(['cookie', 'flat', 'hf']);
      const v = c.rng.range(35, 65);
      sides.forEach(s => add(s, 'sn', (form === 'cookie' ? SH.cookie : form === 'flat' ? SH.flat : SH.hf)(v + c.rng.range(-4, 4))));
      c.hist.motif = 'Gêne auditive qui s’aggrave depuis l’adolescence';
      c.hist.antecedents.push(c.rng.pick(['Mère et oncle appareillés avant 40 ans', 'Père et grand-mère paternelle malentendants jeunes']));
    },
    fiche: {
      def: 'Surdités génétiques non syndromiques d’apparition retardée et d’évolution progressive (souvent autosomiques dominantes, DFNA).',
      clin: 'Bilatérales et symétriques, antécédents familiaux, sans autre cause retrouvée.',
      audio: 'Formes variées : en cuvette (« cookie-bite », médiums), plates ou descendantes.',
      imp: 'Une surdité de perception bilatérale chez l’adulte jeune justifie un bilan ORL étiologique (et un conseil génétique).',
      cat: 'Avis ORL si non exploré ; appareillage précoce.',
      proth: 'Cuvette : gain concentré sur les médiums, attention aux formules automatiques. Suivi rapproché de l’évolution.'
    }
  },
  {
    id: 'profonde_ic', nom: 'Surdité sévère à profonde bilatérale évolutive', site: 'interne', ages: [25, 85], w: 2, lat: 'bi',
    conduite: 'implant', fitAfterOrl: false,
    gen(c, add, sides) {
      const v = c.rng.range(80, 105);
      sides.forEach(s => { add(s, 'sn', SH.slope(v - 15, v + 10)); c.disc[s] = Math.round(c.rng.range(0, 35)); });
      c.hist.motif = 'Appareillé(e) depuis 15 ans, n’arrive plus à comprendre même avec ses appareils';
      c.hist.symptoms.push('Lecture labiale indispensable', 'Ne téléphone plus', 'Isolement social');
    },
    fiche: {
      def: 'Surdité de perception bilatérale sévère à profonde dont la compréhension avec aides auditives bien réglées reste insuffisante.',
      clin: 'Dépendance à la lecture labiale, abandon du téléphone, isolement.',
      audio: 'Seuils au-delà de 80 à 90 dB, intelligibilité très faible même à fort niveau.',
      imp: 'Critère classique (HAS 2012) : intelligibilité ≤ 50 % aux listes dissyllabiques à 60 dB en champ libre avec prothèses optimisées. Ne pas laisser un patient « s’enliser » avec des aides auditives devenues insuffisantes.',
      cat: 'Orientation vers un centre d’implantation cochléaire (bilan pluridisciplinaire).',
      proth: 'Optimiser les aides auditives en attendant (contours super-puissants, embouts sur mesure, abaissement fréquentiel). Après implantation : appareillage bimodal possible de l’oreille controlatérale.'
    }
  },
  {
    id: 'cophose_uni', nom: 'Cophose unilatérale', site: 'interne', ages: [15, 80], w: 2, lat: 'uni',
    conduite: 'co', fitAfterOrl: false,
    gen(c, add, sides) {
      const s = sides[0];
      add(s, 'sn', SH.flat(135));
      c.disc[s] = 0;
      c.reflex[s] = 'absent';
      c.hist.motif = 'N’entend plus du tout de l’oreille ' + sideName(s) + ' depuis des années, gêné(e) au restaurant';
      c.hist.antecedents.push(c.rng.pick(['Surdité brusque non récupérée il y a 6 ans', 'Oreillons dans l’enfance', 'Labyrinthite il y a 10 ans']));
      c.hist.symptoms.push('Ne sait pas d’où viennent les sons', 'Se place toujours avec la bonne oreille vers l’interlocuteur');
    },
    fiche: {
      def: 'Perte totale de l’audition d’une oreille (déficience totale au sens BIAP), l’autre oreille étant normale ou atteinte.',
      clin: 'Localisation spatiale impossible, gêne dans le bruit et pour les voix venant du côté sourd (effet d’ombre de la tête).',
      audio: 'Pas de réponse en CA et CO masquées du côté atteint. Sans masquage, une « courbe fantôme » apparaît par transfert transcrânien : l’erreur classique.',
      imp: 'Le masquage est indispensable. Un Rinne « négatif » du côté cophotique est un faux négatif (perception par l’oreille saine).',
      cat: 'CROS si l’autre oreille est normale, BiCROS si elle est atteinte, ou prothèse à ancrage osseux (transmission transcrânienne). L’implant cochléaire est discuté dans certaines indications.',
      proth: 'Le CROS transmet le son du côté sourd vers l’oreille saine ; le dôme côté sain doit rester très ouvert.'
    }
  },
  {
    id: 'labyrinthite', nom: 'Labyrinthite', site: 'interne', ages: [18, 75], w: 1.2, lat: 'uni',
    conduite: 'urgence', fitAfterOrl: false,
    gen(c, add, sides) {
      const s = sides[0];
      add(s, 'sn', SH.flat(c.rng.range(45, 80)));
      c.hist.motif = 'Grand vertige depuis hier avec baisse d’audition de l’oreille ' + sideName(s);
      c.hist.symptoms.push('Vomissements', 'Impossible de tenir debout', 'Acouphène');
      c.hist.antecedents.push(c.rng.pick(['Otite moyenne aiguë la semaine dernière', 'Syndrome grippal il y a 10 jours']));
    },
    fiche: {
      def: 'Atteinte inflammatoire ou infectieuse du labyrinthe (virale, ou bactérienne à partir d’une otite).',
      clin: 'Grand vertige rotatoire prolongé avec nausées et vomissements, surdité de perception et acouphène du même côté.',
      audio: 'Perte de perception unilatérale, parfois profonde.',
      imp: 'Vertige + surdité aiguë = urgence.',
      cat: 'Urgence ORL.',
      proth: 'Selon les séquelles, à distance.'
    }
  },
  {
    id: 'autoimmune', nom: 'Surdité auto-immune rapidement progressive', site: 'interne', ages: [25, 60], w: 1, lat: 'bi', sexF: 0.6,
    conduite: 'urgence', fitAfterOrl: false,
    gen(c, add, sides) {
      sides.forEach((s, k) => add(s, 'sn', SH.flat(c.rng.range(35, 70) * (k ? c.rng.range(0.7, 1) : 1))));
      c.hist.motif = 'Baisse d’audition des deux oreilles qui s’aggrave de semaine en semaine depuis 1 mois';
      c.hist.antecedents.push(c.rng.pick(['Polyarthrite rhumatoïde', 'Maladie de Crohn', 'Pas d’antécédent connu']));
      c.hist.symptoms.push('Plénitude des deux oreilles', 'Instabilité');
    },
    fiche: {
      def: 'Surdité de perception bilatérale (souvent asymétrique) évoluant en semaines ou en mois, parfois associée à une maladie auto-immune systémique.',
      clin: 'Aggravation rapide, fluctuations, parfois atteinte vestibulaire.',
      audio: 'Perte de perception bilatérale qui s’aggrave d’un examen à l’autre.',
      imp: 'Une aggravation rapide n’est jamais « normale » : la corticosensibilité justifie une prise en charge urgente.',
      cat: 'Orientation ORL en urgence (bilan, corticothérapie).',
      proth: 'Appareillage transitoire possible ensuite, réglages à revoir souvent.'
    }
  },
  {
    id: 'acouphenes', nom: 'Acouphènes subjectifs invalidants', site: 'fonction', ages: [30, 65], w: 1.5, lat: 'bi',
    conduite: 'orl', fitAfterOrl: true,
    gen(c, add, sides) {
      sides.forEach(s => add(s, 'sn', SH.hf(c.rng.range(5, 22))));
      c.hist.motif = 'Sifflement permanent qui l’empêche de dormir depuis 6 mois';
      c.hist.symptoms.push('Irritabilité, difficultés de concentration', 'Gêne par les bruits forts (hyperacousie)');
      c.hist.misc.push('Questionnaire THI : handicap sévère');
    },
    fiche: {
      def: 'Perception d’un son en l’absence de source extérieure, sans cause objective retrouvée, souvent associée à une perte auditive même discrète.',
      clin: 'Retentissement variable : sommeil, concentration, anxiété. Questionnaires : THI, échelle visuelle analogique.',
      audio: 'Audition normale ou perte légère sur les aigus ; acouphénométrie (fréquence, intensité, masquabilité).',
      imp: 'Un acouphène pulsatile, unilatéral ou associé à une surdité asymétrique doit être exploré par l’ORL.',
      cat: 'Bilan ORL, puis prise en charge pluridisciplinaire : TCC, thérapie sonore, relaxation.',
      proth: 'Aides auditives avec générateur de bruit intégré si perte associée ; la correction de la perte suffit souvent à diminuer la gêne.'
    }
  },
  {
    id: 'normale_bruit', nom: 'Difficultés dans le bruit avec audiogramme normal', site: 'fonction', ages: [20, 55], w: 1.5, lat: 'bi',
    conduite: 'surveillance', fitAfterOrl: false,
    gen(c, add, sides) {
      c.hist.motif = 'Ne comprend rien au restaurant, pense avoir besoin d’appareils';
      c.hist.symptoms.push('Aucune gêne au calme', 'Fatigue en fin de journée');
      if (c.rng.chance(0.5)) c.hist.antecedents.push('Concerts et discothèques très fréquents pendant 10 ans');
    },
    fiche: {
      def: 'Plainte de compréhension dans le bruit malgré des seuils tonals normaux : troubles du traitement auditif, synaptopathie cochléaire (« surdité cachée »), facteurs attentionnels.',
      clin: 'Gêne en milieu bruyant, fatigue auditive, audition normale au calme.',
      audio: 'Audiogramme normal ; tests de parole dans le bruit éventuellement abaissés.',
      imp: 'Un audiogramme normal ne clôt pas la discussion : expliquer, proposer des tests dans le bruit et un avis spécialisé si la gêne persiste.',
      cat: 'Pas d’appareillage conventionnel : conseils, stratégies de communication, protection auditive, contrôle.',
      proth: 'Parfois micro déporté ou aide à très faible gain avec directivité, au cas par cas.'
    }
  },

  /* ===== PÉDIATRIE ===== */
  {
    id: 'gjb2', nom: 'Surdité congénitale génétique (connexine 26, GJB2)', site: 'interne', ages: [0.2, 6], w: 3, lat: 'bi', pedia: true, adult: false,
    conduite: c => (Math.min(c.biap.R, c.biap.L) >= 90 ? 'implant' : 'appareil'), presc: 1, fitAfterOrl: true,
    gen(c, add, sides) {
      const v = c.rng.range(45, 110);
      sides.forEach(s => add(s, 'sn', SH.slope(v - 5, v + 10)));
      c.hist.motif = 'Dépistage néonatal « à contrôler » des deux côtés, diagnostic confirmé';
      c.hist.antecedents.push('Parents entendants', 'Bilan génétique : mutation GJB2 homozygote');
      c.hist.symptoms.push(c.age < 1.5 ? 'Ne réagit pas aux bruits de la maison' : 'Retard de langage');
    },
    fiche: {
      def: 'Cause génétique la plus fréquente de surdité congénitale non syndromique (DFNB1, transmission autosomique récessive) : mutations du gène GJB2 codant la connexine 26.',
      clin: 'Enfant de parents entendants le plus souvent. Surdité présente dès la naissance, généralement stable.',
      audio: 'Bilatérale, symétrique, de sévérité variable (légère à profonde). OEA absentes.',
      imp: 'Dépistage néonatal → confirmation par PEA → appareillage dans les semaines qui suivent. Objectif : stimulation auditive avant 6 mois.',
      cat: 'Surdité moyenne ou sévère : appareillage bilatéral précoce. Surdité profonde : bilan d’implantation cochléaire (souvent vers 12 mois).',
      proth: 'Contours d’oreille, embouts souples refaits très souvent, cibles DSL v5, mesure du RECD, accompagnement parental.'
    }
  },
  {
    id: 'cmv', nom: 'Surdité liée au CMV congénital', site: 'interne', ages: [0.5, 8], w: 2, lat: 'either', pedia: true, adult: false,
    conduite: c => (Math.max(c.biap.R, c.biap.L) >= 90 && Math.min(c.biap.R, c.biap.L) >= 90 ? 'implant' : 'appareil'), presc: 1, fitAfterOrl: true,
    gen(c, add, sides) {
      sides.forEach((s, k) => add(s, 'sn', SH.hf(c.rng.range(35, 90) * (k ? c.rng.range(0.5, 1) : 1))));
      c.hist.motif = 'Suivi d’une infection congénitale à CMV : aggravation à ce contrôle';
      c.hist.antecedents.push('Dépistage néonatal normal ou limite', 'Infection congénitale à CMV connue');
    },
    fiche: {
      def: 'Le cytomégalovirus congénital est la première cause non génétique de surdité de perception de l’enfant.',
      clin: 'Surdité présente à la naissance ou apparue secondairement, souvent progressive ou fluctuante, uni ou bilatérale.',
      audio: 'Pertes de perception de profils variés, parfois asymétriques, qui peuvent s’aggraver au fil des contrôles.',
      imp: 'Un dépistage néonatal normal n’exclut pas une surdité ultérieure : suivi audiologique prolongé obligatoire.',
      cat: 'Appareillage précoce, suivi rapproché ; implant si évolution profonde bilatérale.',
      proth: 'Réglages à revoir à chaque contrôle, prévoir de la réserve de gain.'
    }
  },
  {
    id: 'neuropathie', nom: 'Neuropathie auditive', site: 'retro', ages: [0.5, 6], w: 1.5, lat: 'bi', pedia: true, adult: false,
    conduite: 'orl', fitAfterOrl: true,
    gen(c, add, sides) {
      const v = c.rng.range(30, 70);
      sides.forEach(s => { add(s, 'sn', SH.low(v)); add(s, 'sn', SH.flat(c.rng.range(5, 15))); c.disc[s] = Math.round(c.rng.range(0, 30)); c.oaeForce = 'présentes'; c.reflex[s] = 'absent'; });
      c.hist.motif = 'Réactions aux bruits présentes mais langage très en retard';
      c.hist.antecedents.push(c.rng.pick(['Grande prématurité (28 SA)', 'Ictère néonatal sévère avec exsanguinotransfusion', 'Anoxie néonatale']));
      c.hist.misc.push('OEA présentes des deux côtés, PEA : pas d’onde identifiable');
    },
    fiche: {
      def: 'Trouble de la transmission neurale du message auditif (synapse cellule ciliée interne / nerf auditif) avec fonction des cellules ciliées externes conservée.',
      clin: 'Facteurs : prématurité, hyperbilirubinémie, anoxie, formes génétiques (otoferline, OTOF). Compréhension très inférieure à ce que laisse prévoir l’audiogramme, surtout dans le bruit.',
      audio: 'OEA présentes (ou microphonique cochléaire), PEA absents ou très anormaux, réflexes stapédiens absents, audiogramme variable.',
      imp: 'Un dépistage par OEA seul passe à côté : chez les nouveau-nés à risque (néonatologie), le dépistage se fait par PEA automatisés.',
      cat: 'Avis ORL spécialisé et équipe pédiatrique : essai d’appareillage prudent, évaluation précoce de l’implant cochléaire, rééducation orthophonique.',
      proth: 'Bénéfice imprévisible : essai encadré, mesures de perception régulières.'
    }
  },
  {
    id: 'meningite', nom: 'Surdité post-méningite', site: 'interne', ages: [1, 12], w: 1.2, lat: 'bi', pedia: true, adult: false,
    conduite: 'implant', fitAfterOrl: false,
    gen(c, add, sides) {
      sides.forEach(s => { add(s, 'sn', SH.flat(c.rng.range(95, 120))); c.disc[s] = 0; });
      c.hist.motif = 'Bilan auditif après une méningite bactérienne il y a 3 semaines';
      c.hist.antecedents.push('Méningite à pneumocoque, hospitalisation en réanimation');
      c.hist.symptoms.push('Ne réagit plus à l’appel de son prénom');
    },
    fiche: {
      def: 'Atteinte cochléaire bilatérale après méningite bactérienne (pneumocoque en tête), avec risque d’ossification de la cochlée (labyrinthite ossifiante).',
      clin: 'Surdité profonde d’apparition rapide après l’épisode infectieux.',
      audio: 'Surdité profonde à totale bilatérale.',
      imp: 'Tout enfant ayant eu une méningite doit avoir un bilan auditif rapide. L’ossification peut rendre l’insertion des électrodes impossible si l’on attend.',
      cat: 'Orientation urgente vers un centre d’implantation cochléaire.',
      proth: 'Aides auditives d’attente éventuelles, sans retarder l’implantation.'
    }
  },
  {
    id: 'pendred', nom: 'Syndrome de Pendred / aqueduc du vestibule élargi', site: 'interne', ages: [2, 16], w: 1.2, lat: 'bi', pedia: true, adult: false,
    conduite: 'appareil', presc: 1, fitAfterOrl: true,
    gen(c, add, sides) {
      sides.forEach((s, k) => {
        add(s, 'sn', SH.hf(c.rng.range(40, 75) * (k ? c.rng.range(0.75, 1) : 1)));
        add(s, 'cg', SH.lowgap(c.rng.range(12, 22)));
      });
      c.hist.motif = 'Aggravation de l’audition après une chute sur la tête au parc';
      c.hist.antecedents.push('Scanner : aqueducs du vestibule élargis des deux côtés');
      c.hist.symptoms.push('Audition qui « fait des paliers »');
    },
    fiche: {
      def: 'Mutation du gène SLC26A4 : élargissement de l’aqueduc du vestibule, parfois malformation cochléaire ; syndrome de Pendred quand s’ajoute un goitre (souvent à l’adolescence).',
      clin: 'Surdité de perception fluctuante et progressive, aggravations par paliers après un traumatisme crânien même minime ou un effort à glotte fermée.',
      audio: 'Perte de perception avec une composante « transmissionnelle » sur les graves alors que le tympanogramme et les réflexes sont normaux (effet de troisième fenêtre).',
      imp: 'Écart aérien-osseux sur les graves + tympanogramme normal + réflexes présents : ne pas conclure à une atteinte de l’oreille moyenne.',
      cat: 'Appareillage, conseils (éviter les sports de contact), suivi thyroïdien, implant si aggravation profonde.',
      proth: 'Réserve de gain, réglages fréquents, programmes adaptés aux fluctuations.'
    }
  },
  {
    id: 'usher', nom: 'Syndrome de Usher', site: 'interne', ages: [1, 15], w: 1, lat: 'bi', pedia: true, adult: false,
    conduite: c => c.flags.type1 ? 'implant' : 'appareil', presc: 1, fitAfterOrl: true,
    gen(c, add, sides) {
      c.flags.type1 = c.rng.chance(0.45);
      const v = c.flags.type1 ? c.rng.range(95, 115) : c.rng.range(45, 70);
      sides.forEach(s => add(s, 'sn', c.flags.type1 ? SH.flat(v) : SH.slope(v - 20, v + 20)));
      c.hist.motif = c.flags.type1 ? 'Surdité profonde, a marché tard (à 20 mois)' : 'Surdité connue, l’enfant se cogne souvent le soir';
      c.hist.symptoms.push(c.flags.type1 ? 'Troubles de l’équilibre' : 'Difficultés à voir dans la pénombre');
      c.hist.antecedents.push('Consultation ophtalmologique demandée');
    },
    fiche: {
      def: 'Syndrome génétique autosomique récessif associant surdité de perception et rétinite pigmentaire (perte progressive du champ visuel et de la vision nocturne).',
      clin: 'Type 1 : surdité profonde congénitale + aréflexie vestibulaire (marche tardive). Type 2 : surdité moyenne à sévère en pente, vestibule normal. Type 3 : surdité progressive.',
      audio: 'Selon le type : profonde plate (type 1) ou descendante (type 2).',
      imp: 'L’audition devient d’autant plus vitale que la vision baissera : prise en charge auditive optimale précoce.',
      cat: 'Type 1 : implant cochléaire bilatéral précoce. Type 2 : appareillage. Suivi ophtalmologique.',
      proth: 'Privilégier l’accès auditif maximal, aides techniques (micro déporté), éviter de dépendre de la lecture labiale.'
    }
  }
];

/* ---------------- Génération ---------------- */
function presbBase(age, i) {
  if (age <= 25) return 0;
  const k = Math.pow((age - 25) / 45, 2);
  return [8, 10, 12, 20, 28, 35, 45, 55][i] * k;
}
function ageLabel(a) {
  if (a < 2) { const m = Math.max(1, Math.round(a * 12)); return m + ' mois'; }
  if (a < 16 && a % 1 > 0.05) { const y = Math.floor(a); const m = Math.round((a - y) * 12); return y + ' an' + (y > 1 ? 's' : '') + (m ? ' ' + m + ' mois' : ''); }
  return Math.round(a) + ' ans';
}
function testMethod(age) {
  if (age < 0.5) return 'Seuils estimés par PEA et ASSR, par oreille (enfant endormi)';
  if (age < 2.5) return 'Audiométrie comportementale avec renforcement visuel (inserts), seuils par oreille';
  if (age < 5) return 'Audiométrie ludique au casque (conditionnement par le jeu)';
  if (age < 16) return 'Audiométrie tonale au casque, CO avec masquage';
  return 'Audiométrie tonale liminaire au casque, CO avec masquage si nécessaire';
}

function generateCase(opts = {}) {
  const seed = opts.seed || newSeed();
  const rng = makeRng(seed);
  let pool = PATHOS.slice();
  if (opts.patho) pool = PATHOS.filter(p => p.id === opts.patho);
  else {
    if (opts.site && opts.site !== 'tous') pool = pool.filter(p => opts.site === 'interne' ? (p.site === 'interne' || p.site === 'retro') : opts.site === 'moyenne' ? (p.site === 'moyenne' || p.site === 'mixte') : p.site === opts.site);
    if (opts.pub === 'enfant') pool = pool.filter(p => p.pedia);
    else if (opts.pub === 'adulte') pool = pool.filter(p => p.adult !== false && p.ages[1] >= 18);
    if (!pool.length) pool = PATHOS.slice();
  }
  const P = rng.wpick(pool, p => p.w);
  let [a0, a1] = P.ages;
  if (opts.pub === 'enfant') a1 = Math.min(a1, 15.9);
  if (opts.pub === 'adulte') a0 = Math.max(a0, 18);
  if (a0 > a1) [a0, a1] = P.ages;
  let age = rng.range(a0, a1);
  age = age < 16 ? Math.round(age * 12) / 12 : Math.round(age);
  const kid = age < 16;
  const sex = rng.chance(P.sexF == null ? 0.5 : P.sexF) ? 'F' : 'M';
  const first = kid ? rng.pick(sex === 'F' ? KID_F : KID_M) : rng.pick(sex === 'F' ? FIRST_F : FIRST_M);
  const last = rng.pick(LAST);
  let job;
  if (kid) job = age < 3 ? 'à la crèche ou gardé(e) à domicile' : age < 6 ? 'en maternelle' : age < 11 ? 'à l’école élémentaire' : 'au collège';
  else if (P.job === 'bruit') job = rng.pick(JOBS_B);
  else if (P.job === 'plongee' || P.job === 'eau') job = rng.pick(JOBS_P.concat(JOBS_N));
  else job = age >= 65 ? 'retraité(e), ancien(ne) ' + rng.pick(JOBS_N) : rng.pick(JOBS_N);

  const c = {
    rng, age, sex, job, kid, flags: {}, prescribed: false,
    ears: {}, tymp: {}, reflex: {}, oto: {}, disc: {},
    hist: { motif: '', symptoms: [], antecedents: [], misc: [] }
  };
  ['R', 'L'].forEach(s => c.ears[s] = { sn: F.map(() => 0), cg: F.map(() => 0), bcx: F.map(() => 0) });
  if (P.presc) c.prescribed = rng.chance(P.presc);

  let sides;
  if (P.lat === 'bi') sides = ['R', 'L'];
  else if (P.lat === 'uni') sides = rng.chance(P.latBiChance || 0) ? ['R', 'L'] : [rng.chance(0.5) ? 'R' : 'L'];
  else sides = rng.chance(0.5) ? ['R', 'L'] : [rng.chance(0.5) ? 'R' : 'L'];
  if (sides.length === 2 && rng.chance(0.5)) sides.reverse();
  c.sides = sides.slice();
  const add = (s, key, arr, k = 1) => { arr.forEach((v, i) => { c.ears[s][key][i] += v * k + (v ? rng.gauss(0, 2.2) : 0); }); };
  P.gen(c, add, sides);

  // composition des seuils
  const earOff = { R: rng.gauss(0, 2), L: rng.gauss(0, 2) };
  const acMax = [105, 120, 120, 120, 120, 120, 110, 100];
  const ears = {};
  ['R', 'L'].forEach(s => {
    const E = c.ears[s];
    const e = { ac: [], bc: [], acNR: [], bcNR: [] };
    F.forEach((f, i) => {
      const base = (kid ? 0 : presbBase(age, i)) + rng.gauss(4, 3.5) + earOff[s];
      let a = base + E.sn[i] + E.cg[i];
      a = clamp(r5(a), -10, 200);
      if (a > acMax[i]) { a = acMax[i]; e.acNR[i] = true; } else e.acNR[i] = false;
      e.ac[i] = a;
      if (i < NBC) {
        let b = clamp(r5(base + E.sn[i] + E.bcx[i]), -10, 200);
        if (b > BC_MAX[i]) { b = BC_MAX[i]; e.bcNR[i] = true; } else e.bcNR[i] = false;
        if (!e.acNR[i] && b > e.ac[i]) b = e.ac[i];
        e.bc[i] = b;
      }
    });
    ears[s] = e;
  });
  c.biap = { R: biapAvg(ears.R), L: biapAvg(ears.L) };
  const type = { R: hearingType(ears.R), L: hearingType(ears.L) };

  // tympanométrie, réflexes, otoscopie, vocale, OEA par défaut
  const speech = {}, reflexTxt = {}, oae = {};
  ['R', 'L'].forEach(s => {
    const e = ears[s];
    if (!c.tymp[s]) c.tymp[s] = { type: 'A', peak: clamp(rng.gauss(-15, 18), -90, 40), comp: kid ? rng.range(0.3, 0.9) : rng.range(0.4, 1.3), ecv: kid ? rng.range(0.5, 0.9) : rng.range(0.8, 1.6) };
    if (!c.oto[s]) c.oto[s] = rng.pick(OTO_N);
    const gap1k = (e.acNR[2] ? 120 : e.ac[2]) - e.bc[2];
    let rf = c.reflex[s];
    if (!rf) rf = (gap1k >= 15 || e.ac[2] > 80 || c.tymp[s].type === 'B' || c.tymp[s].type === 'NR') ? 'absent' : 'present';
    if (rf === 'present') { const thr = r5(Math.max(85, e.ac[2] + rng.range(55, 75) - Math.max(0, e.ac[2] - 30) * 0.6)); reflexTxt[s] = 'Présent à ' + Math.min(thr, 110) + ' dB HL (ipsilatéral, 1 kHz)'; }
    else if (rf === 'fatigable') reflexTxt[s] = 'Présent à 100 dB HL mais fatigable (decay > 50 % en 10 s)';
    else reflexTxt[s] = c.tymp[s].type === 'NR' ? 'Non réalisé' : 'Absent';
    const pta3 = avg([1, 2, 3].map(i => e.acNR[i] ? 120 : e.ac[i]));
    const pta4 = c.biap[s];
    if (kid && age < 3) speech[s] = null;
    else if (pta4 >= 115) speech[s] = { srt: null, max: 0, lvl: null };
    else {
      const snLoss = avg([1, 2, 3, 4].map(i => e.bc[i]));
      let mx = c.disc[s] != null ? c.disc[s] : clamp(Math.round(100 - Math.max(0, snLoss - 25) * 0.75 + rng.gauss(0, 4)), 5, 100);
      mx = clamp(r5(mx), 0, 100);
      const srt = r5(pta3 + rng.gauss(0, 3));
      speech[s] = { srt: clamp(srt, 0, 120), max: mx, lvl: clamp(r5(srt + 30), 30, 120) };
    }
    const hfOK = [2, 3, 5].every(i => !e.acNR[i] && e.ac[i] <= 30);
    oae[s] = c.oaeForce || ((hfOK && gap1k < 10 && c.tymp[s].type !== 'B') ? 'présentes' : 'absentes');
  });

  const caseObj = {
    seed, patho: P, age, ageTxt: ageLabel(age), sex, kid,
    name: first + ' ' + last, city: rng.pick(CITIES), job,
    ears, type, biap: c.biap, tymp: c.tymp, reflex: reflexTxt, oto: c.oto, speech, oae,
    hist: c.hist, prescribed: c.prescribed, flags: c.flags, sides: c.sides,
    method: testMethod(age)
  };
  caseObj.conduite = typeof P.conduite === 'function' ? P.conduite(c) : P.conduite;
  if (caseObj.conduite === 'appareil' && P.presc && !c.prescribed && typeof P.conduite !== 'function') caseObj.conduite = 'orl';
  // CROS / BiCROS
  if (P.id === 'cophose_uni') {
    const other = c.sides[0] === 'R' ? 'L' : 'R';
    caseObj.crosType = c.biap[other] > 30 ? 'BiCROS' : 'CROS';
  }
  caseObj.fitMode = fitModeFor(caseObj);
  return caseObj;
}

function fitModeFor(cs) {
  const maxB = Math.max(cs.biap.R, cs.biap.L);
  if (cs.conduite === 'appareil') return maxB >= 26 ? 'full' : 'none';
  if (cs.conduite === 'orl' && cs.patho.fitAfterOrl && maxB >= 26) return 'train';
  if (cs.conduite === 'co') return 'device';
  return 'none';
}

/* ---------- distracteurs de diagnostic ---------- */
function pathoOptions(cs, rng) {
  const P = cs.patho;
  const pool = PATHOS.filter(p => p.id !== P.id && (cs.kid ? p.pedia || p.ages[0] < 16 : p.adult !== false));
  const near = rng.shuffle(pool.filter(p => p.site === P.site || (P.site === 'retro' && p.site === 'interne')));
  const far = rng.shuffle(pool.filter(p => p.site !== P.site));
  const opts = [P];
  near.slice(0, 2).forEach(p => opts.push(p));
  for (const p of far) { if (opts.length >= 4) break; opts.push(p); }
  return rng.shuffle(opts);
}
