const fs = require('fs');
const request = require("request");
class Download {
  static getImgSuffix (url) {
    const reg = /\.(jpg|jpeg|bmp|gif)$/g
    return url.match(reg) ? url.match(reg)[0] : '.jpg'
  }
  static dowloadImg(imgUrls, sku, type) {
    const dowloadPromise = []
    let id = 0;
    imgUrls.forEach((url) => {
      const suffix = Download.getImgSuffix(url);
      const stream = fs.createWriteStream(`./export/${type}_${sku}_${id++}${suffix}`);
      const item = new Promise((resolve, reject) => {
        request(url)
        .pipe(stream)
        .on('close', function (err) {
          if (err) {
            reject(err)
          }
          console.log('sku:%s [%s] 图片下载完毕 %s', sku, type, url);
          resolve();
        });
      })
      dowloadPromise.push(item)
    })

    return Promise.all(dowloadPromise)
  }
}

module.exports = Download
