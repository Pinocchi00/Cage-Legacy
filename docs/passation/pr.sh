#!/bin/bash
# usage: pr.sh branch "title" "body"
cd "C:/Users/antho/Documents/cage-legacy-docs"
TOK=$(printf "protocol=https\nhost=github.com\n\n" | git credential fill | sed -n 's/^password=//p')
python - "$1" "$2" "$3" <<'PY' > "$TEMP/pr.json"
import json,sys
print(json.dumps({"title":sys.argv[2],"head":sys.argv[1],"base":"main","body":sys.argv[3]+"\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)"}))
PY
N=$(curl -s -X POST -H "Authorization: token $TOK" -H "Accept: application/vnd.github+json" https://api.github.com/repos/Pinocchi00/Cage-Legacy/pulls -d @"$TEMP/pr.json" | sed -n 's/^  "number": \([0-9]*\),/\1/p' | head -1)
echo PR $N
for i in 1 2 3; do curl -s -X PUT -H "Authorization: token $TOK" https://api.github.com/repos/Pinocchi00/Cage-Legacy/pulls/$N/merge -d '{"merge_method":"squash"}' | grep -E '"merged"|message' && break; sleep 3; done
git checkout -q main && git pull -q origin main; git log --oneline -1
