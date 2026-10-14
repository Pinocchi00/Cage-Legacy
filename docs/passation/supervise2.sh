#!/bin/bash
# Relance le chef OpenCode s'il reste muet plus de 12 minutes. Usage: supervise.sh <dossier> <journal> <args enchainer...>
DIR="$1"; LOG="$2"; shift 2; LOT="$1"
cd "$DIR" || exit 1
for essai in $(seq 1 12); do
  : > "$LOG"; rm -f "$LOG.tue"
  timeout 6h opencode run --agent chef --command enchainer "$@" >> "$LOG" 2>&1 &
  PID=$!
  while kill -0 $PID 2>/dev/null; do
    sleep 30
    age=$(( $(date +%s) - $(stat -c %Y "$LOG") ))
    if [ "$age" -gt 1800 ]; then
      echo "muet ${age}s essai $essai" > "$LOG.tue"
      powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { \$_.Name -eq 'opencode.exe' -and \$_.CommandLine -match 'enchainer $LOT ' } | ForEach-Object { Stop-Process -Id \$_.ProcessId -Force -Confirm:\$false }" > /dev/null 2>&1
      break
    fi
  done
  wait $PID 2>/dev/null
  [ -f "$LOG.tue" ] || break
  sleep 5
done
echo "fin supervise $(date +%H:%M)"; git log --format='%h %s' origin/main..HEAD | head -12
