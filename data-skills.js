"use strict";
/* CAGE LEGACY — js/data-skills.js
   Catalogue des compétences débloquables. Ne dépend de rien, chargé en premier.
   Consommé par engine.js (rollSkill, RAR_CHANCE — inchangés pour l'instant),
   ui.js (affichage) et main.js (validateSkills).

   Format : [id, nom, rareté, buffs, descriptif, mots_clés]
   Rareté : C=commune R=rare E=épique L=légendaire M=mythique
   Les buffs doivent nommer des clés de ATTR_KEYS (30 attributs), jamais des
   canaux de eff(). Catalogue en cours de remplissage : Karaté et Sambo prêts
   (40/40 chacun) ; BJJ, Boxe, Lutte à venir dans le même format. */
const SKILLS=[];
function regSkills(arr, fam, key){
  for(const [id,name,rar,fx,desc,tags] of arr){
    SKILLS.push({id,name,rar,fx,desc,tags:tags||[],fam,key});
  }
}

// ==========================================
// CATALOGUE KARATÉ (40/40)
// ==========================================
const SK_KARATE = [
    // --- COMMUNES (+5) ---
    ['karate01', 'Blitzkrieg direct', 'C', {footSpeed: 3, cross: 2}, 'Une avancée en ligne droite si explosive que l\'adversaire encaisse le direct avant d\'avoir vu le mouvement.', ['Blitz', 'Vitesse']],
    ['karate02', 'Distance fantôme', 'C', {footSpeed: 3, fightIQ: 2}, 'Reste constamment hors de portée, reculant juste assez pour faire rater les frappes adverses au millimètre.', ['Télémétrie', 'Esquive']],
    ['karate03', 'Le Gyaku-Zuki', 'C', {cross: 3, power: 2}, 'Un coup de poing direct du bras arrière donné avec une rotation complète des hanches pour un impact maximal.', ['Frappe lourde', 'Direct']],
    ['karate04', 'Coup de pied latéral (Yoko Geri)', 'C', {kick: 3, tdd: 2}, 'Un chassé latéral visant le genou ou la hanche pour bloquer net l\'avancée adverse.', ['Coup d\'arrêt', 'Contrôle distance']],
    ['karate05', 'Garde basse provocatrice', 'C', {composure: 3, handSpeed: 2}, 'Baisse les mains pour inviter l\'attaque, faisant confiance à ses réflexes pour contrer instantanément.', ['Provocation', 'Réflexes']],
    ['karate06', 'Le Mawashi Geri furtif', 'C', {kick: 3, footSpeed: 2}, 'Un coup de pied circulaire dont l\'armement est masqué, rendant la trajectoire illisible.', ['Kick masqué', 'Furtivité']],
    ['karate07', 'Kiai (Cri de l\'esprit)', 'C', {heart: 3, aggression: 2}, 'Un cri guttural au moment de la frappe qui libère l\'énergie et impressionne psychologiquement l\'adversaire.', ['Intimidation', 'Cœur']],
    ['karate08', 'Retrait en un temps', 'C', {footSpeed: 5}, 'Capable de bondir en arrière sur plusieurs mètres en une fraction de seconde pour éviter un takedown.', ['Bord de cage', 'Évasion']],
    ['karate09', 'Le Kizami-Zuki (Jab plongeant)', 'C', {jab: 3, handSpeed: 2}, 'Un jab lancé en fendant l\'avant, utilisant le poids du corps pour piquer comme une lance.', ['Jab explosif', 'Distance']],
    ['karate10', 'Balayage (De-Ashi-Barai)', 'C', {footSpeed: 3, fightIQ: 2}, 'Un balayage du pied avant adverse pile au moment où il transfère son poids.', ['Balayage', 'Timing']],
    ['karate11', 'Posture en fente', 'C', {tdd: 3, explosiveness: 2}, 'Une posture très large de profil qui protège les deux jambes des amenées tout en chargeant l\'attaque.', ['Antilutte', 'Stance']],
    ['karate12', 'Contre en reculant', 'C', {cross: 3, composure: 2}, 'Frappe avec précision tout en effectuant un bond en arrière, punissant l\'agression adverse.', ['Contre-attaque', 'Recul']],
    ['karate13', 'Frappe au foie retournée', 'C', {kick: 3, killer: 2}, 'Un coup de pied retourné direct (Ushiro Geri) visant exactement la zone hépatique.', ['Frappe au corps', 'Précision']],
    ['karate14', 'Le rythme brisé', 'C', {adaptability: 3, fightIQ: 2}, 'Alterne des périodes d\'immobilité totale et des explosions de violence, détruisant le tempo adverse.', ['Casse-rythme', 'Imprévisible']],
    ['karate15', 'Endurance bondissante', 'C', {cardio: 3, footSpeed: 2}, 'Peut sautiller et rebondir sur la pointe des pieds pendant trois rounds sans acidifier ses mollets.', ['Cardio', 'Rebonds']],
    // --- RARES (+9) ---
    ['karate16', 'L\'ouragan de poings', 'R', {handSpeed: 5, explosiveness: 4}, 'Un déluge de frappes directes lancées à une vitesse qui sature complètement la vision de l\'adversaire.', ['Volume', 'Blitz']],
    ['karate17', 'Le kick qui contourne la garde', 'R', {kick: 5, flexibility: 4}, 'Un coup de pied circulaire qui passe littéralement par-dessus l\'épaule pour redescendre sur la nuque.', ['High kick', 'Souplesse']],
    ['karate18', 'Sniper de l\'œil', 'R', {jab: 5, fightIQ: 4}, 'Vise systématiquement le même œil avec le jab jusqu\'à le fermer complètement.', ['Précision clinique', 'Dégâts']],
    ['karate19', 'L\'Esprit de l\'Eau', 'R', {composure: 5, adaptability: 4}, 'Ne panique jamais sous la pression, se fluidifiant autour des attaques adverses sans jamais s\'opposer en force.', ['Sang-froid', 'Esquive']],
    ['karate20', 'Le coup de pied en crochet', 'R', {kick: 5, killer: 4}, 'Un Ura-Mawashi Geri (coup de pied fouetté inversé) qui percute la mâchoire depuis l\'angle mort.', ['Angle mort', 'Finition']],
    ['karate21', 'Le timing parfait', 'R', {fightIQ: 5, cross: 4}, 'Frappe toujours dans la demi-seconde exacte où l\'adversaire est en déséquilibre ou en inspiration.', ['Timing absolu', 'Contre']],
    ['karate22', 'Le bouclier de distance', 'R', {footSpeed: 5, tdd: 4}, 'Un jeu de jambes si dominant que personne n\'arrive même à toucher ses jambes pour tenter un takedown.', ['Intouchable', 'Distance pure']],
    ['karate23', 'Frappe du tranchant', 'R', {power: 5, handSpeed: 4}, 'Utilise le tranchant de la main (Shuto) dans les phases de clinch sale pour viser la carotide ou la clavicule.', ['Shuto', 'Frappe atypique']],
    ['karate24', 'Explosion verticale', 'R', {explosiveness: 5, kick: 4}, 'Capable de sauter sur place sans appel pour délivrer un coup de pied au visage.', ['Sans appel', 'Saut']],
    ['karate25', 'Le balayage qui sonne', 'R', {footSpeed: 5, power: 4}, 'Fauche la jambe d\'appui avec une telle force que l\'adversaire percute le sol avec la tête la première.', ['Chute lourde', 'Destruction']],
    ['karate26', 'Le souffle du dragon', 'R', {cardio: 5, aggression: 4}, 'Maintient un rythme de blitz constant, chargeant d\'un bout à l\'autre de la cage round après round.', ['Cardio offensif', 'Harassement']],
    ['karate27', 'Contre-attaque simultanée (Sen-no-sen)', 'R', {composure: 5, handSpeed: 4}, 'N\'esquive pas : frappe exactement en même temps que l\'adversaire, mais arrive toujours le premier.', ['Anticipation', 'Vitesse']],
    // --- ÉPIQUES (+15) ---
    ['karate28', 'Le coup du samouraï', 'E', {cross: 8, power: 7}, 'Un direct du bras arrière d\'une perfection si absolue qu\'il suffit à foudroyer n\'importe quel menton.', ['Ikken Hissatsu', 'One shot']],
    ['karate29', 'La vitesse de l\'éclair', 'E', {handSpeed: 8, explosiveness: 7}, 'Des déplacements et des frappes d\'une rapidité qui défie l\'œil humain. L\'adversaire ne voit que des flashs.', ['Foudre', 'Vitesse aveuglante']],
    ['karate30', 'Maître de l\'illusion', 'E', {footSpeed: 8, fightIQ: 7}, 'Feinte avec le corps entier. L\'adversaire réagit constamment à des attaques qui n\'existent pas.', ['Feintes', 'Manipulation']],
    ['karate31', 'Le coup de pied invisible', 'E', {kick: 8, composure: 7}, 'Un coup de pied haut lancé depuis une posture immobile, sans la moindre contraction préalable du visage ou des épaules.', ['Indétectable', 'Furtivité absolue']],
    ['karate32', 'Le 6ème sens', 'E', {composure: 8, fightIQ: 7}, 'Semble lire dans l\'esprit de l\'adversaire, esquivant des combinaisons entières les mains baissées et les yeux fermés.', ['Instinct', 'Esquive totale']],
    ['karate33', 'L\'armure de ki', 'E', {durability: 8, heart: 7}, 'Une capacité méditative à occulter la douleur corporelle, absorbant les low kicks sans jamais boiter.', ['Transcendance', 'Ignore la douleur']],
    ['karate34', 'Le balayage de l\'ombre', 'E', {footSpeed: 9, adaptability: 6}, 'Un jeu de jambes si perturbant qu\'il balaye l\'adversaire simplement en le forçant à croiser ses propres appuis.', ['Perte d\'appuis', 'Danse mortelle']],
    ['karate35', 'L\'explosion destructrice', 'E', {explosiveness: 9, power: 6}, 'La capacité de passer de 0 à 100% d\'énergie cinétique en une fraction de seconde au moment de l\'impact.', ['Énergie pure', 'Choc']],
    // --- LÉGENDAIRES (+22) ---
    ['karate36', 'La technique parfaite', 'L', {fightIQ: 12, handSpeed: 10}, 'Une boxe dépourvue de tout mouvement inutile. L\'efficacité martiale élevée au rang d\'art absolu.', ['Perfection absolue', 'Zéro déchet']],
    ['karate37', 'Le flash KO', 'L', {footSpeed: 12, killer: 10}, 'Un déplacement éclair suivi d\'une frappe, le tout exécuté plus vite que le temps de réaction humain.', ['Flash', 'Extinction']],
    ['karate38', 'L\'insaisissable', 'L', {footSpeed: 12, composure: 10}, 'Termine des combats de championnat sans avoir été touché une seule fois. Un cauchemar psychologique pour l\'adversaire.', ['Fantôme', 'Intouchable']],
    ['karate39', 'Le coup de pied de l\'ouragan', 'L', {kick: 12, explosiveness: 10}, 'Des kicks retournés qui génèrent une force centrifuge si puissante qu\'ils fracassent les gardes et les os.', ['Tornade', 'Dégâts critiques']],
    // --- MYTHIQUE (+32) ---
    ['karate40', 'L\'Esprit Martial Pur (Ikken Hissatsu)', 'M', {footSpeed: 14, kick: 10, killer: 8}, 'Un seul coup pour tuer. Incarne le mythe du karatéka originel : peu importe la résistance adverse, quand il touche, le combat est terminé.', ['Mort subite', 'Légende', 'Magie martiale']]
];

