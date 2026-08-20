# Contributing

We love your input! The following is a set of guidelines for contributing to **Prisma Decision Web**.

Whether it's reporting a bug, proposing new features, discussing the current state of the code, or submitting a fix — we want to make contributing as easy and transparent as possible.

## Ground Rules

1. We use [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) for code formatting and linting.
2. All code must be type-safe — TypeScript strict mode is enforced.
3. Security vulnerabilities must be reported privately — see [SECURITY.md](SECURITY.md).

## Getting Started

This is a React 19 + TypeScript frontend application built with Vite.

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- npm

### Local Development Setup

```bash
git clone https://github.com/equinor/prisma-decision-web.git
cd prisma-decision-web
npm install
```

#### Running the Development Server

```bash
npm run dev
```

This starts the Vite dev server with hot module replacement.

#### Using Docker Compose

```bash
docker compose up --build
```

### Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start local dev server |
| `npm run build` | TypeScript check + production build |
| `npm run lint` | Run ESLint |
| `npm run prettier` | Check formatting with Prettier |
| `npm run tsc` | TypeScript type-checking (no emit) |
| `npm run preview` | Preview production build locally |

## Code Style

We use **ESLint** and **Prettier** to enforce consistent code formatting:

- **Prettier** — tabs, single quotes, print width 100 (see [.prettierrc.json](.prettierrc.json))
- **ESLint** — TypeScript-aware linting with React hooks and refresh plugins

Run linting and formatting checks:

```bash
npm run lint
npm run prettier
```

## Commits

We strive to keep a consistent and clean git history. All contributions should adhere to the following:

1. All checks should pass on all commits
2. A commit should do one atomic change on the repository
3. The commit message should be descriptive

We follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

- **fix:** patches a bug (correlates with PATCH in Semantic Versioning)
- **feat:** introduces a new feature (correlates with MINOR in Semantic Versioning)
- **BREAKING CHANGE:** introduces a breaking API change (correlates with MAJOR in Semantic Versioning)
- Other types are allowed: `build:`, `chore:`, `ci:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`

### Commit Message Format

1. Separate subject from body with a blank line
2. Limit the subject line to 50 characters
3. Capitalize the subject line
4. Do not end the subject line with a period
5. Use the imperative mood in the subject line
6. Wrap the body at 72 characters
7. Use the body to explain *what* and *why* vs. *how*

Reference: [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)

## Pull Request Process

1. Work on your own fork of the main repo.
2. Squash/organize your work into meaningful atomic commits.
3. Push your commits and make a **draft** pull request. Describe what the pull request is about and link the relevant issue.
4. Ensure that all CI checks pass (lint, type-check, build).
5. While you wait, carefully review the diff yourself.
6. When all checks have passed and you are happy with your changes, change your pull request to **"Ready for review"** and request a code review.
7. As a courtesy to the reviewer(s), you may mark commits that react to review comments with `fixup` (see `git commit --fixup`) rather than immediately squashing and force pushing.
8. When the review is concluded, squash what needs squashing and merge.

### Pull Request Scoping

Ideally a pull request will be small in scope and atomic, addressing precisely one issue. It is permissible to fix minor details (formatting, linting, simple refactoring) in the vicinity of your work.

If you want to make changes that are not directly related to the issue you're working on, create a separate PR to avoid noise in the review process.

## Reporting Bugs

Create a new issue to report a bug, including:

- A quick summary and/or background
- Steps to reproduce — be specific and give sample code if you can
- What you expected would happen
- What actually happens
- Any relevant logs or error messages

## Proposing Features

Create a new issue to propose new features, including:

- Brief description of the feature
- What problem/issue it will solve
- Acceptance criteria — how should it look when finished

## Versioning & Releases

This project uses tag-based deployments:

- `TEST` tag triggers deployment to the test environment
- `PROD` tag triggers deployment to production
- `PUBLIC` tag triggers deployment to the public environment

Release commands:

```bash
npm run release:test
npm run release:prod
npm run release:public
```
