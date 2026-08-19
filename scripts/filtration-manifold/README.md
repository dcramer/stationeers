# Filtration manifold

Turns each gas Filtration unit on only when its gas is available and its
product tank has room. It does not control pumps, valves, or pressure relief.

## Pipe layout

Use parallel branches from one common input manifold:

```text
raw gas -> common input manifold -> filtration inputs
                                      | | | | | | |
filtered outputs -----------------> dedicated product tanks
unfiltered outputs ---------------> shared return/waste pipe
```

The physical filter order does not matter. Do not pipe one unit's unfiltered
output directly into the next unit's input; turning off one unit would obstruct
the units after it.

## Connections and names

The external IC Housing uses named batch I/O and needs no screw assignments.
Put one Pipe Analyzer on the common input manifold and name it `Filter Input`.

For every stage, give its Filtration unit and product-tank Pipe Analyzer the
same exact name:

| Name | Cartridge |
|---|---|
| `Nitrous Oxide` | Nitrous Oxide |
| `Oxygen` | Oxygen |
| `Hydrogen` | Hydrogen |
| `Methane` | Methane |
| `Pollutant` | Pollutant |
| `Nitrogen` | Nitrogen |
| `Carbon Dioxide` | Carbon Dioxide |

Install a matching cartridge in either filter slot. Do not use two different
cartridge types in one unit because they would share a product output.

The feed pump, return pump, and any product pumps or one-way valves are manual
plumbing. Leave them configured independently; this IC only switches the
Filtration units.

## Thresholds

Pressures are in kPa:

| Constant | Default | Meaning |
|---|---:|---|
| `PARTIAL_START` | 50 | Start when the target gas partial pressure reaches 50 kPa |
| `PARTIAL_STOP` | 20 | Stop when it falls below 20 kPa |
| `PRODUCT_START` | 15000 | A stopped unit may restart below 15 MPa |
| `PRODUCT_STOP` | 30000 | Stop a running unit at 30 MPa |
| `MIN_FILTER_LIFE` | 5 | Stop when neither cartridge has more than 5% life |

Partial pressure is input pressure multiplied by the gas ratio. The paired
thresholds prevent rapid switching.

## Overflow valve

The overflow does not need IC control. Branch a Back Pressure Regulator from
the common input manifold to a low-pressure dump tank or an outdoor passive
vent. Point its input toward the manifold, set it above the manifold's normal
operating pressure, switch it on, and leave it powered. For example, use
5500 kPa if the feed system normally stays at or below 5000 kPa.

The Back Pressure Regulator requires power and has limited flow, so do not size
the feed system on the assumption that it can handle continuous excess input.

## Behavior and limitations

Once per pass, the script reads the common input pressure and gas ratios. Each
stage runs only while its gas partial pressure is high enough, its product
pressure is low enough, and at least one cartridge has more than 5% life.
Missing analyzers or cartridges cause the affected stage to remain off through
the batch-read comparison behavior.

Named operations affect every matching device on the IC Housing's data
network. Use one Filtration unit and one product Pipe Analyzer per documented
name. This controller does not handle gas temperature, combustion, phase
changes, pump pressure, or mixed-air demand; those remain separate systems.

Device properties and hashes target repository game data `0.2.6367.27532` and
still require an in-game commissioning check.

## Register map

| Register | Use |
|---|---|
| `r0` | Current gas ratio |
| `r1` | Current stage name hash |
| `r2`-`r9` | Stage state, thresholds, and scratch values |
| `r13` | Common input pressure |
| `ra` | `control` return address |
