import { fileURLToPath } from 'node:url';
import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();
const basePath = process.env.NODE_ENV === 'production' ? '/react-quiz-component' : '';

export default withMDX({
  output: 'export',
  turbopack: { root: fileURLToPath(new URL('..', import.meta.url)) },
  trailingSlash: true,
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  images: { unoptimized: true },
  transpilePackages: ['react-quiz-component'],
  reactStrictMode: true,
});
