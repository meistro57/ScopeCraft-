# ScopeCraft Roadmap

This plan translates the AGENT goals into a sequenced roadmap. Each phase is scoped so that we can iterate while continuously shipping improvements.

## Phase 1 – Observation Insights & Control Enhancements
**Objectives**
- Add contextual help so newcomers understand each optical parameter.
- Surface key optical metrics (focal ratio, field of view estimates, magnification, resolution, light gathering) that update live.
- Introduce eyepiece presets so users can explore magnifications quickly.
- Establish a calculation module with unit-tested formulas to support later features.

**Key Deliverables**
- Tooltip system tied to existing controls and new metrics panel.
- Reusable utilities for telescope/eyepiece calculations with Jest coverage.
- Extended UI controls (eyepiece selector) with clean state updates.

**Dependencies**
- None. This phase lays the computational groundwork that later phases reuse.

## Phase 2 – Visualization & Interaction Upgrades
**Objectives**
- Improve preview ergonomics with zoom/pan and measurement overlays.
- Offer side-by-side comparisons of multiple configurations.
- Integrate optional 3D preview (Three.js) scaffold that mirrors 2D design state.

**Key Deliverables**
- Refactored rendering pipeline to support layered annotations.
- Comparison view state handling and UI layout.
- Lazy-loaded Three.js module with a minimal 3D representation.

**Dependencies**
- Relies on the calculation utilities and structured state from Phase 1.

## Phase 3 – Export, Reporting & Sharing
**Objectives**
- Expand export options (PNG, PDF, DXF) and include a rich specification report.
- Generate BOM/parts list derived from design parameters.
- Enable sharing via serialized URLs or saved design blobs.

**Key Deliverables**
- Export service abstraction with multiple format adapters.
- Parts list generator reusing calculation utilities.
- Shareable design encoder/decoder with validation.

**Dependencies**
- Calculation utilities (Phase 1) and visual refactors (Phase 2) for accurate exports.

## Phase 4 – Educational & Guided Experiences
**Objectives**
- Add Explain mode with inline copy describing the impact of changes.
- Provide ray diagram overlays and interactive tutorials/guided flows.
- Link to curated learning resources contextual to the user’s current design.

**Key Deliverables**
- Explain mode toggle integrated with tooltips/metrics.
- Ray tracing visualization leveraging Maker.js geometries.
- Tutorial state machine with progressive disclosure content.

**Dependencies**
- Builds on visualization upgrades (Phase 2) and calculation accuracy (Phase 1).

## Phase 5 – Architecture, Performance & Extensibility
**Objectives**
- Transition to modular architecture with dedicated state management (e.g., Zustand).
- Add TypeScript for type safety and improved maintainability.
- Optimize rendering for complex designs and cache heavy computations.
- Expand telescope types, mounts, and accessories with cost estimation.
- Set up user accounts, design saving, and collaboration primitives.

**Key Deliverables**
- Bundler/tooling configuration supporting TS and modular code.
- State management layer with persistence capabilities.
- Performance profiling tools and caching mechanisms.
- Extensible schema for telescope/mount/accessory catalogs.
- Backend/API interface stubs for auth and shared designs.

**Dependencies**
- Earlier phases ensure the UX foundation is strong before tackling structural overhauls.
