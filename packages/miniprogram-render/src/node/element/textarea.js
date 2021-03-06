const Element = require('../element')
const Pool = require('../../util/pool')
const cache = require('../../util/cache')
const tool = require('../../util/tool')

const pool = new Pool()

class HTMLTextAreaElement extends Element {
    /**
     * 创建实例
     */
    static $$create(options, tree) {
        const config = cache.getConfig()

        if (config.optimization.elementMultiplexing) {
            // 复用 element 节点
            const instance = pool.get()

            if (instance) {
                instance.$$init(options, tree)
                return instance
            }
        }

        return new HTMLTextAreaElement(options, tree)
    }

    /**
     * 覆写父类的回收实例方法
     */
    $$recycle() {
        this.$$destroy()

        const config = cache.getConfig()

        if (config.optimization.elementMultiplexing) {
            // 复用 element 节点
            pool.add(this)
        }
    }

    /**
     * 调用 $_generateHtml 接口时用于处理额外的属性，
     */
    $$dealWithAttrsForGenerateHtml(html, node) {
        const type = node.type
        if (type) html += ` type="${tool.escapeForHtmlGeneration(type)}"`

        const value = node.value
        if (value) html += ` value="${tool.escapeForHtmlGeneration(value)}"`

        const disabled = node.disabled
        if (disabled) html += ' disabled'

        const maxlength = node.maxlength
        if (maxlength) html += ` maxlength="${tool.escapeForHtmlGeneration(maxlength)}"`

        const placeholder = node.placeholder
        if (placeholder) html += ` placeholder="${tool.escapeForHtmlGeneration(placeholder.replace(/"/g, '\\"'))}"`

        return html
    }

    /**
     * 调用 outerHTML 的 setter 时用于处理额外的属性
     */
    $$dealWithAttrsForOuterHTML(node) {
        this.name = node.name || ''
        this.type = node.type || ''
        this.value = node.value || ''
        this.disabled = !!node.disabled
        this.maxlength = node.maxlength
        this.placeholder = node.placeholder || ''

        // 特殊字段
        this.mpplaceholderclass = node.mpplaceholderclass || ''
    }

    /**
     * 调用 cloneNode 接口时用于处理额外的属性
     */
    $$dealWithAttrsForCloneNode() {
        return {
            type: this.type,
            value: this.value,
            disabled: this.disabled,
            maxlength: this.maxlength,
            placeholder: this.placeholder,

            // 特殊字段
            mpplaceholderclass: this.mpplaceholderclass,
        }
    }

    /**
     * 对外属性和方法
     */
    get type() {
        return this.$_attrs.get('type') || 'textarea'
    }

    set type(value) {
        value = '' + value
        this.$_attrs.set('type', value)
    }

    get value() {
        return this.$_attrs.get('value')
    }

    set value(value) {
        value = '' + value
        this.$_attrs.set('value', value)
    }

    get disabled() {
        return !!this.$_attrs.get('disabled')
    }

    set disabled(value) {
        value = !!value
        this.$_attrs.set('disabled', value)
    }

    get maxlength() {
        return this.$_attrs.get('maxlength')
    }

    set maxlength(value) {
        this.$_attrs.set('maxlength', value)
    }

    get placeholder() {
        return this.$_attrs.get('placeholder') || ''
    }

    set placeholder(value) {
        value = '' + value
        this.$_attrs.set('placeholder', value)
    }

    get autofocus() {
        return !!this.$_attrs.get('autofocus')
    }

    set autofocus(value) {
        value = !!value
        this.$_attrs.set('autofocus', value)
    }

    get selectionStart() {
        const value = +this.$_attrs.get('selection-start')
        return value !== undefined ? value : -1
    }

    set selectionStart(value) {
        this.$_attrs.set('selection-start', value)
    }

    get selectionEnd() {
        const value = +this.$_attrs.get('selection-end')
        return value !== undefined ? value : -1
    }

    set selectionEnd(value) {
        this.$_attrs.set('selection-end', value)
    }

    focus() {
        this.$_attrs.set('focus', true)
    }

    blur() {
        this.$_attrs.set('focus', false)
    }
}

module.exports = HTMLTextAreaElement
