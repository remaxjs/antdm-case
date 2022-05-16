const ModuleFilenameHelpers = require('webpack/lib/ModuleFilenameHelpers')
const {RawSource, ConcatSource} = require('webpack-sources')

const globalVars = [
    'self',
    'HTMLElement',
    'Element',
    'Node',
    'localStorage',
    'sessionStorage',
    'navigator',
    'history',
    'location',
    'performance',
    'Image',
    'CustomEvent',
    'Event',
    'requestAnimationFrame',
    'cancelAnimationFrame',
    'getComputedStyle',
    'XMLHttpRequest',
    'Worker',
    'SharedWorker',
];
const PluginName = 'MpAdaptorPlugin'

module.exports = class MpAdaptorPlugin{

    constructor(options) {
        this.options = options
    }

    apply(compiler){
        const options = this.options;

        compiler.hooks.compilation.tap(PluginName, compilation => {
            compilation.hooks.optimizeChunkAssets.tapAsync(PluginName, (chunks, callback) => {
                chunks.forEach(chunk => {
                    chunk.files.forEach(fileName => {
                        if (ModuleFilenameHelpers.matchObject({test: /\.js$/}, fileName)) {
                            // 页面 js
                            const headerContent = 'module.exports = function(window, document) {var App = function(options) {window.appOptions = options};' + globalVars.map(item => `var ${item} = window.${item}`).join(';') + ';'

                            const footerContent = 'return module.exports;}'

                            compilation.assets[fileName] = new ConcatSource(headerContent, compilation.assets[fileName], footerContent)
                        }
                    })
                })
                callback()
            })
        })
    }
}