// ==========================================
// CATALOGUE SAMBO (40/40)
// ==========================================
const SK_SAMBO = [
    // --- COMMUNES (+5) ---
    ['sambo01', 'Le fauchage russe', 'C', {takedown: 3, strength: 2}, 'Accroche la jambe adverse au corps-à-corps et utilise la force brute pour arracher l\'adversaire du sol.', ['O-Soto-Gari', 'Force']],
    ['sambo02', 'L\'envol du Suplex', 'C', {takedown: 3, explosiveness: 2}, 'Une projection arrière spectaculaire qui fait atterrir l\'adversaire sur la nuque ou les épaules.', ['Suplex', 'Choc']],
    ['sambo03', 'Contrôle écrasant', 'C', {topControl: 3, strength: 2}, 'Utilise son poids mort avec une lourdeur caractéristique des lutteurs de l\'Est pour aplatir l\'adversaire.', ['Pression lourde', 'Contrôle']],
    ['sambo04', 'L\'arrachage de bras', 'C', {submission: 3, strength: 2}, 'Isole le bras au sol et tire avec l\'ensemble du dos et des jambes pour forcer la clé (Juji-Gatame).', ['Clé de bras', 'Force pure']],
    ['sambo05', 'Coup de poing plongeant', 'C', {cross: 3, takedown: 2}, 'Un large overhand lancé à pleine puissance (Casting Punch) pour masquer l\'entrée en lutte.', ['Casting Punch', 'Leurre']],
    ['sambo06', 'La clé de genou éclair', 'C', {submission: 3, flexibility: 2}, 'Plonge vers les jambes de l\'adversaire depuis la position debout pour verrouiller le genou (Kneebar).', ['Kneebar', 'Attaque basse']],
    ['sambo07', 'Rythme du Caucase', 'C', {cardio: 3, heart: 2}, 'Peut enchaîner les projections lourdes sans jamais que son rythme cardiaque ne semble s\'emballer.', ['Cardio russe', 'Inépuisable']],
    ['sambo08', 'Défense en béton', 'C', {tdd: 3, strength: 2}, 'Bloque les takedowns adverses non pas avec la technique, mais en opposant un mur de muscles immobiles.', ['Mur', 'Antilutte']],
    ['sambo09', 'Ground and Pound percutant', 'C', {gnp: 3, power: 2}, 'Frappe au sol avec de larges mouvements circulaires très puissants visant à casser la garde.', ['GNP', 'Dégâts']],
    ['sambo10', 'La Kimura arrachée', 'C', {submission: 3, strength: 2}, 'Ne s\'embarrasse pas de technique fine : tord le bras adverse jusqu\'à ce que la soumission vienne.', ['Kimura', 'Brutalité']],
    ['sambo11', 'Transition Lutte-Frappe', 'C', {adaptability: 3, takedown: 2}, 'Lâche la tentative de takedown pour envoyer un crochet destructeur à très courte distance.', ['Hybride', 'Feinte']],
    ['sambo12', 'Le contrôle latéral total', 'C', {topControl: 3, fightIQ: 2}, 'Verrouille la tête et le bras de l\'adversaire (Kesa-Gatame) rendant toute respiration douloureuse.', ['Kesa-Gatame', 'Étouffement']],
    ['sambo13', 'Instinct de prédateur', 'C', {aggression: 3, killer: 2}, 'Dès que l\'adversaire montre un signe de faiblesse, accélère brutalement pour finir le combat.', ['Instinct', 'Pression']],
    ['sambo14', 'Endurance à la douleur', 'C', {durability: 3, heart: 2}, 'Conditionné dans un environnement rude, ignore les coupures et les bleus pour continuer à avancer.', ['Dur au mal', 'Résilience']],
    ['sambo15', 'Crochetage de jambe', 'C', {takedown: 3, fightIQ: 2}, 'Un petit croche-pied à l\'intérieur de la jambe adverse, subtil mais suffisant pour déséquilibrer l\'adversaire.', ['Crochetage', 'Déséquilibre']],
    // --- RARES (+9) ---
    ['sambo16', 'Le Suplex de la mort', 'R', {takedown: 5, power: 4}, 'Une projection d\'une amplitude telle que l\'adversaire subit des dégâts majeurs simplement en touchant le sol.', ['Suplex létal', 'Dégâts de chute']],
    ['sambo17', 'Le briseur de chevilles', 'R', {submission: 5, killer: 4}, 'Spécialiste mondial des clés de chevilles, il les referme si vite qu\'il n\'y a pas le temps de taper avant la fracture.', ['Clé de cheville', 'Finition']],
    ['sambo18', 'Contrôle accablant', 'R', {topControl: 5, strength: 4}, 'Même les meilleurs spécialistes de Jiu-Jitsu ne peuvent pas s\'échapper une fois écrasés sous son poids.', ['Enclume', 'Immobilisation']],
    ['sambo19', 'Casting Punch ravageur', 'R', {cross: 5, power: 4}, 'Le poing plongeant est si lourd qu\'il provoque fréquemment des knockdowns, même s\'il touche le front.', ['Overhand russe', 'KO']],
    ['sambo20', 'Le broyeur de dos', 'R', {strength: 5, clinchStr: 4}, 'Au corps-à-corps, serre la taille de l\'adversaire avec une force qui lui brise les côtes flottantes.', ['Étreinte de l\'Ours', 'Force pure']],
    ['sambo21', 'Chaîne de clés de bras', 'R', {submission: 5, adaptability: 4}, 'Passe d\'une clé d\'épaule à une clé de coude puis au poignet avec une fluidité cauchemardesque.', ['Enchaînement', 'Casseur de bras']],
    ['sambo22', 'Lutte inarrêtable', 'R', {takedown: 5, tdd: 4}, 'Domine les phases de lutte avec une autorité absolue. Ce qu\'il veut attraper finit toujours au sol.', ['Domination Lutte', 'Autorité']],
    ['sambo23', 'Ground and Pound sanguinaire', 'R', {gnp: 5, aggression: 4}, 'Le sol devient une zone de destruction où chaque frappe vise à défigurer et à casser l\'adversaire.', ['Destruction au sol', 'Violence']],
    ['sambo24', 'Mental de fer', 'R', {heart: 5, composure: 4}, 'Totalement insensible à la fatigue, à la foule, ou à la pression. Combat comme un cyborg implacable.', ['Sang-froid', 'Cyborg']],
    ['sambo25', 'Le crochetage inversé', 'R', {takedown: 5, explosiveness: 4}, 'Un fauchage intérieur (Uchi-Mata) si explosif que l\'adversaire fait un soleil avant de s\'écraser.', ['Uchi-Mata', 'Amplitude']],
    ['sambo26', 'Clé de genou volante', 'R', {submission: 5, explosiveness: 4}, 'Saute au visage pour feinter, attrape la cuisse en l\'air et atterrit directement en clé de jambe.', ['Attaque volante', 'Surprise']],
    ['sambo27', 'Pression écrasante (Daghestan)', 'R', {cardio: 5, topControl: 4}, 'Le style de contrôle de l\'Est : accule contre la cage, fait tomber, attache les poignets et épuise.', ['Menottes', 'Usure mentale']],
    // --- ÉPIQUES (+15) ---
    ['sambo28', 'La projection cataclysmique', 'E', {takedown: 8, power: 7}, 'L\'adversaire atterrit avec une telle force que le souffle coupé s\'accompagne souvent d\'un KO à l\'impact.', ['Choc tellurique', 'Dégâts critiques']],
    ['sambo29', 'L\'arracheur de membres', 'E', {submission: 8, strength: 7}, 'Ses soumissions n\'ont pas besoin d\'être parfaites techniquement ; il brise l\'articulation par la seule force brute.', ['Force inhumaine', 'Destruction']],
    ['sambo30', 'Le Golem', 'E', {topControl: 8, durability: 7}, 'Impossible de le bouger au sol, impossible de lui faire mal debout. Une force de la nature.', ['Roc', 'Masse inamovible']],
    ['sambo31', 'L\'ours de Sibérie', 'E', {strength: 9, clinchStr: 6}, 'Un corps-à-corps effrayant. Chaque seconde passée dans ses bras pompe l\'oxygène et la vie de l\'adversaire.', ['Étouffement', 'Puissance']],
    ['sambo32', 'Le Tueur à gage', 'E', {killer: 8, aggression: 7}, 'Aussitôt qu\'une ouverture se présente au sol ou debout, il termine le combat avec une froideur absolue.', ['Exécuteur', 'Sans pitié']],
    ['sambo33', 'GNP de destruction massive', 'E', {gnp: 8, power: 7}, 'Les coups de poing au sol traversent la garde et font rebondir la tête de l\'adversaire contre la toile.', ['Marteau-piqueur', 'GNP']],
    ['sambo34', 'Maître de la gravité', 'E', {takedown: 8, adaptability: 7}, 'Sait exactement comment déséquilibrer n\'importe qui, transformant l\'énergie adverse en chutes dévastatrices.', ['Déséquilibre parfait', 'Judo']],
    ['sambo35', 'Le cauchemar des jambes', 'E', {submission: 8, fightIQ: 7}, 'Un expert mondial qui attaque les genoux et chevilles depuis des angles impossibles, paralysant la division.', ['Maître des clés', 'Terreur au sol']],
    // --- LÉGENDAIRES (+22) ---
    ['sambo36', 'L\'Aigle du Caucase', 'L', {topControl: 12, cardio: 10}, 'Une fois le combat amené au sol, c\'est terminé. Un contrôle si parfait et étouffant qu\'il brise des esprits.', ['Génie du contrôle', 'Soumission mentale']],
    ['sambo37', 'Le Tsar de la violence', 'L', {power: 12, gnp: 10}, 'Ses mains sont des enclumes. Que ce soit avec un Casting Punch debout ou au sol, chaque touche est létale.', ['Frappe atomique', 'Empereur']],
    ['sambo38', 'Le broyeur d\'os', 'L', {submission: 12, strength: 10}, 'Une réputation si terrifiante que les adversaires tapent souvent avant même que la clé ne soit totalement engagée.', ['Casseur', 'Terreur']],
    ['sambo39', 'La machine de l\'Est', 'L', {heart: 12, tdd: 10}, 'Ne recule jamais, ne tombe jamais, ne se fatigue jamais. Brise tous ses adversaires par sa simple constante.', ['Machine de guerre', 'Inépuisable']],
    // --- MYTHIQUE (+32) ---
    ['sambo40', 'Le Dernier Empereur', 'M', {takedown: 12, submission: 12, strength: 8}, 'Le combattant ultime de Sambo. Combine des poings foudroyants, des projections mortelles et une froideur de machine. Un mythe vivant.', ['GOAT du Sambo', 'Invincible', 'Aura absolue']]
];

