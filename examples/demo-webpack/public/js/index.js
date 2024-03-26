import RetryCDN from '../../utils/retry-cdn.js';
// const RetryCDN  = require('../../utils/retry-cdn.js')

  var urlArr = [
    'https://cdnjs.cloudflare.com',
    'https://images.unsplash.com',  // img图片正确的域名
    'https://plus.unsplash.com', // 背景图正确的域名
  ]
  var retry = new RetryCDN(urlArr)
  console.log('retry',retry);