---
name: implement-spec
description: "Implement the result of /to-spec and /to-tickets in code."
disable-model-invocation: true
---

You have been provided a spec. This spec should have tickets associated with it, describing how to implement the spec.

The issue tracker should have been provided to you. If not, tell the user to run `/setup-matt-pocock-skills`.

The goal is the entire spec implemented on a single **integration branch**, with one commit per ticket and every ticket resolved the way the issue tracker closes work. When installed GitHub CLI stacking support is available, retain the ticket branches as a stack with one ticket per layer; otherwise use ordinary linear commits.

The tickets are not a list of steps. They are a **task graph** with blocking relationships between them. This means there is always a **frontier** of tickets which are ready to be grabbed.

Communication to and from subagents should be sparse. Communicate primarily through **context pointers**: to the spec, tickets, research notes, and previous commits. Don't duplicate information already available via pointers.

**Implementer subagents** should be run in the background where possible for maximum concurrency.

## Steps

1. Read the spec and tickets to understand the task graph.

2. (optional) Use an **exploration subagent** to conduct any exploration required by the tickets - relevant codebase files or external documentation. Ensure the exploration subagent can save files - it should save its markdown notes in a directory outside the repo, accessible by all future subagents. This lets **implementer subagents** focus on implementation rather than exploration.

3. Record the starting branch and commit. Check `gh stack --help` and, when available, read the installed subcommand help. Select the mode before creating the integration branch:

   - **Append:** when the starting branch belongs to an existing stack, unless the user explicitly requests a new stack. If the user names a target stack, select it first. Record its identity with `gh stack view --short`, its trunk and ordered layers with `gh stack view --json`, and each layer's local tip with `git rev-parse <branch>`. Use the original top layer as the integration base, even when starting on a lower layer.
   - **New:** when no existing stack is selected or the user explicitly requests a new stack. Use the agreed starting base.
   - **Linear:** when stacking support is unavailable, use ordinary commits without installing an extension. If the user explicitly requests an existing stack, report the blocker instead.

   Record the selected base branch and commit, then create the integration branch from that commit. Publish branches and PRs only when the issue tracker requires PRs or the user asks for them.

4. Use **implementer subagents** to implement each ticket, each in its own worktree on its own branch. Each implementer subagent:
   - confirms its worktree starts from the integration branch tip;
   - calls the Skill tool with `tdd` to build the ticket;
   - reports one ticket commit and the base commit used.

5. Integrate each completed ticket by fast-forwarding the integration branch to its ticket branch. If the integration tip has advanced, first rebase the ticket onto it, resolve conflicts, and rerun affected tests. Retain the ticket branch at its integrated commit. Use a **merger subagent** for conflict resolution when needed; straightforward integration needs no separate subagent or merge commit.

6. If this changes the **frontier** of available tickets, kick off more **implementer subagents** to work on the new tickets. This allows for maximum concurrency.

7. Once all tickets are complete, run the repository's checks and call the Skill tool with `code-review` on the integration branch against the recorded integration base commit. Fix review findings in a single **implementer subagent**, folding each fix into its owning ticket commit and rebasing dependent ticket branches. Limit history rewrites to this run's ticket branches. Update the integration tip and revalidate changed code.

   For browser validation, use the repository's documented local development environment and exercise real edits, saves, deletes, and undo/redo against its writable local database. Reserve read-only guards for shared or remote data.

8. Confirm completed implementer worktrees are clean and detach them from their ticket branches so stack commands can check those branches out. Register the ticket branches in integrated order, bottom to top:

   - **Append:** start on the recorded original top layer and run `gh stack add <ticket-branch>` for each ticket. Run each addition from the current top layer. Reserve `gh stack init` for new-stack mode.
   - **New:** use `gh stack init --base <base-branch> <ticket-branches...>` as supported by the installed CLI.
   - **Linear:** verify the ordinary integration history has one commit per ticket.

   In stack mode, verify with `gh stack view --short` and `gh stack view --json` that each new layer contains exactly its ticket commit, including review fixes, using local Git history to count commits. The final layer must match the integration tip. In append mode, also compare against the recorded snapshot: the stack identity and trunk, original layer order, and original local tip commits must remain unchanged, with all new layers above the original top.

9. If PR publication is required or requested, use `gh stack submit` for ticket PRs in stack mode, or a single integration PR in fallback mode, with the appropriate closing references. Mark PRs ready only after validation and review. Otherwise, resolve each ticket the way the issue tracker closes work. Report the integration branch and, when used, the stack.

10. Clean up all **implementer subagent** worktrees while retaining the ticket branches needed by the stack.
