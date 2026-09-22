# `@ai-crew-suite/actions/weekly-check-versions`

Centralized framework upgrade engine executing automated upstream Backstage version bumps and compiling structural tracking pull requests across the AI Crew Suite platform.

## Overview

This GitHub Action drives dependency maintenance and upstream platform synchronization across organization workspaces. Built as an automated composite workflow, it intercepts the weekly release track of the Backstage framework ecosystem, performs local workspace module upgrades via backstage-cli, resolves lockfile variations, and orchestrates fully formatted Pull Requests to keep repositories up to date.

## Core Responsibilities

* **Upstream Framework Bumping**: Automates code migration passes via backstage-cli versions:bump to programmatically absorb new security patches, plugins, and feature layers.
* **Dynamic Lockfile Mutations**: Deliberately executes mutable package operations (YARN_ENABLE_IMMUTABLE_INSTALLS: 'false') to allow safe configuration adjustments if lockfile prerequisites shift during framework upgrades.
* **Automated Pull Request Scaffolding**: Leverages advanced repository tracking blocks (peter-evans/create-pull-request) to automatically build development branches, assign context labels, and publish descriptive workspace change summaries.

## Architectural Dependency Tree

This action anchors maintenance governance and third-party tracking loops across the organization workspace network:

* **Upstream Engine**: Wraps system foundation layers including actions/setup-node (v7), rharkor/caching-for-turbo (v2), and the official community release checker block peter-evans/create-pull-request (v8).
* **Downstream Consumer**: Executed directly inside scheduled cron automation workflows (.github/workflows/weekly-maintenance.yml) of every framework-aligned repository in the org.
* **Boundary Rule**: Always consume this action utilizing its verified, organization-relative subpath (ai-crew-suite/actions/weekly-check-versions@v1). Do not introduce loose, non-centralized upgrade macros or automated versioning loops.

## Local Development Workflow

### Installation & Distribution

This is an environmental scripting track wrapping dynamic CLI operations. Verify upgrade parameters, label lists, and integration schemas right within its execution scope:

```bash
yarn install --refresh
yarn turbo run lint --filter=@ai-crew-suite/action-weekly-check-versions
```

### Testing Configuration Updates

To evaluate changes to target branch patterns or upgrade targets, trigger the action pass manually inside an isolated validation branch using a personal access token (PAT) before pushing modifications to production tracks.

## Consumer Usage Checklist

To apply this maintenance automation layer inside an independent repository workspace, structure your orchestration file (e.g., .github/workflows/framework-updates.yml) using this format:

### Configure the Action Target

Ensure your execution block runs on a regular weekly schedule and provides an administrative token with elevated repository write capabilities:

```yaml
name: Weekly Framework Synchronization

on:
  schedule:
    - cron: "0 4 * * 1" # Runs every Monday at 4:00 AM UTC
  workflow_dispatch:   # Allows manual maintenance dispatching

permissions:
  contents: write
  pull-requests: write

jobs:
  upgrade-framework:
    runs-on: ubuntu-latest
    steps:
      - name: 📂 Checkout Repository Codebase
        uses: actions/checkout@v4

      - name: 🔄 Run Central Weekly Version Bump Engine
        uses: ai-crew-suite/actions/weekly-check-versions@v1
        with:
          node-version: "22"
          workflow-github-token: ${{ secrets.CUSTOM_BOT_PAT }} # Requires token capable of triggering follow-up workflows
```

## Parameter Integration Matrix

Ensure your environment configurations fulfill the required execution states:

* [ ] **`workflow-github-token`**: A GitHub token with explicit permissions to create branches, open Pull Requests, and bypass repository branch protections (Required).
* [ ] **`node-version`**: The designated Node.js execution runtime footprint (Default: "22").
* [ ] **Automated Integration**: Successful runs will automatically publish a structured Pull Request targeting main, pre-tagged with dependencies and triage labels for the team to review.

## Compliance and Licensing

Copyright © 2026 The AI Crew Suite Authors.
Licensed under the **Apache License, Version 2.0**.
