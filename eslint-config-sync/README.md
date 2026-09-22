# `@ai-crew-suite/actions/eslint-config-sync`

Centralized governance check leveraging native Copilot LLM proxy layers to dynamically audit local lint rules for gaps against upstream Spotify Backstage core releases.

## Overview

This GitHub Action serves as an automated platform alignment engineer within the organization. Built as an advanced compilation runner (node20), it reads the current @backstage/cli version inside a workspace, streams the authentic base configuration rules directly from the upstream Spotify Backstage reference source, and leverages native GitHub Copilot LLM models to generate conversational gap analysis reviews on incoming Pull Requests.

## Core Responsibilities

* **Dynamic Token Exchange**: Exchanges the internal GITHUB_TOKEN for a ephemeral, short-lived GitHub Copilot proxy token session to communicate securely with internal enterprise AI systems.
* **Upstream Asset Resolution**: Intelligently inspects local package definitions and lockfiles to dynamically pinpoint and stream target files from the corresponding raw tag or branch on githubusercontent.
* **Automated Gap Diagnostics**: Prompts Copilot's gpt-4o-mini engine with contextual local vs. upstream file contents to extract missing rules, formats, or plugins, and leaves structured feedback comments directly on the target Pull Request.

## Architectural Dependency Tree

This action manages structural framework parity and code layout governance across the workspace network:

* **Upstream Engine**: Hooks into native GitHub runner parameters and interacts directly with internal enterprise GitHub Copilot endpoints (api.githubcopilot.com).
* **Downstream Consumer**: Executed directly inside verification pipelines (.github/workflows/framework-sync.yml) on every open Pull Request context within core workspace engines.
* **Boundary Rule**: Always consume this action utilizing its verified, organization-relative subpath (ai-crew-suite/actions/eslint-config-sync@v1). Do not configure isolated or un-managed local lint alignment templates.

## Local Development Workflow

### Installation & Distribution

This is a JavaScript-backed runtime action compiled using standard toolchain scripts. Verify underlying TypeScript source code layers, dependencies, and formatting before compiling code to dist/index.js:

```bash
yarn install --refresh
yarn turbo run build --filter=@ai-crew-suite/action-eslint-config-sync
```

### Testing Configuration Updates

To evaluate changes to the underlying LLM system prompt layers or fetch criteria, target a single test application Pull Request while providing a valid enterprise token with Copilot enablement before updating production release tags.

## Consumer Usage Checklist

To apply this automated sync auditing layer inside a framework repository layout, integrate the action block using this format:

### Configure the Action Target

Ensure your runner environment provides an explicit GITHUB_TOKEN and restricts executions to active Pull Request triggers:

```yaml
name: Framework Alignment Validation

on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions:
  contents: read
  issues: write
  pull-requests: write

jobs:
  audit-alignment:
    runs-on: ubuntu-latest
    steps:
      - name: 📂 Checkout Repository Codebase
        uses: actions/checkout@v4

      - name: 🔍 Check Upstream ESLint Alignment Check
        uses: ai-crew-suite/actions/eslint-config-sync@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Parameter Integration Matrix

Ensure your environment states satisfy the required execution properties:

* [ ] **GITHUB_TOKEN Provisioning**: Must be explicitly declared as an environment variable (env: block). The token must originate from an account or workspace possessing an **active GitHub Copilot license**.
* [ ] **Workspace File Placement**: The engine assumes local variations are tracked inside a dedicated package path at packages/config-eslint/src/index.ts.
* [ ] **Automated Reviews**: Discovered linting rule discrepancies will automatically be posted as clear Markdown assessment bullet points directly onto the conversation timeline of the Pull Request.

## Compliance and Licensing

Copyright © 2026 The AI Crew Suite Authors.
Licensed under the **Apache License, Version 2.0**.
