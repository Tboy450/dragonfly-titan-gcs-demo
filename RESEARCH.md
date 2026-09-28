# Research Basis - September 2026

## Verified Mission Context

- [Lockheed Martin deep-space portfolio](https://www.lockheedmartin.com/en-us/capabilities/space/deep-space-exploration.html) identifies spacecraft integration, cruise-stage propulsion/communications and aeroshell work. The direct page fetch was blocked; its indexed official text was available. [NASA's March 2026 integration update](https://science.nasa.gov/blogs/dragonfly/2026/03/10/nasas-dragonfly-mission-begins-rotorcraft-integration-testing-stage/) independently corroborates the cruise-stage and aeroshell work. No public Dragonfly shell-and-tube efficiency or identification was found in the searched NASA/APL/Lockheed material. This does not establish that no such hardware exists.

- [NASA spacecraft specifications](https://science.nasa.gov/mission/dragonfly/spacecraft-and-instruments/): MMRTG plus rechargeable battery, not solar power. Published baseline includes 875 kg, 1.35 m rotors and a 134 Ah battery; battery energy cannot be inferred from amp-hours without voltage.
- [APL thermal controller design, 2023](https://tfaws.nasa.gov/wp-content/uploads/TFAWS23-AT-14-Presentation.pdf): Titan surface heat transfer is predominantly convective. Internal fans distribute MMRTG heat; a cold-duct bypass regulates the lander. A pumped fluid loop is described for interplanetary cruise. These are different operating environments.
- [APL thermal development testing, 2024](https://tfaws.nasa.gov/wp-content/uploads/TFAWS2024-AT-02.pdf): waste heat around 1,800 W; full-scale thermal mock-up tests nitrogen circulation and thermal trim. Chamber tests do not reproduce Titan gravity.
- [NASA interview with Dragonfly PI](https://www.nasa.gov/podcasts/small-steps-giant-leaps/episode-168-dragonfly-mission-to-titan/): low wind can reduce cooling sufficiently to create an overheating concern. This is not evidence of inevitable thermal runaway or melted skids.
- [NASA MMRTG fact sheet](https://www.nasa.gov/wp-content/uploads/2015/04/mmrtg.pdf): approximately 110 W electric at launch, not guaranteed at Titan arrival. The simulator now uses a labeled 90 W arrival estimate (70 W option) with assumed 2.5% annual electric decline and 87.7-year thermal half-life.
- [NASA Titan facts](https://science.nasa.gov/saturn/moons/titan/facts/): approximately 16 Earth days per rotation and methane/ethane surface liquids. The day/night display approximates equal halves at low latitude, not local seasonal lighting predictions. The shoreline is fictional training geography, not an actual landing-site claim.

## Supplied Heat-Exchanger References

The Google share redirect could not be fetched, but its exact titled destination was found and read:
[TubeTech: 5 Types of Shell and Tube Heat Exchangers and How They Work](https://tubetech.com/5-types-of-shell-and-tube-heat-exchangers-and-how-they-work/).
Tube-side and shell-side fluids exchange heat across tube walls. Baffles redirect shell-side flow. The article covers fixed, floating-head and U-tube arrangements, among others. It provides neither a Dragonfly hardware identification nor usable numeric efficiency/performance curves. The supplied diagrams are retained as general engineering references, not flight hardware drawings.

The screenshot claiming melting components and skids sinking into ice is not treated as a technical source. No corroborating primary evidence was found. Neither melting terrain nor runaway nuclear heat is implemented. An MMRTG is a radioisotope heat source, not a controllable fission reactor.

## Explicit Simulation Assumptions

### Nitrogen Environment Follow-Up (September 28)

Re-read the TubeTech article and NASA/APL 2023/2024 reports. The [2026 NASA workshop abstract, Interdisciplinary-16](https://tfaws.nasa.gov/tfaws-2026/paper-proceedings/) also describes internal and external convection, fan circulation, foam insulation and cold-duct trim. It does not identify a liquid-to-liquid shell as the Titan surface system.

Direct retrieval of [ICES-2023-389](https://ttu-ir.tdl.org/server/api/core/bitstreams/0737a596-5ba9-488b-9cc6-0b2ed93e2cd5/content) succeeded after the web reader failed. It supplies natural-convection values of 2.0/3.3/4.6 W/m2/K by orientation, 10.5 windy, and 50-100 flight bounds. The demo interpolates 4 calm, 10.5 at 1.6 m/s and 75 at 10 m/s, capped there. Wind and vehicle speed are combined in quadrature without direction. This is not a nitrogen-property correlation or validated CFD model. The pressure/density readout is a surface reference.

Foam conduction and external convection are series resistances: 0.0762 m thickness and 0.01 W/m/K cold conductivity from the preliminary design, with assumed 20 m2 area. Gas transport uses the published 0.052 kg/s at full fan and assumed constant 1050 J/kg/K heat capacity. The quasi-steady warm-gas node balances RTG heat between bay transport and an external loss path; its effective 5.5 W/K generator loss conductance and weak wind dependence are assumptions. It is not a fin-root temperature prediction. The cold duct uses assumed 0.8 m2 area and 12 W/K internal conductance in series, plus a closed leakage reference of 36 W at 194.15 K difference. The two physical devices are aggregated, not individually modeled.

Automatic control has a 600-second period, 0-40% airflow command quantized to 2%, and closes in flight, based on the preliminary controller study. Feedforward plus PI with bay-temperature damping targets a 10 C battery. Gains and instantaneous commanded actuator motion are demo choices; there is no second fin-root controller or flight MIMO replication. Tested for eight-day calm/windy hibernation, rather than just short interactive runs.

Liquid-to-liquid shell-and-tube hardware remains a plausible hypothetical engineering study. TubeTech distinguishes welded fixed tube sheets, movable floating heads and expansion-accommodating U-tubes, but does not specify cryogenic coolant compatibility or Dragonfly hardware. [NASA's MSL study](https://ntrs.nasa.gov/citations/20120006581) documents interacting rover/cruise liquid loops as a separate mission precedent, not proof of Dragonfly equipment. A nitrogen-rich external environment does not determine a sealed loop's coolant. No invented coolant freezing point, shell efficiency, or liquid-loop flight specification is used.

### Demo Parameters

- Separate liquid-to-liquid exchanger study: steady single-phase energy balance, Q = assumed effectiveness x minimum heat-capacity rate x inlet temperature difference. Defaults: tube 40 C and 40 W/K, shell 5 C and 30 W/K, effectiveness 0.65. These are hypothetical, not flight values or TubeTech performance claims. No coolant identity, phase change, pressure loss, pump load, geometry prediction or ambient sink is resolved. This study does not alter flight telemetry. Equations cross-checked against the [ht heat-exchanger documentation](https://ht.readthedocs.io/en/latest/ht.hx.html#ht.hx.effectiveness_from_NTU).

- Battery capacity: 11.5 kWh, the design reported in the [2022 Hibbard interview](https://aerospaceamerica.aiaa.org/features/designing-dragonfly-nasas-titan-explorer/). Usable fraction is simplified; 15% reserve remains a demo choice. This is not a claim about the final pack topology.
- Generator: estimated 90 W electric at arrival, optional 70 W, and 1,800 W waste heat; both decay with elapsed surface time independently of lighting.
- Battery: 0-20 C landed band from the 2023 paper, 35 C upper operating and no subzero charging from [ICES-2020-160](https://ttu-ir.tdl.org/bitstream/handle/2346/86272/ICES-2020-160.pdf?sequence=1), retrieved and checked. Equipment-bay -20 to 55 C limits remain demo guards, not every electronics box's specification.
- Two dynamic thermal nodes: 60 kJ/K bay, 30 kJ/K battery, with 8 W/K coupling. Load heat (2.5% to bay, 3.5% battery loss), flow faults and capacities are illustrative. The old fixed 24% capture fraction is removed. RTG-to-bay plus generator external rejection conserves source heat. No PCM latent heat or liquid coolant properties are invented.
- Flight power now combines induced inflow, profile, parasite drag and positive climb work. Assumed drag area 0.65 m2 and profile speed 55 m/s yield about 8.1 kW hover and 6.2 kW at 8 m/s in the baseline, without the old monotonic cruise penalty. It is not fitted to measured flight performance or the optimized rotor-only objective in the 2024 paper.
- Eight rotors each have three blades, per the [June 2026 lead rotor engineer interview](https://www.planetary.org/planetary-radio/2026-engineering-of-dragonfly). The ambiguous 150 RPM transcription is not used.
- Reduced circulation and insulation damage are selectable training faults, not failures claimed to have occurred on the real vehicle.
- Hibernation integrates the same energy and thermal equations at one-second substeps. Time compression never accelerates flight and stops on a thermal warning.
- Sampling takes 30 seconds for gameplay. One returned sample is a mission objective, not a simulated scientific discovery. Aircraft guidance, terrain-following altitude and protective liquid avoidance remain simplified.

The quoted recommendation to install Kerbal Space Program is background discussion, not an instruction to install software or a source for Dragonfly parameters.
