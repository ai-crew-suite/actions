# `@ai-crew-suite/actions/bypass-playwright-tests`

Centralized logging, transparency auditing, and job-summary tracking engine for emergency Playwright end-to-end testing exemptions across the AI Crew Suite platform.

## Overview

This GitHub Action serves as an operational tracking mechanism across organization repositories. Built as an immutable composite script, it intercepts workflow tracks when an emergency patch (hotfix/*) deliberately skips end-to-end browser regression passes, generating persistent audit logs within the GitHub UI to ensure full operational compliance and visibility.

## Core Responsibilities

* **Job Summary Injection**: Dynamically updates the native pipeline summary interface ($GITHUB_STEP_SUMMARY) to record active testing exemptions.
* **Accountability Logging**: Captures key runtime attributes including the target project registry data, branch tags, and the triggering team member handle (github.actor).
* **Emergency Audit Mapping**: Establishes a permanent, verifiable trace inside pull request pipelines explaining why automated user-interface validation runs were bypassed.

## Architectural Dependency Tree

This action manages testing compliance and auditing windows across the organization workspace network:

* **Upstream Engine**: Relies directly on native environment variable paths and Markdown stream layers provided by the core runner host.
* **Downstream Consumer**: Executed directly inside continuous integration pipelines (.github/workflows/ci.yml) as an explicit fallback when an emergency hotfix/* branch is pushed or updated.
* **Boundary Rule**: Always consume this action utilizing its verified, organization-relative subpath (ai-crew-suite/actions/playwright-bypass@v1). Do not create loose, un-audited local skip parameters.

## Local Development Workflow

### Installation & Tracking

This is an administrative logging script mapping execution variables. Verify output metrics and visual string formatting right within its execution scope:

```bash
yarn install --refresh
yarn turbo run lint --filter=@ai-crew-suite/action-bypass-playwright-tests
```

### Testing Configuration Updates

To evaluate updates to the summary output layout or descriptive copy text, run validation checks against an isolated testing repository before publishing new tags to the global platform release track.

## Consumer Usage Checklist

To apply this tracking layer inside your unified continuous integration pipeline, couple the runner step alongside your core Playwright testing blocks using this conditional structure:

### Configure the Action Target

Ensure your runner environment schedules this logging block as a deliberate fallback step whenever an emergency branch intentionally circumvents standard E2E browser tests:

```yaml
name: Continuous Integration Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  e2e-testing:
    runs-on: ubuntu-latest
    steps:
      - name: 📂 Checkout Repository Codebase
        uses: actions/checkout@v4

      - name: 🚀 Run Playwright End-to-End Tests
        if: ${{ !startsWith(github.head_ref, 'hotfix/') }}
        uses: ai-crew-suite/actions/run-playwright-tests@v1

      - name: 🪵 Generate Visual E2E Skip Summary
        if: ${{ startsWith(github.head_ref, 'hotfix/') }}
        uses: ai-crew-suite/actions/bypass-playwright-tests@v1
```

## Parameter Integration Matrix

Ensure your configuration mappings satisfy the required inputs:

* [ ] **Condition Alignment**: Guard the execution pass using an automated string matcher validation block (startsWith(github.head_ref, 'hotfix/')).
* [ ] **Accountability Tracking**: Bypassed pipeline runs will instantly publish an un-editable warning card containing the trigger actor directly onto the GitHub actions summary tab.

## Compliance and Licensing

Copyright © 2026 The AI Crew Suite Authors.
Licensed under the **Apache License, Version 2.0**.
