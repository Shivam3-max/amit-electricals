#!/usr/bin/env python3
"""Download product images referenced in ingest/data/*.json.

Files land in public/products/<brand>/<slug>-<n>.<ext> and each product row
gets a `local_images` array (multiple real photos where the brand actually
has them) pointing at the public paths.

Two brand-data quirks get cleaned up before a product's gallery is final:
  - Some Polycab pages register the same photo twice under different CMS
    media hashes — same filename, different URL. Deduped per product.
  - Halonix product pages mix a handful of shared "why choose us" / use-case
    icons into the image list (e.g. Retail-icon-pro.png, appears on 30+
    unrelated products). These turned out to have no reliable URL-frequency
    cutoff — some are reused 30+ times, but a handful of genuine shared
    product photos (siblings in the same line) repeat only 3-4 times too, in
    the same range as the least-reused icons. What does separate them
    cleanly is pixel size: every icon sampled was <=150px on a side, every
    real product photo sampled was 450px+. So icons are dropped by actually
    checking the downloaded image's dimensions, not by guessing from the URL.
"""
import hashlib, io, json, os, re, sys, time
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
import requests
from PIL import Image

UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
                    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"}
S = requests.Session(); S.headers.update(UA)
ROOT = "public/products"
PER_PRODUCT_CAP = 5
OBVIOUS_ICON_THRESHOLD = 12  # skip fetching a URL reused this many+ times brand-wide
MIN_PHOTO_SIDE = 200         # px; below this on both sides, it reads as an icon/badge


def slug(s):
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", (s or "").lower())).strip("-")[:70] or "item"


def basename(u):
    return u.rsplit("/", 1)[-1].split("?")[0].lower()


def grab(job):
    """Download, verify it's a real photo (not an icon), or drop it."""
    url, dest = job
    if os.path.exists(dest) and os.path.getsize(dest) > 900:
        return dest
    for i in range(3):
        try:
            r = S.get(url, timeout=45)
            if r.status_code == 200 and len(r.content) > 900:
                try:
                    w, h = Image.open(io.BytesIO(r.content)).size
                except Exception:
                    w = h = MIN_PHOTO_SIDE  # unreadable as an image (e.g. svg) — let it through
                if w < MIN_PHOTO_SIDE and h < MIN_PHOTO_SIDE:
                    return None  # icon/badge, not a product photo
                os.makedirs(os.path.dirname(dest), exist_ok=True)
                with open(dest, "wb") as f:
                    f.write(r.content)
                return dest
        except Exception:
            pass
        time.sleep(0.5 * (i + 1))
    return None


def clean_gallery(urls, overused):
    """Drop obviously brand-wide-shared URLs and same-product duplicate filenames."""
    out, seen = [], set()
    for u in urls:
        b = basename(u)
        if overused.get(b, 0) >= OBVIOUS_ICON_THRESHOLD:
            continue
        if b in seen:
            continue
        seen.add(b)
        out.append(u)
        if len(out) >= PER_PRODUCT_CAP:
            break
    return out


def main(brands):
    for b in brands:
        p = f"ingest/data/{b}.json"
        if not os.path.exists(p):
            print(f"skip {b} (no data)"); continue
        rows = json.load(open(p))

        freq = Counter()
        for r in rows:
            for u in dict.fromkeys(r.get("images") or []):  # once per product
                freq[basename(u)] += 1
        overused = {k: v for k, v in freq.items() if v >= OBVIOUS_ICON_THRESHOLD}
        if overused:
            print(f"[{b}] pre-skipping {len(overused)} URLs reused {OBVIOUS_ICON_THRESHOLD}+ times "
                  f"(e.g. {list(overused)[:3]})", flush=True)

        jobs, plan = [], []
        used = {}
        for r in rows:
            base = slug(r.get("sku") or r.get("name"))
            n = used.get(base, 0); used[base] = n + 1
            if n:
                base = f"{base}-{n}"
            gallery = clean_gallery(r.get("images") or [], overused)
            locals_ = []
            for i, u in enumerate(gallery):
                ext = re.search(r"\.(jpg|jpeg|png|webp)", u.lower())
                ext = ext.group(1) if ext else "jpg"
                ext = "jpg" if ext == "jpeg" else ext
                name = f"{base}{'' if i == 0 else f'-{i}'}.{ext}"
                dest = f"{ROOT}/{b}/{name}"
                jobs.append((u, dest)); locals_.append((dest, f"/products/{b}/{name}"))
            plan.append((r, locals_))
        print(f"[{b}] {len(jobs)} candidate images", flush=True)
        ok = set()
        with ThreadPoolExecutor(max_workers=16) as ex:
            for n, d in enumerate(ex.map(grab, jobs), 1):
                if d:
                    ok.add(d)
                if n % 300 == 0:
                    print(f"[{b}] {n}/{len(jobs)}", flush=True)
        for r, locals_ in plan:
            r["local_images"] = [pub for dest, pub in locals_ if dest in ok]
        json.dump(rows, open(p, "w"), indent=1)
        have = sum(1 for r in rows if r.get("local_images"))
        multi = sum(1 for r in rows if len(r.get("local_images") or []) > 1)
        print(f"[{b}] DONE {len(ok)} files, {have}/{len(rows)} products have art, "
              f"{multi} have 2+ photos", flush=True)


if __name__ == "__main__":
    main(sys.argv[1:] or ["indo", "surya", "halonix", "polycab"])
