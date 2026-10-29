"""Subsystem-by-week grid, split by assistant. Claude, October 29, 2026.

Companion to Codex's "development by subsystem" grid, built from the same rows as
work-log-by-assistant.png (commits-by-assistant.csv: 246 commits at eb84229, game-only commits
left out with Codex's rules). Each commit goes to ONE subsystem: the one most of its changed
files belong to (ties go to the earlier row below); commits touching only research, archives or
docs go to "Research, records & publishing". The path-to-subsystem table is Claude's own
judgment, so Codex's grid and this one can differ cell by cell.
"""
from pathlib import Path
from datetime import date, timedelta
from collections import Counter, defaultdict
import csv, re, subprocess
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent
ROOT = OUT.parent.parent
rows = list(csv.DictReader(open(OUT / "commits-by-assistant.csv", encoding="utf-8-sig")))

SUBSYSTEMS = [
    ("Flight, cameras & landing", r"flight-|edl|arrival|pilot|controls|downwash"),
    ("Titan scenery, weather & sound", r"titan-terrain|titan-day|weather|sound|exterior-scenes|mission-backdrop|day-strip|assets/"),
    ("Science & mission operations", r"science|expedition|operations|plan-panel|save-game|persistence"),
    ("Power & thermal systems", r"mission-systems|thermal-|battery|mmrtg|readouts|chart"),
    ("Instruments & vehicle hardware", r"drill|draco|carousel|drams|wonderwall|nose-sensors|nose-cameras|side-cameras|ecam|frontier|twta|hga|iem|power-units|rotor-|arm-shoulder|nose-electronics|navigation|sampling|avionics|vehicle-research"),
    ("Structure, insulation & wiring", r"bulkhead|side-wall|top-deck|wall-end|foam|insulation|harness|cable-installation"),
    ("Inspection, layout & interface", r"inspect|part-label|layers-panel|vehicle-presentation|vehicle-references|context|404|sitemap|\.github/"),
]
# Catch-all files (the early single-file app, page, styles, shared model builder): used only when a
# commit touches nothing more specific, and then its subject decides.
GENERIC = r"index\.html|styles\.css|app\.js|chase-vehicle|vehicle-research|tests/"
SUBJECT = [
    ("Flight, cameras & landing", r"flight|camera|chase|landing|rotor|pilot|arrival|descent|throttle|brake|hover|autonomy"),
    ("Titan scenery, weather & sound", r"terrain|scenery|ridge|dune|mountain|weather|rain|haze|sound|backdrop|lake|interdune|day cycle"),
    ("Science & mission operations", r"science|mission|survey|expedition|sample|operations|plan"),
    ("Power & thermal systems", r"thermal|battery|power|heat|mmrtg|wax"),
    ("Instruments & vehicle hardware", r"model|deck|silhouette|antenna|instrument|drill"),
]
OTHER = "Research, records & publishing"
NAMES = [n for n, _ in SUBSYSTEMS] + [OTHER]

def files(sha):
    out = subprocess.check_output(["git", "show", "--name-only", "--format=", sha], cwd=ROOT).decode("utf-8", "replace")
    return [p for p in out.splitlines() if p.strip()]

def subsystem(paths, subject):
    code = [p for p in paths if p.startswith(("dist/", "tests/", ".github/"))]
    if not code: return OTHER
    votes = Counter()
    for p in code:
        if re.search(GENERIC, p) and not any(re.search(pat, p) for _, pat in SUBSYSTEMS): continue
        for i, (name, pattern) in enumerate(SUBSYSTEMS):
            if re.search(pattern, p): votes[i] += 1; break
    if not votes:
        for name, pattern in SUBJECT:
            if re.search(pattern, subject, re.I): return name
        return "Inspection, layout & interface"
    best = max(votes.values())
    return SUBSYSTEMS[min(i for i, v in votes.items() if v == best)][0]

start = date(2026, 9, 20)
weeks = [(start + timedelta(days=7 * k), min(start + timedelta(days=7 * k + 6), date(2026, 10, 29))) for k in range(6)]
grid = defaultdict(Counter)
for r in rows:
    r["subsystem"] = subsystem(files(r["commit"]), r["subject"])
    k = (date.fromisoformat(r["date"]) - start).days // 7
    grid[(r["subsystem"], k)][r["assistant"]] += 1
