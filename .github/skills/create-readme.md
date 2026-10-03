
---
name: readme-writer
description: Creates and writes professional README.md files for software projects.
Use when user asks to "write a README", "create a readme", "document this project",
"generate project documentation", or "help me write a README.md". Works from a
project description, existing code, or both.
---

# README Writer

## Overview

Generate a complete, professional README.md file and write it to disk. The output
should be clear enough for a first-time contributor to understand the project,
set it up locally, and start contributing.

## Step 1: Gather project context

Look for context in the codebase before asking the user:

```bash
ls -la
cat package.json 2>/dev/null || cat pyproject.toml 2>/dev/null || \
  cat go.mod 2>/dev/null || echo "No manifest found"
ls .env.example .env.sample 2>/dev/null || echo "No env example found"
```

Gather:
- What does this project do? (1-2 sentence summary)
- What language and main frameworks does it use?
- How do you install and run it?
- Are there environment variables needed?
- Is there a LICENSE file?

## Step 2: Write the README

Use this structure. Only include sections that are relevant. Do not add empty sections.

```
# Project Name

One clear sentence describing what this project does and who it is for.

## Features
- Feature one (be specific)
- Feature two

## Prerequisites
List what needs to be installed. Include version requirements if important.

## Installation
Step-by-step setup. Every command must be copy-pasteable.

```bash
git clone https://github.com/username/project
cd project
npm install
```

## Configuration
If the project needs environment variables, show an example:

```bash
cp .env.example .env
```

Then explain each variable the user needs to set manually.

## Usage
Show the most common use case first.

```bash
npm run dev
```
## Security
Write the GHAS configuration of this project.

## CI/CD
Read radix config and write about the CI.CD pipelines
## License
[MIT](LICENSE)
```

## Step 3: Write the file to disk

Once the content is ready, write it:

```bash
cat > README.md << 'EOF'
[full readme content]
EOF
```

Confirm it was written:

```bash
echo "README.md written: $(wc -l < README.md) lines"
```

## Step 4: Quality check

Before finishing, verify:
- [ ] No placeholder text like "[your description here]" remains
- [ ] Every command in the Installation section is accurate for this project
- [ ] Prerequisites match what the project actually needs
- [ ] License section matches the LICENSE file if one exists
```