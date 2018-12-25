const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const glob = require('glob');
const webpack = require('webpack');
const FixStylesOnlyEntriesPlugin = require('webpack-fix-style-only-entries');
const MinCssExtractPlugin = require('mini-css-extract-plugin');

const rootPath = path.resolve(__dirname, 'assets/dist');

module.exports = [
    {
        entry: {
            'checkout-scripts': [
                './src/js/checkout-scripts.js', 
                ...glob.sync('./assets/js/common-components/*.js'), 
                ...glob.sync('./assets/js/checkout/*.js')
            ],
            'scripts': [
                './src/js/scripts.js', 
                ...glob.sync('./assets/js/*.js', { ignore: './assets/js/app.js', nosort: true }), 
                ...glob.sync('./assets/js/products-compare/*.js')
            ],
            'account-scripts': [
                './src/js/account-scripts.js', 
                ...glob.sync('./assets/js/products-compare/*.js'), 
                ...glob.sync('./assets/js/common-components/*.js'), 
                ...glob.sync('./assets/js/account/*.js'),
                ...glob.sync('./assets/js/lists/*.js')
            ],
            'scripts_dependencies': './src/js/vendor.js',
            'styles': './src/css/styles.css',
            'checkout-styles': './src/css/checkout-styles.css',
            'account-styles': './src/css/account-styles.css'
        },
        output: {
            path: rootPath,
            filename: '[name].js',
        },
        module: {
            rules: [
                {
                    test: /\.modernizrrc\.js$/,
                    loader: 'webpack-modernizr-loader'
                },
                {
                    test: require.resolve('ideal-image-slider/ideal-image-slider'),
                    use: 'exports-loader?IdealImageSlider'
                },
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
                        'css-loader',
                        'postcss-loader'
                    ]
                }
            ]
        },
        plugins: [
            new CleanWebpackPlugin(rootPath, { verbose: true }),
            new webpack.ProvidePlugin({
                $: 'jquery',
                jQuery: 'jquery',
                'window.jQuery': 'jquery',
                _: 'underscore',
                IdealImageSlider: 'ideal-image-slider/ideal-image-slider'
            }),
            new FixStylesOnlyEntriesPlugin(),
            new MinCssExtractPlugin({
                filename: "[name].css"
            })
        ],
        resolve: {
            alias: {
                Assets: path.resolve(__dirname, 'assets'),
                Vendor: path.resolve(__dirname, 'node_modules'),
                modernizr$: path.resolve(__dirname, ".modernizrrc.js")
            }
        }
    }
]