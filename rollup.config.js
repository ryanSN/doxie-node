import pkg from './package.json';
import fs from 'fs';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import fileSize from 'rollup-plugin-filesize';

const env = process.env.NODE_ENV;
const license = fs.readFileSync('LICENSE', 'utf8');

export default [
  {
    plugins: [commonjs(), nodeResolve(), fileSize()],
    external: ['axios', 'retry'],
    input: 'lib/index.js',
    output: [
      {
        file: {
          es: pkg.module,
          cjs: pkg.main
        }[env],
        format: env,
        banner: `/*!\n ${license} */`
      }
    ]
  }
];
