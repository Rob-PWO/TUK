#!/usr/bin/env python3
"""Generate cohesive on-brand SVG assets for the TACKLEUK redesign."""
import os, html

import os
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "img")
os.makedirs(OUT, exist_ok=True)

NAVY = "#0A2540"
NAVY2 = "#103A63"
BLUE = "#1391DB"
BLUE2 = "#33A7E6"
SKY = "#E7F4FD"
SKY2 = "#F3FAFE"

def write(name, svg):
    with open(os.path.join(OUT, name), "w") as f:
        f.write(svg)

# ---------- product placeholder framework -------------------------------
def product(name, icon, tintA=SKY2, tintB=SKY, accent=NAVY):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" fill="none">
<defs>
 <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="{tintA}"/><stop offset="1" stop-color="{tintB}"/>
 </linearGradient>
 <radialGradient id="halo" cx="50%" cy="44%" r="48%">
  <stop offset="0" stop-color="#ffffff" stop-opacity=".9"/>
  <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
 </radialGradient>
</defs>
<rect width="600" height="600" fill="url(#bg)"/>
<circle cx="300" cy="270" r="240" fill="url(#halo)"/>
<g opacity="0.05" stroke="{NAVY}" stroke-width="1">
 <path d="M0 150 H600 M0 300 H600 M0 450 H600 M150 0 V600 M300 0 V600 M450 0 V600"/>
</g>
<g transform="translate(300,285)" stroke="{accent}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" fill="none">
{icon}
</g>
<g opacity="0.5" transform="translate(508,52)">
 <text x="0" y="0" font-family="Manrope,Arial,sans-serif" font-size="22" font-weight="800" fill="{NAVY}" text-anchor="end" opacity="0.35">TACKLEUK</text>
