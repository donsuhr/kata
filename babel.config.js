const presets = [
  [
    '@babel/preset-env',
    {
      modules: false,
    },
  ],
  '@babel/preset-react',
  '@babel/preset-typescript',
];

const plugins = [];

module.exports = (api) => {
  if (api) {
    api.cache(true);
    // api.debug = true;
  }

  return {
    presets,
    plugins,
  };
};
