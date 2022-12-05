const { minify } = require('html-minifier-terser');

module.exports = function (eleventyConfig) {
  eleventyConfig.setBrowserSyncConfig({
    // directory: true,
    // index: 'index.html',
    files: '_site',
    // logLevel: 'debug',
  });

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
};
