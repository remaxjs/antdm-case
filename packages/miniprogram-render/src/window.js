const Document = require('./document')
const EventTarget = require('./event/event-target')
const Event = require('./event/event')
const OriginalCustomEvent = require('./event/custom-event')
const Location = require('./bom/location')
const Navigator = require('./bom/navigator')
const Screen = require('./bom/screen')
const History = require('./bom/history')
const Miniprogram = require('./bom/miniprogram')
const {SessionStorage, LocalStorage} = require('./bom/storage')
const WorkerImpl = require('./bom/worker')
const Performance = require('./bom/performance')
const OriginalXMLHttpRequest = require('./bom/xml-http-request')
const Node = require('./node/node')
const Element = require('./node/element')
const TextNode = require('./node/text-node')
const Comment = require('./node/comment')
const ClassList = require('./node/class-list')
const Style = require('./node/style')
const Attribute = require('./node/attribute')
const cache = require('./util/cache')
const tool = require('./util/tool')

let lastRafTime = 0
const WINDOW_PROTOTYPE_MAP = {
    location: Location.prototype,
    navigator: Navigator.prototype,
    performance: Performance.prototype,
    screen: Screen.prototype,
    history: History.prototype,
    localStorage: LocalStorage.prototype,
    sessionStorage: SessionStorage.prototype,
    XMLHttpRequest: OriginalXMLHttpRequest.prototype,
    event: Event.prototype,
}
const ELEMENT_PROTOTYPE_MAP = {
    attribute: Attribute.prototype,
    classList: ClassList.prototype,
    style: Style.prototype,
}
const subscribeMap = {}
const globalObject = {}
function noop() {}

class Window extends EventTarget {
    constructor(pageId) {
        super()

        const config = cache.getConfig()
        const timeOrigin = +new Date()

        this.$_pageId = pageId

        this.$_outerHeight = 0
        this.$_outerWidth = 0
        this.$_innerHeight = 0
        this.$_innerWidth = 0

        this.$_location = new Location(pageId)
        this.$_navigator = new Navigator()
        this.$_screen = new Screen()
        this.$_history = new History(this.$_location)
        this.$_miniprogram = new Miniprogram(pageId)
        this.$_localStorage = new LocalStorage(pageId)
        this.$_sessionStorage = new SessionStorage(pageId)
        this.$_performance = new Performance(timeOrigin)

        this.$_nowFetchingWebviewInfoPromise = null // ???????????? webview ???????????? promise ??????

        this.$_fetchDeviceInfo()
        this.$_initInnerEvent()

        // ?????????????????????????????? 'xxx' in XXX ??????
        this.onhashchange = null

        // HTMLElement ?????????
        this.$_elementConstructor = function HTMLElement(...args) {
            return Element.$$create(...args)
        }

        // CustomEvent ?????????
        this.$_customEventConstructor = class CustomEvent extends OriginalCustomEvent {
            constructor(name = '', options = {}) {
                options.timeStamp = +new Date() - timeOrigin
                super(name, options)
            }
        }

        // XMLHttpRequest ?????????
        this.$_xmlHttpRequestConstructor = class XMLHttpRequest extends OriginalXMLHttpRequest {constructor() { super(pageId) }}

        // Worker/SharedWorker ?????????
        if (config.generate && config.generate.worker) {
            this.$_workerConstructor = class Worker extends WorkerImpl.Worker {constructor(url) { super(url, pageId) }}
            this.$_sharedWorkerConstructor = class SharedWorker extends WorkerImpl.SharedWorker {constructor(url) { super(url, pageId) }}
        }

        // react ????????????
        this.HTMLIFrameElement = function() {}
    }

    /**
     * ?????????????????????
     */
    $_initInnerEvent() {
        // ?????? location ?????????
        this.$_location.addEventListener('hashchange', ({oldURL, newURL}) => {
            this.$$trigger('hashchange', {
                event: new Event({
                    name: 'hashchange',
                    target: this,
                    eventPhase: Event.AT_TARGET,
                    $$extra: {
                        oldURL,
                        newURL,
                    },
                }),
                currentTarget: this,
            })
        })

        // ?????? history ?????????
        this.$_history.addEventListener('popstate', ({state}) => {
            this.$$trigger('popstate', {
                event: new Event({
                    name: 'popstate',
                    target: this,
                    eventPhase: Event.AT_TARGET,
                    $$extra: {state},
                }),
                currentTarget: this,
            })
        })

        // ??????????????????
        this.addEventListener('scroll', () => {
            const document = this.document
            // ????????????????????????????????????????????????
            if (document) document.documentElement.$$scrollTimeStamp = +new Date()
        })
    }

