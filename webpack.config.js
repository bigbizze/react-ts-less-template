const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const cssnano = require('cssnano');

function get_mode_argv(key, defaultVal) {
    let index = process.argv.indexOf(key),
        next = process.argv[index + 1];
    defaultVal = defaultVal || null;
    let result = (index < 0) ? defaultVal : (!next || next[0] === "-") ? true : next;
    return result === "production"
        ? result
        : defaultVal;
}

const mode = get_mode_argv("--mode", "development");
const isProduction = mode === "production";
console.log(`### ${mode} defaultMode ###`);
module.exports = {
    mode,
    entry: './src/index.tsx',
    devtool: isProduction ? undefined : 'eval-source-map',
    // watch: !isProduction,
    module: {
        rules: [
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                exclude: /src\/fonts/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env', '@babel/preset-react'],
                            plugins: ['@babel/plugin-syntax-jsx']
                        }
                    },
                    {
                        loader: '@svgr/webpack',
                        options: {
                            babel: false,
                            icon: true,
                        },
                    },
                ],
            },
            {

                test: /\.tsx?$/,
                use: [{
                    loader: "ts-loader"
                }],
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: '../'
                        },
                    },
                    'css-loader',
                ].filter(Boolean),
            },
            {
                test: /\.(less)$/,
                exclude: [
                    /\.(css)$/,
                    /node_modules/
                ],
                use: [{
                    loader: 'style-loader' // creates style nodes from JS strings
                }, {
                    loader: 'css-loader' // translates CSS into CommonJS
                }, {
                    loader: "less-loader",
                    options: {
                        lessOptions: {
                            javascriptEnabled: true
                        }
                    }
                }]
            },
            // {
            //     test: /\.(png|woff|woff2|eot|ttf|svg)$/,
            //     loader: 'url-loader?limit=100000',
            //     options: {
            //         esModule: false
            //     }
            // },
            (isProduction) && {
                test: /\.html$/,
                use: [{loader: "html-loader", options: {minimize: isProduction}}]
            }
        ].filter(Boolean),
    },
    devServer: !isProduction ? {
        contentBase: path.join(__dirname, 'dev'),
        historyApiFallback: false,
        compress: false,
        hot: false,
        inline: false,
        host: '0.0.0.0',
        port: 3000,
        watchOptions: {
            poll: false
        }
    } : undefined,
    optimization: isProduction ? {
        runtimeChunk: true,
        minimize: isProduction,
        minimizer: [
            new OptimizeCssAssetsPlugin({
                assetNameRegExp: /\.optimize\.css$/g,
                cssProcessor: cssnano,
                cssProcessorPluginOptions: {
                    preset: ['default', {discardComments: {removeAll: true}}],
                },
                canPrint: true
            }),
            new TerserPlugin({
                parallel: true,
                terserOptions: {
                    ecma: 6,
                },
            })
        ],
        splitChunks: {
            chunks: 'all',
            minChunks: 1,
            maxAsyncRequests: 6,
            maxInitialRequests: 4,
            minSize: 30000,
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name(module) {
                        const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                        return Buffer.from(`${packageName.replace('@', '')}`).toString('base64').replace("==", "").replace("=", "");
                    },
                    priority: 10,
                    reuseExistingChunk: true
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true
                }
            },
        },
    } : undefined,
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
        // new webpack.optimize.ModuleConcatenationPlugin(),
        new MiniCssExtractPlugin({
            filename: path.join(isProduction ? 'css' : 'css', '[name].css'),
            ignoreOrder: false
        }),
        (isProduction) && new OptimizeCssAssetsPlugin({
            assetNameRegExp: /\.optimize\.css$/g,
            cssProcessor: require('cssnano'),
            cssProcessorPluginOptions: {
                preset: ['default', {discardComments: {removeAll: true}}],
            },
            canPrint: true
        }),
        new HtmlWebpackPlugin({
            filename: "index.html",
            template: path.join(isProduction ? './build' : './public', 'index.html'),

        })
    ].filter(Boolean),
    output: {
        filename: path.join(isProduction ? 'js' : 'js', '[name].bundle.js'),
        path: isProduction ? path.resolve(__dirname, 'build') : path.resolve(__dirname, 'dev'),
        publicPath: "/"
    },

};
