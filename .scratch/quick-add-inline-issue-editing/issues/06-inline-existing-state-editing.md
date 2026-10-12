# 06: Inline-edit existing Board options and outcomes

**What to build:** Let project members refine existing Decision options and
Uncertainty outcomes directly on expanded Issues Board cards by editing the
state name and utility.

**Blocked by:** 01: Update full Create/Edit forms and shared issue rules.

**Status:** resolved

Agreed test seam: the real Issues Board rendered with project/query providers,
user interactions and a mocked HTTP boundary. Verify visible rows, focus,
validation, saves/rollback and drag gating without mocking application components.

## Acceptance criteria

- [x] Use EDS 2.0 beta components wherever a suitable beta equivalent exists for
  components touched by this ticket. This applies generally, not to a particular
  component type. Retain existing components where no suitable beta counterpart
  exists.
- [x] Do not migrate simple card surfaces, layout wrappers, typography, or plain
  text to beta components. This is not a wholesale component migration.
- [x] Hovering an existing state row shows a pencil affordance; users can
  activate editing from its name or utility.
- [x] The row becomes Name and Utility inputs, focused on the field the user
  clicked. Preserve the existing state display order.
- [x] Only one state row per card is edited at a time. Moving to another row
  saves a valid changed row before editing the next; invalid changes are not
  silently saved or discarded.
- [x] Keyboard navigation supports the original criterion: from one state's
  Name field, Tab twice reaches the next state's Name field.
- [x] Enter or clicking outside the row saves changed valid values. Moving
  between the Name and Utility inputs does not prematurely commit the row.
- [x] Escape restores the previous state without a save request.
- [x] Reuse ticket 01's required state-name validation. Reject empty or
  whitespace-only names with "Option name is required" or "Outcome name is
  required" and keep the invalid row editable.
- [x] Utility can be cleared for either state type and is saved as zero.
- [x] Update the state as part of the existing whole-issue API, retaining its
  identity, other states, and unrelated issue fields.
- [x] A failed inline save shows the existing error notification, restores the
  saved row, and loses the attempted edit.
- [x] Disable card dragging while a state editor is active. Preserve card
  expansion behavior and full Edit access.
- [x] Scope state editing to the Issues Board. Shared states/cards in other
  surfaces keep their current interactions and existing permissions remain.
- [x] Verify both options and outcomes, clicked-field focus, Tab movement,
  one-active-row transitions, row-level blur handling, zero utility, validation,
  cancellation, failure rollback, and drag gating.

## Design references

Parent: https://github.com/equinor/prisma-decision-web/issues/874

Issues visuals:
https://www.figma.com/design/iJr3w56fyMClNAn7xuIop3/Dot-Design?node-id=1913-875

Original acceptance criteria:
https://github.com/user-attachments/files/33243240/Gherking.for.inline.editing.md

State means Option or Outcome. An empty utility saves as zero; no backend
changes or Undo infrastructure are in scope. Inline add/remove controls follow
in ticket 07.

## Answer

Implemented only ticket 06 on `issue-874/06-state-edit`, starting from
`56a1a134feb9b5e0f73ddd9b380d6a761d364899`. Claimed before implementation and
used vertical red/green slices against the real Board and an Axios HTTP adapter.

`TableView/IssueBoardStates.tsx` is the Board-only component for existing
Decision options and Uncertainty outcomes. It uses beta Button, Icon and
TextField APIs, Tailwind styling, shared state schemas and the existing
expansion atom. Its pencil appears on hover or keyboard focus. Unassigned
stored states, shared cards, List interactions, full Edit wiring and permissions
remain unchanged. No custom stylesheet, vendor import, add/remove controls,
Undo, new API or full-form lifecycle changes were introduced.

The editor saves only changed valid rows. Name-to-Utility movement stays inside
the draft; Tab twice enters the next Name. Row transitions wait for successful
saves, invalid rows retain focus, Escape discards without a request, and empty
utility becomes zero. Failed saves use the existing error toast and lose the
attempted edit. Invalid rows cannot be hidden by collapsing their card.

Whole-issue PUTs retain original state identities, stored array order, other
states and untouched fields. After successful saves the component cancels stale
issue reads without reverting concurrent cache values, then patches only the
saved row in the query cache. This prevents a delayed refresh from letting the
next row's save overwrite the first row.

### Interfaces and pointers for ticket 07 / integration

- Extend `IssueBoardStates` in place for Board state operations; do not migrate
  `common/Cards/IssueCard.tsx`. Its props are `issue: Issue` and optional
  `onEditingChange(issueId: string, editing: boolean): void`. Keep this callback
  stable. It reports active drafts (including invalid/pending rows), and reports
  false after save/cancel/failure or unmount.
- `Editor` holds the original state identity, draft Name/Utility strings and
  initial focused field. `start(state, field)` performs a guarded row transition;
  `save(): Promise<boolean>` returns true only when unchanged/valid saved, false
  for invalid, pending or failed saves. Future add/remove actions should respect
  this transition guard rather than silently abandoning an existing draft.
- Display sorting uses `sortByCreatedAt`; persistence maps the original array,
  never the sorted display array. Preserve two keyboard positions per row:
  Name and Utility. Avoid inserting another tabbable action between a row's
  Utility and the following Name.
- `IssueColumn.tsx` only selects the Board component and collects active state
  editors by issue ID. Parent should OR this gate with ticket 04's text-editor
  gate when integrating; do not let either callback clear the other's lock.
- `DraggableIssueContainer` now accepts optional `disabled?: boolean` (default
  false). It disables only dragging, preserving drop targets and all existing
  callers. Row controls also carry `data-no-dnd`.
- `TableView/IssueBoardStates.test.tsx` exercises the real Board and shared-card
  regression surfaces using the permanent harness and HTTP adapter only. It
  does not override popover/dialog prototypes.

Verification: **34 focused tests passed**, covering both state types, clicked
fields, Tab/invalid Tab, row transitions and pending transitions, blur, zero
utility, required-name validation, unchanged rows, cancellation, failed saves,
double submissions, delayed reads, identity/order preservation, expansion,
drag gating, full Edit and non-Board state selection. Combined with unchanged
full-form/schema suites: **66 tests passed** across three files.
`npm run tsc`, touched-file ESLint/Prettier, `git diff --check` and
`npm run build` pass. Existing atomFamily deprecation and large-chunk advisories
remain. Repository-wide lint has the documented unrelated 23 skill quote errors.

Parent owns rebasing onto the amended tickets 01/05, container conflict
resolution, their repaired test matrix and integrated browser validation.
No other worktree, shared harness, backend or remote data was modified.

Integration preserves ticket 03's creation highlight and ticket 04's extracted
Board card. The card tracks state and text editors independently, so cancelling
either editor cannot unlock dragging while the other remains active. Header
classification controls wait for all issue-scoped inline mutations.
State payloads read the latest cached issue at mutation execution time, not
before a queued text save; existing whole-form callers still pass plain issues.
The integrated state suite has 46 cases, including queued text/state saves and
combined editor drag locks. Full Edit tests use the labelled beta action button.
