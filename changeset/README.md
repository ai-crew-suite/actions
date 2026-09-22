# `@ai-crew-suite/actions/changeset`

Centralized automated release engine managing immutable Yarn workspace installations and tracking Changesets pull requests across the AI Crew Suite platform.

## Overview

This GitHub Action orchestrates package publishing tracks and version lifecycle automations across the organization repositories. Built as a secure composite workflow, it initializes isolated runtime containers, runs fast immutable package updates via Yarn 4 cached lookups, and delegates version changes directly into automated Pull Request matrices without manual engineer intervention.

## Core Responsibilities

* **Deterministic Environments**: Configures identical Node.js build footprints natively linked to Yarn internal cache layers.
* **Immutable Installations**: Enforces strict Yarn 4 security parameters (--immutable) to guarantee underlying lockfile drift is caught and reported instantly.
* **Automated Version Tracking**: Wraps standard Changeset lifecycles, enabling system-driven compilation, tagging, and automated release-branch Pull Request generation.

## Architectural Dependency Tree

This action manages versioning and release gating rules across the organization workspace network:

* **Upstream Engine**: Wraps core modern lifecycle blocks including actions/checkout (v7), actions/setup-node (v7), and changesets/action (v2).
* **Downstream Consumer**: Executed directly inside continuous deployment or main trunk merge workflows (.github/workflows/release-pipeline.yml) of every code repository in the org.
* **Boundary Rule**: Always consume this action utilizing its verified, organization-relative subpath (ai-crew-suite/actions/changeset@v1). Do not split environment installation sequences from the release execution pass.

## Local Development Workflow

### Installation & Builds

This is an environment orchestration script tracking active dependency trees. Verify input parameters and integration schemas right within its execution scope:

```bash
yarn install --refresh
yarn turbo run lint --filter=@ai-crew-suite/action-changeset
```

### Testing Configuration Updates

To test additions to the installation configurations, execute the action run within a dedicated staging repository using a test personal access token (PAT) before updating global platform version tags.

## Consumer Usage Checklist

To apply this release management layer inside an independent repository workspace, structure your orchestration file (e.g., .github/workflows/release.yml) using this format:

### Configure the Action Target

Ensure your execution block provides a token with elevated permissions to create and push branches, update code contents, and track Pull Requests:

```yaml
name: Execute Automation Release Tracks

on:
  push:
    branches:
      - main

concurrency: ${{ github.workflow }}-${{ github.ref }}

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: 🚀 Run Centralized Changeset Controller
        uses: ai-crew-suite/actions/changeset@v1
        with:
          node-version: "22"
          github-token: ${{ secrets.GITHUB_TOKEN }}
          pr-title: "Version Packages - release automated updates"
```

### Parameter Integration Matrix

Ensure your configuration mappings satisfy the required inputs:

* [ ] **`node-version`**: The target Node.js execution runtime footprint (Default: "22"). Natively configures Yarn lockfile caches.
* [ ] **`github-token`**: The administrative access token needed to write releases and structure versioning Pull Requests.
* [ ] **`pr-title`**: The visual name string attached to the automatically generated release-sync Pull Request.

## Compliance and Licensing

Copyright © 2026 The AI Crew Suite Authors.
Licensed under the **Apache License, Version 2.0**.
