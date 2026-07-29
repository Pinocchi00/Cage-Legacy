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
    // --- COMMUNES (+1/20) ---
    ['karate01', 'Blitzkrieg direct', 'C', {cross: 5}, 'Le poing arrive avant même le bruit de l\'appui.', ['Blitz', 'Vitesse']],
    ['karate02', 'Distance fantôme', 'C', {footSpeed: 5}, 'Recule du strict millimètre nécessaire pour faire rater la frappe.', ['Télémétrie', 'Esquive']],
    ['karate03', 'Gyaku-Zuki', 'C', {power: 5}, 'Coup de poing arrière avec rotation complète des hanches.', ['Frappe lourde', 'Direct']],
    ['karate04', 'Yoko Geri', 'C', {kick: 5}, 'Chassé latéral au genou pour stopper net l\'avancée.', ['Coup d\'arrêt', 'Distance']],
    ['karate05', 'Garde basse', 'C', {composure: 5}, 'Mains baissées, pure confiance en ses réflexes.', ['Provocation', 'Réflexes']],
    ['karate06', 'Mawashi Geri furtif', 'C', {kick: 5}, 'Coup de pied circulaire à l\'armement illisible.', ['Kick masqué', 'Furtivité']],
    ['karate07', 'Kiai perçant', 'C', {aggression: 5}, 'Cri guttural qui paralyse psychologiquement l\'adversaire.', ['Intimidation', 'Cœur']],
    ['karate08', 'Retrait éclair', 'C', {footSpeed: 5}, 'Bond en arrière fulgurant pour annuler toute tentative de lutte.', ['Bord de cage', 'Évasion']],
    ['karate09', 'Kizami-Zuki', 'C', {jab: 5}, 'Jab plongeant utilisé comme une lance.', ['Jab explosif', 'Distance']],
    ['karate10', 'De-Ashi-Barai', 'C', {takedown: 5}, 'Fauchage du pied avant sur le transfert de poids adverse.', ['Balayage', 'Timing']],
    ['karate11', 'Kiba-Dachi', 'C', {tdd: 5}, 'Posture large protégeant des amenées tout en chargeant la hanche.', ['Antilutte', 'Stance']],
    ['karate12', 'Contre en recul', 'C', {fightIQ: 5}, 'Frappe chirurgicale calée sur le bond en arrière.', ['Contre-attaque', 'Recul']],
    ['karate13', 'Ushiro Geri', 'C', {kick: 5}, 'Coup de pied retourné visant exactement la zone hépatique.', ['Frappe au corps', 'Précision']],
    ['karate14', 'Rupture de tempo', 'C', {adaptability: 5}, 'Alterne immobilité totale et explosion de violence.', ['Casse-rythme', 'Imprévisible']],
    ['karate15', 'Rebond permanent', 'C', {cardio: 5}, 'Sautille sur la pointe des pieds sans jamais acidifier ses mollets.', ['Cardio', 'Rebonds']],
    // --- RARES (+2/20) ---
    ['karate16', 'Ouragan de poings', 'R', {handSpeed: 5, explosiveness: 5}, 'Déluge direct qui sature la vision adverse.', ['Volume', 'Blitz']],
    ['karate17', 'Kick par-dessus l\'épaule', 'R', {kick: 5, flexibility: 5}, 'Le tibia passe au-dessus de la garde pour redescendre sur la nuque.', ['High kick', 'Souplesse']],
    ['karate18', 'Sniper de l\'œil', 'R', {jab: 5, fightIQ: 5}, 'Ferme l\'œil de l\'adversaire à coups de jabs millimétrés.', ['Précision', 'Dégâts']],
    ['karate19', 'Esprit de l\'Eau', 'R', {composure: 5, adaptability: 5}, 'Se fluidifie autour des attaques sans jamais s\'opposer en force.', ['Sang-froid', 'Esquive']],
    ['karate20', 'Ura-Mawashi Geri', 'R', {kick: 5, killer: 5}, 'Coup de pied fouetté inversé percutant depuis l\'angle mort.', ['Angle mort', 'Finition']],
    ['karate21', 'Timing Sen-no-sen', 'R', {cross: 5, fightIQ: 5}, 'Frappe dans la demi-seconde exacte de l\'inspiration adverse.', ['Timing absolu', 'Contre']],
    ['karate22', 'Bouclier spatial', 'R', {footSpeed: 5, tdd: 5}, 'Jeu de jambes qui interdit tout contact avec ses propres jambes.', ['Intouchable', 'Distance pure']],
    ['karate23', 'Shuto létal', 'R', {power: 5, handSpeed: 5}, 'Frappe du tranchant de la main visant la clavicule au corps-à-corps.', ['Shuto', 'Frappe atypique']],
    ['karate24', 'Explosion verticale', 'R', {explosiveness: 5, kick: 5}, 'Saut sur place sans appel pour un coup de pied au visage.', ['Sans appel', 'Saut']],
    ['karate25', 'Balayage lourd', 'R', {footSpeed: 5, power: 5}, 'Fauche l\'appui adverse pour provoquer une chute sur la tête.', ['Chute lourde', 'Destruction']],
    ['karate26', 'Souffle du Dragon', 'R', {cardio: 5, aggression: 5}, 'Blitz ininterrompu d\'un bout à l\'autre de la cage.', ['Cardio offensif', 'Harassement']],
    ['karate27', 'Contre simultané', 'R', {composure: 5, handSpeed: 5}, 'N\'esquive pas : frappe en même temps, mais arrive le premier.', ['Anticipation', 'Vitesse']],
    // --- ÉPIQUES (+3/20) ---
    ['karate28', 'Coup du Samouraï', 'E', {cross: 10, power: 5}, 'Direct arrière parfait suffisant pour foudroyer n\'importe quel menton.', ['Ikken Hissatsu', 'One shot']],
    ['karate29', 'Vitesse aveuglante', 'E', {handSpeed: 10, explosiveness: 5}, 'Rapide au-delà de la perception humaine. Ne laisse que des flashs.', ['Foudre', 'Vitesse pure']],
    ['karate30', 'Maître de l\'illusion', 'E', {footSpeed: 5, fightIQ: 5, adaptability: 5}, 'L\'adversaire réagit à des attaques qui n\'existent pas.', ['Feintes', 'Manipulation']],
    ['karate31', 'Kick indétectable', 'E', {kick: 10, composure: 5}, 'Lancé depuis l\'immobilité, sans aucune contraction préalable.', ['Indétectable', 'Furtivité']],
    ['karate32', 'Sixième sens', 'E', {fightIQ: 10, composure: 5}, 'Esquive les combinaisons les mains baissées et les yeux fermés.', ['Instinct', 'Esquive totale']],
    ['karate33', 'Armure de Ki', 'E', {durability: 10, heart: 5}, 'Méditation martiale qui occulte la douleur des low kicks.', ['Transcendance', 'Ignore la douleur']],
    ['karate34', 'Balayage de l\'ombre', 'E', {footSpeed: 10, adaptability: 5}, 'Déplacements qui forcent l\'adversaire à trébucher seul.', ['Perte d\'appuis', 'Danse mortelle']],
    ['karate35', 'Impact cinétique', 'E', {explosiveness: 10, power: 5}, 'Passe de 0 à 100% de force au moment précis de l\'impact.', ['Énergie pure', 'Choc']],
    // --- LÉGENDAIRES (+4/20) ---
    ['karate36', 'Perfection absolue', 'L', {fightIQ: 10, handSpeed: 10}, 'Zéro mouvement inutile. L\'efficacité martiale comme art.', ['Perfection', 'Zéro déchet']],
    ['karate37', 'Flash Extinction', 'L', {footSpeed: 10, killer: 10}, 'Déplacement et frappe exécutés plus vite que le temps de réaction humain.', ['Flash', 'Extinction']],
    ['karate38', 'L\'Insaisissable', 'L', {footSpeed: 10, composure: 10}, 'Cauchemar psychologique : termine le combat sans être touché.', ['Fantôme', 'Intouchable']],
    ['karate39', 'Tornade destructrice', 'L', {kick: 10, explosiveness: 10}, 'Kicks retournés générant une force centrifuge qui brise les os.', ['Tornade', 'Dégâts critiques']],
    // --- MYTHIQUE (+6/20) ---
    ['karate40', 'Ikken Hissatsu', 'M', {footSpeed: 10, kick: 10, killer: 10}, 'L\'esprit martial pur. Un seul coup pour éteindre le monde. Quand il touche, c\'est fini.', ['Mort subite', 'Magie martiale']]
];

// ==========================================
// CATALOGUE SAMBO (40/40)
// ==========================================
const SK_SAMBO = [
    // --- COMMUNES (+1/20) ---
    ['sambo01', 'Fauchage russe', 'C', {takedown: 5}, 'Accroche la jambe et arrache l\'adversaire du sol.', ['O-Soto-Gari', 'Force']],
    ['sambo02', 'Envol du Suplex', 'C', {explosiveness: 5}, 'Projection arrière atterrissant lourdement sur la nuque.', ['Suplex', 'Choc']],
    ['sambo03', 'Poids mort', 'C', {topControl: 5}, 'Lourdeur caractéristique de l\'Est pour aplatir la cible.', ['Pression', 'Contrôle']],
    ['sambo04', 'Arrache-bras', 'C', {submission: 5}, 'Tire avec tout le dos pour forcer la clé (Juji-Gatame).', ['Clé de bras', 'Force pure']],
    ['sambo05', 'Casting Punch', 'C', {cross: 5}, 'Overhand plongeant masquant l\'entrée aux jambes.', ['Leurre', 'Lutte']],
    ['sambo06', 'Plongeon cheville', 'C', {flexibility: 5}, 'Plonge debout pour verrouiller le genou (Kneebar).', ['Kneebar', 'Attaque basse']],
    ['sambo07', 'Rythme caucasien', 'C', {cardio: 5}, 'Enchaîne les projections lourdes sans accélération cardiaque.', ['Cardio russe', 'Inépuisable']],
    ['sambo08', 'Mur de muscles', 'C', {tdd: 5}, 'Bloque les takedowns en opposant une masse immobile.', ['Mur', 'Antilutte']],
    ['sambo09', 'GNP circulaire', 'C', {gnp: 5}, 'Larges mouvements au sol pour casser la garde.', ['GNP', 'Dégâts']],
    ['sambo10', 'Kimura forcée', 'C', {strength: 5}, 'Tord le bras sans technique fine, juste par la force.', ['Kimura', 'Brutalité']],
    ['sambo11', 'Transition masquée', 'C', {adaptability: 5}, 'Lâche la lutte pour envoyer un crochet destructeur.', ['Hybride', 'Feinte']],
    ['sambo12', 'Kesa-Gatame', 'C', {topControl: 5}, 'Verrouille tête et bras, rendant la respiration douloureuse.', ['Contrôle', 'Étouffement']],
    ['sambo13', 'Instinct prédateur', 'C', {aggression: 5}, 'Accélère brutalement à la moindre faiblesse adverse.', ['Instinct', 'Pression']],
    ['sambo14', 'Déni de douleur', 'C', {durability: 5}, 'Ignore les coupures et avance comme une machine.', ['Dur au mal', 'Résilience']],
    ['sambo15', 'Crochetage vicieux', 'C', {fightIQ: 5}, 'Déséquilibre furtif à l\'intérieur de l\'appui.', ['Crochetage', 'Déséquilibre']],
    // --- RARES (+2/20) ---
    ['sambo16', 'Suplex brise-nuque', 'R', {takedown: 5, power: 5}, 'L\'adversaire subit des dégâts critiques à l\'impact au sol.', ['Suplex létal', 'Dégâts']],
    ['sambo17', 'Briseur de chevilles', 'R', {submission: 5, killer: 5}, 'Referme la clé si vite qu\'il casse avant l\'abandon.', ['Clé de cheville', 'Finition']],
    ['sambo18', 'Enclume de l\'Est', 'R', {topControl: 5, strength: 5}, 'Même les maîtres de Jiu-Jitsu ne peuvent plus bouger.', ['Enclume', 'Immobilisation']],
    ['sambo19', 'Overhand foudroyant', 'R', {cross: 5, power: 5}, 'Un poing si lourd qu\'il provoque le knockdown sur le front.', ['Overhand russe', 'KO']],
    ['sambo20', 'Broyeur de côtes', 'R', {strength: 5, clinchStr: 5}, 'Serre la taille jusqu\'à fracturer les côtes flottantes.', ['Étreinte', 'Force pure']],
    ['sambo21', 'Chaîne articulaire', 'R', {submission: 5, adaptability: 5}, 'Passe de l\'épaule au coude puis au poignet en un éclair.', ['Enchaînement', 'Casseur']],
    ['sambo22', 'Dictature au sol', 'R', {takedown: 5, tdd: 5}, 'Ce qu\'il veut attraper finit toujours sur le dos.', ['Domination Lutte', 'Autorité']],
    ['sambo23', 'Frappe sanguinaire', 'R', {gnp: 5, aggression: 5}, 'Le sol devient une zone d\'abattage pour défigurer la cible.', ['Destruction', 'Violence']],
    ['sambo24', 'Mental de Golem', 'R', {heart: 5, composure: 5}, 'Insensible à la foule et à la pression. Un cyborg.', ['Sang-froid', 'Cyborg']],
    ['sambo25', 'Uchi-Mata spatial', 'R', {takedown: 5, explosiveness: 5}, 'Fauchage explosif : la cible fait un soleil avant de s\'écraser.', ['Amplitude', 'Judo']],
    ['sambo26', 'Clé volante', 'R', {submission: 5, explosiveness: 5}, 'Feinte au visage, attrape la cuisse en l\'air.', ['Attaque volante', 'Surprise']],
    ['sambo27', 'Menottes russes', 'R', {cardio: 5, topControl: 5}, 'Accule contre la cage, attache les poignets et épuise.', ['Daghestan', 'Usure']],
    // --- ÉPIQUES (+3/20) ---
    ['sambo28', 'Projection sismique', 'E', {takedown: 10, power: 5}, 'Le souffle coupé au sol s\'accompagne d\'un KO à l\'impact.', ['Choc tellurique', 'Dégâts']],
    ['sambo29', 'Démembrement', 'E', {submission: 10, strength: 5}, 'Brise l\'articulation par la seule force, sans belle technique.', ['Force inhumaine', 'Destruction']],
    ['sambo30', 'Monolithe', 'E', {topControl: 10, durability: 5}, 'Impossible à bouger au sol, impossible à blesser debout.', ['Roc', 'Inamovible']],
    ['sambo31', 'Étreinte de l\'Ours', 'E', {strength: 10, clinchStr: 5}, 'Le corps-à-corps aspire littéralement l\'oxygène de la cible.', ['Étouffement', 'Puissance']],
    ['sambo32', 'Exécution sommaire', 'E', {killer: 10, aggression: 5}, 'Termine le combat avec une froideur absolue à la première faille.', ['Exécuteur', 'Sans pitié']],
    ['sambo33', 'Marteau-piqueur charnel', 'E', {gnp: 10, power: 5}, 'Les poings traversent la garde et font rebondir la tête.', ['Marteau', 'GNP']],
    ['sambo34', 'Maître des déséquilibres', 'E', {takedown: 10, adaptability: 5}, 'Transforme l\'énergie adverse en chutes dévastatrices.', ['Judo', 'Gravité']],
    ['sambo35', 'Chirurgien des rotules', 'E', {submission: 10, fightIQ: 5}, 'Attaque genoux et chevilles depuis des angles géométriques impossibles.', ['Terreur au sol', 'Leglocks']],
    // --- LÉGENDAIRES (+4/20) ---
    ['sambo36', 'Aigle du Caucase', 'L', {topControl: 10, cardio: 10}, 'Une fois au sol, c\'est fini. Un contrôle qui brise les âmes.', ['Soumission mentale', 'Génie']],
    ['sambo37', 'Tsar de la violence', 'L', {power: 10, gnp: 10}, 'Des mains comme des enclumes. Chaque touche, debout ou au sol, est létale.', ['Empereur', 'Frappe atomique']],
    ['sambo38', 'Broyeur d\'os', 'L', {submission: 10, strength: 10}, 'Les adversaires tapent de terreur avant que la clé ne soit engagée.', ['Terreur', 'Casseur']],
    ['sambo39', 'Machine de guerre', 'L', {heart: 10, tdd: 10}, 'Ne recule jamais, ne tombe jamais. Brise les champions par sa constance.', ['Inépuisable', 'Machine']],
    // --- MYTHIQUE (+6/20) ---
    ['sambo40', 'Dernier Empereur', 'M', {takedown: 10, submission: 10, strength: 10}, 'Le mythe du Sambo. Poings foudroyants, projections mortelles, froideur totale.', ['GOAT', 'Invincible']]
];

