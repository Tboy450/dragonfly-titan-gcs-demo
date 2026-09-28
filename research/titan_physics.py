"""Back-of-envelope Titan physics behind the [CALC] values in RESEARCH-COMPENDIUM.md.

Gas properties are textbook estimates for nitrogen at 94 K / 146.7 kPa (density from
Huygens/APL). Correlations: Churchill-Chu natural convection, flat-plate forced convection,
momentum-theory rotor power. These are sanity checks, not a validated Dragonfly model.
Run: python3 research/titan_physics.py
"""
import math
sigma = 5.670374e-8
# Gas property estimates (textbook/NIST-level approximations; flagged as estimates in doc)
titan = dict(name="Titan N2-rich gas, 94 K, 146.7 kPa", T=94.0, P=146700, rho=5.44, mu=6.35e-6, k=0.0092, cp=1070.0, g=1.352)
earth = dict(name="Earth air, 288 K, 101.3 kPa", T=288.15, P=101325, rho=1.225, mu=1.79e-5, k=0.0253, cp=1005.0, g=9.80665)
for gas in (titan, earth):
    gas['nu'] = gas['mu'] / gas['rho']
    gas['alpha'] = gas['k'] / (gas['rho'] * gas['cp'])
    gas['Pr'] = gas['nu'] / gas['alpha']
    gas['beta'] = 1 / gas['T']


def h_nat(gas, dT, L=1.0):
    Ra = gas['g'] * gas['beta'] * dT * L**3 / (gas['nu'] * gas['alpha'])
    Pr = gas['Pr']
    Nu = (0.825 + 0.387 * Ra**(1 / 6) / (1 + (0.492 / Pr)**(9 / 16))**(8 / 27))**2  # Churchill-Chu vertical plate
    return Nu * gas['k'] / L, Ra


def h_forced(gas, V, L=1.0):
    Re = V * L / gas['nu']
    Pr = gas['Pr']
    if Re < 5e5:
        Nu = 0.664 * Re**0.5 * Pr**(1 / 3)
    else:
        Nu = (0.037 * Re**0.8 - 871) * Pr**(1 / 3)
    return Nu * gas['k'] / L, Re


print("Sutherland mu(N2,94K)=%.3e" % (1.663e-5 * (94 / 273.15)**1.5 * (273.15 + 107) / (94 + 107)))
for gas in (titan, earth):
    print("\n", gas['name'])
    print("  nu=%.3e m2/s  alpha=%.3e  Pr=%.2f" % (gas['nu'], gas['alpha'], gas['Pr']))
    for dT in (10, 15):
        h, Ra = h_nat(gas, dT)
        print("  natural conv, 1 m plate, dT=%d K: h=%.2f W/m2K (Ra=%.2e)" % (dT, h, Ra))
    for V in (0.3, 1.0, 1.6, 5, 10):
        h, Re = h_forced(gas, V)
        print("  forced conv, L=1 m, V=%.1f m/s: h=%.2f W/m2K (Re=%.2e)" % (V, h, Re))

a = math.sqrt(1.4 * 8.314462 * 94 / 0.0280134)
print("\nspeed of sound N2 94K ideal: %.1f m/s" % a)
print("ideal-gas rho N2 94K 146.7kPa: %.3f" % (146700 * 0.0280134 / (8.314462 * 94)))
for eps in (0.05, 0.9):
    q = eps * sigma * ((94 + 12)**4 - 92.5**4)
    print("radiative loss eps=%.2f skin 106K to 92.5K sky: %.2f W/m2" % (eps, q))
print("natural convection at same dT=12: %.1f W/m2" % (h_nat(titan, 12)[0] * 12))
S = 1361 / 9.58**2
print("solar flux at 9.58 AU: %.1f W/m2; 1/1000 of Earth's ~1000 W/m2 surface = ~1 W/m2" % S)
for k, t in ((0.01, 0.0762), (0.035, 0.05)):
    for A in (15, 25):
        UA = k * A / t
        print("foam k=%.3f t=%.4f A=%d m2: UA=%.2f W/K -> leak at dT=194 K: %.0f W" % (k, t, A, UA, UA * 194))

