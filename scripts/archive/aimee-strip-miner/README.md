# Archived AIMeE strip miner

Learning version of the two-IC AIMeE mining system posted by
[KingNyx on Reddit](https://www.reddit.com/r/Stationeers/comments/1r493vl/aimee_strip_mining_script/).
It preserves the simple moving-target idea while correcting its immediately
observable syntax and state-transition bugs. It is archived because it still
lacks the recovery and environmental safety of the main AIMeE controller.

## Hardware and connections

- 2 IC housings, one for `coordinator.ic10` and one for `miner.ic10`
- 1 Logic Transmitter linked to AIMeE
- 1 Lever for persistent manual recall
- 4 Logic Memory devices named `commX`, `commZ`, `dbX`, and `dbZ`
- An unloading chute or bin and a charger at the unloading coordinates
- A shared data network connecting both housings and all four memories

Coordinator housing:

| Pin | Alias | Device |
|---|---|---|
| `d0` | `commX` | Live world-X target memory |
| `d1` | `commZ` | Live world-Z target memory |
| `d2` | `dbX` | Persistent X offset and acknowledgement |
| `d3` | `dbZ` | Persistent Z offset |
| `d4` | — | Unused |
| `d5` | — | Unused |

Miner housing:

| Pin | Alias | Device |
|---|---|---|
| `d0` | `commX` | The same live world-X target memory |
| `d1` | `commZ` | The same live world-Z target memory |
| `d2` | `ackX` | The same `dbX` memory used by the coordinator |
| `d3` | `lever` | Manual-recall Lever |
| `d4` | — | Unused |
| `d5` | `drone` | Logic Transmitter linked to AIMeE |

## Setup

Set `BASE_X` and `BASE_Z` in the coordinator to the base center. Set
`UNLOAD_X`, `UNLOAD_Z`, and `WAIT_Z` in the miner. The waypoint is
`(UNLOAD_X, WAIT_Z)` and should provide a clear approach to the chute.

`SAFE_ZONE` is the first positive X offset from the base, and `STEP` is added
after a target is exhausted. Both must remain positive because the sign of
`dbX` is used by the handshake. `LOW_BATT` recalls AIMeE; `READY_BATT` is the
minimum charge ratio required before departure. `ARRIVE` is the X/Z Manhattan
distance tolerance.

Raise the lever to recall AIMeE during ordinary operation. The miner returns,
unloads, reaches `READY_BATT`, and remains parked until the lever is lowered.
The script reads the Lever's `Setting` property.

To reset the strip, stop both ICs and set `dbX` and `dbZ` to `0`. Start the
coordinator before the miner. The first target is
`(BASE_X + SAFE_ZONE, BASE_Z)`.

## Behavior

The coordinator publishes one target and waits. A positive `dbX` means that
target is active. The miner changes `dbX` to the corresponding negative value
only after AIMeE reports no mineables at the target. The coordinator then
advances X by `STEP`, republishes both coordinates, and makes `dbX` positive.
This sign handshake survives either IC restarting without adding a fifth
memory chip.

Storage-full Mode 6 and low charge return AIMeE through the waypoint without
acknowledging the target, so it resumes the same strip position after unloading.
The miner checks both X and Z at every arrival, holds TargetY at the current
height, reads battery `ChargeRatio` from slot 0, and waits for Mode 4 to finish
and `READY_BATT` to be reached. Manual recall uses the same route but holds at
unload until the lever is lowered. A reported device error stops AIMeE; after
the error clears, the miner attempts the return route again.

Corrections relative to the supplied v6.5 programs include:

- using `ls ... 0 ChargeRatio` instead of the invalid `ld` instruction;
- treating Mode 6 as storage-full rather than error;
- publishing the safe-zone edge as the first target instead of adding `STEP`;
- replacing the ambiguous Mode-0 coordinator handshake with explicit memory
  acknowledgement;
- checking X and Z on the return route and setting TargetY;
- monitoring battery while outbound and mining;
- proving unload-mode completion and departure charge instead of sleeping for
  five seconds.

## Register map

Coordinator: `r0` is handshake scratch, `r1`/`r2` are persistent offsets, and
`r11`/`r12` are published world coordinates.

Miner: `r0` is mode/error scratch, `r2`/`r3` are the active target, `r4` is
mode/mineable/Y scratch, `r5`/`r6`/`r7` calculate arrival distance, `r8` holds
the acknowledgement or lever state, and `r15` holds battery charge ratio.

## Known limitations

- This is an unbounded one-way strip along positive X, not a spiral or bounded
  lawnmower pattern. It will eventually travel arbitrarily far from the base.
- Mode 2 moves in a straight line. There is no stuck detection, pathfinding
  recovery, movement timeout, weather recall, hangar control, or manual stop.
- Any obstruction can leave a navigation wait running forever. A missing or
  ineffective chute/charger can leave the unload wait running forever.
- Resetting `dbX` while the miner is active can lose an acknowledgement.
- Mine completion still depends on AIMeE's version-sensitive Mode and
  `MineablesInVicinity` behavior.
- The scripts were checked against repository game-data version
  `0.2.6367.27532` but still require in-game testing.

## Simulator scenarios

The sibling scenarios verify first-target publication, advancing a persisted
acknowledgement after a coordinator restart, miner acknowledgement when a
target has no mineables, and manual recall selecting the return waypoint. The
emulator does not move, mine, unload, or charge AIMeE autonomously, so route
recovery and physical completion remain untested.
