"""Inventory explicitly selected backups without deleting originals or running asset code.

Run with the bundled Python and --copy-downloads to copy completed browser downloads.
Existing files with differing content are never overwritten. Generated reports retain
their prior versions under catalog-history/. ZIP checks read archives without extracting
model files; only small text license/readme notices are copied to metadata/.
"""
import argparse
import collections
import datetime
import gzip
import hashlib
import json
import pathlib
import shutil
import zipfile

HERE = pathlib.Path(__file__).resolve().parent
CONFIG = json.loads((HERE / "library-sources.json").read_text(encoding="utf-8"))
ROOT = pathlib.Path(CONFIG["library"]).resolve()
STAMP = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")


def digest(path):
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(4 * 1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def save(relative, text):
    path = ROOT / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        old = path.read_bytes()
        if old == text.encode("utf-8"):
            return
        history = ROOT / "catalog-history" / STAMP / relative
        history.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, history)
    path.write_text(text, encoding="utf-8")


def blend_check(path):
    with path.open("rb") as f:
        header = f.read(12)
    if header.startswith(b"\x1f\x8b"):
        with gzip.open(path, "rb") as f:
            header = f.read(12)
    if header.startswith(b"BLENDER") and len(header) == 12:
        return "Blender header verified; version " + header[9:12].decode("ascii", errors="replace") + "; scene not rendered"
    if header.startswith(b"\x28\xb5\x2f\xfd"):
        return "Zstandard-compressed file signature; Blender scene not yet opened/verified"
    raise ValueError(f"Unexpected Blender header: {path.name}")


