# IC10 simulator

The optional simulation layer uses
[`@stationeers-ic/ic10`](https://github.com/Stationeers-ic/ic10), pinned to
version `0.3.7`. It adds syntax and operand checks plus repeatable tests against
simulated IC housings, devices, and data networks.

The existing Python checks remain independent of Bun and the emulator.

## Simulate the script you are working on

Use the script directory's short name:

```sh
./sim aimee-miner
```

That statically checks only `scripts/aimee-miner/` and automatically runs its
scenarios. For a directory containing multiple IC10 programs, target one file:

```sh
./sim advanced-furnace/furnace-ic.ic10
```

Paths beginning with `scripts/` also work. The Make equivalent is
`make simulate SCRIPT=aimee-miner`.

## Complete validation

Install [Bun](https://bun.sh/), then run this from the repository root:

```sh
make validate
```

That one command installs the locked packages, runs the Python repository
checks, statically checks every IC10 program, automatically runs every
`*.sim.json` below `scripts/`, and tests the simulation harness itself.

For a faster simulator-only pass while editing:

```sh
make simulate
```

To install dependencies without running validation:

```sh
make setup
```

The equivalent direct commands are:

```sh
bun run tools/sim_ic10.ts check scripts
bun run tools/sim_ic10.ts validate scripts
bun run tools/sim_ic10.ts run path/to/controller.sim.json
```

The static check resolves labels, aliases, defines, instructions, argument
counts, and operands. It does not follow branches or write to devices.

## Scenarios

A scenario is a JSON file that names a sibling IC10 file, lists its simulated
devices, and sets a fixed number of physical-line steps. Paths in `script` are
relative to the scenario file. The harness automatically creates the chip, IC
housing, and shared data network.

Put scenarios beside the script they exercise. Each script may have as many as
it needs:

```text
scripts/advanced-furnace/
├── advanced-furnace.ic10
├── README.md
├── normal-operation.sim.json
├── overpressure-shutdown.sim.json
└── sensor-failure.sim.json
```

`make simulate` discovers all of them automatically and prints how many scripts
have scenario coverage. A missing scenario does not fail validation: that
script still receives static checks. As a practical baseline, give each script
one normal-operation scenario, then add a scenario for each important safety or
recovery path.

The smallest useful shape is:

```json
{
  "version": 1,
  "script": "controller.ic10",
  "steps": 4,
  "devices": [
    {
      "id": 20,
      "prefab": "StructureLogicMemory",
      "pin": "d0",
      "props": { "Setting": 0 }
    }
  ],
  "expect": {
    "registers": { "r0": 42 },
    "devices": { "20": { "Setting": 42 } },
    "nextLine": 4
  }
}
```

`pin` is optional for batch-accessed devices. `name` sets the device name used
by named batch instructions, `props` supplies initial logic values, and `slots`
can install items such as a battery. Device IDs must be unique; the default
housing ID is `10`.

Set `virtual` with a `pin` for a remotely referenced device that is not on the
IC data network. The AIMeE scenarios use this to represent the Logic
Transmitter link without inventing a wired Robot port:

```json
{ "id": 20, "prefab": "Robot", "pin": "d0", "virtual": true }
```

Use `changes` to model external state that the emulator cannot advance itself.
Changes run immediately after the named physical-line step; step zero applies
before execution starts:

```json
{
  "changes": [
    { "afterStep": 20, "registers": { "r6": 1 } },
    { "afterStep": 36, "devices": { "20": { "Mode": 0 } } },
    { "afterStep": 69, "slots": { "20": { "0": { "Charge": 70000 } } } }
  ]
}
```

This is intended for controlled events such as a robot arriving, weather
changing, or a battery charging. Keep the event and its in-game meaning clear
in the scenario filename or script README.

For simulations requiring multiple networks, slots, reagents, initial chip
registers, or other emulator-specific state, replace the compact `devices`
field with the emulator's full `environment` object and optionally set
`housingId`.

Expected numbers may specify a tolerance:

```json
{
  "r0": { "value": 0.333333, "tolerance": 0.000001 }
}
```

See
[`tests/simulator/fixtures/basic.sim.json`](../tests/simulator/fixtures/basic.sim.json)
for a runnable example. Scenario steps include blank, comment, and label lines,
matching IC10's physical-line execution model. `sleep` is treated as an
immediate state transition so automated tests do not wait in real time.

## Licensing and dependency note

The emulator source is licensed under AGPL-3.0. Review that license before
redistributing a combined simulator or modifying the dependency. The emulator
is optional development tooling and its exact version is recorded in
`bun.lock`.

Version `0.3.7` imports `json5` without declaring it as a runtime dependency.
This repository pins `json5` directly in `package.json` so a clean install can
load the emulator reliably. It also rejects the valid instruction
`define NAME 0` and stores the `jal` instruction's own line in `ra` instead of
the following line. `tools/ic10_compat.ts` applies narrow, tested compatibility
shims until those upstream behaviors are fixed.

## Limits

Simulation can catch syntax, control-flow, register, stack, and device-I/O
mistakes represented by a scenario. It does not reproduce the entire game:

- atmospheric and thermal physics are not simulated;
- weather, world state, and autonomous entity behavior do not advance;
- device data can lag a Stationeers release;
- hashes and logic availability still need verification against Stationpedia;
- timing-sensitive and safety-critical behavior still needs an in-game test.

Treat passing scenarios as repeatable development evidence, not proof that a
program is safe or correct in Stationeers.
