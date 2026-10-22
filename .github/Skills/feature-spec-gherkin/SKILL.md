---
name: feature-spec-gherkin
description: 'Write a GitHub issue summary and Gherkin acceptance criteria for a feature designed in Figma, compared against the current code. Use when the user asks for "gherkin", "acceptance criteria", "GitHub issue text", "issue summary", "spec for developers", "what is new in Figma vs code", or wants replacement snippets for an existing issue or Gherkin after the design changed.'
argument-hint: 'Figma link to the feature section (optionally paste the existing issue text)'
---

# Feature spec and Gherkin

Produce paste-ready text for a GitHub issue: a concise summary plus Gherkin scenarios, grounded in the Figma design and the gap to current code. Read-only: do not change code. Only change Figma (annotations, component descriptions) if the user asks.

Write from a product design perspective: describe expected behaviour. Developers handle data states, field names, storage and implementation.

## Sources

- **Figma:** screens, component variants, component descriptions and native annotations in the linked section. Annotations and descriptions are the primary behaviour spec. Load [figma-use](../figma-use/SKILL.md) before any `use_figma` call.
- **Code (`main` branch):** the matching area under `src/components/`, validation in `src/validators.ts`, form defaults in `src/hooks/use*Form.ts`, enums in `src/types.ts`. Use it to understand what exists today, not as output. Prototype branches (e.g. `design-prototype`) are vibe-coded: a loose reference at most, never the baseline and never cited as matching the design.
- **Existing issue text**, if the user is updating one.

## Procedure

### 1. Compare

Build a short table for yourself: `Area | Code today | Figma`. Pull out the **behaviour changes** a user would notice (what is shown, defaults, what moves, opens or closes). Also note which behaviour belongs to other features (e.g. inline editing, quick add): this issue depends on them but does not specify them.

### 2. Ask before writing when the design is unclear

If annotations conflict, defaults are missing, or a state is ambiguous, list numbered questions and wait. The user answers by number. For minor gaps, write with the assumption stated under "Open questions".

### 3. Write the issue

Output one ````markdown fenced block (four backticks so the inner ```gherkin fences survive):

1. **Title**: feature name, plain language.
2. **Summary**: 2–4 sentences on what changes for the user, plus Figma links to the screens (`node-id` with a hyphen).
3. **Scope**: short behaviour bullets. Name dependencies on other issues in one line.
4. **Out of scope / later**.
5. **Gherkin** (below).
6. **Open questions**, if any. Numbered, one line each.

No file references, field names or data models unless the user asks.

### Gherkin conventions

- One `Feature` per user-facing capability, with a short As a / I want / So that.
- `Background` for shared setup only (e.g. "Given I am in Board view on the Issues page").
- One behaviour per scenario. Cover defaults, keyboard paths (Enter, Escape) where annotated, errors, empty states and cancel/discard.
- Quote UI labels exactly as in Figma ("Discard changes", "Always show states").
- Use generic subjects by default: "a decision", "an uncertainty in Key", "an issue outside the boundary".
- Use concrete examples only when they make a rule clearer, and keep them explicit: put them in a `Scenario Outline` + `Examples` table (e.g. behaviour per issue type) or define them in the scenario's `Given`. Never refer to a name that isn't defined in the same text, and check example data against Figma.
- Stay on the feature: leave out behaviour owned by another feature (e.g. how a chip is edited). Only describe how this feature reacts (e.g. the card moves column when its value changes anywhere).
- Describe behaviour, not layout, styling or data.
- Group related scenarios inside a feature with `# Section` comments so later updates can point to them.
- When shortening a draft, re-read it: no leftover references to removed definitions.

### 4. Updates after design changes

Never re-output the whole issue. Output only replacement instructions, one part per location:

````markdown
### Part 1: in the `# <section comment>` block of `Feature: <name>`

**Find and delete this scenario:**
```gherkin
  Scenario: <old scenario, verbatim>
```

**Paste in its place:**
```gherkin
  Scenario: <new scenario>
```
````

- New scenarios: "Paste after `Scenario: <name>`".
- Summary or scope changes: give the full replacement bullet, marked "(replace)".
- If the Figma annotations or component descriptions now disagree with the text, say so and offer to update them.

## Style

Concise, plain words, sentence case, two-space Gherkin indentation. No implementation detail.
