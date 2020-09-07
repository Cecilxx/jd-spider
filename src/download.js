const fs = require('fs');
const request = require('request');
const path = require('path');
const compressing = require('compressing');

//递归创建目录 同步方法
function mkdirsSync(dirname) {
  if (!fs.existsSync(dirname)) {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
  }
  return true;
}

class Download {
  static getPath(sku, type) {
    return path.join(__dirname, `../export/${type}/${sku}`);
  }

  static getImgSuffix(url) {
    const reg = /\.(jpg|jpeg|bmp|gif)$/g;
    return url.match(reg) ? url.match(reg)[0] : '.jpg';
  }

  static requestImg({ dirPath, imgUrls, type, sku }) {
    const dowloadPromise = [];
    let id = 1;
    imgUrls.forEach((url) => {
      const suffix = Download.getImgSuffix(url);
      const stream = fs.createWriteStream(
        `${dirPath}/${id++}${suffix}`
      );
      const item = new Promise((resolve, reject) => {
        request(url)
          .pipe(stream)
          .on('close', (err) => {
            if (err) {
              reject(err);
            }
            console.log('sku:%s [%s] 图片下载完毕 %s', sku, type, url);
            resolve();
          });
      });
      dowloadPromise.push(item);
    });
    return Promise.all(dowloadPromise);
  }

  static dowloadImg(imgUrls, sku, type) {
    const dirPath = Download.getPath(sku, type);
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(dirPath)) {
        mkdirsSync(dirPath);
        Download.requestImg({ dirPath, imgUrls, type, sku })
          .then(() => resolve())
          .catch((e) => reject(e));
      } else {
        resolve('已经存在')
      }
    });
  }

  static zip(sku) {
    const dirPath = Download.getPath(sku);
    console.log(dirPath);
    console.log(__dirname);
    // compress a file
    compressing.gzip
      .compressFile(dirPath, path.join(__dirname, `../export/${sku}.gz`))
      .then(() => {
        console.log('压缩成功');
      })
      .catch((e) => {
        console.log('压缩失败');
        console.log(e);
      });
  }
}

module.exports = Download;
