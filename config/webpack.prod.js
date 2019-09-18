const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const StylishPlugin = require('eslint/lib/cli-engine/formatters/stylish');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const dotenv = require('dotenv').config({
    path: '.env',
});
const getEnvVariables = require('./env.js');

const appBase = process.cwd();
const eslintFile = path.resolve(appBase, '.eslintrc-loader.js');
const appSrc = path.resolve(appBase, 'src/');
const appDist = path.resolve(appBase, 'build/');
const publicSrc = path.resolve(appBase, 'public/');
const appIndexJs = path.resolve(appSrc, 'index.js');
const appIndexHtml = path.resolve(publicSrc, 'index.html');

module.exports = (env) => {
    const ENV_VARS = { ...dotenv.pared, ...getEnvVariables(env) };

    console.warn(ENV_VARS);

    return {
        entry: appIndexJs,
        output: {
            path: appDist,
            publicPath: '/',
            chunkFilename: 'js/[name].[hash].js',
            filename: 'js/[name].[hash].js',
            sourceMapFilename: 'sourcemaps/[file].map',
            pathinfo: false,
        },

        mode: 'production',

        devtool: 'source-map',

        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },

        node: {
            fs: 'empty',
        },

        optimization: {
            minimizer: [
                /*
                // NOTE: Using TerserPlugin instead of UglifyJsPlugin as es6 support deprecated
                new UglifyJsPlugin({
                    sourceMap: true,
                    parallel: true,
                    uglifyOptions: {
                        mangle: true,
                        compress: { typeofs: false },
                    },
                }),
                */
                new TerserPlugin({
                    parallel: true,
                    sourceMap: true,
                    terserOptions: {
                        mangle: true,
                        compress: { typeofs: false },
                    },
                }),
                new OptimizeCssAssetsPlugin({
                    cssProcessorOptions: {
                        safe: true,
                    },
                }),
            ],
            splitChunks: {
                cacheGroups: {
                    vendors: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all',
                    },
                },
            },
            runtimeChunk: 'single',
            moduleIds: 'hashed',
        },

        module: {
            rules: [
                {
                    test: /\.(js|jsx|ts|tsx)$/,
                    include: appSrc,
                    use: [
                        'babel-loader',
                        {
                            loader: 'eslint-loader',
                            options: {
                                configFile: eslintFile,
                                // NOTE: adding this because eslint 6 cannot find this
                                // https://github.com/webpack-contrib/eslint-loader/issues/271
                                formatter: StylishPlugin,
                            },
                        },
                    ],
                },
                {
                    test: /\.scss$/,
                    include: appSrc,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: require.resolve('css-loader'),
                            options: {
                                importLoaders: 1,
                                modules: {
                                    localIdentName: '[name]_[local]_[hash:base64]',
                                },
                                localsConvention: 'camelCase',
                                sourceMap: true,
                            },
                        },
                        {
                            loader: require.resolve('sass-loader'),
                            options: {
                                sourceMap: true,
                            },
                        },
                    ],
                },
                {
                    test: /\.(png|jpg|gif|svg)$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: 'assets/[hash].[ext]',
                            },
                        },
                    ],
                },
            ],
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env': ENV_VARS,
            }),
            new CircularDependencyPlugin({
                exclude: /node_modules/,
                failOnError: false,
                allowAsyncCycles: false,
                cwd: appBase,
            }),
            // Remove build folder anyway
            new CleanWebpackPlugin({
                cleanStaleWebpackAssets: false,
            }),
            new CopyWebpackPlugin([
                { context: publicSrc, to: appDist, from: 'background.js' },
                { context: publicSrc, to: appDist, from: 'deep-logo.png' },
                { context: publicSrc, to: appDist, from: 'manifest.json' },
            ]),
            new HtmlWebpackPlugin({
                template: appIndexHtml,
                filename: './index.html',
                title: 'DEEP 2: Add Lead',
                chunksSortMode: 'none',
            }),
            new MiniCssExtractPlugin({
                filename: 'css/[name].css',
                chunkFilename: 'css/[id].css',
            }),
            new webpack.HashedModuleIdsPlugin(),
        ],
    };
};
