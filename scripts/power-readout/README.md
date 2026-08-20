# Power readout

Tracks peak and average available generation and delivered load over a
manually reset measurement window, then publishes the four statistics to LED
displays.

## Connections

| Pin | Alias | Device |
|---|---|---|
| `d0` | `genGrid` | Cable Analyzer on the generator-side grid |
| `d1` | `loadGrid` | Cable Analyzer on the consumer/load grid |
| `d2` | `genPeak` | LED display for peak available generation |
| `d3` | `genAvg` | LED display for average available generation |
| `d4` | `loadPeak` | LED display for peak delivered load |
| `d5` | `loadAvg` | LED display for average delivered load |

## Setup

Use a battery, transformer, or other one-way power boundary to keep the
generator and consumer power networks distinct:

```text
Generators -- generation analyzer -- battery bank -- load analyzer -- loads
                    |                                      |
                    +------ protected controller bus ------+
```

Mount each Cable Analyzer on the power network it measures. Connect both
analyzers' data ports, the IC Housing, the four displays, and the reset button
to a protected controller power/data network. Assign the six housing pins as
listed above.

Name one Logic Button exactly `Power Stats Reset`. The button is optional; if
it is absent, the statistics reset only when the program is loaded or manually
restarted at `boot`. Names are case-sensitive. Multiple buttons with the same
name are allowed; pressing any one resets the window.

The script sets all four LED displays to power mode (`Mode 2`). Label or paint
the displays separately; the program does not change their colors.

| Constant | Default | Meaning |
|---|---:|---|
| `BUTTON` | `491845673` | `StructureLogicButton` prefab hash |
| `RESET_NAME` | `HASH("Power Stats Reset")` | Optional named reset button |

The reset-button lookup is a named batch operation over the controller output
network. Its `Maximum` mode intentionally lets any matching button request a
reset. With no matching button, the read returns negative infinity and is
treated as not pressed.

## Measurements

`genGrid.PowerPotential` is treated as available generation. Put only
generators and the battery input or equivalent boundary on that measured
network. Generator-side loads or another battery output would also contribute
to the network reading and make the statistic misleading.

`loadGrid.PowerActual` is treated as delivered load. It is the useful value
for recording real consumer load and cable utilization. It can be lower than
requested demand during a power shortage. To measure requested demand instead,
change the two `loadGrid PowerActual` references in the script to
`PowerRequired` and verify that property on the current in-game Stationpedia
entry before use.

Each average is the arithmetic mean of all successful game-tick samples since
the last reset. It therefore includes nights, idle periods, and other zero-load
periods. This answers the long-term capacity question, but it is not a rolling
average. Peak values are the largest successful samples in the same window.

Holding the reset button clears the four values and pauses sampling. Sampling
starts again after the button is released, so the first post-reset sample
belongs cleanly to the new window.

## Behavior and failure handling

At startup, the script configures the displays, clears all retained statistics,
and waits for the reset button to be released. It then samples once per game
tick, updates the peaks and running means, and writes all four displays.

If either analyzer pin is unassigned or a reading is NaN or negative, all
displays show `-1`. The script yields and retries without clearing the
measurement window. Once valid readings return, normal values replace the fault
indication and sampling resumes. A faulted interval contributes no samples to
the averages. Assigning a device that does not support the required property
causes the normal IC10 runtime-property error until the pin is corrected.

## Power and retained state

The four lit displays and the IC Housing are continuous loads. Power them from
the protected consumer network so the readout can report generation loss and
ordinary consumer outages. If display power matters more than continuous
visibility, switch only the display supply; the IC Housing must remain powered
to continue sampling.

Peak, average, and sample-count state lives in registers. It survives ordinary
loop delays, but loading the program or restarting at `boot` clears the window.
Behavior across IC Housing power loss is a retained-state assumption that must
be checked in game for the target version; use the reset button after an
uncertain outage.

## Register map

| Register | Use |
|---|---|
| `r0` | Current available-generation sample |
| `r1` | Current delivered-load sample |
| `r2` | Peak available generation |
| `r3` | Peak delivered load |
| `r4` | Average available generation |
| `r5` | Average delivered load |
| `r6` | Successful sample count |
| `r7` | Reset-button batch result |
| `r8` | NaN test and average-calculation scratch |

## Known limitations

- The controller measures two whole power networks, not individual generators
  or consumers. Network topology determines what the numbers mean.
- Sampling happens once per completed controller loop, normally once per game
  tick. Electrical changes that occur entirely between samples are not seen.
- The mean is cumulative since reset, so it becomes progressively less
  responsive during a long window.
- The IC10 parser and emulator do not reproduce electrical flow, Cable Analyzer
  timing, display rendering, or power-loss retention. Verify the analyzer
  placement, logic properties, and `Mode 2` rendering in game.
- Logic interfaces were checked against repository game-data version
  `0.2.6367.27532`; recheck Stationpedia when using another game version.
