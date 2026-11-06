import { bodyFoamRegions } from "./body-foam.mjs?v=dev";
import { atticInsulationRegions } from "./attic-insulation.mjs?v=dev";

// Presentation masks for existing geometry; no construction layers or hidden internals are invented.
export const globalInspectionLayers = Object.freeze([
  { id: "body-shell", label: "Body insulation (all)" },
  ...bodyFoamRegions,
  { id: "attic-shell", label: "Attic cover / insulation (all)" },
  ...atticInsulationRegions,
  { id: "camera-insulation", label: "Lower camera cavity / window surrounds" },
  { id: "hga-insulation", label: "HGA actuator dome insulation" },
  { id: "insulation", label: "Insulating foam" },
  { id: "partitions", label: "Compartment panels" },
  { id: "structural-panels", label: "Structural wall panels" },
  { id: "deck-panels", label: "Deck / attic edge" },
  { id: "flow-markers", label: "Flow markers" },
]);
export const partInspectionLayers = Object.freeze([
  { id: "equipment-casings", label: "Casings" },
  { id: "equipment-covers", label: "Covers" },
  { id: "mounts", label: "Mounts" },
  { id: "interfaces", label: "Interfaces" },
  { id: "harnesses", label: "Harnesses / lines" },
  { id: "plumbing", label: "Gas / sample tubing examples" },
  { id: "unclassified-lines", label: "Unclassified / schematic lines" },
  { id: "insulation", label: "Insulation" },
]);
export const visibilityDefaults = Object.freeze({
  hiddenLayers: Object.freeze([]), hiddenPartLayers: Object.freeze({}), onlyLayer: null,
});
export const inspectionLayerVisible = (i, id, part = null) =>
  !(part ? i.hiddenPartLayers?.[part] : i.hiddenLayers)?.includes(id);
export function setInspectionLayer(i, id, visible, part = null) {
  if (!(part ? partInspectionLayers : globalInspectionLayers).some(layer => layer.id === id)) return;
  const previous = (part ? i.hiddenPartLayers?.[part] : i.hiddenLayers) ?? [];
  const next = previous.filter(value => value !== id);
  if (!visible) next.push(id);
  if (!part) { i.hiddenLayers = next; return; }
  const parts = { ...i.hiddenPartLayers };
  if (next.length) parts[part] = next; else delete parts[part];
  i.hiddenPartLayers = parts;
}
export const restoreInspectionLayers = i => Object.assign(i, visibilityDefaults);
export const hiddenInspectionCount = i => (i.hiddenLayers?.length ?? 0)
  + Object.values(i.hiddenPartLayers ?? {}).reduce((sum, layers) => sum + layers.length, 0);

export const openInteriorLayers=Object.freeze(["body-shell","attic-shell","insulation","partitions","structural-panels","deck-panels","flow-markers"]);
// Viewing presets reuse existing surfaces/routes. None is an engineering drawing,
// a new physical insulation layer, or a complete electrical schematic.
export const inspectionAccessViews=Object.freeze([
 {id:'all',label:'All layers',hidden:[],target:null,elevation:.62,note:'Existing outer and inner model surfaces; detailed construction includes estimates.'},
 {id:'open',label:'Open interior',hidden:openInteriorLayers,target:null,elevation:.62,note:'Enclosing surfaces hidden; equipment and modeled connections retained.'},
 {id:'body',label:'Body insulation',hidden:['attic-shell','partitions','structural-panels','deck-panels','flow-markers'],target:'fuselage',elevation:.55,note:'Five surface regions, not flight tiles or volumetric foam. Use Subassembly or Inspection layers to peel individual regions.'},
 {id:'attic',label:'Attic insulation',hidden:['body-shell','partitions','structural-panels','deck-panels','flow-markers'],target:'attic',elevation:.55,note:'Removable cover surfaces. Local foam thickness, membranes and hidden construction are unmodeled.'},
 {id:'belly',label:'Belly / cold-duct cutaway',hidden:['attic-shell','body-foam-top','body-foam-port','body-foam-starboard','body-foam-ends','partitions','structural-panels','deck-panels','flow-markers'],target:'fuselage',subassembly:'body-foam-belly',elevation:-.7,note:'Estimated connected belly opening around the existing cold bypass. Edge construction, local foam thickness and flight seals are unconfirmed.'},
 {id:'harness',label:'Wiring / harness routes',hidden:openInteriorLayers,target:null,onlyLayer:'harnesses',elevation:.62,note:'Shows existing modeled wiring across assemblies. Routing and endpoints include estimates; connections are incomplete. This is not a verified electrical schematic.'},
].map(v=>Object.freeze({...v,hidden:Object.freeze([...v.hidden])})));
export function applyInspectionAccessPreset(i,preset){
  const view=inspectionAccessViews.find(v=>v.id===preset);if(!view)return;
  i.hiddenLayers=[...view.hidden];i.onlyLayer=view.onlyLayer??null;
  i.hiddenPartLayers={};
  return view;
}
export function inspectionAccessPreset(i){
  if(Object.keys(i.hiddenPartLayers??{}).length)return "custom";
  const hidden=i.hiddenLayers??[];
  return inspectionAccessViews.find(v=>(i.onlyLayer??null)===(v.onlyLayer??null)&&hidden.length===v.hidden.length&&v.hidden.every(id=>hidden.includes(id)))?.id??'custom';
}

