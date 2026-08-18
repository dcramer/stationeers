# IC10 instruction reference

Compact reference for the 154 instructions in Stationeers game data `0.2.6367.27532`.

## Notation

- `dst` — destination register (`r0`–`r15`, an alias, or an indirect register where supported)
- `a`, `b`, `value`, `seconds`, `tol`, `offset`, `length` — register or number
- `dev` — device (`d0`–`d5`, `db`, an alias, or an indirect/direct device reference where supported)
- `id` — device `ReferenceId`, directly or in a register
- `target` — absolute line/label; `relative` — signed line offset
- `LogicType` / `LogicSlotType` — property shown for that device in Stationpedia
- `typeHash`, `nameHash`, `reagentHash` — number, register, or `HASH("...")`
- Batch modes: `Average` (0), `Sum` (1), `Minimum` (2), `Maximum` (3)
- Reagent modes: `Contents` (0), `Required` (1), `Recipe` (2)

## Utility and execution

| Instruction | Syntax | Description |
|---|---|---|
| `alias` | `alias name r?\|d?` | Give a register or device a readable name. |
| `define` | `define name value` | Define a compile-time constant. |
| `move` | `move dst value` | Copy a value into a register. |
| `yield` | `yield` | Pause until the next game tick. |
| `sleep` | `sleep seconds` | Pause for the given game-time seconds. |
| `hcf` | `hcf` | Halt and catch fire: destroy the chip and create a small explosion. |
| `label` | `label dev name` | Deprecated device-label instruction; use `alias`. |

Labels used as branch targets are written as `name:` and are not instructions.

## Mathematics

| Instruction | Syntax | Description |
|---|---|---|
| `abs` | `abs dst a` | Absolute value. |
| `sgn` | `sgn dst a` | Sign: -1, 0, or 1. |
| `add` | `add dst a b` | `a + b`. |
| `sub` | `sub dst a b` | `a - b`. |
| `mul` | `mul dst a b` | `a * b`. |
| `div` | `div dst a b` | `a / b`. |
| `mod` | `mod dst a b` | `a` modulo `b` (not C-style remainder). |
| `pow` | `pow dst a b` | `a` raised to power `b`. |
| `exp` | `exp dst a` | `e` raised to power `a`. |
| `log` | `log dst a` | Natural logarithm of `a`. |
| `sqrt` | `sqrt dst a` | Square root. |
| `min` | `min dst a b` | Smaller value. |
| `max` | `max dst a b` | Larger value. |
| `clamp` | `clamp dst a min max` | Clamp `a` to inclusive `[min, max]`. |
| `ceil` | `ceil dst a` | Round upward to an integer. |
| `floor` | `floor dst a` | Round downward to an integer. |
| `round` | `round dst a` | Round to the nearest integer. |
| `trunc` | `trunc dst a` | Remove the fractional part. |
| `rand` | `rand dst` | Random value in `[0, 1)`. |
| `lerp` | `lerp dst a b ratio` | Linear interpolation from `a` to `b`; ratio is clamped to `[0, 1]`. |

## Trigonometry

All angles are radians.

| Instruction | Syntax | Description |
|---|---|---|
| `sin` | `sin dst a` | Sine. |
| `cos` | `cos dst a` | Cosine. |
| `tan` | `tan dst a` | Tangent. |
| `asin` | `asin dst a` | Arc sine. |
| `acos` | `acos dst a` | Arc cosine. |
| `atan` | `atan dst a` | Arc tangent. |
| `atan2` | `atan2 dst y x` | Quadrant-aware arc tangent of `y / x`. |

## Device and slot I/O

