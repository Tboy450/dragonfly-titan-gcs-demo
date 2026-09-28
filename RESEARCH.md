# Research Basis - September 2026

## Verified Mission Context

- [Lockheed Martin deep-space portfolio](https://www.lockheedmartin.com/en-us/capabilities/space/deep-space-exploration.html) identifies spacecraft integration, cruise-stage propulsion/communications and aeroshell work. The direct page fetch was blocked; its indexed official text was available. [NASA's March 2026 integration update](https://science.nasa.gov/blogs/dragonfly/2026/03/10/nasas-dragonfly-mission-begins-rotorcraft-integration-testing-stage/) independently corroborates the cruise-stage and aeroshell work. No public Dragonfly shell-and-tube efficiency or identification was found in the searched NASA/APL/Lockheed material. This does not establish that no such hardware exists.

- [NASA spacecraft specifications](https://science.nasa.gov/mission/dragonfly/spacecraft-and-instruments/): MMRTG plus rechargeable battery, not solar power. Published baseline includes 875 kg, 1.35 m rotors and a 134 Ah battery; battery energy cannot be inferred from amp-hours without voltage.
- [APL thermal controller design, 2023](https://tfaws.nasa.gov/wp-content/uploads/TFAWS23-AT-14-Presentation.pdf): Titan surface heat transfer is predominantly convective. Internal fans distribute MMRTG heat; a cold-duct bypass regulates the lander. A pumped fluid loop is described for interplanetary cruise. These are different operating environments.
- [APL thermal development testing, 2024](https://tfaws.nasa.gov/wp-content/uploads/TFAWS2024-AT-02.pdf): waste heat around 1,800 W; full-scale thermal mock-up tests nitrogen circulation and thermal trim. Chamber tests do not reproduce Titan gravity.
- [NASA interview with Dragonfly PI](https://www.nasa.gov/podcasts/small-steps-giant-leaps/episode-168-dragonfly-mission-to-titan/): low wind can reduce cooling sufficiently to create an overheating concern. This is not evidence of inevitable thermal runaway or melted skids.
- [NASA MMRTG fact sheet](https://www.nasa.gov/wp-content/uploads/2015/04/mmrtg.pdf): approximately 110 W electric at launch, not a guaranteed Dragonfly output at Titan arrival. The simulation uses this as a nominal assumption without radioactive decay or thermoelectric performance modeling.
- [NASA Titan facts](https://science.nasa.gov/saturn/moons/titan/facts/): approximately 16 Earth days per rotation and methane/ethane surface liquids. The day/night display approximates equal halves at low latitude, not local seasonal lighting predictions. The shoreline is fictional training geography, not an actual landing-site claim.

## Supplied Heat-Exchanger References

The Google share redirect could not be fetched, but its exact titled destination was found and read:
[TubeTech: 5 Types of Shell and Tube Heat Exchangers and How They Work](https://tubetech.com/5-types-of-shell-and-tube-heat-exchangers-and-how-they-work/).
Tube-side and shell-side fluids exchange heat across tube walls. Baffles redirect shell-side flow. The article covers fixed, floating-head and U-tube arrangements, among others. It provides neither a Dragonfly hardware identification nor usable numeric efficiency/performance curves. The supplied diagrams are retained as general engineering references, not flight hardware drawings.

The screenshot claiming melting components and skids sinking into ice is not treated as a technical source. No corroborating primary evidence was found. Neither melting terrain nor runaway nuclear heat is implemented. An MMRTG is a radioisotope heat source, not a controllable fission reactor.

## Explicit Simulation Assumptions

- Usable battery: 20 kWh. This is not derived from NASA's 134 Ah figure.
- Generator: 110 W electric, 1,800 W waste heat, continuous day and night.
- Battery reserve: 15%; demo operating bands: electronics -10 to 55 C, battery 0 to 40 C.
- Two thermal nodes: 60 kJ/K equipment bay, 30 kJ/K battery, with 8 W/K coupling. Insulation leakage, captured waste-heat fraction, flow faults, load losses and cold-duct conductance are illustrative parameters, not calibrated flight data.
- Automatic trim targets a 15 C equipment bay. The entire 1,800 W does not enter that node; a fraction is captured, with the remainder rejected outside the simplified bay network.
- Reduced circulation and insulation damage are selectable training faults, not failures claimed to have occurred on the real vehicle.
- Hibernation integrates the same energy and thermal equations at one-second substeps. Time compression never accelerates flight and stops on a thermal warning.
- Sampling takes 30 seconds for gameplay. One returned sample is a mission objective, not a simulated scientific discovery. Aircraft guidance, terrain-following altitude and protective liquid avoidance remain simplified.

The quoted recommendation to install Kerbal Space Program is background discussion, not an instruction to install software or a source for Dragonfly parameters.