W = 875 * 1.352
A4 = 4 * math.pi * 0.675**2
vi = math.sqrt(W / (2 * 5.44 * A4))
P = W * vi
print("\nideal induced hover (4 disks) vi=%.2f m/s P=%.0f W; /FM 0.65 -> %.0f W" % (vi, P, P / 0.65))
print("Lorenz scaling 2 kW @420kg -> 875kg: %.0f W; ->1000 kg: %.0f W" % (2000 * (875 / 420)**1.5, 2000 * (1000 / 420)**1.5))
PE = 875 * 9.80665 * math.sqrt(875 * 9.80665 / (2 * 1.225 * A4))
print("Earth ideal hover same vehicle: %.0f W; Titan/Earth ratio %.4f" % (PE, P / PE))
print("analytic ratio (gT/gE)^1.5*sqrt(rhoE/rhoT)=%.4f" % ((1.352 / 9.80665)**1.5 * math.sqrt(1.225 / 5.44)))
for f in (1.0, 2.0):
    for V in (5, 8, 10, 12):
        print("parasite power f=%.1f m2 V=%d: %.0f W" % (f, V, 0.5 * 5.44 * f * V**3))
# Simple momentum-theory forward-flight induced velocity (Glauert, level flight, small tilt)
for V in (0, 2, 4, 6, 8, 10, 12):
    # solve vi^4 + V^2 vi^2 - vh^4 = 0
    vh = vi
    x = (-V**2 + math.sqrt(V**4 + 4 * vh**4)) / 2
    vif = math.sqrt(x)
    Pi = 1.15 * W * vif
    Pp = 0.5 * 5.44 * 1.5 * V**3
    Ppro = 0.25 * P  # assumed profile power ~ constant, illustrative
    print("V=%2d m/s induced %.0f W + profile %.0f W + parasite(f=1.5) %.0f W = %.0f W" % (V, Pi, Ppro, Pp, Pi + Ppro + Pp))

print("\ncell energy 3.75V*134Ah=%.4f kWh; 11.5 kWh / cell = %.1f cells" % (3.75 * 134 / 1000, 11.5 / (3.75 * 134 / 1000)))
r = (72 / 110)**(1 / 17)
print("MMRTG avg electrical retention per yr 110->72 W over 17 yr: %.4f (%.2f%%/yr decline)" % (r, (1 - r) * 100))
for yrs in (6, 7, 8, 9, 10, 11, 12):
    print("  after %d yr: %.0f W" % (yrs, 110 * r**yrs))
print("Pu-238 thermal decay only per yr: %.3f%%" % ((1 - 0.5**(1 / 87.7)) * 100))
print("2000 W thermal after 10 yr of Pu-238 decay only: %.0f W" % (2000 * 0.5**(10 / 87.7)))
Tsol_h = 15.945 * 24
print("\nTsol hours %.1f; half %.1f; MMRTG energy per Tsol at 100 W: %.1f kWh; at 90 W: %.1f kWh; at 70 W: %.1f" % (Tsol_h, Tsol_h / 2, 0.1 * Tsol_h, 0.09 * Tsol_h, 0.07 * Tsol_h))
for Pf in (4500, 6000):
    E = Pf * 0.5 / 1000
    print("30-min flight at %d W: %.2f kWh; recharge at 50 W net: %.0f h (%.1f Earth days)" % (Pf, E, E * 1000 / 50, E * 1000 / 50 / 24))
print("motor preheat 8x90 W x 5 min = %.0f Wh" % (8 * 90 * 5 / 60))
E_bit = 5e-3 * 9.0
print("5 mJ/bit/AU at 9 AU: %.0f mJ/bit; 1 Gbit costs %.1f kWh; 38.4 kWh -> %.2f Gbit" % (E_bit * 1e3, E_bit * 1e9 / 3.6e6, 38.4 * 3.6e6 / E_bit / 1e9))
for d in (8.0, 9.0, 10.2, 11.1):
    print("OWLT at %.2f AU: %.1f min" % (d, d * 149597870.7 / 299792.458 / 60))
eq = 2025 + (126 / 365)
print("\nSaturn equinox ~%.2f; +1/4 Saturn yr (%.2f) -> solstice ~%.2f" % (eq, 29.457 / 4, eq + 29.457 / 4))
R = 8.314462
M = 0.0280134 * 0.95 + 0.01604 * 0.05
print("scale height RT/Mg with M=%.4f: %.0f m" % (M, R * 94 / (M * 1.352)))
print("sim scale height P/(rho g): %.0f m" % (146000 / (5.44 * 1.352)))
for rpm in (795, 1100):
    tip = rpm * math.pi * 1.35 / 60
    print("rpm %d tip %.1f m/s Mach %.2f" % (rpm, tip, tip / a))
# EDL
print("\nlander release 1000 m at 2.9 m/s descent -> %.0f s to ground if unpowered at that rate" % (1000 / 2.9))
