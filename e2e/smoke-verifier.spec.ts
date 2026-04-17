import { expect, test } from '@playwright/test';

test('contract verifier panel reports pass', async ({ page }) => {
  await page.goto('/');

  const panel = page.locator('[data-verifier-panel]');
  await expect(panel).toBeVisible();
  await expect(panel).toHaveAttribute('data-verifier-status', 'pass');
});
