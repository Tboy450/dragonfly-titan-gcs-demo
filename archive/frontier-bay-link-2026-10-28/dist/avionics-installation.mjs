export const installationSources=Object.freeze({
 lander:Object.freeze({label:"NASA/APL real IEM / PSU testing",url:"https://www.jhuapl.edu/news/news-releases/260312-dragonfly-integration-begins"}),
 radio:Object.freeze({label:"NASA/APL Frontier hardware photograph",url:"https://science.nasa.gov/image-detail/amf-48b4901b-44b0-4c89-802b-0c615842aa09/"}),
 navigation:Object.freeze({label:"Honeywell space MIMU family reference",url:"https://www.honeywellaerospace.com/us/en/products-and-services/products/navigation-and-sensors/inertial-measurement-units/miniature-inertial-measurement-unit"}),
 battery:Object.freeze({label:"APL ICES2022 battery test module",url:"https://ttu-ir.tdl.org/items/a6b6bdc1-a09e-43a2-bc62-dbbea2e80660"}),
});
export const installationFamilies=Object.freeze([
 {id:"iem",name:"IEM installation",source:"lander",inspect:"iem",subassembly:"iem-eighth-column",azimuth:-2.9,elevation:.35,
  role:"All eight card columns have estimated service routing and inspection targets. Final five leads and approved refits 4/13/21 have attached tags, supports and two ties each; the other eighteen routes and fittings stay fixed.",
  modeled:"All 26 local routes reviewed; 0 remain as placeholders. Every cable path and endpoint stays fixed in the tag/wrap cleanup. Lead 8's label is surface-attached; three hollow retention wraps replace the solid terminal blocks. These wraps are estimates, not flight splice hardware. Terminal overlap remains unresolved: the 26 modeled 9 mm cables require at least a 46 mm area-equivalent bundle diameter, versus the illustrative 18 mm floor branch. This is not a literal 26-to-one merge. Actual circuits, flight mating and qualified bends remain unknown."},
 {id:"power-units",name:"PSU installations",source:"lander",inspect:"power-units",subassembly:"psu-1",azimuth:-1.8,elevation:.35,
  role:"One existing lead per PSU gains an estimated support and lacing. PSU 1 and PSU 2 now have separate inspection targets.",
  modeled:"All 26 cable curves and both enclosures are unchanged. Most local leads, actual circuits and PSU 2's flight accommodation remain unresolved."},
 {id:"frontier-radio",name:"Frontier radio installation",source:"radio",inspect:"frontier-radio",subassembly:"frontier-radio-rf-lines",
  role:"Three unchanged local RF jumpers gain estimated cushioned supports. Connector face and jumpers have separate focuses.",
  modeled:"No external power/data or antenna link is invented. Flight configuration, exact cable construction and destinations remain unverified."},
 {id:"nose-electronics",name:"Navigation installations",source:"navigation",inspect:"nose-electronics",subassembly:"imu-a",
  role:"Estimated retention heads are added at the existing Ocellus mounting feet and MIMU pads; all source envelopes and capped ports remain unchanged.",
  modeled:"The existing bay branch now seats in an estimated external MEB connector shell/strain relief. It stays visible with part 5 or Bay harness; isolated IMU/FEB views omit it. This is an installation illustration, not an identified flight connector, wiring diagram or pinout. Exact flight ports, circuits and the separate FEB/IMU routes remain open."},
 {id:"battery",name:"Battery installation",source:"battery",inspect:"battery",subassembly:"battery-external-leads",azimuth:-1.8,elevation:.35,
  role:"Three unchanged exterior lead examples gain estimated cushioned supports and lacing. External connectors and leads have separate focuses.",
  modeled:"Enclosure, cells, internal bus bars and all lead endpoints are unchanged. The appearance reference is a sub-scale test module, not the flight pack."},
].map(row=>Object.freeze({...row,confidence:"EST",flightMatingConfirmed:false})));
export const installationLimits=Object.freeze({
 scope:"Illustrative installation work on five equipment families, not a complete flight wiring diagram. Equipment poses are retained; only the navigation MEB branch tail is fitted to its estimated interface. All twenty-six IEM local service routes are reviewed estimates.",
 naming:"Supports, lacing and retention hardware are installation estimates. The reference photographs do not establish their exact flight construction.",
 boundary:"Geometric contact does not assign a circuit, pinout or qualified bend radius. No electrical, cable heat-leak or structural solver is added.",
});
