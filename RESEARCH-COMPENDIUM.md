# Dragonfly Titan GCS: Research Compendium (updated September 28, 2026)

Companion to `RESEARCH.md`. It gathers public sources on the real mission and compares them with the simulator's current values. It also sets out the next implementation steps, so another assistant (Codex/GPT) can continue the work.

**How to read the tags**
- **[PUB]** Published by NASA, APL, a partner or a peer-reviewed or conference paper (the source is linked).
- **[CALC]** Arithmetic or textbook physics computed from published inputs. The script is summarized in §9.
- **[EST]** An estimate or interpretation. It is plausible but not published as a Dragonfly figure.
- **[BG]** General background, not re-verified. As of this update no [BG] items remain; the earlier ones have been checked and re-tagged.
- **Status** (in §7): **Done** means the simulator now implements it; **Partial** and **Open** are still to do.

---

## 0. Project status (September 28, 2026)

**History.** This compendium was first written against commit `25d0210`. Since then:
- `74ed2c4` "Refine Titan thermal and flight models from published research" (GPT/Codex) implemented most of §3–§4:
  - three-bladed rotors, the 11.5 kWh battery and time-based MMRTG output (90 W or 70 W, −2.5%/yr);
  - the hover-to-cruise power curve and nitrogen-environment convection (4 / 10.5 / 75 W/m²·K);
  - foam + film conductance, 0.052 kg/s circulation, the 0–40% cold-duct trim in 2% steps under a 600 s PI update;
  - the 0–35 °C battery band with charging inhibit, a vortex-ring-state advisory and a hypothetical liquid-to-liquid exchanger study.
- `4fd4036` centered the fixed chase camera.
- `3bb6cd4` "Smooth flight controls, fix mode-change jumps, and rebuild phone layouts" (Claude):
  - **Continuous flight model.** One rate-limited model now drives vertical speed, attitude and forward speed in every mode: climb ≤ 3 m/s, sink ≤ 2.5 m/s, climb acceleration ≤ 1.8 m/s², sink acceleration ≤ 1.2 m/s², horizontal acceleration ≤ 1 m/s², pitch rate ≤ 16°/s. The acceleration limits are grounded in §2.1 (≈3,000 N maximum thrust against ≈1,183 N Titan weight) and Titan's 1.35 m/s² gravity.
  - **Buttons.** Takeoff climbs to and holds 40 m. Cruise holds altitude (at least 20 m) at 10 m/s. Land descends at up to 1.3 m/s, flares to ~0.35 m/s and idles the rotors.
  - **Auto** resumes from the matching phase instead of the mission clock. That old behavior caused a 0 → 45 m jump in about 1 s.
  - **Sticks.** Input is relative to where the finger lands. The throttle is a sticky climb-rate command (50% holds altitude), with an optional spring-to-center mode.
  - **Rendering.** The aircraft follows the analytic terrain aloft, so the 400 m mesh re-centering (up to 2.4 m ground shift) no longer moves it. The chase camera eases between Fixed and Free.
  - **Phone layouts.** New portrait and landscape layouts.
  - **Tests.** 33 tests pass, including regressions for every jump found.
- **Operations and energy realism (Claude, September 28):**
  - **Motor preheat.** 60 Wh (8 × 90 W × 5 min) is charged once per cold start at liftoff; the 5 minutes are time-compressed. The motors count as cold again after 30 min on the ground [EST].
  - **Direct-to-Earth comms.** The link is available only when landed, awake and in daylight; the antenna is stowed in flight. A manual downlink session draws 200 W [EST DC draw for the 100 W TWTA] and returns data at ~5 mJ/bit/AU [PUB concept] at an assumed 9.5 AU (≈4.2 kbit/s). It stops automatically at takeoff, at night, in hibernation or below 30% battery.
  - **Flight endurance and "land now".** Minutes left are the lesser of the energy to the 15% reserve and the time to the 35 °C battery cap at the documented +10 °C per 30 min. Advisories: under 3 min to either limit, the 30 min flight plan exceeded, or flying at night. These are advisories, not automatic landings.
  - **Wind.** Values above the 1.6 m/s design maximum are labeled as stress tests.
  - **Tests.** 36 tests pass (`tests/operations.test.mjs` added).

**Still open** (details in §7–§8): phase-change battery buffering, a cruise-phase thermal panel, visibility-based fog and dimmer lighting, rain-darkened ground, and an entry/descent/landing scenario.

---

## 1. Mission status and timeline

