// Draws a city district (city-layout.mjs) in the battle scene: streets, sidewalks, paved squares,
// parks, and every building as merged facade boxes in tiers, with rooftop gear. Uses the
// Environment Lab's kit (procedural facades, no downloads), sized for phones: buildings merge into
// one mesh per facade style. The same layout drives the rules, so what you see is what blocks.
import { THREE, rng, Batches, Massing, paint, unitBox, unitCylinder, unitCone } from "./environments/kit/core.mjs?v=dev";
import { facadeMaterials, roofMaterial, groundPatch, tree } from "./environments/kit/scenery.mjs?v=dev";

const TILE = { residential: [9, 9], brick: [10, 12], deco: [10, 12] };

export function buildCity(parent, city, { high = true } = {}) {
  const group = new THREE.Group();
  group.name = "City";
  parent.add(group);
  const y0 = city.ground, random = rng(city.seed * 31 + 7);
  const span = city.half * 2;
  // Sidewalk slab under everything, asphalt streets, paved squares and grassy parks on top.
  groundPatch(group, "sidewalk", city.x, city.z, span + 24, span + 24, y0 + 0.04, 8);
  for (const street of city.streets) {
    const along = street.x1 === street.x2;
    groundPatch(group, "asphalt", (street.x1 + street.x2) / 2, (street.z1 + street.z2) / 2,
      along ? street.width : Math.abs(street.x2 - street.x1) + street.width, along ? Math.abs(street.z2 - street.z1) + street.width : street.width, y0 + 0.08, 20);
  }
  for (const plaza of city.plazas) groundPatch(group, "plaza", plaza.x, plaza.z, city.block, city.block, y0 + 0.12, 6);
  const details = new Batches(group, { shadows: false });
  for (const park of city.parks) {
    groundPatch(group, "grass", park.x, park.z, park.size, park.size, y0 + 0.12, 12);
    for (let k = 0; k < (high ? 40 : 18); k += 1) tree(details, park.x + (random() - 0.5) * park.size * 0.9, y0 + 0.12, park.z + (random() - 0.5) * park.size * 0.9, 6 + random() * 6, random);
  }
  // Buildings, tier by tier, into one merged mesh per facade style and variant.
  const massing = new Massing(), wallMaterials = {};
  const gray = paint(0x9ea3a4, { rough: 0.6 }), steel = paint(0xb0b6ba, { metal: 0.8, rough: 0.3 }), wood = paint(0x6e5136, { rough: 0.9 });
  for (const building of city.buildings) {
    const key = `${building.facade}/${building.variant}`;
    wallMaterials[key] ??= facadeMaterials(building.facade, building.variant).day;
    for (const tier of building.tiers) massing.box(key, "roof", building.x, y0 + tier.y, building.z, tier.w, tier.h, tier.d, 0, TILE[building.facade] || [12, 12]);
    const top = building.tiers.at(-1), roofY = y0 + building.height;
    for (let k = 0, n = Math.floor(random() * 4); k < n; k += 1) {
      details.put(unitBox(), gray, building.x + (random() - 0.5) * top.w * 0.6, roofY, building.z + (random() - 0.5) * top.d * 0.6, 0, 2 + random() * 3, 1 + random() * 1.5, 2 + random() * 2);
    }
    if (building.height < 45 && random() < 0.3) {
      details.put(unitCylinder(12), wood, building.x, roofY + 3, building.z, 0, 2.2, 4, 2.2);
      details.put(unitCone(12), steel, building.x, roofY + 7, building.z, 0, 2.4, 1.5, 2.4);
    }
    if (building.height > 70) details.put(unitCylinder(6), steel, building.x, roofY, building.z, 0, 0.3, 10 + random() * 20, 0.3);
  }
  massing.build(group, wallMaterials, { roof: roofMaterial("#6e6c66"), default: roofMaterial("#6e6c66") });
  details.finish();
  return group;
}
