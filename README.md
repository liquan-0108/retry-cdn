# retry-cdn
## 说明
CDN资源报错时进行CDN域名自动切换，防止页面GG
## 使用
一、将retry-cdn.js文件放到 ```<head>``` 标签中，并置于所有资源之前。

二、定义备用域名列表，创建RetryCDN对象

```javascript
   <script>
      const urlArr = [
        'https://cdnjs.cloudflare.com',
        'https://images.unsplash.com',
        'https://plus.unsplash.com',
      ]
      const retry = new RetryCDN(urlArr)
    </script>
````

## 背景图切换原理
在DOMContentLoaded之后先取出当前第一个背景链接查看是否有效，如无效则拼备用域名全部列表，然后取出能正常访问的域名再进行统一替换
### 限制
因无法监听到背景图的报错，所以默认全部的背景图必须用的是同一个域名。
### 优点
直接从域名列表中取出正确的域名进行统一替换，减少资源重试次数