with (OUT / "commits-by-subsystem.csv").open("w", newline="", encoding="utf-8-sig") as f:
    w = csv.DictWriter(f, fieldnames=["date", "commit", "assistant", "via", "subsystem", "subject"]); w.writeheader(); w.writerows(rows)

COLORS = {"Claude": "#2a78d6", "Codex": "#eb6834", "Both": "#1baf7a", "Copilot": "#1baf7a", "Unattributed": "#a3a29b"}
ORDER = ["Claude", "Codex", "Both", "Copilot", "Unattributed"]
W, H = 1800, 1120
bg, ink, muted, empty = "#fcfcfb", "#1d2a30", "#5d6a70", "#eceeec"
im = Image.new("RGB", (W, H), bg); draw = ImageDraw.Draw(im)
def font(n, bold=False): return ImageFont.truetype("C:/Windows/Fonts/seguisb.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf", n)
def text(x, y, s, n=22, fill=ink, bold=False): draw.text((x, y), s, font=font(n, bold), fill=fill)

text(76, 40, "Dragonfly project / development by subsystem and assistant", 44, bold=True)
text(79, 104, "September 20 – October 29, 2026  ·  246 project commits, each placed in one subsystem by the files it changed", 23, muted)
tot = Counter(r["assistant"] for r in rows)
text(79, 146, f"Claude {tot['Claude']}  ·  Codex {tot['Codex']}  ·  both {tot['Both']}  ·  Copilot {tot['Copilot']}  ·  unattributed {tot['Unattributed']}  (same rows as the daily graph)", 23)
lx = 79
for label, color in [("Claude", "#2a78d6"), ("Codex", "#eb6834"), ("Both, or GitHub Copilot", "#1baf7a"), ("Unattributed (Sep 20–28)", "#a3a29b")]:
    draw.rounded_rectangle((lx, 200, lx + 18, 218), radius=3, fill=color)
    text(lx + 27, 191, label, 21); lx += 27 + draw.textlength(label, font=font(21)) + 34

left, top, cw, ch, gap = 470, 290, 205, 76, 10
for k, (a, b) in enumerate(weeks):
    label = f"{a:%b %d}–{b:%d}" if a.month == b.month else f"{a:%b %d}–{b:%b %d}"
    text(left + k * (cw + gap) + 8, top - 42, label, 21, muted, bold=True)
for i, name in enumerate(NAMES):
    y = top + i * (ch + gap)
    text(79, y + ch / 2 - 16, name, 22)
    for k in range(len(weeks)):
        x = left + k * (cw + gap)
        c = grid[(name, k)]; n = sum(c.values())
        draw.rounded_rectangle((x, y, x + cw, y + ch), radius=6, fill=empty)
        if not n: continue
        # A stacked strip across the bottom of the cell shows the split; the count sits above it.
        sx, strip_y, inner = x + 12, y + ch - 24, cw - 24
        for who in ORDER:
            if not c[who]: continue
            wseg = inner * c[who] / n
            draw.rectangle((sx, strip_y, sx + wseg - (2 if wseg > 4 else 0), y + ch - 12), fill=COLORS[who]); sx += wseg
        parts = [f"{c[w]} {'Cl' if w == 'Claude' else 'Cx' if w == 'Codex' else ''}".strip() for w in ("Claude", "Codex") if c[w]]
        rest = sum(c[w] for w in ("Both", "Copilot", "Unattributed"))
        detail = " / ".join(parts + ([f"{rest} other"] if rest else []))
        text(x + 12, y + 8, str(n), 26, ink, bold=True)
        text(x + 12 + draw.textlength(str(n), font=font(26, True)) + 12, y + 14, detail, 18, muted)

y = top + len(NAMES) * (ch + gap) + 20
text(79, y, "Cl = Claude, Cx = Codex, other = both together, Copilot or unattributed. Each commit counts once, in the subsystem most of its changed files belong to;", 19, muted)
text(79, y + 28, "commits changing only research, archives or docs count under Research. Subsystem assignment is Claude's own path table (make_subsystem_grid.py), so cells can differ from Codex's grid.", 19, muted)
text(79, y + 56, "Commit counts are recorded activity, not hours or effort.  Source: Git eb84229, same 246 commits as work-log-by-assistant.png.", 19, muted)
im.save(OUT / "subsystem-grid-by-assistant.png")
for name in NAMES:
    print(f"{name:34}", [sum(grid[(name, k)].values()) for k in range(6)], dict(sum((grid[(name, k)] for k in range(6)), Counter())))
