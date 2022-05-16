const JsDom = require('jsdom').JSDOM
const mock = require('../mock')
const QuerySelector = require('../../src/tree/query-selector')

const querySelector = new QuerySelector()

function toArray(list) {
    return Array.prototype.slice.apply(list)
}

function getExtra(document) {
    return {
        idMap: {
            bb: document.getElementById('bb'),
            bb4: document.getElementById('bb4'),
        },
        tagMap: {
            DIV: toArray(document.getElementsByTagName('div')),
            SPAN: toArray(document.getElementsByTagName('span')),
            HEADER: toArray(document.getElementsByTagName('header')),
            FOOTER: toArray(document.getElementsByTagName('footer')),
            'WX-COMPONENT': toArray(document.getElementsByTagName('wx-component')),
        },
        classMap: {
            aa: toArray(document.getElementsByClassName('aa')),
            bb: toArray(document.getElementsByClassName('bb')),
            bb1: toArray(document.getElementsByClassName('bb1')),
            bb2: toArray(document.getElementsByClassName('bb2')),
            bb3: toArray(document.getElementsByClassName('bb3')),
            bb4: toArray(document.getElementsByClassName('bb4')),
        },
    }
}

test('query-selector: parse selector', () => {
    // 标签选择器
    expect(querySelector.parse('tag')).toEqual([{tag: 'tag'}])

    // id 选择器
    expect(querySelector.parse('#id')).toEqual([{tag: '*', id: 'id'}])

    // 类选择器
    expect(querySelector.parse('.class')).toEqual([{tag: '*', class: ['class']}])
    expect(querySelector.parse('.class1.class2')).toEqual([{tag: '*', class: ['class1', 'class2']}])

    // 亲属选择器
    expect(querySelector.parse('a b')).toEqual([{tag: 'a', kinship: ' '}, {tag: 'b'}])
    expect(querySelector.parse('a > b')).toEqual([{tag: 'a', kinship: '>'}, {tag: 'b'}])
    expect(querySelector.parse('a + b')).toEqual([{tag: 'a', kinship: '+'}, {tag: 'b'}])

    // 基本组合
    expect(querySelector.parse('tag #id .class')).toEqual([
        {tag: 'tag', kinship: ' '},
        {tag: '*', id: 'id', kinship: ' '},
        {tag: '*', class: ['class']},
    ])
    expect(querySelector.parse('tag#id.class1.class2')).toEqual([{tag: 'tag', id: 'id', class: ['class1', 'class2']}])

    // 伪类选择器
    expect(querySelector.parse('#id .class:pseudo-class')).toEqual([
        {tag: '*', id: 'id', kinship: ' '},
        {tag: '*', class: ['class'], pseudo: [{name: 'pseudo-class'}]}
    ])
    expect(querySelector.parse('#id .class:pseudo-class(1)')).toEqual([
        {tag: '*', id: 'id', kinship: ' '},
        {tag: '*', class: ['class'], pseudo: [{name: 'pseudo-class', param: '1'}]}
    ])
    expect(querySelector.parse('#id .class:first-child')).toEqual([
        {tag: '*', id: 'id', kinship: ' '},
        {tag: '*', class: ['class'], pseudo: [{name: 'first-child'}]}
    ])
    expect(querySelector.parse('#id .class:last-child')).toEqual([
        {tag: '*', id: 'id', kinship: ' '},
        {tag: '*', class: ['class'], pseudo: [{name: 'last-child'}]}
    ])
    expect(querySelector.parse('#id .class:nth-child(3)')).toEqual([
        {tag: '*', id: 'id', kinship: ' '},
        {tag: '*', class: ['class'], pseudo: [{name: 'nth-child', param: {a: 0, b: 3}}]}
    ])
    expect(querySelector.parse('#id .class:nth-child(2n+1)')).toEqual([
        {tag: '*', id: 'id', kinship: ' '},
        {tag: '*', class: ['class'], pseudo: [{name: 'nth-child', param: {a: 2, b: 1}}]}
    ])
    expect(querySelector.parse('#id .class:nth-child(2n-1)')).toEqual([
        {tag: '*', id: 'id', kinship: ' '},
        {tag: '*', class: ['class'], pseudo: [{name: 'nth-child', param: {a: 2, b: -1}}]}
    ])

    expect(querySelector.parse('#id .class:nth-of-type(even)')).toEqual([
        {tag: '*', id: 'id', kinship: ' '},
        {tag: '*', class: ['class'], pseudo: [{name: 'nth-of-type', param: {a: 2, b: 2}}]}
    ])

    expect(querySelector.parse('#id .class:nth-of-type(3)')).toEqual([
        {tag: '*', id: 'id', kinship: ' '},
        {tag: '*', class: ['class'], pseudo: [{name: 'nth-of-type', param: {a: 0, b: 3}}]}
    ])

    expect(querySelector.parse('#id .class:nth-of-type(2n+1)')).toEqual([
        {tag: '*', id: 'id', kinship: ' '},
        {tag: '*', class: ['class'], pseudo: [{name: 'nth-of-type', param: {a: 2, b: 1}}]}
    ])

    // 属性选择器
    expect(querySelector.parse('#id .class[name=value]')).toEqual([
        {tag: '*', id: 'id', kinship: ' '},
        {tag: '*', class: ['class'], attr: [{name: 'name', opr: '=', val: 'value'}]}
    ])
    expect(querySelector.parse('#id .class[name^=value]')).toEqual([
        {tag: '*', id: 'id', kinship: ' '},
        {tag: '*', class: ['class'], attr: [{name: 'name', opr: '^=', val: 'value'}]}
    ])

    // 内置组件
    expect(querySelector.parse('#id wx-xxx')).toEqual([
        {tag: '*', id: 'id', kinship: ' '},
        {tag: 'wx-xxx'}
    ])

    // 其他组合
    expect(querySelector.parse('#id .class > :last-child')).toEqual([
        {tag: '*', id: 'id', kinship: ' '},
        {tag: '*', class: ['class'], kinship: '>'},
        {tag: '*', pseudo: [{name: 'last-child'}]}
    ])
})