// ==========================================
// CATALOGUE KICKBOXING (40/40)
// ==========================================
const SK_KICKBOXER = [
    // --- COMMUNES (+5) ---
    ['kb01', 'High kick masqué', 'C', {kick: 3, footSpeed: 2}, 'Un coup de pied à la tête lancé sans aucun appel du bassin, invisible jusqu\'au dernier moment.', ['High kick', 'Furtivité']],
    ['kb02', 'Le low kick chirurgical', 'C', {kick: 3, power: 2}, 'Vise systématiquement le nerf sciatique ou l\'intérieur de la cuisse avec la précision d\'un scalpel.', ['Low kick', 'Précision']],
    ['kb03', 'Combo poings-pieds fluide', 'C', {handSpeed: 3, kick: 2}, 'Les poings ouvrent la garde, la jambe termine le travail sans aucune rupture de rythme.', ['Combo', 'Fluidité']],
    ['kb04', 'Le middle kick qui coupe le souffle', 'C', {kick: 3, cardio: 2}, 'Un coup de tibia puissant dans les côtes qui vide les poumons de l\'adversaire.', ['Middle kick', 'Usure']],
    ['kb05', 'La distance parfaite', 'C', {footSpeed: 3, fightIQ: 2}, 'Reste toujours à la limite exacte où ses jambes touchent mais où les poings adverses brassent du vent.', ['Gestion de distance', 'Télémétrie']],
    ['kb06', 'Le direct de contre', 'C', {cross: 3, composure: 2}, 'Un direct du bras arrière déclenché pile au moment où l\'adversaire arme son attaque.', ['Contre', 'Direct']],
    ['kb07', 'Garde de fer en mouvement', 'C', {durability: 3, footSpeed: 2}, 'Une garde haute hermétique maintenue même lors des déplacements latéraux rapides.', ['Garde mobile', 'Protection']],
    ['kb08', 'Le chassé défensif (Teep)', 'C', {kick: 3, tdd: 2}, 'Un coup de pied frontal sec au niveau de la hanche pour repousser brutalement les tentatives d\'amenées.', ['Teep', 'Défense']],
    ['kb09', 'L\'enchaînement à trois niveaux', 'C', {adaptability: 3, kick: 2}, 'Alterne tête, corps et jambes dans la même séquence, forçant la garde adverse à se disloquer.', ['Variété', 'Imprévisible']],
    ['kb10', 'Appuis inébranlables', 'C', {strength: 3, tdd: 2}, 'Des jambes si fortes que balayer ou déséquilibrer ce combattant est une perte de temps.', ['Stabilité', 'Ancrage']],
    ['kb11', 'Le crochet qui ferme la porte', 'C', {hook: 3, power: 2}, 'Un crochet court utilisé en sortie d\'échange pour dissuader l\'adversaire de le poursuivre.', ['Dissuasion', 'Crochet']],
    ['kb12', 'Rythme hollandais', 'C', {cardio: 3, aggression: 2}, 'Avance constamment en envoyant des combinaisons lourdes, étouffant les initiatives adverses.', ['Pression', 'Style Dutch']],
    ['kb13', 'Le genou d\'interception', 'C', {clinchStr: 3, fightIQ: 2}, 'Un coup de genou remontant envoyé au moment où le lutteur plonge dans les jambes.', ['Interception', 'Genou']],
    ['kb14', 'Vitesse d\'exécution', 'C', {handSpeed: 3, explosiveness: 2}, 'Chaque combinaison part avec une explosivité qui prend l\'adversaire de vitesse sur le premier appui.', ['Vitesse pure', 'Explosion']],
    ['kb15', 'Conditionnement au choc', 'C', {durability: 3, recovery: 2}, 'A tellement encaissé de coups de pied à l\'entraînement que son corps absorbe les impacts sans sourciller.', ['Conditionnement', 'Dur au mal']],
    // --- RARES (+9) ---
    ['kb16', 'Le high kick qui passe l\'épaule', 'R', {kick: 5, flexibility: 4}, 'Une souplesse extrême permettant au tibia de fouetter la nuque même avec une garde adverse haute.', ['High kick', 'Souplesse']],
    ['kb17', 'Le low kick qui scie l\'arbre', 'R', {kick: 5, power: 4}, 'Un coup de tibia d\'une brutalité telle qu\'il fait perdre ses appuis à l\'adversaire dès le premier impact.', ['Destruction de jambe', 'Dégâts']],
    ['kb18', 'L\'avalanche hollandaise', 'R', {aggression: 5, handSpeed: 4}, 'Des séries de huit à dix coups où les poings et les pieds pleuvent sans laisser la moindre pause.', ['Pression extrême', 'Avalanche']],
    ['kb19', 'Le pas de retrait meurtrier', 'R', {footSpeed: 5, cross: 4}, 'Recule d\'un demi-pas pour laisser passer l\'attaque et répond instantanément avec un direct dévastateur.', ['Pas de retrait', 'Contre']],
    ['kb20', 'Le foie pour cible', 'R', {kick: 5, killer: 4}, 'Une capacité terrifiante à glisser le pied gauche exactement sous les côtes flottantes de l\'adversaire.', ['Frappe au foie', 'Finition']],
    ['kb21', 'Maître de l\'espace', 'R', {footSpeed: 5, fightIQ: 4}, 'Contrôle la distance avec une telle autorité que l\'adversaire passe le combat à courir après un fantôme.', ['Contrôle spatial', 'Insaisissable']],
    ['kb22', 'Le mur infranchissable', 'R', {durability: 5, tdd: 4}, 'Encaisse les pires frappes et repousse chaque projection sans jamais reculer d\'un centimètre.', ['Forteresse', 'Blindage']],
    ['kb23', 'Le Teep qui brise le sternum', 'R', {kick: 6, power: 3}, 'Un coup de pied frontal poussé avec toute la force des hanches, capable de fracturer des côtes.', ['Teep lourd', 'Choc']],
    ['kb24', 'L\'esquive rotative (Spinning Kick)', 'R', {kick: 5, explosiveness: 4}, 'Une rotation rapide qui transforme une esquive en un coup de pied retourné à la tête.', ['Coup retourné', 'Spectacle']],
    ['kb25', 'Le genou dans la mâchoire', 'R', {clinchStr: 5, power: 4}, 'Punit le moindre changement de niveau de l\'adversaire avec un genou qui remonte comme un piston.', ['Sanction basse', 'Genou']],
    ['kb26', 'Cardio d\'altitude', 'R', {cardio: 5, recovery: 4}, 'Garde la même explosivité sur ses coups de pied au troisième round qu\'à la première minute.', ['Poumons d\'acier', 'Constance']],
    ['kb27', 'Calf Kick dévastateur', 'R', {kick: 6, fightIQ: 3}, 'Vise le mollet adverse avec une précision diabolique, paralysant le jeu de jambes adverse en quelques minutes.', ['Calf kick', 'Neutralisation']],
    // --- ÉPIQUES (+15) ---
    ['kb28', 'Le high kick mortel', 'E', {kick: 9, power: 6}, 'Un coup de pied à la tête d\'une violence si inouïe que le combat s\'arrête immédiatement à l\'impact.', ['Finition instantanée', 'Tibia d\'acier']],
    ['kb29', 'La tornade inarrêtable', 'E', {handSpeed: 8, cardio: 7}, 'Des combinaisons incessantes qui submergent la défense, le cardio et le moral de l\'adversaire simultanément.', ['Submersion totale', 'Rythme']],
    ['kb30', 'Le sniper des jambes', 'E', {kick: 8, fightIQ: 7}, 'Chaque coup de pied est calculé et placé exactement sur la faiblesse biomécanique de l\'adversaire.', ['Sniper', 'Destruction tactique']],
    ['kb31', 'L\'intouchable', 'E', {footSpeed: 9, composure: 6}, 'Des déplacements si fluides et anticipés que l\'adversaire termine le combat sans avoir touché une cible nette.', ['Fantôme', 'Mouvement absolu']],
    ['kb32', 'L\'intercepteur suprême', 'E', {cross: 8, fightIQ: 7}, 'Devine les intentions de l\'adversaire et lance la contre-attaque avant même que le premier coup ne soit armé.', ['Anticipation pure', 'Contre']],
    ['kb33', 'Corps de titane', 'E', {durability: 8, recovery: 7}, 'Une résistance physique qui défie la logique, absorbant des dommages colossaux tout en continuant d\'avancer.', ['Indestructible', 'Titan']],
    ['kb34', 'Le génie du striking', 'E', {adaptability: 8, fightIQ: 7}, 'S\'adapte à n\'importe quel style de frappe adverse en quelques échanges et trouve systématiquement la faille.', ['QI de combat', 'Maître d\'échecs']],
    ['kb35', 'Le Question Mark Kick', 'E', {kick: 8, flexibility: 7}, 'Lève la jambe pour feinter un low kick, puis transforme le mouvement en high kick en une fraction de seconde.', ['Feinte ultime', 'Kick']],
    // --- LÉGENDAIRES (+22) ---
    ['kb36', 'Le tibia qui coupe l\'air', 'L', {kick: 13, power: 9}, 'Des coups de pied si rapides et si lourds qu\'on entend le son du frottement dans l\'air avant l\'impact dévastateur.', ['Vitesse', 'Destruction massive']],
    ['kb37', 'L\'algorithme du combat', 'L', {fightIQ: 12, adaptability: 10}, 'Lit les mouvements adverses comme un code source. Au second round, chaque attaque adverse est une erreur fatale.', ['Prescience', 'Adaptabilité absolue']],
    ['kb38', 'La machine de guerre', 'L', {cardio: 12, aggression: 10}, 'Un volume de frappe qui ne baisse jamais, appliquant une pression psychologique et physique que personne ne peut supporter.', ['Volume infernal', 'Machine']],
    ['kb39', 'Le contre parfait', 'L', {composure: 12, cross: 10}, 'Une seule erreur de l\'adversaire suffit. Le contre est toujours millimétré, foudroyant, et met fin au combat.', ['Punition finale', 'Précision mortelle']],
    // --- MYTHIQUE (+32) ---
    ['kb40', 'Le Cro Cop', 'M', {kick: 18, power: 8, killer: 6}, 'Jambe droite, hôpital. Jambe gauche, cimetière. Chaque coup de pied porte en lui la promesse d\'une extinction des lumières.', ['Terreur pure', 'High Kick Légal']]
];

// ==========================================
// CATALOGUE MUAY THAÏ (40/40)
// ==========================================
const SK_MUAYTHAI = [
    // --- COMMUNES (+5) ---
    ['mt01', 'Le clinch étouffant', 'C', {clinchStr: 3, strength: 2}, 'Saisit la nuque de l\'adversaire à deux mains, cassant sa posture et le forçant à subir le combat rapproché.', ['Plum', 'Contrôle']],
    ['mt02', 'Le genou au foie', 'C', {clinchStr: 3, power: 2}, 'Un coup de genou piqué exactement dans les côtes flottantes lors des phases de corps-à-corps.', ['Genou', 'Dégâts au corps']],
    ['mt03', 'Le low kick d\'abattage', 'C', {kick: 3, power: 2}, 'Frappe avec le bas du tibia pour cisailler la cuisse adverse, sans chercher la vitesse mais la destruction.', ['Tibia lourd', 'Frappe']],
    ['mt04', 'La garde de marbre', 'C', {durability: 3, composure: 2}, 'Accepte d\'encaisser des coups sur sa garde haute pour avancer inexorablement vers son adversaire.', ['Marche en avant', 'Blocage']],
    ['mt05', 'Le coude d\'ouverture', 'C', {clinchStr: 3, handSpeed: 2}, 'Un coup de coude horizontal furtif qui vise l\'arcade sourcilière dans les transitions de distance.', ['Coude', 'Sang']],
    ['mt06', 'Le Teep de contrôle', 'C', {kick: 3, tdd: 2}, 'Garde l\'adversaire à distance avec des coups de pied frontaux lourds qui cassent le rythme des attaques.', ['Teep', 'Distance']],
    ['mt07', 'Balayage thaï (Sweep)', 'C', {clinchStr: 3, footSpeed: 2}, 'Fauche la jambe d\'appui de l\'adversaire au clinch avec un timing parfait, l\'envoyant brutalement au tapis.', ['Balayage', 'Déséquilibre']],
    ['mt08', 'L\'esprit Nak Muay', 'C', {heart: 3, recovery: 2}, 'Plus il encaisse, plus il devient dangereux. La douleur semble agir comme un carburant.', ['Cœur', 'Résilience']],
    ['mt09', 'Le middle kick bras bloqué', 'C', {kick: 3, strength: 2}, 'Frappe si fort dans les bras de l\'adversaire qu\'il finit par lui briser la garde et l\'avant-bras.', ['Frappe destructrice', 'Usure']],
    ['mt10', 'Genou sauté', 'C', {clinchStr: 3, explosiveness: 2}, 'Explose de loin avec un coup de genou volant visant directement le menton.', ['Genou volant', 'Explosif']],
    ['mt11', 'Posture ancrée', 'C', {tdd: 3, durability: 2}, 'Des hanches lourdes et une posture haute qui rendent les tentatives de takedowns extrêmement difficiles.', ['Ancrage', 'Antilutte']],
    ['mt12', 'Le coude en pointe', 'C', {clinchStr: 3, power: 2}, 'Pénètre la garde adverse de bas en haut avec un coup de coude vertical dévastateur.', ['Coude uppercut', 'Corps-à-corps']],
    ['mt13', 'Blocage du tibia', 'C', {durability: 3, kick: 2}, 'Check chaque low kick avec son propre tibia d\'acier, faisant plus mal à l\'attaquant qu\'à lui-même.', ['Check', 'Tibia']],
    ['mt14', 'Pression constante', 'C', {aggression: 3, cardio: 2}, 'Avance pas à pas, sans précipitation, réduisant l\'espace vital de l\'adversaire round après round.', ['Pression', 'Marche']],
    ['mt15', 'Crochet court au clinch', 'C', {hook: 3, clinchStr: 2}, 'Génère une puissance surprenante avec ses poings alors qu\'il est collé à l\'adversaire.', ['Boxe courte', 'Clinch']],
    // --- RARES (+9) ---
    ['mt16', 'L\'étau de Bangkok', 'R', {clinchStr: 5, strength: 4}, 'Une maîtrise absolue de la prise de nuque. Une fois verrouillé, l\'adversaire ne peut plus relever la tête.', ['Clinch mortel', 'Domination']],
    ['mt17', 'Le festival de genoux', 'R', {clinchStr: 5, cardio: 4}, 'Enchaîne les coups de genoux au corps sans discontinuer, vidant l\'énergie et l\'âme de l\'adversaire.', ['Générateur de dégâts', 'Genoux']],
    ['mt18', 'Le coude qui tranche', 'R', {clinchStr: 5, killer: 4}, 'Cherche systématiquement la coupure pour aveugler l\'adversaire ou forcer l\'arrêt du médecin.', ['Coude', 'Finition']],
    ['mt19', 'Le middle kick qui brise les côtes', 'R', {kick: 5, power: 4}, 'Un coup de pied médian d\'une violence folle, dont l\'impact résonne dans toute l\'arène.', ['Middle Kick', 'Destruction']],
    ['mt20', 'Le roc de l\'Isaan', 'R', {durability: 5, heart: 4}, 'Encaisse les combinaisons adverses sans même cligner des yeux, souriant avant de répondre.', ['Roc', 'Indestructible']],
    ['mt21', 'Balayage ravageur', 'R', {clinchStr: 5, tdd: 4}, 'Joue avec le centre de gravité adverse au clinch pour le projeter au sol avec une violence humiliante.', ['Sweep thaï', 'Déséquilibre']],
    ['mt22', 'L\'art des huit membres', 'R', {adaptability: 5, kick: 4}, 'Alterne poings, pieds, genoux et coudes avec une harmonie martiale qui sature la défense adverse.', ['Variété absolue', 'Surcharge']],
    ['mt23', 'Le Teep au visage', 'R', {kick: 5, flexibility: 4}, 'Surprend la garde avec un coup de pied frontal claqué directement en plein visage.', ['Teep haut', 'Humiliation']],
    ['mt24', 'L\'avancée du zombie', 'R', {aggression: 5, durability: 4}, 'La fatigue ou les dégâts ne font qu\'accélérer sa marche en avant, transformant le ring en piège.', ['Pression psychologique', 'Marche']],
    ['mt25', 'Le contre du coude', 'R', {clinchStr: 5, composure: 4}, 'Laisse l\'adversaire entrer dans sa zone pour l\'accueillir avec une pointe de coude en plein élan.', ['Interception', 'Coude']],
    ['mt26', 'Le low kick d\'amputation', 'R', {kick: 6, power: 3}, 'Se concentre sur la jambe avant avec une telle force que l\'adversaire finit par boiter dès le second round.', ['Low Kick', 'Neutralisation']],
    ['mt27', 'La parade thaï parfaite', 'R', {composure: 5, tdd: 4}, 'Défie toute tentative d\'amenée ou de combinaison grâce à des appuis parfaits et des hanches impénétrables.', ['Défense thaï', 'Mur']],
    // --- ÉPIQUES (+15) ---
    ['mt28', 'Le Dieu du Clinch', 'E', {clinchStr: 9, strength: 6}, 'Personne ne peut survivre au corps-à-corps avec lui. Être attrapé par sa nuque est une sentence de mort.', ['Clinch absolu', 'Soumission debout']],
    ['mt29', 'Les tibias de fer', 'E', {kick: 8, durability: 7}, 'Des jambes conditionnées sur des troncs de bananiers. Ses coups de pied brisent la garde, les bras et la volonté.', ['Destruction osseuse', 'Frappe lourde']],
    ['mt30', 'Le chirurgien des coudes', 'E', {clinchStr: 8, killer: 7}, 'Trouve l\'ouverture exacte pour placer le coude qui terminera le combat dans une mare de sang.', ['Boucherie', 'Finition cut']],
    ['mt31', 'L\'esprit inébranlable', 'E', {heart: 8, recovery: 7}, 'Même au bord du KO, son instinct guerrier prend le relais pour renverser la situation avec une brutalité froide.', ['Résurrection', 'Cœur de lion']],
    ['mt32', 'L\'orchestrateur de la douleur', 'E', {fightIQ: 8, adaptability: 7}, 'Démontre une supériorité technique absolue, punissant chaque micro-erreur avec l\'arme la plus adaptée.', ['Maîtrise totale', 'Intelligence tactique']],
    ['mt33', 'Le rouleau compresseur thaï', 'E', {aggression: 8, cardio: 7}, 'Une tempête de genoux et de coudes qui ne s\'arrête jamais. L\'adversaire suffoque sous le volume de frappes.', ['Étouffement', 'Volume']],
    ['mt34', 'Le mur du Lumpinee', 'E', {durability: 8, tdd: 7}, 'Une forteresse humaine. Immunisé aux takedowns, insensible à la douleur, il brise les combattants par sa seule présence.', ['Impassibilité', 'Mur']],
    ['mt35', 'Le genou assassin', 'E', {clinchStr: 9, explosiveness: 6}, 'Un coup de genou sauté ou depuis le clinch d\'une telle pureté qu\'il déconnecte instantanément l\'adversaire.', ['Genou KO', 'Finition']],
    // --- LÉGENDAIRES (+22) ---
    ['mt36', 'Le Maître de l\'art des 8 membres', 'L', {clinchStr: 12, kick: 10}, 'L\'incarnation parfaite du Muay Thaï. Fluide, meurtrier, intouchable et doté d\'une force de frappe inhumaine.', ['Légende', 'Maîtrise absolue']],
    ['mt37', 'Le démon de la violence', 'L', {killer: 12, power: 10}, 'Chaque frappe a pour seul but de détruire physiquement l\'adversaire. Un combattant craint par toute sa division.', ['Destruction', 'Terreur']],
    ['mt38', 'L\'indestructible Nak Muay', 'L', {durability: 12, heart: 10}, 'Peut traverser l\'enfer sans faire un pas en arrière. Brise l\'esprit de ses adversaires en refusant de tomber.', ['Immortel', 'Cœur']],
    ['mt39', 'Le tyran du corps-à-corps', 'L', {clinchStr: 14, strength: 8}, 'Manipule le poids et le corps des adversaires de classe mondiale comme s\'ils étaient des enfants.', ['Tyran', 'Manipulation']],
    // --- MYTHIQUE (+32) ---
    ['mt40', 'L\'Héritier de Buakaw', 'M', {kick: 16, clinchStr: 10, durability: 6}, 'La perfection violente. Ses tibias pulvérisent les défenses, ses coudes tranchent l\'espoir et il n\'a jamais fait un pas en arrière.', ['Dieu du stade', 'Légende thaï']]
];

