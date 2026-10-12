# Quick add and inline issue editing

Source: https://github.com/equinor/prisma-decision-web/issues/874

Implement the attached Gherkin behavior and the linked Figma visuals, with the
explicit decisions below. The full Create and Edit paths remain available.
This is frontend-only work using the existing whole-issue API.

## Scope

- Quick creation in the Issues List and Board.
- Inline issue names/descriptions, classification menus, and key uncertainty
  toggles in both views.
- Inline options/outcomes on Issues Board cards.
- The linked Create issue visual redesign and matching shared controls in Edit.
- Remove List date columns and add the Decision type / Key column.
- Preserve existing permissions and all full-form capabilities.
- Scope inline card interactions to the Issues Board; shared cards elsewhere
  retain their existing behavior.

## Creation and validation

- Require meaningful issue names/descriptions and option/outcome names across
  quick creation, inline editing, and full forms. Whitespace-only values fail.
  Preserve meaningful whitespace and multiline descriptions.
- Add no uniqueness or maximum-length constraints.
- Default boundary to In, decision type to Policy, and uncertainties to not key.
- List quick add remains visible. After successful creation, clear name and
  description, retain type/boundary, and focus the name field.
- Board has top/bottom Add issue buttons per existing column. The clicked
  position controls composer placement and persisted first/last insertion.
- Allow one Board composer at a time. Disable other Add issue buttons while it
  is open; do not implement draft-switching confirmations.
- Keep the Gherkin Escape, close-button, and outside-click composer rules.
- Enable creation only when required values are valid. Enter on incomplete
  inputs still exposes the relevant required-field error and focus.
- Clear a submitted quick-add draft only after successful creation. A failure
  preserves the draft and shows the existing error notification.
- Explicit cancellation or navigation away discards unsaved drafts without a
  navigation confirmation or draft persistence.
- Highlight successfully created issues for two seconds.

## Editing

- Use the Gherkin pencil affordances, focus behavior, menus, accessible
  selectors/toggles, and inline save/cancel interactions.
- Enter saves/submits; Shift+Enter adds a newline in multiline descriptions.
- Empty required values stay in edit mode with an error and an Escape hint.
- Disable card dragging while editing.
- Inline network failures restore the saved value and lose the attempted edit,
  with the existing error notification.
- Do not implement Undo, Undo actions, or Undo infrastructure.
- Preserve nested data and classification fields when changing issue type.
- Make no Utility-related behavior change or additional Board column.
- State utility inputs may be cleared; save an empty utility as zero.
- Retain the Gherkin one-active-state-row, focus, add, save, and cancel behavior.
- Remove existing options/outcomes using the same whole-issue update behavior
  as the current full Edit form. Do not add dependency scans, special removal
  confirmations, or cleanup infrastructure. Discard cancelled unsaved rows.
- Refresh affected data through the existing mutation/cache mechanisms.

## Documentation

Use the approved Issue, Option, Outcome, State, and Issue name vocabulary in
`GLOSSARY.md`. Keep UI rules and implementation decisions out of the glossary.
No ADR is needed for these reversible UI changes.
