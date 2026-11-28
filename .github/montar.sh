#!/usr/bin/env bash
set -euo pipefail
ORIGEM="$(cd "${1:?pasta do pokepocket}" && pwd)"
DESTINO="$(cd "${2:-.}" && pwd)"
PAGINAS="calculadora nivel tier posicionamento monte-seu-time farm shinies"

node "$ORIGEM/ferramentas/gerar-isolado.mjs" "$ORIGEM" "$DESTINO"

for p in $PAGINAS; do
  rsync -a --delete --exclude 'index.html' "$ORIGEM/$p/" "$DESTINO/$p/"
done
rsync -a --delete --exclude '*.mp4' --exclude 'prints/' --exclude 'showreel-capa.jpg' --exclude 'treino-capa.jpg' "$ORIGEM/assets/" "$DESTINO/assets/"

find "$DESTINO" -path "$DESTINO/.git" -prune -o -path "$DESTINO/.github" -prune -o -path "$ORIGEM" -prune -o -type f \( -name '*.html' -o -name '*.js' -o -name '*.mjs' -o -name '*.css' \) -print0 |
  xargs -0 perl -pi -e 's#https://iampiscis\.github\.io/pokepocket/#https://iampiscis.github.io/pokepocketferramentas/#g; s#(["'"'"'(=])/pokepocket/#$1/pokepocketferramentas/#g'

if grep -rIlE '(["'"'"'(=])/pokepocket/|iampiscis\.github\.io/pokepocket/' "$DESTINO" --include='*.html' --include='*.js' --include='*.css' --exclude-dir=.git --exclude-dir=.github | grep -v "^$ORIGEM"; then
  echo "sobrou endereço do site principal" >&2
  exit 1
fi
echo "ferramentas montadas sem depender do site principal"
