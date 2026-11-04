// Environments built from the shared kit (kit/). Each world module loads only when chosen and
// exports build(context) -> { group, target, moving: [], animate?, setDusk?, tour?, bounds?,
// floor?, ceiling?, status?, noDamage? }. The lab reads `info` before loading, for its panel.
// A world that varies by query (planets) may also return title?, description?, views? and
// choices?: [{ href, label, current }], which the lab applies after building.
// views: [camera position, look-at target] for the Vista, District and Street buttons.
export const moduleWorlds = {
  metropolis: {
    info: {
      title: "Metropolis", span: "3.2 km city with river, rail and harbor",
      description: "Every downtown building is assembled from modular kit parts with its own style, height, window rhythm, storefronts and rooftop, around one-of-a-kind towers, a river with bridges, an elevated rail loop, parks and moving traffic. Try Dusk.",
      credit: "Modular buildings assembled from Quaternius' Downtown City MegaKit parts (CC0). Skyline towers, streets, river, bridges, rail, stadium, harbor, traffic and textures are original procedural art by Claude.",
      sky: [0x4f86ad, 0xd6dccb], ground: 0x707a6c, sun: 0xffe8c8, fog: 0.00016,
      views: { vista: [[1480, 760, 1560], [0, 60, 0]], district: [[210, 120, 260], [0, 30, 0]], street: [[38, 4, 62], [10, 20, -60]] },
    },
    load: () => import("./metropolis.mjs?v=dev"),
  },
  orbital: {
    info: {
      title: "Orbital ring", span: "1.6 km habitat wheel over a gas giant", ownSky: true,
      description: "Visual study, not yet placed in the story or sized as a battle map: a turning habitat wheel with fields, lakes, towns and wall cities on its inner floor, a docking hub, solar wings and shuttle traffic, above a banded gas giant. The Street view stands on the floor where the land curves up into the sky.",
      credit: "Original procedural station, ships, planet and star field by Claude. Visual study; dimensions invented.",
      sky: [0x02030a, 0x0a1022], ground: 0x101826, sun: 0xfff1dc,
      views: { vista: [[2900, 1700, 2600], [0, 900, 0]], district: [[700, 1100, 1250], [0, 900, 0]], street: [[30, 106, -40], [0, 190, 420]] },
    },
    load: () => import("./orbital.mjs?v=dev"),
  },
  asteroids: {
    info: {
      title: "Asteroid colony", span: "Mining colony in a 3 km debris field", ownSky: true,
      description: "A hollowed asteroid ringed with habitat modules, mining rigs and ore conveyors, surrounded by a drifting debris field and haulers under a violet nebula.",
      credit: "Original procedural asteroids, habitats, rigs, haulers and nebula by Claude. Visual study; dimensions invented.",
      sky: [0x07040f, 0x1a0e2a], ground: 0x1a1420, sun: 0xffe2c4,
      views: { vista: [[820, 520, 940], [0, 290, 0]], district: [[420, 360, 470], [0, 300, 0]], street: [[330, 312, 150], [0, 300, 0]] },
    },
    load: () => import("./asteroids.mjs?v=dev"),
  },
  titan: {
    info: {
      title: "Titan Hive outpost", span: "Swarm base on the simulator's real Titan dunes", ownSky: true,
      description: "The Swarmfall Hive dug in at Ahmakiq Undae: drop pods under the simulator's parachutes, Hive spires, landing pads, habitat domes, hovering drone squads and NASA's Dragonfly, all on the Dragonfly simulator's Titan terrain and haze.",
      credit: "Titan terrain, aeroshell and parachutes, Dragonfly research model and drone models from this project's simulator and game. Hive structures and domes are original procedural art by Claude.",
      sky: [0x8a5a30, 0xc9955a], ground: 0x4d3522, sun: 0xffc98c,
      views: { vista: [[120, 55, 135], [0, 10, 0]], district: [[62, 26, 74], [0, 9, 0]], street: [[20, 3.5, 30], [0, 8, 0]] },
    },
    load: () => import("./titan.mjs?v=dev"),
  },
  oldtown: {
    info: {
      title: "Walled market town", span: "Hill town, castle, river and farms",
      description: "A fortified hill town grown from Kenney's fantasy parts: timber-and-stone houses with varied roofs, a market square of stalls and carts, a castle keep, a windmill and a watermill with turning sails and wheel, and farmland outside the walls. Try Dusk.",
      credit: "Walls, windows, doors, eaves, banners, stalls, carts, fountain, lanterns, trees, hedges, rocks, windmill sails and water wheel from Kenney's Fantasy Town Kit 2.0 (CC0). Town plan, roofs, terrain, town walls, castle, mills and fields are original procedural art by Claude.",
      sky: [0x5d8fbf, 0xdbe2d2], ground: 0x5f7d4a, sun: 0xfff0d2, fog: 0.00022,
      views: { vista: [[300, 170, 360], [0, 18, -30]], district: [[95, 48, 120], [0, 14, 0]], street: [[3, 12.5, 120], [0, 15, 30]] },
    },
    load: () => import("./oldtown.mjs?v=dev"),
  },
  forge: {
    info: {
      title: "Forge city", span: "Industrial city over lava rivers",
      description: "Foundries, smoke stacks, blast furnaces and cooling towers on basalt terraces between glowing lava channels, crossed by heavy bridges and an ore railway, under an ash-red sky and smoking volcanoes. A setting for the volcanic world Ashfall. Try Dusk.",
      credit: "Original procedural architecture, lava, smoke, embers and terrain by Claude. Visual study; dimensions invented.",
      sky: [0x2a0f0a, 0x8a3a20], ground: 0x2b2523, sun: 0xffb27a, fog: 0.00026,
      views: { vista: [[900, 460, 980], [0, 40, 0]], district: [[240, 120, 280], [0, 30, 0]], street: [[30, 26, 120], [0, 34, 0]] },
    },
    load: () => import("./forge.mjs?v=dev"),
  },
  planets: {
    info: {
      title: "Campaign planets", span: "Swarmfall battle maps from the game's own rules", ownSky: true,
      description: "Each campaign planet and Frontier map as a mission plays it: the game's terrain, liquids, colors and fog, Aurex's solid skyline, the Frontier cities and the capture zones a new mission places. Pick a planet below.",
      credit: "Terrain, zones, skyline, cities, colors and light come from the game's own modules (planet-terrain, battle, city-render, scene). Brought over from the independent asset studio's campaign-terrain previews. Rocks, trees, defenders and the Hive beacon are not drawn.",
      sky: [0xc4733f, 0xf3c98f], ground: 0x7a4a2a, sun: 0xfff0d8,
      views: { vista: [[480, 320, 520], [0, 0, 0]], district: [[180, 120, 210], [0, 0, 0]], street: [[-260, 12, 260], [0, 10, 0]] },
    },
    load: () => import("./planets.mjs?v=dev"),
  },
};
