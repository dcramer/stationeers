# IC10 scripts

Keep each standalone script in a dedicated directory:

```text
scripts/
└── example-controller/
    ├── example-controller.ic10
    ├── README.md
    ├── normal-operation.sim.json
    └── failure-recovery.sim.json
```

A setup that requires multiple cooperating ICs may keep all of its `.ic10`
programs in one directory with one shared `README.md`. Use descriptive,
lowercase kebab-case filenames and document which program belongs in each IC
housing.

Keep superseded or intentionally experimental programs below `archive/` with
an explicit warning in their README. Archived programs still receive normal
line-limit, syntax, and scenario validation; the directory is a documentation
category, not an exclusion from checks.

The `.ic10` file may contain at most 128 physical lines. Blank lines and comments count because the game editor counts them too. Run `make lint` from the repository root to check every script.

Use the same lowercase kebab-case name for the directory and IC10 file. Put
configuration constants near the top of the program, and keep detailed setup
notes in the README rather than spending the in-game line budget on comments.

Use this compact README structure for new scripts:

```markdown
# Script name

One-sentence purpose.

## Connections

| Pin | Alias | Device |
|---|---|---|
| `d0` | `example` | Device name |

## Setup

Any required device names, hashes, constants, pin assignments, or initial
settings.

## Behavior

What the script reads, controls, and does on errors.

## Known limitations

Version assumptions, unsafe states, network-wide batch effects, or behavior
that still needs in-game verification.
```

For a complex script, also document its register map and the meanings of any
device modes or state values.

## Simulator scenarios

Keep zero or more `*.sim.json` scenarios beside the script. `make validate`
finds them automatically; no central test list needs updating. Start with one
normal-operation case, then add separate cases for important shutdown, missing
device, and recovery paths. Multi-program setups should identify the target
`.ic10` file in each scenario's `script` field.

Use the compact scenario format and examples in
[`docs/ic10-simulator.md`](../docs/ic10-simulator.md). Scripts without scenarios
still receive static instruction and operand validation, and the validation
output reports how many scripts have behavioral scenario coverage.
