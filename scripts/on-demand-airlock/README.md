# On-demand airlock

Controls a two-door personnel airlock whose doors remain closed while waiting.
Each door handle prepares and opens its own side instead of cycling to whichever
side is currently closed.

## Connections

| Pin | Alias | Device |
|---|---|---|
| `d0` | `innerDoor` | Door on the protected/interior side |
| `d1` | `outerDoor` | Door on the exterior/vacuum side |
| `d2` | `innerVent` | Vent connected to the interior atmosphere pipe |
| `d3` | `outerVent` | Vent connected to the exterior atmosphere pipe |
| `d4` | `sensor` | Gas Sensor inside the chamber |
| `d5` | — | Unused |

The housing and all five assigned devices must share a data network. Keep the
interior and exterior vent pipe networks separate. Each normally terminates at
a Passive Vent in its corresponding atmosphere.

## Setup

Configure these constants near the top of `on-demand-airlock.ic10`:

| Constant | Default | Meaning |
|---|---:|---|
| `INNER_PRESSURE` | `0.1` kPa | Optional target before opening the inner door |
| `OUTER_PRESSURE` | `0.1` kPa | Optional target before opening the outer door |
| `VACUUM_PRESSURE` | `0.1` kPa | Evacuation completion threshold for either side |
| `PRESSURE_TOLERANCE` | `1` kPa | Allowed shortfall from a nonzero fill target |
| `OPEN_LIMIT` | `10` loops | How long a requested door remains open |
| `WAIT_LIMIT` | `600` loops | Door-closing and pressure timeout |

A side target at or below `VACUUM_PRESSURE` skips filling. For a higher target,
keep `PRESSURE_TOLERANCE` smaller than the difference between the target and
`VACUUM_PRESSURE`.

Use doors that expose `Mode`, `Setting`, `Open`, and `Lock`. Logic mode makes
their handles change `Setting` instead of moving the doors directly. Active
Vents and Powered Vents expose the properties used here, but independently
protect Powered Vent pipe networks from overpressure.

## Behavior

At startup the controller turns both vents off, switches both doors to Logic
mode, closes them, verifies closure, and waits with both doors closed. It does
not change the chamber atmosphere until a handle is pressed.

Pressing either handle locks and verifies both doors closed, evacuates the
chamber, optionally fills it to that side's configured pressure, turns the vents
off, and opens the requested door. With the default `0.1`/`0.1` targets, both sides
open after evacuation without a fill phase. The current door closes immediately
if its handle is pressed again. Pressing the opposite handle closes the current
door and begins a cycle to the requested side. Otherwise, the open door closes
after `OPEN_LIMIT` completed yield loops.

After a side has opened, evacuation returns chamber gas through that side's
vent network on the next cycle. On a cold start the chamber contents are
unknown, so the first cycle purges through the exterior vent. Vents are only
enabled after both doors report closed. The program turns a running vent off
before starting the other vent or opening a door.

Evacuation commands the active vent toward `0` kPa but completes at
`VACUUM_PRESSURE`, avoiding an exact boundary between the vent's external safety
cutoff and the Gas Sensor comparison. The open-door timer begins only after the
requested door reports open.

If a door cannot close or the requested pressure cannot be reached before
`WAIT_LIMIT`, the controller turns both vents off, closes and locks both doors,
and remains faulted. Correct the obstruction, gas supply, receiving pipe, power,
or configuration and restart the program.

## Register map

| Register | Use |
|---|---|
| `r0` | Wait-loop counter |
| `r1` | Pressure, comparison, or door state |
| `r2` | Requested side (`0` inner, `1` outer) |
| `r3` | Last prepared side; `-1` means unknown after startup |
| `r4`–`r6` | Requested door, opposite door, and evacuation vent pin numbers |
| `r7` | Pressure threshold |
| `r8` | Pressure comparison direction |
| `r9` | Comparison or door-state scratch value |
| `ra` | Return address for non-nested wait routines |

## Known limitations

- Adjacent-room pressures are fixed configuration targets rather than sensor
  readings. A target at or below `VACUUM_PRESSURE` skips that side's fill phase.
- `OPEN_LIMIT` and `WAIT_LIMIT` count completed yield loops, not wall-clock
  seconds. Tune the open interval in game.
- Door opening is not timed as a fault. A door that never reports open leaves
  the controller waiting safely with both vents off.
- The controller has no occupancy sensor. A slow user can press the handle again
  if the door closes before they pass through.
- An unlocked Logic-mode door accepts handle requests but remains vulnerable to
  manual crowbar operation.
- Runtime validation cannot reproduce atmospheric flow, door motion, or power
  loss. Verify both directions, restart recovery, inadequate gas, and full
  receiving pipes in game before relying on the airlock without a suit.
- Properties and vent behavior were checked against Stationpedia game data
  version `0.2.6367.27532`. Powered Vent overpressure protection remains an
  installation responsibility.
