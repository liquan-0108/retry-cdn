import Util from '../src/utils'

describe('test getBgUrl', () => {
    it('return url', () => {
        const bgUrl = 'url("https://images.unsplash.com/premium_photo-1673278171340-99b4dbf0418f")';
        const result = 'https://images.unsplash.com/premium_photo-1673278171340-99b4dbf0418f';
        expect(Util.getBgUrl(bgUrl)).toEqual(result);
    });
    it('return null ', () => {
        const bgUrl = '';
        expect(Util.getBgUrl(bgUrl)).toBeNull();
    });
});

describe('test checkValidity',()=>{
    beforeEach(() => {
        global.XMLHttpRequest = jest.fn();
    });
    afterEach(() => {
        delete global.XMLHttpRequest;
    });
    it('readyState: 4;status: 200', async () => {
        const url = 'https://cdnjs.cloudflare.com';
        const mockResponse = 'https://cdnjs.cloudflare.com';
        const xhrInstance = {
          readyState: 4,
          status: 200,
          responseText: mockResponse,
          onreadystatechange: jest.fn(),
          open: jest.fn(),
          send: jest.fn()
        };
        global.XMLHttpRequest.mockImplementation(() => xhrInstance);
    
        const promise = Util.checkValidity(url);
        xhrInstance.onreadystatechange(); // 触发 onreadystatechange
    
        await expect(promise).resolves.toEqual(mockResponse);
        expect(xhrInstance.open).toHaveBeenCalledWith('HEAD', url, true);
        expect(xhrInstance.send).toHaveBeenCalled();
    });

    it('readyState: 4;status: 404', async () => {
        const url = 'https://cdnjs.cloudflare.com';
        const mockResponse = false;
        const xhrInstance = {
          readyState: 4,
          status: 404,
          onreadystatechange: jest.fn(),
          open: jest.fn(),
          send: jest.fn()
        };
        global.XMLHttpRequest.mockImplementation(() => xhrInstance);
    
        const promise = Util.checkValidity(url);
        xhrInstance.onreadystatechange(); // 触发 onreadystatechange
    
        await expect(promise).resolves.toEqual(mockResponse);
        expect(xhrInstance.open).toHaveBeenCalledWith('HEAD', url, true);
        expect(xhrInstance.send).toHaveBeenCalled();
    });
})

describe('test getOneSuccUrl', () => {
    let urlArr;
    let expectUrl;

    beforeEach(()=>{
        urlArr = [
            'https://cdnjs.cloudflare.com/premium_photo-1673278171340-99b4dbf0418f',
            'https://plus.unsplash.com/premium_photo-1673278171340-99b4dbf0418f',
            'https://images.unsplash.com/premium_photo-1673278171340-99b4dbf0418f',
        ]
        expectUrl = 'https://plus.unsplash.com/premium_photo-1673278171340-99b4dbf0418f' 
    })
    it('return succ url', async() => {
        // 模拟 checkValidity 方法，并按顺序返回
        jest.spyOn(Util, 'checkValidity')
            .mockResolvedValueOnce(false)
            .mockResolvedValueOnce(expectUrl)
            .mockResolvedValue(false);

        const result = await Util.getOneSuccUrl(urlArr);
        expect(result).toEqual(expectUrl);
        // 判断调用次数
        expect(Util.checkValidity).toHaveBeenCalledTimes(urlArr.length);
    });

    it('return Promise Reject', async() => {
        // 模拟 checkValidity 方法，并按顺序返回
        jest.spyOn(Util, 'checkValidity')
            .mockResolvedValueOnce(false)
            .mockResolvedValueOnce(false)
            .mockResolvedValue(false);
        try {
            await Util.getOneSuccUrl(urlArr);
            fail('should have been rejected');
        } catch (error) {
            expect(error).toBe('CDN all fail')
            // 判断调用次数
            expect(Util.checkValidity).toHaveBeenCalledTimes(urlArr.length);
        }
    });
});

describe('test create tags', () => {
    it('create script tags', () => {
        const arr = [
            {
                url:'https://cdnjs.cloudflare.com/ajax/libs/vue/3.4.21/vue.global.min.js',
                defer:false,
                async:false
            },
            {
                url:'https://cdnjs.cloudflare.com/ajax/libs/element-plus/2.6.1/index.full.min.js',
                defer:true,
                async:false
            },
            {
                url:'https://cdnjs.cloudflare.com/ajax/libs/axios/1.6.8/axios.min.js',
                defer:false,
                async:true
            }
        ]   
        arr.forEach((obj)=>{
            Util.createScript(obj.url,obj.defer,obj.async)
            const scriptElement = document.head.querySelector(`script[src="${obj.url}"]`);
            expect(scriptElement).toBeTruthy();
        })
    });

    it('create link tags', () => {
        const url = 'https://cdnjs.cloudflare.com/ajax/libs/element-plus/2.6.1/index.min.css';
        Util.createLink(url)
        const linkElement = document.head.querySelector(`link[href="${url}"]`);
        expect(linkElement).toBeTruthy();
    });
});

describe('test isAbsolutePath', () => {
    it('should true', () => {
        const path = 'https://cdnjs.cloudflare.com/ajax/libs/element-plus/2.6.1/index.min.css'
        const result = Util.isAbsolutePath(path)
        expect(result).toBeTruthy()
    });

    it('should false', () => {
        const path = '../ajax/libs/element-plus/2.6.1/index.min.css'
        const result = Util.isAbsolutePath(path)
        expect(result).toBeFalsy()
    });
});
describe('test parseUrl', () => {
    it('http url', () => {
        const path = 'https://cdnjs.cloudflare.com/ajax/libs/element-plus/2.6.1/index.min.css?param=1&param=2'
        const expectResult = {
            "protocol": "https",
            "hostname": "cdnjs.cloudflare.com",
            "pathname": "/ajax/libs/element-plus/2.6.1/index.min.css",
            "search": "?param=1&param=2",
            "hash": null,
            "origin": "https://cdnjs.cloudflare.com"
        }
        const result = Util.parseUrl(path)
        expect(result).toEqual(expectResult)
    });

    it('no protocol url', () => {
        const path = '//cdnjs.cloudflare.com/ajax/libs/element-plus/2.6.1/index.min.css?param=1&param=2'
        const expectResult = {
            "protocol": "",
            "hostname": "cdnjs.cloudflare.com",
            "pathname": "/ajax/libs/element-plus/2.6.1/index.min.css",
            "search": "?param=1&param=2",
            "hash": null,
            "origin": "//cdnjs.cloudflare.com"
        }
        const result = Util.parseUrl(path)
        expect(result).toEqual(expectResult)
    });
    it('throw error', () => {
        const path = null
        expect(() => Util.parseUrl(path)).toThrow('Invalid URL');
    });
});