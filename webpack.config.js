const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { optimize: { LimitChunkCountPlugin } } = require('webpack');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  // Pin CDN URLs to the installed versions recorded in the lockfile.
  const cdn = (name, subpath = '', external = []) => {
    const version = require(`${name}/package.json`).version;
    const query = new URLSearchParams({ bundle: '', target: 'es2022' });
    if (external.length) query.set('external', external.join(','));
    if (!isProduction) query.set('dev', '');
    return `https://esm.sh/${name}@${version}${subpath}?${query}`;
  };
  const muiImports = {
    react: cdn('react'),
    'react/jsx-runtime': cdn('react', '/jsx-runtime', ['react']),
    'react/jsx-dev-runtime': cdn('react', '/jsx-dev-runtime', ['react']),
    'react-dom': cdn('react-dom', '', ['react']),
    'react-dom/client': cdn('react-dom', '/client', ['react', 'react-dom']),
    '@emotion/react': cdn('@emotion/react', '', ['react']),
    '@emotion/styled': cdn('@emotion/styled', '', ['react', '@emotion/react']),
    '@mui/material': cdn('@mui/material', '', ['react', 'react-dom', '@emotion/react', '@emotion/styled']),
  };

  return {
    target: ['web', 'es2022'],
    entry: path.join(__dirname, 'src/docs/index.jsx'),
    // Apply CDN imports only to the MUI entry and its dependency graph.
    externals: {
      byLayer: {
        mui: Object.fromEntries(Object.keys(muiImports).map((name) => [name, `import ${name}`])),
      },
    },
    output: {
      path: path.join(__dirname, 'docs'),
      filename: 'bundle.js',
      // Preserve the site's favicon while removing stale generated bundles.
      clean: { keep: /favicon\.ico$/ },
    },
    devtool: isProduction ? false : 'eval-cheap-module-source-map',
    module: {
      rules: [
        {
          include: path.join(__dirname, 'src/docs/examples/mui/main.jsx'),
          layer: 'mui',
        },
        {
          test: /\.(ts|tsx|js|jsx)$/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/env',
                ['@babel/react', {
                  development: !isProduction,
                  runtime: 'automatic',
                }],
                '@babel/preset-typescript',
              ],
              plugins: [
                '@babel/plugin-transform-object-rest-spread',
                '@babel/plugin-transform-class-properties',
              ],
            },
          },
          exclude: /node_modules/,
        },
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
          exclude: /node_modules/,
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'src/docs/index.html'), filename: 'index.html',
      }),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'src/docs/examples/example.html'), filename: 'default-ui.html',
        example: 'default-ui',
        title: 'Default UI', description: 'The bundled Quiz component, without custom hooks or a provider.',
      }),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'src/docs/examples/example.html'), filename: 'mui.html',
        example: 'mui',
        title: 'MUI', description: 'A custom Material UI interface powered by QuizProvider and useQuizContext.',
        importMap: { imports: muiImports },
      }),
      new MiniCssExtractPlugin({ filename: 'main.css' }),
      // Keep every demo module and the library's lazy stylesheet in one JS/CSS pair.
      new LimitChunkCountPlugin({ maxChunks: 1 }),
    ],
    optimization: {
      minimize: isProduction,
      // One shared bundle; the entry mounts only the example requested by the page.
      splitChunks: false,
      runtimeChunk: false,
      minimizer: [
        new TerserPlugin({
          extractComments: false,
        }),
        new CssMinimizerPlugin(),
      ],
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: { 'react-quiz-component$': path.join(__dirname, 'src/lib/index.ts') },
    },
    devServer: {
      static: {
        directory: path.join(__dirname, 'docs'),
      },
      compress: true,
      port: 8080,
    },
  };
};
