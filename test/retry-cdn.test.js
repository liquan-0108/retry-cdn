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