    /**
     * ??????????????????
     */
    $_fetchDeviceInfo() {
        try {
            const info = wx.getSystemInfoSync()

            this.$_outerHeight = info.screenHeight
            this.$_outerWidth = info.screenWidth
            this.$_innerHeight = info.windowHeight
            this.$_innerWidth = info.windowWidth

            this.$_screen.$$reset(info)
            this.$_navigator.$$reset(info)
        } catch (err) {
            // ignore
        }
    }

    /**
     * ?????????????????????????????????
     */
    $_getAspectInfo(descriptor) {
        if (!descriptor || typeof descriptor !== 'string') return

        descriptor = descriptor.split('.')
        const main = descriptor[0]
        const sub = descriptor[1]
        let method = descriptor[1]
        let type = descriptor[2]
        let prototype

        // ??????????????????
        if (main === 'window') {
            if (WINDOW_PROTOTYPE_MAP[sub]) {
                prototype = WINDOW_PROTOTYPE_MAP[sub]
                method = type
                type = descriptor[3]
            } else {
                prototype = Window.prototype
            }
        } else if (main === 'document') {
            prototype = Document.prototype
        } else if (main === 'element') {
            if (ELEMENT_PROTOTYPE_MAP[sub]) {
                prototype = ELEMENT_PROTOTYPE_MAP[sub]
                method = type
                type = descriptor[3]
            } else {
                prototype = Element.prototype
            }
        } else if (main === 'textNode') {
            prototype = TextNode.prototype
        } else if (main === 'comment') {
            prototype = Comment.prototype
        }

        return {prototype, method, type}
    }

    /**
     * ??????????????????????????????
     */
    get $$miniprogram() {
        return this.$_miniprogram
    }

    /**
     * ????????????????????????
     */
    get $$global() {
        return globalObject
    }

    /**
     * ????????? window ??????
     */
    get $$isWindow() {
        return true
    }

    /**
     * ????????????
     */
    $$destroy() {
        super.$$destroy()

        const pageId = this.$_pageId

        WorkerImpl.destroy(pageId)
        Object.keys(subscribeMap).forEach(name => {
            const handlersMap = subscribeMap[name]
            if (handlersMap[pageId]) handlersMap[pageId] = null
        })
    }

    /**
     * ??????????????? getComputedStyle ??????
     * https://developers.weixin.qq.com/miniprogram/dev/api/wxml/NodesRef.fields.html
     */
    $$getComputedStyle(dom, computedStyle = []) {
        tool.flushThrottleCache() // ????????? setData
        return new Promise((resolve, reject) => {
            if (dom.tagName === 'BODY') {
                this.$$createSelectorQuery().select('.miniprogram-root').fields({computedStyle}, res => (res ? resolve(res) : reject())).exec()
            } else {
                this.$$createSelectorQuery().select(`.miniprogram-root >>> .node-${dom.$$nodeId}`).fields({computedStyle}, res => (res ? resolve(res) : reject())).exec()
            }
        })
    }

    /**
     * ???????????? setData ??????
     */
    $$forceRender() {
        tool.flushThrottleCache()
    }

    /**
     * ??????????????????
     */
    $$trigger(eventName, options = {}) {
        if (eventName === 'error' && typeof options.event === 'string') {
            // ??????????????? App.onError ??????
            const errStack = options.event
            const errLines = errStack.split('\n')
            let message = ''
            for (let i = 0, len = errLines.length; i < len; i++) {
                const line = errLines[i]
                if (line.trim().indexOf('at') !== 0) {
                    message += (line + '\n')
                } else {
                    break
                }
            }

            const error = new Error(message)
            error.stack = errStack
            options.event = new this.$_customEventConstructor('error', {
                target: this,
                $$extra: {
                    message,
                    filename: '',
                    lineno: 0,
                    colno: 0,
                    error,
                },
            })
            options.args = [message, error]

            // window.onerror ?????????????????????????????????
            if (typeof this.onerror === 'function' && !this.onerror.$$isOfficial) {
                const oldOnError = this.onerror
                this.onerror = (event, message, error) => {
                    oldOnError.call(this, message, '', 0, 0, error)
                }
                this.onerror.$$isOfficial = true // ??????????????????????????????
            }
        }

        super.$$trigger(eventName, options)
    }

