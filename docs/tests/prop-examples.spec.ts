import { expect, test, type Locator, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const prefix = '/react-quiz-component';

async function openExample(page: Page, name: string, start = true) {
  await page.goto(`${prefix}/examples/${name}/`);
  const demo = page.locator(`[data-example="${name}"]`);
  if (start) await demo.getByRole('button', { name: /^Start quiz$/i }).click();
  return demo;
}

async function finishSecondQuestion(demo: Locator) {
  await demo.getByRole('button', { name: 'createRoot', exact: true }).click();
  await demo.getByRole('button', { name: 'renderToString', exact: true }).click();
  await demo.getByRole('button', { name: 'Next', exact: true }).click();
}

test('examples sidebar groups collapse with keyboard and expand for the active page', async ({ page }, testInfo) => {
  await page.goto(`${prefix}/`);
  const sidebar = page.locator('#nd-sidebar');
  const examples = sidebar.getByRole('button', { name: 'Examples', exact: true });
  await expect(examples).toHaveAttribute('aria-expanded', 'false');
  await examples.focus();
  await page.keyboard.press('Enter');
  await expect(examples).toHaveAttribute('aria-expanded', 'true');
  for (const name of ['Basics', 'Media', 'Randomization', 'Feedback and navigation', 'Timing and completion', 'Results and callbacks', 'Headless']) {
    await expect(sidebar.getByRole('button', { name, exact: true })).toHaveAttribute('aria-expanded', 'false');
  }
  await sidebar.getByRole('button', { name: 'Headless', exact: true }).scrollIntoViewIfNeeded();
  await sidebar.screenshot({ path: testInfo.outputPath('example-groups.png'), animations: 'disabled' });
  const basics = sidebar.getByRole('button', { name: 'Basics', exact: true });
  await basics.focus();
  await page.keyboard.press('Space');
  await expect(basics).toHaveAttribute('aria-expanded', 'true');
  await sidebar.getByRole('link', { name: 'Immediate start', exact: true }).click();
  // Wait for client-side navigation so reload cannot return to the previous page.
  await expect(page).toHaveURL(`${prefix}/examples/immediate-start/`);
  await page.reload();
  await expect(examples).toHaveAttribute('aria-expanded', 'true');
  await expect(basics).toHaveAttribute('aria-expanded', 'true');
  await expect(sidebar.getByRole('link', { name: 'Immediate start', exact: true })).toHaveAttribute('data-active', 'true');
  await basics.focus();
  await page.keyboard.press('Enter');
  await expect(basics).toHaveAttribute('aria-expanded', 'false');
  await expect(sidebar.getByRole('link', { name: 'Immediate start', exact: true })).not.toBeVisible();
});

test('mobile sidebar navigates the grouped examples', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${prefix}/`);
  await page.getByRole('button', { name: 'Open Sidebar', exact: true }).click();
  const sidebar = page.locator('#nd-sidebar-mobile');
  await sidebar.getByRole('button', { name: 'Examples', exact: true }).click();
  await sidebar.getByRole('button', { name: 'Results and callbacks', exact: true }).click();
  await sidebar.getByRole('link', { name: 'Custom results', exact: true }).scrollIntoViewIfNeeded();
  await sidebar.screenshot({ path: testInfo.outputPath('example-groups-mobile.png'), animations: 'disabled' });
  await sidebar.getByRole('link', { name: 'Callback events', exact: true }).click();
  await expect(page.locator('h1')).toHaveText('Callback events');
  const demo = page.locator('[data-example="callbacks"]');
  await demo.getByRole('button', { name: /^Start quiz$/i }).click();
  await demo.getByRole('button', { name: 'useState', exact: true }).click();
  await expect(demo.getByRole('heading', { name: 'Submitted answers (1)' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('callbacks-mobile.png') });
});

test('every Quiz prop links to an example that actually uses it', async ({ page }) => {
  const types = await readFile('../src/lib/types.ts', 'utf8');
  const props = [...types.split('export interface QuizProps {')[1].split('\n}')[0].matchAll(/^  (\w+)\??:/gm)].map((match) => match[1]);
  await page.goto(`${prefix}/component/`);
  const table = page.locator('table').first();
  await expect(table.locator('tbody tr')).toHaveCount(props.length);
  for (const prop of props) {
    const link = table.getByRole('link', { name: prop, exact: true });
    const href = await link.getAttribute('href');
    expect(href).toMatch(new RegExp(`^${prefix}/examples/[a-z-]+/?$`));
    const slug = href!.split('/').filter(Boolean).at(-1)!;
    const source = await readFile(`components/examples/${slug}.tsx`, 'utf8');
    expect(source).toMatch(new RegExp(`\\b${prop}\\b`));
  }
});

test('immediate start skips the landing screen', async ({ page }) => {
  const demo = await openExample(page, 'immediate-start', false);
  await expect(demo.getByRole('button', { name: 'useState', exact: true })).toBeVisible();
  await expect(demo.getByRole('button', { name: /^Start quiz$/i })).toHaveCount(0);
  await demo.getByRole('button', { name: 'useState', exact: true }).click();
  await demo.getByRole('button', { name: 'Next', exact: true }).click();
  await finishSecondQuestion(demo);
  await expect(demo.getByText('You scored 30 out of 30.', { exact: true })).toBeVisible();
});

test('shuffled quizzes preserve scoring and restart as a fresh session', async ({ page }) => {
  const demo = await openExample(page, 'shuffled');
  for (let question = 0; question < 2; question++) {
    if (await demo.getByRole('button', { name: 'useState', exact: true }).count()) {
      await demo.getByRole('button', { name: 'useState', exact: true }).click();
    } else {
      await demo.getByRole('button', { name: 'createRoot', exact: true }).click();
      await demo.getByRole('button', { name: 'renderToString', exact: true }).click();
    }
    await demo.getByRole('button', { name: 'Next', exact: true }).click();
  }
  await expect(demo.getByText('You scored 30 out of 30.', { exact: true })).toBeVisible();
  await demo.getByRole('button', { name: 'Restart quiz' }).click();
  await demo.getByRole('button', { name: /^Start quiz$/i }).click();
  await expect(demo.locator('[aria-pressed="true"]')).toHaveCount(0);
  await expect(demo.locator('.question-count')).toHaveText('Question 1 / 2');
  await expect(demo.getByRole('button', { name: 'Next', exact: true })).toHaveCount(0);
});

test('immediate feedback shows messages and highlights unselected correct choices', async ({ page }) => {
  const demo = await openExample(page, 'immediate-feedback');
  await demo.getByRole('button', { name: 'useEffect', exact: true }).click();
  await expect(demo.locator('.alert.incorrect')).toContainText('useState is the hook for local state.');
  const correct = demo.getByRole('button', { name: 'useState', exact: true });
  await expect(correct).toHaveClass(/correct/);
  await expect(correct).toHaveAttribute('aria-pressed', 'false');
  await demo.getByRole('button', { name: 'Next', exact: true }).click();
  await demo.getByRole('button', { name: 'querySelector', exact: true }).click();
  await expect(demo.locator('.alert')).toHaveCount(0);
  await demo.getByRole('button', { name: 'createRoot', exact: true }).click();
  await expect(demo.locator('.alert.incorrect')).toBeVisible();
  await expect(demo.getByRole('button', { name: 'renderToString', exact: true })).toHaveClass(/correct/);
});

test('retry unlocks navigation without recovering first-attempt points', async ({ page }) => {
  const demo = await openExample(page, 'retry-until-correct');
  await demo.getByRole('button', { name: 'useEffect', exact: true }).click();
  await expect(demo.getByRole('button', { name: 'Next', exact: true })).toHaveCount(0);
  await demo.getByRole('button', { name: 'useState', exact: true }).click();
  await expect(demo.locator('.alert.correct')).toBeVisible();
  await demo.getByRole('button', { name: 'Next', exact: true }).click();
  await finishSecondQuestion(demo);
  await expect(demo.getByText('You scored 20 out of 30.', { exact: true })).toBeVisible();
});

test('deferred review edits answers and confirms complete submission', async ({ page }) => {
  const demo = await openExample(page, 'review-before-submitting');
  await demo.getByRole('button', { name: 'useEffect', exact: true }).click();
  await expect(demo.locator('.answer-btn.correct, .answer-btn.incorrect, .alert')).toHaveCount(0);
  await demo.getByRole('button', { name: 'Next', exact: true }).click();
  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('alert');
    expect(dialog.message()).toBe('Quiz is incomplete');
    await dialog.accept();
  });
  await demo.getByRole('button', { name: 'Next', exact: true }).click();
  await demo.getByRole('button', { name: 'Prev', exact: true }).click();
  await expect(demo.getByRole('button', { name: 'useEffect', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await demo.getByRole('button', { name: 'useState', exact: true }).click();
  await expect(demo.getByRole('button', { name: 'useEffect', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await demo.getByRole('button', { name: 'Next', exact: true }).click();
  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('confirm');
    await dialog.accept();
  });
  await finishSecondQuestion(demo);
  await expect(demo.getByText('You scored 30 out of 30.', { exact: true })).toBeVisible();
});

for (const name of ['quiz-timer', 'question-timer']) {
  test(`${name} pauses, resumes, and expires`, async ({ page }) => {
    await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
    const demo = await openExample(page, name);
    const timer = demo.locator(name === 'quiz-timer' ? '.quiz-timer b' : '.quiz-question-timer b');
    await page.clock.fastForward(1000);
    await demo.getByRole('button', { name: 'Pause', exact: true }).click();
    const remaining = await timer.textContent();
    await page.clock.fastForward(60_000);
    await expect(timer).toHaveText(remaining!);
    await expect(demo.getByRole('button', { name: 'useState', exact: true })).toHaveCount(0);
    await demo.getByRole('button', { name: 'Resume', exact: true }).click();
    await expect(demo.getByRole('button', { name: 'useState', exact: true })).toBeVisible();
    if (name === 'question-timer') {
      await page.clock.fastForward(15_000);
      await expect(demo.locator('.question-count')).toHaveText('Question 2 / 2');
      await page.clock.fastForward(15_000);
    } else {
      await page.clock.fastForward(60_000);
    }
    await expect(demo.getByText('You scored 0 out of 30.', { exact: true })).toBeVisible();
  });
}

test('early quit can be cancelled and confirmed while paused', async ({ page }) => {
  const demo = await openExample(page, 'submit-and-quit');
  await demo.getByRole('button', { name: 'useState', exact: true }).click();
  await demo.getByRole('button', { name: 'Pause', exact: true }).click();
  page.once('dialog', async (dialog) => { await dialog.dismiss(); });
  await demo.getByRole('button', { name: 'Submit and quit' }).click();
  await expect(demo.getByRole('button', { name: 'Resume', exact: true })).toBeVisible();
  page.once('dialog', async (dialog) => { await dialog.accept(); });
  await demo.getByRole('button', { name: 'Submit and quit' }).click();
  await expect(demo.getByText('You scored 10 out of 30.', { exact: true })).toBeVisible();
  await expect(demo.getByRole('button', { name: 'Resume', exact: true })).toHaveCount(0);
});

test('callbacks show payloads once without the default result page', async ({ page }) => {
  const demo = await openExample(page, 'callbacks');
  await demo.getByRole('button', { name: 'useState', exact: true }).click();
  await expect(demo.getByRole('heading', { name: 'Submitted answers (1)' })).toBeVisible();
  await demo.getByRole('button', { name: 'Next', exact: true }).click();
  await finishSecondQuestion(demo);
  const payloads = demo.getByRole('region', { name: 'Callback payloads' });
  const submissions = JSON.parse(await payloads.locator('pre').nth(0).innerText());
  expect(submissions.map(({ userAnswer, isCorrect }: { userAnswer: unknown; isCorrect: boolean }) => ({ userAnswer, isCorrect })))
    .toEqual([{ userAnswer: 1, isCorrect: true }, { userAnswer: [1, 2], isCorrect: true }]);
  const summary = JSON.parse(await payloads.locator('pre').nth(1).innerText());
  expect(summary).toMatchObject({ numberOfCorrectAnswers: 2, correctPoints: 30, totalPoints: 30 });
  await expect(demo.getByRole('heading', { name: 'Submitted answers (2)' })).toBeVisible();
  await expect(demo.locator('.result-overview')).toHaveCount(0);
});

test('custom result renderer replaces built-in results', async ({ page }) => {
  const demo = await openExample(page, 'custom-results');
  await demo.getByRole('button', { name: 'useState', exact: true }).click();
  await demo.getByRole('button', { name: 'Next', exact: true }).click();
  await finishSecondQuestion(demo);
  const results = demo.getByRole('region', { name: 'Custom quiz results' });
  await expect(results).toContainText('Score: 30 / 30');
  await expect(results).toContainText('Correct answers: 2 / 2');
  await expect(demo.locator('.result-overview')).toHaveCount(0);
});
