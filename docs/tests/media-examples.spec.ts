import { expect, test } from '@playwright/test';

const prefix = '/react-quiz-component';

test('question images and photo answers load and score correctly', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${prefix}/examples/photos/`);
  await expect(page.locator('#nd-sidebar').getByRole('button', { name: 'Media', exact: true })).toHaveAttribute('aria-expanded', 'true');
  const demo = page.locator('[data-example="photos"]');
  await demo.getByRole('button', { name: /^Start quiz$/i }).click();
  const questionImage = demo.getByRole('img', { name: 'A purple square' });
  await expect(questionImage).toBeVisible();
  await expect(questionImage).toHaveAttribute('src', `${prefix}/images/square.svg`);
  await demo.getByRole('button', { name: 'Square', exact: true }).click();
  await demo.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(demo.getByRole('button', { name: 'Purple square', exact: true })).toBeVisible();
  await demo.getByRole('button', { name: 'Blue circle', exact: true }).click();
  await demo.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(demo.getByText('You scored 20 out of 20.', { exact: true })).toBeVisible();
  await expect(demo.getByRole('img')).toHaveCount(3);
  await expect.poll(() => demo.locator('img').evaluateAll((images) => images.every((img) => img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0))).toBe(true);
  await expect(page.locator('figure').filter({ hasText: 'photos.tsx' })).toContainText('answerAltTexts');
  expect(errors).toEqual([]);
});

test('audio clip plays with a transcript and appears in result review', async ({ page, request }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${prefix}/examples/audio/`);
  const demo = page.locator('[data-example="audio"]');
  await demo.getByRole('button', { name: /^Start quiz$/i }).click();
  const player = demo.getByLabel('Listen to the tone sequence');
  await expect(player).toHaveAttribute('src', `${prefix}/audio/two-tones.wav`);
  await expect(player).toHaveAttribute('controls', '');
  await expect(player).toHaveAttribute('preload', 'none');
  await expect(player).not.toHaveAttribute('autoplay');
  await expect(player).toHaveAccessibleDescription('Two short tones of the same pitch, separated by silence.');
  const response = await request.get(`${prefix}/audio/two-tones.wav`);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toBe('audio/wav');
  const playback = await player.evaluate(async (element) => {
    const audio = element as HTMLAudioElement;
    await audio.play();
    const result = { playing: !audio.paused, duration: audio.duration };
    audio.pause();
    return result;
  });
  expect(playback.playing).toBe(true);
  expect(playback.duration).toBeCloseTo(1.5, 1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await demo.screenshot({ path: testInfo.outputPath('audio-mobile.png') });
  await demo.getByRole('button', { name: 'Two tones', exact: true }).click();
  await demo.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(demo.getByText('You scored 10 out of 10.', { exact: true })).toBeVisible();
  await expect(player).toHaveCount(1);
  await expect(player).toHaveJSProperty('paused', true);
  await expect(page.locator('figure').filter({ hasText: 'audio.tsx' })).toContainText('questionAudioTranscript');
  expect(errors).toEqual([]);
});
