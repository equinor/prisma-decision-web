# 05: Change classification and key uncertainty directly in both views

**What to build:** Let project members change issue classification and key
uncertainty from labels/chips in List rows and Issues Board cards, with immediate
saves and correct movement between columns or influence-diagram groups.

**Blocked by:** None (can start immediately).

**Status:** resolved

## Acceptance criteria

- [x] Use EDS 2.0 beta components wherever a suitable beta equivalent exists for
  components touched by this ticket. This applies generally, not to a particular
  component type. Retain existing components where no suitable beta counterpart
  exists.
- [x] Do not migrate simple card surfaces, layout wrappers, typography, or plain
  text to beta components. This is not a wholesale component migration.
- [x] Clicking an issue type label, decision type chip, or boundary chip opens
  an anchored menu titled "ISSUE TYPE", "DECISION TYPE", or "BOUNDARY".
- [x] Issue type lists Unassigned, Decision, Uncertainty, Fact, and Utility.
  Decision type lists Policy, Focus, and Tactical. Boundary lists In, On, and Out.
  The current value is checked.
- [x] Selecting a different value closes the menu and saves immediately through
  the existing whole-issue update API. Escape or outside click closes without
  saving; selecting the current value does not send an unnecessary update.
- [x] Show decision type only for Decisions and the key toggle only for
  Uncertainties.
- [x] The key toggle is an accessible button with aria-pressed matching its
  selected state. Clicking it updates the displayed state without waiting for
  the server, then saves the new value.
- [x] Changes move List rows between the existing influence-diagram groups when
  relevant. Decisions require Focus and In/On; Uncertainties require key and In/On;
  Utilities require In/On. Preserve the existing rules for other issues.
- [x] A Board type change moves the card to the appropriate existing column.
  Preserve nested data and other classification values when changing type.
- [x] Do not change existing Utility behavior: no additional column,
  conversion-specific notification, or new conversion restriction.
- [x] Replace List Date Added/Date Updated columns with a Decision type / Key
  column. Retain existing issue actions, state counts, and other fields.
- [x] A failed update shows the existing error notification and restores the
  saved value and corresponding row/card placement.
- [x] Scope the new card interactions to the Issues Board; retain other
  shared-card behavior, existing permissions, and full Edit access.
- [x] Verify every menu's options and selected state, dismissal, immediate key
  updates, accessibility, column/group movement, data preservation, and rollback.

## Design references

Parent: https://github.com/equinor/prisma-decision-web/issues/874

Issues visuals:
https://www.figma.com/design/iJr3w56fyMClNAn7xuIop3/Dot-Design?node-id=1913-875

Original acceptance criteria:
https://github.com/user-attachments/files/33243240/Gherking.for.inline.editing.md

This is frontend-only work using existing issue values and update behavior.
Do not introduce Undo or change existing issue defaults.

## Answer

Implemented ticket 05 on `issue-874/05-classification`, starting at
`75a52340987330b2fc47fca1fadb8fd7af33131c`.

Classification uses the real beta.2 `/next` Chip, Menu/MenuItem, Button and Icon
APIs. Stable Table/Popover remain because beta has no corresponding table or
anchored-popover component. Surfaces, typography and shared cards remain
lightweight and unchanged.

Context pointers for subsequent tickets:

- `src/components/ProjectPage/ProjectIssues/ClassificationControls.tsx` owns
  accessible anchored menus, checked options, keyboard navigation and key chips.
- `src/components/ProjectPage/ProjectIssues/useIssueClassification.ts` maps the
  four classification controls to the existing `useUpdateIssuesOptimistic`
  hook and retains a per-Issue pending key. It owns no separate mutation,
  snapshot, rollback, or query projection.
- List and Board read the normal shared Issues cache. `useClassifiedProjectIssues`
  has been removed. Classification uses the existing optimistic update behavior.
- Full-form/List/Board creation, single/bulk update, optimistic update, inline
  text, and delete share `issueMutationScope`. The mutation hooks own request
  serialization. `issueId`
  metadata and mutation keys identify the Issue whose controls are pending;
  they do not create separate request queues.
- Optimistic updates and deletion retain ordinary snapshot rollback. Issues are
  invalidated after settlement, and deletion also invalidates Edges. The user
  explicitly accepted a brief rollback/refetch delay rather than per-Issue
  rollback bookkeeping. Full forms retain their non-optimistic lifecycle.
- `TableView/IssueBoardCardHeader.tsx` is Board-specific. `IssueCard.tsx` remains
  unchanged by this mutation consolidation. `useIssueDragAndDrop` reads the
  normal selected-project Issues cache without a classification-specific input.
- List tables accept the issues from ListView. The new Decision
  type / Key column precedes Boundary; existing text editing and actions remain.
- `src/components/ProjectPage/ProjectIssues/classification.test.tsx` exercises
  the real List/Board and shared cards, mocking only the API boundary.

Verification: 39 focused user-visible tests pass, including every menu's
options/current value/dismissal, keyboard access, immediate bidirectional keys
and duplicate protection, regrouping/column movement, all classification
rollbacks, concurrent-issue isolation, delayed stale fetches, nested-data
preservation, Utility behavior, full Edit, and non-Board state selection.
`npm run tsc`, targeted ESLint, touched-file Prettier, `git diff --check`, and
`npm run build` pass. Existing atomFamily deprecation/chunk-size warnings remain.

After integration onto ticket 01, all 71 full-form/schema/classification tests
pass together under its permanent harness. Classification tests use the shared
native-popover shim and updated issue-name label. Menus focus their selected
item after the native popover becomes visible, with keyboard tests verifying
that focus transition. No alternate test config or resolver alias is required.

Figma Issues reference `1913:875` was inspected through MCP and the shared
`874-issues-view.png` artifact. Integrated browser validation remains with the
parent against the already-running remote dev API; no local API/backend was
started and no remote data was changed.