test('query-selector: exec select', () => {
    const jsDom = new JsDom(mock.html)
    const window = jsDom.window
    const document = window.document

    // 兼容
    window.HTMLCollection.prototype.indexOf = function(item, from) {
        const array = toArray(this)
        return array.indexOf(item, from)
    }

    expect(querySelector.exec('#bb .bb1', getExtra(document))[0]).toBe(document.body.querySelector('#bb .bb1'))
    expect(querySelector.exec('div.bb header', getExtra(document))[0]).toBe(document.body.querySelector('div.bb header'))

    const res1 = querySelector.exec('.bb footer > .bb4', getExtra(document))
    const res2 = document.body.querySelectorAll('.bb footer > .bb4')
    expect(res1[0]).toBe(res2[0])
    expect(res1[1]).toBe(res2[1])
    expect(res1[2]).toBe(res2[2])

    expect(querySelector.exec('.bb footer > .bb4:nth-child(2)', getExtra(document))[0]).toBe(document.body.querySelector('.bb footer > .bb4:nth-child(2)'))
    expect(querySelector.exec('.bb footer > .bb4:first-child', getExtra(document))[0]).toBe(document.body.querySelector('.bb footer > .bb4:first-child'))
    expect(querySelector.exec('.bb footer > .bb4:last-child', getExtra(document))[0]).toBe(document.body.querySelector('.bb footer > .bb4:last-child'))

    const res3 = querySelector.exec('.bb footer > .bb4:nth-child(2n-1)', getExtra(document))
    const res4 = document.body.querySelectorAll('.bb footer > .bb4:nth-child(2n-1)')
    expect(res3[0]).toBe(res4[0])
    expect(res3[1]).toBe(res4[1])

    const res5 = querySelector.exec('[data-key]', getExtra(document))
    const res6 = document.body.querySelector('[data-key]')
    expect(res5[0]).toBe(res6)
    const res7 = querySelector.exec('[data-key="value"]', getExtra(document))
    const res8 = document.body.querySelector('[data-key="value"]')
    expect(res7[0]).toBe(res8)

    const res9 = querySelector.exec('.bb footer > .bb4:nth-of-type(2n+1)', getExtra(document))
    const res10 = document.body.querySelectorAll('.bb footer > .bb4:nth-of-type(2n+1)')
    expect(res9[0].innerHTML).toBe('1')
    expect(res9[1].innerHTML).toBe('3')
    expect(res9[0]).toBe(res10[0])
    expect(res9[1]).toBe(res10[1])

    const res11 = querySelector.exec('.bb footer > :last-child', getExtra(document))
    const res12 = querySelector.exec('.bb footer > :last-child', getExtra(document))
    expect(res11[0].innerHTML).toBe('3')
    expect(res11[0]).toBe(res12[0])

    // jsDom 的 dom 对象要手动设置 behavior 属性
    document.body.querySelector('.bb wx-component[behavior=view]').behavior = 'view'
    document.body.querySelector('.bb wx-component[behavior=text]').behavior = 'text'
    expect(querySelector.exec('.bb wx-view', getExtra(document))[0]).toBe(document.body.querySelector('.bb wx-component[behavior=view]'))
    expect(querySelector.exec('.bb wx-text', getExtra(document))[0]).toBe(document.body.querySelector('.bb wx-component[behavior=text]'))
})
