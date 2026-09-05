#!/usr/bin/env python3
"""Genera una copia de index.html sin doctype/html/head/body para publicarla como artefacto de claude.ai
(el visor de artefactos añade su propio esqueleto). Uso: python3 publicar-artefacto.py destino.html"""
import sys,re
s=open('index.html',encoding='utf-8').read()
s=re.sub(r'^<!doctype html>\s*<html[^>]*>\s*<head>\s*<meta charset="utf-8">\s*<meta name="viewport"[^>]*>\s*','',s)
s=s.replace('\n</head>\n<body>','').replace('\n</body>\n</html>\n','\n')
open(sys.argv[1],'w',encoding='utf-8').write(s)
