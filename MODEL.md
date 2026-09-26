# Zr–Nb teaching model: rules and scope

Version 1.0.0. Unless explicitly identified as a physical constant or a referenced lattice value, every rate, probability and threshold below is an **uncalibrated teaching choice**.

## Three independent modules

| Module | Calculation | Intended use |
|---|---|---|
| Evolution | Stochastic transport, sources and reservoir changes on a 2D grid | Explore qualitative mechanisms and internal model trends |
| Crystal explorer | 3D projection of fixed reference geometries | Understand HCP, BCC and FCC arrangements |
| XRD explorer | Plane spacings and synthetic Gaussian peaks | Separate peak-position and peak-width effects |

There is no calibrated cross-scale mapping between these modules. Grain and Nb-region geometry stays fixed during evolution: recrystallisation, grain-boundary motion, Nb precipitation and moving phase interfaces are omitted. Nb-region area is not a composition, phase fraction or phase-diagram prediction.

## Grid and boundaries

- 72 × 44 cells, each a statistical region rather than an atomic site.
- 4, 9 or 16 randomly seeded Voronoi grains. A cell is flagged as a boundary when its left or upper neighbour belongs to another grain.
- Seven random cluster centres define Nb-rich regions by selecting the requested fraction of closest grid cells.
- Reflecting boundaries for migration: no external H loss, permeation out of the sample or surface gas release.
- Surface H enters at the left boundary. Initial H is placed in the first 12 columns.
- Fractional source budgets carry over between steps.

## Step order

Add sources → migrate mobile H → migrate self-interstitials → cellwise recombination → grain-boundary absorption → trapping → detrapping → precipitation/dissolution.

### Sources

Each step adds `hydrogen / 9` H tracer units and `radiation / 12` vacancy–interstitial pairs. Each pair creates one vacancy and one interstitial. The interstitial is displaced from the vacancy by Gaussian offsets with a standard deviation of two grid cells, clipped to the boundary.

- **Neutrons / electrons:** uniform bulk sources using the same defect rules. Identical seeded results are a model simplification, not evidence of physical equivalence.
- **Protons:** Gaussian x-profile centred at 0.35 of the sample width with standard deviation 0.10 of its width. One extra H tracer is added per two defect pairs. No calibrated implantation range or efficiency.
- **Heavy ions:** defects created in a step share a randomly chosen cluster centre. The model does not resolve a collision cascade, electronic excitation, stopping or an ion track.
- **Photons:** no independent gamma/photon model. Electron mode is not a substitute for gamma irradiation.

### Thermally activated migration

```text
T = temperature + 273.15 K
kB = 8.617333262 × 10⁻⁵ eV/K
m = clamp(0.32 exp[−0.12 eV / kB × (1/T − 1/573.15 K)], 0.02, 0.9)
```

Mobile H hops to one of four neighbours with probability `m`; otherwise it stays. The probability is multiplied by 1.4 in Nb regions and capped at 0.95. The energy 0.12 eV, prefactor 0.32 and multiplier 1.4 are teaching values, not alloy diffusion data. HCP anisotropy is omitted.

Self-interstitials hop with probability `0.4 + 0.5m`. Vacancies do not migrate.

### Recombination and boundary sinks

Each co-located vacancy–interstitial pair is removed with probability `0.45 + 0.5m`. At boundary cells, vacancy absorption has probability `0.008 + 0.1m`; interstitial absorption has probability `0.08 + 0.2m`. Recombined pairs and the two sink totals are tracked separately.

### Reversible trapping

Let `v` be the vacancy count, `B` the boundary flag and `N` the Nb-region flag.

```text
capacity = 1 + 2v + 2B + 2N
capture probability = min(0.6, 0.04 + 0.06v + 0.06N), if v, B or N is nonzero
capture probability = 0 otherwise
detrapping probability = 0.003 + 0.045m
```

Removing a vacancy does not instantly remove already trapped H; it can subsequently detrap. This is an effective-reservoir approximation, not an explicit binding-energy model. Entire Nb regions act as traps, although real interfaces and bulk sites can behave differently.

### Precipitation and dissolution

Set the teaching threshold `s = 2 + floor(temperature / 100)`, with temperature in °C.

