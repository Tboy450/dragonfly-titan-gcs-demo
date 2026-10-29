"""Swarmfall work history: daily commits by assistant, and subsystem-by-week grid. Claude, Oct 29, 2026.

Same method as research/work-log-by-assistant-2026-10-29 (the Dragonfly pair), applied to the
game. A Swarmfall commit is any non-merge commit that changes a game file (dist/invasion/, its
tests, SWARMFALL-TODO.md, or research/archive folders named swarmfall-* or fantasy-city-*), or
whose subject mentions Swarmfall. Mixed commits count here and may also count for Dragonfly.
Attribution: the Co-Authored-By line; if missing, the signer of the change-log entry the commit
adds or edits. Commit counts are recorded activity, not hours or effort.
"""
from pathlib import Path
from datetime import datetime, date, timedelta
from zoneinfo import ZoneInfo
from collections import Counter, defaultdict
import subprocess, csv, re, math
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent
ROOT = OUT.parent.parent
NY = ZoneInfo("America/New_York")
def git(*a): return subprocess.check_output(["git", *a], cwd=ROOT).decode("utf-8", "replace")
SNAPSHOT = git("rev-parse", "origin/main").strip()

GAME = r"^(dist/invasion/|tests/invasion-|tests/helpers/invasion-|tests/fixtures/invasion/|SWARMFALL-TODO\.md|research/(swarmfall|fantasy-city)|archive/swarmfall)"
def assistant(body):
    n = {x.lower() for x in re.findall(r"Co-Authored-By:\s*(Claude|Codex|GitHub Copilot|Copilot)", body, re.I)}
    if any("claude" in x for x in n) and any("codex" in x for x in n): return "Both"
    for k in ("claude", "codex", "copilot"):
        if any(k in x for x in n): return k.capitalize()
    return "Unattributed"
def changelog_signer(sha):
    diff = git("show", sha, "--format=", "--unified=0", "--", "CHANGELOG.md")
    m = re.search(r"^@@ -\d+(?:,\d+)? \+(\d+)", diff, re.M)
    if not m: return None
    lines = git("show", f"{sha}:CHANGELOG.md").splitlines(); i = int(m.group(1)) - 1
    while i >= 0 and not lines[i].startswith("### "): i -= 1
    for line in lines[i + 1:i + 6]:
        s = re.search(r"\*\*Signed:\*\*\s*(Claude|Codex|GitHub Copilot)", line)
        if s: return "Copilot" if "Copilot" in s.group(1) else s.group(1)

rows = []
for rec in git("log", SNAPSHOT, "--no-merges", "--format=%x1e%H%x1f%ct%x1f%s%x1f%b%x1d", "--name-only").split("\x1e"):
    if not rec.strip(): continue
    meta, _, names = rec.partition("\x1d")
    sha, stamp, subject, body = (meta.strip("\n\r ").split("\x1f", 3) + [""])[:4]   # strip() eats \x1f
    files = [p.strip() for p in names.splitlines() if p.strip()]
    if not (any(re.match(GAME, p) for p in files) or "swarmfall" in subject.lower()): continue
    who, via = assistant(body), "co-author line"
    if who == "Unattributed":
        s = changelog_signer(sha)
        who, via = (s, "change-log signer") if s else (who, "")
    rows.append({"date": str(datetime.fromtimestamp(int(stamp), NY).date()), "commit": sha, "assistant": who,
                 "via": via, "subject": subject, "files": [p for p in files if re.match(GAME, p)]})
rows.sort(key=lambda r: (r["date"], r["commit"]))

