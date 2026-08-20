# Power-first filtration system

Runs a seven-gas filtration manifold while hard-switching idle filters, the
feed pump, and the relief device off. One external IC also maintains live
cartridge indicators, so the Filtration units do not need onboard chips. The
filter-life display behavior is adapted from the user's previous Gas Harvesting
Controller.

## Pipe layout

Use one shared recirculation pipe network:

```text
Raw tank -> feed pump -> common manifold -> every Filtration input
                              ^                    |
                              |                    `-> Filtered -> tank
                              `------ every Unfiltered port

Common manifold -> relief regulator -> low-pressure dump or outdoor vent
```

Connect every Filtration `Input` and `Unfiltered` port directly to that same
common pipe network. The machine returns the remainder to the network it drew
from, while its target gas leaves through `Filtered`. No return pump or separate
waste header is required. This is still a parallel manifold: hard-switching one
Filtration unit does not block any other unit.

Connect each `Filtered` port directly to its dedicated product tank network.
The Filtration unit can then read that tank pressure through `PressureOutput`,
so product Pipe Analyzers are unnecessary. A pump, regulator, or one-way valve
between the filtered port and tank splits the networks and would require a
separate analyzer.

Parallel branch order does not matter. A serial chain is unsuitable because a
hard-off upstream unit would stop flow to every downstream unit. Keeping the
unfiltered port on the input network favors low hardware and power use over
maximum throughput; a separately pumped waste header is only an optional speed
upgrade.

## Hardware and pins

Run `filtration-manifold.ic10` in one external IC Housing. Leave the onboard IC
slot in every Filtration unit empty.

| Pin | Device | Function |
|---|---|---|
| `d0` | Volume Pump or Turbo Volume Pump | Raw tank to input manifold |
| `d1` | Pipe Analyzer | Common input manifold sensor |
| `d2` | Back Pressure Regulator | Input manifold to low-pressure dump |
| `d3`-`d5` | Unused | |

Set the feed-pump flow manually before starting the IC. With a high-pressure
raw tank, begin at `0.1 L` and increase cautiously; `0.5 L` is a reasonable
initial upper bound. An oversized setting can push a small manifold through
both pressure thresholds in a few ticks, making the pump and filters visibly
cycle. Point the relief regulator from the manifold toward a dump tank or safe
outdoor passive vent. The controller sets its pressure setting to
`RELIEF_PRESSURE` and normally leaves it off.

All controlled devices and indicators must share the IC Housing's data
network. Do not put unrelated Filtration units on that network: cold start uses
network-wide batch writes to reset every Filtration `On` and `Mode` property.
The controller owns both properties after startup.

## Required names

For each row, give the Filtration unit, Flashing Light, and Diode Slide the same
exact name. Names may repeat across those three different prefab types, but use
only one of each type per gas.

| Exact name | Two matching cartridges |
|---|---|
| `Nitrogen` | Nitrogen |
| `Methane` | Methane |
| `Oxygen` | Oxygen |
| `Carbon Dioxide` | Carbon Dioxide |
| `Nitrous Oxide` | Nitrous Oxide |
| `Hydrogen` | Hydrogen |
| `Pollutant` | Pollutant |

Different cartridge sizes and catalytic cartridges work because control uses
slot quantity rather than cartridge prefab hashes. Install two cartridges of
the named gas in each Filtration unit.

## Operation

Cold start runs once: it clears the controller's seven-bit filter-state mask
and hard-switches all Filtration units, the feed pump, and the relief regulator
off. The main loop never jumps back to initialization. During a healthy scan,
the state mask—not a powered-off device reading—remembers whether each gas was
running. Analyzer power loss, error, or invalid readings clear the state mask
and hard-switch every controlled device off.

For each gas, target partial pressure is `manifold pressure * gas ratio` from
the common input analyzer. A filter runs only when target gas is available, its
filtered-output network has room, and cartridge capacity is nonzero. Its bit in
the internal state mask selects the running or stopped hysteresis thresholds.
The physical `On` and `Mode` properties follow that stored decision, so an idle
filter is fully powered off.

| Constant | Default | Behavior |
|---|---:|---|
| `INPUT_START` | 4500 kPa | Feed pump starts below this pressure |
| `INPUT_STOP` | 5000 kPa | Running feed pump stops at this pressure |
| `PARTIAL_START` | 50 kPa | A stopped gas filter starts above this target partial pressure |
| `PARTIAL_STOP` | 20 kPa | A running gas filter stops below this target partial pressure |
| `PRODUCT_START` | 40000 kPa | A stopped filter may restart below 40 MPa |
| `PRODUCT_STOP` | 45000 kPa | A running filter stops at 45 MPa |
| `LOW_FILTER_RATIO` | 0.25 | Flashing-light warning threshold |
| `RELIEF_PRESSURE` | 50000 kPa | Emergency relief powers on above 50 MPa |

The feed pump uses independent pressure hysteresis so an empty manifold can
charge at cold start. The relief regulator is unpowered in normal operation and
opens only above its threshold.

At 626 kPa the pump is intentionally on because the manifold is below
`INPUT_START`. It remains requested until the manifold reaches 5000 kPa. If it
switches off while the analyzer still reads below 5000 kPa, inspect the IC
Housing's `r2`: `1` means the controller requests the pump; a physical pump
that loses power while `r2` remains `1` has an electrical or wiring problem.

The `d1` analyzer must be on the common manifold downstream of the feed pump.
If it reads 30 MPa, the feed pump is correctly held off while the 50 MPa relief
remains closed. The controller only toggles pump power; set the pump's flow
`Setting` manually to a conservative nonzero value.

## Indicators

The external IC reads cartridge slots even while a Filtration unit is off.
Combined capacity is `(slot 0 quantity + slot 1 quantity) / 200`:

- two full cartridges display 100%;
- one full cartridge displays 50%;
- the Flashing Light turns on at or below 25%.

The controller forces every Diode Slide to `On 0` while continuing to write its
`Setting`, preserving the passive progress display without its illuminated
power draw. Paint the slide's non-red color green.

## Power and failure behavior

- Continuous control load is limited to the external IC Housing and the 5 W
  shared Pipe Analyzer. Filters, the feed pump, the relief regulator, and
  normal-status lights are hard-off whenever they are not required.
- A low-filter Flashing Light still consumes its normal power while warning.
- Analyzer power loss, analyzer error, or a non-finite pressure reading
  hard-switches every filter and controlled flow device off. Cartridge
  indicators retain their last values until analyzer service is restored.
- A healthy multi-tick scan retains the previous device commands. A sensor
  fault is handled at the next analyzer check; power the controller and
  controlled machines from the same protected circuit so controller power loss
  also removes machine power.
- Product cutoff is not temperature compensated. Keep tanks reasonably stable
  and retain pressure headroom below the pipe limit.
- This controller does not handle combustion, condensation, or freezing.
  Methane, hydrogen, and nitrous oxide must remain below ignition conditions.
- Logic properties target repository game data `0.2.6367.27532`; commission the
  actual pipe layout at conservative pump settings.

## Register map

| Register | Use |
|---|---|
| `r0`-`r3` | Input pressure, status, feed state, and seven-bit filter-state mask |
| `r4`, `r5` | Current gas ratio and device name hash |
| `r6`-`r10` | Filter hysteresis, partial pressure, and product-pressure decision |
| `r11`, `r12` | Cartridge quantity, indicator, and decision scratch |
| `r13` | Current filter-state bit index (`0` through `6`) |