// ==========================================
// CATALOGUE KICKBOXING (40/40)
// ==========================================
const SK_KICKBOXER = [
    // --- COMMUNES (+1/20) ---
    ['kb01', 'High kick masqué', 'C', {kick: 5}, 'Lancé sans aucun appel du bassin, invisible au départ.', ['High kick', 'Furtivité']],
    ['kb02', 'Low kick chirurgical', 'C', {power: 5}, 'Vise le nerf sciatique avec la précision d\'un scalpel.', ['Low kick', 'Précision']],
    ['kb03', 'Combo poings-pieds', 'C', {handSpeed: 5}, 'Ouvre la garde aux poings, termine par la jambe sans rupture.', ['Combo', 'Fluidité']],
    ['kb04', 'Middle kick perforant', 'C', {cardio: 5}, 'Tibia brutal dans les côtes qui vide les poumons adverses.', ['Middle kick', 'Usure']],
    ['kb05', 'Radar à distance', 'C', {footSpeed: 5}, 'Se tient au millimètre où ses jambes touchent mais pas les poings adverses.', ['Télémétrie', 'Distance']],
    ['kb06', 'Direct d\'interception', 'C', {cross: 5}, 'Déclenché pile quand l\'adversaire arme son attaque.', ['Contre', 'Direct']],
    ['kb07', 'Garde mobile', 'C', {durability: 5}, 'Garde haute hermétique même en déplacement rapide.', ['Protection', 'Blocage']],
    ['kb08', 'Teep repoussoir', 'C', {tdd: 5}, 'Coup frontal sec à la hanche pour refuser la lutte.', ['Teep', 'Défense']],
    ['kb09', 'Niveaux multiples', 'C', {adaptability: 5}, 'Alterne tête, corps et jambes pour disloquer la garde.', ['Variété', 'Imprévisible']],
    ['kb10', 'Appuis vissés', 'C', {strength: 5}, 'Jambes de plomb, impossible à balayer.', ['Stabilité', 'Ancrage']],
    ['kb11', 'Crochet dissuasif', 'C', {hook: 5}, 'Lancé court en sortie d\'échange pour couper la poursuite.', ['Dissuasion', 'Crochet']],
    ['kb12', 'Presse hollandaise', 'C', {aggression: 5}, 'Avance constamment sous combinaisons lourdes.', ['Pression', 'Style Dutch']],
    ['kb13', 'Genou d\'arrêt', 'C', {clinchStr: 5}, 'Piston remontant ciblant les plongeons de lutte.', ['Interception', 'Genou']],
    ['kb14', 'Départ explosif', 'C', {explosiveness: 5}, 'Prend l\'adversaire de vitesse sur le tout premier appui.', ['Vitesse pure', 'Explosion']],
    ['kb15', 'Tibia désensibilisé', 'C', {recovery: 5}, 'Absorbe les impacts os contre os sans broncher.', ['Conditionnement', 'Dur au mal']],
    // --- RARES (+2/20) ---
    ['kb16', 'Kick liane', 'R', {kick: 5, flexibility: 5}, 'Tibia fouettant la nuque par-dessus la garde fermée.', ['High kick', 'Souplesse']],
    ['kb17', 'Bûcheron', 'R', {kick: 5, power: 5}, 'Fait perdre les appuis à l\'adversaire dès le premier impact sur la cuisse.', ['Destruction', 'Dégâts']],
    ['kb18', 'Avalanche', 'R', {aggression: 5, handSpeed: 5}, 'Déluge ininterrompu de 8 coups sans laisser respirer.', ['Pression extrême', 'Volume']],
    ['kb19', 'Retrait et sanction', 'R', {footSpeed: 5, cross: 5}, 'Recule d\'un demi-pas pour placer le direct dévastateur.', ['Pas de retrait', 'Contre']],
    ['kb20', 'Chercheur de foie', 'R', {kick: 5, killer: 5}, 'Glisse le pied gauche sous les côtes flottantes avec cynisme.', ['Frappe hépatique', 'Finition']],
    ['kb21', 'Dictateur de l\'espace', 'R', {footSpeed: 5, fightIQ: 5}, 'L\'adversaire passe le combat à courir après un fantôme.', ['Contrôle spatial', 'Insaisissable']],
    ['kb22', 'Blindage complet', 'R', {durability: 5, tdd: 5}, 'Encaisse les pires frappes et repousse toute projection.', ['Forteresse', 'Mur']],
    ['kb23', 'Teep sternum', 'R', {kick: 5, power: 5}, 'Frontal poussé par les hanches, capable de fracturer les côtes.', ['Teep lourd', 'Choc']],
    ['kb24', 'Tornade rotative', 'R', {kick: 5, explosiveness: 5}, 'Esquive transformée en coup de pied retourné éclair.', ['Spinning kick', 'Spectacle']],
    ['kb25', 'Piston vertical', 'R', {clinchStr: 5, power: 5}, 'Punit le moindre changement de niveau par un genou létal.', ['Sanction basse', 'Genou']],
    ['kb26', 'Poumons montagnards', 'R', {cardio: 5, recovery: 5}, 'Kicks aussi rapides au 3ème round qu\'à la première seconde.', ['Acier', 'Constance']],
    ['kb27', 'Calf kick paralysant', 'R', {kick: 5, fightIQ: 5}, 'Vise le mollet pour détruire le jeu de jambes adverse.', ['Calf kick', 'Neutralisation']],
    // --- ÉPIQUES (+3/20) ---
    ['kb28', 'Lame de tibia', 'E', {kick: 10, power: 5}, 'High kick d\'une violence telle que le combat s\'arrête net à l\'impact.', ['Finition', 'Tibia d\'acier']],
    ['kb29', 'Tempête continue', 'E', {handSpeed: 10, cardio: 5}, 'Submerge la défense, le cardio et l\'âme de la cible en même temps.', ['Submersion', 'Rythme']],
    ['kb30', 'Sniper articulaire', 'E', {kick: 10, fightIQ: 5}, 'Chaque kick est calculé sur la faiblesse biomécanique exacte de l\'opposant.', ['Sniper', 'Tactique']],
    ['kb31', 'Esquive quantique', 'E', {footSpeed: 10, composure: 5}, 'Déplacements anticipés : l\'adversaire ne touche jamais sa cible.', ['Fantôme', 'Mouvement absolu']],
    ['kb32', 'Prescience', 'E', {cross: 10, fightIQ: 5}, 'Lance la contre-attaque avant même que le poing adverse ne soit armé.', ['Anticipation pure', 'Contre']],
    ['kb33', 'Squelette d\'acier', 'E', {durability: 10, recovery: 5}, 'Absorbe des dommages colossaux tout en avançant en souriant.', ['Indestructible', 'Titan']],
    ['kb34', 'Superordinateur', 'E', {adaptability: 10, fightIQ: 5}, 'Trouve la faille de n\'importe quel style en deux échanges.', ['QI de combat', 'Échecs']],
    ['kb35', 'Point d\'interrogation', 'E', {kick: 10, flexibility: 5}, 'Lève la jambe pour un low kick, la transforme en high kick en vol.', ['Feinte ultime', 'Question mark']],
    // --- LÉGENDAIRES (+4/20) ---
    ['kb36', 'Vitesse du son', 'L', {kick: 10, power: 10}, 'On entend le sifflement du tibia dans l\'air avant la destruction de la garde.', ['Vitesse', 'Destruction']],
    ['kb37', 'Code source adverse', 'L', {fightIQ: 10, adaptability: 10}, 'Au round 2, chaque attaque ennemie est punie d\'une erreur fatale.', ['Prescience', 'Adaptabilité']],
    ['kb38', 'Volume infernal', 'L', {cardio: 10, aggression: 10}, 'Pression psychologique et physique que le corps humain ne peut supporter.', ['Machine', 'Asphyxie']],
    ['kb39', 'Contre absolu', 'L', {composure: 10, cross: 10}, 'Une micro-erreur adverse suffit pour foudroyer le combat.', ['Punition finale', 'Précision']],
    // --- MYTHIQUE (+6/20) ---
    ['kb40', 'Hôpital ou Cimetière', 'M', {kick: 10, power: 10, killer: 10}, 'Jambe droite, l\'hôpital. Jambe gauche, le cimetière. La promesse d\'une extinction.', ['Cro Cop', 'Terreur']]
];

// ==========================================
// CATALOGUE MUAY THAÏ (40/40)
// ==========================================
const SK_MUAYTHAI = [
    // --- COMMUNES (+1/20) ---
    ['mt01', 'Étau cervical', 'C', {clinchStr: 5}, 'Casse la posture à deux mains pour forcer le combat rapproché.', ['Plum', 'Contrôle']],
    ['mt02', 'Genou flottant', 'C', {power: 5}, 'Genou piqué avec haine dans les côtes flottantes au corps-à-corps.', ['Genou', 'Dégâts']],
    ['mt03', 'Batte de baseball', 'C', {kick: 5}, 'Low kick lourd cherchant la destruction musculaire, pas la vitesse.', ['Tibia lourd', 'Frappe']],
    ['mt04', 'Garde de granit', 'C', {durability: 5}, 'Encaisse sur la garde haute pour marcher sur l\'adversaire.', ['Marche en avant', 'Blocage']],
    ['mt05', 'Coude furtif', 'C', {handSpeed: 5}, 'Coude horizontal cherchant l\'arcade sourcilière.', ['Coude', 'Sang']],
    ['mt06', 'Teep de frustration', 'C', {tdd: 5}, 'Frontal lourd brisant le rythme adverse à distance.', ['Teep', 'Distance']],
    ['mt07', 'Sweep thaï', 'C', {footSpeed: 5}, 'Fauchage au clinch envoyant brutalement au tapis.', ['Balayage', 'Déséquilibre']],
    ['mt08', 'Carburant de douleur', 'C', {heart: 5}, 'La douleur agit comme un amplificateur d\'agressivité.', ['Cœur', 'Résilience']],
    ['mt09', 'Casseur de bras', 'C', {strength: 5}, 'Middle kick frappé dans les bras pour briser l\'avant-bras.', ['Frappe destructrice', 'Usure']],
    ['mt10', 'Envol du genou', 'C', {explosiveness: 5}, 'Genou volant sans appel visant le menton.', ['Genou volant', 'Explosif']],
    ['mt11', 'Tronc d\'arbre', 'C', {tdd: 5}, 'Hanches lourdes interdisant toute tentative de takedown.', ['Ancrage', 'Antilutte']],
    ['mt12', 'Lame verticale', 'C', {power: 5}, 'Coude uppercut de bas en haut fendant la garde.', ['Coude vertical', 'Corps-à-corps']],
    ['mt13', 'Check destructeur', 'C', {durability: 5}, 'Pare les low kicks avec son tibia, détruisant la jambe adverse.', ['Check', 'Tibia']],
    ['mt14', 'Marche implacable', 'C', {aggression: 5}, 'Réduit l\'espace vital pas à pas sans paniquer.', ['Pression', 'Marche']],
    ['mt15', 'Crochet de poche', 'C', {hook: 5}, 'Puissance surprenante en boxe très courte au clinch.', ['Boxe courte', 'Clinch']],
    // --- RARES (+2/20) ---
    ['mt16', 'Plum de Bangkok', 'R', {clinchStr: 5, strength: 5}, 'Verrouille la nuque. L\'adversaire ne relèvera plus la tête.', ['Clinch mortel', 'Domination']],
    ['mt17', 'Pluie de genoux', 'R', {clinchStr: 5, cardio: 5}, 'Enchaîne les genoux au corps jusqu\'à vider l\'âme adverse.', ['Dégâts', 'Genoux']],
    ['mt18', 'Rasoir crânien', 'R', {clinchStr: 5, killer: 5}, 'Ouvre le visage à coups de coude pour forcer l\'arrêt médical.', ['Coude', 'Finition cut']],
    ['mt19', 'Briseur de côtes', 'R', {kick: 5, power: 5}, 'Middle kick d\'une violence qui résonne dans la salle.', ['Middle Kick', 'Destruction']],
    ['mt20', 'Sourire d\'Isaan', 'R', {durability: 5, heart: 5}, 'Soutient le regard et sourit en encaissant les pires combos.', ['Roc', 'Indestructible']],
    ['mt21', 'Projection humiliante', 'R', {clinchStr: 5, tdd: 5}, 'Joue avec le centre de gravité au clinch pour projeter durement.', ['Sweep thaï', 'Déséquilibre']],
    ['mt22', 'Huit membres', 'R', {adaptability: 5, kick: 5}, 'Harmonie martiale poings/pieds/genoux/coudes saturant la défense.', ['Variété', 'Surcharge']],
    ['mt23', 'Empreinte faciale', 'R', {kick: 5, flexibility: 5}, 'Teep claqué brutalement sur le nez en guise de provocation.', ['Teep haut', 'Humiliation']],
    ['mt24', 'Pression Zombie', 'R', {aggression: 5, durability: 5}, 'Les dégâts ne font qu\'accélérer sa marche en avant.', ['Pression', 'Traque']],
    ['mt25', 'Interception coude', 'R', {clinchStr: 5, composure: 5}, 'Pointe de coude posée en plein visage sur l\'avancée adverse.', ['Interception', 'Coude']],
    ['mt26', 'Amputation', 'R', {kick: 5, power: 5}, 'La jambe avant adverse cède et boite dès le second round.', ['Low Kick', 'Neutralisation']],
    ['mt27', 'Forteresse thaï', 'R', {composure: 5, tdd: 5}, 'Hanches impénétrables, appuis parfaits face aux lutteurs.', ['Défense thaï', 'Mur']],
    // --- ÉPIQUES (+3/20) ---
    ['mt28', 'Dieu du Plum', 'E', {clinchStr: 10, strength: 5}, 'Être attrapé par sa nuque est une sentence d\'abattage.', ['Clinch absolu', 'Soumission debout']],
    ['mt29', 'Os de fer', 'E', {kick: 10, durability: 5}, 'Tibias conditionnés sur des arbres brisant os et volontés.', ['Destruction osseuse', 'Frappe lourde']],
    ['mt30', 'Chirurgien esthétique', 'E', {clinchStr: 10, killer: 5}, 'Trouve la faille millimétrée pour le coude qui clot le match en sang.', ['Boucherie', 'Finition cut']],
    ['mt31', 'Cœur de Nak Muay', 'E', {heart: 10, recovery: 5}, 'Même au bord du KO, renverse la guerre avec une froideur brutale.', ['Résurrection', 'Cœur de lion']],
    ['mt32', 'Chef d\'orchestre', 'E', {fightIQ: 10, adaptability: 5}, 'Punit chaque micro-erreur avec l\'arme des 8 membres appropriée.', ['Maîtrise totale', 'QI Tactique']],
    ['mt33', 'Compresseur', 'E', {aggression: 10, cardio: 5}, 'Une tempête de genoux/coudes qui étouffe le volume de l\'adversaire.', ['Étouffement', 'Volume']],
    ['mt34', 'Mur du Lumpinee', 'E', {durability: 10, tdd: 5}, 'Immunisé aux lutteurs, insensible à la douleur, brise les ego.', ['Impassibilité', 'Mur']],
    ['mt35', 'Genou décapitant', 'E', {clinchStr: 10, explosiveness: 5}, 'Genou sauté d\'une pureté telle qu\'il déconnecte la cible.', ['Genou KO', 'Finition']],
    // --- LÉGENDAIRES (+4/20) ---
    ['mt36', 'Artiste martial absolu', 'L', {clinchStr: 10, kick: 10}, 'L\'incarnation du Muay Thaï. Fluide, meurtrier, intouchable.', ['Légende', 'Maîtrise absolue']],
    ['mt37', 'Démon de violence', 'L', {killer: 10, power: 10}, 'Détruire physiquement l\'adversaire est son seul et unique but.', ['Destruction', 'Terreur']],
    ['mt38', 'Immortel', 'L', {durability: 10, heart: 10}, 'Traverse l\'enfer sans reculer, brisant l\'âme de ses adversaires.', ['Immortel', 'Cœur']],
    ['mt39', 'Tyran du corps', 'L', {clinchStr: 10, strength: 10}, 'Manipule le poids des combattants mondiaux comme des enfants.', ['Tyran', 'Manipulation']],
    // --- MYTHIQUE (+6/20) ---
    ['mt40', 'L\'Héritier', 'M', {kick: 10, clinchStr: 10, durability: 10}, 'La perfection violente. Tibias fracassants, coudes tranchants, n\'a jamais reculé.', ['Dieu du stade', 'Légende thaï']]
];

