const mock = require('../mock')

let window

beforeAll(() => {
    const res = mock.createPage('home')
    window = res.window
})

test('history', () => {
    const location = window.location
    const history = window.history
    window.$$miniprogram.init('https://sub.host.com:8080/p/a/t/h?query=string#hash')
    let popStateCount = 0
    let hashChangeCount = 0
    let state = null
    const onPopState = evt => {
        state = evt.state
        popStateCount++
    }
    const onHashChange = () => {
        hashChangeCount++
    }
    history.addEventListener('popstate', onPopState)
    location.addEventListener('hashchange', onHashChange)

    expect(history.length).toBe(1)
    expect(history.state).toBe(null)
    expect(popStateCount).toBe(0)
    expect(hashChangeCount).toBe(0)

    // pushState
    global.expectTitle = 'test1'
    history.pushState({a: 1}, global.expectTitle, '#123')
    expect(history.length).toBe(2)
    expect(history.state).toEqual({a: 1})
    expect(location.href).toBe('https://sub.host.com:8080/p/a/t/h?query=string#123')
    global.expectTitle = 'test2'
    history.pushState({b: 2}, global.expectTitle, '/test#321')
    expect(history.length).toBe(3)
    expect(history.state).toEqual({b: 2})
    expect(location.href).toBe('https://sub.host.com:8080/test#321')
    global.expectTitle = 'test3'
    history.pushState({c: 3}, global.expectTitle, 'https://sub.host.com:8080/haha/hehe?a=123#/my-hash')
    expect(history.length).toBe(4)
    expect(history.state).toEqual({c: 3})
    expect(location.href).toBe('https://sub.host.com:8080/haha/hehe?a=123#/my-hash')
    history.pushState({d: 4}, 'xxxxx', 'https://sub.host.com/haha/hehe?a=123#/my-hash') // 跨域，不支持
    expect(history.length).toBe(4)
    expect(history.state).toEqual({c: 3})
    expect(location.href).toBe('https://sub.host.com:8080/haha/hehe?a=123#/my-hash')

    // replaceState
    global.expectTitle = 'test11'
    history.replaceState({aa: 1}, global.expectTitle, '#other-hash')
    expect(history.length).toBe(4)
    expect(history.state).toEqual({aa: 1})
    expect(location.href).toBe('https://sub.host.com:8080/haha/hehe?a=123#other-hash')
    global.expectTitle = 'test22'
    history.replaceState({bb: 2}, global.expectTitle, '/test#123')
    expect(history.length).toBe(4)
    expect(history.state).toEqual({bb: 2})
    expect(location.href).toBe('https://sub.host.com:8080/test#123')
    global.expectTitle = 'test33'
    history.replaceState({cc: 3}, global.expectTitle, 'https://sub.host.com:8080/yoyo/qiegenao?cc=aa&dd=xx#/hi/hello')
    expect(history.length).toBe(4)
    expect(history.state).toEqual({cc: 3})
    expect(location.href).toBe('https://sub.host.com:8080/yoyo/qiegenao?cc=aa&dd=xx#/hi/hello')
    history.replaceState({dd: 4}, 'xxxxx', 'http://sub.host.com/yoyo/qiegenao?cc=aa&dd=xx#123') // 跨域，不支持
    expect(history.length).toBe(4)
    expect(history.state).toEqual({cc: 3})
    expect(location.href).toBe('https://sub.host.com:8080/yoyo/qiegenao?cc=aa&dd=xx#/hi/hello')

    // location 的变化接入 history
    expect(hashChangeCount).toBe(0)
    location.hash = '#/ppp/ooo'
    expect(history.length).toBe(5)
    expect(history.state).toBe(null)
    expect(hashChangeCount).toBe(1)
    location.href = 'https://sub.host.com:8080/index/aaa/#/'
    expect(history.length).toBe(6)
    expect(history.state).toBe(null)
    expect(hashChangeCount).toBe(1)
    location.href = 'https://sub.host.com:8080/index/aaa/#/123'
    expect(history.length).toBe(7)
    expect(history.state).toBe(null)
    expect(hashChangeCount).toBe(2)
    location.replace('https://sub.host.com:8080/index/bbb/#/other') // location.replace 不进入 history
    expect(history.length).toBe(7)
    expect(history.state).toBe(null)
    expect(hashChangeCount).toBe(2)
    location.replace('https://sub.host.com:8080/index/bbb/#/321') // location.replace 不进入 history
    expect(history.length).toBe(7)
    expect(history.state).toBe(null)
    expect(hashChangeCount).toBe(3)

    // go/back/forward
    expect(popStateCount).toBe(0)
    history.back()
    history.back()
    expect(popStateCount).toBe(2)
    expect(state).toBe(null)
    expect(location.href).toBe('https://sub.host.com:8080/yoyo/qiegenao?cc=aa&dd=xx#/ppp/ooo')
    expect(hashChangeCount).toBe(5)
    history.back()
    expect(popStateCount).toBe(3)
    expect(state).toEqual({cc: 3})
    expect(location.href).toBe('https://sub.host.com:8080/yoyo/qiegenao?cc=aa&dd=xx#/hi/hello')
    expect(hashChangeCount).toBe(6)
    history.go(-2)
    expect(popStateCount).toBe(4)
    expect(state).toEqual({a: 1})
    expect(location.href).toBe('https://sub.host.com:8080/p/a/t/h?query=string#123')
    expect(hashChangeCount).toBe(7)
    history.forward()
    expect(popStateCount).toBe(5)
    expect(state).toEqual({b: 2})
    expect(location.href).toBe('https://sub.host.com:8080/test#321')
    expect(hashChangeCount).toBe(8)
    history.go(-2)
    expect(popStateCount).toBe(6)
    expect(state).toBe(null)
    expect(location.href).toBe('https://sub.host.com:8080/p/a/t/h?query=string#hash')
    expect(hashChangeCount).toBe(9)
    history.go(3)
    expect(popStateCount).toBe(7)
    expect(state).toEqual({cc: 3})
    expect(location.href).toBe('https://sub.host.com:8080/yoyo/qiegenao?cc=aa&dd=xx#/hi/hello')
    expect(hashChangeCount).toBe(10)

    // 在栈中间调 replaceState/pushState
    expect(history.length).toBe(7)
    expect(history.state).toEqual({cc: 3})
    global.expectTitle = 'xxxxx'
    history.replaceState({cc: 4}, global.expectTitle, '#/bye')
    expect(history.length).toBe(7)
    expect(history.state).toEqual({cc: 4})
    history.pushState({dd: 5}, global.expectTitle, '#/goodbye')
    expect(history.length).toBe(5)
    expect(history.state).toEqual({dd: 5})

    location.removeEventListener('hashchange', onHashChange)
})
