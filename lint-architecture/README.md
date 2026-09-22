# `@ai-crew-suite/actions/lint-architecture`

Centralized architecture gatekeeper enforcing formal monorepo path topologies, package directory structural mappings, and organization-scoped naming conventions across the AI Crew Suite platform.

## Overview

This GitHub Action acts as a strict structural alignment layer for all monorepo layouts within the organization. Built as an advanced compilation runner (node20), it recursively scans internal workspace locations (/plugins/) and programmatically enforces rigorous directory-to-name routing templates to prevent chaotic directory setups, structural erosion, or namespace conflicts.

## Core Responsibilities

* **Directory-to-Name Mapping**: Evaluates deep directory path arrays to guarantee package scopes exactly reflect their physical boundaries (e.g., matching tools to tool-<domain>-<provider>).
* **Workspace Boundary Guarding**: Verifies file absolute locations natively to isolate workspace checks from escaping active runtime environments.
* **Unified Name Validation**: Isolates incorrect naming configurations and alerts developers with descriptive errors contrasting the actual workspace entry against structural layout expectations.

## Architectural Dependency Tree

This action anchors quality governance checkpoints across the organization workspace network:

* **Upstream Engine**: Relies directly on native, compiled node file systems and boundary mapping logic frameworks.
* **Downstream Consumer**: Executed directly inside continuous integration pipelines (.github/workflows/ci.yml) on every open Pull Request context and primary push event across the org.
* **Boundary Rule**: Always consume this action utilizing its verified, organization-relative subpath (ai-crew-suite/actions/lint-architecture@v1). Do not create or track decentralized directory checking utilities.

## Local Development Workflow

### Installation & Distribution

This is a JavaScript-backed runtime action compiled using standard toolchain scripts. Verify underlying TypeScript source code layers, path segments, and schemas before compiling code to dist/index.js:

```bash
yarn install --refresh
yarn turbo run build --filter=@ai-crew-suite/action-lint-architecture
```

### Running Verification Tracks

```bash
yarn turbo run lint --filter=@ai-crew-suite/action-lint-architecture
```

## Consumer Usage Checklist

To apply this architecture tracking gate inside an independent framework repository layout, integrate the action block using this format:

### Configure the Action Target

Ensure your execution block initializes this check from the root of a turborepo workspace structure:

```yaml
name: Continuous Integration

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  verify-architecture:
    runs-on: ubuntu-latest
    steps:
      - name: 📂 Checkout Repository Codebase
        uses: actions/checkout@v4

      - name: 📐 Validate Monorepo Architecture
        uses: ai-crew-suite/actions/lint-architecture@v1
```

## Layout Structure Alignment Matrix

The engine maps packages inside the /plugins/ structure according to these immutable organizational tiers:

* [ ] **Core Components (plugins/core/*)**: Maps out root extensions and foundational infrastructure blocks.
* [ ] **Domain Agents (plugins/agents/*)**: Validates domain-specific runtime interfaces and user-interface frontends.
* [ ] **Infrastructure Tools (plugins/tools/*)**: Maps service integrations to strict tool-<domain>-<provider> naming matrices.

## Compliance and Licensing

Copyright © 2026 The AI Crew Suite Authors.
Licensed under the **Apache License, Version 2.0**.
