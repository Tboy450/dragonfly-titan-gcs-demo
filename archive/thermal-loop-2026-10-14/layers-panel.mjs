// Mission-view Vehicle Layers panel: layer switch, thermal legend, parts list and selection.
import { systemsModel, thermalZoneTemps } from "../mission-systems.mjs?v=dev";
import { thermalCss, thermalGradientCss, thermalRanges } from "../thermal-scale.mjs?v=dev";
import { $, flightCanvas, state } from "./context.mjs?v=dev";
import { partMarkers } from "./flight-view.mjs?v=dev";
import { samplingSequence } from "../science.mjs?v=dev";
import { updateInspectorUI } from "./vehicle-inspector.mjs?v=dev";
import { focusInspector } from "../vehicle-inspector.mjs?v=dev";

const sources = {
  thermal: ["Thermal layout (ICES 2023)", "https://ttu-ir.tdl.org/server/api/core/bitstreams/0737a596-5ba9-488b-9cc6-0b2ed93e2cd5/content"],
  integration: ["NASA integration update", "https://science.nasa.gov/blogs/dragonfly/2026/03/10/nasas-dragonfly-mission-begins-rotorcraft-integration-testing-stage/"],
  payload: ["APL payload reference", "https://dragonfly.jhuapl.edu/What-Is-Dragonfly/Spacecraft-and-Science-Payload.php"],
  spacecraft: ["NASA spacecraft and instruments", "https://science.nasa.gov/mission/dragonfly/spacecraft-and-instruments/"],
  sampling: ["NASA sample-transfer design", "https://science.nasa.gov/science-research/science-enabling-technology/technology-highlights/playing-lacrosse-on-titan/"],
  carousel: ["NASA carousel integration", "https://science.nasa.gov/blogs/dragonfly/2026/04/23/nasas-dragonfly-rotorcraft-gets-decked-out-tested/"],
  carouselPhotos: ["Carousel photos: NASA/Mike Guinto", "https://svs.gsfc.nasa.gov/15003"],
  carouselDesign: ["NASA carousel thermal-interface design (2024)", "https://ntrs.nasa.gov/api/citations/20230017316/downloads/AIAA_SCITECH2024_final_proof.pdf"],
  dragonCam: ["DragonCam Microscopic Camera paper (MSSS, 2026)", "https://arxiv.org/abs/2601.13221"],
  dracoPaper: ["DrACO drill design (Honeybee, APL, Goddard; LPSC 2022)", "https://www.hou.usra.edu/meetings/lpsc2022/pdf/1069.pdf"],
  psuPhoto: ["PSU testing photo: NASA/Johns Hopkins APL/Ed Whitman", "https://www.jhuapl.edu/news/news-releases/260312-dragonfly-integration-begins"],
  iemPhotos: ["IEM integration photos: NASA/Johns Hopkins APL", "https://www.jhuapl.edu/news/news-releases/260312-dragonfly-integration-begins"],
  frontierPhoto: ["Frontier radio photo: Johns Hopkins APL", "https://science.nasa.gov/image-detail/amf-48b4901b-44b0-4c89-802b-0c615842aa09/"],
  frontierSpecs: ["Frontier radio specifications (eoPortal)", "https://www.eoportal.org/satellite-missions/frontier-radio"],
};
const componentInfo = {
  iem: ["Dragonfly's \"brain\": core avionics for commands and data, guidance and navigation, and communications in one box. Drawn from NASA/APL's full-resolution March 2026 photos: a black heat-sink top with fins parallel to the face and rows of fasteners, a copper ground strap, a silver face plate bolted round its edge with two rows of black connector windows, Micro-D connectors each mated to a labeled, silver-wrapped cable, and yellow tape strips. Mounted with its back to a wall panel beside a power switching unit, as photographed. No size is published: about 28 x 28 x 22 cm, scaled from the standard Micro-D connectors in the photos. The exact window layout (mostly hidden by cables in the photos), depth and which wall it is on are estimates. Temperature is the shared bay-air model.", "iemPhotos"],
  "power-units": ["The two power switching units control the flow of power to Dragonfly's instruments and systems. The face is mapped connector by connector from NASA/APL's full-resolution testing photo: eight vertical slices crossed by two ribs, large 25-way D-subs stacked two-high on the left, a cluster of small connectors, three D-subs and an uncapped port along the lower right, and an empty upper right; black top band, top and side covers. The photo shows them capped in pink for testing; here they are mated to the harness. Two units is published; size is not, so it is scaled from the standard D-sub sizes (about 20 x 24 x 19 cm). PSU 1 sits beside the IEM on the same wall, as photographed; where PSU 2 sits is not shown, and it is drawn like PSU 1. The readings below are for the whole vehicle; separate PSU currents are not modeled.", "psuPhoto"],
  "nose-cameras-inside": ["The nose cameras, built by Malin Space Science Systems: the Forward MAC (12.6 mm lens), the Forward WAC and two Side Cameras (5.8 mm lenses), and two redundant NavCams that guide terrain-relative navigation and connect straight to the spacecraft. All use the same camera body; the Forward MAC's lens is drawn with the black hood seen on one camera in the 2026 DragonCam paper (which camera carries it is an inference), and the NavCams with their pale-yellow top plates. They bolt to a camera panel behind the nose cap and look out through windows; the nose has no active airflow. Positions are read from the paper's 2026 CAD figures; pointing angles and which low unit is the WAC or the NavCams are estimates. The 2026 CAD's chin is fuller than this model's nose, so the low cameras stand out of the older nose shell until it is redrawn.", "dragonCam"],
  "side-cameras": ["Malin Space Science Systems' DragonCam cameras on the lower body. The Microscopic Camera (105 x 155 x 90 mm, 1.04 kg) sits on the port side aft of the drill and images the drill site 986 mm away at 52 degrees to the surface, with a focus mechanism for depth; APL's LED array beside it lights the site at night, including 365 nm UV for fluorescence. A Down Camera on each side looks straight down. Each camera sits in a cavity in the foam behind a 3 mm window. Drawn from the 2026 DragonCam paper; the Down Cameras' exact position, brackets and harness stubs are estimates, and the foam is drawn without the local thickening the Microscopic Camera needs.", "dragonCam"],
  "frontier-radio": ["APL's Frontier software-defined radio receives commands and sends data over X-band; stored instrument data stay queued until the radio and antenna are ready. Drawn from APL's photo: a black stack of four slices with labeled connectors, bolted feet and semi-rigid coax on top. Each slice is Frontier's published 4 x 6 inch package; APL lists the radio at 2.1 kg; the stack width, slice split, connector details, routes and its place on the bay floor are estimates from the photo. Whether Dragonfly flies a second unit is not published. Temperature is the shared bay model.", "frontierPhoto"],
  twta: ["The traveling-wave tube amplifier supports the Earth downlink. Its temperature is an estimate linked to radio operation.", "spacecraft"],
  drills: ["DrACO's two redundant rotary-percussive drills (Honeybee Robotics), one beside each side of the body just aft of the forward leg. Drawn from the 2022 DrACO paper's design figure: a gold drill head with separate percussion (top) and rotation (front) actuators and the percussion spring, riding a Z-stage rail driven by a motor and lead screw; a swivel with the pneumatic port; and a hollow bit with a side opening and a slotted crown that keeps out particles over 1.5 mm. While drilling the whole head slides down the rail and only the bit turns; material comes from up to 6 cm deep and is suctioned through the bit. Part sizes, colors and the exact fore-aft position are estimates; one drill is used in the animation and the other stays stowed.", "sampling"],
  "sample-lines": ["DrACO's pneumatic transport, as in the 2022 DrACO paper's layout: a flexible hose from each drill's pneumatic port (it follows the drill head down), rigid tubes forward under the body edges and up into the cold attic, a flow-diverter manifold on the carousel's sample inlet, and a return line down the port side to the blowers. Either drill can feed either the LDMS or GCMS cups using either blower; the cups catch particles from the moving Titan air. Tube size (about 13 mm) and routes are estimates; APL's published visualizations were used only to cross-check the run along the body side.", "dracoPaper"],
  "sample-carousel": ["Photo-referenced casing and cooling fins surround the sample cups; the drives sit below. The housing stays fixed. The indexing ring is a diagram cue, not visible flight hardware. Drum diameter (0.36 m), fittings and placement are estimates, not flight CAD. Thermal uses cold-attic temperature above and bay temperature for the drives; no separate sensor or fin-gradient simulation.", "carouselPhotos"],
  wonderwall: ["Separates the cold carousel region from warm DraMS. The published roughly 5 cm instrument separation is not wall thickness. This contoured interface, apertures and facing/core construction are estimates, not a verified flight material stack. Thermal colors use shared warm/cold nodes, not a solved temperature gradient. The rebuilt DraMS interface is aligned to this aperture; exact flight connections remain unverified.", "carouselDesign"],
  drams: ["DraMS analyzes samples by laser desorption or gas chromatography/mass spectrometry. This warm-side reconstruction has enclosed instrument bodies, separate covers and an interface through the modeled Wonderwall opening. Dimensions, enclosure details, routes and fan geometry are estimates, not flight CAD. Hidden electrodes, GC columns, laser optics and the sample oven are not reconstructed. Temperature is the shared bay model, not measured hardware telemetry.", "carouselDesign"],
  "drill-blower": ["DrACO's two redundant centrifugal blowers (forward and aft), with impellers designed for Titan air, behind the port forward arm and exposed to Titan (ICES-2023). An inlet flow diverter picks which blower pulls the air; each exhausts outboard and down. Sizes and shapes are estimates.", "dracoPaper"],
  battery: ["The battery supplies flight power and recharges from the MMRTG. The thermal model includes a phase-change buffer and inhibits charging outside its permitted band.", "thermal"],
  fan: ["Circulates MMRTG-warmed, nitrogen-rich gas through the under-floor duct and equipment bay.", "thermal"],
  "underfloor-duct": ["Routes warmed gas forward below the floor before it returns through the equipment bay.", "thermal"],
  "trim-chimneys": ["Flaps divert a controlled fraction of the circulation through cold ducts to reject heat to Titan's atmosphere.", "thermal"],
};

