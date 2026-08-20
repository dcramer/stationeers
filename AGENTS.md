# AGENTS.md

This repository contains IC10 programs for Stationeers. Keep changes small,
game-ready, and easy to configure from an IC Housing.

## Start here

- Before editing or reviewing IC10, read `docs/ic10-instructions.md`. It is the
  repository's syntax and execution reference and identifies the game-data
  version from which it was derived.
- Read `docs/ic10-script-design.md` when changing control flow, wait loops,
  device modes, recovery, or safety behavior. Use its entry-path checklist
  during review.
- Verify device properties, slot properties, hashes, and current behavior in
  Stationpedia for the target game version. Syntax and lint success do not prove
  that a script works at runtime.
- Use `scripts/README.md` as the minimum documentation template.
- A nested `AGENTS.md` or `AGENTS.override.md` takes precedence for files below
  its directory.

## Repository shape

- `scripts/<name>/<name>.ic10` contains one standalone program. A setup that
  requires multiple cooperating programs may keep them together in the same
  directory.
- `scripts/<name>/README.md` documents the program or setup's hardware, pins,
  setup, behavior, and failure handling.
- `tools/lint_ic10.py` checks layout and the IC10 line limit.
- `tools/sim_ic10.ts` optionally parses scripts and runs emulator scenarios.
- `tests/` tests repository tooling and the simulation harness; neither
  reproduces the full game.

## Design priority: power first

- Treat minimizing continuous and idle power as the default design goal unless
  the task explicitly prioritizes something else. Safety and reliable recovery
  still take precedence over power savings.
- Prefer hard-switching unused machines, pumps, sensors, regulators, and lit
  indicators off. Use standby modes only when their persistent power cost is
  justified by wake-up, monitoring, or safety requirements.
- Count the control system itself when comparing designs. Favor one shared
  sensor or controller over many always-on devices when it preserves the
  required behavior.
- Remember that an onboard IC stops executing when its host is hard-off and
  cannot wake that host. Use an external controller when autonomous hard-off
  and restart provide a meaningful net power saving.
- Document unavoidable continuous loads, wake-up dependencies, retained-state
  assumptions, and any power-versus-safety tradeoff in the script README.

## IC10 rules

- Use the same lowercase kebab-case name for a standalone script directory and
  `.ic10` file, with a sibling `README.md`. For a multi-program setup, use
  descriptive lowercase kebab-case filenames and one shared sibling README.
- Stay at or below 128 physical lines. Comments and blank lines count, so keep
  source comments brief and put setup detail in the README.
- Use readable aliases for assigned screws (`d0` through `d5`) and uppercase
  names for `define` constants. Put configurable thresholds, hashes, and
  coordinates near the top.
- Use labels for non-trivial control flow. Every loop must reach an explicit
  `yield` or `sleep`.
- Treat registers, `ra`, `sp`, and the stack as shared state. For nested calls,
  preserve return addresses and balance every stack path. Document a register
  map when reuse is not obvious.
- Distinguish returning subroutines from non-returning state transitions. Trace
  cold start, normal completion, and interruptions from every wait loop; prove
  the required postcondition before resuming an outbound or hazardous state.
- Treat batch operations (`lb`, `lbn`, `sb`, and related instructions) as
  network-wide unless narrowed by a name hash. Check empty-batch behavior in
  the local reference.
- Do not silently change pins, device names, hashes, thresholds, or safety
  behavior. Update the sibling README in the same change.
- Preserve attribution when adapting a community script.

## Script README contents

Document, when applicable:

- purpose and attribution;
- required hardware, network assumptions, and a `d0`-through-`d5` pin table;
- constants, hashes, thresholds, and required device names;
- startup, normal operation, shutdown, and fail-safe behavior;
- asynchronous mode completion conditions and recovery postconditions;
- known limitations and version assumptions;
- a register map for non-obvious control flow or register reuse.

## Validation

With Bun installed, run the complete validation from the repository root:

```sh
make validate
```

This installs the locked Bun dependencies, runs the Python checks, statically
parses every IC10 file, automatically runs sibling `*.sim.json` scenarios, and
tests the simulation harness. `make lint` and `make test` remain available when
Bun is unavailable; the linter does not parse or emulate IC10. Review control
flow and distinguish emulator coverage, in-game verification, and untested
assumptions.

## Change discipline

- Preserve unrelated working-tree changes; they may be active in-game tuning.
- Avoid broad reformatting during a targeted fix.
- Do not claim an instruction, hash, property, or behavior is current without
  checking it against the relevant Stationeers version.