</g>
</svg>'''

icons = {
 # bivvy / shelter — dome
 "bivvy": '''<path d="M-150 95 H150" />
 <path d="M-150 95 Q-150 -85 0 -85 Q150 -85 150 95" />
 <path d="M0 -85 V95" stroke-width="7" opacity=".7"/>
 <path d="M-72 95 Q-72 -10 0 -40 Q72 -10 72 95" stroke-width="7" opacity=".55" fill="{B}" fill-opacity=".07"/>'''.replace("{B}", BLUE),
 # reel
 "reel": '''<circle cx="0" cy="0" r="120"/>
 <circle cx="0" cy="0" r="52" stroke-width="9"/>
 <circle cx="0" cy="0" r="12" fill="{N}" stroke="none"/>
 <path d="M120 -8 q44 0 44 44 v44" />
 <path d="M-92 92 l-34 34" stroke-width="9"/>'''.replace("{N}", NAVY),
 # rod
 "rod": '''<path d="M-150 150 L150 -150"/>
 <path d="M-150 150 l40 -10 m-22 -28 l40 -10 m-22 -28 l40 -10" stroke-width="7"/>
 <circle cx="60" cy="-60" r="16" stroke-width="7"/>
 <circle cx="6" cy="-6" r="14" stroke-width="7"/>
 <circle cx="-48" cy="48" r="12" stroke-width="7"/>''',
 # landing net
 "net": '''<path d="M-150 150 L-20 20"/>
 <path d="M-20 20 a120 120 0 1 1 1 1 Z" fill="{B}" fill-opacity=".06"/>
 <g stroke-width="5" opacity=".5">
  <path d="M40 -60 L120 20 M-40 -20 L60 80 M90 -30 L150 30"/>
 </g>'''.replace("{B}", BLUE),
 # seatbox
 "seatbox": '''<rect x="-130" y="-70" width="260" height="170" rx="18"/>
 <path d="M-130 -10 H130 M-130 45 H130" stroke-width="7" opacity=".6"/>
 <circle cx="-80" cy="-40" r="9" fill="{N}" stroke="none"/>
 <path d="M-110 100 v55 M110 100 v55 M-60 100 v40 M60 100 v40" stroke-width="9"/>'''.replace("{N}", NAVY),
 # clothing / hoody
 "hoody": '''<path d="M-60 -90 q60 60 120 0 l70 50 -40 70 -30 -18 V150 H-90 V82 l-30 18 -40 -70 Z"/>
 <path d="M-60 -90 q60 70 120 0" stroke-width="7" opacity=".6"/>
 <path d="M0 -40 V40" stroke-width="6" opacity=".5"/>''',
 # bait box
 "bait": '''<rect x="-130" y="-60" width="260" height="150" rx="14"/>
 <path d="M-130 -60 l30 -28 H100 l30 28" stroke-width="8"/>
 <path d="M-43 -88 V-60 M43 -88 V-60" stroke-width="6" opacity=".6"/>
 <path d="M-130 15 H130" stroke-width="6" opacity=".5"/>
 <circle cx="-60" cy="50" r="10" fill="{B}" stroke="none"/>
 <circle cx="0" cy="50" r="10" fill="{B}" stroke="none"/>
 <circle cx="60" cy="50" r="10" fill="{B}" stroke="none"/>'''.replace("{B}", BLUE),
 # float pack
 "float": '''<g>
 <path d="M-90 -120 v150" /><ellipse cx="-90" cy="40" rx="26" ry="44"/><path d="M-90 84 v60" stroke-width="6"/>
 <path d="M0 -140 v150"/><ellipse cx="0" cy="22" rx="22" ry="38"/><path d="M0 60 v80" stroke-width="6"/>
 <path d="M90 -110 v140"/><ellipse cx="90" cy="46" rx="24" ry="40"/><path d="M90 86 v54" stroke-width="6"/>
 </g>''',
 # feeder cage
 "feeder": '''<rect x="-70" y="-90" width="140" height="170" rx="60"/>
 <path d="M-70 -40 H70 M-70 0 H70 M-70 40 H70" stroke-width="6" opacity=".55"/>
 <path d="M-30 -90 V80 M30 -90 V80" stroke-width="6" opacity=".55"/>
 <path d="M0 -90 v-50 l40 26" stroke-width="8"/>''',
 # line spool
 "line": '''<rect x="-110" y="-100" width="220" height="200" rx="22"/>
 <path d="M-110 -50 H110 M-110 50 H110" stroke-width="8"/>
 <ellipse cx="0" cy="0" rx="58" ry="44" stroke-width="8"/>
 <path d="M-150 0 q40 -30 40 0 q0 30 -40 0" stroke-width="6" opacity=".5"/>''',
 # scales
 "scales": '''<circle cx="0" cy="-10" r="115"/>
 <path d="M0 -125 V-10 L70 40" stroke-width="9"/>
 <circle cx="0" cy="-10" r="10" fill="{N}" stroke="none"/>
 <path d="M0 105 v40 q0 26 26 26" stroke-width="9"/>'''.replace("{N}", NAVY),
 # pole
 "pole": '''<path d="M-150 150 L150 -150" stroke-width="13"/>
 <path d="M-150 150 L-110 110" stroke-width="22" opacity=".8"/>
 <path d="M150 -150 q26 -10 36 14" stroke-width="6"/>
 <circle cx="150" cy="-150" r="6" fill="{N}" stroke="none"/>'''.replace("{N}", NAVY),
 # lure / plug
 "lure": '''<path d="M-120 0 q60 -70 150 0 q-90 70 -150 0 Z" fill="{B}" fill-opacity=".07"/>
 <circle cx="60" cy="-6" r="10" fill="{N}" stroke="none"/>
 <path d="M30 50 v40 m40 -50 v44 m-90 -40 v36" stroke-width="7"/>
 <path d="M120 0 h44" stroke-width="7"/>'''.replace("{B}", BLUE).replace("{N}", NAVY),
 # bite alarm
 "alarm": '''<rect x="-90" y="-40" width="180" height="150" rx="20"/>
 <circle cx="0" cy="35" r="34"/>
 <path d="M0 -40 V-110 M-40 -100 l40 -20 40 20" stroke-width="8"/>
 <circle cx="-55" cy="-12" r="7" fill="{B}" stroke="none"/>
 <circle cx="55" cy="-12" r="7" fill="{B}" stroke="none"/>'''.replace("{B}", BLUE),
}

# product files with subtle tint variation
tints = [
 (SKY2, SKY), ("#F4F7FB", "#E9EFF6"), ("#F3FBF8", "#E2F3EC"), ("#FFF9F2", "#FCEFDD"),
]
plist = ["bivvy","reel","rod","net","seatbox","hoody","bait","float","feeder","line","scales","pole","lure","alarm"]
for i, key in enumerate(plist):
    tA, tB = tints[i % len(tints)]
    write(f"prod-{key}.svg", product(key, icons[key], tA, tB))

# ---------- wide promo / category tiles ---------------------------------
def tile(label, icon, c1, c2):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" fill="none">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="{c1}"/><stop offset="1" stop-color="{c2}"/></linearGradient></defs>
<rect width="800" height="520" fill="url(#g)"/>
<g opacity="0.12" stroke="#fff" stroke-width="2" fill="none">
<circle cx="640" cy="120" r="180"/><circle cx="700" cy="430" r="120"/>
</g>
<g transform="translate(560,300) scale(1.4)" stroke="#ffffff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".85">
{icon}
</g>
</svg>'''