// ==========================================
// CATALOGUE BJJ (40/40)
// ==========================================
const SK_BJJ = [
    // --- COMMUNES ---
    ['bjj01', 'Garde qui ne cède jamais', 'C', {guardWork: 3, tdd: 2}, "La garde fermée : les jambes enroulées autour du bassin de l'adversaire au sol, pour l'empêcher de reculer ou de frapper librement. Celle-ci ne s'ouvre presque jamais, même sous la pression d'un round entier.", ['Garde', 'Défense', 'Usure']],
    ['bjj02', 'La garde qui se reforme seule', 'C', {guardWork: 5}, "Perdre sa garde, c'est laisser l'adversaire passer ses jambes et s'installer en position dominante. Ce combattant la retrouve presque aussitôt, comme si la position se refermait d'elle-même derrière lui.", ['Transition', 'Récupération']],
    ['bjj03', 'La passe qu\'on ne voit pas venir', 'C', {gnp: 3, topControl: 2}, "Passer la garde, c'est contourner les jambes de l'adversaire pour atteindre une position où on peut frapper sans risque au sol. Ici, ça se fait sans effort apparent, sans jamais laisser d'ouverture pendant le mouvement.", ['Fluidité', 'Offensive']],
    ['bjj04', 'Le renversement du dessous', 'C', {guardWork: 3, explosiveness: 2}, "Un balayage : depuis la garde fermée, faire basculer l'adversaire sur le dos d'un coup de hanche pour se retrouver au-dessus. Change instantanément qui domine le combat au sol.", ['Balayage', 'Explosivité']],
    ['bjj05', 'Le dos qu\'on ne rend plus', 'C', {topControl: 5}, "Prendre le dos, c'est se placer derrière l'adversaire, jambes crochetées autour de lui — la position la plus dangereuse au sol, celle d'où partent la plupart des étranglements. Une fois installée, elle ne se perd presque jamais.", ['Contrôle absolu', 'Menace']],
    ['bjj06', 'L\'étranglement qui part de la garde', 'C', {submission: 5}, "Le col croisé : une main attrape le col de l'adversaire depuis la garde, l'autre serre en tournant, et l'air ne passe plus. Une menace constante tant que la garde reste fermée.", ['Soumission', 'Étranglement']],
    ['bjj07', 'Le bras plié à l\'envers (Kimura)', 'C', {submission: 5}, "Une clé qui plie le bras de l'adversaire dans le mauvais sens au niveau de l'épaule. Se prépare depuis la garde et finit souvent avant même que l'adversaire comprenne qu'elle est engagée.", ['Clé de bras', 'Kimura']],
    ['bjj08', 'La clé courte du contrôle latéral (Americana)', 'C', {submission: 5}, "Depuis une position de contrôle au sol, le bras de l'adversaire est plié en équerre contre le sol : une clé rapide, difficile à voir venir depuis cette position précise.", ['Clé de bras', 'Americana']],
    ['bjj09', 'La demi-garde qui ralentit tout', 'C', {guardWork: 3, tdd: 2}, "Une garde incomplète, une seule jambe entre soi et l'adversaire : elle ne bloque pas tout, mais elle épuise l'adversaire qui essaie de passer, round après round.", ['Demi-garde', 'Contrôle']],
    ['bjj10', 'Le contrôle avant la chute', 'C', {clinchStr: 3, topControl: 2}, "Avant même de toucher le sol, ce combattant contrôle déjà le rythme debout - bras autour du cou ou de la tête : pour choisir le moment exact de l'amenée.", ['Clinch', 'Transition']],
    ['bjj11', 'La sortie qui ne rate jamais', 'C', {guardWork: 3, flexibility: 2}, "Face aux clés les plus évidentes (bras, jambe), le réflexe de sortir avant qu'elles ne se referment complètement.", ['Évasion', 'Défense']],
    ['bjj12', 'Le genou qui écrase le ventre', 'C', {topControl: 5}, "Une position de transition où le genou pèse directement sur le ventre de l'adversaire, très inconfortable, qui empêche de respirer normalement et prépare la suite.", ['Pression', 'Contrôle']],
    ['bjj13', 'Le mur qui bloque les amenées', 'C', {tdd: 3, strength: 2}, "Utilise la cage elle-même comme un troisième appui pour empêcher l'adversaire de le faire tomber.", ['Antijeu', 'Mur']],
    ['bjj14', 'Le corps qui plie sans se rompre', 'C', {flexibility: 5}, "Une souplesse qui permet de sortir de positions où la plupart des combattants resteraient coincés, bras ou jambes tordus dans des angles inhabituels.", ['Souplesse', 'Survie']],
    ['bjj15', 'Le souffle qui ne s\'épuise jamais au tapis', 'C', {cardio: 3, adaptability: 2}, "Les échanges au sol vident généralement très vite les réserves - pas les siennes, qui tiennent la distance même après plusieurs minutes de lutte au sol.", ['Cardio', 'Grappling']],
    // --- RARES ---
    ['bjj16', 'L\'étranglement qui surgit de nulle part (Guillotine)', 'R', {submission: 5, tdd: 4}, "Quand l'adversaire tente une amenée mal engagée, sa tête passe sous le bras et se retrouve enserrée debout - un étranglement qui punit directement une mauvaise tentative de projection.", ['Contre', 'Guillotine', 'Opportunisme']],
    ['bjj17', 'Le triangle qu\'on ne débranche jamais', 'R', {submission: 5, guardWork: 4}, "Les jambes enroulent le cou et un bras de l'adversaire depuis la garde, comme un nœud coulant vivant — l'une des soumissions les plus reconnaissables du sport, et l'une des plus difficiles à sentir venir à temps.", ['Verrouillage', 'Soumission technique']],
    ['bjj18', 'L\'étranglement du bras piégé (D\'Arce)', 'R', {submission: 6, gnp: 3}, "Depuis le contrôle latéral, un bras de l'adversaire se retrouve emprisonné contre son propre cou — la mauvaise posture le condamne avant qu'il ne comprenne l'erreur.", ['D\'Arce', 'Piège']],
    ['bjj19', 'La sanction de la mauvaise esquive (Von Flue)', 'R', {submission: 4, topControl: 5}, "Quand l'adversaire tente d'échapper à un triangle en se redressant du mauvais côté, son propre poids l'étouffe contre l'épaule adverse — une soumission qui punit une défense mal exécutée.", ['Contre', 'Von Flue']],
    ['bjj20', 'Le mur qui relève tout seul', 'R', {tdd: 5, guardWork: 4}, "Contre la cage, sous la pression, ce combattant se redresse malgré tout, comme si la position debout revenait naturellement.", ['Résilience', 'Relevé']],
    ['bjj21', 'Le chaos qu\'il maîtrise seul', 'R', {tdd: 4, adaptability: 3, explosiveness: 2}, "Dans les échanges confus, les transitions où personne ne contrôle vraiment la position, ce combattant ressort systématiquement du bon côté.", ['Scramble', 'Adaptabilité']],
    ['bjj22', 'Le dos qui ne se libère plus', 'R', {submission: 6, topControl: 3}, "Une fois le dos pris, l'étranglement suit presque mécaniquement : ce n'est plus qu'une question de temps, pas de si.", ['Prise de dos', 'Finition']],
    ['bjj23', 'La passe qui ne laisse pas réagir', 'R', {gnp: 5, explosiveness: 4}, "Un mouvement unique et rapide qui traverse la garde de l'adversaire avant qu'il n'ait pu réagir.", ['Passage éclair', 'Offensive']],
    ['bjj24', 'Le piège qu\'on ne referme plus sur lui', 'R', {tdd: 7, submission: 2}, "Ne se fait plus surprendre par la guillotine, la menace la plus classique sur une amenée mal engagée.", ['Anticipation', 'Défense']],
    ['bjj25', 'Le bras qui reste tendu trop longtemps', 'R', {submission: 5, gnp: 4}, "Prolonge le contrôle latéral en gardant une menace constante sur l'épaule de l'adversaire, jusqu'à ce qu'il craque.", ['Pression constante', 'Menace bras']],
    ['bjj26', 'La jambe qu\'on isole et qu\'on plie', 'R', {submission: 5, flexibility: 4}, "Attaque directement la cheville ou le genou depuis une position basse, souvent négligée par un adversaire concentré sur le haut du corps.", ['Clé de jambe', 'Visée basse']],
    ['bjj27', 'Le dos qu\'il garde même épuisé', 'R', {topControl: 9}, "Même vidé physiquement, ce combattant ne relâche jamais une prise de dos une fois installée.", ['Opiniâtreté', 'Grappling']],
    // --- ÉPIQUES ---
    ['bjj28', 'La roulade qui surgit d\'une garde passive (Imanari)', 'E', {submission: 8, flexibility: 7}, "Une attaque de jambe si rapide et inattendue qu'elle part d'une position qui semblait totalement défensive une seconde plus tôt.", ['Imprévisible', 'Clé de jambe', 'Souplesse extrême']],
    ['bjj29', 'L\'étranglement qui punit l\'amenée mal maîtrisée (Anaconda)', 'E', {submission: 9, topControl: 6}, "Ce combattant enroule la tête et un bras de l'adversaire dans ses propres bras, se retrouve en position dominante, et serre. Redouté car il arrive juste après une amenée adverse jugée réussie.", ['Anaconda', 'Contre fatal', 'Pression']],
    ['bjj30', 'L\'étranglement que personne ne voit venir (Peruvian Necktie)', 'E', {submission: 15}, "Une soumission rare, exécutée depuis une position que la plupart des combattants considèrent comme sûre - presque jamais anticipée à temps.", ['Inédit', 'Necktie']],
    ['bjj31', 'L\'étau qui isole un bras jusqu\'au bout', 'E', {submission: 8, strength: 7}, "Un contrôle du corps entier qui immobilise un bras spécifique jusqu'à ce que la soumission devienne inévitable.", ['Isolement', 'Force brute']],
    ['bjj32', 'Le chasseur qui ne relâche jamais le dos', 'E', {topControl: 10, submission: 5}, "Une fois derrière l'adversaire, ce combattant ne perd littéralement jamais cette position : un chasseur qui n'abandonne pas la traque.", ['Traque', 'Domination']],
    ['bjj33', 'La garde qui attaque à distance (araignée)', 'E', {guardWork: 10, submission: 5}, "Une garde où les pieds contrôlent les hanches de l'adversaire à distance, empêchant toute passe tout en préparant la finition suivante.", ['Garde araignée', 'Contrôle à distance']],
    ['bjj34', 'Le retournement du dernier instant', 'E', {explosiveness: 8, guardWork: 7}, "Depuis une position perdue, presque plaquée au sol, ce combattant retourne la situation en un seul mouvement explosif.", ['Renversement', 'Explosivité']],
    ['bjj35', 'La cheville qu\'on ne voit pas se briser', 'E', {submission: 9, flexibility: 6}, "Une clé de jambe profonde et rapide, exécutée sur un adversaire qui ne défend même pas encore sa cheville.", ['Clé éclair', 'Destruction']],
    // --- LÉGENDAIRES ---
    ['bjj36', 'Le dos tordu depuis l\'impossible (Twister)', 'L', {submission: 12, flexibility: 10}, "Une soumission si rare qu'elle tord la colonne depuis une position dominante que presque personne ne sait exploiter.", ['Twister', 'Souplesse absolue', 'Rare']],
    ['bjj37', 'L\'inversion que personne ne comprend en direct (Berimbolo)', 'L', {guardWork: 13, adaptability: 9}, "Depuis la garde, un enchaînement de rotations prend le dos de l'adversaire sans qu'il ait eu le temps de suivre ce qui se passait.", ['Berimbolo', 'Rotation complexe']],
    ['bjj38', 'La chaîne de soumissions sans fin', 'L', {submission: 9, adaptability: 8, fightIQ: 5}, "Chaque défense de l'adversaire ouvre directement la soumission suivante : il n'y a jamais de répit, jamais de position sûre.", ['Enchaînement', 'Génie', 'Pression mortelle']],
    ['bjj39', 'L\'étranglement invisible jusqu\'à la fin', 'L', {submission: 14, composure: 8}, "Une soumission qui se ferme si progressivement que l'adversaire ne comprend qu'il est piégé qu'au moment où il est déjà trop tard pour taper au sol.", ['Piège invisible', 'Sang-froid']],
    // --- MYTHIQUE ---
    ['bjj40', 'La Toile', 'M', {submission: 16, guardWork: 10, fightIQ: 6}, "Peu importe la position du combat au sol, une menace de soumission différente apparaît à chaque instant - l'adversaire ne sait jamais laquelle est réelle avant qu'il ne soit déjà pris.", ['Omniprésence', 'Génie du sol', 'Danger permanent']]
];

