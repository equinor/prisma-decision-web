# 06: Inline-edit existing Board options and outcomes

**What to build:** Let project members refine existing Decision options and
Uncertainty outcomes directly on expanded Issues Board cards by editing the
state name and utility.

**Blocked by:** 01: Update full Create/Edit forms and shared issue rules.

**Status:** ready-for-agent

## Acceptance criteria

- [ ] Use EDS 2.0 beta components wherever a suitable beta equivalent exists for
  components touched by this ticket. This applies generally, not to a particular
  component type. Retain existing components where no suitable beta counterpart
  exists.
- [ ] Do not migrate simple card surfaces, layout wrappers, typography, or plain
  text to beta components. This is not a wholesale component migration.
- [ ] Hovering an existing state row shows a pencil affordance; users can
  activate editing from its name or utility.
- [ ] The row becomes Name and Utility inputs, focused on the field the user
  clicked. Preserve the existing state display order.
- [ ] Only one state row per card is edited at a time. Moving to another row
  saves a valid changed row before editing the next; invalid changes are not
  silently saved or discarded.
- [ ] Keyboard navigation supports the original criterion: from one state's
  Name field, Tab twice reaches the next state's Name field.
- [ ] Enter or clicking outside the row saves changed valid values. Moving
  between the Name and Utility inputs does not prematurely commit the row.
- [ ] Escape restores the previous state without a save request.
- [ ] Reuse ticket 01's required state-name validation. Reject empty or
  whitespace-only names with "Option name is required" or "Outcome name is
  required" and keep the invalid row editable.
- [ ] Utility can be cleared for either state type and is saved as zero.
- [ ] Update the state as part of the existing whole-issue API, retaining its
  identity, other states, and unrelated issue fields.
- [ ] A failed inline save shows the existing error notification, restores the
  saved row, and loses the attempted edit.
- [ ] Disable card dragging while a state editor is active. Preserve card
  expansion behavior and full Edit access.
- [ ] Scope state editing to the Issues Board. Shared states/cards in other
  surfaces keep their current interactions and existing permissions remain.
- [ ] Verify both options and outcomes, clicked-field focus, Tab movement,
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
