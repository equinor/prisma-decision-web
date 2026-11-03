# 04: Inline-edit issue names and descriptions in both views

**What to build:** Let project members change issue names and descriptions
directly in List rows and Issues Board cards, with predictable save, cancel,
validation, and network-failure behavior.

**Blocked by:** 01: Update full Create/Edit forms and shared issue rules.

**Status:** ready-for-agent

## Acceptance criteria

- [ ] Use EDS 2.0 beta components wherever a suitable beta equivalent exists for
  components touched by this ticket. This applies generally, not to a particular
  component type. Retain existing components where no suitable beta counterpart
  exists.
- [ ] Do not migrate simple card surfaces, layout wrappers, typography, or plain
  text to beta components. This is not a wholesale component migration.
- [ ] Hovering a List issue name/description or Board name/description shows a
  pencil affordance. Keyboard users can discover and activate the same editors.
- [ ] Clicking a field opens an editor containing its current value and focuses
  that editor. Starting an edit does not change the card border.
- [ ] Enter or clicking outside saves a changed valid value through the existing
  whole-issue update API. Do not submit twice for one interaction.
- [ ] Shift+Enter inserts a newline in a multiline description.
- [ ] Escape cancels without a request and restores the previous value.
- [ ] Reuse ticket 01's required-text validation. Empty/whitespace-only values
  are not saved; the editor stays open with the appropriate required-field error
  and an "Esc to cancel" hint.
- [ ] Board editing shows an Enter-to-save/Escape-to-cancel keyboard hint and
  explains Shift+Enter for descriptions.
- [ ] Disable card dragging while an inline editor is active.
- [ ] On a successful save, use the agreed "Name updated" or "Description updated"
  notification copy, not "Title updated". Do not show success before the save
  succeeds.
- [ ] A failed inline save shows the existing error notification, restores the
  saved value, and loses the attempted edit. Do not preserve a retry draft.
- [ ] Do not implement Undo, Undo actions, or Undo infrastructure.
- [ ] Scope Board inline editing to the Issues Board. Shared cards in diagrams,
  trees, strategies, and whiteboards keep their existing interactions.
- [ ] Preserve existing project-member permissions and full Edit access.
- [ ] Verify name and description edits in both views, all keyboard/blur paths,
  required-field errors, failure rollback, unchanged card borders, and drag gating.

## Design references

Parent: https://github.com/equinor/prisma-decision-web/issues/874

Issues visuals:
https://www.figma.com/design/iJr3w56fyMClNAn7xuIop3/Dot-Design?node-id=1913-875

Original acceptance criteria:
https://github.com/user-attachments/files/33243240/Gherking.for.inline.editing.md

The decisions above override the original Undo requirements. There is no Undo
in this work, and issue name is the canonical term even on a Board card.
