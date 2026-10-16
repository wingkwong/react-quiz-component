import { expect, test } from '@playwright/test';
import { readdir } from 'node:fs/promises';

const prefix = '/react-quiz-component';

for (const name of ['default', 'hook', 'provider']) {
  test(`${name} quiz completes`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`${prefix}/examples/${name}/`);
    const demo = page.locator('[data-example]');
    await expect(demo.getByRole('button', { name: /^Start quiz$/i })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('preview.png') });
    await demo.getByRole('button', { name: /^Start quiz$/i }).click();
    if (name === 'provider') {
      await demo.getByRole('button', { name: 'Pause timer' }).click();
      await expect(demo.getByRole('status')).toHaveText('Quiz paused.');
      await demo.getByRole('button', { name: 'Resume timer' }).click();
    }
    await demo.getByRole('button', { name: 'useState', exact: true }).click();
    await demo.getByRole('button', { name: name === 'default' ? 'Next' : 'Next question', exact: true }).click();
    await demo.getByRole('button', { name: 'createRoot', exact: true }).click();
    await demo.getByRole('button', { name: 'renderToString', exact: true }).click();
    if (name === 'provider') {
      await demo.getByRole('button', { name: 'Previous question' }).click();
      await expect(demo.getByRole('button', { name: 'useState', exact: true })).toHaveAttribute('aria-pressed', 'true');
      await demo.getByRole('button', { name: 'Next question' }).click();
    }
    await demo.getByRole('button', { name: name === 'default' ? 'Next' : 'Finish quiz', exact: true }).click();
    await expect(demo.getByText(name === 'default' ? 'You scored 30 out of 30.' : 'Score: 30 / 30', { exact: true })).toBeVisible();
    if (name === 'default') {
      const filter = demo.locator('.filter-dropdown-select');
      await filter.focus();
      await page.keyboard.press('Enter');
      await expect(demo.getByRole('menuitemradio', { name: 'All', exact: true })).toBeFocused();
      await page.keyboard.press('ArrowDown');
      await expect(demo.getByRole('menuitemradio', { name: 'Correct', exact: true })).toBeFocused();
      await page.keyboard.press('Space');
      await expect(filter).toHaveText('Correct');
      await expect(filter).toBeFocused();
      await page.keyboard.press('ArrowUp');
      await expect(demo.getByRole('menuitemradio', { name: 'Unanswered', exact: true })).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(filter).toBeFocused();
      await page.keyboard.press('Enter');
      await page.keyboard.press('Tab');
      await expect(demo.getByRole('menu')).toHaveCount(0);
    }
    if (name === 'provider') {
      await demo.getByLabel('Filter results').selectOption('incorrect');
      await expect(demo.locator('li')).toHaveCount(0);
    }
    await expect(page.locator('figure').filter({ hasText: 'quiz.ts' }).first()).toContainText('React essentials');
    expect(errors).toEqual([]);
  });
}

test('every exported page and its internal URLs work under the Pages prefix', async ({ page, request }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  const files = await readdir('out', { recursive: true });
  const pages = files.filter((file) => file.endsWith('index.html') && !file.startsWith('_next/'));
  const links = new Set<string>();
  for (const file of pages) {
    const route = `${prefix}/${file.slice(0, -'index.html'.length)}`;
    expect((await page.goto(route))?.status()).toBe(200);
    await expect(page.locator('h1').first()).toBeVisible();
    const urls = await page.locator('a[href], img[src], script[src], link[rel="stylesheet"]').evaluateAll((elements) => elements.map((element) => element.getAttribute('href') ?? element.getAttribute('src') ?? ''));
    for (const url of urls) if (url.startsWith('/')) links.add(url.split('#')[0]);
  }
  for (const url of links) {
    expect(url).toMatch(/^\/react-quiz-component(?:\/|$)/);
    expect((await request.get(url)).status(), url).toBe(200);
  }
  expect(errors).toEqual([]);
});

test('static search navigates to a result and nested pages refresh', async ({ page }) => {
  await page.goto(`${prefix}/`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Introduction');
  await page.getByRole('button', { name: /Search/i }).first().click();
  const input = page.getByRole('dialog').getByRole('combobox');
  await input.fill('continueTillCorrect');
  const result = page.getByRole('dialog').getByRole('option').first();
  await expect(result).toBeVisible();
  await result.click();
  await expect(page).toHaveURL(new RegExp(`${prefix}/headless-options/`));
  await page.reload();
  await expect(page.locator('h1').first()).toBeVisible();
});

test('mobile navigation and theme switching', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${prefix}/examples/hook/`);
  await expect(page.locator('h1')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('mobile.png') });
  await page.getByRole('button', { name: /menu|sidebar/i }).first().click();
  await expect(page.getByRole('link', { name: 'Quick start', exact: true }).last()).toBeVisible();
  await page.getByRole('link', { name: 'Quick start', exact: true }).last().click();
  await expect(page.locator('h1')).toHaveText('Quick start');
  await page.setViewportSize({ width: 1280, height: 900 });
  const theme = page.getByRole('button', { name: /theme/i }).first();
  await expect(theme).toBeVisible();
  await page.addStyleTag({ content: '::view-transition-old(root), ::view-transition-new(root) { animation: none !important; }' });
  await theme.click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath('dark.png'), animations: 'disabled' });
  await theme.click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe('BODY');
});
