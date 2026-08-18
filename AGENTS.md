# AGENTS.md

This repository contains IC10 programs for the game Stationeers. Keep changes
small, game-ready, and easy to configure from an IC Housing.

## Repository layout

- `scripts/<script-name>/<script-name>.ic10` contains one IC10 program.
- `scripts/<script-name>/README.md` documents that program's hardware, pin
  assignments, setup, behavior, and failure handling.
- `docs/ic10-instructions.md` is the local instruction reference.
- `tools/lint_ic10.py` enforces repository layout and the IC10 line limit.
- `tests/` contains tests for repository tooling, not simulations of the game.

Instructions in a script directory's own `AGENTS.md`, if one is added later,
take precedence for files below that directory.

## Working with IC10

- Keep each program in its own directory with a sibling `README.md`.
- Use the same lowercase kebab-case name for the directory and `.ic10` file.
- Stay at or below 128 physical lines. Comments and blank lines count in the
  Stationeers editor, so prefer concise comments and document detail in the
  script README.
- Use readable `alias` names for assigned screws (`d0` through `d5`) and
  uppercase names for `define` constants.
- Use labels for non-trivial control flow. Make loop waits explicit with
  `yield` or `sleep` so a program does not consume its instruction budget
  needlessly.
- Treat `r0` through `r15`, `ra`, and the stack as shared state. Document a
  register map for complex programs and preserve return addresses across
  nested subroutine calls.
- Prefer configurable constants near the top of the program for thresholds,
  hashes, and coordinates.
- Verify every device property and slot property against Stationpedia for the
  actual device. A syntactically valid script can still fail at runtime when a
  device does not expose a requested property.
- Be especially careful with batch operations (`lb`, `lbn`, `sb`, and related
  instructions): they affect or aggregate all matching devices on the data
  network unless narrowed by a name hash.
- Do not silently change pin assignments, device names, hashes, thresholds, or
  safety behavior. Update the sibling README in the same change.
- Preserve source attribution when adapting a community script.

## Script documentation

Every script README should include, when applicable:

1. A one-sentence purpose and attribution.
2. Required hardware and network assumptions.
3. A pin table mapping `d0` through `d5` to aliases and devices.
4. Configurable constants, hashes, thresholds, and required device names.
5. Operating behavior, including startup and shutdown states.
6. Fail-safe behavior and known limitations.
7. A register map when control flow or register reuse is not obvious.

Use `scripts/README.md` as the minimum template.

## Validation

Run both checks from the repository root before finishing a change:

```sh
make lint
make test
```

The linter checks layout, sibling documentation, UTF-8 input, and the 128-line
limit. It does not parse IC10 syntax or emulate Stationeers. Review control flow
and test the program in game before describing it as proven or safe.

When changing the Python tooling, add or update unit tests under `tests/`.

## Change discipline

- Preserve unrelated working-tree changes; they may be active in-game tuning.
- Avoid reformatting an entire `.ic10` file during a targeted fix because line
  movement makes in-game debugging and comparison harder.
- Separate confirmed behavior from hypotheses in documentation.
- Do not claim a game-data hash, instruction, or device property is current
  unless it has been checked against the relevant Stationeers version.
