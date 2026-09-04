#!/usr/bin/env python3
"""Catalog ingestion for Amit Electricals.

Pulls product metadata (name, sku, category, specs, image URLs) from the
partner-brand sites. Images are fetched separately by fetch_images.py so a
metadata re-run stays cheap.
"""
import json, re, sys, time, html as htmlmod
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
import requests
from bs4 import BeautifulSoup

UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
                    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"}
S = requests.Session()
S.headers.update(UA)
OUT = "ingest/data"


def get(url, tries=3):
    for i in range(tries):
        try:
            r = S.get(url, timeout=30)
            if r.status_code == 200:
                return r.text
        except Exception:
            pass
        time.sleep(0.6 * (i + 1))
    return None


def sitemap_urls(url):
    x = get(url) or ""
    return [u.strip() for u in re.findall(r"<loc>\s*(.*?)\s*</loc>", x, re.S)]


def clean(t):
    return re.sub(r"\s+", " ", htmlmod.unescape(t or "")).strip()


def tables(soup):
    """Every <table> as {headers:[], rows:[[]]}."""
    out = []
    for t in soup.find_all("table"):
        rows = []
        for tr in t.find_all("tr"):
            cells = [clean(c.get_text(" ")) for c in tr.find_all(["th", "td"])]
            if any(cells):
                rows.append(cells)
        if not rows:
            continue
        head = rows[0] if t.find("th") else []
        body = rows[1:] if head else rows
        out.append({"headers": head, "rows": body})
    return out


def kv_table(soup, sel):
    """Two-column th/td spec table -> dict."""
    spec = {}
    sec = soup.select_one(sel)
    if not sec:
        return spec
    for tr in sec.find_all("tr"):
        th, td = tr.find("th"), tr.find("td")
        if th and td:
            spec[clean(th.get_text(" "))] = clean(td.get_text(" "))
    return spec


# --------------------------------------------------------------- polycab
def polycab_urls():
    idx = sitemap_urls("https://polycab.com/sitemap.xml")
    urls = []
    for s in idx:
        if "product-sitemap" in s or "category-sitemap" in s:
            urls += sitemap_urls(s)
    return [u for u in urls if "/p-" in u]


def polycab_one(url):
    h = get(url)
    if not h:
        return None
    soup = BeautifulSoup(h, "lxml")
    prod = crumbs = None
    for sc in soup.find_all("script", type="application/ld+json"):
        try:
            d = json.loads(sc.string or "")
        except Exception:
            continue
        for c in (d if isinstance(d, list) else [d]):
            if not isinstance(c, dict):
                continue
            if c.get("@type") == "Product":
                prod = c
            elif c.get("@type") == "BreadcrumbList":
                crumbs = [i.get("name") for i in c.get("itemListElement", [])][1:]
    if not prod:
        return None
    sku = (prod.get("sku") or "").strip()
    gallery = []
    if sku:
        pat = re.compile(re.escape(sku.lower()) + r"[^\"'\s]*\.(?:png|jpg|jpeg|webp)")
        gallery = sorted({m.group(0) and u for u in
                          re.findall(r"https://cms\.polycab\.com/media/[^\"'\s\\?]+", h)
                          for m in [pat.search(u.lower())] if m})
    main = (prod.get("image") or "").split("?")[0]
    if main and main not in gallery:
        gallery.insert(0, main)
    off = prod.get("offers") or {}
    return {
        "brand": "Polycab",
        "name": clean(prod.get("name")),
        "sku": sku,
        "description": clean(prod.get("description")),
        "mrp": off.get("price"),
        "availability": (off.get("availability") or "").rsplit("/", 1)[-1],
        "category_path": [c for c in (crumbs or []) if c],
        "specs": kv_table(soup, "section.prod__attributes") or kv_table(soup, "body"),
        "variant_tables": [],
        "images": gallery,
        "source": url,
    }


# --------------------------------------------------------------- halonix
HALO_SKIP = ("/blog", "/news", "/about", "/contact", "/career", "/investor", "/sample-page",
             "/register-a-complaint", "/milestones", "/become-a-dealer", "/coming-soon",
             "/privacy", "/terms", "/author", "/warranty", "/-bkp")


def halonix_urls():
    urls = []
    for s in sitemap_urls("https://www.halonix.co.in/sitemap_index.xml"):
        if "page-sitemap" in s or "category-sitemap" in s:
            urls += sitemap_urls(s)
    keep = []
    for u in urls:
        p = u.replace("https://www.halonix.co.in", "").strip("/")
        if not p or any(s in u for s in HALO_SKIP):
            continue
        if len(p.split("/")) >= 3:          # brand/category/product depth
            keep.append(u)
    return sorted(set(keep))


def halonix_one(url):
    h = get(url)
    if not h:
        return None
    soup = BeautifulSoup(h, "lxml")
    h1 = soup.find("h1")
    name = clean(h1.get_text(" ")) if h1 else clean(
        (soup.title.string if soup.title else "")).replace(" - Halonix", "")
    if not name:
        return None
    path = [p.replace("-", " ").title() for p in
            url.replace("https://www.halonix.co.in", "").strip("/").split("/")[:-1]]
    imgs = []
    og = soup.find("meta", property="og:image")
    if og and og.get("content"):
        imgs.append(og["content"])
    for im in soup.select("#ajax-content img, .container-wrap img"):
        src = im.get("data-src") or im.get("src") or ""
        if "wp-content/uploads" in src and not re.search(r"-\d+x\d+\.", src):
            if src not in imgs and "logo" not in src.lower() and "favicon" not in src.lower():
                imgs.append(src)
    body = soup.select_one("#ajax-content") or soup
    paras = [clean(p.get_text(" ")) for p in body.find_all("p")]
    desc = next((p for p in paras if len(p) > 60), "")
    return {
        "brand": "Halonix",
        "name": name,
        "sku": "",
        "description": desc,
        "mrp": None,
        "availability": "InStock",
        "category_path": path,
        "specs": {},
        "variant_tables": tables(body),
        "images": imgs[:8],
        "source": url,
    }


