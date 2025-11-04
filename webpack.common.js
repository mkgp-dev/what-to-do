const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    entry: './src/app.js',
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/main.html',
            filename: 'index.html'
        })
    ],
    module: {
        rules: [
            {
                test: /\.(png|jpe?g|svg|woff2?)$/i,
                type: 'asset/resource'
            }
        ]
    }
};