# Room controller

Turns a named group of room lights on while a named Occupancy Sensor detects a
player, with an optional persistent off switch.

## Connections

No IC Housing pins are used. The IC Housing, sensor, and lights must share a
data network.

## Setup

1. Place an Occupancy Sensor inside a completed room.
2. Name the sensor and every light controlled by this IC exactly `Room`.
3. Connect the sensor, lights, and IC Housing to the same power/data network.
4. If needed, change `ROOM_NAME` near the top of `room-controller.ic10`. Device
   names are case-sensitive.

Optionally add a Lever (`StructureLogicSwitch`) named exactly `Lights`. Change
`LIGHTS_SWITCH_NAME` if another name is preferred. Turn the lever on to allow
occupancy control. Turn it off to force the lights off until it is turned on
again. The lever is found by type and name and does not use an IC pin.

The controller supports these light prefabs:

| Stationpedia title | Prefab |
|---|---|
| Wall Light (Long) | `StructureLightLong` |
| Wall Light (Long Angled) | `StructureLightLongAngled` |
| Wall Light (Long Wide) | `StructureLightLongWide` |
| Light Round | `StructureLightRound` |
| Light Round (Angled) | `StructureLightRoundAngled` |
| Light Round (Small) | `StructureLightRoundSmall` |
| Wall Light | `StructureWallLight` |
| Wall Light (Battery) | `StructureWallLightBattery` |

Other light types need their prefab hash added as another named `sbn` write.
Unmatched light types are left unchanged.

## Behavior

Each tick, the controller reads `Activate` from every Occupancy Sensor named
`Room`. It also reads `Open` from the optional Lever named `Lights`. It writes
`On = 1` to every supported light with the room name only when the room is
occupied and the lever is on. Turning the lever off is persistent because each
update continues to write `On = 0`; turning it on restores automatic occupancy
behavior rather than forcing the lights on.

If no named lever exists, occupancy controls the lights directly. If multiple
matching levers exist, every lever must be on; use a unique switch name to avoid
accidentally including another room's lever.

The controller detects an optional lever by summing the named switches'
`PrefabHash` values, then reads their `Open` state with `Minimum`. This avoids
depending on the special empty-batch value returned by `Average`.

The sensor lookup uses `Maximum`, so multiple sensors with the same room name
are supported. An empty maximum batch returns negative infinity; converting the
result with `sgtz` makes a missing or disconnected sensor turn the named lights
off. Missing light types are harmless because named batch writes with no target
do nothing.

## Known limitations

- An Occupancy Sensor only works while installed inside a valid room.
- There is no off-delay; lights turn off on the first update after all matching
  sensors clear.
- The optional lever provides forced-off and automatic modes, but no forced-on
  mode.
- Every matching supported light with the configured name on the IC output
  network is controlled. Do not reuse that name for unrelated lights.
- Prefab hashes and logic properties were checked against Stationpedia game
  data version `0.2.6367.27532`. In-game verification is still required.
