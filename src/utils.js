export default class Util {
    /**
     * 获取背景图片url
     * @param {backgroundImageString} String
    */
    static getBgUrl(backgroundImageString) {
        // 使用正则表达式匹配链接
        var match = backgroundImageString.match(/url\(['"]?(.*?)['"]?\)/);
        // 提取匹配到的链接
        var imageURL = match ? match[1] : null;
        // 输出链接
        return imageURL
    }

    /**
     * 背景图是否可用（更节省流量）
     * @param {url} String
    */
    static checkValidity(url) {
        return new Promise((resolve)=>{
            var xhr = new XMLHttpRequest();
            xhr.open('HEAD', url, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    xhr.status === 200 ? resolve(url) : resolve(false)
                }
            };
            xhr.send();
        })
    }

    /**
     * 发起多个请求,获取第一个成功的结果
     * @param {urlArr} Array
    */
    static async getOneSuccUrl(urlArr) {
        const results = await Promise.allSettled(urlArr.map(url => this.checkValidity(url)));
        const succ = results.find(result => result.status === 'fulfilled' && result.value);
        if (succ) {
            return succ.value;
        } else {
            return Promise.reject('CDN all fail');
        }
    }

    /**
     * 添加script标签
     * @param {url} String
     * @param {defer} Boolean
     * @param {async} Boolean
    */
    static createScript (url,defer,async){
        var script = document.createElement('script');
        script.defer = defer;
        script.async = async;
        script.type = 'text/javascript';
        script.src = url;
        document.head.appendChild(script);
    }

    /**
     * 添加link标签
     * @param {url} String
    */
    static createLink (url){
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        document.head.appendChild(link);
    }

    /**
     * 判断是否绝对路径
     * @param {path} String
    */
    static isAbsolutePath(path) {
        // 匹配以 http、https、ftp、ftps 或双斜杠开头的路径
        return /^(https?|ftp)s?:\/\/|(www\.)|\/\//.test(path);
    }

    /**
     * 解析URL
     * @param {urlString} String
    */
    static parseUrl(urlString){
        const urlParts = /^(?:(https?):)?(?:\/\/([^\/?#]+))?(\/[^\?#]*)?(\?[^\#]*)?(#.*)?$/.exec(urlString);
        if (!urlParts) {
            throw new Error('Invalid URL');
        }
        const protocol = urlParts[1] || '';
        const hostname = urlParts[2];
        const pathname = urlParts[3] || '/';
        const search = urlParts[4] ? `?${urlParts[4].substring(1)}` : null;
        const hash = urlParts[5] ? urlParts[5].substring(1) : null;
        const origin = `${protocol ? (protocol + ':') :''}//${hostname}`
        return {
            protocol,
            hostname,
            pathname,
            search,
            hash,
            origin // 添加 origin 属性
        };
    }
}