export function visibleInspectionHardware(group) {
  let visible = false;
  group.traverseVisible(object => { if (object.isMesh) visible = true; });
  return visible;
}

export function createInspectionVisibility(subsystems) {
  const global = new Map(globalInspectionLayers.map(({ id }) => [id, []]));
  const parts = new Map();
  const nonHarnessMeshes=[];
  const add = (id, object) => { if (object) global.get(id).push(object); };
  add("body-shell", subsystems.fuselage);
  add("attic-shell", subsystems.attic);
  add("structural-panels", subsystems["starboard-wall"]);
  add("structural-panels", subsystems["port-wall"]);
  add("structural-panels", subsystems["wall-end-joints"]);
  add("deck-panels", subsystems["top-deck"]);
  for (const name of ["nose-bulkhead", "aft-bulkhead"]) add("partitions", subsystems[name]);
  for (const name of ["airflow", "sample-flow"]) add("flow-markers", subsystems[name]);
  for (const [name, group] of Object.entries(subsystems)) {
    const layers = new Map(partInspectionLayers.map(({ id }) => [id, []]));
    group.traverse(object => {
      if(object.isMesh){
        let ancestor=object,wiring=false;
        while(ancestor){if(ancestor.userData.inspectionLayer==='harnesses'){wiring=true;break;}if(ancestor===group)break;ancestor=ancestor.parent;}
        if(!wiring)nonHarnessMeshes.push(object);
      }
      const category = object.userData.inspectionLayer;
      if (global.has(object.userData.inspectionGlobalLayer)) add(object.userData.inspectionGlobalLayer, object);
      if (bodyFoamRegions.some(({ id }) => id === object.userData.bodyFoamRegion)) add(object.userData.bodyFoamRegion, object);
      if (atticInsulationRegions.some(({ id }) => id === object.userData.insulationRegion)) add(object.userData.insulationRegion, object);
      if (category === "insulation") add("insulation", object);
      if (category === "interface-faces") add("partitions", object);
      if (layers.has(category)) layers.get(category).push(object);
    });
    parts.set(name, layers);
  }
  // The single navigation link is shared inspection context, not duplicated geometry.
  const navigation=parts.get("navigation-meb-link");
  if(navigation)for(const owner of ["nose-electronics","main-harness"]){
    const target=parts.get(owner);if(!target)continue;
    for(const [category,objects]of navigation)target.get(category).push(...objects);
  }
  const radio=parts.get('radio-harness-link');
  if(radio)for(const owner of ['frontier-radio','main-harness']){
    const target=parts.get(owner);if(!target)continue;
    for(const [category,objects]of radio)target.get(category).push(...objects);
  }
  return {
    available: (id, part = null) => !!(part ? parts.get(part)?.get(id) : global.get(id))?.length,
    apply(inspector, previous) {
      const hide = object => {
        if (!previous.has(object)) previous.set(object, object.visible);
        object.visible = false;
      };
      if(inspector.onlyLayer==='harnesses')for(const object of nonHarnessMeshes)hide(object);
      for (const id of inspector.hiddenLayers ?? []) for (const object of global.get(id) ?? []) hide(object);
      for (const [part, ids] of Object.entries(inspector.hiddenPartLayers ?? {})) {
        for (const id of ids) for (const object of parts.get(part)?.get(id) ?? []) hide(object);
      }
    },
  };
}
