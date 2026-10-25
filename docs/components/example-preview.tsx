'use client';
import dynamic from 'next/dynamic';

const previews = {
  'immediate-start': dynamic(() => import('./examples/immediate-start'), { ssr: false }),
  'immediate-feedback': dynamic(() => import('./examples/immediate-feedback'), { ssr: false }),
  'retry-until-correct': dynamic(() => import('./examples/retry-until-correct'), { ssr: false }),
  'review-before-submitting': dynamic(() => import('./examples/review-before-submitting'), { ssr: false }),
  'quiz-timer': dynamic(() => import('./examples/quiz-timer'), { ssr: false }),
  'question-timer': dynamic(() => import('./examples/question-timer'), { ssr: false }),
  'submit-and-quit': dynamic(() => import('./examples/submit-and-quit'), { ssr: false }),
  'shuffled': dynamic(() => import('./examples/shuffled'), { ssr: false }),
  'callbacks': dynamic(() => import('./examples/callbacks'), { ssr: false }),
  'custom-results': dynamic(() => import('./examples/custom-results'), { ssr: false }),
  'all-questions': dynamic(() => import('./examples/all-questions'), { ssr: false }),
  default: dynamic(() => import('./examples/default'), { ssr: false }),
  hook: dynamic(() => import('./examples/hook'), { ssr: false }),
  provider: dynamic(() => import('./examples/provider'), { ssr: false }),
};

export function ExamplePreview({ name }: { name: keyof typeof previews }) {
  const Preview = previews[name];
  return <div className="not-prose example-preview" data-example={name}><Preview /></div>;
}
