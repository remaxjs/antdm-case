## How to?
- 安装依赖：  
使用了`yarn workspace`特性，务必使用`yarn`安装依赖
命令行执行 `yarn` 安装依赖


- 运行 spec/h5-code 里的构建命令   
`npm run dev`

- 使用微信小程序开发者工具打开 spec/wechat 目录   

可以看到`spec/h5-code/fragments/react-code`的代码执行结果
使用了 react 和 antd-mobile
```
import React, {useState} from 'react'
import { render } from 'react-dom';
import { Button } from 'antd-mobile';

import './index.css';
import 'antd-mobile/es/components/button/button.css';

const App = () => {

    const [state, setState] = useState(0);

    const inputProps = {
        autofocus: true,
        'confirm-type': 'search',
    }
    return (
        <div>
          <div>不同颜色的按钮</div>
          <Button
            onClick={() => {
              console.log('hello.');
              window.alert('world');
            }}
          >
            Default
          </Button>
          <Button color='primary'>Primary</Button>
          <Button color='success'>Success</Button>
          <Button color='danger'>Danger</Button>
          <Button color='warning'>Warning</Button>
          <div style={{ height: 10 }}></div>
          <div>块级按钮</div>
          <Button block color='primary' size='large'>
            Block Button
          </Button>
          <div style={{ height: 10 }}></div>
          <div>填充模式</div>
          <Button color='primary' fill='solid'>
            Solid
          </Button>
          <Button color='primary' fill='outline'>
            Outline
          </Button>
          <Button color='primary' fill='none'>
            None
          </Button>
          <div style={{ height: 10 }}></div>
          <div>不同大小的按钮</div>
          <Button size='mini' color='primary'>
            Mini
          </Button>
          <Button size='small' color='primary'>
            Small
          </Button>
          <Button size='middle' color='primary'>
            Middle
          </Button>
          <Button size='large' color='primary'>
            Large
          </Button>
        </div>
    )
}

export default function () {
    const container = document.createElement('div')
    container.id = 'app'

    render(<App/>, container);
    return container;
}
```

修改 spec/h5-code/fragments/react-code/index.jsx    
项目应该如期变化
