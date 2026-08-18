# IC10 scripts

Keep each script in a dedicated directory:

```text
scripts/
└── example-controller/
    ├── example-controller.ic10
    └── README.md
```

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
