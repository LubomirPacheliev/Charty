import path from 'path';

export default {
    // bundling mode
    mode: 'development',
    // entry files
    entry: path.resolve('./src/charts/charty.ts'),
    // output bundles (location)
    output: {
        path: path.resolve('./dist'),
        filename: 'charty.js',
    },
    // file resolutions
    resolve: {
        extensions: ['.ts', '.js'],
    },
    // loaders
    module: {
        rules: [
            {
                test: /\.tsx?/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ]
    }
};