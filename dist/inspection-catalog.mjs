// Stable inspection IDs. Original interior 1–24 stay fixed; added top-level
// structure/access assemblies append to them. Shared context/fasteners are not new parts.
export const inspectionPartIds=Object.freeze([
 'drills','sample-lines','nose-bulkhead','nose-cameras-inside','nose-electronics',
 'sample-carousel','wonderwall','drams','rde','hga-actuators','power-units','iem',
 'frontier-radio','twta','battery','aft-bulkhead','fan','underfloor-duct','trim-chimneys',
 'battery-sensor','mmrtg-sensor','nose-sensors','side-cameras','drill-blower',
 'fuselage','attic','starboard-wall','port-wall','wall-end-joints','top-deck','mmrtg','main-harness',
]);
const ids=new Map(inspectionPartIds.map((name,i)=>[name,i+1]));
export const inspectionPartNumber=part=>ids.get(typeof part==='string'?part:part?.name)??null;
export const numberedInspectionParts=subsystems=>inspectionPartIds.map(id=>subsystems[id])
 .filter(group=>group&&(group.userData.label||group.userData.inspectionTitle));