    /**
     * ????????????
     */
    $$getPrototype(descriptor) {
        if (!descriptor || typeof descriptor !== 'string') return

        descriptor = descriptor.split('.')
        const main = descriptor[0]
        const sub = descriptor[1]

        if (main === 'window') {
            if (WINDOW_PROTOTYPE_MAP[sub]) {
                return WINDOW_PROTOTYPE_MAP[sub]
            } else if (!sub) {
                return Window.prototype
            }
        } else if (main === 'document') {
            if (!sub) {
                return Document.prototype
            }
        } else if (main === 'element') {
            if (ELEMENT_PROTOTYPE_MAP[sub]) {
                return ELEMENT_PROTOTYPE_MAP[sub]
            } else if (!sub) {
                return Element.prototype
            }
        } else if (main === 'textNode') {
            if (!sub) {
                return TextNode.prototype
            }
        } else if (main === 'comment') {
            if (!sub) {
                return Comment.prototype
            }
        }
    }

    /**
     * ?????? dom/bom ??????
     */
    $$extend(descriptor, options) {
        if (!descriptor || !options || typeof descriptor !== 'string' || typeof options !== 'object') return

        const prototype = this.$$getPrototype(descriptor)
        const keys = Object.keys(options)

        if (prototype) keys.forEach(key => prototype[key] = options[key])
    }

    /**
     * ??? dom/bom ??????????????????????????????
     */
    $$addAspect(descriptor, func) {
        if (!descriptor || !func || typeof descriptor !== 'string' || typeof func !== 'function') return

        const {prototype, method, type} = this.$_getAspectInfo(descriptor)

        // ????????????
        if (prototype && method && type) {
            const methodInPrototype = prototype[method]
            if (typeof methodInPrototype !== 'function') return

            // ??????????????????
            if (!methodInPrototype.$$isHook) {
                prototype[method] = function(...args) {
                    const beforeFuncs = prototype[method].$$before || []
                    const afterFuncs = prototype[method].$$after || []

                    if (beforeFuncs.length) {
                        for (const beforeFunc of beforeFuncs) {
                            const isStop = beforeFunc.apply(this, args)
                            if (isStop) return
                        }
                    }

                    const res = methodInPrototype.apply(this, args)

                    if (afterFuncs.length) {
                        for (const afterFunc of afterFuncs) {
                            afterFunc.call(this, res)
                        }
                    }

                    return res
                }
                prototype[method].$$isHook = true
                prototype[method].$$originalMethod = methodInPrototype
            }

            // ??????????????????
            if (type === 'before') {
                prototype[method].$$before = prototype[method].$$before || []
                prototype[method].$$before.push(func)
            } else if (type === 'after') {
                prototype[method].$$after = prototype[method].$$after || []
                prototype[method].$$after.push(func)
            }
        }
    }

    /**
     * ????????? dom/bom ????????????????????????/????????????
     */
    $$removeAspect(descriptor, func) {
        if (!descriptor || !func || typeof descriptor !== 'string' || typeof func !== 'function') return

        const {prototype, method, type} = this.$_getAspectInfo(descriptor)

        // ????????????
        if (prototype && method && type) {
            const methodInPrototype = prototype[method]
            if (typeof methodInPrototype !== 'function' || !methodInPrototype.$$isHook) return

            // ??????????????????
            if (type === 'before' && methodInPrototype.$$before) {
                methodInPrototype.$$before.splice(methodInPrototype.$$before.indexOf(func), 1)
            } else if (type === 'after' && methodInPrototype.$$after) {
                methodInPrototype.$$after.splice(methodInPrototype.$$after.indexOf(func), 1)
            }

            if ((!methodInPrototype.$$before || !methodInPrototype.$$before.length) && (!methodInPrototype.$$after || !methodInPrototype.$$after.length)) {
                prototype[method] = methodInPrototype.$$originalMethod
            }
        }
    }

    /**
     * ??????????????????
     */
    $$subscribe(name, handler) {
        if (typeof name !== 'string' || typeof handler !== 'function') return

        const pageId = this.$_pageId
        subscribeMap[name] = subscribeMap[name] || {}
        subscribeMap[name][pageId] = subscribeMap[name][pageId] || []
        subscribeMap[name][pageId].push(handler)
    }

