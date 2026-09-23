# `@ai-crew-suite/actions/action-sync-static-files`

This action reads `sync.ts` from an infrastructure repository directory and opens one pull request per target repository for files under that directory's `src` folder.

## Overview

This GitHub Action serves as an automated platform alignment engineer within the organization. Built as an advanced compilation runner (node20), it parses a local synchronization matrix (`sync.ts`), dynamically maps files from a centralized source folder (`src`), and distributes upstream infrastructure updates across a multi-repository network by automatically provisioning and updating isolated maintenance branches.

## Core Responsibilities

- **Dynamic Matrix Parsing**: Inspects a designated structural `sync.ts` manifest file to evaluate target repositories, grouped distribution rules, and intentional file mapping pathways.
- **Upstream Asset Resolution**: Streams and isolated changes directly from the infrastructure directory's `src` folder to map source configurations to specific target destinations.
- **Automated Branch Governance**: Generates a reusable, dedicated `maintenance/<source-repository>` branch per target repository, maintaining state by executing updates via force-pushing and updating active Pull Requests.

## Architectural Dependency Tree

This action manages structural framework parity and code layout governance across the workspace network:

- **Upstream Engine**: Hooks into native GitHub runner parameters and leverages an elevated Personal Access Token (`GH_PAT`) to execute cross-repository read, write, commit, and Pull Request lifecycle tasks.
- **Downstream Consumer**: Executed directly inside verification pipelines (`.github/workflows/framework-sync.yml`) to automatically enforce universal file alignment across target downstream destinations.
- **Boundary Rule**: Always consume this action utilizing its verified, organization-relative subpath (`ai-crew-suite/actions/sync-static-files@v1`). Do not configure isolated or un-managed local file distribution templates.

## Local Development Workflow

### Installation & Distribution

This is a JavaScript-backed runtime action compiled using standard toolchain scripts. Verify underlying TypeScript source code layers, dependencies, and formatting before compiling code to `dist/index.js`:

```bash
yarn install --refresh
yarn turbo run build --filter=@ai-crew-suite/action-sync-static-files
```

### Testing Configuration Updates

To evaluate changes to the underlying file distribution engine or token matrix, target a single mock testing block within your local `sync.ts` architecture using an isolated test application repository before updating production release tags.

## Consumer Usage Checklist

To apply this automated sync auditing layer inside a framework repository layout, integrate the action block using this format:

### Configure the Action Target

Ensure your runner environment provides an explicit `GH_PAT` token and restricts executions to active workflow schedules or localized pipeline triggers:

```yaml
name: Framework Alignment Validation

on:
  workflow_dispatch:
  schedule:
    - cron: '0 0 * * 1' # Runs every Monday

permissions:
  contents: read

jobs:
  audit-alignment:
    runs-on: ubuntu-latest
    steps:
      - name: 📂 Checkout Repository Codebase
        uses: actions/checkout@v4

      - name: 🔍 Sync Static Infrastructure Files
        uses: ai-crew-suite/actions/sync-static-files@v1
        with:
          static_files_path: "infrastructure/shared-assets"
          GH_PAT: ${{ secrets.GLOBAL_INFRA_PAT }}
          PR_LABELS: "infrastructure, automated-sync"
```

## Parameter Integration Matrix

Ensure your environment states satisfy the required execution properties:

- **`GH_PAT` Provisioning**: Must be explicitly declared as a secret and map to a token possessing read and write scopes for all downstream target repositories and pull requests.
- **Matrix Schema Integrity**: The `sync.ts` architecture must default-export an object whose values are arrays containing `repos` (whitespace or newline-separated) and matching `files` layout arrays:

```typescript
export default {
  default: [
    {
      name: 'Common Files',
      repos: `
        ai-crew-suite/actions
        ai-crew-suite/infra
      `,
      files: [
        { source: 'templates/.gitignore', dest: '.gitignore' },
      ],
    },
  ],
};
```

- **Automated Code Delivery**: Sources are evaluated relative to the `src` folder. Downstream consumers will receive exactly one structured commit and a single, updatable Pull Request targeting a reusable branch layout.

Action Inputs Configuration

| Name | Required | Description |
| --- | --- | --- |
| `static_files_path` | **Yes**  | Directory containing the infrastructure `src/` and its tracking `sync.ts`. |
| `GH_PAT` | **Yes** | Privileged Token that can read and write the target repositories and pull requests. |
| `PR_LABELS` | No | Comma- or newline-separated pull request labels. Defaults to `sync`. |

## Compliance and Licensing

Copyright © 2026 The AI Crew Suite Authors.
Licensed under the **Apache License, Version 2.0**.
