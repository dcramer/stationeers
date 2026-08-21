# AIMeE spiral miner

Three-IC controller for one AIMeE. It generates a bounded square spiral,
continues mining each target until it is exhausted, unloads and charges without
losing the active target, recalls for weather or a persistent manual lever, and
only closes the named hangar after the miner reports that AIMeE is parked.

The design adapts the moving-target idea from
[KingNyx's v6.5 scripts](https://www.reddit.com/r/Stationeers/comments/1r493vl/aimee_strip_mining_script/)
and the repository's [single-target AIMeE controller](../aimee-miner/README.md).
It deliberately controls one bot; there is no fleet scheduling.

## Program responsibilities

| Program | Responsibility |
|---|---|
| `coordinator.ic10` | Persist the spiral index, publish one target at a time, optionally skip a rectangular exclusion zone, and latch completion |
| `miner.ic10` | Drive the single AIMeE, mine, acknowledge exhausted targets, return, unload, charge, and recover from stalls/errors |
| `supervisor.ic10` | Own weather/manual recall, the named hangar door, safe startup, and optional named displays |

The separation is intentional. The coordinator never operates a door, the
supervisor never advances the spiral, and only the miner writes parked status.

## Hardware

- 3 IC housings, one per program
- 1 AIMeE with a battery in slot 0
- 1 powered and switched-on Logic Transmitter in Passive mode, linked to that
  AIMeE
- 1 powered Weather Station
- 1 Lever named exactly `AIMeE Recall`
- 1 optional Logic Button named exactly `AIMeE Reset`
- 3 Hangar Doors of any size named exactly `AIMeE Hangar`
- 5 Logic Memory devices shared by all three housings
- An unloading chute or bin and a charger at the unload position
- Optional small LED displays listed below
- One shared power/data network for all base devices

The miner and supervisor both assign the same Logic Transmitter to `d5`. The
coordinator does not use `d5`. Suggested memory labels are `Spiral X`,
`Spiral Z`, `Spiral Job`, `Spiral Command`, and `Spiral Status`; pin assignment,
not the labels, establishes their roles.

## Pin configuration

All three housings use the same five memory assignments:

| Pin | Alias | Device |
|---|---|---|
| `d0` | `commX` | Live world-X target memory |
| `d1` | `commZ` | Live world-Z target memory |
| `d2` | `job` | Persistent spiral index and target acknowledgement |
| `d3` | `command` | Run, recall, or complete command memory |
| `d4` | `status` | Active or safely parked status memory |

| Housing | `d5` |
|---|---|
| Coordinator | Unassigned |
| Miner | Logic Transmitter linked to the one AIMeE |
| Supervisor | The same Logic Transmitter |

The recall lever is found by prefab and exact name rather than by a screw. A
missing named lever or missing Weather Station is treated as unsafe and keeps
AIMeE recalled.

### Wiring and naming checklist

1. Connect the three IC housings, five memories, Logic Transmitter, Weather
   Station, recall Lever, reset button, hangar sections, and any displays to the
   same base power/data network.
2. Assign the same five memories to `d0` through `d4` on every housing using the
   table above. Memory names do not affect the scripts.
3. Leave coordinator `d5` unassigned. Put one powered Logic Transmitter in
   **Passive** mode and switch it on. Use its device-selection screw to select
   the one powered AIMeE, then assign that same transmitter to miner `d5` and
   supervisor `d5`. The Logic Transmitter itself does not require a particular
   name. Active mode is not used: it broadcasts the transmitter's own `Setting`
   and does not provide the AIMeE selection list.
4. Name the Lever exactly `AIMeE Recall`. It is discovered by type and name and
   is not assigned to an IC pin.
5. For push-button reset, name a Logic Button exactly `AIMeE Reset`. It is
   discovered by type and name and is not assigned to an IC pin. A missing
   reset button is harmless.
6. Name every controlled Small, Medium, or Large Hangar Door section exactly
   `AIMeE Hangar`.
   Hangar sections are discovered by type and name and are not assigned to pins.
7. Leave the Weather Station name unchanged; it is discovered by prefab type
   and is not assigned to a pin. Keep it powered and on the shared network.
8. If displays are installed, use the exact case-sensitive names in the
   Optional displays table. Displays are network devices, not pin assignments.

No IC housing, Logic Memory, Weather Station, or Logic Transmitter name is
required by the code. Only `AIMeE Recall`, `AIMeE Reset`, `AIMeE Hangar`, and
the optional display names are hashed by name.

## Coordinates and thresholds

Coordinator defaults:

| Constant | Default | Meaning |
|---|---:|---|
| `BASE_X` | 442 | Spiral center X, due east of the hangar |
| `BASE_Z` | -221 | Spiral center Z, aligned with the approach |
| `SAFE_ZONE` | 25 | First complete square ring's distance from center |
| `STEP` | 5 | Grid spacing between mining targets |
| `MAX_RANGE` | 120 | Maximum circular distance from center |
| `USE_EXCLUSION` | 1 | Enables the rectangular exclusion zone |
| `EXCLUDE_X_MIN` | 270 | Inclusive exclusion minimum X |
| `EXCLUDE_X_MAX` | 328 | Inclusive exclusion maximum X |
| `EXCLUDE_Z_MIN` | -430 | Inclusive exclusion minimum Z, including the intended safety margin |
| `EXCLUDE_Z_MAX` | -214 | Inclusive exclusion maximum Z |

The exclusion rectangle is enabled. Any target whose world X and Z are both
inside the inclusive bounds is skipped. This filters mining targets only; it
does not alter AIMeE's route between the mining field and hangar.

The supplied exclusion bounds already include the intended AIMeE roaming
margin. In particular, the southern safety boundary is Z -430. The coordinator
uses the bounds directly and does not add another automatic margin.

The mining center `(442, -221)` lies 140 meters due east of the unload point
`(302, -221)`. The waypoint `(322, -221)` is 20 meters east of unload, so the
final approach travels due west. With `MAX_RANGE` 120, generated targets extend
from X 322 through X 562 and never cross the waypoint line toward the base.
AIMeE can roam about 15 meters from a target. The exclusion rectangle removes
generated targets that overlap the mapped base boundary; it does not constrain
travel between targets. The farthest target is about 260 meters from the chute.

### Area map and layout history

Coordinates use north as increasing Z and east as increasing X. This schematic
is not to scale:

```text
                              north (+Z)
                                  ^
                                  |
 west (-X) <---- unload ----------+---------- waypoint ---- mining center ----> east (+X)
                (302,-221)                  (322,-221)       (442,-221)
                                  |
                                  v
                              south (-Z)

 Base exclusion: X 270..328, Z -430..-214
 Mining circle:  center (442,-221), radius 120; generated X 322..562
 Return route:   mining field -> waypoint -> unload
 Departure:      unload -> waypoint -> active mining target
```

Keep this history when tuning coordinates so each push has a known reference:

| Layout | Spiral center | Waypoint | Unload | Approach |
|---|---|---|---|---|
| Original north | `(303, -120)` | `(303, -190)` | `(303, -228)` | Southbound |
| West push | `(162, -221)` | `(282, -221)` | `(302, -221)` | Eastbound |
| East push (active) | `(442, -221)` | `(322, -221)` | `(302, -221)` | Westbound |

Miner defaults:

| Constant | Default | Meaning |
|---|---:|---|
| `WAYPOINT_X` | 322 | Clear hangar-entry point X |
| `WAYPOINT_Z` | -221 | Clear hangar-entry point Z |
| `UNLOAD_X` | 302 | Intake chute/charger X |
| `UNLOAD_Z` | -221 | Intake chute/charger Z |
| `LOW_BATT` | 0.5 | Charge ratio that triggers return |
| `READY_BATT` | 0.7 | Charge ratio required before release |

The waypoint `(322, -221)` is aligned with the intake chute at `(302, -221)`.
Confirm that it is outside the hangar and that the straight 20-meter westbound
X approach is unobstructed before running unattended. Navigation uses an X/Z
target and waits for AIMeE to leave Mode 2 naturally before starting the next
operation. More than 20 consecutive updates below velocity 0.2 trigger Mode 5
for ten seconds.

Supervisor defaults:

| Constant | Default | Meaning |
|---|---:|---|
| `STORMTIME` | 600 | Recall when a Mode-1 forecast is closer than this many seconds |
| `WEATHER` | 1997212478 | `StructureWeatherStation` prefab hash |
| `HANGAR_SMALL` | 1736080881 | `StructureAirlockGate` Small Hangar Door prefab hash |
| `HANGAR_MEDIUM` | -566348148 | `StructureMediumHangerDoor` prefab hash |
| `HANGAR_LARGE` | -1351081801 | `StructureLargeHangerDoor` prefab hash |
| `SWITCH` | 1220484876 | `StructureLogicSwitch` Lever prefab hash |
| `BUTTON` | 491845673 | `StructureLogicButton` prefab hash |
| `LED` | -815193061 | `StructureConsoleLED5` small LED display hash |

The named hangar routines affect every Small, Medium, and Large Hangar Door
named `AIMeE Hangar` on the supervisor's output network. Each size needs its own
prefab batch write, but each write scales to any number of matching doors. Name
each section that must move together; do not reuse that name on unrelated doors.

## Optional displays

The supervisor updates any connected small LED displays with these exact names.
Missing displays are harmless.

| Device name | Value |
|---|---|
| `AIMeE X` | Current world X |
| `AIMeE Z` | Current world Z |
| `AIMeE Mode` | Robot mode; the same value is also written to display color |
| `AIMeE Charge` | Slot-0 charge ratio scaled to 0-100 |
| `AIMeE Target X` | Published target X |
| `AIMeE Target Z` | Published target Z |
| `AIMeE Job` | Signed spiral job index |
| `AIMeE Command` | Command protocol value |
| `AIMeE Status` | Miner status value |
| `AIMeE Storm ETA` | Earliest connected Weather Station countdown |

Names are case-sensitive because IC10 hashes the exact text. The supervisor
forces the X, Z, Mode, and Charge displays to Normal mode (`Mode 0`); configure
the other optional displays as Normal when installing them. It also changes the
`AIMeE Mode` display's color to the current robot-mode value.

## Communication protocol

Command memory:

| Value | Meaning | Writer |
|---:|---|---|
| 0 | Hangar open; run or resume the active target | Supervisor |
| 1 | Recall, unload, charge, and hold | Supervisor |
| 2 | Spiral complete; recall and remain parked | Coordinator, then preserved by supervisor |

Status memory is written only by the miner: 0 means active/not yet proven safe,
and 1 means AIMeE arrived at unload, left Mode 4, and reached `READY_BATT`. The
supervisor closes the hangar only after reading status 1.

Job memory is positive while a target is active. The miner writes the same
index negative only when `MineablesInVicinity` reaches zero. Storage full, low
battery, device error, weather, and manual recall leave the positive job intact,
so the same target resumes after recovery. The coordinator writes X and Z
before publishing the next positive index.

## Startup, operation, and reset

For a new installation, set all five memories to 0, then start the programs in
this order:

1. Supervisor: opens the hangar, writes recall, and waits for parked status.
2. Miner: returns through the waypoint, unloads, charges, and reports parked.
3. Coordinator: waits while recall is active, then publishes the first target.

Once the lever is down and weather is safe, the supervisor opens the hangar
before writing command 0. The miner clears parked status, navigates through the
waypoint, and then resumes the active mining target. On every supervisor restart
it performs the same recall-and-park proof instead of assuming AIMeE's location.

For manual shutdown, raise `AIMeE Recall` and leave it raised. The bot returns,
unloads, charges, the door closes, and the system remains parked. Lowering the
lever reopens the door and resumes the unacknowledged target.

Pressing `AIMeE Reset` writes recall before clearing the job memory. The
supervisor keeps the hangar open until AIMeE returns, unloads, charges, and
reports parked. When weather and the recall lever are safe, it restarts the
spiral at the first target. The reset button also clears a latched command-2
completion. Multiple named reset buttons are supported; any press requests the
same reset sequence.

At `MAX_RANGE`, the coordinator writes command 2. After parking, the supervisor
closes the hangar and all three programs hold. Press `AIMeE Reset` for the safe
reset sequence. Without a reset button, set the job memory to 0 first, then set
command memory to 0; the supervisor performs another safe recall cycle and the
coordinator starts at the first ring.

## Mining and recovery

The miner refreshes `TargetY` to AIMeE's current height throughout every route.
After unloading and charging, it leaves the hangar through the waypoint before
resuming the active target. At a target it repeats Mode 3 whenever mining stops
while mineables still exist. Mode 6 or low battery returns through the waypoint,
unloads, charges, and resumes the same target. An error selects Mode 0; after the
error clears the miner attempts the return route.

Ordinary navigation checks command, battery, error, Mode-2 completion, and
velocity.
Return navigation suppresses command and battery checks so recall cannot recurse,
but still checks device errors. Mode-5 recovery sleeps for ten seconds before
retrying Mode 2.

## Weather and fail-safe behavior

The supervisor reads Weather Station mode using `Average` so an empty batch is
NaN and therefore unsafe. Multiple stations are supported only when their
modes agree; mixed modes average to a nonstandard value and are treated as
unsafe. During an agreed Mode-1 forecast, the earliest countdown is read with
`Minimum`. Mode 2, a close forecast, a raised lever, a missing lever, or a
missing station all request recall.

The hangar remains open while AIMeE is returning. It closes only after the miner
has completed unloading and charging. A command-2 completion cannot be cleared
by weather becoming safe or by lowering the lever.

## Register map

Coordinator: `r0` is command/job scratch, `r1` is the signed job index,
`r2` is the ring, `r3`/`r6`/`r7`/`r8`/`r9` calculate the spiral, `r4`/`r5` are
relative coordinates, and `r11`/`r12` are world coordinates.

Miner: `r0` is mode/error/command scratch, `r2`/`r3` are the route target,
`r4` is mineable/Y scratch, `r7` is the stuck counter, `r8` is the job index,
`r10` distinguishes outbound from return, `r15` is charge ratio, and `ra` holds
the navigation return address.

Supervisor: `r0` is device/display data and the danger result, `r1` is the NaN
test, and `ra` is used by the non-nested `danger` and `displays` calls.

## Known limitations

- The setup has static and emulator validation but no in-game verification yet.
- The ten-second Mode-5 sleep delays a new recall until the sleep finishes.
- Skipping out-of-range or excluded points performs one skip per tick, so safety
  response is handled by the independent supervisor rather than the coordinator.
- AIMeE's Mode-2-to-0 completion transition still depends on terrain and the
  current game runtime.
- Mode-4 completion is the unload postcondition; individual ore slots are not
  inspected.
- A missing or ineffective chute/charger can hold the miner at unload forever.
- The Weather Station and named lever are intentionally required fail-safe
  inputs. This setup is unsuitable for a world with no weather device unless the
  supervisor's `danger` routine is deliberately changed.
- Device properties and hashes target repository game-data version
  `0.2.6367.27532`; the AIMeE mode and slot contract was cross-checked against
  Stationpedia in August 2026.

## Simulator scenarios

Sibling scenarios cover first/next target publication, exclusion-zone skipping,
command holds, range completion, Mode-2 completion waits, the post-park outbound
waypoint, mining continuation, target acknowledgement, miner recall, safe
supervisor startup, manual and weather recall with post-park door closure, reset
from latched completion, named display output, and completion hold. The emulator
does not move, mine, unload, charge, or advance weather autonomously, so those
transitions still require in-game testing.