| Item | Value | Tag / source |
|---|---|---|
| Launch | July 2028, SpaceX Falcon Heavy (~$256.6M contract), KSC | [PUB] [OIG IG-25-011](https://oig.nasa.gov/wp-content/uploads/2025/09/final-report-ig-25-011-nasas-managment-of-the-dragonfly-project.pdf) |
| Cruise / arrival | ~6.5-year cruise; arrives late 2034 | [PUB] OIG; [NASA blog Sep 2 2026](https://science.nasa.gov/blogs/dragonfly/2026/09/02/nasas-dragonfly-gets-wired-up-while-titan-landing-area-is-named/) |
| Primary mission | 3.3 years (≈74 Titan days) | [PUB] NASA blog Sep 2026; [Aerospace America 2022](https://aerospaceamerica.aiaa.org/features/designing-dragonfly-nasas-titan-explorer/) |
| Cost | $3.35B life-cycle (April 2024 baseline); original cap $850M | [PUB] OIG |
| OIG critical risks (June 2025) | lander thermal performance; fuselage panel schedule; fatigue of critical flight components; MMRTG endurance survivability | [PUB] OIG |
| 2026 build progress | IEM and PSU power tests (Mar); parachute sequence test at Eloy, AZ (Feb); PICA-D heat-shield tests at Sandia solar tower (Jun); 13-ft fuselage delivered June 29, with integration from July 1; harness of ~17,315 ft wire, 374 connectors, ~100 lb (July) | [PUB] [Mar 10](https://science.nasa.gov/blogs/dragonfly/2026/03/10/nasas-dragonfly-mission-begins-rotorcraft-integration-testing-stage/), [Jun 1](https://science.nasa.gov/blogs/dragonfly/2026/06/01/nasas-dragonfly-flight-system-faces-heat/), [Jul 9](https://science.nasa.gov/blogs/dragonfly/2026/07/09/nasas-dragonfly-clears-key-tests-as-titan-rotorcraft-takes-shape/), Sep 2 blogs; [DroneXL Apr 2026](https://dronexl.co/2026/04/27/nasa-dragonfly-octocopter-2028-titan/) (secondary) |
| Next tests | System-level testing at Lockheed Martin (early 2027); final space-environment tests at APL (late 2027); arrival at KSC spring 2028 | [PUB] Mar 10 blog |
| Landing area name | **Ahmakiq Undae** (IAU, Sept 2026): dunes and interdunes south of Selk crater, reaching to the edge of hills | [PUB] Sep 2 blog |

**Who does what.** APL leads, designs and integrates. Lockheed Martin Space builds the aeroshell, the cruise stage and the airframe panels. Sikorsky and Penn State handle rotor aeromechanics. NASA Langley runs the wind tunnels. Goddard and CNES build DraMS. Honeybee Robotics (Blue Origin) builds DrACO. APL, LLNL and JAXA contribute to DraGNS and DraGMet. Malin builds DragonCam. DOE, INL and Aerojet Rocketdyne supply the MMRTG. [PUB] [NASA spacecraft page](https://science.nasa.gov/mission/dragonfly/spacecraft-and-instruments/), [APL payload page](https://dragonfly.jhuapl.edu/What-Is-Dragonfly/Spacecraft-and-Science-Payload.php), [INL](https://inl.gov/feature-story/idaho-lab-university-contribute-to-nasas-titan-mission/)

---

## 2. Vehicle and robotics

### 2.1 Airframe and rotors
- 875 kg; 3.85 × 3.85 × 1.75 m; eight 1.35 m rotors in four coaxial pairs. [PUB] NASA spacecraft page
- The rotor and flight design uses a maximum mass just under 1,000 kg. At maximum rotor speed the system makes ~3,000 N of thrust, about 800 N per coaxial pair. That is ≈2.5× Titan weight at 875 kg (1,183 N) [CALC]. [PUB] [Planetary Radio, Jun 17 2026](https://www.planetary.org/planetary-radio/2026-engineering-of-dragonfly)
- **Three-bladed rotors.** Two-blade rotors "shake really hard", and the TDT results shifted the design to three blades. [PUB] Planetary Radio 2026; [PennStater, Sep/Oct 2026](https://pennstatermag.com/alumni/flight-imagination)
- Each rotor is machined from a single aluminum block. There are no folding mechanisms, because those would have to work after years of cryogenic cruise. [PUB] Planetary Radio; [NASA "Flight Engineers Give Dragonfly Lift"](https://www.nasa.gov/missions/dragonfly/flight-engineers-give-nasas-dragonfly-lift/)
- **Control:** fixed-pitch, variable-speed rotors, controlled by RPM. Tip Mach is 0.2–0.4 and Reynolds number 1–3 million. [PUB] [Cornelius & Schmitz 2024](https://rotorcraft.arc.nasa.gov/Publications/files/Cornelius_Forum2024.pdf). The sim's RPM-mixing approach matches this control method.
- **Rotor testing** in Langley's Transonic Dynamics Tunnel used **R-134a** at 3.98 kg/m³, against a Titan reference of 5.35 kg/m³. Tests ran up to 1,100 RPM with coaxial disks spaced R/2 apart. [PUB] [Marshall et al. 2024](https://rotorcraft.arc.nasa.gov/Publications/files/marshall-et-al-2024.pdf). 1,100 RPM gives a tip speed of 77.8 m/s, about Mach 0.39 on Titan [CALC].
- **Vortex ring state.** The largest thrust swings occurred at steep descents: α > 60° with descent rate between −1.25 and −0.75 of hover induced velocity. Unsteadiness was minimal for α < 45°. [PUB] Marshall 2024. The 2018 concept avoids vertical descents and climbs and descends at about 20° pitch. [PUB] [Lorenz et al. 2018](https://secwww.jhuapl.edu/techdigest/Content/techdigest/pdf/V34-N03/34-03-Lorenz.pdf). With the sim's v_h = 4.36 m/s, the risk band starts near a 3.3 m/s vertical descent [CALC].
- **Motors:** custom dual-wound brushless DC motors (Moog) with a lubricant that tolerates freezing. [PUB] Aerospace America 2022

### 2.2 Autonomy, navigation and fault response
- **Sensors:** lidar, IMUs, navigation cameras, pressure and wind sensors. [PUB] APL payload page. The 2022 description lists 10 cameras and 2 lidars. [PUB] Aerospace America
- A half-scale octocopter was tested at the Imperial Dunes. One known pitfall: the navigation system can lock onto the vehicle's own shadow. [PUB] Aerospace America 2022
- **Leapfrog scouting:** the vehicle scouts ahead, returns to a known-safe site, then commits to the new site once it is validated. [PUB] Lorenz 2018; [APL/NASA](https://science.nasa.gov/mission/dragonfly/spacecraft-and-instruments/)
- **Flight classes:** repositioning hops of under 10 m to 100 m; the safe landing circle has a ~10 m radius; the longest flights last about 30 min. [PUB] Planetary Radio 2026
- **Fault responses:** (1) return to a previously scouted site, (2) search for a new safe site, (3) **"land now"** when something actively endangers the lander, such as power or temperature. [PUB] Planetary Radio 2026
- One-way light time is 67–92 min (8.0–11.1 AU) [CALC], so there is no real-time piloting. Flights are autonomous and uplinked in advance.

### 2.3 Sampling chain and instruments
- **DrACO:** two rotary-percussive drills, one on each skid, each with a single degree of freedom. Samples move **pneumatically** (a blower plus cyclone separator) to DraMS, with one-shot sample cups to limit cross-contamination between sites. [PUB] Lorenz 2018; Aerospace America 2022; APL page
- **DraMS:** SAM heritage, with laser-desorption and GC modes (derivatization agents TMAH and DMF-DMA). Its main electronics box sheds ~120 W and is fan-cooled with conditioned lander gas at ~273 K. [PUB] Planetary Radio; [ICES-2023-109](https://ttu-ir.tdl.org/server/api/core/bitstreams/29ec2f82-fb12-489e-865b-81cfb7622e4e/content)
- **DraGNS:** gamma-ray and neutron spectrometer with an onboard pulsed neutron source, because the thick atmosphere shields out cosmic rays. [PUB] Planetary Radio
- **DraGMet:** meteorology (temperature, pressure, wind, methane humidity), seismometer and electrical properties. **DragonCam:** microscopic and panoramic cameras, plus UV LEDs for organic fluorescence at night. [PUB] APL page; Planetary Radio

### 2.4 Entry, descent and transition to flight
Source: [PUB] [SciTech 2025 EDL overview](https://ntrs.nasa.gov/api/citations/20240014477/downloads/SciTech2025_DragonflyEntry_Descent_Overview.pdf) and Planetary Radio.

| Step | Value |
|---|---|
| Entry interface | 1,270 km; ~10 g peak deceleration; 280 W/cm² peak heat flux |
| Aeroshell | 4.5 m, 60° sphere-cone; entry mass 2,309 kg (CBE) |
| Drogue | 8.25 m disk-gap-band parachute at Mach 1.5; ~108 min of descent |
| Main | 16.7 m ringslot parachute; heat shield released 120 s after main deploy |
| Lander release | nominally 1,000 m (800–1,000 m window) at 2.9 m/s descent, then a powered autonomous landing |
| Total | "about two and a half hours" from entry interface to landing |

---

## 3. Energy: full-spectrum MMRTG and battery

### 3.1 MMRTG
- The generic MMRTG produces 110 W electric and ~2,000 W thermal at beginning of life. Its design life is 17 years (72 W at end of design life). It holds 8 GPHS modules with 4.8 kg PuO₂ and 768 PbTe/TAGS thermocouples, weighs 45 kg and delivers 30 V. It is about 6% efficient, with a fin-root temperature of 157 °C. [PUB] [NASA MMRTG fact sheet](https://science.nasa.gov/wp-content/uploads/2024/02/mmrtg-factsheet-updated-5-18-20-1.pdf)
- Dragonfly flies flight unit **F-4**, modified so the spacecraft can use its waste heat. [PUB] [NASA RPS IEEE 2025](https://ntrs.nasa.gov/api/citations/20240012942/downloads/FINAL_RPS_IEEE_Paper_2025_draft_v6_clean.pdf). The fin length was cut in half. [PUB] Aerospace America 2022
- **Thermal output:** "near 2000 W" at beginning of mission, falling to **1,670 W** at end of mission. [PUB] [Holtzman et al., ICES-2020-160](https://ttu-ir.tdl.org/bitstream/handle/2346/86272/ICES-2020-160.pdf?sequence=1). About 1,800 W is used as the Titan baseline. [PUB] [TFAWS 2024](https://tfaws.nasa.gov/wp-content/uploads/TFAWS2024-AT-02.pdf)
- **Electric output at Titan:**
  - The 2018 concept anticipated "about 70 W". [PUB] Lorenz 2018
  - Later popular sources say "about 100 W". [PUB] [INL](https://inl.gov/feature-story/idaho-lab-university-contribute-to-nasas-titan-mission/), [Eos 2025](https://eos.org/features/a-dragonfly-for-titan)
  - The fact-sheet average decline is 2.46%/yr [CALC]. That gives ~90 W after 8 years (≈ arrival) and ~84 W after 11 years (≈ end of primary mission) [CALC].
  - **Recommended sim default:** ~90 W at arrival, declining 2.5%/yr, with a "pessimistic 70 W" option. [EST]
- Pu-238 decay alone reduces heat by only 0.79%/yr [CALC]. Electrical output falls faster because the thermocouples degrade.

### 3.2 Battery
- The published figure is a "134 ampere-hour battery". [PUB] NASA. It uses GS Yuasa Gen-3 LSE134 cells: 134 Ah at 3.75 V nominal, delivered October 2024. [PUB] [GS Yuasa](https://gsyuasa-lp.com/news/gs-yuasa-lithium-power-successfully-delivers-generation-3-lse134-li-ion-cells-in-support-of-nasas-dragonfly-mission/)
- Reported energy is **11.5 kWh** Li-ion. [PUB] Aerospace America 2022. That equals about 23 cells' worth of energy (0.5025 kWh per cell) [CALC].
- **Sim change:** use 11.5 kWh nameplate instead of 20 kWh. Keep the usable fraction and reserve as labeled assumptions.

### 3.3 Documented loads (use these instead of invented ones)

| Load | Value | Source |
|---|---|---|
| Titan circulation fan | 10–15 W minimum; 0.052 kg/s; ~1 m/s internal air | [PUB] [ICES-2023-389](https://ttu-ir.tdl.org/server/api/core/bitstreams/0737a596-5ba9-488b-9cc6-0b2ed93e2cd5/content) |
| Trim device plus drive electronics in hibernation | not to exceed 2.6 W average; fan allocation 15 W NTE | [PUB] [TFAWS 2023](https://tfaws.nasa.gov/wp-content/uploads/TFAWS23-AT-14-Presentation.pdf) |
| Rotor motor preheat | ~90 W each for 5 min, to −65 °C (8 motors = 60 Wh per flight [CALC]) | [PUB] ICES-2020 |
| Motor heat in flight | up to 300 W each | [PUB] ICES-2020 |
| HGA gimbal preheat | 10 W for 15 min (can drop to 5 W); ≥ −40 °C before use | [PUB] ICES-2020 |
| Body-camera preheat | 35 W | [PUB] ICES-2020 |
| DraMS electronics | ~120 W waste heat | [PUB] ICES-2023-109 |
| Radio | 100 W RF traveling-wave tube amplifier (TWTA), X-band | [PUB] NASA |
| Normal ops heaters | "Electrical heater power is not required in normal operations"; MMRTG waste heat does the job | [PUB] ICES-2020 |

### 3.4 Flight power (correct the sim's curve)
- **Published anchors:**
  - The 2018 concept (420 kg vehicle) needed "a little over 2 kW" at its maximum-range speed of ~10 m/s; maximum-endurance speed is ~8 m/s; power scales as mass^1.5. [PUB] Lorenz 2018
  - Scaling that to 875 kg gives ≈6.0 kW [CALC].
  - The 2024 rotor optimization gives a mission-weighted rotor power of 4.5–4.8 kW. [PUB] Cornelius & Schmitz 2024
  - **Target: roughly 4.5–6 kW in cruise.** [EST]
- On Titan, the same vehicle needs 2.43% of its Earth hover power, from (g_T/g_E)^1.5·√(ρ_E/ρ_T) [CALC]. This matches "2.5%". [PUB] Aerospace America
- **The curve has a minimum ("bucket").** Momentum theory with κ = 1.15, constant profile power and an assumed 1.5 m² drag area gives [CALC, illustrative]:

| Speed (m/s) | 0 | 2 | 4 | 6 | 8 | 10 | 12 |
|---|---|---|---|---|---|---|---|
| Power (kW) | 7.2 | 6.9 | 6.4 | 6.1 | 6.5 | 7.9 | 10.5 |

  A smaller drag area moves the minimum toward Lorenz's 8–10 m/s. The current sim instead reaches 17.7 kW at 10 m/s.

### 3.5 Per-Titan-day energy budget [CALC]
- One Titan day is 382.7 h (half is 191.3 h). At 100 / 90 / 70 W, the MMRTG yields 38.3 / 34.4 / 26.8 kWh per Titan day.
- A 30-min flight at 4.5–6 kW uses 2.25–3.0 kWh. At ~50 W net charging, recharge takes 45–60 h (1.9–2.5 Earth days).
- **Comms energy.** At the concept's ~5 mJ per bit per AU [PUB Lorenz 2018], 1 Gbit from 9 AU costs ~12.5 kWh. So data return, not flying, can be the largest energy consumer. A full Titan day of generation returns about 3 Gbit.
- **Cadence.** About one flight per Titan day; flights happen in daylight when Earth is visible. [PUB] Eos 2025; Planetary Radio. The 2018 concept puts flights and communications in the ~192 h of day, and battery recharging plus seismic and meteorology work at night. [PUB] Lorenz 2018. Expect about 50 flights of 3–4 km each over 74 Titan days. [PUB] PennStater 2026. NASA's figure is 20–30 sites, reaching ~115 km from the first landing site. [PUB] NASA

---

## 4. Electronic heating and cooling (thermal control)

### 4.1 Two different thermal systems for two environments
- **Cruise (vacuum, 0.615–9.07 AU from the Sun)** [PUB] ICES-2020:
  - A pumped fluid loop; the heritage fluid is CFC-11 at 2 L/min, and the fluid choice was still a trade study in 2020.
  - The cruise stage has two zones with four sub-circuits each, curved radiators, passive bypass valves (4–96%) and ~150 ft of line. The open-bay zone is disabled beyond 3.5 AU.
  - The loop picks up MMRTG heat through the **MMRTG's heat-exchanger port**. The lander carries a 1 cm-ID tube flanged to its boxes and battery.
  - The 2023 modeling paper calls this a "Common Fluid Loop" that runs through the lander side panels. [PUB] ICES-2023-389
  - The cruise stage and its loop are jettisoned at Titan.
- **Titan surface (dense cold N₂)** [PUB] TFAWS 2023/2024; ICES-2020/2023:
  - Fans pull warm MMRTG air through a **warm-duct** network.
  - Two **thermal trim devices** (aluminum flaps covered in foam, one on each side at the aft end, driven by linear actuators) divert warm air to an exposed **cold duct**. They can be offset from each other to bias the MMRTG warmer or colder.
  - The lander is wrapped in **Rohacell 31 HF foam**: 5 cm in the 2020 design, 7–7.62 cm later. Conductivity is ≤0.035 W/m·K between 0 and −179 °C and ~0.01 W/m·K at Titan temperature. The skin is aluminized Kapton.
  - The battery has aluminum fin extrusions between cell stacks with small fans, plus **7.5 kg of paraffin phase-change material (melting at 22.5 °C)** and constant-conductance heat pipes.

### 4.2 Controller
Source: [PUB] TFAWS 2023.
- Two PI controllers take turns: one tracks battery temperature, the other tracks MMRTG fin-root temperature.
- They update about every 10 min and must respond within 10 min.
- The cold-duct diverter opens up to **40% airflow in 2% steps**.
- Requirements: reject **≥ 810 W** (TBR) in the worst hot case; leak **≤ 36 W** when closed in the worst cold case; mass ≤ 7 kg; ~5,000 cycles.
- The ICES-2023 model estimates the trim device pulls more than 500 W fully open, and that hot hibernation needs 465 W of rejection from both devices.

### 4.3 Test evidence
Source: [PUB] TFAWS 2024; Planetary Radio.
- APL's **TITAN chamber**: 15 ft cube working volume (16 ft outside), −180 to +150 °C, 380–700 Torr of cryogenic nitrogen.
- **TPEC**: a 5 ft chamber that matches both Titan temperature and pressure.
- **Development test module** (full-scale thermal mock-up): polystyrene insulation, a 3D-printed Ultem duct system, 203 thermocouples, 15 air-velocity sensors, 22 test cases.
- Result: the cold duct rejected **245.7 W at a 23.7° flap angle** with 856.7 W of heater input.
- The CFD model matched the tests to ±11% on pressure drop, ±12% on heat rejection and ±7 °C on surfaces.
- External wind is replicated with fans in a high-pressure chamber. [PUB] ICES-2020

### 4.4 Temperature limits (replace the sim's assumed bands)

| Item | Limit | Source |
|---|---|---|
| Battery, landed | **10 ± 10 °C** for the whole landed mission; survival > 0 °C; hot operating limit **35 °C**; rises ~10 °C during 30 min of flight | [PUB] ICES-2023-389, ICES-2020 |
| Interior gas / electronics | lander gas held near 273 K; DraMS electronics survival > 243 K; components ≥ −20 °C in hibernation; interior target −40 to +30 °C | [PUB] ICES-2023-109, ICES-2023-389, Aerospace America |
| Cameras | survival −135 °C (2020) / −130 °C (2023) | [PUB] ICES-2020/2023 |
| HGA gimbal | survival −100 °C; ≥ −40 °C to operate | [PUB] ICES-2020 |
| Rotor motors | preheated to about −65 °C before flight; no cooling fins; mostly titanium | [PUB] ICES-2020 |
| Titan design environment | 94 K ± 2 K; sky/ground 92.5 K; winds ≤ 1.6 m/s sustained | [PUB] ICES-2023-389 |

### 4.5 Why "nitrogen-rich" matters: the physics [CALC]
Titan gas properties used here are estimates at 94 K and 146.7 kPa (density 5.44 kg/m³). Viscosity is 6.35×10⁻⁶ Pa·s (Sutherland), conductivity ~0.0092 W/m·K, cp ~1,070 J/kg·K and Pr ≈ 0.74. Kinematic viscosity is about 12.5× lower than Earth air.

Convective heat-transfer coefficient h (W/m²·K) for a 1 m surface:

| Case | Titan | Earth air | APL published |
|---|---|---|---|
| Natural convection, ΔT = 10 K | 4.5 | 3.2 | 2.0–4.6 calm (by orientation); ~5 calm |
| Forced, 1.0 m/s | 9.9 | 3.9 | — |
| Forced, 1.6 m/s | 17.7 | 5.0 | 10.5 windy; up to 15 |
| Forced, 10 m/s (flight) | 101 | 19 | 50–100 in flight |

- **Takeaways:**
  - At the same airspeed, Titan air carries away roughly 2.5–5× more heat than Earth air.
  - The foam, not the outside air, sets the heat leak. With k = 0.01, t = 7.62 cm and 15–25 m², foam UA is 2–3.3 W/K, which gives **~380–640 W** of leak at ΔT = 194 K. The outside film, at ~5 W/m²·K × 20 m² ≈ 100 W/K, barely matters.
  - Radiation is negligible on the surface: a skin 12 K above a 92.5 K sky radiates 0.15–2.7 W/m², against ~57 W/m² of natural convection.
  - Sunlight at the surface is ~1/1,000 of Earth's [PUB Lorenz 2018]. Above the atmosphere it is 14.8 W/m² [CALC], so there is no "direct radiation blast" at Titan.
  - In cruise near 0.615 AU, sunlight is ~3,600 W/m² in vacuum [CALC]. That is where radiators and a fluid loop are needed.
  - **Two failure directions**, both documented:
    - Calm air can **overheat** the lander with ~1.8 kW of MMRTG heat. [PUB] NASA podcast; OIG lists "lander thermal performance" as a risk.
    - Maximum wind sets **cold survival**. [PUB] ICES-2020

### 4.6 The shell-and-tube / liquid-to-liquid question
- **Documented:**
  - The MMRTG has fluid-loop heat-exchanger ports that feed the cruise loop.
  - The Titan-surface system moves heat by **gas**: fans, ducts and cold-duct flaps.
  - The battery uses fins, phase-change material and heat pipes.
  - None of the NASA/APL/Lockheed papers reviewed identifies a shell-and-tube exchanger. The 2020 paper describes the cruise and lander loops as separate, with no liquid-liquid exchanger named between them.
- **Plausible but unconfirmed [EST]:**
  - A liquid-to-liquid exchanger could sit where two fluid circuits must stay separated. Candidates: cruise loop ↔ lander loop, or ground-support cooling on the launch pad.
  - A labeled what-if in the app is fair. It should not appear as flight hardware.
- **Caution:** if your contact works on Dragonfly exchangers, keep non-public details out of a public app. Program hardware data can be proprietary or export-controlled.

---

## 5. Titan environment

| Property | Value | Source |
|---|---|---|
| Radius / gravity | 2,575 km / 1.352 m/s² (0.14 g) | [PUB] [NASA Titan facts](https://science.nasa.gov/saturn/moons/titan/facts/); TFAWS 2024 |
| Surface T / P (Huygens) | 93.65 ± 0.25 K; 1,467 ± 1 hPa | [PUB] [Fulchignoni et al. 2005, Nature](https://www.nature.com/articles/nature04314) |
| Density | 5.44 kg/m³ (≈4.4× Earth sea level) | [PUB] TFAWS 2024; Cornelius 2024 |
| Composition | ~95% N₂, ~5% CH₄ near the surface | [PUB] NASA facts; ICES-2023-109 |
| Speed of sound | ~195 m/s ([CALC] 197.6 m/s for N₂) | [PUB] Lorenz 2018 |
| Scale height | ~20–21 km (the sim's 19.85 km is fine) | [CALC] |
| Day length | 15 d 22 h (tidally locked); ~191 h of day and ~191 h of night at the equator | [PUB] NASA facts; [CALC] |
| Winds | typically < 1 m/s; design maximum 1.6 m/s; global models give 1–2 m/s maximum; "walking speed" near the surface | [PUB] TFAWS 2024; ICES-2023; Lorenz 2018; Nature 2005 |
| Light | surface illumination ~1,000× below Earth's, mostly red and near-IR; near-surface visibility ~10 km | [PUB] Lorenz 2018 |
| Fog | possible ground fog within ~10 m of the surface in Huygens images (optical depth change 0.005–0.014) | [PUB] [arXiv 1603.04413](https://ar5iv.arxiv.org/html/1603.04413) |
| Rain | methane storms darkened ~500,000 km² of equatorial ground (Belet) in 2010: wet desert ground at low latitudes | [PUB] [JPL 2011](https://www.jpl.nasa.gov/news/cassini-sees-seasonal-rains-transform-titans-surface/) |
| Seasons | each lasts ~7 years; equinox May 2025 → northern-winter solstice ≈ late 2032, so arrival in late 2034 falls in northern winter / southern summer | [PUB] NASA facts; [CALC] |
| Dunes | ~100 m high, 1–2 km wide, hundreds of km long; ~13% of the surface, between ±30° latitude; grains are solid hydrocarbons | [PUB] [JPL dunes](https://www.jpl.nasa.gov/news/cassini-sees-the-two-faces-of-titans-dunes/) |
| Sand transport | the threshold wind is ~50% above earlier predictions; rare strong westerly gusts near equinox shape the dunes | [PUB] [APL 2014](https://www.jhuapl.edu/news/news-releases/141208a-new-research-offers-explanation-titan-sand-dune-mystery); [Burr et al. 2015](https://www.nature.com/articles/nature14088) |
| Huygens surface | "icy grains with the consistency of wet clay or sand" | [PUB] Nature 2005 |
| Landing site | Selk region: ellipse 149 × 72 km centered at 3.7°N, 161.8°E; flat interdunes; ice-rich ejecta; impact melt may once have mixed water with organics | [PUB] [Lorenz et al. 2021 via AAS Nova](https://aasnova.org/2021/10/05/where-does-a-dragonfly-land/) ([paper](https://iopscience.iop.org/article/10.3847/PSJ/abd08f)) |
| Seas and lakes | all but three of 32 named lakes are near the north pole; Ontario Lacus is ~234 × 73 km | [PUB] [Planetary Society](https://www.planetary.org/articles/0315-titans-lakes-the-basics) |
| Seas | Ligeia Mare, the second-largest sea (about Lake Huron + Lake Michigan), reaches ~160 m deep along the radar track and is mostly liquid methane, with a likely organic sludge floor | [PUB] [JPL 2016](https://www.jpl.nasa.gov/news/cassini-explores-a-methane-sea-on-titan/) ([bathymetry, Mastrogiuseppe 2014](https://agupubs.onlinelibrary.wiley.com/doi/10.1002/2013GL058618)) |
| Interior | NASA's Titan facts page still describes an ocean 55–80 km below the ice. A December 2025 *Nature* reanalysis of Cassini tidal data (Petricca et al.) instead finds strong tidal dissipation that argues against a global ocean: an ice shell over slushy layers, with isolated meltwater pockets near the rocky core that may reach ~20 °C. Dragonfly's seismometer is expected to help settle this. | [PUB] [NASA facts](https://science.nasa.gov/saturn/moons/titan/facts/); [JPL, Dec 2025](https://www.jpl.nasa.gov/news/nasa-study-suggests-saturns-moon-titan-may-not-have-global-ocean/); [Nature](https://www.nature.com/articles/s41586-025-09818-x) |
| Magnetic field | "No evidence of an internal magnetic field at Titan was detected." Cassini instead saw an *induced* magnetosphere, with Saturn's field draping around Titan's ionosphere. There is no "geomagnetic polarity" to model. | [PUB] [Backes et al., *Science* 2005](https://science.sciencemag.org/content/308/5724/992) |

**Realism note on the pool.** Dragonfly lands near the equator in northern winter, and the seas are near the north pole. A closer match to the landing site would be **rain-darkened wet ground** or a transient methane puddle after a storm, which is documented at low latitude in 2010. The current app already labels the pool fictional.

**Sediment.** Fine dust follows the air and settles slowly. Sand-sized grains hop, but need stronger wind than older models predicted. Pebbles barely move. Do not use a single "float" setting for all debris.

---

## 6. Communications
- **Hardware:** X-band only, APL Frontier radio, 100 W TWTA. The high-gain antenna is an 87.4 cm (34.4 in) radial-line slot disc on a motorized arm, with medium- and low-gain antennas as backups. [PUB] NASA; APL; Jul 9 blog
- **Direct-to-Earth only**, with no relay. Seen from Titan, Earth stays within ~6° of the Sun, so links happen during the day. The antenna is stowed in flight. [PUB] Lorenz 2018. Expect ~8-day stretches with no transmission. [PUB] Eos 2025
- **Operations cadence (APL):** "Flight, data transmission, and most science operations will be executed during Titan's daytime hours (eight Earth days)." There is one hop per full Titan day, and the vehicle recharges during the night. [PUB] [APL mission overview](https://dragonfly.jhuapl.edu/What-Is-Dragonfly/)
- **Light time:** 67–92 min one way [CALC]. The app's 73–90 min is fine.
- **Sim changes:** block downlink in flight and at night; add an uplink delay to commanded flights; charge the energy cost of downlink (§3.5).

---

## 7. Simulator audit: current value vs. research

| Area | Research | Status (Sep 28) | Remaining action |
|---|---|---|---|
| Mass, size, rotor Ø | 875 kg; 3.85×3.85×1.75 m; 1.35 m [PUB] | **Done** | Optional: show "design max just under 1,000 kg" |
| Vehicle geometry | labeled 2023 layout (TFAWS 2023 slide 3; ICES-2020/2023 fig. 1) [PUB] | **Done** (Sep 29): research model, measured 3.87 × 3.83 × 1.81 m; original model kept behind a toggle | Layered Mission views (see Future update requests) |
| Blades | **3 per rotor** (2026) [PUB] | **Done** (`74ed2c4`) | — |
| Battery | **11.5 kWh** pack, 134 Ah cells [PUB] | **Done** (`74ed2c4`) | — |
| MMRTG electric | ~70–100 W at Titan, declining ~2.5%/yr [PUB/CALC] | **Done**: 90 W / 70 W options | — |
| MMRTG heat | ~2,000 W at start of mission → 1,670 W at end; ducts, trim and foam set the balance [PUB] | **Done**: 1,800 W with Pu-238 decay and a gas-loop balance | — |
| Hover / cruise power | 4.5–6 kW cruise, with a minimum near 6–10 m/s [PUB/CALC] | **Done**: induced + profile + parasite + climb curve | — |
| Mode transitions | real aircraft cannot teleport; Titan's weak gravity arrests a climb slowly [PUB §2.1] | **Done** (this session): rate-limited vertical, attitude and speed; Auto re-phasing; no mesh-induced jumps | — |
| Throttle / sticks | Dragonfly is RPM-controlled, fixed pitch [PUB] | **Done** (this session): sticky climb-rate throttle, optional centering, relative stick drag | — |
| Flight altitude | nominal ~400 m; profiles 0.5–4 km; ceiling 4 km [PUB] | **Done** (Sep 28): flight plans offer 40 m hop, 150 m scouting and 400 m cruise; the Auto demo stays at ~46 m | Optional: higher profiles (0.5–4 km) |
| Flight duration | ≤ ~30 min; battery +10 °C per 30 min; 35 °C cap [PUB] | **Done** (Sep 28): 35 °C guard, flight-time estimate, 30 min timer, "land now" advisories | Optional: automatic landing on "land now" |
| Descent | avoid steep, fast descents (vortex ring state) [PUB] | **Partial**: advisory from `74ed2c4`; Land now flares at ≤ 1.3 m/s | Optional: slanted approach in Auto |
| Thermal bands | battery 10±10 °C, 0–35 °C; interior ~0 °C; hibernation ≥ −20 °C [PUB] | **Done**; **Sep 29**: phase-change buffer (7.5 kg at 22.5 °C [PUB], 200 kJ/kg [EST]) | — |
| Trim | 0–40% in 2% steps, PI, ~10 min cycle; ≥810 W hot; ≤36 W closed [PUB] | **Done** (simplified single loop) | — |
| Convection | h ≈ 3–5 calm, ~10–18 at 1.6 m/s, 50–100 in flight [PUB/CALC] | **Done**: interpolated 4 / 10.5 / 75 | — |
| Preflight | motor preheat 8 × 90 W × 5 min [PUB] | **Done** (Sep 28): 60 Wh per cold start, time-compressed | — |
| Wind | < 1 typical, 1.6 max [PUB] | **Done** (Sep 28): values above 1.6 m/s labeled as stress tests | — |
| Comms | direct-to-Earth by day, antenna stowed in flight [PUB] | **Done** (Sep 28): gated on landed + daylight; 200 W downlink with data counter | Optional: uplink delay on commands |
| Sampling | DraMS electronics ~120 W; real sampling takes hours [PUB/EST] | Gameplay: 30 s, labeled; **Sep 29**: "Sample here" anywhere on dry ground with illustrative, ground-dependent results; DraGNS counting, DraGMet weather/seismic log, DragonCam imagery and a stored-data downlink | Optional: realistic multi-hour sample timelines |
| Landing area | Ahmakiq Undae: dunes and interdunes south of Selk, reaching to hills [PUB]; dunes ~100 m high, 1–2 km wide, roughly W–E [PUB] | **Done** (Oct 8): interdune corridor between dunes 75–120 m high, ~1.2 km wide, 3.2 km apart, trending 8° N of E; hills beyond the northern dune; dark pebble-free dune sand. Layout illustrative [EST]; old maps in `archive/` | — |
| Pool | no seas at the landing site; wet ground after rain is realistic [PUB] | **Done** (Sep 28): rain-darkened interdune (landable) around a small methane puddle (no landing) | — |
| Fog / light | visibility ~10 km [PUB]; FogExp2 density ≈ 1.98 / visibility (in scene units) for 2% contrast [CALC]; surface light ~1/1,000 of Earth's [PUB] | **Done** (Sep 28): haze-dominated orange lighting, weak direct sun, sky gradient, darker night; fog ~3.6 km [EST, limited by the terrain extent] | Optional: larger terrain so fog can match 10 km |
| Phone layout | — | **Done** (this session): portrait and landscape | — |

---

## 8. Handoff plan for Codex/GPT (priority order)

Items 1 and 3 and the vortex-ring-state warning are now implemented (see §0). The remaining work is items 2, 4, 5 and 6.

1. **Thermal model v2 for the nitrogen environment.** Done in `74ed2c4`; kept for reference.
   - External coefficient: `h_ext = max(h_nat, h_forced(V_rel))`, where `V_rel` is the wind on the ground or the airspeed in flight. Calibrate to APL values: calm ≈ 4, wind 1.6 m/s ≈ 10–15, flight 50–100.
   - Leak conductance: `UA_leak = 1 / (t/(k·A) + 1/(h_ext·A))` with k = 0.01, t = 0.0762 and A ≈ 20 m² [EST area].
   - Duct heat: `Q_duct = ṁ·cp·(T_rtgAir − T_bay)` with ṁ = 0.052 kg/s × fan speed and cp ≈ 1,040–1,070 J/kg·K (≈ 55 W/K at full fan).
   - Cold duct: `Q_cold = open/0.40 × Q_max(h_ext)`, where Q_max is ~500 W calm and ~810 W in the hot case. Open fraction is 0–0.40 in 0.02 steps, under PI control; closed leak is 36 W.
   - Battery: phase-change buffer of 7.5 kg × latent heat L at 22.5 °C. Paraffin-type materials run L ≈ 150–250 kJ/kg ([PUB] [overview](https://en.wikipedia.org/wiki/Phase-change_material)), giving a buffer of about 1.1–1.9 MJ ([CALC]); Dragonfly's exact wax is not published. The battery also rises +10 °C per 30 min of flight, within limits of 0 / 35 °C.
   - Motors: a cold node with preheat to −65 °C and ≤ 300 W each in flight.
   - Add tests for calm-overheat, windy-cold and flight-heating cases.
2. **Cruise mode, a small separate panel.** A pumped fluid loop with radiators, bypass valves (4–96%), and sunlight of 1,361/r² W/m² from 0.615 to 9.07 AU.
   - The heritage coolant is CFC-11 at 2 L/min. At 1.494 kg/L that is ≈ 0.050 kg/s. CFC-11 melts at −110.5 °C and boils at 23.8 °C at 1 atm, so the loop runs pressurized. [PUB] [properties](https://en.wikipedia.org/wiki/Trichlorofluoromethane); [CALC]
   - Its liquid heat capacity was not verified this pass. Take it from NIST before computing a capacity rate, and remember that the fluid was still a trade study in 2020.
   - Optionally add the **what-if shell-and-tube exchanger**, labeled "hypothetical", using the counterflow effectiveness formula: ε = (1 − e^(−NTU(1−Cr)))/(1 − Cr·e^(−NTU(1−Cr))), NTU = UA/Cmin, Q = ε·Cmin·ΔT_in.
3. **Energy realism:** 11.5 kWh battery; time-based MMRTG (90 W → −2.5%/yr, with a 70 W option); the power curve from §3.4; the 60 Wh preflight preheat; downlink energy.
4. **Operations realism:** flights only in daylight; one committed flight per Titan day; scout-and-return (leapfrog); a "land now" fault response; vortex-ring-state warning; ~400 m cruise altitude.
5. **Visuals:** three-bladed rotors; high-gain antenna on a raise/lower arm; visibility-based fog; dimmer lighting (~1/1,000 of Earth's); optional rain-darkened ground patches.
6. **Housekeeping:** the stale placeholders are fixed; still append the new sources to `RESEARCH.md` and keep every assumption labeled in the UI.
7. **Entry, descent and landing scenario**: **Done** (Sep 29) as the time-compressed "Arrival at Titan" opening sequence (`dist/edl.mjs`), following §2.4 from entry interface to release at 1,000 m at 2.9 m/s and powered flight to touchdown.

---

## Future update requests

- **Mission vehicle window: layered model views**: **Done** (Sep 29, Claude) as the Vehicle Layers panel (Exterior / Internal / Thermal); see `CHANGELOG.md`. Original request below. Add selectable exterior, thermal, and internal-parts/cutaway views in the vehicle window under Mission. Keep the views synchronized with the shared vehicle and diagnostic state. Clearly label illustrative internal layouts and modeled temperatures rather than presenting them as verified flight hardware or measured thermal imagery.
  - *Design notes (Claude, 2026-09-29):* the research model in `dist/chase-vehicle.mjs` is already split into named subsystem groups (`fuselage`, `attic`, `navigation-sensors`, `instrument-booms`, `mmrtg`, `fins`, `antennas`, `high-gain-antenna`, `landing-gear`, `drills`, `arms`, `motors`, `rotors`), exposed as `chaseRenderer.subsystems`, each with `userData.thermalZone`. The Mission view draws the vehicle with `drawMission()` (neutral top-down portrait), which is where a layer switch belongs.
  - *Thermal layer:* color each group by its zone from existing state: `insulated-shell` outer surface ≈ ambient (−179 °C) plus the foam leak (`foamUA`, `heatOutW`); interior bay = `coreC`; battery = `batteryC`; `mmrtg` = warm gas `warmGasC` (fin-root temperature is not modeled); `motors` = preheat target −65 °C [PUB] (not otherwise modeled); `antennas`, `fins`, `exterior-structure` ≈ ambient. Show a legend with the value source and an "illustrative" label.
  - *Internal-parts layer:* fade the `fuselage`/`attic` shells (transparent material) and show an `interior` group built from the TFAWS 2023 top view (slide 3): ducting down the centerline, fans at the tail end, equipment boxes; label positions as illustrative.

---

## 9. Calculation notes
The values marked [CALC] come from `research/titan_physics.py`, now included in the project. It ran successfully in this session, and anyone can re-run it with `python3 research/titan_physics.py`. The outputs quoted in §3–§5 match its printout. For example:
- h = 4.49 W/m²·K on Titan versus 3.23 on Earth for natural convection at ΔT = 10 K;
- 9.91 versus 3.92 W/m²·K for forced convection at 1 m/s;
- 101 W/m²·K on Titan at 10 m/s;
- a Titan-to-Earth hover-power ratio of 0.0243;
- MMRTG output of 90 W after 8 years and 84 W after 11 years.

- **Convection:** Churchill–Chu correlation for natural convection on a vertical plate; flat-plate correlations for forced convection (laminar below Re 5×10⁵, mixed above).
- **Rotor power:** momentum theory with κ = 1.15, profile power fixed at 25% of ideal hover, and an assumed drag area of 1.5 m².
- **MMRTG:** geometric decline fitted to the fact sheet's 110 → 72 W over 17 years; Pu-238 half-life 87.7 years.
- **Light time:** 1 AU = 8.317 light-minutes.
- **Season:** Saturn equinox 2025.35 plus a quarter of a 29.457-year Saturn year.

**Key sources not linked above:**
- [NASA podcast ep. 168](https://www.nasa.gov/podcasts/small-steps-giant-leaps/episode-168-dragonfly-mission-to-titan/) — calm-weather overheating
- [NASA TDT rotor test, 2022](https://www.nasa.gov/missions/dragonfly/rotors-for-mission-to-titan-tested-at-langleys-transonic-dynamics-tunnel/)
- [APL rotor release, Jan 2026](https://www.jhuapl.edu/news/news-releases/260123-engineers-lift-dragonfly)
- [OIG news summary](https://oig.nasa.gov/news/dragonfly-mission-faces-schedule-delays-and-nearly-1-billion-in-cost-increases/)
- [Selk radar study (PSJ 2022)](https://iopscience.iop.org/article/10.3847/PSJ/ac8428)
- [MMRTG/Titan radiation study](https://www.sciencedirect.com/science/article/abs/pii/S0094576522004611)

**Further reading, identified but not read:**

These are paywalled or blocked. Read them before using any of their numbers.
- *Flight Control System Design and Analysis for the Dragonfly Lander* — [AIAA SciTech 2026](https://arc.aiaa.org/doi/10.2514/6.2026-2532)
- *Modeling and Flight Performance of NASA's Dragonfly Rotorcraft Lander* — [AIAA SciTech 2026](https://arc.aiaa.org/doi/10.2514/6.2026-2534)
- *EDL Concept of Operations for the Dragonfly Rotorcraft Mission to Titan* — [AIAA SciTech 2026](https://arc.aiaa.org/doi/abs/10.2514/6.2026-1953)
- *Dragonfly First Flight – Preliminary Flight Dynamics Analysis* — [AIAA 2024](https://arc.aiaa.org/doi/10.2514/6.2024-2119)
- *Dragonfly Preparation for Powered Flight: Lander Separation State Control* — [AIAA 2024](https://arc.aiaa.org/doi/10.2514/6.2024-2118)
- *Lidar-Based Landing Hazard Detection for Dragonfly* — [IEEE 2025](https://ieeexplore.ieee.org/document/11068529/)

**Source check for an item flagged in `RESEARCH-FOLLOWUP.md`.** The ICES lead `29ec2f82-fb12-489e-865b-81cfb7622e4e` is *Thermal Design and Control of the Main Electronic Box in Titan Environment for the DraMS Instrument* (ICES-2023-109). It reports:
- ~120 W of waste heat from the box;
- nine boards, two of them conductively cooled;
- a fan passing about 20 CFM (0.0094 m³/s) of conditioned lander gas held near 273 K;
- electronics survival above ~243 K;
- measured convection coefficients of 7.34–16.37 W/m²·K at 1.5 atm.
