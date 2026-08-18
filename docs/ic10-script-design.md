# IC10 script design

Practical patterns for building small, interruptible IC10 programs. For opcode
syntax and runtime details, see [IC10 instruction reference](ic10-instructions.md).

## Think in states, not commands

Most device writes start work; they do not finish it. Treat a device mode as an
asynchronous state:

1. Write the target or configuration.
2. Select the mode.
3. `yield`.
4. Read progress and safety inputs.
5. Loop until the required postcondition is true.
6. Only then enter the next state.

Define the postcondition precisely. “Unload requested” is weaker than “the
device left unload mode,” and a charging state may require both mode completion
and a charge threshold. Gate the next hazardous or outbound action on the full
postcondition.

Put shared monitoring in a small update routine when several wait loops need
the same displays, battery read, manual recall, or weather recall. Every
potentially long loop must reach `yield` or `sleep`.

## Separate calls from state transitions

Use `jal` only when control is expected to return. IC10 has one global `ra`, so
a routine that calls another routine must save and restore its caller's return
address.

A jump to a major state such as `start`, `recall`, `shutdown`, or `fault` is a
state transition, not a call. If that jump can abandon an active routine, deal
with its stack frame explicitly. A root transition may deliberately restore a
known `sp`, but only when no caller should resume and the script owns the whole
stack.

For every control-flow edge, ask:

- Does this path return? If yes, is `ra` still valid?
- Can it bypass a `pop`? If yes, where is the abandoned frame removed?
- Can an update routine redirect control instead of returning?

## Preserve the reason for re-entry

Registers and stack state survive `yield`, `sleep`, and ordinary jumps. This is
useful for small state flags, but initialization order matters. Do not clear a
recovery flag at a shared entry label before branching on it.

Trace shared entry points from every source:

- cold boot;
- normal cycle completion;
- full storage or another device completion mode;
- manual interruption;
- safety interruption from each wait loop;
- restart after the hazard clears.

Recovery should restore the next required invariant, not blindly replay the
happy path. For example, a miner recalled with partial cargo should re-enter at
unload and prove unloading complete before taking the outbound waypoint.

## Make safety behavior explicit

Document safety as behavior, not just a sensor threshold:

- which states check the hazard;
- how soon each loop can react;
- the route and device mode used for recall;
- which checks are suppressed during recall to prevent recursion;
- what “clear” means before restart;
- whether a manual control is a momentary recall or a persistent shutdown.

Keep the suppression window as narrow as practical. Restore normal safety
checks before resuming ordinary work.

## Respect value and network semantics

Before relying on a read, verify the property, permissions, units, and mode in
Stationpedia for the target game version. Batch reads also need a cardinality
assumption: zero, one, and multiple matching devices can produce materially
different values.

Remember that comparisons and tests write a new value. An instruction such as
`snan r0 r0` destroys the original sensor value; keep it in another register if
later logic still needs the measurement.

Document what happens when a device is missing, duplicated, disconnected, or
unable to finish its requested mode. Syntax validation cannot prove those
physical conditions.

## Spend the 128 lines on states

Draft the state transitions and invariants before compressing the program.
Reuse a shared state by jumping to its entry label instead of copying its body.
Labels, aliases, defines, comments, and blank lines still consume addresses, so
keep explanation in the sibling README.

Compactness must not obscure state-entry labels, safety checks, completion
conditions, stack ownership, or configuration constants.

## Review checklist

- Trace every entry path, including an interruption at every `yield` loop.
- Confirm every asynchronous command has a completion test.
- Gate every outbound or hazardous transition on its full postcondition.
- Balance `push`/`pop` on returning paths and handle every non-returning escape.
- Check that state flags are initialized, tested, and cleared in the right order.
- Ensure every indefinite loop yields or sleeps.
- Verify device properties, mode meanings, hashes, slots, and thresholds.
- Record batch cardinality and missing-device behavior.
- Run line/layout and parser checks, then test recovery paths in game.
