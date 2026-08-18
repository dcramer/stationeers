# AIMeE miner

Automates an AIMeE mining cycle with unloading, charging, stuck recovery, weather recall, hangar control, and status displays. The original supplied script is preserved in git commit `4e95b0a`; the working version is based on [Aimee V3.6](https://steamcommunity.com/sharedfiles/filedetails/?id=3781550064) by ᴵᴬᴳChurchill.

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
2. On initial/full-cargo cycles, navigate through the waypoint to the unload position. After a recall, go directly to unload because Home and Unload are the same location.
3. Select Mode 4 and wait until slot-0 charge is at least 70,000 and the AIMeE leaves Mode 4.
4. Navigate through the waypoint to the mine position.
5. If mineables are present, select Mode 3 and keep mining.
6. When mining ends in Mode 6, restart the route and return to unload. If no mineables remain, recall home instead.
7. A raised lever or dangerous weather recalls the AIMeE through the waypoint to Home, powers it down, and closes the hangar.
8. Wait for weather Mode 0, lower the lever, then restart directly at unload. The next outbound waypoint is not entered until Mode 4 has completed.

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

`recall` is a deliberate non-returning control-flow boundary. It resets `sp` before starting its own navigation calls so that a recall originating inside `nav` cannot leave an abandoned return address on the stack.

## Register map

| Register | Use |
|---|---|
| `r0` | General scratch value and comparisons |
| `r1` | AIMeE mode for the display |
| `r2` | Slot-0 battery charge |
| `r3` | Consecutive low-velocity counter |
| `r4` | Navigation target X |
| `r5` | Navigation target Z |
| `r6` | Recall-in-progress and restart-at-unload flag |
| `r7` | Lever state |
| `r8` | Weather mode |
| `ra` | Subroutine return address; preserved by `nav` with `push`/`pop` |

## Debugging history and observations

Changes after the original import:

- Removed the `snan` immediately after the normal weather-time load. The raw countdown now reaches the `STORMTIME` comparison instead of being replaced by `0` or `1`.
- A post-recall restart branches directly to the existing unload/charge block. AIMeE cannot enter the outbound waypoint until Mode 4 completes and charge reaches the configured threshold.
- `recall` resets `sp` because it intentionally abandons any active caller instead of returning through it.
- The housing displays the raw weather countdown while parked instead of converting it to a NaN flag.

Known assumptions and edge behavior:

- Exactly one connected Weather Station is required. The reads use batch mode `Sum`; zero stations looks like clear weather, while multiple stations sum their modes and times into values this state machine does not support.
- Emptying is inferred from AIMeE leaving Mode 4; the script does not inspect all eight ore slots separately. It also keeps waiting until slot-0 charge reaches 70,000. This is the intended AIMeE mode contract, but the physical unload area still has to be functional.
- A manual lever recall during clear weather closes the hangar, then lowers the lever and starts again on the next clear-state pass. It is a recall trigger, not a persistent off switch.
- `r3` can carry a small low-velocity count from one navigation leg into the next. Normal movement immediately resets it; with the configured non-identical route legs this does not change behavior.

## Simulator scenarios

Run `./sim aimee-miner` from the repository root. The sibling scenarios cover:

- a safe Mode-1 forecast at 700 seconds, which preserves the raw countdown and continues navigation;
- a dangerous Mode-1 forecast at 500 seconds, which raises the recall lever and clears the abandoned navigation stack frame;
- a post-recall restart that remains at Unload while Mode 4 or the charge threshold is incomplete;
- a completed unload with 70,000 charge, after which the next target is the outbound waypoint.

The scenarios use scheduled external changes to represent AIMeE arriving and completing Mode 4. The emulator does not advance robot movement, unloading, charging, or weather autonomously, so in-game testing is still required for those physical behaviors.
