# 07: Add and remove Board options and outcomes inline

**What to build:** Let project members add or remove Decision options and
Uncertainty outcomes directly on Issues Board cards using the state editor,
including issues that have no states yet.

**Blocked by:** 06: Inline-edit existing Board options and outcomes.

**Status:** resolved

## Acceptance criteria

- [x] Use EDS 2.0 beta components wherever a suitable beta equivalent exists for
      components touched by this ticket. This applies generally, not to a particular
      component type. Retain existing components where no suitable beta counterpart
      exists.
- [x] Do not migrate simple card surfaces, layout wrappers, typography, or plain
      text to beta components. This is not a wholesale component migration.
- [x] While editing states, show Add option for a Decision or Add outcome for
      an Uncertainty below the state rows.
- [x] Adding opens one new empty row in edit mode with focus in Name. Reuse
      ticket 06's row interactions, validation, and whole-issue save behavior.
- [x] A new state's name is required; empty or whitespace-only input is not
      persisted. Utility starts at zero and clearing it still saves zero.
- [x] Successful addition preserves existing states and their order, assigns a
      new state identity, and updates the displayed state count.
- [x] A Decision with no options or Uncertainty with no outcomes shows its
      Add button and no States toggle. Clicking Add starts the first row editor.
- [x] Escape cancels a new unsaved row by discarding it without a save request.
- [x] An existing state's editor exposes Remove. Removing a saved state uses
      the same whole-issue update behavior as the current full Edit form.
- [x] Do not introduce dependency scans, special removal confirmations,
      backend cleanup infrastructure, or promises about new server cascade behavior.
- [x] Removing an unsaved new row simply discards it locally.
- [x] Failed creation/removal shows the existing error notification and
      restores the last saved state list, consistent with the agreed inline-failure
      behavior. Preserve unrelated issue data.
- [x] After removing the last state, show the Add button without a States toggle.
      Existing mutation/cache mechanisms refresh affected data after success.
- [x] Preserve ticket 06's one-active-row, field focus, keyboard, and drag-gating
      behavior. Keep full Edit access, existing permissions, and other card surfaces
      unchanged.
- [x] Verify first and subsequent additions, required-field errors, cancelled
      new rows, existing/unsaved removal, last-state removal, counts/order, and
      failed-request rollback for both Decisions and Uncertainties.

## Design references

Parent: https://github.com/equinor/prisma-decision-web/issues/874

Issues visuals:
https://www.figma.com/design/iJr3w56fyMClNAn7xuIop3/Dot-Design?node-id=1913-875

Original acceptance criteria:
https://github.com/user-attachments/files/33243240/Gherking.for.inline.editing.md

The decisions above override the original usage-dependent removal checks and
confirmation dialog. Removal must retain the existing full-Edit semantics.

## Answer

Implemented only ticket 07 on `issue-874/07-state-add-remove`, after claiming
the ticket. Original integration base:
`2f53fb8505148eb223105b1c62035a09de0edb6e`. At the parent's explicit request,
rebased the three owned tracked files once onto the accessibility/fidelity base
`4f47ef7f4aa6f65dff36059dac385c63ea6b7619`.

Extended `TableView/IssueBoardStates.tsx` in place; no shared card, List, full-form
lifecycle, API, dependency or parent-owned DnD file changes. Add is available in
the expanded state area, or directly on a card with no saved states. A new
Option/Outcome has a local UUID, parent/project identity, creation timestamp,
empty Name and zero Utility. It is not persisted until the shared schema accepts
its Name. Empty Utility saves as zero; meaningful Name whitespace is retained.
Cancelling or removing an unsaved row only discards it locally.

Saved removal sends the ordinary whole-issue update without saving the removed
row's draft first. It filters only the selected identity and retains stored
array order and unrelated issue fields. No scans, confirmations, Undo,
backend changes or cascade/dependency guarantees were added. Success refreshes
the existing affected queries, updates the state count and leaves Add without
a States toggle after the last removal. Failures use the existing error toast,
discard the attempted draft and retain the last saved list.

### Reusable interfaces and behavior

- The public props remain `issue: Issue` and optional stable
  `onEditingChange(issueId, editing)`. The independent Board text/state editor
  registrations and creation highlighting remain unchanged.
- `Editor.isNew` distinguishes an unsaved local row from a saved state;
  `startNew()` uses the same guarded `save(): Promise<boolean>` transition as
  switching existing rows. Invalid/pending rows cannot be silently abandoned
  or doubled.
