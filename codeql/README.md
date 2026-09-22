# `@ai-crew-suite/actions/codeql`

Centralized security scanning and vulnerability analysis engine enforcing advanced CodeQL code-scanning suites across the AI Crew Suite platform.

## Overview

This GitHub Action orchestrates automated static application security testing (SAST) loops across all organization repositories. Built as a secure, composite workflow, it initializes localized analysis databases, injects custom path boundary limits, automatically builds compilation targets, and performs deep quality passes to block supply chain attacks, logic flaws, and credential leaks.

## Core Responsibilities

* **Security & Quality Enforcement**: Automatically appends the advanced +security-and-quality extended query matrix to standard scanning runs.
* **Path Auditing Constraints**: Scans critical architecture targets (packages, plugins, scripts, test, actions) while optimizing performance by completely ignoring caching overhead boundaries (node_modules, dist, .turbo, .yarn).
* **Automated Target Compiling**: Utilizes smart fallback compilers (autobuild) to construct source dependencies inline whenever the runtime context isolates a JavaScript or TypeScript target environment.

## Architectural Dependency Tree

This action manages security compliance checkpoints across the organization workspace network:

* **Upstream Engine**: Evaluates runtime parameters directly via the official secure suite blocks of github/codeql-action (v4).
* **Downstream Consumer**: Executed directly inside security auditing matrices (.github/workflows/codeql.yml) on every main branch merge event and weekend cron cycle across the org.
* **Boundary Rule**: Always consume this action utilizing its verified, organization-relative subpath (ai-crew-suite/actions/codeql@v1). Do not create loose, un-managed local scanning profiles.

## Local Development Workflow

### Installation & Distribution

This is an environmental analysis script wrapping remote engine calls. Verify configuration path scopes and input properties right within its execution scope:

```bash
yarn install --refresh
yarn turbo run lint --filter=@ai-crew-suite/action-codeql
```

### Testing Configuration Updates

To evaluate changes to ignored paths or query inclusion presets, execute the action run manually inside an isolated validation branch before pushing modifications to the primary organization release track.

## Consumer Usage Checklist

To apply this security scanning layer inside an independent repository workspace, structure your orchestration file (e.g., .github/workflows/security.yml) using this format:

### Configure the Action Target

Ensure your runner environment has elevated security-events: write permissions to report findings directly back to GitHub's Security dashboard:

```yaml
name: Security Analysis Scanning

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: "0 0 * * 0" # Runs every Sunday at midnight

permissions:
  actions: read
  contents: read
  security-events: write

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - name: 📂 Checkout Repository
        uses: actions/checkout@v4

      - name: 🔎 Execute Central Security Engine
        uses: ai-crew-suite/actions/codeql@v1
        with:
          language: "javascript-typescript"
```

## Parameter Integration Matrix

Ensure your configuration mappings satisfy the required inputs:

* [ ] **`language`**: The specific target runtime runtime string keyword evaluated by CodeQL (Required). (e.g., Use "javascript-typescript" for standard monorepo packages).
* [ ] **Vulnerability Reports**: Discovered vulnerabilities and anti-patterns will automatically map directly into your repository's native **Security -> Code scanning** metrics overview interface.

### Compliance and Licensing

Copyright © 2026 The AI Crew Suite Authors.
Licensed under the **Apache License, Version 2.0**.
