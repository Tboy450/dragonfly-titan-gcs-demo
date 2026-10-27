// Published functional roles are separate from estimated physical geometry and wiring.
export const samplingConnectionSources = Object.freeze({
  lander: Object.freeze({ label: "NASA/APL integration", url: "https://www.jhuapl.edu/news/news-releases/260312-dragonfly-integration-begins" }),
  draco: Object.freeze({ label: "Honeybee / Blue Origin DrACO", url: "https://www.blueorigin.com/news/dragonfly-selected-nasa-new-frontiers-mission" }),
  drams: Object.freeze({ label: "NASA GSFC, ICES2024 Fig.1", url: "https://ntrs.nasa.gov/citations/20240005590" }),
  leu: Object.freeze({ label: "NASA GSFC laser electronics (EM)", url: "https://etd.gsfc.nasa.gov/capabilities/capabilities-listing/high-voltage-instrument-electrical-systems/" }),
  drives: Object.freeze({ label: "NASA GSFC, SciTech2024 Fig.2", url: "https://ntrs.nasa.gov/citations/20230017316" }),
});
export const samplingElectronics = Object.freeze([
  { id: "lander-iem", name: "Lander IEM", source: "lander", inspect: "iem",
    role: "Core spacecraft avionics, including command/data handling, navigation and communications.",
    modeled: "Exterior approximation. No identified attic connector or assigned instrument circuit." },
  { id: "lander-psus", name: "Power switching units", source: "lander", inspect: "power-units",
    role: "Switch electrical power to spacecraft instruments and systems.",
    modeled: "Two enclosure examples and estimated bay bundles; attic load/connector mapping unresolved." },
  { id: "draco-avionics", name: "DrACO avionics", source: "draco", inspect: null,
    role: "Dedicated avionics and flight software belong to Honeybee's sampling-system scope.",
    modeled: "Not separately reconstructed. Housing, mounting location and motor/lander mating interfaces remain open." },
  { id: "drams-meb", name: "DraMS main electronics box", source: "drams", inspect: "drams",
    role: "A main electronics box is identified within the warm instrument zone in NASA's thermal schematic.",
    modeled: "DraMS has estimated electronics casings; their exact flight identity, connectors and bus entry are not established." },
  { id: "drams-leu", name: "DraMS laser-electronics unit", source: "leu", inspect: null,
    role: "NASA's engineering-model unit includes control, energy monitoring, diode drive and a high-voltage pulse driver.",
    modeled: "Not separately reconstructed. Engineering-model evidence is not a flight housing, location or pinout." },
  { id: "carousel-drives", name: "Carousel warm actuators", source: "drives", inspect: "sample-carousel", subassembly: "carousel-drive-1",
    role: "Warm actuators sit below the carousel baseplate; the sample region above remains cold.",
    modeled: "Three installation/lead examples. Remote controller and bus connections remain unmodeled." },
].map(row => Object.freeze({ ...row, roleConfidence: "PUB", wiringConfidence: "unresolved", flightMatingConfirmed: false })));

export const samplingConnectionLimits = Object.freeze({
  scope: "Functional roles and model coverage, not a flight wiring diagram. No signal protocol, voltage, connector count or redundancy is assigned here.",
  naming: "DraMS MEB means main electronics box. Ocellus MEB is the lidar's main electronics box: a different instrument and a different unit.",
  boundary: "Sample/gas paths, electrical leads and thermal-air paths are distinct. A sample neck or nearby connector does not establish an electrical feedthrough.",
});

