#!/bin/bash
# Veille : une ligne par evenement (commit, relance, arret) et un point d'etat toutes les 10 minutes.
J="C:/Users/antho/AppData/Local/Temp/claude/C--Users-antho-Documents-Default-Project/b738b841-d254-44e2-a8d4-1fd774f4095d/scratchpad/journaux"
declare -A last; declare -A lastcommit
for d in corps arene suivi fetes; do last[$d]=$(git -C /c/Users/antho/Documents/cage-legacy-$d rev-parse HEAD); lastcommit[$d]=$(date +%s); done
t0=$(date +%s)
while true; do
  sleep 45
  now=$(date +%s)
  for d in corps arene suivi fetes; do
    h=$(git -C /c/Users/antho/Documents/cage-legacy-$d rev-parse HEAD 2>/dev/null)
    if [ "$h" != "${last[$d]}" ]; then
      echo "COMMIT $d : $(git -C /c/Users/antho/Documents/cage-legacy-$d log -1 --format='%h %s' | cut -c1-100)"
      last[$d]=$h; lastcommit[$d]=$now
    fi
  done
  for l in lot9 lot10 lot6 lot8; do
    [ -f "$J/s-$l.log.tue" ] && { echo "RELANCE $l : $(cat "$J/s-$l.log.tue")"; rm -f "$J/s-$l.log.tue.vu"; }
  done
  if [ $(( (now - t0) % 600 )) -lt 45 ]; then
    n=$(powershell -NoProfile -Command "(Get-CimInstance Win32_Process | Where-Object { \$_.Name -eq 'opencode.exe' -and \$_.CommandLine -match 'enchainer' }).Count" | tr -d '\r\n ')
    echo "ETAT chefs actifs=$n | dernier commit il y a : corps $(( (now-lastcommit[corps])/60 )) min, arene $(( (now-lastcommit[arene])/60 )) min, suivi $(( (now-lastcommit[suivi])/60 )) min, fetes $(( (now-lastcommit[fetes])/60 )) min | limites=$(grep -l "usage limit" "$J"/s-lot*.log 2>/dev/null | wc -l)"
  fi
done