// ==========================================
// CATALOGUE BJJ (40/40)
// ==========================================
const SK_BJJ = [
    // --- COMMUNES (+1/20) ---
    ['bjj01', 'Garde cadenas', 'C', {guardWork: 5}, 'Jambes enroulées ne s\'ouvrant jamais sous la pression.', ['Garde fermée', 'Usure']],
    ['bjj02', 'Aimant à garde', 'C', {adaptability: 5}, 'Retrouve la garde instantanément en cas de perte de position.', ['Transition', 'Récupération']],
    ['bjj03', 'Passe-muraille', 'C', {topControl: 5}, 'Passe la garde sans effort pour s\'installer en dominant.', ['Fluidité', 'Offensive']],
    ['bjj04', 'Ascenseur pelvien', 'C', {explosiveness: 5}, 'Balayage brutal des hanches inversant la domination au sol.', ['Balayage', 'Explosivité']],
    ['bjj05', 'Sangsue dorsale', 'C', {topControl: 5}, 'Prend le dos et ne le lâche plus jamais.', ['Contrôle dos', 'Menace']],
    ['bjj06', 'Col croisé', 'C', {submission: 5}, 'Étranglement classique forcé depuis la garde fermée.', ['Étranglement', 'Soumission']],
    ['bjj07', 'Rotation Kimura', 'C', {submission: 5}, 'Clé d\'épaule inversée engagée avant même d\'être comprise.', ['Kimura', 'Clé de bras']],
    ['bjj08', 'Americana surprise', 'C', {submission: 5}, 'Plie le bras en équerre au sol de façon quasi invisible.', ['Americana', 'Clé de bras']],
    ['bjj09', 'Demi-garde de fer', 'C', {guardWork: 5}, 'Garde incomplète mais usant dramatiquement la force adverse.', ['Demi-garde', 'Contrôle']],
    ['bjj10', 'Clinch de transition', 'C', {clinchStr: 5}, 'Saisit debout pour choisir l\'angle parfait de la chute.', ['Clinch', 'Préparation']],
    ['bjj11', 'Savon humain', 'C', {flexibility: 5}, 'S\'échappe au millimètre des clés les plus verrouillées.', ['Évasion', 'Défense']],
    ['bjj12', 'Genou compresseur', 'C', {topControl: 5}, 'Genou pesant sur l\'estomac, coupant l\'oxygène adverse.', ['Knee on belly', 'Pression']],
    ['bjj13', 'Troisième appui', 'C', {tdd: 5}, 'Se sert de la cage pour annuler la gravité du lutteur.', ['Antijeu', 'Mur']],
    ['bjj14', 'Articulations élastiques', 'C', {flexibility: 5}, 'Supporte des angles de torsion inatteignables sans taper.', ['Souplesse', 'Survie']],
    ['bjj15', 'Apnée du sol', 'C', {cardio: 5}, 'Ne s\'épuise jamais dans les échanges de lutte complexes.', ['Cardio sol', 'Grappling']],
    // --- RARES (+2/20) ---
    ['bjj16', 'Guillotine réflexe', 'R', {submission: 5, tdd: 5}, 'Punit l\'amenée de lutte adverse par un étranglement debout.', ['Contre', 'Guillotine']],
    ['bjj17', 'Nœud coulant', 'R', {submission: 5, guardWork: 5}, 'Triangle verrouillé à la volée comme un nœud coulant vivant.', ['Triangle', 'Technique']],
    ['bjj18', 'Piège D\'Arce', 'R', {submission: 5, gnp: 5}, 'Emprisonne le bras adverse contre son propre cou.', ['D\'Arce', 'Piège']],
    ['bjj19', 'Étouffement Flue', 'R', {submission: 5, topControl: 5}, 'Étouffe l\'adversaire avec son propre poids sur une erreur.', ['Von Flue', 'Contre']],
    ['bjj20', 'Ressort de cage', 'R', {tdd: 5, guardWork: 5}, 'Se redresse le long du grillage avec une obstination folle.', ['Résilience', 'Relevé']],
    ['bjj21', 'Navigateur du Chaos', 'R', {adaptability: 5, explosiveness: 5}, 'Gagne systématiquement les transitions scrambles confuses.', ['Scramble', 'Adaptabilité']],
    ['bjj22', 'Condamnation dorsale', 'R', {submission: 5, topControl: 5}, 'Une fois dans le dos, la soumission est une fatalité mathématique.', ['Prise de dos', 'Finition']],
    ['bjj23', 'Lame chaude dans le beurre', 'R', {gnp: 5, explosiveness: 5}, 'Passe la garde en un éclair fulgurant inarrêtable.', ['Passage éclair', 'Offensive']],
    ['bjj24', 'Anti-guillotine', 'R', {tdd: 5, fightIQ: 5}, 'Abolit tout risque de soumission sur ses propres amenées.', ['Anticipation', 'Défense']],
    ['bjj25', 'Étau de l\'épaule', 'R', {submission: 5, topControl: 5}, 'Pression constante au sol détruisant l\'épaule lentement.', ['Pression', 'Menace']],
    ['bjj26', 'Chasseur de talons', 'R', {submission: 5, flexibility: 5}, 'Isole et tord la cheville d\'un adversaire regardant en haut.', ['Clé de jambe', 'Jambes']],
    ['bjj27', 'Crampon', 'R', {topControl: 5, heart: 5}, 'Ne lâche jamais un dos, même physiquement vidé.', ['Opiniâtreté', 'Grappling']],
    // --- ÉPIQUES (+3/20) ---
    ['bjj28', 'Roulade Imanari', 'E', {submission: 10, flexibility: 5}, 'Attaque de jambe foudroyante lancée depuis la distance.', ['Imanari', 'Imprévisible']],
    ['bjj29', 'Lacet Anaconda', 'E', {submission: 10, topControl: 5}, 'Étranglement massif enlaçant tête et bras au sol.', ['Anaconda', 'Pression mortelle']],
    ['bjj30', 'Cravate péruvienne', 'E', {submission: 15}, 'Soumission rare exécutée sur un lutteur à 4 pattes.', ['Peruvian Necktie', 'Inédit']],
    ['bjj31', 'Isolement chirurgical', 'E', {submission: 10, strength: 5}, 'Immobilisation corporelle pour plier un membre unique.', ['Isolement', 'Force brute']],
    ['bjj32', 'Prédateur dorsal', 'E', {topControl: 10, submission: 5}, 'Un chasseur de nuque qui ne renonce jamais une fois derrière.', ['Traque', 'Domination']],
    ['bjj33', 'Toile d\'araignée', 'E', {guardWork: 10, submission: 5}, 'Contrôle les hanches avec ses pieds, bloquant toute fuite.', ['Garde araignée', 'Contrôle lointain']],
    ['bjj34', 'Bascule de l\'ombre', 'E', {explosiveness: 10, guardWork: 5}, 'Retourne une situation perdue d\'un coup de rein divin.', ['Renversement', 'Explosivité']],
    ['bjj35', 'Fracture éclair', 'E', {submission: 10, killer: 5}, 'Clé de jambe abyssale exécutée avant que la cible ne réalise.', ['Clé éclair', 'Destruction']],
    // --- LÉGENDAIRES (+4/20) ---
    ['bjj36', 'Torsion Twister', 'L', {submission: 10, flexibility: 10}, 'Tord la colonne vertébrale depuis une position de contrôle rare.', ['Twister', 'Souplesse absolue']],
    ['bjj37', 'Spirale Berimbolo', 'L', {guardWork: 10, adaptability: 10}, 'Rotations complexes prenant le dos d\'un adversaire ahuri.', ['Berimbolo', 'Rotation']],
    ['bjj38', 'Hydre de soumissions', 'L', {submission: 10, fightIQ: 10}, 'Chaque défense ennemie ouvre une nouvelle clé fatale.', ['Enchaînement', 'Pression constante']],
    ['bjj39', 'Asphyxie fantôme', 'L', {submission: 10, composure: 10}, 'Se referme si doucement que la cible dort avant de taper.', ['Piège', 'Sang-froid']],
    // --- MYTHIQUE (+6/20) ---
    ['bjj40', 'Matrice Inévitable', 'M', {submission: 10, guardWork: 10, fightIQ: 10}, 'Peu importe la posture, 3 soumissions te guettent. Tu es mort avant d\'être au sol.', ['Omniprésence', 'Génie du sol']]
];

// ==========================================
// CATALOGUE LUTTE (40/40)
// ==========================================
const SK_WRESTLER = [
    // --- COMMUNES (+1/20) ---
    ['wrestler01', 'Plongeon réflexe', 'C', {takedown: 5}, 'Prise aux jambes fulgurante surprenant toute attente.', ['Amenée', 'Réflexe']],
    ['wrestler02', 'Sprawl de plomb', 'C', {tdd: 5}, 'Hanches de béton écrasant la tentative de lutte adverse.', ['Sprawl', 'Défense']],
    ['wrestler03', 'Ressort humain', 'C', {cardio: 5}, 'Se relève debout presque magiquement après chaque chute.', ['Relevé', 'Endurance']],
    ['wrestler04', 'Poigne d\'ours', 'C', {clinchStr: 5}, 'Contrôle brutal du buste facilitant la prochaine chute.', ['Contrôle haut', 'Préparation']],
    ['wrestler05', 'Ceinture de fer', 'C', {strength: 5}, 'Serre la taille adverse le privant de toute liberté.', ['Verrou', 'Puissance']],
    ['wrestler06', 'Simple leg millimétré', 'C', {takedown: 5}, 'Arrachage d\'une seule jambe, bas et insaisissable.', ['Single leg', 'Précision']],
    ['wrestler07', 'Double leg bélier', 'C', {explosiveness: 5}, 'Emporte les deux jambes avec l\'élan d\'un bulldozer.', ['Double leg', 'Impact']],
    ['wrestler08', 'Gravité écrasante', 'C', {topControl: 5}, 'Poids mort sur la cage thoracique empêchant la respiration.', ['Poids lourd', 'Domination']],
    ['wrestler09', 'Sac à dos', 'C', {topControl: 5}, 'Crochète la taille arrière et refuse d\'en descendre.', ['Dos', 'Transition']],
    ['wrestler10', 'Trépied de cage', 'C', {tdd: 5}, 'Se sert du grillage comme appui pour annuler le takedown.', ['Mur défensif', 'Cage']],
    ['wrestler11', 'Distance zéro', 'C', {clinchStr: 5}, 'Étouffe au corps-à-corps pour supprimer les frappes.', ['Clinch', 'Défense']],
    ['wrestler12', 'Ascenseur', 'C', {footSpeed: 5}, 'Change de niveau avec une vélocité perturbante.', ['Niveau', 'Surprise']],
    ['wrestler13', 'Base inébranlable', 'C', {durability: 5}, 'Centre de gravité tellement bas qu\'on ne le renverse pas.', ['Base', 'Inébranlable']],
    ['wrestler14', 'Cavalier de position', 'C', {fightIQ: 5}, 'Place son poids stratégiquement pour annuler les fuites.', ['Placement', 'QI']],
    ['wrestler15', 'Troisième poumon', 'C', {cardio: 5}, 'Tient la cadence de lutte infernale sur trois rounds.', ['Cardio lutte', 'Machine']],
    // --- RARES (+2/20) ---
    ['wrestler16', 'Crash test', 'R', {takedown: 5, strength: 5}, 'Plaque littéralement la cible sur le grillage en plongeant.', ['Violence', 'Cage control']],
    ['wrestler17', 'Switch inattendu', 'R', {takedown: 5, adaptability: 5}, 'Renverse le contrôle d\'une posture totalement défensive.', ['Inversion', 'Adaptabilité']],
    ['wrestler18', 'Béton coulé', 'R', {topControl: 5, gnp: 5}, 'Pression au sol absolue pour déverser un GNP sauvage.', ['Étouffement', 'Frappe au sol']],
    ['wrestler19', 'Briseur de volonté', 'R', {strength: 5, heart: 5}, 'Contrôle à la taille brisant l\'esprit de combat ennemi.', ['Ascendant', 'Force pure']],
    ['wrestler20', 'Crochet intérieur', 'R', {takedown: 5, clinchStr: 5}, 'Passe aux jambes depuis le clinch sans préparation visible.', ['Transition', 'Clinch létal']],
    ['wrestler21', 'Siphonneur d\'air', 'R', {takedown: 5, cardio: 5}, 'Usure systématique par une avalanche de takedowns rythmés.', ['Usure', 'Cadence']],
    ['wrestler22', 'Forteresse murale', 'R', {tdd: 10}, 'Acculé au grillage, aucune tentative ne le met à terre.', ['Mur infranchissable', 'Défense']],
    ['wrestler23', 'Passage direct', 'R', {takedown: 5, gnp: 5}, 'La projection est suivie instantanément d\'une frappe lourde.', ['Enchaînement', 'GNP direct']],
    ['wrestler24', 'Dictateur d\'arène', 'R', {adaptability: 5, fightIQ: 5}, 'Choisit la zone du combat (sol/debout) et l\'y maintient.', ['Dictateur', 'Stratégie']],
    ['wrestler25', 'Amenée quantique', 'R', {takedown: 5, explosiveness: 5}, 'Une seule prise fulgurante, sans la moindre résistance.', ['Instant Takedown', 'Explosion']],
    ['wrestler26', 'Laiton coulé', 'R', {cardio: 5, topControl: 5}, 'Le poids ne bouge pas, vidant les jambes adverses.', ['Siphonnage', 'Pression']],
    ['wrestler27', 'Poutre de clinch', 'R', {clinchStr: 5, cardio: 5}, 'Absorbe la lutte au corps-à-corps en souriant à l\'usure.', ['Clinch inépuisable', 'Résistance']],
    // --- ÉPIQUES (+3/20) ---
    ['wrestler28', 'Commotion sur projection', 'E', {takedown: 10, power: 5}, 'La chute seule laisse l\'adversaire presque KO.', ['Destruction de rythme', 'Choc brutal']],
    ['wrestler29', 'Asphyxie positionnelle', 'E', {topControl: 10, strength: 5}, 'Contrôle démoniaque interdisant de frapper ou respirer.', ['Écrasement total', 'Suprématie']],
    ['wrestler30', 'Inversion miraculeuse', 'E', {adaptability: 10, explosiveness: 5}, 'Renverse un round perdu en une fraction de seconde magique.', ['Miracle', 'Scramble']],
    ['wrestler31', 'Faille inévitable', 'E', {takedown: 10, fightIQ: 5}, 'Trouve la brèche sur n\'importe quelle défense préparée.', ['Lutte absolue', 'Takedown']],
    ['wrestler32', 'Montagne humaine', 'E', {tdd: 10, strength: 5}, 'Défense de plomb. Impossible à renverser.', ['Défense impénétrable', 'Ancrage']],
    ['wrestler33', 'Tornade de contrôle', 'E', {gnp: 10, topControl: 5}, 'Série de passages empêchant la cible de stabiliser sa garde.', ['Tornade', 'Vitesse']],
    ['wrestler34', 'Seigneur du contact', 'E', {clinchStr: 15}, 'Domination absolue dans le combat rapproché contre la cage.', ['Maître du clinch', 'Domination']],
    ['wrestler35', 'Monopole du sol', 'E', {takedown: 10, composure: 5}, 'L\'amenée est inévitable et dicte l\'issue du combat seul.', ['Menace ultime', 'Contrôle du jeu']],
    // --- LÉGENDAIRES (+4/20) ---
    ['wrestler36', 'Condamnation terrestre', 'L', {topControl: 10, strength: 10}, 'Une fois couché sous lui, aucun retour debout n\'existe.', ['Enclume', 'Condamnation']],
    ['wrestler37', 'Amenée mathématique', 'L', {takedown: 20}, 'Prise chirurgicale parfaite sans parade connue.', ['Takedown parfait', 'Irréparable']],
    ['wrestler38', 'Apocalypse cardiovasculaire', 'L', {cardio: 10, strength: 10}, 'Détruit le corps adverse sous un rythme de grappling fou.', ['Usure totale', 'Apocalypse']],
    ['wrestler39', 'Omniscience', 'L', {fightIQ: 10, adaptability: 10}, 'Debout, au sol, au clinch : c\'est lui le maître de cérémonie.', ['Génie tactique', 'Contrôle']],
    // --- MYTHIQUE (+6/20) ---
    ['wrestler40', 'Cratère d\'Impact', 'M', {takedown: 10, power: 10, killer: 10}, 'Projection si brutale qu\'elle brise les os à l\'atterrissage. Un cataclysme.', ['Fatal', 'Choc titanesque']]
];

