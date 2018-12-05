const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const glob = require('glob');

const rootPath = path.resolve(__dirname, 'dist');

module.exports = [
    {
        entry: ['./src/js/checkout-scripts.js', ...glob.sync('./assets/js/common-components/*.js'), ...glob.sync('./assets/js/checkout/*.js')],
        output: {
            path: rootPath,
            filename: 'checkout-scripts.js',
            publicPath: '/dist/'
        },
        plugins: [
            new CleanWebpackPlugin(rootPath, { verbose: true })
        ],
        resolve: {
            alias: {
                Assets: path.resolve(__dirname, 'assets')
            }
        }
    },
    {
        entry: ['./src/js/scripts.js', ...glob.sync('./assets/js/*.js'), ...glob.sync('./assets/js/products-compare/*.js')],
        output: {
            path: rootPath,
            filename: 'scripts.js',
            publicPath: '/dist/'
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
        }
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
            publicPath: '/dist/'
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
        }
    }
]