export default function () {
    const evtMap = {}
    const generateDomTree = node => {
        const {
            type,
            tagName = '',
            attrs = [],
            events = [],
            children = [],
            content = '',
        } = node

        if (type === 'element') {
            const element = document.createElement(tagName)
            for (const attr of attrs) {
                const name = attr.name
                let value = attr.value

                if (name.indexOf('on') === 0) {
                    element[name] = evtMap[value].bind(element)
                } else {
                    if (name === 'style') value = value && value.replace('"', '\'') || ''
                    element.setAttribute(name, value)
                }
            }

            for (const evt of events) {
                element.addEventListener(evt.name, evtMap[evt.value].bind(element))
            }

            for (let child of children) {
                child = generateDomTree(child)
                if (child) element.appendChild(child)
            }

            return element
        } else if (type === 'text') {
            return document.createTextNode(content
                .replace(/&nbsp;/g, '\u00A0')
                .replace(/&ensp;/g, '\u2002')
                .replace(/&emsp;/g, '\u2003')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&apos;/g, '\'')
                .replace(/&amp;/g, '&'))
        } else if (type === 'comment') {
            return document.createComment()
        }
    }
    const fragment = document.createDocumentFragment()
    let node = null
    evtMap['1650862904847'] = function () {
        console.log('123')
    }
    node = generateDomTree({
        "type": "element",
        "tagName": "div",
        "attrs": [{"name": "id", "value": "app"}],
        "unary": false,
        "children": [{
            "type": "element",
            "tagName": "div",
            "attrs": [{"name": "class", "value": "cnt"}],
            "unary": false,
            "children": [{"type": "text", "content": "cnt div"}]
        }, {
            "type": "element",
            "tagName": "button",
            "attrs": [{"name": "onclick", "value": "1650862904847"}],
            "unary": false,
            "children": [{"type": "text", "content": "点击按钮"}]
        }, {
            "type": "element",
            "tagName": "ul",
            "attrs": [],
            "unary": false,
            "children": [{"type": "comment", "content": "这是一段注释"}, {
                "type": "element",
                "tagName": "li",
                "attrs": [],
                "unary": false,
                "children": [{"type": "text", "content": "item1"}]
            }, {
                "type": "element",
                "tagName": "li",
                "attrs": [],
                "unary": false,
                "children": [{"type": "text", "content": "item2"}]
            }, {
                "type": "element",
                "tagName": "li",
                "attrs": [],
                "unary": false,
                "children": [{"type": "text", "content": "item3"}]
            }]
        }]
    })
    if (node) fragment.appendChild(node)
    return fragment
}
    