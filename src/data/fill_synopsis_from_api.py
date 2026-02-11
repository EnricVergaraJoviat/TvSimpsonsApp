#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os
import re
import shutil
import time
import urllib.request
from datetime import datetime

API_LIST = "https://thesimpsonsapi.com/api/episodes?page={}"
INPUT_JS = "simpsons.js"
BACKUP_JS = "simpsons.js.bak"

TIMEOUT = 12
SLEEP_SECONDS = 0.15

PRINT_EVERY_PAGE = True
PRINT_UPDATES = True


def http_get_json(url: str):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
        raw = resp.read().decode("utf-8")
        return json.loads(raw)


def extract_data_object(js_text: str):
    """
    Encuentra 'const data = { ... }' y devuelve (prefix, data_dict, suffix)
    """
    m = re.search(r"\bconst\s+data\s*=\s*", js_text)
    if not m:
        raise RuntimeError("No encuentro 'const data ='. Revisa simpsons.js")

    start = m.end()
    first_brace = js_text.find("{", start)
    if first_brace == -1:
        raise RuntimeError("No encuentro el '{' inicial del objeto data.")

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
        raise RuntimeError("No pude encontrar el '}' final del objeto data (llaves desbalanceadas).")

    prefix = js_text[:first_brace]
    obj_text = js_text[first_brace : end_brace + 1]
    suffix = js_text[end_brace + 1 :]

    data_dict = json.loads(obj_text)
    return prefix, data_dict, suffix


def build_local_index(data_dict: dict):
    """
    Index local: (seasonId, episodeNumberWithinSeason) -> episode_ref
    """
    idx = {}
    for s in data_dict.get("seasons", []):
        sid = int(s.get("id"))
        for e in s.get("episodes", []):
            key = (sid, int(e.get("episodeNumber", 0)))
            idx[key] = e
    return idx


def main():
    print(f"[DEBUG] CWD: {os.getcwd()}")
    if not os.path.isfile(INPUT_JS):
        raise SystemExit(f"[ERROR] No encuentro {INPUT_JS} en el directorio actual.")

    js_text = open(INPUT_JS, "r", encoding="utf-8").read()
    prefix, data_dict, suffix = extract_data_object(js_text)

    local_idx = build_local_index(data_dict)
    print(f"[DEBUG] Index local construido: {len(local_idx)} episodios")

    first = http_get_json(API_LIST.format(1))
    pages = int(first.get("pages", 1))
    count = int(first.get("count", 0))
    print(f"[DEBUG] API: count={count} pages={pages}")

    all_eps = []
    all_eps.extend(first.get("results", []))

    for p in range(2, pages + 1):
        url = API_LIST.format(p)
        if PRINT_EVERY_PAGE:
            print(f"[PAGE] {p}/{pages} -> {url}")
        page_data = http_get_json(url)
        all_eps.extend(page_data.get("results", []))
        time.sleep(SLEEP_SECONDS)

    print(f"[DEBUG] Total episodios descargados de API: {len(all_eps)}")

    # Agrupar por season
    by_season = {}
    for ep in all_eps:
        s = ep.get("season")
        en = ep.get("episode_number")
        if s is None or en is None:
            continue
        sid = int(s)
        by_season.setdefault(sid, []).append(ep)

    updated = 0
    missing = 0

    for sid, eps in by_season.items():
        # Orden dentro de temporada por episode_number (global pero creciente)
        eps_sorted = sorted(eps, key=lambda x: int(x.get("episode_number", 10**9)))

        for i, api_ep in enumerate(eps_sorted, start=1):
            key = (sid, i)  # i = número dentro de temporada (1..)
            local_ep = local_idx.get(key)

            if not local_ep:
                missing += 1
                continue

            api_name = (api_ep.get("name") or "").strip()
            api_syn = (api_ep.get("synopsis") or "").strip()
            api_air = (api_ep.get("airdate") or "").strip()

            before_title = local_ep.get("title", "")
            before_air = local_ep.get("airDate", "")

            if api_name:
                local_ep["title"] = api_name
            if api_syn:
                local_ep["synopsis"] = api_syn
            if api_air:
                local_ep["airDate"] = api_air  # YYYY-MM-DD

            updated += 1

            if PRINT_UPDATES:
                print(
                    f"[UPDATE] S{sid:02d}E{i:02d} <= API episode_number={api_ep.get('episode_number')} "
                    f"| title: {before_title!r} -> {local_ep.get('title')!r} "
                    f"| airDate: {before_air!r} -> {local_ep.get('airDate')!r}"
                )

    shutil.copyfile(INPUT_JS, BACKUP_JS)
    print(f"[DEBUG] Backup creado: {BACKUP_JS}")

    new_obj_text = json.dumps(data_dict, ensure_ascii=False, indent=2)
    new_js = prefix + new_obj_text + suffix

    with open(INPUT_JS, "w", encoding="utf-8") as f:
        f.write(new_js)

    print("\n=== RESUMEN ===")
    print(f"Actualizados: {updated}")
    print(f"Sin match (tu dataset no tenía ese SxxExx): {missing}")
    print("OK -> simpsons.js actualizado por season + orden por episode_number.")


if __name__ == "__main__":
    main()