write("tile-rods.svg",     tile("Rods", icons["rod"], NAVY, NAVY2))
write("tile-clearance.svg",tile("Clearance", icons["lure"], "#B81722", "#D81E2C"))
write("tile-seatboxes.svg",tile("Seat Boxes", icons["seatbox"], "#0E2C4D", "#16487A"))
write("tile-reels.svg",    tile("Reels", icons["reel"], "#0A72B8", "#1391DB"))
write("tile-poles.svg",    tile("Poles", icons["pole"], "#103A63", "#0B82CE"))
write("tile-clothing.svg", tile("Clothing", icons["hoody"], "#16487A", "#0A2540"))
write("tile-bait.svg",     tile("Bait", icons["bait"], "#127044", "#16894E"))
write("tile-nets.svg",     tile("Nets", icons["net"], "#0A2540", "#0A72B8"))

# ---------- hero / lifestyle scenes -------------------------------------
def scene(c_top, c_water, sun=True):
    sun_el = '<circle cx="1180" cy="190" r="70" fill="#FCE7C8" opacity=".85"/>' if sun else ''
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 800" fill="none">
<defs>
 <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="{c_top}"/><stop offset="1" stop-color="{c_water}"/>
 </linearGradient>
 <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="{c_water}"/><stop offset="1" stop-color="#06203B"/>
 </linearGradient>
</defs>
<rect width="1600" height="800" fill="url(#sky)"/>
{sun_el}
<g opacity=".5">
 <path d="M0 470 C300 430 520 480 760 455 C1040 425 1300 470 1600 440 L1600 800 0 800 Z" fill="#0E2C4D"/>
</g>
<rect y="500" width="1600" height="300" fill="url(#water)"/>
<g stroke="#ffffff" stroke-opacity=".10" stroke-width="3" fill="none">
 <path d="M0 560 C200 545 400 575 600 560 C800 545 1000 575 1200 560 C1400 545 1500 565 1600 558"/>
 <path d="M0 630 C220 615 420 645 640 630 C860 615 1060 645 1280 630 C1440 620 1520 638 1600 628"/>
 <path d="M0 700 C240 685 440 715 660 700 C880 685 1080 715 1300 700"/>
</g>
<!-- reeds -->
<g stroke="#06203B" stroke-width="6" stroke-linecap="round" opacity=".7">
 <path d="M120 800 C110 640 130 600 120 520"/>
 <path d="M150 800 C150 660 165 610 158 540"/>
 <path d="M90 800 C95 670 80 630 90 560"/>
</g>
<!-- angler silhouette + rod -->
<g transform="translate(1080,300)" fill="#06203B">
 <path d="M40 60 a26 26 0 1 1 .1 0 Z"/>
 <path d="M20 110 q26 -28 56 -6 l6 90 -20 4 -8 -56 -10 60 -22 -2 8 -96 Z"/>
</g>
<path d="M1100 360 L1480 150" stroke="#06203B" stroke-width="6" stroke-linecap="round"/>
<path d="M1480 150 C1500 230 1470 320 1440 360" stroke="#ffffff" stroke-opacity=".4" stroke-width="2"/>
</svg>'''

write("hero-1.svg", scene("#1F5C8C", "#16487A"))
write("hero-2.svg", scene("#21486B", "#0E2C4D"))
write("lifestyle.svg", scene("#2C6E9C", "#1A5078"))
write("mega-carp.svg", scene("#103A63", "#0A2540", sun=False))

# ---------- brand wordmarks (simple, monochrome) -------------------------
def brand(text, weight="800", style="normal", spacing="0", family="Manrope,Arial"):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" fill="none">
<text x="100" y="38" font-family="{family}" font-size="28" font-weight="{weight}" font-style="{style}"
 letter-spacing="{spacing}" fill="{NAVY}" text-anchor="middle">{html.escape(text)}</text>
</svg>'''

brands = {
 "preston":"PRESTON","daiwa":"DAIWA","drennan":"Drennan","fox":"FOX",
 "korda":"KORDA","shimano":"SHIMANO","leeda":"LEEDA","guru":"GURU",
 "matrix":"MATRIX","nash":"NASH","mainline":"MAINLINE","sonik":"SONIK",
}
styles = {
 "daiwa":("800","italic","1"),"drennan":("700","italic","0"),
 "shimano":("700","normal","2"),"fox":("800","normal","3"),
}
for k,v in brands.items():
    w,st,sp = styles.get(k,("800","normal","1"))
    write(f"brand-{k}.svg", brand(v,w,st,sp))

# logo wordmark for header fallback already done in CSS/HTML
print("Generated:", len(os.listdir(OUT)), "assets")
print("\n".join(sorted(os.listdir(OUT))))
