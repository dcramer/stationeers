# Self-calibrating solar panels

Tracks the sun with mixed two-axis solar panels, calibrates their horizontal
offset automatically, and parks them at night or on command.

Adapted from
[Self-calibrating Solar Panels](https://steamcommunity.com/sharedfiles/filedetails/?id=3748068037)
by Steam user `stupid1`. This version adds the 1x5 heavy dual panel hash.

## Connections

| Pin | Alias | Device |
|---|---|---|
| `d0` | `sensor` | Daylight Sensor (required) |
| `d1` | `parkSwitch` | Switch (optional) |
| `d2` | `calibrationPanel` | One solar panel used to measure calibration ratio (optional) |

Connect the IC housing output network to every controlled panel's data port.
The sensor and panels may face any direction because startup calibration finds
the nearest 90-degree horizontal offset.

## Setup

The script controls these prefab hashes with network-wide batch operations:

| Panel | Prefab hash |
|---|---:|
| Solar Panel | `-2045627372` |
| Solar Panel (Dual) | `-539224550` |
| Solar Panel (Heavy) | `-934345724` |
| Solar Panel (Heavy Dual) | `-1545574413` |
| Solar Panel 1x5 (Heavy Dual) | `1945473703` |

Panels whose horizontal orientation differs from the main group can be named
exactly `Solar Panel +90`, `Solar Panel -90`, or `Solar Panel +180`. The script
applies that named offset after its normal batch write. In particular, a 1x5
dual panel installed with its ports aligned to a 1x1 dual panel may require the
`Solar Panel +180` name.

Set `RESET` to `1` and reload the program to force calibration. After it
finishes, set `RESET` back to `0`; the calibration signature and offset remain
in stack addresses 0 and 1. With no saved calibration, the script calibrates
automatically. If `d2` is unset, calibration uses the highest `Ratio` reported
by any supported panel type on the network.

## Behavior

Calibration waits until the sensor's absolute vertical reading is at most 75,
then tests four horizontal offsets in 90-degree steps. Each step is held for 30
ticks before the best `Ratio` is saved.

During daylight, the script tracks both axes and shows the best panel ratio as
a whole-number percentage in the IC housing's `Setting`. At night it preserves
the last tracking tilt and turns toward the captured dawn heading. Opening the
optional switch parks all panels vertically at 90 degrees.

The IC housing status values are:

| `Setting` | Meaning |
|---:|---|
| `0`-`100` | Tracking; best panel ratio in percent |
| `1000` | Calibrating |
| `2000` | Automatically parked for darkness |
| `2001` | Parked by the optional switch |
| `9000` | Required daylight sensor is missing |

If `d0` is missing, the script stops commanding panels, reports `9000`, and
rechecks after every yield. A missing or wrong-type `d1` is ignored. A missing
`d2` falls back to batch ratio reads; an empty panel batch contributes no usable
ratio.

## Register map

| Register | Use |
|---|---|
| `r0`-`r1` | Sensor horizontal and vertical readings |
| `r3` | Best or calibration-panel ratio |
| `r4` | Calibrated horizontal offset |
| `r6`-`r7` | Target panel horizontal and vertical angles |
| `r8` | Scratch, stack value, countdown, or device check |
| `r9`-`r11` | Calibration trial, best ratio, and saved heading/offset |
| `r13`-`r14` | Batch scratch and displayed ratio percentage |
| `r15` | Darkness state |

The panel hashes occupy stack addresses 3 through 7. The batch loops set `sp`
to 8 and pop through that range. Subroutines are not nested, so their shared
`ra` does not require a saved call frame.

## Known limitations

- Batch reads and writes affect every supported panel type on the IC output
  network unless a named orientation override applies.
- Calibration chooses the best single ratio, not an average across a mixed
  array. Obstruction or differing orientations can make another panel the
  calibration winner; assign a representative panel to `d2` when needed.
- The 1x5 heavy dual hash was cross-checked against generated device data
  updated on 2026-08-15. The repository instruction reference is based on game
  version `0.2.6367.27532`; the complete setup still needs in-game verification
  after game updates.
