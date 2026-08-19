# Safe airlock

Controls one two-door airlock from a dedicated IC Housing. The same program can
be installed in any number of housings on the same data network because it uses
only assigned pins, not batch device operations.

## Connections

| Pin | Alias | Device |
|---|---|---|
| `d0` | `innerDoor` | Door on the protected/interior side |
| `d1` | `outerDoor` | Door on the exterior/other-atmosphere side |
| `d2` | `innerVent` | Vent connected to the interior atmosphere pipe |
| `d3` | `outerVent` | Vent connected to the exterior atmosphere pipe |
| `d4` | `sensor` | Gas Sensor inside the chamber |
| `d5` | — | Unused |

The housing and all five assigned devices must share a data network. Device
names are optional and are used only to make the housing screws easier to
configure.

## Setup

Keep each personnel chamber to one large grid when practical. Connect each vent
to the atmosphere for its side, normally through a pipe ending at a Passive
Vent. The pipe must have enough capacity to accept the chamber gas. Do not join
the interior and exterior pipe networks.

Configure these constants near the top of `safe-airlock.ic10`:

| Constant | Default | Meaning |
|---|---:|---|
| `INNER_PRESSURE` | `100` kPa | Pressure required before opening inward |
| `OUTER_PRESSURE` | `0` kPa | Pressure required before opening outward |
| `VACUUM_PRESSURE` | `0.1` kPa | Evacuation completion threshold |
| `PRESSURE_TOLERANCE` | `1` kPa | How far below a fill target opening is allowed |
| `WAIT_LIMIT` | `600` loops | Maximum wait at a door or pressure postcondition |

For a vacuum or low-pressure exterior, leave `OUTER_PRESSURE` at zero to skip
exterior filling. For an atmosphere-to-atmosphere airlock, set it to the target
exterior pressure. These are fixed targets; the program does not measure either
adjoining room.

Use doors that expose `Mode`, `Setting`, `Open`, and `Lock`. Their handles are
the cycle controls: Logic mode makes a handle write `Setting` instead of moving
the door directly. Active Vents and Powered Vents expose the vent properties
used here, but Powered Vents have no internal pipe-pressure limiter. Independently
protect any Powered Vent pipe network from overpressure.

The IC Housing `Setting` reports controller state:

| Value | State |
|---:|---|
| `0` | Open to interior |
| `1` | Open to exterior |
| `2` | Sealing or changing atmosphere |
| `-1` | Runtime timeout; restart after correcting the cause |
| `-2` | One or more required housing pins are unset |

## Behavior

On every program load, the controller turns both vents off, switches both doors
to Logic mode, locks and closes them, and waits until they report closed. It
treats the chamber atmosphere as untrusted: the exterior vent evacuates it to
`VACUUM_PRESSURE`, then the interior vent fills to `INNER_PRESSURE`, and only
then does the interior door open. This deterministic recovery can discard clean
gas after a restart but does not send unknown chamber gas into the protected
interior pipe.

While idle, both doors are in Logic mode and unlocked so either closed door's
handle can register a request. The open door remains open. A cycle locks and
closes both doors, verifies closure, evacuates through the vent for the current
side, optionally fills from the destination side, turns both vents off, and
opens the destination door. Every wait loop yields.

If a door does not reach its commanded state or pressure does not reach its
postcondition before `WAIT_LIMIT`, the controller turns both vents off, closes
and locks both doors, and remains faulted. Correct the gas supply, pipe capacity,
power, door obstruction, or configuration, then restart the program. A device
that becomes disconnected while operating can still cause a game runtime error
before the scripted timeout runs.

## Register map

| Register | Use |
|---|---|
| `r0` | Wait-loop counter |
| `r1` | Pressure or door state |
| `r2` | Destination pressure |
| `r3` | Destination side (`0` interior, `1` exterior) |
| `r4`–`r7` | Source vent, destination vent, destination door, and request door pin numbers |
| `r8` | Temporary value or fill threshold |
| `ra` | Return address for non-nested wait routines |

## Known limitations

- Adjacent-room pressures are configuration constants rather than sensor reads.
- Only one chamber sensor is supported; use a dedicated controller design for a
  multi-grid chamber with possible pressure pockets.
- The pressure timeout counts completed yield loops, not real-time seconds.
- Manual crowbar operation remains possible while idle because Logic-mode doors
  must be unlocked for their handles to change `Setting`.
- Runtime validation cannot reproduce atmospheric flow, door motion, or power
  loss. Verify both directions, restart recovery, insufficient gas, and full
  receiving pipes in game before relying on the airlock without a suit.
- Properties and vent behavior were checked against Stationpedia game data
  version `0.2.6367.27532`. Powered Vent overpressure handling remains an
  installation responsibility.