// ==========================================
// CATALOGUE BOXE (40/40)
// ==========================================
const SK_BOXER = [
    // --- COMMUNES (+1/20) ---
    ['boxer01', 'Mètre ruban', 'C', {jab: 5}, 'Le jab sature la distance et touche presque systématiquement.', ['Jab', 'Mesure']],
    ['boxer02', 'Angle mort', 'C', {hook: 5}, 'Crochet contournant la garde dans l\'ombre du champ de vision.', ['Crochet', 'Furtivité']],
    ['boxer03', 'Ligne droite', 'C', {cross: 5}, 'Direct arrière lourd punissant toute avancée imprudente.', ['Direct', 'Puissance']],
    ['boxer04', 'Glissement d\'épaule', 'C', {footSpeed: 5}, 'Roule l\'épaule pour dévier le poing, ouvrant le contre.', ['Esquive', 'Contre']],
    ['boxer05', 'Remontée aveugle', 'C', {power: 5}, 'Uppercut jaillissant de très bas, impossible à anticiper.', ['Uppercut', 'Ouverture basse']],
    ['boxer06', 'Géométrie spatiale', 'C', {footSpeed: 5}, 'Coupe les angles pour ne jamais être coincé à la cage.', ['Déplacement', 'Espace']],
    ['boxer07', 'Earmuffs', 'C', {durability: 5}, 'Garde fermée au crâne absorbant tout choc primaire.', ['Garde de fer', 'Encaisseur']],
    ['boxer08', 'Metronome', 'C', {cardio: 5}, 'Série de coups sans pause épuisant la défense ennemie.', ['Combo', 'Pression']],
    ['boxer09', 'Timing de vol', 'C', {composure: 5}, 'Attend la faute adverse pour loger le contre pile à temps.', ['Timing', 'Punition']],
    ['boxer10', 'Abdominaux blindés', 'C', {durability: 5}, 'Prend les frappes au corps sans baisser la cadence.', ['Dur au mal', 'Corps']],
    ['boxer11', 'Pas de côté', 'C', {footSpeed: 5}, 'Pivote hors de l\'axe juste avant l\'impact lourd.', ['Esquive latérale', 'Réflexe']],
    ['boxer12', 'Ascenseur corporel', 'C', {jab: 5}, 'Pique le ventre pour forcer la garde à descendre.', ['Leurre', 'Corps']],
    ['boxer13', 'Voleur de round', 'C', {composure: 5}, 'Lance la grosse accélération dans les 15 dernières secondes.', ['Sprint final', 'Juges']],
    ['boxer14', 'Menton collé', 'C', {durability: 5}, 'Rentre la mâchoire dans le couchant pour encaisser l\'impossible.', ['Menton rentré', 'Absorption']],
    ['boxer15', 'Oxygène constant', 'C', {cardio: 5}, 'Garde le même débit de frappe du premier au dernier round.', ['Cadence infernale', 'Poumons']],
    // --- RARES (+2/20) ---
    ['boxer16', 'Déclic de lumière', 'R', {hook: 5, power: 5}, 'Crochet assez lourd pour plier un match en un geste.', ['Finition', 'Force']],
    ['boxer17', 'Contre-choc', 'R', {composure: 5, power: 5}, 'Chaque esquive appelle un missile en retour sur la mâchoire.', ['Contre offensif', 'Sanction']],
    ['boxer18', 'Ouvre-boîte', 'R', {power: 5, hook: 5}, 'Uppercut écartant les gardes pourtant jugées hermétiques.', ['Brise-garde', 'Précision']],
    ['boxer19', 'Barrière de jabs', 'R', {jab: 5, footSpeed: 5}, 'Jabs stroboscopiques interdisant l\'entrée du lutteur.', ['Barrière', 'Répétition']],
    ['boxer20', 'Pluie ininterrompue', 'R', {handSpeed: 10}, 'Combo fluide à quatre coups sans aucune fenêtre de contre.', ['Avalanche', 'Vitesse']],
    ['boxer21', 'Perforateur hépatique', 'R', {power: 5, cardio: 5}, 'Cible le foie pour voler le cardio du combattant adverse.', ['Destruction corps', 'Usure']],
    ['boxer22', 'Encaisseur pro', 'R', {durability: 10}, 'Absorbe des parpaings terrifiants en restant de marbre.', ['Roc défensif', 'Blindage']],
    ['boxer23', 'Pivot désaxant', 'R', {footSpeed: 5, fightIQ: 5}, 'Pivot sur l\'avant qui rend le combattant illisible au centre.', ['Pivot', 'Désorientation']],
    ['boxer24', 'Compas dans l\'œil', 'R', {cross: 5, fightIQ: 5}, 'Direct calibré pour châtier la distance de confort adverse.', ['Sniper', 'Mesure']],
    ['boxer25', 'Cassure d\'élan', 'R', {composure: 10}, 'Stoppe l\'attaque ennemie dans son élan par un contre d\'arrêt.', ['Casse-rythme', 'Interception']],
    ['boxer26', 'Lavage d\'acide', 'R', {cardio: 5, handSpeed: 5}, 'Cadence obligeant l\'autre à céder le round par fatigue.', ['Cadence', 'Pression']],
    ['boxer27', 'Résilience crânienne', 'R', {durability: 5, composure: 5}, 'Résiste au coup fatal et relève la tête avec le sourire.', ['Indestructible', 'Résilience']],
    // --- ÉPIQUES (+3/20) ---
    ['boxer28', 'Faux du boucher', 'E', {hook: 10, power: 5}, 'Puissance rare où un seul crochet débranche le cerveau.', ['One-punch', 'Crochet mortel']],
    ['boxer29', 'Nasé insaisissable', 'E', {handSpeed: 10, power: 5}, 'Enchaînement forçant la cible à reculer dans un cul-de-sac.', ['Traque', 'Combo']],
    ['boxer30', 'Évaporation', 'E', {footSpeed: 10, composure: 5}, 'Disparaît sous les frappes ennemies round après round.', ['Intouchable', 'Fantôme']],
    ['boxer31', 'Tir anticipé', 'E', {fightIQ: 10, composure: 5}, 'Lance le contre une fraction de seconde avant l\'attaque.', ['Prescience', 'Contre ultime']],
    ['boxer32', 'Dalle de béton', 'E', {durability: 15}, 'Mur humain. Ce qui aurait tué un autre ne le fait que cligner.', ['Mur', 'Absorption']],
    ['boxer33', 'Uppercut abyssal', 'E', {power: 10, hook: 5}, 'Frappe verticale invisible aux conséquences neurologiques graves.', ['Coup masqué', 'Surprise']],
    ['boxer34', 'Noyade psychologique', 'E', {cardio: 10, heart: 5}, 'Brise la volonté de l\'adversaire en refusant de baisser le rythme.', ['Pression psychologique', 'Mental']],
    ['boxer35', 'Quadrillage', 'E', {footSpeed: 10, fightIQ: 5}, 'Dicte la distance en permanence, l\'adversaire est un pion.', ['Maître', 'Distance']],
    // --- LÉGENDAIRES (+4/20) ---
    ['boxer36', 'Vitesse luminique', 'L', {power: 10, handSpeed: 10}, 'Frappe touchant sa cible avant même d\'avoir été perçue.', ['Frappe aveugle', 'Vitesse']],
    ['boxer37', 'Bulle de verre', 'L', {durability: 10, composure: 10}, 'Défense spatiale parfaite. Jamais touché proprement.', ['Défense parfaite', 'Forteresse']],
    ['boxer38', 'Exécution symphonique', 'L', {handSpeed: 10, power: 10}, 'Le combo final, mortel, qui éteint l\'octogone à volonté.', ['Avalanche létale', 'Finition']],
    ['boxer39', 'Infatigable', 'L', {cardio: 10, heart: 10}, 'Un cœur inépuisable. La machine ne s\'arrête jamais de taper.', ['Rythme', 'Inépuisable']],
    // --- MYTHIQUE (+6/20) ---
    ['boxer40', 'L\'Interrupteur', 'M', {power: 10, handSpeed: 10, killer: 10}, 'Touche la mâchoire, la lumière s\'éteint. Le prédateur absolu en striking.', ['Coup létal', 'Terreur']]
];

// ==========================================
// CATALOGUE MMA COMPLET (40/40)
// ==========================================
const SK_MMA = [
    // --- COMMUNES (+1/20) ---
    ['mma01', 'Camouflage', 'C', {adaptability: 5}, 'Glisse de la boxe à la lutte pour brouiller les repères.', ['Transition', 'Imprévisible']],
    ['mma02', 'Boxe sale', 'C', {clinchStr: 5}, 'Main sur la nuque, crochets courts dans les dents.', ['Clinch', 'Boxe sale']],
    ['mma03', 'Ponceuse de grillage', 'C', {clinchStr: 5}, 'Écrase contre la cage pour vider l\'acide lactique ennemi.', ['Cage control', 'Usure']],
    ['mma04', 'Leurre de niveau', 'C', {fightIQ: 5}, 'Feinte de lutte forçant la garde à descendre avant la droite.', ['Feinte', 'Ouverture']],
    ['mma05', 'Stabilisation', 'C', {gnp: 5}, 'Verrouille patiemment sa position avant d\'ouvrir les poings.', ['Patience', 'GNP']],
    ['mma06', 'Sprawl latéral', 'C', {tdd: 5}, 'Mélange pas de boxe et sprawl pour fuir les jambes.', ['Antilutte', 'Mobilité']],
    ['mma07', 'Takedown d\'opportunité', 'C', {takedown: 5}, 'Plonge sur le déséquilibre d\'une frappe loupée adverse.', ['Opportunisme', 'Takedown']],
    ['mma08', 'Garde armée', 'C', {guardWork: 5}, 'Garde fermant les angles au sol pour survivre au GNP.', ['Défense', 'Survie']],
    ['mma09', 'Overhand plongeant', 'C', {power: 5}, 'Frappe circulaire énorme créant un tunnel vers les hanches.', ['Leurre', 'Lutte']],
    ['mma10', 'Plantage de clou', 'C', {kick: 5}, 'Calf kick tactique pour figer l\'adversaire dans le sol.', ['Kick', 'Stratégie']],
    ['mma11', 'Glissade', 'C', {explosiveness: 5}, 'Gagne les transitions confuses (scrambles) par sa vivacité.', ['Scramble', 'Lutte']],
    ['mma12', 'Récupération active', 'C', {recovery: 5}, 'Digère les variations de rythme d\'un sport hybride.', ['Condition', 'Hybride']],
    ['mma13', 'Fondamentaux du cou', 'C', {submission: 5}, 'Punit instantanément un dos donné avec un étranglement classique.', ['Finition', 'RNC']],
    ['mma14', 'Coude tranchant', 'C', {killer: 5}, 'Sort les coudes en sortie de clinch pour fendre l\'arcade.', ['Coude', 'Dégâts']],
    ['mma15', 'Mesure d\'urgence', 'C', {footSpeed: 5}, 'Reste hors de portée des plongeons suicidaires de lutte.', ['Distance', 'Sécurité']],
    // --- RARES (+2/20) ---
    ['mma16', 'Jab aveuglant', 'R', {takedown: 5, jab: 5}, 'Pique les yeux avec le jab pour masquer les hanches qui plongent.', ['Enchaînement', 'Lutte']],
    ['mma17', 'Sangsue de cage', 'R', {clinchStr: 5, tdd: 5}, 'Cauchemar de grillage. Ne tombe pas, ne se décolle pas.', ['Mur', 'Cage']],
    ['mma18', 'Fissure de garde', 'R', {gnp: 5, power: 5}, 'Angles de frappe qui traversent une défense fermée au sol.', ['Précision', 'Dégâts']],
    ['mma19', 'Gestionnaire de crise', 'R', {fightIQ: 5, adaptability: 5}, 'Sait s\'il perd le round et adapte les risques du round 3.', ['Lucidité', 'Intelligence']],
    ['mma20', 'Rebond offensif', 'R', {cross: 5, tdd: 5}, 'Sprawle et renvoie un crochet instantané sur la montée adverse.', ['Sprawl & Brawl', 'Contre']],
    ['mma21', 'Chaîne évolutive', 'R', {submission: 5, adaptability: 5}, 'Si la clé de bras glisse, le triangle s\'engage de lui-même.', ['Chaîne', 'Fluidité']],
    ['mma22', 'Nuisance continue', 'R', {cardio: 5, aggression: 5}, 'Épuise l\'âme de la cible par un mélange frappe/lutte suffocant.', ['Pression', 'Usure']],
    ['mma23', 'Frappe d\'épaule', 'R', {handSpeed: 5, fightIQ: 5}, 'Cache ses coups derrière ses épaules, détruisant la réaction adverse.', ['Furtif', 'Vitesse']],
    ['mma24', 'Roi du chaos', 'R', {explosiveness: 5, tdd: 5}, 'Transforme le takedown adverse en domination pour lui-même.', ['Inversion', 'Scramble']],
    ['mma25', 'Danger bidimensionnel', 'R', {kick: 5, power: 5}, 'Mélange un kick destructeur à sa permanente menace de lutte.', ['Hybride', 'Kick lourd']],
    ['mma26', 'Mémoire musculaire', 'R', {durability: 5, heart: 5}, 'Même sonné, survit avec des réflexes programmés à la douleur.', ['Survie', 'Cœur']],
    ['mma27', 'Clouage au sol', 'R', {topControl: 5, gnp: 5}, 'Crucifix : bloque le bras adverse avec sa jambe, frappe de la main.', ['Crucifix', 'GNP']],
    // --- ÉPIQUES (+3/20) ---
    ['mma28', 'Effet miroir', 'E', {adaptability: 10, fightIQ: 5}, 'Bat l\'adversaire dans le domaine où ce dernier est le meilleur.', ['Génie', 'Imprévisible']],
    ['mma29', 'Mixage absolu', 'E', {takedown: 10, cross: 5}, 'Synergie pure : ses poings sont de la lutte, sa lutte est un poing.', ['Synergie', 'Combinaison']],
    ['mma30', 'Guillotine de frappes', 'E', {gnp: 10, killer: 5}, 'Monté, il est clinique et brutal. Le combat est signé.', ['Exécuteur', 'Dégâts']],
    ['mma31', 'Sang de glace', 'E', {heart: 10, composure: 5}, 'Dans une soumission profonde ou groggy, son pouls reste bas.', ['Glace', 'Zéro panique']],
    ['mma32', 'Fluide non-newtonien', 'E', {adaptability: 10, footSpeed: 5}, 'Pas de limite entre la boxe et la lutte. Un flot martial pur.', ['MMA', 'Maîtrise']],
    ['mma33', 'Ubiquité', 'E', {cardio: 10, aggression: 5}, 'Il frappe, lute, relève, plaque. Partout, sans pause.', ['Harceleur', 'Endurance']],
    ['mma34', 'Coffre-fort', 'E', {tdd: 10, durability: 5}, 'Neutralise les lutteurs et encaisse les puncheurs sans trembler.', ['Forteresse', 'Complet']],
    ['mma35', 'Hacker de style', 'E', {fightIQ: 10, composure: 5}, 'Connaît le plan de l\'adversaire avant qu\'il n\'entre dans l\'arène.', ['Tacticien', 'Prescience']],
    // --- LÉGENDAIRES (+4/20) ---
    ['mma36', 'L\'Équation résolue', 'L', {fightIQ: 10, adaptability: 10}, 'Zéro faille. Létal au sol, assassin debout, mur en défense.', ['Complet absolu', 'Zéro défaut']],
    ['mma37', 'Scanner de faille', 'L', {killer: 10, power: 10}, 'Trouve la nano-seconde exacte où le combat doit finir.', ['Instinct', 'Tueur']],
    ['mma38', 'Incarnation de la guerre', 'L', {heart: 10, cardio: 10}, 'Synonyme de bain de sang. Refuse de perdre, brise les champions.', ['Guerrier', 'Légende']],
    ['mma39', 'Maître des limbes', 'L', {explosiveness: 10, tdd: 10}, 'Renverse une erreur de parcours en victoire écrasante.', ['Magie', 'Inversibilité']],
    // --- MYTHIQUE (+6/20) ---
    ['mma40', 'Singularité Martiale', 'M', {fightIQ: 10, adaptability: 10, cardio: 10}, 'Le futur du sport. Il ne boxe ni ne lutte : il résout le combat. Une perfection extraterrestre.', ['Génie pur', 'GOAT']]
];

