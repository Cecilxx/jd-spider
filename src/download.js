const fs = require('fs');
const request = require("request");
let id = 0
class Download {
  static getImgSuffix (url) {
    const reg = /\.(jpg|jpeg|bmp)$/g
    return url.match(reg) ? url.match(reg)[0] : '.jpg'
  }
  static dowloadImg(imgUrls, sku) {
    const dowloadPromise = []
    imgUrls.forEach((url) => {
      const suffix = Download.getImgSuffix(url);
      const stream = fs.createWriteStream(`./export/img_${sku}_${id++}${suffix}`);
      const item = new Promise((resolve, reject) => {
        request(url)
        .pipe(stream)
        .on('close', function (err) {
          if (err) {
            reject(err)
          }
          console.log('sku: %s 图片下载完毕 %s', sku, url);
          resolve();
        });
      })
      dowloadPromise.push(item)
    })

    return Promise.all(dowloadPromise)
  }
}

module.exports = Download
