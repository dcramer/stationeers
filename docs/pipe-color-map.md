# Pipe color map

Use this convention to identify pure fluids and common process mixtures at a
glance. It follows the colors most consistently used by the Stationeers
community: match the in-game filter or canister family for pure substances,
then use distinct service colors for mixtures.

There is no universal community standard. Pipe labels at tanks, valves, and
junctions remain authoritative; paint is a visual aid, not proof of contents.

## Available paints

The standard palette is Black, Blue, Brown, Green, Grey, Khaki, Orange, Pink,
Purple, Red, White, and Yellow. This map requires only those standard colors.

The Metallic Spray Paints DLC adds Bronze, Gold, Obsidian, and Silver. They are
not part of the core convention because multiplayer visitors may not own the
DLC and the community has not settled on meanings for them.

Newly placed or unpainted pipes appear Yellow. Treat an unlabelled Yellow run
as uncommissioned or unknown even though Yellow is also the Pollutant family
color.

## Community basis

The older guides and newer discussions disagree at the edges, but repeatedly
converge on these choices:

- Oxygen is White, Methane (formerly Volatiles) is Red, and ready-to-burn fuel
  is Orange.
- Water is Blue, Nitrogen is Black, Carbon Dioxide is Grey, and Pollutant is
  Yellow when following the current filter colors.
- Nitrous Oxide is Green. Pink is better kept available for a distinct nitrous
  fuel mixture or a hot-service marker.
- Breathable air is usually Khaki when Blue remains assigned to water.
- Brown commonly means raw, dirty, recyclable, or otherwise unprocessed gas.

The Gases Update added more substances than the paint palette can uniquely
represent. The current in-game families themselves collide: Hydrogen and
Methane are both Red, Nitrous Oxide and Hydrochloric Acid are both Green, and
Carbon Dioxide and Helium are both Grey. Prefer familiar colors plus labels or
alternating color bands over inventing a unique but surprising color for every
fluid.

## Pure gases

| Gas | Symbol | Paint | Basis and collision |
|---|---|---|---|
| Oxygen | O₂ | White | Filter/canister family. |
| Hydrogen | H₂ | Red | Filter family; label to distinguish it from Methane. |
| Methane | CH₄ | Red | Community convention inherited from Volatiles; label to distinguish it from Hydrogen. |
| Nitrogen | N₂ | Black | Current filter color and the common filter-based convention. |
| Carbon Dioxide | CO₂ | Grey | Filter family; label to distinguish it from Helium. |
| Pollutant | X | Yellow | Filter family; label it because unpainted pipe is also Yellow. |
| Nitrous Oxide | N₂O | Green | Filter/canister family; label to distinguish it from Hydrochloric Acid. |
| Ozone | O₃ | Purple | Filter family. |
| Helium | He | Grey | Filter family; label to distinguish it from Carbon Dioxide. |
| Hydrazine | N₂H₄ | Orange | Filter family; label prominently because premixed fuel is also Orange. |
| Hydrochloric Acid | HCl | Green | Filter family; label to distinguish it from Nitrous Oxide. |
| Silanol | Sil | Brown | Dark-brown filter family. |
| Steam | H₂O | Blue | Water family across phases. |

## Pure liquids

A substance keeps the same family color across gas and liquid pipes. Pipe type
helps distinguish the phase, but labels are still required at storage and
connections.

| Liquid | Symbol | Paint |
|---|---|---|
| Water | H₂O | Blue |
| Polluted Water | PH₂O | Blue |
| Liquid Oxygen | O₂ | White |
| Liquid Hydrogen | H₂ | Red |
| Liquid Methane | CH₄ | Red |
| Liquid Nitrogen | N₂ | Black |
| Liquid Carbon Dioxide | CO₂ | Grey |
| Liquid Pollutant | X | Yellow |
| Liquid Nitrous Oxide | N₂O | Green |
| Liquid Ozone | O₃ | Purple |
| Liquid Hydrazine | N₂H₄ | Orange |
| Liquid Hydrochloric Acid | HCl | Green |
| Liquid Silanol | Sil | Brown |
| Alcohol | ALC | Brown |
| Liquid Sodium Chloride | NaCl | Yellow |

