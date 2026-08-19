# Pipe color map

Use this convention to identify pure gases, liquids, and common process mixes
at a glance. Pipe labels at tanks, valves, and junctions remain authoritative;
paint is a visual aid, not proof of current contents.

## Available paints

The standard palette is Black, Blue, Brown, Green, Grey, Khaki, Orange, Pink,
Purple, Red, White, and Yellow.

The Metallic Spray Paints DLC adds Bronze, Gold, Obsidian, and Silver. Because
their finish is unusually bright, this map uses them only for relatively rare
pure substances: Bronze for Hydrazine and Silver for Helium. Gold and Obsidian
remain unassigned.

Newly placed or unpainted pipes appear Yellow. In this convention, bare Yellow
is not treated as an intentional status because it is visually identical to the
assigned Pollutant and waste color.

## Pure gases

Every gas-phase substance has a unique color. Methane and Hydrogen are separate
gases; `Volatiles` was renamed to Methane in the Gases Update.

| Gas | Formula or game symbol | Paint | Rationale |
|---|---|---|---|
| Oxygen | O₂ | White | Matches the established oxygen equipment color. |
| Hydrogen | H₂ | Red | Matches the hydrogen filter/canister family. |
| Methane | CH₄ | Orange | Keeps the combustible hydrocarbon family visually warm while remaining distinct from Hydrogen. |
| Nitrogen | N₂ | Black | Matches the nitrogen filter convention and leaves Green available for acid. |
| Carbon Dioxide | CO₂ | Grey | Matches the carbon-dioxide filter and chemistry convention. |
| Pollutant | X | Yellow | Matches the pollutant warning/filter convention. |
| Nitrous Oxide | N₂O | Pink | Unique oxidizer color, distinct from Nitrogen and Ozone. |
| Ozone | O₃ | Purple | Matches the ozone filter convention. |
| Helium | He | Silver | Metallic neutral for the fully inert gas. |
| Hydrazine | N₂H₄ | Bronze | Unique metallic fuel/hazard color. |
| Hydrochloric Acid | HCl | Green | Matches the hydrochloric-acid filter convention. |
| Silanol | Sil | Brown | Matches the dark-brown silanol convention. |
| Steam | H₂O | Blue | Shares the water family color across phases. |

## Pure liquids

A substance that has both gas and liquid phases keeps the same color in both
tables. Liquid-only substances reuse a standard color only where the visual or
process association is useful; pipe type and labels distinguish the contents.

| Liquid | Formula or game symbol | Paint |
|---|---|---|
| Water | H₂O | Blue |
| Polluted Water | PH₂O | Yellow |
| Liquid Oxygen | O₂ | White |
| Liquid Hydrogen | H₂ | Red |
| Liquid Methane | CH₄ | Orange |
| Liquid Nitrogen | N₂ | Black |
| Liquid Carbon Dioxide | CO₂ | Grey |
| Liquid Pollutant | X | Yellow |
| Liquid Nitrous Oxide | N₂O | Pink |
| Liquid Ozone | O₃ | Purple |
| Liquid Hydrazine | N₂H₄ | Bronze |
| Liquid Hydrochloric Acid | HCl | Green |
| Liquid Silanol | Sil | Brown |
| Alcohol | ALC | Orange |
| Liquid Sodium Chloride | NaCl | White |

Helium has no liquid phase. Alcohol and Sodium Chloride have no gas phase in
the game.

## Mixtures and service lines

Mixtures may reuse a component-family color, but must be labelled with their
actual purpose or composition.

| Service | Paint | Notes |
|---|---|---|
| Breathable air | White | Shares Oxygen's color; label the verified breathing mix `AIR`. |
| Standard fuel mix | Orange | Label the actual fuel and oxidizer because combustion is mixture-dependent. |
| Nitrous fuel / HydroNox | Pink | Echoes the Nitrous Oxide component. |
| Ozone-enriched fuel | Purple | Echoes the Ozone component. |
| Raw, mixed, unsorted, or unknown | Khaki | Dedicated standard color for material awaiting analysis or separation; label it `MIXED`, `RAW`, or `UNKNOWN`. |
| Furnace waste or combustion exhaust | Yellow | Treat as contaminated until analyzed and separated; label `WASTE` or `EXHAUST` to distinguish it from pure Pollutant. |
| Vacuum, unused, or not commissioned | Black | Deliberately empty or unavailable; label it `EMPTY` or `VACUUM` to distinguish it from pure Nitrogen. |

## Usage rules

- Paint the whole run consistently, including tanks and device stubs where
  practical.
- Add a pipe label at every tank, manifold, valve bank, and cross-room entry.
- Label mixtures with composition or purpose; color alone cannot distinguish a
  pure component from a related mixture.
- Use Khaki on a furnace's mixed input or unsorted collection manifold and
  Yellow on its waste output. Add `FURNACE FEED`, `FURNACE WASTE`, or equivalent
  labels at both ends.
- Do not encode temperature or pressure with the contents color. Those values
  can change without the pipe being repainted. Use insulated pipe, warning
  signs, displays, or explicit labels such as `HOT`, `CRYO`, and `HIGH-P`.
- Do not use Purple as a generic danger color in this convention; it identifies
  Ozone and ozone-bearing fuel.
- Paint a drained or decommissioned run Black and label it `EMPTY` before
  reusing it for another substance.

## Version and sources

Checked 2026-08-18 against live Stationeers build `0.2.6428.27798`. The fluid
inventory and paint prefabs were cross-checked against generated Stationpedia
data `0.2.6367.27532`; subsequent official updates through the checked live
build did not add another fluid or paint color.

- [The Gases Update](https://steamcommunity.com/app/544550/announcements/) added
  Hydrazine, Helium, Sodium Chloride, Alcohol, Hydrogen, Silanol, Ozone, and
  Hydrochloric Acid and renamed Volatiles to Methane.
- [Metallic Spray Paints](https://store.steampowered.com/app/4842920/Stationeers_Supporters_Metallic_Spray_Paints/)
  adds Gold, Silver, Bronze, and Obsidian.
- [`docs/prefab-hashes.md`](prefab-hashes.md) records the repository's pinned
  generated Stationpedia version and source snapshot.
