# Stationeers IC10 workspace

Local notes and scripts for debugging Stationeers IC10 programs.

- [IC10 instruction reference](docs/ic10-instructions.md) — compact syntax and description for every instruction.
- [Script conventions](scripts/README.md) — layout and README template for IC10 scripts.

## Checks

Run the repository checks before using a script in game:

```sh
make lint
make test
```

The linter requires every script to live in its own folder with a `README.md` and rejects scripts over Stationeers' 128-line limit. Comments and blank lines count toward the limit.
