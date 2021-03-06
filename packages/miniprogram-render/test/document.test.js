const mock = require('./mock')
const Element = require('../src/node/element')
const TextNode = require('../src/node/text-node')
const Comment = require('../src/node/comment')
const Node = require('../src/node/node')

let window
let document

beforeAll(() => {
    const res = mock.createPage('home')
    window = res.window
    document = res.document
})

test('document: $$setCookie', () => {
    expect(document.cookie).toBe('')
    const setCookie = 'aaa=1111-2222-33-444-abcdefgasd; path=/; expires=Mon, 18 Jan 2038 19:14:07 GMT; secure,bbb=23123-aswe-4a7a-a740-f55dfd296b1d; path=/; expires=Mon, 18 Jan 2038 19:14:07 GMT,ccc=69asd3d81234668942; path=/; expires=Mon, 18 Jan 2038 19:14:07 GMT'
    document.$$setCookie(setCookie)
    expect(document.cookie).toBe('aaa=1111-2222-33-444-abcdefgasd; bbb=23123-aswe-4a7a-a740-f55dfd296b1d; ccc=69asd3d81234668942')
})

test('document: nodeType', () => {
    expect(document.nodeType).toBe(Node.DOCUMENT_NODE)
})

test('document: documentElement/children/childNodes', () => {
    expect(document.documentElement).toBeInstanceOf(Element)
    expect(document.documentElement.tagName).toBe('HTML')
    expect(document.documentElement.parentNode).toBe(document)

    const children = document.children
    expect(children.length).toBe(1)
    expect(children[0]).toBe(document.documentElement)
    const childNodes = document.childNodes
    expect(childNodes.length).toBe(1)
    expect(childNodes[0]).toBe(document.documentElement)
})

test('document: body', () => {
    expect(document.body).toBeInstanceOf(Element)
    expect(document.body.tagName).toBe('BODY')
})

test('document: nodeName', () => {
    expect(document.nodeName).toBe('#document')
})

test('document: head', () => {
    expect(document.head).toBeInstanceOf(Element)
    expect(document.head.tagName).toBe('HEAD')
})

test('document: defaultView', () => {
    expect(document.defaultView).toBe(window)
})

test('document: URL', () => {
    expect(document.URL).toBe(window.location.href)
})

test('document: cookie', () => {
    // TODO
})

test('document: getElementById', () => {
    document.documentElement.id = 'html'
    expect(document.getElementById('html')).toBe(document.documentElement)

    const node1 = document.getElementById('bb')
    expect(node1).toBeInstanceOf(Element)
    expect(node1.tagName).toBe('DIV')
    expect(node1.id).toBe('bb')

    const node2 = document.getElementById('bb4')
    expect(node2).toBeInstanceOf(Element)
    expect(node2.tagName).toBe('SPAN')
    expect(node2.id).toBe('bb4')

    expect(document.getElementById('aa')).toBe(null)
})

test('document: getElementsByTagName', () => {
    expect(document.getElementsByTagName('html')[0]).toBe(document.documentElement)

    const nodes = document.getElementsByTagName('span')
    expect(nodes.length).toBe(3)
    expect(nodes[0]).toBeInstanceOf(Element)
    expect(nodes[0].tagName).toBe('SPAN')
    expect(nodes[1]).toBeInstanceOf(Element)
    expect(nodes[1].tagName).toBe('SPAN')
    expect(nodes[2]).toBeInstanceOf(Element)
    expect(nodes[2].tagName).toBe('SPAN')
})

test('document: getElementsByClassName', () => {
    document.documentElement.classList.add('html')
    expect(document.getElementsByClassName('html')[0]).toBe(document.documentElement)

    const nodes = document.getElementsByClassName('bb4')
    expect(nodes.length).toBe(3)
    expect(nodes[0]).toBeInstanceOf(Element)
    expect(nodes[0].tagName).toBe('SPAN')
    expect(nodes[1]).toBeInstanceOf(Element)
    expect(nodes[1].tagName).toBe('SPAN')
    expect(nodes[2]).toBeInstanceOf(Element)
    expect(nodes[2].tagName).toBe('SPAN')
})

test('document: getElementsByName', () => {
    const nodes1 = document.getElementsByName('n1')
    expect(nodes1.length).toBe(2)
    expect(nodes1[0]).toBeInstanceOf(Element)
    expect(nodes1[0].getAttribute('name')).toBe('n1')
    expect(nodes1[1]).toBeInstanceOf(Element)
    expect(nodes1[1].getAttribute('name')).toBe('n1')
    const nodes2 = document.getElementsByName('n2')
    expect(nodes2.length).toBe(1)
    expect(nodes2[0]).toBeInstanceOf(Element)
    expect(nodes2[0].getAttribute('name')).toBe('n2')
})

test('document: querySelector', () => {
    expect(document.querySelector('html')).toBe(document.documentElement)

    const node1 = document.querySelector('#bb')
    expect(node1).toBeInstanceOf(Element)
    expect(node1.tagName).toBe('DIV')
    expect(node1.id).toBe('bb')

    const node2 = document.querySelector('#bb .bb4')
    expect(node2).toBeInstanceOf(Element)
    expect(node2.tagName).toBe('SPAN')
    expect(node2.id).toBe('bb4')

    expect(document.querySelector('#aa')).toBe(null)
    expect(document.querySelector('body')).toBe(document.body)
    expect(document.querySelector('html body')).toBe(document.body)
})

