# 03: Quick-create issues from Board columns

**What to build:** Let project members create an issue at the top or bottom of
an existing Board column using a small in-column composer, without opening the
full Create dialog.

**Blocked by:** 01: Update full Create/Edit forms and shared issue rules.

**Status:** ready-for-agent

## Acceptance criteria

- [ ] Use EDS 2.0 beta components wherever a suitable beta equivalent exists for
  components touched by this ticket. This applies generally, not to a particular
  component type. Retain existing components where no suitable beta counterpart
  exists.
- [ ] Do not migrate simple card surfaces, layout wrappers, typography, or plain
  text to beta components. This is not a wholesale component migration.
- [ ] Every existing Board column shows an Add issue button above and below its
  cards, including empty columns. Do not add a Utility column.
- [ ] Clicking Add opens a composer at the clicked position, titled
  "NEW <COLUMN TYPE>", with required Name and Description fields and an
  accessible In/On/Out boundary selector. Focus starts in Name.
- [ ] Reuse ticket 01's validation, defaults, and selectors. The issue gets the
  column's type and boundary In; Decision/Uncertainty defaults stay Policy/not key.
- [ ] Allow only one composer at a time. While it is open, disable the other
  Add issue buttons rather than switching drafts or asking about discarding one.
- [ ] Add is disabled for empty/whitespace-only required inputs and while a
  request is pending.
- [ ] Enter submits a valid draft; clicking Add does the same. Shift+Enter
  inserts a newline in Description.
- [ ] Enter on an incomplete draft shows the appropriate required-field error,
  focuses the missing field, and creates nothing. Errors clear after valid input.
- [ ] A top composer creates the first issue in its column; a bottom composer
  creates the last. Placement persists after refetch and reload using the existing
  frontend ordering and whole-issue APIs.
- [ ] On success, replace the composer with its Add button and highlight the
  new card for two seconds.
- [ ] A failed creation keeps the composer and draft, shows the existing error,
  and does not show a successful-creation highlight.
- [ ] Escape or the close button collapses the composer and discards its draft.
  An outside click closes an empty composer but leaves a nonempty draft open.
- [ ] Switching views or leaving the page discards the unsaved draft without a
  navigation confirmation.
- [ ] Keep the full Create path and existing project-member permissions.
- [ ] Verify both insertion positions, persisted order, empty columns, disabled
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
