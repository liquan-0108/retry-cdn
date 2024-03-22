import RetryCDN from "../src/retry-cdn";
import Util from "../src/utils";

// mock 依赖的工具库
jest.mock('../src/utils', () => ({
    getBgUrl: jest.fn(),
    checkValidity: jest.fn(),
    getOneSuccUrl: jest.fn(),
    createScript: jest.fn(),
    createLink: jest.fn(),
    isAbsolutePath: jest.fn(),
    parseUrl:jest.fn(),
}));

describe('test retryJsSrc state true', () => {
    let retryCDN;
    const resultUrl = 'https://cdnjs.cloudflare.com/ajax/libs/axios/1.6.8/axios.min.js'
    beforeEach(()=>{
        Util.parseUrl.mockReturnValue({
            protocol: "https",
            hostname: "cdnjs.cloudflare.com",
            pathname: '/ajax/libs/axios/1.6.8/axios.min.js',
            search: null,
            hash: null,
            origin: "https://cdnjs.cloudflare.com"
        });

        retryCDN = new RetryCDN([
            'https://cdnjs.cloudflare.com',
            'https://images.unsplash.com',
            'https://plus.unsplash.com',
        ])
    })

    test('Switch CDN for script', () => {
        const target = {
            src:'https://jjjjj/ajax/libs/axios/1.6.8/axios.min.js',
            defer:false,
            async:false
        }
        retryCDN.retryJsSrc(target);
        // 断言是否添加了script标签
        const scriptElement = document.head.querySelector(`script[src="${resultUrl}"]`);
        expect(Util.parseUrl).toHaveBeenCalledWith(target.src)
        expect(scriptElement).toBeTruthy();
    });

    test('Switch CDN for async script', () => {
        const target = {
            src:'https://jjjjj/ajax/libs/axios/1.6.8/axios.min.js',
            defer:false,
            async:true
        }
        retryCDN.retryJsSrc(target);
        // 断言
        expect(Util.createScript).toHaveBeenCalledWith(resultUrl,false,true)
    });

    test('Switch CDN for deferred script', () => {
        const target = {
            src:'https://jjjjj/ajax/libs/axios/1.6.8/axios.min.js',
            defer:true,
            async:false
        }
        retryCDN.retryJsSrc(target);
        expect(Util.createScript).toHaveBeenCalledWith(resultUrl,true,false)
    });
});

describe('test retryLinkSrc', () => {
    let retryCDN;
    const resultUrl = 'https://cdnjs.cloudflare.com/ajax/libs/element-plus/2.6.1/index.min.css'
    beforeEach(()=>{
        Util.parseUrl.mockReturnValue({
            protocol: "https",
            hostname: "cdnjs.cloudflare.com",
            pathname: '/ajax/libs/element-plus/2.6.1/index.min.css',
            search: null,
            hash: null,
            origin: "https://cdnjs.cloudflare.com"
        });

        retryCDN = new RetryCDN([
            'https://cdnjs.cloudflare.com',
            'https://images.unsplash.com',
            'https://plus.unsplash.com',
        ])
    })

    it('Switch CDN for link', () => {
        const target = {
            href: 'https://wwwww/ajax/libs/element-plus/2.6.1/index.min.css'
        }
        retryCDN.retryLinkSrc(target);
        expect(Util.parseUrl).toHaveBeenCalledWith(target.href)
        expect(Util.createLink).toHaveBeenCalledWith(resultUrl);
    });
});

describe('test retryImgSrc', () => {
    let retryCDN;
    const errorPath = 'https://9.unsplash.com/photo-1525480122447-64809d765ec4'
    const target = {
        src: errorPath
    };
    const resultUrl = 'https://images.unsplash.com/photo-1525480122447-64809d765ec4';
    beforeEach(()=>{
        Util.parseUrl.mockReturnValue({
            protocol: "https",
            hostname: "https://9.unsplash.com",
            pathname: '/photo-1525480122447-64809d765ec4',
            search: null,
            hash: null,
            origin: "https://9.unsplash.com"
        });

        retryCDN = new RetryCDN([
            'https://images.unsplash.com',
            'https://cdnjs.cloudflare.com',
            'https://plus.unsplash.com',
        ])
    })

    it('Switch CDN for img', () => {
        retryCDN.retryImgSrc(target)
        expect(Util.parseUrl).toHaveBeenCalledWith(errorPath)
        expect(target.src).toEqual(resultUrl)
    });
});

describe('test setErrorMap', () => {
    let retryCDN;
    const cdnArr = [
        'https://images.unsplash.com',
        'https://cdnjs.cloudflare.com',
        'https://plus.unsplash.com',
    ]
    beforeEach(()=>{
        retryCDN = new RetryCDN(cdnArr)
    })
    
    const target = {}
    const errorMap = new Map()

    it('each every branch', () => {
        const expectResultArr = [
            {
                state: true,
                num: 1
            },
            {
                state: true,
                num: 2
            },
            {
                state: true,
                num: 3
            },
            {
                state: false,
                num: 3
            }
        ];
        expectResultArr.forEach(item => {
            const result = retryCDN.setErrorMap(errorMap,target)
            expect(result).toEqual(item)
        });
    });
});

describe('test hasRule', () => {
    let retryCDN;
    const cdnArr = [
        'https://images.unsplash.com',
        'https://cdnjs.cloudflare.com',
        'https://plus.unsplash.com',
    ]
    beforeEach(()=>{
        retryCDN = new RetryCDN(cdnArr);
    })

    it('has rules', () => {
        const styleSheets = {
            rules:'rules',
            cssRules:'cssRules',
        }
        const result = retryCDN.hasRule(styleSheets);
        expect(result).toEqual(styleSheets.rules)
    });

    it('no rules', () => {
        const styleSheets = {
            get rules(){
                throw new Error('not reles')
            },
            cssRules:'cssRules',
        }
        const result = retryCDN.hasRule(styleSheets);
        expect(result).toEqual(styleSheets.cssRules);
    });

    
    it('no cssRules and cssRules', () => {
        let styleSheets;
        const result = retryCDN.hasRule(styleSheets);
        expect(result).toBeNull();
    });
});

describe('test getAllUrlArr', () => {
    let retryCDN;
    const bgUrl = 'https://00.unsplash/premium_photo-1673603988195-1253725273e8';
    const cdnArr = [
        'https://images.unsplash.com',
        'https://cdnjs.cloudflare.com',
        'https://plus.unsplash.com',
    ]
    beforeEach(()=>{
        Util.parseUrl.mockReturnValue({
            protocol: "https",
            hostname: "https://00.unsplash",
            pathname: '/premium_photo-1673603988195-1253725273e8',
            search: null,
            hash: null,
            origin: "https://00.unsplash"
        });
        
        retryCDN = new RetryCDN(cdnArr);
    })

    it('get url array', () => {
        const expectArr = [
            'https://images.unsplash.com/premium_photo-1673603988195-1253725273e8',
            'https://cdnjs.cloudflare.com/premium_photo-1673603988195-1253725273e8',
            'https://plus.unsplash.com/premium_photo-1673603988195-1253725273e8',
        ]
        const result = retryCDN.getAllUrlArr(bgUrl);
        expect(Util.parseUrl).toHaveBeenCalledWith(bgUrl)
        expect(result).toEqual(expectArr)
    });
});