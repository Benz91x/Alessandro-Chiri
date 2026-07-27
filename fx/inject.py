#!/usr/bin/env python3
"""Ripristina index.html (se corrotto) e inietta il FX layer nel template __bundler.
Idempotente: il blocco tra i marker FX-LAYER viene sostituito a ogni run."""
import json, re, subprocess, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
IDX = ROOT / "index.html"

def sh(*args):
    return subprocess.run(args, capture_output=True, text=True, cwd=ROOT).stdout

def load_good_index():
    cur = IDX.read_text(encoding="utf-8")
    if '__bundler/template' in cur:
        return cur
    # ripristina dalla cronologia git: primo commit con un index.html valido
    for sha in sh("git", "log", "--format=%H", "--", "index.html").split():
        content = sh("git", "show", sha + ":index.html")
        if '__bundler/template' in content:
            print("ripristino index.html dal commit", sha[:8])
            return content
    sys.exit("ERRORE: nessun index.html valido in cronologia")

raw = load_good_index()

m = re.search(r'<script type="__bundler/template">\s*(.*?)\s*</script>', raw, re.S)
if not m:
    sys.exit("ERRORE: template __bundler non trovato")
tpl = json.loads(m.group(1))

# Blocco FX: marker per idempotenza
BEGIN, END = "<!-- FX-LAYER-BEGIN -->", "<!-- FX-LAYER-END -->"
tpl = re.sub(re.escape(BEGIN) + r".*?" + re.escape(END) + r"\s*", "", tpl, flags=re.S)

css = (ROOT / "fx" / "fx.css").read_text(encoding="utf-8")
js  = (ROOT / "fx" / "fx.js").read_text(encoding="utf-8")
block = (BEGIN + '\n<style id="fx-style">\n' + css + '\n</style>\n'
         + '<script>\n' + js + '\n</script>\n' + END + '\n')

assert tpl.rstrip().endswith("</body></html>")
tpl = tpl.rstrip()[:-len("</body></html>")] + block + "</body></html>"

tj = json.dumps(tpl, ensure_ascii=False).replace("</", "<\\/")
new_raw = raw.replace(m.group(0),
    '<script type="__bundler/template">\n' + tj + '\n  </script>')

if new_raw != IDX.read_text(encoding="utf-8"):
    IDX.write_text(new_raw, encoding="utf-8")
    print("index.html aggiornato:", len(new_raw), "bytes")
else:
    print("index.html gia aggiornato, nessuna modifica")
