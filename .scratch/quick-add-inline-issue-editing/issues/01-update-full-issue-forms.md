# 01: Update full Create/Edit forms and shared issue rules

**What to build:** Update the full Create issue experience to the linked Figma
design and use matching shared controls in Edit. Establish the agreed validation
and creation defaults that the quick-add and inline-edit flows can reuse, while
preserving all existing full-form capabilities.

**Blocked by:** None (can start immediately).

**Status:** resolved

## Acceptance criteria

- [x] Use EDS 2.0 beta components wherever a suitable beta equivalent exists for
  components touched by this ticket. This applies generally, not to a particular
  component type. Retain existing components where no suitable beta counterpart
  exists.
- [x] Do not migrate simple card surfaces, layout wrappers, typography, or plain
  text to beta components. This is not a wholesale component migration.
- [x] Full Create matches the linked design: issue name, description, issue type,
  boundary, and the relevant Decision or Uncertainty details. Edit uses the
  matching shared controls without losing any existing fields or capabilities.
- [x] Issue type and boundary use accessible segmented selectors. Issue type
  choices are Unassigned, Decision, Uncertainty, Fact, and Utility; boundary
  choices are In, On, and Out. Keyboard navigation and visible focus work.
- [x] Decision type uses the matching Policy, Focus, and Tactical control.
- [x] Empty or whitespace-only issue names, issue descriptions, option names,
  and outcome names are rejected. There is no subjective text-quality check.
  Options and outcomes do not require descriptions.
- [x] Required-field messages are "Issue name is required", "Issue description
  is required", "Option name is required", and "Outcome name is required".
- [x] Validation preserves meaningful whitespace and multiline descriptions.
  Do not introduce uniqueness checks or maximum-length limits.
- [x] New issues default to boundary In. Decisions still default to Policy;
  Uncertainties still default to not key and both still start with no states.
  Editing an issue preserves its existing values.
- [x] Changing issue type retains existing nested data and classification
  fields, as it does today.
- [x] Empty option/outcome utility inputs save as zero.
- [x] Enter submits the description editor; Shift+Enter inserts a newline.
- [x] Full Create/Edit continue using the existing whole-issue API and existing
  project-member permissions. Do not add backend endpoints or Undo.
- [x] Verify creation and editing for all issue types, required-field failures,
  keyboard interactions, defaults, and preservation of existing data.

## Design references

Parent: https://github.com/equinor/prisma-decision-web/issues/874

Create visuals:
https://www.figma.com/design/iJr3w56fyMClNAn7xuIop3/Dot-Design?node-id=1836-151981

Original acceptance criteria:
https://github.com/user-attachments/files/33243240/Gherking.for.inline.editing.md

The decisions above override conflicting original criteria. In particular, the
default boundary is In, not the On shown in the Create design.

## Answer

Implemented on `issue-874/01-full-forms`, based on
`75a52340987330b2fc47fca1fadb8fd7af33131c`. Ticket 01 was claimed before implementation;
the other six approved templates retain their ready-for-agent status and content.

- Activated `@equinor/eds-core-react` `3.0.0-beta.2` and its `/next/index.css`.
  Full-form fields, actions, switch, radios and Edit dialog use actual beta APIs.
  Stable Popover/CircularProgress remain because beta has no counterparts.
  Layout, text and card primitives were not migrated.
- Inspected Figma Create metadata and Decision screenshot plus the shared Create
  reference image. Create now follows the name/description/classification/details
  layout, with the approved In default overriding the visual's On.
- `src/components/common/SegmentedSelector.tsx` provides labelled beta-radio
  segments with arrow/Home/End navigation, roving focus and visible focus styles.
  Custom styling uses Tailwind utilities, not a separate CSS stylesheet; the
  beta vendor stylesheet remains imported for the EDS components themselves.
- `src/utils/createIssueDraft.ts` exports `createIssueDraft(projectId)` for future
  creation flows. It supplies all existing whole-issue fields, In/Policy/not-key
  defaults and empty state arrays.
- `src/validators.ts` exports `issueSchema`, `optionSchema` and `outcomeSchema`.
  Their required text rules reject blank text without trimming submitted values,
  adding text-quality rules, uniqueness checks or length limits.
- Full-form submissions retain the existing `/issues` array-based POST/PUT APIs,
  `mutate` lifecycle, and permission/caller wiring. Existing disabled submit UI
  handles pending requests; no extra mutation guard or async/catch layer is added.
  Failed saves retain drafts and cancellation/reset behavior is preserved.
- Beta vendor styles are centralized with explicit layer order after Tailwind's
  base reset and before application utilities. The existing unscaled Equinor
  font remains in use; the official Inter variable font is loaded separately for
  beta controls. Beta color-scheme tokens follow the existing theme preference.
  Browser regression checks
  assert a nontransparent primary button and noncollapsed text fields; jsdom
  behavior tests do not substitute for these computed-style checks.
- Minimal shared testing: `vitest.config.ts`, `src/test/setup.ts`, `npm test`.
  Tests use real forms and an HTTP adapter stub, not mocked application components.

Verification: **32 tests passed** across the full-form and schema regressions;
`npm run tsc`, touched-file ESLint, source/tooling/README Prettier, `git diff --check` and
`npm run build` passed. Build retains its large-chunk advisory.
`npm run lint` reports **23 pre-existing quote errors** in the untouched
`.agents/skills/setup-ts-deep-modules/dependency-cruiser.config.cjs`; running ESLint
on that file's base-commit content reproduced the same 23 errors.
The approved ticket templates retain their original Markdown continuation
indentation rather than being reformatted; template-only Prettier checks report
that pre-existing formatting.

Integrated browser validation is owned by the parent against the already-running
remote dev API. No local backend/API/database was started or provisioned here.
No quick-add, inline text/classification, state-card edits, Undo or new endpoints
were implemented.