// ==========================================
// CATALOGUE LUTTE (40/40)
// ==========================================
const SK_WRESTLER = [
    // --- COMMUNES ---
    ['wrestler01', 'L\'amenée qu\'on ne sent jamais venir', 'C', {takedown: 3, footSpeed: 2}, 'Une prise aux jambes lancée presque par réflexe, qui surprend même l\'adversaire qui s\'y attendait.', ['Amenée', 'Réflexe', 'Vitesse']],
    ['wrestler02', 'Le sprawl qui bloque tout', 'C', {tdd: 5}, 'Face à une tentative d\'amenée, les hanches reculent et le poids écrase l\'adversaire au sol avant la fin du geste.', ['Sprawl', 'Défense de fer']],
    ['wrestler03', 'Le retour debout systématique', 'C', {tdd: 3, cardio: 2}, 'Même plaqué au sol, ce combattant retrouve la position debout presque à chaque tentative.', ['Relevé', 'Endurance']],
    ['wrestler04', 'Le contrôle du buste avant la chute', 'C', {clinchStr: 5}, 'Un contrôle du haut du corps qui prépare et facilite chaque tentative de projection qui suit.', ['Contrôle haut', 'Préparation']],
    ['wrestler05', 'La ceinture qui verrouille la hanche', 'C', {strength: 3, takedown: 2}, 'Un contrôle par la taille qui rend l\'adversaire incapable de se dégager avant la chute.', ['Verrou', 'Puissance']],
    ['wrestler06', 'Le simple jambe qui ne rate jamais', 'C', {takedown: 5}, 'Une prise sur une seule jambe, rapide et basse, difficile à voir venir dans le feu de l\'échange.', ['Single leg', 'Précision']],
    ['wrestler07', 'Le double jambe explosif', 'C', {takedown: 4, explosiveness: 1}, 'Une prise sur les deux jambes lancée avec une explosivité qui emporte l\'adversaire avant qu\'il ne puisse réagir.', ['Double leg', 'Impact direct']],
    ['wrestler08', 'Le contrôle qui écrase depuis le dessus', 'C', {topControl: 5}, 'Une fois au sol en position dominante, un poids constant qui empêche l\'adversaire de respirer ou de se replacer.', ['Poids lourd', 'Domination']],
    ['wrestler09', 'La ceinture arrière qui ne lâche pas', 'C', {topControl: 3, strength: 2}, 'Un contrôle par-derrière au sol, difficile à briser, qui prépare le passage vers une position encore plus dominante.', ['Dos verrouillé', 'Transition']],
    ['wrestler10', 'Le pied contre la cage', 'C', {tdd: 5}, 'Utilise la cage comme point d\'appui pour empêcher toute amenée adverse.', ['Mur défensif', 'Appui']],
    ['wrestler11', 'Le corps-à-corps qui prive de distance', 'C', {clinchStr: 3, tdd: 2}, 'Un contrôle constant au clinch qui empêche l\'adversaire de créer la distance nécessaire pour frapper.', ['Clinch étouffant', 'Défense']],
    ['wrestler12', 'Le changement de niveau instantané', 'C', {footSpeed: 5}, 'Passe de la position debout à une prise basse plus vite que l\'œil ne peut suivre.', ['Niveau éclair', 'Surprise']],
    ['wrestler13', 'L\'équilibre qu\'on ne renverse jamais', 'C', {strength: 3, durability: 2}, 'Un centre de gravité si bas et si stable qu\'aucune tentative de déséquilibre ne fonctionne vraiment.', ['Base solide', 'Inébranlable']],
    ['wrestler14', 'Le combat de position qu\'il gagne toujours', 'C', {topControl: 3, fightIQ: 2}, 'Sait exactement où placer son poids pour garder l\'avantage positionnel, round après round.', ['Placement', 'Intelligence tactique']],
    ['wrestler15', 'Le souffle du lutteur', 'C', {cardio: 5}, 'Le grappling épuise vite, mais ce combattant tient un rythme constant du début à la fin.', ['Poumons d\'acier', 'Lutte continue']],
    // --- RARES ---
    ['wrestler16', 'L\'amenée qui claque contre le grillage', 'R', {takedown: 6, strength: 3}, 'Une projection qui plaque littéralement l\'adversaire contre la cage.', ['Violence', 'Cage control']],
    ['wrestler17', 'Le retournement qui prend par surprise', 'R', {takedown: 5, adaptability: 4}, 'Depuis une position défensive, un retournement soudain inverse qui contrôle le combat.', ['Inversion', 'Adaptabilité']],
    ['wrestler18', 'Le contrôle qui empêche toute reprise de garde', 'R', {topControl: 6, gnp: 3}, 'Une pression au sol si précise que l\'adversaire ne peut jamais rétablir sa garde.', ['Étouffement', 'Frappe au sol']],
    ['wrestler19', 'La ceinture qui casse la volonté', 'R', {strength: 5, heart: 4}, 'Un contrôle par la taille tellement dominant que l\'adversaire abandonne mentalement.', ['Ascendant psychologique', 'Force pure']],
    ['wrestler20', 'L\'amenée qu\'on ne voit jamais venir depuis le clinch', 'R', {takedown: 6, clinchStr: 3}, 'Lancée directement depuis un contrôle au corps-à-corps, sans le temps de reprise nécessaire pour contrer.', ['Transition masquée', 'Clinch létal']],
    ['wrestler21', 'Le contre-la-montre du grappling', 'R', {takedown: 5, cardio: 4}, 'Impose un rythme d\'amenées répétées qui use l\'adversaire minute après minute.', ['Usure systématique', 'Cadence']],
    ['wrestler22', 'La défense qui ne cède jamais contre la cage', 'R', {tdd: 9}, 'Même acculé contre le grillage, aucune tentative d\'amenée adverse n\'aboutit.', ['Mur infranchissable', 'Défense']],
    ['wrestler23', 'Le passage qui suit chaque amenée réussie', 'R', {takedown: 4, gnp: 5}, 'Après chaque projection, une transition immédiate vers une position de frappe dominante.', ['Enchaînement', 'Passage direct']],
    ['wrestler24', 'Le combattant qui choisit où se déroule le combat', 'R', {adaptability: 6, fightIQ: 3}, 'Debout ou au sol, ce combattant décide, et l\'adversaire n\'a plus vraiment son mot à dire.', ['Dictateur', 'Stratégie']],
    ['wrestler25', 'L\'amenée en un seul temps', 'R', {takedown: 6, explosiveness: 3}, 'Une seule prise, un seul geste, et l\'adversaire est déjà au sol avant d\'avoir pu réagir.', ['Instant Takedown', 'Explosivité']],
    ['wrestler26', 'Le contrôle qui vide les jambes adverses', 'R', {cardio: 4, topControl: 5}, 'Un grappling si constant que les jambes de l\'adversaire ne répondent presque plus.', ['Siphonnage', 'Pression']],
    ['wrestler27', 'Le lutteur qu\'on ne fatigue jamais au clinch', 'R', {clinchStr: 5, cardio: 4}, 'Résiste à la pression du corps-à-corps sans jamais montrer de signe de fatigue.', ['Clinch inépuisable', 'Résistance']],
    // --- ÉPIQUES ---
    ['wrestler28', 'L\'amenée qui brise l\'élan adverse', 'E', {takedown: 10, power: 5}, 'Une projection d\'une telle violence qu\'elle laisse l\'adversaire sonné avant même le premier coup.', ['Destruction de rythme', 'Choc brutal']],
    ['wrestler29', 'Le contrôle total qui étouffe toute réaction', 'E', {topControl: 13, submission: 2}, 'Une pression si écrasante que l\'adversaire ne peut ni frapper, ni se défendre, ni respirer.', ['Écrasement total', 'Suprématie']],
    ['wrestler30', 'Le retournement qui inverse un round entier', 'E', {adaptability: 9, explosiveness: 6}, 'En quelques secondes, ce combattant peut renverser un round qui semblait perdu.', ['Miracle', 'Renversement massif']],
    ['wrestler31', 'L\'amenée qui traverse toutes les défenses', 'E', {takedown: 9, fightIQ: 6}, 'Peu importe la préparation de l\'adversaire, cette prise trouve toujours une faille.', ['Lutte absolue', 'Faille infaillible']],
    ['wrestler32', 'Le mur humain contre toute amenée adverse', 'E', {tdd: 9, strength: 6}, 'Aucune tentative de projection adverse ne fonctionne jamais contre lui.', ['Défense impénétrable', 'Ancrage']],
    ['wrestler33', 'Le passage qui ne laisse jamais respirer', 'E', {gnp: 8, topControl: 7}, 'Une série de transitions au sol si rapide que l\'adversaire n\'a jamais le temps de stabiliser sa défense.', ['Tornade au sol', 'Vitesse de contrôle']],
    ['wrestler34', 'Le corps-à-corps qu\'il domine sans exception', 'E', {clinchStr: 15}, 'Dans les échanges rapprochés, ce combattant impose systématiquement son contrôle.', ['Maître du clinch', 'Domination absolue']],
    ['wrestler35', 'L\'amenée qui décide du combat', 'E', {takedown: 9, composure: 6}, 'Une capacité si dominante à mettre l\'adversaire au sol que le combat se joue souvent sur cette seule menace.', ['Menace ultime', 'Contrôle du jeu']],
    // --- LÉGENDAIRES ---
    ['wrestler36', 'Le lutteur qu\'on ne peut jamais relever', 'L', {topControl: 13, strength: 9}, 'Une fois au sol sous son contrôle, l\'adversaire ne se relève quasiment plus.', ['Enclume', 'Condamnation']],
    ['wrestler37', 'L\'amenée qui ne connaît aucune défense connue', 'L', {takedown: 22}, 'Une prise si maîtrisée qu\'aucune technique de défense classique ne semble fonctionner.', ['Takedown parfait', 'Irréparable']],
    ['wrestler38', 'Le grappling qui use un corps entier', 'L', {cardio: 10, strength: 6, heart: 6}, 'Un rythme de contrôle si soutenu que l\'adversaire s\'effondre physiquement bien avant la fin.', ['Usure totale', 'Apocalypse physique']],
    ['wrestler39', 'Le combattant qui choisit chaque seconde', 'L', {fightIQ: 12, adaptability: 10}, 'Debout, au clinch, au sol : à chaque instant, c\'est lui qui décide de la suite.', ['Génie tactique', 'Contrôle omniscient']],
    // --- MYTHIQUE ---
    ['wrestler40', 'Takedown Destructeur', 'M', {takedown: 14, power: 10, killer: 8}, 'Une amenée portée avec une violence telle que l\'adversaire s\'écrase avec une chance réelle de KO à l\'impact.', ['Takedown fatal', 'KO à l\'impact', 'Cataclysme']]
];

