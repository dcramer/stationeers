# Hardsuit safety

Automatically closes and locks a hardsuit helmet when the surrounding
pressure, temperature, or atmosphere is unsafe, and disables suit life
support while the visor is open.

Adapted from Oberon187's
[Hardsuit Safety Script](https://steamcommunity.com/sharedfiles/filedetails/?id=3755560912).

## Connections

The IC10 chip runs in the Hardsuit's programmable-chip slot, so `db` is the
suit.

| Pin | Alias | Device |
|---|---|---|
| `d0` | `helmet` | Equipped Hardsuit Helmet or Space Helmet |

## Setup

Load `hardsuit-safety.ic10` onto a chip, assign the equipped helmet to `d0`,
and install the chip in the Hardsuit. The suit battery must have power for the
IC to execute.

The configurable thresholds are in kelvin, kPa, and gas ratio from 0 to 1:

| Constant | Default | Unsafe condition |
|---|---:|---|
| `MIN_TEMP` | `273.15` K | External temperature below 0 C |
| `MAX_TEMP` | `313.15` K | External temperature above 40 C |
| `MIN_PRESSURE` | `35` kPa | External pressure below 35 kPa |
| `MAX_PRESSURE` | `125` kPa | External pressure above 125 kPa |
| `MIN_OXYGEN` | `0.15` | Helmet oxygen ratio below 15% |
| `MAX_TOXINS` | `0.02` | Combined toxic-gas ratio above 2% |

The toxic total is carbon dioxide, methane, pollutant, nitrous oxide,
hydrazine, silanol, and hydrochloric acid. A value exactly equal to a minimum
or maximum is treated as safe.

## Behavior

The script waits one game tick before each scan. If `d0` is not connected, it
performs no reads or writes and checks again on the next tick.

External pressure and temperature come from the Hardsuit's
`PressureExternal` and `TemperatureExternal` values. Oxygen and toxic-gas
ratios come from the helmet and are supplemental checks because helmet gas
readings can lag while the visor is open.

When the environment changes to unsafe, the script sets the suit `Error`
output, closes an open visor, and locks the helmet. It never opens the visor.
When the environment changes back to safe, it clears `Error` and unlocks the
helmet. These outputs are written only on a safe/unsafe transition.

The visor state independently controls life support. An open visor turns
`Filtration`, suit `On` (air conditioning), and `AirRelease` off. A closed
visor turns all three on. These outputs are also written only when the visor
state changes. Closing the visor during an unsafe transition therefore enables
life support immediately.

## Failure handling and limitations

- The script cannot act if the suit battery is empty, the chip is stopped, or
  the helmet is absent from `d0`. If the helmet is removed after operation
  begins, the suit and alert outputs retain their last written states.
- Helmet gas ratios are not a reliable instantaneous external-atmosphere
  sample while the visor is open. Pressure and temperature remain the primary
  fast-closing triggers; verify the gas behavior in game before relying on it.
- Oxygen safety is a ratio check, not an oxygen partial-pressure calculation.
  The independent 35 kPa minimum does not guarantee a breathable oxygen
  partial pressure for every gas mixture.
- The script has no threshold hysteresis. Sensor values crossing a boundary
  can alternate between safe and unsafe on consecutive ticks.
- Writes occur only on state changes. Another IC or logic writer can override
  a lock, alert, or life-support output until the monitored state changes.
- The custom alert reuses the Hardsuit `Error` property. Clearing it on a safe
  transition can conflict with a native suit error indication.
- Logic properties were checked against extracted Stationpedia data version
  `0.2.6367.27532`. All gas names used here are valid for the Hardsuit Helmet
  and Space Helmet in that version. An unknown or unsupported property is not
  harmless: it stops the current IC run at that line until corrected.
- Emulator scenarios cover control flow and writes but not atmospheric
  physics, gas-sensor lag, equipment power loss, or actual in-game timing. Test
  the installed chip in a controlled environment before depending on it.

## Register map

| Register | Alias | Use |
|---|---|---|
| `r0` | `unsafe` | Combined safety state |
| `r1` | `value` | Sensor value or comparison result |
| `r2` | `toxins` | Toxic-gas sum |
| `r3` | `hasHelmet` | `d0` connection state |
| `r4` | `visorOpen` | Current helmet `Open` value |
| `r5` | `lifeOn` | Desired life-support state |
| `r6` | `lastLife` | Last written life-support state |
| `r7` | `lastAlert` | Last handled safety state |
