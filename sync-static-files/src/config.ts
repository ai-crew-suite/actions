/**
 * Copyright 2026 The AI Crew Suite Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { getInput, setSecret } from '@actions/core';

export interface ActionConfig {
  sourcePath: string;
  token: string;
  labels: string[];
}

export function readConfig(): ActionConfig {
  const sourcePath = getInput('static_files_path', { required: true });
  const token = getInput('GH_PAT', { required: true });
  const labels = getInput('PR_LABELS') || 'sync';

  setSecret(token);

  return {
    sourcePath,
    token,
    labels: labels.split(/[\n,]/).map(label => label.trim()).filter(Boolean) };
}