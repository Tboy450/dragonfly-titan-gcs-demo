"""Work-history graph by assistant, plus a dated log. Claude, October 29, 2026.

Companion to Codex's activity graph (project-work-log-2026-10-29 in Codex's worktree): the same
Git snapshot and the same Dragonfly/other-project split (Codex's rules, copied below), but each
day's commits are colored by the assistant named in the commit's Co-Authored-By line, and the
milestone list covers the part-by-part work. Commit counts are recorded activity, not hours.
"""
from pathlib import Path
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from collections import Counter, defaultdict
import subprocess, csv, re, math
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent
ROOT = OUT.parent.parent
SNAPSHOT = "eb842296f6e2a4bbf6a91a01bfb6b4c9e4b3203f"   # Codex's graph's HEAD, for matching totals
NY = ZoneInfo("America/New_York")

def git(*args):
    return subprocess.check_output(["git", *args], cwd=ROOT).decode("utf-8", errors="replace")

# Codex's classification, unchanged: commits touching only the game (or only shared docs with
# "swarmfall" in the subject) are another project's.
shared = {"CHANGELOG.md", "ARCHITECTURE.md", "README.md", ".gitignore"}
def other(p):
    return p.startswith(("dist/invasion/", "tests/invasion-", "tests/helpers/invasion-")) or p == "SWARMFALL-TODO.md"

def assistant(body):
    names = {n.lower() for n in re.findall(r"Co-Authored-By:\s*(Claude|Codex|GitHub Copilot|Copilot)", body, re.I)}
    has = lambda k: any(k in n for n in names)
    if has("claude") and has("codex"): return "Both"
    if has("claude"): return "Claude"
    if has("codex"): return "Codex"
    if has("copilot"): return "Copilot"
    return "Unattributed"

rows = []
log = git("log", SNAPSHOT, "--no-merges", "--format=%x1e%H%x1f%ct%x1f%s%x1f%b%x1d", "--name-only")
for record in log.split("\x1e"):
    if not record.strip(): continue
    meta, _, names = record.partition("\x1d")
    # Not strip(): Python counts the \x1f separator as whitespace and would drop an empty body.
    sha, stamp, subject, body = (meta.strip("\n\r ").split("\x1f", 3) + [""])[:4]
    files = [p.strip() for p in names.splitlines() if p.strip()]
    specific = [p for p in files if p not in shared]
    if (specific and all(other(p) for p in specific)) or (not specific and "swarmfall" in subject.lower()):
        continue
    day = datetime.fromtimestamp(int(stamp), NY).date()
    rows.append({"date": str(day), "commit": sha, "assistant": assistant(body), "subject": subject})
rows.sort(key=lambda r: (r["date"], r["commit"]))

# Fallback for commits without a co-author line: the signer of the change-log entry the commit
# adds or edits (its first added line, under the nearest "### " heading in that commit's version).
def changelog_signer(sha):
    diff = git("show", sha, "--format=", "--unified=0", "--", "CHANGELOG.md")
    m = re.search(r"^@@ -\d+(?:,\d+)? \+(\d+)", diff, re.M)
    if not m: return None
    lines = git("show", f"{sha}:CHANGELOG.md").splitlines()
    i = int(m.group(1)) - 1
    while i >= 0 and not lines[i].startswith("### "): i -= 1
    for line in lines[i + 1:i + 6]:
        s = re.search(r"\*\*Signed:\*\*\s*(Claude|Codex|GitHub Copilot)", line)
        if s: return "Copilot" if "Copilot" in s.group(1) else s.group(1)
    return None
for r in rows:
    if r["assistant"] == "Unattributed":
        who = changelog_signer(r["commit"])
        if who: r["assistant"], r["via"] = who, "change-log signer"
for r in rows: r.setdefault("via", "co-author line" if r["assistant"] != "Unattributed" else "")

first = datetime.fromisoformat(rows[0]["date"]).date()
last = datetime.fromisoformat(rows[-1]["date"]).date()
days = [first + timedelta(days=i) for i in range((last - first).days + 1)]
ORDER = ["Claude", "Codex", "Both", "Copilot", "Unattributed"]
counts = defaultdict(Counter)
for r in rows: counts[r["date"]][r["assistant"]] += 1
daily = [{"date": str(d), **{k: counts[str(d)][k] for k in ORDER}} for d in days]
for d in daily: d["total"] = sum(d[k] for k in ORDER)
with (OUT / "daily-by-assistant.csv").open("w", newline="", encoding="utf-8-sig") as f:
    w = csv.DictWriter(f, fieldnames=["date", *ORDER, "total"]); w.writeheader(); w.writerows(daily)
