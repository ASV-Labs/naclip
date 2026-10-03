# NaCLip supplied-template adaptation review

Date: 2026-10-02. Page: index.html. This review separates functional acceptance of the requested adaptation from WDI's independent authorship/composition standard.

## Verdict block — index.html

A1 Viewport dominance:      3/5
A2 Section rhythm:          3/5
A3 Card justification:      4/5
A4 Type:                    4/5
A5 Color:                   4/5
A6 Motion:                  3/5
A7 Mobile composition:      4/5
Weighted overall:           3.55/5.0
Hard-fails triggered:       none
Verdict:                    FAIL

interchangeability=FAIL; screenshot=PASS; explanation=PASS

The formal WDI verdict is FAIL: this is deliberately the user-supplied two-scene composition with NaCLip content, not an independently authored product walkthrough. The explicit instruction to preserve/adapt that design takes precedence over the skill's requirement to redesign until an originality pass. No passing authorship or artifact-per-step signature is claimed.

- A1: the cinematic media dominates, with concrete NaCLip purpose and install action visible. It is atmosphere, not an operating product demonstration.
- A2: two contrasting content placements, not a long artifact-led narrative. Offsite documentation carries depth.
- A3: one white compatibility/identity tile retained by explicit user preference, no repeated card wall.
- A4: Helvetica hierarchy, legible measure, two-line headings at inspected desktop/mobile sizes.
- A5: restrained supplied blue, white/black and shaded background; logos keep their supplied colors.
- A6: decorative looping media with pause, reduced-motion source rules, motion-off entry, no application-JS fallback. It does not demonstrate a product function.
- A7: mobile disclosure, no identity tile, inline proof labels, repositioned footer/controls; every visible control/link at least 44px high in the inspected 390px state.

Three reviewed compositions: desktop opening, tablet second scene, mobile second scene. They share visual language but differ in placement and proof-label treatment. Major decisions are explained in design-notes.md.

## Functional verification

- Inspected desktop 1440×1000, tablet 834×1112 and mobile 390×844.
- Two external background videos loaded successfully, first 3828×2164 and second 1920×1080. No product screen is implied by them.
- Scene buttons, keyboard ArrowUp, menu open/close and Escape worked. Hidden scenes/menu are removed from focus with hidden/inert. Main is inert while the menu is open.
- Pause stopped both videos. `?motion=off` entered without intro, both videos paused and CSS transition duration 0s. OS prefers-reduced-motion uses the same paused/intro-free branch; its CSS and source were reviewed, not exercised by changing the user's OS setting.
- Application-script-omitted local harness showed the main proposition, installation link, compatibility tile, credits and desktop documentation navigation. Inactive menu/scene buttons are hidden. The browser engine's global JavaScript setting was not changed.
- Document horizontal overflow was zero at mobile and desktop checks. No captured console warning/error entries.
- GitHub installation anchor and document anchors checked against the repository source. Publication is separately confirmed by the Pages deployment and public browser capture.

HF-1 through HF-9: no identical card wall, unjustified gradient blob, invented product UI, unsourced metric, alternating zig-zag sequence, exceeded card budget, stock-icon feature grid, testimonial carousel or multi-brand sameness. Each fact in the proof strip has its own adjacent source link. VPM proof mode is honest text/provenance only; static media in main is classified identity.

The final static verifier exited 0 with only an informational card-like-controls finding. It does not override this FAIL verdict for independent authorship/signature conformity. Full machine receipts are retained locally and ignored; they are not website assets.

## Social distribution update

The dedicated 1200×630 type-led raster and its square crop were inspected; exact-size Instagram post and Story exports were inspected separately. Metadata/image build and deployed crawler checks PASS. X validator PASS and actual canonical-URL X composer preview PASS; test draft discarded, no publication. These are distribution checks and do not change the supplied-template authorship verdict above. Authoring HTML is an internal script outside the published landing bundle.
