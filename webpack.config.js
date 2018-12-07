const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const glob = require('glob');
const webpack = require('webpack');
const FixStylesOnlyEntriesPlugin = require('webpack-fix-style-only-entries');
const MinCssExtractPlugin = require('mini-css-extract-plugin');

const rootPath = path.resolve(__dirname, 'assets/dist');

module.exports = [
    {
        entry: ['./src/js/checkout-scripts.js', ...glob.sync('./assets/js/common-components/*.js'), ...glob.sync('./assets/js/checkout/*.js')],
        output: {
            path: rootPath,
            filename: 'checkout-scripts.js',
            publicPath: 'assets/dist/'
        },
        plugins: [
            new CleanWebpackPlugin(rootPath, { verbose: true }),
            new webpack.ProvidePlugin({
                $: 'jquery',
                jQuery: 'jquery',
                'window.jQuery': 'jquery',
                _: 'underscore'
            })
        ],
        resolve: {
            alias: {
                Assets: path.resolve(__dirname, 'assets'),
                Vendor: path.resolve(__dirname, 'node_modules')
            }
        }
    },
    {
        entry: [
            './src/js/scripts.js', 
            ...glob.sync('./assets/js/*.js', { ignore: './assets/js/app.js', nosort: true }), 
            ...glob.sync('./assets/js/products-compare/*.js')
        ],
        output: {
            path: rootPath,
            filename: 'scripts.js',
            publicPath: 'assets/dist/'
        },
        devtool: 'eval-source-map',
        module: {
            rules: [
                {
                    test: /\.modernizrrc\.js$/,
                    loader: 'webpack-modernizr-loader'
                },
                {
                    test: require.resolve('ideal-image-slider/ideal-image-slider'),
                    use: 'exports-loader?IdealImageSlider'
                }
            ]
        },
        resolve: {
            alias: {
                Assets: path.resolve(__dirname, 'assets'),
                modernizr$: path.resolve(__dirname, ".modernizrrc.js")
            }
        },
        plugins: [
            new webpack.ProvidePlugin({
                $: 'jquery',
                jQuery: 'jquery',
                'window.jQuery': 'jquery',
                IdealImageSlider: 'ideal-image-slider/ideal-image-slider',
                _: 'underscore'
            })
        ]
    },
    {
        entry: [
            './src/js/account-scripts.js', 
            ...glob.sync('./assets/js/products-compare/*.js'), 
            ...glob.sync('./assets/js/common-components/*.js'), 
            ...glob.sync('./assets/js/account/*.js'),
            ...glob.sync('./assets/js/lists/*.js')
        ],
        output: {
            path: rootPath,
            filename: 'account-scripts.js',
            publicPath: 'assets/dist/'
        },
        module: {
            rules: [
                {
                    test: /\.modernizrrc\.js$/,
                    loader: 'webpack-modernizr-loader'
                },
            ]
        },
        resolve: {
            alias: {
                Assets: path.resolve(__dirname, 'assets'),
                modernizr$: path.resolve(__dirname, ".modernizrrc.js")
            }
        },
        plugins: [
            new webpack.ProvidePlugin({
                $: 'jquery',
                jQuery: 'jquery',
                'window.jQuery': 'jquery'
            }),
            new webpack.ProvidePlugin({
                _: 'underscore'
            })
        ]
    },
    {
        entry: './src/js/vendor.js',
        output: {
            path: rootPath,
            filename: 'scripts_dependencies.js',
            publicPath: 'assets/dist/'
        },
        plugins: [
            new webpack.ProvidePlugin({
                $: 'jquery',
                jQuery: 'jquery',
                'window.jQuery': 'jquery'
            })
        ]
    },
    {
        entry: {
            'styles': './src/css/styles.css',
            'checkout-styles': './src/css/checkout-styles.css',
            'account-styles': './src/css/account-styles.css'
        },
        module: {
            rules: [
                {
                    test: /\.(jpe?g|png|gif|svg)$/i,
                    loader: "file-loader",
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'images/'
                    }
                },
                {
                    test: /\.css$/,
                    use: [
                        MinCssExtractPlugin.loader,
                        'css-loader'
                    ]
                }
            ]
        },
        output: {
            path: rootPath,
            publicPath: 'assets/dist/'
        },
        plugins: [
            new FixStylesOnlyEntriesPlugin(),
            new MinCssExtractPlugin({
                filename: "[name].css"
            })
        ],
        resolve: {
            alias: {
                Assets: path.resolve(__dirname, 'assets')
            }
        }
    }
]