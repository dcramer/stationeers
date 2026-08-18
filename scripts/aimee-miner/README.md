# AIMeE miner

Automates an AIMeE mining cycle with unloading, charging, stuck recovery, weather recall, hangar control, and status displays. This copy is stored unchanged from the supplied script and is based on [Aimee V3.6](https://steamcommunity.com/sharedfiles/filedetails/?id=3781550064) by ᴵᴬᴳChurchill.

## Hardware

- 1 IC housing and programmable chip
- 1 AIMeE with a battery in slot 0
- 1 Logic Transmitter configured active and linked to the AIMeE
- 1 Weather Station
- 4 displays for X, Z, AIMeE mode, and battery charge
- 1 lever used as both manual recall and storm-state latch
- 1 or more hangar doors
- A shared power/data network connecting all of the above

The source guide recommends the **AIMeE Bug Fixes** workshop item but says the script can operate without it. It also recommends a blank IC in the AIMeE for easy manual override.

## Pin configuration

| Pin | Alias | Device |
|---|---|---|
| `d0` | `Transmitter` | Logic Transmitter linked to the AIMeE |
| `d1` | `dispX` | Current X-coordinate display |
| `d2` | `dispZ` | Current Z-coordinate display |
| `d3` | `dispM` | AIMeE mode display |
| `d4` | `dispC` | Battery charge display |
| `d5` | `lever` | Recall/storm lever |

Use the IC housing screws to assign these devices in exactly this order. The script sets the charge display to mode 2 and color 5; it writes current values to all four displays.

## Coordinates

Coordinates are X/Z only. During navigation, `update` continuously sets `TargetY` to the AIMeE's current Y position.

| Zone | X | Z | Purpose |
|---|---:|---:|---|
| Waypoint | 290 | -200 | Staging point used for both outbound and return travel |
| Unload | 303 | -229 | Unloading and charging position |
| Mine | 260 | -200 | Mining destination |
| Home | 303 | -229 | Storm/manual-recall parking position |

Edit the eight coordinate constants at the top of the script for the local base. The current Home and Unload coordinates are identical. Give multiple AIMeEs separate coordinates and hangars so they do not block each other.

## Network hashes and thresholds

| Constant | Value | Use |
|---|---:|---|
| `WEATHER` | 1997212478 | Weather Station prefab hash used by batch loads |
| `HANGARDOORHASH` | -566348148 | Hangar-door prefab hash used by batch writes |
| `STORMTIME` | 600 | Intended early-recall weather threshold |
| Charge threshold | 70000 | Minimum slot-0 charge before leaving unload mode |

The batch operations affect every matching hangar door on the IC output network. The weather reads use `Sum`, so the setup assumes a single matching Weather Station.

## Operating cycle

1. Open all matching hangar doors and turn on the transmitter/AIMeE.
2. Navigate through the waypoint to the unload position.
3. Select Mode 4 and wait until slot-0 charge is at least 70,000 and the AIMeE leaves Mode 4.
4. Navigate through the waypoint to the mine position.
5. If mineables are present, select Mode 3 and keep mining.
6. When mining ends in Mode 6, restart the route and return to unload. If no mineables remain, recall home instead.
7. A raised lever or dangerous weather recalls the AIMeE through the waypoint to Home, powers it down, and closes the hangar.
8. Wait for weather Mode 0, lower the lever, then restart the complete cycle.

The script treats AIMeE modes as follows:

| Mode | Meaning assumed by the script |
|---:|---|
| 0 | Parked/stopped |
| 2 | Navigate to target |
| 3 | Mine |
| 4 | Unload/charge |
| 5 | Pathfinding/stuck recovery |
| 6 | Mining cycle complete/full |

## Navigation and stuck recovery

`nav` places the caller's return address on the stack because it calls `update` itself. While Mode 2 is active, it counts consecutive updates where velocity is below `0.2`. After more than 20, it selects Mode 5, waits, sleeps for 10 seconds, returns to Mode 2, and resets the counter. Normal movement also resets the counter to zero.

## Register map

| Register | Use |
|---|---|
| `r0` | General scratch value and comparisons |
| `r1` | AIMeE mode for the display |
| `r2` | Slot-0 battery charge |
| `r3` | Consecutive low-velocity counter |
| `r4` | Navigation target X |
| `r5` | Navigation target Z |
| `r6` | Recall-in-progress flag |
| `r7` | Lever state |
| `r8` | Weather mode |
| `ra` | Subroutine return address; preserved by `nav` with `push`/`pop` |

## Debugging observations

No code has been changed, but two details are important for the next debugging pass:

- `update` loads `NextWeatherEventTime` into `r0`, then immediately runs `snan r0 r0`. This replaces the time with a Boolean NaN test (`0` or `1`) before comparing it with `STORMTIME` (600) and before displaying it on `db.Setting`.
- The low-velocity counter `r3` is not explicitly reset when entering `nav`. It resets when velocity reaches `0.2` or after the Mode 5 recovery path.

