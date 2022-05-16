const path = require('path');
const webpack = require('webpack')
const MpAdaptorPlugin = require('./scripts/MpAdaptarPlugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    mode: 'none',
    target: 'web', // 必需字段，不能修改
    entry: {
        vanilla: './fragments/vanilla-code/',
        react: './fragments/react-code/index.jsx'
    },
    output: {
        path: path.resolve(__dirname, '../wechat/h5code'),
        filename: '[name].js',
        library: {
            type: 'commonjs2',
            export: 'default',
        },
    },
    optimization: {
        minimizer: []
    },
    module: {
        rules: [
            {
                test: /\.(js|mjs|jsx|ts|tsx)$/,
                // exclude: /(node_modules|bower_components)/,
                use: {
                    // Use `.swcrc` to configure swc
                    loader: "swc-loader",
                    options: {
                        jsc: {
                            parser: {
                                syntax: "ecmascript",
                                jsx: true,
                            },
                            transform: {
                                react: {
                                    pragma: 'React.createElement',
                                    pragmaFrag: 'React.Fragment',
                                    throwIfNamespace: true,
                                    development: false,
                                    useBuiltins: false
                                }
                            }
                        }
                    }
                }
            },
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': "'development'",
        }),
        new MpAdaptorPlugin(),
        new MiniCssExtractPlugin(),
    ],
}