Helium has no liquid phase. Alcohol and Sodium Chloride have no gas phase in
the game.

## Mixtures and service lines

| Service | Paint | Label and notes |
|---|---|---|
| Breathable air | Khaki | Label the verified breathing mix `AIR`. Some players use Blue, but Khaki avoids colliding with water. |
| Standard Methane/Oxygen or Hydrogen/Oxygen fuel | Orange | Label the actual mixture, such as `CH4/O2 FUEL` or `H2/O2 FUEL`. |
| Nitrous fuel / HydroNox | Pink | Label `HYDRONOX`. Community schemes vary; alternating Orange/Green bands are a clearer component-based alternative. |
| Ozone-enriched fuel | Orange with Purple bands | Label the exact mixture; the bands identify the unusual oxidizer. |
| Raw, mixed, unsorted, or unknown | Brown | Label `MIXED`, `RAW`, or `UNKNOWN`. |
| Furnace waste, combustion exhaust, or recyclable return | Brown | Label `WASTE`, `EXHAUST`, or `RETURN`; do not infer composition from Brown alone. |

## Optional condition bands

Do not replace a contents color merely because temperature or service state
changes. Where an extra warning is useful, paint occasional segments as bands
and retain the contents color on most of the run:

| Condition | Band color |
|---|---|
| Hot, high-pressure, or pre-ignited | Pink |
| Cryogenic or dedicated coolant service | Purple |
| Vacuum, outside connection, or deliberately empty | Black |

These markers are common community ideas rather than universal meanings. Add
explicit `HOT`, `CRYO`, `HIGH-P`, `VACUUM`, or `EMPTY` labels at access points.

## Usage rules

- Paint the whole run consistently, including tanks and device stubs where
  practical.
- Add a pipe label at every tank, manifold, valve bank, and cross-room entry.
- Label every Red, Green, Grey, Orange, and Yellow pure-fluid run because each
  of those colors is ambiguous in the current fluid set.
- Label mixtures with composition or purpose; color alone cannot verify a
  combustible or breathable ratio.
- Use Brown on a furnace's mixed input or waste output only with `FURNACE FEED`
  or `FURNACE WASTE` labels at both ends.
- Treat an unlabelled Yellow network as unknown until an analyzer confirms it.
- When alternating colors, establish the pattern at both ends of a long run so
  it remains recognizable even when most of the pipe is hidden.

## Version and community sources

Community conventions reviewed 2026-08-19. Fluid availability and filter
families were checked against the current community data after the Gases
Update. The repository's generated Stationpedia reference remains pinned to
game data version `0.2.6367.27532`; verify behavior in the live in-game
Stationpedia after an update.

- [Stationeers Community Wiki: Technical Standards](https://stationeers-wiki.com/Special%3AMyLanguage/Technical_Standards)
  collects several community schemes. Its filter-based tables are the basis for
  the pure-gas colors and the Khaki/Brown service choices here.
- [Stationeers Community Wiki: Gas](https://stationeers-wiki.com/Gas) lists the
  current gases, filter colors, phases, and established mixture tank colors.
- [THE kilroy's Color Coding guide](https://steamcommunity.com/sharedfiles/filedetails/?id=1398013526)
  is the older community-standardization attempt from which the wiki schemes
  developed.
- [Yet another piping/gas color thread](https://steamcommunity.com/app/544550/discussions/0/691997931545299007/)
  shows the modern Red Methane, Orange fuel, Green Nitrous Oxide, Khaki air, and
  Brown raw-gas pattern, plus component striping for mixtures.
- [Paint3 Practical Paint Palette](https://www.reddit.com/r/Stationeers/comments/1nu89jt/)
  compares a recent player palette with the wiki and real-world standards.
- [Pipe Color Codes](https://www.reddit.com/r/Stationeers/comments/ddsci8/)
  records the long-running Red Volatiles and Orange fuel convention.
- [More gases, more colors](https://www.reddit.com/r/Stationeers/comments/1rza20n/we_have_more_gases_we_need_more_color/)
  discusses labels and alternating colors after the expanded gas roster made a
  one-color-per-fluid scheme impossible.
- [`docs/prefab-hashes.md`](prefab-hashes.md) records the repository's pinned
  generated Stationpedia version and source snapshot.