// ==========================================
// CATALOGUE BOXE (40/40)
// ==========================================
const SK_BOXER = [
    // --- COMMUNES ---
    ['boxer01', 'Le jab qui mesure toute la distance', 'C', {jab: 3, handSpeed: 2}, 'Le jab, un coup direct et rapide du bras avant, sert à mesurer la distance - ici, il touche presque à chaque fois.', ['Jab', 'Mesure', 'Vitesse']],
    ['boxer02', 'Le crochet qu\'on ne voit jamais arriver', 'C', {hook: 3, handSpeed: 2}, 'Un coup courbe qui contourne la garde adverse par le côté, lancé si naturellement qu\'il passe inaperçu.', ['Crochet', 'Furtivité']],
    ['boxer03', 'Le direct qui casse le rythme', 'C', {cross: 3, power: 2}, 'Le coup puissant en ligne droite depuis l\'épaule arrière, punissant un adversaire qui avance sans prudence.', ['Direct', 'Puissance']],
    ['boxer04', 'L\'esquive qui rend chaque échange gagnant', 'C', {footSpeed: 3, composure: 2}, 'Un jeu de tête et d\'épaules qui fait passer les coups adverses à côté, ouvrant une contre-attaque.', ['Esquive', 'Contre']],
    ['boxer05', 'L\'uppercut qui remonte sous la garde', 'C', {power: 3, hook: 2}, 'Un coup vertical qui passe sous la garde adverse par en dessous, difficile à anticiper.', ['Uppercut', 'Ouverture basse']],
    ['boxer06', 'Le jeu de jambes qui contrôle l\'octogone', 'C', {footSpeed: 5}, 'Ne se laisse jamais acculer contre la cage, toujours en train de couper les angles.', ['Déplacement', 'Contrôle spatial']],
    ['boxer07', 'La garde haute qu\'on ne perce pas', 'C', {durability: 3, tdd: 2}, 'Une garde fermée devant le visage qui absorbe l\'essentiel des coups avant l\'impact.', ['Garde de fer', 'Encaisseur']],
    ['boxer08', 'Le combo qui s\'enchaîne sans respirer', 'C', {handSpeed: 3, cardio: 2}, 'Une série de coups liés sans pause, qui use la résistance adverse.', ['Combo', 'Pression continue']],
    ['boxer09', 'Le contre qui punit chaque attaque adverse', 'C', {composure: 3, power: 2}, 'Attend le mauvais mouvement de l\'adversaire pour répondre exactement au bon moment.', ['Timing', 'Punition']],
    ['boxer10', 'Le corps qui encaisse sans ralentir', 'C', {durability: 5}, 'Absorbe les coups au corps sans que le rythme de frappe n\'en soit affecté.', ['Dur au mal', 'Résistance']],
    ['boxer11', 'Le pas de côté qui évite tout', 'C', {footSpeed: 5}, 'Un déplacement latéral qui sort de la ligne d\'attaque adverse au moment exact où le coup part.', ['Esquive latérale', 'Réflexe']],
    ['boxer12', 'Le jab au corps qui prépare la tête', 'C', {jab: 3, power: 2}, 'Vise le corps pour faire baisser la garde adverse, avant de frapper la tête sans résistance.', ['Leurre', 'Frappe au corps']],
    ['boxer13', 'Le finish de fin de round', 'C', {composure: 5}, 'Termine chaque round avec une dernière offensive qui marque les juges.', ['Sprint final', 'Impression']],
    ['boxer14', 'Le menton qui rentre au bon moment', 'C', {durability: 3, composure: 2}, 'Un réflexe défensif qui rentre le menton pile au moment de l\'impact, réduisant l\'effet des coups reçus.', ['Menton rentré', 'Encaissement']],
    ['boxer15', 'Le rythme qui ne retombe jamais', 'C', {cardio: 5}, 'Garde la même cadence de frappe du premier au dernier round.', ['Cadence infernale', 'Endurance']],
    // --- RARES ---
    ['boxer16', 'Le crochet qui éteint la lumière', 'R', {hook: 5, power: 4}, 'Un crochet d\'une puissance telle qu\'il peut terminer un combat en un seul coup.', ['Finition', 'Force de frappe']],
    ['boxer17', 'L\'esquive qui transforme la défense en sanction', 'R', {composure: 5, power: 4}, 'Chaque esquive s\'accompagne d\'une contre-attaque qui punit la tentative adverse.', ['Esquive offensive', 'Sanction immédiate']],
    ['boxer18', 'L\'uppercut qui traverse la garde fermée', 'R', {power: 5, hook: 4}, 'Trouve une ouverture sous une garde que la plupart considèrent hermétique.', ['Brise-garde', 'Précision']],
    ['boxer19', 'Le jab qui bloque toute avancée', 'R', {jab: 5, footSpeed: 4}, 'Un jab si rapide et répété qu\'il empêche physiquement l\'adversaire d\'entrer dans sa distance.', ['Barrière', 'Répétition']],
    ['boxer20', 'Le combo à quatre coups sans contre possible', 'R', {handSpeed: 9}, 'Une série si liée qu\'aucune ouverture n\'apparaît pour une réponse adverse.', ['Avalanche', 'Vitesse pure']],
    ['boxer21', 'Le corps qui casse la respiration adverse', 'R', {power: 5, cardio: 4}, 'Des coups au corps si précis et répétés qu\'ils épuisent la respiration de l\'adversaire.', ['Destruction du corps', 'Usure cardiovasculaire']],
    ['boxer22', 'La garde qui absorbe les coups lourds', 'R', {durability: 9}, 'Encaisse des frappes qui mettraient n\'importe qui d\'autre en difficulté.', ['Roc défensif', 'Blindage']],
    ['boxer23', 'Le pivot qui change l\'angle de tout le combat', 'R', {footSpeed: 5, fightIQ: 4}, 'Un pivot sur l\'appui avant qui change l\'angle d\'attaque, désorientant l\'adversaire.', ['Pivot fatal', 'Désorientation']],
    ['boxer24', 'Le direct qui punit chaque erreur', 'R', {cross: 5, fightIQ: 4}, 'Un coup direct calibré exactement pour la distance où l\'adversaire se sent en sécurité.', ['Sniper', 'Mesure parfaite']],
    ['boxer25', 'Le contre qui casse l\'élan adverse', 'R', {composure: 9}, 'Intercepte l\'attaque adverse en plein élan, avant qu\'elle n\'atteigne sa cible.', ['Casse-rythme', 'Interception']],
    ['boxer26', 'Le rythme qui impose la fatigue', 'R', {cardio: 5, handSpeed: 4}, 'Une cadence si soutenue que c\'est l\'adversaire qui montre les premiers signes de fatigue.', ['Cadence épuisante', 'Pression constante']],
    ['boxer27', 'Le menton qui ne tombe jamais', 'R', {durability: 5, composure: 4}, 'Résiste à des coups qui devraient normalement terminer le combat.', ['Résilience', 'Indestructible']],
    // --- ÉPIQUES ---
    ['boxer28', 'Le crochet qui met fin au combat d\'un geste', 'E', {hook: 8, power: 7}, 'Une puissance de frappe si rare qu\'un seul coup suffit à terminer le combat.', ['One-punch knockout', 'Crochet mortel']],
    ['boxer29', 'Le combo qui ne laisse aucune échappatoire', 'E', {handSpeed: 10, power: 5}, 'Une série de coups si précisément enchaînée que chaque fuite mène au coup suivant.', ['Traque', 'Combinaison inévitable']],
    ['boxer30', 'L\'esquive parfaite qui rend invisible', 'E', {footSpeed: 10, composure: 5}, 'Une capacité défensive si développée que l\'adversaire touche à peine, round après round.', ['Intouchable', 'Fantôme']],
    ['boxer31', 'Le contre qui devine l\'attaque avant qu\'elle parte', 'E', {fightIQ: 9, composure: 6}, 'Répond à l\'attaque adverse une fraction de seconde avant qu\'elle ne soit lancée.', ['Prescience', 'Contre ultime']],
    ['boxer32', 'Le corps qui absorbe l\'impossible', 'E', {durability: 15}, 'Encaisse des séquences de frappes qui mettraient fin au combat contre n\'importe quel autre.', ['Mur d\'acier', 'Absorption maximale']],
    ['boxer33', 'L\'uppercut qui vient de nulle part', 'E', {power: 9, hook: 6}, 'Un coup vertical exécuté avec une dissimulation telle que même un adversaire prudent ne le voit pas.', ['Coup masqué', 'Surprise absolue']],
    ['boxer34', 'Le rythme qui écrase mentalement l\'adversaire', 'E', {cardio: 8, heart: 7}, 'Une cadence si constante qu\'elle brise la volonté de continuer avant même d\'épuiser le corps.', ['Destruction mentale', 'Pression insoutenable']],
    ['boxer35', 'Le pas qui contrôle l\'intégralité de la distance', 'E', {footSpeed: 9, fightIQ: 6}, 'Décide seul, à chaque instant, à quelle distance le combat se déroule.', ['Maître de l\'espace', 'Distance absolue']],
    // --- LÉGENDAIRES ---
    ['boxer36', 'Le coup qu\'on ne voit jamais partir', 'L', {power: 14, handSpeed: 8}, 'Une frappe si rapide et dissimulée qu\'elle touche avant que l\'adversaire réagisse.', ['Frappe aveugle', 'Vitesse suprême']],
    ['boxer37', 'La défense qu\'on ne perce jamais', 'L', {durability: 13, composure: 9}, 'Une combinaison de garde et de déplacement si maîtrisée que l\'adversaire ne touche jamais.', ['Défense parfaite', 'Forteresse']],
    ['boxer38', 'Le combo qui termine n\'importe quel combat', 'L', {handSpeed: 13, power: 9}, 'Un enchaînement si dévastateur qu\'il met fin à la rencontre dès qu\'il se déclenche pleinement.', ['Avalanche létale', 'Finition garantie']],
    ['boxer39', 'Le rythme qu\'aucun adversaire n\'a tenu', 'L', {cardio: 12, heart: 10}, 'Une cadence si extrême que personne n\'a réussi à la suivre jusqu\'au bout.', ['Rythme légendaire', 'Inépuisable']],
    // --- MYTHIQUE ---
    ['boxer40', 'L\'Interrupteur', 'M', {power: 16, handSpeed: 10, killer: 6}, 'Un seul coup peut terminer n\'importe quel combat à n\'importe quel instant. L\'adversaire combat par peur.', ['Coup létal', 'Terreur', 'Instinct de tueur']]
];

