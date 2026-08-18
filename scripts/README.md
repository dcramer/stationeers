# IC10 scripts

Keep each script in a dedicated directory:

```text
scripts/
└── example-controller/
    ├── example-controller.ic10
    └── README.md
```

The `.ic10` file may contain at most 128 physical lines. Blank lines and comments count because the game editor counts them too. Run `make lint` from the repository root to check every script.

Use this compact README structure for new scripts:

```markdown
# Script name

One-sentence purpose.

## Connections

| Pin | Device |
|---|---|
| `d0` | Device name |

## Setup

Any required device names, constants, or initial settings.

## Behavior

What the script reads, controls, and does on errors.
```