// ==========================================
// COMPÉTENCES GÉNÉTIQUES (20) - Tirées uniquement à la création
// ==========================================
const SK_GENETIC = [
    // 10 Communes (+1/20)
    ['gen01', 'Fémurs allongés', 'C', {kick: 5}, 'Allonge des jambes anormale. Frappe là où on ne l\u2019attend pas.', ['Allonge', 'Génétique']],
    ['gen02', 'Densité osseuse', 'C', {power: 5}, 'Un squelette naturellement lourd. Os de frappe denses.', ['Densité', 'Génétique']],
    ['gen03', 'Réflexes précoces', 'C', {handSpeed: 5}, 'Connexions nerveuses accélérées depuis la naissance.', ['Réflexes', 'Génétique']],
    ['gen04', 'Poumons surdimensionnés', 'C', {cardio: 5}, 'Capacité pulmonaire excédant la moyenne humaine.', ['Cardio inné', 'Génétique']],
    ['gen05', 'Fibre blanche pure', 'C', {explosiveness: 5}, 'Muscles conçus pour l\u2019explosion immédiate, pas l\u2019endurance.', ['Explosivité', 'Génétique']],
    ['gen06', 'Hyperlaxité', 'C', {flexibility: 5}, 'Articulations capables de se tordre au-delà du point de rupture.', ['Souplesse', 'Génétique']],
    ['gen07', 'Mâchoire de Neandertal', 'C', {chin: 5}, 'Base crânienne épaisse. Ne ressent pas les commotions.', ['Menton', 'Exception']],
    ['gen08', 'Synapses martiales', 'C', {fightIQ: 5}, 'Comprend naturellement la biomécanique sans l\u2019étudier.', ['QI Inné', 'Génétique']],
    ['gen09', 'Cicatrisation accélérée', 'C', {recovery: 5}, 'Métabolisme réparant les fibres musculaires en un temps record.', ['Récupération', 'Génétique']],
    ['gen10', 'Force paysanne', 'C', {strength: 5}, 'Force fonctionnelle pure acquise hors des salles de musculation.', ['Force pure', 'Génétique']],
    // 5 Rares (+2/20)
    ['gen11', 'Ossature de primate', 'R', {power: 5, durability: 5}, 'Bras longs et lourds. Frappe comme un animal sauvage.', ['Brute', 'Génétique']],
    ['gen12', 'Métabolisme d\u2019oiseau', 'R', {cardio: 5, recovery: 5}, 'Le cœur bat vite, oxygène vite, et ne s\u2019arrête jamais.', ['Inépuisable', 'Génétique']],
    ['gen13', 'Système survolté', 'R', {footSpeed: 5, handSpeed: 5}, 'Mouvements constants et impossibles à suivre à l\u2019œil nu.', ['Vitesse', 'Génétique']],
    ['gen14', 'Génétique de prédateur', 'R', {strength: 5, explosiveness: 5}, 'Tension musculaire d\u2019un grand félin prêt à bondir.', ['Prédateur', 'Génétique']],
    ['gen15', 'Cerveau reptilien', 'R', {fightIQ: 5, composure: 5}, 'Détachement total de la peur. Pur calcul mathématique.', ['Sociopathe', 'Génétique']],
    // 3 Épiques (+3/20)
    ['gen16', 'Anomalie physique', 'E', {power: 5, chin: 5, durability: 5}, 'Une erreur de la nature qui n\u2019aurait jamais dû monter dans une cage.', ['Monstre', 'Génétique']],
    ['gen17', 'Sang suroxygéné', 'E', {cardio: 10, recovery: 5}, 'Sang chargé en oxygène empêchant la formation d\u2019acide lactique.', ['Poumons d\u2019acier', 'Génétique']],
    ['gen18', 'Prodige absolu', 'E', {fightIQ: 10, adaptability: 5}, 'Apprend une technique mortelle en la regardant une seule fois.', ['Génie', 'Génétique']],
    // 1 Légendaire (+4/20)
    ['gen19', 'Monstre de la nature', 'L', {strength: 10, explosiveness: 10}, 'Une combinaison de puissance et d\u2019explosion qui défie la biologie.', ['Titanesque', 'Génétique']],
    // 1 Mythique (+6/20)
    ['gen20', 'L\u2019Élu de la violence', 'M', {power: 10, chin: 10, explosiveness: 10}, 'Né avec toutes les caractéristiques pour dominer l\u2019espèce humaine.', ['Dieu de la guerre', 'Génétique']]
];

// ==========================================
// COMPÉTENCES MÉTA (20) - Vétérans et Fin de carrière
// ==========================================
const SK_META = [
    // 5 Mécaniques (X) - Modifient les règles du jeu, pas les stats
    ['meta01', 'Retraite retardée', 'X', {}, 'Un corps qui refuse de rendre les armes. Repousse la retraite de deux ans.', ['Longévité', 'Méta']],
    ['meta02', 'Mentor testamentaire', 'X', {}, 'Transmet un bonus permanent à ta prochaine carrière (Nouvelle Partie +).', ['Héritage', 'Méta']],
    ['meta03', 'Contrat à vie', 'X', {}, 'Verrouille un cachet minimum garanti jusqu\u2019à la fin de la carrière.', ['Statut', 'Méta']],
    ['meta04', 'Légende locale', 'X', {}, 'La popularité ne redescend plus jamais. Le public a décidé qui tu es.', ['Aura', 'Méta']],
    ['meta05', 'Chant du cygne', 'X', {}, 'Dernier combat de carrière : +6 sur tous les attributs offensifs en adrénaline pure.', ['Ultime', 'Méta']],
    // 6 Communes (+1/20)
    ['meta06', 'Vice de vétéran', 'C', {clinchStr: 5}, 'Sait placer son poids pour écraser l\u2019autre et se reposer en douce.', ['Vice', 'Méta']],
    ['meta07', 'Glace dans les veines', 'C', {composure: 5}, 'A tout vu, tout vécu. Rien ne le surprend ni ne le stresse.', ['Sang-froid', 'Méta']],
    ['meta08', 'Cuir tanné', 'C', {durability: 5}, 'La peau et les os sont devenus durs comme de la roche avec l\u2019âge.', ['Cuir', 'Méta']],
    ['meta09', 'Économie de souffle', 'C', {fightIQ: 5}, 'Bouge peu mais bouge juste. Compense la perte de cardio par l\u2019esprit.', ['Calcul', 'Méta']],
    ['meta10', 'Force de daron', 'C', {strength: 5}, 'Une lourdeur physique inexplicable qu\u2019on n\u2019acquiert qu\u2019avec l\u2019âge.', ['Lourdeur', 'Méta']],
    ['meta11', 'Lactique géré', 'C', {recovery: 5}, 'Récupère mieux entre les rounds grâce à une respiration millimétrée.', ['Souffle', 'Méta']],
    // 4 Rares (+2/20)
    ['meta12', 'Énergie calculée', 'R', {fightIQ: 5, composure: 5}, 'Gère le chrono du round de manière mathématique pour ne pas s\u2019épuiser.', ['Gestion', 'Méta']],
    ['meta13', 'Mur de l\u2019ancien', 'R', {strength: 5, tdd: 5}, 'Un ancrage au sol terrifiant qui empêche les jeunes loups de le lutter.', ['Ancrage', 'Méta']],
    ['meta14', 'Survivant des arènes', 'R', {heart: 5, durability: 5}, 'Refuse viscéralement de se faire assommer par un gamin.', ['Survivant', 'Méta']],
    ['meta15', 'Désillusion martiale', 'R', {adaptability: 5, fightIQ: 5}, 'Ne tombe plus dans les pièges de feinte. Connaît tous les manuels.', ['Désillusion', 'Méta']],
    // 3 Épiques (+3/20)
    ['meta16', 'Maître tacticien', 'E', {fightIQ: 10, composure: 5}, 'Conduit le combat comme une symphonie macabre qu\u2019il a déjà écrite.', ['Maestro', 'Méta']],
    ['meta17', 'Vieux crâne', 'E', {heart: 10, durability: 5}, 'On peut le frapper avec une batte, il continuera d\u2019avancer.', ['Increvable', 'Méta']],
    ['meta18', 'Bibliothèque martiale', 'E', {adaptability: 10, fightIQ: 5}, 'A affronté absolument tous les styles existants. A toujours une réponse.', ['Savoir', 'Méta']],
    // 1 Légendaire (+4/20)
    ['meta19', 'Indéracinable', 'L', {tdd: 10, strength: 10}, 'Une fois planté au sol, il faut une grue pour le mettre sur le dos.', ['Montagne', 'Méta']],
    // 1 Mythique (+6/20)
    ['meta20', 'Dieu de la Cage', 'M', {fightIQ: 10, composure: 10, heart: 10}, 'Le saint patron des vétérans. Ne perd jamais son sang-froid, ne recule jamais.', ['Divinité', 'Méta']]
];

// ==========================================
// COMPÉTENCES DE PAYS (14 pays x 20 = 280)
// Format strict : 12 Communes, 5 Rares, 2 Épiques, 1 Légendaire par pays
// ==========================================

