---
name: feature-spec-gherkin
description: 'Write a GitHub issue summary and Gherkin acceptance criteria for a feature designed in Figma, compared against the current code. Use when the user asks for "gherkin", "acceptance criteria", "GitHub issue text", "issue summary", "spec for developers", "what is new in Figma vs code", or wants replacement snippets for an existing issue or Gherkin after the design changed.'
argument-hint: 'Figma link to the feature section (optionally paste the existing issue text)'
---

# Feature spec and Gherkin

Produce paste-ready text for a GitHub issue: a concise summary plus Gherkin scenarios, grounded in the Figma design and the gap to current code. Read-only: do not change code. Only change Figma (annotations, component descriptions) if the user asks.

## Sources

- **Figma:** screens, component variants, component descriptions and native annotations in the linked section. Annotations and descriptions are the primary behaviour spec. Load [figma-use](../figma-use/SKILL.md) before any `use_figma` call.
- **Code:** the matching area under `src/components/`, validation in `src/validators.ts`, form defaults in `src/hooks/use*Form.ts`, enums in `src/types.ts`. Use code names for values (e.g. objective type `Mean`, boundary `in`/`on`/`out`).
- **Existing issue text**, if the user is updating one.

## Procedure

### 1. Compare

Build a short table: `Area | Code today | Figma`. Pull out every **rule change** (validation, required fields, defaults, enum values, what closes or opens what) with the file it lives in.

### 2. Ask before writing when the design is unclear

If annotations conflict, defaults are missing, or a state is ambiguous, list numbered questions and wait. The user answers by number. For minor gaps, write with the assumption stated under "Open questions".

### 3. Write the issue

Output one ````markdown fenced block (four backticks so the inner ```gherkin fences survive):

1. **Title**: feature name, plain language.
2. **Summary**: 2–4 sentences on what changes for the user, plus Figma links to the section (`node-id` with a hyphen).
3. **Scope**: one bullet per component or area, using the Figma component names (they match code names).
4. **Rule changes compared with current code**: bullets with file references.
5. **Out of scope / later**.
6. **Gherkin** (below).
7. **Open questions**, if any.

### Gherkin conventions

- One `Feature` per user-facing capability, with a short As a / I want / So that.
- `Background` for shared setup; `Scenario Outline` + `Examples` when behaviour varies by issue type (Decision / Uncertainty / Utility / Fact / Unassigned).
- One behaviour per scenario. Cover defaults, keyboard paths (Enter, Escape) where annotated, errors, empty states and cancel/discard.
- Quote UI labels exactly as in Figma ("Discard changes", "Always show states").
- Use realistic domain data (e.g. uncertainty "Oil price", outcomes "High"/"Low").
- Describe behaviour, not layout or styling.
- Group related scenarios inside a feature with `# Section` comments so later updates can point to them.

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

Concise, plain words, sentence case, two-space Gherkin indentation. No implementation detail unless it is a rule change developers must know about.