with (OUT / "commits-by-assistant.csv").open("w", newline="", encoding="utf-8-sig") as f:
    w = csv.DictWriter(f, fieldnames=["date", "commit", "assistant", "via", "subject"]); w.writeheader(); w.writerows(rows)

# Dated log: every counted commit under its day, with who; the table view behind the graph.
WHO = {"Both": "Claude + Codex", "Unattributed": "unattributed"}
lines = ["# Dragonfly dated work log", "",
         f"Every Dragonfly commit from {first:%B %d} to {last:%B %d, %Y} (Git `{SNAPSHOT[:7]}`, game-only commits excluded",
         "with Codex's rules), by New York commit date, with the assistant from its co-author line (or, where",
         "that line is missing, the signer of the change-log entry it adds or edits). The change log itself",
         "starts on September 28; earlier days are known from commit messages only. Generated by",
         "`make_graph.py`; the same rows are in `commits-by-assistant.csv`.", ""]
by_day = defaultdict(list)
for r in rows: by_day[r["date"]].append(r)
for d in days:
    items = by_day.get(str(d), [])
    if not items: continue
    c = Counter(r["assistant"] for r in items)
    lines.append(f"## {d:%a %b %d} ({len(items)}: " + ", ".join(f"{WHO.get(k, k)} {c[k]}" for k in ORDER if c[k]) + ")")
    lines.append("")
    for r in items:
        lines.append(f"- {r['subject']} — {WHO.get(r['assistant'], r['assistant'])}" + (" (from the change log)" if r["via"] == "change-log signer" else "") + f" `{r['commit'][:7]}`")
    lines.append("")
(OUT / "dated-log.md").write_text("\n".join(lines), encoding="utf-8")

# Milestones: exact commits; the date and the assistant both come from Git, not from the label.
MILESTONES = [
    ("69da51b", "Initial flight demo"),
    ("b89a7f8", "Published on GitHub Pages"),
    ("25d0210", "Thermal diagnostics and survey mission"),
    ("541a05f", "Change log begins; wet interdune replaces the lake"),
    ("9bd7326", "Arrival at Titan: entry, descent and landing"),
    ("93254c2", "Research-based 3D vehicle model"),
    ("0c9e506", "Titan weather, reverse brake, first expedition"),
    ("775b502", "Ahmakiq Undae landing area finished"),
    ("03ac4cf", "Inspection model with credited references"),
    ("0886e40", "Interior checklist; carousel, Wonderwall, DraMS"),
    ("bb82b60", "Radio, IEM, power units, cameras, drills"),
    ("f20648c", "Air loop, TWTA, antenna gimbal, sample lines"),
    ("203bdad", "Battery, rotor heads, steady part numbers"),
    ("eed63b1", "Aft bulkhead and inspection layers"),
    ("9f3fea1", "EFIELD and METHAN sensors (part 22)"),
    ("51d063d", "Lidar and IMU electronics (part 05)"),
    ("a796b69", "Attic detail, arm shoulders, MMRTG sensor"),
    ("3b7f82d", "Wiring harness; parts 03 and 09 closed"),
    ("6189cd8", "Temperature sensors; 24-part list closed"),
    ("25a1dae", "Structural walls, deck and MMRTG exterior"),
    ("020bfae", "IEM wiring columns completed"),
    ("4f375be", "DrACO drill audit; numbered inspection"),
    ("4ffd00c", "Blowers rebuilt from supplier hardware"),
    ("64a4cfe", "Radio bay connection example"),
]
milestones = []
for prefix, label in MILESTONES:
    r = next(r for r in rows if r["commit"].startswith(prefix))
    milestones.append({"date": r["date"], "label": label, "assistant": r["assistant"], "commit": r["commit"]})

# ---- Drawing (layout after Codex's graph) ----
COLORS = {"Claude": "#2a78d6", "Codex": "#eb6834", "Both": "#1baf7a", "Copilot": "#1baf7a", "Unattributed": "#a3a29b"}
LEGEND = [("Claude", "#2a78d6"), ("Codex", "#eb6834"), ("Both, or GitHub Copilot", "#1baf7a"), ("Unattributed (Sep 20–28)", "#a3a29b")]
W, H = 1800, 1560
bg, ink, muted, gridc = "#fcfcfb", "#1d2a30", "#5d6a70", "#e3e6e4"
im = Image.new("RGB", (W, H), bg); draw = ImageDraw.Draw(im)
def font(n, bold=False): return ImageFont.truetype("C:/Windows/Fonts/seguisb.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf", n)
def text(x, y, s, n=23, fill=ink, bold=False): draw.text((x, y), s, font=font(n, bold), fill=fill)
def rtext(x, y, s, n=23, fill=ink): text(x - draw.textlength(s, font=font(n)), y, s, n, fill)

