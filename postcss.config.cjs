const autoprefixer = require('autoprefixer');
// const inlineSvg = require('postcss-inline-svg');
// const cssnano = require('cssnano');
// const { argv } = require('yargs');

const plugins = [
  // inlineSvg({ paths: ['./app/sprite-src-svg', './app', './node_modules/cmc-site/app'] }),
  autoprefixer({ grid: 'autoplace', remove: false }),
];

// if (argv.minify) {
// plugins.push(cssnano());
// }

module.exports = {
  plugins,
};