- In a non-Nb cell with mobile H ≥ `s + 3`, move three tracers to the hydride reservoir with probability 0.24.
- If hydride H exists and mobile H < `s`, return three tracers to the mobile reservoir with probability `0.0005 + 0.022m`.
- This count threshold is not a measured solubility limit. No TSSp/TSSd hysteresis, gamma/delta/epsilon kinetics, phase-field free energy, elastic fields, stress-driven reorientation or nucleation barrier is calculated.
- Purple markers follow an illustrative random grain orientation. Their geometry is not a crystallographic orientation-relationship prediction. A three-tracer packet is not ZrH₃ or any chemical formula.

## Conservation and history

```text
H_free + H_trapped + H_hydride = H_initial + H_surface + H_proton
V_remaining + pairs_recombined + V_sink = pairs_generated
I_remaining + pairs_recombined + I_sink = pairs_generated
```

Counts remain nonnegative integers. Heating preserves state while changing conditions; presets and rebuilding restart the sample. History is recorded every five steps, with the current final step included on export. The 2,000-step cap bounds browser work; it does not indicate physical steady state.

## What the map shows

Continuous Voronoi grain guides help readability; the engine still uses discrete cells and its boundary flags. Nb outlines follow the actual grid mask. Dots, squares, diamonds, rings and crosses separate species visually. Their offsets are visual bookkeeping, not atomic positions, and symbols indicate presence rather than one particle per marker.

Density maps use total H across all three reservoirs, or vacancies plus interstitials. Colours use a labelled, auto-ranging logarithmic scale. Symbol-layer filters do not affect density sums or inspector totals. The local inspector includes the selected cell in its 5 × 5 neighbourhood and clips that neighbourhood at sample edges.

Zooming, panning, selection and layer operations do not change the engine state or consume random numbers.

## Crystal geometry and provenance

| Reference geometry | Lattice parameters | Source |
|---|---|---|
| α-Zr, HCP | a = 0.32324 nm; c = 0.51472 nm | Initial E110 α phase in [Kashkarov et al., Coatings 2019](https://doi.org/10.3390/coatings9010031) |
| Nb, BCC | a = 0.330 nm | BCC reference in [High-temperature treatments of niobium…, 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC7842222/) |
| δ hydride, FCC metal sublattice | a = 0.47776 nm | A particular hydrogenated specimen, Table 1 in [Kudiiarov et al., Metals 2020](https://doi.org/10.3390/met10020247) |

These specimen/reference values are not a unified calibrated Zr–Nb–H database. Pure BCC Nb does not specify the beta-phase composition in an arbitrary Zr–Nb alloy.

HCP basis vectors: `a₁=(a,0,0)`, `a₂=(−a/2,√3a/2,0)`, `c=(0,0,c)`, with basis `(0,0,0)` and `(2/3,1/3,1/2)`. H markers illustrate tetrahedral positions. The FCC view places six H markers among eight tetrahedral sites in one unit cell to illustrate ZrH₁.₅ occupancy, not to predict H ordering. Sphere radii are illustrative; neighbour lines are not covalent bonds.

## XRD equations

Representative Cu Kα wavelength: `λ = 0.15406 nm`; the doublet is omitted.

```text
HCP:   1/d² = 4(h² + hk + k²)/(3a²) + l²/c²
Cubic: 1/d² = (h² + k² + l²)/a²
2θ = 2 asin[λ/(2d)]
βL = 0.9λ/(L cosθ)
βε = 4ε tanθ
```

Uniform strain multiplies every phase's lattice parameters by `1 + strain/100`; it is not inferred from H counts. Broadening terms are converted from radians to degrees and combined in quadrature with a 0.15° instrument term. Profiles are Gaussian:

```text
I(2θ) = I₀ exp[−4 ln(2) ((2θ − 2θ₀)/FWHM)²]
```

`I₀` values are chosen weights. Structure factors, absorption, texture, phase fractions and real instrument responses are omitted. Each phase is plotted separately. No Rietveld refinement is performed. The selected hkl list is illustrative, not exhaustive. Coherent domain size is not microscopy grain size.

## Mechanism reading

- [Stepanova et al., Metals 2020, 10, 592](https://doi.org/10.3390/met10050592)
- [Laptev, Stepanova et al., Metals 2024, 14, 452](https://doi.org/10.3390/met14040452)
- [Laptev, Stepanova et al., Materials 2022, 15, 3332](https://doi.org/10.3390/ma15093332)

These studies motivate the questions and experimental context. They do not validate the stochastic constants chosen here.