    /**
     * ????????????????????????
     */
    $$unsubscribe(name, handler) {
        const pageId = this.$_pageId

        if (typeof name !== 'string' || !subscribeMap[name] || !subscribeMap[name][pageId]) return

        const handlers = subscribeMap[name][pageId]
        if (!handler) {
            // ???????????? handler ?????????
            handlers.length = 0
        } else if (typeof handler === 'function') {
            const index = handlers.indexOf(handler)
            if (index !== -1) handlers.splice(index, 1)
        }
    }

    /**
     * ??????????????????
     */
    $$publish(name, data) {
        if (typeof name !== 'string' || !subscribeMap[name]) return

        Object.keys(subscribeMap[name]).forEach(pageId => {
            const handlers = subscribeMap[name][pageId]
            if (handlers && handlers.length) {
                handlers.forEach(handler => {
                    if (typeof handler !== 'function') return

                    try {
                        handler.call(null, data)
                    } catch (err) {
                        console.error(err)
                    }
                })
            }
        })
    }

    /**
     * ?????????????????????
     */
    get document() {
        return cache.getDocument(this.$_pageId) || null
    }

    get location() {
        return this.$_location
    }

    set location(href) {
        this.$_location.href = href
    }

    get navigator() {
        return this.$_navigator
    }

    get CustomEvent() {
        return this.$_customEventConstructor
    }

    get Event() {
        return Event
    }

    get self() {
        return this
    }

    get localStorage() {
        return this.$_localStorage
    }

    get sessionStorage() {
        return this.$_sessionStorage
    }

    get screen() {
        return this.$_screen
    }

    get history() {
        return this.$_history
    }

    get outerHeight() {
        return this.$_outerHeight
    }

    get outerWidth() {
        return this.$_outerWidth
    }

    get innerHeight() {
        return this.$_innerHeight
    }

    get innerWidth() {
        return this.$_innerWidth
    }

    get Image() {
        return this.document ? this.document.$$imageConstructor : noop
    }

    get setTimeout() {
        return setTimeout.bind(null)
    }

    get clearTimeout() {
        return clearTimeout.bind(null)
    }

    get setInterval() {
        return setInterval.bind(null)
    }

    get clearInterval() {
        return clearInterval.bind(null)
    }

    get HTMLElement() {
        return this.$_elementConstructor
    }

    get Element() {
        return Element
    }

    get Node() {
        return Node
    }

    get RegExp() {
        return RegExp
    }

    get Math() {
        return Math
    }

    get Number() {
        return Number
    }

    get Boolean() {
        return Boolean
    }

    get String() {
        return String
    }

    get Date() {
        return Date
    }

    get Symbol() {
        return Symbol
    }

    get parseInt() {
        return parseInt
    }

    get parseFloat() {
        return parseFloat
    }

    get console() {
        return console
    }

    get performance() {
        return this.$_performance
    }

    get SVGElement() {
        // ???????????????????????????????????????
        console.warn('window.SVGElement is not supported')
        return function() {}
    }

    get XMLHttpRequest() {
        return this.$_xmlHttpRequestConstructor
    }

    get Worker() {
        return this.$_workerConstructor
    }

    get SharedWorker() {
        return this.$_sharedWorkerConstructor
    }

    get devicePixelRatio() {
        return wx.getSystemInfoSync().pixelRatio
    }

    open(url) {
        // ????????? windowName ??? windowFeatures
        this.location.$$open(url)
    }

    close() {
        wx.navigateBack({
            delta: 1,
        })
    }

    getComputedStyle() {
        // ???????????????????????????????????????
        console.warn('window.getComputedStyle is not supported, please use window.$$getComputedStyle instead of it')
        return {
            // vue transition ????????????
            transitionDelay: '',
            transitionDuration: '',
            animationDelay: '',
            animationDuration: '',
        }
    }

    requestAnimationFrame(callback) {
        if (typeof callback !== 'function') return

        const now = new Date()
        const nextRafTime = Math.max(lastRafTime + 16, now)
        return setTimeout(() => {
            callback(nextRafTime)
            lastRafTime = nextRafTime
        }, nextRafTime - now)
    }

    cancelAnimationFrame(timeId) {
        return clearTimeout(timeId)
    }

    // ?????? polyfill ?????????????????????????????????
    setImmediate(callback, ...args) {
        if (typeof callback !== 'function') return
        return setTimeout(callback, 0, ...args)
    }

    // ?????? polyfill ?????????????????????????????????
    clearImmediate(timeId) {
        return clearTimeout(timeId)
    }
}

module.exports = Window
