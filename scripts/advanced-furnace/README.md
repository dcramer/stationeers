# Advanced Furnace: Furnace IC and Hash IC

Two-chip advanced-furnace controller with ingot and batch-size selection,
automatic fuel/coolant control, enclosure vent control, and optional ore-silo
coordination.

This setup is adapted from Barsiel's work:

- [Advanced Furnace Automation guide](https://steamcommunity.com/sharedfiles/filedetails/?id=2426326137)
- [Barsiel's Hash IC (2023)](https://steamcommunity.com/sharedfiles/filedetails/?id=3046529328)
- [Barsiel's Furnace IC (2023)](https://steamcommunity.com/sharedfiles/filedetails/?id=3046529429)
- [Ore sorting and delivery](https://steamcommunity.com/sharedfiles/filedetails/?id=2428983849), for the optional `Silos CD` integration
- [Largely Unemployed's build video](https://www.youtube.com/watch?v=dss-gvPVXUk), which demonstrates an earlier version of Barsiel's setup

The repository copy preserves the supplied control behavior and device names;
it is not a claim of authorship or an independently redesigned controller.

## Programs

| File | IC housing name | Purpose |
|---|---|---|
| `furnace-ic.ic10` | `Furnace IC` | Decodes the targets, meters fuel and coolant, controls the furnace, and ejects a completed batch. |
| `hash-ic.ic10` | `Hash IC` | Reads the controls, publishes the selected ingot hash, sends the packed furnace targets, manages the enclosure vents, and adjusts the optional fuel mixer. |

## Repository names versus Barsiel's guide

The **repository name** column is authoritative for these scripts. The code's
`HASH("...")` lookups use those strings exactly. Barsiel's current guide uses
several different labels; devices left with the guide labels will not match
this repository's programs.

| Purpose | Repository name (use this) | Barsiel guide name |
|---|---|---|
| Furnace controller housing | `Furnace IC` | `Furnace IC` |
| Selection controller housing | `Hash IC` | `Hash IC` |
| Advanced Furnace | `Furnace` | `A Furnace` |
| Fuel pump | `Fuel Pump` | `FuelPump` |
| Coolant pump | `Coolant Pump` | `CoolantPump` |
| Fuel analyzer | `Fuel PA` | `Fuel PA` |
| Coolant analyzer | `Coolant PA` | `Coolant PA` |
| Ingot dial | `Ingot` | `Ingot Dial` |
| Confirm button | `Confirm` | `Confirm Button` |
| Idle flush lever | `Flush` | `Flush` |
| Enclosure vent lever | `Vent` | `VentLever` |
| Enclosure vents | `Vent 1`, `Vent 2` | `Vent 1`, `Vent 2` |
| Status LED | `Status` | `SLight` |
| Status LED display | `Status` | `SLed` |
| Oxygen mixer analyzer | `O2 PA` | `O2 Analyzer` |
| Methane mixer analyzer | `CH4 PA` | `H2 Analyzer` |
| Fuel mixer | `Fuel Mixer` | `Fuel Mixer` |
| Amount dial | `Amount` | `Amount Dial` in the ore-delivery guide |
| Amount LED display | `Amount` | `Amount` in the ore-delivery guide |
| Silo status housing | `Silos CD` | `Silos CD` in the ore-delivery guide |
| Reserved override lever | `Override` | No counterpart in the current guide |

Both programs require a **compact** IC Housing. They address compact housings by
prefab hash `2037291645`; a normal IC Housing will not match. No `d0` through
`d5` screws are assigned.

## Connections

| Pin | Hash IC | Furnace IC |
|---|---|---|
| `d0` | Unassigned | Unassigned |
| `d1` | Unassigned | Unassigned |
| `d2` | Unassigned | Unassigned |
| `d3` | Unassigned | Unassigned |
| `d4` | Unassigned | Unassigned |
| `d5` | Unassigned | Unassigned |

All controlled devices and both IC housings must share a data network. Names are
case-sensitive.

## Device hashes

| Stationpedia prefab | Hash |
|---|---:|
| `StructureAdvancedFurnace` | `545937711` |
| `StructureVolumePump` | `-321403609` |
| `StructureCircuitHousingCompact` | `2037291645` |
| `StructureLogicDial` | `554524804` |
| `StructureLogicButton` | `491845673` |
| `StructureLogicSwitch` (Lever) | `1220484876` |
| `StructureActiveVent` | `-1129453144` |
| `StructurePipeAnalysizer` | `435685051` |
| `StructureGasMixer` | `2104106366` |
| `StructureDiode` (LED) | `1944485013` |
| `StructureConsoleLED5` (LED Display Small) | `-815193061` |

## Required device names

| Device | Exact name | Used by |
|---|---|---|
| Compact IC Housing | `Hash IC` | Furnace IC reads its selected ingot hash |
| Compact IC Housing | `Furnace IC` | Hash IC sends its packed target value |
| Advanced Furnace | `Furnace` | Furnace control and recipe detection |
| Volume Pump | `Fuel Pump` | Fuel admission |
| Volume Pump | `Coolant Pump` | Coolant admission |
| Pipe Analyzer | `Fuel PA` | Fuel pressure, temperature, moles, and volume |
| Pipe Analyzer | `Coolant PA` | Coolant temperature, moles, and volume |
| Logic Dial | `Ingot` | Ingot selection, settings 0 through 17 |
| Logic Dial | `Amount` | Batch-size selection, settings 1 through 30 |
| Logic Button | `Confirm` | Starts the selected recipe |

## Optional device names

| Device | Exact name | Notes |
|---|---|---|
| Small LED Display | `Amount` | Stores the calculated target amount; required for amount-aware auto-ejection of ordinary alloys |
| Compact IC Housing | `Silos CD` | A negative `Setting` inhibits selection; an absent housing reads as zero in the script's minimum batch mode |
| Lever | `Flush` | While idle, opens the furnace output at 100%; pressure above 40 MPa does the same |
| Lever | `Vent` | Selects the enclosure vent pressure behavior |
| Lever | `Override` | Read by the Hash IC but not used by the supplied control logic |
| Active Vent | `Vent 1` | Enclosure pressure control |
| Active Vent | `Vent 2` | Enclosure pressure control |
| LED | `Status` | Red while ready and green while active |
| Small LED Display | `Status` | Displays `Ready!` or `Active` |
| Pipe Analyzer | `O2 PA` | Oxygen-side temperature for fuel mixing |
| Pipe Analyzer | `CH4 PA` | Methane-side temperature for fuel mixing |
| Gas Mixer | `Fuel Mixer` | Receives the temperature-compensated mix setting |

Install the two mixer analyzers and `Fuel Mixer` as a set. The Hash IC always
runs its mixer calculation; without analyzer data the result can be non-finite.
Barsiel's current guide connects methane to mixer input 1 and oxygen to input 2.
If no named mixer exists, the named batch write has no target.

The Hash IC also executes `sb 435685051 On 1`, which turns on **every Pipe
Analyzer on its data network**, not only the four named analyzers above.

## Furnace and plumbing setup

Feed the furnace inlet from the fuel and coolant networks through the two named
volume pumps. Put each named pipe analyzer on the network its pump draws from.
Provide an exhaust path from the furnace output. The two named active vents are
for the sealed furnace enclosure and should be on a pressure network separate
from the furnace exhaust, as shown in Barsiel's guide.

The script turns the fuel mixer on while `Fuel PA` is below 5 MPa, requests an
idle flush at 40 MPa, clamps its pressure comparison to 55 MPa, and drives the
furnace output at 30% above the selected recipe's maximum pressure. The
controller does not check pipe stress, furnace stress, or device error
properties.

## Selection and targets

Set `Ingot` to zero for off. Settings 1 through 17 select the following ingots.
Temperature is in kelvin and pressure is in kilopascals. The ranges below are
the nominal targets encoded in the Hash IC, not every valid range exposed by
Stationpedia.

| Setting | Ingot | Item hash | Temperature | Pressure |
|---:|---|---:|---:|---:|
| 1 | Iron | `-1301215609` | 950-10000 K | 100-10000 kPa |
| 2 | Copper | `-404336834` | 950-10000 K | 1000-10000 kPa |
| 3 | Gold | `226410516` | 950-10000 K | 1000-10000 kPa |
| 4 | Silicon | `-290196476` | 950-10000 K | 1000-10000 kPa |
| 5 | Silver | `-929742000` | 950-10000 K | 1000-10000 kPa |
| 6 | Lead | `2134647745` | 950-10000 K | 1000-10000 kPa |
| 7 | Nickel | `-1406385572` | 950-10000 K | 1000-10000 kPa |
| 8 | Steel | `-654790771` | 900-10000 K | 1000-10000 kPa |
| 9 | Invar | `-297990285` | 1200-1500 K | 18000-20000 kPa |
| 10 | Solder | `-82508479` | 350-550 K | 1000-10000 kPa |
| 11 | Electrum | `502280180` | 600-10000 K | 800-2350 kPa |
| 12 | Constantan | `1058547521` | 1000-10000 K | 20000-55000 kPa |
| 13 | Waspaloy | `156348098` | 400-800 K | 50000-55000 kPa |
| 14 | Inconel | `-787796599` | 600-10000 K | 23500-23800 kPa |
| 15 | Astroloy | `412924554` | 1000-10000 K | 30000-40000 kPa |
| 16 | Hastelloy | `1579842814` | 950-1000 K | 25000-30000 kPa |
| 17 | Stellite | `-1897868623` | 1800-10000 K | 10000-19500 kPa |

Each target is packed as four five-digit fields in one floating-point value:
minimum temperature, maximum temperature, minimum pressure, and maximum
pressure. The Furnace IC's `Get` routine unpacks those fields into `r1` through
`r4`. This representation is sensitive to floating-point precision; keep the
full literals when copying or tuning targets.

The `Amount` dial is clamped to at least 1. The Hash IC scales it according to
the selected ingot and publishes the result on the `Amount` display. With the
optional silo system, a negative `Silos CD` setting clears the selection and
prevents a start.

## Behavior

On idle, the Furnace IC resets its packed target to `-1`, disables both pumps,
closes the furnace, and shows ready status. Pressing `Confirm` causes the Hash
IC to send the selected target. The Furnace IC then:

1. decodes the temperature and pressure limits;
2. turns off the fuel mixer and calculates pump settings from analyzer data;
3. adds fuel below the minimum temperature or pressure;
4. adds coolant above the maximum temperature;
5. opens the furnace output above the maximum pressure; and
6. ejects once the produced recipe hash and requested reagent amount match.

Basic ingots (settings 1 through 7) do not auto-eject when the `Amount` display
is absent or reads zero. If the furnace is opened manually while active, the
controller also enters its ejection path. Both main loops reach an explicit
`yield`.

## Register map

Hash IC: `r0` selection/dispatch, `r1` confirm state, `r2` packed target, `r5`
amount setting, `r6` scaled amount, `r7` unused override reading, `r12`-`r14`
mixer calculation, and `r15` silo status.

Furnace IC: `r1`/`r2` are minimum/maximum temperature, `r3`/`r4` are
minimum/maximum pressure, `r7` is furnace temperature, `r8` is furnace
pressure, and `r0`, `r5`-`r6`, `r9`-`r15` are shared calculation and state
scratch registers. `Get` uses indirect registers `rr5` to populate `r1`-`r4`.

## Hash and version verification

The device and ingot prefab hashes, and every logic property used here, were
checked against the game-generated Stationpedia snapshot for Stationeers
`0.2.6367.27532` referenced by this repository. The source Workshop items were
updated in November 2025, but this repository has not simulated the furnace's
thermodynamics or run the setup in game.

Named batch operations affect every matching device with the same name on the
IC output network. Duplicate names can therefore cause aggregate readings and
multi-device writes. Missing named devices generally yield the batch-mode empty
value rather than a hardware fault, so a naming or wiring error can look like a
valid zero. Re-check all labels and validate the setup in game after updates.
