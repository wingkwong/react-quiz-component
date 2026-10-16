import React from 'react';
import { act, render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import Quiz from '../src/lib';
import { rawMarkup } from '../src/lib/core-components/helpers';
import { singleQuiz } from './fixtures';

describe('question Markdown', () => {
  it.each([
    '[click](javascript:alert%281%29)',
    '[click](data:text/html,hello)',
    '<a href="jav&#x61;script:alert(1)">click</a>',
    '<img src="x" onerror="alert(1)"><script>alert(1)</script>',
    '<svg onload="alert(1)"><a href="javascript:alert(1)">click</a></svg>',
  ])('removes unsafe generated markup: %s', (question) => {
    const { container } = render(<Quiz disableSynopsis quiz={{ ...singleQuiz,
      questions: [{ ...singleQuiz.questions[0], question }] }} />);
    expect(container.querySelector('script, svg, [onerror], [onload]')).toBeNull();
    for (const link of container.querySelectorAll('a')) {
      expect(link.getAttribute('href') ?? '').not.toMatch(/^(javascript|data):/i);
    }
  });

  it('preserves Markdown formatting, safe links, images, and code', () => {
    const { __html } = rawMarkup('**bold** [docs](https://example.com) ![Circle](/circle.png) `a < b`');
    const container = document.createElement('div');
    container.innerHTML = __html;
    expect(container.querySelector('strong')?.textContent).toBe('bold');
    expect(container.querySelector('a')?.getAttribute('href')).toBe('https://example.com');
    expect(container.querySelector('img')?.alt).toBe('Circle');
    expect(container.querySelector('code')?.textContent).toBe('a < b');
  });

  it('hydrates an auto-started quiz without changing its Markdown', async () => {
    const source = { ...singleQuiz, questions: [{ ...singleQuiz.questions[0], question: '**Safe** [link](javascript:alert%281%29)' }] };
    const element = <Quiz quiz={source} disableSynopsis />;
    const container = document.createElement('div');
    container.innerHTML = renderToString(element);
    document.body.append(container);
    const onRecoverableError = vi.fn();
    let root: ReturnType<typeof hydrateRoot>;
    await act(async () => { root = hydrateRoot(container, element, { onRecoverableError }); });
    expect(container.querySelector('strong')?.textContent).toBe('Safe');
    expect(container.querySelector('a')?.hasAttribute('href')).toBe(false);
    expect(onRecoverableError).not.toHaveBeenCalled();
    act(() => root.unmount());
    container.remove();
  });
});