- `persist(update: (current: Issue) => Issue): Promise<boolean>` is the shared
  state-operation path. It passes an execution-time factory to ticket 06's
  existing `useUpdateIssue`, reads the latest issue cache when a queued mutation
  actually starts, then applies the same narrow transformation in the awaited
  static success lifecycle before the shared issue scope releases queued edits,
  after cancelling stale issue reads without reverting newer cache values. Addition is
  identity-idempotent; editing/removal only affect their selected state.
- Add has its own blur exclusion, so clicking it waits for a valid changed row
  to save before focusing the new Name. Name → Utility → next Name survives.
  Remove is visually trailing but precedes Name in DOM tab order: Shift+Tab
  from Name reaches Remove; Enter removes without invoking the input save
  handler. Escape and Remove respect pending-save guards.

### Visuals and verification

Read Figma through MCP with the `figma-design-to-code` prerequisite, skillNames
and screenshots: Issues section `1913:875`, card `2169:48217`, editing card
`2214:56047` and its high-fidelity States child. Reused official beta TextField,
Button and Icon controls and matching EDS add/remove icons. Kept plain Tailwind
surfaces, inherited Equinor state text, full-width read-only Name space, unpadded
editor rows, 80px Utility, and a flex-column collapsible with a 24px teal
chevron and 14px/20px tertiary trigger text. Parent beta layers/theme/fonts and
shared fidelity fixes are preserved. No Figma content was written.

Vertical red/green slices use the real Issues Board with real project/query
providers, user interactions and the HTTP adapter boundary only. No per-test
popover overrides or dependency installation. The state suite now contains
**80 passing tests**, including both issue types, first/subsequent addition,
identity/order/count/unrelated-field preservation, Name validation, cancellation,
saved/unsaved and last-state removal, keyboard removal, pending/double actions,
rollback, delayed reads, queued text/add/remove updates, full Edit and shared-card
isolation.

State drag tests follow the parent's corrected public contract: active editors
have no `[aria-disabled="true"]` ancestor, while `data-no-dnd="true"` remains
until all independent editors close. Name-to-Utility Tab leaves native inputs
enabled and sends no request. Direct DnD sensor simulation requires jsdom's
absent `document.getAnimations`; no platform shim was added. Actual pointer/
keyboard drag and remote/browser fidelity validation remain parent-owned.

Verification on the updated base: **234 tests passed across all 8 files**,
`npm run tsc`, touched-source ESLint/Prettier and `git diff --check` pass.
Existing atomFamily deprecation and expected full-form validation logging
remain. No implementation blockers; no local API/server, remote-data mutation,
integration, push or stack registration was performed.

### Post-integration reverse-concurrency correction

Follow-up started from ticket commit
`7981fe0dac05e66237e820579a0ebb2ed1328670`, rebased integration base
`5eb9dccc3a8d90713b67fd9be60dd5125f0791c9`.

Review reproduced a reverse race omitted by the earlier text → state matrix:
TanStack releases an issue's mutation scope before the caller resumes after
`await mutateAsync`. The old `persist` continuation published the saved state
too late. A queued issue Name/Description save could read the previous list,
PUT it back to the server, and undo an edit/add/remove; the subsequent local
state patch concealed the loss until reload.

The real Board regression first failed for both issue types. Expanded to the
full Decision/Uncertainty × edit/add/remove × issue Name/Description matrix,
all **12 cases fail** with the original late cache publication and pass with
the correction. Each test delays the first PUT and active issue refresh,
queues a text save through the enabled UI, verifies the first whole-issue PUT
performs the intended state operation, then verifies the second PUT preserves
that exact state data/identities/order and the saved text. Releasing delayed
reads retains both changes on the Board.

`useUpdateIssue` now accepts `onSuccess?: () => void | Promise<void>` and awaits
it in the mutation's static success lifecycle. Existing issue refreshes, related
query invalidations, error toast, ordinary whole-form mutation inputs,
`mutate`/`isPending` wiring and `useIssueForm` are unchanged. No per-call mutation
callback is used. The hook lifecycle extension belongs to ticket 06.

`IssueBoardStates` retains its operation in `savedUpdate` while saving. Its
static awaited `onSuccess` cancels stale issue reads with `revert: false` and
publishes only the narrow state transformation before the shared issue scope
can execute the next queued whole-issue update. `persist` only performs the
request and final draft/ref cleanup. Failed operations publish nothing; existing
guards, rollback and execution-time payload construction remain intact. No
text-UI disabling shortcut, visual/DnD edits or new abstraction was introduced.

Follow-up verification: **92 state tests passed**, **246 tests passed across all
8 files**, TypeScript, touched-source ESLint/Prettier and `git diff --check`.
Only the hook fixup (ticket 06), state component/reverse tests and this Answer
(ticket 07) are changed. Native browser validation and final autosquashing remain
parent-owned.
