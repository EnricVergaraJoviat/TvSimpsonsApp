#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import json
import re
import shutil
import time
import urllib.parse
import urllib.request

INPUT_JS_DEFAULT = "simpsons.js"
BACKUP_JS_DEFAULT = "simpsons.js.bak.es"
TIMEOUT = 12
SLEEP_SECONDS = 0.12


def extract_data_object(js_text: str):
    m = re.search(r"\bconst\s+data\s*=\s*", js_text)
    if not m:
        raise RuntimeError("No encuentro 'const data ='.")

    start = m.end()
    first_brace = js_text.find("{", start)
    if first_brace == -1:
        raise RuntimeError("No encuentro '{' inicial del objeto data.")

    depth = 0
    end_brace = None
    for i in range(first_brace, len(js_text)):
        ch = js_text[i]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                end_brace = i
                break

    if end_brace is None:
        raise RuntimeError("No pude encontrar '}' final del objeto data.")

    prefix = js_text[:first_brace]
    obj_text = js_text[first_brace : end_brace + 1]
    suffix = js_text[end_brace + 1 :]

    data_dict = json.loads(obj_text)
    return prefix, data_dict, suffix


def translate_en_to_es(text: str) -> str:
    if not text:
        return ""

    url = (
        "https://translate.googleapis.com/translate_a/single"
        f"?client=gtx&sl=en&tl=es&dt=t&q={urllib.parse.quote(text)}"
    )
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
        raw = resp.read().decode("utf-8")
    payload = json.loads(raw)
    return "".join(part[0] for part in payload[0] if part and part[0])


def main():
    parser = argparse.ArgumentParser(
        description="Añade titleEs/synopsisEs en simpsons.js usando traducción automática."
    )
    parser.add_argument("--input", default=INPUT_JS_DEFAULT, help="Archivo JS de entrada.")
    parser.add_argument("--backup", default=BACKUP_JS_DEFAULT, help="Archivo backup.")
    parser.add_argument(
        "--overwrite-existing",
        action="store_true",
        help="Sobrescribe titleEs/synopsisEs existentes.",
    )
    args = parser.parse_args()

    js_text = open(args.input, "r", encoding="utf-8").read()
    prefix, data_dict, suffix = extract_data_object(js_text)

    total = 0
    translated = 0
    errors = 0

    for season in data_dict.get("seasons", []):
        season_title = (season.get("title") or "").strip()
        if season_title:
            if args.overwrite_existing or not season.get("titleEs"):
                season["titleEs"] = season_title

        for ep in season.get("episodes", []):
            total += 1

            try:
                title = (ep.get("title") or "").strip()
                synopsis = (ep.get("synopsis") or "").strip()

                if title and (args.overwrite_existing or not ep.get("titleEs")):
                    ep["titleEs"] = translate_en_to_es(title)
                    time.sleep(SLEEP_SECONDS)

                if synopsis and (args.overwrite_existing or not ep.get("synopsisEs")):
                    ep["synopsisEs"] = translate_en_to_es(synopsis)
                    time.sleep(SLEEP_SECONDS)

                translated += 1
                print(f"[OK] {ep.get('id')} traducido")
            except Exception as err:
                errors += 1
                print(f"[ERR] {ep.get('id')} -> {err}")

    shutil.copyfile(args.input, args.backup)
    print(f"[DEBUG] Backup creado: {args.backup}")

    new_obj_text = json.dumps(data_dict, ensure_ascii=False, indent=2)
    new_js = prefix + new_obj_text + suffix
    with open(args.input, "w", encoding="utf-8") as f:
        f.write(new_js)

    print("\n=== RESUMEN ===")
    print(f"Episodios procesados: {total}")
    print(f"Episodios traducidos: {translated}")
    print(f"Errores: {errors}")


if __name__ == "__main__":
    main()