# One subsystem per commit: where most of its game files belong; game-docs-only commits -> Research.
SUBSYSTEMS = [
    ("Sound", r"sound"),   # first, so battle-sound.mjs counts as sound
    ("Battle, units & drones", r"battle|units|drone|drop-waves|hazards|swarm-dust|models|paths|objective"),
    ("Campaign, planets & frontier", r"campaign|galaxy|planet|replay|achievements|field-guide|tutorial|tips|mission-id"),
    ("Cities & terrain", r"city|planet-terrain|scene\.mjs|houdini|foundation|worlds/|worlds\.mjs|source-geometry"),
    ("Controls, camera & HUD", r"pointer|minimap|camera|command-state|free-camera|settings|quality|invasion\.css|index\.html|main\.mjs|frame-clock"),
    ("Saves & progress", r"save|progress|recovery|random"),
    ("Asset & environment lab", r"environments/|kit/|history/|lab\."),
]
OTHER = "Research, records & publishing"
NAMES = [n for n, _ in SUBSYSTEMS] + [OTHER]
def subsystem(files):
    code = [p for p in files if p.startswith(("dist/", "tests/"))]
    if not code: return OTHER
    votes = Counter()
    for p in code:
        for i, (_, pat) in enumerate(SUBSYSTEMS):
            if re.search(pat, p): votes[i] += 1; break
    if not votes: return "Controls, camera & HUD"
    best = max(votes.values()); return SUBSYSTEMS[min(i for i, v in votes.items() if v == best)][0]
for r in rows: r["subsystem"] = subsystem(r["files"])
with (OUT / "commits.csv").open("w", newline="", encoding="utf-8-sig") as f:
    w = csv.DictWriter(f, fieldnames=["date", "commit", "assistant", "via", "subsystem", "subject"], extrasaction="ignore")
    w.writeheader(); w.writerows(rows)

first, last = date.fromisoformat(rows[0]["date"]), date.fromisoformat(rows[-1]["date"])
days = [first + timedelta(days=i) for i in range((last - first).days + 1)]
ORDER = ["Claude", "Codex", "Both", "Copilot", "Unattributed"]
COLORS = {"Claude": "#2a78d6", "Codex": "#eb6834", "Both": "#1baf7a", "Copilot": "#1baf7a", "Unattributed": "#a3a29b"}
LEGEND = [("Claude", "#2a78d6"), ("Codex", "#eb6834"), ("Both, or GitHub Copilot", "#1baf7a"), ("Unattributed", "#a3a29b")]
tot = Counter(r["assistant"] for r in rows); via = sum(r["via"] == "change-log signer" for r in rows)
summary = (f"{len(rows)} Swarmfall commits:  Claude {tot['Claude']}  ·  Codex {tot['Codex']}  ·  both {tot['Both']}  ·  "
           f"unattributed {tot['Unattributed']}" + (f"   ({via} credited from the change log's signature)" if via else ""))
bg, ink, muted, gridc, empty = "#fcfcfb", "#1d2a30", "#5d6a70", "#e3e6e4", "#eceeec"
def canvas(w, h):
    im = Image.new("RGB", (w, h), bg); d = ImageDraw.Draw(im)
    f = lambda n, b=False: ImageFont.truetype("C:/Windows/Fonts/seguisb.ttf" if b else "C:/Windows/Fonts/segoeui.ttf", n)
    t = lambda x, y, s, n=22, fill=ink, b=False: d.text((x, y), s, font=f(n, b), fill=fill)
    return im, d, f, t
def legend(d, f, t, x, y):
    for label, color in LEGEND:
        d.rounded_rectangle((x, y + 9, x + 18, y + 27), radius=3, fill=color); t(x + 27, y, label, 21)
        x += 27 + d.textlength(label, font=f(21)) + 34

# ---- Graph 1: commits per day by assistant ----
counts = defaultdict(Counter)
for r in rows: counts[r["date"]][r["assistant"]] += 1
daily = [{"date": str(d), **{k: counts[str(d)][k] for k in ORDER}} for d in days]
for d in daily: d["total"] = sum(d[k] for k in ORDER)
with (OUT / "daily.csv").open("w", newline="", encoding="utf-8-sig") as f:
    w = csv.DictWriter(f, fieldnames=["date", *ORDER, "total"]); w.writeheader(); w.writerows(daily)