export const dracoInventorySources = Object.freeze({
  nasa: Object.freeze({label:"NASA: Playing Lacrosse on Titan",url:"https://science.nasa.gov/science-research/science-enabling-technology/technology-highlights/playing-lacrosse-on-titan/"}),
  design: Object.freeze({label:"Honeybee / APL / NASA, LPSC2022 figs.1-2 (Phase B design)",url:"https://www.hou.usra.edu/meetings/lpsc2022/pdf/1069.pdf"}),
  thermal: Object.freeze({label:"APL ICES2023-389 p.7 / fig.2 (thermal model)",url:"https://ttu-ir.tdl.org/server/api/core/bitstreams/0737a596-5ba9-488b-9cc6-0b2ed93e2cd5/content"}),
  cameras: Object.freeze({label:"DragonCam authors, figs.2-3 (published arrangement)",url:"https://arxiv.org/abs/2601.13221"}),
  avionics: samplingConnectionSources.draco,
});
export const dracoInventory = Object.freeze([
  {id:"draco-port-drill",name:"Port drill",source:"design",inspect:"drills",subassembly:"drill-port",
    role:"One of two redundant rotary-percussive drills; separate rotation, percussion and feed mechanisms.",
    modeled:"Head, two head actuators, Z motor/gearhead, rail/screw, swivel, bit, two body mounts and two constant-length moving lead examples. Motor ends move with the head; local retention ends stay fixed. Same equipment inventory as starboard; shapes and sizes estimated."},
  {id:"draco-starboard-drill",name:"Starboard drill",source:"design",inspect:"drills",subassembly:"drill-starboard",
    role:"The second redundant drill serves the shared sample-delivery system, not a separate dedicated blower.",
    modeled:"The same head/feed/bit/mount and moving-lead inventory as port. No missing counterpart found in this modeled drill mechanism; this is not verification of every flight component."},
  {id:"draco-shared-suction",name:"Shared suction equipment",source:"nasa",inspect:"drill-blower",
    role:"Either drill can use either of the two blowers. They are shared redundant equipment, not one blower assigned to each drill.",
    modeled:"Two blower approximations, inlet diverter and a single return path sit on port. This explains much of the extra gear there. Exact flight housings, fittings and mounting locations remain unverified."},
  {id:"draco-blower-location",name:"Port-side placement evidence",source:"thermal",inspect:"sample-lines",
    role:"The thermal paper identifies a DrACO blower behind the port forward arm. Its figure is a thermal model, not a hardware photograph.",
    modeled:"Both blowers are placed together there as an estimate. This source does not confirm both exact flight positions, so no starboard copies were added."},
  {id:"draco-paired-transfer",name:"Drill hoses and sample tubes",source:"design",inspect:"sample-lines",
    role:"Each drill has a pneumatic intake; the shared system can deliver to LDMS or GCMS sample cups.",
    modeled:"Each drill connects through its own flexible hose and intake tube to the carousel selector. From there a shared return runs down port to the blower selector, which joins both blower inlets. The path goes around the body, not directly across between drills. Four intake clamps per side; port also has three return clamps. The single carousel junction simplifies the separate published elevator paths; internal valve passages are not reconstructed."},
  {id:"draco-nearby-optics",name:"Nearby camera and illumination",source:"cameras",inspect:"side-cameras",subassembly:"microscopic-camera",
    role:"The camera arrangement includes one Microscopic Camera with co-aligned illumination, plus port and starboard Down Cameras.",
    modeled:"The microscope and LED assembly sit on port near the drill site. They are camera equipment, not a missing second drill actuator. The starboard Down Camera is present; do not mirror the microscope solely for symmetry."},
  {id:"draco-electrical-gap",name:"Electrical routing still open",source:"avionics",inspect:null,
    role:"Honeybee's DrACO scope includes dedicated avionics and flight software.",
    modeled:"Two local moving lead examples per drill retain constant length over the modeled 130 mm travel. Round 6 mm envelopes, support positions and routing are estimates, not flight cable construction or cryogenic fatigue qualification. They end at local retention points, not controllers. Z-feed leads, body-side continuations, blower/diverter leads and identified controller connections remain unmodeled or unresolved."},
  {id:"draco-guards-gap",name:"Guards, brackets and unidentified hardware",source:"design",inspect:null,
    role:"The published drill figure identifies the main mechanisms, not a complete flight installation bill of materials.",
    modeled:"Mounting brackets are estimates. Protective guards, concealed brackets and the unidentified cylinder/cone in the older APL visualization are not established as missing flight parts. Do not invent or mirror them without evidence."},
].map(row=>Object.freeze({...row,flightMatingConfirmed:false})));
export const dracoInventoryLimits = Object.freeze({
  scope:"Port / starboard equipment audit. Published system roles are distinct from estimated model shapes, routing and placement; matching counts do not establish flight completeness.",
  naming:"Shared equipment may legitimately make one side busier. The two drill mechanisms have matching modeled inventories; surrounding equipment is not required to be symmetric.",
  boundary:"Sample transport, electrical harnesses and thermal-air ducts are separate systems. Inspect Drill hoses and sample tubes shows both drills, carousel and blowers together. External joins are checked; valve interiors, pressure losses and complete flight plumbing are not simulated. The shared return has an estimated 3 mm seat into its selector.",
});
