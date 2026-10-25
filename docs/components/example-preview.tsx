'use client';
import dynamic from 'next/dynamic';

const previews = {
  'all-questions': dynamic(() => import('./examples/all-questions'), { ssr: false }),
  default: dynamic(() => import('./examples/default'), { ssr: false }),
  hook: dynamic(() => import('./examples/hook'), { ssr: false }),
  provider: dynamic(() => import('./examples/provider'), { ssr: false }),
};

export function ExamplePreview({ name }: { name: keyof typeof previews }) {
  const Preview = previews[name];
  return <div className="not-prose example-preview" data-example={name}><Preview /></div>;
}
