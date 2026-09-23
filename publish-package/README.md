# `@ai-crew-suite/actions/publish-package`

Centralized package publishing and release pipeline engine featuring secure Yarn 4 credential mapping, automated cryptographic build provenance enforcement, and localized Slack incident notifications.

## Overview

This GitHub Action serves as the final distribution gatekeeper for package release cycles across the organization. Built as a secure composite deployment workflow, it automates isolated dependency checks, runs production compilation tests, injects scope configurations into the Yarn runtime, and signs packages with native OpenID Connect (OIDC) provenance records before publishing them to the public registry.

## Core Responsibilities

* **Cryptographic Provenance Signing**: Automatically exports YARN_NPM_PUBLISH_PROVENANCE=true metadata matrices to bind verifiable public attestations back to the source execution runner.
* **Yarn 4 Scope Configurations**: Injectively targets the organization registry layer (npmScopes.ai-crew-suite) to isolate publish boundaries, configure authorization tokens on the fly, and bypass local configuration leaks.
* **Slack Incident Telemetry**: Integrates contextual webhook triggers (rtCamp/action-slack-notify) to fire localized rich-media incident warnings or successful deployment alerts based on live execution outcomes.

## Architectural Dependency Tree

This action anchors delivery and public distribution workflows across the organization workspace network:

* **Upstream Engine**: Wraps core modern workspace blocks including actions/setup-node (v7), rharkor/caching-for-turbo (v2), changesets/action (v2), and the rtCamp/action-slack-notify pipeline.
* **Downstream Consumer**: Executed directly inside continuous deployment orchestration pipelines (.github/workflows/publish-pipeline.yml) on primary repository release branches across the org.
* **Boundary Rule**: Always consume this action utilizing its verified, organization-relative subpath (ai-crew-suite/actions/publish@v1). Do not manage sensitive access keys or scope configurations inside localized package execution files.

## Local Development Workflow

### Installation & Tracking

This is an environmental deployment composition engine mapping secure parameters. Verify credentials configurations, scope variables, and integration schemas right within its execution scope:

```bash
yarn install --refresh
yarn turbo run lint --filter=@ai-crew-suite/action-publish-package
```

### Testing Configuration Updates

To safely test additions to scope routing configurations or notification templates, toggle mock webhooks inside a single application module before pushing changes to the production organization release tracks.

## Consumer Usage Checklist

To apply this deployment and publishing layer inside an independent repository package workspace, structure your orchestration file (e.g., .github/workflows/deploy.yml) using this format:

### Configure the Action Target

Ensure your runner environment grants explicit id-token: write capabilities to satisfy cryptographic provenance auditing rules:

```yaml
name: Global Release Track

on:
  push:
    branches:
      - main

permissions:
  contents: write
  id-token: write  # 🔒 CRITICAL: Required for automated NPM package provenance signatures

jobs:
  publish-packages:
    runs-on: ubuntu-latest
    steps:
      - name: 📂 Checkout Repository Codebase
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: 🚀 Run Central Publish & Release Engine
        uses: ai-crew-suite/actions/publish-package@v1
        with:
          node-version: "22"
          npm-auth-token: ${{ secrets.NPM_TOKEN }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          slack-webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## Parameter Integration Matrix

Ensure your configuration mappings satisfy the required inputs:

* [ ] **`npm-auth-token`**: The access credential token needed to authenticate write passes against the target registry (Required).
* [ ] **`github-token`**: The administrative workflow context token needed to tag source histories and structure GitHub Releases.
* [ ] **`node-version`**: The designated Node.js compilation footprint (Default: "22").
* [ ] **`slack-webhook-url`**: Optional telemetry endpoint stream. If left blank, the bot will completely suppress slack alert signals.

## Compliance and Licensing

Copyright © 2026 The AI Crew Suite Authors.
Licensed under the **Apache License, Version 2.0**.
