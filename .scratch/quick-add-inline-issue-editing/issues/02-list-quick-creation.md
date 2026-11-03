# 02: Quick-create issues from List view

**What to build:** Let project members capture issues directly from an
always-visible quick-add row above the List tables, with reliable rapid entry,
validation, focus, and failed-request behavior.

**Blocked by:** 01: Update full Create/Edit forms and shared issue rules.

**Status:** resolved

## Acceptance criteria

- [x] Use EDS 2.0 beta components wherever a suitable beta equivalent exists for
  components touched by this ticket. This applies generally, not to a particular
  component type. Retain existing components where no suitable beta counterpart
  exists.
- [x] Do not migrate simple card surfaces, layout wrappers, typography, or plain
  text to beta components. This is not a wholesale component migration.
- [x] Show a quick-add row above the issue tables, including when there are no
  existing issues.
- [x] Include required issue name and description inputs, an issue type selector
  with all five types, an In/On/Out boundary selector, and a Create issue button.
- [x] Reuse the validation, defaults, and accessible selectors established by
  ticket 01. Default to Unassigned and In; retain Policy/not-key nested defaults.
- [x] Expose the type and boundary selectors as radio groups with keyboard
  navigation. Hovering or focusing a type option shows "Type: <type>".
- [x] The Create issue button is disabled until both required fields contain
  non-whitespace text, and submission cannot create duplicate issues while a
  request is pending.
- [x] Enter in either required input submits a valid draft. Clicking Create
  issue has the same result. Both inputs use regular beta TextField controls,
  matching the Figma quick-add row and the user's explicit correction.
  Shift+Enter does not submit the single-line quick-add field.
- [x] Enter on an incomplete draft shows the appropriate required-field error
  and focuses the missing field. When both are missing, focus the name first.
- [x] A required-field error clears when that field contains valid text.
- [x] On success, the issue appears in the correct influence-diagram group and
  is highlighted for two seconds.
- [x] After success, clear name and description, retain the selected type and
  boundary, and focus the name field for the next issue.
- [x] A failed creation shows the existing error notification and retains the
  draft. Do not clear the fields or show a successful-creation highlight.
- [x] Escape clears name and description. Switching views or leaving the page
  discards the unsaved draft without a navigation confirmation.
- [x] Use the existing creation API and project-member permissions; the full
  Create path remains available.
- [x] Verify button and keyboard submission, whitespace validation, selector
  semantics, rapid entry, grouping, highlight duration, and failed creation.

## Design references

Parent: https://github.com/equinor/prisma-decision-web/issues/874

Issues visuals:
https://www.figma.com/design/iJr3w56fyMClNAn7xuIop3/Dot-Design?node-id=1913-875

Original acceptance criteria:
https://github.com/user-attachments/files/33243240/Gherking.for.inline.editing.md

The decisions above override conflicting original criteria. This is frontend-only
work; do not add Undo or a separate draft-persistence system.

## Answer

Implemented ticket 02 on `issue-874/02-list-create`, starting at integration tip
`56a1a134feb9b5e0f73ddd9b380d6a761d364899`. Claimed before implementation and
completed through List UI / HTTP-boundary red→green slices.

- `ListView/QuickCreateIssue.tsx` adds the always-visible quick-add row, using
  actual beta TextField, Button and Tooltip controls. Both quick-add inputs are
  single-line text fields, not text areas. It reuses
  `SegmentedSelector` without changing its API, `createIssueDraft`, `issueSchema`,
  `getNextIssuePosition`, and the existing `useCreateIssue` POST/refetch/error path.
  Project context, authenticated API access, and full Create access are unchanged.
- Button and Enter share submission. Whitespace is rejected without trimming
  submitted text; incomplete Enter works even with a disabled Create button,
  announces required errors, and focuses the missing field (name first).
  Valid text clears its error; Shift+Enter does not submit the single-line row.
- Pending requests retain the draft and gate duplicate submissions. Only success
  resets text, generates the next draft, retains type/boundary, and refocuses name.
  Failure retains the complete draft and reports the existing error toast.
  Escape clears text/errors while retaining classification.
- `useCreatedIssueHighlight.ts` is feature-scoped and reusable by Board later.
  `highlightCreatedIssue(id)` and `highlightedIssueIds` provide independent,
  exactly 2000ms highlights, with unmount cleanup and ignored late callbacks.
  List tables/rows consume this state without changing classification/group rules.
- Actual ProjectIssues view/navigation tests prove unsaved drafts are discarded.
  View buttons now use beta Button/Icon, accessible names and pressed state;
  the Board implementation itself is unchanged.
- New layout, type symbols, and highlight presentation use Tailwind only.
  No custom stylesheet, inline style object, vendor CSS import, shared test shim,
  shared selector, full-form lifecycle, classification test, or dependency-manifest
  changes are included. Figma Issues metadata and the shared screenshot were read.

Verification:

- **19 new user-visible tests** in `ListView/quickCreation.test.tsx` pass, covering
  empty List availability, button/keyboard entry, all type hints, radio keyboard
  navigation, whitespace/error/focus behavior, rapid capture and node placement,
  busy duplicate protection, failed creation/retry, Escape, view/page navigation,
  Policy/not-key grouping defaults, existing-row isolation, and independent
  highlights at 1999ms/2000ms.
- **51 tests pass together**, including the existing 32 full-form/schema tests:
  `npm test -- src/components/ProjectPage/ProjectIssues/ListView/quickCreation.test.tsx src/components/common/IssueForms.test.tsx src/validators.test.ts`.
- `npm run tsc`, touched-file ESLint/Prettier, `git diff --check`, and
  `npm run build` pass. Existing atomFamily and large-chunk advisories remain.
  Repository-wide baseline skill-file quote errors are outside this ticket.
- Initial validation failed because Vitest was absent; `npm ci` restored the
  assigned worktree's dependencies without changing manifests or the lockfile.

No backend setup, remote data writes, Undo, Board quick-add, or new spec/decisions.
Parent owns integration/rebase onto its repaired ticket 01/05 commits and
authenticated browser validation; the assigned starting base was not rewritten.