// ==========================================
// CATALOGUE MMA COMPLET (40/40)
// ==========================================
const SK_MMA = [
    // --- COMMUNES (+5) ---
    ['mma01', 'Transition fluide', 'C', {adaptability: 3, fightIQ: 2}, 'Passe de la phase de frappe à la lutte sans le moindre temps mort, brouillant les repères adverses.', ['Transition', 'Imprévisible']],
    ['mma02', 'Le dirty boxing', 'C', {clinchStr: 3, hook: 2}, 'Frappe avec des crochets courts et sales tout en tenant la nuque de l\'adversaire d\'une main.', ['Clinch', 'Boxe sale']],
    ['mma03', 'Contrôle contre la cage', 'C', {clinchStr: 3, topControl: 2}, 'Plaque l\'adversaire contre le grillage pour épuiser ses jambes et dicter le rythme du combat.', ['Cage control', 'Usure']],
    ['mma04', 'Feinte de takedown', 'C', {fightIQ: 3, cross: 2}, 'Baisse les hanches pour simuler une amenée au sol, forçant la garde adverse à descendre avant de frapper la tête.', ['Feinte', 'Ouverture']],
    ['mma05', 'GNP calculé', 'C', {gnp: 3, composure: 2}, 'Ne frappe jamais au sol sans s\'assurer d\'avoir stabilisé sa position au préalable pour ne pas perdre l\'avantage.', ['Patience', 'GNP']],
    ['mma06', 'Défense hybride', 'C', {tdd: 3, footSpeed: 2}, 'Mélange les déplacements latéraux de la boxe et le sprawl de la lutte pour fuir les takedowns.', ['Antilutte', 'Mobilité']],
    ['mma07', 'Lutte offensive opportuniste', 'C', {takedown: 3, adaptability: 2}, 'N\'initie l\'amenée au sol que lorsque l\'adversaire est en déséquilibre suite à une frappe manquée.', ['Opportunisme', 'Takedown']],
    ['mma08', 'Garde MMA', 'C', {guardWork: 3, durability: 2}, 'Une garde au sol adaptée aux frappes, fermant les angles pour éviter le Ground and Pound.', ['Défense au sol', 'Survie']],
    ['mma09', 'L\'overhand du lutteur', 'C', {power: 3, cross: 2}, 'Un coup de poing circulaire puissant qui effraie l\'adversaire et ouvre un chemin direct vers ses jambes.', ['Leurre', 'Frappe lourde']],
    ['mma10', 'Calf Kick de préparation', 'C', {kick: 3, fightIQ: 2}, 'Utilise les frappes basses non pas pour détruire, mais pour planter les appuis adverses avant de lutter.', ['Kick', 'Stratégie']],
    ['mma11', 'Scramble maîtrisé', 'C', {adaptability: 3, explosiveness: 2}, 'Dans les phases de lutte chaotiques, trouve toujours le moyen de finir sur le dessus.', ['Scramble', 'Lutte']],
    ['mma12', 'Rythme du décathlonien', 'C', {cardio: 3, recovery: 2}, 'Possède une condition physique hybride permettant d\'encaisser les changements de rythmes incessants.', ['Cardio hybride', 'Condition']],
    ['mma13', 'Soumission de base (RNC)', 'C', {submission: 3, topControl: 2}, 'Maîtrise parfaitement l\'étranglement arrière dès que l\'adversaire donne son dos dans une transition.', ['Finition', 'Fondamental']],
    ['mma14', 'Coudes de rupture', 'C', {clinchStr: 3, killer: 2}, 'Utilise ses coudes au corps-à-corps pour casser la posture ou créer des coupures stratégiques.', ['Coude', 'Dégâts']],
    ['mma15', 'Distance de sécurité', 'C', {footSpeed: 3, tdd: 2}, 'Garde l\'exacte distance où les frappes sont possibles mais où un takedown direct est trop long à parcourir.', ['Gestion de distance', 'Sécurité']],
    // --- RARES (+9) ---
    ['mma16', 'Le jab-takedown', 'R', {takedown: 5, jab: 4}, 'Le jab n\'est pas là pour faire mal, il sert à aveugler pendant que les hanches plongent dans les jambes.', ['Aveuglement', 'Enchaînement']],
    ['mma17', 'La domination du grillage', 'R', {clinchStr: 5, tdd: 4}, 'Un cauchemar contre la cage. Impossible de le renverser, impossible de s\'enfuir.', ['Mur', 'Cage control']],
    ['mma18', 'Ground and Pound perçant', 'R', {gnp: 5, power: 4}, 'Trouve des angles de frappe au sol qui passent à travers n\'importe quelle tentative de garde.', ['Précision au sol', 'Dégâts']],
    ['mma19', 'QI de l\'octogone', 'R', {fightIQ: 5, adaptability: 4}, 'Sait exactement s\'il gagne ou perd un round, et adapte son agressivité et ses risques en conséquence.', ['Lucidité', 'Intelligence']],
    ['mma20', 'Contre de lutteur', 'R', {cross: 5, tdd: 4}, 'Sprawle sur l\'amenée adverse et utilise le rebond pour envoyer un crochet fulgurant.', ['Sprawl & Brawl', 'Contre']],
    ['mma21', 'Transition de soumission', 'R', {submission: 5, adaptability: 4}, 'Si une clé de bras échoue, il enchaîne instantanément sur un triangle sans perdre sa position dominante.', ['Chaîne', 'Fluidité']],
    ['mma22', 'Le rythme suffocant', 'R', {cardio: 5, aggression: 4}, 'Mélange lutte et frappes à un rythme si intense que l\'adversaire s\'effondre d\'épuisement mental.', ['Pression', 'Usure']],
    ['mma23', 'Frappe masquée', 'R', {handSpeed: 5, fightIQ: 4}, 'Cache ses coups de poing derrière les mouvements de ses épaules pour supprimer le temps de réaction adverse.', ['Furtif', 'Vitesse']],
    ['mma24', 'L\'art du scramble', 'R', {explosiveness: 5, tdd: 4}, 'Transforme chaque tentative de takedown adverse en une position avantageuse pour lui.', ['Inversion', 'Scramble']],
    ['mma25', 'Le kick-boxeur lourd', 'R', {kick: 5, power: 4}, 'Intègre des kicks de destruction massive dans un style qui menace constamment le takedown.', ['Hybride létal', 'Kick lourd']],
    ['mma26', 'Résilience du champion', 'R', {durability: 5, heart: 4}, 'Même sonné ou épuisé, son corps garde en mémoire les fondamentaux pour survivre jusqu\'à la cloche.', ['Survie', 'Cœur']],
    ['mma27', 'La passe d\'arme', 'R', {topControl: 5, gnp: 4}, 'Bloque le bras de l\'adversaire sous sa propre jambe au sol, ouvrant le visage pour des frappes gratuites.', ['Crucifix', 'Finition']],
    // --- ÉPIQUES (+15) ---
    ['mma28', 'Le caméléon', 'E', {adaptability: 8, fightIQ: 7}, 'Peut imiter le style de son adversaire et le battre à son propre jeu, ou changer radicalement de plan au 3ème round.', ['Génie adaptatif', 'Imprévisible']],
    ['mma29', 'La machine à mixer', 'E', {takedown: 8, cross: 7}, 'L\'enchaînement parfait. Chaque coup de poing prépare une lutte, chaque lutte prépare un coup de poing.', ['Synergie', 'Combinaison absolue']],
    ['mma30', 'Le Ground and Pound de l\'enfer', 'E', {gnp: 8, killer: 7}, 'Une fois en position montée, le combat est virtuellement terminé. Ses frappes sont chirurgicales et brutales.', ['Exécuteur au sol', 'Dégâts critiques']],
    ['mma31', 'L\'esprit inébranlable', 'E', {heart: 8, composure: 7}, 'Ne panique jamais, même pris dans une soumission profonde ou acculé sous une pluie de coups.', ['Glace', 'Zéro panique']],
    ['mma32', 'Le maître des transitions', 'E', {adaptability: 8, footSpeed: 7}, 'Il n\'y a aucune ligne de démarcation entre sa boxe, sa lutte et son jiu-jitsu. Tout n\'est qu\'une seule arme.', ['MMA pur', 'Maîtrise']],
    ['mma33', 'L\'omniprésence', 'E', {cardio: 8, aggression: 7}, 'Il est partout à la fois. Pousse l\'adversaire contre la cage, le met au sol, le relève, le frappe, sans aucune pause.', ['Harceleur', 'Endurance max']],
    ['mma34', 'Le mur infranchissable', 'E', {tdd: 8, durability: 7}, 'A neutralisé les meilleurs lutteurs et encaissé les meilleurs puncheurs sans jamais montrer une faiblesse.', ['Forteresse', 'Complet']],
    ['mma35', 'Le tacticien absolu', 'E', {fightIQ: 9, composure: 6}, 'Connaît le livre de jeu de son adversaire mieux que son adversaire lui-même.', ['Tacticien', 'Prescience']],
    // --- LÉGENDAIRES (+22) ---
    ['mma36', 'Le combattant parfait', 'L', {fightIQ: 12, adaptability: 10}, 'Ne possède absolument aucune faiblesse. Dangereux debout, létal au sol, impénétrable en défense.', ['Complet absolu', 'Zéro défaut']],
    ['mma37', 'L\'Instinct de destruction', 'L', {killer: 12, power: 10}, 'A le don inné de trouver la fraction de seconde où le combat peut être terminé, peu importe la phase de jeu.', ['Exécuteur', 'Instinct pur']],
    ['mma38', 'L\'âme de l\'Octogone', 'L', {heart: 12, cardio: 10}, 'Son nom est synonyme de guerre. Refuse de perdre, refuse de tomber, et brise les champions par sa seule volonté.', ['Guerrier ultime', 'Légende']],
    ['mma39', 'Le Dieu des scrambles', 'L', {explosiveness: 12, tdd: 10}, 'Même mis dans la pire des positions, il ressort systématiquement sur le dessus avec une vitesse inhumaine.', ['Magie', 'Inversibilité']],
    // --- MYTHIQUE (+32) ---
    ['mma40', 'L\'Évolution du Sport', 'M', {fightIQ: 12, adaptability: 10, cardio: 10}, 'Il est ce que le MMA sera dans 20 ans. Un style qui ne rentre dans aucune case, fusionnant tout ce qui existe avec une perfection extraterrestre.', ['Génie pur', 'Le Futur', 'GOAT']]
];

// ==========================================
// COMPÉTENCES GÉNÉTIQUES & MÉTA
// (Rareté 'X' pour outrepasser le contrôle de barème de validateSkills)
// ⚠️ Stockées ici mais PAS ENCORE distribuées correctement : rollSkill() ne
// filtre pas encore par famille (gen/meta/country). Tant que rollSkill()
// n'est pas réécrit (prochaine étape), ces compétences peuvent être piochées
// au hasard sur n'importe quel combattant pendant sa carrière, y compris les
// génétiques qui ne devraient s'appliquer qu'à la création.
// ==========================================
const SK_GENETIC = [
    ['gen01', 'Grandes jambes', 'X', {kick: 4, footSpeed: 3}, 'Une allonge naturelle des jambes qui change la distance de combat par défaut.', ['Allonge', 'Génétique']],
    ['gen02', 'Densité osseuse rare', 'X', {power: 4, durability: 3}, 'Un squelette exceptionnellement dense. Ses os agissent comme des masses d\'armes.', ['Densité', 'Génétique']],
    ['gen03', 'Réflexes innés', 'X', {handSpeed: 3, footSpeed: 2}, 'Une vitesse de réaction fulgurante qui précède l\'entraînement.', ['Réflexes', 'Génétique']],
    ['gen04', 'Poumons de fond', 'X', {cardio: 4, recovery: 2}, 'Ne montre jamais de fatigue visible avant le 3e round, même sans camp d\'altitude.', ['Cardio inné', 'Génétique']],
    ['gen05', 'Système nerveux rapide', 'X', {explosiveness: 4, handSpeed: 2}, 'Premier mouvement toujours une fraction plus vite que l\'adversaire.', ['Explosivité', 'Génétique']],
    ['gen06', 'Souplesse rare', 'X', {flexibility: 4, guardWork: 2}, 'Sort de positions articulaires qui devraient normalement se solder par une fracture.', ['Souplesse', 'Génétique']],
    ['gen07', 'Mâchoire de granit congénitale', 'X', {chin: 5}, 'Exception absolue : né avec un menton qui ne se discute pas, capable d\'encaisser l\'impossible sans broncher.', ['Menton', 'Exception']],
    ['gen08', 'Intelligence précoce', 'X', {fightIQ: 3, adaptability: 2}, 'Lit les situations avec une maturité martiale qu\'on ne devrait pas avoir à 18 ans.', ['QI Inné', 'Génétique']],
    ['gen09', 'Silhouette de puncheur', 'X', {power: 3, handSpeed: 2}, 'Une frappe qui porte plus lourd qu\'elle ne devrait pour son gabarit.', ['Puissance innée', 'Génétique']],
    ['gen10', 'Force de paysan', 'X', {strength: 4, topControl: 2}, 'Une force brute "fonctionnelle", acquise avant même d\'avoir soulevé une barre de musculation.', ['Force pure', 'Génétique']]
];

const SK_META = [
    ['meta01', 'Retraite retardée', 'X', {}, 'Un corps qui refuse encore de rendre les armes. Repousse l\'âge de la retraite de deux ans.', ['Longévité', 'Méta']],
    ['meta02', 'Mentor testamentaire', 'X', {}, 'Au moment de la retraite, transmet un bonus permanent à ta prochaine carrière (Nouvelle partie +).', ['Héritage', 'Méta']],
    ['meta03', 'Corps increvable', 'X', {durability: 4, recovery: 3}, 'A traversé assez de guerres pour que son corps ait appris à survivre à tout.', ['Vétéran', 'Méta']],
    ['meta04', 'Contrat à vie', 'X', {}, 'Verrouille un cachet ou une popularité minimum garantie jusqu\'à la retraite.', ['Statut', 'Méta']],
    ['meta05', 'Dernier tour de piste', 'X', {}, 'Pour le tout dernier combat avant la retraite : +6 sur tous les canaux offensifs.', ['Chant du cygne', 'Méta']],
    ['meta06', 'Légende locale', 'X', {}, 'La popularité ne redescend jamais sous un plancher élevé. Le public a déjà décidé qui il est.', ['Aura', 'Méta']]
];