function liveComponentReading(name) {
  if (name === "iem") return `Vehicle mode: ${state.mode}. Flight plan: ${state.plan?.status ?? "none"}.`;
  if (name === "power-units") return `Vehicle load ${(state.power / 1000).toFixed(2)} kW; MMRTG generation ${state.generatedW.toFixed(0)} W. Modeled totals.`;
  if (["frontier-radio", "twta", "hga-actuators"].includes(name)) return `${state.downlinkW > 0 ? "Transmitting" : state.downlinkActive ? "Preparing antenna" : "Radio idle"}; ${(state.dataStoredBits / 1e6).toFixed(1)} Mbit queued. Downlink system load ${state.downlinkW.toFixed(0)} W (modeled).`;
  if (["drills", "sample-lines", "sample-carousel", "drams", "drill-blower"].includes(name)) return state.science.sampling
    ? `${samplingSequence(state).label}${state.hold ? " / paused" : ""}: ${(samplingSequence(state).progress * 100).toFixed(0)}% of the ${samplingSequence(state).duration} s training cycle; ${state.sciencePowerW.toFixed(0)} W instrument load (modeled).`
    : `Sampling idle; ${state.science.samples.length} completed sample records.`;
  if (["battery", "battery-sensor"].includes(name)) return `Charge ${state.battery.toFixed(1)}%; ${state.chargingBlocked ? "charging inhibited by temperature" : `${Math.abs(state.netBatteryW).toFixed(0)} W ${state.netBatteryW >= 0 ? "charging" : "discharging"}`} (modeled).`;
  if (["fan", "underfloor-duct", "trim-chimneys"].includes(name)) return `Gas flow ${state.gasFlow.toFixed(3)} kg/s; trim ${(state.effectiveTrim * 100).toFixed(0)}%; cold-duct heat rejection ${state.coldDuctW.toFixed(0)} W (modeled).`;
  return "";
}