| Instruction | Syntax | Description |
|---|---|---|
| `l` | `l dst dev LogicType` | Read a device property. |
| `s` | `s dev LogicType value` | Write a device property. |
| `ld` | `ld dst id LogicType` | Read a device property by direct `ReferenceId`. |
| `sd` | `sd id LogicType value` | Write a device property by direct `ReferenceId`. |
| `lr` | `lr dst dev ReagentMode reagentHash` | Read a reagent quantity from a device. |
| `ls` | `ls dst dev slot LogicSlotType` | Read a property of a device slot. |
| `ss` | `ss dev slot LogicSlotType value` | Write a property of a device slot. |
| `rmap` | `rmap dst d? reagentHash` | Map a reagent hash to the prefab hash the device requires. |

## Batch device and slot I/O

Batch instructions operate on matching devices on the IC's output data network.

| Instruction | Syntax | Description |
|---|---|---|
| `lb` | `lb dst typeHash LogicType mode` | Aggregate a property across a device type. |
| `lbn` | `lbn dst typeHash nameHash LogicType mode` | Aggregate a property across a type with a matching name. |
| `lbs` | `lbs dst typeHash slot LogicSlotType mode` | Aggregate a slot property across a device type. |
| `lbns` | `lbns dst typeHash nameHash slot LogicSlotType mode` | Aggregate a slot property across a type and name. |
| `sb` | `sb typeHash LogicType value` | Write a property on every device of a type. |
| `sbn` | `sbn typeHash nameHash LogicType value` | Write a property on every device matching type and name. |
| `sbs` | `sbs typeHash slot LogicSlotType value` | Write a slot property on every device of a type. |

There is no `sbns`; named batch slot reads exist, but named batch slot writes do not in this game-data version.

## Stack and remote memory

The local stack pointer is `sp`.

| Instruction | Syntax | Description |
|---|---|---|
| `push` | `push value` | Write at `sp`, then increment `sp`. |
| `pop` | `pop dst` | Read the top value and decrement `sp`. |
| `peek` | `peek dst` | Read the top value without changing `sp`. |
| `poke` | `poke address value` | Write local stack memory at an address. |
| `get` | `get dst dev address` | Read another device's stack memory. |
| `put` | `put dev address value` | Write another device's stack memory. |
| `getd` | `getd dst id address` | Read stack memory by direct `ReferenceId`. |
| `putd` | `putd id address value` | Write stack memory by direct `ReferenceId`. |
| `clr` | `clr dev` | Clear a device's stack memory. |
| `clrd` | `clrd id` | Clear stack memory by direct `ReferenceId`. |

## Bit operations

| Instruction | Syntax | Description |
|---|---|---|
| `and` | `and dst a b` | Bitwise AND. |
| `or` | `or dst a b` | Bitwise OR. |
| `xor` | `xor dst a b` | Bitwise XOR. |
| `nor` | `nor dst a b` | Bitwise NOR. |
| `not` | `not dst a` | Bitwise complement; for Boolean NOT use `seqz`. |
| `sla` | `sla dst a b` | Arithmetic left shift by `b` bits. |
| `sll` | `sll dst a b` | Logical left shift by `b` bits. |
| `sra` | `sra dst a b` | Arithmetic right shift; preserve sign. |
| `srl` | `srl dst a b` | Logical right shift; fill with zeroes. |
| `rol` | `rol dst a b` | Rotate left by `b` bits. |
| `ror` | `ror dst a b` | Rotate right by `b` bits. |
| `ext` | `ext dst source offset length` | Extract a bit field, up to 53 bits. |
| `ins` | `ins dst field offset length` | Insert a bit field into `dst`, up to 53 bits. |

## Comparisons and selection

Comparison instructions write `1` for true or `0` for false.

| Condition | Two-value form | Zero form | Description |
|---|---|---|---|
| equal | `seq dst a b` | `seqz dst a` | `a == b` / `a == 0`. |
| not equal | `sne dst a b` | `snez dst a` | `a != b` / `a != 0`. |
| less | `slt dst a b` | `sltz dst a` | `a < b` / `a < 0`. |
| less/equal | `sle dst a b` | `slez dst a` | `a <= b` / `a <= 0`. |
| greater | `sgt dst a b` | `sgtz dst a` | `a > b` / `a > 0`. |
| greater/equal | `sge dst a b` | `sgez dst a` | `a >= b` / `a >= 0`. |
| approximately equal | `sap dst a b tol` | `sapz dst a tol` | Equal within relative tolerance. |
| not approximately equal | `sna dst a b tol` | `snaz dst a tol` | Outside relative tolerance. |

