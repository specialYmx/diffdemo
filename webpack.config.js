const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const VueLoaderPlugin = require("vue-loader/lib/plugin");

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    mode: isProduction ? "production" : "development",
    entry: "./src/main.js",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "bundle.js",
      publicPath: "./",
      clean: true, // 清理输出目录
    },
    devServer: {
      port: 8080,
      hot: true,
      compress: true,
      historyApiFallback: true,
      static: {
        directory: path.join(__dirname, 'dist'),
      },
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: "vue-loader",
        },
        {
          test: /\.js$/,
          loader: "babel-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    plugins: [
      new VueLoaderPlugin(),
      new HtmlWebpackPlugin({
        template: "./src/index.html",
        minify: isProduction ? {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        } : false,
      }),
      // 复制 _redirects 文件到输出目录
      {
        apply: (compiler) => {
          compiler.hooks.emit.tapAsync('CopyRedirectsPlugin', (compilation, callback) => {
            const source = '/*    /index.html   200';
            compilation.assets['_redirects'] = {
              source: () => source,
              size: () => source.length
            };
            callback();
          });
        }
      }
    ],
    resolve: {
      extensions: [".js", ".vue", ".json"],
      alias: {
        vue$: "vue/dist/vue.esm.js",
      },
    },
    optimization: {
      minimize: isProduction,
    },
  };
};
