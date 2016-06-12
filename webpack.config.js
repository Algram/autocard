module.exports = {
  entry: {
    dashboard: './public/javascripts/Dashboard'
  },
  output: {
    filename: './public/dist/script.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query:
          {
            presets:['es2015','react']
          }
      }
    ]
  }
};