text(76, 40, "Dragonfly project / work history by assistant", 46, bold=True)
text(79, 106, f"{first:%B %d} – {last:%B %d, %Y}  ·  recorded Git activity, colored by each commit's co-author line", 24, muted)
tot = Counter(r["assistant"] for r in rows)
via = sum(1 for r in rows if r["via"] == "change-log signer")
summary = (f"{len(rows)} project commits:  Claude {tot['Claude']}  ·  Codex {tot['Codex']}  ·  both {tot['Both']}  ·  "
           f"Copilot {tot['Copilot']}  ·  unattributed {tot['Unattributed']}   ({via} credited from the change log's signature)")
text(79, 150, summary, 24)

left, top, right_edge, bottom = 105, 300, 1724, 690
ymax = max(5, math.ceil(max(d["total"] for d in daily) / 5) * 5)
step = (right_edge - left) / len(days); bar = step * 0.72
px = lambda i: left + (i + 0.5) * step
py = lambda v: bottom - v / ymax * (bottom - top)
text(left, 236, "Commits per day", 23, bold=True)
lx = 560
for label, color in LEGEND:
    draw.rounded_rectangle((lx, 243, lx + 18, 261), radius=3, fill=color)
    text(lx + 27, 234, label, 21); lx += 27 + draw.textlength(label, font=font(21)) + 34
for v in range(0, ymax + 1, 5):
    y = py(v); draw.line((left, y, right_edge, y), fill=gridc, width=1); rtext(left - 15, y - 16, str(v), 21, muted)
for i, d in enumerate(daily):
    x, base = px(i), 0
    segments = [(k, d[k]) for k in ORDER if d[k]]
    for j, (k, n) in enumerate(segments):
        y0, y1 = py(base + n), py(base)
        top_seg = j == len(segments) - 1
        # 2 px surface gap between stacked segments; rounded data end on the top segment only.
        box = (x - bar / 2, y0, x + bar / 2, y1 - (2 if base else 0))
        if top_seg: draw.rounded_rectangle(box, radius=4, fill=COLORS[k]); draw.rectangle((box[0], min(box[3], box[1] + 4), box[2], box[3]), fill=COLORS[k])
        else: draw.rectangle(box, fill=COLORS[k])
        base += n
    if d["total"]: text(x - draw.textlength(str(d["total"]), font=font(17)) / 2, py(d["total"]) - 25, str(d["total"]), 17, muted)
for i in sorted(set(list(range(0, len(days), 7)) + [len(days) - 1])):
    label = days[i].strftime("%b %d"); x = px(i); tw = draw.textlength(label, font=font(21))
    draw.line((x, bottom, x, bottom + 6), fill=muted, width=1)
    text(max(left, min(x - tw / 2, right_edge - tw)), bottom + 12, label, 21, muted)
text(760, 738, "Commit date · America/New_York", 21, muted)

text(79, 800, "Milestones (date and assistant from the commit itself)", 28, bold=True)
for i, m in enumerate(milestones):
    col, row = divmod(i, 12)
    x, y = 80 + col * 860, 856 + row * 50
    day = datetime.fromisoformat(m["date"])
    text(x, y, day.strftime("%b %d"), 22, ink, bold=True)
    draw.ellipse((x + 92, y + 11, x + 104, y + 23), fill=COLORS[m["assistant"]])
    who = {"Both": "Claude + Codex", "Unattributed": "—"}.get(m["assistant"], m["assistant"])
    text(x + 116, y, m["label"], 22)
    rtext(x + 820, y, who, 20, muted)

draw.line((80, 1470, 1720, 1470), fill=gridc, width=1)
text(80, 1482, "Commit counts show recorded activity, not hours worked or effort. Game-only commits excluded with Codex's rules; every commit is authored 'Heemi'.", 19, muted)
text(80, 1512, f"Source: Git {SNAPSHOT[:7]} (same snapshot as Codex's graph) · every counted commit by date in dated-log.md · script make_graph.py", 19, muted)
im.save(OUT / "work-log-by-assistant.png")
print(len(rows), dict(tot), "via change log:", [(r["date"], r["assistant"], r["subject"][:50]) for r in rows if r["via"] == "change-log signer"])
print("unattributed:", [(r["date"], r["subject"][:50]) for r in rows if r["assistant"] == "Unattributed"])
