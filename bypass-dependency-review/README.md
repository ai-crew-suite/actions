# `@ai-crew-suite/actions/bypass-dependency-review`

Centralized auditing, tracking, and job-summary logging engine for emergency security gate exemptions across the AI Crew Suite platform.

## Overview

This GitHub Action acts as a structural tracking marker across organization repositories. Built as an immutable composite script, it intercepts workflow routes when an emergency patch (hotfix/*) bypasses standard dependency validation queues, generating persistent audit logs right inside the GitHub Actions execution layout to keep operations transparent.

## Core Responsibilities

* **Audit Log Generation**: Appends a highly visible, immutable warning block onto the runner console stream to declare active policy variations.
* **Workflow Summary Injection**: Modifies native environment parameters ($GITHUB_STEP_SUMMARY) to pin persistent compliance tracking summaries onto the GitHub execution panel.
* **Context Tracking**: Dynamically captures security execution parameters including actor handles (github.actor), repository context keys, and ISO timestamp ranges.

## Architectural Dependency Tree

This action manages security compliance and auditing transparency windows across the organization workspace network:

* **Upstream Engine**: Relies directly on native core variables and terminal streams exposed by the runner platform environment.
* **Downstream Consumer**: Executed directly inside pull request initialization gates or branch evaluation routines (.github/workflows/dependency-review.yml) when a emergency hotfix/* route is activated.
* **Boundary Rule**: Always consume this action utilizing its verified, organization-relative subpath (ai-crew-suite/actions/dependency-review-bypass@v1). Do not build localized or undocumented bypass scripts inside application repositories.

## Local Development Workflow

### Installation & Tracking

This is an administrative tracking script mapping execution markers. Verify output parameters and string formatting tracks right within its execution scope:

```bash
yarn install --refresh
yarn turbo run lint --filter=@ai-crew-suite/action-bypass-dependency-review
```

### Testing Configuration Updates

To evaluate changes to the Markdown text formats or tracking metrics, run validation arrays manually against a test repository before pushing updates to the primary organization release track.

## Consumer Usage Checklist

To apply this tracking layer inside a secure continuous integration layout, integrate the action block using this conditional structure:

### Configure the Action Target

Ensure your runner environment triggers this logging pass as an explicit fallback when a hotfix branch deliberately skips standard compliance blocks:

```yaml
name: Dependency Review Validation

on:
  pull_request:
    branches: [main]

jobs:
  dependency-review:
    runs-on: ubuntu-latest
    steps:
      - name: 📂 Checkout Repository
        uses: actions/checkout@v4

      - name: 🔎 Run Standard Dependency Review Scan
        if: ${{ !startsWith(github.head_ref, 'hotfix/') }}
        uses: ai-crew-suite/actions/run-dependency-review@v4

      - name: ⚠️ Log Security Compliance Exemption
        if: ${{ startsWith(github.head_ref, 'hotfix/') }}
        uses: ai-crew-suite/actions/bypass-dependency-review@v1
```

## Parameter Integration Matrix

Ensure your configuration mappings satisfy the required inputs:

* [ ] **Condition Alignment**: Ensure the step is strictly guarded with an automated branch matcher logic expression (startsWith(github.head_ref, 'hotfix/')).
* [ ] **Job Summary Output**: Bypassed executions will instantly write an un-editable accountability report containing the trigger actor and a precise UTC timestamp directly onto the GitHub actions overview panel.

## Compliance and Licensing

Copyright © 2026 The AI Crew Suite Authors.
Licensed under the **Apache License, Version 2.0**.
