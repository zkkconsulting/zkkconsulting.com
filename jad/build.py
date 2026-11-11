#!/usr/bin/env python3
"""Wrap each original page's <main> content in the /jad redesign shell. Originals are never modified."""
import re, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "jad"
SKIP = {"app", "assets", "jad", "samples", "node_modules", ".git"}
pages = [p for p in ROOT.glob("*/**/index.html") if not (set(p.relative_to(ROOT).parts) & SKIP)]
pages += [p for p in ROOT.glob("*/index.html") if p not in pages and p.relative_to(ROOT).parts[0] not in SKIP]
dirs = {str(p.parent.relative_to(ROOT)) for p in pages}
def rewrite(h):
    def f(m):
        path = m.group(2).strip("/")
        top = path.split("/")[0] if path else ""
        if path == "" : return f'{m.group(1)}"/jad/{m.group(3)}"'
        if path in dirs or top in {d.split("/")[0] for d in dirs}:
            return f'{m.group(1)}"/jad/{path}/{m.group(3)}"'
        return m.group(0)
    return re.sub(r'(href=)"/([^"#?]*)((?:[#?][^"]*)?)"', f, h)
NAV = [("Services","services"),("Our Work","work"),("Expertise","expertise"),("Team","team"),("Insights","insights"),("FAQ","faq"),("Campaigns","ads")]
def shell_nav(cur):
    li = "".join(f'<li><a href="/jad/{s}/"{" aria-current=page" if cur==s else ""}>{n}</a></li>' for n,s in NAV)
    more = "".join(f'<li><a href="/jad/{s}/">{n}</a></li>' for n,s in NAV+[("Referral Program","referrals"),("Legal","legal")])
    return f'''<a class="skip-link" href="#main">Skip to content</a>
<div class="jprog" id="jprog"></div>
<header class="jnav" id="jnav"><a href="/jad/" class="logo-chip" aria-label="ZKK Consulting, home"><img src="/ZKK_logo.png" alt="ZKK Consulting"></a>
<ul class="jlinks">{li}</ul><a class="jcta" href="/jad/intake/">Book a Discovery Call</a>
<button class="jburger" id="jburger" aria-label="Open menu" aria-expanded="false"><i></i><i></i></button></header>
<div class="jmenu" id="jmenu" data-lenis-prevent><button class="jclose" id="jclose" aria-label="Close menu">&#10005;</button><ul>{more}<li><a class="gold" href="/jad/intake/">Book a Discovery Call</a></li><li><a href="mailto:info@zkkconsulting.com">Email Us</a></li></ul></div>'''
FOOT = '''<div class="jfoot" role="contentinfo"><div class="jfoot-grid"><div><a href="/jad/" class="logo-chip"><img src="/ZKK_logo.png" alt="ZKK Consulting"></a>
<p>Market research and business growth consulting. We research the market, the competition, and the landscape around a decision, then hand you the organized analysis behind it.</p>
<address><a href="mailto:info@zkkconsulting.com">info@zkkconsulting.com</a><a href="mailto:zolomon@zkkconsulting.com">zolomon@zkkconsulting.com</a><a href="mailto:jad@zkkconsulting.com">jad@zkkconsulting.com</a></address></div>
<div><h5>Services</h5><ul><li><a href="/jad/services/#packages">Core packages</a></li><li><a href="/jad/services/#patent">Patent landscape research</a></li><li><a href="/jad/services/#addons">Add-ons</a></li><li><a href="/jad/services/#bundles">Bundles</a></li></ul></div>
<div><h5>Company</h5><ul><li><a href="/jad/work/">Our work</a></li><li><a href="/jad/expertise/">Specialized expertise</a></li><li><a href="/jad/team/">Team</a></li><li><a href="/jad/insights/">Insights</a></li><li><a href="/jad/referrals/">Referral program</a></li><li><a href="/jad/faq/">FAQ</a></li></ul></div>
<div><h5>Connect</h5><ul><li><a href="/jad/intake/">Book a discovery call</a></li><li><a href="https://www.linkedin.com/company/zkk-consulting" target="_blank" rel="noopener">LinkedIn ↗</a></li><li><a href="/jad/legal/">Legal &amp; disclaimers</a></li></ul></div></div>
<p class="jlegal"><b>ZKK Consulting LLC</b> is a Texas limited liability company, co-founded by Zolomon Kaliser and Jad Haddad. © 2026 ZKK Consulting LLC. All rights reserved. Reports, models, and other deliverables are business research and analysis only, not legal, regulatory, medical, clinical, tax, accounting, or investment advice.</p></div>'''
HEAD_EXTRA = '''<meta name="robots" content="noindex"><link rel="stylesheet" href="/jad/jad.css">'''
for p in pages:
    s = p.read_text()
    m = re.search(r'<main[^>]*>(.*?)</main>', s, re.S)
    if not m: continue
    main = m.group(1)
    main = re.sub(r'<div id="heroCanvas"[^>]*></div>', '<div class="jplate" aria-hidden="true"></div>', main)
    head = re.search(r'<head>(.*?)</head>', s, re.S).group(1)
    head = re.sub(r'<link rel="canonical"[^>]*>', '', head)
    head = re.sub(r'<script type="application/ld\+json">.*?</script>', '', head, flags=re.S)
    head = re.sub(r'<script src="https://cdnjs[^>]*three[^>]*></script>', '', head)
    head = re.sub(r'<meta name="theme-color"[^>]*>', '<meta name="theme-color" content="#013220">', head)
    head = re.sub(r'(<link href="https://fonts.googleapis.com[^>]*>)', r'\1', head)
    tail = s[s.rfind('</footer>'):] if '</footer>' in s else ''
    inline = "\n".join(re.findall(r'<script(?![^>]*src)[^>]*>.*?</script>', tail, re.S))
    cur = p.parent.relative_to(ROOT).parts[0] if p.parent != ROOT else ""
    html = f'<!DOCTYPE html><html lang="en"><head>{head}{HEAD_EXTRA}</head><body class="jpage">{shell_nav(cur)}<main id="main">{rewrite(main)}</main>{FOOT}<script type="module" src="/jad/jad.js"></script>{inline}</body></html>'
    html = rewrite(html)
    out = OUT / p.parent.relative_to(ROOT) / "index.html"
    out.parent.mkdir(parents=True, exist_ok=True); out.write_text(html)
print(len(pages), "pages built")
