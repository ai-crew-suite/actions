# `@ai-crew-suite/actions/automate-stale`

Centralized core automation engine to flag, label, and safely lifecycle stale issues and pull requests across the AI Crew Suite platform.

## Overview

This GitHub Action orchestrates lifecycle hygiene across all organization code repositories. Built as a secure, composite workflow, it automatically identifies abandoned or un-triaged items, flags them with clear contributor notifications, and cleans old backlogs without requiring local repository maintenance scripts.

## Core Responsibilities

* **Issue Lifecycle Automation**: Flags issues idle for more than 60 days, monitors for contributor triage actions, and closes stale inputs after 7 trailing days.
* **Pull Request Hygiene**: Safeguards review tracks by marking inactive pull requests after 14 days while respecting exemptions for critical structural updates.
* **Egress Security Hardening**: Wraps execution tracks with explicit audit policies to prevent token interception or network leakage during runner cycles.

## Architectural Dependency Tree

This action standardizes infrastructure validation checkpoints across the organization workspace network:

* **Upstream Engine**: Built directly on top of actions/stale (v11) and step-security/harden-runner (v2) secure execution blocks.
* **Downstream Consumer**: Directly integrated into the central scheduler or cron workflows (.github/workflows/) of every code repository in the org.
* **Boundary Rule**: Always consume this action utilizing its verified, organization-relative subpath (ai-crew-suite/actions/automate-stale@v1). Do not map parameters to external, un-audited stale-automation blocks.

## Local Development Workflow

### Installation & Builds

This is a composite workflow action utilizing underlying Git tags. Verify localized parameters, version fields, and schemas right within its execution scope:

```bash
yarn install --refresh
yarn turbo run lint --filter=@ai-crew-suite/action-automate-stale
```

### Testing Configuration Updates

To safely test changes to labels or timeout thresholds, target a single test repository by executing a manual workflow_dispatch run before cutting a global organization release tag.

## Consumer Usage Checklist

To apply this stale-management layer inside an independent repository workspace, structure your orchestration file (e.g., .github/workflows/stale-hygiene.yml) using this format:

### Configure the Action Target

Ensure your runner profile has write access to both issues and pull requests:

```yaml
name: Flag and Close Stale Issues and Pull Requests

on:
  workflow_dispatch:
  schedule:
    - cron: "0 */6 * * *"

permissions:
  contents: read
  issues: write
  pull-requests: write

jobs:
  stale:
    runs-on: ubuntu-latest
    steps:
      - name: 🧹 Run Centralized Stale Engine
        uses: ai-crew-suite/actions/automate-stale@v1
        with:
          days-before-issue-stale: 60
          days-before-pr-stale: 14
```

### Parameter Integration Matrix

Ensure your target parameters adhere to the following configuration inputs:

* [ ] **`days-before-issue-stale`**: Idle days before an issue marks as stale (Default: 60). Automatically skips labels like plugin, kind/bug, or triage.
* [ ] **`days-before-pr-stale`**: Idle days before a PR marks as stale (Default: 14). Automatically skips open dependencies and will-fix targets.

## Compliance and Licensing

Copyright © 2026 The AI Crew Suite Authors.
Licensed under the **Apache License, Version 2.0**.
