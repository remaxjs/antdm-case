// index.js
// 获取应用实例
const codeModule = require('../../h5code/react');
const mp = require('miniprogram-render')
const app = getApp();

Page({
  data: {
    motto: 'Hello World'
  },
  // 事件处理函数
  bindViewTap() {

  },
  onLoad() {
    const { window, document, pageId } = mp.createPage('index', {
      optimization: {},
      runtime: {}
    });
    const nodes = codeModule(window, document)();
    console.log(nodes)

    document.body.appendChild(nodes);
    this.setData({
      pageId
    });
  }
})