// ---- Vehicle layers (Mission view) and the shared systems readouts ----
let partRows = "";
let detailKey = "";
const rowElements = new Map();
export function updateLayerPanel() {
  updateInspectorUI();
  const layered = state.missionLayer !== "exterior";
  $("component-temperatures").hidden = !layered;
  document.querySelectorAll("[data-layer]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.layer === state.missionLayer)));
  $("thermal-legend").hidden = !layered;
  const mock = layered && state.vehicleModel === "original";
  $("part-list").hidden = !layered;
  $("mock-banner").hidden = !mock;
  $("layer-note").hidden = !layered || mock;
  const range = thermalRanges[state.thermalRange];
  $("thermal-min").textContent = `${range.min} C`;
  $("thermal-max").textContent = `${range.max} C`;
  $("thermal-range").textContent = `Scale: ${range.label.toLowerCase()}`;
  $("airflow-panel").hidden = state.missionLayer !== "internal" || mock;
  if (state.missionLayer === "internal" && !mock) updateAirflowPanel();
  $("thermal-bar").style.background = thermalGradientCss(range);
  if (!layered) { $("part-detail").hidden = true; return; }
  const zones = thermalZoneTemps(state);
  const markers = partMarkers.length ? partMarkers : [];
  const rows = markers.map(marker => `${marker.index}|${marker.name}|${marker.label}`).join(";");
  if (rows !== partRows) {
    partRows = rows;
    rowElements.clear();
    $("part-list").replaceChildren(...markers.map(marker => {
      const item = document.createElement("li");
      item.dataset.part = marker.name;
      item.classList.toggle("active", marker.name === state.selectedPart);
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-pressed", String(marker.name === state.selectedPart));
      const zone = zones[marker.zone];
      const number = document.createElement("b");
      number.textContent = marker.index;
      const name = document.createElement("span");
      name.textContent = marker.label;
      const temp = document.createElement("em");
      temp.textContent = zone ? `${zone.c.toFixed(0)} C` : "";
      if (zone) temp.style.color = thermalCss(zone.c);
      button.append(number, name, temp);
      item.append(button);
      rowElements.set(marker.name, { item, button, temp });
      return item;
    }));
  }
  // Update in place so live telemetry never removes a focused component button.
  for (const marker of markers) {
    const { item, button, temp } = rowElements.get(marker.name);
    const active = marker.name === state.selectedPart;
    item.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
    const zone = zones[marker.zone];
    temp.textContent = zone ? `${zone.c.toFixed(0)} C` : "";
    if (zone) temp.style.color = thermalCss(zone.c);
  }
  const selected = markers.find(marker => marker.name === state.selectedPart);
  $("part-detail").hidden = !selected;
  if (selected) {
    const zone = zones[selected.zone];
    $("part-title").textContent = `${selected.index}. ${selected.label}`;
    $("part-temperature").textContent = zone ? `${zone.c.toFixed(1)} C - ${zone.source}.` : "No temperature available.";
    $("part-placement").textContent = `Placement: ${selected.source}.`;
    const info = selected.mock ? null : componentInfo[selected.name];
    $("part-role").textContent = info?.[0] ?? "";
    $("part-role").hidden = !info;
    const reading = selected.mock ? "" : liveComponentReading(selected.name);
    $("part-live").textContent = reading;
    $("part-live").hidden = !reading;
    const key = `${selected.name}|${selected.mock}`;
    if (key !== detailKey) {
      detailKey = key;
      const entries = selected.mock ? [] : [...new Set([info?.[1] ?? "thermal", ...(selected.name === "sample-carousel" ? ["carouselDesign"] : ["wonderwall", "drams"].includes(selected.name) ? ["carouselPhotos", "thermal"] : selected.name === "frontier-radio" ? ["frontierSpecs", "spacecraft"] : ["iem", "power-units"].includes(selected.name) ? ["integration"] : ["side-cameras", "nose-cameras-inside"].includes(selected.name) ? ["spacecraft"] : selected.name === "drills" ? ["dracoPaper"] : selected.name === "sample-lines" ? ["sampling"] : selected.name === "drill-blower" ? ["thermal", "sampling"] : []), "payload"])];
      $("part-sources").replaceChildren(...entries.map(id => {
        const link = document.createElement("a");
        [link.textContent, link.href] = sources[id];
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        return link;
      }));
    }
  }
}

// Live description of the warm-air loop: how it moves, how it is regulated, how it is measured.
function updateAirflowPanel() {
  const flow = state.gasFlow ?? systemsModel.gasMassFlow;
  const fan = Math.round((state.fan ?? 1) * 100);
  // Gas speed in the under-floor duct: density of the warm N2-rich gas at 146 kPa, divided into
  // the modeled duct's 16 x 4.5 cm section [EST].
  const density = 146000 * 0.028 / (8.314 * (273.15 + (state.coreC ?? 12)));
  const ductSpeed = flow / density / (0.16 * 0.045);
  const trim = Math.round((state.effectiveTrim ?? 0) * 100);
  const next = Math.max(0, state.trimClock ?? 0);
  const clock = `${Math.floor(next / 60)}:${String(Math.floor(next % 60)).padStart(2, "0")}`;
  $("air-moves").textContent = `The fan (${fan}%${state.fanIntegrity < 1 ? ", restricted" : ""}) moves ${flow.toFixed(3)} kg/s `
    + `(design 0.052 kg/s) of nitrogen-rich Titan gas, warmed to ${(state.warmGasC ?? 0).toFixed(0)} C by the MMRTG's waste heat, `
    + `forward through the under-floor duct (about ${ductSpeed.toFixed(1)} m/s, estimate) and back through the bay at ${(state.coreC ?? 0).toFixed(0)} C.`;
  $("air-regulated").textContent = `The trim flaps send ${trim}% of the flow through the exposed cold duct on each side (0-40% in 2% steps), `
    + `dumping ${(state.coldDuctW ?? 0).toFixed(0)} W to Titan. `
    + (state.trimFlightLocked ? "Held closed in flight. " : state.thermalAuto ? `Automatic; next adjustment in ${clock}. ` : "Manual setting. ")
    + "Dragonfly uses two controllers taking turns, on battery and MMRTG fin-root temperature, about every 10 minutes; this simulator uses one simplified loop on battery and bay temperature.";
  $("air-measured").textContent = `Battery ${(state.batteryC ?? 0).toFixed(1)} C and the MMRTG fin root (here, the modeled gas temperature) `
    + "are the controller inputs (green dots). The flow is the published design rate, not a live measurement. "
    + "NASA's full-scale ground test model carried 203 thermocouples and 15 air-velocity sensors.";
}

function selectPart(name) {
  state.selectedPart = state.selectedPart === name ? null : name;
  if (state.inspector.focusPart || state.inspector.followSampling || state.inspector.isolate) focusInspector(state, state.selectedPart);
  if (state.selectedPart) $("component-temperatures").open = true;
  updateLayerPanel();
}

document.querySelectorAll("[data-layer]").forEach(button => button.addEventListener("click", () => {
  state.missionLayer = button.dataset.layer;
  try { localStorage.setItem("dragonfly-mission-layer", state.missionLayer); } catch { /* optional */ }
  partRows = "";
  updateLayerPanel();
}));
$("thermal-range").addEventListener("click", () => {
  state.thermalRange = state.thermalRange === "full" ? "inside" : "full";
  partRows = "";
  updateLayerPanel();
});
$("part-list").addEventListener("click", (event) => {
  const row = event.target.closest("li[data-part]");
  if (row) selectPart(row.dataset.part);
});
flightCanvas.addEventListener("click", (event) => {
  if (state.view !== "mission" || !partMarkers.length) return;
  const rect = flightCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left, y = event.clientY - rect.top;
  const hit = partMarkers.reduce((best, marker) => {
    const distance = Math.hypot(marker.x - x, marker.y - y);
    return marker.drawn && distance < 18 && (!best || distance < best.distance) ? { marker, distance } : best;
  }, null);
  if (hit) selectPart(hit.marker.name);
});
try {
  const savedLayer = localStorage.getItem("dragonfly-mission-layer");
  if (["exterior", "internal", "thermal"].includes(savedLayer)) state.missionLayer = savedLayer;
} catch { /* optional */ }
