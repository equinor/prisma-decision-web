# 05: Change classification and key uncertainty directly in both views

**What to build:** Let project members change issue classification and key
uncertainty from labels/chips in List rows and Issues Board cards, with immediate
saves and correct movement between columns or influence-diagram groups.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

## Acceptance criteria

- [ ] Use EDS 2.0 beta components wherever a suitable beta equivalent exists for
  components touched by this ticket. This applies generally, not to a particular
  component type. Retain existing components where no suitable beta counterpart
  exists.
- [ ] Do not migrate simple card surfaces, layout wrappers, typography, or plain
  text to beta components. This is not a wholesale component migration.
- [ ] Clicking an issue type label, decision type chip, or boundary chip opens
  an anchored menu titled "ISSUE TYPE", "DECISION TYPE", or "BOUNDARY".
- [ ] Issue type lists Unassigned, Decision, Uncertainty, Fact, and Utility.
  Decision type lists Policy, Focus, and Tactical. Boundary lists In, On, and Out.
  The current value is checked.
- [ ] Selecting a different value closes the menu and saves immediately through
  the existing whole-issue update API. Escape or outside click closes without
  saving; selecting the current value does not send an unnecessary update.
- [ ] Show decision type only for Decisions and the key toggle only for
  Uncertainties.
- [ ] The key toggle is an accessible button with aria-pressed matching its
  selected state. Clicking it updates the displayed state without waiting for
  the server, then saves the new value.
- [ ] Changes move List rows between the existing influence-diagram groups when
  relevant. Decisions require Focus and In/On; Uncertainties require key and In/On;
  Utilities require In/On. Preserve the existing rules for other issues.
- [ ] A Board type change moves the card to the appropriate existing column.
  Preserve nested data and other classification values when changing type.
- [ ] Do not change existing Utility behavior: no additional column,
  conversion-specific notification, or new conversion restriction.
- [ ] Replace List Date Added/Date Updated columns with a Decision type / Key
  column. Retain existing issue actions, state counts, and other fields.
- [ ] A failed update shows the existing error notification and restores the
  saved value and corresponding row/card placement.
- [ ] Scope the new card interactions to the Issues Board; retain other
  shared-card behavior, existing permissions, and full Edit access.
- [ ] Verify every menu's options and selected state, dismissal, immediate key
  updates, accessibility, column/group movement, data preservation, and rollback.

## Design references

Parent: https://github.com/equinor/prisma-decision-web/issues/874

Issues visuals:
https://www.figma.com/design/iJr3w56fyMClNAn7xuIop3/Dot-Design?node-id=1913-875

Original acceptance criteria:
https://github.com/user-attachments/files/33243240/Gherking.for.inline.editing.md

This is frontend-only work using existing issue values and update behavior.
Do not introduce Undo or change existing issue defaults.
