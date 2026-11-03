# 07: Add and remove Board options and outcomes inline

**What to build:** Let project members add or remove Decision options and
Uncertainty outcomes directly on Issues Board cards using the state editor,
including issues that have no states yet.

**Blocked by:** 06: Inline-edit existing Board options and outcomes.

**Status:** ready-for-agent

## Acceptance criteria

- [ ] Use EDS 2.0 beta components wherever a suitable beta equivalent exists for
  components touched by this ticket. This applies generally, not to a particular
  component type. Retain existing components where no suitable beta counterpart
  exists.
- [ ] Do not migrate simple card surfaces, layout wrappers, typography, or plain
  text to beta components. This is not a wholesale component migration.
- [ ] While editing states, show Add option for a Decision or Add outcome for
  an Uncertainty below the state rows.
- [ ] Adding opens one new empty row in edit mode with focus in Name. Reuse
  ticket 06's row interactions, validation, and whole-issue save behavior.
- [ ] A new state's name is required; empty or whitespace-only input is not
  persisted. Utility starts at zero and clearing it still saves zero.
- [ ] Successful addition preserves existing states and their order, assigns a
  new state identity, and updates the displayed state count.
- [ ] A Decision with no options or Uncertainty with no outcomes shows its
  Add button and no States toggle. Clicking Add starts the first row editor.
- [ ] Escape cancels a new unsaved row by discarding it without a save request.
- [ ] An existing state's editor exposes Remove. Removing a saved state uses
  the same whole-issue update behavior as the current full Edit form.
- [ ] Do not introduce dependency scans, special removal confirmations,
  backend cleanup infrastructure, or promises about new server cascade behavior.
- [ ] Removing an unsaved new row simply discards it locally.
- [ ] Failed creation/removal shows the existing error notification and
  restores the last saved state list, consistent with the agreed inline-failure
  behavior. Preserve unrelated issue data.
- [ ] After removing the last state, show the Add button without a States toggle.
  Existing mutation/cache mechanisms refresh affected data after success.
- [ ] Preserve ticket 06's one-active-row, field focus, keyboard, and drag-gating
  behavior. Keep full Edit access, existing permissions, and other card surfaces
  unchanged.
- [ ] Verify first and subsequent additions, required-field errors, cancelled
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
