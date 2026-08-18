#!/usr/bin/env python3
"""Check Stationeers IC10 script layout and line limits."""

from __future__ import annotations

import argparse
from pathlib import Path
import sys

MAX_LINES = 128


def physical_line_count(text: str) -> int:
    """Count editor-visible lines without treating a final newline as another line."""
    return len(text.splitlines())


def lint(root: Path) -> tuple[list[str], int]:
    problems: list[str] = []
    scripts = sorted(root.rglob("*.ic10")) if root.is_dir() else []

    if not root.is_dir():
        return ([f"{root}: scripts directory does not exist"], 0)

    for script in scripts:
        if script.parent == root:
            problems.append(
                f"{script}: script must be inside its own subdirectory"
            )

        readme = script.parent / "README.md"
        if not readme.is_file():
            problems.append(f"{script}: missing sibling README.md")
        elif not readme.read_text(encoding="utf-8").strip():
            problems.append(f"{readme}: README.md must not be empty")

        try:
            line_count = physical_line_count(script.read_text(encoding="utf-8"))
        except UnicodeDecodeError:
            problems.append(f"{script}: file must be UTF-8 text")
            continue

        if line_count > MAX_LINES:
            problems.append(
                f"{script}: {line_count} lines; maximum is {MAX_LINES} "
                "(comments and blanks count)"
            )

    return problems, len(scripts)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "root",
        nargs="?",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "scripts",
        help="scripts directory (default: repository scripts/)",
    )
    args = parser.parse_args()

    problems, script_count = lint(args.root.resolve())
    if problems:
        for problem in problems:
            print(f"ERROR: {problem}", file=sys.stderr)
        print(f"FAILED: {len(problems)} problem(s)", file=sys.stderr)
        return 1

    noun = "script" if script_count == 1 else "scripts"
    print(f"OK: checked {script_count} IC10 {noun}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