def inspect(asset):
    row = dict(asset)
    path = ROOT / asset["file"]
    part = ROOT / (asset["file"] + ".part")
    if not path.exists() and part.exists():
        row.update(status="partial download", bytes=part.stat().st_size, partial_file=part.name)
        # Only finalize the exact expected source size after all ZIP CRC checks pass.
        if asset.get("expected_bytes") == row["bytes"]:
            with zipfile.ZipFile(part) as z:
                bad = z.testzip()
                if bad:
                    raise ValueError(f"CRC failure: {bad}")
            part.rename(path)
        else:
            return row
    if not path.exists():
        row.update(status="pending download", bytes=0)
        return row
    row.update(status="backed up", bytes=path.stat().st_size, sha256=digest(path))
    if path.suffix.lower() == ".zip":
        with zipfile.ZipFile(path) as z:
            bad = z.testzip()
            if bad:
                raise ValueError(f"CRC failure in {path.name}: {bad}")
            members = [i for i in z.infolist() if not i.is_dir()]
            row["archive_files"] = len(members)
            row["formats"] = dict(sorted(collections.Counter(pathlib.PurePosixPath(i.filename).suffix.lower() or "(none)" for i in members).items()))
            row["validation"] = "ZIP CRC verified; model appearance and dependencies not yet inspected in Blender"
            save(f"metadata/{asset['id']}/archive-files.txt", "\n".join(i.filename for i in members) + "\n")
            row["notices"] = []
            for n, member in enumerate(members):
                name = pathlib.PurePosixPath(member.filename).name
                if member.file_size <= 262144 and pathlib.Path(name).suffix.lower() in (".txt", ".md", ".html") and any(s in name.lower() for s in ("license", "licence", "readme", "credit", "attribution")):
                    relative = f"metadata/{asset['id']}/notice-{n}-{name}" + (".txt" if name.endswith(".html") else "")
                    save(relative, z.read(member).decode("utf-8", errors="replace"))
                    row["notices"].append(relative)
    elif path.suffix.lower() == ".blend":
        row["validation"] = blend_check(path)
    save(f"metadata/{asset['id']}/SOURCE.md", f"# {asset['title']}\n\nCreator: {asset['creator']}\n\nSource: {asset['source']}\n\nLicense recorded on 2026-10-16: {asset['license']}\n\nFile: `{asset['file']}`\n\nSHA-256: `{row['sha256']}`\n\n{asset['notes']}\n\n{row['validation']}\n\nOriginal source backup remains unchanged. Any browser derivatives and modifications are documented separately in the project and asset notes above. For CC-BY assets retain title, creator, source, applicable license/version and a notice of subsequent changes when publishing derivatives. This receipt records the listing, not an independent rights warranty.\n")
    return row


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--copy-downloads", action="store_true")
    args = parser.parse_args()
    ROOT.mkdir(parents=True, exist_ok=True)
    if args.copy_downloads:
        downloads = pathlib.Path.home() / "Downloads"
        for asset in CONFIG["assets"]:
            candidates = [downloads / asset["download"]] if "download" in asset else list(downloads.glob(asset["download_glob"])) if "download_glob" in asset else []
            candidates = [p for p in candidates if p.is_file() and p.suffix.lower() in (".blend", ".zip")]
            if len(candidates) > 1:
                raise ValueError(f"Ambiguous download candidates: {asset['id']}")
            if candidates:
                source, target = candidates[0], ROOT / asset["file"]
                # Check a ZIP is complete before copying a browser download.
                if source.suffix.lower() == ".zip":
                    try:
                        with zipfile.ZipFile(source) as z:
                            if z.testzip():
                                continue
                    except zipfile.BadZipFile:
                        continue
                if target.exists():
                    if digest(source) != digest(target):
                        raise ValueError(f"Refusing to overwrite differing original: {target.name}")
                else:
                    shutil.copy2(source, target)
    rows = [inspect(a) for a in CONFIG["assets"]]
    completed = [r for r in rows if r["status"] == "backed up"]
    total = sum(r["bytes"] for r in completed)
    report = {"generated_utc": STAMP, "library": str(ROOT), "completed_backups": len(completed), "completed_bytes": total, "assets": rows, "queue": CONFIG["queue"]}
    save("catalog.json", json.dumps(report, indent=2, ensure_ascii=False) + "\n")
    lines = ["# Reusable Game Asset Library", "", "Owner-authorized local library, cataloged by Codex. Updated October 16, 2026.", "", f"**{len(completed)} completed source backups, {total / 1024**3:.2f} GiB.** Partial/pending files are excluded from that total.", "", "Keep all original archives and Downloads copies. No files were deleted. This library is reusable outside Swarmfall; it is not part of the deployed game. Derived exports should go into separate folders and retain source/credit links.", "", "Priority: intricate large alien/fantasy cities, planetary bases, orbital stations, spacecraft and close-view environments. Minecraft is a scale reference only; use a less blocky look. Simple modular kits are supporting assets, not finished city replacements.", "", "## Backups and pending transfers", "", "| Asset | Creator / license | Status / size | Local source |", "| --- | --- | --- | --- |"]
    for r in rows:
        name = r.get("partial_file", r["file"])
        local = f"[{name}]({name})" if (ROOT / name).exists() else "pending"
        lines.append(f"| [{r['title']}]({r['source']}) | {r['creator']} / {r['license']} | {r['status']}; {r['bytes'] / 1024**2:.1f} MiB | {local} |")
    lines += ["", "## Verification and reuse", "", "`catalog.json` contains SHA-256 checksums, exact byte sizes, archive file counts, formats and tags. `metadata/<asset>/SOURCE.md` records canonical sources and credits; archive listings and included small license/readme notices are preserved beside it. ZIP CRC and Blender file-header checks establish file integrity/signature, not rendered visual quality, packed texture completeness or browser readiness. No downloaded scripts were executed.", "", "CC0 sources can be adapted; CC-BY sources need attribution and the applicable license details. A listing's CC-BY label alone does not establish a version. Resolve exact notices before public redistribution. Do not treat someone else's fan recreation as a license to a game's proprietary city. Synty Elven Realm and franchise screenshots remain reference-only research, not backed-up licensed game models.", "", "Quaternius entries are the free Standard editions. Advertised full-pack counts and paid Source-edition demos/shaders/collisions must not be assumed to exist in these backups. Check archive inventories instead.", "", "The Hidden Alley `.part` file remains incomplete until its expected 1,505,326,815 bytes and ZIP CRC pass. Interrupted downloads can resume; preserve the partial file. The catalog generator keeps prior report versions under `catalog-history/`.", "", "## Next downloads — no automatic purchases or quota bypass", "", "BlendSwap's signed-in free account has a five-download daily allowance; this batch reached the quota (including a repeated HY-21 request whose event timed out). Do not retry timed-out download buttons without checking Downloads first. Continue this queue when the site permits, prioritizing space/alien scenes. Listing license/size information below is provisional until each archive is downloaded and inspected.", "", "| Candidate | Creator / listed license | Why / next check |", "| --- | --- | --- |"]
    for q in CONFIG["queue"]:
        lines.append(f"| [{q['title']}]({q['source']}) | {q['creator']} / {q['license']} | {q['priority']} |")
    lines += ["", "## Swarmfall handoff", "", "Project research: `C:/Users/Heemi/OneDrive/Documents/ChatGPT/Nasa dragonfly/research/fantasy-city-2026-10-16/`. The project README and SWARMFALL-TODO.md retain all earlier references and requests. Game integration, a pilot campaign, drone builder, optional victory extraction, 1–3 drones per pod, large city streaming and destructibility remain separate checklist tasks. Cyberpunk City and drone City now have separate converted city previews; Cyberpunk City also has original contoured coastal terrain and water. Original source backups remain unchanged. Downloads do not complete campaign features.", ""]
    save("README.md", "\n".join(lines))
    print(json.dumps({"completed_backups": len(completed), "completed_bytes": total, "states": {r['id']: r['status'] for r in rows}}, indent=2))


if __name__ == "__main__":
    main()
