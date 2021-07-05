const path = require('path');

const buildPath = path.resolve(__dirname, './dist');

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  entry: {
    'fast_blur_cpu': './src/demos/fastBlurCpu.ts',
    'sample_summing_cpu': './src/demos/sampleSummingCpu.ts',
    'triangle_average_cpu': './src/demos/triangleAverageCpu.ts',
    'triangle_fitting_cpu': './src/demos/triangleFittingCpu.ts',
    'generator': './src/demos/generator.ts',
    'fast_blur_webgl': './src/demos/fastBlurWebgl.ts'
  },
  output: {
    filename: '[name].js',
    path: buildPath
  },
  module: {
    rules: [
      {
        test: /\.(frag|vert)/,
        type: 'asset/source'
      },
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
