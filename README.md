# retry-cdn
## 说明
CDN资源报错时进行CDN域名自动切换，防止页面GG
## 使用
将retry-cdn置于所有资源之前，定义备用域名列表，创建RetryCDN对象
### H5
```javascript
   <script>
      const urlArr = [
        'https://cdnjs.cloudflare.com',
        'https://images.unsplash.com',
        'https://plus.unsplash.com',
      ]
      const retry = new RetryCDN(urlArr)
    </script>
```

### webpack
main.js 中引入并实例化
```javascript
  import RetryCDN from 'path/retry-cdn.js';

  const urlArr = [
    'https://cdnjs.cloudflare.com',
    'https://images.unsplash.com',
    'https://plus.unsplash.com',
  ]
  new RetryCDN(urlArr)
```

### vite
  vite开发环境使用esbuild构建（只支持esm），需要另外引入安装`@originjs/vite-plugin-commonjs`

  
```javascript
  npm install retry-cdn --save-dev
  npm install @originjs/vite-plugin-commonjs --save-dev
```
vite.config.js中进行如下配置
```javascript
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'

export default defineConfig(({ mode, command }) => {
  ...
    plugins: [
      viteCommonjs()
    ],
  ...
})
```
main.js 中引入并实例化
```javascript
import RetryCDN from "retry-cdn";
  const urlArr = [
    'https://cdnjs.cloudflare.com',
    'https://images.unsplash.com',
    'https://plus.unsplash.com',
  ]
  new RetryCDN(urlArr)
```

## 背景图切换原理
在DOMContentLoaded之后先取出当前第一个背景链接查看是否有效，如无效则拼备用域名全部列表，然后取出能正常访问的域名再进行统一替换
### 限制
因无法监听到背景图的报错，所以默认全部的背景图必须用的是同一个域名。
### 优点
直接从域名列表中取出正确的域名进行统一替换，减少资源重试次数