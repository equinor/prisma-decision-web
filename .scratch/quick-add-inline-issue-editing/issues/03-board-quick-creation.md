# 03: Quick-create issues from Board columns

**What to build:** Let project members create an issue at the top or bottom of
an existing Board column using a small in-column composer, without opening the
full Create dialog.

**Blocked by:** 01: Update full Create/Edit forms and shared issue rules.

**Status:** resolved

## Acceptance criteria

- [x] Use EDS 2.0 beta components wherever a suitable beta equivalent exists for
  components touched by this ticket. This applies generally, not to a particular
  component type. Retain existing components where no suitable beta counterpart
  exists.
- [x] Do not migrate simple card surfaces, layout wrappers, typography, or plain
  text to beta components. This is not a wholesale component migration.
- [x] Every existing Board column shows an Add issue button above and below its
  cards, including empty columns. Do not add a Utility column.
- [x] Clicking Add opens a composer at the clicked position, titled
  "NEW <COLUMN TYPE>", with required Name and Description fields and an
  accessible In/On/Out boundary selector. Focus starts in Name.
- [x] Reuse ticket 01's validation, defaults, and selectors. The issue gets the
  column's type and boundary In; Decision/Uncertainty defaults stay Policy/not key.
- [x] Allow only one composer at a time. While it is open, disable the other
  Add issue buttons rather than switching drafts or asking about discarding one.
- [x] Add is disabled for empty/whitespace-only required inputs and while a
  request is pending.
- [x] Enter submits a valid draft; clicking Add does the same. Shift+Enter
  inserts a newline in Description.
- [x] Enter on an incomplete draft shows the appropriate required-field error,
  focuses the missing field, and creates nothing. Errors clear after valid input.
- [x] A top composer creates the first issue in its column; a bottom composer
  creates the last. Placement persists after refetch and reload using the existing
  frontend ordering and whole-issue APIs.
- [x] On success, replace the composer with its Add button and highlight the
  new card for two seconds.
- [x] A failed creation keeps the composer and draft, shows the existing error,
  and does not show a successful-creation highlight.
- [x] Escape or the close button collapses the composer and discards its draft.
  An outside click closes an empty composer but leaves a nonempty draft open.
- [x] Switching views or leaving the page discards the unsaved draft without a
  navigation confirmation.
- [x] Keep the full Create path and existing project-member permissions.
- [x] Verify both insertion positions, persisted order, empty columns, disabled
  alternative Add buttons, keyboard/focus behavior, close rules, failures, and the
  two-second highlight.

## Design references

Parent: https://github.com/equinor/prisma-decision-web/issues/874

Issues visuals:
https://www.figma.com/design/iJr3w56fyMClNAn7xuIop3/Dot-Design?node-id=1913-875

Original acceptance criteria:
https://github.com/user-attachments/files/33243240/Gherking.for.inline.editing.md

The decisions above override the original composer-switching scenario: other Add
buttons are disabled while a composer is open. This is frontend-only work.

## Answer

Implemented only ticket 03 on `issue-874/03-board-create`, starting from
`56a1a134feb9b5e0f73ddd9b380d6a761d364899`. Claimed before implementation.

- The real beta Button, Icon, TextField and TextArea controls reuse
  `SegmentedSelector`, `createIssueDraft` and `issueSchema`. Feature styling is
  Tailwind only; no CSS file, vendor stylesheet import or inline style was added.
- `TableView/BoardIssueComposer.tsx` owns required-field validation, initial Name
  focus, keyboard submission, dismissal, pending locks and failure-draft retention.
  `BoardQuickAdd.tsx` renders a position's Add control or active composer.
- `TableView/useBoardQuickCreation.ts` coordinates one composer across all columns
  and independent two-second card highlights. View/page/project changes discard
  drafts; late completion cannot collapse a newer composer.
- `TableView/useCreateBoardIssue.ts` uses existing array-based `/issues` POST/PUT
  requests and whole-issue data. Bottom gets the current column maximum plus one.
  Top gets zero; if the column already contains zero orders, its saved issues are
  first assigned consecutive positive integers in their existing sorted order.
  This preserves relative ordering and nested records, and remains correct after
  refetch/reload without changing the backend. A reorder/create failure retains
  the draft for retry and never highlights it.
- Integration wiring: `TableView` passes `IssueColumn.quickAdd(position)` and
  optional `highlightedIssueIds`. Keep the existing classified issue projection,
  `IssueBoardCardHeader`, drag/drop and shared-card children when merging later
  text/state features. Full Create/Edit lifecycle, classification implementation,
  shared cards, dependency manifests and shared test setup are unchanged.

TDD verification: **13 Board tests**, plus full-form/schema regressions,
**45 tests passed together**. Tests render real Board/List components and mock
only network/time/browser capability boundaries. They cover both positions and
persisted zero-order normalization, empty columns, defaults, disabled alternatives,
required errors/focus, multiline and selector keyboard behavior, dismissal,
view/page/project navigation, double submissions, failures/retries and the exact
1999/2000ms highlight boundary. `npm run tsc`, touched-file ESLint and Prettier,
`git diff --check`, and `npm run build` pass (existing large-chunk advisory).

The first validation reported missing Vitest, so dependencies were restored with
`npm ci`; no dependency files changed. Parent owns integration rebasing, ticket 05
harness compatibility, global beta styling corrections and authenticated remote
browser validation. No backend was provisioned and no remote data was edited.