const SK_COUNTRY = {
    // ----------------------------------------------------
    // DAGHESTAN (Lutte, Pression, Cardio, Discipline)
    // ----------------------------------------------------
    DAG: [
        ['dag01', 'Lutte des montagnes', 'C', {takedown: 5}, 'Prises aux jambes rudes et sans esthétique.', ['Lutte', 'Daghestan']],
        ['dag02', 'Lignée du tapis', 'C', {tdd: 5}, 'Né sur le tapis, immunisé aux projections.', ['Antilutte', 'Daghestan']],
        ['dag03', 'Pression écrasante', 'C', {topControl: 5}, 'La maîtrise absolue de la gravité corporelle.', ['Contrôle', 'Daghestan']],
        ['dag04', 'Cardio caucasien', 'C', {cardio: 5}, 'Inépuisable même dans l\u2019air le plus rare.', ['Endurance', 'Daghestan']],
        ['dag05', 'Force d\u2019ours', 'C', {strength: 5}, 'S\u2019entraînait littéralement avec des bêtes sauvages.', ['Force', 'Daghestan']],
        ['dag06', 'Déni d\u2019abandon', 'C', {heart: 5}, 'La honte de la défaite est pire que la mort.', ['Cœur', 'Daghestan']],
        ['dag07', 'Stricte doctrine', 'C', {discipline: 5}, 'Ne dévie jamais du plan de match du coach.', ['Discipline', 'Daghestan']],
        ['dag08', 'Sambo brutal', 'C', {gnp: 5}, 'Frappe au sol avec une lourdeur effrayante.', ['GNP', 'Daghestan']],
        ['dag09', 'Clinch sanglant', 'C', {clinchStr: 5}, 'Lutte debout épuisante, vidant l\u2019adversaire.', ['Clinch', 'Daghestan']],
        ['dag10', 'Overhand du Tsar', 'C', {power: 5}, 'Gros bras arrière lancé sans finesse pour tuer.', ['Puissance', 'Daghestan']],
        ['dag11', 'Patience froide', 'C', {composure: 5}, 'Prend son temps pour verrouiller la victime.', ['Sang-froid', 'Daghestan']],
        ['dag12', 'Chaînes d\u2019acier', 'C', {submission: 5}, 'Clés de bras passées par la force, pas la souplesse.', ['Soumission', 'Daghestan']],
        ['dag13', 'Grip caucasien', 'R', {takedown: 5, strength: 5}, 'Saisit la cible et l\u2019arrache du sol brutalement.', ['Arracheur', 'Daghestan']],
        ['dag14', 'Étau respiratoire', 'R', {cardio: 5, topControl: 5}, 'Lutte à un rythme qui étouffe le cardio adverse.', ['Étau', 'Daghestan']],
        ['dag15', 'Mur du Nord', 'R', {tdd: 5, discipline: 5}, 'Défense méthodique interdisant toute entrée.', ['Mur', 'Daghestan']],
        ['dag16', 'Marteau russe', 'R', {gnp: 5, power: 5}, 'Démolit la garde depuis la position montée.', ['Marteau', 'Daghestan']],
        ['dag17', 'Résilience froide', 'R', {heart: 5, durability: 5}, 'Encaisse les coups comme une tempête de neige.', ['Résilience', 'Daghestan']],
        ['dag18', 'Anaconda du Caucase', 'E', {topControl: 10, takedown: 5}, 'Enroule, fait tomber et ne relâche plus jamais.', ['Cauchemar', 'Daghestan']],
        ['dag19', 'Machine de guerre', 'E', {cardio: 10, strength: 5}, 'Un cyborg programmé pour broyer ses opposants.', ['Machine', 'Daghestan']],
        ['dag20', 'Seigneur des Tapis', 'L', {takedown: 10, topControl: 10}, 'Une fois qu\u2019il touche tes jambes, ta vie t\u2019échappe.', ['Grappling divin', 'Daghestan']]
    ],
    // ----------------------------------------------------
    // BRÉSIL (BJJ, Mouvement, Agression, Souplesse)
    // ----------------------------------------------------
    BR: [
        ['br01', 'Art de la Favela', 'C', {submission: 5}, 'Grappling créatif et létal forgé dans la rue.', ['Soumission', 'Brésil']],
        ['br02', 'Garde impénétrable', 'C', {guardWork: 5}, 'Ferme le jeu depuis le dos de manière absolue.', ['Garde', 'Brésil']],
        ['br03', 'Ginga naturelle', 'C', {flexibility: 5}, 'Mouvements hérités de la Capoeira, très fluides.', ['Souplesse', 'Brésil']],
        ['br04', 'Vitesse féline', 'C', {footSpeed: 5}, 'Déplacements dansants, presque aériens.', ['Mouvement', 'Brésil']],
        ['br05', 'Instinct de tueur', 'C', {killer: 5}, 'La passion du finish dès qu\u2019une goutte de sang coule.', ['Finition', 'Brésil']],
        ['br06', 'Jiu-jitsu originel', 'C', {adaptability: 5}, 'Improvisation constante pour prendre le dos.', ['BJJ', 'Brésil']],
        ['br07', 'Cœur du Nordeste', 'C', {heart: 5}, 'Un cœur immense refusant catégoriquement de céder.', ['Cœur', 'Brésil']],
        ['br08', 'Chute Boxe', 'C', {aggression: 5}, 'Agressivité pure inspirée des salles de Curitiba.', ['Chute Boxe', 'Brésil']],
        ['br09', 'Low Kick destructeur', 'C', {kick: 5}, 'Coupe les jambes comme on coupe de la canne.', ['Kick', 'Brésil']],
        ['br10', 'Crochet sauvage', 'C', {hook: 5}, 'Lancé avec toute la force des hanches.', ['Crochet', 'Brésil']],
        ['br11', 'Transition magique', 'C', {fightIQ: 5}, 'Anticipe le mouvement adverse pour rouler au sol.', ['Transition', 'Brésil']],
        ['br12', 'Esquive capoeira', 'C', {composure: 5}, 'Baisse la tête sereinement sous les high kicks.', ['Esquive', 'Brésil']],
        ['br13', 'Triangle volant', 'R', {submission: 5, flexibility: 5}, 'Ferme un étranglement géométrique en plein saut.', ['Triangle', 'Brésil']],
        ['br14', 'Danse de l\u2019araignée', 'R', {guardWork: 5, adaptability: 5}, 'Contrôle à distance depuis le dos, rendant fou.', ['Araignée', 'Brésil']],
        ['br15', 'Soccer kick spirit', 'R', {kick: 5, killer: 5}, 'Kicks au sol impitoyables (quand c\u2019était légal).', ['PRIDE', 'Brésil']],
        ['br16', 'Bagarreur des rues', 'R', {aggression: 5, hook: 5}, 'Accepte la guerre totale pour le KO.', ['Bagarre', 'Brésil']],
        ['br17', 'Sang chaud', 'R', {heart: 5, footSpeed: 5}, 'L\u2019énergie monte quand le combat devient critique.', ['Ferveur', 'Brésil']],
        ['br18', 'Anaconda brésilien', 'E', {submission: 10, guardWork: 5}, 'Une toile dont personne ne s\u2019échappe vivant.', ['Pieuvre', 'Brésil']],
        ['br19', 'Carnage de Curitiba', 'E', {aggression: 10, kick: 5}, 'Un ouragan de violence pur et dévastateur.', ['Violence', 'Brésil']],
        ['br20', 'Ceinture Rouge', 'L', {submission: 10, adaptability: 10}, 'L\u2019art doux maîtrisé jusqu\u2019à sa forme la plus pure.', ['Légende BJJ', 'Brésil']]
    ],
    // ----------------------------------------------------
    // THAÏLANDE (Kick, Clinch, Durabilité, Muay Thaï)
    // ----------------------------------------------------
    TH: [
        ['th01', 'Tibia d\u2019acier', 'C', {kick: 5}, 'A passé sa jeunesse à frapper des troncs d\u2019arbres.', ['Kick', 'Thaïlande']],
        ['th02', 'Plum mortel', 'C', {clinchStr: 5}, 'Saisie de nuque détruisant la posture adverse.', ['Clinch', 'Thaïlande']],
        ['th03', 'Sourire thaï', 'C', {durability: 5}, 'Sourit en encaissant le coup pour briser l\u2019ego.', ['Encaisseur', 'Thaïlande']],
        ['th04', 'Genou piqué', 'C', {power: 5}, 'Coup de genou tranchant au foie.', ['Genou', 'Thaïlande']],
        ['th05', 'Cœur de Lumpinee', 'C', {heart: 5}, 'La ferveur des stadiums de Bangkok dans le sang.', ['Cœur', 'Thaïlande']],
        ['th06', 'Teep facial', 'C', {footSpeed: 5}, 'Repousse l\u2019adversaire avec un pied au visage.', ['Teep', 'Thaïlande']],
        ['th07', 'Coude rasoir', 'C', {killer: 5}, 'Cherche l\u2019ouverture pour inonder les yeux de sang.', ['Coude', 'Thaïlande']],
        ['th08', 'Calme plat', 'C', {composure: 5}, 'Ne sur-réagit jamais à une feinte de boxe.', ['Sang-froid', 'Thaïlande']],
        ['th09', 'Rythme du pari', 'C', {cardio: 5}, 'Augmente la cadence au round 3 comme au pays.', ['Cardio', 'Thaïlande']],
        ['th10', 'Check de marbre', 'C', {tdd: 5}, 'Bloque les jambes comme il bloque les kicks.', ['Défense', 'Thaïlande']],
        ['th11', 'Balayage brutal', 'C', {takedown: 5}, 'Fauche la jambe d\u2019appui au moindre déséquilibre.', ['Sweep', 'Thaïlande']],
        ['th12', 'Garde hermétique', 'C', {fightIQ: 5}, 'Lecture pure des lignes d\u2019attaque occidentales.', ['Lecture', 'Thaïlande']],
        ['th13', 'Destruction basse', 'R', {kick: 5, power: 5}, 'Scie l\u2019arbre par la base pour annuler les appuis.', ['Low Kick', 'Thaïlande']],
        ['th14', 'Étau de Bangkok', 'R', {clinchStr: 5, strength: 5}, 'Maintient la tête adverse en bas quoi qu\u2019il arrive.', ['Contrôle', 'Thaïlande']],
        ['th15', 'Impassibilité', 'R', {durability: 5, composure: 5}, 'Encaisse les parpaings sans ciller.', ['Impassible', 'Thaïlande']],
        ['th16', 'Boucherie', 'R', {killer: 5, clinchStr: 5}, 'Utilise les coudes en corps-à-corps pour finir.', ['Sang', 'Thaïlande']],
        ['th17', 'Machine à rythme', 'R', {cardio: 5, heart: 5}, 'Ne recule jamais face à l\u2019adversité.', ['Machine', 'Thaïlande']],
        ['th18', 'Dieu du Stadium', 'E', {kick: 10, durability: 5}, 'L\u2019art des 8 membres dans sa violence la plus pure.', ['Muay Thai', 'Thaïlande']],
        ['th19', 'L\u2019Art du Sang', 'E', {clinchStr: 10, killer: 5}, 'Détruit la cible au contact avec une cruauté froide.', ['Coupeur', 'Thaïlande']],
        ['th20', 'Héritage d\u2019Ayutthaya', 'L', {kick: 10, clinchStr: 10}, 'Frappes si lourdes qu\u2019elles brisent les os à travers la garde.', ['Légende', 'Thaïlande']]
    ],
    // ----------------------------------------------------
    // FRANCE (Savate, Mouvement, Fierté, Judo)
    // ----------------------------------------------------
    FR: [
        ['fr01', 'Savate élégante', 'C', {kick: 5}, 'Fouettés précis, agiles, en chaussures virtuelles.', ['Savate', 'France']],
        ['fr02', 'Fierté nationale', 'C', {composure: 5}, 'Sourire hautain déstabilisant l\u2019adversaire.', ['Arrogance', 'France']],
        ['fr03', 'Garde hermétique', 'C', {tdd: 5}, 'Garde de boxe française fermant tout takedown.', ['Garde', 'France']],
        ['fr04', 'Judo de la capitale', 'C', {takedown: 5}, 'Fauchages amples et ippons destructeurs.', ['Judo', 'France']],
        ['fr05', 'Cœur de Gavroche', 'C', {heart: 5}, 'Prend des coups mais se relève toujours pour narguer.', ['Outsider', 'France']],
        ['fr06', 'Jeu d\u2019escrimeur', 'C', {footSpeed: 5}, 'Déplacements linéaires sur la pointe des pieds.', ['Mobilité', 'France']],
        ['fr07', 'Jab académique', 'C', {jab: 5}, 'Pique proprement de la main avant sans forcer.', ['Boxe', 'France']],
        ['fr08', 'Esprit d\u2019analyse', 'C', {fightIQ: 5}, 'Analyse géométrique du combat à la française.', ['Cartésien', 'France']],
        ['fr09', 'Grappling parisien', 'C', {submission: 5}, 'Style au sol moderne et très technique.', ['Luta Livre', 'France']],
        ['fr10', 'Vitesse d\u2019exécution', 'C', {handSpeed: 5}, 'Frappe très vite, privilégie la touche à la force.', ['Vitesse', 'France']],
        ['fr11', 'Cuir de banlieue', 'C', {durability: 5}, 'Conditionné dans des quartiers où il faut survivre.', ['Dur au mal', 'France']],
        ['fr12', 'Cardio des Alpes', 'C', {cardio: 5}, 'Poumons d\u2019acier forgés en haute altitude.', ['Cardio', 'France']],
        ['fr13', 'Fouetté foudroyant', 'R', {kick: 5, footSpeed: 5}, 'Tire sa jambe comme un fouet depuis l\u2019extérieur.', ['Savate pure', 'France']],
        ['fr14', 'Ippon Seoi Nage', 'R', {takedown: 5, power: 5}, 'Jette la cible par-dessus l\u2019épaule violemment.', ['Projection', 'France']],
        ['fr15', 'Génie cartésien', 'R', {fightIQ: 5, adaptability: 5}, 'S\u2019adapte mathématiquement au jeu adverse.', ['Adaptation', 'France']],
        ['fr16', 'Direct de Marseille', 'R', {cross: 5, killer: 5}, 'Une droite sale, puissante, qui vise le KO net.', ['Bagarre', 'France']],
        ['fr17', 'Panache', 'R', {heart: 5, composure: 5}, 'Brille sous la pression quand la foule hue.', ['Panache', 'France']],
        ['fr18', 'L\u2019École Française', 'E', {fightIQ: 10, footSpeed: 5}, 'Boxe intouchable, pure classe et précision absolue.', ['Maestro', 'France']],
        ['fr19', 'Teddy Bear', 'E', {takedown: 10, topControl: 5}, 'Monstre de judo impossible à bouger au sol.', ['Judo lourd', 'France']],
        ['fr20', 'Le Cyrano de la Cage', 'L', {fightIQ: 10, kick: 10}, 'Frappe avec grâce, se moque, et gagne avec art.', ['Virtuose', 'France']]
    ],
    // ----------------------------------------------------
    // ÉTATS-UNIS (NCAA, Boxe, Puissance, Showman)
    // ----------------------------------------------------
    US: [
        ['us01', 'Lutte Division 1', 'C', {takedown: 5}, 'Takedown en double leg parfait de niveau fac.', ['NCAA', 'USA']],
        ['us02', 'Philly Shell', 'C', {handSpeed: 5}, 'Boxe défensive, épaules roulées, contres rapides.', ['Boxe US', 'USA']],
        ['us03', 'Force industrielle', 'C', {strength: 5}, 'Soulevé de fonte depuis le lycée. Bœuf.', ['Force', 'USA']],
        ['us04', 'Bête de spectacle', 'C', {aggression: 5}, 'Fait le show pour les caméras, cherche le sang.', ['Showman', 'USA']],
        ['us05', 'Athlétisme pur', 'C', {explosiveness: 5}, 'Un mutant d\u2019explosivité musculaire américaine.', ['Athlète', 'USA']],
        ['us06', 'Défense de velours', 'C', {tdd: 5}, 'Hanches parfaites pour sprawl de lutte libre.', ['Antilutte', 'USA']],
        ['us07', 'Overhand de bar', 'C', {power: 5}, 'La bonne vieille droite des bagarres de saloon.', ['Brawl', 'USA']],
        ['us08', 'Cardio d\u2019élite', 'C', {cardio: 5}, 'Conditionnement NFL. Ne fatigue jamais.', ['Condition', 'USA']],
        ['us09', 'Ground & Pound lourd', 'C', {gnp: 5}, 'Écrase et frappe pour finir l\u2019adversaire au sol.', ['GNP', 'USA']],
        ['us10', 'Trash talker', 'C', {composure: 5}, 'Insulte la cible pour rester concentré.', ['Mental', 'USA']],
        ['us11', 'Crochet de Philadelphie', 'C', {hook: 5}, 'Un crochet vicieux qui a éteint des dizaines de gars.', ['Crochet', 'USA']],
        ['us12', 'Instinct de survie', 'C', {heart: 5}, 'L\u2019American Dream : refuser de rester au sol.', ['Rêve', 'USA']],
        ['us13', 'Génétique modifiée', 'R', {explosiveness: 5, power: 5}, 'Vitesse et force qui défient la biologie.', ['Mutant', 'USA']],
        ['us14', 'All-American', 'R', {takedown: 5, topControl: 5}, 'La lutte universitaire à son sommet destructeur.', ['Lutte d\u2019élite', 'USA']],
        ['us15', 'Boxeur de l\u2019Est', 'R', {handSpeed: 5, fightIQ: 5}, 'Combinaisons rapides de boxe anglaise urbaine.', ['Boxe', 'USA']],
        ['us16', 'Marteau pilon', 'R', {gnp: 5, killer: 5}, 'Ground and pound cherchant la commotion.', ['GNP fatal', 'USA']],
        ['us17', 'Cœur de l\u2019Aigle', 'R', {heart: 5, cardio: 5}, 'Remonte des pires situations avec panache.', ['Comeback', 'USA']],
        ['us18', 'L\u2019Oncle Sam', 'E', {takedown: 10, explosiveness: 5}, 'Fonce dans l\u2019adversaire comme un train de marchandises.', ['Bulldozer', 'USA']],
        ['us19', 'Hollywood KO', 'E', {power: 10, handSpeed: 5}, 'Le sens du spectacle achevé par une droite cataclysmique.', ['Star', 'USA']],
        ['us20', 'Le Rêve Américain', 'L', {power: 10, takedown: 10}, 'Frappe comme un camion, lutte comme un ours. L\u2019archétype parfait.', ['Machine US', 'USA']]
    ],
    // ----------------------------------------------------
    // JAPON (Budo, Soumission, Kamikaze, Judo)
    // ----------------------------------------------------
    JP: [
        ['jp01', 'Esprit Budo', 'C', {fightIQ: 5}, 'Respect strict et analyse froide des arts martiaux.', ['Budo', 'Japon']],
        ['jp02', 'Collectionneur de talons', 'C', {submission: 5}, 'Plonge sur les chevilles sans hésitation.', ['Leglocks', 'Japon']],
        ['jp03', 'Kamikaze', 'C', {killer: 5}, 'Prêt à mourir s\u2019il peut emporter l\u2019adversaire avec lui.', ['Sacrifice', 'Japon']],
        ['jp04', 'Judo traditionnel', 'C', {takedown: 5}, 'Projections pures héritées du Kodokan.', ['Judo', 'Japon']],
        ['jp05', 'Endurance zen', 'C', {recovery: 5}, 'Médite la douleur pour qu\u2019elle disparaisse.', ['Spirituel', 'Japon']],
        ['jp06', 'Âme de Samouraï', 'C', {heart: 5}, 'La reddition est une option inconcevable.', ['Honneur', 'Japon']],
        ['jp07', 'Discipline de fer', 'C', {discipline: 5}, 'Répète les katas jusqu\u2019à la perfection.', ['Kata', 'Japon']],
        ['jp08', 'Frappe Karaté', 'C', {kick: 5}, 'Kicks rapides et secs qui claquent comme un fouet.', ['Karaté', 'Japon']],
        ['jp09', 'Sang-froid abyssal', 'C', {composure: 5}, 'Rien, absolument rien, ne le fait sourciller.', ['Glace', 'Japon']],
        ['jp10', 'Adaptabilité ninja', 'C', {adaptability: 5}, 'Mue selon le style adverse sans prévenir.', ['Ninja', 'Japon']],
        ['jp11', 'Vitesse de l\u2019ombre', 'C', {footSpeed: 5}, 'Glisse sur le ring avec des appuis parfaits.', ['Ombre', 'Japon']],
        ['jp12', 'Garde Kodokan', 'C', {guardWork: 5}, 'Une fois sur le dos, un nouveau combat commence.', ['Ne-Waza', 'Japon']],
        ['jp13', 'Bushido', 'R', {fightIQ: 5, discipline: 5}, 'L\u2019intellect martial poussé à son paroxysme.', ['Maître', 'Japon']],
        ['jp14', 'Ippon dévastateur', 'R', {takedown: 5, power: 5}, 'Jette la cible au sol pour lui casser le souffle.', ['Ippon', 'Japon']],
        ['jp15', 'Clés des abysses', 'R', {submission: 5, adaptability: 5}, 'Tord les bras dans des angles que l\u2019anatomie renie.', ['Torture', 'Japon']],
        ['jp16', 'Cœur de PRIDE', 'R', {heart: 5, durability: 5}, 'Encaisse les genoux à la tête avec le sourire.', ['PRIDE', 'Japon']],
        ['jp17', 'Frappe fantôme', 'R', {handSpeed: 5, footSpeed: 5}, 'Touche la cible et disparaît immédiatement.', ['Fantôme', 'Japon']],
        ['jp18', 'Démon d\u2019Okinawa', 'E', {submission: 10, killer: 5}, 'Trouve la soumission fatale en une fraction de seconde.', ['Terreur', 'Japon']],
        ['jp19', 'Impassible', 'E', {composure: 10, heart: 5}, 'Refuse de montrer la moindre douleur ou peur.', ['Mur de glace', 'Japon']],
        ['jp20', 'Le Dernier Samouraï', 'L', {fightIQ: 10, submission: 10}, 'Une légende vivante alliant technique martiale pure et art du sol.', ['Mythe', 'Japon']]
    ],
    // ----------------------------------------------------
    // NIGÉRIA (Striking, Allonge, Athlétisme)
    // ----------------------------------------------------
    NG: [
        ['ng01', 'Héritage royal', 'C', {kick: 5}, 'Kicks fluides avec une allonge surnaturelle.', ['Style', 'Nigéria']],
        ['ng02', 'Génétique d\u2019élite', 'C', {explosiveness: 5}, 'Explose sur la cible comme une panthère.', ['Athlète', 'Nigéria']],
        ['ng03', 'Trompe-l\u2019œil', 'C', {jab: 5}, 'Gère la distance de manière illisible pour l\u2019autre.', ['Distance', 'Nigéria']],
        ['ng04', 'Force africaine', 'C', {strength: 5}, 'Force fonctionnelle terrifiante sans soulever de fonte.', ['Force pure', 'Nigéria']],
        ['ng05', 'Danse hypnotique', 'C', {fightIQ: 5}, 'Mouvements d\u2019épaules qui figent la garde adverse.', ['Feintes', 'Nigéria']],
        ['ng06', 'Crochet large', 'C', {hook: 5}, 'Une main lourde balancée de très loin.', ['Crochet', 'Nigéria']],
        ['ng07', 'Cardio de savane', 'C', {cardio: 5}, 'Infatigable même dans les guerres d\u2019usure.', ['Cardio', 'Nigéria']],
        ['ng08', 'Esquive arrière', 'C', {footSpeed: 5}, 'Se penche en arrière pour faire rater le KO.', ['Matrix', 'Nigéria']],
        ['ng09', 'Direct foudroyant', 'C', {cross: 5}, 'Le bras arrière est un sniper lourd.', ['Sniper', 'Nigéria']],
        ['ng10', 'Antilutte féline', 'C', {tdd: 5}, 'Des hanches fuyantes face aux lutteurs.', ['Sprawl', 'Nigéria']],
        ['ng11', 'Patience souveraine', 'C', {composure: 5}, 'Attend calmement que l\u2019adversaire s\u2019empale.', ['Patience', 'Nigéria']],
        ['ng12', 'Résilience du continent', 'C', {durability: 5}, 'Corps dur comme l\u2019ébène.', ['Cuir', 'Nigéria']],
        ['ng13', 'Frappe élastique', 'R', {jab: 5, footSpeed: 5}, 'Frappe à une distance qui défie la physique.', ['Allonge', 'Nigéria']],
        ['ng14', 'Saut de panthère', 'R', {explosiveness: 5, kick: 5}, 'Kicks sautés qui décapitent sans appel.', ['Saut', 'Nigéria']],
        ['ng15', 'Puissance brute', 'R', {power: 5, strength: 5}, 'La force d\u2019un poids lourd dans un poids moyen.', ['Gabarit', 'Nigéria']],
        ['ng16', 'Tacticien royal', 'R', {fightIQ: 5, adaptability: 5}, 'S\u2019ajuste et punit l\u2019adversaire au fil des rounds.', ['QI', 'Nigéria']],
        ['ng17', 'Roi de l\u2019esquive', 'R', {composure: 5, footSpeed: 5}, 'Danse autour des parpaings sans jamais ciller.', ['Intouchable', 'Nigéria']],
        ['ng18', 'Le Cauchemar de Lagos', 'E', {power: 10, cross: 5}, 'Une seule frappe du bras arrière éteint la lumière.', ['Mortel', 'Nigéria']],
        ['ng19', 'L\u2019Ombre Élastique', 'E', {footSpeed: 10, fightIQ: 5}, 'Impossible à cerner, impossible à toucher.', ['Fantôme', 'Nigéria']],
        ['ng20', 'Le Roi Africain', 'L', {power: 10, footSpeed: 10}, 'Puissance titanesque couplée à une agilité de danseur.', ['Souverain', 'Nigéria']]
    ],
    // ----------------------------------------------------
    // ROYAUME-UNI (Bagarre, Grit, Boxe de rue)
    // ----------------------------------------------------
    GB: [
        ['gb01', 'Grit britannique', 'C', {heart: 5}, 'Refuse obstinément de perdre. Trop fier pour ça.', ['Ténacité', 'Royaume-Uni']],
        ['gb02', 'Dirty Boxing', 'C', {clinchStr: 5}, 'Uppercuts et coudes illégaux dans le clinch.', ['Bagarre', 'Royaume-Uni']],
        ['gb03', 'Jab de pub', 'C', {jab: 5}, 'Piquant, agaçant, répété jusqu\u2019à la folie.', ['Jab', 'Royaume-Uni']],
        ['gb04', 'Marcheur hooligan', 'C', {aggression: 5}, 'Avance vers l\u2019ennemi en l\u2019insultant.', ['Pression', 'Royaume-Uni']],
        ['gb05', 'Menton de brique', 'C', {durability: 5}, 'Encaisse les chopes de bière et les overhands.', ['Menton', 'Royaume-Uni']],
        ['gb06', 'Vitesse anglaise', 'C', {handSpeed: 5}, 'Combos de boxe rapides inspirés du noble art.', ['Boxe', 'Royaume-Uni']],
        ['gb07', 'Gaucher vicieux', 'C', {cross: 5}, 'Bras arrière sec et précis.', ['Direct', 'Royaume-Uni']],
        ['gb08', 'Défense rustique', 'C', {tdd: 5}, 'Bourrine les hanches pour éviter d\u2019aller au sol.', ['Sprawl lourd', 'Royaume-Uni']],
        ['gb09', 'Crochet de rue', 'C', {hook: 5}, 'Court, sale et efficace.', ['Crochet', 'Royaume-Uni']],
        ['gb10', 'Cardio pluvieux', 'C', {cardio: 5}, 'Brave les guerres longues sans fatigue apparente.', ['Endurance', 'Royaume-Uni']],
        ['gb11', 'Tueur au sol', 'C', {gnp: 5}, 'Au sol, il tape jusqu\u2019à ce que l\u2019arbitre le tire.', ['GNP', 'Royaume-Uni']],
        ['gb12', 'Arrogance anglaise', 'C', {composure: 5}, 'Baisse la garde avec le sourire après un coup pris.', ['Mental', 'Royaume-Uni']],
        ['gb13', 'Bagarre de ruelle', 'R', {clinchStr: 5, hook: 5}, 'Détruit la garde adverse au corps-à-corps.', ['Dirty', 'Royaume-Uni']],
        ['gb14', 'Cœur de Lion', 'R', {heart: 5, durability: 5}, 'Prend un knockdown, se relève plus dangereux.', ['Grit', 'Royaume-Uni']],
        ['gb15', 'Sniper londonien', 'R', {cross: 5, handSpeed: 5}, 'Le bras arrière ne pardonne aucune erreur.', ['Sniper', 'Royaume-Uni']],
        ['gb16', 'Pression hooligan', 'R', {aggression: 5, cardio: 5}, 'Asphyxie la cible par une marche en avant totale.', ['Bulldozer', 'Royaume-Uni']],
        ['gb17', 'Vice de la rue', 'R', {fightIQ: 5, killer: 5}, 'Voit la faille quand le combat devient chaotique.', ['Opportuniste', 'Royaume-Uni']],
        ['gb18', 'Roi des Pubs', 'E', {heart: 10, hook: 5}, 'Bagarreur légendaire qui finit toujours par gagner à l\u2019usure.', ['Terreur', 'Royaume-Uni']],
        ['gb19', 'L\u2019Aristocrate', 'E', {handSpeed: 10, fightIQ: 5}, 'Boxe anglaise parfaite, élégante et destructrice.', ['Noble Art', 'Royaume-Uni']],
        ['gb20', 'L\u2019Empire', 'L', {heart: 10, clinchStr: 10}, 'La rudesse absolue mêlée à un courage sans limite.', ['Mythe anglais', 'Royaume-Uni']]
    ],
    // ----------------------------------------------------
    // RUSSIE (Sambo militaire, Froid, Castings Punches)
    // ----------------------------------------------------
    RU: [
        ['ru01', 'Sambo militaire', 'C', {takedown: 5}, 'Lutte sans kimono brutale et directe.', ['Sambo', 'Russie']],
        ['ru02', 'Casting Punch', 'C', {cross: 5}, 'Poing lourd jeté avec le poids du corps.', ['Overhand', 'Russie']],
        ['ru03', 'Sang de glace', 'C', {composure: 5}, 'Absolument aucune émotion faciale.', ['Glace', 'Russie']],
        ['ru04', 'Endurance sibérienne', 'C', {cardio: 5}, 'Ne ressent ni la fatigue ni le froid.', ['Sibérie', 'Russie']],
        ['ru05', 'Force d\u2019ours', 'C', {strength: 5}, 'Prend son adversaire et le plie en deux.', ['Force', 'Russie']],
        ['ru06', 'Clés sauvages', 'C', {submission: 5}, 'Tord les bras et jambes avec violence.', ['Soumission', 'Russie']],
        ['ru07', 'Discipline de l\u2019Armée', 'C', {discipline: 5}, 'Applique le plan de match comme un robot.', ['Machine', 'Russie']],
        ['ru08', 'Étau soviétique', 'C', {topControl: 5}, 'Poids mort sur la cible au sol. Irrespirable.', ['Contrôle', 'Russie']],
        ['ru09', 'Crochet de fer', 'C', {hook: 5}, 'Une enclume jetée à bout de bras.', ['Crochet', 'Russie']],
        ['ru10', 'Défense rocailleuse', 'C', {durability: 5}, 'Prend les coups de pied dans les côtes sans broncher.', ['Roc', 'Russie']],
        ['ru11', 'Anti-lutte lourde', 'C', {tdd: 5}, 'Hanches de plomb, impossible à balayer.', ['Base', 'Russie']],
        ['ru12', 'GNP marteau', 'C', {gnp: 5}, 'Écrase la tête de la victime contre le tapis.', ['Destruction', 'Russie']],
        ['ru13', 'Garde du Tsar', 'R', {topControl: 5, strength: 5}, 'Personne ne sort de sous son contrôle.', ['Écrasement', 'Russie']],
        ['ru14', 'Missile balistique', 'R', {cross: 5, power: 5}, 'Le Casting Punch éteint instantanément les lumières.', ['KO', 'Russie']],
        ['ru15', 'Tueur silencieux', 'R', {killer: 5, composure: 5}, 'Achève le combat sans cligner des yeux.', ['Froid', 'Russie']],
        ['ru16', 'Machine hivernale', 'R', {cardio: 5, discipline: 5}, 'Un automate qui avance round après round.', ['Cyborg', 'Russie']],
        ['ru17', 'Arrachage d\u2019os', 'R', {submission: 5, strength: 5}, 'La technique importe peu face à sa force brute.', ['Broyage', 'Russie']],
        ['ru18', 'L\u2019Ours Rouge', 'E', {strength: 10, topControl: 5}, 'Une montagne humaine inarrêtable une fois au corps-à-corps.', ['Prédateur', 'Russie']],
        ['ru19', 'Zéro Absolu', 'E', {composure: 10, power: 5}, 'Un tueur méthodique que rien ne perturbe.', ['Glace', 'Russie']],
        ['ru20', 'La Mère Patrie', 'L', {power: 10, takedown: 10}, 'Frappe comme une bombe, lutte comme un tank.', ['Légende russe', 'Russie']]
    ],
    // ----------------------------------------------------
    // MEXIQUE (Boxe, Foie, Cœur, Machismo)
    // ----------------------------------------------------
    MX: [
        ['mx01', 'Chasseur de foie', 'C', {hook: 5}, 'Crochets gauches terrifiants sous les côtes.', ['Boxe mexicaine', 'Mexique']],
        ['mx02', 'Menton d\u2019Acapulco', 'C', {durability: 5}, 'Prend un parpaing, avance et sourit.', ['Menton', 'Mexique']],
        ['mx03', 'Cœur Aztèque', 'C', {heart: 5}, 'Le sang qui coule le rend plus dangereux.', ['Guerrier', 'Mexique']],
        ['mx04', 'Volume asphyxiant', 'C', {handSpeed: 5}, 'Débit de coups de poings digne d\u2019une mitraillette.', ['Volume', 'Mexique']],
        ['mx05', 'Guerre de tranchées', 'C', {aggression: 5}, 'Transforme le combat en bagarre de cabine téléphonique.', ['Bagarre', 'Mexique']],
        ['mx06', 'Cardio des hauts-plateaux', 'C', {cardio: 5}, 'Poumons forgés dans l\u2019altitude mexicaine.', ['Cardio', 'Mexique']],
        ['mx07', 'Uppercut destructeur', 'C', {power: 5}, 'Coup de poing remontant pour décapiter la cible.', ['Uppercut', 'Mexique']],
        ['mx08', 'Clinch sale', 'C', {clinchStr: 5}, 'Ne lâche rien au corps-à-corps, frappe partout.', ['Dirty', 'Mexique']],
        ['mx09', 'Tueur instinctif', 'C', {killer: 5}, 'Flot de sang = instinct de finition immédiat.', ['Finition', 'Mexique']],
        ['mx10', 'Défense à l\u2019esquive', 'C', {footSpeed: 5}, 'Roule les épaules avec l\u2019art de la boxe.', ['Esquive', 'Mexique']],
        ['mx11', 'Takedown de rue', 'C', {takedown: 5}, 'Amène au sol pour continuer la bagarre.', ['Lutte sale', 'Mexique']],
        ['mx12', 'Récupération folle', 'C', {recovery: 5}, 'Est groggy au R1, revient neuf au R2.', ['Zombie', 'Mexique']],
        ['mx13', 'Frappe hépatique', 'R', {hook: 5, power: 5}, 'Le crochet au foie qui plie l\u2019adversaire en deux.', ['Destruction', 'Mexique']],
        ['mx14', 'Guerre absolue', 'R', {aggression: 5, heart: 5}, 'Le combat du siècle à chaque sortie.', ['Bain de sang', 'Mexique']],
        ['mx15', 'Trombe de poings', 'R', {handSpeed: 5, cardio: 5}, 'Des combos à 12 coups qui ne s\u2019arrêtent jamais.', ['Mitraillette', 'Mexique']],
        ['mx16', 'Tête de brique', 'R', {durability: 5, recovery: 5}, 'Indéboulonnable, encaisse l\u2019enfer en riant.', ['Roc', 'Mexique']],
        ['mx17', 'Le Brawler', 'R', {power: 5, clinchStr: 5}, 'Massacreur en combat très très rapproché.', ['Boucher', 'Mexique']],
        ['mx18', 'Le Dieu de la Guerre', 'E', {heart: 10, hook: 5}, 'Insubmersible, il draine l\u2019âme de l\u2019adversaire.', ['Guerrier Aztèque', 'Mexique']],
        ['mx19', 'L\u2019Assassin au Sombrero', 'E', {handSpeed: 10, cardio: 5}, 'Submerge la cible sous un océan de coups.', ['Océan', 'Mexique']],
        ['mx20', 'Légende de Tijuana', 'L', {heart: 10, durability: 10}, 'Une résistance à la douleur qui défie la médecine moderne.', ['Mythe mexicain', 'Mexique']]
    ],
    // ----------------------------------------------------
    // IRLANDE (Sniper, Trashtalk, Explosivité)
    // ----------------------------------------------------
    IE: [
        ['ie01', 'Sniper celte', 'C', {cross: 5}, 'Bras arrière millimétré qui trouve toujours la cible.', ['Sniper', 'Irlande']],
        ['ie02', 'Trash talker', 'C', {aggression: 5}, 'Détruit la confiance adverse par la parole.', ['Psychologie', 'Irlande']],
        ['ie03', 'Jeu de distance', 'C', {footSpeed: 5}, 'Posture large, in-and-out perpétuel.', ['Mobilité', 'Irlande']],
        ['ie04', 'Blitz du R1', 'C', {explosiveness: 5}, 'Démarre le combat à 200km/h pour le KO rapide.', ['Blitz', 'Irlande']],
        ['ie05', 'Combos d\u2019escrimeur', 'C', {handSpeed: 5}, 'Flot de poings rapides et relâchés.', ['Fluidité', 'Irlande']],
        ['ie06', 'Main gauche', 'C', {power: 5}, 'Une patate de forain déguisée en technique pure.', ['Frappe', 'Irlande']],
        ['ie07', 'Calme du pub', 'C', {composure: 5}, 'Ne cède jamais à la panique sous le feu.', ['Sang-froid', 'Irlande']],
        ['ie08', 'Lecture de jeu', 'C', {fightIQ: 5}, 'Calcule la distance parfaite au premier coup d\u2019œil.', ['QI', 'Irlande']],
        ['ie09', 'High Kick masqué', 'C', {kick: 5}, 'Coup de pied haut fouetté sans prévenir.', ['Kick', 'Irlande']],
        ['ie10', 'Défense glissante', 'C', {tdd: 5}, 'Fuit les hanches du lutteur comme une anguille.', ['Esquive', 'Irlande']],
        ['ie11', 'Finition froide', 'C', {killer: 5}, 'Voit l\u2019adversaire chanceler et l\u2019éteint sans pitié.', ['Finition', 'Irlande']],
        ['ie12', 'Grit caché', 'C', {heart: 5}, 'Derrière l\u2019arrogance se cache une vraie dureté.', ['Cœur', 'Irlande']],
        ['ie13', 'Main de Dieu', 'R', {cross: 5, power: 5}, 'Le bras arrière met fin au combat au premier contact.', ['One-punch', 'Irlande']],
        ['ie14', 'Guerre psychologique', 'R', {aggression: 5, fightIQ: 5}, 'L\u2019adversaire a perdu le combat avant d\u2019entrer dans la cage.', ['Génie mental', 'Irlande']],
        ['ie15', 'Fantôme du Ring', 'R', {footSpeed: 5, handSpeed: 5}, 'Touche et ressort avant le contre adverse.', ['In-out', 'Irlande']],
        ['ie16', 'Explosion irlandaise', 'R', {explosiveness: 5, killer: 5}, 'Une machine à highlights dans la première minute.', ['Blitz mortel', 'Irlande']],
        ['ie17', 'Œil de Lynx', 'R', {composure: 5, cross: 5}, 'Contre le moindre pas en avant de manière clinique.', ['Interception', 'Irlande']],
        ['ie18', 'Le Roi de Dublin', 'E', {power: 10, explosiveness: 5}, 'Un striker terrifiant de précision et de violence.', ['Légende', 'Irlande']],
        ['ie19', 'L\u2019Ombre Celte', 'E', {footSpeed: 10, fightIQ: 5}, 'Intouchable, insaisissable, rend les lutteurs fous.', ['Fantôme', 'Irlande']],
        ['ie20', 'Le Mystic', 'L', {cross: 10, fightIQ: 10}, 'Prédit le round du KO, et l\u2019exécute à la seconde près.', ['Mythe', 'Irlande']]
    ],
    // ----------------------------------------------------
    // CORÉE (Zombie, Taekwondo, Menton de fer)
    // ----------------------------------------------------
    KR: [
        ['kr01', 'Esprit Zombie', 'C', {heart: 5}, 'Avance de manière désarticulée sous les bombes.', ['Zombie', 'Corée']],
        ['kr02', 'Taekwondo pur', 'C', {kick: 5}, 'Kicks retournés spectaculaires et mortels.', ['Taekwondo', 'Corée']],
        ['kr03', 'Menton en titane', 'C', {durability: 5}, 'Prend un coup de pied dans la tête et ne bronche pas.', ['Menton', 'Corée']],
        ['kr04', 'Bagarre de Séoul', 'C', {hook: 5}, 'Cherche l\u2019échange au centre du ring pour le KO.', ['Brawl', 'Corée']],
        ['kr05', 'Défense froide', 'C', {composure: 5}, 'Garde le visage impassible face à la tempête.', ['Sang-froid', 'Corée']],
        ['kr06', 'Récupération martiale', 'C', {recovery: 5}, 'Le conditionnement du service militaire porte ses fruits.', ['Récupération', 'Corée']],
        ['kr07', 'Vitesse d\u2019exécution', 'C', {footSpeed: 5}, 'Déplacements sautillants typiques du kickboxing.', ['Mobilité', 'Corée']],
        ['kr08', 'Judo scolaire', 'C', {takedown: 5}, 'Projections pures apprises très jeune.', ['Judo', 'Corée']],
        ['kr09', 'Antilutte féroce', 'C', {tdd: 5}, 'Sprawle et renvoie un crochet instantané.', ['Défense', 'Corée']],
        ['kr10', 'Direct chirurgical', 'C', {cross: 5}, 'Une droite droite comme un i qui fend la garde.', ['Sniper', 'Corée']],
        ['kr11', 'Cardio constant', 'C', {cardio: 5}, 'Ne baisse jamais les bras de fatigue.', ['Endurance', 'Corée']],
        ['kr12', 'Finition brutale', 'C', {killer: 5}, 'N\u2019a aucune pitié pour un adversaire qui tombe.', ['Tueur', 'Corée']],
        ['kr13', 'Mort-vivant', 'R', {heart: 5, durability: 5}, 'Plus il prend de dégâts, plus il devient menaçant.', ['Zombie', 'Corée']],
        ['kr14', 'Tornade coréenne', 'R', {kick: 5, explosiveness: 5}, 'Kicks sautés à 360° qui arrachent la tête.', ['Coup retourné', 'Corée']],
        ['kr15', 'Guerre de tranchées', 'R', {hook: 5, composure: 5}, 'Détruit la cible de près sans cligner des yeux.', ['Brawl', 'Corée']],
        ['kr16', 'Conditionnement total', 'R', {recovery: 5, cardio: 5}, 'Est neuf au début de chaque nouveau round.', ['Machine', 'Corée']],
        ['kr17', 'Contre foudroyant', 'R', {cross: 5, fightIQ: 5}, 'Punit avec l\u2019exact bras arrière au bon timing.', ['Sniper', 'Corée']],
        ['kr18', 'L\u2019Increvable', 'E', {durability: 10, heart: 5}, 'Un mur de chair qui encaisse l\u2019apocalypse en souriant.', ['Roc', 'Corée']],
        ['kr19', 'Maître du Taekwondo', 'E', {kick: 10, footSpeed: 5}, 'Frappe avec les jambes comme d\u2019autres avec les poings.', ['Légende pied', 'Corée']],
        ['kr20', 'Le Zombie Coréen', 'L', {heart: 10, hook: 10}, 'Une légende de la guerre. Il ne reculera littéralement jamais.', ['Mythe Coréen', 'Corée']]
    ],
    // ----------------------------------------------------
    // CAMEROUN (Force destructrice, Predator, Athlète)
    // ----------------------------------------------------
    CM: [
        ['cm01', 'Force de la Nature', 'C', {power: 5}, 'Une puissance brute inexplicable biologiquement.', ['Destruction', 'Cameroun']],
        ['cm02', 'Le Prédateur', 'C', {killer: 5}, 'Odeur du sang = ruée frénétique vers le KO.', ['Finition', 'Cameroun']],
        ['cm03', 'Bloc de granit', 'C', {durability: 5}, 'Les poings de l\u2019adversaire rebondissent sur sa tête.', ['Roc', 'Cameroun']],
        ['cm04', 'Uppercut de l\u2019enfer', 'C', {hook: 5}, 'Soulève des hommes de 100 kilos avec un seul poing.', ['Uppercut', 'Cameroun']],
        ['cm05', 'Hanches de sable', 'C', {tdd: 5}, 'Lourd comme du plomb, impossible à amener au sol.', ['Antilutte', 'Cameroun']],
        ['cm06', 'Saut de lion', 'C', {explosiveness: 5}, 'Franchit 3 mètres en un battement de cil.', ['Vitesse', 'Cameroun']],
        ['cm07', 'Musculature dense', 'C', {strength: 5}, 'Force fonctionnelle de travailleur manuel.', ['Gabarit', 'Cameroun']],
        ['cm08', 'Jab bélier', 'C', {jab: 5}, 'Son simple jab assomme les poids légers.', ['Jab lourd', 'Cameroun']],
        ['cm09', 'Survie extrême', 'C', {heart: 5}, 'A vécu l\u2019enfer. Une cage ne l\u2019effraie pas.', ['Mental', 'Cameroun']],
        ['cm10', 'Cardio d\u2019explosion', 'C', {cardio: 5}, 'Un réservoir taillé pour 5 minutes de tempête.', ['Blitz', 'Cameroun']],
        ['cm11', 'GNP marteau', 'C', {gnp: 5}, 'Chaque frappe au sol résonne comme un coup de fusil.', ['GNP', 'Cameroun']],
        ['cm12', 'Pression muette', 'C', {aggression: 5}, 'Avance lentement, tel un monstre de film d\u2019horreur.', ['Traque', 'Cameroun']],
        ['cm13', 'Faux du faucheur', 'R', {power: 5, hook: 5}, 'L\u2019uppercut ou le crochet finalent les carrières.', ['Destruction', 'Cameroun']],
        ['cm14', 'Bête fauve', 'R', {explosiveness: 5, killer: 5}, 'Bondit sur la cible sonnée avec atrocité.', ['Fauve', 'Cameroun']],
        ['cm15', 'Mur d\u2019ébène', 'R', {tdd: 5, strength: 5}, 'Les lutteurs s\u2019écrasent contre lui comme des insectes.', ['Mur', 'Cameroun']],
        ['cm16', 'Poings de fer', 'R', {durability: 5, power: 5}, 'Frappe et encaisse sans commune mesure.', ['Acier', 'Cameroun']],
        ['cm17', 'Résilience du désert', 'R', {heart: 5, composure: 5}, 'Rien ne le fait paniquer, il a vu pire.', ['Glace', 'Cameroun']],
        ['cm18', 'Le Roi de la Savane', 'E', {power: 10, explosiveness: 5}, 'Un monstre physique qui décapite ses opposants.', ['Roi', 'Cameroun']],
        ['cm19', 'L\u2019Enclume', 'E', {strength: 10, tdd: 5}, 'Une force brute impossible à déplacer d\u2019un pouce.', ['Titan', 'Cameroun']],
        ['cm20', 'Le Prédateur Absolu', 'L', {power: 10, killer: 10}, 'Touche une fois. Le combat est fini. Point barre.', ['Mythe Africain', 'Cameroun']]
    ],
    // ----------------------------------------------------
    // GÉORGIE (Lutte Caucasienne, Boxe Lourdes, Cardio)
    // ----------------------------------------------------
    GE: [
        ['ge01', 'Lutte caucasienne', 'C', {takedown: 5}, 'Takedown constant, lourd et épuisant.', ['Lutte', 'Géorgie']],
        ['ge02', 'Crochet géorgien', 'C', {hook: 5}, 'Crochet du gauche jeté avec haine.', ['Boxe lourde', 'Géorgie']],
        ['ge03', 'Grappling féroce', 'C', {topControl: 5}, 'Broie la cible au sol pour la faire taper.', ['Contrôle', 'Géorgie']],
        ['ge04', 'Mental d\u2019acier', 'C', {heart: 5}, 'Un esprit de guerre qui ne recule jamais.', ['Cœur', 'Géorgie']],
        ['ge05', 'Poumons de montagne', 'C', {cardio: 5}, 'Cardio inépuisable même au 5ème round.', ['Endurance', 'Géorgie']],
        ['ge06', 'Judo brutal', 'C', {strength: 5}, 'Projections héritées du judo soviétique.', ['Judo', 'Géorgie']],
        ['ge07', 'Sambo de Tbilissi', 'C', {submission: 5}, 'Clés de bras vicieuses sorties de nulle part.', ['Sambo', 'Géorgie']],
        ['ge08', 'Défense en bloc', 'C', {durability: 5}, 'Prend les frappes sur le front et sourit.', ['Roc', 'Géorgie']],
        ['ge09', 'Pression constante', 'C', {aggression: 5}, 'Marche en avant en lançant des bombes.', ['Pression', 'Géorgie']],
        ['ge10', 'Antilutte passive', 'C', {tdd: 5}, 'Bloque avec la hanche sans effort visible.', ['Défense', 'Géorgie']],
        ['ge11', 'GNP hargneux', 'C', {gnp: 5}, 'Coudes et poings lâchés avec violence au sol.', ['GNP', 'Géorgie']],
        ['ge12', 'Vitesse surprenante', 'C', {footSpeed: 5}, 'Gabarit lourd mais déplacement ultra-véloce.', ['Vélocité', 'Géorgie']],
        ['ge13', 'Tornade de lutte', 'R', {takedown: 5, cardio: 5}, 'Une machine à takedown qui ne fatigue jamais.', ['Machine', 'Géorgie']],
        ['ge14', 'Poing de Tbilissi', 'R', {hook: 5, power: 5}, 'Un seul crochet suffit à briser la garde.', ['Destruction', 'Géorgie']],
        ['ge15', 'Broyeur au sol', 'R', {topControl: 5, strength: 5}, 'Contrôle écrasant interdisant toute fuite.', ['Étau', 'Géorgie']],
        ['ge16', 'Cœur caucasien', 'R', {heart: 5, durability: 5}, 'Prend les pires KO potentiels et continue.', ['Increvable', 'Géorgie']],
        ['ge17', 'Guerrier complet', 'R', {takedown: 5, hook: 5}, 'Frappe lourd, lutte lourd. Zéro respiration.', ['Hybride', 'Géorgie']],
        ['ge18', 'Le Monstre du Caucase', 'E', {cardio: 10, takedown: 5}, 'Épuise littéralement la vie de tous ses adversaires.', ['Usure', 'Géorgie']],
        ['ge19', 'L\u2019Exécuteur', 'E', {power: 10, hook: 5}, 'Frappe avec une puissance tétanisante.', ['Finition', 'Géorgie']],
        ['ge20', 'Le Roi de Géorgie', 'L', {takedown: 10, power: 10}, 'Une légende alliant la lutte de l\u2019Est et les poings d\u2019acier.', ['Mythe Géorgien', 'Géorgie']]
    ]
};

// On enregistre les tableaux dans le dictionnaire central SKILLS
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
