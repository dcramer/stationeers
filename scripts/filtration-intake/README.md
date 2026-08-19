# Filtration intake

Controls a large powered vent that gathers the Mars atmosphere into an
uninsulated tank without filling the tank close to its pressure limit.

## Connections

| Pin | Alias | Device |
|---|---|---|
| `d0` | `vent` | Powered Vent Large connected to the tank pipe |
| `d1` | `analyzer` | Powered Pipe Analyzer on the same tank pipe network |

The tank has no data port. The Pipe Analyzer is required to measure its pipe
network and must share power and data with the IC housing. The vent's
atmosphere-facing side must be outside and its pipe side must connect to the
tank. Do not connect a lower-pressure portable canister or portable tank to
this network.

## Setup

Load `filtration-intake.ic10` into an IC Housing, assign the vent to `d0`, and
assign the analyzer to `d1`. The script locks the vent, selects inward mode,
and controls its power state.

The constants are in kPa and kelvin:

| Constant | Default | Meaning |
|---|---:|---|
| `MAX_WARM_PRESSURE` | `40000` kPa | Maximum intended pressure at the design temperature |
| `WARM_DESIGN_TEMP` | `373.15` K | Hottest tank temperature accounted for (100 °C) |
| `MIN_FILL_TEMP` | `150` K | Conservative temperature used while an empty network reports 0 K |
| `RESTART_RATIO` | `0.9` | Restart at 90% of the current stop threshold |

The stop threshold is temperature compensated:

`min(MAX_WARM_PRESSURE, MAX_WARM_PRESSURE * tank temperature / WARM_DESIGN_TEMP)`

For example, at 210 K the default stop threshold is about 22.5 MPa. If the
sealed tank then warms to 373.15 K, ideal-gas scaling raises it to about
40 MPa. This preserves substantial headroom below the 60.795 MPa pressure
differential limit of the tank and ordinary gas pipes. Set
`WARM_DESIGN_TEMP` no lower than the hottest temperature the tank can reach.

## Behavior

At startup the vent is forced off before any analyzer read. From the stopped
state, filling begins only when the analyzer is powered, has no error, reports
finite pressure and temperature values, and pressure is below 90% of the
temperature-adjusted limit. Filling continues to the full adjusted limit.
This hysteresis prevents rapid on/off cycling around the cutoff.

During filling, every pass turns the vent off before checking the analyzer and
turns it back on only after all checks pass. Loss of analyzer power, an
analyzer error, or a non-finite reading therefore leaves the vent off. The
loop checks once per game tick.

## Failure handling and limitations

- The script cannot guarantee shutdown if the IC housing itself loses power or
  stops executing after a successful `On 1` write while the vent remains
  powered. Power the IC housing, analyzer, and vent from the same protected
  circuit. For independent overpressure protection, add a relief path such as
  a back-pressure regulator feeding a passive vent.
- The pressure rating is a pressure *difference*. Mars ambient pressure is
  negligible at these defaults, but another installation may need to account
  for its surrounding pressure.
- Raw Mars atmosphere is mostly carbon dioxide. Cooling and compression can
  condense or freeze gases; this controller does not monitor liquid volume or
  pipe phase stress. Inspect the analyzer and provide suitable phase handling
  before raising the defaults.
- The program assumes exactly the two assigned devices and uses no batch
  operations. A missing or incorrectly assigned pin can stop IC execution.
- Logic properties were checked against Stationpedia/community data current
  for the repository's game-data era. Atmospheric and thermal behavior still
  requires an in-game test with the actual pipe layout.

## Register map

| Register | Use |
|---|---|
| `r0` | Tank-network pressure |
| `r1` | Tank-network temperature |
| `r2` | Current pressure threshold |
| `r3` | Analyzer power/error status |
