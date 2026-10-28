// Source register only. These catalog/test values never drive flight or thermal state.
export const dracoBlowerReference=Object.freeze({
 model:'BNCP-74-000',lengthM:.345,diameterM:.168,massKg:2.83,
 volumeFlowM3PerS:.0013,gasHeadM:190,maxRpm:25000,
 referenceConditions:'Catalog flow/head reference conditions not stated',
 flightDrawingConfirmed:false,
});
export const dracoElectricalSources=Object.freeze({
 feed:Object.freeze({label:'Honeybee / NASA, AMS2024: feed development and current telemetry',url:'https://www.esmats.eu/amspapers/pastpapers/pdfs/2024/adams.pdf'}),
 blower:Object.freeze({label:'Barber-Nichols: BNCP-74-000 supplier specifications',url:'https://barber-nichols.com/cryogenic-compressors-blowers/'}),
 related:Object.freeze({label:'Costa et al., 2022: lunar KArLE sample handling (different system)',url:'https://www.tighecosta.com/_files/ugd/8865be_78ab5b9dc0f34c1897151e60748e2ae1.pdf'}),
 flow:Object.freeze({label:'Honeybee / APL / NASA, LPSC2022 flow schematic',url:'https://www.hou.usra.edu/meetings/lpsc2022/pdf/1069.pdf'}),
});
export const dracoElectricalEvidence=Object.freeze([
 {id:'draco-feed-sensor-audit',name:'Feed sensing: identity unresolved',source:'feed',inspect:'drills',
  role:'The development paper reports motor-current telemetry from tests. It does not identify the flight feed sensor type, quantity, connector or pinout.',
  modeled:'Drill travel and the displayed sampling sequence are modeled, not measured feedback. No Hall sensor, encoder or limit switch has been added from an unidentified plug or test-current plot.'},
 {id:'draco-related-sensor-boundary',name:'Related sensor example: KArLE, not DrACO',source:'related',inspect:null,
  role:'The lunar KArLE sample-handling paper describes carousel Hall/optical sensing and a home switch. Its sample-retainer heritage includes DrACO; its sensor design is not established as Dragonfly hardware.',
  modeled:'These related-system sensors are not copied into the drill, carousel or vehicle. They remain a research comparison rather than a flight wiring assignment.'},
 {id:'draco-blower-supplier-audit',name:'Blower supplier model: estimated installation',source:'blower',inspect:'drill-blower',
  role:`Barber-Nichols identifies ${dracoBlowerReference.model} for DrACO: ${dracoBlowerReference.lengthM*1000} mm long × ${dracoBlowerReference.diameterM*1000} mm diameter, ${dracoBlowerReference.massKg} kg, ${dracoBlowerReference.volumeFlowM3PerS*1000} L/s, ${dracoBlowerReference.gasHeadM} m gas head and up to ${dracoBlowerReference.maxRpm.toLocaleString('en-US')} rpm. Flow/head reference conditions are not stated on that listing.`,
  modeled:'The pair now uses real engineering-model photos and the nominal supplier size. Detailed proportions, vertical placement, inlet/outlet adapters, mounts and gas routes are estimates, not a flight installation drawing. The 168 mm reference is treated as the transverse unit envelope; installed adapters and pipes extend beyond it. No hidden impeller or flight wiring is inferred. Catalog figures are references, not live readings or added payload mass. No blower voltage, power, connector or controller mapping is confirmed. Water/glycol cooling described for BNCP-21 on the same page is a different product and is not assigned to Dragonfly.'},
 {id:'draco-diverter-electrical-audit',name:'Sample-flow diverter electrical interfaces',source:'flow',inspect:'sample-lines',
  role:'The published schematic establishes sample-flow routing and redundant blower selection. It does not specify valve drive electronics, feedback sensors or flight pinouts.',
  modeled:'Existing manifold/actuator shapes are illustrative; their electrical interfaces remain unresolved. They are separate from the lander thermal trim valves. No pneumatic port is treated as an electrical feedthrough, and no extra leads or sensors are invented.'},
].map(row=>Object.freeze({...row,flightMatingConfirmed:false,hardwareAdded:false})));
export const dracoElectricalLimits=Object.freeze({
 scope:'Electrical evidence audit and supplier reference. Published functions, development tests and related hardware do not establish flight interfaces.',
 naming:'The two DrACO sample blowers, warm-air circulation fans and rotor motors are different equipment. Supplier blower rpm is not rotor rpm.',
 boundary:'Reference values do not change simulation power, mass, flow, temperature or flight dynamics. A supplier size envelope is not an installed flight drawing; unresolved interfaces stay explicitly unresolved.',
});
