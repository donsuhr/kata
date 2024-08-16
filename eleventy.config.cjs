const { minify } = require('html-minifier-terser');

module.exports = function (eleventyConfig) {
  eleventyConfig.addTransform('htmlmin', async (content, outputPath) => {
    if (process.env.NODE_ENV === 'production') {
      if (outputPath.endsWith('.html')) {
        return minify(content, {
          removeAttributeQuotes: true,
          collapseWhitespace: true,
          removeComments: true,
          useShortDoctype: true,
        });
      }
    }

    return content;
  });

  eleventyConfig.setServerOptions({
    domDiff: false,
    watch: ['dist/**/*.css', 'dist/**/*.js'],
  });

  return {
    dir: {
      input: 'src',
      output: 'dist/kata',
    },
  };
};
