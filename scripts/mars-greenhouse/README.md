# Mars greenhouse

Controls one daylight-synchronized Grow Light and one reversible Active Vent
for a tiny windowed starter greenhouse on Mars.

## Connections

| Pin | Alias | Device |
|---|---|---|
| `d0` | `sensor` | Gas Sensor inside the greenhouse |
| `d1` | `growLight` | Grow Light covering the plots |
| `d2` | `vent` | Active Vent with its open face inside the greenhouse |
| `d3` | `daylight` | Daylight Sensor outside with an unobstructed sky view |
| `d4`-`d5` | unused | Leave unassigned |

Connect the Active Vent's pipe port through the wall to one Passive Vent
outside. The Passive Vent needs no power, data, or IC pin.

```text
greenhouse                 Mars exterior

  Active Vent  ===== pipe =====  Passive Vent
  open face
```

All four assigned devices and the IC Housing must share power and data.

## Setup

Mount the Daylight Sensor outside where direct sun reaches it. The script uses
its `Activate` value, so no sensor mode or angle calibration is required. Mount
the Grow Light no more than one large grid above the trays and confirm coverage
with a Plant Analyser.

Load the script and assign `d0` through `d3`. During a warm part of the Martian
day, the Active Vent will automatically fill the greenhouse from the outside
atmosphere. Outward mode (`Mode 0`) means pipe-to-room; inward mode (`Mode 1`)
means room-to-pipe. The script turns the vent off before changing mode because
changing mode resets the Active Vent's pressure settings.

Direct Mars atmosphere is approximately 94.96% carbon dioxide, 2.96% nitrogen,
1.44% oxygen, and less than 1% pollutant. At the script's pressure targets the
pollutant partial pressure remains below the 1 kPa limit of standard potatoes,
soybeans, and tomatoes. Mutated seeds can differ, so verify them with a Plant
Analyser. Filling during the warmer daytime also reduces the temperature shock
from cold Martian gas.

Supply liquid water separately and initially verify that room and water
temperatures are suitable before planting. This starter controller deliberately
does not add heating, cooling, tanks, filtration, or pressure regulators.

## Configuration

| Constant | Default | Purpose |
|---|---:|---|
| `FILL_START_PRESSURE` | `65` kPa | Starts a normal Mars-air refill |
| `FILL_TARGET_PRESSURE` | `75` kPa | Stops a normal refill |
| `HIGH_PRESSURE` | `100` kPa | Starts dumping excess room gas |
| `VENT_TARGET_PRESSURE` | `90` kPa | Stops an overpressure dump |
| `MIN_CO2_RATIO` | `0.05` | Starts a Mars-air refresh below 5% CO2 |
| `CO2_FILL_PRESSURE` | `90` kPa | Maximum pressure during CO2 refresh |
| `CO2_PURGE_PRESSURE` | `75` kPa | Purge target when CO2 is low at 90 kPa |
| `COOL_START_TEMP` | `305.15` K | Starts a Mars-air cooling exchange above 32 °C |
| `MIN_CO2_REFRESH_TEMP` | `288.15` K | Suppresses optional CO2 refresh below 15 °C |

The Grow Light is on whenever direct sunlight activates the Daylight Sensor and
off at night. This supplements weak Martian daylight while keeping the lamp and
natural light in the same window. Check each crop with a Plant Analyser;
storms, seasons, shadows, and mutated seeds can change effective exposure.

## Behavior

The Grow Light follows the Daylight Sensor every update. The vent normally
remains off. Below 65 kPa it reverses outward and draws Mars atmosphere through
the exterior Passive Vent until the greenhouse reaches 75 kPa. Above 100 kPa
it reverses inward and dumps room gas to Mars until the room reaches 90 kPa.

Plants gradually replace carbon dioxide with oxygen without materially changing
total pressure. When room CO2 falls below 5%, the controller adds Mars air up
to 90 kPa. If the room is already at 90 kPa, it first dumps gas to 75 kPa and
then refills with CO2-rich Mars air. This is a simple, lossy refresh suitable
for a few starter plants.

Sunlight, the Grow Light, and plants add heat. Above 32 °C the controller uses
the same dump-and-refill operation to exchange hot greenhouse gas for cooler
Mars atmosphere. Below 15 °C it postpones optional CO2 refreshing so it does
not deliberately add more cold gas. A refill below 65 kPa still takes priority
because adequate pressure is required for plant survival.

The IC Housing's `Setting` shows the last room pressure. A missing required
device, invalid sensor reading, or combustion turns the light and vent off,
shows `-1`, and retries after one tick.

## Known limitations

- Mars intake gas can be dangerously cold, especially at night. This script has
  no exterior temperature sensor and cannot heat the room, so check room
  temperature after a refill and across the first full night.
- A storm or shadow can deactivate the Daylight Sensor and turn the Grow Light
  off during daytime.
- CO2 refreshing deliberately dumps some oxygen and other greenhouse gas.
- The controller does not manage water temperature or filter gases.
- One directly assigned Grow Light is controlled.
- Atmospheric flow, plant genetics, and illumination coverage require an
  in-game check.
- Properties were checked against Stationpedia game-data version
  `0.2.6367.27532`.

## Register map

| Register | Use |
|---|---|
| `r0` | Greenhouse pressure |
| `r1` | Greenhouse carbon-dioxide ratio |
| `r2` | Greenhouse temperature |
| `r3` | Temporary status or daylight value |
| `ra` | Return address for `safeOff` |