MILESTONES = [  # subject patterns; date and assistant come from the matched commit
    (r"Add Swarmfall, a drone invasion campaign", "Swarmfall created from the simulator"),
    (r"Save and resume Swarmfall missions", "Save and resume missions"),
    (r"Environment Lab", "Asset and Environment Lab"),
    (r"squad waves|multi-pod squad", "Multi-pod squad waves"),
    (r"save recovery|protected Swarmfall save", "Protected save recovery"),
    (r"minimap", "Squad orders from the minimap"),
    (r"Corvan", "First city map (Corvan)"),
    (r"Frontier mode", "Frontier mode"),
    (r"free camera", "Free camera and line of sight"),
    (r"replay challenges", "Replay challenges on conquered planets"),
]
ms = []
for pat, label in MILESTONES:
    r = next((r for r in rows if re.search(pat, r["subject"], re.I)), None)
    if r: ms.append({**r, "label": label})
ms.sort(key=lambda m: m["date"])
W, H = 1800, 1000 + 50 * math.ceil(len(ms) / 2)
im, d, f, t = canvas(W, H)
t(76, 40, "Swarmfall / work history by assistant", 46, b=True)
t(79, 106, f"{first:%B %d} – {last:%B %d, %Y}  ·  recorded Git activity, colored by each commit's co-author line", 24, muted)
t(79, 150, summary, 24)
left, top, right, bottom = 105, 300, 1724, 690
ymax = max(5, math.ceil(max(x["total"] for x in daily) / 5) * 5)
step = (right - left) / len(days); bar = step * 0.72
px = lambda i: left + (i + .5) * step; py = lambda v: bottom - v / ymax * (bottom - top)
t(left, 236, "Commits per day", 23, b=True); legend(d, f, t, 560, 234)
for v in range(0, ymax + 1, 5):
    y = py(v); d.line((left, y, right, y), fill=gridc); s = str(v); t(left - 15 - d.textlength(s, font=f(21)), y - 16, s, 21, muted)
for i, x in enumerate(daily):
    base, segs = 0, [(k, x[k]) for k in ORDER if x[k]]
    for j, (k, n) in enumerate(segs):
        box = (px(i) - bar / 2, py(base + n), px(i) + bar / 2, py(base) - (2 if base else 0))
        if j == len(segs) - 1:
            d.rounded_rectangle(box, radius=4, fill=COLORS[k]); d.rectangle((box[0], min(box[3], box[1] + 4), box[2], box[3]), fill=COLORS[k])
        else: d.rectangle(box, fill=COLORS[k])
        base += n
    if x["total"]: s = str(x["total"]); t(px(i) - d.textlength(s, font=f(17)) / 2, py(x["total"]) - 25, s, 17, muted)
for i in sorted(set(list(range(0, len(days), 3)) + [len(days) - 1])):
    s = days[i].strftime("%b %d"); tw = d.textlength(s, font=f(21))
    d.line((px(i), bottom, px(i), bottom + 6), fill=muted); t(max(left, min(px(i) - tw / 2, right - tw)), bottom + 12, s, 21, muted)
t(760, 738, "Commit date · America/New_York", 21, muted)
t(79, 800, "Milestones (date and assistant from the commit itself)", 28, b=True)
rows_per_col = math.ceil(len(ms) / 2)
for i, m in enumerate(ms):
    col, row = divmod(i, rows_per_col); x, y = 80 + col * 860, 856 + row * 50
    t(x, y, date.fromisoformat(m["date"]).strftime("%b %d"), 22, b=True)
    d.ellipse((x + 92, y + 11, x + 104, y + 23), fill=COLORS[m["assistant"]])
    t(x + 116, y, m["label"], 22)
    who = {"Both": "Claude + Codex", "Unattributed": "—"}.get(m["assistant"], m["assistant"]); t(x + 820 - d.textlength(who, font=f(20)), y, who, 20, muted)
fy = H - 90
d.line((80, fy, 1720, fy), fill=gridc)
t(80, fy + 12, "Commit counts show recorded activity, not hours or effort. Swarmfall commit = changes a game file or names Swarmfall; mixed commits may also count for Dragonfly.", 19, muted)
t(80, fy + 42, f"Source: Git {SNAPSHOT[:7]} · every commit by date in dated-log.md · script make_graphs.py", 19, muted)
im.save(OUT / "swarmfall-work-history.png")

