# `@ai-crew-suite/actions/run-ci`

Centralized Continuous Integration pipeline engine executing immutable workspace installations, distributed Turborepo builds, unit testing harnesses, and secure Playwright E2E suites.

## Overview

This GitHub Action serves as the core continuous integration gatekeeper across the organization. Built as a secure, composite workflow, it enforces unified compilation, strict code quality validation, type safety metrics, and cross-browser integration testing routines to maintain a zero-regression baseline before trunk merges.

## Core Responsibilities

* **Cached Building Matrices**: Integrates distributed remote caching layers (rharkor/caching-for-turbo) to accelerate workspace compilation runs by skipping unchanged pipeline artifacts.
* **Syntactic Layout Validation**: Runs static structure evaluations via unified formatting tracks to guarantee codebases adhere to platform style baselines.
* **End-to-End Test Provisioning**: Automates structural test harness preparation, constructs localized authorization boundaries, and drives headless browser orchestration passes while handling failure report extractions cleanly.

## Architectural Dependency Tree

This action anchors quality assurance tracks across the organization workspace network:

* **Upstream Engine**: Combines system dependencies including actions/checkout (v7), actions/setup-node (v7), rharkor/caching-for-turbo (v2), and the native playwright runner context.
* **Downstream Consumer**: Executed directly inside verification pipelines (.github/workflows/ci.yml) on every pull request initialization and primary push event across the org.
* **Boundary Rule**: Always consume this action utilizing its verified, organization-relative subpath (ai-crew-suite/actions/ci@v1). All structural validation paths must execute sequentially inside this isolated boundary.

## Local Development Workflow

### Installation & Tracking

This is a pipeline composition engine orchestrating multi-package verification flows. Verify parameters and pipeline maps right within its execution scope:

```bash
yarn install --refresh
yarn turbo run lint --filter=@ai-crew-suite/action-run-ci
```

### Testing Configuration Updates

To evaluate changes to browser provisioners or test steps, test updates inside a single application module before tagging and releasing a global platform version increment.

## Consumer Usage Checklist

To apply this CI matrix layer inside an independent repository workspace, structure your orchestration file (e.g., .github/workflows/ci.yml) using this format:

### Configure the Action Target

Ensure your runner environment has permission to check out full history logs and write to internal artifact storage systems:

```yaml
name: Continuous Integration

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - name: 🧪 Execute Central Integration Pipeline
        uses: ai-crew-suite/actions/run-ci@v1
        with:
          node-version: "22"
          playwright-base-url: "http://localhost:3000"
```

### Parameter Integration Matrix

Ensure your configuration mappings satisfy the required inputs:

* [ ] **node-version**: The designated Node.js compilation footprint (Required). Directly dictates lockfile caching keys.
* [ ] **playwright-base-url**: The networking endpoint evaluated during browser verification tests (Default: `http://localhost:3000`).
* [ ] **Failure Overrides**: If an E2E step fails, an artifact containing debugging logs named `playwright-report-node-<version>` will be retained for 1 day.

## Compliance and Licensing

Copyright © 2026 The AI Crew Suite Authors.
Licensed under the **Apache License, Version 2.0**.
