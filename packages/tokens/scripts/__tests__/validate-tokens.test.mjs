import { describe, expect, it } from 'vitest';
import { getVariableBaselineReport } from '../version-baseline.mjs';

describe('validate-tokens baseline checks', () => {
  it('fails when a previously accepted variable is removed', () => {
    const report = getVariableBaselineReport(['--primary-500', '--spacing-m-base'], ['--primary-500', '--spacing-m-base', '--removed-token']);

    expect(report.passed).toBe(false);
    expect(report.removed).toEqual(['--removed-token']);
  });

  it('passes removed variables when the baseline is explicitly accepted', () => {
    const report = getVariableBaselineReport(['--primary-500', '--spacing-m-base'], ['--primary-500', '--spacing-m-base', '--removed-token'], { acceptBaseline: true });

    expect(report.passed).toBe(true);
    expect(report.removed).toEqual(['--removed-token']);
  });
});