| Instruction | Syntax | Description |
|---|---|---|
| `snan` | `snan dst a` | `1` when `a` is NaN. |
| `snanz` | `snanz dst a` | `1` when `a` is not NaN. |
| `sdse` | `sdse dst dev` | `1` when the device is set/connected. |
| `sdns` | `sdns dst dev` | `1` when the device is not set. |
| `select` | `select dst condition ifTrue ifFalse` | Ternary selection by zero/non-zero condition. |

## Jumps and branches

- Absolute forms jump to a line or label.
- Relative forms (`br...`) use a signed line offset instead.
- Link forms (`...al`) also save the next line in `ra`; return with `j ra`.

| Condition | Absolute | Relative | Link | Operands before target |
|---|---|---|---|---|
| always | `j` | `jr` | `jal` | none |
| `a == b` | `beq` | `breq` | `beqal` | `a b` |
| `a == 0` | `beqz` | `breqz` | `beqzal` | `a` |
| `a != b` | `bne` | `brne` | `bneal` | `a b` |
| `a != 0` | `bnez` | `brnez` | `bnezal` | `a` |
| `a < b` | `blt` | `brlt` | `bltal` | `a b` |
| `a < 0` | `bltz` | `brltz` | `bltzal` | `a` |
| `a <= b` | `ble` | `brle` | `bleal` | `a b` |
| `a <= 0` | `blez` | `brlez` | `blezal` | `a` |
| `a > b` | `bgt` | `brgt` | `bgtal` | `a b` |
| `a > 0` | `bgtz` | `brgtz` | `bgtzal` | `a` |
| `a >= b` | `bge` | `brge` | `bgeal` | `a b` |
| `a >= 0` | `bgez` | `brgez` | `bgezal` | `a` |
| `a` approximately `b` | `bap` | `brap` | `bapal` | `a b tol` |
| `a` approximately `0` | `bapz` | `brapz` | `bapzal` | `a tol` |
| `a` not approximately `b` | `bna` | `brna` | `bnaal` | `a b tol` |
| `a` not approximately `0` | `bnaz` | `brnaz` | `bnazal` | `a tol` |
| `a` is NaN | `bnan` | `brnan` | — | `a` |

Append `target` (absolute/link) or `relative` (relative form) to the listed operands.

### Device branches

| Instruction | Syntax | Description |
|---|---|---|
| `bdse` | `bdse dev target` | Branch if the device is set. |
| `brdse` | `brdse dev relative` | Relative branch if the device is set. |
| `bdseal` | `bdseal dev target` | Branch-and-link if the device is set. |
| `bdns` | `bdns dev target` | Branch if the device is not set. |
| `brdns` | `brdns dev relative` | Relative branch if the device is not set. |
| `bdnsal` | `bdnsal dev target` | Branch-and-link if the device is not set. |
| `bdnvl` | `bdnvl dev LogicType target` | Branch if that property cannot be loaded. |
| `bdnvs` | `bdnvs dev LogicType target` | Branch if that property cannot be stored. |

## Sources and freshness

Primary inventory and syntax: game-generated Stationpedia data version `0.2.6367.27532`, as extracted in [FlorpyDorp IC10 Language Support](https://github.com/FlorpyDorpinator/FlorpyDorp-IC10-Language-Support) (repository snapshot checked 2026-07-05). Descriptions were shortened and cross-checked against the [Stationeers Community Wiki instruction list](https://stationeers-wiki.com/IC10/instructions) and its [opcode module](https://stationeers-wiki.com/Module%3AIC10).
