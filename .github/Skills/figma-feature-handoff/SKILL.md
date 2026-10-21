---
name: figma-feature-handoff
description: 'Wrap up an approved Figma exploration and make it ready for developer handoff. Use when the user says "wrap this up", "clean it up and document it", "move things to where they belong", "make it ready for implementation", "update the views / components page with this", "add annotations for developers", or links an approved draft section. Plans first, then merges components into the Components page, updates the big-picture screens, adds native Figma annotations and cleans layer names. Load figma-use before any use_figma call.'
argument-hint: 'Figma link to the approved draft section'
---

# Figma feature handoff

Turn an approved exploration (draft section, iteration frames) into handoff-ready design: real components on the Components page, big-picture screens on the User interface page, and native annotations developers (and their LLM) can rely on.

Load [figma-use](../figma-use/SKILL.md) before every `use_figma` call, and [figma-generate-library](../figma-generate-library/SKILL.md) when creating or restructuring components.

## Principles

- **Plan first.** Never move, merge, rename or delete before the user has reviewed the plan.
- **Screens show the big picture**, in the default state. States live in component variants plus native annotations. Never one screen per state.
- **Native annotations only** (`node.annotations`), never drawn sticky notes, arrows or text objects.
- **Extend, don't duplicate.** Merge into an existing base component (e.g. `IssueCard`) instead of adding a parallel copy. Don't detach as a shortcut.
- **Only used components go on the Components page.** Exploration-only components stay where they are; the user cleans them up.
- **Leave the user's drafts and comment annotations alone.** If one should be kept for later, copy it next to the target with its annotation.
- **EDS 2.0 components and variables, EDS Assets icons.** `clipsContent = false` unless clipping is the point.
- **No prototype interactions** unless asked.
- **Code is a structural reference, not the spec.** If the design differs from code on purpose (spacing, behaviour), flag it in an annotation instead of correcting it.

## Procedure

### 1. Inventory (read-only)

1. Read the linked section: components, component sets, instances, screens, existing annotations (including the user's comment annotations).
2. For every component, decide: **new**, **extends an existing component**, **replaces an existing component**, or **exploration-only**. Search the Components page for existing bases by name and by code counterpart in `src/components/`.
3. Count instances of affected components across pages; note where they are nested (e.g. `IssueCard` is nested in `IssueColumn`, `Strategy`, `InfluenceNode`, `DecisionTreeNode`).
4. Find the destination sections: the matching Components page section and the feature's section on the User interface page.

### 2. Plan and stop

Present the plan grouped by destination, then wait for approval:

- **Components page:** per section, what is added, merged, renamed or removed; variant axes and component properties.
- **User interface page:** which screens are updated or added and where (row, neighbours); which docs/example frames are needed.
- **Annotations:** per screen or frame, what each annotation says and its category.
- **Cleanup:** temporary sections to delete, layers to rename.
- **Open questions**, numbered so the user can answer "1. …, 2. …".

### 3. Apply (mains first, instances last)

1. **Components.** Move or merge into the right Components page section. Match the section's conventions (look at neighbours for fill, radius, padding, gaps). Before structural edits to nested components, snapshot nested overrides and reapply afterwards.
2. **Screens.** Update or add big-picture screens in the feature's UI section using instances, not detached copies. If a section grows, shift the sections below so nothing overlaps.
3. **Docs/examples row.** Small frames only for interactions or edge cases a variant can't explain on its own (inline edit, menus open, warnings, empty states). Place them in a row below the screens.
4. **Annotations.** Get categories with `figma.annotations.getAnnotationCategoriesAsync()` (Development, Interaction, Question, Comment, Assumption). Write for developers: behaviour, rules, defaults, keyboard, edge cases, which component to use. Add `properties: [{ type: 'mainComponent' }]` on instances where the component link helps. Append to existing annotations; the setter replaces all, so copy existing ones first.
5. **Component descriptions.** Set a short purpose/usage `description` on new or changed components and sets.
6. **Layer naming pass.** No default names (`Frame 123`, `Rectangle 4`, `Group 7`). Use code sub-component names where they exist.
7. **Cleanup.** Delete temporary sections only after confirming no instances or references point into them.

### 4. Verify

- After moving mains: check instances for stale nested overrides (placeholder text like "Label" or "Item", hidden layers showing). Fix by re-asserting the override.
- Check for orphan nodes left at page top level by failed calls.
- Check hidden-layer overrides in mains survived the move.
- Screenshot the changed sections with `node.screenshot()`; stay within 20 images per request.

### 5. Report

Summarise what moved where (component and section names), what was annotated, intentional design-vs-code differences, and open items. Offer to write the GitHub issue summary and Gherkin with [feature-spec-gherkin](../feature-spec-gherkin/SKILL.md).
