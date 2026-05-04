import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const config = [
  {
    ignores: [
      'public/sw.js',
      'public/swe-worker-*.js',
      'public/workbox-*.js',
      'namtanfilm-fansite.jsx',
    ],
  },
  ...nextVitals,
  ...nextTypescript,
];

export default config;
