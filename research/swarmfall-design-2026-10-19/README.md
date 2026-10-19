# Swarmfall — RTS, space, drone and free-roam design study

October 19, 2026 — Codex (OpenAI). Planning/research, not implemented gameplay.
Canonical tasks live in [SWARMFALL-TODO.md](../../SWARMFALL-TODO.md), sections 28–35.
The campaign, downloaded assets, previous environment passes and public lab are retained.

## Reference games and what they suggest

These are selected design references, not purchase recommendations. Descriptions in the
second column come from developer/publisher documentation reviewed October 19. The third
column contains **our proposed adaptations**; it does not claim those games implement them.
No game was installed or played for this document. This is a documentation/design review.

| Reference | Documented feature worth studying | Proposed Swarmfall adaptation |
| --- | --- | --- |
| [Homeworld 3 — developer combat update](https://www.homeworlduniverse.com/dev-update-unpacking-the-biggest-improvements-coming-to-update-1-3/) | Group attack can split formations and distribute fire by useful target matchups; the update also emphasizes dependable orders | Drone roles share targets intelligently, with visible stances and explicit player orders taking precedence |
| [Homeworld: Deserts of Kharak — publisher description](https://store.steampowered.com/app/281610/Homeworld_Deserts_of_Kharak/) | High ground, dune-line ambushes, large terrain and attacks on resource operations | Low sheltered drone routes versus high exposed transit; valleys, terraces and supply corridors that matter to capture |
| [Supreme Commander 2 — official controls](https://www.supremecommander2.com/na/system/controls.html) | Strategic zoom, queued orders, tracking, guard, patrol, repair and reclaim | Keep one readable operation across close-up drones and strategic icons; make routine squad jobs dependable before increasing army size |
| [Beyond All Reason — advanced mechanics](https://www.beyondallreason.info/guide/important-knowledge-on-advanced-mechanics) | Radar contacts differ from direct vision; reconnaissance counters interference; reclaim/repair support front-line operations | Unknown contacts, last-known positions, scout tagging, optional relay coverage, and rescue-versus-salvage decisions |
| [Planetary Annihilation: TITANS — publisher description](https://store.steampowered.com/app/386070/Planetary_Annihilation_TITANS/) | Land/sea/air/orbital theaters, multi-planet scale, automation and a generated Galactic War | Distinct planet profiles, orbital support and a persistent territory overview; grow from one planet rather than simulate an entire system immediately |
| [Carrier Command 2 — publisher description](https://store.steampowered.com/app/1489630/Carrier_Command_2/) | Radar intelligence, resources/supply lines and switching from command into individual vehicles | Possess an actual squad drone, do a useful precision action, then return to the same RTS battle; the rest of the swarm follows its assignments |
| [TerraTech — official FAQ](https://terratechgame.com/support/) and [Blockpedia](https://terratechgame.com/blockpedia/) | Vehicle construction from functional parts, with scavenging and flight/support/weapon components | Prove equipment roles first, then allow modular drones with mass, lift, power, size and vulnerability tradeoffs |

The exact **Tank Wars** title/version is still unspecified. The owner's established intent
is a future configurable drone builder; retain that label and clarify the exact reference
when builder implementation begins. TerraTech is an additional documented comparison,
not an assumption about which Tank Wars the owner meant.

Earlier visual references remain: Skyrim's place identity; Minecraft cities' scale and
infrastructure without a voxel look; Spider-Man's continuous urban fabric; Crackdown's
verticality and destruction ambition; Dragon Ball Z: Kakarot's regional vistas and rounded
forms; Synty Elven Realm's intricate fantasy composition. This document adds mechanics
research; it does not establish new factual claims about those earlier games' destruction.

## Proposed identity

**Scout → relay → hijack → deploy → recover → press on or extract.**

A small swarm can exploit a city differently from an infantry army: see through remote
sensors, occupy vertical routes, share information, disable infrastructure, recover machine
parts, and temporarily become the player's viewpoint. Those actions should connect to the
existing matter, capture/alarm, drops and campaign systems.

Six connected ideas deserve prototypes:

1. **Reconnaissance has value.** An unconfirmed radar contact shows a location/uncertainty,
   not perfect enemy identity. A scout scan reveals an anti-air position or false transmitter.
   Active scans reveal the scanner briefly; a slower passive approach remains possible.
2. **The swarm is a network.** A rooftop relay improves shared intelligence or enables a
   selected service. A jammer creates an explainable local problem. Drones retain their
   orders if disconnected and offer a safe return; controls never become artificially delayed.
3. **Small machines use different routes.** Low transit can hide behind architecture; high
   transit is faster but exposed. A compact scout can use an authored service opening that a
   large carrier cannot. Start with two altitude policies and a few marked openings.
4. **Landing creates a foothold.** After multiple pods arrive, an explicitly landed piece of
   pod hardware can be reclaimed or converted into a relay/service point. Its visible location
   gives a reason to defend, relocate or abandon the landing court.
5. **Losses leave opportunities.** A disabled drone emits a recovery beacon. Rescue its body,
   recover its software/black box, or salvage its matter. These are mutually exclusive outcomes
   with one-time rewards. Losing a recovery opportunity creates no additional campaign debt.
6. **Capture changes how the place works.** A Link can reroute one power junction to suppress
   radar, open a gate or power a shelter. Keep the network small and explicit. Destroying it
   must leave a route to required objectives, with consequences visible before attacking.

The recommendation is to test four or fewer new interacting rules in one small mission.
Initially use matter and at most one new tactical constraint. Energy, signal, heat, ammunition
and maintenance should not arrive as five simultaneous upkeep systems.

## Make the environments playable places

The current four damage stages are visual previews. Scenario starts can use those appearances;
local damage, route changes and persistent services still require the ENV/CITY rule work.

| Environment | Candidate scenario | Actual player choice | Bounded first implementation |
| --- | --- | --- | --- |
| Alien arcology | Reroute the energy rings | Power a safe landing court, disable a shield or open an aerial route | Four junctions, a small service graph and illuminated affected ring segments |
| Metropolis | Keep the district functioning | Disable defenses while preserving repair/public services, or breach directly | Three marked services, readable consequences and two valid approaches |
| Tidal citadel | Secure crossings through a tide change | Take an exposed short route, use upper terraces or repair a gate | A few scheduled route states, waterline markers and a permanently safe retreat |
| Skyway megacity | Open an arrival corridor | Elevated risky arrival near the target, coastal staging, or a captured transit route | Three authored approaches; preview all pods' courts/fallbacks before paying |
| Phototextured city | Find the real command network | Scan clues and disable the real relay quietly, or assault known defenses | Three deterministic clues and one decoy; identified buildings keep visible badges |
| Off-world ruin or station, later | Recover alien equipment | Carry a useful module out or use the capacity for reinforcements | One small authored site using current drone controls; no separate space-flight game required |

Candidate modules can give each civilization a mechanical identity: shield emitter, repair
tool, weather-resistant package, maneuvering thruster, or sensor jammer. Begin with two
mutually exclusive choices in one slot. Stock drones remain useful. A complete arbitrary
builder follows only after those roles produce good decisions.

## Proposed free-roam planetary conquest

The owner's additional request is a more open planet-capture mode with better graphics,
available alongside the starting campaign. Extend the existing MODE-01/02/03 concept into
a **persistent planetary operation**, rather than only randomizing a short capture arena.

### Player loop

1. Choose **Campaign** or **Free Roam**. Free Roam has a separate persistent world/profile;
   starting it cannot replace a campaign checkpoint without a clear deliberate action.
2. Inspect a planet overview with terrain, regions, visible infrastructure, claimed territory
   and reconnaissance uncertainty. Pick an initial landing site and a stock drone loadout.
3. Land with multiple pods and move freely through the active terrain/city region in RTS or,
   once implemented, pilot view. Discover landmarks, service nodes, defenders and recoveries.
4. Capture useful sites, establish relay/service points and push into neighboring territory.
   Ownership depends on explicit command sites and objectives, not visiting every square meter.
5. Travel to the next region through a mapped boundary/transition. Retain squads, orders that
   remain valid, inventory and the territory already changed. Show travel time/cost in advance.
6. Return to an earlier district and see its captured services and local damage. Pausing or
   closing the browser does not secretly simulate hours of enemy reconquest.
7. Secure the planet's declared command-network goal, then choose extraction/victory or keep
   exploring and capturing. A 100% completion view lists meaningful remaining sites, not rubble.

### World scale and streaming

Use two levels of representation: a lightweight planet overview and detailed local regions.
The first free-roam slice can have **three connected regions**: coast/landing, settlement or
city district, and an uplink/ruin. This is a proposed scope, not a claim that the map exists.

Keep the full skyline and terrain horizon as inexpensive context. Load detailed terrain,
architecture and active simulation near the swarm; retain distant territory as compact state.
Start with clear, quick region transitions. Continuous boundary crossing can replace those
later after profiling. Seamless travel around a fully detailed spherical planet is a separate
large undertaking, not a prerequisite for this mode or the first graphics improvement.

An adjacency graph connects regions and roads/flight corridors. A stable seed and version
define the layout; ownership, discoveries, destroyed structures, service choices, recoveries
and extraction state form saved deltas. An inactive region uses an explicit bounded strategic
model only while the operation is running. Threat buildup is warned; the player can pause,
defend or intercept. A required retreat/landing route must remain available.

Within one active region, keep dimensions consistent with drones, roads and the existing
city coordinate contract. Use origin shifting only if tested world scale needs it. Separating
the overview from local regions avoids forcing spherical movement into current battle rules.

### Better graphics tied to gameplay

First build one polished place: coherent terrain contours and shoreline, physically readable
materials, deliberate lighting, atmospheric depth, contact shadows and a detailed foreground.
Borrow the strongest existing art direction for each world rather than recoloring the same city.

Use modular pieces with authored layout rules: connected roads, believable supports, gateways,
public/service spaces and recognizable landmarks. The five city assets can become different
settlements or civilizations. Repeatable procedural layouts need validation for reachable
capture sites and safe pod courts before entering the world.

Near drones need clear animation, lighting, rotor motion, dust/water response and weapon
impacts. Mid-distance streets need useful silhouettes and navigation cues; distant skyline
can use lower detail. High and Light settings should preserve strategic information. Add
expensive reflections, volumetric effects or higher shadows only after actual device profiles.
A readable, smoothly running district is the first graphics target; photorealism is not promised.

### Capture rules worth testing

- **Different site functions:** communications improves knowledge; fabrication helps repairs
  or reinforcement; shelters reduce environmental exposure; transport unlocks a route.
- **Two viable approaches:** a direct destructive breach or slower Link/control route, with
  outcomes that affect services and local response rather than an unexplained reward penalty.
- **Connected footholds:** a supply/relay line can strengthen territory, while isolated squads
  keep autonomy and an exit. Avoid requiring every capture to be linked in a tedious chain.
- **Understandable response:** defenders react to observed incursions and important sites,
  with visible preparation and bounded pressure. No omniscient counterattack at every remote node.
- **Meaningful completion:** command cores and regional control establish planetary victory;
  optional research, rescues and landmarks give reasons to stay. Rewards settle once.

## Immersion that helps decisions

- **Space continuity:** the same planet identity appears in briefing, orbital Hive silhouette,
  entry/descent, sky and extraction. Cameras are skippable and do not hide active combat.
- **Planet-specific flight:** dense atmosphere, thin atmosphere and vacuum use distinct
  deployment/propulsion profiles. Parachutes and rotors should not be shown doing aerodynamic
  work in vacuum; future airless missions can use thrusters and powered landings.
- **Sensor viewpoint:** readable telemetry, gimbal/aim behavior, identity and damage cues make
  pilot view feel like a drone. Optional thermal or signal overlays show only modeled data.
- **Sound with meaning:** spatial motors, changing load, impacts, distant defenses, pod arrival
  and restrained machine acknowledgements. Pair all critical sound with visual feedback.
- **Living surroundings:** transport, local aircraft, lights, evacuation/shelter behavior and
  alien wildlife reflect actual local state at a bounded cost. Ambient traffic is decoration
  unless explicitly modeled as an interactable service; required gameplay stays clear.
- **Physical consequence:** downwash, settled debris, powered/offline structures and damaged
  modules correspond to the state. Avoid arbitrary camera shake or long obscuring static.
- **Operations history:** named squads, recovered black boxes, changed landmarks and a compact
  after-action territory view let the player understand what happened to their swarm and world.

## Suggested prototype sequence and acceptance

| Pass | Deliverable | What decides whether it stays |
| --- | --- | --- |
| A | Existing multiple-pod and victory/continue requests, saved correctly | No duplicated units/rewards; continuing and extracting both work |
| B | Reliable movement/orders plus basic audio/rotor/impact feedback | A new player understands orders, threats and losses; acceptable device frame times |
| C | One city district with a scout, one relay and one two-choice service | Players find at least two viable approaches; disruption has a readable recovery path |
| D | Three-region free-roam operation with persistent captures and return travel | Travel, reload, territory and damage remain consistent; no inaccessible required site |
| E | One support/recovery interaction and real drone possession | Both command and pilot play can finish the mission; remaining squads behave sensibly |
| F | Small equipment loadouts, then the larger builder and more worlds | Different builds have distinct useful roles, counterplay and compatible saves |

Record travel downtime, stalled orders, loss/recovery, matter flow, time to first meaningful
decision, alternate-route use, frame-time percentiles and what the player understood. Compare
with the existing campaign as a baseline; do not invent pass numbers before measurements.
Retain prototypes and screenshots even when an idea is deferred. This study adds planning
only; it changes no game rules, runtime graphics, downloads, saves or public deployment.
