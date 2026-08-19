# Stationeers IC10 workspace

An organized workspace for writing, documenting, and checking IC10 programs for
[Stationeers](https://store.steampowered.com/app/544550/Stationeers/).

## Repository layout

```text
.
├── AGENTS.md                 # Guidance for coding agents and contributors
├── docs/
│   ├── ic10-instructions.md # Local IC10 syntax reference
│   ├── ic10-script-design.md # State-machine and recovery patterns
│   └── prefab-hashes.md     # Versioned Stationpedia prefab hash catalog
├── scripts/
│   ├── README.md            # Script layout and documentation template
│   ├── archive/             # Learning examples, not dependable automation
│   └── <script-name>/
│       ├── <script-name>.ic10
│       └── README.md        # Wiring, setup, behavior, and limitations
├── tests/                   # Tests for repository tooling
└── tools/
    └── lint_ic10.py         # Layout and line-count checks
```

Current programs:

- [AIMeE miner](scripts/aimee-miner/README.md) — automated mining, unloading,
  charging, weather recall, hangar control, and status displays.
- [AIMeE spiral miner](scripts/aimee-spiral-miner/README.md) — coordinated
  three-IC, single-bot spiral mining with recall, hangar supervision, displays,
  and recovery.

Archived learning examples:

- [AIMeE strip miner](scripts/archive/aimee-strip-miner/README.md) — corrected
  two-IC experiment with substantial documented limitations.

References and conventions:

- [IC10 instruction reference](docs/ic10-instructions.md) — compact local
  syntax and descriptions.
- [IC10 script design](docs/ic10-script-design.md) — state machines, device
  modes, recovery paths, stack discipline, and review checklist.
- [Prefab hash catalog](docs/prefab-hashes.md) — every prefab name and signed
  hash in the pinned Stationpedia game-data version.
- [Pipe color map](docs/pipe-color-map.md) — gas, liquid, mixture, and service
  conventions using the standard and metallic spray-paint palettes.
- [Script conventions](scripts/README.md) — directory layout and README
  template.
- [Agent guidance](AGENTS.md) — repository-specific editing and validation
  rules.

## Adding a script

Create one directory per program, using the same lowercase kebab-case name for
the directory and script:

```text
scripts/airlock-controller/
├── airlock-controller.ic10
└── README.md
```

Document hardware, IC Housing pin assignments, configurable values, operating
behavior, and known limitations in the sibling README. Keep configuration
constants near the beginning of the program.

IC10 programs are limited to 128 physical lines in the game editor. Blank lines
and comments count toward that limit.

## Checks

Python 3 is the only requirement for the base checks. Run them before using a
script in game:

```sh
make lint
make test
```

`make lint` verifies the script layout, sibling README, UTF-8 encoding, and
128-line limit. `make test` runs unit tests for the repository tooling.

For the complete repository and simulator validation, install Bun and run one
command:

```sh
make validate
```

It installs the locked dependencies, runs the base checks, parses every script,
automatically discovers sibling `*.sim.json` scenarios, and tests the simulator
harness. To simulate only the script you are editing, use its short directory
name:

```sh
./sim aimee-miner
```

Use `make simulate` for a faster simulator-only pass across every script.
See [IC10 simulator](docs/ic10-simulator.md) for scenario configuration,
licensing, and limitations. Device properties, network topology, hashes, and
control behavior must still be verified in Stationpedia and tested in game.

## Status

This is a small working collection, not a packaged IC10 compiler. Its optional
simulation harness uses a third-party emulator and does not replace in-game
testing. Scripts may contain documented limitations or require local
coordinates and device assignments; read each script's README before loading
it onto a chip.
