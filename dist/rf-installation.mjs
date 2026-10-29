// Evidence review of existing hardware only; no RF solver or new flight wiring.
export const rfInstallationSources=Object.freeze({
 spacecraft:Object.freeze({label:"NASA Dragonfly spacecraft: radio, TWTA and antennas",url:"https://science.nasa.gov/mission/dragonfly/spacecraft-and-instruments/"}),
 arm:Object.freeze({label:"NASA/APL July 2026: real antenna arm and stow operation",url:"https://science.nasa.gov/blogs/dragonfly/2026/07/09/nasas-dragonfly-clears-key-tests-as-titan-rotorcraft-takes-shape/"}),
 radio:Object.freeze({label:"NASA/APL real Frontier radio photograph",url:"https://science.nasa.gov/image-detail/amf-48b4901b-44b0-4c89-802b-0c615842aa09/"}),
 reference:Object.freeze({label:"NASA LRO TWTA hardware reference (not Dragonfly hardware)",url:"https://ntrs.nasa.gov/citations/20100012836"}),
});
export const rfInstallationRows=Object.freeze([
 {id:"rf-radio-jumpers",name:"13 · Radio local jumpers",source:"radio",inspect:"frontier-radio",subassembly:"frontier-radio-rf-lines",medium:"RF",
  role:"Real Frontier hardware provides the appearance reference for the short coaxial jumpers.",
  modeled:"The three local jumpers are retained estimates. They are separate from the bay lead at J22; the photo does not establish the flight circuit of each labeled port."},
 {id:"rf-input",name:"13 → 14 · Radio to amplifier",source:"spacecraft",inspect:"twta",medium:"RF",
  role:"NASA identifies the Frontier X-band radio and a 100 W traveling-wave tube amplifier in Dragonfly's communications system.",
  modeled:"The existing small coax joins the modeled radio's J31 to the TWTA input. J31 assignment, plugs, cable size and installed route are estimates. A geometric join does not verify the flight signal path or RF performance."},
 {id:"rf-hv",name:"14 · Tube power conditioner",source:"reference",inspect:"twta",medium:"high-voltage power",
  role:"Related flight TWTA hardware uses a separate electronic power conditioner and an umbilical to the tube. This is a reference architecture, not an identified Dragonfly unit.",
  modeled:"The retained braided umbilical is electrical power, not an RF feed. Dragonfly's actual supplier, voltages, flight harness and connector details remain unconfirmed. The bay bus lead is a separate estimated power example."},
 {id:"rf-waveguide",name:"14 → 10 · Fixed output waveguide",source:"spacecraft",inspect:"twta",medium:"RF",
  role:"The amplifier and high-gain antenna have published communications roles; their detailed flight interconnection is not specified by this NASA overview.",
  modeled:"The existing rectangular waveguide and two hangers run under the top deck to the estimated gimbal flange. Section, bends, flange sizes and routing are illustrative. A flange contact is not verification of a hollow RF passage, seal, waveguide mode or measured loss."},
 {id:"rf-hidden-transition",name:"10 · Hidden gimbal transition — open",source:"arm",inspect:"hga-actuators",medium:"RF transition unresolved",
  role:"The real arm photograph and NASA description establish the moving antenna assembly and its stow-before-flight operation. They do not reveal the complete internal RF route.",
  modeled:"The fixed lower flange and the visible arm feed are separate modeled pieces. The path through the azimuth/elevation mechanisms is not reconstructed. Rotary-joint internals, flex section and flight interfaces remain unresolved; do not read the model as a complete connected feed."},
 {id:"rf-moving-feed",name:"10 · Visible arm feed",source:"arm",inspect:"hga-actuators",medium:"RF appearance example",
  role:"A real NASA/APL arm photograph is the appearance reference for the visible flexible-looking feed near the antenna pedestal.",
  modeled:"This existing feed moves rigidly with the elevation arm. Its shape and length do not deform as the antenna deploys. That is a rendering simplification, not a cable-flex, fatigue, bend-radius or cryogenic qualification model."},
 {id:"rf-drive",name:"10 · Gimbal actuator lead",source:"arm",inspect:"hga-actuators",medium:"actuator electrical example",
  role:"Antenna movement requires actuation; the published photograph does not provide the installed motor wiring diagram or pinout.",
  modeled:"The existing short drive lead and the bay harness are electrical illustrations, not part of the RF path. Actual motor/controller circuits and full moving-harness continuation remain open."},
].map(row=>Object.freeze({...row,confidence:"PUB roles / EST installation",flightMatingConfirmed:false})));
export const rfInstallationLimits=Object.freeze({
 scope:"RF connection review of the existing radio, amplifier and antenna. No new hardware or flight circuits are inferred.",
 naming:"Numbers match the existing part list: radio 13, amplifier 14 and antenna mechanism 10. RF, high-voltage power and actuator wiring are different media.",
 boundary:"Geometric contacts and a visible line are not electrical continuity. The hidden gimbal transition is unfinished; flight routing, internal passages and qualified movement remain open. No link budget, heating or flight behavior changes.",
});
