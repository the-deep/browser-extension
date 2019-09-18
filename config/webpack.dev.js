const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const StylishPlugin = require('eslint/lib/cli-engine/formatters/stylish');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

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

        mode: 'development',

        devtool: 'cheap-module-source-map',
        // NOTE: cannot use 'cheap-module-eval-source-map' as chrome blocks it

        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },

        node: {
            fs: 'empty',
        },

        performance: {
            hints: 'warning',
        },

        stats: {
            assets: true,
            colors: true,
            errors: true,
            errorDetails: true,
            hash: true,
        },

        watch: true,
        watchOptions: {
            ignored: '/node_modules/',
        },

        module: {
            rules: [
                {
                    test: /\.(js|jsx|ts|tsx)$/,
                    include: appSrc,
                    use: [
                        'cache-loader',
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
                        'style-loader',
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
        ],
    };
};
