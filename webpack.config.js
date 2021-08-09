const path = require('path');

const buildPath = path.resolve(__dirname, './dist');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  entry: {
    'fast_blur_cpu': {
      import: './src/demos/fastBlurCpu.ts',
      dependOn: 'shared'
    },
    'sample_summing_cpu': {
      import: './src/demos/sampleSummingCpu.ts',
      dependOn: 'shared'
    },
    'triangle_average_cpu': {
      import: './src/demos/triangleAverageCpu.ts',
      dependOn: 'shared'
    },
    'triangle_fitting_cpu': {
      import: './src/demos/triangleFittingCpu.ts',
      dependOn: 'shared'
    },
    'generator': {
      import: './src/demos/generator.ts',
      dependOn: 'shared'
    },
    'fast_blur_webgl': {
      import: './src/demos/fastBlurWebgl.ts',
      dependOn: 'shared'
    },
    'generator_webgl': {
      import: './src/demos/generatorWebgl.ts',
      dependOn: 'shared'
    },
    shared: ['gl-matrix'],
  },
  output: {
    filename: '[name].js',
    path: buildPath
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js', '.html' ]
  },
  devServer: {
    contentBase: buildPath,
    injectClient: false,
    injectHot: false,
    liveReload: false,
    hot: false
  }
};
