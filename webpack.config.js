const fs = require('fs-extra');
const path = require('path');
const webpack = require('webpack');
// const HtmlWebPackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractSass = new ExtractTextPlugin('[name].min.css');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
var BrowserSyncPlugin = require('browser-sync-webpack-plugin');
var apps = ['app-a', 'app-b', 'app-c'];
var COPY_ARRAY = [];

const IS_DEV = process.env.NODE_ENV === 'dev';

const config = {
  entry: {},
  devtool: IS_DEV ? 'eval' : 'source-map'
};

COPY_ARRAY.push({
  from: path.resolve('./src/index.html'),
  to: path.resolve('./dist/index.html')
});

config.entry['index'] = './src/index.js';

for (var i in apps) {
  // Add an entry point for each module we want to build
  config.entry[apps[i] + '/js/' + apps[i]] =
    './src/' + apps[i] + '/js/' + apps[i] + '.js';

  // Copy assets for each module
  COPY_ARRAY.push({
    from: path.resolve('./src/' + apps[i] + '/img/'),
    to: path.resolve('./dist/' + apps[i] + '/img/')
  });

  COPY_ARRAY.push({
    from: path.resolve('./src/' + apps[i] + '/scss/fonts/'),
    to: path.resolve('./dist/' + apps[i] + '/css/fonts/')
  });

  COPY_ARRAY.push({
    from: path.resolve('./src/' + apps[i] + '/index.html'),
    to: path.resolve('./dist/' + apps[i] + '/index.html')
  });
}

config.output = {
  path: path.resolve('./dist/'),
  filename: '[name].min.js',
  chunkFilename: '[name].min.js'
};

config.module = {
  rules: [
    {
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    },
    {
      test: /\.scss$/,
      use: extractSass.extract({
        use: [
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              includePaths: [path.resolve('./node_modules/')]
            }
          }
        ]
      })
    },
    {
      test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader:
        'url-loader?limit=10000&mimetype=application/font-woff&name=fonts/[name].[ext]'
    },
    {
      test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'file?name=fonts/[name].[ext]'
    },
    {
      test: /\.(gif|png|jpe?g|svg)$/i,
      use: [
        {
          loader: 'url-loader',
          options: {
            limit: 8192,
            name: 'public/[name].[ext]?[hash:7]'
          }
        },
        {
          loader: 'image-webpack-loader',
          options: {
            bypassOnDebug: true,
            mozjpeg: {
              progressive: true,
              quality: 75
            }
          }
        }
      ]
    }
  ]
};

config.plugins = [
  function() {
    // this.plugin('done', function(stats) {
    //   if (
    //     stats.compilation.errors &&
    //     stats.compilation.errors.length &&
    //     process.argv.indexOf('--watch') == -1
    //   ) {
    //     process.exit(1); // or throw new Error('webpack build failed.');
    //   }
    // });
  },
  new CleanWebpackPlugin(['dist']),
  new webpack.ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery',
    'windows.jQuery': 'jquery'
  }),
  new CopyWebpackPlugin([
    {
      from: './public',
      to: 'public'
    }
  ]),

  new ExtractTextPlugin('styles.css'),
  extractSass,
  function() {
    // generate build-hash.txt containing the hash of this build
    this.plugin('done', function() {
      for (var i in apps) {
        var distPath = path.join('./dist/' + apps[i]);
        var jsDistPath = path.join(distPath, '/js/');
        var cssDistPath = path.join(distPath, '/css/');
        var mainJsPath = apps[i] + '.min.js';
        var mainCssPath = apps[i] + '.min.css';
        var cssPathToMoveFrom = path.join('js', apps[i]) + '.min.css';

        // copy to JS
        fs.copy(path.join(jsDistPath, mainJsPath));

        // create css directory
        if (!fs.existsSync(cssDistPath)) {
          fs.mkdirSync(cssDistPath);
        }

        // copy to css & css.map
        fs.move(
          path.join(distPath, cssPathToMoveFrom),
          path.join(cssDistPath, mainCssPath)
        );

        fs.move(
          path.join(distPath, cssPathToMoveFrom + '.map'),
          path.join(cssDistPath, mainCssPath + '.map')
        );
      }
    });
  },
  new BrowserSyncPlugin({
    server: {
      baseDir: ['dist']
    },
    port: 3000,
    host: 'localhost',
    open: true
  })
];

config.plugins.push(new CopyWebpackPlugin(COPY_ARRAY));

module.exports = config;
