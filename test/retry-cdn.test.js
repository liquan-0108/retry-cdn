import RetryCDN from "../src/retry-cdn";
import Util from "../src/utils";

// mock 依赖的工具库
jest.mock('../src/utils', () => ({
    createScript: jest.fn(),
    createLink: jest.fn(),
    getBgUrl: jest.fn(),
    checkValidity: jest.fn(),
    getOneSuccUrl: jest.fn()
}));

describe('test retryJsSrc state true', () => {
    let retryCDN;
    const resultUrl = 'https://cdnjs.cloudflare.com/ajax/libs/axios/1.6.8/axios.min.js'
    beforeEach(()=>{
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
        expect(Util.createLink).toHaveBeenCalledWith(resultUrl);
    });
});

describe('test retryImgSrc', () => {
    let retryCDN;
    beforeEach(()=>{
        retryCDN = new RetryCDN([
            'https://images.unsplash.com',
            'https://cdnjs.cloudflare.com',
            'https://plus.unsplash.com',
        ])
    })

    it('Switch CDN for img', () => {
        const target = {
            src:'https://9.unsplash.com/photo-1525480122447-64809d765ec4'
        }
        const resultUrl = 'https://images.unsplash.com/photo-1525480122447-64809d765ec4'

        retryCDN.retryImgSrc(target)
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
        expect(styleSheets.rules).toEqual('rules')
        expect(result).toBeTruthy()
    });

    it('no rules', () => {
        const styleSheets = {
            cssRules:'cssRules',
        };
        const result = retryCDN.hasRule(styleSheets);
        expect(styleSheets.rules).toEqual('cssRules')
        expect(result).toBeTruthy();
    });

    
    it('no cssRules and cssRules', () => {
        let styleSheets;
        const result = retryCDN.hasRule(styleSheets);
        expect(result).toBeNull();
    });
});

describe('test getAllUrlArr', () => {
    let retryCDN;
    const cdnArr = [
        'https://images.unsplash.com',
        'https://cdnjs.cloudflare.com',
        'https://plus.unsplash.com',
    ]
    beforeEach(()=>{
        retryCDN = new RetryCDN(cdnArr);
    })

    it('get url array', () => {
        const bgUrl = 'https://00.unsplash/premium_photo-1673603988195-1253725273e8';
        const expectArr = [
            'https://images.unsplash.com/premium_photo-1673603988195-1253725273e8',
            'https://cdnjs.cloudflare.com/premium_photo-1673603988195-1253725273e8',
            'https://plus.unsplash.com/premium_photo-1673603988195-1253725273e8',
        ]
        const result = retryCDN.getAllUrlArr(bgUrl);
        expect(result).toEqual(expectArr)
    });
});