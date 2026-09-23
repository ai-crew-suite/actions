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
  return { sourcePath, token, labels: labels.split(/[\n,]/).map(label => label.trim()).filter(Boolean) };
}