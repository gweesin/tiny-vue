import { test, expect } from '@playwright/test'

test('自动加载数据', async ({ page }) => {
  page.on('pageerror', (exception) => expect(exception).toBeNull())
  await page.goto('grid-data-source#data-source-auto-load')
  // 判断 auto-load 为 false 时不加载数据
  await page.getByRole('paragraph').nth(1).click()
  const demo = page.locator('#data-source-auto-load')
  await expect(demo.getByText('暂无数据')).toHaveText('暂无数据')
})
