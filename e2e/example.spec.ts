import { test, expect } from '@playwright/test'

test('homepage loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Bodhi Chat/)
  await expect(page.getByTestId('app-title')).toBeVisible()
})
