import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ServerCodeBlock } from 'fumadocs-ui/components/codeblock.rsc';

const files = {
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
