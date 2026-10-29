# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Layout

Single-context: one `GLOSSARY.md` at the repo root and ADRs in `docs/adr/`.

## Before exploring, read these

- **`GLOSSARY.md`** at the repo root.
- **`docs/adr/`**: read ADRs that touch the area you're about to work in.

If either is absent, proceed silently. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `GLOSSARY.md`. Avoid synonyms the glossary explicitly excludes.

If the concept you need isn't in the glossary yet, reconsider whether you're inventing language the project doesn't use, or note a real gap for `/domain-modeling`.

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly:

> Contradicts ADR-0007 (event-sourced orders), but worth reopening because...
