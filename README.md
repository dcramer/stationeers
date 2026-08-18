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

References and conventions:

- [IC10 instruction reference](docs/ic10-instructions.md) — compact local
  syntax and descriptions.
- [IC10 script design](docs/ic10-script-design.md) — state machines, device
  modes, recovery paths, stack discipline, and review checklist.
- [Prefab hash catalog](docs/prefab-hashes.md) — every prefab name and signed
  hash in the pinned Stationpedia game-data version.
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

Python 3 is the only local requirement. Run the repository checks before using
a script in game:

```sh
make lint
make test
```

`make lint` verifies the script layout, sibling README, UTF-8 encoding, and
128-line limit. `make test` runs unit tests for the repository tooling.

These checks do not parse IC10 or simulate Stationeers. Device properties,
network topology, hashes, and control behavior must still be verified in
Stationpedia and tested in game. The instruction reference records its source
game-data version so version-sensitive assumptions remain visible.

## Status

This is a small working collection, not a packaged IC10 compiler or emulator.
Scripts may contain documented limitations or require local coordinates and
device assignments; read each script's README before loading it onto a chip.