test('document: querySelectorAll', () => {
    expect(document.querySelectorAll('html')[0]).toBe(document.documentElement)

    const nodes = document.querySelectorAll('#bb .bb4')
    expect(nodes.length).toBe(3)
    expect(nodes[0]).toBeInstanceOf(Element)
    expect(nodes[0].tagName).toBe('SPAN')
    expect(nodes[0].id).toBe('bb4')
    expect(nodes[1]).toBeInstanceOf(Element)
    expect(nodes[1].tagName).toBe('SPAN')
    expect(nodes[2]).toBeInstanceOf(Element)
    expect(nodes[2].tagName).toBe('SPAN')

    expect(document.querySelectorAll('html #bb .bb4').length).toBe(3)
    expect(document.querySelectorAll('#aa').length).toBe(0)
})

test('document: createElement/createElementNS', () => {
    const node1 = document.createElement('div')
    expect(node1).toBeInstanceOf(Element)
    expect(node1.tagName).toBe('DIV')

    const node2 = document.createElement('span')
    expect(node2).toBeInstanceOf(Element)
    expect(node2.tagName).toBe('SPAN')

    const node3 = document.createElementNS('xxx', 'div')
    expect(node3).toBeInstanceOf(Element)
    expect(node3.tagName).toBe('DIV')

    const node4 = document.createElement('img')
    expect(node4).toBeInstanceOf(Element)
    expect(node4.tagName).toBe('IMG')

    const node5 = document.createElement('iframe')
    expect(node5).toBeInstanceOf(Element)
    expect(node5.tagName).toBe('IFRAME')
})

test('document: createTextNode', () => {
    const node1 = document.createTextNode('123')
    expect(node1).toBeInstanceOf(TextNode)
    expect(node1.textContent).toBe('123')

    const node2 = document.createTextNode('321')
    expect(node2).toBeInstanceOf(TextNode)
    expect(node2.textContent).toBe('321')
})

test('document: createComment', () => {
    const node1 = document.createComment('123')
    expect(node1).toBeInstanceOf(Comment)

    const node2 = document.createComment('321')
    expect(node2).toBeInstanceOf(Comment)

    const parent = document.createElement('div')
    const child = document.createElement('div')
    parent.appendChild(child)
    expect(parent.childNodes).toEqual([child])
    parent.appendChild(node1)
    expect(parent.childNodes).toEqual([child, node1])
    parent.insertBefore(node1, child)
    expect(parent.childNodes).toEqual([node1, child])
    parent.replaceChild(node2, child)
    expect(parent.childNodes).toEqual([node1, node2])
})

test('document: createDocumentFragment', () => {
    const parent = document.createElement('div')
    const node1 = document.createElement('div')
    const node2 = document.createElement('span')
    const node3 = document.createElement('div')
    const node4 = document.createElement('span')

    expect(parent.children).toEqual([])

    const fragment1 = document.createDocumentFragment()
    fragment1.appendChild(node1)
    fragment1.appendChild(node2)
    fragment1.appendChild(node3)
    parent.appendChild(fragment1)
    expect(fragment1.nodeType).toEqual(Node.DOCUMENT_FRAGMENT_NODE)
    expect(parent.children).toEqual([node1, node2, node3])

    const fragment2 = document.createDocumentFragment()
    fragment2.appendChild(node3)
    fragment2.appendChild(node4)
    parent.replaceChild(fragment2, node2)
    expect(parent.children).toEqual([node1, node3, node4])

    const fragment3 = document.createDocumentFragment()
    fragment3.appendChild(node2)
    fragment3.appendChild(node4)
    parent.insertBefore(fragment3, node3)
    expect(parent.children).toEqual([node1, node2, node4, node3])
})

test('document: createEvent', () => {
    const evt = document.createEvent('EVENT')

    expect(evt.timeStamp < 3600000).toBe(true)
    expect(evt).toBeInstanceOf(window.CustomEvent)

    evt.initEvent('test1')
    expect(evt.type).toBe('test1')
    expect(evt.bubbles).toBe(false)

    evt.initEvent('test2', true)
    expect(evt.type).toBe('test2')
    expect(evt.bubbles).toBe(true)
})

test('document: addEventListener/removeEventListener/dispatchEvent', () => {
    const evt = document.createEvent('EVENT')
    const res = []

    evt.initEvent('test1')
    const test1Handler = evt => res.push(evt.type)
    document.addEventListener('test1', test1Handler)
    document.dispatchEvent(evt)
    document.dispatchEvent(evt)
    document.removeEventListener('test1', test1Handler)
    document.dispatchEvent(evt)

    evt.initEvent('test2')
    const test2Handler = evt => res.push(evt.type)
    document.addEventListener('test2', test2Handler)
    document.dispatchEvent(evt)
    document.dispatchEvent(evt)
    document.removeEventListener('test2', test2Handler)
    document.dispatchEvent(evt)

    expect(res).toEqual(['test1', 'test1', 'test2', 'test2'])
})

test('document: scrollTop', () => {
    const div = document.createElement('div')
    document.body.appendChild(div)

    global.testScrollTop = 20

    div.scrollTop = 20
    expect(div.scrollTop).toBe(0)
    expect(global.testNextScrollTop).toBe(undefined)

    document.body.scrollTop = 20
    expect(document.body.scrollTop).toBe(0)
    expect(global.testNextScrollTop).toBe(undefined)

    document.documentElement.scrollTop = 20
    expect(document.documentElement.scrollTop).toBe(20)
    expect(global.testNextScrollTop).toBe(20)
})
