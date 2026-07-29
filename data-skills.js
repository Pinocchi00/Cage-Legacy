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
