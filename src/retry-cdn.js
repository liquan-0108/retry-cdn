import Util from './utils.js'

export default class RetryCDN {
    constructor(domainArr){
        if (domainArr === void 0) { opts = []; }
        this.domainArr = domainArr;  // 替换域名
        this.scriptError = new Map();  // 
        this.scriptAsyncError = new Map();  // 
        this.imgError = new Map();  // 
        this.linkError = new Map(); // 
        this.cantUseBgimg = new Map();  // 不能使用的背景
        this.init ();
    }
    /**
     *  自动尝试img 和 script
    */
    init() {
        const tagToFunction = {
            'SCRIPT': this.retryJsSrc.bind(this),
            'IMG': this.retryImgSrc.bind(this),
            'LINK': this.retryLinkSrc.bind(this)
        };
        window.addEventListener('error', (error) => {
            try {
                const target = error.target;
                const tagName = target.tagName;
                const retryFunction = tagToFunction[tagName];
                if (retryFunction && Util.isAbsolutePath(target.src || target.href)) {
                    retryFunction(target);
                }
            } catch (error) {
                console.log('error',error);
            }
        },true);
        // 自动尝试css背景域名
        window.addEventListener('DOMContentLoaded', () => {
            this.getAllStyleSheets()
            this.setStyle()
        })
    }

    /**
     * 重试script
     * @param {element.target} target 
     * 
    */
    retryJsSrc (target){
        const { pathname, search } = Util.parseUrl(target.src);
        if(target.defer || target.async){
            const { state , num } = this.setErrorMap(this.scriptAsyncError,pathname)
            if(!state) {
                return
            };
            const newUrl = `${ this.domainArr[num-1] }${ pathname }${ search ? search : '' }`;
            Util.createScript(newUrl,target.defer,target.async)
        }else{
            const { state , num } = this.setErrorMap(this.scriptError,pathname);
            // 缓存正常的cdn
            if(!state) {
                return
            };
            const newUrl = `${ this.domainArr[num-1] }${ pathname }${ search ? search : '' }`;
            document.write(`<script src="${newUrl}"></script>`);
        }
    }

    /**
     * 重试link
     * @param {element.target} target 
     * 
    */
    retryLinkSrc (target){
        const { pathname, search } = Util.parseUrl(target.href);
        const { state , num } = this.setErrorMap(this.linkError,pathname)
        if(!state) {
            return
        };
        const newUrl = `${ this.domainArr[num-1] }${ pathname }${ search ? search : '' }`;
        Util.createLink(newUrl)
    }

    /**
     * 重试img
     * @param {element.target} target 
     * 
    */
    retryImgSrc(target) {
        const { state , num } = this.setErrorMap(this.imgError,target);
        if(!state) return;
        // 拼接新url,并重试
        const { pathname, search } = Util.parseUrl(target.src);
        const newUrl = `${ this.domainArr[num-1]}${ pathname }${ search ? search : '' }`;
        target.src = newUrl;
    }

    /**
     *  存储报错信息
     *  @param {map} errorMap 
     *  @param {map} target  element.target
     *  @returns {object} 重试状态和次数
     * **/
    setErrorMap(errorMap,target) {
        // 获取重试次数  
        var num = errorMap.get(target) || 0;
        // 重试次数是否大于备选cdn域名的个数，大于则说明重试完毕，都挂了，不在进行重试
        if(num >= this.domainArr.length){
            return {
                state: false,
                num
            };
        } 
        errorMap.set(target,++num);
        return {
            state: true,
            num
        };
    }
    /**
     * 获取全部样式-因为浏览器同源策略问题只能拿到同域名或style标签的样式
     * 
    */
    getAllStyleSheets() {
        var arrSheet = Array.from(document.styleSheets)
        for (const CSSStyleSheet of arrSheet) {
            const styleRule = this.hasRule(CSSStyleSheet)
            if(!styleRule) continue;
            try {
                // 遍历获取css背景图，并尝试访问是否成功
                for (let index = 0; index < styleRule.length; index++) {
                    const element = styleRule[index];
                    if(!element.style) continue;
                    // 获取背景url
                    const bgUrl = Util.getBgUrl(element.style.backgroundImage)
                    if (!bgUrl || !Util.isAbsolutePath(bgUrl)) continue 
                    // 存储CSSStyleSheet 和 背景出错的css选择器，用来之后替换背景
                    if (this.cantUseBgimg.has(CSSStyleSheet)) {
                        const CSSStyleSheetValue = this.cantUseBgimg.get(CSSStyleSheet)
                        CSSStyleSheetValue.push({
                            selectorText: element.selectorText,
                            bgUrl: bgUrl,
                            retryNum:0
                        })
                    } else {
                        this.cantUseBgimg.set(CSSStyleSheet,[{
                            selectorText: element.selectorText,
                            bgUrl: bgUrl,
                            retryNum:0
                        }])
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
    }
    /**
     * 添加样式
     * 
    */
    async setStyle() {
        try {
            // 是否有样式
            if(this.cantUseBgimg.size === 0) return
            // 获取CSSStyleSheet中的第一个背景图，尝试可用CDN
            const iterator = this.cantUseBgimg.entries();
            const firstEntry = iterator.next().value;
            const bgUrl = firstEntry[1][0].bgUrl;
            // 当前bgUrl是否可用，可用就不在替换
            const currentUse = await Util.checkValidity(bgUrl)
            if(currentUse) return
            // 获取第一个背景图的全部备用CDN链接，并尝试访问，拿到正常的domain
            const urlArr = this.getAllUrlArr(bgUrl)
            const result = await Util.getOneSuccUrl(urlArr)
            const { origin : succDomain } = Util.parseUrl(result);
            // 遍历所有的CSSStyleSheet，并将异常的背景图域名替换成可以正常放访问的domain
            this.cantUseBgimg.forEach((selectArr, CSSStyleSheet) => {
                selectArr.forEach((selectObj) => {
                    const { pathname , search } = Util.parseUrl(selectObj.bgUrl);
                    const bgUrlDomain = `${ succDomain }${ pathname }${ search ? search : '' }`;
                    CSSStyleSheet.insertRule(`${selectObj.selectorText} { background-image: url(${bgUrlDomain}) !important; }`, CSSStyleSheet.cssRules.length);
                })
            })
        } catch (error) {
            console.error("发生错误：", error);
        }
    }

    /**
     *  是否获取到css样式
     *  @param {CSSStyleSheet} styleSheets
     * 
    */
    hasRule(styleSheets) {
        try {
           return styleSheets.rules;
        } catch (error) {
            try {
                return styleSheets.cssRules;
            } catch (error) {
                return null;
            }
        }
    }

    /**
     *  获取背景图的全部CDN链接
     *  @param {string} bgUrl - 背景url链接
     * 
    */
    getAllUrlArr(bgUrl) {
        const { pathname, search } = Util.parseUrl(bgUrl);
        var urlArr =  this.domainArr.map((domain)=>{
            return  `${domain}${pathname}${search ? search : '' }`
        })
        return urlArr
    }
}
