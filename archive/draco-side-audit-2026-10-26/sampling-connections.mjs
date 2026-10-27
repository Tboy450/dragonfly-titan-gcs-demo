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
