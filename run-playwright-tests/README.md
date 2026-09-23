# `@ai-crew-suite/actions/run-playwright-tests`

Centralized end-to-end task runner that orchestrates immutable workspace setups, remote compilation caching, browser provisioning, and custom commit SHA status gatekeeping across the AI Crew Suite platform.

## Overview

This GitHub Action serves as an advanced deployment guardrail and orchestration runner across the organization. Built as a hybrid action combining a composite setup block with an inline TypeScript deployment checker (node20), it automates heavy user-interface validation testing while programmatically verifying commit status histories via the GitHub Actions API to block unstable deployment flows.

## Core Responsibilities

* **Hybrid Test Orchestration**: Automatic container setup including Node.js v22 initialization, Yarn 4 immutable mapping, Turborepo remote cache linking (rharkor/caching-for-turbo), and target browser provisioning.
* **Commit SHA Status Gatekeeping**: Interrogates the GitHub workflow API repository history tracks via octokit to programmatically ensure a target git hash has recorded an explicit success signature.
* **Early Development Pre-Release Bypass**: Provides a configuration safety switch (pre_release_bypass) allowing deployments to pass with structural warnings during rapid platform bootstrap phases.

## Architectural Dependency Tree

This action manages integration test executions and deployment safety checkpoints across the organization workspace network:

* **Upstream Engine**: Integrates system foundations including actions/setup-node (v7), rharkor/caching-for-turbo (v2), and official GitHub Octokit context SDK layers.
* **Downstream Consumer**: Executed directly inside continuous deployment, staging promotion, or release pipeline matrices (.github/workflows/deploy.yml) of every code repository in the org.
* **Boundary Rule**: Always consume this action utilizing its verified, organization-relative subpath (ai-crew-suite/actions/playwright-run@v1). Do not decouple environment building scripts from your release validation checkers.

## Local Development Workflow

### Installation & Distribution

This package bundles both a composite layout and a compiled JavaScript runtime action. Verify underlying TypeScript source code layers, verification blocks, and input mappings before compiling code to dist/index.js:

```bash
yarn install --refresh
yarn turbo run build --filter=@ai-crew-suite/action-run-playwright-tests
```

### Running Verification Tracks

```bash
yarn turbo run lint --filter=@ai-crew-suite/action-run-playwright-tests
```

## Consumer Usage Checklist

To apply this deployment gatekeeper inside an independent repository release track, structure your orchestration file (e.g., .github/workflows/deploy-pipeline.yml) using this format:

### Configure the Action Target

Ensure your runner environment has permission to read action run statuses and write artifact data blocks:

```yaml
name: Production Deployment Pipeline

on:
  push:
    branches: [main]

permissions:
  actions: read
  contents: read

jobs:
  deploy-gate:
    runs-on: ubuntu-latest
    steps:
      - name: 🎭 Run Centralized Playwright Run Engine
        uses: ai-crew-suite/actions/run-playwright-tests@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          expected_sha: ${{ github.sha }}
          dev-server-port: "3000"
          pre_release_bypass: "true"
```

## Parameter Integration Matrix

Ensure your configuration mappings satisfy the required inputs:

* [ ] **`github_token`**: The administrative access token needed to query repository workflow history parameters.
* [ ] **`expected_sha`**: The target Git commit hash being audited for verification compliance.
* [ ] **`dev-server-port`**: Target framework developer host port mapping value (Default: "3000").
* [ ] **`pre_release_bypass`**: Set to "true" to log warnings rather than failing the build step if tests are incomplete during early dev stages.
* [ ] **Artifact Extraction**: If an end-to-end execution fail block triggers, reports are securely captured and retained for 30 days within a playwright-report archive card.

## Compliance and Licensing

Copyright © 2026 The AI Crew Suite Authors.
Licensed under the **Apache License, Version 2.0**.
