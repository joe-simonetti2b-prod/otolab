# OtoLab

Atelier d'entraînement au métier d'audioprothésiste, en appli Android.

- **Cas** : patients générés aléatoirement (35 pathologies de l'oreille externe, moyenne, interne, rétrocochléaires et pédiatriques), analyse de l'audiogramme, conduite à tenir, choix de l'appareil et du couplage, réglage G50/G65/G80/MPO face à une cible, réglage fin à partir des plaintes du patient.
- **Cabinet** : poste de travail simulé avec deux applications, comme au cabinet. *Gestion* (dossier patient, façon Cosium) : agenda du jour, identité et ordonnance, anamnèse, otoscopie, tympanométrie, compte rendu, devis, prochain rendez-vous. *Audio* (façon Noah) : audiométrie tonale sur un patient virtuel qui répond selon ses vrais seuils (transfert transcrânien et courbe fantôme, masquage, surmasquage, vibrotactile, consigne au micro), audiométrie vocale avec listes de mots type Lafon et Fournier (cotation +/−), logiciel fabricant (Phonak, ReSound, Signia), mesure in vivo. Patients de contrôle avec datalogging et plainte à corriger. Correction détaillée à la clôture. Raccourcis clavier du cabinet : Espace, flèches, D/G, O, M, F, Entrée, F5, +/−, S, Ctrl+Maj.
- **Tests** : atlas de 53 tests audiologiques (acoumétrie au diapason, tonale avec masquage, Rainville/SAL, Békésy, TEN, haute fréquence, supraliminaires, vocale au calme et dans le bruit, impédancemétrie, OEA, PEA, ASSR, non organique, tests de l'enfant, dépistage). Chaque fiche a un schéma animé et commenté (narration vocale), un déroulé, une table d'interprétation, les pièges et un quiz.
- **Patient virtuel** : acoumétrie virtuelle, Rainville/SAL, batterie topodiagnostique (SISI, Fowler, tone decay, réflexes, Békésy, roll-over, PEA), Stenger, vocale dans le bruit adaptative.
- **Outils de dépistage** : balayage pass / à contrôler, voix chuchotée guidée, calculateur sensibilité/VPP, contrôle du bruit ambiant.
- **Révisions** et **Pédiatrie** : fiches pratiques et quiz générés.
- **Clinique** : diapason, assistant Weber/Rinne/Gellé, audiomètre manuel, autotest automatique, étalonnage biologique.
- **Suivi** : progression et pathologies à retravailler.

## Installer sur Android

Télécharger la dernière version : **[OtoLab.apk](../../releases/latest/download/OtoLab.apk)**, l'ouvrir et autoriser l'installation depuis le navigateur ou le gestionnaire de fichiers.

## Comment l'APK est fabriqué

Chaque modification poussée sur `main` déclenche GitHub Actions (`.github/workflows/android.yml`) : assemblage de `web/` en `www/index.html` (polices embarquées, fonctionne hors ligne), synchronisation Capacitor, compilation Gradle, publication dans *Releases*.

- `web/` : code de l'appli (HTML, CSS, JavaScript, sans framework)
- `scripts/build-www.mjs` : assemblage
- `android/` : projet Android Capacitor
- `keystore/otolab.jks` : clé de signature de l'appli (la garder pour que les mises à jour s'installent par-dessus)

Outil de formation et de dépistage : ne remplace ni une audiométrie en cabine ni un audiomètre étalonné.
