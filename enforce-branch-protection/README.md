# `@ai-crew-suite/actions/enforce-branch-protection`

Centralized enforcement engine validating branch naming conventions and Pull Request target alignments across the AI Crew Suite platform.

## Overview

This GitHub Action acts as a pre-flight compliance gate for all code repositories within the organization. Built as a secure composite script, it programmatically scans incoming branches to reject unstructured names, aligns work taxonomies with automated release pipelines, and audits Pull Request targets to minimize accidental branch merges.

## Core Responsibilities

* **Taxonomy Enforcement**: Standardizes git history by validating branch prefixes (e.g., feature/, bugfix/) using strict lowercase alphanumeric and hyphen constraints.
* **Automated Dependency Whitelisting**: Natively supports and bypasses restriction tracks for machine-generated branches from dependabot.
* **Target Verification**: Evaluates Pull Request destinations to ensure code changes explicitly and intentionally target the primary trunk line.

## Architectural Dependency Tree

This action anchors quality governance checkpoints across the organization workspace network:

* **Upstream Engine**: Evaluates runtime parameters exposed by the native GitHub Actions environment (github.head_ref, github.base_ref).
* **Downstream Consumer**: Executed directly inside the pre-merge or Pull Request initialization pipelines (.github/workflows/pr-validation.yml) of every code repository in the org.
* **Boundary Rule**: Always consume this action utilizing its verified, organization-relative subpath (ai-crew-suite/actions/branch-protection@v1). Do not split validation logic into separate un-audited repository local files.

## Local Development Workflow

### Installation & Distribution

This is a composite script tracking active runtime properties. Verify input parameters and regex structures right within its execution scope:

```bash
yarn install --refresh
yarn turbo run lint --filter=@ai-crew-suite/enforce-branch-protection
```

### Testing Configuration Updates

To test additions to the branch prefix regex, run validation arrays manually against mock environment strings inside a separate branch block before cutting a global organization release tag.

## Consumer Usage Checklist

To apply this compliance layer inside an independent repository workspace, structure your orchestration file (e.g., .github/workflows/pr-gate.yml) using this format:

### Configure the Action Target

Ensure your runner profile initializes this check on pull_request execution hooks:

```yaml
name: Validate Pull Request Requirements

on:
  pull_request:
    types: [opened, edited, synchronize]

permissions:
  contents: read

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: 🏷️ Run Centralized Protection Gate
        uses: ai-crew-suite/actions/enforce-branch-protection@v1
        with:
          head-ref: ${{ github.head_ref }}
          base-ref: ${{ github.base_ref }}
```

## Parameter Integration Matrix

Ensure your configuration mappings satisfy the required inputs:

* [ ] **`head-ref`**: The source branch name being evaluated. Must adhere to strict human types (bugfix, hotfix, feature, infrastructure, maintenance, content) or dependabot/.
* [ ] **`base-ref`**: The target merge branch name. Warns developers programmatically if the Pull Request points away from the main trunk branch.

## Compliance and Licensing

Copyright © 2026 The AI Crew Suite Authors.
Licensed under the **Apache License, Version 2.0**.