# --------------------------------------------------------------- surya
SURYA_KEEP = ("/consumer-lighting/", "/professional-lighting/", "/fans/", "/home-appliances/")


def surya_urls():
    urls = sitemap_urls("https://www.surya.co.in/sitemap.xml")
    keep = []
    for u in urls:
        p = u.replace("https://www.surya.co.in", "")
        if any(p.startswith(k) for k in SURYA_KEEP) and len(p.strip("/").split("/")) >= 3:
            keep.append(u)
    return sorted(set(keep))


def surya_one(url):
    h = get(url)
    if not h:
        return None
    soup = BeautifulSoup(h, "lxml")
    h1 = soup.find("h1")
    name = clean(h1.get_text(" ")) if h1 else ""
    if not name:
        og = soup.find("meta", property="og:title")
        name = clean(og["content"]) if og and og.get("content") else ""
    if not name:
        return None
    path = [p.replace("-", " ").title() for p in
            url.replace("https://www.surya.co.in", "").strip("/").split("/")[:-1]]
    # Next.js proxies images; the real asset host is crm.surya.co.in. The page
    # template repeats the product's OWN photo several times (base <img> plus
    # responsive/srcset variants), while each "Similar Products" thumbnail
    # further down the page appears only once or twice — so the most-repeated
    # URL on the page is reliably the product's real photo. A slug/filename
    # match is unreliable here: many real photos are filed under a generic
    # name (e.g. "driver_....jpg" for "Profile Strip Driver") that a prefix
    # match on the URL slug misses, silently falling back to whatever image
    # happened to appear first — usually a different, unrelated product.
    raw = re.findall(r"https%3A%2F%2Fcrm\.surya\.co\.in%2F[^&\"']+", h)
    raw = [requests.utils.unquote(i) for i in raw]
    raw += re.findall(r"https://crm\.surya\.co\.in/assets/[^\"'\s\\]+\.(?:jpg|jpeg|png|webp)", h)
    ranked = [u for u, _ in Counter(raw).most_common()]
    imgs = ranked[:1]  # Surya product pages carry exactly one real photo, not a gallery.
    main = soup.select_one("main") or soup
    paras = [clean(p.get_text(" ")) for p in main.find_all(["p", "li"])]
    desc = next((p for p in paras if len(p) > 60), "")
    return {
        "brand": "Surya",
        "name": name,
        "sku": "",
        "description": desc,
        "mrp": None,
        "availability": "InStock",
        "category_path": path,
        "specs": {},
        "variant_tables": tables(main),
        "images": imgs[:6],
        "source": url,
    }


# --------------------------------------------------------------- indo
def indo_all():
    out, page = [], 1
    while True:
        raw = get(f"https://indoappliances.com/products.json?limit=250&page={page}")
        if not raw:
            break
        ps = json.loads(raw).get("products", [])
        if not ps:
            break
        for p in ps:
            body = BeautifulSoup(p.get("body_html") or "", "lxml")
            paras = [clean(x.get_text(" ")) for x in body.find_all("p")]
            v = (p.get("variants") or [{}])[0]
            out.append({
                "brand": "Indo",
                "name": clean(p.get("title")),
                "sku": v.get("sku") or "",
                "description": next((x for x in paras if len(x) > 60), ""),
                "mrp": v.get("price"),
                "availability": "InStock" if v.get("available") else "OutOfStock",
                "category_path": ["Home Appliances", p.get("product_type") or "General"],
                "specs": {o["name"]: "/".join(o.get("values", []))
                          for o in (p.get("options") or []) if o.get("name") != "Title"},
                "variant_tables": tables(body),
                "images": [i["src"].split("?")[0] for i in (p.get("images") or [])][:8],
                "source": f"https://indoappliances.com/products/{p.get('handle')}",
            })
        page += 1
    return out


BRANDS = {
    "polycab": (polycab_urls, polycab_one),
    "halonix": (halonix_urls, halonix_one),
    "surya":   (surya_urls,   surya_one),
}


def run(brand):
    if brand == "indo":
        rows = indo_all()
    else:
        lister, parser = BRANDS[brand]
        urls = lister()
        print(f"[{brand}] {len(urls)} urls", flush=True)
        rows = []
        with ThreadPoolExecutor(max_workers=12) as ex:
            for n, r in enumerate(ex.map(parser, urls), 1):
                if r:
                    rows.append(r)
                if n % 200 == 0:
                    print(f"[{brand}] {n}/{len(urls)} -> {len(rows)} kept", flush=True)
    seen, dedup = set(), []
    for r in rows:
        k = (r["brand"], r["name"].lower(), r.get("sku", ""))
        if k in seen:
            continue
        seen.add(k)
        dedup.append(r)
    with open(f"{OUT}/{brand}.json", "w") as f:
        json.dump(dedup, f, indent=1)
    print(f"[{brand}] DONE {len(dedup)} products -> {OUT}/{brand}.json", flush=True)


if __name__ == "__main__":
    for b in (sys.argv[1:] or ["indo", "surya", "halonix", "polycab"]):
        run(b)