// ==========================================
// COMPÉTENCES DE PAYS (C=+5, 5 pays pour l'instant sur 14)
// ==========================================
const SK_COUNTRY = {
    DAG: [
        ['dag01', 'Sambo de fer', 'C', {takedown: 3, tdd: 2}, 'Lutte rugueuse des montagnes.', ['Lutte', 'Daghestan']],
        ['dag02', 'Lignée du tapis', 'C', {cardio: 3, discipline: 2}, 'Né sur les tapis de lutte, cardio inépuisable.', ['Cardio', 'Daghestan']],
        ['dag03', 'Pression jusqu\'au bout', 'C', {heart: 3, aggression: 2}, 'Mentalité de conquête, n\'accepte pas le recul.', ['Pression', 'Daghestan']],
        ['dag04', 'Contrôle sans relâche', 'C', {topControl: 3, strength: 2}, 'Écrase l\'adversaire avec une maîtrise totale du poids.', ['Contrôle', 'Daghestan']],
        ['dag05', 'Prudence calculée', 'C', {composure: 3, fightIQ: 2}, 'Prend peu de risques, favorise la victoire méthodique.', ['Stratégie', 'Daghestan']]
    ],
    BR: [
        ['br01', 'Jiu-jitsu de la Favela', 'C', {submission: 3, adaptability: 2}, 'Grappling créatif et mortel, forgé dans la rue.', ['BJJ', 'Brésil']],
        ['br02', 'Ginga naturelle', 'C', {footSpeed: 3, flexibility: 2}, 'Déplacements fluides, héritage de la Capoeira.', ['Mouvement', 'Brésil']],
        ['br03', 'Cœur du Nordeste', 'C', {heart: 3, recovery: 2}, 'Un cœur immense qui refuse la défaite.', ['Cœur', 'Brésil']],
        ['br04', 'Style libre', 'C', {adaptability: 3, fightIQ: 2}, 'Improvisation constante et déroutante.', ['Impro', 'Brésil']],
        ['br05', 'Instinct latin', 'C', {killer: 3, aggression: 2}, 'La passion du finish dès qu\'une odeur de sang apparaît.', ['Finition', 'Brésil']]
    ],
    TH: [
        ['th01', 'Clinch du Muay Thaï', 'C', {clinchStr: 3, strength: 2}, 'Maîtrise la nuque adverse comme personne.', ['Clinch', 'Thaïlande']],
        ['th02', 'École du Sud', 'C', {kick: 3, cardio: 2}, 'Kicks dévastateurs et endurance à toute épreuve.', ['Kick', 'Thaïlande']],
        ['th03', 'Genoux de fer', 'C', {clinchStr: 3, gnp: 2}, 'Des genoux qui perforent les organes.', ['Genoux', 'Thaïlande']],
        ['th04', 'Endurance des stades', 'C', {cardio: 3, durability: 2}, 'Habitué à la chaleur étouffante des rings thaïlandais.', ['Endurance', 'Thaïlande']],
        ['th05', 'Élégance martiale', 'C', {footSpeed: 3, composure: 2}, 'Frappe avec une beauté technique déconcertante.', ['Esthétique', 'Thaïlande']]
    ],
    FR: [
        ['fr01', 'Savate de précision', 'C', {kick: 3, footSpeed: 2}, 'Des coups de pieds fluides, chirurgicaux et élégants.', ['Savate', 'France']],
        ['fr02', 'Menton relevé', 'C', {composure: 3, fightIQ: 2}, 'Une fierté qui se traduit par un sang-froid impressionnant.', ['Fierté', 'France']],
        ['fr03', 'Garde structurée', 'C', {durability: 3, tdd: 2}, 'Une défense hermétique issue de l\'école de boxe académique.', ['Garde', 'France']],
        ['fr04', 'Judo de la capitale', 'C', {takedown: 3, adaptability: 2}, 'Balayages et projections à l\'amplitude parfaite.', ['Judo', 'France']],
        ['fr05', 'Cœur d\'outsider', 'C', {heart: 3, recovery: 2}, 'Se sublime toujours face aux champions étrangers.', ['Outsider', 'France']]
    ],
    US: [
        ['us01', 'Lutte universitaire (D1)', 'C', {takedown: 3, topControl: 2}, 'Takedowns surpuissants forgés sur les bancs de la fac.', ['NCAA', 'USA']],
        ['us02', 'Boxe de Philly', 'C', {handSpeed: 3, hook: 2}, 'Des crochets rapides et une défense d\'épaule caractéristique.', ['Philly Shell', 'USA']],
        ['us03', 'Régime industriel', 'C', {strength: 3, explosiveness: 2}, 'Une musculature et une force brute impressionnantes.', ['Force', 'USA']],
        ['us04', 'Bête de spectacle', 'C', {aggression: 3, killer: 2}, 'Cherche le KO à tout prix pour enflammer le public.', ['Showman', 'USA']],
        ['us05', 'Cardio d\'athlète', 'C', {cardio: 3, tdd: 2}, 'Préparation physique poussée à la limite absolue.', ['Athlète', 'USA']]
    ],
    JP: [
        ['jp01', 'L\'Esprit Budo', 'C', {fightIQ: 3, composure: 2}, 'Un respect strict des arts martiaux traditionnels qui se traduit par une discipline de fer.', ['Budo', 'Japon']],
        ['jp02', 'Maître des clés de jambes', 'C', {submission: 3, adaptability: 2}, 'Spécialiste absolu des soumissions sur le bas du corps, plongeant sur la moindre cheville.', ['Leglocks', 'Japon']],
        ['jp03', 'Mentalité Kamikaze', 'C', {killer: 3, heart: 2}, 'Prêt à sacrifier sa propre intégrité physique si cela lui permet de placer le coup fatal.', ['Sacrifice', 'Japon']],
        ['jp04', 'Judo technique', 'C', {takedown: 3, adaptability: 2}, 'Des projections à la hanche d\'une pureté absolue, utilisant la force de son adversaire.', ['Judo', 'Japon']],
        ['jp05', 'Endurance spirituelle', 'C', {recovery: 3, durability: 2}, 'Une capacité à occulter la douleur grâce à une concentration méditative inébranlable.', ['Spirituel', 'Japon']]
    ],
    NG: [
        ['ng01', 'Héritage martial', 'C', {kick: 3, footSpeed: 2}, 'Des déplacements fluides et des coups de pied venus d\'une longue tradition martiale.', ['Style', 'Nigéria']],
        ['ng02', 'Athlète d\'élite', 'C', {cardio: 3, explosiveness: 2}, 'Une condition physique exceptionnelle permettant d\'exploser du premier au dernier round.', ['Athlète', 'Nigéria']],
        ['ng03', 'Allonge trompeuse', 'C', {jab: 3, fightIQ: 2}, 'Utilise parfaitement sa morphologie pour toucher l\'adversaire sans jamais se faire toucher.', ['Distance', 'Nigéria']],
        ['ng04', 'Force fonctionnelle', 'C', {tdd: 3, strength: 2}, 'Une musculature dense qui rend les tentatives de takedown adverses particulièrement inefficaces.', ['Antilutte', 'Nigéria']],
        ['ng05', 'Feintes hypnotiques', 'C', {fightIQ: 3, adaptability: 2}, 'Multiplie les micro-mouvements pour figer la garde et l\'esprit tactique de son adversaire.', ['Feinte', 'Nigéria']]
    ],
    GB: [
        ['gb01', 'Grit britannique', 'C', {heart: 3, durability: 2}, 'Une ténacité exceptionnelle dans l\'adversité, refusant de céder le moindre centimètre.', ['Ténacité', 'Royaume-Uni']],
        ['gb02', 'Boxe de gouttière', 'C', {clinchStr: 3, hook: 2}, 'Excellente maîtrise du dirty boxing et des frappes courtes dans les phases de clinch.', ['Dirty Boxing', 'Royaume-Uni']],
        ['gb03', 'Le jab académique', 'C', {jab: 3, fightIQ: 2}, 'Un jab du bras avant piquant et répétitif qui détruit la vision et le timing adverse.', ['Jab', 'Royaume-Uni']],
        ['gb04', 'Pression constante', 'C', {aggression: 3, cardio: 2}, 'Avance continuellement en fermant les angles, forçant l\'adversaire à combattre sur le reculoir.', ['Pression', 'Royaume-Uni']],
        ['gb05', 'Mental de hooligan', 'C', {power: 3, killer: 2}, 'Se nourrit de l\'énergie de la foule pour transformer le combat en une véritable bagarre de rue.', ['Hooligan', 'Royaume-Uni']]
    ],
    RU: [
        ['ru01', 'Sambo militaire', 'C', {takedown: 3, submission: 2}, 'Un style de corps-à-corps extrêmement rude axé sur les projections dévastatrices et les clés rapides.', ['Sambo', 'Russie']],
        ['ru02', 'Casting Punch', 'C', {cross: 3, power: 2}, 'Un overhand jeté avec tout le poids du corps, masquant souvent une vicieuse entrée en lutte.', ['Overhand', 'Russie']],
        ['ru03', 'Endurance sibérienne', 'C', {cardio: 3, recovery: 2}, 'Conditionné dans un climat hostile, ne montre aucun signe de fatigue physique ou psychologique.', ['Sibérie', 'Russie']],
        ['ru04', 'Maître de la gravité', 'C', {tdd: 3, topControl: 2}, 'Possède un équilibre parfait qui rend presque impossible de le mettre sur le dos face contre terre.', ['Équilibre', 'Russie']],
        ['ru05', 'Discipline de fer', 'C', {discipline: 3, composure: 2}, 'Applique scrupuleusement la stratégie établie dans le coin sans jamais céder à l\'émotion pure.', ['Discipline', 'Russie']]
    ],
    MX: [
        ['mx01', 'Le crochet au foie', 'C', {hook: 3, killer: 2}, 'Vise inlassablement le foie avec des crochets gauches d\'une précision diabolique.', ['Boxe mexicaine', 'Mexique']],
        ['mx02', 'Menton d\'Acapulco', 'C', {durability: 3, heart: 2}, 'Encaisse les coups les plus lourds sans jamais reculer ni montrer la moindre douleur.', ['Menton', 'Mexique']],
        ['mx03', 'Volume asphyxiant', 'C', {handSpeed: 3, cardio: 2}, 'Un débit de coups qui ne s\'arrête jamais, noyant l\'adversaire sous la pression constante.', ['Volume', 'Mexique']],
        ['mx04', 'Guerre de tranchées', 'C', {clinchStr: 3, aggression: 2}, 'Excellence absolue dans le combat de très près, où la violence atteint son paroxysme.', ['Bagarre', 'Mexique']],
        ['mx05', 'Cœur de guerrier', 'C', {heart: 3, recovery: 2}, 'Plus le combat est sanglant et difficile, plus son esprit combatif se renforce.', ['Guerrier', 'Mexique']]
    ],
    IE: [
        ['ie01', 'Le sniper celte', 'C', {cross: 3, fightIQ: 2}, 'Un bras arrière foudroyant qui trouve le menton adverse avec une précision diabolique.', ['Sniper', 'Irlande']],
        ['ie02', 'Trash talk psychologique', 'C', {aggression: 3, killer: 2}, 'Brise mentalement son adversaire avant et pendant le combat, le forçant à commettre des erreurs.', ['Psychologie', 'Irlande']],
        ['ie03', 'Gestion de la distance', 'C', {footSpeed: 3, tdd: 2}, 'Utilise une posture de karaté très large pour entrer et sortir de la zone de danger comme un éclair.', ['Mobilité', 'Irlande']],
        ['ie04', 'Explosivité du premier round', 'C', {explosiveness: 3, power: 2}, 'Une capacité à générer des dégâts critiques dès les premières secondes d\'affrontement dans la cage.', ['Blitz', 'Irlande']],
        ['ie05', 'Combinaisons fluides', 'C', {handSpeed: 3, adaptability: 2}, 'Enchaîne les poings avec un relâchement et une vitesse de bras d\'une beauté fatale.', ['Fluidité', 'Irlande']]
    ],
    KR: [
        ['kr01', 'Esprit du Zombie', 'C', {heart: 3, durability: 2}, 'Continue d\'avancer sous les coups avec une résilience qui terrifie la plupart des adversaires.', ['Résilience', 'Corée']],
        ['kr02', 'Frappe taekwondo', 'C', {kick: 3, explosiveness: 2}, 'Des coups de pied retournés et sautés d\'une précision et d\'une rapidité redoutables.', ['Taekwondo', 'Corée']],
        ['kr03', 'Bagarre de Séoul', 'C', {hook: 3, killer: 2}, 'Accepte volontiers l\'échange de coups directs dans la poche pour trouver le KO instantané.', ['Brawl', 'Corée']],
        ['kr04', 'Garde impénétrable', 'C', {composure: 3, tdd: 2}, 'Garde son calme sous une pression extrême et défend les amenées au sol avec lucidité.', ['Défense', 'Corée']],
        ['kr05', 'Conditionnement', 'C', {cardio: 3, recovery: 2}, 'Un entraînement spartiate qui lui permet de récupérer entre les rounds de manière optimale.', ['Récupération', 'Corée']]
    ],
    CM: [
        ['cm01', 'Force de la nature', 'C', {power: 3, strength: 2}, 'Une puissance de frappe terrifiante capable de déconnecter n\'importe qui sur un seul coup.', ['Destruction', 'Cameroun']],
        ['cm02', 'Instinct du prédateur', 'C', {killer: 3, aggression: 2}, 'Dès qu\'une faiblesse est repérée, il se jette sur sa proie pour terminer le combat brutalement.', ['Finition', 'Cameroun']],
        ['cm03', 'Menton de roc', 'C', {durability: 3, heart: 2}, 'Une constitution physique hors norme qui lui permet d\'encaisser les frappes les plus lourdes.', ['Encaisseur', 'Cameroun']],
        ['cm04', 'Uppercut destructeur', 'C', {hook: 3, explosiveness: 2}, 'Un coup remontant depuis les hanches qui soulève l\'adversaire avant de l\'envoyer au tapis.', ['Uppercut', 'Cameroun']],
        ['cm05', 'Sprawl explosif', 'C', {tdd: 3, power: 2}, 'Rejette violemment les lutteurs vers le sol avec des hanches d\'une lourdeur insoupçonnée.', ['Antilutte', 'Cameroun']]
    ],
    GE: [
        ['ge01', 'Lutte caucasienne', 'C', {takedown: 3, cardio: 2}, 'Enchaîne les tentatives de projection à un rythme effréné jusqu\'à ce que l\'adversaire craque.', ['Lutte', 'Géorgie']],
        ['ge02', 'Crochet de Tbilissi', 'C', {hook: 3, power: 2}, 'Des poings de brique lancés avec une technique parfaite pour casser les gardes les plus solides.', ['Crochet lourd', 'Géorgie']],
        ['ge03', 'Grappling féroce', 'C', {topControl: 3, aggression: 2}, 'Une fois au sol, il ne laisse aucun espace pour respirer et cherche à détruire l\'opposant.', ['Pression au sol', 'Géorgie']],
        ['ge04', 'Mental de fer', 'C', {heart: 3, composure: 2}, 'Une détermination sans faille face à l\'adversité, n\'acceptant jamais la position de dominé.', ['Mental', 'Géorgie']],
        ['ge05', 'Conditionnement total', 'C', {cardio: 3, durability: 2}, 'Un corps forgé dans les salles d\'entraînement les plus rudes pour ne jamais baisser de rythme.', ['Endurance', 'Géorgie']]
    ]
};

regSkills(SK_KARATE, 'style', 'karate');
regSkills(SK_SAMBO, 'style', 'sambo');
regSkills(SK_KICKBOXER, 'style', 'kickboxer');
regSkills(SK_MUAYTHAI, 'style', 'muayThai');
regSkills(SK_BJJ, 'style', 'bjj');
regSkills(SK_WRESTLER, 'style', 'wrestler');
regSkills(SK_BOXER, 'style', 'boxer');
regSkills(SK_MMA, 'style', 'mma');
regSkills(SK_GENETIC, 'gen', null);
regSkills(SK_META, 'meta', null);
for(const ck in SK_COUNTRY){ regSkills(SK_COUNTRY[ck], 'country', ck); }

/* RAR_CHANCE (ancien système, clés françaises) conservé le temps que rollSkill()
   soit remplacé par le tirage en deux temps du plan §6/§18 — étape suivante,
   pas encore faite ici. Le tirage actuel utilisera un fallback neutre (0.03)
   pour ces nouvelles compétences tant que ce remplacement n'est pas fait. */
const RAR_CHANCE={commun:0.10,rare:0.05,epic:0.022,legend:0.006};