# ---- Graph 2: subsystem by 3-day period (the game spans about two weeks) ----
BIN = 3
weeks = []
a = first
while a <= last: weeks.append((a, min(a + timedelta(days=BIN - 1), last))); a += timedelta(days=BIN)
grid = defaultdict(Counter)
for r in rows: grid[(r["subsystem"], (date.fromisoformat(r["date"]) - first).days // BIN)][r["assistant"]] += 1
cw, ch, gap, left, top = min(205, (1720 - 470) // len(weeks) - 10), 76, 10, 470, 290
H2 = top + len(NAMES) * (ch + gap) + 130
im, d, f, t = canvas(1800, H2)
t(76, 40, "Swarmfall / development by subsystem and assistant", 44, b=True)
t(79, 104, f"{first:%B %d} – {last:%B %d, %Y}  ·  {len(rows)} commits, each placed in one subsystem by the game files it changed", 23, muted)
t(79, 146, summary + "  (same rows as the daily graph)", 23); legend(d, f, t, 79, 191)
for k, (a, b) in enumerate(weeks):
    s = f"{a:%b %d}–{b:%d}" if a.month == b.month else f"{a:%b %d}–{b:%b %d}"
    t(left + k * (cw + gap) + 8, top - 42, s, 21, muted, b=True)
for i, name in enumerate(NAMES):
    y = top + i * (ch + gap); t(79, y + ch / 2 - 16, name, 22)
    for k in range(len(weeks)):
        x = left + k * (cw + gap); c = grid[(name, k)]; n = sum(c.values())
        d.rounded_rectangle((x, y, x + cw, y + ch), radius=6, fill=empty)
        if not n: continue
        sx, inner = x + 12, cw - 24
        for who in ORDER:
            if c[who]:
                wseg = inner * c[who] / n; d.rectangle((sx, y + ch - 24, sx + wseg - (2 if wseg > 4 else 0), y + ch - 12), fill=COLORS[who]); sx += wseg
        parts = [f"{c[w]} {'Cl' if w == 'Claude' else 'Cx'}" for w in ("Claude", "Codex") if c[w]]
        rest = sum(c[w] for w in ("Both", "Copilot", "Unattributed"))
        t(x + 12, y + 8, str(n), 26, b=True)
        t(x + 24 + d.textlength(str(n), font=f(26, True)), y + 14, " / ".join(parts + ([f"{rest} other"] if rest else [])), 18, muted)
y = top + len(NAMES) * (ch + gap) + 20
t(79, y, "Cl = Claude, Cx = Codex, other = both together or unattributed. Each commit counts once, in the subsystem most of its game files belong to;", 19, muted)
t(79, y + 28, "commits changing only game notes, research or archives count under Research. Subsystem table is Claude's own (make_graphs.py).", 19, muted)
t(79, y + 56, f"Commit counts are recorded activity, not hours or effort.  Source: Git {SNAPSHOT[:7]}.", 19, muted)
im.save(OUT / "swarmfall-subsystem-grid.png")

# ---- Dated log ----
WHO = {"Both": "Claude + Codex", "Unattributed": "unattributed"}
lines = ["# Swarmfall dated work log", "", f"Every Swarmfall commit, Git `{SNAPSHOT[:7]}`, by New York commit date. Generated by `make_graphs.py`.", ""]
by = defaultdict(list)
for r in rows: by[r["date"]].append(r)
for dd in days:
    if not by.get(str(dd)): continue
    c = Counter(r["assistant"] for r in by[str(dd)])
    lines += [f"## {dd:%a %b %d} ({len(by[str(dd)])}: " + ", ".join(f"{WHO.get(k, k)} {c[k]}" for k in ORDER if c[k]) + ")", ""]
    lines += [f"- {r['subject']} — {WHO.get(r['assistant'], r['assistant'])}" + (" (from the change log)" if r["via"] == "change-log signer" else "") + f" `{r['commit'][:7]}`" for r in by[str(dd)]] + [""]
(OUT / "dated-log.md").write_text("\n".join(lines), encoding="utf-8")
print(summary); print([(m["date"], m["assistant"], m["label"]) for m in ms])
for n in NAMES: print(f"{n:32}", [sum(grid[(n, k)].values()) for k in range(len(weeks))])
