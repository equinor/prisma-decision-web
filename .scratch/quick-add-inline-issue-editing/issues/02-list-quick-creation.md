# 02: Quick-create issues from List view

**What to build:** Let project members capture issues directly from an
always-visible quick-add row above the List tables, with reliable rapid entry,
validation, focus, and failed-request behavior.

**Blocked by:** 01: Update full Create/Edit forms and shared issue rules.

**Status:** ready-for-agent

## Acceptance criteria

- [ ] Use EDS 2.0 beta components wherever a suitable beta equivalent exists for
  components touched by this ticket. This applies generally, not to a particular
  component type. Retain existing components where no suitable beta counterpart
  exists.
- [ ] Do not migrate simple card surfaces, layout wrappers, typography, or plain
  text to beta components. This is not a wholesale component migration.
- [ ] Show a quick-add row above the issue tables, including when there are no
  existing issues.
- [ ] Include required issue name and description inputs, an issue type selector
  with all five types, an In/On/Out boundary selector, and a Create issue button.
- [ ] Reuse the validation, defaults, and accessible selectors established by
  ticket 01. Default to Unassigned and In; retain Policy/not-key nested defaults.
- [ ] Expose the type and boundary selectors as radio groups with keyboard
  navigation. Hovering or focusing a type option shows "Type: <type>".
- [ ] The Create issue button is disabled until both required fields contain
  non-whitespace text, and submission cannot create duplicate issues while a
  request is pending.
- [ ] Enter in either required input submits a valid draft. Clicking Create
  issue has the same result. Shift+Enter inserts a description newline.
- [ ] Enter on an incomplete draft shows the appropriate required-field error
  and focuses the missing field. When both are missing, focus the name first.
- [ ] A required-field error clears when that field contains valid text.
- [ ] On success, the issue appears in the correct influence-diagram group and
  is highlighted for two seconds.
- [ ] After success, clear name and description, retain the selected type and
  boundary, and focus the name field for the next issue.
- [ ] A failed creation shows the existing error notification and retains the
  draft. Do not clear the fields or show a successful-creation highlight.
- [ ] Escape clears name and description. Switching views or leaving the page
  discards the unsaved draft without a navigation confirmation.
- [ ] Use the existing creation API and project-member permissions; the full
  Create path remains available.
- [ ] Verify button and keyboard submission, whitespace validation, selector
  semantics, rapid entry, grouping, highlight duration, and failed creation.

## Design references

Parent: https://github.com/equinor/prisma-decision-web/issues/874

Issues visuals:
https://www.figma.com/design/iJr3w56fyMClNAn7xuIop3/Dot-Design?node-id=1913-875

Original acceptance criteria:
https://github.com/user-attachments/files/33243240/Gherking.for.inline.editing.md

The decisions above override conflicting original criteria. This is frontend-only
work; do not add Undo or a separate draft-persistence system.
