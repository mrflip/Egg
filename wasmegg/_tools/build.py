#!/usr/bin/env python3

import argparse
import datetime
import hashlib
import json
import os
import pathlib
import shutil
import subprocess


srcdir = pathlib.Path("src")
distdir = pathlib.Path("dist")

pagename = pathlib.Path(os.getcwd()).name
is_home = pagename == "_home"
parent_distdir = pathlib.Path("../dist")
finaldest = parent_distdir if is_home else (parent_distdir / pagename)


def wasm_handler(args):
    env = os.environ.copy()
    env["GOOS"] = "js"
    env["GOARCH"] = "wasm"
    env["GOFLAGS"] = "-trimpath"
    print("go build -ldflags='-s -w' -o dist/app.wasm")
    subprocess.check_call(
        ["go", "build", "-ldflags=-s -w", "-o", "dist/app.wasm"], env=env
    )
    path_with_hash_suffix = add_hash_suffix(pathlib.Path("dist/app.wasm"))
    print(f"{path_with_hash_suffix}: {path_with_hash_suffix.stat().st_size:,} bytes")
    with open("dist/manifest.wasm.json", "w") as fp:
        fp.write(json.dumps({"app.wasm": path_with_hash_suffix.name}, indent=2))


def html_handler(args):
    manifest = read_manifests()
    with srcdir.joinpath("index.html").open() as fp:
        content = fp.read()
    content = content.replace("@@BUILD_NUMBER@@", get_build_number())
    for src, dst in manifest.items():
        content = content.replace(f"@@{src}@@", dst)
    with distdir.joinpath("index.html").open("w") as fp:
        fp.write(content)


def dist_handler(args):
    removal_list = (
        [finaldest / "index.html", finaldest / "assets", finaldest / "static"]
        if is_home
        else [finaldest]
    )
    for path in removal_list:
        if path.is_file():
            print(f"rm {path}")
            path.unlink()
        if path.is_dir():
            print(f"rm -r {path}")
            shutil.rmtree(path)
    print(f"mkdir -p {finaldest}")
    finaldest.mkdir(parents=True, exist_ok=True)
    copylist = ["index.html"]
    if (distdir / "wasm_exec.js").exists():
        copylist.append("wasm_exec.js")
    copylist.extend(read_manifests().values())
    if args.additional_assets:
        copylist.extend(args.additional_assets)
    copylist = [distdir / f for f in copylist]
    print(f"cp -r {' '.join(str(f) for f in copylist)} {finaldest}")
    for f in copylist:
        if f.is_dir():
            shutil.copytree(f, finaldest / f.name)
        else:
            shutil.copy(f, finaldest)


def add_hash_suffix(path):
    hasher = hashlib.sha256()
    with path.open("rb") as fp:
        while True:
            chunk = fp.read(65536)
            if not chunk:
                break
            hasher.update(chunk)
    hash = hasher.hexdigest()
    path_with_hash_suffix = path.with_suffix(f".{hash[:8]}{path.suffix}")
    print(f"mv {path} {path_with_hash_suffix}")
    path.rename(path_with_hash_suffix)
    return path_with_hash_suffix


def read_manifests():
    manifest = dict()
    for f in distdir.glob("manifest*.json"):
        with f.open() as fp:
            manifest.update(json.load(fp))
    return manifest


def get_build_number():
    date = datetime.datetime.utcnow().strftime("%Y%m%d")
    try:
        commit = subprocess.check_output(
            ["git", "rev-parse", "--short=8", "HEAD"], text=True
        ).strip()
    except subprocess.CalledProcessError:
        commit = "snapshot"
    dirty = False
    if not os.getenv("CI") and commit != "snapshot":
        status = subprocess.check_output(
            ["git", "status", "--short"], text=True
        ).strip()
        if status:
            dirty = True
    dirty_indicator = "*" if dirty else ""
    return f"{date}.{commit}{dirty_indicator}"


def main():
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="cmd")
    subparsers.required = True

    wasm_parser = subparsers.add_parser("wasm")
    wasm_parser.set_defaults(handler=wasm_handler)

    html_parser = subparsers.add_parser("html")
    html_parser.set_defaults(handler=html_handler)

    dist_parser = subparsers.add_parser("dist")
    dist_parser.set_defaults(handler=dist_handler)
    dist_parser.add_argument(
        "--additional",
        dest="additional_assets",
        action="append",
        help="relative paths of additional assets to copy into dist",
    )

    args = parser.parse_args()
    args.handler(args)


if __name__ == "__main__":
    main()
