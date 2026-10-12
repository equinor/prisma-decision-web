# 04: Inline-edit issue names and descriptions in both views

**What to build:** Let project members change issue names and descriptions
directly in List rows and Issues Board cards, with predictable save, cancel,
validation, and network-failure behavior.

**Blocked by:** 01: Update full Create/Edit forms and shared issue rules.

**Status:** resolved

## Acceptance criteria

- [x] Use EDS 2.0 beta components wherever a suitable beta equivalent exists for
      components touched by this ticket. This applies generally, not to a particular
      component type. Retain existing components where no suitable beta counterpart
      exists.
- [x] Do not migrate simple card surfaces, layout wrappers, typography, or plain
      text to beta components. This is not a wholesale component migration.
- [x] Match Figma's hover variants: name fields show a pencil; List descriptions
      use a full-cell input treatment without a pencil, and Board descriptions remain
      plain text until editing. Keyboard users can activate the same editors.
- [x] Clicking a field opens an editor containing its current value and focuses
      that editor. Starting an edit does not change the card border.
- [x] Enter or clicking outside saves a changed valid value through the existing
      whole-issue update API. Do not submit twice for one interaction.
- [x] Shift+Enter inserts a newline in a multiline description.
- [x] Escape cancels without a request and restores the previous value.
- [x] Reuse ticket 01's required-text validation. Empty/whitespace-only values
      are not saved; the editor stays open with the appropriate required-field error
      and an "Esc to cancel" hint.
- [x] Board editing shows an Enter-to-save/Escape-to-cancel keyboard hint and
      explains Shift+Enter for descriptions.
- [x] Disable card dragging while an inline editor is active.
- [x] On a successful save, use the agreed "Name updated" or "Description updated"
      notification copy, not "Title updated". Do not show success before the save
      succeeds.
- [x] A failed inline save shows the existing error notification, restores the
      saved value, and loses the attempted edit. Do not preserve a retry draft.
- [x] Do not implement Undo, Undo actions, or Undo infrastructure.
- [x] Scope Board inline editing to the Issues Board. Shared cards in diagrams,
      trees, strategies, and whiteboards keep their existing interactions.
- [x] Preserve existing project-member permissions and full Edit access.
- [x] Verify name and description edits in both views, all keyboard/blur paths,
      required-field errors, failure rollback, unchanged card borders, and drag gating.

## Design references

Parent: https://github.com/equinor/prisma-decision-web/issues/874

Issues visuals:
https://www.figma.com/design/iJr3w56fyMClNAn7xuIop3/Dot-Design?node-id=1913-875

Original acceptance criteria:
https://github.com/user-attachments/files/33243240/Gherking.for.inline.editing.md

The decisions above override the original Undo requirements. There is no Undo
in this work, and issue name is the canonical term even on a Board card.

## Answer

Implemented only ticket 04 on `issue-874/04-inline-text`, starting at the verified
integration base `56a1a134feb9b5e0f73ddd9b380d6a761d364899`; claimed before editing.

- List and Board use real beta Button/Icon/TextField/TextArea controls, shared
  required-text schemas, and Tailwind-only feature styling. No new CSS, inline
  styles, dependency manifests, or feature-local vendor stylesheet imports.
- The inline editor guards repeated Enter/blur, IME confirmation, unchanged
  values, and Escape-triggered blur. Escape returns keyboard focus. Invalid text
  remains editable; failed requests close the editor and discard the attempt.
  Successful requests alone show "Name updated" / "Description updated", without
  Undo.
- `useIssueText` sends the existing array-based whole-issue PUT. It shares
  `issueMutationScope` with the other Issue writes, its mutation key remains
  `['issueText', issue.id]`, and it reads the latest
  cached issue when queued requests execute. Successful saves merge only the
  edited field into the cache; classification controls are disabled while text
  saves are pending to prevent stale whole-issue overwrites.
- `TableView/IssueBoardCard.tsx` owns Board-only content and preserves the
  classification header, full Edit/Delete menu, state expansion, and border.
  Shared non-Board `IssueCard.tsx` and full-form mutation lifecycle are unchanged.

Integration interfaces:

- Inside `IssueBoardCard`, `useIssueBoardEditing()` provides `editing` and stable
  `setEditing(editorId, active)`. State editors should use distinct IDs (for
  example `state:${stateId}:name`) and clear their registration on close/unmount.
  Registrations are combined, so closing one editor does not enable dragging
  while another remains active.
- `InlineTextEditor` accepts `value`, `label`, promise-returning `onSave`,
  optional `validate`, `multiline`, `showHint`, `className`, and
  `onEditingChange(active)`, plus a `card`/`table` presentation variant. It registers editing through that callback and
  clears it on close/unmount. The save owner reports network errors.
- `DraggableIssueContainer.disabled` defaults to false and disables dragging
  only, retaining drop targeting. `useIssueTextPending(issueId)` exposes pending
  text saves for other Board controls. Concurrent state mutations should likewise
  merge their patch into the latest issue at execution time.

Verification: **48 focused component tests**, plus 32 full-form/schema tests,
pass together (**80 tests**). TDD red/green covered save, multiline, cancel,
required text, IME, drag gating, failure handling, keyboard focus, and queued
whole-issue updates. `npm run tsc`, touched-source ESLint/Prettier,
`git diff --check`, and `npm run build` pass; existing atomFamily/chunk warnings
remain. Used the permanent harness unchanged; restored locked dependencies only
after `vitest: command not found`. Figma Issues reference was inspected.

Parent owns rebasing onto its corrected integration and remote-browser
validation. Ticket 05's unrelated harness tests were not modified. No backend,
remote data edits, integration, or push occurred. Own scratch artifacts removed.

Integrated browser validation exposed an accessibility regression in the DnD
library's disabled flag: its `aria-disabled` on the card marked nested editors
disabled too. Editing now cancels drag activation through the existing DnD
guard and source editing flag, without disabling descendant controls or drop
targets. A red/green real-Board accessibility regression raises the text suite
to 49 cases. Board-only compact beta actions, inherited Equinor text styling
and Figma header spacing leave other card surfaces' interactions unchanged.

### Visual-fidelity follow-up

The user clarified that the shared card design must also apply to Whiteboard,
Influence Diagram, Decision Tree, Strategies, and drag previews. Shared card
labels, icons, typography, header spacing, actions, and expansion controls now
use the same Figma design as the Issues Board. Only the Issues Board gains inline
editing; state selection, restrictions, node dragging, and other surfaces' full
Edit actions retain their existing behavior. Read-only labels reuse beta Chip
styles without introducing buttons that intercept node interactions.
Only Decision and Uncertainty cards display States and expansion controls.
Unassigned, Utility, and Fact cards do not display inactive States; any stored
state data remains intact.

List hover treatments cover the entire 48px cell. Board name and State pencils
are 16px; a State pencil follows its name with a 4px gap. Inline inputs have
accessible names without visible labels, and name inputs use regular Inter
rather than inheriting the card's bold text. Classification panels are 168px
wide with 48px rows, Equinor menu typography, and the Figma selected colors.
Inline fields use the existing default-text color and non-error keyboard hints
use the tertiary-text color, retaining the app's light/dark theme behavior.
The full Edit dialog is centered, with correctly composed EDS section slots
and an associated submit form. The full-form mutation lifecycle is unchanged.

Decision Tree cards reserve 350 x 100px so the shared classification header fits
without clipping the description; long names truncate within this fixed-height surface.
Tree layout respects each node's declared height so output and collapsed nodes
retain their existing height while Issue cards are not clipped.
