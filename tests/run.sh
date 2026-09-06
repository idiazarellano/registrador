#!/bin/sh
# Ejecuta las pruebas de la lógica de index.html con gjs (SpiderMonkey, viene con GNOME).
# Uso: tests/run.sh   → imprime OK/FAIL por comprobación y termina con error si alguna falla.
cd "$(dirname "$0")/.." || exit 1
tmp=$(mktemp -d)
python3 - "$tmp" <<'PY'
import sys
s=open('index.html',encoding='utf-8').read()
js=s[s.index('<script>')+8:s.rindex('</script>')].replace("'use strict';",'',1)
open(sys.argv[1]+'/app.js','w',encoding='utf-8').write(js)
PY
cat tests/stub.js "$tmp/app.js" tests/tests.js > "$tmp/run.js"
out=$(gjs "$tmp/run.js" 2>&1 | grep -v Gjs-Message)
rm -rf "$tmp"
echo "$out" | grep -E '^(OK|FAIL|TODO OK|FALLOS)' | grep -v '^OK' ; echo "$out" | grep -E 'Error|error' | grep -v '^FAIL' 
n_ok=$(echo "$out" | grep -c '^OK'); n_fail=$(echo "$out" | grep -c '^FAIL')
echo "$n_ok OK, $n_fail FAIL"
[ "$n_fail" -eq 0 ]
