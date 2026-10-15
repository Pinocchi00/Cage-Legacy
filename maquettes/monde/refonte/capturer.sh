#!/bin/bash
# Captures des planches à 1280×720, 1440×900, 1920×1080 et contrôle (Edge sans fenêtre, serveur local port 8781).
# bash capturer.sh [Planche] — sans argument : les trois.
EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
ICI="$(cd "$(dirname "$0")" && pwd)"
declare -A ETATS=([MondeChargement]="chargement debut fin erreur" [MondeArrivee]="premiere sans-passe" [MondeResultats]="joueur passe blessure contrat premier-jour vide")
for P in ${1:-MondeChargement MondeArrivee MondeResultats}; do
  [ -f "$ICI/$P.html" ] || continue
  for E in ${ETATS[$P]}; do
    for T in 1280,720 1440,900 1920,1080; do
      "$EDGE" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=$T --virtual-time-budget=4000 \
        --screenshot="$(cygpath -w "$ICI/captures/$P-$E-${T%,*}.png")" "http://127.0.0.1:8781/$P.html?etat=$E" >/dev/null 2>&1
    done
    R=$("$EDGE" --headless=new --disable-gpu --window-size=1920,1080 --virtual-time-budget=4000 --dump-dom "http://127.0.0.1:8781/$P.html?etat=$E&audit=1" 2>/dev/null | grep -o 'data-audit="[^"]*"' | sed 's/&quot;/"/g')
    echo "$P $E : ${R:-pas de résultat}"
  done
done
