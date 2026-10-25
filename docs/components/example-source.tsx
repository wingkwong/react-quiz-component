import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ServerCodeBlock } from 'fumadocs-ui/components/codeblock.rsc';

const files = {
  'immediate-start': 'immediate-start.tsx',
  'immediate-feedback': 'immediate-feedback.tsx',
  'retry-until-correct': 'retry-until-correct.tsx',
  'review-before-submitting': 'review-before-submitting.tsx',
  'quiz-timer': 'quiz-timer.tsx',
  'question-timer': 'question-timer.tsx',
  'submit-and-quit': 'submit-and-quit.tsx',
  'shuffled': 'shuffled.tsx',
  'callbacks': 'callbacks.tsx',
  'custom-results': 'custom-results.tsx',
  'all-questions': 'all-questions.tsx',
  default: 'default.tsx', hook: 'hook.tsx', provider: 'provider.tsx',
  quiz: 'quiz.ts',
  styles: 'examples.css',
} as const;

export async function ExampleSource({ name }: { name: keyof typeof files }) {
  const file = files[name];
  const code = await readFile(path.join(process.cwd(), 'components/examples', file), 'utf8');
  return <ServerCodeBlock code={code} lang={file.endsWith('.css') ? 'css' : 'tsx'} codeblock={{ title: file }} />;
}
